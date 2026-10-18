/**
 * 住所から郵便番号を逆引きする。
 *
 * 住所表記のゆれ（全角・半角、漢数字の丁目、ケ/ヶ、ノ/之、空白、番地の書き方）を
 * 吸収したうえで、都道府県 → 市区町村 → 町域 の順に最長一致で絞り込む。
 *
 * 登記簿の住所は「札幌市中央区…」「仙台市泉区…」のように都道府県が省略されて
 * いることが多いため、省略されていても市区町村名から都道府県を引き直す。
 *
 * 町域名が同じでも丁目によって郵便番号が分かれる地域があるため、絞りきれない
 * 場合は候補を複数返して利用者に選んでもらう。
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

type Location = {
  prefecture: string;
  city: string;
  town: string;
  postal: string;
};

/** 通信そのものに失敗したとき。「見つからなかった」とは区別する */
export class AddressApiError extends Error {}

/**
 * 同じ問い合わせを繰り返さないよう Promise ごとキャッシュする。
 * 失敗したものは次回やり直せるよう取り除く。
 *
 * 住所 API は一時的に落ちたり詰まったりすることがあり、1 回失敗しただけで
 * 「見つかりません」と出すと、同じ住所でも出たり出なかったりする。
 * 少し待って数回やり直す。
 */
const cache = new Map<string, Promise<Location[]>>();

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function request(params: Record<string, string>): Promise<Location[]> {
  const url = `${API}?${new URLSearchParams(params).toString()}`;
  const cached = cache.get(url);
  if (cached) return cached;

  const task = (async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await wait(400 * attempt);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = json?.response?.location;
        return Array.isArray(list) ? (list as Location[]) : [];
      } catch (e) {
        lastError = e;
      }
    }
    throw new AddressApiError(
      `住所データを取得できませんでした: ${String(lastError)}`,
    );
  })();

  cache.set(url, task);
  task.catch(() => cache.delete(url));
  return task;
}

const getCities = (prefecture: string) =>
  request({ method: "getCities", prefecture });

const getTowns = (prefecture: string, city: string) =>
  request({ method: "getTowns", prefecture, city });

const suggest = (keyword: string, matching: "prefix" | "like" = "like") =>
  request({ method: "suggest", keyword, matching });

const KANJI_DIGITS: Record<string, number> = {
  〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
};

/**
 * 「十一」「二十三」のような漢数字を算用数字に直す。
 *
 * 「十」を含まない並びは位取りではなく数字の羅列として扱う。
 * 「大木六一番」（町名「大木六」＋「一番」）のように町名の末尾の漢数字と
 * 番地の漢数字が続けて書かれることがあり、足し算にすると町名が消えてしまう。
 */
function kanjiToArabic(value: string): string {
  return value.replace(/[〇一二三四五六七八九十]+/g, (run) => {
    if (!run.includes("十")) {
      return [...run].map((ch) => KANJI_DIGITS[ch]).join("");
    }
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

/**
 * 全角英数・半角カナ・互換文字を揃え（NFKC）、ハイフン類を統一し、
 * 空白と区切り記号、先頭の郵便番号表記を取り除く。
 */
function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[−–—―‐ｰー]/g, "-")
    .replace(/[\s　]/g, "")
    .replace(/[・、,]/g, "")
    .replace(/^〒?\d{3}-?\d{4}/, "")
    .replace(/〒\d{0,3}-?\d{0,4}/, "");
}

/**
 * 比較用のキー（漢数字は算用数字にしない形）。
 * ケ/ヶ/ガ/が（茅ヶ崎・袖ケ浦・自由が丘）と ノ/之/の（一ノ宮・市之瀬）は
 * 住所表記で入れ替わりやすいので同一視する。
 */
function rawKey(value: string): string {
  return normalize(value)
    .replace(/[ヶヵケガが]/g, "ケ")
    .replace(/[ノ之]/g, "の");
}

/** 比較用のキー。漢数字も算用数字にそろえる */
function matchKey(value: string): string {
  return kanjiToArabic(rawKey(value));
}

/** 「大字」「字」は書かれたり省かれたりするので、照合の二段目で落とす */
const stripAza = (key: string) => key.replace(/大字|字/g, "");

/** 住所に郵便番号そのものが書かれている場合に取り出す */
function embeddedPostalCode(value: string): string | null {
  const m = value.normalize("NFKC").match(/〒?\s*(\d{3})-?\s*(\d{4})/);
  return m ? `${m[1]}-${m[2]}` : null;
}

/** 1234567 → 123-4567 */
export function formatPostalCode(value: string): string {
  const digits = value.normalize("NFKC").replace(/\D/g, "");
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

type Place = {
  prefecture: string;
  city: string;
  /** 市区町村より後ろの部分（照合用キー） */
  restKey: string;
  /** 同じく、漢数字を変換していない形 */
  restRaw: string;
  /** 市区町村名として消費した文字数。長いものを優先するために使う */
  consumed: number;
};

/**
 * 都道府県が省略された住所から市区町村らしき部分を切り出す。
 * 「札幌市中央区」のような政令指定都市を「札幌市」より優先したいので、
 * 長いものから順に返す。
 */
function municipalityCandidates(normalized: string): string[] {
  const patterns = [
    /^(.{1,7}?市.{1,7}?区)/, // 政令指定都市
    /^(.{1,7}?郡.{1,7}?[町村])/, // 郡部
    /^(.{1,10}?市)/,
    /^(.{1,10}?[区町村])/,
  ];
  const found: string[] = [];
  for (const pattern of patterns) {
    const m = pattern.exec(normalized);
    if (!m) continue;
    found.push(m[1]);
    // 「杵島郡大町町」を「杵島郡大町」で切ってしまわないよう、
    // 直後が市区町村で終わる文字なら伸ばした形も候補にする
    let extended = m[1];
    while (
      extended.length < normalized.length &&
      /[市区町村]/.test(normalized[extended.length])
    ) {
      extended += normalized[extended.length];
      found.push(extended);
    }
  }
  return [...new Set(found)].sort((a, b) => b.length - a.length);
}

/** 指定の都道府県の市区町村一覧から、住所の先頭に一致するものを探す */
async function placesIn(
  prefecture: string,
  restKey: string,
  restRaw: string,
): Promise<Place[]> {
  const cities = await getCities(prefecture);
  const names = [...new Set(cities.map((c) => c.city))];
  const places: Place[] = [];

  for (const name of names) {
    // 「勇払郡むかわ町」が「むかわ町」とだけ書かれることがある
    const forms = [name, name.replace(/^[^郡]{1,6}郡/, "")];
    for (const form of forms) {
      const key = matchKey(form);
      const raw = rawKey(form);
      if (key && restKey.startsWith(key)) {
        places.push({
          prefecture,
          city: name,
          restKey: restKey.slice(key.length),
          // 市区町村名は末尾が市区町村なので、漢数字変換の有無でずれない
          restRaw: restRaw.startsWith(raw) ? restRaw.slice(raw.length) : "",
          consumed: key.length,
        });
        break;
      }
    }
  }

  return places.sort((a, b) => b.consumed - a.consumed);
}

/**
 * 市区町村名 → 都道府県 の索引。
 *
 * suggest は返す件数に上限があり、同じ問い合わせでも拾える市区町村が変わる
 * （「関市」が「下関市」などに押し出されて消えることがある）。
 * suggest で決まらなかったときのために、全都道府県の市区町村一覧から
 * 索引を一度だけ作って確実に引けるようにしておく。
 */
let cityIndex: Promise<Map<string, string[]>> | null = null;

function getCityIndex(): Promise<Map<string, string[]>> {
  if (!cityIndex) {
    cityIndex = (async () => {
      const map = new Map<string, string[]>();
      const lists = await Promise.all(
        PREFECTURES.map((p) =>
          getCities(p).then(
            (list) => [p, list] as const,
            () => [p, [] as Location[]] as const,
          ),
        ),
      );
      let loaded = 0;
      for (const [prefecture, list] of lists) {
        if (list.length > 0) loaded++;
        for (const row of list) {
          // 「勇払郡むかわ町」は「むかわ町」とだけ書かれることがある
          for (const form of [row.city, row.city.replace(/^[^郡]{1,6}郡/, "")]) {
            const key = matchKey(form);
            if (!key) continue;
            const found = map.get(key) ?? [];
            if (!found.includes(prefecture)) found.push(prefecture);
            map.set(key, found);
          }
        }
      }
      if (loaded === 0) {
        throw new AddressApiError("住所データを取得できませんでした。");
      }
      return map;
    })();
    cityIndex.catch(() => {
      cityIndex = null;
    });
  }
  return cityIndex;
}

/** 都道府県が省略された住所から、市区町村を含みうる都道府県を挙げる */
async function prefecturesFor(candidate: string): Promise<string[]> {
  const candidateKey = matchKey(candidate);

  // まずは 1 回の問い合わせで済む suggest を試す
  for (const matching of ["prefix", "like"] as const) {
    let hits: Location[];
    try {
      hits = await suggest(candidate, matching);
    } catch {
      break; // 通信が不調。索引側で引き直す
    }
    const prefectures = [
      ...new Set(
        hits
          .filter((h) => {
            const key = matchKey(h.city);
            return key === candidateKey || key.endsWith(candidateKey);
          })
          .map((h) => h.prefecture),
      ),
    ];
    if (prefectures.length > 0) return prefectures;
  }

  // suggest で決まらなければ索引から引く（確実だが初回だけ重い）
  const index = await getCityIndex();
  const prefectures = new Set<string>();
  for (const [key, list] of index) {
    if (key === candidateKey || key.endsWith(candidateKey)) {
      for (const p of list) prefectures.add(p);
    }
  }
  return [...prefectures];
}

/** 住所文字列から (都道府県, 市区町村, 残り) の候補を組み立てる */
async function resolvePlaces(normalized: string): Promise<Place[]> {
  const prefecture = PREFECTURES.find((p) => normalized.startsWith(p));
  if (prefecture) {
    const rest = normalized.slice(prefecture.length);
    const places = await placesIn(prefecture, matchKey(rest), rawKey(rest));
    if (places.length > 0) return places;
  }

  // 都道府県が省略されている（登記簿の住所はほとんどこの形）
  const fullKey = matchKey(normalized);
  const fullRaw = rawKey(normalized);
  let apiError: unknown = null;
  for (const candidate of municipalityCandidates(normalized)) {
    let prefectures: string[];
    try {
      prefectures = await prefecturesFor(candidate);
    } catch (e) {
      // 通信に失敗しただけなら「見つからない」と言い切らない
      apiError = e;
      continue;
    }

    const places: Place[] = [];
    for (const p of prefectures) {
      places.push(...(await placesIn(p, fullKey, fullRaw)));
    }
    if (places.length > 0) {
      return places.sort((a, b) => b.consumed - a.consumed);
    }
  }

  if (apiError) throw apiError;
  return [];
}

/** 市区町村が決まったあと、町域を最長一致で絞り込む */
async function townCandidates(place: Place): Promise<PostalCandidate[]> {
  const towns = await getTowns(place.prefecture, place.city);

  const pick = (keyOf: (t: Location) => string, rest: string) => {
    const matched = towns
      .map((t) => ({ town: t, key: keyOf(t) }))
      .filter((t) => t.key.length > 0 && rest.startsWith(t.key))
      .sort((a, b) => b.key.length - a.key.length);
    if (matched.length === 0) return [];
    // 最長一致と同じ長さのものだけを残す（丁目で分かれている地域向け）
    const longest = matched[0].key.length;
    return matched.filter((t) => t.key.length === longest);
  };

  let best = pick((t) => matchKey(t.town), place.restKey);
  if (best.length === 0) {
    // 「十三一番一号」のように町名の漢数字と番地の漢数字が続く場合は、
    // 漢数字を変換しないまま照合したほうが正しく切れる
    best = pick((t) => rawKey(t.town), place.restRaw);
  }
  if (best.length === 0) {
    best = pick((t) => stripAza(matchKey(t.town)), stripAza(place.restKey));
  }
  if (best.length === 0) {
    best = pick((t) => stripAza(rawKey(t.town)), stripAza(place.restRaw));
  }
  if (best.length === 0) {
    // 町域が登録されていない市区町村（村全体で 1 つの郵便番号など）
    const fallback = towns.filter(
      (t) => !t.town || t.town === "以下に掲載がない場合",
    );
    best = fallback.map((t) => ({ town: t, key: "" }));
  }

  const unique = [...new Map(best.map((t) => [t.town.postal, t.town])).values()];
  return unique.map((t) => ({
    code: formatPostalCode(t.postal),
    label: `${place.prefecture}${place.city}${t.town}`,
  }));
}

/** 住所文字列から郵便番号の候補を返す */
export async function lookupPostalCode(
  address: string,
): Promise<PostalLookupResult> {
  const normalized = normalize(address);
  if (!normalized) {
    return { candidates: [], error: "住所を入力してください。" };
  }

  const embedded = embeddedPostalCode(address);
  const places = await resolvePlaces(normalized);

  if (places.length === 0) {
    if (embedded) {
      return { candidates: [{ code: embedded, label: "住所に書かれていた郵便番号" }] };
    }
    return {
      candidates: [],
      error: "市区町村を特定できませんでした。住所を確認してください。",
    };
  }

  for (const place of places) {
    const candidates = await townCandidates(place);
    if (candidates.length > 0) return { candidates };
  }

  if (embedded) {
    return { candidates: [{ code: embedded, label: "住所に書かれていた郵便番号" }] };
  }

  const head = places[0];
  return {
    candidates: [],
    error: `${head.prefecture}${head.city}までは分かりましたが、町名を特定できませんでした。`,
  };
}
