import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function getAllInfo() {
  try {
    const [faculty, enrollments, users, courseOffered, course] =
      await Promise.all([
        prisma.faculty.findMany(),
        prisma.enrollment.findMany(),
        prisma.user.findMany(),
        prisma.courseOffered.findMany(),
        prisma.course.findMany(),
      ])

    return {
      faculty: faculty,
      enrollments: enrollments,
      users: users,
      courseOffered: courseOffered,
      courses: course,
    }
  } catch (error) {
    console.log(error)
    return error
  }
}
