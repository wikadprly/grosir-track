import "dotenv/config";
import prisma from "../src/lib/prisma";

async function main() {
  // Pulihkan produk yang tak sengaja terhapus saat tes awal
  await prisma.product.upsert({
    where: { id: "p-gula1kg" },
    update: { defaultPrice: 15000 },
    create: { id: "p-gula1kg", name: "Gula 1kg", defaultPrice: 15000 },
  });
  console.log("OK: p-gula1kg dipulihkan");

  const suffix = Date.now().toString(36);
  const custId = `c-restrict-test-${suffix}`;
  const txId = `t-restrict-test-${suffix}`;

  await prisma.customer.create({ data: { id: custId, name: "Tes Restrict" } });
  await prisma.transaction.create({
    data: { id: txId, customerId: custId, totalAmount: 15000, date: new Date() },
  });
  await prisma.transactionDetail.create({
    data: { id: `${txId}-d0`, transactionId: txId, productId: "p-gula1kg", qty: 1, priceAtThatTime: 15000, subtotal: 15000 },
  });

  // Barang yang punya riwayat harus diblokir (FK Restrict)
  let blocked = false;
  try {
    await prisma.product.delete({ where: { id: "p-gula1kg" } });
  } catch {
    blocked = true;
  }
  if (!blocked) {
    console.error("FAIL: product dengan riwayat berhasil dihapus (seharusnya diblokir)");
    process.exit(1);
  }
  console.log("OK: hapus barang yang punya riwayat diblokir");

  // Bersihkan data tes
  await prisma.customer.delete({ where: { id: custId } });
  const cleaned = await prisma.transaction.findUnique({ where: { id: txId } });
  if (cleaned) {
    console.error("FAIL: data tes tidak ikut terhapus");
    process.exit(1);
  }
  console.log("OK: data tes bersih (cascade bekerja)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
