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
    <div className="flex flex-col flex-1 p-3">
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((name) => (
          <div key={name} className="py-2 text-center text-xs font-semibold tracking-wide text-muted-foreground/60 uppercase">
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-px">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day, events);
          const isCurrent = isSameMonth(day);
          const today = isToday(day);

          return (
            <button
              key={i}
              onClick={() => onDayClick(day)}
              className={cn(
                "flex flex-col gap-0.5 border p-1.5 transition-all duration-150 min-h-[110px] group",
                "hover:bg-accent/30 hover:border-accent/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                !isCurrent && "bg-muted/15 border-muted/20",
                isCurrent && "bg-card border-border/60",
                today && "bg-primary/[0.04] border-primary/20",
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    today && "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/30",
                    !isCurrent && "text-muted-foreground/50",
                    isCurrent && !today && "text-foreground/80",
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground/50 pr-0.5">
                    {dayEvents.length}
                  </span>
                )}
              </div>
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
                  <span className="text-[11px] font-medium text-muted-foreground/60 px-1 hover:text-foreground transition-colors">
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
