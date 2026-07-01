import { useState, useMemo, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfDay,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import type { CalendarEvent } from "../types";

export type ViewType = "month" | "week" | "day";

export function useCalendar(initialDate = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<ViewType>("month");

  const days = useMemo(() => {
    if (view === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calStart = startOfWeek(monthStart);
      const calEnd = endOfWeek(monthEnd);
      return eachDayOfInterval({ start: calStart, end: calEnd });
    }
    if (view === "week") {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
    return [startOfDay(currentDate)];
  }, [currentDate, view]);

  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i);
  }, []);

  const goForward = useCallback(() => {
    if (view === "month") setCurrentDate((d) => addMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => new Date(d.getTime() + 86400000));
  }, [view]);

  const goBack = useCallback(() => {
    if (view === "month") setCurrentDate((d) => subMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => new Date(d.getTime() - 86400000));
  }, [view]);

  const goToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const title = useMemo(() => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  }, [currentDate, view]);

  const getEventsForDay = useCallback(
    (day: Date, events: CalendarEvent[]) => {
      return events.filter((event) => {
        const start = parseISO(event.startDate);
        const end = parseISO(event.endDate);
        return (
          isSameDay(day, start) ||
          isSameDay(day, end) ||
          (day > start && day < end)
        );
      });
    },
    []
  );

  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
    days,
    hours,
    goForward,
    goBack,
    goToday,
    title,
    getEventsForDay,
    isSameMonth: (day: Date) => isSameMonth(day, currentDate),
    isToday,
    isSameDay,
  };
}
