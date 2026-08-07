"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { jakartaDateTime, jakartaTimeNow } from "@/lib/time";

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
  const totalAmount = items.reduce((sum, item) => sum + item.harga * item.qty, 0);

  const transaction = await prisma.transaction.create({
    data: {
      customerId,
      date: jakartaDateTime(date, jakartaTimeNow()),
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
