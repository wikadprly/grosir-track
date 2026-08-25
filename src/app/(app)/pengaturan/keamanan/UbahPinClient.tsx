"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, KeyRound, LifeBuoy } from "lucide-react";
import { useRouter } from "next/navigation";
import { changePin, setRecoveryPin as saveRecoveryPin } from "../actions";

interface Props {
  viaRecovery?: boolean;
}

export default function UbahPinClient({ viaRecovery = false }: Props) {
  const router = useRouter();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSimpan = () => {
    if (isPending) return;
    setError("");
    startTransition(async () => {
      const result = await changePin(currentPin, newPin, confirmPin);
      if (result.success) {
        setDone(true);
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
        if (viaRecovery) {
          // PIN utama sudah dibuat ulang; sesi recovery selesai.
          router.push("/");
          router.refresh();
        }
      } else {
        setError(result.error);
      }
    });
  };

  const inputClass =
    "w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg tracking-[0.4em] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d9534f]";
  const canSubmit = (viaRecovery || currentPin) && newPin.length === 6 && confirmPin.length === 6 && !isPending;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <KeyRound size={24} className="text-[#d9534f]" />
          </div>
          <p className="text-base font-bold text-gray-800">
            {viaRecovery ? "Buat PIN Utama Baru" : "Ubah PIN Aplikasi"}
          </p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          PIN baru harus terdiri dari 6 angka. Setelah diubah, gunakan PIN baru
          untuk membuka aplikasi.
        </p>
      </div>

      {done ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <Check size={20} className="text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">PIN berhasil diubah.</p>
        </div>
      ) : null}

      {!viaRecovery && (
        <div>
          <label className="text-base font-medium text-gray-700 mb-2 block">PIN Saat Ini</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className="text-base font-medium text-gray-700 mb-2 block">PIN Baru (6 angka)</label>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          maxLength={6}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-base font-medium text-gray-700 mb-2 block">Ulangi PIN Baru</label>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          maxLength={6}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        onClick={handleSimpan}
        disabled={!canSubmit}
        className={`w-full text-white py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${
          canSubmit ? "bg-[#d9534f] active:scale-[0.98]" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {isPending ? (
          <>
            <Loader2 size={22} className="animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Check size={22} strokeWidth={3} />
            Simpan PIN Baru
          </>
        )}
      </button>

      {done && (
        <button
          onClick={() => router.push("/pengaturan")}
          className="w-full bg-white border border-gray-200 text-gray-600 py-3.5 rounded-2xl text-base font-bold active:bg-gray-50 transition-colors"
        >
          Kembali ke Pengaturan
        </button>
      )}

      {!viaRecovery && <RecoveryPinSection />}
    </div>
  );
}

function RecoveryPinSection() {
  const [currentPin, setCurrentPin] = useState("");
  const [recoveryPin, setRecoveryPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSimpan = () => {
    if (isPending) return;
    setError("");
    setDone(false);
    startTransition(async () => {
      const result = await saveRecoveryPin(currentPin, recoveryPin, confirmPin);
      if (result.success) {
        setDone(true);
        setCurrentPin("");
        setRecoveryPin("");
        setConfirmPin("");
      } else {
        setError(result.error);
      }
    });
  };

  const inputClass =
    "w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg tracking-[0.4em] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d9534f]";
  const canSubmit = currentPin && recoveryPin.length === 6 && confirmPin.length === 6 && !isPending;

  return (
    <div className="space-y-5 pt-2">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <LifeBuoy size={24} className="text-blue-500" />
          </div>
          <p className="text-base font-bold text-gray-800">PIN Cadangan</p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Dipakai sekali saja saat PIN utama terlupa lewat tombol &quot;Lupa PIN&quot; di
          halaman masuk. Simpan angka ini di tempat aman — jangan sama dengan
          PIN utama.
        </p>
      </div>

      {done ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <Check size={20} className="text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">PIN cadangan berhasil disimpan.</p>
        </div>
      ) : null}

      <div>
        <label className="text-base font-medium text-gray-700 mb-2 block">PIN Utama Saat Ini</label>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          value={currentPin}
          onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-base font-medium text-gray-700 mb-2 block">PIN Cadangan (6 angka)</label>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          maxLength={6}
          value={recoveryPin}
          onChange={(e) => setRecoveryPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-base font-medium text-gray-700 mb-2 block">Ulangi PIN Cadangan</label>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          maxLength={6}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        onClick={handleSimpan}
        disabled={!canSubmit}
        className={`w-full text-white py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${
          canSubmit ? "bg-blue-500 active:scale-[0.98]" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {isPending ? (
          <>
            <Loader2 size={22} className="animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Check size={22} strokeWidth={3} />
            Simpan PIN Cadangan
          </>
        )}
      </button>
    </div>
  );
}
