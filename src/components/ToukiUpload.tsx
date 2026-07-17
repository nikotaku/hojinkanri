"use client";

import { useRef, useTransition } from "react";
import { uploadToukiAction } from "@/app/actions";

/** 登記簿謄本(画像)のアップロードとプレビュー */
export function ToukiUpload({
  companyId,
  url,
}: {
  companyId: string;
  url?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("company_id", companyId);
    fd.set("file", file);
    startTransition(() => uploadToukiAction(fd));
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          {/* Storage の任意URLを表示するため next/image ではなく img を使用 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="登記簿謄本"
            className="max-h-80 w-auto max-w-full rounded-lg border border-gray-200 shadow-sm"
          />
        </a>
      ) : (
        <p className="text-sm text-gray-400">まだアップロードされていません。</p>
      )}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending
            ? "アップロード中…"
            : url
              ? "画像を差し替える"
              : "画像をアップロード"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onChange}
        />
      </div>
    </div>
  );
}
