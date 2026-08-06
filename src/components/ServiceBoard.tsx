"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Sortable from "sortablejs";
import type { Company } from "@/lib/types";
import { ServiceStatusSelect } from "@/components/ServiceStatusSelect";
import { ServiceContactInput } from "@/components/ServiceContactInput";
import { MobileContractDetails } from "@/components/MobileContractDetails";
import { reorderCompaniesAction } from "@/app/actions";

// サービス群ごとの保存先フィールド定義
const FIELD_SETS = {
  taxi: {
    status: "taxi",
    phone: "taxi_phone",
    email: "taxi_email",
    name: "taxi_name",
    adminUrl: "taxi_admin_url",
    loginId: "taxi_login_id",
    loginPw: "taxi_login_pw",
  },
  mobile: {
    status: "mobile",
    phone: "mobile_phone",
    email: "mobile_email",
    name: "mobile_name",
    adminUrl: "mobile_admin_url",
    loginId: "mobile_login_id",
    loginPw: "mobile_login_pw",
  },
} as const;

type Prefix = keyof typeof FIELD_SETS;

function statusClass(value: string): string {
  if (/(使用|完了|開設|通過|登録完了|契約)/.test(value)) {
    return "bg-green-100 text-green-700";
  }
  if (/(落ち|不可|中止|解約)/.test(value)) return "bg-red-100 text-red-700";
  if (/(未着手|未設定|未)/.test(value)) return "bg-gray-100 text-gray-500";
  return "bg-amber-100 text-amber-700";
}

function StatusPill({ value }: { value?: string }) {
  if (!value) return <span className="text-xs text-gray-300">—</span>;
  return (
    <span
      className={`inline-flex max-w-[12rem] items-center truncate whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(
        value,
      )}`}
    >
      {value}
    </span>
  );
}

/**
 * 会社ごとにサービス群（タクシー / モバイル回線）を折りたたみで表示するボード。
 * - 各サービスはトグルで開閉（要約に現在ステータス）
 * - モバイル回線では契約端末ごとに機種・担当者・契約日を記録
 * - 開くと ステータス / アプリ登録電話番号 / メール / 登録名 / 管理画面URL / ログインID / PW
 * - ⠿ ハンドルでドラッグ&ドロップ並び替え（順序は保存）
 */
export function ServiceBoard({
  companies,
  services,
  statusOptions,
  prefix,
}: {
  companies: Company[];
  services: readonly string[];
  statusOptions: readonly string[];
  prefix: Prefix;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const fields = FIELD_SETS[prefix];

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const sortable = Sortable.create(el, {
      animation: 150,
      handle: ".drag-handle",
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
        const statusMap = (c[fields.status] ?? {}) as Record<string, string>;
        const phoneMap = (c[fields.phone] ?? {}) as Record<string, string>;
        const emailMap = (c[fields.email] ?? {}) as Record<string, string>;
        const nameMap = (c[fields.name] ?? {}) as Record<string, string>;
        const adminUrlMap = (c[fields.adminUrl] ?? {}) as Record<string, string>;
        const loginIdMap = (c[fields.loginId] ?? {}) as Record<string, string>;
        const loginPwMap = (c[fields.loginPw] ?? {}) as Record<string, string>;
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
              {services.map((s) => (
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
                      field={fields.status}
                      service={s}
                      value={statusMap[s]}
                      options={statusOptions}
                    />
                    {prefix === "mobile" && (
                      <MobileContractDetails
                        companyId={c.id}
                        service={s}
                        details={(c.mobile_contract_details ?? []).filter(
                          (detail) => detail.service === s,
                        )}
                      />
                    )}
                    <ServiceContactInput
                      companyId={c.id}
                      field={fields.phone}
                      service={s}
                      value={phoneMap[s]}
                      placeholder="アプリ登録電話番号"
                      type="tel"
                    />
                    <ServiceContactInput
                      companyId={c.id}
                      field={fields.email}
                      service={s}
                      value={emailMap[s]}
                      placeholder="アプリ登録メールアドレス"
                      type="email"
                    />
                    <ServiceContactInput
                      companyId={c.id}
                      field={fields.name}
                      service={s}
                      value={nameMap[s]}
                      placeholder="アプリ登録名"
                    />
                    <div className="flex items-center gap-1.5">
                      <ServiceContactInput
                        companyId={c.id}
                        field={fields.adminUrl}
                        service={s}
                        value={adminUrlMap[s]}
                        placeholder="管理画面URL"
                        type="url"
                      />
                      {adminUrlMap[s] && (
                        <a
                          href={adminUrlMap[s]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          開く
                        </a>
                      )}
                    </div>
                    <ServiceContactInput
                      companyId={c.id}
                      field={fields.loginId}
                      service={s}
                      value={loginIdMap[s]}
                      placeholder="ログインID"
                    />
                    <ServiceContactInput
                      companyId={c.id}
                      field={fields.loginPw}
                      service={s}
                      value={loginPwMap[s]}
                      placeholder="ログインPW"
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
