// 表示用のフォーマットヘルパー

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  // 日付(YYYY-MM-DD)または ISO 文字列の先頭10文字を整形
  const d = value.length > 10 ? value.slice(0, 10) : value;
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return value;
  return `${y}/${m}/${day}`;
}
