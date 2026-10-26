"use client";

import { useEffect, useRef, useState } from "react";
import { parseQtyInput, qtyInputText } from "@/lib/qty";

interface QtyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  ariaLabel?: string;
}

function sanitizeDraft(raw: string): string {
  let next = raw.replace(/[^\d.,]/g, "").replace(/\./g, ",");
  const comma = next.indexOf(",");
  if (comma !== -1) {
    next = next.slice(0, comma + 1) + next.slice(comma + 1).replace(/,/g, "");
  }

  const [rawWhole, rawFraction] = next.split(",");
  const whole = rawWhole.slice(0, 5) || "0";
  if (rawFraction === undefined) return rawWhole.slice(0, 5);
  return `${whole},${rawFraction.slice(0, 3)}`;
}

export default function QtyInput({
  value,
  onChange,
  className = "",
  ariaLabel = "Jumlah",
}: QtyInputProps) {
  const [draft, setDraft] = useState(qtyInputText(value));
  const editing = useRef(false);

  useEffect(() => {
    if (!editing.current) setDraft(qtyInputText(value));
  }, [value]);

  const commit = () => {
    const parsed = parseQtyInput(draft);
    const next = parsed ?? value;
    setDraft(qtyInputText(next));
    if (next !== value) onChange(next);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="[0-9.,]*"
      enterKeyHint="done"
      value={draft}
      aria-label={ariaLabel}
      onFocus={(e) => {
        editing.current = true;
        e.currentTarget.select();
      }}
      onChange={(e) => setDraft(sanitizeDraft(e.target.value))}
      onBlur={() => {
        editing.current = false;
        commit();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={className}
    />
  );
}
