import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ── USER ──
  await prisma.user.upsert({
    where: { id: "user-default" },
    update: {},
    create: {
      id: "user-default",
      pin: await bcrypt.hash("123456", 10),
      name: "Ibu",
    },
  });
  console.log("✓ User created (PIN default: 123456 — segera ubah di menu Keamanan)");

  // ── PRODUCTS ──
  const products = [
    // Dari pengaturan/barang
    { id: "p-gula1kg", name: "Gula 1kg", defaultPrice: 15000 },
    { id: "p-kopi1", name: "Kopi 1 bungkus", defaultPrice: 12000 },
    { id: "p-minyak1l", name: "Minyak 1L", defaultPrice: 18000 },
    { id: "p-teh1", name: "Teh 1 kotak", defaultPrice: 8000 },
    { id: "p-beras1kg", name: "Beras 1kg", defaultPrice: 13000 },
    { id: "p-sabun1", name: "Sabun 1 batang", defaultPrice: 4000 },
    { id: "p-rokok1", name: "Rokok 1 bungkus", defaultPrice: 22000 },
    { id: "p-gas3kg", name: "Gas LPG 3kg", defaultPrice: 22000 },
    // Dari catat barang
    { id: "p-abcsusu", name: "ABC Susu", defaultPrice: 197000 },
    { id: "p-abckopi", name: "ABC Kopi", defaultPrice: 175000 },
    { id: "p-abcsquash", name: "ABC Squash", defaultPrice: 22000 },
    { id: "p-abckecap", name: "ABC Kecap", defaultPrice: 28000 },
    { id: "p-goodday", name: "Good Day", defaultPrice: 17000 },
    { id: "p-gooddaymocca", name: "Good Day Mocca", defaultPrice: 17000 },
    { id: "p-goodtime", name: "Good Time", defaultPrice: 10000 },
    { id: "p-50benang", name: "50 Benang", defaultPrice: 65000 },
    { id: "p-gulapasir", name: "Gula Pasir", defaultPrice: 30000 },
    { id: "p-minyakkita", name: "Minyak Kita 1L", defaultPrice: 34000 },
    { id: "p-beras10kg", name: "Beras 10kg", defaultPrice: 120000 },
    // Tambahan
    { id: "p-sajiku", name: "1 DS Sajiku", defaultPrice: 286500 },
    { id: "p-30gula", name: "30 Gula Pasir", defaultPrice: 904000 },
    { id: "p-50kgberas", name: "50kg Beras", defaultPrice: 650000 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { defaultPrice: p.defaultPrice },
      create: p,
    });
  }
  console.log(`✓ ${products.length} products created`);

  // ── CUSTOMERS ──
  const customers = [
    { id: "c-ito", name: "Bu Ito", phone: "081234567891" },
    { id: "c-agus", name: "Pak Agus", phone: "081234567892" },
    { id: "c-mar", name: "Bu Mar", phone: "081234567893" },
    { id: "c-joko", name: "Pak Joko", phone: "081234567894" },
    { id: "c-siti", name: "Bu Siti", phone: "081234567895" },
    { id: "c-dar", name: "Pak Dar", phone: "081234567896" },
    { id: "c-rina", name: "Bu Rina", phone: "081234567897" },
    { id: "c-yanti", name: "Bu Yanti", phone: "081234567898" },
    { id: "c-dedi", name: "Pak Dedi", phone: "081234567899" },
    { id: "c-lilis", name: "Bu Lilis", phone: "081234567810" },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    });
  }
  console.log(`✓ ${customers.length} customers created`);

  // ── TRANSACTIONS & PAYMENTS ──
  // Hapus data lama agar seed konsisten
  await prisma.transactionDetail.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.payment.deleteMany();

  type DetailDef = { productId: string; qty: number };
  type EntryDef =
    | { kind: "barang"; id: string; customerId: string; date: string; details: DetailDef[] }
    | { kind: "nitip"; id: string; customerId: string; date: string; amount: number; note?: string };

  const hargaOf = (id: string) => products.find((p) => p.id === id)!.defaultPrice;

  // Data disebar dari April s.d. Agustus 2026 agar terlihat hidup.
  const entries: EntryDef[] = [
    // ── BU ITO (rajin belanja, sisa ~1,1 jt) ──
    { kind: "barang", id: "t-ito-1", customerId: "c-ito", date: "2026-05-04T15:00:00+07:00", details: [
      { productId: "p-50kgberas", qty: 1 }, { productId: "p-abcsusu", qty: 1 }, { productId: "p-50benang", qty: 1 },
      { productId: "p-goodday", qty: 5 }, { productId: "p-gas3kg", qty: 2 }, { productId: "p-rokok1", qty: 1 },
      { productId: "p-gulapasir", qty: 1 },
    ] },
    { kind: "barang", id: "t-ito-2", customerId: "c-ito", date: "2026-05-11T16:00:00+07:00", details: [
      { productId: "p-50benang", qty: 1 }, { productId: "p-abcsusu", qty: 1 }, { productId: "p-goodday", qty: 1 },
      { productId: "p-30gula", qty: 1 },
    ] },
    { kind: "nitip", id: "pay-ito-1", customerId: "c-ito", date: "2026-05-19T17:00:00+07:00", amount: 1000000, note: "Bayar sebagian" },
    { kind: "barang", id: "t-ito-3", customerId: "c-ito", date: "2026-06-08T15:00:00+07:00", details: [
      { productId: "p-50kgberas", qty: 1 }, { productId: "p-sajiku", qty: 1 },
    ] },
    { kind: "nitip", id: "pay-ito-2", customerId: "c-ito", date: "2026-06-22T16:00:00+07:00", amount: 800000, note: "Bayar sebagian" },
    { kind: "barang", id: "t-ito-4", customerId: "c-ito", date: "2026-07-06T15:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 2 }, { productId: "p-minyakkita", qty: 2 }, { productId: "p-gulapasir", qty: 2 },
      { productId: "p-abcsusu", qty: 1 },
    ] },
    { kind: "nitip", id: "pay-ito-3", customerId: "c-ito", date: "2026-07-20T17:00:00+07:00", amount: 700000, note: "Bayar sebagian" },
    { kind: "barang", id: "t-ito-5", customerId: "c-ito", date: "2026-07-29T15:30:00+07:00", details: [
      { productId: "p-beras10kg", qty: 1 }, { productId: "p-abcsusu", qty: 1 }, { productId: "p-rokok1", qty: 1 },
      { productId: "p-gas3kg", qty: 1 }, { productId: "p-minyakkita", qty: 1 },
    ] },
    { kind: "nitip", id: "pay-ito-4", customerId: "c-ito", date: "2026-08-05T16:00:00+07:00", amount: 500000, note: "Bayar sebagian" },

    // ── PAK AGUS (pembeli besar, sisa ~1,5 jt) ──
    { kind: "barang", id: "t-agus-1", customerId: "c-agus", date: "2026-04-10T09:00:00+07:00", details: [
      { productId: "p-50kgberas", qty: 2 }, { productId: "p-minyakkita", qty: 3 }, { productId: "p-gulapasir", qty: 3 },
      { productId: "p-abckopi", qty: 5 }, { productId: "p-rokok1", qty: 1 }, { productId: "p-gas3kg", qty: 1 },
    ] },
    { kind: "nitip", id: "pay-agus-1", customerId: "c-agus", date: "2026-05-02T10:00:00+07:00", amount: 1000000, note: "Bayar sebagian" },
    { kind: "barang", id: "t-agus-2", customerId: "c-agus", date: "2026-06-06T09:30:00+07:00", details: [
      { productId: "p-beras10kg", qty: 3 }, { productId: "p-minyakkita", qty: 3 }, { productId: "p-gulapasir", qty: 3 },
      { productId: "p-rokok1", qty: 2 },
    ] },
    { kind: "nitip", id: "pay-agus-2", customerId: "c-agus", date: "2026-07-03T11:00:00+07:00", amount: 1000000, note: "Bayar sebagian" },
    { kind: "barang", id: "t-agus-3", customerId: "c-agus", date: "2026-07-22T09:00:00+07:00", details: [
      { productId: "p-abckopi", qty: 3 }, { productId: "p-abcsusu", qty: 1 }, { productId: "p-50kgberas", qty: 1 },
    ] },

    // ── BU MAR (sisa kecil ~150 rb) ──
    { kind: "barang", id: "t-mar-1", customerId: "c-mar", date: "2026-04-08T10:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 3 }, { productId: "p-minyakkita", qty: 2 }, { productId: "p-sabun1", qty: 8 },
      { productId: "p-teh1", qty: 5 }, { productId: "p-goodtime", qty: 2 },
    ] },
    { kind: "nitip", id: "pay-mar-1", customerId: "c-mar", date: "2026-05-14T10:00:00+07:00", amount: 300000, note: "Bayar sebagian" },
    { kind: "barang", id: "t-mar-2", customerId: "c-mar", date: "2026-06-18T10:30:00+07:00", details: [
      { productId: "p-beras10kg", qty: 2 }, { productId: "p-sabun1", qty: 6 }, { productId: "p-teh1", qty: 4 },
    ] },
    { kind: "nitip", id: "pay-mar-2", customerId: "c-mar", date: "2026-07-15T11:00:00+07:00", amount: 400000, note: "Bayar sebagian" },

    // ── PAK JOKO (sisa ~480 rb) ──
    { kind: "barang", id: "t-joko-1", customerId: "c-joko", date: "2026-04-03T08:00:00+07:00", details: [
      { productId: "p-50kgberas", qty: 1 }, { productId: "p-beras10kg", qty: 2 }, { productId: "p-abcsusu", qty: 1 },
      { productId: "p-rokok1", qty: 1 }, { productId: "p-gas3kg", qty: 1 }, { productId: "p-abckecap", qty: 3 },
    ] },
    { kind: "nitip", id: "pay-joko-1", customerId: "c-joko", date: "2026-05-10T09:00:00+07:00", amount: 600000, note: "Bayar sebagian" },
    { kind: "barang", id: "t-joko-2", customerId: "c-joko", date: "2026-06-12T08:30:00+07:00", details: [
      { productId: "p-beras10kg", qty: 2 }, { productId: "p-minyakkita", qty: 3 }, { productId: "p-gulapasir", qty: 2 },
    ] },
    { kind: "nitip", id: "pay-joko-2", customerId: "c-joko", date: "2026-07-05T09:30:00+07:00", amount: 600000, note: "Bayar sebagian" },

    // ── BU SITI (sisa ~470 rb) ──
    { kind: "barang", id: "t-siti-1", customerId: "c-siti", date: "2026-04-02T09:30:00+07:00", details: [
      { productId: "p-beras10kg", qty: 4 }, { productId: "p-minyakkita", qty: 3 }, { productId: "p-gulapasir", qty: 3 },
      { productId: "p-sabun1", qty: 10 }, { productId: "p-teh1", qty: 5 }, { productId: "p-gooddaymocca", qty: 10 },
      { productId: "p-abckecap", qty: 1 },
    ] },
    { kind: "nitip", id: "pay-siti-1", customerId: "c-siti", date: "2026-05-21T10:00:00+07:00", amount: 400000, note: "Bayar sebagian" },
    { kind: "barang", id: "t-siti-2", customerId: "c-siti", date: "2026-06-25T09:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 2 }, { productId: "p-gulapasir", qty: 2 }, { productId: "p-teh1", qty: 6 },
    ] },
    { kind: "nitip", id: "pay-siti-2", customerId: "c-siti", date: "2026-07-16T10:30:00+07:00", amount: 400000, note: "Bayar sebagian" },

    // ── PAK DAR (lunas) ──
    { kind: "barang", id: "t-dar-1", customerId: "c-dar", date: "2026-04-04T08:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 3 }, { productId: "p-minyakkita", qty: 2 }, { productId: "p-abcsusu", qty: 1 },
      { productId: "p-rokok1", qty: 1 }, { productId: "p-gas3kg", qty: 1 }, { productId: "p-teh1", qty: 1 },
    ] },
    { kind: "nitip", id: "pay-dar-1", customerId: "c-dar", date: "2026-04-09T14:00:00+07:00", amount: 677000, note: "Lunas" },
    { kind: "barang", id: "t-dar-2", customerId: "c-dar", date: "2026-06-07T08:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 3 }, { productId: "p-gulapasir", qty: 2 }, { productId: "p-goodday", qty: 4 },
    ] },
    { kind: "nitip", id: "pay-dar-2", customerId: "c-dar", date: "2026-06-10T14:00:00+07:00", amount: 488000, note: "Lunas" },

    // ── BU RINA (sisa ~560 rb) ──
    { kind: "barang", id: "t-rina-1", customerId: "c-rina", date: "2026-04-06T09:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 3 }, { productId: "p-minyakkita", qty: 3 }, { productId: "p-gulapasir", qty: 3 },
      { productId: "p-sabun1", qty: 5 }, { productId: "p-abckopi", qty: 1 }, { productId: "p-goodday", qty: 1 },
      { productId: "p-gas3kg", qty: 1 },
    ] },
    { kind: "nitip", id: "pay-rina-1", customerId: "c-rina", date: "2026-05-08T10:00:00+07:00", amount: 500000, note: "Bayar sebagian" },
    { kind: "barang", id: "t-rina-2", customerId: "c-rina", date: "2026-07-12T09:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 2 }, { productId: "p-minyakkita", qty: 2 }, { productId: "p-sabun1", qty: 6 },
    ] },

    // ── BU YANTI (lunas, rajin bayar) ──
    { kind: "barang", id: "t-yanti-1", customerId: "c-yanti", date: "2026-04-07T08:30:00+07:00", details: [
      { productId: "p-beras10kg", qty: 2 }, { productId: "p-minyakkita", qty: 2 }, { productId: "p-gulapasir", qty: 3 },
      { productId: "p-teh1", qty: 5 }, { productId: "p-sabun1", qty: 3 },
    ] },
    { kind: "nitip", id: "pay-yanti-1", customerId: "c-yanti", date: "2026-04-11T11:00:00+07:00", amount: 450000, note: "Lunas" },
    { kind: "barang", id: "t-yanti-2", customerId: "c-yanti", date: "2026-06-20T08:30:00+07:00", details: [
      { productId: "p-beras10kg", qty: 2 }, { productId: "p-minyakkita", qty: 2 }, { productId: "p-gulapasir", qty: 2 },
    ] },
    { kind: "nitip", id: "pay-yanti-2", customerId: "c-yanti", date: "2026-06-24T11:00:00+07:00", amount: 368000, note: "Lunas" },
    { kind: "barang", id: "t-yanti-3", customerId: "c-yanti", date: "2026-08-03T08:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 1 }, { productId: "p-gulapasir", qty: 2 }, { productId: "p-sabun1", qty: 4 },
    ] },
    { kind: "nitip", id: "pay-yanti-3", customerId: "c-yanti", date: "2026-08-04T11:00:00+07:00", amount: 196000, note: "Lunas" },

    // ── PAK DEDI (sisa ~700 rb) ──
    { kind: "barang", id: "t-dedi-1", customerId: "c-dedi", date: "2026-04-04T10:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 2 }, { productId: "p-minyakkita", qty: 2 }, { productId: "p-gulapasir", qty: 3 },
      { productId: "p-abcsusu", qty: 1 }, { productId: "p-rokok1", qty: 1 }, { productId: "p-gas3kg", qty: 1 },
    ] },
    { kind: "nitip", id: "pay-dedi-1", customerId: "c-dedi", date: "2026-05-25T11:00:00+07:00", amount: 250000, note: "Bayar sebagian" },
    { kind: "barang", id: "t-dedi-2", customerId: "c-dedi", date: "2026-07-18T10:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 2 }, { productId: "p-abcsusu", qty: 1 }, { productId: "p-gas3kg", qty: 1 },
      { productId: "p-rokok1", qty: 2 },
    ] },

    // ── BU LILIS (lunas) ──
    { kind: "barang", id: "t-lilis-1", customerId: "c-lilis", date: "2026-04-05T10:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 1 }, { productId: "p-minyakkita", qty: 2 }, { productId: "p-gulapasir", qty: 2 },
      { productId: "p-teh1", qty: 3 }, { productId: "p-sabun1", qty: 5 }, { productId: "p-rokok1", qty: 1 },
      { productId: "p-gas3kg", qty: 1 }, { productId: "p-abcsusu", qty: 1 },
    ] },
    { kind: "nitip", id: "pay-lilis-1", customerId: "c-lilis", date: "2026-04-09T14:00:00+07:00", amount: 533000, note: "Lunas" },
    { kind: "barang", id: "t-lilis-2", customerId: "c-lilis", date: "2026-06-28T10:00:00+07:00", details: [
      { productId: "p-beras10kg", qty: 1 }, { productId: "p-minyakkita", qty: 2 }, { productId: "p-sabun1", qty: 4 },
    ] },
    { kind: "nitip", id: "pay-lilis-2", customerId: "c-lilis", date: "2026-07-01T14:00:00+07:00", amount: 204000, note: "Lunas" },
    { kind: "barang", id: "t-lilis-3", customerId: "c-lilis", date: "2026-08-06T09:30:00+07:00", details: [
      { productId: "p-beras10kg", qty: 1 }, { productId: "p-gulapasir", qty: 2 }, { productId: "p-teh1", qty: 3 },
    ] },
    { kind: "nitip", id: "pay-lilis-3", customerId: "c-lilis", date: "2026-08-06T11:00:00+07:00", amount: 204000, note: "Lunas" },
  ];

  for (const e of entries) {
    if (e.kind === "barang") {
      const details = e.details.map((d, i) => ({
        id: `${e.id}-d${i}`,
        productId: d.productId,
        qty: d.qty,
        priceAtThatTime: hargaOf(d.productId),
        subtotal: d.qty * hargaOf(d.productId),
      }));
      const totalAmount = details.reduce((s, d) => s + d.subtotal, 0);
      const tx = await prisma.transaction.create({
        data: {
          id: e.id,
          customerId: e.customerId,
          totalAmount,
          date: new Date(e.date),
        },
      });
      await prisma.transactionDetail.createMany({
        data: details.map((d) => ({ ...d, transactionId: tx.id })),
      });
    } else {
      await prisma.payment.create({
        data: {
          id: e.id,
          customerId: e.customerId,
          amount: e.amount,
          date: new Date(e.date),
          note: e.note,
        },
      });
    }
  }

  console.log(`✓ ${entries.length} transactions/payments created (April–Agustus 2026)`);
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma["$disconnect"]();
  });
