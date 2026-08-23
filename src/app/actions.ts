"use server";

import prisma from "@/lib/prisma";
import { startOfJakartaDay, endOfJakartaDay } from "@/lib/time";
import { getCustomerBalances } from "@/lib/balanceQuery";

export async function getDashboardData() {
  const startOfDay = startOfJakartaDay();
  const endOfDay = endOfJakartaDay();

  const [transaksiHariIni, pembayaranHariIni, customers, balances] = await Promise.all([
    // Transaksi hari ini
    prisma.transaction.count({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
      },
    }),

    // Uang masuk hari ini (pembayaran)
    prisma.payment.aggregate({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
      },
      _sum: { amount: true },
    }),

    prisma.customer.findMany({ select: { id: true, name: true } }),

    // Saldo semua pelanggan dihitung di database (1 query)
    getCustomerBalances(),
  ]);

  let totalPiutang = 0;
  const pelangganAktif: {
    id: string;
    name: string;
    saldo: number;
    transaksiTerakhir: Date;
  }[] = [];

  for (const c of customers) {
    const row = balances.get(c.id);
    const saldo = row?.saldo ?? 0;
    totalPiutang += saldo;
    if (row?.lastTransactionAt) {
      pelangganAktif.push({
        id: c.id,
        name: c.name,
        saldo,
        transaksiTerakhir: row.lastTransactionAt,
      });
    }
  }

  const pelangganTerakhir = pelangganAktif
    .sort((a, b) => b.transaksiTerakhir.getTime() - a.transaksiTerakhir.getTime())
    .slice(0, 3)
    .map((item) => ({
      ...item,
      hutang: item.saldo > 0,
    }));

  return {
    transaksiHariIni,
    uangMasuk: pembayaranHariIni._sum.amount ?? 0,
    totalPiutang,
    pelangganTerakhir,
  };
}
