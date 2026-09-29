"use client";

/**
 * ページ表示中のエラーをまとめて受け止める画面。
 * データベース(Supabase)に接続できない場合は原因が分かる案内を出し、
 * 真っ白なエラーページにならないようにする。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Supabase 側の接続断(一時停止・ネットワーク不達)らしさを判定する
  const message = error.message ?? "";
  const isDbError =
    /fetch failed|ECONNREFUSED|ENOTFOUND|network|supabase|timeout/i.test(
      message,
    );

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-4xl">{isDbError ? "🔌" : "⚠️"}</p>
        <h1 className="mt-4 text-lg font-semibold text-gray-900">
          {isDbError
            ? "データベースに接続できません"
            : "エラーが発生しました"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {isDbError ? (
            <>
              Supabase が一時停止している可能性があります。
              数分おいてから再読み込みしてください。
              <br />
              （無料プランは一定期間アクセスが無いと自動で停止します）
            </>
          ) : (
            "しばらくしてから再度お試しください。"
          )}
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
        >
          再読み込み
        </button>

        {error.digest && (
          <p className="mt-4 text-xs text-gray-400">
            エラーID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
