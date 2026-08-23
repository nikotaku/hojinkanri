// アプリ全体で使うドメイン型の定義

/** 法人(顧客)のステータス */
export type CompanyStatus = "prospect" | "active" | "inactive";

/** 案件のステータス */
export type CaseStatus = "new" | "in_progress" | "on_hold" | "done" | "lost";

/** 案件の優先度 */
export type CasePriority = "low" | "medium" | "high";

/** 法人モバイル回線で契約した端末 */
export interface MobileContractDetail {
  id: string;
  company_id: string;
  service: "ドコモ" | "UQ";
  device_model: string | null;
  sale_price: number | null;
  sale_destination: string | null;
  contract_person: string | null;
  contracted_on: string | null;
  created_at: string;
  updated_at: string;
}

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
  /** 代表者名 */
  representative_name?: string | null;
  /** 設立年月日 */
  established_on?: string | null;
  /** 資本金（円） */
  capital?: number | null;
  status: CompanyStatus;
  notes: string | null;
  /** 会社HPのURL */
  hp?: string | null;
  /** 登記簿謄本(画像)のURL */
  touki_url?: string | null;
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
  /** タクシー関連サービスの管理画面URL (サービス名 -> URL) */
  taxi_admin_url?: Record<string, string> | null;
  /** タクシー関連サービスのログインID (サービス名 -> ID) */
  taxi_login_id?: Record<string, string> | null;
  /** タクシー関連サービスのログインPW (サービス名 -> PW) */
  taxi_login_pw?: Record<string, string> | null;
  /** 法人モバイル回線の状況 (サービス名 -> ステータス) */
  mobile?: Record<string, string> | null;
  /** 法人モバイル回線の登録電話番号 (サービス名 -> 電話番号) */
  mobile_phone?: Record<string, string> | null;
  /** 法人モバイル回線の登録メールアドレス (サービス名 -> メール) */
  mobile_email?: Record<string, string> | null;
  /** 法人モバイル回線の登録名 (サービス名 -> 登録名) */
  mobile_name?: Record<string, string> | null;
  /** 法人モバイル回線の管理画面URL (サービス名 -> URL) */
  mobile_admin_url?: Record<string, string> | null;
  /** 法人モバイル回線のログインID (サービス名 -> ID) */
  mobile_login_id?: Record<string, string> | null;
  /** 法人モバイル回線のログインPW (サービス名 -> PW) */
  mobile_login_pw?: Record<string, string> | null;
  /** 法人モバイル回線で契約した端末（モバイル回線ページで取得） */
  mobile_contract_details?: MobileContractDetail[];
  /** 掛け払いサービスの申請・利用状況 (サービス名 -> ステータス) */
  billing?: Record<string, string> | null;
  /** 掛け払いサービスの登録電話番号 (サービス名 -> 電話番号) */
  billing_phone?: Record<string, string> | null;
  /** 掛け払いサービスの登録メールアドレス (サービス名 -> メール) */
  billing_email?: Record<string, string> | null;
  /** 掛け払いサービスの登録名 (サービス名 -> 登録名) */
  billing_name?: Record<string, string> | null;
  /** 掛け払いサービスの管理画面URL (サービス名 -> URL) */
  billing_admin_url?: Record<string, string> | null;
  /** 掛け払いサービスのログインID (サービス名 -> ID) */
  billing_login_id?: Record<string, string> | null;
  /** 掛け払いサービスのログインPW (サービス名 -> PW) */
  billing_login_pw?: Record<string, string> | null;
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

/** 法人モバイル回線で表示するサービス列 */
export const MOBILE_SERVICES = ["ドコモ", "UQ"] as const;

/** 掛け払いで表示するサービス列 */
export const BILLING_SERVICES = ["NPかけ払い", "Paid"] as const;

/** 掛け払いの申請・利用ステータス */
export const BILLING_STATUS_OPTIONS = [
  "未着手",
  "書類準備中",
  "申請済み",
  "審査中",
  "追加書類待ち",
  "審査通過",
  "利用開始",
  "保留",
  "審査落ち",
] as const;

/** 法人モバイル回線ステータスの選択肢 */
export const MOBILE_STATUS_OPTIONS = [
  "未着手",
  "未設定",
  "申し込み中",
  "審査中",
  "1台契約",
  "2台契約",
  "3台契約",
  "4台契約",
  "5台契約",
  "使用中",
  "設定不可",
  "印鑑証明待ち",
  "審査落ち",
  "割賦審査不可",
  "代表社変更のため再度審査",
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

/** 連絡先 */
export interface Contact {
  id: string;
  name: string;
  affiliation: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

/** 名刺画像（会社に紐づく） */
export interface MeishiImage {
  id: string;
  company_id: string;
  label: string | null;
  image_url: string;
  created_at: string;
}

/** 会社名を結合した名刺画像(一覧表示用) */
export interface MeishiImageWithCompany extends MeishiImage {
  company_name: string;
}

// --- crow 案件管理 ---

/** crow: 抱き合わせ営業依頼先 */
export interface CrowPartner {
  id: string;
  company_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  conditions: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export const CROW_PARTNER_STATUSES = [
  "未打診",
  "打診中",
  "成約",
  "見送り",
] as const;

/** crow: サービスの契約状況 */
export interface CrowContract {
  id: string;
  customer_name: string;
  plan: string | null;
  status: string;
  monthly_fee: number | null;
  start_date: string | null;
  notes: string | null;
  created_at: string;
}

export const CROW_CONTRACT_STATUSES = [
  "商談中",
  "トライアル",
  "契約中",
  "休止",
  "解約",
] as const;

/** crow: 契約店舗 */
export interface CrowStore {
  id: string;
  store_name: string;
  company_name: string | null;
  address: string | null;
  phone: string | null;
  start_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export const CROW_STORE_STATUSES = [
  "営業中",
  "準備中",
  "休止",
  "解約",
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
  company_id: string | null;
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

/** 案件に紐づく小タスク */
export interface CaseTask {
  id: string;
  case_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** 法人名を結合した案件(一覧表示用) */
export interface CaseWithCompany extends Case {
  company_name: string;
  case_tasks: CaseTask[];
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
