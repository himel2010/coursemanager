"use client"
import { getMonth } from "@/lib/getTime"
import React, { useEffect, useState } from "react"

import { Separator } from "./ui/separator"

import MonthView from "./MonthView"
import dayjs from "dayjs"
import CalendarViewSidebar from "./CalendarViewSidebar"
import axios from "axios"

import { useCalendarStore } from "@/lib/store"

import { formatCourses } from "@/lib/events/classEvents"
import CalendarNav from "./CalendarNav"
import WeekView from "./WeekView"
import { ScrollArea } from "./ui/scroll-area"
import UpcomingView from "./UpcomingView"
import { useAuth } from "@/lib/auth/AuthContext"

const MainCalendarView = ({ upcoming }) => {
  const month = useCalendarStore((state) => state.month)
  const events = useCalendarStore((state) => state.events)
  const setEvents = useCalendarStore((state) => state.setEvents)
  const currentView = useCalendarStore((state) => state.currentView)
  const { userProfile, courses } = useAuth()

  const calendar = useCalendarStore()

  useEffect(() => {
    const initializeEvents = async () => {
      const allNewEvents = []

      // Get API events
      try {
        const response = await axios.get("/api/get-calendar-events")
        if (response) {
          console.log("response", response)
          const apiEvents = response.data.map((e) => ({
            id: e.id,
            title: e.title,
            type: e.eventType,
            date: dayjs(e.startTime),
            includeTime: e.includeTime,
            reminders: e?.reminderTime,
            owner: e.page.userId,
            published: true,
            page: {
              id: e.page.id,
              isPublished: e.page.isPublished,
              pageContent: e.page.content.pageContent,
              pageProperties: e.page.content.pageProperties,
              tags: e.page.tags,
              sharedUsers: e.page.users,
              actualPage: e.page.content,
            },
            courseOffered: e.courseOffered,
            courseCode: e.courseOffered.course.code,
            courseSection: e.courseOffered.section,
          }))
          allNewEvents.push(...apiEvents)
        }
      } catch (error) {
        console.log(error)
      }

      // Add class events
      if (courses && courses.length > 0) {
        const classes = formatCourses(courses)
        const classEvent = {
          id: "class",
          type: "class",
          classes,
        }
        allNewEvents.push(classEvent)
      }

      // Set all events at once
      setEvents(allNewEvents)
    }

    initializeEvents()
  }, [courses]) // Depend on courses so it runs when courses are available

  return (
    <div
      className={
        upcoming
          ? "w-full h-full flex justify-center items-center "
          : `w-full h-[90vh] border-2 flex overflow-hidden`
      }
    >
      {/* Weekday Headers */}

      <div
        className={upcoming ? "w-full h-full" : "w-full h-full overflow-y-auto"}
      >
        <CalendarNav upcoming={upcoming} />
        {/* Calendar Grid - Weeks (Rows) */}
        {upcoming ? (
          <UpcomingView events={events} />
        ) : currentView === "MONTH" ? (
          <MonthView month={month} events={events} />
        ) : (
          <WeekView events={events} />
        )}
      </div>
      {!upcoming && (
        <ScrollArea className="h-full w-full max-w-md">
          <CalendarViewSidebar calendar={calendar} userProfile={userProfile} />
        </ScrollArea>
      )}
    </div>
  )
}

export default MainCalendarView
