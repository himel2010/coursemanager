import { prisma } from "@/lib/prisma"
import fs from "fs"
import path from "path"
import EvaluationForm from "@/components/EvaluationForm"
import EvaluationList from "@/components/EvaluationList"

async function getCourses() {
    try {
        const offerings = await prisma.courseOffered.findMany({ include: { course: true }, orderBy: { section: "asc" } })
        return offerings.map(o => ({ id: o.id, section: o.section, course: { code: o.course.code, title: o.course.title } }))
    } catch (e) {
        return []
    }
}

function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(Boolean)
    if (lines.length === 0) return []
    const headers = lines[0].split(',').map(h => h.trim())
    return lines.slice(1).map(line => {
        const cols = line.split(',')
        const obj = {}
        for (let i = 0; i < headers.length; i++) obj[headers[i]] = (cols[i] || "").trim()
        return obj
    })
}

export default async function Page() {
    const courses = await getCourses()
    // read ThesisFaculty.csv from public
    let faculty = []
    try {
        const csvPath = path.resolve(process.cwd(), "public", "ThesisFaculty.csv")
        const txt = fs.readFileSync(csvPath, "utf8")
        const raw = parseCSV(txt)
        // normalize faculty rows to have a `name` field for display
        faculty = raw.map(r => ({
            name: r.Name || r.name || r["Full Name"] || r["full name"] || r.initial || r.Initial || r.email || r.Email || "",
            email: r.email || r.Email || "",
            initial: r.initial || r.Initial || "",
            raw: r,
        }))
    } catch (e) {
        faculty = []
    }

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-semibold">Course & Faculty Evaluations</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <EvaluationForm courses={courses} faculty={faculty} />
                </div>
                <div>
                    <EvaluationList />
                </div>
            </div>
        </div>
    )
}
