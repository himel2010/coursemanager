import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { documentId, totalQuestions, score } = await req.json();

    if (!documentId || totalQuestions === undefined || score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const quizAttempt = await db.quizAttempt.create({
      data: {
        userId,
        noteId: documentId,
        totalQuestions,
        score,
      },
    });

    return NextResponse.json({
      success: true,
      quizAttempt,
    });
  } catch (error) {
    console.error("Error saving quiz attempt:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save quiz attempt" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");
    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;

    const query = db.quizAttempt.findMany({
      where: {
        userId,
        ...(documentId && { noteId: documentId }),
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const [attempts, total] = await Promise.all([
      query,
      db.quizAttempt.count({
        where: {
          userId,
          ...(documentId && { noteId: documentId }),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      attempts,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch quiz attempts" },
      { status: 500 }
    );
  }
}
