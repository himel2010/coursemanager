import { redirect } from "next/navigation"

const PROPERTY = {
  text: {
    name: "Text",
    content: "",
  },
  course: {
    name: "Course",

    content: {
      code: "",
      section: "",
    },
    onClick: (code) => redirect(`${code}`),
  },
  group: {
    name: "Group",
    content: [],
      limit: 4,
    
  },
}
