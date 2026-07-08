import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 本番(hojinkanri)プロジェクトの接続情報。
// anon キーはブラウザに配信される「公開用」クライアントキーで、アクセス制御は
// RLS で行うため、ソースに含めても問題ありません。Vercel の環境変数
// (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) が設定されていれば
// そちらが優先されます。
const FALLBACK_URL = "https://xdrddsymzurvdywftpds.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcmRkc3ltenVydmR5d2Z0cGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4OTA0OTIsImV4cCI6MjA5ODQ2NjQ5Mn0.v37kFD5zkPIKmerdEHtl1XbTDTyJwtix5xCAIuACgZQ";

// 本番ビルド時のみフォールバックを使う。ローカルの開発サーバー(npm run dev)は
// 環境変数を設定しない限り従来どおりサンプルデータ(モック)で動作する。
const isProd = process.env.NODE_ENV === "production";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? (isProd ? FALLBACK_URL : undefined);
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  (isProd ? FALLBACK_ANON_KEY : undefined);

/** Supabase の接続情報が設定されているか */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/**
 * Supabase クライアントを返す。接続情報が無い場合は null を返し、
 * 呼び出し側はサンプルデータ(モック)へフォールバックする。
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    });
  }
  return client;
}
