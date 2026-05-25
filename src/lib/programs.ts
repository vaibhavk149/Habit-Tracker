export type Difficulty = "Light" | "Focused" | "Deep";

export type ProtocolTask = {
  id: string;
  title: string;
  checkpoint: string;
  minimum: string;
  proof: string;
  recovery: string;
  time: string;
  difficulty: Difficulty;
  completedDates: string[];
  recoveredDates: string[];
};

export type Program = {
  id: string;
  title: string;
  signal: string;
  duration: number;
  identity: string;
  operatingRule: string;
  checkpoints: string[];
  tasks: Omit<ProtocolTask, "completedDates" | "recoveredDates">[];
};

export type ActivePlan = {
  programId: string;
  startedAt: string;
  tasks: ProtocolTask[];
};

export type ProofEntry = {
  id: string;
  dateKey: string;
  time: string;
  text: string;
};

export type ReminderSettings = {
  enabled: boolean;
  time: string;
  message: string;
  lastSentDate: string;
};

export const defaultReminder: ReminderSettings = {
  enabled: false,
  time: "20:30",
  message: "Run today's protocol and save proof.",
  lastSentDate: "",
};

export const programs: Program[] = [
  {
    id: "fat-loss",
    title: "Fat Loss Protocol",
    signal: "Body Rebuild",
    duration: 60,
    identity: "I am someone who makes the healthy choice visible every day.",
    operatingRule: "Win the day with food control, walking, strength, and sleep.",
    checkpoints: ["Fuel", "Move", "Recover"],
    tasks: [
      {
        id: "protein",
        title: "Protein anchor",
        checkpoint: "Fuel",
        minimum: "Add protein to one meal",
        proof: "Write what protein you ate",
        recovery: "If missed, plan tomorrow's first meal",
        time: "Lunch",
        difficulty: "Focused",
      },
      {
        id: "walk",
        title: "Zone walk",
        checkpoint: "Move",
        minimum: "Walk 12 minutes",
        proof: "Write walk minutes",
        recovery: "Do 25 bodyweight squats",
        time: "Evening",
        difficulty: "Light",
      },
      {
        id: "sugar",
        title: "Liquid calorie lock",
        checkpoint: "Fuel",
        minimum: "No sugary drink",
        proof: "Write what you drank instead",
        recovery: "Drink water and restart from next drink",
        time: "Whole day",
        difficulty: "Light",
      },
      {
        id: "sleep",
        title: "Craving shield sleep",
        checkpoint: "Recover",
        minimum: "Prepare sleep 20 minutes earlier",
        proof: "Write bedtime target",
        recovery: "No phone for final 10 minutes",
        time: "Night",
        difficulty: "Deep",
      },
    ],
  },
  {
    id: "dsa",
    title: "100 Days DSA Protocol",
    signal: "Interview Engine",
    duration: 100,
    identity: "I am becoming a problem solver who shows up daily.",
    operatingRule: "Every day must create proof: concept, problem, revision, note.",
    checkpoints: ["Learn", "Solve", "Review"],
    tasks: [
      {
        id: "concept",
        title: "Concept capsule",
        checkpoint: "Learn",
        minimum: "Revise one pattern for 15 minutes",
        proof: "Write today's topic",
        recovery: "Watch or read one short explanation",
        time: "Start",
        difficulty: "Focused",
      },
      {
        id: "easy",
        title: "Easy win",
        checkpoint: "Solve",
        minimum: "Solve one easy problem",
        proof: "Write problem name",
        recovery: "Dry run one known solution",
        time: "After concept",
        difficulty: "Light",
      },
      {
        id: "medium",
        title: "Interview rep",
        checkpoint: "Solve",
        minimum: "Attempt one medium problem for 35 minutes",
        proof: "Write approach, even if incomplete",
        recovery: "Read editorial and code tomorrow",
        time: "Main block",
        difficulty: "Deep",
      },
      {
        id: "review",
        title: "Pattern memory",
        checkpoint: "Review",
        minimum: "Write three-line note",
        proof: "Write the pattern clue",
        recovery: "Add one mistake you made",
        time: "End",
        difficulty: "Focused",
      },
    ],
  },
  {
    id: "study",
    title: "Deep Study Protocol",
    signal: "Focus Forge",
    duration: 45,
    identity: "I protect attention before I chase motivation.",
    operatingRule: "First remove distraction, then study, then prove memory.",
    checkpoints: ["Prime", "Focus", "Recall"],
    tasks: [
      {
        id: "plan",
        title: "Three-target launch",
        checkpoint: "Prime",
        minimum: "Write three study targets",
        proof: "Log the three targets",
        recovery: "Pick only one target and begin",
        time: "Morning",
        difficulty: "Light",
      },
      {
        id: "block",
        title: "Deep block",
        checkpoint: "Focus",
        minimum: "25 minutes phone away",
        proof: "Write topic studied",
        recovery: "Do one 10-minute restart block",
        time: "Main session",
        difficulty: "Deep",
      },
      {
        id: "recall",
        title: "Memory test",
        checkpoint: "Recall",
        minimum: "Recall five points without notes",
        proof: "Write what you remembered",
        recovery: "Rewrite weak points once",
        time: "After study",
        difficulty: "Focused",
      },
    ],
  },
  {
    id: "english",
    title: "English Confidence Protocol",
    signal: "Voice Builder",
    duration: 50,
    identity: "I speak before I feel perfect.",
    operatingRule: "Small speaking proof every day beats silent preparation.",
    checkpoints: ["Input", "Speak", "Reflect"],
    tasks: [
      {
        id: "phrases",
        title: "Phrase capture",
        checkpoint: "Input",
        minimum: "Learn three useful phrases",
        proof: "Write the phrases",
        recovery: "Reuse yesterday's phrases in new sentences",
        time: "Morning",
        difficulty: "Light",
      },
      {
        id: "voice",
        title: "Voice note rep",
        checkpoint: "Speak",
        minimum: "Record 60 seconds",
        proof: "Write topic spoken",
        recovery: "Read one paragraph aloud",
        time: "Evening",
        difficulty: "Focused",
      },
      {
        id: "review",
        title: "Pronunciation mirror",
        checkpoint: "Reflect",
        minimum: "Notice one improvement",
        proof: "Write one mistake and one win",
        recovery: "Repeat only the difficult sentence",
        time: "Night",
        difficulty: "Focused",
      },
    ],
  },
];

export function createTasks(program: Program): ProtocolTask[] {
  return program.tasks.map((task) => ({
    ...task,
    id: `${program.id}-${task.id}`,
    completedDates: [],
    recoveredDates: [],
  }));
}

export function getProgram(programId: string) {
  return programs.find((program) => program.id === programId) ?? null;
}
