"use server";

import prisma from "@/lib/prisma";

export async function getProducts() {
  const products = await prisma.product.findMany({
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
  const totalAmount = items.reduce((sum, item) => sum + item.harga * item.qty, 0);

  const transaction = await prisma.transaction.create({
    data: {
      customerId,
      date: new Date(date),
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

  return transaction;
}
