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

    // 3 pelanggan terakhir (yang punya transaksi)
    const pelangganTerakhir = await prisma.customer.findMany({
      include: {
        transactions: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
        _count: { select: { transactions: true } },
      },
      where: { transactions: { some: {} } },
      orderBy: { transactions: { _count: "desc" } },
      take: 3,
    });

    const pelangganTerakhirFormatted = pelangganTerakhir.map((c) => {
      const totalTransaksi = 0; // will compute below
      return {
        id: c.id,
        name: c.name,
      };
    });

    // Compute saldo for the 3 recent customers
    const pelangganWithSaldo = await Promise.all(
      pelangganTerakhirFormatted.map(async (p) => {
        const customer = await prisma.customer.findUnique({
          where: { id: p.id },
          include: {
            transactions: { select: { totalAmount: true } },
            payments: { select: { amount: true } },
          },
        });
        const totalTransaksi = customer!.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalPembayaran = customer!.payments.reduce((sum, p) => sum + p.amount, 0);
        const saldo = totalTransaksi - totalPembayaran;
        return {
          id: p.id,
          name: p.name,
          saldo,
          hutang: saldo > 0,
        };
      })
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
