"use client"
import { CourseDisplay } from "@/components/CourseDisplay"
import ProfileHeader from "@/components/profile-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/AuthContext"
import { Heart } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"
import React, { useEffect, useState } from "react"

const UserDashboard = () => {
  const { userProfile, courses, loading, user } = useAuth()
  const [mount, setMount] = useState(false)

  useEffect(() => {
    setMount(true)
  }, [])

  if (!mount) {
    return null
  }

  if (!user) {
    return (
      <div className="w-full h-full p-5 flex flex-col gap-5 items-center justify-center">
        <p className="text-lg">Please log in first</p>
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    )
  }

  if (loading || !userProfile) {
    return <div className="w-full h-full p-5">Loading profile...</div>
  }

  return (
    <div className="w-full h-full p-5 flex flex-col gap-5">
      <ProfileHeader userProfile={userProfile} />
      <Button
        variant="destructive"
        size="sm"
        onClick={() => redirect("/course/chat")}
      >
        Go to Chat
      </Button>
      <CourseDisplay courses={courses} />
    </div>
  )
}

export default UserDashboard
