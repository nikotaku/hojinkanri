import { listCompaniesWithBillingUsage } from "@/lib/data";
import { BILLING_SERVICES, BILLING_STATUS_OPTIONS, TAXI_SERVICES, TAXI_STATUS_OPTIONS } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { ServiceBoard } from "@/components/ServiceBoard";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const companies = await listCompaniesWithBillingUsage();

  return (
    <div>
      <PageHeader
        title="掛け払い・タクシー関連"
        description="各法人の掛け払い・タクシー各社の申請状況と登録情報をまとめて確認できます。各サービスをタップして詳細を開閉できます。"
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
          additionalGroups={[{ prefix: "taxi", services: TAXI_SERVICES, statusOptions: TAXI_STATUS_OPTIONS }]}
        />
      )}
    </div>
  );
}
