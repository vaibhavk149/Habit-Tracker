# Prompt

## Context and Role

You are a senior full-stack developer building a realistic habit-management product for students and early-career professionals who want structured daily execution instead of a generic checklist.

Build a **Habit Manager Project** named **Habit Pulse OS**. The product should let a user choose a goal protocol, track daily task proof, recover missed work, and receive browser reminders using India Standard Time.

## Objective

Create a production-quality habit manager that supports goal-specific programs such as fat loss, DSA interview preparation, deep study, and English speaking confidence.

The app must focus on the following workflow:

1. The user selects one protocol.
2. The app creates the protocol's daily tasks.
3. The user marks tasks as complete, recovered, or cleared for the current IST date.
4. The app stores proof notes for the day.
5. The app calculates progress, resilience, streak, and current program day.
6. The user configures a browser reminder time and reminder message.

## Required Technology

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- React client components for the interactive dashboard
- Next.js API routes for server actions
- JSON file persistence for local development
- No external database requirement
- No authentication requirement

## Explicit Requirements

### Frontend

- Build a single dashboard-style page as the first screen.
- Show the product name **Habit Pulse OS** and a clear protocol selector.
- Show at least four built-in protocols:
  - Fat Loss Protocol
  - 100 Days DSA Protocol
  - Deep Study Protocol
  - English Confidence Protocol
- Show the active protocol with grouped checkpoint sections.
- Each task card must display:
  - title
  - checkpoint
  - minimum action
  - proof requirement
  - recovery action
  - suggested time
  - difficulty
- Each task must have buttons for:
  - Mark Done
  - Recovery
  - Clear
- Show metrics for:
  - completion percentage
  - resilience percentage
  - streak
  - current program day
- Include a proof ledger where the user can save text proof for the current day.
- Include browser notification controls for permission, reminder time, reminder message, and enabled/disabled state.

### Backend

- Implement API routes for:
  - `GET /api/programs`
  - `GET /api/plan`
  - `POST /api/plan`
  - `DELETE /api/plan`
  - `PATCH /api/tasks/[taskId]`
  - `POST /api/proof`
  - `PATCH /api/reminder`
- Store data in `data/habit-pulse.json`.
- If the data file does not exist, create it automatically.
- All date keys must use India Standard Time in `YYYY-MM-DD` format.
- Task completion and recovery must be mutually exclusive for the same task on the same date.
- The streak must count consecutive IST dates where at least one task was completed or recovered.
- Invalid task actions must return a `400` JSON error.
- Unknown program IDs must return a `404` JSON error.
- Empty proof text must return a `400` JSON error.

### Code Quality

- Use clear TypeScript types for programs, plans, tasks, proof entries, and reminder settings.
- Keep business logic in reusable library files instead of placing everything inside components.
- Keep UI readable and responsive on desktop and mobile.
- Avoid TODO comments and placeholder-only implementations.
- Provide professional setup instructions in the README.

## Expected Output

Provide a complete project implementation with:

1. A concise project overview.
2. The full source code.
3. A clear repository structure.
4. Setup commands.
5. Instructions to run the app locally.
6. A short explanation of how the solution handles persistence, IST dates, reminders, task recovery, and streaks.

The final answer should be executable without requiring paid APIs, external databases, or hidden services.
