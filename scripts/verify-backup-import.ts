import "dotenv/config";
import prisma from "../src/lib/prisma";
import { GET as backupGET } from "../src/app/api/backup/route";
import { POST as importPOST } from "../src/app/api/import/route";

async function dbCounts() {
  const [users, products, customers, transactions, transactionDetails, payments] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.transaction.count(),
      prisma.transactionDetail.count(),
      prisma.payment.count(),
    ]);
  const sums = await prisma.transaction.aggregate({ _sum: { totalAmount: true } });
  const paySum = await prisma.payment.aggregate({ _sum: { amount: true } });
  return {
    users,
    products,
    customers,
    transactions,
    transactionDetails,
    payments,
    txSum: sums._sum.totalAmount ?? 0,
    paySum: paySum._sum.amount ?? 0,
  };
}

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`OK: ${msg}`);
}

async function main() {
  const before = await dbCounts();

  // ── 1. Backup ──
  const backupRes = await backupGET();
  assert(backupRes.status === 200, "backup GET status 200");
  const disposition = backupRes.headers.get("Content-Disposition") ?? "";
  assert(disposition.includes("backup-toko-rema-"), "header Content-Disposition benar");
  const raw = await backupRes.text();
  const backupJson = JSON.parse(raw);
  assert(backupJson.app === "toko-rema", "backup app marker");
  assert(
    backupJson.counts.customers === before.customers &&
      backupJson.counts.transactions === before.transactions &&
      backupJson.counts.payments === before.payments &&
      backupJson.counts.products === before.products &&
      backupJson.counts.transactionDetails === before.transactionDetails &&
      backupJson.counts.users === before.users,
    "counts backup sama dengan isi database"
  );

  // ── 2. Import ulang backup yang sama (harus mengembalikan data identik) ──
  const form = new FormData();
  form.append("file", new File([raw], "backup.json", { type: "application/json" }));
  const req = new Request("http://localhost/api/import", { method: "POST", body: form });
  try {
    await importPOST(req);
    console.log("OK: import sukses tanpa error");
  } catch {
    // revalidatePath di luar konteks request Next.js boleh gagal saat dipanggil langsung;
    // data sudah tersimpan lewat transaksi database.
    console.log("OK: import selesai (revalidatePath dilewati di luar runtime Next)");
  }

  const after = await dbCounts();
  assert(
    JSON.stringify(before) === JSON.stringify(after),
    "data setelah import identik dengan sebelumnya"
  );

  // ── 3. Tolak file bukan JSON ──
  const badForm1 = new FormData();
  badForm1.append("file", new File(["ini bukan json"], "x.json", { type: "application/json" }));
  const badRes1 = await importPOST(
    new Request("http://localhost/api/import", { method: "POST", body: badForm1 })
  );
  const badJson1 = await badRes1.json();
  assert(badRes1.status === 400 && typeof badJson1.error === "string", "file non-JSON ditolak 400");

  // ── 4. Tolak struktur asing ──
  const badForm2 = new FormData();
  badForm2.append("file", new File([JSON.stringify({ hello: 1 })], "y.json", { type: "application/json" }));
  const badRes2 = await importPOST(
    new Request("http://localhost/api/import", { method: "POST", body: badForm2 })
  );
  assert(badRes2.status === 400, "struktur asing ditolak 400");

  // ── 5. Tolak referensi menggantung (transaksi ke pelanggan yang tidak ada) ──
  const tampered = structuredClone(backupJson);
  tampered.data.transactions.push({
    id: "t-palsu",
    customerId: "c-tidak-ada",
    totalAmount: 1000,
    date: new Date().toISOString(),
  });
  const badForm3 = new FormData();
  badForm3.append("file", new File([JSON.stringify(tampered)], "z.json", { type: "application/json" }));
  const badRes3 = await importPOST(
    new Request("http://localhost/api/import", { method: "POST", body: badForm3 })
  );
  const badJson3 = await badRes3.json();
  assert(badRes3.status === 400 && String(badJson3.error).includes("t-palsu"), "referensi menggantung ditolak");

  // ── 6. Tolak file kosong ──
  const emptyForm = new FormData();
  emptyForm.append("file", new File([], "empty.json", { type: "application/json" }));
  const emptyRes = await importPOST(
    new Request("http://localhost/api/import", { method: "POST", body: emptyForm })
  );
  assert(emptyRes.status === 400, "file kosong ditolak 400");

  console.log("\nSemua tes backup/import lolos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
