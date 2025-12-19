"use client"
import React from "react"
import { Card } from "./ui/card"
import AddEventForm from "./events/AddEventForm"

import EventFilter from "./EventFilter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CalendarViewSidebar = ({ calendar }) => {
  return (
    <Card className="h-screen w-full bg-muted rounded-none px-5 shadow-none border-l">
      <Tabs defaultValue="add" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="add">Add Event</TabsTrigger>
          <TabsTrigger value="filter">Filter</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <AddEventForm calendar={calendar} />
        </TabsContent>
        <TabsContent value="filter">
          <EventFilter />
        </TabsContent>
      </Tabs>
    </Card>
  )
}

export default CalendarViewSidebar
