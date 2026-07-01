import Link from "next/link";
import { getDashboardStats } from "@/lib/data";
import { CASE_STATUS_LABELS, type CaseStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { CaseStatusBadge, PriorityBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const statusOrder: CaseStatus[] = [
    "new",
    "in_progress",
    "on_hold",
    "done",
    "lost",
  ];
  const maxCount = Math.max(1, ...statusOrder.map((s) => stats.casesByStatus[s]));

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        description="法人と案件の状況サマリー"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="登録法人数"
          value={`${stats.companyCount}`}
          sub={`取引中 ${stats.activeCompanyCount} 社`}
        />
        <StatCard label="進行中の案件" value={`${stats.openCaseCount}`} />
        <StatCard
          label="進行中案件の金額合計"
          value={formatCurrency(stats.openAmountTotal)}
        />
        <StatCard
          label="完了案件"
          value={`${stats.casesByStatus.done}`}
          sub={`失注 ${stats.casesByStatus.lost} 件`}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ステータス別の件数 */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            ステータス別の案件数
          </h2>
          <ul className="space-y-3">
            {statusOrder.map((s) => (
              <li key={s} className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-sm text-gray-600">
                  {CASE_STATUS_LABELS[s]}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{
                      width: `${(stats.casesByStatus[s] / maxCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-medium text-gray-900">
                  {stats.casesByStatus[s]}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 期限が近い案件 */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            期限が近い案件
          </h2>
          {stats.upcomingCases.length === 0 ? (
            <p className="text-sm text-gray-500">対象の案件はありません。</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.upcomingCases.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/companies/${c.company_id}`}
                      className="block truncate text-sm font-medium text-gray-900 hover:text-brand-600"
                    >
                      {c.title}
                    </Link>
                    <p className="truncate text-xs text-gray-500">
                      {c.company_name}
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={c.priority} />
                    <span className="text-xs text-gray-500">
                      {formatDate(c.due_date)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/companies/new"
          className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
        >
          法人を登録
        </Link>
        <Link
          href="/cases/new"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          案件を登録
        </Link>
      </div>
    </div>
  );
}
