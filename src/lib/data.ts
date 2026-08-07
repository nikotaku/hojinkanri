import { getSupabase } from "./supabase";
import { getMockDb } from "./mock-store";
import {
  type Company,
  type Case,
  type CaseWithCompany,
  type CompanyStatus,
  type CaseStatus,
  type CasePriority,
  type BacklogEntry,
  type Contact,
  type CrowPartner,
  type CrowContract,
  type CrowStore,
  type MeishiImage,
  type MeishiImageWithCompany,
  type MobileContractDetail,
  MOBILE_SERVICES,
  OPEN_CASE_STATUSES,
} from "./types";

// データアクセス層。Supabase が設定されていれば Supabase を、
// 未設定ならインメモリのサンプルデータを使う。UI 側はこの関数群のみを呼ぶ。

export interface CompanyInput {
  name: string;
  name_kana?: string | null;
  industry?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  representative_name?: string | null;
  established_on?: string | null;
  capital?: number | null;
  hp?: string | null;
  status: CompanyStatus;
  notes?: string | null;
}

export interface CaseInput {
  company_id?: string | null;
  title: string;
  description?: string | null;
  status: CaseStatus;
  priority: CasePriority;
  assignee?: string | null;
  amount?: number | null;
  due_date?: string | null;
}

function nowIso(): string {
  return new Date().toISOString();
}

// --- 法人 ---

function compareCompanies(a: Company, b: Company): number {
  const ao = a.sort_order ?? null;
  const bo = b.sort_order ?? null;
  if (ao != null && bo != null && ao !== bo) return ao - bo;
  if (ao != null && bo == null) return -1;
  if (ao == null && bo != null) return 1;
  return b.created_at.localeCompare(a.created_at);
}

export async function listCompanies(): Promise<Company[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Company[];
  }
  return [...getMockDb().companies].sort(compareCompanies);
}

/** モバイル回線ページ用に、各法人の契約端末もまとめて取得する */
export async function listCompaniesWithMobileContracts(): Promise<Company[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .select("*, mobile_contract_details(*)")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as Company[]).map((company) => ({
      ...company,
      mobile_contract_details: [
        ...(company.mobile_contract_details ?? []),
      ].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    }));
  }

  const db = getMockDb();
  return [...db.companies].sort(compareCompanies).map((company) => ({
    ...company,
    mobile_contract_details: db.mobileContracts
      .filter((detail) => detail.company_id === company.id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at)),
  }));
}

/** 会社HPのURLを更新する */
export async function setCompanyHp(id: string, hp: string): Promise<void> {
  const supabase = getSupabase();
  const value = hp.trim() || null;
  if (supabase) {
    const { error } = await supabase
      .from("companies")
      .update({ hp: value })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const c = getMockDb().companies.find((x) => x.id === id);
  if (c) c.hp = value;
}

/** 登記簿謄本の画像を保存し、公開URLを会社に紐づける */
export async function saveToukiImage(
  companyId: string,
  file: File,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${companyId}/touki-${Date.now()}.${ext}`;
    const buf = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from("touki")
      .upload(path, buf, { upsert: true, contentType: file.type });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("touki").getPublicUrl(path);
    const { error: upErr } = await supabase
      .from("companies")
      .update({ touki_url: data.publicUrl })
      .eq("id", companyId);
    if (upErr) throw new Error(upErr.message);
    return;
  }
  // モック: データURLとして保持（プロセス内のみ）
  const buf = Buffer.from(await file.arrayBuffer());
  const url = `data:${file.type};base64,${buf.toString("base64")}`;
  const c = getMockDb().companies.find((x) => x.id === companyId);
  if (c) c.touki_url = url;
}

/** 会社の並び順を id の配列順に保存する（ドラッグ&ドロップ用） */
export async function reorderCompanies(ids: string[]): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await Promise.all(
      ids.map((id, index) =>
        supabase
          .from("companies")
          .update({ sort_order: index + 1 })
          .eq("id", id),
      ),
    );
    return;
  }
  const db = getMockDb();
  ids.forEach((id, index) => {
    const c = db.companies.find((x) => x.id === id);
    if (c) c.sort_order = index + 1;
  });
}

export async function getCompany(id: string): Promise<Company | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Company) ?? null;
  }
  return getMockDb().companies.find((c) => c.id === id) ?? null;
}

export async function createCompany(input: CompanyInput): Promise<Company> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Company;
  }
  const db = getMockDb();
  const ts = nowIso();
  const company: Company = {
    id: crypto.randomUUID(),
    name: input.name,
    name_kana: input.name_kana ?? null,
    industry: input.industry ?? null,
    contact_person: input.contact_person ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    address: input.address ?? null,
    representative_name: input.representative_name ?? null,
    established_on: input.established_on ?? null,
    capital: input.capital ?? null,
    hp: input.hp ?? null,
    status: input.status,
    notes: input.notes ?? null,
    created_at: ts,
    updated_at: ts,
  };
  db.companies.push(company);
  return company;
}

function getStoragePathFromPublicUrl(
  url: string | null | undefined,
  bucket: string,
): string | null {
  if (!url) return null;
  const marker = `/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  return index >= 0
    ? decodeURIComponent(url.slice(index + marker.length))
    : null;
}

async function removeStorageFiles(
  bucket: string,
  paths: Array<string | null>,
): Promise<void> {
  const supabase = getSupabase();
  const targets = paths.filter((path): path is string => Boolean(path));
  if (!supabase || targets.length === 0) return;

  const { error } = await supabase.storage.from(bucket).remove(targets);
  if (error) {
    // 法人データの削除は完了済みなので、画面上の削除を失敗扱いにしない。
    // ストレージ上の孤立ファイルはログから追跡できるようにする。
    console.error(`Failed to remove ${bucket} files:`, error.message);
  }
}

/**
 * 法人を削除する。
 * Supabase では関連する案件・名刺画像レコードは外部キーで連動削除される。
 * レコード削除後、Storage 上の登記簿・名刺画像も削除する。
 */
export async function deleteCompany(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const [{ data: company, error: companyError }, { data: images, error: imagesError }] =
      await Promise.all([
        supabase
          .from("companies")
          .select("touki_url")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("meishi_images")
          .select("image_url")
          .eq("company_id", id),
      ]);

    if (companyError) throw new Error(companyError.message);
    if (imagesError) throw new Error(imagesError.message);
    if (!company) throw new Error("削除対象の法人が見つかりません。");

    const { data: deleted, error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (deleteError) throw new Error(deleteError.message);
    if (!deleted) throw new Error("法人を削除できませんでした。");

    await Promise.all([
      removeStorageFiles("touki", [
        getStoragePathFromPublicUrl(
          (company as { touki_url?: string | null }).touki_url,
          "touki",
        ),
      ]),
      removeStorageFiles(
        "meishi",
        ((images as Array<{ image_url?: string }> | null) ?? []).map((image) =>
          getStoragePathFromPublicUrl(image.image_url, "meishi"),
        ),
      ),
    ]);
    return;
  }

  const db = getMockDb();
  const exists = db.companies.some((company) => company.id === id);
  if (!exists) throw new Error("削除対象の法人が見つかりません。");
  db.companies = db.companies.filter((company) => company.id !== id);
  db.cases = db.cases.filter((item) => item.company_id !== id);
  db.meishiImages = db.meishiImages.filter((image) => image.company_id !== id);
}

/**
 * 会社の taxi / accounts (jsonb) の 1 サービスのステータスを更新する。
 * value が空文字なら該当キーを削除する。
 */
export type ServiceField =
  | "taxi"
  | "accounts"
  | "taxi_phone"
  | "taxi_email"
  | "taxi_name"
  | "taxi_admin_url"
  | "taxi_login_id"
  | "taxi_login_pw"
  | "mobile"
  | "mobile_phone"
  | "mobile_email"
  | "mobile_name"
  | "mobile_admin_url"
  | "mobile_login_id"
  | "mobile_login_pw";

export async function setCompanyService(
  id: string,
  field: ServiceField,
  service: string,
  value: string,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .select(field)
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    const map: Record<string, string> = {
      ...(((data as Record<string, unknown>)?.[field] as Record<
        string,
        string
      >) ?? {}),
    };
    if (value) map[service] = value;
    else delete map[service];
    const { error: upErr } = await supabase
      .from("companies")
      .update({ [field]: map })
      .eq("id", id);
    if (upErr) throw new Error(upErr.message);
    return;
  }
  const company = getMockDb().companies.find((c) => c.id === id);
  if (!company) return;
  const map: Record<string, string> = { ...(company[field] ?? {}) };
  if (value) map[service] = value;
  else delete map[service];
  company[field] = map;
}

// --- 法人モバイル回線の契約端末 ---

export type MobileContractField =
  | "device_model"
  | "sale_price"
  | "sale_destination"
  | "contract_person"
  | "contracted_on";

function assertMobileService(
  service: string,
): asserts service is MobileContractDetail["service"] {
  if (!MOBILE_SERVICES.includes(service as MobileContractDetail["service"])) {
    throw new Error("対象の回線を確認できませんでした。");
  }
}

/** 契約端末の入力行を1件追加する */
export async function createMobileContractDetail(
  companyId: string,
  service: string,
): Promise<MobileContractDetail> {
  assertMobileService(service);
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("mobile_contract_details")
      .insert({ company_id: companyId, service })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as MobileContractDetail;
  }

  const ts = nowIso();
  const detail: MobileContractDetail = {
    id: crypto.randomUUID(),
    company_id: companyId,
    service,
    device_model: null,
    sale_price: null,
    sale_destination: null,
    contract_person: null,
    contracted_on: null,
    created_at: ts,
    updated_at: ts,
  };
  getMockDb().mobileContracts.push(detail);
  return detail;
}

/** 契約端末の機種・売却情報・担当者・契約日のいずれかを更新する */
export async function updateMobileContractDetail(
  companyId: string,
  id: string,
  field: MobileContractField,
  value: string,
): Promise<void> {
  const trimmed = value.trim();
  if (
    field === "contracted_on" &&
    trimmed &&
    !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)
  ) {
    throw new Error("契約日を正しい形式で入力してください。");
  }
  let safeValue: string | number | null;
  if (field === "sale_price") {
    if (!trimmed) {
      safeValue = null;
    } else if (!/^\d+$/.test(trimmed)) {
      throw new Error("売却価格は0円以上の整数で入力してください。");
    } else {
      const price = Number(trimmed);
      if (!Number.isSafeInteger(price)) {
        throw new Error("売却価格が大きすぎます。");
      }
      safeValue = price;
    }
  } else {
    safeValue = trimmed ? trimmed.slice(0, 120) : null;
  }
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("mobile_contract_details")
      .update({ [field]: safeValue })
      .eq("id", id)
      .eq("company_id", companyId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("契約端末が見つかりませんでした。");
    return;
  }

  const detail = getMockDb().mobileContracts.find(
    (item) => item.id === id && item.company_id === companyId,
  );
  if (!detail) throw new Error("契約端末が見つかりませんでした。");
  if (field === "sale_price") {
    detail.sale_price = safeValue as number | null;
  } else {
    detail[field] = safeValue as string | null;
  }
  detail.updated_at = nowIso();
}

/** 契約端末の入力行を1件削除する */
export async function deleteMobileContractDetail(
  companyId: string,
  id: string,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("mobile_contract_details")
      .delete()
      .eq("id", id)
      .eq("company_id", companyId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("契約端末が見つかりませんでした。");
    return;
  }

  const db = getMockDb();
  const before = db.mobileContracts.length;
  db.mobileContracts = db.mobileContracts.filter(
    (item) => !(item.id === id && item.company_id === companyId),
  );
  if (db.mobileContracts.length === before) {
    throw new Error("契約端末が見つかりませんでした。");
  }
}

// --- 案件 ---

export async function listCases(): Promise<CaseWithCompany[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("cases")
      .select("*, companies(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as (Case & { companies: { name: string } | null })[]).map(
      ({ companies, ...rest }) => ({
        ...rest,
        company_name: companies?.name ?? "—",
      }),
    );
  }
  const db = getMockDb();
  const byId = new Map(db.companies.map((c) => [c.id, c.name]));
  return [...db.cases]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((c) => ({
      ...c,
      company_name: (c.company_id && byId.get(c.company_id)) || "—",
    }));
}

export async function getCasesByCompany(companyId: string): Promise<Case[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Case[];
  }
  return getMockDb()
    .cases.filter((c) => c.company_id === companyId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createCase(input: CaseInput): Promise<Case> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("cases")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Case;
  }
  const db = getMockDb();
  const ts = nowIso();
  const newCase: Case = {
    id: crypto.randomUUID(),
    company_id: input.company_id ?? null,
    title: input.title,
    description: input.description ?? null,
    status: input.status,
    priority: input.priority,
    assignee: input.assignee ?? null,
    amount: input.amount ?? null,
    due_date: input.due_date ?? null,
    created_at: ts,
    updated_at: ts,
  };
  db.cases.push(newCase);
  return newCase;
}

// --- crow 案件管理 ---

// 3テーブル(営業依頼先/契約状況/契約店舗)共通の CRUD ヘルパー
type CrowTable = "crow_partners" | "crow_contracts" | "crow_stores";

async function crowList<T>(table: CrowTable, mockKey: keyof MockCrow): Promise<T[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as T[];
  }
  const rows = getMockDb().crow[mockKey] as unknown as { created_at: string }[];
  return [...rows].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  ) as T[];
}

async function crowInsert(
  table: CrowTable,
  mockKey: keyof MockCrow,
  row: Record<string, unknown>,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from(table).insert(row);
    if (error) throw new Error(error.message);
    return;
  }
  (getMockDb().crow[mockKey] as unknown as Record<string, unknown>[]).push({
    id: crypto.randomUUID(),
    created_at: nowIso(),
    ...row,
  });
}

async function crowDelete(
  table: CrowTable,
  mockKey: keyof MockCrow,
  id: string,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = getMockDb();
  db.crow[mockKey] = (
    db.crow[mockKey] as unknown as { id: string }[]
  ).filter((r) => r.id !== id) as never;
}

export interface MockCrow {
  partners: CrowPartner[];
  contracts: CrowContract[];
  stores: CrowStore[];
}

export const listCrowPartners = () =>
  crowList<CrowPartner>("crow_partners", "partners");
export const createCrowPartner = (row: Record<string, unknown>) =>
  crowInsert("crow_partners", "partners", row);
export const deleteCrowPartner = (id: string) =>
  crowDelete("crow_partners", "partners", id);

export const listCrowContracts = () =>
  crowList<CrowContract>("crow_contracts", "contracts");
export const createCrowContract = (row: Record<string, unknown>) =>
  crowInsert("crow_contracts", "contracts", row);
export const deleteCrowContract = (id: string) =>
  crowDelete("crow_contracts", "contracts", id);

export const listCrowStores = () =>
  crowList<CrowStore>("crow_stores", "stores");
export const createCrowStore = (row: Record<string, unknown>) =>
  crowInsert("crow_stores", "stores", row);
export const deleteCrowStore = (id: string) =>
  crowDelete("crow_stores", "stores", id);

// --- 名刺画像管理 ---

export async function listMeishiImages(): Promise<MeishiImageWithCompany[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("meishi_images")
      .select("*, companies(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (
      data as (MeishiImage & { companies: { name: string } | null })[]
    ).map(({ companies, ...rest }) => ({
      ...rest,
      company_name: companies?.name ?? "—",
    }));
  }
  const db = getMockDb();
  const byId = new Map(db.companies.map((c) => [c.id, c.name]));
  return [...db.meishiImages]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((m) => ({ ...m, company_name: byId.get(m.company_id) ?? "—" }));
}

async function insertMeishiImage(
  companyId: string,
  label: string | null,
  imageUrl: string,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase
      .from("meishi_images")
      .insert({ company_id: companyId, label, image_url: imageUrl });
    if (error) throw new Error(error.message);
    return;
  }
  getMockDb().meishiImages.push({
    id: crypto.randomUUID(),
    company_id: companyId,
    label,
    image_url: imageUrl,
    created_at: nowIso(),
  });
}

/** 名刺画像(ファイル)をアップロードして会社に紐づける */
export async function saveMeishiImageFile(
  companyId: string,
  label: string | null,
  file: File,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${companyId}/meishi-${Date.now()}.${ext}`;
    const buf = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from("meishi")
      .upload(path, buf, { upsert: true, contentType: file.type });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("meishi").getPublicUrl(path);
    await insertMeishiImage(companyId, label, data.publicUrl);
    return;
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const url = `data:${file.type};base64,${buf.toString("base64")}`;
  await insertMeishiImage(companyId, label, url);
}

/** 名刺作成で生成したデータURL画像を保存して会社に紐づける */
export async function saveMeishiImageDataUrl(
  companyId: string,
  label: string | null,
  dataUrl: string,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const m = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!m) throw new Error("画像データの形式が不正です。");
    const [, contentType, base64] = m;
    const ext = contentType.split("/")[1] ?? "png";
    const path = `${companyId}/meishi-${Date.now()}.${ext}`;
    const buf = Buffer.from(base64, "base64");
    const { error } = await supabase.storage
      .from("meishi")
      .upload(path, buf, { upsert: true, contentType });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("meishi").getPublicUrl(path);
    await insertMeishiImage(companyId, label, data.publicUrl);
    return;
  }
  await insertMeishiImage(companyId, label, dataUrl);
}

/** 名刺画像を削除する（ストレージ上のファイルも削除を試みる） */
export async function deleteMeishiImage(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("meishi_images")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const { error: delErr } = await supabase
      .from("meishi_images")
      .delete()
      .eq("id", id);
    if (delErr) throw new Error(delErr.message);
    const url = (data as { image_url?: string } | null)?.image_url;
    const marker = "/object/public/meishi/";
    const idx = url?.indexOf(marker) ?? -1;
    if (url && idx >= 0) {
      const path = decodeURIComponent(url.slice(idx + marker.length));
      await supabase.storage.from("meishi").remove([path]);
    }
    return;
  }
  const db = getMockDb();
  db.meishiImages = db.meishiImages.filter((m) => m.id !== id);
}

// --- 連絡先 ---

export interface ContactInput {
  name: string;
  affiliation?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export async function listContacts(): Promise<Contact[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Contact[];
  }
  return [...getMockDb().contacts].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

export async function createContact(input: ContactInput): Promise<Contact> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("contacts")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Contact;
  }
  const db = getMockDb();
  const contact: Contact = {
    id: crypto.randomUUID(),
    name: input.name,
    affiliation: input.affiliation ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    notes: input.notes ?? null,
    created_at: nowIso(),
  };
  db.contacts.push(contact);
  return contact;
}

export async function deleteContact(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = getMockDb();
  db.contacts = db.contacts.filter((c) => c.id !== id);
}

// --- 行動のバックログ ---

export interface BacklogInput {
  entry_date: string;
  tag?: string | null;
  content: string;
}

export async function listBacklog(): Promise<BacklogEntry[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("backlog")
      .select("*")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as BacklogEntry[];
  }
  return [...getMockDb().backlog].sort((a, b) => {
    const d = b.entry_date.localeCompare(a.entry_date);
    return d !== 0 ? d : b.created_at.localeCompare(a.created_at);
  });
}

export async function createBacklogEntry(
  input: BacklogInput,
): Promise<BacklogEntry> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("backlog")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as BacklogEntry;
  }
  const db = getMockDb();
  const entry: BacklogEntry = {
    id: crypto.randomUUID(),
    entry_date: input.entry_date,
    tag: input.tag ?? null,
    content: input.content,
    created_at: nowIso(),
  };
  db.backlog.push(entry);
  return entry;
}

export async function deleteBacklogEntry(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("backlog").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = getMockDb();
  db.backlog = db.backlog.filter((e) => e.id !== id);
}

// --- ダッシュボード集計 ---

export interface DashboardStats {
  companyCount: number;
  activeCompanyCount: number;
  openCaseCount: number;
  openAmountTotal: number;
  casesByStatus: Record<CaseStatus, number>;
  upcomingCases: CaseWithCompany[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [companies, cases] = await Promise.all([listCompanies(), listCases()]);

  const casesByStatus = {
    new: 0,
    in_progress: 0,
    on_hold: 0,
    done: 0,
    lost: 0,
  } as Record<CaseStatus, number>;
  for (const c of cases) casesByStatus[c.status] += 1;

  const openCases = cases.filter((c) => OPEN_CASE_STATUSES.includes(c.status));
  const openAmountTotal = openCases.reduce((sum, c) => sum + (c.amount ?? 0), 0);

  const upcomingCases = openCases
    .filter((c) => c.due_date)
    .sort((a, b) => (a.due_date as string).localeCompare(b.due_date as string))
    .slice(0, 5);

  return {
    companyCount: companies.length,
    activeCompanyCount: companies.filter((c) => c.status === "active").length,
    openCaseCount: openCases.length,
    openAmountTotal,
    casesByStatus,
    upcomingCases,
  };
}
