import { create } from "zustand"

export const useCalendarStore = create((set) => ({
  currentView: "MONTH",
  setView: (state) => set({ currentView: state.toUpperCase() }),
  selectedDate: undefined,
  setSelectedDate: (state) => set({ selectedDate: state }),
  selectedEvent: "QUIZ",
  setSelectedEvent: (type) => set({ selectedEvent: type.toUpperCase() }),
  events: [],
  setEvents: (e) => set({ events: e }),
  addEvent: (e) => set((state) => ({ events: [...state.events, e] })),
}))
