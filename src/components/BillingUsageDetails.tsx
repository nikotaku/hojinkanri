"use client";

import { useState } from "react";
import {
  createBillingUsageDetailAction,
  deleteBillingUsageDetailAction,
  updateBillingUsageDetailAction,
} from "@/app/actions";
import type { BillingUsageDetail } from "@/lib/types";

type EditableUsage = BillingUsageDetail & {
  persisted: boolean;
  savedName: string;
};

/** NPかけ払いを何に使っているか、複数行で追加・編集する。 */
export function BillingUsageDetails({
  companyId,
  service,
  details,
}: {
  companyId: string;
  service: "NPかけ払い";
  details: BillingUsageDetail[];
}) {
  const [rows, setRows] = useState<EditableUsage[]>(() =>
    details.map((detail) => ({
      ...detail,
      persisted: true,
      savedName: detail.usage_name,
    })),
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addRow = () => {
    if (busyId || rows.some((row) => !row.persisted)) return;
    const now = new Date().toISOString();
    setError(null);
    setRows((current) => [
      ...current,
      {
        id: `draft-${crypto.randomUUID()}`,
        company_id: companyId,
        service,
        usage_name: "",
        login_id: null,
        login_pw: null,
        created_at: now,
        updated_at: now,
        persisted: false,
        savedName: "",
      },
    ]);
  };

  const changeRow = (id: string, value: string) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, usage_name: value } : row,
      ),
    );
  };

  const saveRow = async (id: string) => {
    const row = rows.find((item) => item.id === id);
    if (!row || busyId) return;
    const name = row.usage_name.trim();
    if (!name) {
      if (row.persisted) {
        changeRow(id, row.savedName);
        setError("利用先・用途を空欄にはできません。");
      }
      return;
    }
    if (name === row.savedName) return;

    setBusyId(id);
    setError(null);
    try {
      if (row.persisted) {
        await updateBillingUsageDetailAction(companyId, id, name);
        setRows((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, usage_name: name, savedName: name }
              : item,
          ),
        );
      } else {
        const created = await createBillingUsageDetailAction(
          companyId,
          name,
        );
        setRows((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...created,
                  persisted: true,
                  savedName: created.usage_name,
                }
              : item,
          ),
        );
      }
    } catch {
      setRows((current) =>
        current.map((item) =>
          item.id === id ? { ...item, usage_name: item.savedName } : item,
        ),
      );
      setError("保存できませんでした。もう一度お試しください。");
    } finally {
      setBusyId(null);
    }
  };

  const removeRow = async (row: EditableUsage) => {
    if (busyId) return;
    if (!row.persisted) {
      setRows((current) => current.filter((item) => item.id !== row.id));
      return;
    }
    if (!window.confirm("この利用先・用途を削除しますか？")) return;

    const previous = rows;
    setRows((current) => current.filter((item) => item.id !== row.id));
    setBusyId(row.id);
    setError(null);
    try {
      await deleteBillingUsageDetailAction(companyId, row.id, service);
    } catch {
      setRows(previous);
      setError("削除できませんでした。もう一度お試しください。");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-md border border-gray-200 bg-white p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-gray-700">利用先・用途</p>
        <button
          type="button"
          disabled={Boolean(busyId) || rows.some((row) => !row.persisted)}
          onClick={addRow}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-brand-600 transition hover:bg-brand-50 disabled:opacity-50"
        >
          + 追加
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="py-2 text-center text-[10px] text-gray-400">
          NPかけ払いを利用している支払先や用途を追加してください
        </p>
      ) : (
        <div className="mt-1.5 space-y-1.5">
          {rows.map((row, index) => (
            <div key={row.id} className="flex items-center gap-1.5">
              <input
                autoFocus={!row.persisted}
                type="text"
                maxLength={200}
                aria-label={`利用先・用途 ${index + 1}`}
                value={row.usage_name}
                placeholder="例：広告費、備品の仕入れ"
                disabled={busyId === row.id}
                onChange={(event) => changeRow(row.id, event.target.value)}
                onBlur={() => void saveRow(row.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
              />
              <button
                type="button"
                disabled={Boolean(busyId)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void removeRow(row)}
                aria-label={`利用先・用途 ${index + 1} を削除`}
                className="shrink-0 rounded px-1.5 py-1 text-[10px] text-red-500 transition hover:bg-red-50 disabled:opacity-50"
              >
                削除
              </button>
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
