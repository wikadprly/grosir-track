"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { computeSisaBalance, type BalanceEntry } from "@/lib/balance";

export async function createCustomer(name: string, phone?: string) {
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
  const pageSize = 50;
  const safePage = Math.max(1, Math.floor(page));
  const q = query.trim();
  const nameFilter = q
    ? { name: { contains: q, mode: "insensitive" as const } }
    : undefined;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where: nameFilter,
      include: {
        transactions: { select: { totalAmount: true, date: true } },
        payments: { select: { amount: true, date: true } },
      },
      orderBy: { name: "asc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where: nameFilter }),
  ]);

  const items: CustomerListItem[] = customers.map((c) => {
    const entries: BalanceEntry[] = [
      ...c.transactions.map((t) => ({ kind: "barang" as const, amount: t.totalAmount, date: t.date })),
      ...c.payments.map((p) => ({ kind: "nitip" as const, amount: p.amount, date: p.date })),
    ];
    const saldo = computeSisaBalance(entries);
    return {
      id: c.id,
      nama: c.name,
      saldo,
      status: saldo > 0 ? ("hutang" as const) : ("lunas" as const),
    };
  });

  return { items, total, page: safePage, pageSize };
}
