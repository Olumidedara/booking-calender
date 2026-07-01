import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import type { CalendarEvent } from "../../types";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  allDay: z.boolean(),
  color: z.string(),
  location: z.string().max(200).optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

const COLOR_OPTIONS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  event?: CalendarEvent | null;
  defaultDate?: Date;
}

export function EventModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  event,
  defaultDate,
}: EventModalProps) {
  const isEditing = !!event;
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: defaultDate ? format(defaultDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endDate: defaultDate ? format(new Date(defaultDate.getTime() + 3600000), "yyyy-MM-dd'T'HH:mm") : format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
      allDay: false,
      color: "#3B82F6",
      location: "",
    },
  });

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description || "",
        startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
        allDay: event.allDay,
        color: event.color,
        location: event.location || "",
      });
    } else {
      reset({
        title: "",
        description: "",
        startDate: defaultDate ? format(defaultDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endDate: defaultDate ? format(new Date(defaultDate.getTime() + 3600000), "yyyy-MM-dd'T'HH:mm") : format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
        allDay: false,
        color: "#3B82F6",
        location: "",
      });
    }
  }, [event, defaultDate, reset, open]);

  const allDay = watch("allDay");

  const onFormSubmit = async (data: EventFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Event" : "New Event"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your event details" : "Create a new calendar event"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="Event title" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Add a description" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start</Label>
              <Input id="startDate" type={allDay ? "date" : "datetime-local"} {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End</Label>
              <Input id="endDate" type={allDay ? "date" : "datetime-local"} {...register("endDate")} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="allDay" checked={allDay} onCheckedChange={(v) => setValue("allDay", v)} />
            <Label htmlFor="allDay">All day</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} placeholder="Add a location" />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: watch("color") === color ? "var(--foreground)" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {isEditing && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete} className="mr-auto">
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
