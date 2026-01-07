import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req) {
    try {
        const supabase = await createClient()
        const { data: { user } = {}, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const url = new URL(req.url)
        const semesterId = url.searchParams.get("semester")

        const where = { userId: user.id }
        if (semesterId) where.semesterId = semesterId

        const wishlist = await prisma.wishlist.findMany({
            where,
            include: {
                courseOffered: {
                    include: { course: true, semester: true, theoryFaculty: true, labFaculty1: true, labFaculty2: true },
                },
            },
            orderBy: { priority: "asc" },
        })

        return NextResponse.json(wishlist)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const supabase = await createClient()
        const { data: { user } = {}, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { courseOfferedId, semesterId, priority = 3, notes = "" } = body
        if (!courseOfferedId || !semesterId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // validate courseOffered exists and belongs to semester
        const offer = await prisma.courseOffered.findUnique({ where: { id: courseOfferedId } })
        if (!offer) return NextResponse.json({ error: "Course offering not found" }, { status: 404 })
        if (offer.semesterId !== semesterId) return NextResponse.json({ error: "Course offering does not belong to semester" }, { status: 400 })

        // prevent duplicate
        const existing = await prisma.wishlist.findUnique({ where: { userId_courseOfferedId_semesterId: { userId: user.id, courseOfferedId, semesterId } } })
        if (existing) return NextResponse.json({ error: "Already wished" }, { status: 409 })

        const created = await prisma.wishlist.create({
            data: { userId: user.id, courseOfferedId, semesterId, priority, notes },
            include: { courseOffered: { include: { course: true, semester: true } } },
        })

        return NextResponse.json(created, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(req) {
    try {
        const supabase = await createClient()
        const { data: { user } = {}, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { id, priority, notes } = body
        if (!id) return NextResponse.json({ error: "Wishlist id required" }, { status: 400 })

        const existing = await prisma.wishlist.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (existing.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const updated = await prisma.wishlist.update({ where: { id }, data: { priority: priority ?? existing.priority, notes: notes ?? existing.notes } })
        return NextResponse.json(updated)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        const supabase = await createClient()
        const { data: { user } = {}, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const url = new URL(req.url)
        const id = url.searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Wishlist id required" }, { status: 400 })

        const existing = await prisma.wishlist.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (existing.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        await prisma.wishlist.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
