import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.getUser()

    if (error || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get("groupId")

    if (!groupId) {
      return NextResponse.json({ error: "Missing groupId" }, { status: 400 })
    }

    // Verify user is a member of this group
    const membership = await prisma.eventGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: authData.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 },
      )
    }

    // Get channel and messages
    const channel = await prisma.groupChatChannel.findUnique({
      where: { groupId },
      select: { id: true },
    })

    if (!channel) {
      return NextResponse.json(
        { error: "Chat channel not found" },
        { status: 404 },
      )
    }

    const messages = await prisma.groupChatMessage.findMany({
      where: { channelId: channel.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 50,
    })

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      sender: msg.user.name,
      message: msg.content,
      timestamp: msg.createdAt,
      userId: msg.user.id,
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error("Error fetching group chat messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
