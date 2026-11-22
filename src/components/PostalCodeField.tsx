"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  lookupPostalCode,
  formatPostalCode,
  type PostalCandidate,
} from "@/lib/postal";

/**
 * 郵便番号の入力欄と住所欄。
 *
 * 住所を打ち終わると自動で郵便番号を引いて埋める。郵便番号を手で直したあとは
 * 上書きせず、住所を編集し直したときにまた自動取得を再開する。
 * 丁目によって番号が分かれる地域は候補を並べて選んでもらう。
 */
export function PostalCodeField({
  defaultPostalCode,
  defaultAddress,
}: {
  defaultPostalCode?: string | null;
  defaultAddress?: string | null;
}) {
  const [postal, setPostal] = useState(defaultPostalCode ?? "");
  const [address, setAddress] = useState(defaultAddress ?? "");
  const [candidates, setCandidates] = useState<PostalCandidate[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /**
   * 自動取得で最後に入れた郵便番号。
   * 空欄か、この値がそのまま残っているときだけ自動で書き換える。
   * 手で直した番号は住所をいじっても消さない（取得ボタンを押せば上書きする）。
   */
  const autoFilled = useRef<string>(defaultPostalCode ?? "");
  /** 最後に検索した住所。初期値は検索済み扱いにして無駄な通信を避ける */
  const lastQuery = useRef((defaultAddress ?? "").trim());
  /** 入力が進んだあとに古い結果が返ってきても捨てるための通し番号 */
  const requestId = useRef(0);

  const run = useCallback(async (value: string, auto: boolean) => {
    const query = value.trim();
    lastQuery.current = query;
    if (!query) {
      setCandidates([]);
      setMessage(null);
      return;
    }

    const id = ++requestId.current;
    setBusy(true);
    setMessage(null);
    setCandidates([]);

    try {
      const result = await lookupPostalCode(query);
      if (id !== requestId.current) return;

      if (result.candidates.length === 1) {
        const only = result.candidates[0];
        setPostal((current) => {
          if (auto && current.trim() !== "" && current !== autoFilled.current) {
            return current; // 手で直した番号は残す
          }
          autoFilled.current = only.code;
          return only.code;
        });
        setMessage(`${only.label} で見つかりました。`);
      } else if (result.candidates.length > 1) {
        setCandidates(result.candidates);
        setMessage(
          "丁目によって郵便番号が分かれています。該当するものを選んでください。",
        );
      } else {
        setMessage(result.error ?? "郵便番号が見つかりませんでした。");
      }
    } catch {
      if (id === requestId.current) {
        setMessage(
          "住所データを取得できませんでした。通信状況をご確認ください。",
        );
      }
    } finally {
      if (id === requestId.current) setBusy(false);
    }
  }, []);

  // 住所の入力が止まったら自動で引く
  useEffect(() => {
    const query = address.trim();
    if (query === lastQuery.current || query.length < 5) return;
    const timer = setTimeout(() => void run(query, true), 700);
    return () => clearTimeout(timer);
  }, [address, run]);

  return (
    <>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">郵便番号</span>
        <input
          name="postal_code"
          value={postal}
          inputMode="numeric"
          maxLength={8}
          placeholder="150-0031"
          onChange={(e) => setPostal(e.target.value)}
          onBlur={(e) => setPostal(formatPostalCode(e.target.value))}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">住所</span>
        <input
          name="address"
          value={address}
          placeholder="東京都渋谷区桜丘町4-14..."
          onChange={(e) => setAddress(e.target.value)}
          onBlur={() => {
            if (address.trim() !== lastQuery.current) void run(address, true);
          }}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <button
            type="button"
            onClick={() => void run(address, false)}
            disabled={busy || !address.trim()}
            className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-brand-600 bg-white px-3 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
          >
            {busy ? "検索中…" : "郵便番号を取得"}
          </button>
          <span className="text-xs text-gray-400">
            住所を入力すると自動で取得します
          </span>
        </div>

        {message && (
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
            {message}
          </p>
        )}

        {candidates.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {candidates.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  autoFilled.current = c.code;
                  setPostal(c.code);
                  setCandidates([]);
                  setMessage(`${c.label} を選びました。`);
                }}
                className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 transition hover:bg-gray-50"
              >
                <span className="font-mono">{c.code}</span>
                <span className="ml-1.5 text-gray-500">{c.label}</span>
              </button>
            ))}
          </div>
        )}
      </label>
    </>
  );
}
