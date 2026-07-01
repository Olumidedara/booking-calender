import { cn } from "../../lib/utils";
import type { CalendarEvent } from "../../types";
import { EventCard } from "./EventCard";
import { format, isSameDay } from "date-fns";

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
    <div className="flex flex-col flex-1 overflow-auto">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b sticky top-0 bg-background/90 backdrop-blur-sm z-30 shadow-sm">
        <div className="border-r" />
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => onDayClick(day)}
            className={cn(
              "py-2.5 text-center transition-colors hover:bg-accent/40 relative",
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
      <div className="grid grid-cols-[60px_repeat(7,1fr)] flex-1 relative">
        {/* Current time line */}
        {days.some((d) => isToday(d)) && days.some((d) => isSameDay(d, now)) && (
          <div
            className="absolute left-[60px] right-0 z-20 pointer-events-none border-t-2 border-red-400"
            style={{ top: `${(currentHour + currentMinute / 60) * 48}px` }}
          >
            <div className="absolute -left-[5px] -top-[5px] h-2.5 w-2.5 rounded-full bg-red-400 shadow-md shadow-red-400/50" />
          </div>
        )}

        {hours.map((hour) => (
          <div key={hour} className="contents">
            <div className="border-r border-b relative text-xs text-muted-foreground/50 text-right pr-3">
              <span className="absolute -top-2.5 right-3 font-medium">
                {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
              </span>
            </div>
            {days.map((day, i) => (
              <div
                key={`${hour}-${i}`}
                className="border-r border-b relative min-h-[48px] transition-colors hover:bg-accent/15 group cursor-pointer"
                onClick={() => {
                  const d = new Date(day);
                  d.setHours(hour, 0, 0, 0);
                  onDayClick(d);
                }}
              >
                <div className="absolute inset-0 group-hover:bg-accent/10 transition-colors" />
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
