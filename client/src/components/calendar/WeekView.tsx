import { cn } from "../../lib/utils";
import type { CalendarEvent } from "../../types";
import { EventCard } from "./EventCard";
import { format, isSameDay, parseISO } from "date-fns";

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
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      {/* Day headers */}
      <div className="flex border-b sticky top-0 bg-background/90 backdrop-blur-sm z-30 shadow-sm">
        <div className="w-[60px] shrink-0 border-r" />
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => onDayClick(day)}
            className={cn(
              "flex-1 py-2.5 text-center transition-colors hover:bg-accent/40",
              isToday(day) && "bg-primary/[0.04]"
            )}
          >
            <div className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
              {format(day, "EEE")}
            </div>
            <div
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold transition-colors mt-0.5",
                isToday(day) && "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
              )}
            >
              {format(day, "d")}
            </div>
          </button>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Time labels column */}
        <div className="w-[60px] shrink-0 relative z-10">
          {hours.map((hour) => (
            <div key={hour} className="h-12 border-b relative">
              <span className="absolute -top-2.5 right-3 text-xs font-medium text-muted-foreground/50 select-none">
                {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIndex) => {
          const dayEvents = getEventsForDay(day, events).filter((e) => !e.allDay);
          const dayAllDay = getEventsForDay(day, events).filter((e) => e.allDay);

          return (
            <div key={dayIndex} className="flex-1 relative">
              {/* Hour slot backgrounds for clicking */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-12 border-b border-r transition-colors hover:bg-accent/15 group cursor-pointer relative"
                  onClick={() => {
                    const d = new Date(day);
                    d.setHours(hour, 0, 0, 0);
                    onDayClick(d);
                  }}
                >
                  <div className="absolute inset-0 group-hover:bg-accent/10 transition-colors" />
                </div>
              ))}

              {/* All-day events bar */}
              {dayAllDay.length > 0 && (
                <div className="absolute top-0 left-0 right-0 z-10 px-1 pt-0.5 space-y-0.5 pointer-events-none">
                  {dayAllDay.map((event) => (
                    <div key={event.id} className="pointer-events-auto">
                      <EventCard event={event} onClick={onEventClick} variant="month" />
                    </div>
                  ))}
                </div>
              )}

              {/* Events overlay */}
              {dayEvents.map((event) => {
                const start = parseISO(event.startDate);
                const end = parseISO(event.endDate);
                const startMin = start.getHours() * 60 + start.getMinutes();
                const endMin = end.getHours() * 60 + end.getMinutes();
                const top = (startMin / 60) * 48;
                const height = Math.max((endMin - startMin) / 60 * 48, 24);

                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    variant="week"
                    styleOverride={{
                      position: "absolute",
                      left: "2px",
                      right: "2px",
                      top: `${top}px`,
                      height: `${height}px`,
                      zIndex: 10,
                    }}
                  />
                );
              })}
            </div>
          );
        })}

        {/* Current time line */}
        {days.some((d) => isToday(d)) && days.some((d) => isSameDay(d, now)) && (
          <div
            className="absolute left-[60px] right-0 z-20 pointer-events-none border-t-2 border-red-400"
            style={{ top: `${(currentHour + currentMinute / 60) * 48}px` }}
          >
            <div className="absolute -left-[5px] -top-[5px] h-2.5 w-2.5 rounded-full bg-red-400 shadow-md shadow-red-400/50" />
          </div>
        )}
      </div>
    </div>
  );
}
