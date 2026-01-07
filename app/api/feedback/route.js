import { NextResponse } from "next/server"

// Feedback API disabled — return 410 Gone for any access
export async function GET() {
  return NextResponse.json({ error: "Feedback feature removed" }, { status: 410 })
}

export async function POST() {
  return NextResponse.json({ error: "Feedback feature removed" }, { status: 410 })
}
