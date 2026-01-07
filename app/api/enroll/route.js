import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        const supabase = await createClient()
        const { data: { user } = {}, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { courseOfferedId } = body
        if (!courseOfferedId) return NextResponse.json({ error: "courseOfferedId required" }, { status: 400 })

        const offer = await prisma.courseOffered.findUnique({ where: { id: courseOfferedId }, select: { id: true, semesterId: true } })
        if (!offer) return NextResponse.json({ error: "Course offering not found" }, { status: 404 })

        // Prevent duplicate enrollment
        const existing = await prisma.enrollment.findFirst({ where: { userId: user.id, courseOfferedId } })
        if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 409 })

        // Enforce max 5 enrollments per user
        const currentCount = await prisma.enrollment.count({ where: { userId: user.id } })
        if (currentCount >= 5) return NextResponse.json({ error: "Enrollment limit reached (5)" }, { status: 400 })

        const created = await prisma.enrollment.create({ data: { userId: user.id, courseOfferedId } })
        return NextResponse.json({ success: true, enrollment: created }, { status: 201 })
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

        const body = await req.json()
        const { courseOfferedId } = body
        if (!courseOfferedId) return NextResponse.json({ error: "courseOfferedId required" }, { status: 400 })

        const existing = await prisma.enrollment.findFirst({ where: { userId: user.id, courseOfferedId } })
        if (!existing) return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })

        await prisma.enrollment.delete({ where: { id: existing.id } })
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
