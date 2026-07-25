import { getProducts } from "./actions";
import CatatBarangClient from "./CatatBarangClient";

export default async function CatatBarangPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getProducts();

  return (
    <CatatBarangClient
      pelangganId={id}
      products={products}
    />
  );
}
