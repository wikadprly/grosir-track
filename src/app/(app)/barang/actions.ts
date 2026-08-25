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
  await prisma.product.delete({ where: { id } });
}
