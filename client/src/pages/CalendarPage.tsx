import { useState, useCallback, useMemo } from "react";
import { useCalendar } from "../hooks/useCalendar";
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from "../hooks/useEvents";
import { MonthView } from "../components/calendar/MonthView";
import { WeekView } from "../components/calendar/WeekView";
import { DayView } from "../components/calendar/DayView";
import { EventModal } from "../components/events/EventModal";
import { useUIStore } from "../stores/ui";
import { useAuthStore } from "../stores/auth";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sun,
  Moon,
  LogOut,
  User,
  CalendarDays,
  Search,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import type { CalendarEvent } from "../types";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export function CalendarPage() {
  const calendar = useCalendar();
  const { darkMode, toggleDarkMode } = useUIStore();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [search, setSearch] = useState("");

  const dateRange = useMemo(() => {
    if (calendar.view === "month") {
      const mStart = startOfMonth(calendar.currentDate);
      const mEnd = endOfMonth(calendar.currentDate);
      return {
        start: startOfWeek(mStart).toISOString(),
        end: endOfWeek(mEnd).toISOString(),
      };
    }
    return {
      start: calendar.days[0].toISOString(),
      end: calendar.days[calendar.days.length - 1].toISOString(),
    };
  }, [calendar.currentDate, calendar.view, calendar.days]);

  const { data: events = [], isLoading } = useEvents(dateRange.start, dateRange.end);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const filteredEvents = useMemo(() => {
    if (!search) return events;
    const q = search.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q))
    );
  }, [events, search]);

  const handleDayClick = useCallback((day: Date) => {
    setSelectedEvent(null);
    setDefaultDate(day);
    setModalOpen(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setDefaultDate(undefined);
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (data: any) => {
      if (selectedEvent) {
        await updateEvent.mutateAsync({ id: selectedEvent.id, payload: data });
      } else {
        await createEvent.mutateAsync(data as any);
      }
    },
    [selectedEvent, createEvent, updateEvent]
  );

  const handleDelete = useCallback(async () => {
    if (selectedEvent) {
      await deleteEvent.mutateAsync(selectedEvent.id);
      setModalOpen(false);
    }
  }, [selectedEvent, deleteEvent]);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setSelectedEvent(null);
    setDefaultDate(undefined);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-2 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold hidden sm:inline">Calendar</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={calendar.goBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={calendar.goForward}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={calendar.goToday}>
              Today
            </Button>
          </div>
          <h2 className="text-lg font-semibold hidden md:block">{calendar.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-8 h-9 w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex rounded-md border">
            {(["month", "week", "day"] as const).map((v) => (
              <Button
                key={v}
                variant={calendar.view === v ? "default" : "ghost"}
                size="sm"
                className="rounded-none first:rounded-l-md last:rounded-r-md capitalize"
                onClick={() => calendar.setView(v)}
              >
                {v}
              </Button>
            ))}
          </div>

          <Button size="sm" onClick={() => { setSelectedEvent(null); setDefaultDate(new Date()); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Event
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name || "User"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Calendar View */}
      <main className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading...
          </div>
        ) : (
          <>
            {calendar.view === "month" && (
              <MonthView
                days={calendar.days}
                events={filteredEvents}
                onEventClick={handleEventClick}
                onDayClick={handleDayClick}
                isSameMonth={calendar.isSameMonth}
                isToday={calendar.isToday}
                getEventsForDay={calendar.getEventsForDay}
              />
            )}
            {calendar.view === "week" && (
              <WeekView
                days={calendar.days}
                hours={calendar.hours}
                events={filteredEvents}
                onEventClick={handleEventClick}
                onDayClick={handleDayClick}
                isToday={calendar.isToday}
                getEventsForDay={calendar.getEventsForDay}
              />
            )}
            {calendar.view === "day" && (
              <DayView
                days={calendar.days}
                hours={calendar.hours}
                events={filteredEvents}
                onEventClick={handleEventClick}
                onDayClick={handleDayClick}
                isToday={calendar.isToday}
                getEventsForDay={calendar.getEventsForDay}
              />
            )}
          </>
        )}
      </main>

      {/* Event Modal */}
      <EventModal
        open={modalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onDelete={selectedEvent ? handleDelete : undefined}
        event={selectedEvent}
        defaultDate={defaultDate}
      />
    </div>
  );
}
