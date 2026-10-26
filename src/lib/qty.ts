export const QTY_MAX = 99999;
export const QTY_SCALE = 1000;

export function roundQty(value: number): number {
  return Math.round(value * QTY_SCALE) / QTY_SCALE;
}

export function isValidQty(value: number): boolean {
  if (!Number.isFinite(value) || value <= 0 || value > QTY_MAX) return false;
  const scaled = value * QTY_SCALE;
  return Math.abs(scaled - Math.round(scaled)) < 1e-6;
}

export function itemSubtotal(harga: number, qty: number): number {
  return Math.round(harga * qty);
}

export function formatQty(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(value);
}

export function qtyInputText(value: number): string {
  return String(roundQty(value)).replace(".", ",");
}

export function parseQtyInput(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{0,3})?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!isValidQty(value)) return null;
  return roundQty(value);
}
