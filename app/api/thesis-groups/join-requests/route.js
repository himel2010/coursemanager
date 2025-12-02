import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST - Request to join a group
export async function POST(request) {
  try {
    const { groupId, userId, message } = await request.json();

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: "Group ID and user ID are required" },
        { status: 400 }
      );
    }

    try {
      // Ensure the user exists in the database
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email: `user-${userId}@unknown.com` },
      });
    } catch (upsertError) {
      console.error("Error ensuring user exists:", upsertError);
      // Continue anyway - the user might already exist
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this group" },
        { status: 400 }
      );
    }

    // Check if request already exists
    const existingRequest = await prisma.groupJoinRequest.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existingRequest && existingRequest.status === "PENDING") {
      return NextResponse.json(
        { error: "You have already requested to join this group" },
        { status: 400 }
      );
    }

    const joinRequest = await prisma.groupJoinRequest.create({
      data: {
        groupId,
        userId,
        message,
        status: "PENDING",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        group: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(joinRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating join request:", error);
    return NextResponse.json(
      { error: "Failed to create join request" },
      { status: 500 }
    );
  }
}

// GET - List pending join requests for a group
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const status = searchParams.get("status") || "PENDING";

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    const requests = await prisma.groupJoinRequest.findMany({
      where: { groupId, status },
      include: {
        user: { select: { id: true, name: true, email: true, studentId: true } },
      },
      orderBy: { requestedAt: "asc" },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error("Error fetching join requests:", error);
    return NextResponse.json([], { status: 200 });
  }
}
