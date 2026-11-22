import {
  MAC_SUPPLIERS,
  MAC_SUPPLIERS_SURVEYED_ON,
  type MacSupplier,
  type SupplierVerdict,
} from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

const VERDICT: Record<
  SupplierVerdict,
  { label: string; badge: string; heading: string; lead: string }
> = {
  ok: {
    label: "請求書払いで買える",
    badge: "bg-green-100 text-green-700",
    heading: "請求書払いで Mac mini が買える",
    lead: "サイト上で請求書払い（売掛・掛売）の記載を確認できたところ。",
  },
  maybe: {
    label: "要問い合わせ",
    badge: "bg-amber-100 text-amber-700",
    heading: "条件つき・要問い合わせ",
    lead: "請求書払いか Mac mini の取扱か、どちらかが裏を取れなかったところ。",
  },
  no: {
    label: "この用途では使えない",
    badge: "bg-gray-100 text-gray-500",
    heading: "この用途では使えない",
    lead: "前払いしかできないか、Mac mini 本体を売っていないところ。",
  },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="shrink-0 text-xs text-gray-500 sm:w-28 sm:pt-0.5">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-gray-800">{children}</dd>
    </div>
  );
}

function SupplierCard({ s }: { s: MacSupplier }) {
  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
        <div className="min-w-0">
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-brand-700 hover:underline"
          >
            {s.name}
          </a>
          <p className="mt-0.5 text-xs text-gray-500">{s.kind}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${VERDICT[s.verdict].badge}`}
        >
          {VERDICT[s.verdict].label}
        </span>
      </div>

      <dl className="space-y-2">
        <Row label="Mac mini">{s.macMini}</Row>
        <Row label="支払い">{s.payment}</Row>
        {s.terms !== "—" && <Row label="締め・支払日">{s.terms}</Row>}
        {s.apply !== "—" && <Row label="申込・審査">{s.apply}</Row>}
      </dl>

      {s.note && (
        <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">
          {s.note}
        </p>
      )}

      <p className="mt-2.5 break-all text-[11px] text-gray-400">
        出典:{" "}
        <a
          href={s.source}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-brand-600 hover:underline"
        >
          {s.source}
        </a>
      </p>
    </li>
  );
}

export default function MacSuppliersPage() {
  const groups: SupplierVerdict[] = ["ok", "maybe", "no"];
  const okCount = MAC_SUPPLIERS.filter((s) => s.verdict === "ok").length;

  return (
    <div>
      <PageHeader
        title="Mac mini 仕入先"
        description={`請求書払い（売掛・掛け払い）で Mac mini を買えるサイトの一覧｜全 ${MAC_SUPPLIERS.length} 件中 ${okCount} 件が請求書払い可`}
      />

      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-gray-900">まず使うなら</h2>
        <ol className="mt-3 space-y-3">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
              1
            </span>
            <p className="text-sm leading-relaxed text-gray-700">
              <strong>秋葉館</strong>。Mac専門店なので在庫が確実で、決済は
              <strong>Paid</strong>。掛け払い管理ですでに使っている決済サービスなので、
              審査が通れば一番早い。審査は3営業日程度。
            </p>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
              2
            </span>
            <p className="text-sm leading-relaxed text-gray-700">
              <strong>法人専用ビックカメラ.com</strong>。売掛会員になれば
              月末締め翌末払い。条件が一番はっきり書いてある。申込は営業担当経由なので
              立ち上がりに時間がかかる。
            </p>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
              3
            </span>
            <p className="text-sm leading-relaxed text-gray-700">
              <strong>Amazonビジネス</strong>。締め日を選べて手数料無料だが、
              請求書払いが使えるかは出品者次第。カートで確認してから発注する。
            </p>
          </li>
        </ol>
        <p className="mt-4 rounded-lg bg-gray-50 p-2.5 text-xs leading-relaxed text-gray-600">
          調査日 {MAC_SUPPLIERS_SURVEYED_ON}。各サイトの公開ページに書かれている内容を
          そのまま載せています。与信枠・支払いサイト・初回取引の扱いは会社ごとに
          変わるので、発注前に各社へ確認してください。
        </p>
      </section>

      {groups.map((v) => {
        const items = MAC_SUPPLIERS.filter((s) => s.verdict === v);
        if (items.length === 0) return null;
        return (
          <section key={v} className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              {VERDICT[v].heading}
              <span className="ml-2 text-sm font-normal text-gray-500">
                {items.length} 件
              </span>
            </h2>
            <p className="mb-3 mt-0.5 text-sm text-gray-500">
              {VERDICT[v].lead}
            </p>
            <ul className="space-y-3">
              {items.map((s) => (
                <SupplierCard key={s.name} s={s} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
