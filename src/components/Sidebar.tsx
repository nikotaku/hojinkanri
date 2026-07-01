"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "ダッシュボード", icon: "📊" },
  { href: "/companies", label: "法人管理", icon: "🏢" },
  { href: "/cases", label: "案件管理", icon: "📁" },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <span className="text-xl">🗂️</span>
        <span className="text-lg font-bold text-gray-900">法人案件管理</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
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
      <div className="border-t border-gray-200 p-4 text-xs text-gray-400">
        hojinkanri v0.1
      </div>
    </aside>
  );
}
