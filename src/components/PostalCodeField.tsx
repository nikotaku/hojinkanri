"use client";

import { useState } from "react";
import {
  lookupPostalCode,
  formatPostalCode,
  type PostalCandidate,
} from "@/lib/postal";

/**
 * 郵便番号の入力欄と、住所からの逆引きボタン。
 * 住所欄と連動させるため、住所の入力値も同じフォーム内から読み取る。
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

  const search = async () => {
    setBusy(true);
    setMessage(null);
    setCandidates([]);
    try {
      const result = await lookupPostalCode(address);
      if (result.candidates.length === 1) {
        setPostal(result.candidates[0].code);
        setMessage(`${result.candidates[0].label} で見つかりました。`);
      } else if (result.candidates.length > 1) {
        setCandidates(result.candidates);
        setMessage("候補が複数あります。該当するものを選んでください。");
      } else {
        setMessage(result.error ?? "郵便番号が見つかりませんでした。");
      }
    } catch {
      setMessage("住所データを取得できませんでした。通信状況をご確認ください。");
    } finally {
      setBusy(false);
    }
  };

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
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={search}
          disabled={busy || !address.trim()}
          className="mt-1.5 inline-flex items-center rounded-md border border-brand-600 bg-white px-3 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
        >
          {busy ? "検索中…" : "住所から郵便番号を取得"}
        </button>

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
