"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Company } from "@/lib/types";
import { Field, TextInput, Select } from "@/components/Form";
import { generateMail, generateTel } from "@/lib/meishi";
import { saveMeishiFromMakerAction } from "@/app/actions";

// 名刺サイズ 91mm x 55mm を 300dpi 相当で描画
const CARD_W = 1075;
const CARD_H = 650;

// ハガキサイズ 100mm x 148mm (300dpi) — コンビニのハガキ印刷用
const HAGAKI_W = 1181;
const HAGAKI_H = 1748;

/**
 * 画像を保存する。iOS Safari はデータURLの download リンクが効かないことがあるため、
 * 共有シート（「画像を保存」で写真に保存できる）を優先し、使えない環境では
 * Blob URL でのダウンロードにフォールバックする。
 */
async function saveImage(dataUrl: string, fileName: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], fileName, { type: "image/png" });
  if (
    typeof navigator !== "undefined" &&
    navigator.canShare?.({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch {
      // キャンセル時などは何もしない
      return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** 名刺キャンバスをハガキ中央に配置し、四隅にトンボを付けた印刷用画像を作る */
function buildHagakiDataUrl(cardCanvas: HTMLCanvasElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = HAGAKI_W;
  canvas.height = HAGAKI_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, HAGAKI_W, HAGAKI_H);

  const x = (HAGAKI_W - CARD_W) / 2;
  const y = (HAGAKI_H - CARD_H) / 2;
  ctx.drawImage(cardCanvas, x, y);

  // 切り取り用トンボ
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 2;
  const m = 24; // カードからの距離
  const len = 40;
  const corners: [number, number, number, number][] = [
    [x - m, y - m, 1, 1],
    [x + CARD_W + m, y - m, -1, 1],
    [x - m, y + CARD_H + m, 1, -1],
    [x + CARD_W + m, y + CARD_H + m, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + len * dx, cy);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + len * dy);
    ctx.stroke();
  }
  return canvas.toDataURL("image/png");
}

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
  const lineH = 40;

  const lines: string[] = [];
  if (d.address) {
    lines.push(...wrapText(ctx, d.address, CARD_W - 160).slice(0, 2));
  }
  if (d.phone) lines.push(`TEL：${d.phone}`);
  if (d.email) lines.push(`MAIL：${d.email}`);

  // 下端から詰めて描画
  let y = CARD_H - 60 - lineH * lines.length;
  for (const line of lines) {
    ctx.fillText(line, 70, y);
    y += lineH;
  }
}

export function MeishiMaker({ companies }: { companies: Company[] }) {
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [personName, setPersonName] = useState("");
  const [personTitle, setPersonTitle] = useState("");
  const [tel, setTel] = useState("");
  const [mail, setMail] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [hagakiUrl, setHagakiUrl] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [saving, startSaving] = useTransition();

  const company = useMemo(
    () => companies.find((c) => c.id === companyId) ?? null,
    [companies, companyId],
  );

  // 会社を切り替えたら TEL / MAIL を自動生成し直す（手で編集可能）
  useEffect(() => {
    if (!company) return;
    setTel(generateTel(company.id));
    setMail(generateMail(company.name));
  }, [company]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !company) return;
    drawMeishi(canvas, {
      companyName: company.name,
      personName,
      personTitle,
      address: company.address ?? "",
      phone: tel,
      email: mail,
    });
    setDataUrl(canvas.toDataURL("image/png"));
    setHagakiUrl(buildHagakiDataUrl(canvas));
    setSaved(false);
  }, [company, personName, personTitle, tel, mail]);

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
          <Field label="TEL（自動生成・編集可）">
            <TextInput
              type="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              placeholder="050-0000-0000"
            />
          </Field>
          <Field label="MAIL（自動生成・編集可）">
            <TextInput
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="info@example.com"
            />
          </Field>
        </div>
        <p className="text-xs text-gray-500">
          住所は選択した法人の登録情報から反映されます。TEL は
          050番号を、MAIL は会社名から info@〜.com
          を自動生成します（どちらも編集できます）。
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
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!personName}
            onClick={() => saveImage(dataUrl, fileName)}
            className={`inline-flex items-center rounded-lg px-5 py-2 text-sm font-medium text-white shadow-sm transition ${
              personName
                ? "bg-brand-600 hover:bg-brand-700"
                : "pointer-events-none bg-gray-300"
            }`}
          >
            画像を保存 (PNG)
          </button>
          <button
            type="button"
            disabled={!personName}
            onClick={() => saveImage(hagakiUrl, `hagaki-${fileName}`)}
            className={`inline-flex items-center rounded-lg border px-5 py-2 text-sm font-medium shadow-sm transition ${
              personName
                ? "border-brand-600 bg-white text-brand-700 hover:bg-brand-50"
                : "pointer-events-none border-gray-200 bg-gray-100 text-gray-400"
            }`}
          >
            コンビニ印刷用（ハガキ）を保存
          </button>
          <button
            type="button"
            disabled={!personName || saving || saved}
            onClick={() => {
              if (!company || !dataUrl) return;
              startSaving(async () => {
                await saveMeishiFromMakerAction(
                  company.id,
                  [personTitle, personName].filter(Boolean).join(" "),
                  dataUrl,
                );
                setSaved(true);
              });
            }}
            className={`inline-flex items-center rounded-lg border px-5 py-2 text-sm font-medium shadow-sm transition ${
              saved
                ? "border-green-300 bg-green-50 text-green-700"
                : personName
                  ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  : "border-gray-200 bg-gray-100 text-gray-400"
            } disabled:cursor-default`}
          >
            {saved
              ? "✓ 保存しました"
              : saving
                ? "保存中…"
                : "この名刺を保存（名刺画像管理へ）"}
          </button>
          {!personName && (
            <span className="text-xs text-gray-400">
              担当者名を入力するとダウンロードできます
            </span>
          )}
        </div>
      </div>

      {/* コンビニ印刷の手順 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">
          コンビニでハガキ印刷する手順
        </h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-gray-600">
          <li>上の「コンビニ印刷用（ハガキ）PNG」を保存する</li>
          <li>
            <span className="font-medium">セブンイレブン</span>:{" "}
            <a
              href="https://www.printing.ne.jp/support/lite/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              かんたんnetprint
            </a>
            （アプリ）に画像を登録すると<span className="font-medium">プリント予約番号</span>が発行されます
          </li>
          <li>
            <span className="font-medium">ファミマ・ローソン</span>:{" "}
            <a
              href="https://networkprint.ne.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              ネットワークプリント
            </a>
            に画像を登録すると<span className="font-medium">ユーザー番号</span>が発行されます
          </li>
          <li>店頭のマルチコピー機で番号を入力し、「はがきプリント」を選んで印刷</li>
        </ol>
        <p className="mt-2 text-xs text-gray-400">
          ※ 各サービスの規約により、番号の自動発行（API連携）は提供されていないため、登録は公式アプリ/サイトから行ってください。
        </p>
      </div>
    </div>
  );
}
