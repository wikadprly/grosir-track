import { getCustomerDetail } from "./actions";
import DetailPelangganClient from "./DetailPelangganClient";

export default async function DetailPelangganPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCustomerDetail(id);

  if (!data) {
    return (
      <main className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <p className="text-gray-400">Pelanggan tidak ditemukan</p>
      </main>
    );
  }

  return (
    <DetailPelangganClient
      pelangganId={id}
      namaPelanggan={data.nama}
      sisaHutang={data.sisaHutang}
      riwayatHari={data.riwayatHari}
    />
  );
}
