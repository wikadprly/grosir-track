import BottomNav from "@/components/BottomNav";
import PendingSyncManager from "@/components/PendingSyncManager";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-lg mx-auto min-h-screen bg-[#faf9f7] relative shadow-2xl overflow-clip">
      <main className="pb-28 min-h-screen">
        {children}
      </main>
      <PendingSyncManager />
      <BottomNav />
    </div>
  );
}
