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
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import axios from "axios"
import { redirect } from "next/navigation"
import { useRef, useState } from "react"
import { Check, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { toast, Toaster } from "sonner"

export default function SignUpComponent({ courseInfo }) {
  const [courses, setCourses] = useState([])
  const [semester, setSemester] = useState("FALL 2025")
  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [dept, setDept] = useState("CSE")
  const ref = useRef(null)
  const addCourse = () => {
    setCourses((prev) => [
      ...prev,
      {
        code: "",
        section: "",
      },
    ])
  }

  const courseExists = (code) => {
    return courses.some((item) => item.code === code)
  }

  const handleCourseAdd = (code, sec) => {
    if (courses.length >= 5) return

    const exists = courseExists(code)

    if (!exists) {
      setCourses((prev) => [
        ...prev,
        {
          code: code,
          section: sec,
        },
      ])
    } else {
      setCourses((prev) => prev.filter((item) => item.code !== code))
    }
  }

  const onCourseChange = (idx, updatedCourse) => {
    setCourses((prev) => {
      const newCourses = [...prev]
      newCourses[idx] = updatedCourse
      return newCourses
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (courses.length < 3) {
      toast.error("You must take at least 3 courses")
      return
    }
    const data = {
      name: name,
      id: id,
      dept: dept,
      sem: semester,
      course: courses,
    }
    try {
      const response = await axios.post("/api/set-user", data)
      if (response) redirect("/")
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4">
      <Toaster position="bottom-right" />
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
              <Input
                id="name"
                placeholder="Catto"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            {/* Student ID Field */}
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="sid">Student ID</FieldLabel>
              </FieldContent>
              <Input
                id="sid"
                placeholder="111"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
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
                <FieldLabel htmlFor="courses" className="font-bold">
                  Courses
                </FieldLabel>
                <FieldDescription>
                  What are your courses for this semester?
                </FieldDescription>
                <div className="w-full h-full flex gap-5 mt-1">
                  <Command>
                    <CommandInput placeholder="Search your course" />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup heading="Courses">
                        {courseInfo &&
                          courseInfo?.map((course, idx) => {
                            const code = course.course.code
                            const sec = course.section
                            const taken = courses.some(
                              (item) =>
                                item.code === code && item.section === sec
                            )
                            //   const faculty = course.theoryFaculty.initial
                            return (
                              <CommandItem
                                key={idx}
                                value={`${code} - ${sec}`}
                                onSelect={() => handleCourseAdd(code, sec)}
                                className={taken ? "bg-muted" : ""}
                              >
                                {taken && <Check />}
                                {code} - {sec}
                              </CommandItem>
                            )
                          })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <Table>
                    <TableCaption>
                      {courses.length === 0
                        ? "Your Taken Courses Will Appear Here"
                        : "Taken Courses"}
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Section</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.code}>
                          <TableCell>{course.code}</TableCell>
                          <TableCell>{course.section}</TableCell>
                          <TableCell className="max-w-minflex items-center justify-center">
                            <Button
                              type="button"
                              variant={"outline"}
                              size="sm"
                              className="hover:cursor-pointer"
                              onClick={() => handleCourseAdd(course.code)}
                            >
                              <X />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </FieldContent>
            </Field>

            <FieldSeparator />

            {/* Buttons */}
            <Field orientation="responsive">
              <Button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 ml-10 mr-10"
              >
                Submit
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  )
}
