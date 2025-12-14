import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseIdsParam = searchParams.get("courseIds")

    let enrolledCourseIds = []

    // Use provided course IDs if valid, otherwise fetch from DB (not doing anymore)
    if (courseIdsParam) {
      const providedIds = courseIdsParam.split(",").filter(Boolean)

      if (providedIds.length > 0) {
        //Verify user is actually enrolled in these courses
        const verifiedEnrollments = await prisma.enrollment.findMany({
          where: {
            userId: data.user.id,
            courseOfferedId: { in: providedIds },
          },
          select: { courseOfferedId: true },
        })

        enrolledCourseIds = verifiedEnrollments.map((e) => e.courseOfferedId)

        // If provided IDs don't match verified enrollments, log warning
        if (enrolledCourseIds.length !== providedIds.length) {
          console.warn(
            `User ${data.user.id} attempted to access unauthorized courses`
          )
        }
      }
    }

    // Fallback: fetch from DB if no valid course IDs provided
    if (enrolledCourseIds.length === 0) {
      const userEnrollments = await prisma.enrollment.findMany({
        where: { userId: data.user.id },
        select: { courseOfferedId: true },
      })
      enrolledCourseIds = userEnrollments.map((e) => e.courseOfferedId)
    }

    // Single optimized query for all calendar events
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        OR: [
          { userId: data.user.id },
          { courseOfferedId: { in: enrolledCourseIds } },
        ],
      },
      include: {
        page: {
          select: {
            id: true,
            content: true,
            isPublished: true,
            userId: true,
          },
        },
        courseOffered: {
          include: {
            course: {
              select: {
                code: true,
                title: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json(calendarEvents)
  } catch (error) {
    console.error("Calendar events error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
