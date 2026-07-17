import Link from "next/link";
import { listCases } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { CaseStatusBadge, PriorityBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const cases = await listCases();

  return (
    <div>
      <PageHeader
        title="案件管理"
        description={`全 ${cases.length} 件`}
        action={{ href: "/cases/new", label: "+ 案件を登録" }}
      />

      {cases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ案件が登録されていません。
        </div>
      ) : (
        <>
          {/* モバイル: カード表示 */}
          <ul className="space-y-3 sm:hidden">
            {cases.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 font-medium text-gray-900">{c.title}</p>
                  <CaseStatusBadge status={c.status} />
                </div>
                {c.company_id ? (
                  <Link
                    href={`/companies/${c.company_id}`}
                    className="mt-1 block text-sm text-gray-500 hover:text-brand-600"
                  >
                    {c.company_name}
                  </Link>
                ) : (
                  <p className="mt-1 text-sm text-gray-400">{c.company_name}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
                  <PriorityBadge priority={c.priority} />
                  <span>担当: {c.assignee ?? "—"}</span>
                  <span>金額: {formatCurrency(c.amount)}</span>
                  <span>期限: {formatDate(c.due_date)}</span>
                </div>
              </li>
            ))}
          </ul>

          {/* デスクトップ: テーブル表示 */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    案件名
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    法人
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    ステータス
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    優先度
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    担当
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    金額
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    期限
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {c.title}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {c.company_id ? (
                        <Link
                          href={`/companies/${c.company_id}`}
                          className="text-gray-600 hover:text-brand-600"
                        >
                          {c.company_name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">{c.company_name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <CaseStatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {c.assignee ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(c.due_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
