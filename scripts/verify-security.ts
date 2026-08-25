// Verifikasi fitur keamanan: jalankan dengan `npx tsx scripts/verify-security.ts`
// Menguji lockout login di database, upgrade PIN polos -> hash, uniknya
// clientRef (idempotensi offline sync), dan advisory lock per pelanggan.
// Data akhir dikembalikan seperti semula.
import "dotenv/config";
import prisma from "../src/lib/prisma";
import { loginWithPin, loginWithRecoveryPin } from "../src/app/masuk/actions";

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`OK: ${msg}`);
}

async function main() {
  const user = await prisma.user.findFirst();
  assert(user, "ada user di database");
  if (!user) return;

  const originalPin = user.pin;
  const originalFailed = user.failedAttempts;
  const originalLocked = user.lockedUntil;
  const originalTokenVersion = (
    await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { tokenVersion: true } })
  ).tokenVersion;

  try {
    // ── Persiapan: PIN polos agar sekaligus menguji jalur upgrade ke hash ──
    await prisma.user.update({
      where: { id: user.id },
      data: { pin: "123456", failedAttempts: 0, lockedUntil: null },
    });

    // ── 1. Empat PIN salah: counter naik, sisa percobaan menurun ──
    for (let i = 1; i <= 4; i++) {
      const res = await loginWithPin("000000");
      assert(!res.success && /Sisa percobaan/.test(res.error ?? ""), `percobaan salah #${i} memberi sisa percobaan`);
      const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { failedAttempts: true } });
      assert(fresh.failedAttempts === i, `failedAttempts tersimpan di database (#${i})`);
    }

    // ── 2. Percobaan kelima mengunci lewat database ──
    const fifth = await loginWithPin("999999");
    assert(!fifth.success && /Coba lagi dalam 60 detik|PIN salah/.test(fifth.error ?? ""), "percobaan kelima ditolak");
    const locked = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { lockedUntil: true, failedAttempts: true } });
    assert(locked.failedAttempts === 0 && locked.lockedUntil !== null, "lockedUntil terisi & counter direset");

    // ── 3. Saat terkunci, PIN benar pun ditolak ──
    // Cek lockout berada sebelum verifikasi PIN, jadi hasilnya pesan lockout.
    const stillLocked = await loginWithPin("123456");
    assert(!stillLocked.success && /Terlalu banyak/.test(stillLocked.error ?? ""), "saat terkunci, PIN benar pun mendapat pesan lockout");

    // ── 4. Lock kedaluwarsa: PIN benar diterima & PIN polos di-upgrade ke hash ──
    await prisma.user.update({
      where: { id: user.id },
      data: { lockedUntil: new Date(Date.now() - 1000) },
    });
    let upgradeWorked = false;
    try {
      const ok = await loginWithPin("123456");
      upgradeWorked = ok.success; // tak akan terjadi di luar Next (cookies dilempar)
    } catch {
      upgradeWorked = true; // createSession -> cookies() di luar konteks request: ini alur SUKSES
    }
    assert(upgradeWorked, "login sukses setelah lock kedaluwarsa");
    const upgraded = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { pin: true } });
    assert(/^\$2[aby]\$/.test(upgraded.pin), "PIN polos otomatis di-upgrade menjadi hash bcrypt");
    const cleared = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { failedAttempts: true, lockedUntil: true } });
    assert(cleared.failedAttempts === 0 && cleared.lockedUntil === null, "counter & lock dibersihkan setelah sukses");

    // ── 4b. Jalur PIN cadangan (lupa PIN) ──
    const originalRecovery = (await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { recoveryPin: true } })).recoveryPin;
    const versionBefore = (await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { tokenVersion: true } })).tokenVersion;
    const bcrypt = (await import("bcryptjs")).default;
    try {
      // Belum diatur -> ditolak dengan pesan jelas
      await prisma.user.update({ where: { id: user.id }, data: { recoveryPin: null } });
      const unset = await loginWithRecoveryPin("654321");
      assert(!unset.success && /belum diatur/.test(unset.error ?? ""), "PIN cadangan yang belum diatur ditolak");

      // Salah -> counter naik
      await prisma.user.update({
        where: { id: user.id },
        data: { recoveryPin: await bcrypt.hash("654321", 10), failedAttempts: 0, lockedUntil: null },
      });
      const wrong = await loginWithRecoveryPin("111111");
      assert(!wrong.success && /Sisa percobaan/.test(wrong.error ?? ""), "PIN cadangan salah memberi sisa percobaan");

      // Benar -> sesi recovery terbit (cookies dilempar di luar Next) + tokenVersion naik
      let reachedSession = false;
      try {
        const ok = await loginWithRecoveryPin("654321");
        reachedSession = ok.success;
      } catch {
        reachedSession = true;
      }
      assert(reachedSession, "login PIN cadangan sukses mencapai pembuatan sesi");
      const fresh = await prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { tokenVersion: true, failedAttempts: true },
      });
      assert(fresh.tokenVersion === versionBefore + 1, "sesi lama dibatalkan (tokenVersion naik)");
      assert(fresh.failedAttempts === 0, "counter dibersihkan setelah PIN cadangan benar");
    } finally {
      await prisma.user.update({
        where: { id: user.id },
        data: { recoveryPin: originalRecovery, failedAttempts: 0, lockedUntil: null },
      });
    }

    // ── 5. clientRef unik di level database (jaring pengaman anti duplikat) ──
    const customer = await prisma.customer.findFirst();
    assert(customer, "ada pelanggan untuk uji clientRef");
    if (customer) {
      const ref = `verify-${Date.now()}`;
      await prisma.payment.create({
        data: { customerId: customer.id, amount: 1, clientRef: ref },
      });
      let duplicateRejected = false;
      try {
        await prisma.payment.create({
          data: { customerId: customer.id, amount: 1, clientRef: ref },
        });
      } catch {
        duplicateRejected = true;
      }
      assert(duplicateRejected, "clientRef ganda ditolak database (idempotensi)");
      await prisma.payment.deleteMany({ where: { clientRef: ref } });
    }

    // ── 6. Advisory lock + pencatatan di dalam satu transaksi ──
    const customer2 = await prisma.customer.findFirst();
    if (customer2) {
      const created = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`WITH pglock AS (SELECT pg_advisory_xact_lock(hashtext(${customer2.id}))) SELECT 1 AS locked FROM pglock`;
        return tx.transaction.create({
          data: {
            customerId: customer2.id,
            totalAmount: 1,
            date: new Date(),
            details: { create: [] },
          },
          select: { id: true },
        });
      });
      assert(Boolean(created.id), "transaksi + advisory lock berjalan tanpa error");
      await prisma.transaction.delete({ where: { id: created.id } });
    }

    console.log("\nSemua tes keamanan lolos.");
  } finally {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pin: originalPin,
        failedAttempts: originalFailed,
        lockedUntil: originalLocked,
        tokenVersion: originalTokenVersion,
      },
    });
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
