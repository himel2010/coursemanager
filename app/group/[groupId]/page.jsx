// app/group/[groupId]/page.jsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"

/**
 * Group Page Component
 * Displays group information and members
 * Placeholder for future BlockNote editor integration
 *
 * Optimization:
 * 1. Single API call to fetch all group data
 * 2. Client-side routing for instant navigation
 * 3. Conditional rendering based on creator status
 */
export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroup()
  }, [params.groupId])

  const fetchGroup = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/groups/${params.groupId}`)
      setGroup(response.data.group)
    } catch (error) {
      console.error("Error fetching group:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Group not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const isCreator = group.creatorId === user?.id

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Group Info Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            <p className="text-muted-foreground">
              {group.members.length} member
              {group.members.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Members List */}
        <div className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">Members</h2>
          <div className="space-y-2">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div>
                  <div className="font-medium">{member.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.user.email} • {member.user.studentId}
                  </div>
                </div>
                {member.userId === group.creatorId && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Creator
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invites (Creator only) */}
        {isCreator && group.invites && group.invites.length > 0 && (
          <div className="space-y-3 mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold">Pending Invitations</h2>
            <div className="space-y-2">
              {group.invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{invite.invitee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {invite.invitee.email}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Pending...
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Placeholder for future features */}
      <Card className="p-6 text-center text-muted-foreground">
        <p>Group collaboration features coming soon...</p>
        <p className="text-sm mt-2">
          (BlockNote editor, file sharing, chat, etc.)
        </p>
      </Card>
    </div>
  )
}
