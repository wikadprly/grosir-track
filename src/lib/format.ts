export function formatAngka(angka: number): string {
  return new Intl.NumberFormat("id-ID").format(angka);
}

export function formatRupiah(angka: number): string {
  return "Rp " + formatAngka(angka);
}
