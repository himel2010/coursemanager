"use client"
import { useCalendarStore } from "@/lib/store"
import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Button } from "./ui/button"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import dayjs from "dayjs"

const CalendarNav = ({ upcoming }) => {
  const currentView = useCalendarStore((state) => state.currentView)
  const setView = useCalendarStore((state) => state.setView)
  const monthIdx = useCalendarStore((state) => state.monthIdx)
  const setMonth = useCalendarStore((state) => state.setMonth)
  const selectedDate = useCalendarStore((state) => state.selectedDate)
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek)
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek)
  const goToThisWeek = useCalendarStore((state) => state.goToThisWeek)

  // Get the week range for display
  const weekStart = selectedDate.startOf("week")
  const weekEnd = selectedDate.endOf("week")

  const handleToday = () => {
    if (currentView === "WEEK") {
      goToThisWeek()
    } else {
      setMonth(dayjs().month())
    }
  }

  const handlePrevious = () => {
    if (currentView === "WEEK") {
      goToPreviousWeek()
    } else {
      setMonth(monthIdx - 1)
    }
  }

  const handleNext = () => {
    if (currentView === "WEEK") {
      goToNextWeek()
    } else {
      setMonth(monthIdx + 1)
    }
  }

  return (
    <div className="p-2 flex justify-end px-5 items-center">
      {upcoming ? (
        <div className="font-medium text-xl text-muted-foreground">
          This Week
        </div>
      ) : (
        <div className="min-w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <ArrowLeftIcon
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={handlePrevious}
            />
            <ArrowRightIcon
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={handleNext}
            />

            {/* Show current month/week info */}
            <div
              className="text-lg font-semibold text-muted-foreground ml-2"
              suppressHydrationWarning
            >
              {currentView === "WEEK"
                ? `${weekStart.format("MMM D")} - ${weekEnd.format(
                    "MMM D, YYYY"
                  )}`
                : dayjs().month(monthIdx).format("MMMM YYYY")}
            </div>
          </div>

          <Select
            onValueChange={(v) => setView(v)}
            placeholder="Month"
            value={currentView}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTH">Month</SelectItem>
              <SelectItem value="WEEK">Week</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

export default CalendarNav
