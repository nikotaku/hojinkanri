"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Sortable from "sortablejs";
import type { Company } from "@/lib/types";
import { TAXI_SERVICES, TAXI_STATUS_OPTIONS } from "@/lib/types";
import { ServiceStatusSelect } from "@/components/ServiceStatusSelect";
import { ServiceContactInput } from "@/components/ServiceContactInput";
import { reorderCompaniesAction } from "@/app/actions";

function statusClass(value: string): string {
  if (/(使用|完了|開設|通過|登録完了)/.test(value)) {
    return "bg-green-100 text-green-700";
  }
  if (/(落ち|不可|中止|解約)/.test(value)) return "bg-red-100 text-red-700";
  if (/(未着手|未設定|未)/.test(value)) return "bg-gray-100 text-gray-500";
  return "bg-amber-100 text-amber-700";
}

function StatusPill({ value }: { value?: string }) {
  if (!value)
    return <span className="text-xs text-gray-300">—</span>;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(
        value,
      )}`}
    >
      {value}
    </span>
  );
}

export function TaxiBoard({ companies }: { companies: Company[] }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const sortable = Sortable.create(el, {
      animation: 150,
      handle: ".drag-handle",
      // タッチ端末でも動くようフォールバックを有効化
      forceFallback: true,
      fallbackTolerance: 4,
      ghostClass: "opacity-40",
      onEnd: () => {
        const ids = Array.from(el.querySelectorAll<HTMLElement>("[data-id]")).map(
          (n) => n.dataset.id as string,
        );
        reorderCompaniesAction(ids);
      },
    });
    return () => sortable.destroy();
  }, [companies.length]);

  return (
    <ul ref={listRef} className="space-y-2">
      {companies.map((c) => {
        const statusMap = (c.taxi ?? {}) as Record<string, string>;
        const phoneMap = (c.taxi_phone ?? {}) as Record<string, string>;
        const emailMap = (c.taxi_email ?? {}) as Record<string, string>;
        const nameMap = (c.taxi_name ?? {}) as Record<string, string>;
        return (
          <li
            key={c.id}
            data-id={c.id}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="drag-handle cursor-grab touch-none select-none px-1 text-gray-300 hover:text-gray-500"
                aria-label="ドラッグして並び替え"
                title="ドラッグして並び替え"
              >
                ⠿
              </span>
              <Link
                href={`/companies/${c.id}`}
                className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 hover:text-brand-600"
              >
                {c.name}
              </Link>
            </div>

            <div className="mt-1.5 space-y-1">
              {TAXI_SERVICES.map((s) => (
                <details
                  key={s}
                  className="group rounded-md border border-gray-100 bg-gray-50/60 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2.5 py-1.5">
                    <span className="flex items-center gap-2">
                      <span className="text-gray-400 transition group-open:rotate-90">
                        ▸
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {s}
                      </span>
                    </span>
                    <StatusPill value={statusMap[s]} />
                  </summary>
                  <div className="space-y-1.5 px-2.5 pb-2.5 pt-1">
                    <ServiceStatusSelect
                      companyId={c.id}
                      field="taxi"
                      service={s}
                      value={statusMap[s]}
                      options={TAXI_STATUS_OPTIONS}
                    />
                    <ServiceContactInput
                      companyId={c.id}
                      field="taxi_phone"
                      service={s}
                      value={phoneMap[s]}
                      placeholder="アプリ登録電話番号"
                      type="tel"
                    />
                    <ServiceContactInput
                      companyId={c.id}
                      field="taxi_email"
                      service={s}
                      value={emailMap[s]}
                      placeholder="アプリ登録メールアドレス"
                      type="email"
                    />
                    <ServiceContactInput
                      companyId={c.id}
                      field="taxi_name"
                      service={s}
                      value={nameMap[s]}
                      placeholder="アプリ登録名"
                    />
                  </div>
                </details>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
