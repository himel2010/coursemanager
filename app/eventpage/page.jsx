import { Editor } from "@/components/DynamicEditor"
import { EventPageEditor } from "@/components/EventPageEditor"
import PageViewer from "@/components/PageViewer"
import { ThemeChange } from "@/components/ThemeChange"
import {
  addBulletPoint,
  addDivider,
  addHeading1,
  addHeading2,
} from "@/lib/events/blockFunctions"
import dayjs from "dayjs"
import React, { Suspense } from "react"

const page = () => {
  const pageProperties = {
    course: "CSE220",
    date: dayjs().format("DD/MM"),
    link: "www.youtube.com",
    reference: "",
  }
  const pageContent = [
    addHeading2("Syllabus"),
    addBulletPoint("haha"),
    addBulletPoint("baba"),
    addDivider(),
    addHeading2("Comments"),
    {
      type: "paragraph",
      content: "shesh hoye jabo",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col justify-start items-center px-5 py-2 ">
      <Suspense>
        <div className="w-full max-w-4xl">
          <EventPageEditor
            pageProperties={pageProperties}
            // pageContent={pageContent}
            pageType="PROJECT"
            eventTitle="Project"
          />
        </div>
      </Suspense>
    </div>
  )
}

export default page
