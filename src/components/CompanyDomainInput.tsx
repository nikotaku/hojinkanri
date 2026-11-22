"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCompanyDomainAction } from "@/app/actions";

export function CompanyDomainInput({ companyId, value }: { companyId: string; value?: string | null }) {
  const [current, setCurrent] = useState(value ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form onSubmit={event => {
      event.preventDefault();
      setError("");
      setMessage("");
      startTransition(async () => {
        try {
          const result = await setCompanyDomainAction(companyId, current);
          if (!result.ok) { setError(result.error); return; }
          setCurrent(result.domain ?? "");
          setMessage(result.domain ? "保存しました。" : "登録を解除しました。");
          router.refresh();
        } catch { setError("保存できませんでした。もう一度お試しください。"); }
      });
    }} className="space-y-2">
      <label htmlFor={`domain-${companyId}`} className="block text-sm text-gray-500">独自ドメイン</label>
      <div className="flex gap-2">
        <input id={`domain-${companyId}`} type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={current} onChange={event => { setCurrent(event.target.value); setMessage(""); setError(""); }} placeholder="example.co.jp" disabled={pending} aria-invalid={!!error} aria-describedby={`domain-help-${companyId} domain-status-${companyId}`} className="min-w-0 flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-300 disabled:opacity-60" />
        <button type="submit" disabled={pending} className="shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60">{pending ? "保存中…" : "保存"}</button>
      </div>
      <p id={`domain-help-${companyId}`} className="text-xs text-gray-500">空欄で保存すると登録を解除できます。</p>
      <p id={`domain-status-${companyId}`} role="status" className={`text-xs ${error ? "text-red-600" : "text-green-700"}`}>{error || message}</p>
    </form>
  );
}
