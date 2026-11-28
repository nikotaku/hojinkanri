"use client";

import { useRef, useState, useTransition } from "react";
import { setPhone050ServiceTagsAction } from "@/app/phone-050/actions";

/**
 * 050番号を「どのサービスに使ったか」をタグで記録する。
 * 候補をタップするとその場で貼り付き、×で剥がせる。
 */
export function Phone050ServiceTags({
  phoneId,
  tags,
  suggestions,
  allOptions,
}: {
  phoneId: string;
  tags: string[];
  /** よく使われているタグ（タップで即追加） */
  suggestions: string[];
  /** 入力補完に出す候補すべて */
  allOptions: string[];
}) {
  const [current, setCurrent] = useState<string[]>(tags);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `phone-050-tags-${phoneId}`;

  const save = (next: string[]) => {
    const previous = current;
    setCurrent(next);
    setError(null);
    startTransition(async () => {
      try {
        await setPhone050ServiceTagsAction(phoneId, next);
      } catch {
        setCurrent(previous);
        setError("保存できませんでした。もう一度お試しください。");
      }
    });
  };

  const add = (raw: string) => {
    const tag = raw.trim();
    setDraft("");
    if (!tag || current.includes(tag)) return;
    save([...current, tag]);
  };

  const remaining = suggestions.filter((s) => !current.includes(s));

  return (
    <section>
      <p className="mb-1.5 text-sm font-medium text-gray-700">使ったサービス</p>

      <div className="flex flex-wrap items-center gap-1.5">
        {current.length === 0 && (
          <span className="text-xs text-gray-400">まだ登録されていません</span>
        )}
        {current.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-1 text-xs font-medium text-brand-700"
          >
            {tag}
            <button
              type="button"
              disabled={pending}
              aria-label={`${tag} を外す`}
              onClick={() => save(current.filter((t) => t !== tag))}
              className="grid h-4 w-4 place-items-center rounded-full text-brand-500 transition hover:bg-brand-200 hover:text-brand-800 disabled:opacity-50"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {remaining.map((tag) => (
            <button
              key={tag}
              type="button"
              disabled={pending}
              onClick={() => add(tag)}
              className="rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
            >
              ＋ {tag}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={draft}
          list={listId}
          disabled={pending}
          placeholder="サービス名を入力して追加"
          aria-label="使ったサービスを追加"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            add(draft);
          }}
          className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-300 disabled:opacity-60"
        />
        <datalist id={listId}>
          {allOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <button
          type="button"
          disabled={pending || !draft.trim()}
          onClick={() => add(draft)}
          className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          追加
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
