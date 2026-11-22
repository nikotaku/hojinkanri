/**
 * 法人モバイル回線の進め方（フロー）と、法人ごとの「次のアクション」の判定。
 *
 *   au回線を2回線契約 → ドコモ回線にMNP
 *
 * ステップを足したいときは MOBILE_FLOW の steps に追記する。
 * 判定はステータス文字列から読むだけなので、保存の仕組みは変えなくてよい。
 */

import type { Company } from "./types";

export interface MobileFlowStep {
  /** どの回線の話か（MOBILE_SERVICES の値） */
  service: string;
  /** 完了とみなすのに必要な契約回線数 */
  lines: number;
  /** ステップ名 */
  label: string;
  /** 次のアクションとして出すときの文言 */
  action: string;
  /** 補足 */
  hint?: string;
}

export const MOBILE_FLOW: { title: string; steps: MobileFlowStep[] } = {
  title: "au → ドコモ MNP",
  steps: [
    {
      service: "au",
      lines: 2,
      label: "au回線を2回線契約",
      action: "au回線を2回線契約する",
      hint: "2回線そろってから次へ進む",
    },
    {
      service: "ドコモ",
      lines: 1,
      label: "ドコモ回線にMNP",
      action: "ドコモ回線にMNPする",
      hint: "au で契約した回線を転入させる",
    },
  ],
};

/**
 * ステータス文字列から契約できている回線数を読む。
 * 「割賦審査不可 / 4台契約」のように複数の状態が入ることがあるので、
 * 文字列全体から「N台契約」を拾って一番大きいものを採る。
 */
export function contractedLines(status?: string | null): number {
  if (!status) return 0;
  let max = 0;
  for (const m of status.matchAll(/([0-9０-９]+)\s*台契約/g)) {
    const digits = m[1].replace(/[０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0),
    );
    const n = Number(digits);
    if (Number.isFinite(n) && n > max) max = n;
  }
  // 台数が書かれていなくても、使用中なら最低1回線はあるとみなす
  if (max === 0 && /(使用中|限度額まで使用|登録完了)/.test(status)) return 1;
  return max;
}

const BLOCKED = /(審査落ち|設定不可|利用不可|中止)/;
const IN_REVIEW = /(申し込み中|申込中|審査中|印鑑証明待ち|進行中|再度審査)/;

export type StepState = "done" | "partial" | "review" | "blocked" | "todo";

export interface EvaluatedStep extends MobileFlowStep {
  state: StepState;
  /** 現在の契約回線数 */
  lines: number;
  /** 必要な回線数 */
  needLines: number;
  status?: string;
}

export interface MobileFlowResult {
  steps: EvaluatedStep[];
  /** 次にやるステップ。全部終わっていれば null */
  next: EvaluatedStep | null;
  /** 次のアクションの一文 */
  message: string | null;
  done: boolean;
}

function evaluate(step: MobileFlowStep, status?: string): EvaluatedStep {
  const lines = contractedLines(status);
  const base = { ...step, lines, needLines: step.lines, status };

  if (lines >= step.lines) return { ...base, state: "done" };
  if (lines > 0) return { ...base, state: "partial" };
  // 「割賦審査不可」は端末の分割が組めないだけなので、回線が 0 のときだけ止まりとみなす
  if (status && BLOCKED.test(status)) return { ...base, state: "blocked" };
  if (status && IN_REVIEW.test(status)) return { ...base, state: "review" };
  return { ...base, state: "todo" };
}

function messageFor(step: EvaluatedStep): string {
  switch (step.state) {
    case "partial": {
      const rest = step.needLines - step.lines;
      return `${step.service}回線をあと${rest}回線契約する（現在 ${step.lines} 回線）`;
    }
    case "review":
      return `${step.service}の審査結果を待つ`;
    case "blocked":
      return `${step.service}が「${step.status}」。この法人では進められないので対応を決める`;
    default:
      return step.action;
  }
}

/** 法人ひとつ分のフローの進み具合を返す */
export function evaluateMobileFlow(company: Company): MobileFlowResult {
  const statusMap = (company.mobile ?? {}) as Record<string, string>;
  const steps = MOBILE_FLOW.steps.map((s) => evaluate(s, statusMap[s.service]));

  // 前のステップが終わっていないうちは、後ろのステップは次のアクションにしない
  const next = steps.find((s) => s.state !== "done") ?? null;

  return {
    steps,
    next,
    message: next ? messageFor(next) : null,
    done: next === null,
  };
}
