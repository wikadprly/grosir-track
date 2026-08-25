// JWT HS256 murni Web Crypto — aman dipakai di Node runtime maupun Proxy.
// Tidak boleh mengimpor modul next/* di file ini.

export interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
  ver?: number;
  // Ditandai saat masuk memakai PIN cadangan: pemilik mungkin lupa PIN utama,
  // jadi changePin tidak menuntut PIN lama. Tidak bisa dipalsukan dari klien
  // karena token disimpan di cookie httpOnly.
  rec?: boolean;
}

export interface SessionOptions {
  tokenVersion?: number;
  recovery?: boolean;
}

const encoder = new TextEncoder();

function getSecretKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET belum diatur. Tambahkan AUTH_SECRET (string acak minimal 32 karakter) di file .env"
    );
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function sign(data: string): Promise<string> {
  const key = await getSecretKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
}

export async function signSession(userId: string, maxAgeSeconds: number, options: SessionOptions = {}): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: userId,
    iat: issuedAt,
    exp: issuedAt + maxAgeSeconds,
    ver: options.tokenVersion ?? 0,
    ...(options.recovery ? { rec: true } : {}),
  };
  const header = toBase64Url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  let expected: string;
  try {
    expected = await sign(`${header}.${body}`);
  } catch {
    return null;
  }
  // perbandingan konstan-waktu sederhana
  if (expected.length !== signature.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (!payload.sub || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
