"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoBanner } from "./DemoBanner";

const nav = [
  { href: "/", label: "ダッシュボード", icon: "📊" },
  { href: "/companies", label: "法人管理", icon: "🏢" },
  { href: "/cases", label: "案件管理", icon: "📁" },
  { href: "/taxi", label: "タクシー関連", icon: "🚕" },
  { href: "/mobile", label: "法人モバイル回線", icon: "📱" },
  { href: "/accounts", label: "口座関連", icon: "🏦" },
  { href: "/backlog", label: "バックログ", icon: "📝" },
  { href: "/meishi", label: "名刺作成", icon: "💳" },
];

/**
 * アプリ全体のレイアウト（ヘッダー / サイドバー / 本文）。
 * - lg 以上: 左固定サイドバー
 * - lg 未満: 上部バー + ハンバーガーで開くドロワー
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const navLinks = (
    <nav className="flex-1 space-y-1 p-3">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive(item.href)
              ? "bg-brand-50 text-brand-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span aria-hidden>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* デスクトップ用サイドバー */}
      <aside className="hidden w-60 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <span className="text-xl">🗂️</span>
          <span className="text-lg font-bold text-gray-900">法人案件管理</span>
        </div>
        {navLinks}
        <div className="border-t border-gray-200 p-4 text-xs text-gray-400">
          hojinkanri v0.1
        </div>
      </aside>

      {/* モバイル用ドロワー */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col border-r border-gray-200 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <span className="flex items-center gap-2">
                <span className="text-xl">🗂️</span>
                <span className="text-base font-bold text-gray-900">
                  法人案件管理
                </span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="メニューを閉じる"
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            {navLinks}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* モバイル用トップバー */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="メニューを開く"
            className="-ml-2 rounded-md p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="flex items-center gap-2">
            <span className="text-lg">🗂️</span>
            <span className="text-base font-bold text-gray-900">法人案件管理</span>
          </span>
        </header>

        <DemoBanner />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
