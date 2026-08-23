"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { getCustomers } from "./actions";
import { formatRupiah } from "@/lib/format";

interface Pelanggan {
  id: string;
  nama: string;
  saldo: number;
  status: "hutang" | "lunas";
}

interface Props {
  initial: Pelanggan[];
  initialTotal: number;
}

export default function PelangganListClient({ initial, initialTotal }: Props) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initial.length || 50);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);
  const firstRun = useRef(true);

  const queryRef = useRef(query);
  const pageRef = useRef(page);
  const itemsRef = useRef(items);

  useEffect(() => {
    queryRef.current = query;
  });
  useEffect(() => {
    pageRef.current = page;
  });
  useEffect(() => {
    itemsRef.current = items;
  });

  const fetchList = useCallback(async (reset: boolean) => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const result = await getCustomers(queryRef.current, reset ? 1 : pageRef.current + 1);
      if (id !== reqId.current) return;
      setItems(reset ? result.items : [...itemsRef.current, ...result.items]);
      setTotal(result.total);
      setPage(result.page);
      setPageSize(result.pageSize);
    } catch (error) {
      console.error("Gagal memuat pelanggan:", error);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchList(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchList]);

  const hasMore = page * pageSize < total;

  return (
    <>
      {/* SEARCH BAR */}
      <div className="px-5 mb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white placeholder-gray-400 focus:outline-none focus:border-[#e65c5c] focus:ring-1 focus:ring-[#e65c5c] text-base transition-all shadow-sm"
            placeholder="Cari pelanggan..."
          />
        </div>
      </div>

      {/* DAFTAR PELANGGAN */}
      <div className="mt-4 bg-white border-t border-gray-100">
        {items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">
            {query ? `Tidak ada pelanggan dengan nama "${query}"` : "Belum ada pelanggan"}
          </p>
        ) : (
          items.map((pelanggan) => (
            <Link
              key={pelanggan.id}
              href={`/pelanggan/${pelanggan.id}`}
              className="flex justify-between items-center px-5 py-4 border-b border-gray-100 hover:bg-gray-50 active:bg-[#f4ebeb] transition-colors"
            >
              <span className="text-[17px] font-bold text-gray-900">
                {pelanggan.nama}
              </span>

              <div className="flex items-center gap-3">
                {pelanggan.status === "lunas" ? (
                  <span className="text-[15px] font-bold text-[#20a049] tracking-wide">
                    LUNAS
                  </span>
                ) : (
                  <span className="text-[15px] font-bold text-[#e65c5c]">
                    {formatRupiah(pelanggan.saldo)}
                  </span>
                )}
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </Link>
          ))
        )}

        {hasMore && (
          <button
            onClick={() => fetchList(false)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 text-sm font-bold text-[#e65c5c] hover:bg-[#fff5f5] active:bg-[#f4ebeb] transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Memuat...
              </>
            ) : (
              "Muat lebih banyak"
            )}
          </button>
        )}
      </div>
    </>
  );
}
