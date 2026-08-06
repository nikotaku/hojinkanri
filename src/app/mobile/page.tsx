import { listCompaniesWithMobileContracts } from "@/lib/data";
import { MOBILE_SERVICES, MOBILE_STATUS_OPTIONS } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { ServiceBoard } from "@/components/ServiceBoard";

export const dynamic = "force-dynamic";

export default async function MobilePage() {
  const companies = await listCompaniesWithMobileContracts();

  return (
    <div>
      <PageHeader
        title="法人モバイル回線"
        description={`各法人のモバイル回線（${MOBILE_SERVICES.join(
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
          services={MOBILE_SERVICES}
          statusOptions={MOBILE_STATUS_OPTIONS}
          prefix="mobile"
        />
      )}
    </div>
  );
}
