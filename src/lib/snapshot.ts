import { readDb } from "./data-store";
import { ActivePlan, getProgram } from "./programs";
import { getIndiaClock, getIndiaDateKey, getIndiaDisplay } from "./time";

function calculateStreak(plan: ActivePlan | null) {
  if (!plan) return 0;

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = getIndiaDateKey(cursor);
    const hasDone = plan.tasks.some((task) => task.completedDates.includes(key));
    const hasRecovery = plan.tasks.some((task) => task.recoveredDates.includes(key));
    if (!hasDone && !hasRecovery) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getCurrentDay(startedAt: string, duration: number) {
  const diff = new Date(getIndiaDateKey()).getTime() - new Date(startedAt).getTime();
  return Math.min(Math.floor(diff / 86400000) + 1, duration);
}

export async function getSnapshot() {
  const db = await readDb();
  const today = getIndiaDateKey();
  const activeProgram = db.activePlan ? getProgram(db.activePlan.programId) : null;
  const completedToday =
    db.activePlan?.tasks.filter((task) => task.completedDates.includes(today)).length ?? 0;
  const recoveredToday =
    db.activePlan?.tasks.filter((task) => task.recoveredDates.includes(today)).length ?? 0;
  const totalTasks = db.activePlan?.tasks.length ?? 0;
  const progress = totalTasks ? Math.round((completedToday / totalTasks) * 100) : 0;
  const resilience = totalTasks
    ? Math.round(((completedToday + recoveredToday) / totalTasks) * 100)
    : 0;

  return {
    activePlan: db.activePlan,
    activeProgram,
    proofEntries: db.proofEntries,
    todaysProof: db.proofEntries.filter((entry) => entry.dateKey === today),
    reminder: db.reminder,
    indiaNow: {
      dateKey: today,
      clock: getIndiaClock(),
      display: getIndiaDisplay(),
    },
    stats: {
      completedToday,
      recoveredToday,
      totalTasks,
      progress,
      resilience,
      streak: calculateStreak(db.activePlan),
      currentDay:
        db.activePlan && activeProgram
          ? getCurrentDay(db.activePlan.startedAt, activeProgram.duration)
          : 0,
    },
  };
}
