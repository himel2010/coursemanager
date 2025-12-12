import dayjs from "dayjs"
import { Card } from "./ui/card"
import CalendarEvent from "./CalendarEvent"
import { useCalendarStore } from "@/lib/store"

const MonthView = ({ month, events }) => {
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate)
  const selectedDate = useCalendarStore((state) => state.selectedDate)

  return (
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
            />
          ))}
        </div>
      ))}
    </div>
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
}) => {
  const today = dayjs()

  const isToday = day.format("YYYY-MM-DD") === today.format("YYYY-MM-DD")

  const isCurrentMonth =
    day.format("M") === (new Date().getMonth() + 1).toString()

  const filtered_events = events.filter(
    (e) => e.date.format("DD-MM-YYYY") === day.format("DD-MM-YYYY")
  )

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
      <div className="flex flex-col gap-0]">
        {filtered_events.map((e, i) => (
          <div key={i}>
            <CalendarEvent event={e} day={day} />
          </div>
        ))}
      </div>

      {/* Events will go here */}
    </Card>
  )
}
