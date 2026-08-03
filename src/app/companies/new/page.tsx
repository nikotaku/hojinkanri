import Link from "next/link";
import { createCompanyAction } from "@/app/actions";
import { COMPANY_STATUS_LABELS } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/Form";

export default function NewCompanyPage() {
  return (
    <div>
      <PageHeader title="法人を登録" description="新しい法人(顧客)を追加します" />

      <form
        action={createCompanyAction}
        className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="会社名" required>
            <TextInput name="name" required placeholder="株式会社サンプル" />
          </Field>
          <Field label="フリガナ">
            <TextInput name="name_kana" placeholder="サンプル" />
          </Field>
          <Field label="業種">
            <TextInput name="industry" placeholder="IT・ソフトウェア" />
          </Field>
          <Field label="ステータス">
            <Select name="status" defaultValue="prospect">
              {Object.entries(COMPANY_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="担当者名">
            <TextInput name="contact_person" placeholder="田中 一郎" />
          </Field>
          <Field label="電話番号">
            <TextInput name="phone" placeholder="03-1234-5678" />
          </Field>
          <Field label="メールアドレス">
            <TextInput type="email" name="email" placeholder="info@example.com" />
          </Field>
          <Field label="住所">
            <TextInput name="address" placeholder="東京都千代田区..." />
          </Field>
          <Field label="会社URL">
            <TextInput type="url" name="hp" placeholder="https://example.com" />
          </Field>
          <Field label="代表者名">
            <TextInput name="representative_name" placeholder="田中 一郎" />
          </Field>
          <Field label="設立年月日">
            <TextInput type="date" name="established_on" />
          </Field>
          <Field label="資本金（円）">
            <TextInput
              type="number"
              name="capital"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="1000000"
            />
          </Field>
        </div>

        <Field label="メモ">
          <TextArea name="notes" rows={3} placeholder="補足情報など" />
        </Field>

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton>登録する</SubmitButton>
          <Link
            href="/companies"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
