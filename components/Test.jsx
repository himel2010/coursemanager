import React from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

const Test = ({ courseInfo }) => {
  return (
    <Command>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandGroup heading="Courses">
          {courseInfo &&
            courseInfo?.map((course, idx) => {
              const code = course.course.code
              const sec = course.section

              //   const faculty = course.theoryFaculty.initial
              return (
                <CommandItem key={idx} >
                  {code} - {sec}
                </CommandItem>
              )
            })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export default Test
