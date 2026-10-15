/** 小タスクの消化状況を帯グラフで表す */
export function ProgressBar({
  completed,
  total,
  size = "md",
  showLabel = true,
}: {
  completed: number;
  total: number;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const done = total > 0 && completed === total;

  return (
    <div className="min-w-0">
      {showLabel && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-xs text-gray-500">
            {total === 0 ? "小タスク未登録" : `${completed} / ${total} 完了`}
          </span>
          <span
            className={`text-xs font-semibold tabular-nums ${
              done ? "text-green-700" : "text-gray-700"
            }`}
          >
            {percent}%
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`進捗 ${percent}パーセント`}
        className={`w-full overflow-hidden rounded-full bg-gray-200 ${
          size === "sm" ? "h-1.5" : "h-2.5"
        }`}
      >
        <div
          className={`h-full rounded-full transition-all ${
            done ? "bg-green-500" : percent > 0 ? "bg-brand-500" : "bg-gray-200"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
