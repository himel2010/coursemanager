import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all thesis groups with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get("supervisorId");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const whereClause = {};
    if (supervisorId) whereClause.supervisorId = supervisorId;

    const groups = await prisma.thesisGroup.findMany({
      where: whereClause,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        supervisor: true,
        joinRequests: { where: { status: "PENDING" } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error("Error fetching thesis groups:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST - Create new thesis group
export async function POST(request) {
  try {
    const { title, description, supervisorId, thesisSlotId, maxMembers, topic, creatorId } =
      await request.json();

    if (!title || !creatorId) {
      return NextResponse.json(
        { error: "Title and creator ID are required" },
        { status: 400 }
      );
    }

    try {
      // Ensure the creator user exists in the database
      await prisma.user.upsert({
        where: { id: creatorId },
        update: {},
        create: { id: creatorId, email: `user-${creatorId}@unknown.com` },
      });
    } catch (upsertError) {
      console.error("Error ensuring user exists:", upsertError);
      // Continue anyway - the user might already exist
    }

    const group = await prisma.thesisGroup.create({
      data: {
        title,
        description,
        supervisorId,
        thesisSlotId,
        maxMembers: maxMembers || 5,
        topic,
        creatorId,
        members: {
          create: {
            userId: creatorId,
            role: "CREATOR",
          },
        },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        supervisor: true,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating thesis group:", error);
    return NextResponse.json(
      { error: "Failed to create thesis group" },
      { status: 500 }
    );
  }
}
