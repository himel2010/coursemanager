import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { supervisorId, internshipSlotId, message, resume } =
      await request.json();

    // Validate required fields
    if (!supervisorId || !internshipSlotId || !message) {
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
        internshipSlotId: internshipSlotId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this internship" },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.studentApplication.create({
      data: {
        studentId: userId,
        supervisorId: supervisorId,
        internshipSlotId: internshipSlotId,
        message: message,
        resume: resume,
        status: "PENDING",
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating internship application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
