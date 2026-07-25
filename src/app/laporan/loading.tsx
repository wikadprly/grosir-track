export default function LaporanLoading() {
  return (
    <main className="min-h-screen">
      {/* Header skeleton */}
      <div className="bg-white p-6 pb-5 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-9 w-32 bg-gray-200 rounded-xl animate-pulse mb-2" />
            <div className="h-5 w-36 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-11 w-28 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Ringkasan skeleton */}
        <section>
          <div className="h-6 w-44 bg-gray-200 rounded-lg animate-pulse mb-3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="h-5 w-40 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <div className="h-6 w-28 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Top pelanggan skeleton */}
        <section>
          <div className="h-6 w-56 bg-gray-200 rounded-lg animate-pulse mb-3" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-5 w-28 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <div className="h-5 w-28 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
