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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Tidak diizinkan. Silakan masuk terlebih dahulu." }, { status: 401 });
    }
    if (isPublic(pathname)) return NextResponse.next();
    const loginUrl = new URL("/masuk", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Sudah login tapi masih membuka halaman masuk -> kembali ke beranda
  if (pathname === "/masuk") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
