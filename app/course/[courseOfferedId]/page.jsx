import { redirect } from "next/navigation"
import CoursePage from "@/components/CoursePage"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

async function getCourseData(courseOfferedId, userId) {
  // Verify user is enrolled in this course
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: userId,
      courseOfferedId: courseOfferedId,
    },
  })

  if (!enrollment) {
    redirect("/user-dashboard")
  }

  // Fetch course offered with all related data
  const courseOffered = await prisma.courseOffered.findUnique({
    where: { id: courseOfferedId },
    include: {
      course: {
        include: {
          department: true,
        },
      },
      semester: true,
      theoryFaculty: true,
      labFaculty1: true,
      labFaculty2: true,
      resources: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!courseOffered) {
    redirect("/user-dashboard")
  }

  // Fetch user's notes for this course
  const userNotes = await prisma.note.findMany({
    where: {
      userId: userId,
      courseId: courseOffered.courseId,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  })

  // Get user info to check if admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  return {
    courseOffered: JSON.parse(JSON.stringify(courseOffered)),
    userNotes: JSON.parse(JSON.stringify(userNotes)),
    isAdmin: user?.isAdmin || false,
  }
}

export default async function CoursePageRoute({ params }) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    redirect("/login")
  }

  const { courseOfferedId } = await params

  const data = await getCourseData(courseOfferedId, authData.user.id)

  return <CoursePage initialData={data} />
}
