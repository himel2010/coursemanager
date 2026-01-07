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
  const [activeChatId, setActiveChatId] = useState(null)
  const [chatType, setChatType] = useState("course")
  const [displayName, setDisplayName] = useState("")

  // Initialize with first course
  useState(() => {
    if (courses?.length > 0 && !activeChatId) {
      setActiveChatId(courses[0].id)
      setDisplayName(courses[0].course.code)
      setChatType("course")
    }
  }, [courses])

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "450px",
      }}
    >
      <AppSidebar
        courses={courses}
        setActiveChatId={setActiveChatId}
        setChatType={setChatType}
        setDisplayName={setDisplayName}
      />
      <SidebarInset className="h-screen overflow-hidden">
        <header className="bg-background sticky top-0 flex flex-row shrink-0 items-center justify-between gap-2 border-b p-4">
          <span className="flex flex-row items-center">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {displayName}
          </span>
          <span className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => redirect("/user/dashboard")}
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
          {activeChatId && (
            <ChatBox
              userProfile={userProfile}
              activeCourseID={activeChatId}
              messageCache={messageCache}
              chatType={chatType}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
