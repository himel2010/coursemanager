"use client"

import { useAuth } from "@/lib/auth/AuthContext"
import { useEffect, useState } from "react"
import UserDashboard from "./UserDashboard"

export default function DashboardPage() {
  const { userProfile } = useAuth()
  const [mount, setMount] = useState(false)

  useEffect(() => {
    setMount(true)
  }, [])

  if (!mount) {
    return null
  }

  if (!userProfile) return null

  return <UserDashboard />
}
