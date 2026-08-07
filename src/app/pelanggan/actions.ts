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

export async function getCustomers(): Promise<CustomerListItem[]> {
  const customers = await prisma.customer.findMany({
    include: {
      transactions: { select: { totalAmount: true, date: true } },
      payments: { select: { amount: true, date: true } },
    },
    orderBy: { name: "asc" },
  });

  return customers.map((c) => {
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
}
