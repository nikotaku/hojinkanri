import { listCompanies } from "@/lib/data";
import { ACCOUNT_SERVICES } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { ServiceMatrix } from "@/components/ServiceMatrix";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const companies = await listCompanies();

  return (
    <div>
      <PageHeader
        title="口座関連"
        description={`各法人の銀行・口座の状況（${ACCOUNT_SERVICES.join(" / ")}）`}
      />

      {companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ法人が登録されていません。
        </div>
      ) : (
        <ServiceMatrix
          companies={companies}
          services={ACCOUNT_SERVICES}
          field="accounts"
        />
      )}
    </div>
  );
}
