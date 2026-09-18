"use client";

import { useState, useTransition } from "react";
import { updateCompanyProfileAction } from "@/app/actions";

export function CompanyProfileEditor({
  companyId,
  values,
}: {
  companyId: string;
  values: {
    representativeName?: string | null;
    corporateNumber?: string | null;
    establishedOn?: string | null;
    capital?: number | null;
    incorporationFilingStatus?: string | null;
    paymentTargetOn?: string | null;
  };
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function submit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateCompanyProfileAction(formData);
        setMessage("保存しました。");
        setOpen(false);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => {
          setMessage(null);
          setOpen((current) => !current);
        }}
        className="inline-flex items-center rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
      >
        {open ? "編集を閉じる" : "基本情報を編集"}
      </button>

      {message && (
        <p
          className={`text-sm ${message === "保存しました。" ? "text-emerald-700" : "text-red-600"}`}
          role="status"
        >
          {message}
        </p>
      )}

      {open && (
        <form action={submit} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <input type="hidden" name="company_id" value={companyId} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">代表社員・代表者名</span>
              <input
                name="representative_name"
                defaultValue={values.representativeName ?? ""}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">法人番号</span>
              <input
                name="corporate_number"
                defaultValue={values.corporateNumber ?? ""}
                inputMode="numeric"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">設立年月日</span>
              <input
                type="date"
                name="established_on"
                defaultValue={values.establishedOn ?? ""}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">資本金（円）</span>
              <input
                type="number"
                name="capital"
                min="0"
                step="1"
                defaultValue={values.capital ?? ""}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">法人設立届</span>
              <input
                name="incorporation_filing_status"
                defaultValue={values.incorporationFilingStatus ?? ""}
                placeholder="未着手・進行中・完了など"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">着金目標日</span>
              <input
                type="date"
                name="payment_target_on"
                defaultValue={values.paymentTargetOn ?? ""}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "保存中…" : "保存"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
