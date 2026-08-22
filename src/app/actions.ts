"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCase,
  createCaseBacklog,
  createCaseTask,
  createCompany,
  setCaseTaskCompleted,
} from "@/lib/data";
import type {
  CasePriority,
  CaseStatus,
  CompanyStatus,
} from "@/lib/types";

function str(form: FormData, key: string): string | null {
  const value = form.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function casePath(caseId: string): string {
  return `/cases/${caseId}`;
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

  const caseItem = await createCase({
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
  revalidatePath(`/companies/${companyId}`);
  redirect(casePath(caseItem.id));
}

export async function createCaseTaskAction(formData: FormData) {
  const caseId = str(formData, "case_id");
  const title = str(formData, "title");
  if (!caseId) throw new Error("案件を特定できませんでした。");
  if (!title) throw new Error("小タスク名は必須です。");

  await createCaseTask({
    case_id: caseId,
    title,
    due_date: str(formData, "due_date"),
  });

  revalidatePath(casePath(caseId));
  revalidatePath("/cases");
}

export async function toggleCaseTaskAction(formData: FormData) {
  const caseId = str(formData, "case_id");
  const taskId = str(formData, "task_id");
  const isCompleted = str(formData, "is_completed") === "true";
  if (!caseId || !taskId) throw new Error("小タスクを特定できませんでした。");

  await setCaseTaskCompleted(taskId, isCompleted);

  revalidatePath(casePath(caseId));
  revalidatePath("/cases");
}

export async function createCaseBacklogAction(formData: FormData) {
  const caseId = str(formData, "case_id");
  const title = str(formData, "title");
  if (!caseId) throw new Error("案件を特定できませんでした。");
  if (!title) throw new Error("バックログの件名は必須です。");

  await createCaseBacklog({
    case_id: caseId,
    title,
    content: str(formData, "content"),
  });

  revalidatePath(casePath(caseId));
}
