import { createPage, createQuizPage } from "@/lib/events/pageTemplate"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request) {
  const { data } = await request.json()
  console.log("received", data)
  const {
    course,
    description,
    eventType,
    startedAt,
    includeTime,
    userId,
    eventInfo,
  } = data
  console.log(eventType, includeTime)
  const syllabus = eventInfo.quiz.syllabus
  const rubric = eventInfo.quiz.rubric.items
  if (eventType === "ASSIGNMENT") {
    const response = await storeAssignment(
      course,
      description,
      eventType,
      startedAt,
      userId,
      eventInfo,
      includeTime,
    )
    const formattedResponse = formatResponse(response)

    return NextResponse.json(formattedResponse)
  } else {
    const page = createQuizPage({ syllabus, description, rubric })
    console.log(data)
    try {
      console.log("API a quiz time", startedAt)
      const response = await prisma.page.create({
        data: {
          content: {
            type: eventType.toUpperCase(),
            pageContent: page,
            pageProperties: eventInfo.quiz.quizInfo.pageProperties,
          },
          isPublished: true,
          userId,
          calendarEvent: {
            create: {
              courseOfferedId: course,
              title: "Quiz",
              userId,
              description,
              startTime: startedAt,
              includeTime: includeTime,
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
              includeTime: true,
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
    includeTime: response.calendarEvent.includeTime,
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
  eventInfo,
  includeTime,
) {
  try {
    console.log("API a time", startedAt)
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
            includeTime: includeTime,
            eventType: eventType.toUpperCase(),
            group:
              eventInfo.assignmentInfo.pageProperties.Groups === "True"
                ? true
                : false,
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
            includeTime: true,
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
