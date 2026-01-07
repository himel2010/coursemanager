import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can add resources" },
        { status: 403 },
      )
    }

    const { courseOfferedId } = await params
    const { title, url } = await request.json()

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 },
      )
    }

    // Verify course exists
    const courseOffered = await prisma.courseOffered.findUnique({
      where: { id: courseOfferedId },
    })

    if (!courseOffered) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Create resource (force type to LINK)
    const resource = await prisma.resource.create({
      data: {
        courseOfferedId: courseOfferedId,
        title: title,
        url: url,
        type: "LINK",
      },
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error("Error creating resource:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can delete resources" },
        { status: 403 },
      )
    }

    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get("resourceId")

    if (!resourceId) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 },
      )
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
