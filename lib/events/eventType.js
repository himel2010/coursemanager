import {
  addBulletPoint,
  addDivider,
  addHeading1,
  addHeading2,
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
    {
      type: "table",
      content: {
        type: "tableContent",
        headerRows: 1,
        rows: [
          {
            cells: [
              "Total Marks",
              {
                type: "tableCell",
                content: [
                  {
                    type: "text",
                    text: "This is ",
                    styles: {},
                  },
                  {
                    type: "text",
                    text: "RED",
                    styles: {
                      bold: true,
                    },
                  },
                ],
                props: {
                  colspan: 1,
                  rowspan: 2,
                  backgroundColor: "var(--primary)",
                  textColor: "default",
                  textAlignment: "right",
                },
              },
            ],
          },
          {
            cells: ["Table Cell"],
          },
          {
            cells: ["Table Cell", "Table Cell"],
          },
        ],
      },
      props: {
        textAlignment: "center", // This should be in 'props'
      },
    },
    addTable([["Total Marks", "15"]], 0),
  ],
}
