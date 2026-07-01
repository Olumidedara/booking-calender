import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { eventSchema, eventUpdateSchema } from "../schemas/index.js";
import { AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query;
  const where: any = { userId: req.userId };
  if (startDate && endDate) {
    where.startDate = { gte: new Date(startDate as string) };
    where.endDate = { lte: new Date(endDate as string) };
  }
  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: { reminders: true },
  });
  res.json(events);
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const event = await prisma.event.findFirst({
    where: { id, userId: req.userId },
    include: { reminders: true },
  });
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(event);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const event = await prisma.event.create({
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      userId: req.userId!,
    },
    include: { reminders: true },
  });
  res.status(201).json(event);
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const existing = await prisma.event.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const parsed = eventUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const data: any = { ...parsed.data };
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);

  const event = await prisma.event.update({
    where: { id },
    data,
    include: { reminders: true },
  });
  res.json(event);
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const existing = await prisma.event.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  await prisma.event.delete({ where: { id } });
  res.status(204).send();
});

export default router;
