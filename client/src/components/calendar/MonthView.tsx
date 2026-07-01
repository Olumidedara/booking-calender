import { cn } from "../../lib/utils";
import type { CalendarEvent } from "../../types";
import { EventCard } from "./EventCard";
import { format } from "date-fns";

interface MonthViewProps {
  days: Date[];
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (day: Date) => void;
  isSameMonth: (day: Date) => boolean;
  isToday: (day: Date) => boolean;
  getEventsForDay: (day: Date, events: CalendarEvent[]) => CalendarEvent[];
}

export function MonthView({
  days,
  events,
  onEventClick,
  onDayClick,
  isSameMonth,
  isToday,
  getEventsForDay,
}: MonthViewProps) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col flex-1">
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((name) => (
          <div key={name} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day, events);
          const isCurrent = isSameMonth(day);
          const today = isToday(day);

          return (
            <button
              key={i}
              onClick={() => onDayClick(day)}
              className={cn(
                "flex flex-col gap-0.5 border-b border-r p-1 transition-colors hover:bg-accent/50 min-h-[100px]",
                !isCurrent && "bg-muted/30",
                today && "bg-accent/30"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                  today && "bg-primary text-primary-foreground font-bold",
                  !isCurrent && "text-muted-foreground"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    variant="month"
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-xs text-muted-foreground px-1">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
