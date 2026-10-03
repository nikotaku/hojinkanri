"use client";

import { useState, useTransition } from "react";
import { setCompanyInvoiceNumberAction } from "@/app/actions";

/**
 * 適格請求書発行事業者の登録番号（インボイス番号）を入力・保存するボックス。
 * フォーカスを外すと保存し、形式が違う場合はエラーを表示する。
 */
export function CompanyInvoiceNumberInput({
  companyId,
  value,
}: {
  companyId: string;
  value?: string | null;
}) {
  const [current, setCurrent] = useState(value ?? "");
  const [saved, setSaved] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    if (current === saved) return;
    setError(null);
    startTransition(async () => {
      try {
        await setCompanyInvoiceNumberAction(companyId, current);
        const normalized = current
          .replace(/[\s-－―ー]/g, "")
          .toUpperCase();
        setCurrent(normalized);
        setSaved(normalized);
      } catch (e) {
        setCurrent(saved);
        setError(e instanceof Error ? e.message : "保存できませんでした。");
      }
    });
  };

  return (
    <div>
      <input
        type="text"
        inputMode="text"
        maxLength={20}
        aria-label="適格請求書発行事業者の登録番号"
        value={current}
        placeholder="T1234567890123"
        disabled={pending}
        onChange={(e) => setCurrent(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 font-mono text-sm text-gray-700 outline-none transition placeholder:font-sans placeholder:text-gray-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
      />
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
