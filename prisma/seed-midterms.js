import fs from "fs"
import pdf from "pdf-parse"
import dayjs from "dayjs"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const PDF_PATH = "./Mid Term Schedule Fall 2025-Final version.pdf"

async function parsePDF() {
  const buffer = fs.readFileSync(PDF_PATH)
  const data = await pdf(buffer)
  const lines = data.text.split("\n")

  const results = []

  for (const line of lines) {
    const cleaned = line.replace(/\s+/g, " ").trim()

    // Regex EXACTLY for your format
    const match = cleaned.match(
      /^(\d+)\s+([A-Z]{3}\d{3})\s+(\w+)\s+(\d{2}-[A-Za-z]{3}-\d{2})\s+(\d{1,2}:\d{2})\s+(AM|PM)\s+(\d{1,2}:\d{2})\s+(AM|PM)\s+([A-Z0-9-]+)\s+([A-Z]+)$/,
    )

    if (!match) continue

    const [
      _,
      sl,
      courseCode,
      section,
      dateStr,
      startTime,
      startMeridiem,
      endTime,
      endMeridiem,
      room,
      dept,
    ] = match

    const midtermDate = dayjs(dateStr, "DD-MMM-YY").toDate()
    const midtermTime = `${startTime} ${startMeridiem} - ${endTime} ${endMeridiem}`

    results.push({
      courseCode,
      section,
      midtermDate,
      midtermTime,
      midtermRoom: room,
    })
  }

  return results
}

async function updateCourseOffered(midterms) {
  for (const m of midterms) {
    const course = await prisma.course.findUnique({
      where: { code: m.courseCode },
    })

    if (!course) {
      console.warn(`❌ Course not found: ${m.courseCode}`)
      continue
    }

    const result = await prisma.courseOffered.updateMany({
      where: {
        courseId: course.id,
        section: m.section,
      },
      data: {
        midtermDate: m.midtermDate,
        midtermTime: m.midtermTime,
        midtermRoom: m.midtermRoom,
      },
    })

    if (result.count === 0) {
      console.warn(
        `⚠️ No CourseOffered match for ${m.courseCode} section ${m.section}`,
      )
    } else {
      console.log(`✅ Updated ${m.courseCode} section ${m.section}`)
    }
  }
}

async function main() {
  const midterms = await parsePDF()
  console.log(`📄 Parsed ${midterms.length} midterm rows`)
  await updateCourseOffered(midterms)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
