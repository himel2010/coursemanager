"use client"

import { useState, useEffect } from "react"
import { DocumentList } from "@/components/DocumentList"
import { Spinner } from "@/components/ui/spinner"

export default function NotesPage() {
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get the authenticated user ID from the backend
    const fetchUserId = async () => {
      try {
        const response = await fetch("/api/user/me")
        if (response.ok) {
          const data = await response.json()
          setUserId(data.id)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserId()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>
          <Spinner />
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container p-8">
        <DocumentList userId={userId} />
      </main>
    </div>
  )
}
