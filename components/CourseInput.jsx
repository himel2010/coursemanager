import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const CourseInput = ({ course, idx, onCourseChange }) => {
  const handleCodeChange = (e) => {
    const val = e.target.value
    onCourseChange(idx, { ...course, code: val })
  }

  const handleSectionChange = (e) => {
    const val = e.target.value
    onCourseChange(idx, { ...course, section: val })
  }

  return (
    <div className="w-full border p-5">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="coursecode">CourseCode</FieldLabel>
            <Input
              id="coursecode"
              type="text"
              placeholder="Ex: CSE110"
              value={course.code}
              onChange={handleCodeChange}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="section">Section</FieldLabel>
            <Input
              id="section"
              type="section"
              placeholder="Ex: 1"
              value={course.section}
              onChange={handleSectionChange}
            />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

export default CourseInput
