import type { CalendarEvent, CreateEventPayload, UpdateEventPayload, AuthResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || "Request failed");
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  // Auth
  register(email: string, name: string, password: string) {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    });
  }

  login(email: string, password: string) {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  getMe() {
    return this.request<{ id: string; email: string; name: string }>("/auth/me");
  }

  // Events
  getEvents(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const qs = params.toString();
    return this.request<CalendarEvent[]>(`/events${qs ? `?${qs}` : ""}`);
  }

  getEvent(id: string) {
    return this.request<CalendarEvent>(`/events/${id}`);
  }

  createEvent(payload: CreateEventPayload) {
    return this.request<CalendarEvent>("/events", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  updateEvent(id: string, payload: UpdateEventPayload) {
    return this.request<CalendarEvent>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  deleteEvent(id: string) {
    return this.request<void>(`/events/${id}`, { method: "DELETE" });
  }
}

export const api = new ApiClient();
