import Link from "next/link";
import { listCases } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { CaseList } from "@/components/CaseList";

export const dynamic = "force-dynamic";

export default async function ArchivedCasesPage() {
  const cases = await listCases({ archived: true });

  return (
    <div>
      <div className="mb-4">
        <Link href="/cases" className="text-sm text-gray-500 hover:text-brand-600">
          ← 案件一覧に戻る
        </Link>
      </div>

      <PageHeader
        title="アーカイブ済みの案件"
        description={`全 ${cases.length} 件｜タップで詳細を開き、そこから戻せます`}
      />

      <CaseList
        cases={cases}
        empty="アーカイブした案件はまだありません。"
      />
    </div>
  );
}
