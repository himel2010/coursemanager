import { createPage, createQuizPage } from "@/lib/events/pageTemplate"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request) {
  const { data } = await request.json()
  const { course, description, eventType, startedAt, userId, eventInfo } = data
  const syllabus = eventInfo.quiz.syllabus
  if (eventType === "ASSIGNMENT") {
    const response = await storeAssignment(
      course,
      description,
      eventType,
      startedAt,
      userId,
      eventInfo
    )
    const formattedResponse = formatResponse(response)

    return NextResponse.json(formattedResponse)
  } else {
    const page = createQuizPage({ syllabus, description })
    console.log(data)
    try {
      const response = await prisma.page.create({
        data: {
          content: { type: eventType.toUpperCase(), pageContent: page },
          isPublished: true,
          userId,
          calendarEvent: {
            create: {
              courseOfferedId: course,
              title: "Quiz",
              userId,
              description,
              startTime: startedAt,
              eventType: eventType.toUpperCase(),
            },
          },
        },
        select: {
          id: true,
          content: true,
          isPublished: true,
          userId: true,
          calendarEvent: {
            select: {
              id: true,
              title: true,
              eventType: true,
              startTime: true,
              reminderTime: true,
              courseOffered: {
                include: {
                  course: {
                    select: {
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
      const formattedResponse = formatResponse(response)

      return NextResponse.json(formattedResponse)
    } catch (error) {
      console.log(error)
      NextResponse.json("error")
    }

    // Then transform it
    const formattedResponse = formatResponse(response)

    return NextResponse.json(formattedResponse)
  }
}

function formatResponse(response) {
  return {
    id: response.calendarEvent.id,
    title: response.calendarEvent.title,
    type: response.calendarEvent.eventType,
    date: response.calendarEvent.startTime,
    reminders: response.calendarEvent.reminderTime,
    owner: response.userId,
    published: response.isPublished,
    page: {
      id: response.id,
      isPublished: response.isPublished,
      pageContent: response.content.pageContent,
      pageProperties: response.content.pageProperties,
      actualPage: response.content,
    },
    courseOffered: response.calendarEvent.courseOffered,
    courseCode: response.calendarEvent.courseOffered.course.code,
    courseSection: response.calendarEvent.courseOffered.section,
  }
}

async function storeAssignment(
  course,
  description,
  eventType,
  startedAt,
  userId,
  eventInfo
) {
  try {
    const response = await prisma.page.create({
      data: {
        content: {
          type: eventType.toUpperCase(),
          pageContent: eventInfo.assignmentInfo.pageContent,
          pageProperties: eventInfo.assignmentInfo.pageProperties,
        },
        isPublished: true,
        userId,
        calendarEvent: {
          create: {
            courseOfferedId: course,
            title: "Assignment",
            userId,
            description,
            startTime: startedAt,
            eventType: eventType.toUpperCase(),
          },
        },
      },
      select: {
        id: true,
        content: true,
        isPublished: true,
        userId: true,
        calendarEvent: {
          select: {
            id: true,
            title: true,
            eventType: true,
            startTime: true,
            reminderTime: true,
            courseOffered: {
              include: {
                course: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    console.log("returned info for assignemnts", response)
    return response
  } catch (error) {
    return error
  }
}
