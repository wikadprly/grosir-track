import prisma from "@/lib/prisma";
import { jakartaDateKey, jakartaTimeNow } from "@/lib/time";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const [users, products, customers, transactions, transactionDetails, payments] =
    await Promise.all([
      // PIN tidak ikut di-backup: file ini dianjurkan disimpan ke Drive/WhatsApp,
      // hash PIN yang bocor tetap bisa di-brute-force offline (PIN hanya 6 digit).
      prisma.user.findMany({
        select: { id: true, name: true, updatedAt: true },
        orderBy: { name: "asc" },
      }),
      prisma.product.findMany({ orderBy: { name: "asc" } }),
      prisma.customer.findMany({ orderBy: { name: "asc" } }),
      prisma.transaction.findMany({ orderBy: { date: "asc" } }),
      prisma.transactionDetail.findMany(),
      prisma.payment.findMany({ orderBy: { date: "asc" } }),
    ]);

  const backup = {
    app: "toko-rema",
    version: 1,
    exportedAt: new Date().toISOString(),
    counts: {
      users: users.length,
      products: products.length,
      customers: customers.length,
      transactions: transactions.length,
      transactionDetails: transactionDetails.length,
      payments: payments.length,
    },
    data: { users, products, customers, transactions, transactionDetails, payments },
  };

  const stamp = `${jakartaDateKey(new Date())}_${jakartaTimeNow().replaceAll(":", "-")}`;

  return new Response(JSON.stringify(backup), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="backup-toko-rema-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
