import dayjs from "dayjs"
import { create } from "zustand"
import { getMonth } from "./getTime"

export const useCalendarStore = create((set) => ({
  currentView: "MONTH",
  setView: (state) => set({ currentView: state.toUpperCase() }),
  selectedDate: dayjs(),
  setSelectedDate: (state) => set({ selectedDate: state }),
  setSelectedDateWithTime: (day, hour) =>
    set({ selectedDate: day.hour(hour).minute(0).second(0).millisecond(0) }),
  selectedEvent: "QUIZ",
  setSelectedEvent: (type) => set({ selectedEvent: type.toUpperCase() }),
  events: [],
  setEvents: (e) => set({ events: e }),
  addEvent: (e) => set((state) => ({ events: [...state.events, e] })),
  filter: [],
  setFilter: (e) => set({ filter: e }),

  month: getMonth(),
  monthIdx: dayjs().month(),
  setMonth: (i) => set({ month: getMonth(i), monthIdx: i }),
  goToNextWeek: () =>
    set((state) => ({ selectedDate: state.selectedDate.add(1, "week") })),
  goToPreviousWeek: () =>
    set((state) => ({ selectedDate: state.selectedDate.subtract(1, "week") })),
  goToThisWeek: () => set({ selectedDate: dayjs() }),
}))
