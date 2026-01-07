import { NextResponse } from "next/server";
import { saveQuiz, getQuiz, listQuizKeys } from "@/lib/quizCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "documentId required" }, { status: 400 });
    }

    const quiz = getQuiz(documentId);
    if (!quiz) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { documentId, quiz } = body || {};
    if (!documentId || !quiz) {
      return NextResponse.json({ error: "documentId and quiz required" }, { status: 400 });
    }
    const ok = saveQuiz(documentId, quiz);
    if (!ok) {
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
