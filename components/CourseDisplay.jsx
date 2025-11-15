import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Badge } from "./ui/badge"
import { Calendar, Mail, MapPin, User } from "lucide-react"
import { Separator } from "./ui/separator"
import { redirect } from "next/navigation"

export function CourseDisplay({ courses }) {
  return (
    <div className="flex flex-col gap-6">
      {courses &&
        courses.map((course, idx) => {
          const {
            id,
            course: { code },
            section,
            theoryFaculty,
            labFaculty1,
            labFaculty2,
            classSchedule: { theory, lab },
          } = course
          return (
            <div key={idx}>
              {" "}
              <Item variant="muted">
                <ItemContent>
                  <ItemTitle className="flex justify-between items-top">
                    <h1 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
                      {code}
                    </h1>
                    <Badge variant="destructive">{section}</Badge>
                  </ItemTitle>
                  <div></div>
                  <ItemDescription>
                    <span className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <User className="size-4" />
                        {theoryFaculty?.initial}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="size-4" />
                        {theoryFaculty?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        {theory?.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {theory?.startTime}
                        <Separator orientation="vertical" />
                        {theory?.day1} - {theory?.day2}
                      </span>
                    </span>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      redirect(`/course/chat`)
                    }}
                  >
                    Open
                  </Button>
                </ItemActions>
              </Item>
            </div>
          )
        })}
    </div>
  )
}
