"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type {
  ActivePlan,
  Program,
  ProofEntry,
  ReminderSettings,
} from "@/lib/programs";

type Snapshot = {
  activePlan: ActivePlan | null;
  activeProgram: Program | null;
  proofEntries: ProofEntry[];
  todaysProof: ProofEntry[];
  reminder: ReminderSettings;
  indiaNow: {
    dateKey: string;
    clock: string;
    display: string;
  };
  stats: {
    completedToday: number;
    recoveredToday: number;
    totalTasks: number;
    progress: number;
    resilience: number;
    streak: number;
    currentDay: number;
  };
};

type ProgramsResponse = {
  programs: Program[];
  indiaNow: Snapshot["indiaNow"];
};

const fallbackReminder: ReminderSettings = {
  enabled: false,
  time: "20:30",
  message: "Run today's protocol and save proof.",
  lastSentDate: "",
};

function taskStyle(difficulty: string) {
  if (difficulty === "Deep") return "border-red-400/30 bg-red-400/10 text-red-100";
  if (difficulty === "Focused") return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
}

export default function Home() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [proofText, setProofText] = useState("");
  const [notificationStatus, setNotificationStatus] = useState("not requested");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState("");

  const selectedProgram =
    programs.find((program) => program.id === selectedProgramId) ?? programs[0] ?? null;
  const activePlan = snapshot?.activePlan ?? null;
  const activeProgram = snapshot?.activeProgram ?? null;
  const reminder = snapshot?.reminder ?? fallbackReminder;

  const checkpointGroups = useMemo(() => {
    if (!activePlan) return [];
    const checkpoints = Array.from(new Set(activePlan.tasks.map((task) => task.checkpoint)));
    return checkpoints.map((checkpoint) => ({
      checkpoint,
      tasks: activePlan.tasks.filter((task) => task.checkpoint === checkpoint),
    }));
  }, [activePlan]);

  async function loadApp() {
    setError("");
    const [programResponse, planResponse] = await Promise.all([
      fetch("/api/programs"),
      fetch("/api/plan"),
    ]);

    if (!programResponse.ok || !planResponse.ok) {
      throw new Error("Unable to load Habit Pulse OS");
    }

    const programData = (await programResponse.json()) as ProgramsResponse;
    const planData = (await planResponse.json()) as Snapshot;
    setPrograms(programData.programs);
    setSelectedProgramId((current) => current || programData.programs[0]?.id || "");
    setSnapshot(planData);
  }

  async function mutate(request: Promise<Response>) {
    setIsMutating(true);
    setError("");

    try {
      const response = await request;
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Action failed");
      }
      setSnapshot((await response.json()) as Snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setIsMutating(false);
    }
  }

  useEffect(() => {
    loadApp()
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load app"))
      .finally(() => setIsLoading(false));

    if ("Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (
        !snapshot?.reminder.enabled ||
        snapshot.reminder.lastSentDate === snapshot.indiaNow.dateKey ||
        !("Notification" in window) ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      const now = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

      if (now === snapshot.reminder.time) {
        new Notification("Habit Pulse OS", { body: snapshot.reminder.message });
        mutate(
          fetch("/api/reminder", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastSentDate: snapshot.indiaNow.dateKey }),
          }),
        );
      }
    }, 15000);

    return () => window.clearInterval(timer);
  }, [snapshot]);

  async function startProgram(programId: string) {
    await mutate(
      fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      }),
    );
  }

  async function resetPlan() {
    await mutate(fetch("/api/plan", { method: "DELETE" }));
    setProofText("");
  }

  async function updateTask(taskId: string, action: "complete" | "recover" | "clear") {
    await mutate(
      fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }),
    );
  }

  async function saveProof(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = proofText.trim();
    if (!text) return;

    await mutate(
      fetch("/api/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }),
    );
    setProofText("");
  }

  async function updateReminder(nextReminder: Partial<ReminderSettings>) {
    await mutate(
      fetch("/api/reminder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextReminder),
      }),
    );
  }

  async function requestNotifications() {
    if (!("Notification" in window)) {
      setNotificationStatus("not supported");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0d0f0e] px-6 text-zinc-100">
        <p className="text-lg font-black uppercase tracking-[0.2em] text-emerald-300">
          Loading Habit Pulse OS
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0f0e] px-4 py-5 text-zinc-100 sm:px-6">
      <section className="mx-auto grid w-full max-w-7xl gap-4 xl:grid-cols-[320px_1fr_340px]">
        <aside className="space-y-4">
          <section className="border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
              Habit Pulse OS
            </p>
            <h1 className="mt-3 text-4xl font-black leading-none">Goal Operating System</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              A product-style habit system for real goals: pick a protocol, run
              daily checkpoints, save proof, and recover missed actions.
            </p>
          </section>

          <section className="space-y-2">
            {programs.map((program) => (
              <button
                key={program.id}
                type="button"
                onClick={() => setSelectedProgramId(program.id)}
                className={`w-full border p-4 text-left transition ${
                  selectedProgramId === program.id
                    ? "border-emerald-300 bg-emerald-300 text-zinc-950"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                }`}
              >
                <span className="block text-xs font-black uppercase tracking-[0.18em]">
                  {program.signal}
                </span>
                <span className="mt-2 block text-xl font-black">{program.title}</span>
                <span className="mt-1 block text-sm opacity-80">
                  {program.duration} day system
                </span>
              </button>
            ))}
          </section>
        </aside>

        <section className="space-y-4">
          {error && (
            <div className="border border-red-400/40 bg-red-400/10 p-4 font-bold text-red-100">
              {error}
            </div>
          )}

          {selectedProgram && (
            <section className="border border-zinc-800 bg-zinc-950 p-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
                    Product protocol
                  </p>
                  <h2 className="mt-2 text-4xl font-black">{selectedProgram.title}</h2>
                  <p className="mt-3 text-lg text-zinc-300">{selectedProgram.identity}</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {selectedProgram.operatingRule}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedProgram.checkpoints.map((checkpoint) => (
                      <span
                        key={checkpoint}
                        className="border border-zinc-800 bg-[#151817] px-3 py-2 text-sm font-bold text-zinc-300"
                      >
                        {checkpoint}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => startProgram(selectedProgram.id)}
                  className="min-h-20 border border-emerald-300 bg-emerald-300 px-5 text-left text-xl font-black text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Activate Protocol
                </button>
              </div>
            </section>
          )}

          {activePlan && activeProgram && snapshot ? (
            <>
              <section className="grid gap-3 md:grid-cols-4">
                <div className="border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-3xl font-black text-emerald-300">
                    {snapshot.stats.progress}%
                  </p>
                  <p className="text-sm text-zinc-500">completion</p>
                </div>
                <div className="border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-3xl font-black text-amber-200">
                    {snapshot.stats.resilience}%
                  </p>
                  <p className="text-sm text-zinc-500">resilience</p>
                </div>
                <div className="border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-3xl font-black">{snapshot.stats.streak}</p>
                  <p className="text-sm text-zinc-500">streak</p>
                </div>
                <div className="border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-3xl font-black text-sky-200">
                    D{snapshot.stats.currentDay}
                  </p>
                  <p className="text-sm text-zinc-500">{activeProgram.duration} day arc</p>
                </div>
              </section>

              <section className="space-y-4">
                {checkpointGroups.map((group) => (
                  <div key={group.checkpoint} className="border border-zinc-800 bg-zinc-950 p-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">
                      {group.checkpoint} checkpoint
                    </h3>
                    <div className="mt-4 space-y-3">
                      {group.tasks.map((task) => {
                        const done = task.completedDates.includes(snapshot.indiaNow.dateKey);
                        const recovered = task.recoveredDates.includes(snapshot.indiaNow.dateKey);

                        return (
                          <article key={task.id} className="border border-zinc-800 bg-[#141716] p-4">
                            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`border px-2 py-1 text-xs font-bold ${taskStyle(task.difficulty)}`}>
                                    {task.difficulty}
                                  </span>
                                  <span className="border border-zinc-700 px-2 py-1 text-xs text-zinc-400">
                                    {task.time}
                                  </span>
                                </div>
                                <h4 className={`mt-3 text-2xl font-black ${done ? "text-zinc-500 line-through" : ""}`}>
                                  {task.title}
                                </h4>
                                <p className="mt-2 text-sm text-zinc-400">
                                  Minimum: {task.minimum}
                                </p>
                                <p className="mt-1 text-sm text-zinc-500">
                                  Proof: {task.proof}
                                </p>
                                <p className="mt-1 text-sm text-amber-200/80">
                                  Recovery: {task.recovery}
                                </p>
                              </div>
                              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                                <button
                                  type="button"
                                  disabled={isMutating}
                                  onClick={() => updateTask(task.id, "complete")}
                                  className={`min-h-11 border px-4 font-black transition ${
                                    done
                                      ? "border-emerald-300 bg-emerald-300 text-zinc-950"
                                      : "border-zinc-700 text-zinc-300 hover:border-emerald-300"
                                  }`}
                                >
                                  {done ? "Proof Done" : "Mark Done"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isMutating}
                                  onClick={() => updateTask(task.id, "recover")}
                                  className={`min-h-11 border px-4 font-black transition ${
                                    recovered
                                      ? "border-amber-200 bg-amber-200 text-zinc-950"
                                      : "border-zinc-700 text-zinc-300 hover:border-amber-200"
                                  }`}
                                >
                                  {recovered ? "Recovered" : "Recovery"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isMutating}
                                  onClick={() => updateTask(task.id, "clear")}
                                  className="min-h-11 border border-zinc-700 px-4 font-black text-zinc-400 transition hover:border-zinc-400"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            </>
          ) : (
            <section className="border border-zinc-800 bg-zinc-950 p-10 text-center">
              <h2 className="text-3xl font-black">No protocol active</h2>
              <p className="mt-2 text-zinc-400">Select a system and activate it.</p>
            </section>
          )}
        </section>

        <aside className="space-y-4">
          <section className="border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
              India time
            </p>
            <p className="mt-2 text-4xl font-black text-emerald-300">
              {snapshot?.indiaNow.clock ?? "--:--:--"}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {snapshot?.indiaNow.display ?? "Asia/Kolkata"} IST
            </p>
          </section>

          <section className="border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-xl font-black">Proof Ledger</h2>
            <p className="mt-1 text-sm text-zinc-500">Stored on the server in `data/habit-pulse.json`.</p>
            <form onSubmit={saveProof} className="mt-4 space-y-3">
              <textarea
                value={proofText}
                onChange={(event) => setProofText(event.target.value)}
                placeholder="Example: Completed walk, solved one medium problem, revised notes..."
                className="min-h-28 w-full border border-zinc-700 bg-[#121514] px-3 py-3 text-sm outline-none transition focus:border-emerald-300"
              />
              <button
                type="submit"
                disabled={isMutating}
                className="min-h-11 w-full border border-emerald-300 bg-emerald-300 font-black text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Proof
              </button>
            </form>
            <div className="mt-4 space-y-2">
              {snapshot?.todaysProof.length ? (
                snapshot.todaysProof.map((entry) => (
                  <article key={entry.id} className="border border-zinc-800 bg-[#141716] p-3">
                    <p className="text-xs font-bold text-zinc-500">{entry.time} IST</p>
                    <p className="mt-1 text-sm text-zinc-200">{entry.text}</p>
                  </article>
                ))
              ) : (
                <p className="border border-zinc-800 bg-[#141716] p-3 text-sm text-zinc-500">
                  No proof saved today.
                </p>
              )}
            </div>
          </section>

          <section className="border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-xl font-black">Reminder Engine</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Browser notification plus server-saved reminder settings.
            </p>
            <div className="mt-4 space-y-3">
              <input
                type="time"
                value={reminder.time}
                onChange={(event) => updateReminder({ time: event.target.value, lastSentDate: "" })}
                className="min-h-11 w-full border border-zinc-700 bg-[#121514] px-3 outline-none"
              />
              <textarea
                value={reminder.message}
                onChange={(event) => updateReminder({ message: event.target.value })}
                className="min-h-20 w-full border border-zinc-700 bg-[#121514] px-3 py-3 text-sm outline-none"
              />
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={requestNotifications}
                  className="min-h-11 border border-zinc-700 font-black text-zinc-300 hover:border-emerald-300"
                >
                  Allow Notifications
                </button>
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => updateReminder({ enabled: !reminder.enabled, lastSentDate: "" })}
                  className={`min-h-11 border font-black ${
                    reminder.enabled
                      ? "border-emerald-300 bg-emerald-300 text-zinc-950"
                      : "border-zinc-700 text-zinc-300"
                  }`}
                >
                  {reminder.enabled ? "Reminder Active" : "Reminder Disabled"}
                </button>
              </div>
              <p className="border border-zinc-800 bg-[#141716] p-3 text-xs text-zinc-500">
                Permission: {notificationStatus}. Trigger: {reminder.time} IST.
              </p>
            </div>
          </section>

          <button
            type="button"
            disabled={isMutating}
            onClick={resetPlan}
            className="min-h-12 w-full border border-red-400/40 bg-red-400/10 font-black text-red-200 transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset Product Data
          </button>
        </aside>
      </section>
    </main>
  );
}
