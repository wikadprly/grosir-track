const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

export const JAKARTA_TIMEZONE = "Asia/Jakarta";

function shiftedToJakarta(date: Date): Date {
  return new Date(date.getTime() + JAKARTA_OFFSET_MS);
}

export function startOfJakartaDay(date: Date = new Date()): Date {
  const j = shiftedToJakarta(date);
  const midnightUtc = Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate());
  return new Date(midnightUtc - JAKARTA_OFFSET_MS);
}

export function endOfJakartaDay(date: Date = new Date()): Date {
  return new Date(startOfJakartaDay(date).getTime() + 24 * 60 * 60 * 1000);
}

export function startOfJakartaMonth(date: Date = new Date()): Date {
  const j = shiftedToJakarta(date);
  const firstUtc = Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), 1);
  return new Date(firstUtc - JAKARTA_OFFSET_MS);
}

export function startOfNextJakartaMonth(date: Date = new Date()): Date {
  const j = shiftedToJakarta(date);
  const firstUtc = Date.UTC(j.getUTCFullYear(), j.getUTCMonth() + 1, 1);
  return new Date(firstUtc - JAKARTA_OFFSET_MS);
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
  const utcMs = Date.UTC(y, (m ?? 1) - 1, d ?? 1, hh - 7, mm, ss);
  return new Date(utcMs);
}

export function jakartaTimeNow(): string {
  const j = shiftedToJakarta(new Date());
  return [j.getUTCHours(), j.getUTCMinutes(), j.getUTCSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function jakartaDateKey(date: Date): string {
  const j = shiftedToJakarta(date);
  const mm = String(j.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(j.getUTCDate()).padStart(2, "0");
  return `${j.getUTCFullYear()}-${mm}-${dd}`;
}

export function jakartaDayRange(dateStr: string): { start: Date; end: Date } {
  const start = jakartaDateTime(dateStr);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

export function jakartaTimeShort(date: Date): string {
  const j = shiftedToJakarta(date);
  const hh = String(j.getUTCHours()).padStart(2, "0");
  const mm = String(j.getUTCMinutes()).padStart(2, "0");
  return `${hh}.${mm}`;
}
