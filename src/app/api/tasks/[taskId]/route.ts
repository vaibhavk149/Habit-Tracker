import { NextResponse } from "next/server";
import { updateDb } from "@/lib/data-store";
import { getSnapshot } from "@/lib/snapshot";
import { getIndiaDateKey } from "@/lib/time";

type Params = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const { taskId } = await params;
  const { action } = (await req.json()) as {
    action?: "complete" | "recover" | "clear";
  };
  const today = getIndiaDateKey();

  if (!["complete", "recover", "clear"].includes(action ?? "")) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await updateDb((db) => {
    if (!db.activePlan) return db;

    return {
      ...db,
      activePlan: {
        ...db.activePlan,
        tasks: db.activePlan.tasks.map((task) => {
          if (task.id !== taskId) return task;

          const completedDates = task.completedDates.filter((date) => date !== today);
          const recoveredDates = task.recoveredDates.filter((date) => date !== today);

          if (action === "complete") {
            completedDates.push(today);
          }

          if (action === "recover") {
            recoveredDates.push(today);
          }

          return {
            ...task,
            completedDates,
            recoveredDates,
          };
        }),
      },
    };
  });

  return NextResponse.json(await getSnapshot());
}
