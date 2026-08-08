import prisma from "@/lib/prisma";
import { jakartaDateTime, jakartaTimeNow, jakartaDayRange } from "@/lib/time";

const BUFFER_MS = 1000;

export async function nextRecordTime(customerId: string, date: string): Promise<Date> {
  const { start, end } = jakartaDayRange(date);

  const [transactions, payments] = await Promise.all([
    prisma.transaction.findMany({
      where: { customerId, date: { gte: start, lt: end } },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 1,
    }),
    prisma.payment.findMany({
      where: { customerId, date: { gte: start, lt: end } },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 1,
    }),
  ]);

  let lastDate = new Date(0);
  const lastTransaction = transactions[0]?.date;
  const lastPayment = payments[0]?.date;
  if (lastTransaction && lastTransaction.getTime() > lastDate.getTime()) lastDate = lastTransaction;
  if (lastPayment && lastPayment.getTime() > lastDate.getTime()) lastDate = lastPayment;

  const now = jakartaDateTime(date, jakartaTimeNow());

  if (lastDate.getTime() === 0 || now.getTime() > lastDate.getTime()) return now;

  const next = new Date(lastDate.getTime() + BUFFER_MS);
  if (next.getTime() >= end.getTime()) return new Date(end.getTime() - 1);
  return next;
}
