"use client";

import { useState, useTransition } from "react";
import {
  createMobileContractDetailAction,
  deleteMobileContractDetailAction,
  updateMobileContractDetailAction,
} from "@/app/actions";
import type { MobileContractDetail } from "@/lib/types";
import type { MobileContractField } from "@/lib/data";

function ContractInput({
  companyId,
  detailId,
  field,
  label,
  placeholder,
  value,
  type = "text",
  onError,
}: {
  companyId: string;
  detailId: string;
  field: MobileContractField;
  label: string;
  placeholder?: string;
  value: string | null;
  type?: "text" | "date";
  onError: (message: string | null) => void;
}) {
  const initial = value ?? "";
  const [current, setCurrent] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();

  const save = () => {
    const next = current.trim();
    if (next === saved) return;
    onError(null);
    startTransition(async () => {
      try {
        await updateMobileContractDetailAction(
          companyId,
          detailId,
          field,
          next,
        );
        setSaved(next);
      } catch {
        setCurrent(saved);
        onError("保存できませんでした。もう一度入力してください。");
      }
    });
  };

  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10px] font-medium text-gray-500">
        {label}
      </span>
      <input
        type={type}
        value={current}
        placeholder={placeholder}
        disabled={pending}
        onChange={(event) => setCurrent(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
      />
    </label>
  );
}

/** モバイル回線の契約端末を、端末ごとに追加・編集する */
export function MobileContractDetails({
  companyId,
  service,
  details,
}: {
  companyId: string;
  service: string;
  details: MobileContractDetail[];
}) {
  const [rows, setRows] = useState(details);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const addRow = () => {
    setError(null);
    startTransition(async () => {
      try {
        const detail = await createMobileContractDetailAction(
          companyId,
          service,
        );
        setRows((current) => [...current, detail]);
      } catch {
        setError("端末を追加できませんでした。もう一度お試しください。");
      }
    });
  };

  const removeRow = (id: string) => {
    if (!window.confirm("この契約端末の記録を削除しますか？")) return;
    const previous = rows;
    setRows((current) => current.filter((row) => row.id !== id));
    setError(null);
    startTransition(async () => {
      try {
        await deleteMobileContractDetailAction(companyId, id);
      } catch {
        setRows(previous);
        setError("削除できませんでした。もう一度お試しください。");
      }
    });
  };

  return (
    <section className="rounded-md border border-gray-200 bg-white p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-gray-700">
          契約端末{rows.length > 0 ? `（${rows.length}台）` : ""}
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={addRow}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-brand-600 transition hover:bg-brand-50 disabled:opacity-50"
        >
          + 端末を追加
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="py-2 text-center text-[10px] text-gray-400">
          契約した端末を追加してください
        </p>
      ) : (
        <div className="mt-1.5 space-y-2">
          {rows.map((detail, index) => (
            <div
              key={detail.id}
              className="rounded-md border border-gray-100 bg-gray-50/70 p-2"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] font-semibold text-gray-500">
                  端末 {index + 1}
                </p>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => removeRow(detail.id)}
                  aria-label={`端末 ${index + 1} の記録を削除`}
                  className="rounded px-1.5 py-0.5 text-[10px] text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                >
                  削除
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                <ContractInput
                  companyId={companyId}
                  detailId={detail.id}
                  field="device_model"
                  label="契約機種名"
                  placeholder="例：iPhone 16 Pro"
                  value={detail.device_model}
                  onError={setError}
                />
                <ContractInput
                  companyId={companyId}
                  detailId={detail.id}
                  field="contract_person"
                  label="契約担当者"
                  value={detail.contract_person}
                  onError={setError}
                />
                <ContractInput
                  companyId={companyId}
                  detailId={detail.id}
                  field="contracted_on"
                  label="契約日"
                  value={detail.contracted_on}
                  type="date"
                  onError={setError}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-[10px] text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
