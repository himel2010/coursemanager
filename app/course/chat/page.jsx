"use client"
import { AppSidebar } from "@/components/app-sidebar"
import ChatBox from "@/components/ChatBox"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth/AuthContext"
import { useState } from "react"
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
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          Section
        </header>
        {/* Content */}
        <div className="w-full h-full flex justify-center items-center p-5">
          <div className="h-full w-full">
            {courses?.map((course, idx) => {
              if (idx != isActive) return null

              return (
                <ChatBox
                  userProfile={userProfile}
                  activeCourseID={course.id}
                  key={idx}
                />
              )
            })}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
