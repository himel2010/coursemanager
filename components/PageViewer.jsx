"use client"
import "@blocknote/core/fonts/inter.css"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/shadcn"
import "@blocknote/shadcn/style.css"
import { ShadCNDefaultComponents } from "@blocknote/shadcn"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"
import { useState } from "react"
import { eventType } from "@/lib/events/eventType"
import { getBlock } from "@blocknote/core"
import { addBulletPoint } from "@/lib/events/blockFunctions"
import { createQuizPage } from "@/lib/events/pageTemplate"

export default function PageViewer({ pageContent, pageType, editable }) {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    initialContent: pageContent ? pageContent : eventType.QUIZ,
  })
  const { theme } = useTheme()

  // Renders the editor instance using a React component.
  return (
    <div className="">
      <BlockNoteView
        editor={editor}
        shadCNComponents={ShadCNDefaultComponents}
        theme={theme}
      />
    </div>
  )
}
