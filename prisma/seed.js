const { PrismaClient } = require("@prisma/client")
const Papa = require("papaparse")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

function parseDays(dayStr) {
  if (!dayStr || dayStr === "") return []
  const dayMap = {
    SUN: "Sunday",
    MON: "Monday",
    TUE: "Tuesday",
    WED: "Wednesday",
    THU: "Thursday",
    FRI: "Friday",
    SAT: "Saturday",
  }
  return dayStr.split("+").map((d) => dayMap[d.trim()] || d.trim())
}

// Helper to create class schedule JSON
function createClassSchedule(
  theoryDays,
  theoryTime,
  theoryRoom,
  labDay,
  labTime,
  labRoom
) {
  const schedule = {}

  // Add theory classes
  if (theoryDays && theoryDays.length > 0 && theoryTime) {
    schedule.theory = {
      day1: theoryDays[0],
      day2: theoryDays[1],
      startTime: theoryTime,
      endTime: null,
      room: theoryRoom || "TBA",
    }
  }

  // Add lab class
  if (labDay && labTime && labRoom) {
    schedule.lab = {
      day: labDay[0],
      startTime: labTime,
      endTime: null,
      room: labRoom,
    }
  }

  return schedule
}

async function getFaculties() {
  const csvPath = path.join(
    process.cwd(),
    "2025 Fall CSE Routine _ Consultation v1.0 [forStudent] - FacultyList.csv"
  )
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`)
  }
  const csvContent = fs.readFileSync(csvPath, "utf-8")
  const { data: rows } = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  for (let i = 0; i < rows.length; i++) {
    const info = rows[i]
    if (!info) continue
    if (!info["Email"] && !info["initial"]) continue
    console.log("Creating Database entry for.. " + info["Name"])
    await prisma.faculty.upsert({
      where: {
        initial: info["Initial"],
      },
      update: {
        designation: info["Designnation"],
        room: info["Room"],
      },
      create: {
        name: info["Name"],
        initial: info["Initial"],
        email: info["Email"],
        designation: info["Designation"],
        room: info["Room"],
      },
    })
    console.log("Created")
  }
}

async function main() {
  const csvPath = path.join(
    process.cwd(),
    "2025 Fall CSE Routine _ Consultation v1.0 [forStudent] - Tabular.csv"
  )
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`)
  }

  const department = await prisma.department.upsert({
    where: { code: "CSE" },
    update: { name: "Computer Science & Engineering" },
    create: {
      code: "CSE",
      name: "Computer Science & Engineering",
    },
  })
  const semester = await prisma.semester.upsert({
    where: {
      season_year: {
        season: "Fall",
        year: 2025,
      },
    },
    update: { isActive: true },
    create: {
      name: "Fall 2025",
      season: "Fall",
      year: 2025,
      startDate: new Date("2025-09-7"),
      endDate: new Date("2026-1-15"),
      isActive: true,
    },
  })
  const csvContent = fs.readFileSync(csvPath, "utf-8")
  const { data: rows } = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })
  const coursesMap = new Map() // Cache courses to avoid duplicate queries
  let successCount = 0
  let errorCount = 0
  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i]
      const parts = row.Course.split("-")
      const baseCourseCode = parts[0].trim()
      const section = parts[1].trim()
      console.log(row)
      let course = coursesMap.get(baseCourseCode)

      if (!course) {
        console.log(baseCourseCode)
        console.log(`📚 Creating/Getting course: ${baseCourseCode}`)
        course = await prisma.course.upsert({
          where: { code: baseCourseCode },
          update: {},
          create: {
            code: baseCourseCode,
            title: `${baseCourseCode} - Course`, // Default title
            credits: 3,
            departmentId: department.id,
          },
        })
        coursesMap.set(baseCourseCode, course)
      }

      const theoryDays = parseDays(row["Theory Day"])
      const theoryTime = row["Theory Time\r\n(1hr 20min)"]?.trim()
      const theoryRoom = row["Theory Room"]?.trim()
      const labDay = parseDays(row["Lab Day"]?.trim())
      const labTime = row["Lab Time (3hr)"]?.trim()
      const labRoom = row["Lab Room"]?.trim()

      const classSchedule = createClassSchedule(
        theoryDays,
        theoryTime,
        theoryRoom,
        labDay,
        labTime,
        labRoom
      )

      const theoryInitial = row["Theory Initial"]?.trim()
      const labFaculty = row["Lab Faculty"]?.trim().split(",")

      // Step 3d: Create CourseOffered
      // Check if this section already exists
      const existingSection = await prisma.courseOffered.findFirst({
        where: {
          courseId: course.id,
          semesterId: semester.id,
          section: section,
        },
      })

      if (existingSection) {
        console.log(`⏭️  Section ${course.code} already exists, skipping`)
        continue
      }

      const theoryfac = await prisma.faculty.findFirst({
        where: {
          initial: theoryInitial,
        },
      })

      const lab1 = await prisma.faculty.findFirst({
        where: {
          initial: labFaculty[0],
        },
      })
      const lab2 = await prisma.faculty.findFirst({
        where: {
          initial: labFaculty[1],
        },
      })

      if (labFaculty.length > 0) {
        await prisma.courseOffered.create({
          data: {
            courseId: course.id,
            semesterId: semester.id,
            section: section,
            classSchedule: classSchedule,
            theoryFacultyId: theoryfac?.id,
            labFaculty1Id: lab1?.id,
            labFaculty2Id: lab2?.id,
          },
        })
      } else {
        await prisma.courseOffered.create({
          data: {
            courseId: course.id,
            semesterId: semester.id,
            section: section,
            classSchedule: classSchedule,
            theoryFacultyId: theoryfac?.id,
          },
        })
      }

      successCount++
      console.log(
        `✅ Created section ${course.code} (${successCount}/${rows.length})`
      )
    } catch (error) {
      throw error
      console.log(error)
      errorCount++
    } finally {
      console.log("Success: " + successCount)
      console.log("Error: " + errorCount)
    }
  }
}

main()
// getFaculties()
