import { eventTypes, getColor } from "@/lib/events/eventType"
import { useCalendarStore } from "@/lib/store"
import { Square, CheckSquare } from "lucide-react"
import React, { useState } from "react"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"

const EventFilter = () => {
  const filter = useCalendarStore((state) => state.filter)
  const setFilter = useCalendarStore((state) => state.setFilter)
  const [events, setEvents] = useState(eventTypes)

  const toggleFilter = (eventType) => {
    if (filter?.includes(eventType)) {
      // Remove from filter (make it filled/unfiltered)
      setFilter(filter.filter((f) => f !== eventType))
    } else {
      // Add to filter (make it unfilled/filtered)
      setFilter([...(filter || []), eventType])
    }
  }

  return (
    <div className="flex flex-col gap-2 justify-start items-left p-5">
      <Label>Event Types</Label>
      <Separator />
      {events.map((e) => {
        const color = getColor(e)
        const isFiltered = filter?.includes(e)

        return (
          <div
            key={e}
            onClick={() => toggleFilter(e)}
            className={` flex items-center gap-2 px-3 py-2 rounded hover:cursor-pointer`}
          >
            <div className="text-xs">
              {isFiltered ? (
                <Square size={16} color={`var(--${color.color})`} />
              ) : (
                <CheckSquare size={16} color={`var(--${color.color})`} />
              )}
            </div>
            <span className="text-sm">{e}</span>
          </div>
        )
      })}
    </div>
  )
}

export default EventFilter
