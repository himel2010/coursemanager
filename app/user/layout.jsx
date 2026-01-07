import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UnifiedSidebar } from "@/components/UnifiedSidebar"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

async function getUserCourses(userId) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      courseOffered: {
        include: {
          course: true,
          semester: true,
        },
      },
    },
  })

  return enrollments.map((enrollment) => enrollment.courseOffered)
}

export default async function UserLayout({ children }) {
  const supabase = await createClient()
  const { data: authData, error } = await supabase.auth.getUser()

  if (error || !authData.user) {
    redirect("/login")
  }

  const courses = await getUserCourses(authData.user.id)

  return (
    <SidebarProvider defaultOpen={true}>
      <UnifiedSidebar courses={JSON.parse(JSON.stringify(courses))} />
      <main className="w-full">
        <div className="sticky top-0 z-10 bg-background border-b p-2">
          <SidebarTrigger />
        </div>
        <div className="w-full h-full">{children}</div>
      </main>
    </SidebarProvider>
  )
}
