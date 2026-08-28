import { listCompaniesWithBillingUsage } from "@/lib/data";
import { BILLING_SERVICES, BILLING_STATUS_OPTIONS } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { ServiceBoard } from "@/components/ServiceBoard";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const companies = await listCompaniesWithBillingUsage();

  return (
    <div>
      <PageHeader
        title="掛け払い"
        description={`各法人の掛け払いサービス（${BILLING_SERVICES.join(
          " / ",
        )}）｜⠿ をドラッグで並び替え・各社をタップで開閉`}
      />

      {companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ法人が登録されていません。
        </div>
      ) : (
        <ServiceBoard
          companies={companies}
          services={BILLING_SERVICES}
          statusOptions={BILLING_STATUS_OPTIONS}
          prefix="billing"
        />
      )}
    </div>
  );
}
