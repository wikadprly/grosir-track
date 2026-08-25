"use server";

import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 60 * 1000;

type UserRow = {
  id: string;
  pin: string;
  recoveryPin: string | null;
  failedAttempts: number;
  lockedUntil: Date | null;
};

async function findUser(): Promise<UserRow | null> {
  return prisma.user.findFirst({
    select: { id: true, pin: true, recoveryPin: true, failedAttempts: true, lockedUntil: true },
  });
}

function lockMessage(user: UserRow): string {
  const waitSec = Math.ceil(((user.lockedUntil?.getTime() ?? 0) - Date.now()) / 1000);
  return `Terlalu banyak percobaan gagal. Coba lagi dalam ${waitSec} detik.`;
}

// Lockout disimpan di database agar tahan restart/deploy
// dan tidak bisa direset hanya dengan membuat ulang koneksi.
function checkLockout(user: UserRow): string | null {
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    return lockMessage(user);
  }
  return null;
}

async function recordFailure(user: UserRow): Promise<string> {
  if (user.failedAttempts + 1 >= MAX_ATTEMPTS) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lockedUntil: new Date(Date.now() + LOCK_WINDOW_MS),
        failedAttempts: 0,
      },
    });
    return "PIN salah. Coba lagi dalam 60 detik.";
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: { increment: 1 } },
  });
  const remaining = Math.max(0, MAX_ATTEMPTS - (user.failedAttempts + 1));
  return remaining > 0 ? `PIN salah. Sisa percobaan: ${remaining}.` : "PIN salah.";
}

async function clearFailures(userId: string, extra: Record<string, unknown> = {}): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { failedAttempts: 0, lockedUntil: null, ...extra },
  });
}

export async function loginWithPin(pin: string): Promise<{ success: true } | { success: false; error: string }> {
  if (!/^\d{4,8}$/.test(pin)) {
    return { success: false, error: "Format PIN tidak valid." };
  }

  let user = null;
  try {
    user = await findUser();
  } catch {
    return { success: false, error: "Tidak dapat menghubungi database. Coba lagi." };
  }

  if (!user) {
    return { success: false, error: "Belum ada akun terdaftar. Jalankan seed database terlebih dahulu." };
  }

  const locked = checkLockout(user);
  if (locked) return { success: false, error: locked };

  const stored = user.pin;
  let ok = false;
  let needsUpgrade = false;

  if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
    ok = await bcrypt.compare(pin, stored);
  } else {
    // Pin lama masih polos (dari seed versi awal): cocokkan langsung lalu tingkatkan ke hash.
    ok = pin === stored;
    needsUpgrade = ok;
  }

  if (!ok) {
    const error = await recordFailure(user);
    return { success: false, error };
  }

  await clearFailures(user.id, needsUpgrade ? { pin: await bcrypt.hash(pin, 10) } : {});
  await createSession(user.id);
  return { success: true };
}

// Jalur pemulihan saat PIN utama lupa: masuk memakai PIN cadangan.
// Sesi yang lahir ditandai `rec`, sehingga halaman ubah PIN tidak
// menuntut PIN lama dan sesi-sesi lama langsung dibatalkan.
export async function loginWithRecoveryPin(
  pin: string
): Promise<{ success: true; via: "recovery" } | { success: false; error: string }> {
  if (!/^\d{6}$/.test(pin)) {
    return { success: false, error: "Format PIN cadangan tidak valid." };
  }

  let user = null;
  try {
    user = await findUser();
  } catch {
    return { success: false, error: "Tidak dapat menghubungi database. Coba lagi." };
  }

  if (!user) {
    return { success: false, error: "Belum ada akun terdaftar." };
  }

  const locked = checkLockout(user);
  if (locked) return { success: false, error: locked };

  if (!user.recoveryPin || !user.recoveryPin.startsWith("$2")) {
    return { success: false, error: "PIN cadangan belum diatur. Hubungi pengembang aplikasi." };
  }

  const ok = await bcrypt.compare(pin, user.recoveryPin);
  if (!ok) {
    const error = await recordFailure(user);
    return { success: false, error };
  }

  // tokenVersion naik: sesi lama (mis. dari device lain) ikut hangus.
  const fresh = await prisma.user.update({
    where: { id: user.id },
    data: { tokenVersion: { increment: 1 }, failedAttempts: 0, lockedUntil: null },
    select: { tokenVersion: true },
  });
  await createSession(user.id, { tokenVersion: fresh.tokenVersion, recovery: true });
  return { success: true, via: "recovery" };
}
