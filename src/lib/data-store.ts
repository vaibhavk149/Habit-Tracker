import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  ActivePlan,
  defaultReminder,
  ProofEntry,
  ReminderSettings,
} from "./programs";

type Database = {
  activePlan: ActivePlan | null;
  proofEntries: ProofEntry[];
  reminder: ReminderSettings;
};

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "habit-pulse.json");

const initialDb: Database = {
  activePlan: null,
  proofEntries: [],
  reminder: defaultReminder,
};

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dbPath, "utf-8");
  } catch {
    await writeFile(dbPath, JSON.stringify(initialDb, null, 2));
  }
}

export async function readDb(): Promise<Database> {
  await ensureDataFile();
  const raw = await readFile(dbPath, "utf-8");
  const parsed = JSON.parse(raw) as Partial<Database>;

  return {
    activePlan: parsed.activePlan ?? null,
    proofEntries: Array.isArray(parsed.proofEntries) ? parsed.proofEntries : [],
    reminder: {
      ...defaultReminder,
      ...(parsed.reminder ?? {}),
    },
  };
}

export async function writeDb(db: Database) {
  await ensureDataFile();
  await writeFile(dbPath, JSON.stringify(db, null, 2));
}

export async function updateDb(updater: (db: Database) => Database) {
  const db = await readDb();
  const nextDb = updater(db);
  await writeDb(nextDb);
  return nextDb;
}
