"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi kesalahan</h2>
        <p className="text-gray-500 mb-4">{error.message}</p>
        <button onClick={reset} className="bg-[#d9534f] text-white px-6 py-3 rounded-xl">
          Coba lagi
        </button>
      </div>
    </main>
  );
}
