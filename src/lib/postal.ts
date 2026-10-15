/**
 * 住所から郵便番号を逆引きする。
 *
 * 住所表記のゆれ（全角数字・漢数字の丁目・空白）を吸収したうえで、
 * 都道府県 → 市区町村 → 町域 の順に最長一致で絞り込む。
 * 町域名が同じでも丁目によって郵便番号が分かれる地域があるため、
 * 絞りきれない場合は候補を複数返して利用者に選んでもらう。
 *
 * 住所データは HeartRails Geo API を利用する（CORS 可・ブラウザから直接呼ぶ）。
 */

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

const API = "https://geoapi.heartrails.com/api/json";

type Town = { city: string; town: string; postal: string; prefecture: string };

const cache = new Map<string, Town[]>();

async function fetchLocations(url: string): Promise<Town[]> {
  const cached = cache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error("住所データを取得できませんでした。");
  const json = await res.json();
  const list: Town[] = json?.response?.location ?? [];
  cache.set(url, list);
  return list;
}

const KANJI_DIGITS: Record<string, number> = {
  〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
};

/** 「十一」「二十三」のような漢数字を算用数字に直す */
function kanjiToArabic(value: string): string {
  return value.replace(/[〇一二三四五六七八九十]+/g, (run) => {
    let total = 0;
    let current = 0;
    for (const ch of run) {
      if (ch === "十") {
        current = (current || 1) * 10;
        total += current;
        current = 0;
      } else {
        current = KANJI_DIGITS[ch];
      }
    }
    return String(total + current);
  });
}

/** 全角英数を半角に、ハイフン類を統一し、空白と既存の〒表記を取り除く */
function normalize(value: string): string {
  return value
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0),
    )
    .replace(/[−－ー―‐]/g, "-")
    .replace(/[\s　]/g, "")
    .replace(/〒[0-9-]*/, "");
}

/** 比較用のキー（表記ゆれを最大限そろえた形） */
const matchKey = (value: string) => kanjiToArabic(normalize(value));

/** 1234567 → 123-4567 */
export function formatPostalCode(value: string): string {
  const digits = normalize(value).replace(/\D/g, "");
  if (digits.length !== 7) return value.trim();
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

export interface PostalCandidate {
  /** 123-4567 形式 */
  code: string;
  /** 都道府県＋市区町村＋町域 */
  label: string;
}

export interface PostalLookupResult {
  candidates: PostalCandidate[];
  /** 候補が得られなかった理由 */
  error?: string;
}

/** 住所文字列から郵便番号の候補を返す */
export async function lookupPostalCode(
  address: string,
): Promise<PostalLookupResult> {
  const normalized = normalize(address);
  if (!normalized) {
    return { candidates: [], error: "住所を入力してください。" };
  }

  const prefecture = PREFECTURES.find((p) => normalized.startsWith(p));
  if (!prefecture) {
    return {
      candidates: [],
      error: "都道府県から始まる住所を入力してください。",
    };
  }
  const afterPrefecture = normalized.slice(prefecture.length);

  const cities = await fetchLocations(
    `${API}?method=getCities&prefecture=${encodeURIComponent(prefecture)}`,
  );
  const city = [...new Set(cities.map((c) => c.city))]
    .sort((a, b) => b.length - a.length)
    .find((name) => afterPrefecture.startsWith(name));
  if (!city) {
    return { candidates: [], error: "市区町村を特定できませんでした。" };
  }

  const afterCity = matchKey(afterPrefecture.slice(city.length));
  const towns = await fetchLocations(
    `${API}?method=getTowns&prefecture=${encodeURIComponent(
      prefecture,
    )}&city=${encodeURIComponent(city)}`,
  );

  const matched = towns
    .map((t) => ({ ...t, key: matchKey(t.town) }))
    .filter((t) => t.key.length > 0 && afterCity.startsWith(t.key))
    .sort((a, b) => b.key.length - a.key.length);

  if (matched.length === 0) {
    return {
      candidates: [],
      error: `${prefecture}${city}までは分かりましたが、町名を特定できませんでした。`,
    };
  }

  // 最長一致と同じ長さのものだけを候補にする（丁目で分かれている地域向け）
  const longest = matched[0].key.length;
  const best = matched.filter((t) => t.key.length === longest);
  const unique = [...new Map(best.map((t) => [t.postal, t])).values()];

  return {
    candidates: unique.map((t) => ({
      code: formatPostalCode(t.postal),
      label: `${prefecture}${city}${t.town}`,
    })),
  };
}
