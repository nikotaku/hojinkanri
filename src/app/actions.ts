"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCompany,
  deleteCompany,
  createCase,
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
  type ServiceField,
} from "@/lib/data";
import type {
  CompanyStatus,
  CaseStatus,
  CasePriority,
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
  field: ServiceField,
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
