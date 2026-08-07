"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { jakartaDateTime, jakartaTimeNow } from "@/lib/time";

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
      date: jakartaDateTime(date, jakartaTimeNow()),
      note: note || null,
    },
  });

  revalidatePath(`/pelanggan/${customerId}`);
  revalidatePath("/");

  return payment;
}
