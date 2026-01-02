// app/api/groups/create/route.js

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { generateGroupName } from "@/lib/events/propertyDefinitions"

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, selectedUserIds, memberRange } = await request.json()

    // Validation
    if (!eventId || !selectedUserIds || selectedUserIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    // Validate member range if provided
    if (memberRange) {
      const [min, max] = memberRange
      const totalMembers = selectedUserIds.length + 1 // +1 for creator

      if (max && totalMembers > max) {
        return NextResponse.json(
          { error: `Maximum ${max} members allowed` },
          { status: 400 },
        )
      }
    }

    // Check if user already has a group for this event
    const existingGroup = await prisma.eventGroup.findFirst({
      where: {
        eventId,
        OR: [
          { creatorId: data.user.id },
          {
            members: {
              some: { userId: data.user.id },
            },
          },
        ],
      },
    })

    if (existingGroup) {
      return NextResponse.json(
        { error: "You are already in a group for this event" },
        { status: 400 },
      )
    }

    // Fetch event details and existing groups count in parallel
    // Optimization: Only fetch needed fields
    const [event, existingGroupsCount] = await Promise.all([
      prisma.calendarEvent.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          eventType: true,
          courseOfferedId: true,
          courseOffered: {
            select: {
              course: {
                select: { code: true },
              },
            },
          },
        },
      }),
      prisma.eventGroup.count({
        where: { eventId },
      }),
    ])

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Generate group name
    const groupNumber = existingGroupsCount + 1
    const groupName = generateGroupName(
      groupNumber,
      event.courseOffered.course.code,
      event.eventType,
    )

    // Create group with transaction for atomicity
    // Optimization: Single database round-trip for all operations
    const result = await prisma.$transaction(async (tx) => {
      // Create empty page for group
      const page = await tx.page.create({
        data: {
          content: {
            type: "group",
            pageContent: [], // Empty BlockNote content
          },
          isPublished: true,
          userId: data.user.id,
        },
        select: { id: true },
      })

      // Create group
      const group = await tx.eventGroup.create({
        data: {
          name: groupName,
          eventId,
          courseOfferedId: event.courseOfferedId,
          creatorId: data.user.id,
          pageId: page.id,
          members: {
            create: {
              userId: data.user.id, // Creator is automatically a member
            },
          },
          invites: {
            createMany: {
              data: selectedUserIds.map((userId) => ({
                inviterId: data.user.id,
                inviteeId: userId,
                status: "PENDING",
              })),
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  studentId: true,
                },
              },
            },
          },
          invites: {
            include: {
              invitee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  studentId: true,
                },
              },
            },
          },
        },
      })

      return group
    })

    return NextResponse.json({
      success: true,
      group: result,
      message: "Group created and invites sent successfully",
    })
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
