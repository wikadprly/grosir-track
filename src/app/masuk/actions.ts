"use server";

import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 60 * 1000;

let failureCount = 0;
let firstFailureAt = 0;

function isLockedOut(): boolean {
  if (failureCount === 0) return false;
  const elapsed = Date.now() - firstFailureAt;
  if (elapsed > LOCK_WINDOW_MS) {
    failureCount = 0;
    firstFailureAt = 0;
    return false;
  }
  return failureCount >= MAX_ATTEMPTS;
}

function recordFailure(): void {
  if (failureCount === 0) firstFailureAt = Date.now();
  failureCount += 1;
}

export async function loginWithPin(pin: string): Promise<{ success: true } | { success: false; error: string }> {
  if (!/^\d{4,8}$/.test(pin)) {
    return { success: false, error: "Format PIN tidak valid." };
  }

  if (isLockedOut()) {
    const waitSec = Math.ceil((LOCK_WINDOW_MS - (Date.now() - firstFailureAt)) / 1000);
    return { success: false, error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${waitSec} detik.` };
  }

  let user = null;
  try {
    user = await prisma.user.findFirst();
  } catch {
    return { success: false, error: "Tidak dapat menghubungi database. Coba lagi." };
  }

  if (!user) {
    return { success: false, error: "Belum ada akun terdaftar. Jalankan seed database terlebih dahulu." };
  }

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
    recordFailure();
    const remaining = Math.max(0, MAX_ATTEMPTS - failureCount);
    return {
      success: false,
      error: remaining > 0 ? `PIN salah. Sisa percobaan: ${remaining}.` : "PIN salah.",
    };
  }

  if (needsUpgrade) {
    await prisma.user.update({
      where: { id: user.id },
      data: { pin: await bcrypt.hash(pin, 10) },
    });
  }

  failureCount = 0;
  firstFailureAt = 0;
  await createSession(user.id);
  return { success: true };
}
