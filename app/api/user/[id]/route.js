// app/api/user/[id]/route.js
import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const authData = await supabase.auth.getUser()
    const currentUserId = authData.data?.user?.id

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      )
    }

    // Only allow fetching own profile
    if (id !== currentUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // First, get the basic user info
    let user = await db.user.findUnique({
      where: { id },
    })

    // If user doesn't exist, create them
    if (!user) {
      user = await db.user.create({
        data: {
          id: currentUserId,
          email: authData.data.user.email || "",
          name: authData.data.user.user_metadata?.name || "",
        },
      })
    }

    // If user exists but name is missing, try to populate from Supabase metadata
    if (user && (!user.name || user.name.trim() === "")) {
      const metaName = authData.data.user.user_metadata?.name
      if (metaName) {
        try {
          user = await db.user.update({
            where: { id },
            data: { name: metaName },
          })
        } catch (e) {
          console.error("Failed to update user name from metadata:", e)
        }
      }
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
      isAdmin: user.isAdmin,
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
      { status: 500 },
    )
  }
}
