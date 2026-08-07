export interface BalanceEntry {
  kind: "barang" | "nitip";
  amount: number;
  date: Date;
}

export function computeSisaBalance(entries: BalanceEntry[]): number {
  let balance = 0;
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  for (const entry of sorted) {
    if (entry.kind === "barang") {
      balance += entry.amount;
    } else if (entry.amount > balance) {
      balance = 0;
    } else {
      balance -= entry.amount;
    }
  }
  return balance;
}
