import SignUpComponent from "@/components/SignUpComponent"
import { prisma } from "@/lib/prisma"

const getCourses = async () => {
  try {
    const data = await prisma.courseOffered.findMany({
      select: {
        section: true,
        theoryFaculty: {
          select: {
            initial: true,
          },
        },
        course: {
          select: { code: true },
        },
      },
    })

    return data
  } catch (error) {
    throw error
  }
}

const page = async () => {
  const courses = await getCourses()
  return (
    <div>
      <SignUpComponent courseInfo={courses} />
    </div>
  )
}

export default page
