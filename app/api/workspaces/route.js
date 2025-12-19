import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const coursesOffered = await prisma.courseOffered.findMany({
      include: {
        course: true,
        semester: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const workspaces = coursesOffered.map((co) => ({
      id: co.id,
      courseCode: co.course.code,
      section: co.section,
      semesterSeason: co.semester.season,
      semesterYear: co.semester.year,
    }))

    return new Response(JSON.stringify({ workspaces }), { status: 200 })
  } catch (err) {
    console.error('GET /api/workspaces error', err)
    return new Response(JSON.stringify({ error: 'Failed to load workspaces' }), { status: 500 })
  }
}
