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
  type Contact,
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
  company_id?: string | null;
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

/** 会社HPのURLを更新する */
export async function setCompanyHp(id: string, hp: string): Promise<void> {
  const supabase = getSupabase();
  const value = hp.trim() || null;
  if (supabase) {
    const { error } = await supabase
      .from("companies")
      .update({ hp: value })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const c = getMockDb().companies.find((x) => x.id === id);
  if (c) c.hp = value;
}

/** 登記簿謄本の画像を保存し、公開URLを会社に紐づける */
export async function saveToukiImage(
  companyId: string,
  file: File,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${companyId}/touki-${Date.now()}.${ext}`;
    const buf = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from("touki")
      .upload(path, buf, { upsert: true, contentType: file.type });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("touki").getPublicUrl(path);
    const { error: upErr } = await supabase
      .from("companies")
      .update({ touki_url: data.publicUrl })
      .eq("id", companyId);
    if (upErr) throw new Error(upErr.message);
    return;
  }
  // モック: データURLとして保持（プロセス内のみ）
  const buf = Buffer.from(await file.arrayBuffer());
  const url = `data:${file.type};base64,${buf.toString("base64")}`;
  const c = getMockDb().companies.find((x) => x.id === companyId);
  if (c) c.touki_url = url;
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
export type ServiceField =
  | "taxi"
  | "accounts"
  | "taxi_phone"
  | "taxi_email"
  | "taxi_name"
  | "taxi_admin_url"
  | "taxi_login_id"
  | "taxi_login_pw"
  | "mobile"
  | "mobile_phone"
  | "mobile_email"
  | "mobile_name"
  | "mobile_admin_url"
  | "mobile_login_id"
  | "mobile_login_pw";

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
        company_name: companies?.name ?? "—",
      }),
    );
  }
  const db = getMockDb();
  const byId = new Map(db.companies.map((c) => [c.id, c.name]));
  return [...db.cases]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((c) => ({
      ...c,
      company_name: (c.company_id && byId.get(c.company_id)) || "—",
    }));
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
    company_id: input.company_id ?? null,
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

// --- 連絡先 ---

export interface ContactInput {
  name: string;
  affiliation?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export async function listContacts(): Promise<Contact[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Contact[];
  }
  return [...getMockDb().contacts].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

export async function createContact(input: ContactInput): Promise<Contact> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("contacts")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Contact;
  }
  const db = getMockDb();
  const contact: Contact = {
    id: crypto.randomUUID(),
    name: input.name,
    affiliation: input.affiliation ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    notes: input.notes ?? null,
    created_at: nowIso(),
  };
  db.contacts.push(contact);
  return contact;
}

export async function deleteContact(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = getMockDb();
  db.contacts = db.contacts.filter((c) => c.id !== id);
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
