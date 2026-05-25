import { NextResponse } from "next/server";
import { updateDb } from "@/lib/data-store";
import { createTasks, getProgram } from "@/lib/programs";
import { getSnapshot } from "@/lib/snapshot";
import { getIndiaDateKey } from "@/lib/time";

export async function GET() {
  return NextResponse.json(await getSnapshot());
}

export async function POST(req: Request) {
  const { programId } = (await req.json()) as { programId?: string };
  const program = programId ? getProgram(programId) : null;

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  await updateDb((db) => ({
    ...db,
    activePlan: {
      programId: program.id,
      startedAt: getIndiaDateKey(),
      tasks: createTasks(program),
    },
    proofEntries: [],
  }));

  return NextResponse.json(await getSnapshot());
}

export async function DELETE() {
  await updateDb((db) => ({
    ...db,
    activePlan: null,
    proofEntries: [],
  }));

  return NextResponse.json(await getSnapshot());
}
