import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { signSession, verifySessionToken } from "@/lib/jwt";

export async function createSession(userId: string): Promise<void> {
  const token = await signSession(userId, SESSION_MAX_AGE);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const payload = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  return payload?.sub ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSessionUserId()) !== null;
}

// Untuk server components & server actions: lempar ke halaman masuk jika belum login.
export async function requireSession(): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/masuk");
}
