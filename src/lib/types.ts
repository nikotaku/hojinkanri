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
  /** 並び順（ドラッグ&ドロップで変更） */
  sort_order?: number | null;
  /** タクシー関連サービスの状況 (サービス名 -> ステータス) */
  taxi?: Record<string, string> | null;
  /** タクシー関連サービスの登録電話番号 (サービス名 -> 電話番号) */
  taxi_phone?: Record<string, string> | null;
  /** タクシー関連サービスの登録メールアドレス (サービス名 -> メール) */
  taxi_email?: Record<string, string> | null;
  /** タクシー関連サービスのアプリ登録名 (サービス名 -> 登録名) */
  taxi_name?: Record<string, string> | null;
  /** 口座関連サービスの状況 (サービス名 -> ステータス) */
  accounts?: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

/** タクシー関連で表示するサービス列 */
export const TAXI_SERVICES = ["DiDi", "S.RIDE", "GO ビジネス"] as const;

/** 口座関連で表示するサービス列 */
export const ACCOUNT_SERVICES = [
  "みずほ銀行",
  "三井住友銀行",
  "PayPay銀行",
  "GMO",
] as const;

/** タクシー関連ステータスの選択肢 */
export const TAXI_STATUS_OPTIONS = [
  "未着手",
  "審査依頼中",
  "登録完了",
  "使用中",
  "限度額まで使用",
  "審査落ち",
] as const;

/** 口座関連ステータスの選択肢 */
export const ACCOUNT_STATUS_OPTIONS = [
  "未着手",
  "進行中",
  "事業実態確認書類準備中",
  "審査中",
  "開設済み",
  "使用中",
  "審査落ち",
] as const;

/** 行動のバックログ(活動ログ) */
export interface BacklogEntry {
  id: string;
  entry_date: string;
  tag: string | null;
  content: string;
  created_at: string;
}

/** バックログのタグ選択肢 */
export const BACKLOG_TAGS = [
  "法人設立",
  "口座",
  "タクシー",
  "契約",
  "書類",
  "審査",
  "連絡",
  "その他",
] as const;

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
