"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { nextRecordTime } from "@/lib/recordTime";
import { requireSession } from "@/lib/auth";

export async function createPayment(
  customerId: string,
  amount: number,
  date: string,
  note?: string
) {
  await requireSession();
  if (!customerId) throw new Error("Pelanggan tidak valid");
  if (!date) throw new Error("Tanggal harus diisi");
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("Nominal pembayaran tidak valid");

  const payment = await prisma.payment.create({
    data: {
      customerId,
      amount,
      date: await nextRecordTime(customerId, date),
      note: note || null,
    },
  });

  revalidatePath(`/pelanggan/${customerId}`);
  revalidatePath("/");

  return payment;
}
