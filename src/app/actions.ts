"use server";

import prisma from "@/lib/prisma";

export async function getDashboardData() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

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

    // Total piutang semua pelanggan
    const allCustomers = await prisma.customer.findMany({
      include: {
        transactions: { select: { totalAmount: true } },
        payments: { select: { amount: true } },
      },
    });

    let totalPiutang = 0;
    for (const c of allCustomers) {
      const totalTransaksi = c.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
      const totalPembayaran = c.payments.reduce((sum, p) => sum + p.amount, 0);
      totalPiutang += totalTransaksi - totalPembayaran;
    }

    // 3 pelanggan terakhir yang bertransaksi (1 query aja)
    const pelangganWithSaldo = await prisma.customer.findMany({
      where: { transactions: { some: {} } },
      include: {
        transactions: { select: { totalAmount: true, date: true } },
        payments: { select: { amount: true } },
      },
    }).then((customers) =>
      customers
        .map((c) => {
          const totalTransaksi = c.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
          const totalPembayaran = c.payments.reduce((sum, p) => sum + p.amount, 0);
          const saldo = totalTransaksi - totalPembayaran;
          const transaksiTerakhir = c.transactions.reduce(
            (latest, t) => (t.date > latest ? t.date : latest),
            new Date(0)
          );
          return { id: c.id, name: c.name, saldo, hutang: saldo > 0, transaksiTerakhir };
        })
        .sort((a, b) => b.transaksiTerakhir.getTime() - a.transaksiTerakhir.getTime())
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          name: item.name,
          saldo: item.saldo,
          hutang: item.hutang,
        }))
    );

    return {
      transaksiHariIni,
      uangMasuk: pembayaranHariIni._sum.amount ?? 0,
      totalPiutang,
      pelangganTerakhir: pelangganWithSaldo,
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
