// Smoke test alur auth: jalankan saat server production berjalan (npx tsx scripts/smoke-auth.ts <port>)
import "dotenv/config";
import crypto from "node:crypto";

const PORT = process.argv[2] || "3456";
const BASE = `http://localhost:${PORT}`;
const SECRET = process.env.AUTH_SECRET;
if (!SECRET) {
  console.error("AUTH_SECRET tidak ditemukan di .env");
  process.exit(1);
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function makeToken(): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({ sub: "user-default", iat, exp: iat + 3600 }));
  const sig = crypto.createHmac("sha256", SECRET as string).update(`${header}.${body}`).digest();
  return `${header}.${body}.${b64url(sig)}`;
}

async function hit(path: string, opts: RequestInit & { skipBody?: boolean } = {}) {
  const res = await fetch(BASE + path, { redirect: "manual", ...opts });
  const location = res.headers.get("location") || "-";
  let body = "";
  if (!opts.skipBody) {
    try {
      body = (await res.text()).slice(0, 80);
    } catch {}
  }
  return { status: res.status, location, body };
}

async function main() {
  // 1. Beranda tanpa sesi -> redirect ke /masuk
  const home = await hit("/");
  console.log(home.status === 307 && home.location.includes("/masuk") ? "OK" : "FAIL", "tanpa sesi / ->", home.status, home.location);

  // 2. API tanpa sesi -> 401
  for (const [path, init] of [
    ["/api/backup", {}],
    ["/api/import", { method: "POST" as const }],
    ["/api/export/laporan", {}],
  ] as const) {
    const r = await hit(path, { ...init, skipBody: true });
    console.log(r.status === 401 ? "OK" : "FAIL", `tanpa sesi ${path} ->`, r.status);
  }

  // 3. Halaman masuk publik -> 200
  const masuk = await hit("/masuk");
  console.log(masuk.status === 200 ? "OK" : "FAIL", "/masuk publik ->", masuk.status);

  // 4. Token palsu -> ditolak
  const forged = await hit("/", { headers: { Cookie: "grosirtrack_session=palsu.palsu.palsu" } });
  console.log(forged.status === 307 ? "OK" : "FAIL", "token palsu ditolak ->", forged.status);

  // 5. Token valid -> akses penuh
  const token = await makeToken();
  const cookie = `grosirtrack_session=${token}`;
  const authedHome = await hit("/", { headers: { Cookie: cookie }, skipBody: true });
  console.log(authedHome.status === 200 ? "OK" : "FAIL", "dengan sesi / ->", authedHome.status);

  const authedBackup = await hit("/api/backup", { headers: { Cookie: cookie }, skipBody: true });
  console.log(authedBackup.status === 200 ? "OK" : "FAIL", "dengan sesi /api/backup ->", authedBackup.status);

  const authedMasuk = await hit("/masuk", { headers: { Cookie: cookie } });
  console.log([307, 308].includes(authedMasuk.status) ? "OK" : "FAIL", "sudah login buka /masuk ->", authedMasuk.status, authedMasuk.location);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
