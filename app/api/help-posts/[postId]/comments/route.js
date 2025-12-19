import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET: Fetch comments for a help post
export async function GET(request, { params }) {
  try {
    const { postId } = params

    const comments = await prisma.forumComment.findMany({
      where: { postId },
      include: {
        author: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// POST: Create a new comment on a help post
export async function POST(request, { params }) {
  try {
    const { postId } = params
    const body = await request.json()
    const { authorId, content } = body

    if (!authorId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true, courseId: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: "Help post not found" },
        { status: 404 }
      )
    }

    // Check if user is enrolled in any offering of the same course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: authorId,
        courseOffered: { is: { courseId: post.courseId } }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      )
    }

    const comment = await prisma.forumComment.create({
      data: {
        postId,
        authorId,
        content
      },
      include: {
        author: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}
