export default function DetailPelangganLoading() {
  return (
    <main className="min-h-screen bg-[#faf9f7] pb-28">
      {/* Header skeleton */}
      <div className="flex justify-between items-center px-5 pt-8 pb-4">
        <div className="h-7 w-7 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-6 w-28 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-7 w-7 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Kartu hutang skeleton */}
      <div className="px-5 mt-2">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="h-4 w-28 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Riwayat skeleton */}
      <div className="px-5 mt-8 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={i !== 1 ? "pt-6 border-t border-gray-200" : ""}>
            <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol skeleton */}
      <div className="fixed bottom-[88px] left-0 right-0 px-5 max-w-lg mx-auto z-20">
        <div className="h-14 w-full bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </main>
  );
}
