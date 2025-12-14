import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [faculty, enrollments, users, courseOffered, courses] =
      await Promise.all([
        prisma.faculty.findMany(),
        prisma.enrollments.findMany(),
        prisma.user.findMany(),
        prisma.courseOffered.findMany(),
        prisma.course.findMany(),
      ])

    return NextResponse.json({
      faculty: faculty,
      enrollments: enrollments,
      users: users,
      courseOffered: courseOffered,
      courses: courses,
    })
  } catch (error) {
    console.log("Error found")
    return NextResponse.json(error)
  }
}
