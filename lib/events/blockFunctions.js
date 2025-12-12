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

export function addTable(arr, headers = 1) {
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
