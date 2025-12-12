import {
  addBulletPoint,
  addDivider,
  addHeading1,
  addHeading2,
} from "./blockFunctions"

export function createQuizPage({ title, syllabus, description }) {
  const file = []
  file.push(
    addHeading1(title ? title : "Quiz"),
    addDivider(),
    addHeading2("Syllabus"),
    ...syllabus.map((s) => addBulletPoint(s)),
    addDivider()
  )
  console.log(file)
  return file
}

export function createPage({ eventType, eventInfo }) {
  const pageContent = eventInfo.assignmentInfo.pageContent
  const pagePropertes = eventInfo.assignmentInfo.pagePropertes
  const title = eventInfo.title

  if (eventType === "ASSIGNMENT") {
    return createAssignmentPage(pageContent, title, pagePropertes)
  }
}

function createAssignmentPage(pageContent, title, pagePropertes) {
  console.log(title)
  console.log(pageContent)
  console.log(pagePropertes)
}
