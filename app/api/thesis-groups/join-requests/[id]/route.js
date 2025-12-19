import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT - Accept or reject join request
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { action } = await request.json(); // action: "ACCEPT" or "REJECT"

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be ACCEPT or REJECT" },
        { status: 400 }
      );
    }

    const joinRequest = await prisma.groupJoinRequest.findUnique({
      where: { id },
    });

    if (!joinRequest) {
      return NextResponse.json(
        { error: "Join request not found" },
        { status: 404 }
      );
    }

    if (action === "ACCEPT") {
      // Check if group has capacity
      const group = await prisma.thesisGroup.findUnique({
        where: { id: joinRequest.groupId },
        include: { members: true },
      });

      if (group.members.length >= group.maxMembers) {
        return NextResponse.json(
          { error: "Group is at maximum capacity" },
          { status: 400 }
        );
      }

      // Add user to group
      await prisma.groupMember.create({
        data: {
          groupId: joinRequest.groupId,
          userId: joinRequest.userId,
          role: "MEMBER",
        },
      });

      // Update request status
      const updatedRequest = await prisma.groupJoinRequest.update({
        where: { id },
        data: { status: "ACCEPTED", respondedAt: new Date() },
        include: {
          user: { select: { id: true, name: true, email: true } },
          group: { select: { id: true, title: true } },
        },
      });

      return NextResponse.json(updatedRequest, { status: 200 });
    } else {
      // Reject
      const updatedRequest = await prisma.groupJoinRequest.update({
        where: { id },
        data: { status: "REJECTED", respondedAt: new Date() },
        include: {
          user: { select: { id: true, name: true, email: true } },
          group: { select: { id: true, title: true } },
        },
      });

      return NextResponse.json(updatedRequest, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating join request:", error);
    return NextResponse.json(
      { error: "Failed to update join request" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel join request
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.groupJoinRequest.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Join request deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting join request:", error);
    return NextResponse.json(
      { error: "Failed to delete join request" },
      { status: 500 }
    );
  }
}
