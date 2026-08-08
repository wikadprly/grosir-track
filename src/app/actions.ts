"use server";

import prisma from "@/lib/prisma";
import { startOfJakartaDay, endOfJakartaDay } from "@/lib/time";
import { computeSisaBalance, type BalanceEntry } from "@/lib/balance";

export async function getDashboardData() {
  const startOfDay = startOfJakartaDay();
  const endOfDay = endOfJakartaDay();

  try {
    // Transaksi hari ini
    const transaksiHariIni = await prisma.transaction.count({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
      },
    });

    // Uang masuk hari ini (pembayaran)
    const pembayaranHariIni = await prisma.payment.aggregate({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
      },
      _sum: { amount: true },
    });

    // Total piutang semua pelanggan + 3 pelanggan terakhir (1 query aja)
    const allCustomers = await prisma.customer.findMany({
      include: {
        transactions: { select: { totalAmount: true, date: true } },
        payments: { select: { amount: true, date: true } },
      },
    });

    let totalPiutang = 0;
    const customerBalances = allCustomers.map((c) => {
      const entries: BalanceEntry[] = [
        ...c.transactions.map((t) => ({ kind: "barang" as const, amount: t.totalAmount, date: t.date })),
        ...c.payments.map((p) => ({ kind: "nitip" as const, amount: p.amount, date: p.date })),
      ];
      const saldo = computeSisaBalance(entries);
      const transaksiTerakhir = c.transactions.reduce(
        (latest, t) => (t.date > latest ? t.date : latest),
        new Date(0)
      );
      totalPiutang += saldo;
      return { id: c.id, name: c.name, saldo, transaksiTerakhir };
    });

    const pelangganTerakhir = customerBalances
      .filter((c) => c.transaksiTerakhir.getTime() > 0)
      .sort((a, b) => b.transaksiTerakhir.getTime() - a.transaksiTerakhir.getTime())
      .slice(0, 3)
      .map(({ saldo, ...item }) => ({
        ...item,
        saldo,
        hutang: saldo > 0,
      }));

    return {
      transaksiHariIni,
      uangMasuk: pembayaranHariIni._sum.amount ?? 0,
      totalPiutang,
      pelangganTerakhir,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      transaksiHariIni: 0,
      uangMasuk: 0,
      totalPiutang: 0,
      pelangganTerakhir: [],
    };
  }
}
