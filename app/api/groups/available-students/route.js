// app/api/groups/available-students/route.js

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
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 })
    }

    // Fetch event to get courseOfferedId
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      select: { courseOfferedId: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get all students enrolled in this course who are NOT in a group
    // Optimization: Single query with subquery filter
    const availableStudents = await prisma.user.findMany({
      where: {
        // Must be enrolled in the course
        enrollments: {
          some: {
            courseOfferedId: event.courseOfferedId,
          },
        },
        // Must NOT be the current user
        id: {
          not: data.user.id,
        },
        // Must NOT already be in a group for this event
        AND: [
          {
            eventGroupMemberships: {
              none: {
                eventGroup: {
                  eventId: eventId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      students: availableStudents,
    })
  } catch (error) {
    console.error("Error fetching available students:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
