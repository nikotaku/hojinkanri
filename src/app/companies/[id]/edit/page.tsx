import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany } from "@/lib/data";
import { updateCompanyAction } from "@/app/actions";
import { COMPANY_STATUS_LABELS } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  SubmitButton,
} from "@/components/Form";

export const dynamic = "force-dynamic";

export default async function EditCompanyPage({
  params,
}: {
  params: { id: string };
}) {
  const company = await getCompany(params.id);
  if (!company) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/companies/${company.id}`}
          className="text-sm text-gray-500 hover:text-brand-600"
        >
          ← 法人詳細に戻る
        </Link>
      </div>

      <PageHeader title="法人情報を編集" description={company.name} />

      <form
        action={updateCompanyAction}
        className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="id" value={company.id} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="会社名" required>
            <TextInput name="name" required defaultValue={company.name} />
          </Field>
          <Field label="フリガナ">
            <TextInput
              name="name_kana"
              defaultValue={company.name_kana ?? ""}
              placeholder="サンプル"
            />
          </Field>
          <Field label="業種">
            <TextInput
              name="industry"
              defaultValue={company.industry ?? ""}
              placeholder="IT・ソフトウェア"
            />
          </Field>
          <Field label="ステータス">
            <Select name="status" defaultValue={company.status}>
              {Object.entries(COMPANY_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="担当者名">
            <TextInput
              name="contact_person"
              defaultValue={company.contact_person ?? ""}
              placeholder="田中 一郎"
            />
          </Field>
          <Field label="電話番号">
            <TextInput
              name="phone"
              defaultValue={company.phone ?? ""}
              placeholder="03-1234-5678"
            />
          </Field>
          <Field label="メールアドレス">
            <TextInput
              type="email"
              name="email"
              defaultValue={company.email ?? ""}
              placeholder="info@example.com"
            />
          </Field>
          <Field label="住所">
            <TextInput
              name="address"
              defaultValue={company.address ?? ""}
              placeholder="東京都千代田区..."
            />
          </Field>
          <Field label="会社URL">
            <TextInput
              type="url"
              name="hp"
              defaultValue={company.hp ?? ""}
              placeholder="https://example.com"
            />
          </Field>
          <Field label="代表者名">
            <TextInput
              name="representative_name"
              defaultValue={company.representative_name ?? ""}
              placeholder="田中 一郎"
            />
          </Field>
          <Field label="設立年月日">
            <TextInput
              type="date"
              name="established_on"
              defaultValue={company.established_on ?? ""}
            />
          </Field>
          <Field label="登録番号（インボイス）">
            <TextInput
              name="invoice_number"
              defaultValue={company.invoice_number ?? ""}
              placeholder="T1234567890123"
            />
          </Field>
          <Field label="資本金（円）">
            <TextInput
              type="number"
              name="capital"
              min="0"
              step="1"
              inputMode="numeric"
              defaultValue={company.capital ?? ""}
              placeholder="1000000"
            />
          </Field>
        </div>

        <Field label="メモ">
          <TextArea
            name="notes"
            rows={3}
            defaultValue={company.notes ?? ""}
            placeholder="補足情報など"
          />
        </Field>

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton>保存する</SubmitButton>
          <Link
            href={`/companies/${company.id}`}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
