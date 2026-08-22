"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/", label: "ダッシュボード", icon: "📊" },
  { href: "/companies", label: "法人管理", icon: "🏢" },
  { href: "/cases", label: "案件管理", icon: "📁" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function navClass(href: string): string {
    return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive(href)
        ? "bg-brand-50 text-brand-700"
        : "text-gray-600 hover:bg-gray-100"
    }`;
  }

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <span className="text-xl">🗂️</span>
          <span className="text-lg font-bold text-gray-900">法人案件管理</span>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="メインナビゲーション">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={navClass(item.href)}>
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-4 text-xs text-gray-400">
          hojinkanri v0.1
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <button
          type="button"
          aria-label="メニューを開く"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <span aria-hidden>{isMobileMenuOpen ? "×" : "☰"}</span>
        </button>
        <Link href="/" className="flex items-center gap-2 text-base font-bold text-gray-900">
          <span aria-hidden>🗂️</span>
          法人案件管理
        </Link>
        <span className="w-10" aria-hidden />
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-gray-900/20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <nav
            aria-label="モバイルメニュー"
            className="absolute inset-x-4 top-20 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navClass(item.href)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
