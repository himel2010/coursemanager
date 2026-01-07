"use client"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PopupEditor } from "./PopupPageViewer"
import { useAuth } from "@/lib/auth/AuthContext"
import { getColor } from "@/lib/events/eventType"

const CalendarEvent = ({ event, type }) => {
  const { user } = useAuth()
  const colors = getColor(event.type)

  return (
    <Dialog>
      <DialogTrigger className="flex-1 w-full">
        <div
          className={`${colors.bg} ${colors.border} rounded-md text-foreground px-2 py-0.5 flex flex-row items-center border-l-5 transition-all hover:scale-[1.02] hover:cursor-pointer`}
        >
          <div className="flex items-center gap-0.5 flex-1 min-w-0">
            {event?.includeTime && (
              <span className="font-extralight text-[0.55rem] whitespace-nowrap">
                {event?.date?.format("h:mm A")}
              </span>
            )}
            <span className="font-semibold text-[0.65rem] truncate">
              {event.title}
            </span>
          </div>
          <span className="font-light text-[0.55rem] whitespace-nowrap ml-1">
            {event.courseCode}
          </span>
        </div>
      </DialogTrigger>
      {type != "class" && (
        <DialogContent className="min-w-5xl h-[85vh] max-h-[85vh] flex flex-col py-4 px-6 overflow-hidden">
          <DialogTitle></DialogTitle>
          <div className="flex-1 overflow-auto">
            <PopupEditor
              pageContent={event?.page?.pageContent}
              pageProperties={event?.page?.pageProperties}
              eventTitle={event?.title}
              editable={event?.owner === user.id}
              event={event}
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default CalendarEvent
