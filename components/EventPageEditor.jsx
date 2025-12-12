"use client"

import dynamic from "next/dynamic"

export const EventPageEditor = dynamic(
  (handleEventPage, pageType, pageProperties, pageContent) =>
    import("./PageViewer"),
  { ssr: false }
)
