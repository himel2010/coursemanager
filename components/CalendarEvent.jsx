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
          className={`${colors.bg} ${colors.border} rounded-md flex-1  text-xs text-foreground px-2 flex flex-row  justify-start items-center border-l-5 transition-all hover:scale-[1.02] hover:cursor-pointer`}
        >
          <div className="flex flex-col items-start w-full justify-center">
            <p className="font-light text-[0.6rem] ">{event.courseCode}</p>
            <strong className="font-bold">{event.title}</strong>
          </div>
          {event?.includeTime && (
            <div className="text-[0.6rem] items-center min-h-full ">
              {event?.date?.format("hh:mm A")}
            </div>
          )}
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
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default CalendarEvent
