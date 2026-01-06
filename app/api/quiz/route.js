import { NextResponse } from "next/server";
import { saveQuiz } from "@/lib/quizCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? process.env.QWEN_API_KEY;
const OPENROUTER_URL = "https://openrouter.io/api/v1/chat/completions";
// Primary and fallback models to improve reliability
const MODELS = [
  "qwen/qwen3-coder:free",
  "qwen/qwen2.5-7b-instruct:free",
  "qwen/qwen-plus-latest"
];

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/quiz" });
}

// Helper to check if content is readable text (not garbled binary)
function isReadableContent(text) {
  if (!text || typeof text !== 'string') return false;
  
  // Count readable ASCII characters vs non-readable
  let readable = 0;
  let nonReadable = 0;
  
  for (let i = 0; i < Math.min(text.length, 1000); i++) {
    const code = text.charCodeAt(i);
    // Readable: letters, numbers, common punctuation, spaces, newlines
    if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
      readable++;
    } else if (code > 127) {
      nonReadable++;
    }
  }
  
  // Text should be at least 60% readable ASCII
  const total = readable + nonReadable;
  if (total === 0) return false;
  return (readable / total) > 0.6;
}

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { documentContent, documentTitle = "Document", numQuestions = 5, documentId = null } = body ?? {};
    const n = sanitizeNumQuestions(numQuestions);

    if (!documentContent || typeof documentContent !== "string" || !documentContent.trim()) {
      return NextResponse.json({ error: "Document content required" }, { status: 400 });
    }

    // Validate that content is readable (not garbled binary)
    if (!isReadableContent(documentContent)) {
      return NextResponse.json({ 
        error: "Document content appears to be corrupted or unreadable. Please try a different document or ensure the PDF contains extractable text." 
      }, { status: 400 });
    }

    // If no AI key is configured, fall back to strict doc-only generation.
    if (!OPENROUTER_API_KEY) {
      const fallback = buildFallbackQuiz({ documentTitle, documentContent, numQuestions: n });
      if (documentId) {
        saveQuiz(documentId, {
          source: 'fallback',
          documentTitle,
          sections: { questions: fallback.sections?.questions || [], mcq: fallback.questions },
          quiz: fallback
        });
      }
      return NextResponse.json({ success: true, quiz: fallback });
    }

    // Keep prompts within safe token budget
    const safeContent = documentContent.length > 8000
      ? documentContent.slice(0, 8000) + "\n\n[Truncated for quiz generation]"
      : documentContent;

    const prompt = `You are a strict quiz generator. Use ONLY the text inside CONTENT START/END. Do not use external knowledge.

Create two sections:
- Section A: ${n} open-ended questions, each grounded to a specific sentence in the content.
- Section B: ${n} MCQs where ALL options and the correct answer come from the document text.

Rules:
- Never include or infer the document title.
- Do not leak the correct answer inside the question.
- Ground each item to a source sentence index (0-based).
- For MCQ options, use exact words/phrases or whole sentences copied from the content.

Return ONLY valid JSON in this exact format:
{
  "sections": {
    "questions": [ { "id": 1, "question": "...", "sourceIndex": 0 } ],
    "mcq": [ { "id": 1, "question": "...", "options": ["..."], "correctOption": 0, "explanation": "...", "sourceIndex": 0 } ]
  }
}

CONTENT START
${safeContent}
CONTENT END`;

    // Try models in order until one succeeds
    let aiResponse;
    let lastError;
    for (const model of MODELS) {
      try {
        const resp = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            "X-Title": "Quiz Generator"
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 2000
          })
        });

        if (!resp.ok) {
          lastError = new Error(`Model ${model} HTTP ${resp.status}`);
          continue;
        }
        aiResponse = await resp.json();
        if (aiResponse) break;
      } catch (e) {
        lastError = e;
      }
    }

    if (!aiResponse) {
      // Offline fallback quiz generation
      const fallback = buildFallbackQuiz({ documentTitle, documentContent: safeContent, numQuestions: n });
      return NextResponse.json({ success: true, quiz: fallback });
    }

    const content = aiResponse?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "No AI response" }, { status: 500 });
    }

    // Extract JSON safely
    let quiz;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}$/);
      quiz = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const docTitleLower = String(documentTitle || "").toLowerCase();

    // Prefer new schema with sections; fallback to legacy shape
    const sections = quiz?.sections || {};
    const mcqRaw = Array.isArray(sections.mcq) ? sections.mcq : Array.isArray(quiz.questions) ? quiz.questions : [];
    const freeRaw = Array.isArray(sections.questions) ? sections.questions : [];

    if (!mcqRaw.length && !freeRaw.length) {
      return NextResponse.json({ error: "No questions generated" }, { status: 500 });
    }

    const normalized = mcqRaw.map((q, idx) => {
      let question = String(q.question || "");
      const options = Array.isArray(q.options) ? q.options.map(String) : [];
      let correctOption = Number.isInteger(q.correctOption) ? q.correctOption : 0;
      const explanation = String(q.explanation || "");

      // Remove document title mentions
      if (docTitleLower) {
        const re = new RegExp(documentTitle.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi");
        question = question.replace(re, "the document");
      }

      // Mask answer leakage in question text
      const correctAnswer = options[correctOption];
      if (correctAnswer && question.toLowerCase().includes(String(correctAnswer).toLowerCase())) {
        const safe = String(correctAnswer).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
        question = question.replace(new RegExp(safe, "gi"), "_____");
      }

      // Clamp and deduplicate options
      const optsRaw = options.slice(0, 6);
      const seen = new Set();
      const opts = [];
      for (const o of optsRaw) {
        const k = String(o).toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();
        if (!k || seen.has(k)) continue;
        seen.add(k);
        opts.push(String(o));
      }
      if (opts.length < 2) {
        opts.push("None of the above");
      }
      if (correctOption >= opts.length) correctOption = 0;

      return {
        id: q.id ?? idx + 1,
        question,
        options: opts,
        correctOption,
        explanation,
      };
    }).filter(q => q.question && q.options.length >= 2);

    // Ensure AI MCQs have at least 4 doc-derived options; else pad from document tokens
    const docTokens = Array.from(new Set(
      safeContent
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w && w.length > 3)
    ));
    function padOptionsFromDoc(opts, min = 4) {
      const out = [...opts];
      const seen = new Set(out.map(o => String(o).toLowerCase().trim()));
      for (const w of docTokens) {
        if (out.length >= min) break;
        if (!seen.has(w)) {
          out.push(w[0].toUpperCase() + w.slice(1));
          seen.add(w);
        }
      }
      return out.slice(0, Math.max(min, out.length));
    }
    for (const q of normalized) {
      if (!Array.isArray(q.options)) q.options = [];
      if (q.options.length < 4) {
        q.options = padOptionsFromDoc(q.options, 4);
        if (q.correctOption < 0 || q.correctOption >= q.options.length) q.correctOption = 0;
      }
    }

    // Sentence-level grounding for stems: map each MCQ to a source sentence
    function normalizeForMatch(s) {
      return String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    }
    function tokenize(s) {
      return normalizeForMatch(s).split(" ").filter(w => w.length > 2);
    }
    const docSentences = safeContent
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s && s.length > 10)
      .slice(0, 200);
    const docSentenceNorms = docSentences.map(s => ({ norm: normalizeForMatch(s), tokens: tokenize(s) }));

    function bestSourceIndex(text) {
      const t = tokenize(text);
      if (!t.length) return -1;
      let best = -1;
      let bestScore = 0;
      for (let i = 0; i < docSentenceNorms.length; i++) {
        const s = docSentenceNorms[i];
        // simple overlap score
        const set = new Set(s.tokens);
        let score = 0;
        for (const tok of t) if (set.has(tok)) score++;
        // substring bonus
        if (score < 2 && s.norm.includes(normalizeForMatch(text))) score += 2;
        if (score > bestScore) {
          bestScore = score;
          best = i;
        }
      }
      // require a minimum overlap
      return bestScore >= 2 ? best : -1;
    }
    for (const q of normalized) {
      const idx = bestSourceIndex(q.question);
      if (idx >= 0) q.sourceIndex = idx;
    }
    const stemsDocValid = normalized.every(q => typeof q.sourceIndex === 'number');

    // Strict validator: ensure all MCQ options originate from the document
    const docNorm = normalizeForMatch(safeContent);
    const mcqDocValid = normalized.every(q => q.options.every(o => {
      const on = normalizeForMatch(o);
      return on.length > 1 && docNorm.includes(on);
    }));

    if (!mcqDocValid || !stemsDocValid || normalized.some(q => !Array.isArray(q.options) || q.options.length < 2)) {
      // Fall back to strict doc-only generator
      const fallback = buildFallbackQuiz({ documentTitle, documentContent: safeContent, numQuestions: n });
      if (documentId) { saveQuiz(documentId, { source: 'fallback', documentTitle, sections: { questions: fallback.sections?.questions || [], mcq: fallback.questions }, quiz: fallback }); }
      return NextResponse.json({ success: true, quiz: fallback });
    }

    // Normalize free questions (open-ended)
    const normalizedFree = freeRaw
      .map((q, idx) => {
        let question = String(q?.question || q || "");
        if (docTitleLower) {
          const re = new RegExp(documentTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi");
          question = question.replace(re, "the document");
        }
        return question.trim();
      })
      .filter(Boolean);

    if (!normalized.length) {
      const fallback = buildFallbackQuiz({ documentTitle, documentContent: safeContent, numQuestions: n });
      return NextResponse.json({ success: true, quiz: fallback });
    }

    const result = {
      success: true,
      quiz: {
        title: `Quiz: ${documentTitle}`,
        documentTitle,
        // Keep existing consumers working: default quiz.questions to MCQ
        questions: normalized,
        totalQuestions: normalized.length,
        sections: {
          questions: normalizedFree,
          mcq: normalized
        }
      }
    };

    // Save AI-derived quiz to cache for later retrieval
    if (documentId) {
      saveQuiz(documentId, { source: 'ai', documentTitle, sections: { questions: normalizedFree, mcq: normalized }, raw: quiz });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("/api/quiz error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate quiz" }, { status: 500 });
  }
}

function sanitizeNumQuestions(x) {
  const n = parseInt(x, 10);
  if (Number.isNaN(n)) return 5;
  return Math.min(50, Math.max(1, n));
}

function buildFallbackQuiz({ documentTitle, documentContent, numQuestions = 5 }) {
  const text = String(documentContent);
  // Remove obvious metadata and placeholders
  const lines = text.split(/\r?\n/).filter(
    (l) => !/^\s*(Document:|Note:)/i.test(l) && !/PDF content needs to be extracted/i.test(l)
  );
  let sanitizedText = lines.join(" ");
  if (documentTitle) {
    const safeTitle = documentTitle.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    sanitizedText = sanitizedText.replace(new RegExp(safeTitle, "gi"), "the passage");
  }

  const sentences = sanitizedText
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s && s.length > 10 && !/\b(Document|Note|PDF)\b/i.test(s))
    .slice(0, 80);

  const words = sanitizedText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3);

  const uniq = (arr) => Array.from(new Set(arr));
  const pick = (arr, n) => {
    const copy = [...arr];
    const out = [];
    while (copy.length && out.length < n) {
      const i = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(i, 1)[0]);
    }
    return out;
  };
  const shuffle = (arr) => {
    const a = [...arr];
    for (let j = a.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [a[j], a[k]] = [a[k], a[j]];
    }
    return a;
  };

  const keywords = uniq(words).slice(0, 200);
  const numbers = (sanitizedText.match(/\b\d+(?:\.\d+)?\b/g) || []).slice(0, 50).map(Number);
  const nameSeed = ["Alex", "Sam", "Jordan", "Taylor", "Casey", "Riley", "Morgan", "Avery"];
  const stopwords = new Set(["the","and","that","with","from","this","have","were","been","into","about","which","while","where","there","their","using","used","use","user","document","note"]);
  const capitalize = (s) => (typeof s === 'string' && s.length ? s[0].toUpperCase() + s.slice(1) : s);
  const docWords = uniq(words)
    .filter(w => w.length > 4 && !stopwords.has(w))
    .map(capitalize)
    .slice(0, 500);

  // If the document is too short to form sentences, fall back to token-choice MCQs.
  function makeTokenChoice(i) {
    const pool = docWords.length ? docWords : uniq(words).map(capitalize);
    const chosen = shuffle(pick(pool, 4));
    const correct = chosen[0] || pool[0] || "content";
    const options = ensureOptionsUnique(chosen.length ? chosen : [correct], 4, pool);
    const correctOption = Math.max(0, options.findIndex(o => normalizeOptionText(o) === normalizeOptionText(correct)));
    return {
      question: 'Which of the following words/terms appears in the document?',
      options,
      correctOption,
      explanation: 'The correct option is an exact term found in the provided document text.',
      sourceIndex: 0,
    };
  }

  function findOptionIndex(options, target) {
    const t = normalizeOptionText(target);
    const idx = options.findIndex(o => normalizeOptionText(o) === t);
    return idx >= 0 ? idx : 0;
  }

  function normalizeOptionText(s) {
    return String(s).toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();
  }
  function ensureOptionsUnique(opts, min = 4, docPool = []) {
    const seen = new Set();
    const out = [];
    for (const o of opts) {
      const k = normalizeOptionText(o);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(String(o));
    }
    // Use doc-derived pool to pad, never external fillers
    const source = Array.isArray(docPool) && docPool.length > 0 ? docPool : keywords.map(w => w[0].toUpperCase() + w.slice(1));
    let i = 0;
    while (out.length < min && i < source.length) {
      const candidate = String(source[i]);
      const k = normalizeOptionText(candidate);
      if (k && !seen.has(k)) {
        seen.add(k);
        out.push(candidate);
      }
      i++;
    }
    // If still short, sample more unique words from the document text
    if (out.length < min) {
      const extras = uniq(words.filter(w => w.length > 3)).map(w => w[0].toUpperCase() + w.slice(1));
      for (const cand of extras) {
        const k = normalizeOptionText(cand);
        if (k && !seen.has(k)) {
          seen.add(k);
          out.push(cand);
          if (out.length >= min) break;
        }
      }
    }
    return out.slice(0, Math.max(min, out.length));
  }

  // Strict doc-only MCQ generators
  function makeClozeStrict(i) {
    if (!sentences.length) return makeTokenChoice(i);
    const base = sentences[i % sentences.length] || sentences[0] || "";
    const tokenList = base.split(/\s+/).filter(t => t.length > 4 && !stopwords.has(t.toLowerCase()));
    let target = tokenList[Math.floor(Math.random() * tokenList.length)] || tokenList[0];
    if (!target) {
      // pick a word from the document strictly
      target = docWords[0];
      if (!target) return makeTokenChoice(i);
    }
    const targetDisplay = capitalize(String(target));
    const question = base.replace(target, "_____ ");
    const distractorsDoc = pick(docWords.filter(w => w.toLowerCase() !== String(target).toLowerCase()), 10);
    const options = ensureOptionsUnique(shuffle([targetDisplay, ...distractorsDoc]).slice(0, 4), 4, docWords);
    return {
      question: `Fill in the blank: ${question}`,
      options,
      correctOption: findOptionIndex(options, targetDisplay),
      explanation: `From the document sentence: ${base.slice(0, 120)}`,
      sourceIndex: i % sentences.length,
    };
  }

  function makeSentenceChoice(i) {
    if (!sentences.length) return makeTokenChoice(i);
    const correct = sentences[i % sentences.length] || sentences[0] || "";
    const tokenList = correct.split(/\s+/).filter(t => t.length > 4 && !stopwords.has(t.toLowerCase()));
    let cue = tokenList[Math.floor(Math.random() * tokenList.length)] || tokenList[0];
    if (!cue) cue = (docWords[0] || (correct.split(/\s+/).find(w => w.length > 4) ?? "content"));
    const sentencePool = uniq(sentences.filter(s => s && s.length > 10));
    // If we don't have enough sentences to build options, fall back to token-choice.
    if (sentencePool.length < 2) return makeTokenChoice(i);
    const distractorSentences = pick(sentencePool.filter(s => s !== correct), 10);
    const options = ensureOptionsUnique(shuffle([correct, ...distractorSentences]).slice(0, 4), 4, sentencePool);
    const idx = options.indexOf(correct);
    return {
      question: `Which sentence from the document best mentions "${cue}"?`,
      options,
      correctOption: idx < 0 ? 0 : idx,
      explanation: `Direct quote from source sentence: ${correct.slice(0, 120)}`,
      sourceIndex: i % sentences.length,
    };
  }
  // Only use document-derived question generators - no external/synthetic questions
  const generators = [makeClozeStrict, makeSentenceChoice];
  const pickGenerator = (i) => generators[i % generators.length];
  const target = sanitizeNumQuestions(numQuestions);
  const questions = [];
  for (let i = 0; i < target; i++) {
    const gen = pickGenerator(i);
    const q = gen(i);
    // Safety: ensure at least 2 options and valid index
    if (!q.options || q.options.length < 2) {
      const alt = makeClozeStrict(i);
      q.options = alt.options;
      q.correctOption = alt.correctOption;
      q.explanation = alt.explanation;
      q.sourceIndex = alt.sourceIndex;
    }
    // Always enforce 4 document-derived options
    q.options = ensureOptionsUnique(q.options, 4, docWords);
    if (q.options.length < 4) {
      // Fallback to sentence-choice if still insufficient
      const alt2 = makeSentenceChoice(i);
      q.question = alt2.question;
      q.options = ensureOptionsUnique(alt2.options, 4, sentences);
      q.correctOption = (alt2.correctOption < 0 || alt2.correctOption >= q.options.length) ? 0 : alt2.correctOption;
      q.explanation = alt2.explanation;
      q.sourceIndex = alt2.sourceIndex;
    }
    if (q.correctOption < 0 || q.correctOption >= q.options.length) q.correctOption = 0;
    questions.push({ id: i + 1, ...q });
  }

  // Deduplicate questions and ensure options are present
  const seenStems = new Set();
  const usedIndices = new Set();
  const uniqueQuestions = [];
  for (const q of questions) {
    const key = String(q.question).toLowerCase().replace(/\s+/g, ' ').trim();
    if (seenStems.has(key)) continue;
    seenStems.add(key);
    if (typeof q.sourceIndex === 'number') usedIndices.add(q.sourceIndex);
    // Ensure options
    if (!Array.isArray(q.options) || q.options.length < 4) {
      const idx = typeof q.sourceIndex === 'number' ? q.sourceIndex : uniqueQuestions.length % sentences.length;
      const fix = makeSentenceChoice(idx);
      q.question = fix.question;
      q.options = ensureOptionsUnique(fix.options, 4, sentences);
      q.correctOption = (fix.correctOption < 0 || fix.correctOption >= q.options.length) ? 0 : fix.correctOption;
      q.explanation = fix.explanation;
      q.sourceIndex = fix.sourceIndex;
    }
    uniqueQuestions.push(q);
  }
  // If not enough unique questions, fill from remaining sentence indices
  let fillIdx = 0;
  while (uniqueQuestions.length < target && fillIdx < Math.max(1, sentences.length)) {
    if (!usedIndices.has(fillIdx)) {
      const nq = sentences.length ? makeSentenceChoice(fillIdx) : makeTokenChoice(fillIdx);
      uniqueQuestions.push({
        id: uniqueQuestions.length + 1,
        question: nq.question,
        options: ensureOptionsUnique(nq.options, 4, sentences),
        correctOption: (nq.correctOption < 0 || nq.correctOption >= 4) ? 0 : nq.correctOption,
        explanation: nq.explanation,
        sourceIndex: nq.sourceIndex,
      });
      usedIndices.add(fillIdx);
    }
    fillIdx++;
  }

  // Build a set of open-ended questions from document sentences
  const freeQuestions = [];
  const stems = sentences.slice(0, Math.max(5, target));
  for (let i = 0; i < Math.min(target, stems.length); i++) {
    const s = stems[i];
    const q = s.length > 160 ? s.slice(0, 160) + "…" : s;
    freeQuestions.push(`Explain what this sentence means: ${q}`);
  }

  return {
    title: `Quiz: ${documentTitle}`,
    documentTitle,
    questions: uniqueQuestions,
    totalQuestions: uniqueQuestions.length,
    sections: {
      questions: freeQuestions,
      mcq: uniqueQuestions,
    },
  };
}
