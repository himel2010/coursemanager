import { prisma } from "@/lib/prisma"
import CourseOfferingsList from "@/components/CourseOfferingsList"

const getOfferings = async () => {
    const offerings = await prisma.courseOffered.findMany({
        include: {
            course: true,
            semester: true,
        },
        orderBy: { section: "asc" },
    })
    // convert objects to plain JSON-serializable values
    return offerings.map((o) => ({
        id: o.id,
        section: o.section,
        course: { code: o.course.code, title: o.course.title },
        semester: { season: o.semester.season, year: o.semester.year },
    }))
}

export default async function Page() {
    const data = await getOfferings()

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Course Offerings</h1>
            {/* Client component handles booking interactions */}
            <CourseOfferingsList initial={data} />
        </main>
    )
}
