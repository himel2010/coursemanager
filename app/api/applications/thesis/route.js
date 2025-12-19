import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { supervisorId, thesisSlotId, message, resume } = await request.json();

    // Validate required fields
    if (!supervisorId || !thesisSlotId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current user from auth context (you'll need to implement this)
    // For now, assuming userId comes from session
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if application already exists
    const existingApplication = await prisma.studentApplication.findFirst({
      where: {
        studentId: userId,
        thesisSlotId: thesisSlotId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this thesis" },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.studentApplication.create({
      data: {
        studentId: userId,
        supervisorId: supervisorId,
        thesisSlotId: thesisSlotId,
        message: message,
        resume: resume,
        status: "PENDING",
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating thesis application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
