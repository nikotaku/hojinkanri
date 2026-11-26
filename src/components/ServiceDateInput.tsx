"use client";

import { useState, useTransition } from "react";
import { setServiceStatusAction } from "@/app/actions";
import type { ServiceField } from "@/lib/data";

/**
 * サービスごとの日付（契約日など）を入力するボックス。
 * 変更があればその場で保存する。日付入力は選んだ時点で確定するので
 * onBlur ではなく onChange で保存する。
 */
export function ServiceDateInput({
  companyId,
  field,
  service,
  value,
  label,
}: {
  companyId: string;
  field: ServiceField;
  service: string;
  value?: string;
  label: string;
}) {
  const [current, setCurrent] = useState(value ?? "");
  const [pending, startTransition] = useTransition();

  const save = (next: string) => {
    setCurrent(next);
    if (next === (value ?? "")) return;
    startTransition(() =>
      setServiceStatusAction(companyId, field, service, next),
    );
  };

  return (
    <label className="flex items-center gap-2">
      <span className="shrink-0 text-[11px] font-medium text-gray-500">
        {label}
      </span>
      <input
        type="date"
        aria-label={`${service} の${label}`}
        value={current}
        disabled={pending}
        onChange={(event) => save(event.target.value)}
        className="w-full min-w-[9rem] rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
      />
      {current && (
        <button
          type="button"
          disabled={pending}
          onClick={() => save("")}
          className="shrink-0 rounded px-1.5 py-0.5 text-[11px] text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          クリア
        </button>
      )}
    </label>
  );
}
