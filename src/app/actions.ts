"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCompany,
  createCase,
  setCompanyService,
  reorderCompanies,
  createBacklogEntry,
  deleteBacklogEntry,
} from "@/lib/data";
import type {
  CompanyStatus,
  CaseStatus,
  CasePriority,
} from "@/lib/types";

/** 会社の並び順を保存する（ドラッグ&ドロップ用） */
export async function reorderCompaniesAction(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  await reorderCompanies(ids);
  revalidatePath("/taxi");
  revalidatePath("/accounts");
  revalidatePath("/companies");
}

/** 行動のバックログを1件追加する */
export async function createBacklogAction(formData: FormData) {
  const content = str(formData, "content");
  if (!content) throw new Error("内容は必須です。");
  const entry_date =
    str(formData, "entry_date") ?? new Date().toISOString().slice(0, 10);

  await createBacklogEntry({
    entry_date,
    tag: str(formData, "tag"),
    content,
  });

  revalidatePath("/backlog");
}

/** 行動のバックログを1件削除する */
export async function deleteBacklogAction(formData: FormData) {
  const id = str(formData, "id");
  if (!id) return;
  await deleteBacklogEntry(id);
  revalidatePath("/backlog");
}

/**
 * タクシー / 口座 の 1 サービスの項目（ステータス・登録電話番号・登録メール）を
 * 更新する（インライン編集用）。
 */
export async function setServiceStatusAction(
  companyId: string,
  field: "taxi" | "accounts" | "taxi_phone" | "taxi_email",
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
