import dayjs from "dayjs"
import { eventType } from "./eventType"
import customParseFormat from "dayjs/plugin/customParseFormat"

// Enable the plugin to parse custom formats
dayjs.extend(customParseFormat)

export function formatCourses(courses) {
  console.log("ekhane")
  console.log(courses)
  const classes = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  }

  courses?.forEach((course) => {
    const lab = course.classSchedule.lab
    const theory = course.classSchedule.theory
    const code = course.course.code

    if (lab?.day) {
      classes[lab?.day].push({
        courseCode: code,
        title: "Lab",
        type: "CLASS",
        includeTime: true,
        room: lab.room,
        date: dayjs(lab.startTime, "h:mm A"),
      })
    }
    classes[theory?.day1].push({
      courseCode: code,
      title: "Theory",
      type: "CLASS",
      includeTime: true,
      room: theory.room,
      date: dayjs(theory.startTime, "h:mm A"),
    })
    classes[theory?.day2].push({
      courseCode: code,
      title: "Theory",
      type: "CLASS",
      includeTime: true,
      room: theory.room,
      date: dayjs(theory.startTime, "h:mm A"),
    })
  })
  console.log("Formatted", classes)
  return classes
}
