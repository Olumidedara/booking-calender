import { cn } from "../../lib/utils";
import type { CalendarEvent } from "../../types";
import { EventCard } from "./EventCard";
import { format } from "date-fns";

interface WeekViewProps {
  days: Date[];
  hours: number[];
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (day: Date) => void;
  isToday: (day: Date) => boolean;
  getEventsForDay: (day: Date, events: CalendarEvent[]) => CalendarEvent[];
}

export function WeekView({
  days,
  hours,
  events,
  onEventClick,
  onDayClick,
  isToday,
  getEventsForDay,
}: WeekViewProps) {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b sticky top-0 bg-background z-20">
        <div className="border-r" />
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => onDayClick(day)}
            className={cn(
              "py-2 text-center transition-colors hover:bg-accent/50",
              isToday(day) && "bg-accent/30"
            )}
          >
            <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
            <div
              className={cn(
                "text-lg font-semibold",
                isToday(day) && "text-primary"
              )}
            >
              {format(day, "d")}
            </div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[60px_repeat(7,1fr)] flex-1">
        {hours.map((hour) => (
          <div key={hour} className="contents">
            <div className="border-r border-b text-xs text-muted-foreground text-right pr-2 pt-0 -mt-3">
              {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
            </div>
            {days.map((day, i) => (
              <div
                key={`${hour}-${i}`}
                className="border-r border-b relative min-h-[48px] transition-colors hover:bg-accent/20"
                onClick={() => {
                  const d = new Date(day);
                  d.setHours(hour, 0, 0, 0);
                  onDayClick(d);
                }}
              >
                {hour === 0 &&
                  getEventsForDay(day, events).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={onEventClick}
                      variant="week"
                    />
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
