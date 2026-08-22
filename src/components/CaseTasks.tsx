import {
  createCaseTaskAction,
  toggleCaseTaskAction,
} from "@/app/actions";
import type { CaseTask } from "@/lib/types";

export function CaseTasks({
  caseId,
  tasks,
}: {
  caseId: string;
  tasks: CaseTask[];
}) {
  const completed = tasks.filter((task) => task.is_completed).length;

  return (
    <details className="group mt-4 border-t border-gray-100 pt-3">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg py-1 text-sm font-medium text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden">
        <span>小タスク {completed}/{tasks.length}</span>
        <span
          aria-hidden="true"
          className="text-gray-400 transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>

      <div className="mt-2 space-y-2">
        {tasks.length === 0 ? (
          <p className="py-1 text-xs text-gray-400">
            小タスクはまだありません。
          </p>
        ) : (
          <ul className="space-y-1.5">
            {tasks.map((task) => (
              <li key={task.id}>
                <form action={toggleCaseTaskAction}>
                  <input type="hidden" name="case_id" value={caseId} />
                  <input type="hidden" name="task_id" value={task.id} />
                  <input
                    type="hidden"
                    name="is_completed"
                    value={String(!task.is_completed)}
                  />
                  <button
                    type="submit"
                    className="flex w-full items-start gap-2 rounded-lg px-1 py-1.5 text-left text-sm hover:bg-gray-50"
                    aria-label={`${task.title}を${task.is_completed ? "未完了" : "完了"}にする`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        task.is_completed
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-gray-300 bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={
                        task.is_completed
                          ? "text-gray-400 line-through"
                          : "text-gray-700"
                      }
                    >
                      {task.title}
                    </span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={createCaseTaskAction} className="flex gap-2 pt-1">
          <input type="hidden" name="case_id" value={caseId} />
          <input
            name="title"
            required
            placeholder="小タスクを追加"
            aria-label="追加する小タスク"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            追加
          </button>
        </form>
      </div>
    </details>
  );
}
