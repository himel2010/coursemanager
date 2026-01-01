// app/api/user/[id]/route.js
import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // First, get the basic user info
    const user = await db.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Then get enrollments separately to avoid complex nesting issues
    const enrollments = await db.enrollment.findMany({
      where: {
        userId: id,
        courseOffered: {
          semester: {
            isActive: true,
          },
        },
      },
      include: {
        courseOffered: {
          include: {
            course: true,
            semester: true,
            theoryFaculty: true,
            labFaculty1: true,
            labFaculty2: true,
          },
        },
      },
    })

    // Get department if exists
    let department = null
    if (user.departmentId) {
      department = await db.department.findUnique({
        where: { id: user.departmentId },
        select: {
          code: true,
          name: true,
        },
      })
    }

    // Combine the results
    const result = {
      id: user.id,
      studentId: user.studentId,
      name: user.name,
      email: user.email,
      role: user.role,
      isFinalYear: user.isFinalYear,
      department,
      enrollments,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
