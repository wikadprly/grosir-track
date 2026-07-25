"use server";

import prisma from "@/lib/prisma";

export async function getLaporanData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Total hutang masuk bulan ini
  const hutangBulanIni = await prisma.transaction.aggregate({
    where: {
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    _sum: { totalAmount: true },
  });

  // Total pembayaran bulan ini
  const pembayaranBulanIni = await prisma.payment.aggregate({
    where: {
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    _sum: { amount: true },
  });

  const totalHutang = hutangBulanIni._sum.totalAmount ?? 0;
  const totalPembayaran = pembayaranBulanIni._sum.amount ?? 0;
  const sisaPiutang = totalHutang - totalPembayaran;

  // Top pelanggan berhutang
  const allCustomers = await prisma.customer.findMany({
    include: {
      transactions: { select: { totalAmount: true } },
      payments: { select: { amount: true } },
    },
  });

  const denganHutang = allCustomers
    .map((c) => {
      const totalTransaksi = c.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
      const totalBayar = c.payments.reduce((sum, p) => sum + p.amount, 0);
      return {
        name: c.name,
        hutang: totalTransaksi - totalBayar,
      };
    })
    .filter((c) => c.hutang > 0)
    .sort((a, b) => b.hutang - a.hutang);

  return {
    bulan: now.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    totalHutang,
    totalPembayaran,
    sisaPiutang,
    topPelanggan: denganHutang,
  };
}
