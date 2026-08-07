"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
      transactions: { select: { totalAmount: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { name: "asc" },
  });

  return customers.map((c) => {
    const totalTransaksi = c.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPembayaran = c.payments.reduce((sum, p) => sum + p.amount, 0);
    const saldo = totalTransaksi - totalPembayaran;
    return {
      id: c.id,
      nama: c.name,
      saldo,
      status: saldo > 0 ? ("hutang" as const) : ("lunas" as const),
    };
  });
}
