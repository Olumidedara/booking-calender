import { cn } from "../../lib/utils";
import type { CalendarEvent } from "../../types";
import { EventCard } from "./EventCard";
import { format, parseISO, isSameDay } from "date-fns";

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
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      {/* Day header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b shadow-sm">
        <div className="p-4 text-center">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground/60 mb-1">
            {format(day, "EEEE")}
          </div>
          <div className="text-3xl font-bold">
            <span className={cn(isToday(day) && "text-primary")}>
              {format(day, "MMMM d")}
            </span>
            <span className="text-muted-foreground/40 font-light mx-1">·</span>
            <span className="text-muted-foreground/60 font-light">{format(day, "yyyy")}</span>
          </div>
        </div>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="px-4 py-2 space-y-1.5 bg-muted/20 border-b">
          <div className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide px-1">
            All Day
          </div>
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

      {/* Hourly timeline */}
      <div className="flex-1 min-h-0 relative px-4">
        {isSameDay(day, now) && (
          <div
            className="absolute left-4 right-4 z-20 pointer-events-none border-t-2 border-red-400"
            style={{ top: `${(currentHour + currentMinute / 60) * 64}px` }}
          >
            <div className="absolute -left-[9px] -top-[6px] h-3 w-3 rounded-full bg-red-400 shadow-md shadow-red-400/50" />
          </div>
        )}

        {hours.map((hour) => {
          const hourEvents = timedEvents.filter((event) => {
            const start = parseISO(event.startDate);
            return start.getHours() === hour;
          });

          return (
            <div
              key={hour}
              className="flex min-h-[64px] group border-b border-border/40 last:border-b-0"
              onClick={() => {
                const d = new Date(day);
                d.setHours(hour, 0, 0, 0);
                onDayClick(d);
              }}
            >
              <div className="w-[70px] shrink-0 pt-1 text-xs font-medium text-muted-foreground/50 text-right pr-3 select-none">
                {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
              </div>
              <div className="flex-1 relative min-h-[64px] p-1 space-y-1 group-hover:bg-accent/10 transition-colors rounded-r-lg">
                {hourEvents.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-muted-foreground/30">Click to add event</span>
                  </div>
                )}
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
