import { getSupabase } from "./supabase";
import { getMockDb } from "./mock-store";
import {
  type Case,
  type CaseBacklog,
  type CasePriority,
  type CaseStatus,
  type CaseTask,
  type CaseTaskProgress,
  type CaseWithCompany,
  type Company,
  type CompanyStatus,
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

export interface CaseTaskInput {
  case_id: string;
  title: string;
  due_date?: string | null;
}

export interface CaseBacklogInput {
  case_id: string;
  title: string;
  content?: string | null;
}

function nowIso(): string {
  return new Date().toISOString();
}

// --- 法人 ---

export async function listCompanies(): Promise<Company[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Company[];
  }
  return [...getMockDb().companies].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
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
  return getMockDb().companies.find((company) => company.id === id) ?? null;
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
  const companyNames = new Map(db.companies.map((company) => [company.id, company.name]));
  return [...db.cases]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((caseItem) => ({
      ...caseItem,
      company_name: companyNames.get(caseItem.company_id) ?? "(不明)",
    }));
}

export async function getCase(id: string): Promise<Case | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Case) ?? null;
  }
  return getMockDb().cases.find((caseItem) => caseItem.id === id) ?? null;
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
    .cases.filter((caseItem) => caseItem.company_id === companyId)
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
  const caseItem: Case = {
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
  db.cases.push(caseItem);
  return caseItem;
}

// --- 小タスク ---

export async function getTaskProgressByCase(): Promise<Map<string, CaseTaskProgress>> {
  const supabase = getSupabase();
  let tasks: Pick<CaseTask, "case_id" | "is_completed">[];

  if (supabase) {
    const { data, error } = await supabase
      .from("case_tasks")
      .select("case_id, is_completed");
    if (error) throw new Error(error.message);
    tasks = data as Pick<CaseTask, "case_id" | "is_completed">[];
  } else {
    tasks = getMockDb().caseTasks;
  }

  const progress = new Map<string, CaseTaskProgress>();
  for (const task of tasks) {
    const current = progress.get(task.case_id) ?? {
      task_count: 0,
      completed_task_count: 0,
    };
    current.task_count += 1;
    if (task.is_completed) current.completed_task_count += 1;
    progress.set(task.case_id, current);
  }
  return progress;
}

export async function listCaseTasks(caseId: string): Promise<CaseTask[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("case_tasks")
      .select("*")
      .eq("case_id", caseId)
      .order("is_completed", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data as CaseTask[];
  }
  return getMockDb()
    .caseTasks.filter((task) => task.case_id === caseId)
    .sort((a, b) => {
      if (a.is_completed !== b.is_completed) return Number(a.is_completed) - Number(b.is_completed);
      return a.created_at.localeCompare(b.created_at);
    });
}

export async function createCaseTask(input: CaseTaskInput): Promise<CaseTask> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("case_tasks")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as CaseTask;
  }
  const db = getMockDb();
  const ts = nowIso();
  const task: CaseTask = {
    id: crypto.randomUUID(),
    case_id: input.case_id,
    title: input.title,
    is_completed: false,
    due_date: input.due_date ?? null,
    created_at: ts,
    updated_at: ts,
  };
  db.caseTasks.push(task);
  return task;
}

export async function setCaseTaskCompleted(
  taskId: string,
  isCompleted: boolean,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase
      .from("case_tasks")
      .update({ is_completed: isCompleted })
      .eq("id", taskId);
    if (error) throw new Error(error.message);
    return;
  }
  const task = getMockDb().caseTasks.find((item) => item.id === taskId);
  if (!task) throw new Error("小タスクが見つかりません。");
  task.is_completed = isCompleted;
  task.updated_at = nowIso();
}

// --- バックログ ---

export async function listCaseBacklogs(caseId: string): Promise<CaseBacklog[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("case_backlogs")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as CaseBacklog[];
  }
  return getMockDb()
    .caseBacklogs.filter((backlog) => backlog.case_id === caseId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createCaseBacklog(
  input: CaseBacklogInput,
): Promise<CaseBacklog> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("case_backlogs")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as CaseBacklog;
  }
  const backlog: CaseBacklog = {
    id: crypto.randomUUID(),
    case_id: input.case_id,
    title: input.title,
    content: input.content ?? null,
    created_at: nowIso(),
  };
  getMockDb().caseBacklogs.push(backlog);
  return backlog;
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
  for (const caseItem of cases) casesByStatus[caseItem.status] += 1;

  const openCases = cases.filter((caseItem) => OPEN_CASE_STATUSES.includes(caseItem.status));
  const openAmountTotal = openCases.reduce((sum, caseItem) => sum + (caseItem.amount ?? 0), 0);

  const upcomingCases = openCases
    .filter((caseItem) => caseItem.due_date)
    .sort((a, b) => (a.due_date as string).localeCompare(b.due_date as string))
    .slice(0, 5);

  return {
    companyCount: companies.length,
    activeCompanyCount: companies.filter((company) => company.status === "active").length,
    openCaseCount: openCases.length,
    openAmountTotal,
    casesByStatus,
    upcomingCases,
  };
}
