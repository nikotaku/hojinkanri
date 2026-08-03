import Link from "next/link";
import { listCompanies } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteCompanyAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await listCompanies();

  return (
    <div>
      <PageHeader
        title="法人管理"
        description={`登録法人 ${companies.length} 社`}
        action={{ href: "/companies/new", label: "+ 法人を登録" }}
      />

      {companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ法人が登録されていません。
        </div>
      ) : (
        <ul className="space-y-3">
          {companies.map((c) => (
            <li key={c.id}>
              <details className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 font-medium text-gray-900 transition hover:bg-gray-50 sm:px-6 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 truncate">{c.name}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>

                <Link
                  href={`/companies/${c.id}`}
                  className="block border-t border-gray-100 bg-gray-50/60 px-4 py-4 transition hover:bg-brand-50 sm:px-6"
                  aria-label={`${c.name}の詳細ページを開く`}
                >
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <dt className="text-gray-400">登記住所</dt>
                      <dd className="mt-1 text-gray-700">{c.address ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">会社URL</dt>
                      <dd className="mt-1 break-all text-gray-700">{c.hp ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">代表者名</dt>
                      <dd className="mt-1 text-gray-700">
                        {c.representative_name ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">設立年月日</dt>
                      <dd className="mt-1 text-gray-700">
                        {formatDate(c.established_on)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">資本金</dt>
                      <dd className="mt-1 text-gray-700">
                        {formatCurrency(c.capital)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-right text-xs font-medium text-brand-600">
                    詳細ページを開く →
                  </p>
                </Link>

                <div className="flex justify-end border-t border-gray-100 px-4 py-2 sm:px-6">
                  <DeleteButton
                    id={c.id}
                    action={deleteCompanyAction}
                    confirmMessage={`「${c.name}」を削除します。紐づく案件・名刺画像も削除され、元に戻せません。よろしいですか？`}
                  />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
