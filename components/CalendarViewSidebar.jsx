"use client"
import React from "react"
import { Card } from "./ui/card"
import AddEventForm from "./events/AddEventForm"

import EventFilter from "./EventFilter"

const CalendarViewSidebar = ({ calendar }) => {
  return (
    <Card className="h-full w-full bg-muted rounded-none px-5 shadow-none border-l overflow-y-auto">
      <AddEventForm calendar={calendar} />
      <EventFilter />
    </Card>
  )
}

export default CalendarViewSidebar
