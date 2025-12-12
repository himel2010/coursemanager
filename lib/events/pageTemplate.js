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
