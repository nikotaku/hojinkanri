import Link from "next/link";
import { notFound } from "next/navigation";
import { linkCasesToCompanyAction } from "@/app/actions";
import { PageHeader } from "@/components/PageHeader";
import { CaseStatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { getCompany, listCases } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LinkCasesPage({
  params,
}: {
  params: { id: string };
}) {
  const [company, allCases] = await Promise.all([
    getCompany(params.id),
    listCases(),
  ]);
  if (!company) notFound();

  const availableCases = allCases.filter((item) => !item.company_id);

  return (
    <div>
      <Link
        href={`/companies/${company.id}`}
        className="mb-4 inline-flex text-sm font-medium text-gray-500 hover:text-brand-600"
      >
        ← {company.name}に戻る
      </Link>

      <PageHeader
        title="案件を紐付け"
        description={`${company.name}へ追加する案件を選択します`}
        action={{
          href: `/cases/new?company=${company.id}`,
          label: "+ 新しい案件を作る",
        }}
      />

      {availableCases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          <p>法人未設定の案件はありません。</p>
          <Link
            href={`/cases/new?company=${company.id}`}
            className="mt-3 inline-flex font-medium text-brand-600 hover:text-brand-700"
          >
            新しい案件を作る →
          </Link>
        </div>
      ) : (
        <form action={linkCasesToCompanyAction}>
          <input type="hidden" name="company_id" value={company.id} />
          <fieldset>
            <legend className="mb-3 text-sm text-gray-500">
              法人未設定の案件から複数選択できます
            </legend>
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {availableCases.map((item) => {
                const total = item.case_tasks.length;
                const done = item.case_tasks.filter(
                  (task) => task.is_completed,
                ).length;

                return (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-start gap-3 px-4 py-4 transition hover:bg-gray-50 sm:px-6">
                      <input
                        type="checkbox"
                        name="case_ids"
                        value={item.id}
                        className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {item.title}
                          </span>
                          <CaseStatusBadge status={item.status} />
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <PriorityBadge priority={item.priority} />
                          <span>
                            小タスク {done}/{total}
                          </span>
                          <span>期限: {formatDate(item.due_date)}</span>
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div className="sticky bottom-4 mt-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              選択した案件を紐付ける
            </button>
            <Link
              href={`/companies/${company.id}`}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              キャンセル
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
