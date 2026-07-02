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
  const HOUR_HEIGHT = 64;

  return (
    <div className="flex flex-col flex-1 min-h-0">
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
      <div className="flex-1 min-h-0 overflow-auto" id="day-view-scroll">
        <div className="flex relative min-h-full">
          {/* Time labels column */}
          <div className="w-[70px] shrink-0 relative z-10">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-border/40 relative"
              >
                <span className="absolute -top-2 right-3 text-xs font-medium text-muted-foreground/50 select-none">
                  {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
                </span>
              </div>
            ))}
          </div>

          {/* Content column */}
          <div className="flex-1 relative">
            {/* Hour slot backgrounds for clicking */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-border/40 border-l transition-colors hover:bg-accent/15 group cursor-pointer relative"
                onClick={() => {
                  const d = new Date(day);
                  d.setHours(hour, 0, 0, 0);
                  onDayClick(d);
                }}
              >
                <div className="absolute inset-0 group-hover:bg-accent/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-xs text-muted-foreground/30">Click to add event</span>
                </div>
              </div>
            ))}

            {/* Events overlay */}
            {timedEvents.map((event) => {
              const start = parseISO(event.startDate);
              const end = parseISO(event.endDate);
              const startMin = start.getHours() * 60 + start.getMinutes();
              const endMin = end.getHours() * 60 + end.getMinutes();
              const top = (startMin / 60) * HOUR_HEIGHT;
              const height = Math.max((endMin - startMin) / 60 * HOUR_HEIGHT, 24);

              return (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={onEventClick}
                  variant="day"
                  styleOverride={{
                    position: "absolute",
                    left: "4px",
                    right: "4px",
                    top: `${top}px`,
                    height: `${height}px`,
                    zIndex: 10,
                  }}
                />
              );
            })}

            {/* Current time line */}
            {isSameDay(day, now) && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none border-t-2 border-red-400"
                style={{ top: `${(currentHour + currentMinute / 60) * HOUR_HEIGHT}px` }}
              >
                <div className="absolute -left-[9px] -top-[6px] h-3 w-3 rounded-full bg-red-400 shadow-md shadow-red-400/50" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
