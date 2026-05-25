export const indiaTimeZone = "Asia/Kolkata";

export function getIndiaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: indiaTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

export function getIndiaClock(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: indiaTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function getIndiaDisplay(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: indiaTimeZone,
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
