"use client"
import { CourseDisplay } from "@/components/CourseDisplay"
import { EventPageEditor } from "@/components/EventPageEditor"
import MainCalendarView from "@/components/MainCalendarView"
import ProfileHeader from "@/components/profile-header"
import { Button } from "@/components/ui/button"

import { useAuth } from "@/lib/auth/AuthContext"

import { redirect } from "next/navigation"
import React, { useEffect, useState } from "react"

const UserDashboard = () => {
  const { userProfile, courses } = useAuth()
  // const [courses, setCourses] = useState()

  const [mount, setMount] = useState(false)

  useEffect(() => {
    setMount(true)
  }, [])

  if (!mount) {
    return null
  }
  if (!userProfile) return null
  return (
    <div className="w-full h-full p-5 flex flex-col justify gap-5">
      <ProfileHeader userProfile={userProfile} />
      <Button
        variant="destructive"
        size="sm"
        onClick={() => redirect("/course/chat")}
      >
        Go to Chat
      </Button>
      <MainCalendarView />
      <CourseDisplay courses={courses} />
      <EventPageEditor />
      <Button variant={"outline"}>asd</Button>
    </div>
  )
}

export default UserDashboard
