import MainCalendarView from "@/components/MainCalendarView"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UserSidebar } from "@/components/UserSidebar"
import React from "react"

const page = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <UserSidebar />
      <main className="w-full">
        <SidebarTrigger collapsed={true} />
        <MainCalendarView />
      </main>
    </SidebarProvider>
  )
}

export default page
