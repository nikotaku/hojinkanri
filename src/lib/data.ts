import { getSupabase } from "./supabase";
import { getMockDb } from "./mock-store";
import {
  type Company,
  type Case,
  type CaseWithCompany,
  type CompanyStatus,
  type CaseStatus,
  type CasePriority,
  type BacklogEntry,
  OPEN_CASE_STATUSES,
} from "./types";

// データアクセス層。Supabase が設定されていれば Supabase を、
// 未設定ならインメモリのサンプルデータを使う。UI 側はこの関数群のみを呼ぶ。

export interface CompanyInput {
  name: string;
  name_kana?: string | null;
  industry?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: CompanyStatus;
  notes?: string | null;
}

export interface CaseInput {
  company_id: string;
  title: string;
  description?: string | null;
  status: CaseStatus;
  priority: CasePriority;
  assignee?: string | null;
  amount?: number | null;
  due_date?: string | null;
}

function nowIso(): string {
  return new Date().toISOString();
}

// --- 法人 ---

function compareCompanies(a: Company, b: Company): number {
  const ao = a.sort_order ?? null;
  const bo = b.sort_order ?? null;
  if (ao != null && bo != null && ao !== bo) return ao - bo;
  if (ao != null && bo == null) return -1;
  if (ao == null && bo != null) return 1;
  return b.created_at.localeCompare(a.created_at);
}

export async function listCompanies(): Promise<Company[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Company[];
  }
  return [...getMockDb().companies].sort(compareCompanies);
}

/** 会社の並び順を id の配列順に保存する（ドラッグ&ドロップ用） */
export async function reorderCompanies(ids: string[]): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await Promise.all(
      ids.map((id, index) =>
        supabase
          .from("companies")
          .update({ sort_order: index + 1 })
          .eq("id", id),
      ),
    );
    return;
  }
  const db = getMockDb();
  ids.forEach((id, index) => {
    const c = db.companies.find((x) => x.id === id);
    if (c) c.sort_order = index + 1;
  });
}

export async function getCompany(id: string): Promise<Company | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Company) ?? null;
  }
  return getMockDb().companies.find((c) => c.id === id) ?? null;
}

export async function createCompany(input: CompanyInput): Promise<Company> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Company;
  }
  const db = getMockDb();
  const ts = nowIso();
  const company: Company = {
    id: crypto.randomUUID(),
    name: input.name,
    name_kana: input.name_kana ?? null,
    industry: input.industry ?? null,
    contact_person: input.contact_person ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    address: input.address ?? null,
    status: input.status,
    notes: input.notes ?? null,
    created_at: ts,
    updated_at: ts,
  };
  db.companies.push(company);
  return company;
}

/**
 * 会社の taxi / accounts (jsonb) の 1 サービスのステータスを更新する。
 * value が空文字なら該当キーを削除する。
 */
export type ServiceField = "taxi" | "accounts" | "taxi_phone" | "taxi_email";

export async function setCompanyService(
  id: string,
  field: ServiceField,
  service: string,
  value: string,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .select(field)
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    const map: Record<string, string> = {
      ...(((data as Record<string, unknown>)?.[field] as Record<
        string,
        string
      >) ?? {}),
    };
    if (value) map[service] = value;
    else delete map[service];
    const { error: upErr } = await supabase
      .from("companies")
      .update({ [field]: map })
      .eq("id", id);
    if (upErr) throw new Error(upErr.message);
    return;
  }
  const company = getMockDb().companies.find((c) => c.id === id);
  if (!company) return;
  const map: Record<string, string> = { ...(company[field] ?? {}) };
  if (value) map[service] = value;
  else delete map[service];
  company[field] = map;
}

// --- 案件 ---

export async function listCases(): Promise<CaseWithCompany[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("cases")
      .select("*, companies(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as (Case & { companies: { name: string } | null })[]).map(
      ({ companies, ...rest }) => ({
        ...rest,
        company_name: companies?.name ?? "(不明)",
      }),
    );
  }
  const db = getMockDb();
  const byId = new Map(db.companies.map((c) => [c.id, c.name]));
  return [...db.cases]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((c) => ({ ...c, company_name: byId.get(c.company_id) ?? "(不明)" }));
}

export async function getCasesByCompany(companyId: string): Promise<Case[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Case[];
  }
  return getMockDb()
    .cases.filter((c) => c.company_id === companyId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createCase(input: CaseInput): Promise<Case> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("cases")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Case;
  }
  const db = getMockDb();
  const ts = nowIso();
  const newCase: Case = {
    id: crypto.randomUUID(),
    company_id: input.company_id,
    title: input.title,
    description: input.description ?? null,
    status: input.status,
    priority: input.priority,
    assignee: input.assignee ?? null,
    amount: input.amount ?? null,
    due_date: input.due_date ?? null,
    created_at: ts,
    updated_at: ts,
  };
  db.cases.push(newCase);
  return newCase;
}

// --- 行動のバックログ ---

export interface BacklogInput {
  entry_date: string;
  tag?: string | null;
  content: string;
}

export async function listBacklog(): Promise<BacklogEntry[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("backlog")
      .select("*")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as BacklogEntry[];
  }
  return [...getMockDb().backlog].sort((a, b) => {
    const d = b.entry_date.localeCompare(a.entry_date);
    return d !== 0 ? d : b.created_at.localeCompare(a.created_at);
  });
}

export async function createBacklogEntry(
  input: BacklogInput,
): Promise<BacklogEntry> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("backlog")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as BacklogEntry;
  }
  const db = getMockDb();
  const entry: BacklogEntry = {
    id: crypto.randomUUID(),
    entry_date: input.entry_date,
    tag: input.tag ?? null,
    content: input.content,
    created_at: nowIso(),
  };
  db.backlog.push(entry);
  return entry;
}

export async function deleteBacklogEntry(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("backlog").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = getMockDb();
  db.backlog = db.backlog.filter((e) => e.id !== id);
}

// --- ダッシュボード集計 ---

export interface DashboardStats {
  companyCount: number;
  activeCompanyCount: number;
  openCaseCount: number;
  openAmountTotal: number;
  casesByStatus: Record<CaseStatus, number>;
  upcomingCases: CaseWithCompany[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [companies, cases] = await Promise.all([listCompanies(), listCases()]);

  const casesByStatus = {
    new: 0,
    in_progress: 0,
    on_hold: 0,
    done: 0,
    lost: 0,
  } as Record<CaseStatus, number>;
  for (const c of cases) casesByStatus[c.status] += 1;

  const openCases = cases.filter((c) => OPEN_CASE_STATUSES.includes(c.status));
  const openAmountTotal = openCases.reduce((sum, c) => sum + (c.amount ?? 0), 0);

  const upcomingCases = openCases
    .filter((c) => c.due_date)
    .sort((a, b) => (a.due_date as string).localeCompare(b.due_date as string))
    .slice(0, 5);

  return {
    companyCount: companies.length,
    activeCompanyCount: companies.filter((c) => c.status === "active").length,
    openCaseCount: openCases.length,
    openAmountTotal,
    casesByStatus,
    upcomingCases,
  };
}
