"use client";

import { useState, useTransition } from "react";
import { setCompanyHpAction } from "@/app/actions";

/** 会社HPのURLを入力・保存するボックス（フォーカスを外すと保存） */
export function CompanyHpInput({
  companyId,
  value,
}: {
  companyId: string;
  value?: string | null;
}) {
  const [current, setCurrent] = useState(value ?? "");
  const [pending, startTransition] = useTransition();

  const save = () => {
    if (current === (value ?? "")) return;
    startTransition(() => setCompanyHpAction(companyId, current.trim()));
  };

  return (
    <div className="flex w-full items-center gap-2">
      <input
        type="url"
        inputMode="url"
        aria-label="会社HPのURL"
        value={current}
        placeholder="https://example.com"
        disabled={pending}
        onChange={(e) => setCurrent(e.target.value)}
        onBlur={save}
        className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
      />
      {current && (
        <a
          href={current}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          開く
        </a>
      )}
    </div>
  );
}
