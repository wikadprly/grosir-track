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
      },
      payments: {},
    },
  });

  if (!customer) return null;

  // Gabungkan semua transaksi dan pembayaran
  type Entry =
    | { jenis: "barang"; tanggal: Date; items: { nama: string; harga: number }[]; total: number }
    | { jenis: "nitip"; tanggal: Date; nominal: number };

  const allEntries: Entry[] = [];

  for (const t of customer.transactions) {
    allEntries.push({
      jenis: "barang",
      tanggal: t.date,
      items: t.details.map((d) => ({
        nama: d.product.name,
        harga: d.subtotal,
      })),
      total: t.totalAmount,
    });
  }

  for (const p of customer.payments) {
    allEntries.push({
      jenis: "nitip",
      tanggal: p.date,
      nominal: p.amount,
    });
  }

  // Sort dari yang PALING LAMA (terbaru di bawah)
  allEntries.sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime());

  // Hitung sisa hutang
  const totalTransaksi = customer.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalPembayaran = customer.payments.reduce((sum, p) => sum + p.amount, 0);
  const sisaHutang = totalTransaksi - totalPembayaran;

  // Group by tanggal, tapi tiap entry punya sisa masing-masing
  const dateKey = (d: Date) => d.toISOString().split("T")[0];

  interface FlatEntry {
    id: number;
    jenis: "barang" | "nitip";
    items?: { nama: string; harga: number }[];
    total?: number;
    nominal?: number;
    sisa: number;
  }

  interface HariGroup {
    tanggal: string;
    tanggalDisplay: string;
    entries: FlatEntry[];
  }

  const grouped: HariGroup[] = [];
  let idx = 0;
  let runningBalance = 0;

  // Group entries by date, tapi tetap urut chronologis dalam 1 hari
  const groupedEntries = new Map<string, Entry[]>();
  for (const entry of allEntries) {
    const key = dateKey(entry.tanggal);
    if (!groupedEntries.has(key)) groupedEntries.set(key, []);
    groupedEntries.get(key)!.push(entry);
  }

  for (const [key, entries] of groupedEntries) {
    const tanggalDisplay = entries[0].tanggal.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const flatEntries: FlatEntry[] = [];

    for (const entry of entries) {
      if (entry.jenis === "barang") {
        runningBalance += entry.total;
        flatEntries.push({
          id: idx++,
          jenis: "barang",
          items: entry.items,
          total: entry.total,
          sisa: runningBalance,
        });
      } else {
        runningBalance -= entry.nominal;
        flatEntries.push({
          id: idx++,
          jenis: "nitip",
          nominal: entry.nominal,
          sisa: runningBalance,
        });
      }
    }

    grouped.push({
      tanggal: key,
      tanggalDisplay,
      entries: flatEntries,
    });
  }

  return {
    nama: customer.name,
    sisaHutang,
    riwayatHari: grouped,
  };
}
