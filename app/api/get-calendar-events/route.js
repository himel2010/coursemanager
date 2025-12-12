import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("API")
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      return NextResponse.json(error)
    }

    //get calendar event pages for the user.

    //this only gets the page the user created
    //but a more comprehensive search would be a course based searched.
    //so I should probably just send the information with get
    const response = await prisma.CalendarEvent.findMany({
      where: {
        userId: data.user.id,
      },
      include: {
        page: true,
        courseOffered: {
          include: {
            course: true,
          },
        },
      },
    })

    console.log(response)

    return NextResponse.json(response)
  } catch (error) {
    console.log(error)
    return NextResponse.json(error)
  }
}
