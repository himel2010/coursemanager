"use client"
import React from "react"
import { Card } from "./ui/card"
import AddEventForm from "./events/AddEventForm"

import EventFilter from "./EventFilter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CalendarViewSidebar = ({ calendar, userProfile }) => {
  return (
    <Card className="h-screen w-full bg-muted rounded-none px-5 shadow-none border-l">
      <Tabs
        defaultValue={`${userProfile?.isAdmin ? "add" : "filter"}`}
        className="w-[400px]"
      >
        <TabsList>
          {userProfile?.isAdmin && (
            <TabsTrigger value="add">Add Event</TabsTrigger>
          )}

          <TabsTrigger value="filter">Filter</TabsTrigger>
        </TabsList>
        {userProfile?.isAdmin && (
          <TabsContent value="add">
            <AddEventForm calendar={calendar} />
          </TabsContent>
        )}

        <TabsContent value="filter">
          <EventFilter />
        </TabsContent>
      </Tabs>
    </Card>
  )
}

export default CalendarViewSidebar
