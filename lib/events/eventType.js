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
}
