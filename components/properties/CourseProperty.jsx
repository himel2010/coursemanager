// components/properties/CourseProperty.jsx
"use client"

import { BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

/**
 * CourseProperty Component
 * Displays course code with clickable link to course page
 *
 * Props:
 * - propertyKey: "Course"
 * - value: Course code (e.g., "CSE220")
 * - event: Full event object
 * - pageProperties: All page properties
 * - definition: Property definition from propertyDefinitions
 */
const CourseProperty = ({ propertyKey, value, event }) => {
  const router = useRouter()

  const handleClick = () => {
    if (event?.courseOffered?.id) {
      router.push(`/course/${event.courseOffered.id}`)
    }
  }

  return (
    <div className="grid grid-cols-[1fr_4fr] text-sm items-center">
      <div className="font-medium text-muted-foreground flex items-center gap-2">
        <BookOpen className="h-3.5 w-3.5" />
        {propertyKey}
      </div>
      <div
        onClick={handleClick}
        className={`${
          event?.courseOffered?.id
            ? "cursor-pointer hover:text-primary underline"
            : ""
        }`}
      >
        {value || "—"}
      </div>
    </div>
  )
}

export default CourseProperty
