import { Editor } from "@/components/DynamicEditor"
import PageViewer from "@/components/PageViewer"
import { ThemeChange } from "@/components/ThemeChange"
import React, { Suspense } from "react"

const page = () => {
  return (
    <div className="min-h-screen flex justify-center items-top px-5 py-2">
      <Suspense>
        <div className="flex-1 max-w-4xl">
          <Editor />
        </div>
      </Suspense>
    </div>
  )
}

export default page
