import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET: Fetch help posts for a course
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseOfferedId = searchParams.get("courseOfferedId")
    const scope = searchParams.get("scope") || "course"

    if (scope === "course") {
      // Accept either `courseId` or `courseOfferedId`. If `courseOfferedId` is provided
      // translate it to its `courseId` using the `CourseOffered` model so we can
      // query `ForumPost` which is defined with a `courseId` field in schema.prisma.
      const courseId = searchParams.get("courseId")

      let resolvedCourseId = courseId

      if (!resolvedCourseId && courseOfferedId) {
        const offered = await prisma.courseOffered.findUnique({ where: { id: courseOfferedId }, select: { courseId: true } })
        if (!offered) {
          return NextResponse.json({ error: "courseOfferedId not found" }, { status: 404 })
        }
        resolvedCourseId = offered.courseId
      }

      if (!resolvedCourseId) {
        return NextResponse.json({ error: "courseId or courseOfferedId required for course scope" }, { status: 400 })
      }

      const posts = await prisma.forumPost.findMany({
        where: { courseId: resolvedCourseId },
        include: {
          author: { select: { id: true, name: true, email: true } },
          comments: {
            include: { author: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      })

      return NextResponse.json(posts)
    }

    // For non-course scopes, return empty for now
    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching help posts:", error)
    return NextResponse.json({ error: "Failed to fetch help posts" }, { status: 500 })
  }
}

// POST: Create a new help post
export async function POST(request) {
  try {
    const body = await request.json()
    const { courseOfferedId, authorId, title, content } = body

    if (!courseOfferedId || !authorId || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({ where: { userId: authorId, courseOfferedId } })
    if (!enrollment) {
      return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 })
    }

    // Resolve the courseId from the provided courseOfferedId so we can create
    // a ForumPost (schema.prisma defines forum posts with a `courseId` field).
    const offered = await prisma.courseOffered.findUnique({ where: { id: courseOfferedId }, select: { courseId: true } })
    if (!offered) {
      return NextResponse.json({ error: "courseOfferedId not found" }, { status: 404 })
    }

    const post = await prisma.forumPost.create({
      data: { courseId: offered.courseId, authorId, title, content },
      include: { author: { select: { id: true, name: true, email: true } }, comments: true }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating help post:", error)
    return NextResponse.json({ error: "Failed to create help post" }, { status: 500 })
  }
}
