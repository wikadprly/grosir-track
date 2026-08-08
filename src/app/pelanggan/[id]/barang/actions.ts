"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { nextRecordTime } from "@/lib/recordTime";

const productSelect = { id: true, name: true, defaultPrice: true } as const;

export async function getProducts() {
  const products = await prisma.product.findMany({
    select: productSelect,
    orderBy: { name: "asc" },
  });
  return products.map((p) => ({
    id: p.id,
    nama: p.name,
    harga: p.defaultPrice,
  }));
}

export async function createTransaction(
  customerId: string,
  date: string,
  items: { productId: string; qty: number; harga: number }[]
) {
  if (!customerId) throw new Error("Pelanggan tidak valid");
  if (!date) throw new Error("Tanggal harus diisi");
  if (!items || items.length === 0) throw new Error("Minimal satu barang harus dipilih");
  for (const item of items) {
    if (!item.productId) throw new Error("Barang tidak valid");
    if (!Number.isInteger(item.qty) || item.qty <= 0) throw new Error("Jumlah barang tidak valid");
    if (!Number.isFinite(item.harga) || item.harga <= 0) throw new Error("Harga tidak valid");
  }

  const totalAmount = items.reduce((sum, item) => sum + item.harga * item.qty, 0);

  const transaction = await prisma.transaction.create({
    data: {
      customerId,
      date: await nextRecordTime(customerId, date),
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
    include: { details: true },
  });

  revalidatePath(`/pelanggan/${customerId}`);
  revalidatePath("/");

  return transaction;
}
