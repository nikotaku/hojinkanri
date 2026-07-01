import Link from "next/link";
import { listCompanies } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { CompanyStatusBadge } from "@/components/StatusBadge";

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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  会社名
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  業種
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  担当者
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  登録日
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/companies/${c.id}`}
                      className="font-medium text-gray-900 hover:text-brand-600"
                    >
                      {c.name}
                    </Link>
                    {c.name_kana && (
                      <p className="text-xs text-gray-400">{c.name_kana}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.industry ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.contact_person ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <CompanyStatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(c.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
