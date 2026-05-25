Golden Response
1. Project Overview & Architecture
The application is built on Next.js 15 utilizing the App Router for optimized routing and server actions. It employs a Layered Architecture:
Data Layer: PostgreSQL with Prisma ORM for type-safe database interactions.
State Layer: Zustand for global client-side state and React Hook Form for validated inputs.
Service Layer: Modularized logic for AI (OpenAI), Email (Nodemailer), and Analytics.
Security Layer: JWT-based authentication with HttpOnly cookies and Next.js Middleware.
2. Complete Folder Structure
Plaintext
habit-pulse/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── analytics/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── ai/recommendations/route.ts
│   │   ├── analytics/
│   │   │   ├── heatmap/route.ts
│   │   │   └── overview/route.ts
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── register/route.ts
│   │   └── habits/
│   │       ├── [id]/
│   │       │   ├── complete/route.ts
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ai/RecommendationCard.tsx
│   ├── analytics/
│   │   ├── CompletionChart.tsx
│   │   └── HeatmapCalendar.tsx
│   ├── dashboard/
│   │   ├── HabitCard.tsx
│   │   ├── HabitList.tsx
│   │   └── StatsCards.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── Card.tsx
├── lib/
│   ├── ai-service.ts
│   ├── auth.ts
│   ├── email-service.ts
│   ├── prisma.ts
│   └── streak-utils.ts
├── prisma/
│   └── schema.prisma
├── store/
│   └── useHabitStore.ts
├── middleware.ts
├── tailwind.config.ts
└── next.config.js

3. Database Schema
File: prisma/schema.prisma
Code snippet
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String     @id @default(uuid())
  name      String
  email     String     @unique
  password  String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  habits    Habit[]
  reminders Reminder[]
}

model Habit {
  id           String            @id @default(uuid())
  title        String
  description  String?
  category     String
  frequency    String            // daily, weekly
  priority     String            // low, medium, high
  reminderTime String?
  userId       String
  user         User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  completions  HabitCompletion[]
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  @@unique([title, userId])
  @@index([userId])
}

model HabitCompletion {
  id          String   @id @default(uuid())
  habitId     String
  habit       Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  completedAt DateTime @default(now())

  @@index([habitId])
}

model Reminder {
  id      String  @id @default(uuid())
  userId  String
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  enabled Boolean @default(true)
  time    String
  type    String
}

4. Backend Implementation (Key Services)
Authentication Logic
File: app/api/auth/login/route.ts
TypeScript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  const response = NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

Streak & Analytics Service
File: lib/streak-utils.ts
TypeScript
import { HabitCompletion } from '@prisma/client';
import { isYesterday, isToday, parseISO, startOfDay } from 'date-fns';

export function calculateStreaks(completions: HabitCompletion[]) {
  if (completions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sortedDates = completions
    .map(c => startOfDay(new Date(c.completedAt)).getTime())
    .sort((a, b) => b - a);

  const uniqueDates = Array.from(new Set(sortedDates));
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Current Streak Calculation
  let lastDate = new Date();
  if (isToday(uniqueDates[0]) || isYesterday(uniqueDates[0])) {
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      if (i === 0 && isToday(date)) currentStreak++;
      else if (i === 0 && isYesterday(date)) currentStreak++;
      else {
        const prevDate = new Date(uniqueDates[i - 1]);
        const diff = (prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) currentStreak++;
        else break;
      }
    }
  }

  return { currentStreak, longestStreak }; // Simplified for brevity
}

5. Frontend Implementation
Zustand Global Store
File: store/useHabitStore.ts
TypeScript
import { create } from 'zustand';
import axios from 'axios';

interface HabitStore {
  habits: any[];
  isLoading: boolean;
  fetchHabits: () => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  isLoading: false,
  fetchHabits: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axios.get('/api/habits');
      set({ habits: data.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },
  toggleHabit: async (habitId: string) => {
    await axios.post(`/api/habits/${habitId}/complete`);
    get().fetchHabits();
  },
}));

Dashboard UI Component
File: components/dashboard/HabitCard.tsx
TypeScript
"use client";
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';

export const HabitCard = ({ habit }: { habit: any }) => {
  const toggleHabit = useHabitStore((state) => state.toggleHabit);
  const isCompleted = habit.completions.some((c: any) => 
    new Date(c.completedAt).toDateString() === new Date().toDateString()
  );

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 bg-white dark:bg-zinc-900 border rounded-2xl shadow-sm flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => toggleHabit(habit.id)}
          className="transition-transform active:scale-90"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          ) : (
            <Circle className="w-8 h-8 text-zinc-300" />
          )}
        </button>
        <div>
          <h3 className="font-bold text-lg">{habit.title}</h3>
          <span className="text-sm text-zinc-500 capitalize">{habit.category} • {habit.priority}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-black text-orange-500">🔥 {habit.streak || 0}</div>
        <div className="text-[10px] uppercase tracking-widest font-bold">Streak</div>
      </div>
    </motion.div>
  );
};

6. Configuration Files
File: .env.example
Code snippet
DATABASE_URL="postgresql://johndoe:mypassword@localhost:5432/habitpulse"
JWT_SECRET="generate-a-long-random-string-here"
EMAIL_USER="notifications@habitpulse.com"
EMAIL_PASS="your-app-password"
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

7. Setup & Installation
Follow these commands to deploy the local development environment:
Bash
# 1. Clone & Install
git clone https://github.com/your-repo/habit-pulse.git
cd habit-pulse
npm install

# 2. Database Initialization
# Ensure Docker is running or you have a local Postgres instance
npx prisma generate
npx prisma db pu	sh

# 3. Environment Setup
cp .env.example .env
# Edit .env with your local credentials

# 4. Start Development
npm run dev

8. Deployment Guide
Database: Use Neon.tech or Supabase for a managed PostgreSQL instance.
Server: Deploy to Vercel. It automatically detects Next.js 15 and sets up the edge environment.
Environment Variables: Ensure JWT_SECRET and DATABASE_URL are added to the Vercel dashboard.
Cron Jobs: Use Vercel Cron (vercel.json) to hit the /api/habits/reminders endpoint daily to trigger Nodemailer notifications.


