import { listCompanies } from "@/lib/data";
import { TAXI_SERVICES } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { ServiceMatrix } from "@/components/ServiceMatrix";

export const dynamic = "force-dynamic";

export default async function TaxiPage() {
  const companies = await listCompanies();

  return (
    <div>
      <PageHeader
        title="タクシー関連"
        description={`各法人のタクシー配車サービス状況と登録番号・メール（${TAXI_SERVICES.join(
          " / ",
        )}）`}
      />

      {companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ法人が登録されていません。
        </div>
      ) : (
        <ServiceMatrix
          companies={companies}
          services={TAXI_SERVICES}
          field="taxi"
          showContact
        />
      )}
    </div>
  );
}
