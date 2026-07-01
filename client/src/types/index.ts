export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Reminder {
  id: string;
  minutesBefore: number;
  method: string;
  eventId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color: string;
  location: string | null;
  recurrenceRule: string | null;
  userId: string;
  reminders: Reminder[];
}

export interface CreateEventPayload {
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  color?: string;
  location?: string | null;
  recurrenceRule?: string | null;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface AuthResponse {
  token: string;
  user: User;
}
