"use server";

import prisma from "@/lib/prisma";
import { JAKARTA_TIMEZONE, startOfJakartaMonth, startOfNextJakartaMonth } from "@/lib/time";
import { getCustomerBalances } from "@/lib/balanceQuery";
import { requireSession } from "@/lib/auth";

export async function getLaporanData() {
  await requireSession();
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

  // Top pelanggan berhutang
  const [customers, balances] = await Promise.all([
    prisma.customer.findMany({ select: { id: true, name: true } }),
    getCustomerBalances(),
  ]);

  const sisaPerPelanggan = customers.map((c) => ({
    name: c.name,
    hutang: balances.get(c.id)?.saldo ?? 0,
  }));

  // Total sisa piutang saat ini (semua periode), konsisten dengan dashboard & export
  const sisaPiutang = sisaPerPelanggan.reduce((sum, c) => sum + c.hutang, 0);

  const denganHutang = sisaPerPelanggan
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
    jumlahBerhutang: denganHutang.length,
    topPelanggan: denganHutang,
  };
}
