import { useCalendarStore } from "@/lib/store"
import dayjs from "dayjs"
import React from "react"
import { ScrollArea } from "./ui/scroll-area"
import { Card } from "./ui/card"
import CalendarEvent from "./CalendarEvent"

const UpcomingView = ({ events }) => {
  const { selectedDate, setSelectedDate } = useCalendarStore()

  // Get next 7 days starting from today
  const getNext7Days = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const currentDate = dayjs().add(i, "day")
      days.push({
        currentDate,
        today: i === 0,
      })
    }
    return days
  }

  const next7Days = getNext7Days()

  return (
    <>
      {/* Header */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] place-items-center px-4 py-2 border-b bg-background">
        <div className="w-16 border-r">
          <div className="relative h-16">
            <div className="absolute top-2 text-xs">Events</div>
          </div>
        </div>

        {next7Days.map(({ currentDate, today }, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center text-sm font-semibold text-muted-foreground py-2"
          >
            <div className={today ? "text-primary" : ""}>
              {currentDate.format("ddd")}
            </div>
            <div
              className={today ? "bg-primary text-background rounded-full" : ""}
            >
              <span className="text-lg p-2">{currentDate.format("DD")} </span>
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable section */}
      <ScrollArea className="h-full">
        {/* All events section */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] px-4 py-2">
          <div className="w-16 border-r flex items-center">
            <div className="text-xs text-gray-600">All Events</div>
          </div>

          {next7Days.map(({ currentDate, today }, index) => {
            return (
              <UpcomingDayBox
                key={index}
                events={events}
                day={currentDate}
                today={today}
                setSelectedDate={setSelectedDate}
              />
            )
          })}
        </div>
      </ScrollArea>
    </>
  )
}

export default UpcomingView

// Box for all events on a specific day
const UpcomingDayBox = ({ events, day, today, setSelectedDate }) => {
  const filter = useCalendarStore((state) => state.filter)

  // Filter all events on this day (both with and without time)
  const dayEvents =
    events?.filter((e) => {
      if (!e?.date) return false
      return e.date.format("YYYY-MM-DD") === day.format("YYYY-MM-DD")
    }) || []

  // Sort events by time (events with time first, sorted by hour, then events without time)
  const sortedEvents = [...dayEvents].sort((a, b) => {
    // If both have time, sort by hour
    if (a.includeTime && b.includeTime) {
      return a.date.hour() - b.date.hour() || a.date.minute() - b.date.minute()
    }
    // Events with time come before events without time
    if (a.includeTime && !b.includeTime) return -1
    if (!a.includeTime && b.includeTime) return 1
    // Both without time, keep original order
    return 0
  })

  const classes = events?.find((e) => e.id === "class")
  const weekDay = day.format("dddd")

  // Get all classes for this day, sorted by time
  const dayClasses = classes?.classes?.[weekDay]
    ? [...classes.classes[weekDay]].sort((a, b) => {
        if (a.includeTime && b.includeTime) {
          return (
            a.date.hour() - b.date.hour() || a.date.minute() - b.date.minute()
          )
        }
        if (a.includeTime && !b.includeTime) return -1
        if (!a.includeTime && b.includeTime) return 1
        return 0
      })
    : []

  const hasEvents = sortedEvents.length > 0 || dayClasses.length > 0

  return (
    <Card
      className={`bg-transparent shadow-none border-r min-h-[10rem] w-full p-2 cursor-pointer transition-all hover:shadow-md ${
        today ? "bg-primary/5" : ""
      } ${!hasEvents ? "opacity-50" : ""}`}
      onClick={() => setSelectedDate(day)}
    >
      <div className="flex flex-col gap-1">
        {/* Classes */}
        {dayClasses.map((e, i) => {
          const isFiltered = filter?.includes("CLASS")
          return (
            <div key={`class-${i}`}>
              {!isFiltered && (
                <CalendarEvent event={e} day={day} type="class" />
              )}
            </div>
          )
        })}

        {/* Other events */}
        {sortedEvents.map((e, i) => {
          const isFiltered = filter?.includes(e.type)
          return (
            <div key={`event-${i}`}>
              {!isFiltered && <CalendarEvent event={e} day={day} />}
            </div>
          )
        })}

        {/* Empty state */}
        {!hasEvents && (
          <div className="text-xs text-muted-foreground text-center py-4">
            No events
          </div>
        )}
      </div>
    </Card>
  )
}
