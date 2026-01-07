import fs from "fs"
import path from "path"

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const emailQuery = (searchParams.get("email") || "").trim().toLowerCase()

        const facultyCsvPath = path.join(
            process.cwd(),
            "2025 Fall CSE Routine _ Consultation v1.0 [forStudent] - FacultyList.csv"
        )
        const facultyContent = fs.readFileSync(facultyCsvPath, "utf8")
        const facultyLines = facultyContent.split(/\r?\n/)

        // build a map from initial -> faculty record and email -> faculty record
        const facultyByInitial = {}
        const facultyByEmail = {}
        for (let i = 0; i < facultyLines.length; i++) {
            const line = facultyLines[i].trim()
            if (!line) continue
            const cols = line.split(",")
            if (cols.length < 7) continue
            const initial = (cols[1] || "").trim()
            const name = (cols[2] || "").trim()
            const designation = (cols[3] || "").trim()
            const room = (cols[5] || "").trim()
            const email = (cols[6] || "").trim().toLowerCase()
            if (initial) facultyByInitial[initial] = { initial, name, designation, room, email }
            if (email) facultyByEmail[email] = { initial, name, designation, room, email }
        }

        // direct email lookup in FacultyList
        if (facultyByEmail[emailQuery]) {
            return new Response(JSON.stringify({ found: true, ...facultyByEmail[emailQuery] }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        }

        // fall back: search the Tabular CSV for the email and map the initial back to FacultyList
        const tabularPath = path.join(
            process.cwd(),
            "2025 Fall CSE Routine _ Consultation v1.0 [forStudent] - Tabular.csv"
        )
        if (fs.existsSync(tabularPath)) {
            const tabContent = fs.readFileSync(tabularPath, "utf8")
            const tabLines = tabContent.split(/\r?\n/)
            for (let i = 0; i < tabLines.length; i++) {
                const line = tabLines[i].trim()
                if (!line) continue
                const cols = line.split(",")
                for (let j = 0; j < cols.length; j++) {
                    const cell = (cols[j] || "").trim().toLowerCase()
                    if (!cell) continue
                    if (cell === emailQuery) {
                        // Theory Initial is expected in column index 3 (zero-based)
                        const theoryInitial = (cols[3] || "").trim()
                        if (theoryInitial && facultyByInitial[theoryInitial]) {
                            return new Response(JSON.stringify({ found: true, ...facultyByInitial[theoryInitial] }), {
                                status: 200,
                                headers: { "content-type": "application/json" },
                            })
                        }
                        // if no mapping, still return found with email only
                        return new Response(JSON.stringify({ found: true, email: emailQuery }), {
                            status: 200,
                            headers: { "content-type": "application/json" },
                        })
                    }
                }
            }
        }

        return new Response(JSON.stringify({ found: false }), {
            status: 200,
            headers: { "content-type": "application/json" },
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
    }
}
