"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Company } from "@/lib/types";
import { Field, TextInput, Select } from "@/components/Form";

// 名刺サイズ 91mm x 55mm を 300dpi 相当で描画
const CARD_W = 1075;
const CARD_H = 650;

interface MeishiData {
  companyName: string;
  personName: string;
  personTitle: string;
  address: string;
  phone: string;
  email: string;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let current = "";
  for (const ch of text) {
    if (ctx.measureText(current + ch).width > maxWidth && current !== "") {
      lines.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawMeishi(canvas: HTMLCanvasElement, d: MeishiData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 背景
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // 左のブランドアクセント
  ctx.fillStyle = "#1d4ed8";
  ctx.fillRect(0, 0, 14, CARD_H);

  // 会社名（上部）
  ctx.fillStyle = "#111827";
  ctx.font = "bold 44px 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText(d.companyName, 70, 70, CARD_W - 140);

  // 会社名の下の罫線
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 140);
  ctx.lineTo(CARD_W - 70, 140);
  ctx.stroke();

  // 役職（氏名の上・小さめ）
  let nameY = 250;
  if (d.personTitle) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "28px 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif";
    ctx.fillText(d.personTitle, 74, 210);
    nameY = 250;
  }

  // 氏名（大きく）
  ctx.fillStyle = "#111827";
  ctx.font = "bold 76px 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif";
  ctx.fillText(d.personName || "（担当者名）", 70, nameY, CARD_W - 140);

  // 連絡先（下部）
  ctx.font = "26px 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif";
  ctx.fillStyle = "#374151";
  let y = CARD_H - 190;
  const lineH = 40;

  if (d.address) {
    const lines = wrapText(ctx, d.address, CARD_W - 160);
    for (const line of lines.slice(0, 2)) {
      ctx.fillText(line, 70, y);
      y += lineH;
    }
  }
  const contact: string[] = [];
  if (d.phone) contact.push(`TEL: ${d.phone}`);
  if (d.email) contact.push(`Email: ${d.email}`);
  if (contact.length) {
    ctx.fillText(contact.join("　"), 70, y);
  }
}

export function MeishiMaker({ companies }: { companies: Company[] }) {
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [personName, setPersonName] = useState("");
  const [personTitle, setPersonTitle] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  const company = useMemo(
    () => companies.find((c) => c.id === companyId) ?? null,
    [companies, companyId],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !company) return;
    drawMeishi(canvas, {
      companyName: company.name,
      personName,
      personTitle,
      address: company.address ?? "",
      phone: company.phone ?? "",
      email: company.email ?? "",
    });
    setDataUrl(canvas.toDataURL("image/png"));
  }, [company, personName, personTitle]);

  const fileName = `meishi-${company?.name ?? "company"}-${
    personName || "name"
  }.png`;

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="法人" required>
            <Select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="担当者名" required>
            <TextInput
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="山田 太郎"
            />
          </Field>
          <Field label="役職（任意）">
            <TextInput
              value={personTitle}
              onChange={(e) => setPersonTitle(e.target.value)}
              placeholder="営業部長"
            />
          </Field>
        </div>
        <p className="text-xs text-gray-500">
          住所・電話・メールは選択した法人の登録情報から自動で反映されます。
        </p>
      </div>

      {/* プレビュー */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">プレビュー</h2>
        <canvas
          ref={canvasRef}
          width={CARD_W}
          height={CARD_H}
          className="w-full max-w-xl rounded-md border border-gray-200 shadow"
        />
        <div className="mt-4">
          <a
            href={dataUrl || undefined}
            download={fileName}
            aria-disabled={!personName}
            className={`inline-flex items-center rounded-lg px-5 py-2 text-sm font-medium text-white shadow-sm transition ${
              personName
                ? "bg-brand-600 hover:bg-brand-700"
                : "pointer-events-none bg-gray-300"
            }`}
          >
            画像をダウンロード (PNG)
          </a>
          {!personName && (
            <span className="ml-3 text-xs text-gray-400">
              担当者名を入力するとダウンロードできます
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
