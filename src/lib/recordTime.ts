import prisma from "@/lib/prisma";
import type { Prisma } from "../../generated/prisma/client";
import { jakartaDateTime, jakartaTimeNow, jakartaDayRange } from "@/lib/time";

const BUFFER_MS = 1000;

type Db = Prisma.TransactionClient | typeof prisma;

// Menjamin timestamp catatan naik secara monoton dalam satu hari Jakarta.
// Dipanggil di dalam $transaction bersama pg_advisory_xact_lock agar dua
// pencatatan bersamaan untuk pelanggan yang sama tidak menghasilkan
// timestamp identik (urutan buku bon tetap terjaga).
export async function nextRecordTime(db: Db, customerId: string, date: string): Promise<Date> {
  const { start, end } = jakartaDayRange(date);

  // Kunci transaksi per pelanggan (otomatis lepas saat commit/rollback).
  // Dibungkus CTE karena kolom void tidak bisa dideserialize driver pg.
  await db.$queryRaw`WITH pglock AS (SELECT pg_advisory_xact_lock(hashtext(${customerId}))) SELECT 1 AS locked FROM pglock`;

  const [transactions, payments] = await Promise.all([
    db.transaction.findMany({
      where: { customerId, date: { gte: start, lt: end } },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 1,
    }),
    db.payment.findMany({
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

// Kompatibilitas untuk pemanggilan di luar transaksi.
export async function nextRecordTimeStandalone(customerId: string, date: string): Promise<Date> {
  return nextRecordTime(prisma, customerId, date);
}
