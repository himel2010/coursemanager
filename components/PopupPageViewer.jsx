"use client"

import dynamic from "next/dynamic"

export const PopupEditor = dynamic(() => import("./PageViewer"), { ssr: false })
