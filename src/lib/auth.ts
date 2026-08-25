import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { signSession, verifySessionToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function createSession(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenVersion: true },
  });
  if (!user) throw new Error("Akun tidak ditemukan.");
  const token = await signSession(userId, SESSION_MAX_AGE, user.tokenVersion);
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

// Memverifikasi tanda tangan + masa berlaku token, lalu mencocokkan `ver`
// dengan tokenVersion di database sehingga ganti PIN membatalkan semua
// sesi lama (token tanpa `ver` dianggap versi 0 untuk transisi upgrade).
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const payload = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { tokenVersion: true },
  });
  if (!user) return null;
  if ((payload.ver ?? 0) !== user.tokenVersion) return null;

  return payload.sub;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSessionUserId()) !== null;
}

// Untuk server components & server actions: lempar ke halaman masuk jika belum login.
export async function requireSession(): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/masuk");
}
