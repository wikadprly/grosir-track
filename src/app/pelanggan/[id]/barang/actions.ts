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
