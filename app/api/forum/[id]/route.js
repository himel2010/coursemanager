"use client"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/forum/[id] - Get a specific forum post
export async function GET(request, { params }) {
  try {
    const { id } = params

    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: "Forum post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching forum post:", error)
    return NextResponse.json({ error: "Failed to fetch forum post" }, { status: 500 })
  }
}

// PATCH /api/forum/[id] - Update a forum post (mark as resolved)
export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { isResolved, userId } = body

    // Get the post to check permissions
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: { author: true }
    })

    if (!post) {
      return NextResponse.json({ error: "Forum post not found" }, { status: 404 })
    }

    // Check if user is the author or an admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isAuthor = post.authorId === userId
    const isAdmin = user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized to update this post" }, { status: 403 })
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id },
      data: { isResolved },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating forum post:", error)
    return NextResponse.json({ error: "Failed to update forum post" }, { status: 500 })
  }
}

// DELETE /api/forum/[id] - Delete a forum post
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get the post to check permissions
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: { author: true }
    })

    if (!post) {
      return NextResponse.json({ error: "Forum post not found" }, { status: 404 })
    }

    // Check if user is the author or an admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isAuthor = post.authorId === userId
    const isAdmin = user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized to delete this post" }, { status: 403 })
    }

    await prisma.forumPost.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Forum post deleted successfully" })
  } catch (error) {
    console.error("Error deleting forum post:", error)
    return NextResponse.json({ error: "Failed to delete forum post" }, { status: 500 })
  }
}