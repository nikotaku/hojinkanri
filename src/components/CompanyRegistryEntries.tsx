"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  updateCompanyRegistryEntryAction,
  uploadCompanyRegistryFilesAction,
} from "@/app/actions";
import type { CompanyRegistryEntry } from "@/lib/types";

function formatValue(value: unknown): string {
  if (value == null) return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.map((item) => formatValue(item)).join("\n");
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.kind === "Notion添付ファイル") {
      const fileName = typeof record.file_name === "string" ? record.file_name : "名称未取得";
      const status = typeof record.migration_status === "string" ? record.migration_status : "";
      return `ファイル名：${fileName}${status ? `\n${status}` : ""}`;
    }
    if (record.kind === "関連レコード") {
      const title = typeof record.title === "string" ? record.title : "関連レコード";
      const data = record.data;
      if (!data || typeof data !== "object" || Array.isArray(data)) return title;
      const details = Object.entries(data as Record<string, unknown>)
        .filter(([key]) => key !== "法人" && key !== "代表を務める法人")
        .map(([key, item]) => `${key}：${formatValue(item)}`)
        .join("\n");
      return details ? `${title}\n${details}` : title;
    }
    if (record.kind === "ページ本文") {
      const content = typeof record.content === "string" ? formatValue(record.content) : "—";
      const databaseNames = Array.isArray(record.embedded_databases)
        ? record.embedded_databases.filter((item): item is string => typeof item === "string")
        : [];
      const records = Array.isArray(record.body_records)
        ? record.body_records
            .map((item) => {
              if (!item || typeof item !== "object" || Array.isArray(item)) return formatValue(item);
              return Object.entries(item as Record<string, unknown>)
                .filter(([key]) => key !== "url")
                .map(([key, itemValue]) => `${key}：${formatValue(itemValue)}`)
                .join(" / ");
            })
            .filter(Boolean)
        : [];
      return [
        content !== "—" ? content : "",
        databaseNames.length > 0 ? `埋め込みデータベース：${databaseNames.join("、")}` : "",
        records.length > 0 ? `埋め込みレコード：\n${records.join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n") || "—";
    }
    return Object.entries(record)
      .map(([key, item]) => `${key}：${formatValue(item)}`)
      .join("\n");
  }
  if (typeof value === "boolean") return value ? "あり" : "なし";

  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .trim() || "—";
}

function editorValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value.some((item) => typeof item === "object")
      ? JSON.stringify(value, null, 2)
      : value.map((item) => formatValue(item)).join("\n");
  }
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return formatValue(value);
}

function parseValue(original: unknown, input: string): unknown {
  const value = input.trim();
  if (!value) return null;
  if (Array.isArray(original)) {
    if (original.some((item) => typeof item === "object")) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof original === "number") {
    const number = Number(value.replace(/[，,]/g, ""));
    return Number.isFinite(number) ? number : value;
  }
  if (typeof original === "boolean") return /^(true|あり|yes|1)$/i.test(value);
  if (typeof original === "object") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function uploadedFiles(value: unknown): Array<{ name: string; url: string }> {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    return typeof record.file_name === "string" && typeof record.uploaded_url === "string"
      ? [{ name: record.file_name, url: record.uploaded_url }]
      : [];
  });
}

function isDocumentEntry(entry: CompanyRegistryEntry): boolean {
  const values = Array.isArray(entry.value) ? entry.value : [entry.value];
  return values.some(
    (value) =>
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (value as Record<string, unknown>).kind === "Notion添付ファイル",
  );
}

export function CompanyRegistryEntries({
  companyId,
  entries,
}: {
  companyId: string;
  entries: CompanyRegistryEntry[];
}) {
  const groups = useMemo(() => {
    const byCategory = new Map<string, CompanyRegistryEntry[]>();
    entries.forEach((entry) => {
      const current = byCategory.get(entry.category) ?? [];
      current.push(entry);
      byCategory.set(entry.category, current);
    });
    return [...byCategory.entries()];
  }, [entries]);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(entry: CompanyRegistryEntry, input: string) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateCompanyRegistryEntryAction(
          companyId,
          entry.property_key,
          parseValue(entry.value, input),
        );
        setEditingKey(null);
        setMessage(`${entry.label}を保存しました。`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
      }
    });
  }

  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">移行済みの追加情報はありません。</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Notionの法人一覧から移行した追加項目です。ここで変更した内容は法人管理に保存されます。
      </p>
      {message && (
        <p
          className={`text-sm ${message.endsWith("保存しました。") ? "text-emerald-700" : "text-red-600"}`}
          role="status"
        >
          {message}
        </p>
      )}
      {groups.map(([category, groupEntries]) => (
        <details
          key={category}
          open={
            category === "登録・連絡先" ||
            category === "サービス・審査状況" ||
            category === "ページ本文・埋め込みデータ"
          }
          className="rounded-lg border border-gray-200 bg-white"
        >
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-800 marker:text-gray-400">
            {category} <span className="font-normal text-gray-400">（{groupEntries.length}項目）</span>
          </summary>
          <dl className="divide-y divide-gray-100 border-t border-gray-100">
            {groupEntries.map((entry) => {
              const isEditing = editingKey === entry.property_key;
              const files = uploadedFiles(entry.value);
              return (
                <div key={entry.id} className="px-4 py-3 sm:grid sm:grid-cols-[12rem_1fr_auto] sm:gap-4">
                  <dt className="text-sm font-medium text-gray-600">{entry.label}</dt>
                  <dd className="mt-1 min-w-0 whitespace-pre-wrap break-words text-sm text-gray-900 sm:mt-0">
                    {isEditing ? (
                      <RegistryEntryEditor
                        entry={entry}
                        pending={pending}
                        onSave={save}
                        onCancel={() => setEditingKey(null)}
                      />
                    ) : (
                      <>
                        {formatValue(entry.value)}
                        {files.length > 0 && (
                          <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                            {files.map((file) => (
                              <a
                                key={file.url}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                              >
                                保存済みファイルを開く: {file.name}
                              </a>
                            ))}
                          </span>
                        )}
                      </>
                    )}
                  </dd>
                  {!isEditing && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2 sm:mt-0 sm:block sm:space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMessage(null);
                          setEditingKey(entry.property_key);
                        }}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        編集
                      </button>
                      {isDocumentEntry(entry) && (
                        <RegistryDocumentUpload
                          companyId={companyId}
                          propertyKey={entry.property_key}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </dl>
        </details>
      ))}
    </div>
  );
}

function RegistryDocumentUpload({
  companyId,
  propertyKey,
}: {
  companyId: string;
  propertyKey: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setMessage(null);
    const formData = new FormData();
    formData.set("company_id", companyId);
    formData.set("property_key", propertyKey);
    files.forEach((file) => formData.append("files", file));
    startTransition(async () => {
      try {
        await uploadCompanyRegistryFilesAction(formData);
        setMessage("保存しました。");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "アップロードに失敗しました。");
      }
    });
    event.target.value = "";
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline disabled:opacity-60"
      >
        {pending ? "保存中…" : "ファイルを移行"}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={onChange}
      />
      {message && (
        <span className={`text-[11px] ${message === "保存しました。" ? "text-emerald-700" : "text-red-600"}`}>
          {message}
        </span>
      )}
    </span>
  );
}

function RegistryEntryEditor({
  entry,
  pending,
  onSave,
  onCancel,
}: {
  entry: CompanyRegistryEntry;
  pending: boolean;
  onSave: (entry: CompanyRegistryEntry, input: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(() => editorValue(entry.value));

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={Array.isArray(entry.value) ? 4 : 3}
        disabled={pending}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
      />
      {Array.isArray(entry.value) && (
        <p className="text-xs text-gray-400">
          {entry.value.some((item) => typeof item === "object")
            ? "構造化データはJSON形式で編集できます。"
            : "複数の値は改行ごとに保存されます。"}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onSave(entry, value)}
          disabled={pending}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-60"
        >
          {pending ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-60"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
