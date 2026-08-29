"use server";

import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

const productSelect = { id: true, name: true, defaultPrice: true, category: true } as const;

export async function getProductsList() {
  await requireSession();
  const products = await prisma.product.findMany({
    select: productSelect,
    orderBy: { name: "asc" },
    take: 300,
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.defaultPrice,
    category: p.category ?? "",
  }));
}

export async function addProduct(name: string, price: number, category?: string) {
  await requireSession();
  const product = await prisma.product.create({
    data: { name, defaultPrice: price, category: category || null },
  });
  return { id: product.id, name: product.name, price: product.defaultPrice, category: product.category ?? "" };
}

export async function updateProduct(id: string, name: string, price: number, category?: string) {
  await requireSession();
  const product = await prisma.product.update({
    where: { id },
    data: { name, defaultPrice: price, category: category || null },
  });
  return { id: product.id, name: product.name, price: product.defaultPrice, category: product.category ?? "" };
}

export async function deleteProduct(id: string) {
  await requireSession();

  // Barang yang sudah pernah dipakai di transaksi tidak bisa dihapus
  // secara fisik karena riwayat buku bon bergantung padanya (relasi
  // TransactionDetail.product). Beri tahu pengguna agar mengedit nama
  // atau kategori, bukan menghapus.
  const used = await prisma.transactionDetail.count({ where: { productId: id } });
  if (used > 0) {
    throw new Error(
      `Barang ini sudah dipakai ${used} kali di transaksi, tidak bisa dihapus. Gunakan "edit" untuk mengubah nama/kategori barang.`
    );
  }

  await prisma.product.delete({ where: { id } });
}
