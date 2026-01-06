// app/api/groups/available-students/route.js

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/groups/available-students?eventId=xxx
 * Fetches students enrolled in the course who are NOT in a group for this event
 *
 * Optimization strategy:
 * 1. Single complex query instead of multiple round-trips
 * 2. Use NOT EXISTS subquery for efficiency
 * 3. Only select necessary fields to minimize payload
 * 4. Index-optimized WHERE clause
 */
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
                group: {
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
