import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createCaseBacklogAction,
  createCaseTaskAction,
  toggleCaseTaskAction,
} from "@/app/actions";
import {
  getCase,
  getCompany,
  listCaseBacklogs,
  listCaseTasks,
} from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { CASE_PRIORITY_LABELS, CASE_STATUS_LABELS } from "@/lib/types";
import { CaseStatusBadge, PriorityBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-4 py-3">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

export default async function CaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const caseItem = await getCase(params.id);
  if (!caseItem) notFound();

  const [company, tasks, backlogs] = await Promise.all([
    getCompany(caseItem.company_id),
    listCaseTasks(caseItem.id),
    listCaseBacklogs(caseItem.id),
  ]);
  const completedTaskCount = tasks.filter((task) => task.is_completed).length;

  return (
    <div>
      <nav aria-label="パンくず" className="mb-5 text-sm">
        <Link href="/cases" className="font-medium text-gray-500 hover:text-brand-600">
          案件管理
        </Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-700">案件詳細</span>
      </nav>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <CaseStatusBadge status={caseItem.status} />
              <PriorityBadge priority={caseItem.priority} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {caseItem.title}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              法人: {" "}
              {company ? (
                <Link
                  href={`/companies/${company.id}`}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  {company.name}
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>
          <Link
            href="/cases"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            一覧へ戻る
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <InfoItem label="担当" value={caseItem.assignee ?? "未設定"} />
          <InfoItem label="金額" value={formatCurrency(caseItem.amount)} />
          <InfoItem label="期限" value={formatDate(caseItem.due_date)} />
          <InfoItem label="登録日" value={formatDate(caseItem.created_at)} />
        </div>

        {caseItem.description && (
          <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold text-gray-800">案件の概要</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {caseItem.description}
            </p>
          </div>
        )}
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.75fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">小タスク</h2>
              <p className="mt-1 text-sm text-gray-500">
                完了 {completedTaskCount} / {tasks.length} 件
              </p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              進捗 {tasks.length === 0 ? 0 : Math.round((completedTaskCount / tasks.length) * 100)}%
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-4 py-7 text-center text-sm text-gray-500">
              小タスクはまだありません。下のフォームから追加できます。
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-100">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 px-4 py-3">
                  <form action={toggleCaseTaskAction}>
                    <input type="hidden" name="case_id" value={caseItem.id} />
                    <input type="hidden" name="task_id" value={task.id} />
                    <input
                      type="hidden"
                      name="is_completed"
                      value={task.is_completed ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      aria-label={`「${task.title}」を${task.is_completed ? "未完了" : "完了"}にする`}
                      className={`flex h-5 w-5 items-center justify-center rounded border transition ${
                        task.is_completed
                          ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700"
                          : "border-gray-300 bg-white text-transparent hover:border-brand-500"
                      }`}
                    >
                      <span aria-hidden className="text-xs leading-none">✓</span>
                    </button>
                  </form>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        task.is_completed ? "text-gray-400 line-through" : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p className="mt-1 text-xs text-gray-500">期限: {formatDate(task.due_date)}</p>
                    )}
                  </div>
                  {task.is_completed && (
                    <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      完了
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form action={createCaseTaskAction} className="mt-5 rounded-xl bg-brand-50/60 p-4">
            <input type="hidden" name="case_id" value={caseItem.id} />
            <p className="text-sm font-semibold text-gray-800">小タスクを追加</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_auto]">
              <input
                name="title"
                required
                placeholder="例: 見積書を作成する"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <input
                name="due_date"
                type="date"
                aria-label="小タスクの期限"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
              >
                追加
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-gray-900">案件の状態</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
                <dt className="text-gray-500">ステータス</dt>
                <dd className="font-medium text-gray-900">{CASE_STATUS_LABELS[caseItem.status]}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
                <dt className="text-gray-500">優先度</dt>
                <dd className="font-medium text-gray-900">{CASE_PRIORITY_LABELS[caseItem.priority]}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-500">最終更新</dt>
                <dd className="font-medium text-gray-900">{formatDate(caseItem.updated_at)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">バックログ</h2>
                <p className="mt-1 text-sm text-gray-500">後で対応すること・検討事項を残せます。</p>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {backlogs.length} 件
              </span>
            </div>

            {backlogs.length > 0 && (
              <ul className="mt-4 space-y-3">
                {backlogs.map((backlog) => (
                  <li key={backlog.id} className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-800">{backlog.title}</p>
                      <time className="shrink-0 text-xs text-gray-400">
                        {formatDate(backlog.created_at)}
                      </time>
                    </div>
                    {backlog.content && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-gray-600">
                        {backlog.content}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <form action={createCaseBacklogAction} className="mt-4 border-t border-gray-100 pt-4">
              <input type="hidden" name="case_id" value={caseItem.id} />
              <label className="block text-sm font-medium text-gray-700" htmlFor="backlog-title">
                新しいバックログ
              </label>
              <input
                id="backlog-title"
                name="title"
                required
                placeholder="例: 次回提案時に追加機能を確認する"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <textarea
                name="content"
                rows={3}
                placeholder="補足メモ（任意）"
                className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="mt-3 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                バックログに残す
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
