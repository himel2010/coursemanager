// components/properties/ReminderProperty.jsx
"use client"

import { Bell } from "lucide-react"
import dayjs from "dayjs"

/**
 * ReminderProperty Component
 * Displays reminder time or "No reminder set"
 *
 * Props:
 * - propertyKey: "Reminder"
 * - value: Date/datetime string or null
 * - event: Full event object
 * - pageProperties: All page properties
 * - definition: Property definition from propertyDefinitions
 */
const ReminderProperty = ({ propertyKey, value }) => {
  const formatReminder = (reminderValue) => {
    if (!reminderValue) return "No reminder set"

    try {
      const date = dayjs(reminderValue)
      if (date.isValid()) {
        return date.format("MMM D, YYYY h:mm A")
      }
      return reminderValue
    } catch {
      return reminderValue
    }
  }

  return (
    <div className="grid grid-cols-[1fr_4fr] text-sm items-center">
      <div className="font-medium text-muted-foreground flex items-center gap-2">
        <Bell className="h-3.5 w-3.5" />
        {propertyKey}
      </div>
      <div className="text-muted-foreground">{formatReminder(value)}</div>
    </div>
  )
}

export default ReminderProperty
