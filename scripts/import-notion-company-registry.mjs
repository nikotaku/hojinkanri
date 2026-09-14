import fs from "node:fs";
import path from "node:path";

function readOption(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : null;
}

function readResults(filePath) {
  if (!filePath) return [];
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(parsed.results)) {
    throw new Error(`${filePath} に results 配列がありません。`);
  }
  return parsed.results;
}

function cleanText(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<mention-page[^>]*>(.*?)<\/mention-page>/gi, "$1")
    .replace(/<mention-page[^>]*\/>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function toDate(value) {
  const text = cleanText(value);
  const ymd = text.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

  const iso = text.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }

  const era = text.match(/^(令和|平成|昭和)(\d+)年(\d{1,2})月(\d{1,2})日$/);
  if (era) {
    const base = { 令和: 2018, 平成: 1988, 昭和: 1925 }[era[1]];
    if (base) {
      return `${base + Number(era[2])}-${era[3].padStart(2, "0")}-${era[4].padStart(2, "0")}`;
    }
  }
  return null;
}

function toYen(value) {
  const text = cleanText(value).replace(/[，,\s]/g, "");
  const man = text.match(/^(\d+(?:\.\d+)?)万(?:円)?$/);
  if (man) return Math.round(Number(man[1]) * 10_000);
  const yen = text.match(/^(\d+(?:\.\d+)?)(?:円)?$/);
  if (yen) return Math.round(Number(yen[1]));
  return null;
}

function parseList(value) {
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (!trimmed.startsWith("[")) return [value];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [value];
  }
}

function attachmentSnapshot(value) {
  if (typeof value !== "string" || !value.startsWith("file://")) return null;
  try {
    const raw = decodeURIComponent(value.slice("file://".length));
    const parsed = JSON.parse(raw);
    const source = parsed.source ?? "";
    const filename = source.startsWith("attachment:")
      ? source.slice(source.lastIndexOf(":") + 1)
      : decodeURIComponent(source.split("/").pop() ?? "Notion添付ファイル");
    return {
      kind: "Notion添付ファイル",
      file_name: filename,
      source_reference: source,
      migration_status: "参照情報を移行済み。Notion保護ファイルの実体は別途アップロードが必要。",
    };
  } catch {
    return {
      kind: "Notion添付ファイル",
      source_reference: value,
      migration_status: "参照情報を移行済み。Notion保護ファイルの実体は別途アップロードが必要。",
    };
  }
}

function stableKey(label) {
  return `notion_${Buffer.from(label).toString("base64url")}`;
}

const categoryByLabel = {
  "プロジェクト名": "基本・登記",
  "代表社員": "基本・登記",
  "会社法人番号": "基本・登記",
  "本店所在地": "基本・登記",
  "設立年月日": "基本・登記",
  "資本金": "基本・登記",
  "HP": "基本・登記",
  "HP 1": "基本・登記",
  "法人設立届": "基本・登記",
  "法人設立届出書": "書類",
  "履歴事項全部証明書": "書類",
  "定款": "書類",
  "印鑑証明": "書類",
  "役員名簿": "書類",
  "株主リスト": "書類",
  "決算書": "書類",
  "登記書類": "書類",
  "ロゴ&電子印影": "書類",
  "契約管理": "関連レコード",
  "法人買取名義人リスト": "関連レコード",
  "登録アドレス": "関連レコード",
  "申込時電話番号": "関連レコード",
  "📞 登録電話番号": "関連レコード",
  "登録メアド": "登録・連絡先",
  "登録メールアドレス": "登録・連絡先",
  "登録電話番号": "登録・連絡先",
  "電話": "登録・連絡先",
  " Google": "登録・連絡先",
  "タイミーアドレス": "登録・連絡先",
  "タイミー登録電話番号": "登録・連絡先",
  "bybit登録電話番号": "登録・連絡先",
  "OKコインメールアドレス": "登録・連絡先",
  "PW": "登録・連絡先",
  "タイミーPW": "登録・連絡先",
  "e-tax利用者識別番号": "登録・連絡先",
  "取引担当者": "登録・連絡先",
  "着金目標日": "基本・登記",
};

const directServiceLabels = new Set([
  "Amazonビジネス",
  "DiDi",
  "GMO",
  "GO ビジネス",
  "OKコインステータス",
  "Paid",
  "PayPay銀行",
  "S.RIDE",
  "UQ回線",
  "bybit",
  "docomo",
  "みずほ銀行 ",
  "エクスモバイル",
  "シェアフル",
  "タイミー登録",
  "ポーシャペイステータス",
  "三井住友銀行",
  "ﾜｲﾓﾊﾞ回線",
  "🟢シェアフル",
  "ステータス",
  "タスク",
  "原因",
  "架電確認",
]);

function categoryFor(label) {
  return categoryByLabel[label] ?? (directServiceLabels.has(label) ? "サービス・審査状況" : "その他");
}

function normalizedAtomicValue(raw, relationRecords) {
  const attachment = attachmentSnapshot(raw);
  if (attachment) return attachment;

  if (typeof raw === "string" && raw.startsWith("https://app.notion.com/")) {
    const related = relationRecords.get(raw);
    return related
      ? { kind: "関連レコード", title: related.title, data: related.data }
      : { kind: "関連レコード", source_reference: raw };
  }

  if (raw === "__YES__") return true;
  if (raw === "__NO__") return false;
  return typeof raw === "string" ? cleanText(raw) : raw;
}

function normalizedEntryValue(label, rawValue, relationRecords) {
  const isJsonList =
    typeof rawValue === "string" && rawValue.trim().startsWith("[");
  const values = parseList(rawValue);
  if (isJsonList || values.length > 1) {
    return values.map((value) => normalizedAtomicValue(value, relationRecords));
  }
  return normalizedAtomicValue(values[0] ?? rawValue, relationRecords);
}

function recordSnapshot(row, titleField) {
  const data = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "url" || key === titleField || value === "" || value == null) continue;
    if (key.endsWith(":is_datetime") && value === 0) continue;
    data[key.replace(/^date:(.*):start$/, "$1")] = normalizedEntryValue(key, value, new Map());
  }
  return { title: cleanText(row[titleField]) || "名称未設定", data };
}

function mergeMap(...maps) {
  return Object.assign({}, ...maps.filter((map) => Object.keys(map).length > 0));
}

function statusFromPaid(value) {
  const items = parseList(value).map((item) => cleanText(item));
  const statuses = new Set([
    "未着手", "書類準備中", "進行中", "申請済み", "審査中", "審査通過", "完了", "使用済み", "審査落ち", "中止",
  ]);
  return items.find((item) => statuses.has(item)) ?? null;
}

function paidServiceNames(value) {
  const statuses = new Set([
    "未着手", "書類準備中", "進行中", "申請済み", "審査中", "審査通過", "完了", "使用済み", "審査落ち", "中止",
  ]);
  return parseList(value)
    .map((item) => cleanText(item))
    .filter((item) => item && !statuses.has(item));
}

function sqlLiteral(value) {
  return JSON.stringify(value).replaceAll("$", "\\u0024");
}

const companyPath = readOption("companies");
const outputPath = readOption("output");
if (!companyPath || !outputPath) {
  throw new Error("Usage: node scripts/import-notion-company-registry.mjs --companies=export.json --contracts=contracts.json --buyers=buyers.json --masters=masters.json --output=/tmp/import.sql");
}

const companies = readResults(companyPath);
const relationRecords = new Map();
for (const [filePath, titleField] of [
  [readOption("contracts"), "ドメイン名"],
  [readOption("buyers"), "名前"],
  [readOption("masters"), "タイトル"],
]) {
  for (const row of readResults(filePath)) {
    if (typeof row.url === "string") relationRecords.set(row.url, recordSnapshot(row, titleField));
  }
}

const importedCompanies = companies.map((row) => {
  const name = cleanText(row["プロジェクト名"]);
  const taxi = mergeMap(
    row.DiDi ? { DiDi: cleanText(row.DiDi) } : {},
    row["S.RIDE"] ? { "S.RIDE": cleanText(row["S.RIDE"]) } : {},
    row["GO ビジネス"] ? { "GO ビジネス": cleanText(row["GO ビジネス"]) } : {},
  );
  const accounts = mergeMap(
    row["みずほ銀行 "] ? { "みずほ銀行": cleanText(row["みずほ銀行 "]) } : {},
    row["三井住友銀行"] ? { "三井住友銀行": cleanText(row["三井住友銀行"]) } : {},
    row["PayPay銀行"] ? { "PayPay銀行": cleanText(row["PayPay銀行"]) } : {},
    row.GMO ? { GMO: cleanText(row.GMO) } : {},
  );
  const mobile = mergeMap(
    row.docomo ? { "ドコモ": cleanText(row.docomo) } : {},
    row["UQ回線"] ? { UQ: parseList(row["UQ回線"]).map(cleanText).filter(Boolean).join(" / ") } : {},
    row["ﾜｲﾓﾊﾞ回線"] ? { "ワイモバイル": cleanText(row["ﾜｲﾓﾊﾞ回線"]) } : {},
  );
  const paidStatus = statusFromPaid(row.Paid);
  const billing = paidStatus ? { Paid: paidStatus } : {};
  const entries = [];
  for (const [label, rawValue] of Object.entries(row)) {
    if (
      label === "url" ||
      label.endsWith(":is_datetime") ||
      rawValue === "" ||
      rawValue == null
    ) {
      continue;
    }
    entries.push({
      property_key: stableKey(label),
      label: label.replace(/^date:(.*):start$/, "$1"),
      category: categoryFor(label.replace(/^date:(.*):start$/, "$1")),
      value: normalizedEntryValue(label, rawValue, relationRecords),
    });
  }
  return {
    name,
    representative_name: cleanText(row["代表社員"]) || null,
    corporate_number: cleanText(row["会社法人番号"]) || null,
    established_on: toDate(row["設立年月日"]),
    capital: toYen(row["資本金"]),
    incorporation_filing_status: cleanText(row["法人設立届"]) || null,
    payment_target_on: toDate(row["date:着金目標日:start"]),
    hp: cleanText(row.HP) || null,
    taxi,
    accounts,
    mobile,
    billing,
    paid_service_names: paidServiceNames(row.Paid),
    entries,
  };
});

const sql = `-- Generated from Notion 法人一覧. Do not commit the source export or this generated data file.\n
with imported_companies as (\n  select *\n  from jsonb_to_recordset($json$${sqlLiteral(importedCompanies)}$json$::jsonb) as item(\n    name text,\n    representative_name text,\n    corporate_number text,\n    established_on date,\n    capital numeric,\n    incorporation_filing_status text,\n    payment_target_on date,\n    hp text,\n    taxi jsonb,\n    accounts jsonb,\n    mobile jsonb,\n    billing jsonb,\n    paid_service_names jsonb,\n    entries jsonb\n  )\n)\nupdate public.companies as company\nset\n  representative_name = coalesce(nullif(imported.representative_name, ''), company.representative_name),\n  corporate_number = coalesce(nullif(imported.corporate_number, ''), company.corporate_number),\n  established_on = coalesce(imported.established_on, company.established_on),\n  capital = coalesce(imported.capital, company.capital),\n  incorporation_filing_status = coalesce(nullif(imported.incorporation_filing_status, ''), company.incorporation_filing_status),\n  payment_target_on = coalesce(imported.payment_target_on, company.payment_target_on),\n  hp = coalesce(nullif(imported.hp, ''), company.hp),\n  taxi = coalesce(company.taxi, '{}'::jsonb) || coalesce(imported.taxi, '{}'::jsonb),\n  accounts = coalesce(company.accounts, '{}'::jsonb) || coalesce(imported.accounts, '{}'::jsonb),\n  mobile = coalesce(company.mobile, '{}'::jsonb) || coalesce(imported.mobile, '{}'::jsonb),\n  billing = coalesce(company.billing, '{}'::jsonb) || coalesce(imported.billing, '{}'::jsonb)\nfrom imported_companies as imported\nwhere company.name = imported.name;\n\nwith imported_companies as (\n  select *\n  from jsonb_to_recordset($json$${sqlLiteral(importedCompanies)}$json$::jsonb) as item(\n    name text,\n    representative_name text,\n    corporate_number text,\n    established_on date,\n    capital numeric,\n    incorporation_filing_status text,\n    payment_target_on date,\n    hp text,\n    taxi jsonb,\n    accounts jsonb,\n    mobile jsonb,\n    billing jsonb,\n    paid_service_names jsonb,\n    entries jsonb\n  )\n), expanded_entries as (\n  select company.id as company_id, entry->>'property_key' as property_key, entry->>'label' as label, entry->>'category' as category, entry->'value' as value\n  from imported_companies as imported\n  join public.companies as company on company.name = imported.name\n  cross join lateral jsonb_array_elements(imported.entries) as entry\n)\ninsert into public.company_registry_entries (company_id, property_key, label, category, value)\nselect company_id, property_key, label, category, value\nfrom expanded_entries\non conflict (company_id, property_key) do update\nset label = excluded.label, category = excluded.category, value = excluded.value;\n\nwith imported_companies as (\n  select *\n  from jsonb_to_recordset($json$${sqlLiteral(importedCompanies)}$json$::jsonb) as item(\n    name text,\n    representative_name text,\n    corporate_number text,\n    established_on date,\n    capital numeric,\n    incorporation_filing_status text,\n    payment_target_on date,\n    hp text,\n    taxi jsonb,\n    accounts jsonb,\n    mobile jsonb,\n    billing jsonb,\n    paid_service_names jsonb,\n    entries jsonb\n  )\n), paid_usage as (\n  select company.id as company_id, service_name\n  from imported_companies as imported\n  join public.companies as company on company.name = imported.name\n  cross join lateral jsonb_array_elements_text(imported.paid_service_names) as service_name\n  where length(trim(service_name)) > 0\n)\ninsert into public.billing_usage_details (company_id, service, usage_name)\nselect company_id, 'Paid', service_name\nfrom paid_usage\nwhere not exists (\n  select 1\n  from public.billing_usage_details as detail\n  where detail.company_id = paid_usage.company_id\n    and detail.service = 'Paid'\n    and detail.usage_name = paid_usage.service_name\n);\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sql);
console.log(JSON.stringify({ companies: importedCompanies.length, registryEntries: importedCompanies.reduce((sum, company) => sum + company.entries.length, 0), outputPath }, null, 2));
