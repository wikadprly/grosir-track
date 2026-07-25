import CatatNitipClient from "./CatatNitipClient";

export default async function CatatNitipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <CatatNitipClient pelangganId={id} />
  );
}
