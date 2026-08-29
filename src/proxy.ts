import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/jwt";
import { SESSION_COOKIE } from "@/lib/session";

const PUBLIC_PATHS = [
  "/masuk",
  "/_next/static",
  "/_next/image",
  "/favicon.ico",
  "/manifest.json",
  "/sw.js",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

// Sajikan service worker dengan Cache-Control no-cache agar browser
// selalu memeriksa ulang versi terbaru sw.js. Tanpa ini, sw.js lama yang
// ter-cache bisa membuat pembaruan aplikasi tidak pernah diterapkan
// sampai pengguna membersihkan cache manual.
function swResponse(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Tidak diizinkan. Silakan masuk terlebih dahulu." }, { status: 401 });
    }
    if (isPublic(pathname)) {
      if (pathname.startsWith("/sw")) return swResponse(NextResponse.next());
      return NextResponse.next();
    }
    const loginUrl = new URL("/masuk", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Sudah login tapi masih membuka halaman masuk -> kembali ke beranda
  if (pathname === "/masuk") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/sw")) return swResponse(NextResponse.next());

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
