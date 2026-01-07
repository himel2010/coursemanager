"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Calendar,
  MessageCircleQuestionMark,
  NotebookPen,
  User,
  MessageSquare,
  BookOpen,
} from "lucide-react"
import { usePathname } from "next/navigation"

export function UnifiedSidebar({ courses }) {
  const pathname = usePathname()

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/user/dashboard",
      icon: User,
    },
    {
      title: "Calendar",
      href: "/user/calendar",
      icon: Calendar,
    },
    {
      title: "Notes",
      href: "/user/notes",
      icon: NotebookPen,
    },
    {
      title: "Help",
      href: "/user/help",
      icon: MessageCircleQuestionMark,
    },
    {
      title: "Chat",
      href: "/course/chat",
      icon: MessageSquare,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">Course Manager</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <a href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Courses */}
        {courses && courses.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Your Courses</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {courses.map((course) => {
                  const courseHref = `/user/course/${course.id}`
                  const isActive = pathname === courseHref
                  return (
                    <SidebarMenuItem key={course.id}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a href={courseHref}>
                          <BookOpen />
                          <span className="truncate">
                            {course.course.code} - {course.section}
                          </span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
