export default function NitipLoading() {
  return (
    <main className="min-h-screen bg-[#faf9f7] pb-32">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 px-5 pt-8 pb-4 border-b border-gray-100">
        <div className="h-7 w-7 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-6 w-28 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* Tanggal skeleton */}
        <div>
          <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-13 w-full bg-gray-200 rounded-2xl animate-pulse" />
        </div>

        {/* Nominal skeleton */}
        <div>
          <div className="h-4 w-40 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-13 w-full bg-gray-200 rounded-2xl animate-pulse" />
        </div>

        {/* Catatan skeleton */}
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-28 w-full bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4 pb-6 max-w-lg mx-auto z-10">
        <div className="h-14 w-full bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </main>
  );
}
