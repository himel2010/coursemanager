import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? process.env.QWEN_API_KEY;
const OPENROUTER_URL = "https://openrouter.io/api/v1/chat/completions";
const MODEL = "qwen/qwen3-coder:free";

export async function POST(req) {
  try {
    const { question, userAnswer, correctAnswer, options } = await req.json();

    if (!question || !userAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!OPENROUTER_API_KEY) {
      // Local fallback evaluation when no AI key is present
      const isCorrect = userAnswer?.trim() === correctAnswer?.trim();
      return NextResponse.json({
        success: true,
        evaluation: {
          isCorrect,
          score: isCorrect ? 100 : 0,
          feedback: isCorrect ? "Correct." : `Incorrect. Correct answer: ${correctAnswer}`,
        },
      });
    }

    // Prepare the prompt for answer evaluation
    const prompt = `You are an expert quiz grader. Evaluate the following answer to a quiz question.

Question: ${question}

Correct Answer: ${correctAnswer}
${options ? `\nAvailable Options: ${options.join(", ")}` : ""}

User's Answer: ${userAnswer}

Provide evaluation in the following JSON format ONLY:
{
  "isCorrect": true/false,
  "score": 100,
  "feedback": "Detailed feedback about the answer"
}

Requirements:
- isCorrect: true if the answer is correct, false otherwise (be lenient with spelling/wording variations)
- score: 0-100 points based on answer quality
- feedback: Constructive feedback explaining why the answer is correct/incorrect and what they should know
- Return ONLY valid JSON, no markdown formatting`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": `${process.env.NEXT_PUBLIC_URL || "http://localhost:3001"}`,
        "X-Title": "Course Manager Quiz Evaluator",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for consistent evaluation
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const raw = await response.text();
      let details = null;
      try { details = JSON.parse(raw); } catch { /* keep raw */ }
      console.error("OpenRouter API error:", details || raw.substring(0, 200));
      return NextResponse.json(
        { error: "Failed to evaluate answer", details: details || raw.substring(0, 200) },
        { status: response.status }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      console.error("Failed to parse response as JSON:", text.substring(0, 200));
      return NextResponse.json(
        { error: "Invalid response from AI: " + text.substring(0, 100) },
        { status: 500 }
      );
    }
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let evaluation;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      evaluation = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse evaluation JSON:", parseError, "Content:", content);
      return NextResponse.json(
        { error: "Failed to parse evaluation" },
        { status: 500 }
      );
    }

    // Validate evaluation structure
    if (typeof evaluation.isCorrect !== "boolean" || typeof evaluation.score !== "number") {
      return NextResponse.json(
        { error: "Invalid evaluation structure" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      evaluation: {
        isCorrect: evaluation.isCorrect,
        score: Math.min(100, Math.max(0, evaluation.score)),
        feedback: evaluation.feedback,
      },
    });
  } catch (error) {
    console.error("Answer evaluation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
