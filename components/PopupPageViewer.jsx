"use client"

import dynamic from "next/dynamic"

export const PopupEditor = dynamic(
  (pageContent, pageType, editable) => import("./PageViewer"),
  { ssr: false }
)
