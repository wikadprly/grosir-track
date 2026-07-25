export default function BerandaLoading() {
  return (
    <main className="min-h-screen">
      {/* Header skeleton */}
      <div className="bg-white p-6 pb-5 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="h-9 w-56 bg-gray-200 rounded-xl animate-pulse mb-2" />
        <div className="h-5 w-48 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      <div className="px-5 space-y-8">
        {/* Ringkasan skeleton */}
        <section>
          <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse mb-3" />
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="h-5 w-36 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Pelanggan skeleton */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <div className="h-6 w-44 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 bg-gray-200 rounded-full animate-pulse" />
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
