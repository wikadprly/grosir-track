"use server";

import prisma from "@/lib/prisma";

export async function createPayment(
  customerId: string,
  amount: number,
  date: string,
  note?: string
) {
  const payment = await prisma.payment.create({
    data: {
      customerId,
      amount,
      date: new Date(date),
      note: note || null,
    },
  });

  return payment;
}
