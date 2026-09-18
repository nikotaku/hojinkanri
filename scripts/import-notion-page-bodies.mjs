import fs from "node:fs";
import path from "node:path";

function readOption(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : null;
}

function cleanContent(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<empty-block\s*\/>/g, "")
    .replace(/<content>|<\/content>/g, "")
    .trim();
}

function textFromPageContent(pageContent) {
  if (typeof pageContent === "string") return cleanContent(pageContent);
  if (!pageContent || typeof pageContent !== "object") return "";

  const record = pageContent;
  for (const key of ["text", "content_markdown", "content", "raw"]) {
    if (typeof record[key] === "string") return cleanContent(record[key]);
  }
  if (Array.isArray(record.blocks)) {
    return record.blocks
      .map((block) => (typeof block === "string" ? block : ""))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function databaseNames(databases) {
  if (!Array.isArray(databases)) return [];
  return databases
    .map((database) => {
      if (!database || typeof database !== "object") return null;
      const record = database;
      return [record.database_title, record.title, record.name].find(
        (value) => typeof value === "string" && value.trim(),
      ) ?? null;
    })
    .filter(Boolean);
}

function normalizedBodyRecords(records) {
  if (!Array.isArray(records)) return [];
  return records.map((record) => {
    if (!record || typeof record !== "object") return record;
    return Object.fromEntries(
      Object.entries(record).filter(([key]) => key !== "url" && key !== "data_source_url" && key !== "table" && key !== "row_page_fetch_text" && key !== "content"),
    );
  });
}

function sqlLiteral(value) {
  return JSON.stringify(value).replaceAll("$", "\\u0024");
}

const inputDirectory = readOption("input-dir");
const outputPath = readOption("output");
if (!inputDirectory || !outputPath) {
  throw new Error("Usage: node scripts/import-notion-page-bodies.mjs --input-dir=.notion-page-export --output=/tmp/page-bodies.sql");
}

const snapshots = fs
  .readdirSync(inputDirectory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => JSON.parse(fs.readFileSync(path.join(inputDirectory, file), "utf8")))
  .map((page) => {
    const content = textFromPageContent(page.page_content);
    const embeddedDatabases = databaseNames(page.embedded_data_sources);
    const bodyRecords = normalizedBodyRecords(page.body_records);
    return {
      company_name: page.company,
      property_key: "notion_page_body",
      label: "ページ本文・埋め込みデータ",
      category: "ページ本文・埋め込みデータ",
      value: {
        kind: "ページ本文",
        content,
        embedded_databases: embeddedDatabases,
        body_records: bodyRecords,
      },
    };
  })
  .filter((snapshot) => snapshot.value.content || snapshot.value.embedded_databases.length || snapshot.value.body_records.length);

const sql = `-- Generated from Notion法人ページ本文. Do not commit the source exports or generated SQL.\nwith page_snapshots as (\n  select *\n  from jsonb_to_recordset($json$${sqlLiteral(snapshots)}$json$::jsonb) as item(\n    company_name text,\n    property_key text,\n    label text,\n    category text,\n    value jsonb\n  )\n)\ninsert into public.company_registry_entries (company_id, property_key, label, category, value)\nselect company.id, snapshot.property_key, snapshot.label, snapshot.category, snapshot.value\nfrom page_snapshots as snapshot\njoin public.companies as company on company.name = snapshot.company_name\non conflict (company_id, property_key) do update\nset label = excluded.label, category = excluded.category, value = excluded.value;\n`;

fs.writeFileSync(outputPath, sql);
console.log(JSON.stringify({ snapshots: snapshots.length, bodyRecords: snapshots.reduce((sum, snapshot) => sum + snapshot.value.body_records.length, 0), outputPath }, null, 2));
