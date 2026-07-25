"use server";

import prisma from "@/lib/prisma";

export async function getCustomerDetail(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      transactions: {
        include: {
          details: {
            include: { product: { select: { name: true } } },
          },
        },
        orderBy: { date: "desc" },
      },
      payments: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!customer) return null;

  // Gabungkan transaksi dan pembayaran, urutkan berdasarkan tanggal
  type RiwayatItem =
    | { jenis: "barang"; id: string; tanggal: Date; items: { nama: string; harga: number }[]; total: number }
    | { jenis: "nitip"; id: string; tanggal: Date; nominal: number };

  const riwayat: RiwayatItem[] = [];

  for (const t of customer.transactions) {
    riwayat.push({
      jenis: "barang",
      id: t.id,
      tanggal: t.date,
      items: t.details.map((d) => ({
        nama: d.product.name,
        harga: d.subtotal,
      })),
      total: t.totalAmount,
    });
  }

  for (const p of customer.payments) {
    riwayat.push({
      jenis: "nitip",
      id: p.id,
      tanggal: p.date,
      nominal: p.amount,
    });
  }

  // Urutkan dari yang terbaru
  riwayat.sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());

  // Hitung sisa hutang
  const totalTransaksi = customer.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalPembayaran = customer.payments.reduce((sum, p) => sum + p.amount, 0);
  const sisaHutang = totalTransaksi - totalPembayaran;

  return {
    nama: customer.name,
    sisaHutang,
    riwayat,
  };
}
