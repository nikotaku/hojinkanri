"use client";

import { useState } from "react";
import {
  createPaidServiceDetailAction,
  deleteBillingUsageDetailAction,
  updatePaidServiceCredentialsAction,
} from "@/app/actions";
import {
  PAID_SERVICE_OPTIONS,
  type BillingUsageDetail,
} from "@/lib/types";

const CUSTOM_SERVICE_VALUE = "__other__";

type EditablePaidService = BillingUsageDetail & {
  persisted: boolean;
  savedAdminUrl: string;
  savedLoginId: string;
  savedLoginPw: string;
  customMode: boolean;
};

function isListedPaidService(value: string): boolean {
  return PAID_SERVICE_OPTIONS.some((option) => option === value);
}

function isValidHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function TextField({
  label,
  value,
  password = false,
  type = "text",
  maxLength = 500,
  visible = false,
  disabled = false,
  onChange,
  onToggleVisibility,
}: {
  label: string;
  value: string;
  password?: boolean;
  type?: "text" | "url";
  maxLength?: number;
  visible?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onToggleVisibility?: () => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium text-gray-500">
        {label}
      </span>
      <span className="flex items-stretch">
        <input
          type={password && !visible ? "password" : type}
          inputMode={type === "url" ? "url" : "text"}
          autoComplete={type === "url" ? "url" : "off"}
          maxLength={maxLength}
          value={value}
          placeholder={label}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`min-w-0 flex-1 border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60 ${
            password ? "rounded-l-md" : "rounded-md"
          }`}
        />
        {password && (
          <button
            type="button"
            aria-label={`${label}を${visible ? "隠す" : "表示"}`}
            aria-pressed={visible}
            disabled={disabled}
            onClick={onToggleVisibility}
            className="shrink-0 rounded-r-md border border-l-0 border-gray-200 bg-gray-50 px-2 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-60"
          >
            {visible ? "隠す" : "表示"}
          </button>
        )}
      </span>
    </label>
  );
}

/** Paidを利用するサービスと、そのサービス側のログイン情報を管理する。 */
export function PaidServiceDetails({
  companyId,
  details,
}: {
  companyId: string;
  details: BillingUsageDetail[];
}) {
  const [rows, setRows] = useState<EditablePaidService[]>(() =>
    details.map((detail) => ({
      ...detail,
      persisted: true,
      savedAdminUrl: detail.admin_url ?? "",
      savedLoginId: detail.login_id ?? "",
      savedLoginPw: detail.login_pw ?? "",
      customMode: !isListedPaidService(detail.usage_name),
    })),
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [visiblePwIds, setVisiblePwIds] = useState<Set<string>>(
    () => new Set(),
  );
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
        service: "Paid",
        usage_name: "",
        admin_url: null,
        login_id: null,
        login_pw: null,
        created_at: now,
        updated_at: now,
        persisted: false,
        savedAdminUrl: "",
        savedLoginId: "",
        savedLoginPw: "",
        customMode: false,
      },
    ]);
  };

  const updateRow = (
    id: string,
    patch: Partial<
      Pick<
        EditablePaidService,
        | "usage_name"
        | "admin_url"
        | "login_id"
        | "login_pw"
        | "customMode"
      >
    >,
  ) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const chooseService = (row: EditablePaidService, selected: string) => {
    if (row.persisted) return;
    setError(null);
    if (selected === CUSTOM_SERVICE_VALUE) {
      updateRow(row.id, { usage_name: "", customMode: true });
      return;
    }
    updateRow(row.id, { usage_name: selected, customMode: false });
  };

  const saveRow = async (row: EditablePaidService) => {
    if (busyId) return;
    const usageName = row.usage_name.trim();
    if (!usageName) {
      setError("利用サービス名を選択または入力してください。");
      return;
    }

    const adminUrl = row.admin_url?.trim() ?? "";
    if (!isValidHttpUrl(adminUrl)) {
      setError("管理画面URLはhttp://またはhttps://から入力してください。");
      return;
    }
    const loginId = row.login_id?.trim() ?? "";
    const loginPw = row.login_pw ?? "";
    setBusyId(row.id);
    setError(null);
    try {
      if (row.persisted) {
        await updatePaidServiceCredentialsAction(
          companyId,
          row.id,
          adminUrl,
          loginId,
          loginPw,
        );
        setRows((current) =>
          current.map((item) =>
            item.id === row.id
              ? {
                  ...item,
                  admin_url: adminUrl || null,
                  login_id: loginId || null,
                  login_pw: loginPw || null,
                  savedAdminUrl: adminUrl,
                  savedLoginId: loginId,
                  savedLoginPw: loginPw,
                }
              : item,
          ),
        );
      } else {
        const created = await createPaidServiceDetailAction(
          companyId,
          usageName,
          adminUrl,
          loginId,
          loginPw,
        );
        setRows((current) =>
          current.map((item) =>
            item.id === row.id
              ? {
                  ...created,
                  persisted: true,
                  savedAdminUrl: created.admin_url ?? "",
                  savedLoginId: created.login_id ?? "",
                  savedLoginPw: created.login_pw ?? "",
                  customMode: !isListedPaidService(created.usage_name),
                }
              : item,
          ),
        );
      }
    } catch {
      setError("Paid利用サービスを保存できませんでした。入力内容を残したまま再試行できます。");
    } finally {
      setBusyId(null);
    }
  };

  const removeRow = async (row: EditablePaidService) => {
    if (busyId) return;
    if (!row.persisted) {
      setRows((current) => current.filter((item) => item.id !== row.id));
      return;
    }
    if (!window.confirm("このPaid利用サービスを削除しますか？")) return;

    const originalIndex = rows.findIndex((item) => item.id === row.id);
    setRows((current) => current.filter((item) => item.id !== row.id));
    setBusyId(row.id);
    setError(null);
    try {
      await deleteBillingUsageDetailAction(companyId, row.id, "Paid");
    } catch {
      setRows((current) => {
        if (current.some((item) => item.id === row.id)) return current;
        const next = [...current];
        next.splice(Math.max(0, originalIndex), 0, row);
        return next;
      });
      setError("利用サービスを削除できませんでした。もう一度お試しください。");
    } finally {
      setBusyId(null);
    }
  };

  const togglePassword = (id: string) => {
    setVisiblePwIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="rounded-md border border-gray-200 bg-white p-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-700">利用サービス</p>
          <p className="mt-0.5 text-[11px] leading-4 text-gray-400">
            Paid対応を確認できたサービスから選択
          </p>
        </div>
        <button
          type="button"
          disabled={Boolean(busyId) || rows.some((row) => !row.persisted)}
          onClick={addRow}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-brand-600 transition hover:bg-brand-50 disabled:opacity-50"
        >
          + サービス追加
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="py-3 text-center text-xs text-gray-400">
          Paidを利用するサービスを追加してください
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {rows.map((row, index) => {
            const busy = busyId === row.id;
            const dirty =
              !row.persisted ||
              (row.admin_url ?? "") !== row.savedAdminUrl ||
              (row.login_id ?? "") !== row.savedLoginId ||
              (row.login_pw ?? "") !== row.savedLoginPw;
            const selectedValue = row.customMode
              ? CUSTOM_SERVICE_VALUE
              : row.usage_name;
            return (
              <div
                key={row.id}
                className="rounded-md border border-gray-100 bg-gray-50/70 p-2"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-500">
                    サービス {index + 1}
                  </p>
                  <button
                    type="button"
                    disabled={Boolean(busyId)}
                    onClick={() => void removeRow(row)}
                    aria-label={`サービス ${index + 1} を削除`}
                    className="rounded px-1.5 py-0.5 text-xs text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">
                    利用サービス名
                  </span>
                  <select
                    autoFocus={!row.persisted}
                    aria-label={`利用サービス名 ${index + 1}`}
                    value={selectedValue}
                    disabled={busy || row.persisted}
                    onChange={(event) => chooseService(row, event.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
                  >
                    <option value="" disabled>
                      利用サービス名を選択
                    </option>
                    {PAID_SERVICE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    <option value={CUSTOM_SERVICE_VALUE}>その他（手入力）</option>
                  </select>
                </label>

                {row.customMode && (
                  <label className="mt-1.5 block">
                    <span className="sr-only">候補外の利用サービス名</span>
                    <input
                      autoFocus={!row.persisted}
                      type="text"
                      maxLength={200}
                      value={row.usage_name}
                      placeholder="利用サービス名を入力"
                      disabled={busy || row.persisted}
                      onChange={(event) =>
                        updateRow(row.id, { usage_name: event.target.value })
                      }
                      className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
                    />
                  </label>
                )}

                <div className="mt-2">
                  <TextField
                    label="サービス管理画面URL"
                    type="url"
                    maxLength={2000}
                    value={row.admin_url ?? ""}
                    disabled={busy}
                    onChange={(value) =>
                      updateRow(row.id, { admin_url: value })
                    }
                  />
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <TextField
                    label="サービス側ログインID"
                    value={row.login_id ?? ""}
                    disabled={busy}
                    onChange={(value) => updateRow(row.id, { login_id: value })}
                  />
                  <TextField
                    label="サービス側ログインPW"
                    value={row.login_pw ?? ""}
                    password
                    visible={visiblePwIds.has(row.id)}
                    disabled={busy}
                    onChange={(value) => updateRow(row.id, { login_pw: value })}
                    onToggleVisibility={() => togglePassword(row.id)}
                  />
                </div>

                <div className="mt-2 flex items-center justify-end gap-2">
                  {row.persisted && (
                    <span className="text-[11px] text-gray-400">
                      サービス名の変更は、削除して追加し直してください
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={
                      Boolean(busyId) || !dirty || !row.usage_name.trim()
                    }
                    onClick={() => void saveRow(row)}
                    className="shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {busy ? "保存中…" : dirty ? "保存" : "保存済み"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
