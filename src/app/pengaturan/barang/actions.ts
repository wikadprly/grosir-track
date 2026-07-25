"use server";

import prisma from "@/lib/prisma";

export async function getProductsList() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.defaultPrice,
  }));
}

export async function addProduct(name: string, price: number) {
  const product = await prisma.product.create({
    data: { name, defaultPrice: price },
  });
  return { id: product.id, name: product.name, price: product.defaultPrice };
}

export async function updateProduct(id: string, name: string, price: number) {
  const product = await prisma.product.update({
    where: { id },
    data: { name, defaultPrice: price },
  });
  return { id: product.id, name: product.name, price: product.defaultPrice };
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}
