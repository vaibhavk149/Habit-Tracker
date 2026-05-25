# Habit Manager Project

Habit Pulse OS is a Next.js 15 habit manager for goal-specific daily execution.
It lets a user activate a protocol, complete or recover daily tasks, save proof,
track IST-based progress, and configure browser reminders.

## Repository Structure

```text
habit-pulse/
├── prompt.md
├── justification.md
├── golden_response.py
├── README.md
├── data/habit-pulse.json
├── src/app/page.tsx
├── src/app/api/programs/route.ts
├── src/app/api/plan/route.ts
├── src/app/api/tasks/[taskId]/route.ts
├── src/app/api/proof/route.ts
├── src/app/api/reminder/route.ts
├── src/lib/programs.ts
├── src/lib/data-store.ts
├── src/lib/snapshot.ts
└── src/lib/time.ts
```

## Assessment Files

- `prompt.md` contains the original domain-specific coding prompt.
- `justification.md` explains why Response B is better than Response A.
- `golden_response.py` is an executable reference solution for the same core requirements.
- `README.md` explains the project, structure, setup, and evaluation method.

## Run the Next.js App

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Test the Build

```bash
npm run lint
npm run build
```

## Run the Golden Python Reference

The Python file is dependency-free.

```bash
python golden_response.py programs
python golden_response.py start dsa
python golden_response.py task dsa-concept complete
python golden_response.py proof "Revised arrays and solved one easy problem"
python golden_response.py reminder --enabled true --time 20:30 --message "Run today's protocol"
python golden_response.py snapshot
```

## Implementation Notes

The Next.js app stores local data in `data/habit-pulse.json`. If the file does
not exist, the server creates it automatically.

Dates are generated with the `Asia/Kolkata` timezone. The current date key is
stored as `YYYY-MM-DD`, so daily completions, recoveries, proof entries, and
streaks are based on IST rather than the machine's local timezone.

Task recovery is mutually exclusive with completion for the same task on the
same day. Choosing **Mark Done**, **Recovery**, or **Clear** rewrites today's
state for that task.

The browser reminder feature stores reminder settings on the server and uses
the browser Notification API on the client. It does not require email, cron
jobs, paid APIs, or external services.

## Evaluation Methodology

The comparison in `justification.md` evaluates Response A and Response B using
instruction following, correctness, completeness, code quality, coherence, and
helpfulness. Response B wins because it is more technically consistent and more
implementation-friendly, even though both responses are still incomplete.

## Deployment

Push the repository to GitHub, then import it into Vercel as a Next.js project.
No database environment variables are required for this local JSON version.

For production multi-user usage, replace JSON persistence with a database before
shipping to real users.

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
