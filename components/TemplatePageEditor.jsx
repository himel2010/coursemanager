"use client"

import dynamic from "next/dynamic"

export const TemplateEventPageEditor = dynamic(
  (handleEventPage, pageType, pageProperties, pageContent, setPageContent) =>
    import("./TemplatePageViewer"),
  { ssr: false }
)
