"use client";

import { useTransition } from "react";

/**
 * 削除ボタン。サーバーアクションを直接呼び、処理中表示と
 * 失敗時のエラー表示を行う（静かに失敗しない）。
 */
export function DeleteButton({
  id,
  action,
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const fd = new FormData();
        fd.set("id", id);
        startTransition(async () => {
          try {
            await action(fd);
          } catch (e) {
            alert(
              `削除に失敗しました: ${e instanceof Error ? e.message : String(e)}`,
            );
          }
        });
      }}
      className="rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
      aria-label="削除"
    >
      {pending ? "削除中…" : "削除"}
    </button>
  );
}
