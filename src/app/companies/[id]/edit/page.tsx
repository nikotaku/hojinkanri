import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany } from "@/lib/data";
import { updateCompanyAction } from "@/app/actions";
import {
  PROGRESS_STATUS_OPTIONS,
  INCORPORATION_FILING_OPTIONS,
} from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { PostalCodeField } from "@/components/PostalCodeField";
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
          <PostalCodeField
            defaultPostalCode={company.postal_code}
            defaultAddress={company.address}
          />
          <Field label="会社URL">
            <TextInput
              name="hp"
              inputMode="url"
              defaultValue={company.hp ?? ""}
              placeholder="example.com"
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
          <Field label="会社法人等番号（登記簿・12桁）">
            <TextInput
              name="company_number" pattern="(?:[0-9０-９][\s\-－]*){12}" title="12桁の数字で入力してください（ハイフンあり可）"
              inputMode="numeric"
              defaultValue={company.company_number ?? ""}
              placeholder="0300-01-103360"
            />
          </Field>
          <Field label="法人番号（国税庁・13桁）">
            <TextInput
              name="corporate_number" pattern="(?:[0-9０-９][\s\-－]*){13}" title="13桁の数字で入力してください（ハイフンあり可）"
              inputMode="numeric"
              defaultValue={company.corporate_number ?? ""}
              placeholder="9370003006437"
            />
          </Field>
          <Field label="登録番号（インボイス）">
            <TextInput
              name="invoice_number" pattern="[TtＴｔ][\s\-－]*(?:[0-9０-９][\s\-－]*){13}" title="T のあとに13桁の数字で入力してください"
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="進行ステータス">
            <Select name="progress_status" defaultValue={company.progress_status ?? ""}>
              <option value="">（未設定）</option>
              {PROGRESS_STATUS_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
          </Field>
          <Field label="法人設立届">
            <Select
              name="incorporation_filing_status"
              defaultValue={company.incorporation_filing_status ?? ""}
            >
              <option value="">（未設定）</option>
              {INCORPORATION_FILING_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
          </Field>
          <Field label="e-tax利用者識別番号">
            <TextInput
              name="etax_id"
              inputMode="numeric"
              defaultValue={company.etax_id ?? ""}
              placeholder="1234567890123456"
            />
          </Field>
          <Field label="雇用保険適用事業所番号">
            <TextInput
              name="employment_insurance_number"
              defaultValue={company.employment_insurance_number ?? ""}
              placeholder="0401-633227-6"
            />
          </Field>
          <Field label="労働保険番号">
            <TextInput
              name="labour_insurance_number"
              defaultValue={company.labour_insurance_number ?? ""}
              placeholder="043-01-633227"
            />
          </Field>
          <Field label="GビズID">
            <TextInput
              name="gbiz_id"
              defaultValue={company.gbiz_id ?? ""}
              placeholder="example@example.com"
            />
          </Field>
          <Field label="パスワード">
            <TextInput
              name="gbiz_password"
              defaultValue={company.gbiz_password ?? ""}
              placeholder="GビズIDのパスワード"
            />
          </Field>
          <Field label="登録電話番号">
            <TextInput
              type="tel"
              name="gbiz_phone"
              defaultValue={company.gbiz_phone ?? ""}
              placeholder="090-1234-5678"
            />
          </Field>
        </div>

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
