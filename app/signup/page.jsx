"use client"
import CourseInput from "@/components/CourseInput"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

export default function Signup() {
  const [courseNum, setCourseNum] = useState(0)
  const [courses, setCourses] = useState([])

  const addCourse = () => {
    setCourses((prev) => [
      ...prev,
      {
        code: "",
        section: "",
      },
    ])
  }
  const onCourseChange = (idx, updatedCourse) => {
    setCourses((prev) => {
      const newCourses = [...prev]
      newCourses[idx] = updatedCourse
      return newCourses
    })
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4">
      <form className="w-full max-w-2xl">
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>Fill in your profile information.</FieldDescription>
          <FieldSeparator />

          <FieldGroup>
            {/* Name Field */}
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="name">Name</FieldLabel>
              </FieldContent>
              <Input id="name" placeholder="Catto" required />
            </Field>

            {/* Student ID Field */}
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="sid">Student ID</FieldLabel>
              </FieldContent>
              <Input id="sid" placeholder="111" required />
            </Field>

            {/* Department Field */}
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="dept">Department</FieldLabel>
              </FieldContent>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="CS">CS</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Semester Field */}
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="semester">Current Semester</FieldLabel>
              </FieldContent>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fall2025">FALL 2025</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <FieldSeparator />

            {/* Courses Field */}
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="courses">Courses</FieldLabel>
                <FieldDescription>
                  What are your courses for this semester?
                </FieldDescription>
                {courses.map((key, idx) => (
                  <div key={idx}>
                    <CourseInput
                      course={key}
                      idx={idx}
                      onCourseChange={onCourseChange}
                    />
                  </div>
                ))}
                <Button onClick={addCourse} type="button">
                  Add Course
                </Button>
              </FieldContent>
            </Field>

            <FieldSeparator />

            {/* Buttons */}
            <Field orientation="responsive">
              <div className="flex gap-2">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
      <Button onClick={() => console.log(courses)}>Log Courses</Button>
    </div>
  )
}
