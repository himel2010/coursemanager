"use client"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// POST /api/forum/comments - Create a new comment
export async function POST(request) {
  try {
    const body = await request.json()
    const { postId, content, authorId } = body

    if (!postId || !content || !authorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure user exists in public.users table
    await prisma.user.upsert({
      where: { id: authorId },
      update: {},
      create: { id: authorId, name: "", email: "" }
    })

    const comment = await prisma.forumComment.create({
      data: {
        postId,
        authorId,
        content
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating forum comment:", error)
    return NextResponse.json({ error: "Failed to create forum comment" }, { status: 500 })
  }
}