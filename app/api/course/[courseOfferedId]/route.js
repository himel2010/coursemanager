import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseOfferedId } = await params

    // Verify user is enrolled in this course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: authData.user.id,
        courseOfferedId: courseOfferedId,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 },
      )
    }

    // Fetch course offered with all related data
    const courseOffered = await prisma.courseOffered.findUnique({
      where: { id: courseOfferedId },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
        theoryFaculty: true,
        labFaculty1: true,
        labFaculty2: true,
        resources: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!courseOffered) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Fetch user's notes for this course
    const userNotes = await prisma.note.findMany({
      where: {
        userId: authData.user.id,
        courseId: courseOffered.courseId,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    })

    // Get user info to check if admin
    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      select: { isAdmin: true },
    })

    return NextResponse.json({
      courseOffered,
      userNotes,
      isAdmin: user?.isAdmin || false,
    })
  } catch (error) {
    console.error("Error fetching course data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
