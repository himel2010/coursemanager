import MainCalendarView from "@/components/MainCalendarView"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UserSidebar } from "@/components/UserSidebar"
import React from "react"

const page = () => {
  return (
    <main className="w-full">
      <SidebarTrigger />
      <MainCalendarView />
    </main>
  )
}

export default page
