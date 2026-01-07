import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { name, id, dept, sem, course, accountType } = data

    // Validate required fields
    if (!name || !dept) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    // If student, student ID is required
    if (accountType === "student" && !id) {
      return NextResponse.json({ error: "Student ID required for students" }, { status: 400 })
    }
    const { department, activeSemester, existingEnrollments } =
      await getDeptSem(user, dept)

    const updatedUser = await setUserInfo(user, name, id, department, accountType)

    let response
    if (accountType === "student") {
      response = await updateCourses(
        updatedUser,
        sem,
        course,
        activeSemester,
        existingEnrollments
      )
    } else {
      response = NextResponse.json({ success: true, user: updatedUser, message: "Faculty profile updated" })
    }

    console.log("Back")

    return NextResponse.json(response)
  } catch (error) {
    console.log(error)
    return NextResponse.json(error)
  }
}

async function setUserInfo(user, name, id, department, accountType) {
  const role = accountType === "faculty" ? "FACULTY" : "STUDENT"
  const updatedUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {
      name: name,
      studentId: id || null,
      departmentId: department.id,
      role: role,
    },
    create: {
      id: user.id,
      name: name,
      studentId: id || null,
      departmentId: department.id,
      email: user.email,
      role: role,
    },
  })
  return updatedUser
}

async function getDeptSem(user, dept) {
  const [department, activeSemester, existingEnrollments] = await Promise.all([
    // Query 1: Get department
    prisma.department.findUnique({
      where: { code: dept },
    }),

    // Query 2: Get active semester
    prisma.semester.findFirst({
      where: { isActive: true },
    }),

    // Query 3: Get user's existing enrollments
    prisma.enrollment.findMany({
      where: { userId: user.id },
      select: { courseOfferedId: true },
    }),
  ])
  if (!department) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 })
  }

  if (!activeSemester) {
    return NextResponse.json(
      { error: "No active semester found" },
      { status: 404 }
    )
  }
  return {
    department: department,
    activeSemester: activeSemester,
    existingEnrollments: existingEnrollments,
  }
}

async function updateCourses(
  user,
  semester,
  course,
  activeSemester,
  existingEnrollments
) {
  const normalizedCourses = course.map((c) => ({
    code: c.code,
    section: c.section.padStart(2, "0"),
  }))
  const existingEnrollmentIds = new Set(
    existingEnrollments.map((e) => e.courseOfferedId)
  )

  //gets the all of the courses offered for each of the selected courses in the active semester

  const courseOfferings = await prisma.courseOffered.findMany({
    where: {
      semesterId: activeSemester.id,
      OR: normalizedCourses.map((c) => ({
        course: { code: c.code },
        section: c.section,
      })),
    },
    select: {
      id: true,
      section: true,
      course: {
        select: { code: true },
      },
    },
  })

  const enrollmentsToCreate = []
  for (const offer of courseOfferings) {
    if (existingEnrollmentIds.has(offer.id)) {
      console.log(
        `${user.name} has already enrolled in ${offer.course.code} section - ${offer.section}. Skipping...`
      )
    }
    enrollmentsToCreate.push({
      userId: user.id,
      courseOfferedId: offer.id,
    })
  }

  console.log(enrollmentsToCreate)
  if (enrollmentsToCreate.length > 0) {
    await prisma.enrollment.createMany({
      data: enrollmentsToCreate,
      skipDuplicates: true, // In case of race conditions
    })
  }

  return NextResponse.json({
    success: true,
    user: user,
    message: "Profile updated successfully",
  })
}
