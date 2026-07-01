import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Supabase 未設定時にサンプルデータで動作している旨を知らせるバナー。
 */
export function DemoBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs text-amber-800">
      サンプルデータ（モック）で動作しています。Supabase を接続すると本番データを利用できます（README 参照）。
    </div>
  );
}
