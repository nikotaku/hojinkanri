import type {
  Company,
  Case,
  BacklogEntry,
  Contact,
  MeishiImage,
  CrowPartner,
  CrowContract,
  CrowStore,
  MobileContractDetail,
} from "./types";

// Supabase 未設定時に使うインメモリのサンプルデータ。
// 開発サーバー起動中はプロセス内に保持され、追加した法人・案件も反映される
// (サーバー再起動でリセット)。

function iso(daysFromNow: number): string {
  // 固定の基準日からの相対日付。SSR/CSR で値がぶれないよう Date.now() は使わない。
  const base = new Date("2026-06-01T00:00:00.000Z").getTime();
  return new Date(base + daysFromNow * 86_400_000).toISOString();
}

function ymd(daysFromBase: number): string {
  return iso(daysFromBase).slice(0, 10);
}

export const seedCompanies: Company[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "株式会社サンライズ商事",
    name_kana: "サンライズショウジ",
    industry: "卸売・小売",
    contact_person: "田中 一郎",
    email: "tanaka@sunrise.example.com",
    phone: "03-1234-5678",
    address: "東京都千代田区丸の内1-1-1",
    status: "active",
    notes: "既存の主要取引先。年次更新は4月。",
    taxi: { DiDi: "使用中", "S.RIDE": "未着手", "GO ビジネス": "限度額まで使用" },
    taxi_phone: { DiDi: "090-1111-2222", "GO ビジネス": "090-1111-2222" },
    taxi_email: { DiDi: "didi@sunrise.example.com" },
    mobile: { ドコモ: "申し込み中", UQ: "使用中" },
    accounts: { みずほ銀行: "開設済み", 三井住友銀行: "審査中" },
    created_at: iso(-90),
    updated_at: iso(-5),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "みらいテック株式会社",
    name_kana: "ミライテック",
    industry: "IT・ソフトウェア",
    contact_person: "佐藤 花子",
    email: "sato@mirai-tech.example.com",
    phone: "06-2345-6789",
    address: "大阪府大阪市北区梅田2-2-2",
    status: "active",
    notes: "新規システム導入を検討中。",
    taxi: { DiDi: "審査依頼中", "S.RIDE": "未着手" },
    accounts: { PayPay銀行: "開設済み" },
    created_at: iso(-60),
    updated_at: iso(-2),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "グリーンフィールド工業株式会社",
    name_kana: "グリーンフィールドコウギョウ",
    industry: "製造",
    contact_person: "鈴木 健太",
    email: "suzuki@greenfield.example.com",
    phone: "052-3456-7890",
    address: "愛知県名古屋市中区栄3-3-3",
    status: "prospect",
    notes: "展示会で名刺交換。提案準備中。",
    created_at: iso(-20),
    updated_at: iso(-20),
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "ことぶき不動産株式会社",
    name_kana: "コトブキフドウサン",
    industry: "不動産",
    contact_person: "高橋 美咲",
    email: "takahashi@kotobuki.example.com",
    phone: "011-4567-8901",
    address: "北海道札幌市中央区大通4-4-4",
    status: "inactive",
    notes: "契約終了。再アプローチ候補。",
    taxi: {},
    accounts: { GMO: "審査落ち" },
    created_at: iso(-200),
    updated_at: iso(-100),
  },
];

export const seedCases: Case[] = [
  {
    id: "aaaaaaa1-0000-0000-0000-000000000001",
    company_id: "11111111-1111-1111-1111-111111111111",
    title: "基幹システム保守契約 更新",
    description: "年次の保守契約更新。条件交渉あり。",
    status: "in_progress",
    priority: "high",
    assignee: "山田 太郎",
    amount: 3_600_000,
    due_date: ymd(30),
    created_at: iso(-15),
    updated_at: iso(-3),
  },
  {
    id: "aaaaaaa1-0000-0000-0000-000000000002",
    company_id: "22222222-2222-2222-2222-222222222222",
    title: "在庫管理システム新規導入",
    description: "要件定義フェーズ。デモ実施済み。",
    status: "new",
    priority: "high",
    assignee: "山田 太郎",
    amount: 8_000_000,
    due_date: ymd(14),
    created_at: iso(-7),
    updated_at: iso(-1),
  },
  {
    id: "aaaaaaa1-0000-0000-0000-000000000003",
    company_id: "22222222-2222-2222-2222-222222222222",
    title: "保守サポートプラン提案",
    description: "導入後の年間サポート契約の提案。",
    status: "on_hold",
    priority: "medium",
    assignee: "伊藤 良子",
    amount: 1_200_000,
    due_date: ymd(45),
    created_at: iso(-5),
    updated_at: iso(-5),
  },
  {
    id: "aaaaaaa1-0000-0000-0000-000000000004",
    company_id: "33333333-3333-3333-3333-333333333333",
    title: "生産ライン可視化ツール 初回提案",
    description: "課題ヒアリングと概算見積もりの提示。",
    status: "new",
    priority: "medium",
    assignee: "伊藤 良子",
    amount: 2_500_000,
    due_date: ymd(7),
    created_at: iso(-10),
    updated_at: iso(-4),
  },
  {
    id: "aaaaaaa1-0000-0000-0000-000000000005",
    company_id: "11111111-1111-1111-1111-111111111111",
    title: "追加ライセンス販売",
    description: "20ユーザー分の追加ライセンス。",
    status: "done",
    priority: "low",
    assignee: "山田 太郎",
    amount: 600_000,
    due_date: ymd(-10),
    created_at: iso(-40),
    updated_at: iso(-12),
  },
  {
    id: "aaaaaaa1-0000-0000-0000-000000000006",
    company_id: "44444444-4444-4444-4444-444444444444",
    title: "物件管理システム リプレース",
    description: "予算の都合で見送り。",
    status: "lost",
    priority: "low",
    assignee: "伊藤 良子",
    amount: 5_000_000,
    due_date: ymd(-30),
    created_at: iso(-120),
    updated_at: iso(-95),
  },
];

export const seedBacklog: BacklogEntry[] = [
  {
    id: "bbbbbbb1-0000-0000-0000-000000000001",
    entry_date: ymd(-1),
    tag: "口座",
    content: "みずほ銀行の法人口座開設書類を提出。",
    created_at: iso(-1),
  },
  {
    id: "bbbbbbb1-0000-0000-0000-000000000002",
    entry_date: ymd(-3),
    tag: "タクシー",
    content: "GO ビジネスの審査依頼を送付。",
    created_at: iso(-3),
  },
  {
    id: "bbbbbbb1-0000-0000-0000-000000000003",
    entry_date: ymd(-7),
    tag: "法人設立",
    content: "新規法人の登記書類を準備し、司法書士へ連携。",
    created_at: iso(-7),
  },
];

export const seedContacts: Contact[] = [
  {
    id: "ccccccc1-0000-0000-0000-000000000001",
    name: "田中 一郎",
    affiliation: "株式会社サンライズ商事",
    phone: "03-1234-5678",
    email: "tanaka@sunrise.example.com",
    notes: "主要取引先の窓口。",
    created_at: iso(-10),
  },
  {
    id: "ccccccc1-0000-0000-0000-000000000002",
    name: "佐藤 花子",
    affiliation: "みらいテック株式会社",
    phone: "06-2345-6789",
    email: "sato@mirai-tech.example.com",
    notes: null,
    created_at: iso(-5),
  },
];

export const seedMobileContracts: MobileContractDetail[] = [
  {
    id: "eeeeeee1-0000-0000-0000-000000000001",
    company_id: "11111111-1111-1111-1111-111111111111",
    service: "UQ",
    device_model: "iPhone 16",
    contract_person: "佐藤",
    contracted_on: "2026-05-15",
    created_at: iso(-17),
    updated_at: iso(-17),
  },
];

// プロセス内で保持する可変ストア(モックモード専用)
interface MockDb {
  companies: Company[];
  cases: Case[];
  backlog: BacklogEntry[];
  contacts: Contact[];
  mobileContracts: MobileContractDetail[];
  meishiImages: MeishiImage[];
  crow: {
    partners: CrowPartner[];
    contracts: CrowContract[];
    stores: CrowStore[];
  };
}

const globalForMock = globalThis as unknown as { __mockDb?: MockDb };

export function getMockDb(): MockDb {
  if (!globalForMock.__mockDb) {
    globalForMock.__mockDb = {
      companies: seedCompanies.map((c) => ({ ...c })),
      cases: seedCases.map((c) => ({ ...c })),
      backlog: seedBacklog.map((b) => ({ ...b })),
      contacts: seedContacts.map((c) => ({ ...c })),
      mobileContracts: seedMobileContracts.map((detail) => ({ ...detail })),
      meishiImages: [],
      crow: {
        partners: [
          {
            id: "ddddddd1-0000-0000-0000-000000000001",
            company_name: "株式会社サンライズ商事",
            contact_person: "田中 一郎",
            phone: "03-1234-5678",
            email: "tanaka@sunrise.example.com",
            conditions: "紹介1件につき成約時に売上の10%を還元",
            status: "打診中",
            notes: "来週アポ予定。",
            created_at: iso(-3),
          },
        ],
        contracts: [
          {
            id: "ddddddd2-0000-0000-0000-000000000001",
            customer_name: "みらいテック株式会社",
            plan: "スタンダード",
            status: "トライアル",
            monthly_fee: 50000,
            start_date: ymd(-14),
            notes: "トライアル1ヶ月。",
            created_at: iso(-14),
          },
        ],
        stores: [
          {
            id: "ddddddd3-0000-0000-0000-000000000001",
            store_name: "サンライズ 丸の内店",
            company_name: "株式会社サンライズ商事",
            address: "東京都千代田区丸の内1-1-1",
            phone: "03-1234-5678",
            start_date: ymd(-30),
            status: "営業中",
            notes: null,
            created_at: iso(-30),
          },
        ],
      },
    };
  }
  return globalForMock.__mockDb;
}
