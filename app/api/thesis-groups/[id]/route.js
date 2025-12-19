import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single group
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const group = await prisma.thesisGroup.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        supervisor: true,
        thesisSlot: true,
        joinRequests: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group, { status: 200 });
  } catch (error) {
    console.error("Error fetching thesis group:", error);
    return NextResponse.json(
      { error: "Failed to fetch thesis group" },
      { status: 500 }
    );
  }
}

// PUT - Update group
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { title, description, maxMembers, topic } = await request.json();

    const group = await prisma.thesisGroup.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(maxMembers && { maxMembers }),
        ...(topic && { topic }),
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        supervisor: true,
      },
    });

    return NextResponse.json(group, { status: 200 });
  } catch (error) {
    console.error("Error updating thesis group:", error);
    return NextResponse.json(
      { error: "Failed to update thesis group" },
      { status: 500 }
    );
  }
}

// DELETE - Delete group
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.thesisGroup.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Group deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting thesis group:", error);
    return NextResponse.json(
      { error: "Failed to delete thesis group" },
      { status: 500 }
    );
  }
}
