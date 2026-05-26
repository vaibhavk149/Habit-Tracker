# Habit Pulse OS

Habit Pulse OS is a focused habit manager for students and early-career professionals who want a daily execution system, not just another checklist.

The app lets a user pick a goal protocol, follow daily tasks, mark work as done or recovered, save proof notes, and set browser reminders. Dates are handled in India Standard Time, so the daily progress stays aligned with the user’s actual routine.

## What This Project Does

- Choose a ready-made habit protocol such as fat loss, DSA preparation, deep study, or English speaking confidence.
- Start one active plan and see today’s task list.
- Mark each task as `Done`, `Recovered`, or `Clear`.
- Save proof notes for the day.
- Track completion, recovery, streak, current day, and overall progress.
- Store data locally in `data/habit-pulse.json`.
- Configure browser notification reminders from the app.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Local JSON file persistence
- Browser Notification API

## Folder Structure

```text
habit-pulse/
├── data/
│   └── habit-pulse.json
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── plan/
│   │   │   ├── programs/
│   │   │   ├── proof/
│   │   │   ├── reminder/
│   │   │   └── tasks/[taskId]/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── data-store.ts
│       ├── programs.ts
│       ├── snapshot.ts
│       └── time.ts
├── prompt.md
├── justification.md
├── package.json
└── README.md
```

## Main Files

`src/app/page.tsx` contains the main dashboard UI. It loads programs, starts a plan, updates task status, saves proof notes, and manages reminder settings.

`src/app/api/programs/route.ts` returns the available habit protocols.

`src/app/api/plan/route.ts` starts or reads the active habit plan.

`src/app/api/tasks/[taskId]/route.ts` updates a task as done, recovered, or clear for today.

`src/app/api/proof/route.ts` saves the user’s daily proof note.

`src/app/api/reminder/route.ts` stores reminder settings.

`src/lib/programs.ts` defines the habit programs, task types, reminder type, and app data models.

`src/lib/data-store.ts` reads and writes the local JSON file.

`src/lib/snapshot.ts` prepares the dashboard data and progress metrics.

`src/lib/time.ts` keeps the app date logic based on India Standard Time.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

## Useful Commands

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Start the production server after building:

```bash
npm run start
```

## Data Storage

This project uses a simple JSON file for persistence:

```text
data/habit-pulse.json
```

That keeps the project lightweight and easy to understand. It is good for local learning, demos, and single-user testing. For a real multi-user production app, the JSON file should be replaced with a database.

## Prompt Alignment

The original prompt asked for a realistic habit-management product with:

- goal-specific protocols
- daily task proof
- missed-day recovery
- browser reminders
- IST-based progress tracking
- clear API routes and local persistence

This implementation focuses on those requirements directly. The app is intentionally simple enough to study, but complete enough to run and test as a working habit manager.

## Deployment Notes

This is a standard Next.js project, so it can be deployed on Vercel after pushing to GitHub.

No database environment variables are required for this version because the app uses local JSON storage. Before using it for real users, move the data layer to a proper database.
