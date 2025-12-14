import React from "react"
import UserDashboard from "./UserDashboard"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UserSidebar } from "@/components/UserSidebar"
const page = () => {
  return (
    <SidebarProvider>
      <UserSidebar />
      <main className="w-full p-2">
        <SidebarTrigger />
        <UserDashboard />
      </main>
    </SidebarProvider>
  )
}

export default page
