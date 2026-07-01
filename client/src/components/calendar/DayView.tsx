import { cn } from "../../lib/utils";
import type { CalendarEvent } from "../../types";
import { EventCard } from "./EventCard";
import { format, parseISO } from "date-fns";

interface DayViewProps {
  days: Date[];
  hours: number[];
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (day: Date) => void;
  isToday: (day: Date) => boolean;
  getEventsForDay: (day: Date, events: CalendarEvent[]) => CalendarEvent[];
}

export function DayView({
  days,
  hours,
  events,
  onEventClick,
  onDayClick,
  isToday,
  getEventsForDay,
}: DayViewProps) {
  const day = days[0];
  const dayEvents = getEventsForDay(day, events);
  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <div className="border-b p-4 text-center bg-background sticky top-0 z-20">
        <div className="text-sm text-muted-foreground">{format(day, "EEEE")}</div>
        <div className={cn("text-2xl font-bold", isToday(day) && "text-primary")}>
          {format(day, "MMMM d, yyyy")}
        </div>
      </div>

      {allDayEvents.length > 0 && (
        <div className="border-b p-2 space-y-1 bg-muted/30">
          <div className="text-xs font-medium text-muted-foreground px-2">All Day</div>
          {allDayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={onEventClick}
              variant="month"
            />
          ))}
        </div>
      )}

      <div className="flex-1">
        {hours.map((hour) => {
          const hourEvents = timedEvents.filter((event) => {
            const start = parseISO(event.startDate);
            return start.getHours() === hour;
          });

          return (
            <div
              key={hour}
              className="flex border-b min-h-[60px] group"
              onClick={() => {
                const d = new Date(day);
                d.setHours(hour, 0, 0, 0);
                onDayClick(d);
              }}
            >
              <div className="w-20 border-r text-xs text-muted-foreground text-right pr-2 pt-1 shrink-0">
                {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
              </div>
              <div className="flex-1 p-1 space-y-1">
                {hourEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    variant="day"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
