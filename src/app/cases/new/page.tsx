import Link from "next/link";
import { createCaseAction } from "@/app/actions";
import { listCompanies } from "@/lib/data";
import {
  CASE_STATUS_LABELS,
  CASE_PRIORITY_LABELS,
} from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/Form";

export const dynamic = "force-dynamic";

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: { company?: string };
}) {
  const companies = await listCompanies();
  const defaultCompany = searchParams.company ?? "";

  return (
    <div>
      <PageHeader title="案件を登録" description="新しい案件を追加します" />

      <form
        action={createCaseAction}
        className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
          <Field label="案件名" required>
            <TextInput name="title" required placeholder="基幹システム保守契約 更新" />
          </Field>

          <Field label="法人（任意）">
            <Select name="company_id" defaultValue={defaultCompany}>
              <option value="">（法人なし）</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="ステータス">
              <Select name="status" defaultValue="new">
                {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="優先度">
              <Select name="priority" defaultValue="medium">
                {Object.entries(CASE_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="担当者">
              <TextInput name="assignee" placeholder="山田 太郎" />
            </Field>
            <Field label="金額(円)">
              <TextInput name="amount" inputMode="numeric" placeholder="1000000" />
            </Field>
            <Field label="期限">
              <TextInput type="date" name="due_date" />
            </Field>
          </div>

          <Field label="詳細">
            <TextArea name="description" rows={3} placeholder="案件の内容や状況" />
          </Field>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton>登録する</SubmitButton>
            <Link
              href="/cases"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              キャンセル
            </Link>
          </div>
      </form>
    </div>
  );
}
