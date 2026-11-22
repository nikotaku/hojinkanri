import Link from "next/link";
import { listCases } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { CaseList } from "@/components/CaseList";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const [cases, archived] = await Promise.all([
    listCases(),
    listCases({ archived: true }),
  ]);

  return (
    <div>
      <PageHeader
        title="案件管理"
        description={`全 ${cases.length} 件`}
        action={{ href: "/cases/new", label: "+ 案件を登録" }}
      />

      <CaseList
        cases={cases}
        empty="まだ案件が登録されていません。"
      />

      {archived.length > 0 && (
        <p className="mt-4 text-sm">
          <Link
            href="/cases/archived"
            className="text-gray-500 hover:text-brand-600"
          >
            アーカイブ済み {archived.length} 件を見る →
          </Link>
        </p>
      )}
    </div>
  );
}
