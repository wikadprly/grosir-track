import type { Metadata, Viewport } from "next";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buku Bon Ibu",
  description: "Aplikasi pencatatan hutang pelanggan khusus untuk Ibu.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Buku Bon",
  },
};

export const viewport: Viewport = {
  themeColor: "#d9534f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-200 text-gray-900 antialiased">
        <ServiceWorkerRegistration />
        <div className="w-full max-w-lg mx-auto min-h-screen bg-[#faf9f7] relative shadow-2xl overflow-x-hidden">
          <main className="pb-28 min-h-screen">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
