# 法人案件管理 (hojinkanri)

法人(顧客)と案件を管理するための Web アプリケーションです。
Next.js (App Router) + TypeScript + Tailwind CSS + Supabase で構築しています。

## 主な機能

- **ダッシュボード** — 登録法人数・進行中案件・金額合計・ステータス別件数・期限が近い案件のサマリー
- **法人管理** — 法人(顧客)の一覧 / 登録 / 詳細表示（紐づく案件も表示）
- **法人モバイル回線** — ドコモ・UQの進捗、登録情報、契約端末（機種・担当者・契約日）の管理
- **案件管理** — 案件の一覧 / 登録（法人・ステータス・優先度・担当・金額・期限）

> 認証は現時点ではスコープ外です。社内利用を想定した最小構成から始めています。

## 動作モード

このアプリは Supabase の接続情報が **未設定でもそのまま動作** します。

| モード | 条件 | 挙動 |
| --- | --- | --- |
| モック | 環境変数なし | サンプルデータをインメモリで利用（開発サーバー再起動でリセット） |
| 本番 | 環境変数あり | Supabase の PostgreSQL を利用 |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動（モックモード）

```bash
npm run dev
```

http://localhost:3000 を開くと、サンプルデータで動作を確認できます。

### 3. Supabase に接続する（本番モード）

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. SQL Editor で `supabase/migrations/0001_init.sql` を実行（任意で `supabase/seed.sql` も）
3. `.env.example` を `.env.local` にコピーし、Settings > API の値を設定

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

4. 開発サーバーを再起動すると Supabase のデータを参照します。

## スクリプト

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint |
| `npm run typecheck` | 型チェック (tsc) |

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx            ダッシュボード
│   ├── actions.ts          サーバーアクション（登録処理）
│   ├── companies/          法人: 一覧 / 新規 / 詳細
│   └── cases/              案件: 一覧 / 新規
├── components/             UI コンポーネント
└── lib/
    ├── types.ts            ドメイン型
    ├── data.ts             データアクセス層（Supabase / モック切替）
    ├── supabase.ts         Supabase クライアント
    ├── mock-store.ts       サンプルデータ
    └── format.ts           表示フォーマット
supabase/
├── migrations/0001_init.sql  スキーマ定義
└── seed.sql                  サンプルデータ
```

## データモデル

- **companies（法人）** — 会社名 / フリガナ / 業種 / 担当者 / 連絡先 / 住所 / ステータス（見込み・取引中・休止）/ メモ
- **cases（案件）** — 法人 / 案件名 / 詳細 / ステータス（新規・対応中・保留・完了・失注）/ 優先度 / 担当者 / 金額 / 期限
- **mobile_contract_details（契約端末）** — 法人 / 回線 / 契約機種名 / 売却価格 / 売却先 / 契約担当者 / 契約日

## 今後の拡張候補

- ユーザー認証・権限管理（Supabase Auth）
- 案件の編集・削除、ステータス変更履歴
- 検索・絞り込み・並び替え
- 活動ログ / 対応履歴、ファイル添付
- 集計レポートの出力
