import { cn } from "../../lib/utils";
import type { CalendarEvent } from "../../types";
import { format, parseISO } from "date-fns";

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  variant?: "month" | "week" | "day";
}

export function EventCard({ event, onClick, variant = "month" }: EventCardProps) {
  const start = parseISO(event.startDate);

  if (variant === "month") {
    return (
      <button
        onClick={() => onClick(event)}
        className="w-full text-left truncate rounded px-1 py-0.5 text-xs font-medium transition-opacity hover:opacity-80"
        style={{ backgroundColor: event.color + "20", color: event.color, borderLeft: `3px solid ${event.color}` }}
      >
        {format(start, "h:mm a")} {event.title}
      </button>
    );
  }

  if (variant === "week") {
    const startMin = start.getHours() * 60 + start.getMinutes();
    const end = parseISO(event.endDate);
    const endMin = end.getHours() * 60 + end.getMinutes();
    const height = Math.max((endMin - startMin) / 60 * 48, 24);

    return (
      <button
        onClick={() => onClick(event)}
        className="absolute left-1 right-1 overflow-hidden rounded-md px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80 z-10"
        style={{
          top: `${(startMin / 60) * 48}px`,
          height: `${height}px`,
          backgroundColor: event.color + "30",
          color: event.color,
          borderLeft: `3px solid ${event.color}`,
        }}
      >
        <div className="font-semibold truncate">{event.title}</div>
        <div className="truncate opacity-75">
          {format(start, "h:mm a")} – {format(end, "h:mm a")}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(event)}
      className="w-full text-left rounded-lg border p-3 transition-shadow hover:shadow-md bg-card"
      style={{ borderLeftColor: event.color, borderLeftWidth: "4px" }}
    >
      <div className="font-semibold">{event.title}</div>
      <div className="text-sm text-muted-foreground">
        {format(start, "h:mm a")} – {format(parseISO(event.endDate), "h:mm a")}
      </div>
      {event.description && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {event.description}
        </p>
      )}
    </button>
  );
}
