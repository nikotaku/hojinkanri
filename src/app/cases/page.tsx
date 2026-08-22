import Link from "next/link";
import { getTaskProgressByCase, listCases } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { CaseStatusBadge, PriorityBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const [cases, taskProgressByCase] = await Promise.all([
    listCases(),
    getTaskProgressByCase(),
  ]);

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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {cases.map((caseItem) => {
            const taskProgress = taskProgressByCase.get(caseItem.id) ?? {
              task_count: 0,
              completed_task_count: 0,
            };

            return (
              <Link
                key={caseItem.id}
                href={`/cases/${caseItem.id}`}
                aria-label={`案件「${caseItem.title}」の詳細を開く`}
                className="group block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">{caseItem.company_name}</p>
                    <h2 className="mt-1 text-lg font-bold text-gray-900 transition group-hover:text-brand-700">
                      {caseItem.title}
                    </h2>
                  </div>
                  <CaseStatusBadge status={caseItem.status} />
                </div>

                {caseItem.description && (
                  <p className="mt-3 min-h-10 text-sm leading-5 text-gray-500">
                    {caseItem.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-gray-100 py-4 text-sm text-gray-600">
                  <PriorityBadge priority={caseItem.priority} />
                  <span>担当: {caseItem.assignee ?? "未設定"}</span>
                  <span>金額: {formatCurrency(caseItem.amount)}</span>
                  <span>期限: {formatDate(caseItem.due_date)}</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      小タスク {taskProgress.completed_task_count}/{taskProgress.task_count}
                    </p>
                    <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: `${
                            taskProgress.task_count === 0
                              ? 0
                              : (taskProgress.completed_task_count / taskProgress.task_count) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    詳細を開く
                    <span aria-hidden className="text-lg leading-none transition group-hover:translate-x-0.5">›</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
