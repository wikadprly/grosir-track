export default function PelangganLoading() {
  return (
    <main className="min-h-screen bg-[#faf9f7] pb-24">
      <div className="flex justify-between items-center px-5 pt-8 pb-5">
        <div className="h-9 w-40 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="px-5 mb-2">
        <div className="h-13 w-full bg-gray-200 rounded-2xl animate-pulse" />
      </div>
      <div className="mt-4 bg-white border-t border-gray-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
            <div className="h-5 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </main>
  );
}
