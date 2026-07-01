import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: hashed,
    },
  });

  const events = [
    {
      title: "Morning Standup",
      description: "Daily team standup meeting",
      startDate: new Date(new Date().setHours(9, 0, 0, 0)),
      endDate: new Date(new Date().setHours(9, 30, 0, 0)),
      color: "#3B82F6",
      userId: user.id,
    },
    {
      title: "Lunch Break",
      description: null,
      startDate: new Date(new Date().setHours(12, 0, 0, 0)),
      endDate: new Date(new Date().setHours(13, 0, 0, 0)),
      color: "#10B981",
      userId: user.id,
    },
    {
      title: "Project Review",
      description: "Review Q2 project milestones",
      startDate: new Date(new Date().setHours(14, 0, 0, 0)),
      endDate: new Date(new Date().setHours(15, 30, 0, 0)),
      color: "#F59E0B",
      userId: user.id,
    },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
