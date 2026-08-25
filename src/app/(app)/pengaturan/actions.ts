"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { requireSession, destroySession, createSession } from "@/lib/auth";

export async function getUserProfile() {
  await requireSession();
  const user = await prisma.user.findFirst();
  return user ? { name: user.name } : null;
}

export async function changePin(
  currentPin: string,
  newPin: string,
  confirmPin: string
): Promise<{ success: true } | { success: false; error: string }> {
  await requireSession();

  if (!/^\d{4,8}$/.test(currentPin)) {
    return { success: false, error: "Format PIN saat ini tidak valid." };
  }
  if (!/^\d{6}$/.test(newPin)) {
    return { success: false, error: "PIN baru harus terdiri dari 6 angka." };
  }
  if (newPin !== confirmPin) {
    return { success: false, error: "Konfirmasi PIN baru tidak cocok." };
  }
  if (newPin === currentPin) {
    return { success: false, error: "PIN baru tidak boleh sama dengan PIN lama." };
  }

  const user = await prisma.user.findFirst();
  if (!user) {
    return { success: false, error: "Akun tidak ditemukan." };
  }

  const stored = user.pin;
  const isHashed = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");
  const ok = isHashed ? await bcrypt.compare(currentPin, stored) : currentPin === stored;
  if (!ok) {
    return { success: false, error: "PIN saat ini salah." };
  }

  // Naikkan tokenVersion: semua sesi lama (device lain / cookie curian)
  // langsung tidak valid, lalu terbitkan sesi baru untuk device ini.
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      pin: await bcrypt.hash(newPin, 10),
      tokenVersion: { increment: 1 },
      failedAttempts: 0,
      lockedUntil: null,
    },
    select: { id: true },
  });
  await destroySession();
  await createSession(updated.id);

  return { success: true };
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/masuk");
}
