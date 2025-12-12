import React from "react"
import { Card } from "./ui/card"
import AddEventForm from "./events/AddEventForm"

const CalendarViewSidebar = ({ calendar }) => {
  return (
    <Card className="h-full w-full bg-muted rounded-none px-5 shadow-none border-l overflow-y-auto">
      <AddEventForm calendar={calendar} />
    </Card>
  )
}

export default CalendarViewSidebar
