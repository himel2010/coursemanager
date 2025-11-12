// app/api/user/[id]/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        name: true,
        email: true,
        role: true,
        isFinalYear: true,
        department: {
          select: {
            code: true,
            name: true,
          },
        },
        enrollments: {
          where: {
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
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
