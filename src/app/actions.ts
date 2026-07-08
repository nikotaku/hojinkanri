"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCompany, createCase, setCompanyService } from "@/lib/data";
import type {
  CompanyStatus,
  CaseStatus,
  CasePriority,
} from "@/lib/types";

/** タクシー / 口座 の 1 サービスのステータスを更新する（インライン編集用） */
export async function setServiceStatusAction(
  companyId: string,
  field: "taxi" | "accounts",
  service: string,
  value: string,
) {
  await setCompanyService(companyId, field, service, value);
  revalidatePath("/taxi");
  revalidatePath("/accounts");
  revalidatePath(`/companies/${companyId}`);
}

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

export async function createCompanyAction(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("会社名は必須です。");

  const company = await createCompany({
    name,
    name_kana: str(formData, "name_kana"),
    industry: str(formData, "industry"),
    contact_person: str(formData, "contact_person"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    address: str(formData, "address"),
    status: (str(formData, "status") as CompanyStatus) ?? "prospect",
    notes: str(formData, "notes"),
  });

  revalidatePath("/companies");
  revalidatePath("/");
  redirect(`/companies/${company.id}`);
}

export async function createCaseAction(formData: FormData) {
  const title = str(formData, "title");
  const companyId = str(formData, "company_id");
  if (!title) throw new Error("案件名は必須です。");
  if (!companyId) throw new Error("法人の選択は必須です。");

  const amountRaw = str(formData, "amount");
  const amount = amountRaw ? Number(amountRaw.replace(/[,，]/g, "")) : null;

  await createCase({
    company_id: companyId,
    title,
    description: str(formData, "description"),
    status: (str(formData, "status") as CaseStatus) ?? "new",
    priority: (str(formData, "priority") as CasePriority) ?? "medium",
    assignee: str(formData, "assignee"),
    amount: amount != null && !Number.isNaN(amount) ? amount : null,
    due_date: str(formData, "due_date"),
  });

  revalidatePath("/cases");
  revalidatePath("/");
  redirect("/cases");
}
