"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCustomerBalances } from "@/lib/balanceQuery";
import { requireSession } from "@/lib/auth";

export async function createCustomer(name: string, phone?: string) {
  await requireSession();
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Nama pelanggan tidak boleh kosong");
  }

  const customer = await prisma.customer.create({
    data: {
      name: trimmedName,
      phone: phone?.trim() || null,
    },
  });

  revalidatePath("/pelanggan");
  revalidatePath("/");
  return { id: customer.id, name: customer.name };
}

interface CustomerListItem {
  id: string;
  nama: string;
  saldo: number;
  status: "hutang" | "lunas";
}

interface CustomerListResult {
  items: CustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getCustomers(query = "", page = 1): Promise<CustomerListResult> {
  await requireSession();
  const pageSize = 50;
  const safePage = Math.max(1, Math.floor(page));
  const q = query.trim();
  const nameFilter = q
    ? { name: { contains: q, mode: "insensitive" as const } }
    : undefined;

  const [customers, total, balances] = await Promise.all([
    prisma.customer.findMany({
      where: nameFilter,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where: nameFilter }),
    getCustomerBalances(),
  ]);

  const items: CustomerListItem[] = customers.map((c) => {
    const saldo = balances.get(c.id)?.saldo ?? 0;
    return {
      id: c.id,
      nama: c.name,
      saldo,
      status: saldo > 0 ? ("hutang" as const) : ("lunas" as const),
    };
  });

  return { items, total, page: safePage, pageSize };
}
