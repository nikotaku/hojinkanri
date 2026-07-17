"use client";

import { useState, useTransition } from "react";
import { setServiceStatusAction } from "@/app/actions";
import type { ServiceField } from "@/lib/data";

/**
 * サービスごとの登録電話番号 / 登録メールを入力するボックス。
 * フォーカスを外したタイミング（変更があれば）で即保存する。
 */
export function ServiceContactInput({
  companyId,
  field,
  service,
  value,
  placeholder,
  type = "text",
}: {
  companyId: string;
  field: ServiceField;
  service: string;
  value?: string;
  placeholder: string;
  type?: "text" | "tel" | "email" | "url";
}) {
  const [current, setCurrent] = useState(value ?? "");
  const [pending, startTransition] = useTransition();

  const save = () => {
    if (current === (value ?? "")) return;
    startTransition(() =>
      setServiceStatusAction(companyId, field, service, current.trim()),
    );
  };

  return (
    <input
      type={type}
      inputMode={
        type === "tel"
          ? "tel"
          : type === "email"
            ? "email"
            : type === "url"
              ? "url"
              : "text"
      }
      aria-label={`${service} の${placeholder}`}
      value={current}
      placeholder={placeholder}
      disabled={pending}
      onChange={(e) => setCurrent(e.target.value)}
      onBlur={save}
      className="w-full min-w-[9rem] rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
    />
  );
}
