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
      <CourseDisplay courses={courses} />
      <Card className="card">
        <CardContent className=" flex justify-center">
          <Heart />
        </CardContent>
      </Card>
      <div className="Card flex justify-center p-5 ">asd</div>
    </div>
  )
}

export default UserDashboard
