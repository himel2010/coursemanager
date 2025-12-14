import dayjs from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"
dayjs.extend(weekOfYear)

export const isCurrentDay = (day) => {
  return day.isSame(dayjs(), "day")
}

export const getMonth = (month = dayjs().month()) => {
  const year = dayjs().year()
  const firstDayofMonth = dayjs().set("month", month).startOf("month").day()
  let dayCounter = -firstDayofMonth
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 7 }, () => dayjs(new Date(year, month, ++dayCounter)))
  )
}

export const getWeekDays = (date) => {
  const startOfWeek = date.startOf("week")
  const weekDates = []
  // Loop through the 7 days of the week
  for (let i = 0; i < 7; i++) {
    const currentDate = startOfWeek.add(i, "day")
    weekDates.push({
      currentDate,
      today:
        currentDate.toDate().toDateString() === dayjs().toDate().toDateString(),
      isCurrentDay,
    })
  }
  return weekDates
}

// Generate hours as just time values (0-23), not full dates
export const getHours = Array.from({ length: 24 }, (_, i) => i)

// Function to generate weeks of the month dynamically
export const getWeeks = (monthIndex) => {
  const year = dayjs().year()
  const firstDayOfMonth = dayjs(new Date(year, monthIndex, 1))
  const lastDayOfMonth = dayjs(new Date(year, monthIndex + 1, 0))
  const weeks = []

  let currentDay = firstDayOfMonth
  while (
    currentDay.isBefore(lastDayOfMonth) ||
    currentDay.isSame(lastDayOfMonth)
  ) {
    const weekNumber = currentDay.week()
    if (!weeks.includes(weekNumber)) {
      weeks.push(weekNumber)
    }
    currentDay = currentDay.add(1, "day")
  }
  return weeks
}
