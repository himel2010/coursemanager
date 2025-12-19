"use client"
import { CourseDisplay } from "@/components/CourseDisplay"
import ProfileHeader from "@/components/profile-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/AuthContext"
import { Heart } from "lucide-react"
import { redirect } from "next/navigation"
import React, { useEffect, useState } from "react"

const UserDashboard = () => {
  const { userProfile, courses } = useAuth() //getti gng courses from context
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
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => redirect("/course/chat")}
        >
          Go to Chat
        </Button>
        <Button
          size="sm"
          onClick={() => redirect("/research")}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Research Opportunities & Groups
        </Button>
        {userProfile?.isFinalYear && (
          <Button
            size="sm"
            onClick={() => redirect("/research")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            View Thesis & Internship Opportunities
          </Button>
        )}
      </div>
      <CourseDisplay courses={courses} />
    </div>
  )
}

export default UserDashboard
