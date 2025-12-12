"use client"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { TagsInputField } from "@/components/tags-input-field"
import { useForm, FormProvider } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Bell,
  Calendar1,
  ChevronDownIcon,
  Clock,
  Clock2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Input } from "../ui/input"
import { useState } from "react"
import dayjs from "dayjs"
import { useAuth } from "@/lib/auth/AuthContext"
import axios from "axios"
import { useCalendarStore } from "@/lib/store"
import { Spinner } from "../ui/spinner"
import { toast } from "sonner"
import QuizEventForm from "./QuizEventForm"
import { Switch } from "../ui/switch"
import AssignmentEventForm from "./AssignmentEventForm"

const AddEventForm = ({ calendar }) => {
  const { user, courses } = useAuth()
  const [loading, setLoading] = useState(false)
  const [rubric, setRubric] = useState({
    totalMarks: 15,
    items: [{ id: 1, name: "Question 1", marks: 15 }],
  })
  const [course, setCourse] = useState("")
  const form = useForm({
    defaultValues: {
      tags: [],
    },
  })

  const [description, setDescription] = useState("")

  const [pageContent, setPageContent] = useState([])

  const [assignmentInfo, setAssignmentInfo] = useState({
    title: "Assignment",
    pageContent: pageContent,
    pageProperties: {},
  })

  const selectedDate = useCalendarStore((state) => state.selectedDate)
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate)
  const selectedEvent = useCalendarStore((state) => state.selectedEvent)
  const setSelectedEvent = useCalendarStore((state) => state.setSelectedEvent)
  const addEvent = useCalendarStore((state) => state.addEvent)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const response = await axios.post("/api/add-event", {
        data: {
          course: course,
          description: description,
          eventType: selectedEvent,
          startedAt: selectedDate.toISOString(),
          userId: user.id,
          eventInfo: {
            quiz: {
              syllabus: form?.getValues("tags"),
              rubric: rubric,
            },
            assignmentInfo,
          },
        },
      })
      const newEvent = response.data
      newEvent.date = dayjs(newEvent.date) //dayjs doesn't work in backend
      addEvent(newEvent)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
      toast.success("Event Posted ")
    }
  }
  const handleChange = (v) => {
    console.log(selectedEvent)
    setSelectedEvent(v)
  }

  return (
    <FieldSet>
      <FieldLegend>Add Event</FieldLegend>
      <Field>
        <Calendar24
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </Field>
      <Tabs defaultValue="QUIZ" className="w-full" onValueChange={handleChange}>
        <Field>
          <FieldSeparator />

          <TabsList>
            <TabsTrigger value="QUIZ">Quiz</TabsTrigger>
            <TabsTrigger value="ASSIGNMENT">Assignment</TabsTrigger>
          </TabsList>
        </Field>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Course</FieldLabel>
            <Select
              value={course}
              onValueChange={(v) => {
                setCourse(v)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.course.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <TabsContent value="QUIZ">
            <QuizEventForm
              course={course}
              setCourse={setCourse}
              courses={courses}
              description={description}
              setDescription={setDescription}
              form={form}
              rubric={rubric}
              setRubric={setRubric}
            />
          </TabsContent>
          <TabsContent value="ASSIGNMENT">
            <AssignmentEventForm
              course={course}
              setCourse={setCourse}
              courses={courses}
              description={description}
              setDescription={setDescription}
              date={dayjs(selectedDate)}
              pageContent={pageContent}
              assignmentInfo={assignmentInfo}
              setAssignmentInfo={setAssignmentInfo}
              setPageContent={setPageContent}
            />
          </TabsContent>
        </FieldGroup>
      </Tabs>
      <Button type="button" onClick={handleSubmit} disabled={loading}>
        {loading ? <Spinner /> : "Click"}
      </Button>
    </FieldSet>
  )
}

export default AddEventForm

function Calendar24({ selectedDate, setSelectedDate }) {
  const [open, setOpen] = useState(false)
  const [includeTime, setIncludeTime] = useState(false)
  const [time, setTime] = useState("10:30:00")
  const handleTimeChange = (newTime) => {
    setTime(newTime)
    if (selectedDate && includeTime) {
      const [hours, minutes] = newTime.split(":")
      const updatedDate = selectedDate
        .hour(parseInt(hours))
        .minute(parseInt(minutes))
      setSelectedDate(updatedDate)
    }
  }
  const handleDateChange = (date) => {
    if (!date) {
      setSelectedDate(undefined)
      return
    }

    let newDate = dayjs(date)
    if (includeTime && time) {
      const [hours, minutes] = time.split(":")
      newDate = newDate.hour(parseInt(hours)).minute(parseInt(minutes))
    } else {
      newDate = newDate.startOf("day") // Set to midnight if no time
    }
    setSelectedDate(newDate)
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Date and Time Row */}
      <div className="flex gap-4 text-sm">
        <div className="flex flex-col gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="selectedDate-picker"
                className="bg-transparent border-none shadow-none justify-between h-9 font-normal text-sm text-center"
              >
                {" "}
                <Calendar1 className="h-4 w-4" />
                {selectedDate
                  ? dayjs(selectedDate).format("DD/MM/YYYY")
                  : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={selectedDate ? selectedDate.toDate() : undefined}
                captionLayout="dropdown"
                onSelect={handleDateChange}
              />
            </PopoverContent>
          </Popover>
        </div>

        {includeTime && (
          <Button
            variant="outline"
            className="bg-transparent border-none shadow-none justify-between h-9 font-normal text-sm text-center"
          >
            <Clock className="h-4 w-4 text-center" />
            <Input
              type="time"
              id="time-picker"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="m-0 bg-transparent border-none shadow-none h-9 text-sm appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </Button>
        )}
      </div>

      {/* Include Time Toggle */}
      <div className="flex items-center justify-between">
        <Label
          htmlFor="include-time"
          className="text-sm font-medium cursor-pointer"
        >
          Include time
        </Label>
        <Switch
          id="include-time"
          checked={includeTime}
          onCheckedChange={setIncludeTime}
        />
      </div>

      {/* Reminder Options */}
      {/* <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Reminder
        </Label>
        <Select
          value={reminder?.toString() || "none"}
          onValueChange={(v) => setReminder(v === "none" ? null : parseInt(v))}
        >
          <SelectTrigger className="w-full h-9 text-sm">
            <SelectValue placeholder="No reminder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No reminder</SelectItem>
            <SelectItem value="0">At time of event</SelectItem>
            <SelectItem value="15">15 minutes before</SelectItem>
            <SelectItem value="30">30 minutes before</SelectItem>
            <SelectItem value="60">1 hour before</SelectItem>
            <SelectItem value="1440">1 day before</SelectItem>
            <SelectItem value="10080">1 week before</SelectItem>
          </SelectContent>
        </Select>
      </div> */}
    </div>
  )
}
