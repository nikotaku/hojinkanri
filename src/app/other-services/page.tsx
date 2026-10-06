import { listCompanies } from "@/lib/data";
import { OTHER_SERVICES, OTHER_SERVICE_STATUS_OPTIONS } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { ServiceBoard } from "@/components/ServiceBoard";

export const dynamic = "force-dynamic";

export default async function OtherServicesPage() {
  const companies = await listCompanies();

  return (
    <div>
      <PageHeader
        title="その他サービス"
        description={`各法人のサービス状況（${OTHER_SERVICES.join(
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
          services={OTHER_SERVICES}
          statusOptions={OTHER_SERVICE_STATUS_OPTIONS}
          prefix="other"
        />
      )}
    </div>
  );
}
