"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AddResourceDialog } from "@/components/AddResourceDialog"
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Plus,
  ExternalLink,
  FileText,
  Trash2,
  Youtube,
  File,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import axios from "axios"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Helper function to detect link type and return appropriate icon
function getLinkIcon(url) {
  const lowerUrl = url.toLowerCase()

  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    return <Youtube className="h-4 w-4 text-red-600" />
  }
  if (lowerUrl.includes("drive.google.com")) {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M8.5 3L3 12L8.5 21H15.5L21 12L15.5 3H8.5Z" fill="#4285F4" />
        <path d="M15.5 3L21 12H12L6.5 3H15.5Z" fill="#EA4335" />
        <path d="M8.5 21L3 12H12L17.5 21H8.5Z" fill="#34A853" />
        <path d="M12 12L15.5 3H8.5L12 12Z" fill="#FBBC04" />
      </svg>
    )
  }
  if (lowerUrl.includes("docs.google.com")) {
    return <File className="h-4 w-4 text-blue-600" />
  }
  if (lowerUrl.includes("slack.com")) {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2v2zm1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5z"
          fill="#E01E5A"
        />
        <path
          d="M9 6a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2H9zm0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5z"
          fill="#36C5F0"
        />
        <path
          d="M18 9a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2V9zm-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5z"
          fill="#2EB67D"
        />
        <path
          d="M15 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2zm0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-5z"
          fill="#ECB22E"
        />
      </svg>
    )
  }

  return <ExternalLink className="h-4 w-4" />
}

export default function CoursePage({ initialData }) {
  const { courseOffered, userNotes, isAdmin } = initialData
  const [resources, setResources] = useState(courseOffered.resources)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState(null)

  const handleResourceAdded = (newResource) => {
    setResources([newResource, ...resources])
  }

  const handleDeleteClick = (resource) => {
    setResourceToDelete(resource)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return

    try {
      await axios.delete(
        `/api/course/${courseOffered.id}/resources?resourceId=${resourceToDelete.id}`,
      )
      setResources(resources.filter((r) => r.id !== resourceToDelete.id))
      toast.success("Resource deleted successfully")
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast.error("Failed to delete resource")
    } finally {
      setDeleteDialogOpen(false)
      setResourceToDelete(null)
    }
  }

  const theory = courseOffered.classSchedule?.theory
  const lab = courseOffered.classSchedule?.lab

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Course Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl font-bold">
                  {courseOffered.course.code}
                </CardTitle>
                <Badge variant="secondary" className="text-sm">
                  Section {courseOffered.section}
                </Badge>
              </div>
              <CardDescription className="text-base">
                {courseOffered.course.title}
              </CardDescription>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{courseOffered.course.credits} Credits</span>
                <Separator orientation="vertical" className="h-4" />
                <span>
                  {courseOffered.semester.season} {courseOffered.semester.year}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theory Faculty */}
          {courseOffered.theoryFaculty && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Theory Faculty
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {courseOffered.theoryFaculty.name}
                  </span>
                  <Badge variant="outline">
                    {courseOffered.theoryFaculty.initial}
                  </Badge>
                </div>
                {courseOffered.theoryFaculty.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${courseOffered.theoryFaculty.email}`}
                      className="hover:underline"
                    >
                      {courseOffered.theoryFaculty.email}
                    </a>
                  </div>
                )}
                {courseOffered.theoryFaculty.room && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Room {courseOffered.theoryFaculty.room}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lab Faculty */}
          {(courseOffered.labFaculty1 || courseOffered.labFaculty2) &&
            (courseOffered.course.code != "CSE470") && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Lab Faculty
                </h3>
                <div className="space-y-3">
                  {courseOffered.labFaculty1 && (
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {courseOffered.labFaculty1.name}
                        </span>
                        <Badge variant="outline">
                          {courseOffered.labFaculty1.initial}
                        </Badge>
                      </div>
                      {courseOffered.labFaculty1.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <a
                            href={`mailto:${courseOffered.labFaculty1.email}`}
                            className="hover:underline"
                          >
                            {courseOffered.labFaculty1.email}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {courseOffered.labFaculty2 && (
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {courseOffered.labFaculty2.name}
                        </span>
                        <Badge variant="outline">
                          {courseOffered.labFaculty2.initial}
                        </Badge>
                      </div>
                      {courseOffered.labFaculty2.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <a
                            href={`mailto:${courseOffered.labFaculty2.email}`}
                            className="hover:underline"
                          >
                            {courseOffered.labFaculty2.email}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>,
            )}

          <Separator />

          {/* Class Schedule */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Theory Schedule */}
            {theory && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Theory Classes
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {theory.day1}
                      {theory.day2 ? ` & ${theory.day2}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{theory.startTime}</span>
                  </div>
                  {theory.room && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Room {theory.room}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lab Schedule */}
            {lab && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Lab Classes
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{lab.day}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{lab.startTime}</span>
                  </div>
                  {lab.room && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Room {lab.room}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resources Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Resources</CardTitle>
              <CardDescription>
                Materials and links for this course
              </CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowAddDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No resources available yet</p>
              {isAdmin && (
                <p className="text-sm mt-2">
                  Click "Add Resource" to add the first resource
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getLinkIcon(resource.url)}
                    <div className="flex-1 min-w-0">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline truncate block"
                      >
                        {resource.title}
                      </a>
                      <p className="text-xs text-muted-foreground truncate">
                        {resource.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(resource)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Notes</CardTitle>
          <CardDescription>
            Notes you've created for this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>You haven't created any notes for this course yet</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/notes">Create a note</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {userNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Resource Dialog */}
      <AddResourceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        courseOfferedId={courseOffered.id}
        onResourceAdded={handleResourceAdded}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{resourceToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResourceToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
