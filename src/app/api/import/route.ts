import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

const dateField = z
  .union([z.string(), z.number()])
  .transform((v) => new Date(v))
  .refine((d) => !Number.isNaN(d.getTime()), { message: "Tanggal tidak valid" });

const optionalDateField = dateField.optional();

const backupSchema = z.object({
  app: z.literal("buku-bon"),
  version: z.number().int().min(1),
  data: z.object({
    users: z.array(
      z.object({
        id: z.string().min(1),
        pin: z.string(),
        name: z.string().default("Ibu"),
        updatedAt: optionalDateField,
      })
    ),
    products: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        defaultPrice: z.number().int().min(0),
        createdAt: optionalDateField,
        updatedAt: optionalDateField,
      })
    ),
    customers: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        phone: z.string().nullable().optional(),
        createdAt: optionalDateField,
        updatedAt: optionalDateField,
      })
    ),
    transactions: z.array(
      z.object({
        id: z.string().min(1),
        customerId: z.string().min(1),
        totalAmount: z.number().int().min(0),
        date: dateField,
        createdAt: optionalDateField,
      })
    ),
    transactionDetails: z.array(
      z.object({
        id: z.string().min(1),
        transactionId: z.string().min(1),
        productId: z.string().min(1),
        qty: z.number().int().min(1),
        priceAtThatTime: z.number().int().min(0),
        subtotal: z.number().int().min(0),
      })
    ),
    payments: z.array(
      z.object({
        id: z.string().min(1),
        customerId: z.string().min(1),
        amount: z.number().int().min(0),
        date: dateField,
        note: z.string().nullable().optional(),
        createdAt: optionalDateField,
      })
    ),
  }),
});

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function POST(request: Request) {
  let file: File | null = null;
  try {
    const formData = await request.formData();
    const value = formData.get("file");
    if (value instanceof File) file = value;
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "File backup belum dipilih." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Ukuran file terlalu besar (maksimal 25MB)." }, { status: 400 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(await file.text());
  } catch {
    return NextResponse.json({ error: "File bukan JSON yang valid." }, { status: 400 });
  }

  const check = backupSchema.safeParse(parsedJson);
  if (!check.success) {
    return NextResponse.json(
      { error: "Struktur file backup tidak dikenali. Pastikan file berasal dari Backup Data aplikasi ini." },
      { status: 400 }
    );
  }

  const { data } = check.data;

  // Validasi relasi antar tabel sebelum menyentuh database
  const userIds = new Set(data.users.map((u) => u.id));
  if (userIds.size !== data.users.length) {
    return NextResponse.json({ error: "Ada ID user ganda di file backup." }, { status: 400 });
  }

  const productIds = new Set(data.products.map((p) => p.id));
  if (productIds.size !== data.products.length) {
    return NextResponse.json({ error: "Ada ID barang ganda di file backup." }, { status: 400 });
  }

  const customerIds = new Set(data.customers.map((c) => c.id));
  if (customerIds.size !== data.customers.length) {
    return NextResponse.json({ error: "Ada ID pelanggan ganda di file backup." }, { status: 400 });
  }

  const transactionIds = new Set(data.transactions.map((t) => t.id));
  if (transactionIds.size !== data.transactions.length) {
    return NextResponse.json({ error: "Ada ID transaksi ganda di file backup." }, { status: 400 });
  }

  for (const t of data.transactions) {
    if (!customerIds.has(t.customerId)) {
      return NextResponse.json(
        { error: `Transaksi ${t.id} merujuk pelanggan yang tidak ada di file backup.` },
        { status: 400 }
      );
    }
  }

  for (const d of data.transactionDetails) {
    if (!transactionIds.has(d.transactionId)) {
      return NextResponse.json(
        { error: `Detail transaksi ${d.id} merujuk transaksi yang tidak ada di file backup.` },
        { status: 400 }
      );
    }
    if (!productIds.has(d.productId)) {
      return NextResponse.json(
        { error: `Detail transaksi ${d.id} merujuk barang yang tidak ada di file backup.` },
        { status: 400 }
      );
    }
  }

  for (const p of data.payments) {
    if (!customerIds.has(p.customerId)) {
      return NextResponse.json(
        { error: `Pembayaran ${p.id} merujuk pelanggan yang tidak ada di file backup.` },
        { status: 400 }
      );
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.transactionDetail.deleteMany();
      await tx.payment.deleteMany();
      await tx.transaction.deleteMany();
      await tx.customer.deleteMany();
      await tx.product.deleteMany();
      await tx.user.deleteMany();

      for (const batch of chunk(data.users, 500)) {
        await tx.user.createMany({
          data: batch.map((u) => ({
            id: u.id,
            pin: u.pin,
            name: u.name,
            updatedAt: u.updatedAt ?? new Date(),
          })),
        });
      }

      for (const batch of chunk(data.products, 500)) {
        await tx.product.createMany({
          data: batch.map((p) => ({
            id: p.id,
            name: p.name,
            defaultPrice: p.defaultPrice,
            createdAt: p.createdAt ?? new Date(),
            updatedAt: p.updatedAt ?? new Date(),
          })),
        });
      }

      for (const batch of chunk(data.customers, 500)) {
        await tx.customer.createMany({
          data: batch.map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone ?? null,
            createdAt: c.createdAt ?? new Date(),
            updatedAt: c.updatedAt ?? new Date(),
          })),
        });
      }

      for (const batch of chunk(data.transactions, 500)) {
        await tx.transaction.createMany({
          data: batch.map((t) => ({
            id: t.id,
            customerId: t.customerId,
            totalAmount: t.totalAmount,
            date: t.date,
            createdAt: t.createdAt ?? new Date(),
          })),
        });
      }

      for (const batch of chunk(data.transactionDetails, 500)) {
        await tx.transactionDetail.createMany({ data: batch });
      }

      for (const batch of chunk(data.payments, 500)) {
        await tx.payment.createMany({
          data: batch.map((p) => ({
            id: p.id,
            customerId: p.customerId,
            amount: p.amount,
            date: p.date,
            note: p.note ?? null,
            createdAt: p.createdAt ?? new Date(),
          })),
        });
      }
    });
  } catch (error) {
    console.error("Gagal memulihkan backup:", error);
    return NextResponse.json({ error: "Gagal menyimpan data ke database. Data lama tidak berubah." }, { status: 500 });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({
    success: true,
    counts: {
      users: data.users.length,
      products: data.products.length,
      customers: data.customers.length,
      transactions: data.transactions.length,
      transactionDetails: data.transactionDetails.length,
      payments: data.payments.length,
    },
  });
}
