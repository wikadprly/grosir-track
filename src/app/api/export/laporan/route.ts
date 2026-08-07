import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";
import { formatRupiah } from "@/lib/format";
import { JAKARTA_TIMEZONE, jakartaDateKey, startOfJakartaMonth, startOfNextJakartaMonth } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const startOfMonth = startOfJakartaMonth();
  const endOfMonth = startOfNextJakartaMonth();

  const [hutangBulanIni, pembayaranBulanIni, customers, transactions, payments] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: { date: { gte: startOfMonth, lt: endOfMonth } },
        _sum: { totalAmount: true },
      }),
      prisma.payment.aggregate({
        where: { date: { gte: startOfMonth, lt: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.customer.findMany({
        include: {
          transactions: { select: { totalAmount: true } },
          payments: { select: { amount: true } },
        },
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
    ]);

  const totalHutang = hutangBulanIni._sum.totalAmount ?? 0;
  const totalPembayaran = pembayaranBulanIni._sum.amount ?? 0;
  const sisaPiutang = totalHutang - totalPembayaran;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Buku Bon Ibu";
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
  wsRingkasan.addRow({ label: "Total Hutang Masuk", nilai: formatRupiah(totalHutang) });
  wsRingkasan.addRow({ label: "Total Pembayaran", nilai: formatRupiah(totalPembayaran) });
  wsRingkasan.addRow({ label: "Sisa Piutang", nilai: formatRupiah(sisaPiutang) });
  wsRingkasan.getRow(1).font = { bold: true };

  // ── Sheet Piutang per Pelanggan ──
  const wsPiutang = workbook.addWorksheet("Piutang Pelanggan");
  wsPiutang.columns = [
    { header: "Nama", key: "nama", width: 25 },
    { header: "Total Transaksi", key: "totalTransaksi", width: 20 },
    { header: "Total Bayar", key: "totalBayar", width: 20 },
    { header: "Sisa Hutang", key: "sisa", width: 20 },
  ];
  wsPiutang.getRow(1).font = { bold: true };
  for (const c of customers) {
    const totalTransaksi = c.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalBayar = c.payments.reduce((sum, p) => sum + p.amount, 0);
    wsPiutang.addRow({
      nama: c.name,
      totalTransaksi: totalTransaksi,
      totalBayar: totalBayar,
      sisa: totalTransaksi - totalBayar,
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
      "Content-Disposition": `attachment; filename="laporan-buku-bon-${bulanFile}.xlsx"`,
    },
  });
}
