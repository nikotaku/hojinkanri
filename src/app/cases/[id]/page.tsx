import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { CaseStatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { CaseTasks } from "@/components/CaseTasks";
import { CaseNotes } from "@/components/CaseNotes";
import { ProgressBar } from "@/components/ProgressBar";
import { setCaseArchivedAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await getCase(params.id);
  if (!item) notFound();

  const done = item.case_tasks.filter((t) => t.is_completed).length;
  const archived = Boolean(item.archived_at);

  return (
    <div>
      <div className="mb-4">
        <Link
          href={archived ? "/cases/archived" : "/cases"}
          className="text-sm text-gray-500 hover:text-brand-600"
        >
          ← {archived ? "アーカイブ" : "案件一覧"}に戻る
        </Link>
      </div>

      <PageHeader title={item.title}>
        <CaseStatusBadge status={item.status} />
      </PageHeader>

      {archived && (
        <p className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          この案件はアーカイブ済みです（
          {formatDate(item.archived_at ?? null)}）。
        </p>
      )}

      {/* 概要 */}
      <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <dt className="text-xs text-gray-500">法人</dt>
            <dd className="mt-1 text-sm">
              {item.company_id ? (
                <Link
                  href={`/companies/${item.company_id}`}
                  className="text-brand-600 hover:underline"
                >
                  {item.company_name}
                </Link>
              ) : (
                <span className="text-gray-400">{item.company_name}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">優先度</dt>
            <dd className="mt-1">
              <PriorityBadge priority={item.priority} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">担当</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {item.assignee ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">金額</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatCurrency(item.amount)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">期限</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDate(item.due_date)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">進捗</dt>
            <dd className="mt-1">
              {item.case_tasks.length > 0 ? (
                <ProgressBar
                  completed={done}
                  total={item.case_tasks.length}
                  size="sm"
                />
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </dd>
          </div>
        </dl>

        {item.description && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <dt className="text-xs text-gray-500">内容</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {item.description}
            </dd>
          </div>
        )}
      </section>

      {/* 次にやるべきこと / 準備物 */}
      <div className="mb-4">
        <CaseNotes
          caseId={item.id}
          nextAction={item.next_action}
          materials={item.materials}
          tasks={item.case_tasks}
        />
      </div>

      {/* 小タスク */}
      <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-gray-900">
          小タスク
          <span className="ml-2 text-sm font-normal text-gray-500">
            {done}/{item.case_tasks.length}
          </span>
        </h2>
        <CaseTasks caseId={item.id} tasks={item.case_tasks} defaultOpen />
      </section>

      {/* アーカイブ */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <form action={setCaseArchivedAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="case_id" value={item.id} />
          <input
            type="hidden"
            name="archived"
            value={archived ? "false" : "true"}
          />
          <button
            type="submit"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {archived ? "アーカイブから戻す" : "この案件をアーカイブする"}
          </button>
          <span className="text-xs text-gray-500">
            {archived
              ? "戻すと案件一覧に再び表示されます。"
              : "一覧から外れます。消えるわけではなく、アーカイブからいつでも戻せます。"}
          </span>
        </form>
      </section>
    </div>
  );
}
