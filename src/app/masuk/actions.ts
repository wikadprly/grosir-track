"use server";

import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 60 * 1000;

export async function loginWithPin(pin: string): Promise<{ success: true } | { success: false; error: string }> {
  if (!/^\d{4,8}$/.test(pin)) {
    return { success: false, error: "Format PIN tidak valid." };
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

  // Lockout disimpan di database agar tahan restart/deploy
  // dan tidak bisa direset hanya dengan membuat ulang koneksi.
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const waitSec = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);
    return { success: false, error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${waitSec} detik.` };
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
    if (user.failedAttempts + 1 >= MAX_ATTEMPTS) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: new Date(Date.now() + LOCK_WINDOW_MS),
          failedAttempts: 0,
        },
      });
      return { success: false, error: "PIN salah. Coba lagi dalam 60 detik." };
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: { increment: 1 } },
    });
    const remaining = Math.max(0, MAX_ATTEMPTS - (user.failedAttempts + 1));
    return {
      success: false,
      error: remaining > 0 ? `PIN salah. Sisa percobaan: ${remaining}.` : "PIN salah.",
    };
  }

  if (needsUpgrade) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pin: await bcrypt.hash(pin, 10),
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
  } else if (user.failedAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  }

  await createSession(user.id);
  return { success: true };
}
