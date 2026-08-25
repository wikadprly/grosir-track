"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { nextRecordTime } from "@/lib/recordTime";
import { requireSession } from "@/lib/auth";

export async function createPayment(
  customerId: string,
  amount: number,
  date: string,
  note?: string,
  clientRef?: string
) {
  await requireSession();
  if (!customerId) throw new Error("Pelanggan tidak valid");
  if (!date) throw new Error("Tanggal harus diisi");
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("Nominal pembayaran tidak valid");

  // clientRef membuat sync ulang dari antrean offline bersifat idempoten.
  if (clientRef) {
    const existing = await prisma.payment.findUnique({
      where: { clientRef },
      select: { id: true },
    });
    if (existing) return existing.id;
  }

  const paymentId = await prisma.$transaction(async (tx) => {
    const recordDate = await nextRecordTime(tx, customerId, date);
    const payment = await tx.payment.create({
      data: {
        customerId,
        amount,
        date: recordDate,
        note: note || null,
        clientRef: clientRef ?? null,
      },
      select: { id: true },
    });
    return payment.id;
  });

  revalidatePath(`/pelanggan/${customerId}`);
  revalidatePath("/");

  return paymentId;
}
