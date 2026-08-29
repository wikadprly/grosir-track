import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";
import { formatRupiah } from "@/lib/format";
import { JAKARTA_TIMEZONE, jakartaDateKey, startOfJakartaMonth, startOfNextJakartaMonth } from "@/lib/time";
import { getCustomerBalances } from "@/lib/balanceQuery";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = startOfJakartaMonth();
  const endOfMonth = startOfNextJakartaMonth();

  const [hutangBulanIni, pembayaranBulanIni, txTotals, payTotals, customers, transactions, payments, balances] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: { date: { gte: startOfMonth, lt: endOfMonth } },
        _sum: { totalAmount: true },
      }),
      prisma.payment.aggregate({
        where: { date: { gte: startOfMonth, lt: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({ by: ["customerId"], _sum: { totalAmount: true } }),
      prisma.payment.groupBy({ by: ["customerId"], _sum: { amount: true } }),
      prisma.customer.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.transaction.findMany({
        where: { date: { gte: startOfMonth, lt: endOfMonth } },
        include: {
          customer: { select: { name: true } },
          details: { include: { product: { select: { name: true } } } },
        },
        orderBy: { date: "asc" },
      }),
      prisma.payment.findMany({
        where: { date: { gte: startOfMonth, lt: endOfMonth } },
        include: { customer: { select: { name: true } } },
        orderBy: { date: "asc" },
      }),
      getCustomerBalances(),
    ]);

  const totalTransaksiByCustomer = new Map(txTotals.map((r) => [r.customerId, r._sum.totalAmount ?? 0]));
  const totalBayarByCustomer = new Map(payTotals.map((r) => [r.customerId, r._sum.amount ?? 0]));

  const totalHutang = hutangBulanIni._sum.totalAmount ?? 0;
  const totalPembayaran = pembayaranBulanIni._sum.amount ?? 0;
  // Total sisa piutang saat ini (semua periode), konsisten dengan dashboard & laporan
  let sisaPiutang = 0;
  let jumlahBerhutang = 0;
  for (const c of customers) {
    const saldo = balances.get(c.id)?.saldo ?? 0;
    sisaPiutang += saldo;
    if (saldo > 0) jumlahBerhutang++;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Toko Rema";
  workbook.created = new Date();

  const judulBulan = now.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: JAKARTA_TIMEZONE,
  });

  // ── Sheet Ringkasan ──
  const wsRingkasan = workbook.addWorksheet("Ringkasan");
  wsRingkasan.columns = [
    { header: "Keterangan", key: "label", width: 30 },
    { header: "Nilai", key: "nilai", width: 25 },
  ];
  wsRingkasan.addRow({ label: `Bulan ${judulBulan}`, nilai: "" });
  wsRingkasan.addRow({ label: "Total Penjualan (Bon)", nilai: formatRupiah(totalHutang) });
  wsRingkasan.addRow({ label: "Total Pembayaran (Bulan Ini)", nilai: formatRupiah(totalPembayaran) });
  wsRingkasan.addRow({ label: "Total Sisa", nilai: formatRupiah(sisaPiutang) });
  wsRingkasan.addRow({ label: "Pelanggan Ada Sisa", nilai: `${jumlahBerhutang} orang` });
  wsRingkasan.getRow(1).font = { bold: true };

  // ── Sheet Sisa per Pelanggan ──
  const wsPiutang = workbook.addWorksheet("Sisa Pelanggan");
  wsPiutang.columns = [
    { header: "Nama", key: "nama", width: 25 },
    { header: "Total Transaksi", key: "totalTransaksi", width: 20 },
    { header: "Total Bayar", key: "totalBayar", width: 20 },
    { header: "Sisa", key: "sisa", width: 20 },
  ];
  wsPiutang.getRow(1).font = { bold: true };
  for (const c of customers) {
    const totalTransaksi = totalTransaksiByCustomer.get(c.id) ?? 0;
    const totalBayar = totalBayarByCustomer.get(c.id) ?? 0;
    const sisa = balances.get(c.id)?.saldo ?? 0;
    wsPiutang.addRow({
      nama: c.name,
      totalTransaksi: totalTransaksi,
      totalBayar: totalBayar,
      sisa: sisa,
    });
  }

  // ── Sheet Detail Transaksi ──
  const wsTransaksi = workbook.addWorksheet("Detail Transaksi");
  wsTransaksi.columns = [
    { header: "Tanggal", key: "tanggal", width: 18 },
    { header: "Pelanggan", key: "pelanggan", width: 20 },
    { header: "Barang", key: "barang", width: 30 },
    { header: "Qty", key: "qty", width: 8 },
    { header: "Harga Satuan", key: "hargaSatuan", width: 18 },
    { header: "Subtotal", key: "subtotal", width: 18 },
  ];
  wsTransaksi.getRow(1).font = { bold: true };
  for (const t of transactions) {
    const tanggal = t.date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: JAKARTA_TIMEZONE,
    });
    for (const d of t.details) {
      wsTransaksi.addRow({
        tanggal,
        pelanggan: t.customer.name,
        barang: d.product.name,
        qty: d.qty,
        hargaSatuan: d.priceAtThatTime,
        subtotal: d.subtotal,
      });
    }
  }

  // ── Sheet Pembayaran ──
  const wsBayar = workbook.addWorksheet("Pembayaran");
  wsBayar.columns = [
    { header: "Tanggal", key: "tanggal", width: 18 },
    { header: "Pelanggan", key: "pelanggan", width: 20 },
    { header: "Jumlah", key: "jumlah", width: 18 },
    { header: "Catatan", key: "catatan", width: 30 },
  ];
  wsBayar.getRow(1).font = { bold: true };
  for (const p of payments) {
    wsBayar.addRow({
      tanggal: p.date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: JAKARTA_TIMEZONE,
      }),
      pelanggan: p.customer.name,
      jumlah: p.amount,
      catatan: p.note ?? "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const bulanFile = jakartaDateKey(startOfMonth).slice(0, 7);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-toko-rema-${bulanFile}.xlsx"`,
    },
  });
}
