// アプリ全体で使うドメイン型の定義

/** 法人(顧客)のステータス */
export type CompanyStatus = "prospect" | "active" | "inactive";

/** 案件のステータス */
export type CaseStatus = "new" | "in_progress" | "on_hold" | "done" | "lost";

/** 案件の優先度 */
export type CasePriority = "low" | "medium" | "high";

/** 法人(顧客) */
export interface Company {
  id: string;
  name: string;
  name_kana: string | null;
  industry: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: CompanyStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** 案件 */
export interface Case {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  priority: CasePriority;
  assignee: string | null;
  amount: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

/** 法人名を結合した案件(一覧表示用) */
export interface CaseWithCompany extends Case {
  company_name: string;
}

// --- 表示用ラベル ---

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  prospect: "見込み",
  active: "取引中",
  inactive: "休止",
};

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  new: "新規",
  in_progress: "対応中",
  on_hold: "保留",
  done: "完了",
  lost: "失注",
};

export const CASE_PRIORITY_LABELS: Record<CasePriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

/** 進行中とみなす案件ステータス */
export const OPEN_CASE_STATUSES: CaseStatus[] = ["new", "in_progress", "on_hold"];
