import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase の接続情報が設定されているか */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/**
 * Supabase クライアントを返す。環境変数が未設定の場合は null を返し、
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
