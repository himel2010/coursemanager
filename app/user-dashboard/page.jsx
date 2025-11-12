"use client"
import { CourseDisplay } from "@/components/CourseDisplay"
import ProfileHeader from "@/components/profile-header"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/AuthContext"
import React, { useEffect, useState } from "react"

const UserDashboard = () => {
  const { userProfile } = useAuth()
  const [courses, setCourses] = useState()

  const [mount, setMount] = useState(false)

  useEffect(() => {
    if (userProfile?.enrollments) {
      // Extract all courseOffered at once, no spreading needed
      const extractedCourses = userProfile.enrollments.map(
        (enrollment) => enrollment.courseOffered
      )
      setCourses(extractedCourses)
    }
  }, [userProfile])

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
      <CourseDisplay courses={courses} />
    </div>
  )
}

export default UserDashboard
