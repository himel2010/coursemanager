// app/api/groups/my-group/route.js

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

    // Check if user is in a group (as creator or member)
    const userGroup = await prisma.eventGroup.findFirst({
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
          where: { status: "PENDING" },
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
        page: {
          select: {
            id: true,
          },
        },
      },
    })

    if (userGroup) {
      return NextResponse.json({
        success: true,
        hasGroup: true,
        group: userGroup,
        isCreator: userGroup.creatorId === data.user.id,
      })
    }

    // If no group, check for pending invites
    const pendingInvites = await prisma.groupInvite.findMany({
      where: {
        inviteeId: data.user.id,
        status: "PENDING",
        eventGroup: { eventId },
      },
      include: {
        eventGroup: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    studentId: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      hasGroup: false,
      pendingInvites,
    })
  } catch (error) {
    console.error("Error fetching user group:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
