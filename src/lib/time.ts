export const JAKARTA_TIMEZONE = "Asia/Jakarta";

interface JakartaParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const dtf = new Intl.DateTimeFormat("en-CA", {
  timeZone: JAKARTA_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function jakartaParts(date: Date): JakartaParts {
  const parts = dtf.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function jakartaToLocalDate(date: Date): Date {
  const p = jakartaParts(date);
  return new Date(p.year, p.month - 1, p.day);
}

export function startOfJakartaDay(date: Date = new Date()): Date {
  const local = jakartaToLocalDate(date);
  return local;
}

export function endOfJakartaDay(date: Date = new Date()): Date {
  return new Date(startOfJakartaDay(date).getTime() + 24 * 60 * 60 * 1000);
}

export function startOfJakartaMonth(date: Date = new Date()): Date {
  const p = jakartaParts(date);
  return new Date(p.year, p.month - 1, 1);
}

export function startOfNextJakartaMonth(date: Date = new Date()): Date {
  const p = jakartaParts(date);
  return new Date(p.year, p.month, 1);
}

export function jakartaDateTime(dateStr: string, time?: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  let hh = 0;
  let mm = 0;
  let ss = 0;
  if (time) {
    const parts = time.split(":").map(Number);
    hh = parts[0] ?? 0;
    mm = parts[1] ?? 0;
    ss = parts[2] ?? 0;
  }
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh, mm, ss);
}

export function jakartaTimeNow(): string {
  const p = jakartaParts(new Date());
  return [p.hour, p.minute, p.second]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function jakartaDateKey(date: Date): string {
  const p = jakartaParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function jakartaDayRange(dateStr: string): { start: Date; end: Date } {
  const start = jakartaDateTime(dateStr);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

export function jakartaTimeShort(date: Date): string {
  const p = jakartaParts(date);
  return `${String(p.hour).padStart(2, "0")}.${String(p.minute).padStart(2, "0")}`;
}
