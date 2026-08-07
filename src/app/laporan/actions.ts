"use server";

import prisma from "@/lib/prisma";
import { JAKARTA_TIMEZONE, startOfJakartaMonth, startOfNextJakartaMonth } from "@/lib/time";
import { computeSisaBalance, type BalanceEntry } from "@/lib/balance";

export async function getLaporanData() {
  const now = new Date();
  const startOfMonth = startOfJakartaMonth();
  const endOfMonth = startOfNextJakartaMonth();

  // Total hutang masuk bulan ini
  const hutangBulanIni = await prisma.transaction.aggregate({
    where: {
      date: { gte: startOfMonth, lt: endOfMonth },
    },
    _sum: { totalAmount: true },
  });

  // Total pembayaran bulan ini
  const pembayaranBulanIni = await prisma.payment.aggregate({
    where: {
      date: { gte: startOfMonth, lt: endOfMonth },
    },
    _sum: { amount: true },
  });

  const totalHutang = hutangBulanIni._sum.totalAmount ?? 0;
  const totalPembayaran = pembayaranBulanIni._sum.amount ?? 0;
  const sisaPiutang = totalHutang - totalPembayaran;

  // Top pelanggan berhutang
  const allCustomers = await prisma.customer.findMany({
    include: {
      transactions: { select: { totalAmount: true, date: true } },
      payments: { select: { amount: true, date: true } },
    },
  });

  const denganHutang = allCustomers
    .map((c) => {
      const entries: BalanceEntry[] = [
        ...c.transactions.map((t) => ({ kind: "barang" as const, amount: t.totalAmount, date: t.date })),
        ...c.payments.map((p) => ({ kind: "nitip" as const, amount: p.amount, date: p.date })),
      ];
      return {
        name: c.name,
        hutang: computeSisaBalance(entries),
      };
    })
    .filter((c) => c.hutang > 0)
    .sort((a, b) => b.hutang - a.hutang);

  return {
    bulan: now.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
      timeZone: JAKARTA_TIMEZONE,
    }),
    totalHutang,
    totalPembayaran,
    sisaPiutang,
    topPelanggan: denganHutang,
  };
}
