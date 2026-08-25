// Antrean catatan offline di sisi klien (IndexedDB).
// Dipakai saat ibu mencatat tanpa sinyal: catatan disimpan dulu di HP,
// lalu dikirim otomatis ke server oleh PendingSyncManager begitu online.

export interface PendingBase {
  id: string;
  customerId: string;
  date: string;
  createdAt: number;
  attempts: number;
}

export interface PendingTransaction extends PendingBase {
  kind: "transaction";
  items: { productId: string; qty: number; harga: number }[];
}

export interface PendingPayment extends PendingBase {
  kind: "payment";
  amount: number;
  note?: string;
}

export type PendingRecord = PendingTransaction | PendingPayment;

const DB_NAME = "grosir-track-offline";
const STORE_NAME = "pending";

export const PENDING_CHANGED_EVENT = "bukubon:pending-changed";

function openQueueDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Gagal membuka penyimpanan lokal"));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openQueueDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const request = fn(tx.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Operasi penyimpanan lokal gagal"));
    });
  } finally {
    db.close();
  }
}

export async function enqueuePending(record: PendingRecord): Promise<void> {
  await withStore("readwrite", (store) => store.put(record));
  notifyPendingChanged();
}

export async function getPendingRecords(): Promise<PendingRecord[]> {
  const records = await withStore<PendingRecord[]>("readonly", (store) => store.getAll());
  return records.sort((a, b) => a.createdAt - b.createdAt);
}

export async function removePendingRecord(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
  notifyPendingChanged();
}

export async function savePendingRecord(record: PendingRecord): Promise<void> {
  await withStore("readwrite", (store) => store.put(record));
}

export async function countPendingRecords(): Promise<number> {
  return withStore<number>("readonly", (store) => store.count());
}

export function notifyPendingChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PENDING_CHANGED_EVENT));
  }
}

// Server actions yang gagal karena jaringan muncul sebagai TypeError
// dari fetch, sedangkan error validasi membawa pesan spesifik aplikasi.
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const message = error instanceof Error ? error.message : String(error);
  return /failed to fetch|fetch failed|load failed|networkerror|network request failed/i.test(message);
}
