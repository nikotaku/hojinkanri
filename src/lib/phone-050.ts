import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

export type NumberStatus = "available" | "applying" | "active" | "suspended" | "cancelled";
export type ApplicationStatus = "draft" | "submitted" | "reviewing" | "approved" | "rejected" | "activated" | "cancelled";

export type Phone050 = {
  id: string; phone_number: string; provider: string | null;
  purchased_on: string | null; monthly_cost: number | null;
  contract_company_id: string | null; status: NumberStatus;
  notes: string | null; created_at: string; updated_at: string;
};
export type IvryApplication = {
  id: string; phone_id: string; company_id: string | null;
  application_date: string; status: ApplicationStatus;
  ivry_account: string | null; ivry_management_url: string | null;
  application_reference: string | null; activated_on: string | null;
  notes: string | null; created_at: string;
};

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Service-role keys are only used on the server; never use NEXT_PUBLIC_ for them.
  if (url && key) return createClient(url, key, { auth: { persistSession: false } });
  const client = getSupabase();
  if (!client) throw new Error("050番号管理にはSupabaseの接続設定が必要です。");
  return client;
}
export async function get050Data() {
  const client = db();
  const [phones, apps, companies] = await Promise.all([
    client.from("phone_050_numbers").select("*").order("created_at", { ascending: false }),
    client.from("phone_050_ivry_applications").select("*").order("created_at", { ascending: false }),
    client.from("companies").select("id,name").order("name"),
  ]);
  if (phones.error) throw new Error(phones.error.message);
  if (apps.error) throw new Error(apps.error.message);
  if (companies.error) throw new Error(companies.error.message);
  return {
    phones: (phones.data ?? []) as Phone050[],
    applications: (apps.data ?? []) as IvryApplication[],
    companies: (companies.data ?? []) as {id:string;name:string}[],
  };
}
export function phoneDb() { return db(); }
