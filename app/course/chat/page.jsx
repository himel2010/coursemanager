"use client"
import { AppSidebar } from "@/components/app-sidebar"
import ChatBox from "@/components/ChatBox"
import { ThemeChange } from "@/components/ThemeChange"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth/AuthContext"
import { redirect } from "next/navigation"
import { useState } from "react"

const messageCache = new Map()

export default function Page() {
  const { userProfile, courses } = useAuth()
  const [isActive, setIsActive] = useState(0)

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "450px",
      }}
    >
      <AppSidebar courses={courses} setIsActive={setIsActive} />
      <SidebarInset className="h-screen overflow-hidden">
        <header className="bg-background sticky top-0 flex flex-row shrink-0 items-center justify-between gap-2 border-b p-4">
          <span className="flex flex-row items-center">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />

            {courses?.length > 0 && courses[isActive]?.course.code}
          </span>
          <span className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => redirect("/user-dashboard")}
            >
              Return to Dashboard
            </Button>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <ThemeChange />
          </span>
        </header>
        {/* Content */}
        <div className="flex-1 w-full p-5 min-h-0">
          {courses?.length > 0 && (
            <ChatBox
              userProfile={userProfile}
              activeCourseID={courses[isActive]?.id}
              messageCache={messageCache}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
