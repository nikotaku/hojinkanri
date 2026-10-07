import { listGmoAtobaraiSites, listCompanies } from "@/lib/data";
import {
  BILLING_STATUS_OPTIONS,
  GMO_ATOBARAI_SITE_GROUPS,
  GMO_ATOBARAI_SITE_OPTIONS,
} from "@/lib/types";
import {
  createGmoAtobaraiSiteAction,
  deleteGmoAtobaraiSiteAction,
} from "@/app/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  SubmitButton,
} from "@/components/Form";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

function statusClass(value: string): string {
  if (/(利用開始|審査通過)/.test(value)) return "bg-green-100 text-green-700";
  if (/(審査落ち|利用不可)/.test(value)) return "bg-red-100 text-red-700";
  if (/(未着手|保留)/.test(value)) return "bg-gray-100 text-gray-500";
  return "bg-amber-100 text-amber-700";
}

/** 考察の1項目 */
function Point({
  no,
  title,
  children,
}: {
  no: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
        {no}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
          {children}
        </p>
      </div>
    </div>
  );
}

export default async function GmoAtobaraiPage() {
  const [sites, companies] = await Promise.all([
    listGmoAtobaraiSites(),
    listCompanies(),
  ]);

  return (
    <div>
      <PageHeader
        title="GMO後払い"
        description={`利用サイトごとの申込・審査状況と、審査要素の考察｜全 ${sites.length} 件`}
      />

      {/* 考察 */}
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-gray-900">
          審査で見られている要素の考察
        </h2>
        <p className="mt-1 rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">
          GMOペイメントサービスは審査基準を公開していません。以下は後払い決済の
          公表情報と一般的な実務からの整理で、<strong>推測を含みます</strong>。
          確定情報として扱わないでください。
        </p>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700">
            前提：審査は2段階ある
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            ①サイト（加盟店）がGMOと契約する審査と、②購入のたびに購入者を見る
            <strong>都度与信</strong>は別物です。こちらが通る／落ちるのは②で、
            注文ごとに判定されます。前回通っても次回落ちることがあるのはこのためです。
          </p>
        </div>

        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            都度与信で重く効いていると考えられるもの（影響が大きい順）
          </h3>
          <div className="space-y-3">
            <Point no="1" title="登録情報の正確性・実在性">
              法人名・住所・電話番号が登記と一致しているか、電話が実際に繋がるか。
              表記ゆれ（丁目/番地の書き方、ビル名の有無）だけでも実在確認に失敗することがあります。
              <strong>ここが最も多い落ち要因</strong>と考えられます。
            </Point>
            <Point no="2" title="その決済会社での支払い履歴">
              後払い各社は自社の社内データベースを持っており、過去の遅延・未払いが
              残っていると以後かなり厳しくなります。社名が変わっても、住所・電話・
              代表者で名寄せされます。
            </Point>
            <Point no="3" title="請求先と配送先の一致">
              不一致は不正利用の典型パターンとして扱われます。
            </Point>
            <Point no="4" title="金額・頻度・商材">
              初回からの高額、短期間の連続注文、換金性の高い商材（家電・金券など）は
              保守的に判定されます。利用限度額（未払い残高の枠）もあります。
            </Point>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-3.5">
          <h3 className="text-sm font-semibold text-gray-700">
            ご質問の「ブラウザのログ」と「IPアドレス」について
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            後払い・BNPLの不正検知では、
            <strong>デバイス情報（ブラウザ種別・OS・画面サイズ等＝デバイスフィンガープリント）</strong>
            と<strong>IPアドレスの評価</strong>（データセンター/VPN/プロキシ経由か、
            過去に不正があったIPか、請求先住所と地理的に大きく矛盾しないか）は、
            業界一般として判定材料に使われています。どちらか一方ではなく
            <strong>両方</strong>が不正検知側のシグナルです。
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            ただし重要なのは、これらは<strong>与信の主因ではなく補助的な不正検知</strong>
            である点です。上の 1〜3 が整っていないケースの方が圧倒的に多く、
            デバイスやIPを気にする前に登録情報と支払い履歴を確認する方が効果的です。
            なお GMO後払いが具体的に何をどう評価しているかは非公開で、断定はできません。
          </p>
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            通過率を上げるための実務的な対応
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600">
            <li>申込情報は登記簿の表記どおりに統一する（全角/半角、丁目・番地の書き方まで）</li>
            <li>登録した電話番号が実際に繋がる状態にしておく</li>
            <li>請求先と配送先を一致させる</li>
            <li>初回は少額から申し込み、支払い実績を作ってから金額を上げる</li>
            <li>支払期限を必ず守る（1回の遅延が以後の判定に長く残ります）</li>
            <li>社用の通常回線から申し込む。VPN・プロキシ経由は不正検知で不利に働くことがあります</li>
          </ul>
          <p className="mt-3 rounded-lg bg-gray-100 p-2.5 text-xs leading-relaxed text-gray-500">
            なお、同一性を隠す目的でIPやブラウザを変える、別名義で申し込み直すといった
            手法は各社の規約違反（不正利用）に当たるため、ここでは扱いません。
            落ちた場合は、上の正攻法での改善か、他の決済手段の併用を検討してください。
          </p>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-700">
            切り分けのすすめ
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            下の表に<strong>申込ごとの結果を記録していく</strong>と、
            「どの法人が」「いくらで」「いつ」落ちたかが並び、原因の当たりを付けられます。
            同じ法人が金額に関係なく毎回落ちるなら 1〜2 の問題、
            金額を上げたときだけ落ちるなら 4 の限度額の問題、と切り分けられます。
          </p>
        </div>
      </section>

      {/* 使えるサイト一覧 */}
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-gray-900">
          GMO後払いが使えるサイト
          <span className="ml-2 text-sm font-normal text-gray-500">
            （{GMO_ATOBARAI_SITE_OPTIONS.length}件）
          </span>
        </h2>
        <p className="mt-1 rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">
          GMOペイメントサービスは加盟店の網羅リストを公開していません。以下は
          各販売サイトの案内と後払い決済のまとめサイトで確認できたもので、
          <strong>これで全てではありません</strong>。導入状況は変わるため、
          申し込む前に各サイトの支払方法ページで最新をご確認ください（確認日: 2026-10-07）。
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GMO_ATOBARAI_SITE_GROUPS.map((g) => (
            <div key={g.label} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
              <p className="text-xs font-semibold text-gray-700">{g.label}</p>
              <ul className="mt-1.5 space-y-1">
                {g.options.map((o) => (
                  <li key={o} className="text-sm leading-snug text-gray-600">
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          GMO後払いは主に個人向け（BtoC）の後払い決済です。
          <strong>法人名義で使えるかは販売サイトごとに異なる</strong>ため、
          法人で申し込む場合は各サイトに確認してください。
        </p>
      </section>

      {/* 追加フォーム */}
      <form
        action={createGmoAtobaraiSiteAction}
        className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <h2 className="text-base font-semibold text-gray-900">
          申込・審査結果を記録
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="利用サイト" required>
            <TextInput
              name="site_name"
              required
              list="gmo-atobarai-sites"
              placeholder="入力すると候補が出ます（候補外も入力可）"
            />
            <datalist id="gmo-atobarai-sites">
              {GMO_ATOBARAI_SITE_OPTIONS.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </Field>
          <Field label="申し込んだ法人">
            <Select name="company_id" defaultValue="">
              <option value="">（未選択）</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="ステータス">
            <Select name="status" defaultValue="未着手">
              {BILLING_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="申込日">
            <TextInput type="date" name="applied_on" />
          </Field>
          <Field label="注文金額(円)">
            <TextInput name="amount" inputMode="numeric" placeholder="30000" />
          </Field>
        </div>
        <Field label="審査結果について分かったこと">
          <TextArea
            name="result_note"
            rows={2}
            placeholder="例: 金額を1万円に下げたら通った / 電話番号が繋がらず否決"
          />
        </Field>
        <Field label="メモ">
          <TextArea name="notes" rows={2} placeholder="補足情報など" />
        </Field>
        <SubmitButton>記録する</SubmitButton>
      </form>

      {sites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ記録がありません。申し込むたびに結果を残すと原因を切り分けられます。
        </div>
      ) : (
        <ul className="space-y-3">
          {sites.map((s) => {
            const company = companies.find((c) => c.id === s.company_id);
            return (
              <li
                key={s.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{s.site_name}</p>
                    {company && (
                      <p className="text-xs text-gray-500">{company.name}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(
                        s.status,
                      )}`}
                    >
                      {s.status}
                    </span>
                    <DeleteButton
                      id={s.id}
                      action={deleteGmoAtobaraiSiteAction}
                    />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>申込日: {formatDate(s.applied_on)}</span>
                  <span>金額: {formatCurrency(s.amount)}</span>
                </div>
                {s.result_note && (
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                    結果: {s.result_note}
                  </p>
                )}
                {s.notes && (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-gray-500">
                    {s.notes}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
