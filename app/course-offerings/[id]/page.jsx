import { prisma } from "@/lib/prisma"

const getOffering = async (id) => {
    const o = await prisma.courseOffered.findUnique({
        where: { id },
        include: { course: true, semester: true, theoryFaculty: true, labFaculty1: true, labFaculty2: true },
    })
    if (!o) return null
    return {
        id: o.id,
        section: o.section,
        course: { code: o.course.code, title: o.course.title },
        semester: { season: o.semester.season, year: o.semester.year },
        faculty: [o.theoryFaculty, o.labFaculty1, o.labFaculty2].filter(Boolean).map((f) => ({ id: f.id, name: f.name, initial: f.initial })),
    }
}

export default async function Page({ params }) {
    const data = await getOffering(params.id)
    if (!data) return <main className="p-6">Offering not found.</main>

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-2">{data.course.code} — Section {data.section}</h1>
            <p className="text-sm text-muted-foreground">{data.course.title}</p>
            <p className="mt-4">Semester: {data.semester.season} {data.semester.year}</p>
            <p className="mt-6 text-sm">ID: {data.id}</p>
            {/* Feedback feature removed */}
        </main>
    )
}
