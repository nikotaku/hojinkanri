import Link from "next/link";
import type { Company } from "@/lib/types";
import { MOBILE_FLOW, evaluateMobileFlow } from "@/lib/mobileFlow";

/**
 * 法人モバイル回線の「次のアクション」まとめ。
 * フローのどこまで進んでいるかを法人ごとに判定して、やることでまとめて並べる。
 */
export function MobileFlowSummary({ companies }: { companies: Company[] }) {
  const results = companies.map((c) => ({
    company: c,
    result: evaluateMobileFlow(c),
  }));

  // 同じアクションの法人をまとめる（並びは元の法人順を保つ）
  const buckets = new Map<
    string,
    { message: string; state: string; companies: Company[] }
  >();
  for (const { company, result } of results) {
    if (!result.next || !result.message) continue;
    const key = result.message;
    const bucket = buckets.get(key) ?? {
      message: key,
      state: result.next.state,
      companies: [],
    };
    bucket.companies.push(company);
    buckets.set(key, bucket);
  }

  const doneCount = results.filter((r) => r.result.done).length;
  const blocked = [...buckets.values()].filter((b) => b.state === "blocked");
  const active = [...buckets.values()].filter((b) => b.state !== "blocked");

  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold text-gray-900">次のアクション</h2>
        <p className="text-xs text-gray-500">
          完了 {doneCount} / {companies.length} 社
        </p>
      </div>

      {/* フローの流れ */}
      <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        {MOBILE_FLOW.steps.map((s, i) => (
          <li key={s.service} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300">→</span>}
            <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              {s.label}
            </span>
          </li>
        ))}
      </ol>

      {active.length === 0 && blocked.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          やることが残っている法人はありません。
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {[...active, ...blocked].map((b) => (
            <div
              key={b.message}
              className={`rounded-lg border p-3 ${
                b.state === "blocked"
                  ? "border-red-100 bg-red-50/60"
                  : b.state === "review"
                    ? "border-amber-100 bg-amber-50/60"
                    : "border-gray-100 bg-gray-50/70"
              }`}
            >
              <p className="text-sm font-medium text-gray-900">
                {b.message}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  {b.companies.length} 社
                </span>
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {b.companies.map((c) => (
                  <Link
                    key={c.id}
                    href={`/companies/${c.id}`}
                    className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700 transition hover:border-brand-300 hover:text-brand-700"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
