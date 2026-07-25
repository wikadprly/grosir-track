"use server";

import prisma from "@/lib/prisma";

export async function getCustomers() {
  const customers = await prisma.customer.findMany({
    include: {
      transactions: { select: { totalAmount: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { name: "asc" },
  });

  return customers.map((c) => {
    const totalTransaksi = c.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPembayaran = c.payments.reduce((sum, p) => sum + p.amount, 0);
    const saldo = totalTransaksi - totalPembayaran;
    return {
      id: c.id,
      nama: c.name,
      saldo,
      status: saldo > 0 ? "hutang" : "lunas",
    };
  });
}
