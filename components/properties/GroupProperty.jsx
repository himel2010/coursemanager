// components/properties/GroupProperty.jsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Users } from "lucide-react"
import axios from "axios"
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"
import { isGroupsEnabled } from "@/lib/events/propertyDefinitions"

/**
 * GroupProperty Component
 *
 * Displays group status and allows group creation/viewing
 * Now integrated as a property renderer component
 *
 * Optimization:
 * 1. Lazy data fetching - only when component mounts
 * 2. Cached API responses in state to prevent re-fetching
 * 3. Conditional rendering to minimize DOM updates
 *
 * Props:
 * - propertyKey: "Groups"
 * - value: "True" | "False"
 * - event: CalendarEvent object
 * - pageProperties: Object with event properties
 * - definition: Property definition from propertyDefinitions
 */
const GroupProperty = ({ propertyKey, value, event, pageProperties }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [hasGroup, setHasGroup] = useState(false)
  const [userGroup, setUserGroup] = useState(null)
  const [pendingInvites, setPendingInvites] = useState([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [hasSentRequest, setHasSentRequest] = useState(false)

  const router = useRouter()

  // Check if groups are enabled for this event
  const groupsEnabled = isGroupsEnabled(event, pageProperties)

  useEffect(() => {
    if (!groupsEnabled || !user) {
      setLoading(false)
      return
    }

    fetchGroupStatus()
  }, [event?.id, groupsEnabled, user])

  const fetchGroupStatus = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `/api/groups/my-group?eventId=${event.id}`,
      )

      if (response.data.hasGroup) {
        setHasGroup(true)
        setUserGroup(response.data.group)

        // Check if user is creator and has sent invites
        if (response.data.isCreator) {
          const hasPending = response.data.group.invites?.length > 0
          setHasSentRequest(hasPending)
        }
      } else {
        setHasGroup(false)
        setPendingInvites(response.data.pendingInvites || [])
      }
    } catch (error) {
      console.error("Error fetching group status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewGroup = () => {
    if (userGroup?.page?.id) {
      router.push(`/group/${userGroup.id}`)
    }
  }

  const handleGroupCreated = () => {
    setShowCreateDialog(false)
    setHasSentRequest(true)
    fetchGroupStatus() // Refresh group status
  }

  // Don't render if groups not enabled
  if (!groupsEnabled || !user) {
    return null
  }

  if (loading) {
    return (
      <div className="grid grid-cols-[1fr_4fr] text-sm items-center">
        <div className="font-medium text-muted-foreground flex items-center gap-2">
          <Users className="h-3.5 w-3.5" />
          {propertyKey}
        </div>
        <div className="flex items-center gap-2">
          <Spinner className="h-3 w-3" />
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Property Display Row */}
      <div className="grid grid-cols-[1fr_4fr] text-sm items-center">
        <div className="font-medium text-muted-foreground flex items-center gap-2">
          <Users className="h-3.5 w-3.5" />
          {propertyKey}
        </div>
        <div>
          {hasGroup ? (
            <Button
              size="sm"
              variant="link"
              onClick={handleViewGroup}
              className="h-auto p-0 text-sm font-normal hover:text-primary"
            >
              View Group
            </Button>
          ) : hasSentRequest ? (
            <span className="text-xs text-muted-foreground">
              Request sent, awaiting responses
            </span>
          ) : (
            <Button
              size="sm"
              variant="link"
              onClick={() => setShowCreateDialog(true)}
              className="h-auto p-0 text-sm font-normal hover:text-primary"
            >
              Create Group
            </Button>
          )}
        </div>
      </div>

      {/* Pending Invites */}
      {!hasGroup && pendingInvites.length > 0 && (
        <div className="col-span-2 p-3 border rounded-md bg-blue-50 dark:bg-blue-950/20 mt-2">
          <div className="text-sm font-medium mb-2">
            Pending Group Invitations ({pendingInvites.length})
          </div>
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <PendingInviteCard
                key={invite.id}
                invite={invite}
                onRespond={fetchGroupStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Group Dialog */}
      {showCreateDialog && (
        <CreateGroupDialog
          event={event}
          pageProperties={pageProperties}
          onClose={() => setShowCreateDialog(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  )
}

export default GroupProperty

/**
 * PendingInviteCard Component
 * Displays a single pending invite with accept/reject actions
 */
function PendingInviteCard({ invite, onRespond }) {
  const [responding, setResponding] = useState(false)

  const handleRespond = async (action) => {
    try {
      setResponding(true)
      await axios.post("/api/groups/invite/respond", {
        inviteId: invite.id,
        action,
      })
      onRespond() // Refresh parent
    } catch (error) {
      console.error("Error responding to invite:", error)
    } finally {
      setResponding(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-2 bg-background rounded border">
      <div className="text-sm">
        <div className="font-medium">{invite.group.name}</div>
        <div className="text-xs text-muted-foreground">
          From: {invite.group.creator.name} ({invite.group.members.length}{" "}
          member
          {invite.group.members.length !== 1 ? "s" : ""})
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => handleRespond("ACCEPT")}
          disabled={responding}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleRespond("REJECT")}
          disabled={responding}
        >
          Decline
        </Button>
      </div>
    </div>
  )
}
