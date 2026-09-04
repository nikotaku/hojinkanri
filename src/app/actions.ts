"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCompany,
  deleteCompany,
  createCase,
  createCaseTasks,
  setCaseTaskCompleted,
  setCompanyService,
  setCompanyHp,
  saveToukiImage,
  reorderCompanies,
  createBacklogEntry,
  deleteBacklogEntry,
  createContact,
  deleteContact,
  saveMeishiImageFile,
  saveMeishiImageDataUrl,
  deleteMeishiImage,
  createCrowPartner,
  deleteCrowPartner,
  createCrowContract,
  deleteCrowContract,
  createCrowStore,
  deleteCrowStore,
  createMobileContractDetail,
  updateMobileContractDetail,
  deleteMobileContractDetail,
  createNpBillingUsageDetail,
  updateNpBillingUsageDetail,
  createPaidServiceDetail,
  updatePaidServiceCredentials,
  deleteBillingUsageDetail,
  type ServiceField,
  type MobileContractField,
} from "@/lib/data";
import type {
  CompanyStatus,
  CaseStatus,
  CasePriority,
  MobileContractDetail,
  BillingUsageDetail,
} from "@/lib/types";

// --- crow 案件管理 ---

/** crow: 抱き合わせ営業依頼先を追加 */
export async function createCrowPartnerAction(formData: FormData) {
  const companyName = str(formData, "company_name");
  if (!companyName) throw new Error("会社名は必須です。");
  await createCrowPartner({
    company_name: companyName,
    contact_person: str(formData, "contact_person"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    conditions: str(formData, "conditions"),
    status: str(formData, "status") ?? "未打診",
    notes: str(formData, "notes"),
  });
  revalidatePath("/crow");
}

export async function deleteCrowPartnerAction(formData: FormData) {
  const id = str(formData, "id");
  if (id) await deleteCrowPartner(id);
  revalidatePath("/crow");
}

/** crow: サービスの契約を追加 */
export async function createCrowContractAction(formData: FormData) {
  const customerName = str(formData, "customer_name");
  if (!customerName) throw new Error("顧客名は必須です。");
  const feeRaw = str(formData, "monthly_fee");
  const fee = feeRaw ? Number(feeRaw.replace(/[,，]/g, "")) : null;
  await createCrowContract({
    customer_name: customerName,
    plan: str(formData, "plan"),
    status: str(formData, "status") ?? "商談中",
    monthly_fee: fee != null && !Number.isNaN(fee) ? fee : null,
    start_date: str(formData, "start_date"),
    notes: str(formData, "notes"),
  });
  revalidatePath("/crow");
}

export async function deleteCrowContractAction(formData: FormData) {
  const id = str(formData, "id");
  if (id) await deleteCrowContract(id);
  revalidatePath("/crow");
}

/** crow: 契約店舗を追加 */
export async function createCrowStoreAction(formData: FormData) {
  const storeName = str(formData, "store_name");
  if (!storeName) throw new Error("店舗名は必須です。");
  await createCrowStore({
    store_name: storeName,
    company_name: str(formData, "company_name"),
    address: str(formData, "address"),
    phone: str(formData, "phone"),
    start_date: str(formData, "start_date"),
    status: str(formData, "status") ?? "営業中",
    notes: str(formData, "notes"),
  });
  revalidatePath("/crow");
}

export async function deleteCrowStoreAction(formData: FormData) {
  const id = str(formData, "id");
  if (id) await deleteCrowStore(id);
  revalidatePath("/crow");
}

/** 名刺画像をアップロードして会社に紐づける */
export async function uploadMeishiImageAction(formData: FormData) {
  const companyId = str(formData, "company_id");
  const file = formData.get("file");
  if (!companyId) throw new Error("法人の選択は必須です。");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("画像ファイルを選択してください。");
  }
  await saveMeishiImageFile(companyId, str(formData, "label"), file);
  revalidatePath("/meishi-images");
}

/** 名刺作成で生成した名刺画像を保存する */
export async function saveMeishiFromMakerAction(
  companyId: string,
  label: string,
  dataUrl: string,
) {
  if (!companyId || !dataUrl) return;
  await saveMeishiImageDataUrl(companyId, label.trim() || null, dataUrl);
  revalidatePath("/meishi-images");
}

/** 名刺画像を削除する */
export async function deleteMeishiImageAction(formData: FormData) {
  const id = str(formData, "id");
  if (!id) return;
  await deleteMeishiImage(id);
  revalidatePath("/meishi-images");
}

/** 連絡先を1件追加する */
export async function createContactAction(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("名前は必須です。");
  await createContact({
    name,
    affiliation: str(formData, "affiliation"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    notes: str(formData, "notes"),
  });
  revalidatePath("/contacts");
}

/** 連絡先を1件削除する */
export async function deleteContactAction(formData: FormData) {
  const id = str(formData, "id");
  if (!id) return;
  await deleteContact(id);
  revalidatePath("/contacts");
}

/** 会社HPのURLを更新する（インライン編集用） */
export async function setCompanyHpAction(companyId: string, hp: string) {
  await setCompanyHp(companyId, hp);
  revalidatePath(`/companies/${companyId}`);
  revalidatePath("/companies");
}

/** 登記簿謄本の画像をアップロードする */
export async function uploadToukiAction(formData: FormData) {
  const companyId = str(formData, "company_id");
  const file = formData.get("file");
  if (!companyId || !(file instanceof File) || file.size === 0) return;
  await saveToukiImage(companyId, file);
  revalidatePath(`/companies/${companyId}`);
}

/** 会社の並び順を保存する（ドラッグ&ドロップ用） */
export async function reorderCompaniesAction(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  await reorderCompanies(ids);
  revalidatePath("/taxi");
  revalidatePath("/mobile");
  revalidatePath("/billing");
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
 * タクシー / モバイル回線 / 掛け払い / 口座の各項目を
 * 更新する（インライン編集用）。
 */
export async function setServiceStatusAction(
  companyId: string,
  field: ServiceField,
  service: string,
  value: string,
) {
  await setCompanyService(companyId, field, service, value);
  revalidatePath("/taxi");
  revalidatePath("/mobile");
  revalidatePath("/billing");
  revalidatePath("/accounts");
  revalidatePath(`/companies/${companyId}`);
}

/** モバイル回線に契約端末の入力行を追加する */
export async function createMobileContractDetailAction(
  companyId: string,
  service: string,
): Promise<MobileContractDetail> {
  const detail = await createMobileContractDetail(companyId, service);
  revalidatePath("/mobile");
  return detail;
}

/** 契約端末の機種・売却情報・担当者・契約日を更新する */
export async function updateMobileContractDetailAction(
  companyId: string,
  id: string,
  field: MobileContractField,
  value: string,
) {
  await updateMobileContractDetail(companyId, id, field, value);
  revalidatePath("/mobile");
}

/** モバイル回線の契約端末を削除する */
export async function deleteMobileContractDetailAction(
  companyId: string,
  id: string,
) {
  await deleteMobileContractDetail(companyId, id);
  revalidatePath("/mobile");
}

/** 掛け払いサービスの利用先・用途を追加する */
export async function createBillingUsageDetailAction(
  companyId: string,
  usageName: string,
): Promise<BillingUsageDetail> {
  const detail = await createNpBillingUsageDetail(companyId, usageName);
  revalidatePath("/billing");
  return detail;
}

/** 掛け払いサービスの利用先・用途を更新する */
export async function updateBillingUsageDetailAction(
  companyId: string,
  id: string,
  usageName: string,
) {
  await updateNpBillingUsageDetail(companyId, id, usageName);
  revalidatePath("/billing");
}

/** Paidの利用サービスとサービス側の管理画面情報をまとめて追加する */
export async function createPaidServiceDetailAction(
  companyId: string,
  usageName: string,
  adminUrl: string,
  loginId: string,
  loginPw: string,
): Promise<BillingUsageDetail> {
  const detail = await createPaidServiceDetail(
    companyId,
    usageName,
    adminUrl,
    loginId,
    loginPw,
  );
  revalidatePath("/billing");
  return detail;
}

/** Paid利用サービス側の管理画面URL・ログインID・PWをまとめて更新する */
export async function updatePaidServiceCredentialsAction(
  companyId: string,
  id: string,
  adminUrl: string,
  loginId: string,
  loginPw: string,
) {
  await updatePaidServiceCredentials(companyId, id, adminUrl, loginId, loginPw);
  revalidatePath("/billing");
}

/** 掛け払いサービスの利用先・用途を削除する */
export async function deleteBillingUsageDetailAction(
  companyId: string,
  id: string,
  service: string,
) {
  await deleteBillingUsageDetail(companyId, id, service);
  revalidatePath("/billing");
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
  const capitalRaw = str(formData, "capital");
  const capital = capitalRaw
    ? Number(capitalRaw.replace(/[,，]/g, ""))
    : null;

  const company = await createCompany({
    name,
    name_kana: str(formData, "name_kana"),
    industry: str(formData, "industry"),
    contact_person: str(formData, "contact_person"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    address: str(formData, "address"),
    representative_name: str(formData, "representative_name"),
    established_on: str(formData, "established_on"),
    capital: capital != null && Number.isFinite(capital) ? capital : null,
    hp: str(formData, "hp"),
    status: (str(formData, "status") as CompanyStatus) ?? "prospect",
    notes: str(formData, "notes"),
  });

  revalidatePath("/companies");
  revalidatePath("/");
  redirect(`/companies/${company.id}`);
}

/** 法人と紐づく案件・名刺画像を削除する */
export async function deleteCompanyAction(formData: FormData) {
  const id = str(formData, "id");
  if (!id) throw new Error("削除対象の法人が指定されていません。");

  await deleteCompany(id);

  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath("/cases");
  revalidatePath("/taxi");
  revalidatePath("/mobile");
  revalidatePath("/billing");
  revalidatePath("/accounts");
  revalidatePath("/meishi");
  revalidatePath("/meishi-images");
}

export async function createCaseAction(formData: FormData) {
  const title = str(formData, "title");
  const companyId = str(formData, "company_id");
  if (!title) throw new Error("案件名は必須です。");

  const amountRaw = str(formData, "amount");
  const amount = amountRaw ? Number(amountRaw.replace(/[,，]/g, "")) : null;

  const newCase = await createCase({
    company_id: companyId,
    title,
    description: str(formData, "description"),
    status: (str(formData, "status") as CaseStatus) ?? "new",
    priority: (str(formData, "priority") as CasePriority) ?? "medium",
    assignee: str(formData, "assignee"),
    amount: amount != null && !Number.isNaN(amount) ? amount : null,
    due_date: str(formData, "due_date"),
  });

  const subtasks = (str(formData, "subtasks") ?? "")
    .split(/\r?\n/)
    .map((task) => task.trim())
    .filter(Boolean);
  await createCaseTasks(newCase.id, subtasks);

  revalidatePath("/cases");
  revalidatePath("/");
  redirect("/cases");
}

/** 既存案件に小タスクを追加する */
export async function createCaseTaskAction(formData: FormData) {
  const caseId = str(formData, "case_id");
  const title = str(formData, "title");
  if (!caseId || !title) return;
  await createCaseTasks(caseId, [title]);
  revalidatePath("/cases");
}

/** 小タスクの完了・未完了を切り替える */
export async function toggleCaseTaskAction(formData: FormData) {
  const caseId = str(formData, "case_id");
  const taskId = str(formData, "task_id");
  if (!caseId || !taskId) return;
  await setCaseTaskCompleted(
    caseId,
    taskId,
    str(formData, "is_completed") === "true",
  );
  revalidatePath("/cases");
}
