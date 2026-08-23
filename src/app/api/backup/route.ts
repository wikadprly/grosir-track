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
      prisma.user.findMany(),
      prisma.product.findMany({ orderBy: { name: "asc" } }),
      prisma.customer.findMany({ orderBy: { name: "asc" } }),
      prisma.transaction.findMany({ orderBy: { date: "asc" } }),
      prisma.transactionDetail.findMany(),
      prisma.payment.findMany({ orderBy: { date: "asc" } }),
    ]);

  const backup = {
    app: "buku-bon",
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
      "Content-Disposition": `attachment; filename="backup-buku-bon-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
