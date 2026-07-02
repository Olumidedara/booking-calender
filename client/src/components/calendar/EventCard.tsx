import type { CalendarEvent } from "../../types";
import { format, parseISO } from "date-fns";

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  variant?: "month" | "week" | "day";
  styleOverride?: React.CSSProperties;
}

export function EventCard({ event, onClick, variant = "month", styleOverride }: EventCardProps) {
  const start = parseISO(event.startDate);

  if (variant === "month") {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onClick(event); }}
        className="w-full text-left truncate rounded-md px-1.5 py-1 text-xs font-medium transition-all hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        style={{
          backgroundColor: event.color + "18",
          color: event.color,
          borderLeft: `3px solid ${event.color}`,
        }}
      >
        <span className="font-semibold">{format(start, "h:mm a")}</span> {event.title}
      </button>
    );
  }

  if (variant === "week") {
    const end = parseISO(event.endDate);

    return (
      <button
        onClick={(e) => { e.stopPropagation(); onClick(event); }}
        className="overflow-hidden rounded-lg px-2 py-1 text-xs font-medium transition-all hover:shadow-md hover:brightness-110"
        style={{
          backgroundColor: event.color + "20",
          color: event.color,
          borderLeft: `3px solid ${event.color}`,
          backdropFilter: "blur(1px)",
          ...styleOverride,
        }}
      >
        <div className="font-semibold truncate leading-tight">{event.title}</div>
        <div className="truncate opacity-75 leading-tight">
          {format(start, "h:mm a")} – {format(end, "h:mm a")}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(event)}
      className="w-full text-left rounded-xl border p-3 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-card"
      style={{ borderLeftColor: event.color, borderLeftWidth: "4px" }}
    >
      <div className="font-semibold">{event.title}</div>
      <div className="text-sm text-muted-foreground mt-0.5">
        {format(start, "h:mm a")} – {format(parseISO(event.endDate), "h:mm a")}
      </div>
      {event.description && (
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
      )}
      {event.location && (
        <div className="text-xs text-muted-foreground/70 mt-1.5 flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location}
        </div>
      )}
    </button>
  );
}
