import Link from "next/link";
import type { Company } from "@/lib/types";

function statusClass(value: string): string {
  if (/(使用|完了|開設|通過|登録完了)/.test(value)) {
    return "bg-green-100 text-green-700";
  }
  if (/(落ち|不可|中止|解約)/.test(value)) {
    return "bg-red-100 text-red-700";
  }
  if (/(未着手|未設定|未)/.test(value)) {
    return "bg-gray-100 text-gray-500";
  }
  // 審査中・依頼中・準備中・進行中・申請済み など
  return "bg-amber-100 text-amber-700";
}

function StatusCell({ value }: { value?: string }) {
  if (!value) return <span className="text-gray-300">—</span>;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(
        value,
      )}`}
    >
      {value}
    </span>
  );
}

/**
 * 会社 × サービスの状況一覧。モバイルはカード、デスクトップはテーブルで表示。
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
              <dl className="mt-3 space-y-1.5">
                {services.map((s) => (
                  <div key={s} className="flex items-center justify-between gap-3">
                    <dt className="text-xs text-gray-500">{s}</dt>
                    <dd>
                      <StatusCell value={map[s]} />
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
                      <StatusCell value={map[s]} />
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
