"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { JAKARTA_TIMEZONE, jakartaDateKey, jakartaTimeShort } from "@/lib/time";

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
  await prisma.$transaction([
    prisma.transactionDetail.deleteMany({ where: { transactionId: id } }),
    prisma.transaction.delete({ where: { id } }),
  ]);
  revalidatePath(`/pelanggan/${customerId}`);
  revalidatePath("/");
}

export async function deletePayment(id: string, customerId: string) {
  await prisma.payment.delete({ where: { id } });
  revalidatePath(`/pelanggan/${customerId}`);
  revalidatePath("/");
}
