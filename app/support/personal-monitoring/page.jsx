import fs from "fs";
import path from "path";
import PersonalMonitoring from "../../../components/PersonalMonitoring";

export default async function PersonalMonitoringPage() {
    const facultyCsvPath = path.join(process.cwd(), "2025 Fall CSE Routine _ Consultation v1.0 [forStudent] - FacultyList.csv");
    let faculty = [];
    try {
        const content = fs.readFileSync(facultyCsvPath, "utf8");
        const lines = content.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(",");
            if (cols.length < 7) continue;
            const initial = (cols[1] || "").trim();
            const name = (cols[2] || "").trim();
            const designation = (cols[3] || "").trim();
            const email = (cols[6] || "").trim().toLowerCase();
            if (!initial || !name) continue;
            faculty.push({ id: initial || email || name, name, designation, email });
        }
    } catch (err) {
        // ignore
    }

    return <PersonalMonitoring facultyList={faculty} />;
}
