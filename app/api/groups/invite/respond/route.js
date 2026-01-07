// app/api/groups/invite/respond/route.js

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { inviteId, action } = await request.json() // action: "ACCEPT" | "REJECT"

    if (!inviteId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    // Fetch invite with group details
    const invite = await prisma.groupInvite.findUnique({
      where: { id: inviteId },
      include: {
        eventGroup: {
          include: {
            calendarEvent: true,
          },
        },
      },
    })

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    if (invite.inviteeId !== data.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invite already responded to" },
        { status: 400 },
      )
    }

    if (action === "ACCEPT") {
      // Transaction to handle acceptance and cleanup
      const result = await prisma.$transaction(async (tx) => {
        // Update this invite
        await tx.groupInvite.update({
          where: { id: inviteId },
          data: {
            status: "ACCEPTED",
            respondedAt: new Date(),
          },
        })

        // Add user to group
        await tx.eventGroupMember.create({
          data: {
            groupId: invite.groupId,
            userId: data.user.id,
          },
        })

        // Reject all other invites for this user for the same event
        // Optimization: Single updateMany instead of multiple updates
        await tx.groupInvite.updateMany({
          where: {
            inviteeId: data.user.id,
            id: { not: inviteId },
            status: "PENDING",
            eventGroup: {
              eventId: invite.eventGroup.eventId,
            },
          },
          data: {
            status: "REJECTED",
            respondedAt: new Date(),
          },
        })

        // Fetch updated group
        return tx.eventGroup.findUnique({
          where: { id: invite.groupId },
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
          },
        })
      })

      return NextResponse.json({
        success: true,
        group: result,
        message: "Invite accepted successfully",
      })
    } else if (action === "REJECT") {
      await prisma.groupInvite.update({
        where: { id: inviteId },
        data: {
          status: "REJECTED",
          respondedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: "Invite rejected",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error responding to invite:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
