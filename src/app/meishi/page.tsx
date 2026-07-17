import { listCompanies } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { MeishiMaker } from "@/components/MeishiMaker";

export const dynamic = "force-dynamic";

export default async function MeishiPage() {
  const companies = await listCompanies();

  return (
    <div>
      <PageHeader
        title="名刺作成"
        description="法人を選択し担当者名を入力すると、名刺画像（PNG）を自動生成します"
      />

      {companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ法人が登録されていません。
        </div>
      ) : (
        <MeishiMaker companies={companies} />
      )}
    </div>
  );
}
