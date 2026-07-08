import Link from "next/link";
import type { Company } from "@/lib/types";
import {
  TAXI_STATUS_OPTIONS,
  ACCOUNT_STATUS_OPTIONS,
} from "@/lib/types";
import { ServiceStatusSelect } from "@/components/ServiceStatusSelect";

/**
 * 会社 × サービスの状況一覧。モバイルはカード、デスクトップはテーブルで表示。
 * 各セルは Notion のように、その場でステータスを変更できる。
 * field で company.taxi / company.accounts のどちらを見るか切り替える。
 */
export function ServiceMatrix({
  companies,
  services,
  field,
}: {
  companies: Company[];
  services: readonly string[];
  field: "taxi" | "accounts";
}) {
  const options =
    field === "taxi" ? TAXI_STATUS_OPTIONS : ACCOUNT_STATUS_OPTIONS;

  return (
    <>
      {/* モバイル: カード表示 */}
      <ul className="space-y-3 sm:hidden">
        {companies.map((c) => {
          const map = (c[field] ?? {}) as Record<string, string>;
          return (
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
              <dl className="mt-3 space-y-2">
                {services.map((s) => (
                  <div key={s} className="flex items-center justify-between gap-3">
                    <dt className="text-xs text-gray-500">{s}</dt>
                    <dd>
                      <ServiceStatusSelect
                        companyId={c.id}
                        field={field}
                        service={s}
                        value={map[s]}
                        options={options}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
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
            {companies.map((c) => {
              const map = (c[field] ?? {}) as Record<string, string>;
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/companies/${c.id}`}
                      className="font-medium text-gray-900 hover:text-brand-600"
                    >
                      {c.name}
                    </Link>
                  </td>
                  {services.map((s) => (
                    <td key={s} className="whitespace-nowrap px-6 py-4">
                      <ServiceStatusSelect
                        companyId={c.id}
                        field={field}
                        service={s}
                        value={map[s]}
                        options={options}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
