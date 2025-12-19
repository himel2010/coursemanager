"use client"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/forum - Get all forum posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const resolved = searchParams.get('resolved')
    const limit = parseInt(searchParams.get('limit')) || 50

    const where = {}
    if (courseId) where.courseId = courseId
    if (resolved !== null) where.isResolved = resolved === 'true'

    const posts = await prisma.forumPost.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching forum posts:", error)
    return NextResponse.json({ error: "Failed to fetch forum posts" }, { status: 500 })
  }
}

// POST /api/forum - Create a new forum post
export async function POST(request) {
  try {
    const body = await request.json()
    const { courseId, title, content, authorId } = body

    if (!courseId || !title || !content || !authorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure user exists in public.users table
    await prisma.user.upsert({
      where: { id: authorId },
      update: {},
      create: { id: authorId, name: "", email: "" }
    })

    const post = await prisma.forumPost.create({
      data: {
        courseId,
        authorId,
        title,
        content
      },
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

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating forum post:", error)
    return NextResponse.json({ error: "Failed to create forum post" }, { status: 500 })
  }
}