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
  Clock,
  MapPin,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import type { CalendarEvent } from "../types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  parseISO,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((e) => new Date(e.startDate) >= new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  }, [events]);

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

  const miniCalendarDays = useMemo(() => {
    const mStart = startOfMonth(calendar.currentDate);
    const mEnd = endOfMonth(calendar.currentDate);
    const calStart = startOfWeek(mStart);
    const calEnd = endOfWeek(mEnd);
    const days: Date[] = [];
    let d = new Date(calStart);
    while (d <= calEnd) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [calendar.currentDate]);

  const viewVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 lg:px-6 py-2.5 flex items-center justify-between bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Calendar</h1>
          </div>
          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={calendar.goBack} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={calendar.goForward} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={calendar.goToday} className="h-8 text-xs font-medium">
              Today
            </Button>
          </div>
          <h2 className="text-base font-semibold hidden md:block ml-2">{calendar.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search events..."
              className="pl-9 h-9 w-48 lg:w-56 rounded-xl bg-muted/50 border-none text-sm focus-visible:ring-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex rounded-xl border bg-muted/30 p-0.5">
            {(["month", "week", "day"] as const).map((v) => (
              <Button
                key={v}
                variant={calendar.view === v ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-lg text-xs font-medium px-3 h-8 transition-all",
                  calendar.view === v && "shadow-sm"
                )}
                onClick={() => calendar.setView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={() => { setSelectedEvent(null); setDefaultDate(new Date()); setModalOpen(true); }}
            className="h-9 px-3 rounded-xl gap-1.5 font-medium"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Event</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9 rounded-xl">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-1">
              <DropdownMenuLabel className="font-normal">
                <div className="font-medium">{user?.name || "User"}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden lg:flex flex-col border-r bg-muted/10 overflow-hidden shrink-0"
            >
              <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* Mini Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">{format(calendar.currentDate, "MMMM yyyy")}</span>
                    <div className="flex gap-0.5">
                      <button onClick={() => {
                        const d = new Date(calendar.currentDate);
                        d.setMonth(d.getMonth() - 1);
                        calendar.setCurrentDate(d);
                      }} className="p-1 rounded-md hover:bg-accent transition-colors">
                        <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => {
                        const d = new Date(calendar.currentDate);
                        d.setMonth(d.getMonth() + 1);
                        calendar.setCurrentDate(d);
                      }} className="p-1 rounded-md hover:bg-accent transition-colors">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-px">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground/50 py-1 uppercase tracking-wide">
                        {d}
                      </div>
                    ))}
                    {miniCalendarDays.map((day, i) => (
                      <button
                        key={i}
                        onClick={() => calendar.setCurrentDate(new Date(day))}
                        className={cn(
                          "text-center text-xs py-1 rounded-lg transition-colors hover:bg-accent/50",
                          !isSameDay(day, new Date()) && isSameDay(day, calendar.currentDate) && "bg-primary/10 text-primary font-semibold",
                          isSameDay(day, new Date()) && "bg-primary text-primary-foreground font-semibold shadow-sm",
                          !isSameMonth(day, calendar.currentDate) && "text-muted-foreground/30"
                        )}
                      >
                        {format(day, "d")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Upcoming
                  </h3>
                  <div className="space-y-2">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-xs text-muted-foreground/50 text-center py-4">
                        No upcoming events
                      </p>
                    ) : (
                      upcomingEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-accent/50 transition-colors group border border-transparent hover:border-border/50"
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className="h-2 w-2 rounded-full mt-1.5 shrink-0"
                              style={{ backgroundColor: event.color }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium truncate group-hover:text-foreground transition-colors">
                                {event.title}
                              </div>
                              <div className="text-[11px] text-muted-foreground/60 mt-0.5">
                                {format(parseISO(event.startDate), "MMM d · h:mm a")}
                              </div>
                              {event.location && (
                                <div className="text-[11px] text-muted-foreground/40 mt-0.5 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Calendar View */}
        <main className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm">Loading events...</span>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={calendar.view}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={viewVariants}
                className="flex flex-col min-h-0 h-full"
              >
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
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

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
