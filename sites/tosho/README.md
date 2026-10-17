# TOSHO株式会社 コーポレートサイト

`index.html` 1枚だけの静的サイト。ビルド不要。

## Vercel で公開する

このリポジトリとは別の Vercel プロジェクトとして公開する。

1. Vercel で **Add New… → Project**
2. このリポジトリ（`nikotaku/hojinkanri`）を選ぶ
3. **Root Directory** に `sites/tosho` を指定する
4. Framework Preset は **Other**（ビルドコマンドなし）
5. Deploy

`tosho.vercel.app` は既に他者が使用中のため取得できない。
`tosho-corporate` など空いている名前をプロジェクト名にする。

## 掲載内容について

会社概要は登記情報をそのまま載せている（商号・所在地・代表者・設立・資本金・
法人番号・電話番号）。変更があったら `index.html` の会社概要テーブルを直す。

**事業内容は未記載**。登記簿の「目的」を転記して差し替える。
`<section id="business">` の `<p class="note">` を書き換える。
