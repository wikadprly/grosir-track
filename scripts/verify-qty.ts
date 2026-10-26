import {
  formatQty,
  isValidQty,
  itemSubtotal,
  parseQtyInput,
  qtyInputText,
  roundQty,
} from "../src/lib/qty";

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`OK: ${msg}`);
}

function main() {
  assert(isValidQty(1), "qty bulat valid");
  assert(isValidQty(1.5), "qty desimal valid");
  assert(isValidQty(0.001), "qty tiga desimal valid");
  assert(!isValidQty(0), "qty nol ditolak");
  assert(!isValidQty(-1), "qty negatif ditolak");
  assert(!isValidQty(1.2345), "qty empat desimal ditolak");
  assert(!isValidQty(Number.NaN), "qty NaN ditolak");
  assert(!isValidQty(100000), "qty melebihi batas ditolak");

  assert(roundQty(1.2344) === 1.234, "pembulatan qty ke tiga desimal");
  assert(roundQty(1.9999) === 2, "pembulatan naik ke bilangan bulat");

  assert(parseQtyInput("1,5") === 1.5, "parse koma Indonesia");
  assert(parseQtyInput("1.5") === 1.5, "parse titik desimal");
  assert(parseQtyInput("2,") === 2, "parse koma tanpa pecahan");
  assert(parseQtyInput("0,25") === 0.25, "parse nol koma");
  assert(parseQtyInput("1,2345") === null, "parse empat desimal ditolak");
  assert(parseQtyInput("0") === null, "parse nol ditolak");
  assert(parseQtyInput("abc") === null, "parse teks ditolak");

  assert(itemSubtotal(15000, 1.5) === 22500, "subtotal desimal dihitung");
  assert(itemSubtotal(3333, 0.333) === 1110, "subtotal dibulatkan ke rupiah");

  assert(formatQty(1.5) === "1,5", "format qty desimal");
  assert(formatQty(0.25) === "0,25", "format qty nol koma");
  assert(qtyInputText(1.5) === "1,5", "teks input memakai koma");
  assert(qtyInputText(2) === "2", "teks input bulat tanpa koma");

  console.log("\nSemua tes qty lolos.");
}

main();
