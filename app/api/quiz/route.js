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

    const prompt = `You are an expert educational quiz creator. Create high-quality multiple choice questions based ONLY on the content provided below.

TASK: Generate ${n} well-crafted MCQ questions that test understanding of the key concepts in the document.

REQUIREMENTS FOR EACH QUESTION:
1. Write clear, grammatically correct questions that read naturally
2. Questions should test comprehension, not just word recognition
3. Each question should have exactly 4 options (A, B, C, D)
4. All options must be plausible and similar in length/style
5. The correct answer must be factually accurate based on the document
6. Distractors (wrong answers) should be reasonable but clearly incorrect
7. Avoid questions that can be answered without reading the document

QUESTION TYPES TO USE:
- "According to the document, what is...?"
- "Which of the following best describes...?"
- "What is the main purpose/benefit of...?"
- "How does [concept] relate to...?"
- "Which statement about [topic] is correct?"

DO NOT:
- Reference the document title in questions
- Include the answer in the question text
- Use trivial "fill in the blank" style questions
- Create questions about formatting or structure

Return ONLY valid JSON in this exact format:
{
  "sections": {
    "questions": [],
    "mcq": [
      {
        "id": 1,
        "question": "According to the document, what is the primary benefit of iterative development?",
        "options": ["Faster initial delivery", "Better adaptation to changing requirements", "Lower development costs", "Reduced team size"],
        "correctOption": 1,
        "explanation": "The document states that iterative development allows teams to adapt to changing requirements."
      }
    ]
  }
}

DOCUMENT CONTENT:
${safeContent}

Generate ${n} high-quality MCQ questions now:`;

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
    sanitizedText = sanitizedText.replace(new RegExp(safeTitle, "gi"), "the topic");
  }

  // Extract meaningful sentences (longer, complete thoughts)
  const sentences = sanitizedText
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s && s.length > 30 && s.split(/\s+/).length >= 5 && !/\b(Document|Note|PDF)\b/i.test(s))
    .slice(0, 100);

  // Extract key terms and concepts
  const stopwords = new Set([
    "the", "and", "that", "with", "from", "this", "have", "were", "been", "into", 
    "about", "which", "while", "where", "there", "their", "using", "used", "use",
    "also", "will", "would", "should", "could", "being", "more", "most", "some",
    "such", "than", "then", "they", "them", "these", "those", "what", "when",
    "your", "each", "other", "very", "just", "only", "over", "much", "many"
  ]);

  const words = sanitizedText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 4 && !stopwords.has(w));

  const wordFreq = {};
  for (const w of words) {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  }
  
  // Get top keywords by frequency (these are likely important concepts)
  const keyTerms = Object.entries(wordFreq)
    .filter(([w, c]) => c >= 2 && w.length > 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([w]) => w);

  const capitalize = (s) => (typeof s === 'string' && s.length ? s[0].toUpperCase() + s.slice(1) : s);
  
  const shuffle = (arr) => {
    const a = [...arr];
    for (let j = a.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [a[j], a[k]] = [a[k], a[j]];
    }
    return a;
  };

  const pick = (arr, n) => {
    const copy = [...arr];
    const out = [];
    while (copy.length && out.length < n) {
      const i = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(i, 1)[0]);
    }
    return out;
  };

  // Question templates for better quality
  const questionTemplates = [
    { template: "According to the document, which of the following is true about {topic}?", type: "concept" },
    { template: "What does the document indicate about {topic}?", type: "concept" },
    { template: "Based on the content, {topic} is primarily associated with:", type: "association" },
    { template: "Which of the following best describes {topic} as mentioned in the document?", type: "description" },
    { template: "The document suggests that {topic}:", type: "implication" },
  ];

  // Find sentences containing a key term
  function findSentencesWithTerm(term) {
    return sentences.filter(s => s.toLowerCase().includes(term.toLowerCase()));
  }

  // Extract a fact from a sentence
  function extractFactFromSentence(sentence) {
    // Clean up the sentence
    let fact = sentence.trim();
    if (fact.length > 150) {
      fact = fact.substring(0, 147) + "...";
    }
    return fact;
  }

  // Generate distractor options based on the document content
  function generateDistractors(correctAnswer, topic, count = 3) {
    const distractors = [];
    const correctLower = correctAnswer.toLowerCase();
    
    // Find other sentences that don't contain the correct answer
    const otherSentences = sentences
      .filter(s => !s.toLowerCase().includes(correctLower.substring(0, 30)))
      .slice(0, 20);
    
    // Create plausible but incorrect options
    for (const sent of shuffle(otherSentences)) {
      if (distractors.length >= count) break;
      let distractor = extractFactFromSentence(sent);
      if (distractor.length > 20 && distractor !== correctAnswer) {
        distractors.push(distractor);
      }
    }

    // If we need more distractors, create variations
    while (distractors.length < count) {
      const filler = keyTerms[distractors.length] || "alternative approach";
      distractors.push(`${capitalize(filler)} is the primary factor`);
    }

    return distractors.slice(0, count);
  }

  // Build high-quality questions
  const questions = [];
  const usedTerms = new Set();
  const target = sanitizeNumQuestions(numQuestions);

  for (let i = 0; i < target && i < keyTerms.length; i++) {
    const term = keyTerms[i];
    if (usedTerms.has(term)) continue;
    usedTerms.add(term);

    const relatedSentences = findSentencesWithTerm(term);
    if (relatedSentences.length === 0) continue;

    const sourceSentence = relatedSentences[0];
    const correctAnswer = extractFactFromSentence(sourceSentence);
    
    // Pick a question template
    const template = questionTemplates[i % questionTemplates.length];
    const question = template.template.replace("{topic}", capitalize(term));

    // Generate options
    const distractors = generateDistractors(correctAnswer, term, 3);
    const allOptions = shuffle([correctAnswer, ...distractors]);
    const correctIndex = allOptions.indexOf(correctAnswer);

    questions.push({
      id: questions.length + 1,
      question,
      options: allOptions,
      correctOption: correctIndex >= 0 ? correctIndex : 0,
      explanation: `This answer is supported by the document text.`,
      sourceIndex: sentences.indexOf(sourceSentence),
    });
  }

  // If we don't have enough questions, create concept-based questions
  while (questions.length < target && sentences.length > questions.length) {
    const idx = questions.length;
    const sentence = sentences[idx % sentences.length];
    const words = sentence.split(/\s+/).filter(w => w.length > 5 && !stopwords.has(w.toLowerCase()));
    const keyWord = words[0] || "concept";

    const question = `Which statement from the document discusses ${keyWord.toLowerCase()}?`;
    const correctAnswer = extractFactFromSentence(sentence);
    const distractors = generateDistractors(correctAnswer, keyWord, 3);
    const allOptions = shuffle([correctAnswer, ...distractors]);

    questions.push({
      id: questions.length + 1,
      question,
      options: allOptions,
      correctOption: allOptions.indexOf(correctAnswer),
      explanation: `This is directly stated in the document.`,
      sourceIndex: idx % sentences.length,
    });
  }

  return {
    title: `Quiz: ${documentTitle}`,
    documentTitle,
    questions: questions.slice(0, target),
    totalQuestions: Math.min(questions.length, target),
    sections: {
      questions: [],
      mcq: questions.slice(0, target),
    },
  };
}
