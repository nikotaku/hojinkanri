import Link from "next/link";
import type { Company } from "@/lib/types";
import {
  TAXI_STATUS_OPTIONS,
  ACCOUNT_STATUS_OPTIONS,
} from "@/lib/types";
import { ServiceStatusSelect } from "@/components/ServiceStatusSelect";

/** 登録に使った電話番号・メールアドレスの表示 */
function Contact({ company }: { company: Company }) {
  return (
    <div className="mt-1 space-y-0.5 text-xs text-gray-500">
      <p className="flex items-center gap-1">
        <span aria-hidden>📱</span>
        <span className="break-all">{company.phone ?? "—"}</span>
      </p>
      <p className="flex items-center gap-1">
        <span aria-hidden>✉️</span>
        <span className="break-all">{company.email ?? "—"}</span>
      </p>
    </div>
  );
}

/**
 * 会社 × サービスの状況一覧。モバイルはカード、デスクトップはテーブルで表示。
 * 各セルは Notion のように、その場でステータスを変更できる。
 * field で company.taxi / company.accounts のどちらを見るか切り替える。
 * showContact が true の場合、登録に使った電話番号・メールアドレスも表示する。
 */
export function ServiceMatrix({
  companies,
  services,
  field,
  showContact = false,
}: {
  companies: Company[];
  services: readonly string[];
  field: "taxi" | "accounts";
  showContact?: boolean;
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
              {showContact && <Contact company={c} />}
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
              {showContact && (
                <>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    登録番号
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    登録メール
                  </th>
                </>
              )}
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
                  {showContact && (
                    <>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {c.phone ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {c.email ?? "—"}
                      </td>
                    </>
                  )}
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
