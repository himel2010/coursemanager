"use client"

import { useAuth } from "@/lib/auth/AuthContext"

import React, { useEffect, useState } from "react"
import UserDashboard from "./UserDashboard"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UserSidebar } from "@/components/UserSidebar"

const page = () => {
  const { userProfile } = useAuth()

  const [mount, setMount] = useState(false)

  useEffect(() => {
    setMount(true)
  }, [])

  if (!mount) {
    return null
  }
  if (!userProfile) return null
  return (
    <SidebarProvider defaultOpen={true}>
      <UserSidebar />
      <main className="w-full">
        <SidebarTrigger />
        <div className="w-full h-full p-5 flex flex-col justify gap-5">
          <UserDashboard />
        </div>
      </main>
    </SidebarProvider>
  )
}

export default page
