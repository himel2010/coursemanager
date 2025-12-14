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

const CalendarNav = ({ upcoming }) => {
  const currentView = useCalendarStore((state) => state.currentView)
  const setView = useCalendarStore((state) => state.setView)

  return (
    <div className="p-2 flex justify-end px-5">
      {upcoming ? (
        <div className="font-medium text-xl text-muted-foreground">
          {" "}
          This Week{" "}
        </div>
      ) : (
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
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

export default CalendarNav
