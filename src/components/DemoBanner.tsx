import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Supabase 未設定時にサンプルデータで動作している旨を知らせるバナー。
 */
export function DemoBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs leading-relaxed text-amber-800 sm:px-6 sm:text-center">
      サンプルデータ（モック）で動作しています。Supabase を接続すると本番データを利用できます（README 参照）。
    </div>
  );
}
