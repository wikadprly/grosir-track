import prisma from "@/lib/prisma";

export interface CustomerBalanceRow {
  customerId: string;
  saldo: number;
  lastTransactionAt: Date | null;
}

// Saldo dihitung dengan rumus tertutup dari logika berurutan di
// computeSisaBalance (src/lib/balance.ts):
//   balance_n = max(0, balance_{n-1} + delta_n)
// yang setara dengan max(0, total - min_prefix) termasuk prefix kosong 0.
// Pembayaran lebih besar dari sisa tidak dianggap kredit (dibuang),
// jadi hasil selalu >= 0 dan identik dengan perhitungan berurutan.
interface SaldoRow {
  cid: string;
  saldo: number;
  lastTransactionAt: Date | null;
}

export async function getCustomerBalances(): Promise<Map<string, CustomerBalanceRow>> {
  const rows = await prisma.$queryRaw<SaldoRow[]>`
    WITH deltas AS (
      SELECT t."customerId" AS cid, t."date" AS dt, 0 AS k, t."totalAmount"::bigint AS amt
      FROM "Transaction" t
      UNION ALL
      SELECT p."customerId" AS cid, p."date" AS dt, 1 AS k, (-p."amount")::bigint AS amt
      FROM "Payment" p
    ),
    runs AS (
      SELECT cid,
             k,
             dt,
             amt,
             SUM(amt) OVER (PARTITION BY cid ORDER BY dt, k, amt) AS run
      FROM deltas
    )
    SELECT cid,
           GREATEST(SUM(amt) - LEAST(MIN(run), 0), 0)::int AS saldo,
           MAX(CASE WHEN k = 0 THEN dt END) AS "lastTransactionAt"
    FROM runs
    GROUP BY cid
  `;
  const map = new Map<string, CustomerBalanceRow>();
  for (const row of rows) {
    map.set(row.cid, {
      customerId: row.cid,
      saldo: row.saldo,
      lastTransactionAt: row.lastTransactionAt,
    });
  }
  return map;
}
