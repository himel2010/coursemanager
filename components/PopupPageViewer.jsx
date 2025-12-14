"use client"

import dynamic from "next/dynamic"

export const PopupEditor = dynamic(
  (pageContent, pageType, editable, pageProperties) => import("./PageViewer"),
  { ssr: false }
)
