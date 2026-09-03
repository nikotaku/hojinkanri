"use client";

import { useState } from "react";
import {
  createBillingUsageDetailAction,
  deleteBillingUsageDetailAction,
  updateBillingUsageDetailAction,
} from "@/app/actions";
import {
  NP_KAKEBARAI_SITE_GROUPS,
  NP_KAKEBARAI_SITE_OPTIONS,
  type BillingUsageDetail,
} from "@/lib/types";

const CUSTOM_SITE_VALUE = "__other__";

type EditableUsage = BillingUsageDetail & {
  persisted: boolean;
  savedName: string;
  customMode: boolean;
};

function isListedSite(value: string): boolean {
  return NP_KAKEBARAI_SITE_OPTIONS.some((option) => option === value);
}

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
      customMode: !isListedSite(detail.usage_name),
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
        customMode: false,
      },
    ]);
  };

  const changeRow = (
    id: string,
    patch: Partial<Pick<EditableUsage, "usage_name" | "customMode">>,
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    );
  };

  const saveRow = async (id: string, selectedName?: string) => {
    const row = rows.find((item) => item.id === id);
    if (!row || busyId) return;
    const name = (selectedName ?? row.usage_name).trim();
    if (!name) {
      if (row.persisted) {
        changeRow(id, {
          usage_name: row.savedName,
          customMode: !isListedSite(row.savedName),
        });
      }
      setError("利用サイトを選択または入力してください。");
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
              ? {
                  ...item,
                  usage_name: name,
                  savedName: name,
                  customMode: !isListedSite(name),
                }
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
                  customMode: !isListedSite(created.usage_name),
                }
              : item,
          ),
        );
      }
    } catch {
      setRows((current) =>
        current.map((item) =>
          item.id === id && item.persisted
            ? {
                ...item,
                usage_name: item.savedName,
                customMode: !isListedSite(item.savedName),
              }
            : item.id === id && selectedName !== undefined
              ? { ...item, usage_name: "", customMode: false }
            : item,
        ),
      );
      setError("保存できませんでした。もう一度お試しください。");
    } finally {
      setBusyId(null);
    }
  };

  const chooseSite = (row: EditableUsage, selected: string) => {
    setError(null);
    if (selected === CUSTOM_SITE_VALUE) {
      changeRow(row.id, { usage_name: "", customMode: true });
      return;
    }
    changeRow(row.id, { usage_name: selected, customMode: false });
    void saveRow(row.id, selected);
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
        <div>
          <p className="text-xs font-semibold text-gray-700">利用サイト</p>
          <p className="mt-0.5 text-[11px] leading-4 text-gray-400">
            NP掛け払い対応を確認できたサイトから選択
          </p>
        </div>
        <button
          type="button"
          disabled={Boolean(busyId) || rows.some((row) => !row.persisted)}
          onClick={addRow}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-brand-600 transition hover:bg-brand-50 disabled:opacity-50"
        >
          + サイト追加
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="py-2 text-center text-[10px] text-gray-400">
          NPかけ払いを利用するサイトを追加してください
        </p>
      ) : (
        <div className="mt-1.5 space-y-1.5">
          {rows.map((row, index) => {
            const selectedValue = row.customMode
              ? CUSTOM_SITE_VALUE
              : row.usage_name;
            const busy = busyId === row.id;
            return (
              <div
                key={row.id}
                className="rounded-md border border-gray-100 bg-gray-50/70 p-2"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-500">
                    サイト {index + 1}
                  </p>
                  <button
                    type="button"
                    disabled={Boolean(busyId)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => void removeRow(row)}
                    aria-label={`利用サイト ${index + 1} を削除`}
                    className="shrink-0 rounded px-1.5 py-0.5 text-xs text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>

                <select
                  autoFocus={!row.persisted}
                  aria-label={`利用サイト ${index + 1}`}
                  value={selectedValue}
                  disabled={busy}
                  onChange={(event) => chooseSite(row, event.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
                >
                  <option value="" disabled>
                    利用サイトを選択
                  </option>
                  {NP_KAKEBARAI_SITE_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value={CUSTOM_SITE_VALUE}>その他（手入力）</option>
                </select>

                {row.customMode && (
                  <input
                    autoFocus={!row.persisted}
                    type="text"
                    maxLength={200}
                    aria-label={`候補外の利用サイト ${index + 1}`}
                    value={row.usage_name}
                    placeholder="サイト名を入力"
                    disabled={busy}
                    onChange={(event) =>
                      changeRow(row.id, { usage_name: event.target.value })
                    }
                    onBlur={() => void saveRow(row.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                    }}
                    className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
                  />
                )}
              </div>
            );
          })}
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
