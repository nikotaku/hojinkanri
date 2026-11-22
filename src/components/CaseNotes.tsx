import { updateCaseNotesAction } from "@/app/actions";
import type { CaseTask } from "@/lib/types";

/**
 * 案件詳細の「次にやるべきこと」と「準備物」。
 * 次にやるべきことは未入力でも、未完了の小タスクの先頭を出す。
 */
export function CaseNotes({
  caseId,
  nextAction,
  materials,
  tasks,
}: {
  caseId: string;
  nextAction?: string | null;
  materials?: string | null;
  tasks: CaseTask[];
}) {
  const nextTask = tasks.find((task) => !task.is_completed);
  const items = (materials ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 次にやるべきこと */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-gray-900">
          次にやるべきこと
        </h2>

        {nextAction ? (
          <p className="mt-3 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm font-medium leading-relaxed text-brand-900">
            {nextAction}
          </p>
        ) : nextTask ? (
          <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50 p-3">
            <p className="text-sm font-medium leading-relaxed text-brand-900">
              {nextTask.title}
            </p>
            <p className="mt-1 text-xs text-brand-700">
              未完了の小タスクの先頭です
            </p>
          </div>
        ) : tasks.length > 0 ? (
          <p className="mt-3 rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-800">
            小タスクはすべて完了しています
          </p>
        ) : (
          <p className="mt-3 text-sm text-gray-400">
            まだ決まっていません。下に書くか、小タスクを追加してください。
          </p>
        )}

        <form action={updateCaseNotesAction} className="mt-3">
          <input type="hidden" name="case_id" value={caseId} />
          <label className="block">
            <span className="text-xs text-gray-500">
              小タスクとは別に指定する場合に入力（空にすると小タスクに戻ります）
            </span>
            <textarea
              name="next_action"
              rows={2}
              defaultValue={nextAction ?? ""}
              placeholder="例: 就業規則の改定版を社労士に送る"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            保存
          </button>
        </form>
      </section>

      {/* 準備物 */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-gray-900">準備物</h2>

        {items.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">
            まだ登録されていません。
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {items.map((item, i) => (
              <li
                key={`${i}-${item}`}
                className="flex items-start gap-2 text-sm text-gray-800"
              >
                <span aria-hidden="true" className="mt-1.5 text-gray-300">
                  ●
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )}

        <form action={updateCaseNotesAction} className="mt-3">
          <input type="hidden" name="case_id" value={caseId} />
          <label className="block">
            <span className="text-xs text-gray-500">1行につき1つ</span>
            <textarea
              name="materials"
              rows={4}
              defaultValue={materials ?? ""}
              placeholder={"登記簿謄本\n就業規則\n雇用契約書"}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            保存
          </button>
        </form>
      </section>
    </div>
  );
}
