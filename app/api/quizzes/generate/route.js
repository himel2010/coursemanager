import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.QWEN_API_KEY;
const OPENROUTER_URL = "https://openrouter.io/api/v1/chat/completions";
const MODEL = "qwen/qwen3-coder:free";

export const POST = async (request) => {
  try {
    const body = await request.json();
    const { documentContent, documentTitle, numQuestions = 5 } = body;

    if (!documentContent?.trim()) {
      return NextResponse.json({ error: "Document content required" }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `Generate ${numQuestions} multiple choice quiz questions from this content:

${documentContent}

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {"id": 1, "question": "Q?", "options": ["A", "B", "C", "D"], "correctOption": 0, "explanation": "Why"}
  ]
}`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Quiz Generator"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: "AI API failed" }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No AI response" }, { status: 500 });
    }

    let quiz;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      quiz = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    if (!quiz?.questions?.length) {
      return NextResponse.json({ error: "No questions generated" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      quiz: {
        title: `Quiz: ${documentTitle || "Document"}`,
        documentTitle,
        questions: quiz.questions,
        totalQuestions: quiz.questions.length
      }
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate quiz" }, { status: 500 });
  }
};
