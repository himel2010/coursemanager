import {
  addBulletPoint,
  addDivider,
  addGroups,
  addHeading1,
  addHeading2,
  addHeading3,
  addRubric,
  addTable,
} from "./blockFunctions"

export const eventType = {
  QUIZ: [
    addHeading1("Quiz"),
    addDivider(),

    addHeading2("Syllabus", "syllabus"),

    addBulletPoint(),
    addBulletPoint(),
    addBulletPoint(),
    addDivider(),
    {
      type: "paragraph",
      content: "Some content",
    },
    addDivider(),
    addHeading2("Rubric"),

    addTable([["Total Marks", "15"]], 0),
    addDivider(),
  ],
  ASSIGNMENT: [
    addHeading2("Instructions"),
    {
      id: "instructions-body",
      type: "paragraph",
      content: [{ type: "text", text: "Write your instructions here." }],
    },
    addDivider(),
    addHeading2("Question 1"),
    {
      id: "question-1-body",
      type: "paragraph",
      content: "Write Question here",
    },
    {
      type: "paragraph",
      content: "",
    },
    {
      type: "paragraph",
      content: "",
    },
    {
      type: "paragraph",
      content: "",
    },
    {
      type: "paragraph",
      content: "",
    },
    addDivider(),
    addHeading2("Rubric"),
    addRubric([
      {
        id: "1",
        item: "Total Mark",
        mark: "15",
      },
    ]),
    // addDivider(),
    // addHeading2("Group"),
    // addGroups(
    //   [
    //     {
    //       name: "hehe",
    //       members: [
    //         { name: "A", id: "123" },
    //         { name: "B", id: "123" },
    //       ],
    //     },
    //     {
    //       name: "hihi",
    //       members: [
    //         { name: "A", id: "123" },
    //         { name: "B", id: "123" },
    //         { name: "C", id: "123" },
    //       ],
    //     },
    //   ],
    //   true
    // ),

    addDivider(),
    addHeading3("Plagiarism Policy"),
    {
      type: "paragraph",
      content:
        "Any form of plagiarism and unethical use of AI is strictly prohibited and might result in serious academic penalties",
    },
  ],

  PROJECT: [
    addHeading2("Instructions"),
    {
      id: "instructions-body",
      type: "paragraph",
      content: [{ type: "text", text: "Write your instructions here." }],
    },

    addDivider(),
    addHeading2("Project Topic"),
    {
      id: "project-instruction",
      type: "paragraph",
      content: "Write about the project here",
    },
    {
      type: "paragraph",
      content: "",
    },
    {
      type: "paragraph",
      content: "",
    },
    {
      type: "paragraph",
      content: "",
    },
    {
      type: "paragraph",
      content: "",
    },
    addDivider(),
    addHeading2("Rubric"),
    addRubric([
      {
        id: "1",
        item: "Total Mark",
        mark: "15",
      },
    ]),
    addDivider(),
    // addHeading2("Group"),
    // addGroups(
    //   [
    //     {
    //       name: "hehe",
    //       members: [
    //         { name: "A", id: "123" },
    //         { name: "B", id: "123" },
    //       ],
    //     },
    //     {
    //       name: "hihi",
    //       members: [
    //         { name: "A", id: "123" },
    //         { name: "B", id: "123" },
    //         { name: "C", id: "123" },
    //       ],
    //     },
    //   ],
    //   true
    // ),

    // addDivider(),
    addHeading3("Plagiarism Policy"),
    {
      type: "paragraph",
      content:
        "Any form of plagiarism and unethical use of AI is strictly prohibited and might result in serious academic penalties",
    },
  ],
  CLASS: [],
  GENERAL: [],
}

export const eventTypes = ["CLASS", "ASSIGNMENT", "QUIZ"]

export const getColor = (e) => {
  switch (e) {
    case "QUIZ":
      return {
        color: "chart-1",
        bg: "bg-chart-1/20",
        border: "border-[var(--chart-1)]",
      }
    case "MID":
      return {
        color: "chart-7",
        bg: "bg-chart-7/20",
        border: "border-[var(--chart-7)]",
      }
    case "GENERAL":
      return {
        color: "chart-6",
        bg: "bg-chart-6/20",
        border: "border-[var(--chart-6)]",
      }
    case "ASSIGNMENT":
      return {
        color: "chart-2",
        bg: "bg-chart-2/20",
        border: "border-[var(--chart-2)]",
      }
    case "CLASS":
      return {
        color: "chart-8",
        bg: "bg-chart-8/20",
        border: "border-[var(--chart-8)]",
      }
    case "PROJECT":
      return {
        color: "chart-8",
        bg: "bg-chart-8/20",
        border: "border-[var(--chart-8)]",
      }
    default:
      return {
        bg: "bg-red-500/20",
        border: "border-red-500",
      }
  }
}
