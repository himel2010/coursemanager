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

export function CourseDisplay({ courses }) {
  return (
    <div className="flex flex-col gap-6">
      {courses &&
        courses.map((course, idx) => {
          const {
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
                  <ItemDescription>
                    <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <User className="size-4" />
                        {theoryFaculty?.initial}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="size-4" />
                        {theoryFaculty?.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        {theory?.room}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {theory?.startTime}
                        <Separator orientation="vertical" />
                        {theory?.day1} - {theory?.day2}
                      </div>
                    </div>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log(courses)
                    }}
                  >
                    Open
                  </Button>
                </ItemActions>
              </Item>{" "}
            </div>
          )
        })}
    </div>
  )
}
