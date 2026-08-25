"use client";

import { useState, useTransition } from "react";
import { Delete, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginWithPin, loginWithRecoveryPin } from "./actions";

const KEYPAD: { key: string; letters?: string }[] = [
  { key: "1" },
  { key: "2", letters: "ABC" },
  { key: "3", letters: "DEF" },
  { key: "4", letters: "GHI" },
  { key: "5", letters: "JKL" },
  { key: "6", letters: "MNO" },
  { key: "7", letters: "PQRS" },
  { key: "8", letters: "TUV" },
  { key: "9", letters: "WXYZ" },
];

export default function MasukClient() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [errorTick, setErrorTick] = useState(0);
  const [mode, setMode] = useState<"pin" | "recovery">("pin");
  const [isPending, startTransition] = useTransition();

  const submit = (value: string) => {
    startTransition(async () => {
      if (mode === "recovery") {
        const result = await loginWithRecoveryPin(value);
        if (result.success) {
          // Sesi recovery: langsung diarahkan membuat PIN utama baru.
          router.push("/pengaturan/keamanan");
          router.refresh();
        } else {
          setError(result.error);
          setErrorTick((t) => t + 1);
          setPin("");
        }
        return;
      }

      const result = await loginWithPin(value);
      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error);
        setErrorTick((t) => t + 1);
        setPin("");
      }
    });
  };

  const pressKey = (key: string) => {
    if (isPending) return;
    if (key === "hapus") {
      setError("");
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (key === "masuk") {
      if (pin.length >= 4) submit(pin);
      return;
    }
    const next = pin.length >= 6 ? pin : pin + key;
    setPin(next);
    if (next.length === 6) submit(next);
  };

  const switchMode = () => {
    setMode((m) => (m === "pin" ? "recovery" : "pin"));
    setPin("");
    setError("");
  };

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center">
      {/* Indikator PIN */}
      <div
        key={errorTick}
        className={`bg-white border border-gray-100 shadow-sm rounded-full px-7 py-4 flex gap-3.5 ${
          error ? "animate-pin-shake" : ""
        }`}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={`${i}-${pin.length}`}
            className={`w-3 h-3 rounded-full transition-all duration-150 ${
              i < pin.length ? "animate-pin-pop bg-[#d9534f]" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <p className={`text-sm font-medium mt-4 text-center min-h-5 ${error ? "text-red-500" : "text-gray-400"}`}>
        {isPending
          ? "Memeriksa PIN..."
          : error || (mode === "recovery" ? "Masukkan 6 angka PIN cadangan" : "Masukkan 6 angka PIN")}
      </p>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-x-5 gap-y-3.5 w-full mt-6">
        {KEYPAD.map(({ key, letters }) => (
          <button
            key={key}
            type="button"
            onClick={() => pressKey(key)}
            disabled={isPending}
            className="aspect-square w-full rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center active:bg-[#fff5f5] active:scale-90 active:border-[#f3c9c9] transition-all disabled:opacity-40 select-none"
          >
            <span className="text-2xl font-semibold text-gray-800 leading-none">{key}</span>
            <span className="text-[10px] tracking-[0.2em] text-gray-300 font-medium mt-1 leading-none">
              {letters}
            </span>
          </button>
        ))}

        {/* Baris bawah: hapus, 0, masuk */}
        <button
          type="button"
          onClick={() => pressKey("hapus")}
          disabled={isPending || pin.length === 0}
          className="aspect-square w-full rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center active:bg-gray-50 active:scale-90 transition-all disabled:opacity-30"
        >
          <Delete size={26} className="text-gray-400" />
        </button>

        <button
          type="button"
          onClick={() => pressKey("0")}
          disabled={isPending}
          className="aspect-square w-full rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center active:bg-[#fff5f5] active:scale-90 transition-all disabled:opacity-40 select-none"
        >
          <span className="text-2xl font-semibold text-gray-800">0</span>
        </button>

        <button
          type="button"
          onClick={() => pressKey("masuk")}
          disabled={isPending || pin.length < 4}
          className={`aspect-square w-full rounded-full flex items-center justify-center transition-all ${
            pin.length >= 4 && !isPending
              ? "bg-gradient-to-br from-[#e65c5c] to-[#d9534f] text-white shadow-lg shadow-[#d9534f]/30 active:scale-90"
              : "bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] opacity-40 cursor-not-allowed"
          }`}
        >
          {isPending ? (
            <Loader2 size={24} className="animate-spin text-white" />
          ) : (
            <ShieldCheck size={26} />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={switchMode}
        disabled={isPending}
        className="mt-6 text-sm font-semibold text-gray-400 active:text-[#d9534f] transition-colors"
      >
        {mode === "pin" ? "Lupa PIN?" : "Kembali ke PIN utama"}
      </button>
    </div>
  );
}
