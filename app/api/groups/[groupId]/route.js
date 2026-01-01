// app/api/groups/[groupId]/route.js

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/groups/[groupId]
 * Fetches detailed group information
 *
 * Optimization:
 * - Single query with nested includes
 * - Authorization check to ensure user is member
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId } = await params

    const group = await prisma.eventGroup.findUnique({
      where: { id: groupId },
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
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
          },
        },
        page: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Check if user is a member
    const isMember = group.members.some(
      (member) => member.userId === data.user.id,
    )

    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 },
      )
    }

    return NextResponse.json({
      success: true,
      group,
    })
  } catch (error) {
    console.error("Error fetching group:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
