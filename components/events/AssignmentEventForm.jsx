import React, { useEffect, useState } from "react"
import TemplatePageViewer from "../TemplatePageViewer"
import { TemplateEventPageEditor } from "../TemplatePageEditor"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"

const AssignmentEventForm = ({
  course,
  setCourse,
  courses,
  description,
  setDescription,
  date,
  assignmentInfo,
  setAssignmentInfo,
  pageContent,
  setPageContent,
}) => {
  const [pageProperties, setPageProperties] = useState({
    Course: courses?.find((c) => c.id == course)?.course?.code,
    Date: date.format("DD/MM"),
    Reminder: null,
    Groups: "False",
  })

  useEffect(() => {
    setPageProperties({
      ...pageProperties,
      Course: courses?.find((c) => c.id == course)?.course?.code,
    })
    setAssignmentInfo({ ...assignmentInfo, pageProperties })
  }, [course])

  useEffect(() => {
    setAssignmentInfo({ ...assignmentInfo, pageContent, pageProperties })
  }, [pageContent, pageProperties])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 text-center items-center justify-between">
        <Label> Group Assignment</Label>
        <Switch
          onClick={() =>
            setPageProperties({
              ...pageProperties,
              Groups: pageProperties.Groups === "True" ? "False " : "True",
            })
          }
        />
      </div>
      <div className="flex w-full justify-start items-start gap-2">
        {date && course ? (
          <div className="flex w-full justify-start items-start gap-2">
            <Dialog>
              <DialogTrigger className="flex-1">
                <div
                  variant="outline"
                  className="flex-1 w-full bg-background/80 p-1 rounded shadow font-medium text-sm
              hover:cursor-pointer hover:bg-foreground/5 transition-all"
                  onClick={() => setPageContent([])}
                >
                  New Page
                </div>
              </DialogTrigger>
              <DialogContent className=" h-[85vh] max-h-[85vh] min-w-5xl flex flex-col py-4 px-6 overflow-hidden">
                <DialogTitle></DialogTitle>
                <div className="flex-1 overflow-auto">
                  <TemplateEventPageEditor
                    pageType="Default"
                    pageProperties={pageProperties}
                    pageContent={pageContent}
                    setPageContent={setPageContent}
                    eventTitle="Assignment"
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger className="flex-1">
                <div
                  variant="outline"
                  className="flex-1 w-full bg-background/80 p-1 rounded shadow font-medium text-sm
              hover:cursor-pointer hover:bg-foreground/5 transition-all"
                >
                  Assignment Template
                </div>
              </DialogTrigger>
              <DialogContent className=" h-[85vh] max-h-[85vh] min-w-5xl flex flex-col py-4 px-6 overflow-hidden">
                <DialogTitle></DialogTitle>
                <div className="flex-1 overflow-auto">
                  <TemplateEventPageEditor
                    pageType="ASSIGNMENT"
                    pageProperties={pageProperties}
                    eventTitle="Assignment"
                    pageContent={pageContent}
                    setPageContent={setPageContent}
                  />
                </div>
              </DialogContent>
            </Dialog>{" "}
          </div>
        ) : (
          "Please Select Date and Course"
        )}
      </div>
    </div>
  )
}

export default AssignmentEventForm
