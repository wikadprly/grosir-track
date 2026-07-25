import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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
      pin: "123456",
      name: "Ibu",
    },
  });
  console.log("✓ User created");

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

  // === BU ITO ===
  // Transaksi 1 (1 Juli 2025)
  const t1ito = await prisma.transaction.create({
    data: {
      id: "t-ito-1",
      customerId: "c-ito",
      totalAmount: 1078000,
      date: new Date("2025-07-01T08:00:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-ito-1-1", transactionId: t1ito.id, productId: "p-50kgberas", qty: 1, priceAtThatTime: 650000, subtotal: 650000 },
      { id: "td-ito-1-2", transactionId: t1ito.id, productId: "p-abcsusu", qty: 1, priceAtThatTime: 197000, subtotal: 197000 },
      { id: "td-ito-1-3", transactionId: t1ito.id, productId: "p-50benang", qty: 1, priceAtThatTime: 65000, subtotal: 65000 },
      { id: "td-ito-1-4", transactionId: t1ito.id, productId: "p-goodday", qty: 5, priceAtThatTime: 17000, subtotal: 85000 },
      { id: "td-ito-1-5", transactionId: t1ito.id, productId: "p-gas3kg", qty: 2, priceAtThatTime: 22000, subtotal: 44000 },
      { id: "td-ito-1-6", transactionId: t1ito.id, productId: "p-rokok1", qty: 1, priceAtThatTime: 22000, subtotal: 22000 },
      { id: "td-ito-1-7", transactionId: t1ito.id, productId: "p-gulapasir", qty: 1, priceAtThatTime: 15000, subtotal: 15000 },
    ],
  });

  // Transaksi 2 (7 Juli 2025)
  const t2ito = await prisma.transaction.create({
    data: {
      id: "t-ito-2",
      customerId: "c-ito",
      totalAmount: 1183000,
      date: new Date("2025-07-07T09:00:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-ito-2-1", transactionId: t2ito.id, productId: "p-50benang", qty: 1, priceAtThatTime: 65000, subtotal: 65000 },
      { id: "td-ito-2-2", transactionId: t2ito.id, productId: "p-abcsusu", qty: 1, priceAtThatTime: 197000, subtotal: 197000 },
      { id: "td-ito-2-3", transactionId: t2ito.id, productId: "p-goodday", qty: 1, priceAtThatTime: 17000, subtotal: 17000 },
      { id: "td-ito-2-4", transactionId: t2ito.id, productId: "p-30gula", qty: 1, priceAtThatTime: 904000, subtotal: 904000 },
    ],
  });

  // Pembayaran (11 Juli 2025)
  await prisma.payment.create({
    data: {
      id: "pay-ito-1",
      customerId: "c-ito",
      amount: 1500000,
      date: new Date("2025-07-11T10:00:00.000Z"),
      note: "Bayar sebagian",
    },
  });

  // Transaksi 3 (13 Juli 2025)
  const t3ito = await prisma.transaction.create({
    data: {
      id: "t-ito-3",
      customerId: "c-ito",
      totalAmount: 936500,
      date: new Date("2025-07-13T08:30:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-ito-3-1", transactionId: t3ito.id, productId: "p-50kgberas", qty: 1, priceAtThatTime: 650000, subtotal: 650000 },
      { id: "td-ito-3-2", transactionId: t3ito.id, productId: "p-sajiku", qty: 1, priceAtThatTime: 286500, subtotal: 286500 },
    ],
  });
  // Total hutang Bu Ito: 1078000 + 1183000 - 1500000 + 936500 = 1697500 ✓

  // === PAK AGUS ===
  const t1agus = await prisma.transaction.create({
    data: {
      id: "t-agus-1",
      customerId: "c-agus",
      totalAmount: 2400000,
      date: new Date("2025-07-05T09:00:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-agus-1-1", transactionId: t1agus.id, productId: "p-50kgberas", qty: 2, priceAtThatTime: 650000, subtotal: 1300000 },
      { id: "td-agus-1-2", transactionId: t1agus.id, productId: "p-minyakkita", qty: 3, priceAtThatTime: 34000, subtotal: 102000 },
      { id: "td-agus-1-3", transactionId: t1agus.id, productId: "p-gulapasir", qty: 3, priceAtThatTime: 30000, subtotal: 90000 },
      { id: "td-agus-1-4", transactionId: t1agus.id, productId: "p-abckopi", qty: 5, priceAtThatTime: 175000, subtotal: 875000 },
      { id: "td-agus-1-5", transactionId: t1agus.id, productId: "p-rokok1", qty: 1, priceAtThatTime: 22000, subtotal: 22000 },
      { id: "td-agus-1-6", transactionId: t1agus.id, productId: "p-gas3kg", qty: 1, priceAtThatTime: 22000, subtotal: 22000 },
    ],
  });

  // === BU MAR (hutang 520.000) ===
  const t1mar = await prisma.transaction.create({
    data: {
      id: "t-mar-1",
      customerId: "c-mar",
      totalAmount: 520000,
      date: new Date("2025-07-08T10:00:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-mar-1-1", transactionId: t1mar.id, productId: "p-beras10kg", qty: 3, priceAtThatTime: 120000, subtotal: 360000 },
      { id: "td-mar-1-2", transactionId: t1mar.id, productId: "p-minyakkita", qty: 2, priceAtThatTime: 34000, subtotal: 68000 },
      { id: "td-mar-1-3", transactionId: t1mar.id, productId: "p-sabun1", qty: 8, priceAtThatTime: 4000, subtotal: 32000 },
      { id: "td-mar-1-4", transactionId: t1mar.id, productId: "p-teh1", qty: 5, priceAtThatTime: 8000, subtotal: 40000 },
      { id: "td-mar-1-5", transactionId: t1mar.id, productId: "p-goodtime", qty: 2, priceAtThatTime: 10000, subtotal: 20000 },
    ],
  });

  // === PAK JOKO (hutang 1.200.000) ===
  const t1joko = await prisma.transaction.create({
    data: {
      id: "t-joko-1",
      customerId: "c-joko",
      totalAmount: 1200000,
      date: new Date("2025-07-03T08:00:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-joko-1-1", transactionId: t1joko.id, productId: "p-50kgberas", qty: 1, priceAtThatTime: 650000, subtotal: 650000 },
      { id: "td-joko-1-2", transactionId: t1joko.id, productId: "p-beras10kg", qty: 2, priceAtThatTime: 120000, subtotal: 240000 },
      { id: "td-joko-1-3", transactionId: t1joko.id, productId: "p-abcsusu", qty: 1, priceAtThatTime: 197000, subtotal: 197000 },
      { id: "td-joko-1-4", transactionId: t1joko.id, productId: "p-rokok1", qty: 1, priceAtThatTime: 22000, subtotal: 22000 },
      { id: "td-joko-1-5", transactionId: t1joko.id, productId: "p-gas3kg", qty: 1, priceAtThatTime: 22000, subtotal: 22000 },
      { id: "td-joko-1-6", transactionId: t1joko.id, productId: "p-abckecap", qty: 3, priceAtThatTime: 28000, subtotal: 84000 },
    ],
  });

  // === BU SITI (hutang 950.000) ===
  const t1siti = await prisma.transaction.create({
    data: {
      id: "t-siti-1",
      customerId: "c-siti",
      totalAmount: 950000,
      date: new Date("2025-07-02T09:30:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-siti-1-1", transactionId: t1siti.id, productId: "p-beras10kg", qty: 4, priceAtThatTime: 120000, subtotal: 480000 },
      { id: "td-siti-1-2", transactionId: t1siti.id, productId: "p-minyakkita", qty: 3, priceAtThatTime: 34000, subtotal: 102000 },
      { id: "td-siti-1-3", transactionId: t1siti.id, productId: "p-gulapasir", qty: 3, priceAtThatTime: 30000, subtotal: 90000 },
      { id: "td-siti-1-4", transactionId: t1siti.id, productId: "p-sabun1", qty: 10, priceAtThatTime: 4000, subtotal: 40000 },
      { id: "td-siti-1-5", transactionId: t1siti.id, productId: "p-teh1", qty: 5, priceAtThatTime: 8000, subtotal: 40000 },
      { id: "td-siti-1-6", transactionId: t1siti.id, productId: "p-gooddaymocca", qty: 10, priceAtThatTime: 17000, subtotal: 170000 },
      { id: "td-siti-1-7", transactionId: t1siti.id, productId: "p-abckecap", qty: 1, priceAtThatTime: 28000, subtotal: 28000 },
    ],
  });

  // === PAK DAR (lunas) ===
  const t1dar = await prisma.transaction.create({
    data: {
      id: "t-dar-1",
      customerId: "c-dar",
      totalAmount: 750000,
      date: new Date("2025-07-04T08:00:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-dar-1-1", transactionId: t1dar.id, productId: "p-beras10kg", qty: 3, priceAtThatTime: 120000, subtotal: 360000 },
      { id: "td-dar-1-2", transactionId: t1dar.id, productId: "p-minyakkita", qty: 2, priceAtThatTime: 34000, subtotal: 68000 },
      { id: "td-dar-1-3", transactionId: t1dar.id, productId: "p-abcsusu", qty: 1, priceAtThatTime: 197000, subtotal: 197000 },
      { id: "td-dar-1-4", transactionId: t1dar.id, productId: "p-rokok1", qty: 1, priceAtThatTime: 22000, subtotal: 22000 },
      { id: "td-dar-1-5", transactionId: t1dar.id, productId: "p-gas3kg", subtotal: 22000, priceAtThatTime: 22000, qty: 1 },
      { id: "td-dar-1-6", transactionId: t1dar.id, productId: "p-teh1", subtotal: 81000, priceAtThatTime: 8000, qty: 1 },
    ],
  });
  await prisma.payment.create({
    data: {
      id: "pay-dar-1",
      customerId: "c-dar",
      amount: 750000,
      date: new Date("2025-07-06T14:00:00.000Z"),
      note: "Lunas",
    },
  });

  // === BU RINA (hutang 780.000) ===
  const t1rina = await prisma.transaction.create({
    data: {
      id: "t-rina-1",
      customerId: "c-rina",
      totalAmount: 780000,
      date: new Date("2025-07-06T09:00:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-rina-1-1", transactionId: t1rina.id, productId: "p-beras10kg", qty: 3, priceAtThatTime: 120000, subtotal: 360000 },
      { id: "td-rina-1-2", transactionId: t1rina.id, productId: "p-minyakkita", qty: 3, priceAtThatTime: 34000, subtotal: 102000 },
      { id: "td-rina-1-3", transactionId: t1rina.id, productId: "p-gulapasir", qty: 3, priceAtThatTime: 30000, subtotal: 90000 },
      { id: "td-rina-1-4", transactionId: t1rina.id, productId: "p-sabun1", qty: 5, priceAtThatTime: 4000, subtotal: 20000 },
      { id: "td-rina-1-5", transactionId: t1rina.id, productId: "p-abckopi", qty: 1, priceAtThatTime: 175000, subtotal: 175000 },
      { id: "td-rina-1-6", transactionId: t1rina.id, productId: "p-goodday", qty: 1, priceAtThatTime: 17000, subtotal: 17000 },
      { id: "td-rina-1-7", transactionId: t1rina.id, productId: "p-gas3kg", subtotal: 22000, priceAtThatTime: 22000, qty: 1 },
    ],
  });

  // === BU YANTI (lunas) ===
  const t1yanti = await prisma.transaction.create({
    data: {
      id: "t-yanti-1",
      customerId: "c-yanti",
      totalAmount: 450000,
      date: new Date("2025-07-07T08:30:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-yanti-1-1", transactionId: t1yanti.id, productId: "p-beras10kg", qty: 2, priceAtThatTime: 120000, subtotal: 240000 },
      { id: "td-yanti-1-2", transactionId: t1yanti.id, productId: "p-minyakkita", qty: 2, priceAtThatTime: 34000, subtotal: 68000 },
      { id: "td-yanti-1-3", transactionId: t1yanti.id, productId: "p-gulapasir", qty: 3, priceAtThatTime: 30000, subtotal: 90000 },
      { id: "td-yanti-1-4", transactionId: t1yanti.id, productId: "p-teh1", subtotal: 40000, priceAtThatTime: 8000, qty: 5 },
      { id: "td-yanti-1-5", transactionId: t1yanti.id, productId: "p-sabun1", subtotal: 12000, priceAtThatTime: 4000, qty: 3 },
    ],
  });
  await prisma.payment.create({
    data: {
      id: "pay-yanti-1",
      customerId: "c-yanti",
      amount: 450000,
      date: new Date("2025-07-09T11:00:00.000Z"),
      note: "Lunas",
    },
  });

  // === PAK DEDI (hutang 650.000) ===
  const t1dedi = await prisma.transaction.create({
    data: {
      id: "t-dedi-1",
      customerId: "c-dedi",
      totalAmount: 650000,
      date: new Date("2025-07-04T10:00:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-dedi-1-1", transactionId: t1dedi.id, productId: "p-beras10kg", qty: 2, priceAtThatTime: 120000, subtotal: 240000 },
      { id: "td-dedi-1-2", transactionId: t1dedi.id, productId: "p-minyakkita", qty: 2, priceAtThatTime: 34000, subtotal: 68000 },
      { id: "td-dedi-1-3", transactionId: t1dedi.id, productId: "p-gulapasir", qty: 3, priceAtThatTime: 30000, subtotal: 90000 },
      { id: "td-dedi-1-4", transactionId: t1dedi.id, productId: "p-abcsusu", qty: 1, priceAtThatTime: 197000, subtotal: 197000 },
      { id: "td-dedi-1-5", transactionId: t1dedi.id, productId: "p-rokok1", subtotal: 22000, priceAtThatTime: 22000, qty: 1 },
      { id: "td-dedi-1-6", transactionId: t1dedi.id, productId: "p-gas3kg", subtotal: 22000, priceAtThatTime: 22000, qty: 1 },
    ],
  });

  // === BU LILIS (lunas) ===
  const t1lilis = await prisma.transaction.create({
    data: {
      id: "t-lilis-1",
      customerId: "c-lilis",
      totalAmount: 350000,
      date: new Date("2025-07-05T10:00:00.000Z"),
    },
  });
  await prisma.transactionDetail.createMany({
    data: [
      { id: "td-lilis-1-1", transactionId: t1lilis.id, productId: "p-beras10kg", qty: 1, priceAtThatTime: 120000, subtotal: 120000 },
      { id: "td-lilis-1-2", transactionId: t1lilis.id, productId: "p-minyakkita", qty: 2, priceAtThatTime: 34000, subtotal: 68000 },
      { id: "td-lilis-1-3", transactionId: t1lilis.id, productId: "p-gulapasir", qty: 2, priceAtThatTime: 30000, subtotal: 60000 },
      { id: "td-lilis-1-4", transactionId: t1lilis.id, productId: "p-teh1", subtotal: 24000, priceAtThatTime: 8000, qty: 3 },
      { id: "td-lilis-1-5", transactionId: t1lilis.id, productId: "p-sabun1", subtotal: 20000, priceAtThatTime: 4000, qty: 5 },
      { id: "td-lilis-1-6", transactionId: t1lilis.id, productId: "p-rokok1", subtotal: 22000, priceAtThatTime: 22000, qty: 1 },
      { id: "td-lilis-1-7", transactionId: t1lilis.id, productId: "p-gas3kg", subtotal: 22000, priceAtThatTime: 22000, qty: 1 },
      { id: "td-lilis-1-8", transactionId: t1lilis.id, productId: "p-abcsusu", subtotal: 14000, priceAtThatTime: 197000, qty: 1 },
    ],
  });
  await prisma.payment.create({
    data: {
      id: "pay-lilis-1",
      customerId: "c-lilis",
      amount: 350000,
      date: new Date("2025-07-08T14:00:00.000Z"),
      note: "Lunas",
    },
  });

  console.log("✓ All transactions, details, and payments created");
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
