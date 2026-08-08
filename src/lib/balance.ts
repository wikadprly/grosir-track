export interface BalanceEntry {
  kind: "barang" | "nitip";
  amount: number;
  date: Date;
}

export function computeSisaBalance(entries: BalanceEntry[]): number {
  let balance = 0;
  const sorted = [...entries].sort((a, b) => {
    const timeDiff = a.date.getTime() - b.date.getTime();
    if (timeDiff !== 0) return timeDiff;
    if (a.kind === b.kind) return 0;
    return a.kind === "barang" ? -1 : 1;
  });
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
