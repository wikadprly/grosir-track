import "dotenv/config";
import prisma from "../src/lib/prisma";
import { computeSisaBalance, type BalanceEntry } from "../src/lib/balance";
import { getCustomerBalances } from "../src/lib/balanceQuery";

// Uji stokastik: rumus tertutup max(0, total - least(0, minRun))
// harus identik dengan rekursi berurutan max(0, balance + delta).
function closedForm(deltas: number[]): number {
  let total = 0;
  let run = 0;
  let minRun = Number.POSITIVE_INFINITY;
  for (const d of deltas) {
    total += d;
    run += d;
    if (run < minRun) minRun = run;
  }
  return Math.max(0, total - Math.min(0, minRun));
}

function sequential(deltas: number[]): number {
  let balance = 0;
  for (const d of deltas) {
    balance = Math.max(0, balance + d);
  }
  return balance;
}

function stochasticTest() {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const cases = 50000;
  for (let i = 0; i < cases; i++) {
    const len = 1 + Math.floor(rand() * 12);
    const deltas: number[] = [];
    for (let j = 0; j < len; j++) {
      const amount = Math.floor(rand() * 100);
      deltas.push(rand() < 0.55 ? amount : -amount); // kadang nol juga oke
    }
    const seq = sequential(deltas);
    const cf = closedForm(deltas);
    if (seq !== cf) {
      console.error(`STOCHASTIC MISMATCH case ${i}: deltas=${JSON.stringify(deltas)} seq=${seq} cf=${cf}`);
      process.exit(1);
    }
  }
  console.log(`OK: rumus tertutup identik pada ${cases} kasus acak`);
}

async function main() {
  stochasticTest();

  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      transactions: { select: { totalAmount: true, date: true } },
      payments: { select: { amount: true, date: true } },
    },
  });

  const expected = new Map<string, number>();
  for (const c of customers) {
    const entries: BalanceEntry[] = [
      ...c.transactions.map((t) => ({ kind: "barang" as const, amount: t.totalAmount, date: t.date })),
      ...c.payments.map((p) => ({ kind: "nitip" as const, amount: p.amount, date: p.date })),
    ];
    expected.set(c.id, computeSisaBalance(entries));
  }

  // Pelanggan tanpa transaksi sama sekali tidak ada di hasil SQL; harus dianggap 0
  const actual = await getCustomerBalances();

  let mismatches = 0;
  for (const c of customers) {
    const exp = expected.get(c.id) ?? 0;
    const act = actual.get(c.id)?.saldo ?? 0;
    if (exp !== act) {
      mismatches++;
      console.error(`MISMATCH ${c.name} (${c.id}): expected=${exp} actual=${act}`);
    }
  }

  console.log(`Pelanggan dicek: ${customers.length}, mismatch: ${mismatches}`);
  if (mismatches > 0) process.exit(1);
  console.log("OK: saldo SQL identik dengan computeSisaBalance");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
