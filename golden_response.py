"""
Golden reference implementation for the Habit Manager prompt.

This Python version mirrors the core product behavior in an executable,
dependency-free form: protocol selection, task completion, recovery,
proof logging, reminders, IST date handling, JSON persistence, and stats.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from datetime import UTC, datetime, timedelta, timezone
from pathlib import Path
from typing import Callable, Literal

IST = timezone(timedelta(hours=5, minutes=30))
DATA_PATH = Path("data/habit-pulse-golden.json")

Difficulty = Literal["Light", "Focused", "Deep"]
TaskAction = Literal["complete", "recover", "clear"]


@dataclass(frozen=True)
class ProtocolTemplateTask:
    id: str
    title: str
    checkpoint: str
    minimum: str
    proof: str
    recovery: str
    time: str
    difficulty: Difficulty


@dataclass(frozen=True)
class Program:
    id: str
    title: str
    signal: str
    duration: int
    identity: str
    operating_rule: str
    checkpoints: list[str]
    tasks: list[ProtocolTemplateTask]


@dataclass
class Task:
    id: str
    title: str
    checkpoint: str
    minimum: str
    proof: str
    recovery: str
    time: str
    difficulty: Difficulty
    completed_dates: list[str]
    recovered_dates: list[str]


@dataclass
class ActivePlan:
    program_id: str
    started_at: str
    tasks: list[Task]


@dataclass
class ProofEntry:
    id: str
    date_key: str
    time: str
    text: str


@dataclass
class Reminder:
    enabled: bool = False
    time: str = "20:30"
    message: str = "Run today's protocol and save proof."
    last_sent_date: str = ""


@dataclass
class Database:
    active_plan: ActivePlan | None
    proof_entries: list[ProofEntry]
    reminder: Reminder


PROGRAMS = [
    Program(
        id="fat-loss",
        title="Fat Loss Protocol",
        signal="Body Rebuild",
        duration=60,
        identity="I am someone who makes the healthy choice visible every day.",
        operating_rule="Win the day with food control, walking, strength, and sleep.",
        checkpoints=["Fuel", "Move", "Recover"],
        tasks=[
            ProtocolTemplateTask("protein", "Protein anchor", "Fuel", "Add protein to one meal", "Write what protein you ate", "If missed, plan tomorrow's first meal", "Lunch", "Focused"),
            ProtocolTemplateTask("walk", "Zone walk", "Move", "Walk 12 minutes", "Write walk minutes", "Do 25 bodyweight squats", "Evening", "Light"),
            ProtocolTemplateTask("sugar", "Liquid calorie lock", "Fuel", "No sugary drink", "Write what you drank instead", "Drink water and restart from next drink", "Whole day", "Light"),
            ProtocolTemplateTask("sleep", "Craving shield sleep", "Recover", "Prepare sleep 20 minutes earlier", "Write bedtime target", "No phone for final 10 minutes", "Night", "Deep"),
        ],
    ),
    Program(
        id="dsa",
        title="100 Days DSA Protocol",
        signal="Interview Engine",
        duration=100,
        identity="I am becoming a problem solver who shows up daily.",
        operating_rule="Every day must create proof: concept, problem, revision, note.",
        checkpoints=["Learn", "Solve", "Review"],
        tasks=[
            ProtocolTemplateTask("concept", "Concept capsule", "Learn", "Revise one pattern for 15 minutes", "Write today's topic", "Watch or read one short explanation", "Start", "Focused"),
            ProtocolTemplateTask("easy", "Easy win", "Solve", "Solve one easy problem", "Write problem name", "Dry run one known solution", "After concept", "Light"),
            ProtocolTemplateTask("medium", "Interview rep", "Solve", "Attempt one medium problem for 35 minutes", "Write approach, even if incomplete", "Read editorial and code tomorrow", "Main block", "Deep"),
            ProtocolTemplateTask("review", "Pattern memory", "Review", "Write three-line note", "Write the pattern clue", "Add one mistake you made", "End", "Focused"),
        ],
    ),
    Program(
        id="study",
        title="Deep Study Protocol",
        signal="Focus Forge",
        duration=45,
        identity="I protect attention before I chase motivation.",
        operating_rule="First remove distraction, then study, then prove memory.",
        checkpoints=["Prime", "Focus", "Recall"],
        tasks=[
            ProtocolTemplateTask("plan", "Three-target launch", "Prime", "Write three study targets", "Log the three targets", "Pick only one target and begin", "Morning", "Light"),
            ProtocolTemplateTask("block", "Deep block", "Focus", "25 minutes phone away", "Write topic studied", "Do one 10-minute restart block", "Main session", "Deep"),
            ProtocolTemplateTask("recall", "Memory test", "Recall", "Recall five points without notes", "Write what you remembered", "Rewrite weak points once", "After study", "Focused"),
        ],
    ),
    Program(
        id="english",
        title="English Confidence Protocol",
        signal="Voice Builder",
        duration=50,
        identity="I speak before I feel perfect.",
        operating_rule="Small speaking proof every day beats silent preparation.",
        checkpoints=["Input", "Speak", "Reflect"],
        tasks=[
            ProtocolTemplateTask("phrases", "Phrase capture", "Input", "Learn three useful phrases", "Write the phrases", "Reuse yesterday's phrases in new sentences", "Morning", "Light"),
            ProtocolTemplateTask("voice", "Voice note rep", "Speak", "Record 60 seconds", "Write topic spoken", "Read one paragraph aloud", "Evening", "Focused"),
            ProtocolTemplateTask("review", "Pronunciation mirror", "Reflect", "Notice one improvement", "Write one mistake and one win", "Repeat only the difficult sentence", "Night", "Focused"),
        ],
    ),
]


class HabitManagerError(ValueError):
    pass


def india_now() -> datetime:
    return datetime.now(UTC).astimezone(IST)


def india_date_key(moment: datetime | None = None) -> str:
    return (moment or india_now()).astimezone(IST).strftime("%Y-%m-%d")


def india_clock(moment: datetime | None = None) -> str:
    return (moment or india_now()).astimezone(IST).strftime("%H:%M:%S")


def get_program(program_id: str) -> Program:
    for program in PROGRAMS:
        if program.id == program_id:
            return program
    raise HabitManagerError(f"Program not found: {program_id}")


def create_tasks(program: Program) -> list[Task]:
    return [
        Task(
            id=f"{program.id}-{task.id}",
            title=task.title,
            checkpoint=task.checkpoint,
            minimum=task.minimum,
            proof=task.proof,
            recovery=task.recovery,
            time=task.time,
            difficulty=task.difficulty,
            completed_dates=[],
            recovered_dates=[],
        )
        for task in program.tasks
    ]


def initial_db() -> Database:
    return Database(active_plan=None, proof_entries=[], reminder=Reminder())


def task_from_dict(raw: dict) -> Task:
    return Task(
        id=raw["id"],
        title=raw["title"],
        checkpoint=raw["checkpoint"],
        minimum=raw["minimum"],
        proof=raw["proof"],
        recovery=raw["recovery"],
        time=raw["time"],
        difficulty=raw["difficulty"],
        completed_dates=list(raw.get("completed_dates", [])),
        recovered_dates=list(raw.get("recovered_dates", [])),
    )


def db_from_dict(raw: dict) -> Database:
    plan = raw.get("active_plan")
    reminder = raw.get("reminder") or {}
    return Database(
        active_plan=ActivePlan(
            program_id=plan["program_id"],
            started_at=plan["started_at"],
            tasks=[task_from_dict(task) for task in plan.get("tasks", [])],
        )
        if plan
        else None,
        proof_entries=[ProofEntry(**entry) for entry in raw.get("proof_entries", [])],
        reminder=Reminder(**{**asdict(Reminder()), **reminder}),
    )


def ensure_db() -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_PATH.exists():
        write_db(initial_db())


def read_db() -> Database:
    ensure_db()
    return db_from_dict(json.loads(DATA_PATH.read_text(encoding="utf-8")))


def write_db(db: Database) -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(json.dumps(asdict(db), indent=2), encoding="utf-8")


def update_db(updater: Callable[[Database], Database]) -> Database:
    db = updater(read_db())
    write_db(db)
    return db


def start_program(program_id: str) -> Database:
    program = get_program(program_id)
    return update_db(
        lambda db: Database(
            active_plan=ActivePlan(program.id, india_date_key(), create_tasks(program)),
            proof_entries=[],
            reminder=db.reminder,
        )
    )


def reset_plan() -> Database:
    return update_db(lambda db: Database(None, [], db.reminder))


def update_task(task_id: str, action: TaskAction) -> Database:
    if action not in {"complete", "recover", "clear"}:
        raise HabitManagerError("Invalid action. Use complete, recover, or clear.")

    today = india_date_key()

    def updater(db: Database) -> Database:
        if not db.active_plan:
            raise HabitManagerError("No active plan.")

        found = False
        for task in db.active_plan.tasks:
            if task.id != task_id:
                continue
            found = True
            task.completed_dates = [date for date in task.completed_dates if date != today]
            task.recovered_dates = [date for date in task.recovered_dates if date != today]
            if action == "complete":
                task.completed_dates.append(today)
            if action == "recover":
                task.recovered_dates.append(today)

        if not found:
            raise HabitManagerError(f"Task not found: {task_id}")
        return db

    return update_db(updater)


def add_proof(text: str) -> Database:
    clean_text = text.strip()
    if not clean_text:
        raise HabitManagerError("Proof text is required.")

    def updater(db: Database) -> Database:
        db.proof_entries.insert(
            0,
            ProofEntry(
                id=f"proof-{int(datetime.now().timestamp() * 1000)}",
                date_key=india_date_key(),
                time=india_clock(),
                text=clean_text,
            ),
        )
        return db

    return update_db(updater)


def update_reminder(enabled: bool | None, time: str | None, message: str | None) -> Database:
    def updater(db: Database) -> Database:
        if enabled is not None:
            db.reminder.enabled = enabled
        if time is not None:
            db.reminder.time = time
        if message is not None:
            db.reminder.message = message.strip() or db.reminder.message
        return db

    return update_db(updater)


def calculate_streak(plan: ActivePlan | None) -> int:
    if not plan:
        return 0

    streak = 0
    cursor = india_now()
    while True:
        key = india_date_key(cursor)
        has_activity = any(
            key in task.completed_dates or key in task.recovered_dates
            for task in plan.tasks
        )
        if not has_activity:
            return streak
        streak += 1
        cursor -= timedelta(days=1)


def snapshot(db: Database) -> dict:
    today = india_date_key()
    plan = db.active_plan
    program = get_program(plan.program_id) if plan else None
    completed_today = sum(today in task.completed_dates for task in plan.tasks) if plan else 0
    recovered_today = sum(today in task.recovered_dates for task in plan.tasks) if plan else 0
    total_tasks = len(plan.tasks) if plan else 0
    progress = round((completed_today / total_tasks) * 100) if total_tasks else 0
    resilience = round(((completed_today + recovered_today) / total_tasks) * 100) if total_tasks else 0
    current_day = 0
    if plan and program:
        started = datetime.fromisoformat(plan.started_at).replace(tzinfo=IST)
        current_day = min((india_now().date() - started.date()).days + 1, program.duration)

    return {
        "active_program": asdict(program) if program else None,
        "active_plan": asdict(plan) if plan else None,
        "todays_proof": [asdict(entry) for entry in db.proof_entries if entry.date_key == today],
        "reminder": asdict(db.reminder),
        "india_now": {"date_key": today, "clock": india_clock()},
        "stats": {
            "completed_today": completed_today,
            "recovered_today": recovered_today,
            "total_tasks": total_tasks,
            "progress": progress,
            "resilience": resilience,
            "streak": calculate_streak(plan),
            "current_day": current_day,
        },
    }


def print_json(value: object) -> None:
    print(json.dumps(value, indent=2))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Habit Pulse OS golden reference")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("programs", help="List available programs")
    sub.add_parser("snapshot", help="Show current app snapshot")
    start = sub.add_parser("start", help="Start a program")
    start.add_argument("program_id")
    task = sub.add_parser("task", help="Update a task")
    task.add_argument("task_id")
    task.add_argument("action", choices=["complete", "recover", "clear"])
    proof = sub.add_parser("proof", help="Save proof text")
    proof.add_argument("text")
    reminder = sub.add_parser("reminder", help="Update reminder settings")
    reminder.add_argument("--enabled", choices=["true", "false"])
    reminder.add_argument("--time")
    reminder.add_argument("--message")
    sub.add_parser("reset", help="Reset active plan and proof entries")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        if args.command == "programs":
            print_json([asdict(program) for program in PROGRAMS])
        elif args.command == "snapshot":
            print_json(snapshot(read_db()))
        elif args.command == "start":
            print_json(snapshot(start_program(args.program_id)))
        elif args.command == "task":
            print_json(snapshot(update_task(args.task_id, args.action)))
        elif args.command == "proof":
            print_json(snapshot(add_proof(args.text)))
        elif args.command == "reminder":
            enabled = None if args.enabled is None else args.enabled == "true"
            print_json(snapshot(update_reminder(enabled, args.time, args.message)))
        elif args.command == "reset":
            print_json(snapshot(reset_plan()))
        return 0
    except HabitManagerError as error:
        print_json({"success": False, "error": str(error)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
