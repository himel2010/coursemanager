"use client"
import { getMonth } from "@/lib/getTime"
import React from "react"
import { Card } from "./ui/card"
import { Separator } from "./ui/separator"

const MainCalendarView = () => {
  const month = getMonth()
  console.table(month)
  return (
    <div className="w-full border-2">
      {/* Weekday Headers */}
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
      <div className="space-y-2">
        {month.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-2">
            {week.map((day, dayIdx) => {
              const isToday =
                day.format("YYYY-MM-DD") ===
                new Date().toISOString().split("T")[0]

              const isCurrentMonth =
                day.format("M") === new Date().getMonth() + 1

              return (
                <Card
                  key={dayIdx}
                  className={`
                    min-h-[6rem] p-2 cursor-pointer transition-all
                    hover:shadow-md hover:scale-[1.01] hover:bg-destructive/20
                    rounded-sm shadow-none
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
                        ? "bg-[var(--muted)]/50 text-muted-foreground"
                        : ""
                    }
                  `}
                >
                  {/* Day Number */}
                  <div
                    className={`
                    text-sm font-semibold mb-2
                    ${isToday ? "text-blue-700" : ""}
                  `}
                  >
                    {" "}
                    {day.format("D") === "1" ? (
                      <strong>{day.format("MMM D")}</strong>
                    ) : (
                      day.format("D")
                    )}
                  </div>

                  {/* Events will go here */}
                  <div className="space-y-1">{/* Event chips */}</div>
                </Card>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MainCalendarView
