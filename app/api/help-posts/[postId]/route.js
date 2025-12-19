import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// PATCH: Update a help post (e.g., mark as resolved)
export async function PATCH(request, { params }) {
  try {
    const { postId } = params
    const body = await request.json()
    const { isResolved, userId } = body

    if (typeof isResolved !== "boolean") {
      return NextResponse.json({ error: "isResolved must be a boolean" }, { status: 400 })
    }

    // Get the post to check author
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user is author or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (post.authorId !== userId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: { isResolved },
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "asc" }
        }
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating help post:", error)
    return NextResponse.json({ error: "Failed to update help post" }, { status: 500 })
  }
}