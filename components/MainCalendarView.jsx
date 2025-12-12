"use client"
import { getMonth } from "@/lib/getTime"
import React, { useEffect, useState } from "react"

import { Separator } from "./ui/separator"

import MonthView from "./MonthView"
import dayjs from "dayjs"
import CalendarViewSidebar from "./CalendarViewSidebar"
import axios from "axios"
import { toast } from "sonner"
import { useCalendarStore } from "@/lib/store"
import { Button } from "./ui/button"

const MainCalendarView = () => {
  const month = getMonth()
  const events = useCalendarStore((state) => state.events)
  const setEvents = useCalendarStore((state) => state.setEvents)

  const calendar = useCalendarStore()

  useEffect(() => {
    const getEvents = async () => {
      try {
        const response = await axios.get("/api/get-calendar-events")
        console.log("Response ", response)
        if (response) {
          console.log("setting response")

          const newEvents = response.data.map((e) => ({
            id: e.id,
            title: e.title,
            type: e.eventType,
            date: dayjs(e.startTime),
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

          // Set it once
          setEvents(newEvents)
        }
        console.log(events)
      } catch (error) {
        console.log(error)
      }
    }
    getEvents()
  }, [])

  return (
    <div className="w-full border-2 flex overflow-hidden">
      {/* Weekday Headers */}

      <div className="w-full h-full overflow-y-auto">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {month[0].map((day, i) => (
            <div
              key={i}
              className="text-center text-sm font-semibold text-muted-foreground py-2"
            >
              {day.format("ddd")}
            </div>
          ))}
        </div>
        <Separator />
        {/* Calendar Grid - Weeks (Rows) */}
        <MonthView month={month} events={events} />
      </div>
      <div className="hidden lg:block w-full max-w-sm flex-shrink-0 overflow-hidden">
        <CalendarViewSidebar calendar={calendar} />
      </div>
    </div>
  )
}

export default MainCalendarView
