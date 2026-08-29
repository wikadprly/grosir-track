"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { JAKARTA_TIMEZONE, jakartaDateKey, jakartaTimeShort } from "@/lib/time";
import { requireSession } from "@/lib/auth";

export async function getCustomerDetail(id: string) {
  await requireSession();
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

  type Entry =
    | { dbId: string; jenis: "barang"; tanggal: Date; items: { nama: string; harga: number }[]; total: number }
    | { dbId: string; jenis: "nitip"; tanggal: Date; nominal: number };

  const allEntries: Entry[] = [];

  for (const t of customer.transactions) {
    allEntries.push({
      dbId: t.id,
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
      dbId: p.id,
      jenis: "nitip",
      tanggal: p.date,
      nominal: p.amount,
    });
  }

  allEntries.sort((a, b) => {
    const timeDiff = a.tanggal.getTime() - b.tanggal.getTime();
    if (timeDiff !== 0) return timeDiff;
    if (a.jenis === b.jenis) return 0;
    return a.jenis === "barang" ? -1 : 1;
  });

  const dateKey = jakartaDateKey;

  interface FlatEntry {
    id: number;
    dbId: string;
    jenis: "barang" | "nitip";
    items?: { nama: string; harga: number }[];
    total?: number;
    nominal?: number;
    sisa: number;
    kembalian?: number;
    jam?: string;
  }

  interface HariGroup {
    tanggal: string;
    tanggalDisplay: string;
    entries: FlatEntry[];
  }

  const grouped: HariGroup[] = [];
  let idx = 0;
  let runningBalance = 0;

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
      timeZone: JAKARTA_TIMEZONE,
    });

    const flatEntries: FlatEntry[] = [];

    for (const entry of entries) {
      const jam = jakartaTimeShort(entry.tanggal);

      if (entry.jenis === "barang") {
        runningBalance += entry.total;
        flatEntries.push({
          id: idx++,
          dbId: entry.dbId,
          jenis: "barang",
          items: entry.items,
          total: entry.total,
          sisa: runningBalance,
          jam,
        });
      } else {
        let kembalian = 0;
        if (entry.nominal > runningBalance) {
          kembalian = entry.nominal - runningBalance;
          runningBalance = 0;
        } else {
          runningBalance -= entry.nominal;
        }
        flatEntries.push({
          id: idx++,
          dbId: entry.dbId,
          jenis: "nitip",
          nominal: entry.nominal,
          sisa: runningBalance,
          kembalian,
          jam,
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
    riwayatHari: grouped,
  };
}

export async function deleteTransaction(id: string, customerId: string) {
  await requireSession();
  await prisma.$transaction([
    prisma.transactionDetail.deleteMany({ where: { transactionId: id } }),
    prisma.transaction.delete({ where: { id } }),
  ]);
  revalidatePath(`/pelanggan/${customerId}`);
  revalidatePath("/");
}

// Ambil detail sebuah transaksi untuk diedit. Mengembalikan daftar item
// lengkap (productId, nama asli, qty, harga satuan di transaksi itu).
export async function getTransactionDetail(transactionId: string) {
  await requireSession();
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      details: { include: { product: { select: { name: true } } } },
    },
  });
  if (!transaction) return null;
  return {
    id: transaction.id,
    customerId: transaction.customerId,
    items: transaction.details.map((d) => ({
      detailId: d.id,
      productId: d.productId,
      nama: d.product.name,
      qty: d.qty,
      harga: d.priceAtThatTime,
    })),
  };
}

// Perbarui isi transaksi: bisa ganti barang, ubah qty/harga, tambah &
// hapus item. Seluruh detail lama dibuang lalu dibuat ulang, totalAmount
// dihitung ulang, dan saldo pelanggan otomatis menyesuaikan.
export async function updateTransactionItems(
  transactionId: string,
  customerId: string,
  items: { productId: string; qty: number; harga: number }[]
) {
  await requireSession();
  if (!items || items.length === 0) throw new Error("Minimal satu barang harus dipilih");
  for (const item of items) {
    if (!item.productId) throw new Error("Barang tidak valid");
    if (!Number.isInteger(item.qty) || item.qty <= 0) throw new Error("Jumlah barang tidak valid");
    if (!Number.isFinite(item.harga) || item.harga <= 0) throw new Error("Harga tidak valid");
  }

  // Pastikan transaksi milik pelanggan ini.
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, customerId },
    select: { id: true },
  });
  if (!existing) throw new Error("Transaksi tidak ditemukan");

  const totalAmount = items.reduce((sum, item) => sum + item.harga * item.qty, 0);

  await prisma.$transaction([
    prisma.transactionDetail.deleteMany({ where: { transactionId } }),
    prisma.transaction.update({
      where: { id: transactionId },
      data: {
        totalAmount,
        details: {
          create: items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            priceAtThatTime: item.harga,
            subtotal: item.harga * item.qty,
          })),
        },
      },
    }),
  ]);

  revalidatePath(`/pelanggan/${customerId}`);
  revalidatePath("/");
  return totalAmount;
}

export async function deletePayment(id: string, customerId: string) {
  await requireSession();
  await prisma.payment.delete({ where: { id } });
  revalidatePath(`/pelanggan/${customerId}`);
  revalidatePath("/");
}
