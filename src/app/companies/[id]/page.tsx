import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, getCasesByCompany } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import {
  CompanyStatusBadge,
  CaseStatusBadge,
  PriorityBadge,
} from "@/components/StatusBadge";
import { CompanyHpInput } from "@/components/CompanyHpInput";
import { ToukiUpload } from "@/components/ToukiUpload";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const company = await getCompany(params.id);
  if (!company) notFound();

  const cases = await getCasesByCompany(company.id);

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/companies"
          className="text-sm text-gray-500 hover:text-brand-600"
        >
          ← 法人一覧に戻る
        </Link>
      </div>

      <PageHeader title={company.name} description={company.name_kana ?? undefined}>
        <CompanyStatusBadge status={company.status} />
      </PageHeader>

      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-gray-900">法人詳細</h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">登記住所</dt>
            <dd className="mt-1 text-sm text-gray-900">{company.address ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">会社URL</dt>
            <dd className="mt-1 break-all text-sm">
              {company.hp ? (
                <a
                  href={company.hp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 hover:underline"
                >
                  {company.hp}
                </a>
              ) : (
                <span className="text-gray-900">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">代表者名</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {company.representative_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">設立年月日</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDate(company.established_on)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">資本金</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatCurrency(company.capital)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 管理情報 */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-base font-semibold text-gray-900">管理情報</h2>
          <div className="space-y-5">
            <div>
              <p className="mb-1.5 text-sm text-gray-500">会社URLを更新</p>
              <CompanyHpInput companyId={company.id} value={company.hp} />
            </div>
            <div>
              <p className="mb-1.5 text-sm text-gray-500">登記簿謄本（画像）</p>
              <ToukiUpload companyId={company.id} url={company.touki_url} />
            </div>
          </div>
        </section>

        {/* 案件一覧 */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              案件 ({cases.length})
            </h2>
            <Link
              href={`/cases/new?company=${company.id}`}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              + 案件を追加
            </Link>
          </div>

          {cases.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              この法人にはまだ案件がありません。
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cases.map((c) => (
                <li key={c.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900">{c.title}</p>
                    <CaseStatusBadge status={c.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <PriorityBadge priority={c.priority} />
                    <span>担当: {c.assignee ?? "—"}</span>
                    <span>金額: {formatCurrency(c.amount)}</span>
                    <span>期限: {formatDate(c.due_date)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
