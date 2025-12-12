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

const CalendarEvent = ({ event }) => {
  const getColor = (e) => {
    switch (e) {
      case "QUIZ":
        return {
          bg: "bg-chart-1/50",
          border: "border-[var(--chart-1)]",
        }
      case "MID":
        return {
          bg: "bg-chart-7/50",
          border: "border-[var(--chart-7)]",
        }
      case "GENERAL":
        return {
          bg: "bg-chart-6/50",
          border: "border-[var(--chart-6)]",
        }
      case "ASSIGNMENT":
        return {
          bg: "bg-chart-2/40",
          border: "border-[var(--chart-2)]",
        }
      default:
        return {
          bg: "bg-red-500/50",
          border: "border-red-500",
        }
    }
  }
  const colors = getColor(event.type)

  return (
    <Dialog>
      <DialogTrigger className="flex-1 w-full">
        <div
          className={`${colors.bg} ${colors.border} rounded-md flex-1 text-xs text-foreground px-2 flex flex-row justify-start border-l-5 transition-all hover:scale-[1.02] hover:cursor-pointer`}
        >
          <p className="font-light ">
            {event.courseCode}{" "}
            <strong className="font-bold">{event.title}</strong>
          </p>
        </div>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-5xl h-[85vh] max-h-[85vh] flex flex-col py-4 px-6 overflow-hidden">
        <DialogTitle></DialogTitle>
        <div className="flex-1 overflow-auto">
          <PopupEditor pageContent={event.page.pageContent} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CalendarEvent
