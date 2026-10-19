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

/** 掛け払いサービスを利用している支払先・用途 */
export interface BillingUsageDetail {
  id: string;
  company_id: string;
  service: "NPかけ払い" | "Paid" | "GMOかけ払い";
  usage_name: string;
  admin_url: string | null;
  login_id: string | null;
  login_pw: string | null;
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
  /** 郵便番号（123-4567） */
  postal_code?: string | null;
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
  /** 適格請求書発行事業者の登録番号（インボイス番号 / T+13桁） */
  invoice_number?: string | null;
  /** 会社法人等番号（登記簿に記載される12桁） */
  company_number?: string | null;
  /** 法人番号（国税庁の13桁） */
  corporate_number?: string | null;
  /** 登記簿謄本(画像)のURL */
  touki_url?: string | null;
  /** 架電確認の記録 */
  call_check?: string | null;
  /** e-tax利用者識別番号 */
  etax_id?: string | null;
  /** 審査落ちなどの原因メモ */
  reason?: string | null;
  /** 進行ステータス（未着手/書類準備中/審査開始/完了/中止） */
  progress_status?: string | null;
  /** 法人設立届の提出状況 */
  incorporation_filing_status?: string | null;
  /** 着金目標日 */
  payment_target_on?: string | null;
  /** その他サービスの状況 (サービス名 -> ステータス) */
  other_services?: Record<string, string> | null;
  other_services_phone?: Record<string, string> | null;
  other_services_email?: Record<string, string> | null;
  other_services_name?: Record<string, string> | null;
  other_services_admin_url?: Record<string, string> | null;
  other_services_login_id?: Record<string, string> | null;
  other_services_login_pw?: Record<string, string> | null;
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
  /** 掛け払いサービスを利用できない理由 (サービス名 -> 理由) */
  billing_unavailable_reason?: Record<string, string> | null;
  /** 掛け払いサービスの利用先・用途（掛け払いページで取得） */
  billing_usage_details?: BillingUsageDetail[];
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
export const MOBILE_SERVICES = [
  "ドコモ",
  "UQ",
  "ワイモバイル",
  "エクスモバイル",
] as const;

/**
 * GMO後払いでの支払いに対応していることを、各販売サイトの案内および
 * 後払い決済のまとめサイトで確認できた候補。
 * GMOペイメントサービスは加盟店の網羅リストを公開していないため、
 * これで全てではない。候補外は「その他」から手入力する。
 * 確認日: 2026-10-07
 */
export const GMO_ATOBARAI_SITE_GROUPS = [
  {
    label: "ファッション・アパレル",
    options: [
      "ORIHICA（オリヒカ）",
      "KASHIYAMA",
      "PAL CLOSET（パルクローゼット）",
      "FREAK'S STORE",
      "きもの365",
      "MILESTO（ミレスト）",
      "フェリージ オンラインショップ",
      "レスブリス",
      "ファイテン",
      "Pinkoi（ピンコイ）",
      "BLOOM（ブルーム）",
    ],
  },
  {
    label: "コスメ・化粧品",
    options: [
      "ポーラ公式オンラインストア",
      "ドクターシーラボ",
      "セフィーヌ",
      "ナチュラルグラッセ",
      "LCラブコスメ",
      "HOLO BELL",
      "ETVOS（エトヴォス）",
      "MISSHA（ミシャ）",
      "ヴェレダ（WELEDA）",
    ],
  },
  {
    label: "食品・グルメ・ギフト",
    options: [
      "JAタウン",
      "アンリ・シャルパンティエ",
      "C3（シーキューブ）",
      "casaneo（カサネオ）",
      "Cake.jp",
      "婦人画報のお取り寄せ",
    ],
  },
  {
    label: "家具・インテリア・生活雑貨",
    options: ["BRUNO online", "アクタスオンライン", "SEMPRE.JP"],
  },
  {
    label: "ベビー・キッズ",
    options: ["Hariti（ハーリティー）", "babybuba（ベビーブーバ）"],
  },
  {
    label: "ホビー・楽器",
    options: ["イケベ楽器店オンラインストア", "colleize（コレイズ）"],
  },
  {
    label: "印刷・レンタル・その他",
    options: [
      "しまうまプリント",
      "フジプリ",
      "レンティオ（家電レンタル）",
      "バッテリーストア.COM",
    ],
  },
] as const;

export const GMO_ATOBARAI_SITE_OPTIONS = GMO_ATOBARAI_SITE_GROUPS.flatMap(
  (g) => g.options,
);

/** その他サービスで表示するサービス列 */
export const OTHER_SERVICES = [
  "Amazonビジネス",
  "タイミー",
  "シェアフル",
  "bybit",
  "OKコイン",
  "ポーシャペイ",
] as const;

/** その他サービスのステータス選択肢 */
export const OTHER_SERVICE_STATUS_OPTIONS = [
  "未着手",
  "未設定",
  "申請済み",
  "審査中",
  "印鑑証明待ち",
  "開設ずみ",
  "進行中",
  "使用中",
  "限度額まで使用",
  "要問い合わせ",
  "設定不可",
  "審査落ち",
] as const;

/** 法人の進行ステータス（Notionから移植） */
export const PROGRESS_STATUS_OPTIONS = [
  "未着手",
  "書類準備中",
  "審査開始",
  "完了",
  "中止",
] as const;

/** 法人設立届の提出状況 */
export const INCORPORATION_FILING_OPTIONS = [
  "未着手",
  "進行中",
  "完了",
] as const;

/** 掛け払いで表示するサービス列 */
export const BILLING_SERVICES = ["NPかけ払い", "Paid", "GMOかけ払い"] as const;

/**
 * NP掛け払いでの支払いに対応していることを各販売サイトの公式情報で確認した候補。
 * 公開された全加盟店一覧はないため、候補外は「その他」から登録する。
 * 確認日: 2026-09-03
 */
export const NP_KAKEBARAI_SITE_GROUPS = [
  {
    label: "美容・サロン",
    options: ["ビューティガレージ", "サロンプリント"],
  },
  {
    label: "店舗用品・工具・設備",
    options: [
      "シモジマオンラインショップ",
      "DCMオンライン",
      "ミドリ安全.com",
      "現場市場",
      "電材ネット",
      "八幡ねじ YHTネットショップ",
      "as kitchen（アズキッチン）",
      "アネスト岩田公式ECショップ",
    ],
  },
  {
    label: "卸・仕入れ",
    options: ["NETSEA", "卸売ドットコム"],
  },
  {
    label: "オフィス家具・インテリア",
    options: [
      "オフィスコム",
      "オフィス家具ドットコム",
      "office work.jp",
      "KANADEMONO",
      "カグクロ",
      "LOOKIT!（楽天市場店）",
    ],
  },
  {
    label: "パソコン・映像・電子機器",
    options: [
      "SYSTEM5",
      "Rock oN Line eStore",
      "中古パソコン直販",
      "共立エレショップ",
    ],
  },
  {
    label: "印刷・販促物",
    options: [
      "東京カラー印刷通販",
      "みんなのプレス屋さん",
      "デジタ",
      "大判プリントの達人",
    ],
  },
  {
    label: "食品・贈答品",
    options: [
      "ナカヤマフーズオンライン",
      "まい泉 法人向け弁当",
      "DEMEL公式オンラインショップ",
    ],
  },
] as const;

export const NP_KAKEBARAI_SITE_OPTIONS =
  NP_KAKEBARAI_SITE_GROUPS.flatMap((group) => group.options);

/**
 * Paidでの支払いに対応していることを公式情報で確認できたサービス。
 * Paidの全加盟先は公開されていないため、候補外は「その他」から登録する。
 * 確認日: 2026-09-03
 */
export const PAID_SERVICE_OPTIONS = [
  "スーパーデリバリー",
  "ニトリネット（法人会員）",
  "タンスのゲン本店（法人）",
  "コールマン公式オンラインショップ",
  "電材堂",
  "ジャングルストア",
  "ヨックモック公式オンラインショップ",
  "ビバムサシオンライン",
  "印刷通販グラフィック",
  "スチール棚.com",
  "パーツコム",
  "NEXCO西日本オンラインショップ",
  "オートバックスドットコム（法人会員）",
  "トラノテ",
  "Chatwork",
  "ココナラ（法人機能）",
  "写真AC（法人プラン）",
  "ニュースPR by LINEヤフー",
  "ハート電報",
  "お花の窓口",
  "ナースリー（特別割引法人）",
] as const;

/** 掛け払いの申請・利用ステータス */
export const BILLING_STATUS_OPTIONS = [
  "未着手",
  "書類準備中",
  "申請済み",
  "審査中",
  "追加書類待ち",
  "審査通過",
  "利用開始",
  "限度額まで使用",
  "保留",
  "審査落ち",
  "利用不可",
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
  "限度額まで使用",
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
  "限度額まで使用",
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

/** GMO後払いを利用するサイトごとの申込・審査状況 */
export interface GmoAtobaraiSite {
  id: string;
  site_name: string;
  company_id: string | null;
  status: string;
  applied_on: string | null;
  amount: number | null;
  /** 審査結果について分かっていること（落ちた理由の推測など） */
  result_note: string | null;
  notes: string | null;
  created_at: string;
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
/** 小タスク付きの案件（進捗表示用） */
export interface CaseWithTasks extends Case {
  case_tasks: CaseTask[];
}

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

/* ------------------------------------------------------------------ *
 * 請求書払いで Mac mini を買える仕入先
 * ------------------------------------------------------------------ */

/** 請求書払いの可否 */
export type SupplierVerdict = "ok" | "maybe" | "no";

export interface MacSupplier {
  name: string;
  url: string;
  /** 業態 */
  kind: string;
  verdict: SupplierVerdict;
  /** Mac mini 本体の取扱状況 */
  macMini: string;
  /** 請求書払いの方式 */
  payment: string;
  /** 締め日・支払サイト */
  terms: string;
  /** 申込方法・審査 */
  apply: string;
  /** 補足 */
  note?: string;
  /** 根拠にしたページ */
  source: string;
}

/** 調査日 */
export const MAC_SUPPLIERS_SURVEYED_ON = "2026-10-19";

export const MAC_SUPPLIERS: MacSupplier[] = [
  {
    name: "法人専用ビックカメラ.com",
    url: "https://houjin.biccamera.com/",
    kind: "家電量販店（Apple認定 Authorized Reseller）",
    verdict: "ok",
    macMini: "Mac mini のカテゴリあり。Apple製品取扱店として明記。",
    payment:
      "「売掛会員」になると売掛（請求書払い）。請求書は web（楽々明細）で発行。",
    terms: "原則、納品日締めの月末締め翌末払い。",
    apply:
      "問い合わせ窓口から「新規売掛会員申込みご希望」と連絡 → 営業担当が対応。",
    note:
      "もう一方の「マルチペイメント会員」はカード・コンビニ・ネットバンクの事前支払いなので、申込時に売掛会員を選ぶこと。",
    source:
      "https://houjin.biccamera.com/topics/index.aspx?id=guide&sid=00&tid=SHOPPING",
  },
  {
    name: "秋葉館",
    url: "https://akibakan.com/",
    kind: "Mac専門店",
    verdict: "ok",
    macMini: "Mac専門店。Mac mini を通常在庫で取扱。",
    payment:
      "ラクーンフィナンシャルの「Paid（ペイド）」による請求書払い。カート上部のバナーから申込。",
    terms: "Paid の規定（月末締め翌月末払いが標準）。",
    apply:
      "事前審査あり。審査は3営業日程度。秋葉館の会員登録が必須。",
    note:
      "「法人様向けお見積り」ページ経由は銀行振込（前払い）のみ。請求書払いにしたいときは見積ルートではなく通常のカートから Paid を選ぶ。公費・校費の後払いは問い合わせフォームへ。",
    source: "https://akibakan.com/pages/guide-payment",
  },
  {
    name: "Too（Netshop.Too）",
    url: "https://www.too.com/apple/",
    kind: "Apple Premium Business Partner",
    verdict: "ok",
    macMini: "「Macは現行のモデルは全種類お取り扱い」。Mac mini を含む。",
    payment:
      "請求書払い（購入）。請求書発行に基づく買掛金決済で、月単位でまとめて支払い。",
    terms: "月単位でまとめて請求。締め日・支払期限はサイト上に記載なし（要確認）。",
    apply:
      "オンライン（Netshop.Too）で締め支払いを使うには買掛取引口座の登録が必要。",
    note:
      "「初めての取引の場合は、事前入金をお願いする場合がございます」との注記あり。リース（分割）も扱う。",
    source: "https://www.too.com/apple/products/payment/",
  },
  {
    name: "Amazonビジネス",
    url: "https://business.amazon.co.jp/",
    kind: "法人向け通販",
    verdict: "ok",
    macMini: "Amazon上に Mac mini の出品多数。",
    payment: "請求書払い。手数料無料で1ヶ月分をまとめて後払い。",
    terms: "締め日は 5日・10日・15日・20日・25日・末日 から選択。",
    apply: "法人登録のうえ、請求書払いの利用には Amazon による審査あり。",
    note:
      "出品者や商品によって請求書払いを選べないことがある。Mac mini を請求書払いで買えるかは購入画面で都度確認が必要。適格請求書は注文履歴からまとめてダウンロード可。",
    source: "https://business.amazon.co.jp/ja/solutions/payment-options",
  },
  {
    name: "NetRICOH（リコージャパン）",
    url: "https://www.netricoh.com/",
    kind: "法人向け通販（Apple製品取扱）",
    verdict: "ok",
    macMini:
      "リコージャパンのApple製品ページに「MacBook Pro / MacBook Air / MacBook Neo / iMac / Mac mini / Mac Studio」と明記。",
    payment:
      "法人モードでの掛売。「リコー販売窓口でのご購入もあわせて、1月分の掛売上としてまとめて請求書を発行」。",
    terms: "月単位でまとめて請求。締め日・支払期限の記載なし（要確認）。",
    apply: "法人専用サイトのため、無料の「ご利用登録」が必要。",
    note:
      "掛売はリコー販売窓口との取引が前提に読める。NetRICOH 上で Mac mini を単品購入できるかは未確認。",
    source: "https://www.netricoh.com/netricoh/guide/sub/faq/shop.html",
  },
  {
    name: "パソコン工房（ユニットコム）",
    url: "https://www.pc-koubou.jp/",
    kind: "PC専門店",
    verdict: "maybe",
    macMini: "中古Macのカテゴリあり。新品 Mac mini の取扱は確認できず。",
    payment:
      "「企業のお客様を対象に売掛での販売を行っております」。B2Bメンバーカード（ブラック）で売掛。",
    terms: "末締め・翌27日支払いの後払い。",
    apply:
      "事前審査あり（審査・カード発行はオリコ）。商業登記簿謄本または印鑑登録証明書が必要。500万円以上の与信希望は郵送申込。",
    note:
      "売掛の対象に Apple 製品が含まれるかは要確認。法人相談窓口 0570-550-922。",
    source: "https://www.pc-koubou.jp/unitcom_business/business_pay.php",
  },
  {
    name: "法人専用ソフマップ",
    url: "https://houjin.sofmap.com/",
    kind: "家電量販店（Apple認定 Authorized Reseller）",
    verdict: "maybe",
    macMini: "Apple特設ページに Mac mini のカテゴリあり。",
    payment:
      "法人専用ビックカメラ.com と同じ基盤だが、売掛会員の記載はログイン前では確認できず。",
    terms: "未確認。",
    apply: "法人窓口に問い合わせ（houjin@sofmap.com / 本社 03-6260-7281）。",
    note:
      "ビックカメラグループなので売掛会員の仕組みがある可能性が高いが、サイト上で裏が取れていない。",
    source: "https://houjin.sofmap.com/topics/?id=apple_sof&sid=0",
  },
  {
    name: "じゃんぱら",
    url: "https://www.janpara.co.jp/",
    kind: "中古PC店",
    verdict: "maybe",
    macMini: "中古 Mac mini を取扱。",
    payment:
      "通販の支払いはカード・ペイディ・銀行振込・ペイジー・代引・コンビニのみで、請求書払いの記載なし。",
    terms: "—",
    apply: "別途「法人様窓口」があるので、そちら経由で掛売が可能かは要確認。",
    source: "https://www.janpara.co.jp/corporate/",
  },
  {
    name: "アスクル / たのめーる / カウネット",
    url: "https://www.askul.co.jp/",
    kind: "オフィス通販",
    verdict: "no",
    macMini:
      "カウネットで「Mac mini」を検索しても周辺機器のみ。アスクル・たのめーるも本体の取扱を確認できず。",
    payment:
      "いずれも月1回の締め支払い（請求書あり）には対応している。",
    terms: "アスクルは10日締めまたは月末締め。たのめーるは毎月決まった日。",
    apply: "—",
    note:
      "支払い方法は問題ないが、Mac mini 本体を売っていないため今回の用途には使えない。",
    source: "https://www.askul.co.jp/guide/knowledge/payment.html",
  },
  {
    name: "ヨドバシカメラ 法人営業部",
    url: "https://www.yodobashi.com/ec/support/service/hojin/index.html",
    kind: "家電量販店",
    verdict: "no",
    macMini: "店頭・通販とも Apple 製品を取扱。",
    payment:
      "「銀行振り込みで承ります」。クレジットカード・ゴールドポイントは利用不可。",
    terms: "入金確認後に配送手配＝前払い。請求書払いではない。",
    apply: "—",
    note: "見積書・請求書・納品書の発行自体はしてくれるが、支払いは前払い。",
    source: "https://www.yodobashi.com/ec/support/service/hojin/index.html",
  },
  {
    name: "イートレンド",
    url: "https://www.e-trend.co.jp/",
    kind: "PC通販",
    verdict: "no",
    macMini: "記載なし。",
    payment:
      "「再販目的でのご購入や掛け売りには応じられませんのでご了承下さい」と明記。",
    terms: "—",
    apply: "—",
    source: "https://www.e-trend.co.jp/corporation/",
  },
  {
    name: "MonotaRO",
    url: "https://www.monotaro.com/",
    kind: "法人向け通販",
    verdict: "no",
    macMini:
      "「Mac mini」で検索してもヒットするのは盗難防止ホルダーなどの周辺機器のみ。本体の取扱なし。",
    payment: "請求書払いには対応。",
    terms: "—",
    apply: "—",
    note: "支払い方法は使えるが、本体を売っていない。",
    source: "https://www.monotaro.com/s/q-Mac+mini/",
  },
];
