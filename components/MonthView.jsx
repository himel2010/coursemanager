import dayjs from "dayjs"
import { Card } from "./ui/card"
import CalendarEvent from "./CalendarEvent"
import { useCalendarStore } from "@/lib/store"
import { Button } from "./ui/button"
import { useAuth } from "@/lib/auth/AuthContext"
import { formatCourses } from "@/lib/events/classEvents"
import { Separator } from "./ui/separator"

const MonthView = ({ month, events }) => {
  const { courses } = useAuth()

  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate)
  const selectedDate = useCalendarStore((state) => state.selectedDate)

  return (
    <>
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
      <div className="space-y-2">
        {month.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-2">
            {week.map((day, dayIdx) => (
              <MonthBox
                day={day}
                dayIdx={dayIdx}
                weekIdx={weekIdx}
                week={week}
                key={dayIdx}
                events={events}
                setSelectedDate={setSelectedDate}
                selectedDate={selectedDate}
                courses={courses}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

export default MonthView

const MonthBox = ({
  day,
  dayIdx,
  weekIdx,
  week,
  events,
  setSelectedDate,
  selectedDate,
  courses,
}) => {
  const today = dayjs()

  const isToday = day.format("YYYY-MM-DD") === today.format("YYYY-MM-DD")

  const isCurrentMonth =
    day.format("M") === (new Date().getMonth() + 1).toString()

  const filtered_events = events?.filter(
    (e) => e?.date?.format("DD-MM-YYYY") === day.format("DD-MM-YYYY"),
  )
  const classes = events?.find((e) => e.id == "class")
  const filter = useCalendarStore((state) => state.filter)
  const weekDay = day.format("dddd")

  return (
    <Card
      className={`
                    min-h-[7rem] p-2 cursor-pointer transition-all
                    hover:shadow-md hover:scale-[1.01] hover:bg-destructive/20
                    rounded-sm shadow-none gap-0
                    ${weekIdx === 0 ? "rounded-t-none" : ""}
                    ${
                      dayIdx === 0
                        ? "rounded-l-none"
                        : dayIdx === week.length - 1
                          ? "rounded-r-none"
                          : ""
                    }
                    ${isToday ? "border-2 border-primary" : ""}
                    ${
                      !isCurrentMonth
                        ? "bg-[var(--muted)] text-muted-foreground hover:disabled:*"
                        : ""
                    }
                    ${
                      day.format("DD-MM-YYYY") ===
                      selectedDate?.format("DD-MM-YYYY")
                        ? "bg-[var(--primary)]/20"
                        : ""
                    }
                  `}
      onClick={() => setSelectedDate(day)}
    >
      {/* Day Number */}
      <div
        className={`
                    text-sm font-semibold mb-2
                    ${isToday ? "text-primary" : ""}
                  `}
      >
        <div className="flex justify-between mr-1">
          {day.format("D") === "1" ? (
            <strong>{day.format("MMM D")}</strong>
          ) : (
            day.format("D")
          )}
          <p className="font-light">{isToday ? "Today" : ""}</p>
        </div>
      </div>
      <div className="flex flex-col gap-0">
        {classes?.classes?.[day.format("dddd")].map((e, i) => {
          const isFiltered = filter?.includes("CLASS")
          return (
            <div key={i}>
              {!isFiltered && dayjs(day).isBefore(dayjs("2026-01-09")) && (
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

      {/* Events will go here */}
    </Card>
  )
}
