"use client";

import { useState, useTransition } from "react";
import { setServiceStatusAction } from "@/app/actions";
import type { ServiceField } from "@/lib/data";

function statusClass(value: string): string {
  if (!value) return "bg-gray-50 text-gray-400 border-gray-200";
  if (/(使用|利用|完了|開設|通過|登録完了)/.test(value)) {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (/(落ち|不可|中止|解約)/.test(value)) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (/(未着手|未設定|未)/.test(value)) {
    return "bg-gray-100 text-gray-500 border-gray-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
}

/**
 * サービスのステータスを選ぶと即保存されるインライン編集用セレクト。
 * Notion のセレクトのように、その場で変更できる。
 */
export function ServiceStatusSelect({
  companyId,
  field,
  service,
  value,
  options,
  onValueChange,
}: {
  companyId: string;
  field: ServiceField;
  service: string;
  value?: string;
  options: readonly string[];
  onValueChange?: (value: string) => void;
}) {
  const [current, setCurrent] = useState(value ?? "");
  const [pending, startTransition] = useTransition();

  // 既存の値が選択肢に無い場合も表示できるように先頭へ追加
  const opts =
    current && !options.includes(current) ? [current, ...options] : options;

  return (
    <select
      aria-label={`${service} のステータス`}
      value={current}
      disabled={pending}
      onChange={(e) => {
        const v = e.target.value;
        setCurrent(v);
        onValueChange?.(v);
        startTransition(() =>
          setServiceStatusAction(companyId, field, service, v),
        );
      }}
      className={`max-w-[11rem] truncate rounded-full border px-2.5 py-1 text-xs font-medium outline-none transition focus:ring-2 focus:ring-brand-300 disabled:opacity-60 ${statusClass(
        current,
      )}`}
    >
      <option value="">—（未設定）</option>
      {opts.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
