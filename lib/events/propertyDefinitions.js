// lib/events/propertyDefinitions.js

import CourseProperty from "@/components/properties/CourseProperty"
import ReminderProperty from "@/components/properties/ReminderProperty"
import GroupProperty from "@/components/properties/GroupProperty"

/**
 * Central property definitions for calendar events
 * This approach is optimized for:
 * 1. Performance - no database queries needed
 * 2. Type safety - single source of truth
 * 3. Maintainability - easy to modify and extend
 * 4. Dynamic rendering - each property has its own component
 */

export const PROPERTY_TYPES = {
  COURSE: "Course",
  REMINDER: "Reminder",
  GROUPS: "Groups",
}

export const propertyDefinitions = {
  [PROPERTY_TYPES.COURSE]: {
    name: "Course",
    type: "select",
    required: true,
    description: "Associated course for this event",
    renderComponent: CourseProperty,
    validate: (value) => {
      return value && typeof value === "string"
    },
  },
  [PROPERTY_TYPES.REMINDER]: {
    name: "Reminder",
    type: "datetime",
    required: false,
    description: "Set a reminder notification",
    renderComponent: ReminderProperty,
    validate: (value) => {
      return !value || value instanceof Date || typeof value === "string"
    },
  },
  [PROPERTY_TYPES.GROUPS]: {
    name: "Groups",
    type: "boolean",
    required: false,
    description: "Enable group formation for this event",
    renderComponent: GroupProperty,
    validate: (value) => {
      return typeof value === "boolean" || value === "True" || value === "False"
    },
  },
}

/**
 * Helper function to check if groups are enabled
 * Checks both event.group boolean and pageProperties.Groups
 * Uses OR logic for flexibility
 */
export const isGroupsEnabled = (event, pageProperties) => {
  const eventGroupBool = event?.group === true
  const pagePropsGroupBool =
    pageProperties?.Groups === true || pageProperties?.Groups === "True"

  return eventGroupBool || pagePropsGroupBool
}

/**
 * Validate member range for group creation
 * Returns { valid: boolean, error?: string }
 */
export const validateMemberRange = (selectedCount, memberRange) => {
  if (!memberRange || !Array.isArray(memberRange)) {
    return { valid: true } // No range specified
  }

  const [min, max] = memberRange

  // Check maximum (hard limit - prevents submission)
  if (max && selectedCount > max) {
    return {
      valid: false,
      error: `Maximum ${max} members allowed. You selected ${selectedCount}.`,
    }
  }

  // Check minimum (soft warning - allows submission with toast)
  if (min && selectedCount < min) {
    return {
      valid: true,
      warning: `Minimum ${min} members recommended. You selected ${selectedCount}.`,
    }
  }

  return { valid: true }
}

/**
 * Generate auto group name
 * Format: "Group {number} - {courseCode} - {eventType}"
 */
export const generateGroupName = (groupNumber, courseCode, eventType) => {
  return `Group ${groupNumber} - ${courseCode} - ${eventType}`
}

/**
 * Default page properties factory
 * Optimized to avoid recreating objects unnecessarily
 */
export const createDefaultPageProperties = (course, date) => ({
  Course: course?.course?.code || "",
  Date: date?.format("DD/MM") || "",
  Reminder: null,
  Groups: "False",
  member_range: [4, 4], // [min, max]
})
