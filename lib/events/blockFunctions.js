import { id } from "date-fns/locale"

export function addBulletPoint(content = "") {
  return {
    type: "bulletListItem",
    content: content,
  }
}
export function addHeading1(content = "") {
  return {
    type: "heading",
    content: content,
    props: {
      level: 1,
    },
  }
}

export function addHeading2(content = "", id) {
  if (id) {
    return {
      id: id,
      type: "heading",
      content: content,
      props: {
        level: 2,
      },
    }
  }

  return {
    type: "heading",
    content: content,
    props: {
      level: 2,
    },
  }
}

export function addHeading3(content = "") {
  return {
    type: "heading",
    content: content,
    props: {
      level: 3,
    },
  }
}

export function addDivider() {
  return {
    type: "divider",
  }
}

export function addTable(arr, headers) {
  const generateRows = () => {
    const rows = arr.map((row) => {
      const cells = row.map((cellValue) => ({
        type: "tableCell",
        content: [
          {
            type: "text",
            text: cellValue.toString(),
            styles: {},
          },
        ],
      }))
      return { cells }
    })
    return rows
  }

  const rows = generateRows()

  return {
    type: "table",
    content: {
      type: "tableContent",
      headerRows: headers,
      rows,
    },
  }
}

export function addRubric(rubric) {
  const table = rubric.map((item) => [item.item, item.mark])
  const r = addTable(table)
  return { id: "rubric", ...r }
}

export function addGroups(groups, individual) {
  const createGroupsIndividual = () => {
    const rows = []
    groups.forEach((group, i) => {
      const members = group.members
      const name = group.name

      members.forEach((m, i) => {
        const current_row = []

        if (i == 0) {
          current_row.push({
            type: "tableCell",
            content: (name ? name : members.length).toString(),
            props: {
              rowspan: members.length,
              textAlignment: "center",
            },
          })
        }

        current_row.push({
          type: "tableCell",
          content: `${m.name}-${m.id}`,
          props: {
            textAlignment: "center",
          },
        })
        current_row.push({
          type: "tableCell",
          props: {
            textAlignment: "center",
          },
          content: [
            {
              type: "text",
              text: "",
              styles: {},
            },
          ],
        })

        rows.push({ cells: current_row })
      })
    })

    return rows
  }

  const createGroups = () => {
    return groups.map((group, i) => {
      const members = group.members
      const name = group.name

      // Create proper content array with line breaks between members
      const memberContent = []
      members.forEach((m, index) => {
        memberContent.push({
          type: "text",
          text: `${m.name}-${m.id}`,
          styles: {},
        })
        // Add line break after each member except the last one
        if (index < members.length - 1) {
          memberContent.push({
            type: "text",
            text: "\n",
            styles: {},
          })
        }
      })

      return {
        cells: [
          {
            type: "tableCell",
            props: {
              textAlignment: "center",
            },
            content: [
              {
                type: "text",
                text: name ? name : (i + 1).toString(),
                styles: {},
              },
            ],
          },
          {
            type: "tableCell",
            props: {
              textAlignment: "center",
            },
            content: memberContent,
          },
          {
            type: "tableCell",
            props: {
              textAlignment: "center",
            },
            content: [
              {
                type: "text",
                text: "",
                styles: {},
              },
            ],
          },
        ],
      }
    })
  }
  const groupRows = individual ? createGroupsIndividual() : createGroups()
  console.log(groupRows)

  return {
    type: "table",
    id: "group",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      width: "100%",
    },

    content: {
      type: "tableContent",
      columnWidths: [240, 300, 150],
      headerRows: 1,

      rows: [
        {
          cells: [
            {
              type: "tableCell",
              content: "Group No.",
              props: { textAlignment: "center" },
            },
            {
              type: "tableCell",
              content: "Members",
              props: { textAlignment: "center" },
            },
            {
              type: "tableCell",
              content: "Marks",
              props: { textAlignment: "center" },
            },
          ],
        },
        ...groupRows,
      ],
    },
  }
}
