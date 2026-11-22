import Link from "next/link";
import type { CaseWithCompany } from "@/lib/types";
import { CaseStatusBadge } from "@/components/StatusBadge";

/**
 * 案件一覧。タイトルだけを並べて、タップで詳細ページへ移る。
 * 担当・金額・期限・小タスクは詳細ページ側で見る。
 */
export function CaseList({
  cases,
  empty,
}: {
  cases: CaseWithCompany[];
  empty: string;
}) {
  if (cases.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
        {empty}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {cases.map((c) => {
        const total = c.case_tasks.length;
        const done = c.case_tasks.filter((t) => t.is_completed).length;
        return (
          <li key={c.id}>
            <Link
              href={`/cases/${c.id}`}
              className="flex items-center gap-3 px-4 py-4 transition hover:bg-gray-50"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-900">
                  {c.title}
                </span>
                {total > 0 && (
                  <span className="mt-0.5 block text-xs text-gray-400">
                    小タスク {done}/{total}
                  </span>
                )}
              </span>
              <CaseStatusBadge status={c.status} />
              <span aria-hidden="true" className="shrink-0 text-gray-300">
                ›
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
