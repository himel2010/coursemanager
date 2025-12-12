"use client"

import dynamic from "next/dynamic"

export const EventPageEditor = dynamic((handleEventPage, Type, ) => import("./PageViewer"), { ssr: false })
