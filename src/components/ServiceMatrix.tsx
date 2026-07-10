import Link from "next/link";
import type { Company } from "@/lib/types";
import {
  TAXI_STATUS_OPTIONS,
  ACCOUNT_STATUS_OPTIONS,
} from "@/lib/types";
import { ServiceStatusSelect } from "@/components/ServiceStatusSelect";
import { ServiceContactInput } from "@/components/ServiceContactInput";

/**
 * 会社 × サービスの状況一覧。モバイルはカード、デスクトップはテーブルで表示。
 * 各セルは Notion のように、その場でステータスを変更できる。
 * field で company.taxi / company.accounts のどちらを見るか切り替える。
 * perServiceContact が true の場合、各サービスのステータスの下に
 * 登録電話番号・登録メールアドレスの入力ボックスを表示する。
 */
export function ServiceMatrix({
  companies,
  services,
  field,
  perServiceContact = false,
}: {
  companies: Company[];
  services: readonly string[];
  field: "taxi" | "accounts";
  perServiceContact?: boolean;
}) {
  const options =
    field === "taxi" ? TAXI_STATUS_OPTIONS : ACCOUNT_STATUS_OPTIONS;

  // 各サービスのセル中身（ステータス + 任意で登録番号/メール入力）
  function ServiceControls({ company, service }: { company: Company; service: string }) {
    const statusMap = (company[field] ?? {}) as Record<string, string>;
    const phoneMap = (company.taxi_phone ?? {}) as Record<string, string>;
    const emailMap = (company.taxi_email ?? {}) as Record<string, string>;
    return (
      <div className="space-y-1.5">
        <ServiceStatusSelect
          companyId={company.id}
          field={field}
          service={service}
          value={statusMap[service]}
          options={options}
        />
        {perServiceContact && (
          <div className="space-y-1">
            <ServiceContactInput
              companyId={company.id}
              field="taxi_phone"
              service={service}
              value={phoneMap[service]}
              placeholder="登録電話番号"
              type="tel"
            />
            <ServiceContactInput
              companyId={company.id}
              field="taxi_email"
              service={service}
              value={emailMap[service]}
              placeholder="登録メールアドレス"
              type="email"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* モバイル: カード表示 */}
      <ul className="space-y-3 sm:hidden">
        {companies.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <Link
              href={`/companies/${c.id}`}
              className="block font-medium text-gray-900 hover:text-brand-600"
            >
              {c.name}
            </Link>
            <dl className="mt-3 space-y-2.5">
              {services.map((s) => (
                <div
                  key={s}
                  className={
                    perServiceContact
                      ? "rounded-lg border border-gray-100 bg-gray-50/50 p-2.5"
                      : "flex items-center justify-between gap-3"
                  }
                >
                  <dt
                    className={
                      perServiceContact
                        ? "mb-1.5 text-xs font-medium text-gray-600"
                        : "text-xs text-gray-500"
                    }
                  >
                    {s}
                  </dt>
                  <dd>
                    <ServiceControls company={c} service={s} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {/* デスクトップ: テーブル表示 */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm sm:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                会社名
              </th>
              {services.map((s) => (
                <th
                  key={s}
                  className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 align-top">
                  <Link
                    href={`/companies/${c.id}`}
                    className="font-medium text-gray-900 hover:text-brand-600"
                  >
                    {c.name}
                  </Link>
                </td>
                {services.map((s) => (
                  <td key={s} className="px-6 py-4 align-top">
                    <ServiceControls company={c} service={s} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
