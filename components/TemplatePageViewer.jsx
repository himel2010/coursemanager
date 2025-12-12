"use client"
import "@blocknote/core/fonts/inter.css"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/shadcn"
import "@blocknote/shadcn/style.css"
import { ShadCNDefaultComponents } from "@blocknote/shadcn"
import { useTheme } from "next-themes"

import { eventType } from "@/lib/events/eventType"

import { Separator } from "./ui/separator"
import PagePropertyComponent from "./PagePropertyComponent"

export default function TemplatePageViewer({
  handleEventPage,
  pageType,
  pageProperties,
  pageContent,
  eventTitle = "Title",
  setPageContent,
}) {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    initialContent: pageContent.length > 0 ? pageContent : eventType[pageType],
  })
  const { theme } = useTheme()

  // Renders the editor instance using a React component.
  return (
    <div className="p-5 flex flex-col justify-start gap-4">
      <div className="flex flex-col gap-3 px-8">
        {eventTitle && <h1 className="text-6xl font-black">{eventTitle}</h1>}
        {eventTitle && pageProperties && (
          <PagePropertyComponent pageProperties={pageProperties} />
        )}
      </div>

      <Separator />
      <BlockNoteView
        editor={editor}
        shadCNComponents={ShadCNDefaultComponents}
        theme={theme}
        onChange={() => setPageContent(editor.document)}
      />
    </div>
  )
}
