"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WifiOff } from "lucide-react";
import {
  countPendingRecords,
  getPendingRecords,
  removePendingRecord,
  savePendingRecord,
  PENDING_CHANGED_EVENT,
  isNetworkError,
  type PendingRecord,
} from "@/lib/offlineQueue";
import { createTransaction } from "@/app/(app)/pelanggan/[id]/barang/actions";
import { createPayment } from "@/app/(app)/pelanggan/[id]/nitip/actions";

const MAX_ATTEMPTS = 5;

export default function PendingSyncManager() {
  const [count, setCount] = useState(0);
  const flushingRef = useRef(false);

  const refreshCount = useCallback(async () => {
    try {
      setCount(await countPendingRecords());
    } catch {
      // IndexedDB tidak tersedia — abaikan.
    }
  }, []);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    flushingRef.current = true;
    try {
      for (const record of await getPendingRecords()) {
        try {
          if (record.kind === "transaction") {
            await createTransaction(record.customerId, record.date, record.items, record.id);
          } else {
            await createPayment(
              record.customerId,
              record.amount,
              record.date,
              record.note,
              record.id
            );
          }
          await removePendingRecord(record.id);
        } catch (error) {
          if (isNetworkError(error)) break; // masih offline / koneksi putus
          const attempts = record.attempts + 1;
          if (attempts >= MAX_ATTEMPTS) {
            console.error("Catatan offline dibuang setelah berkali-kali gagal:", record, error);
            await removePendingRecord(record.id);
          } else {
            await savePendingRecord({ ...record, attempts });
          }
        }
      }
    } finally {
      flushingRef.current = false;
      await refreshCount();
    }
  }, [refreshCount]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = await countPendingRecords();
        if (!cancelled) setCount(c);
      } catch {
        // IndexedDB tidak tersedia — abaikan.
      }
    })();

    const onOnline = () => void flush();
    const onChanged = () => {
      void refreshCount();
      void flush();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void flush();
    };

    window.addEventListener("online", onOnline);
    window.addEventListener(PENDING_CHANGED_EVENT, onChanged);
    document.addEventListener("visibilitychange", onVisible);
    void flush();

    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      window.removeEventListener(PENDING_CHANGED_EVENT, onChanged);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [flush, refreshCount]);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
      <div className="max-w-lg mx-auto flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 shadow-sm">
        <WifiOff size={18} className="shrink-0" />
        <p className="text-[13px] font-semibold leading-snug">
          {count} catatan tersimpan di HP dan akan terkirim otomatis saat online.
        </p>
      </div>
    </div>
  );
}

export type { PendingRecord };
