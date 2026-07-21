import Link from "next/link";
import {
  listCrowPartners,
  listCrowContracts,
  listCrowStores,
} from "@/lib/data";
import {
  CROW_PARTNER_STATUSES,
  CROW_CONTRACT_STATUSES,
  CROW_STORE_STATUSES,
} from "@/lib/types";
import {
  createCrowPartnerAction,
  deleteCrowPartnerAction,
  createCrowContractAction,
  deleteCrowContractAction,
  createCrowStoreAction,
  deleteCrowStoreAction,
} from "@/app/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  SubmitButton,
} from "@/components/Form";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "partners", label: "抱き合わせ営業依頼先" },
  { key: "contracts", label: "サービスの契約状況" },
  { key: "stores", label: "契約店舗一覧" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function statusClass(value: string): string {
  if (/(契約中|成約|営業中)/.test(value)) return "bg-green-100 text-green-700";
  if (/(解約|見送り)/.test(value)) return "bg-red-100 text-red-700";
  if (/(未打診|休止)/.test(value)) return "bg-gray-100 text-gray-500";
  return "bg-amber-100 text-amber-700";
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(
        value,
      )}`}
    >
      {value}
    </span>
  );
}

function InfoLine({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <p className="text-xs text-gray-500">
      <span className="text-gray-400">{label}: </span>
      {value}
    </p>
  );
}

async function PartnersTab() {
  const partners = await listCrowPartners();
  return (
    <>
      <form
        action={createCrowPartnerAction}
        className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="会社名" required>
            <TextInput name="company_name" required placeholder="株式会社サンプル" />
          </Field>
          <Field label="担当者名">
            <TextInput name="contact_person" placeholder="山田 太郎" />
          </Field>
          <Field label="電話番号">
            <TextInput type="tel" name="phone" placeholder="090-1234-5678" />
          </Field>
          <Field label="メールアドレス">
            <TextInput type="email" name="email" placeholder="info@example.com" />
          </Field>
          <Field label="ステータス">
            <Select name="status" defaultValue="未打診">
              {CROW_PARTNER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="条件">
          <TextArea
            name="conditions"
            rows={2}
            placeholder="紹介料・還元率・紹介の流れなど"
          />
        </Field>
        <Field label="メモ">
          <TextArea name="notes" rows={2} placeholder="補足情報など" />
        </Field>
        <SubmitButton>追加する</SubmitButton>
      </form>

      {partners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ営業依頼先がありません。
        </div>
      ) : (
        <ul className="space-y-3">
          {partners.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{p.company_name}</p>
                  {p.contact_person && (
                    <p className="text-xs text-gray-500">担当: {p.contact_person}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge value={p.status} />
                  <DeleteButton id={p.id} action={deleteCrowPartnerAction} />
                </div>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                {p.phone && (
                  <p>
                    <a
                      href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}
                      className="text-brand-600 hover:underline"
                    >
                      📞 {p.phone}
                    </a>
                  </p>
                )}
                {p.email && (
                  <p>
                    <a
                      href={`mailto:${p.email}`}
                      className="break-all text-brand-600 hover:underline"
                    >
                      ✉️ {p.email}
                    </a>
                  </p>
                )}
                {p.conditions && (
                  <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                    条件: {p.conditions}
                  </p>
                )}
                {p.notes && (
                  <p className="whitespace-pre-wrap text-xs text-gray-500">
                    {p.notes}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

async function ContractsTab() {
  const contracts = await listCrowContracts();
  return (
    <>
      <form
        action={createCrowContractAction}
        className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="顧客名（会社・店舗）" required>
            <TextInput name="customer_name" required placeholder="株式会社サンプル" />
          </Field>
          <Field label="プラン">
            <TextInput name="plan" placeholder="スタンダード" />
          </Field>
          <Field label="ステータス">
            <Select name="status" defaultValue="商談中">
              {CROW_CONTRACT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="月額(円)">
            <TextInput name="monthly_fee" inputMode="numeric" placeholder="50000" />
          </Field>
          <Field label="契約開始日">
            <TextInput type="date" name="start_date" />
          </Field>
        </div>
        <Field label="メモ">
          <TextArea name="notes" rows={2} placeholder="補足情報など" />
        </Field>
        <SubmitButton>追加する</SubmitButton>
      </form>

      {contracts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ契約がありません。
        </div>
      ) : (
        <ul className="space-y-3">
          {contracts.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-medium text-gray-900">
                  {c.customer_name}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge value={c.status} />
                  <DeleteButton id={c.id} action={deleteCrowContractAction} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>プラン: {c.plan ?? "—"}</span>
                <span>月額: {formatCurrency(c.monthly_fee)}</span>
                <span>開始: {formatDate(c.start_date)}</span>
              </div>
              {c.notes && (
                <p className="mt-1 whitespace-pre-wrap text-xs text-gray-500">
                  {c.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

async function StoresTab() {
  const stores = await listCrowStores();
  return (
    <>
      <form
        action={createCrowStoreAction}
        className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="店舗名" required>
            <TextInput name="store_name" required placeholder="サンプル 丸の内店" />
          </Field>
          <Field label="運営会社">
            <TextInput name="company_name" placeholder="株式会社サンプル" />
          </Field>
          <Field label="住所">
            <TextInput name="address" placeholder="東京都千代田区..." />
          </Field>
          <Field label="電話番号">
            <TextInput type="tel" name="phone" placeholder="03-1234-5678" />
          </Field>
          <Field label="ステータス">
            <Select name="status" defaultValue="営業中">
              {CROW_STORE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="契約開始日">
            <TextInput type="date" name="start_date" />
          </Field>
        </div>
        <Field label="メモ">
          <TextArea name="notes" rows={2} placeholder="補足情報など" />
        </Field>
        <SubmitButton>追加する</SubmitButton>
      </form>

      {stores.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ契約店舗がありません。
        </div>
      ) : (
        <ul className="space-y-3">
          {stores.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{s.store_name}</p>
                  {s.company_name && (
                    <p className="text-xs text-gray-500">{s.company_name}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge value={s.status} />
                  <DeleteButton id={s.id} action={deleteCrowStoreAction} />
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <InfoLine label="住所" value={s.address} />
                {s.phone && (
                  <p className="text-sm">
                    <a
                      href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}
                      className="text-brand-600 hover:underline"
                    >
                      📞 {s.phone}
                    </a>
                  </p>
                )}
                <InfoLine label="契約開始" value={formatDate(s.start_date)} />
                {s.notes && (
                  <p className="whitespace-pre-wrap text-xs text-gray-500">
                    {s.notes}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default async function CrowPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab: TabKey = (TABS.find((t) => t.key === searchParams.tab)?.key ??
    "partners") as TabKey;

  return (
    <div>
      <PageHeader
        title="crow 案件管理"
        description="抱き合わせ営業依頼先・サービスの契約状況・契約店舗一覧"
      />

      {/* タブ */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/crow?tab=${t.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "partners" && <PartnersTab />}
      {tab === "contracts" && <ContractsTab />}
      {tab === "stores" && <StoresTab />}
    </div>
  );
}
