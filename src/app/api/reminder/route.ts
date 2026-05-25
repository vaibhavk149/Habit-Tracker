import { NextResponse } from "next/server";
import { updateDb } from "@/lib/data-store";
import { getSnapshot } from "@/lib/snapshot";

export async function PATCH(req: Request) {
  const { enabled, time, message, lastSentDate } = (await req.json()) as {
    enabled?: boolean;
    time?: string;
    message?: string;
    lastSentDate?: string;
  };

  await updateDb((db) => ({
    ...db,
    reminder: {
      ...db.reminder,
      enabled: enabled ?? db.reminder.enabled,
      time: time ?? db.reminder.time,
      message: message ?? db.reminder.message,
      lastSentDate: lastSentDate ?? db.reminder.lastSentDate,
    },
  }));

  return NextResponse.json(await getSnapshot());
}
