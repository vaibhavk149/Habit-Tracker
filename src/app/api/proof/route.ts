import { NextResponse } from "next/server";
import { updateDb } from "@/lib/data-store";
import { getSnapshot } from "@/lib/snapshot";
import { getIndiaClock, getIndiaDateKey } from "@/lib/time";

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text?: string };
  const cleanText = text?.trim();

  if (!cleanText) {
    return NextResponse.json({ error: "Proof text is required" }, { status: 400 });
  }

  await updateDb((db) => ({
    ...db,
    proofEntries: [
      {
        id: `proof-${Date.now()}`,
        dateKey: getIndiaDateKey(),
        time: getIndiaClock(),
        text: cleanText,
      },
      ...db.proofEntries,
    ],
  }));

  return NextResponse.json(await getSnapshot());
}
