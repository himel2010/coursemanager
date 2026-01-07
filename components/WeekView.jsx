import { getHours, getWeekDays } from "@/lib/getTime"
import { useCalendarStore } from "@/lib/store"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { ScrollArea } from "./ui/scroll-area"
import { Card } from "./ui/card"
import CalendarEvent from "./CalendarEvent"

const WeekView = ({ events }) => {
  const [currentTime, setCurrentTime] = useState(dayjs())
  const { selectedDate, setSelectedDateWithTime } = useCalendarStore()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Week header */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] place-items-center px-4 py-2 border-b bg-background">
        <div className="w-16 border-r">
          <div className="relative h-16">
            <div className="absolute top-2 text-xs">Time</div>
          </div>
        </div>

        {getWeekDays(selectedDate).map(({ currentDate, today }, index) => (
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
        {/* All-day events section */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] px-4 py-2 border-b bg-muted/30">
          <div className="w-16 border-r flex items-center"></div>

          {getWeekDays(selectedDate).map(({ currentDate, today }, index) => {
            const day = selectedDate.startOf("week").add(index, "day")
            return (
              <AllDayBox key={index} events={events} day={day} today={today} />
            )
          })}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] px-4">
          {/* Time Column */}
          <div className="w-16 border-r">
            {getHours.map((hour, index) => (
              <div key={index} className="h-16 relative border-b">
                <div className="absolute -top-2 text-xs">
                  {dayjs().hour(hour).format("h A")}
                </div>
              </div>
            ))}
          </div>

          {/* Week Days Corresponding Boxes */}
          {getWeekDays(selectedDate).map(({ isCurrentDay, today }, index) => {
            const day = selectedDate.startOf("week").add(index, "day")

            return (
              <div key={index} className="relative border-r">
                {getHours.map((hour, i) => (
                  <WeekViewBox
                    key={i}
                    events={events}
                    day={day}
                    hour={hour}
                    selectedDate={selectedDate}
                    setSelectedDateWithTime={setSelectedDateWithTime}
                  />
                ))}

                {/* Current time indicator */}
                {isCurrentDay(day) && today && (
                  <div
                    className="absolute h-0.5 w-full bg-red-500 z-10"
                    style={{
                      top: `${
                        ((currentTime.hour() * 60 + currentTime.minute()) /
                          (24 * 60)) *
                        100
                      }%`,
                    }}
                  >
                    <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </>
  )
}

export default WeekView

// All-day events box (for events without time)
const AllDayBox = ({ events, day, today }) => {
  const filter = useCalendarStore((state) => state.filter)

  // Filter events without time on this day
  const noTimeEvents = events?.filter((e) => {
    if (!e?.date || e.includeTime) return false
    return e.date.format("YYYY-MM-DD") === day.format("YYYY-MM-DD")
  })

  const classes = events?.find((e) => e.id === "class")
  const weekDay = day.format("dddd")

  // Classes without time (shouldn't normally happen, but just in case)
  const noTimeClasses =
    classes?.classes?.[weekDay]?.filter((classEvent) => {
      return !classEvent?.includeTime
    }) || []

  const hasEvents = noTimeEvents.length > 0 || noTimeClasses.length > 0

  return (
    <Card
      className={`bg-transparent shadow-none flex  border-none min-h-[3rem] w-full p-1 cursor-pointer transition-all hover:shadow-md rounded-sm shadow-none ${
        today ? "bg-primary/5" : ""
      } ${!hasEvents ? "opacity-50" : ""}`}
    >
      <div className="flex flex-col gap-1">
        {noTimeClasses.map((e, i) => {
          const isFiltered = filter?.includes("CLASS")
          return (
            <div key={i}>
              {!isFiltered && dayjs(day).isBefore(dayjs("2026-01-09")) && (
                <CalendarEvent event={e} day={day} type="class" />
              )}
            </div>
          )
        })}
        {noTimeEvents.map((e, i) => {
          const isFiltered = filter?.includes(e.type)
          return (
            <div key={i}>
              {!isFiltered && <CalendarEvent event={e} day={day} />}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// Time-based events box
const WeekViewBox = ({
  events,
  day,
  hour,
  selectedDate,
  setSelectedDateWithTime,
}) => {
  const filter = useCalendarStore((state) => state.filter)

  // Filter events WITH time that are on the same day and in this hour slot
  const filtered_events = events?.filter((e) => {
    if (!e?.date || !e.includeTime) return false
    const isSameDay = e.date.format("YYYY-MM-DD") === day.format("YYYY-MM-DD")
    const isSameHour = e.date.hour() === hour
    return isSameDay && isSameHour
  })

  const classes = events?.find((e) => e.id === "class")
  const weekDay = day.format("dddd")

  // Filter class events WITH time that match this hour
  const filteredClasses =
    classes?.classes?.[weekDay]?.filter((classEvent) => {
      if (!classEvent?.date || !classEvent?.includeTime) return false
      return classEvent.date.hour() === hour
    }) || []

  return (
    <Card
      className={`h-16 p-2 cursor-pointer transition-all
                    hover:shadow-md hover:scale-[1.01] hover:bg-destructive/20
                    rounded-sm shadow-none gap-0
                    ${
                      day.format("YYYY-MM-DD") ===
                        selectedDate.format("YYYY-MM-DD") &&
                      hour === selectedDate.hour()
                        ? "bg-primary/20 hover:bg-primary/30"
                        : ""
                    }
                    `}
      onClick={() => {
        setSelectedDateWithTime(day, hour)
      }}
    >
      <div className="flex flex-col max-h-fit">
        {filteredClasses.map((e, i) => {
          const isFiltered = filter?.includes("CLASS")
          return (
            <div key={i}>
              {!isFiltered && (
                <CalendarEvent event={e} day={day} type="class" />
              )}
            </div>
          )
        })}
        {filtered_events.map((e, i) => {
          const isFiltered = filter?.includes(e.type)
          return (
            <div key={i}>
              {!isFiltered && <CalendarEvent event={e} day={day} />}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
