// 名刺の TEL / MAIL 自動生成ユーティリティ

// カタカナ -> ローマ字 の簡易変換表（拗音を先に評価する）
const KANA_DIGRAPHS: Record<string, string> = {
  キャ: "kya", キュ: "kyu", キョ: "kyo",
  シャ: "sha", シュ: "shu", ショ: "sho",
  チャ: "cha", チュ: "chu", チョ: "cho",
  ニャ: "nya", ニュ: "nyu", ニョ: "nyo",
  ヒャ: "hya", ヒュ: "hyu", ヒョ: "hyo",
  ミャ: "mya", ミュ: "myu", ミョ: "myo",
  リャ: "rya", リュ: "ryu", リョ: "ryo",
  ギャ: "gya", ギュ: "gyu", ギョ: "gyo",
  ジャ: "ja", ジュ: "ju", ジョ: "jo",
  ビャ: "bya", ビュ: "byu", ビョ: "byo",
  ピャ: "pya", ピュ: "pyu", ピョ: "pyo",
  ウィ: "wi", ウェ: "we", ウォ: "wo",
  ヴァ: "va", ヴィ: "vi", ヴェ: "ve", ヴォ: "vo",
  ファ: "fa", フィ: "fi", フェ: "fe", フォ: "fo",
  ティ: "ti", ディ: "di", デュ: "du", トゥ: "tu", ドゥ: "du",
  チェ: "che", シェ: "she", ジェ: "je",
};

const KANA_SINGLE: Record<string, string> = {
  ア: "a", イ: "i", ウ: "u", エ: "e", オ: "o",
  カ: "ka", キ: "ki", ク: "ku", ケ: "ke", コ: "ko",
  サ: "sa", シ: "shi", ス: "su", セ: "se", ソ: "so",
  タ: "ta", チ: "chi", ツ: "tsu", テ: "te", ト: "to",
  ナ: "na", ニ: "ni", ヌ: "nu", ネ: "ne", ノ: "no",
  ハ: "ha", ヒ: "hi", フ: "fu", ヘ: "he", ホ: "ho",
  マ: "ma", ミ: "mi", ム: "mu", メ: "me", モ: "mo",
  ヤ: "ya", ユ: "yu", ヨ: "yo",
  ラ: "ra", リ: "ri", ル: "ru", レ: "re", ロ: "ro",
  ワ: "wa", ヲ: "o", ン: "n",
  ガ: "ga", ギ: "gi", グ: "gu", ゲ: "ge", ゴ: "go",
  ザ: "za", ジ: "ji", ズ: "zu", ゼ: "ze", ゾ: "zo",
  ダ: "da", ヂ: "ji", ヅ: "zu", デ: "de", ド: "do",
  バ: "ba", ビ: "bi", ブ: "bu", ベ: "be", ボ: "bo",
  パ: "pa", ピ: "pi", プ: "pu", ペ: "pe", ポ: "po",
  ヴ: "vu",
  ァ: "a", ィ: "i", ゥ: "u", ェ: "e", ォ: "o",
  ャ: "ya", ュ: "yu", ョ: "yo",
};

/** ひらがな・カタカナをローマ字へ変換する（変換できない文字は捨てる） */
export function kanaToRomaji(input: string): string {
  // ひらがな -> カタカナ
  const kata = input.replace(/[ぁ-ゖ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60),
  );
  let out = "";
  let i = 0;
  while (i < kata.length) {
    const two = kata.slice(i, i + 2);
    if (KANA_DIGRAPHS[two]) {
      out += KANA_DIGRAPHS[two];
      i += 2;
      continue;
    }
    const ch = kata[i];
    if (ch === "ッ") {
      // 次の音の子音を重ねる
      const nextTwo = kata.slice(i + 1, i + 3);
      const next = KANA_DIGRAPHS[nextTwo] ?? KANA_SINGLE[kata[i + 1] ?? ""];
      if (next) out += next[0];
      i += 1;
      continue;
    }
    if (ch === "ー") {
      // 長音は直前の母音を伸ばさず省略
      i += 1;
      continue;
    }
    if (KANA_SINGLE[ch]) {
      out += KANA_SINGLE[ch];
      i += 1;
      continue;
    }
    if (/[A-Za-z0-9]/.test(ch)) {
      out += ch.toLowerCase();
      i += 1;
      continue;
    }
    i += 1; // 漢字・記号などは捨てる
  }
  return out;
}

// 漢字を含む語の読み辞書。かな変換の前に置換する（長い語を先に評価）
const KANJI_READINGS: [string, string][] = [
  ["聡電舍", "sodensha"],
  ["喜王仙", "kiosen"],
  ["西日本", "nishinihon"],
  ["東日本", "higashinihon"],
  ["三福", "sanpuku"],
  ["商貿", "shobo"],
  ["長田", "osada"],
  ["大観", "taikan"],
  ["自立支援", "jiritsushien"],
  ["不動産", "fudosan"],
  ["工業", "kogyo"],
  ["商事", "shoji"],
  ["電気", "denki"],
  ["日本", "nihon"],
];

// 日本語風の擬似スラッグ生成用の音節
const SYLLABLES = [
  "ka", "ki", "ku", "ke", "ko", "sa", "shi", "su", "se", "so",
  "ta", "chi", "tsu", "te", "to", "na", "ni", "no", "ha", "hi",
  "fu", "ho", "ma", "mi", "mu", "me", "mo", "ya", "yu", "yo",
  "ra", "ri", "ru", "re", "ro", "wa", "n",
];

/** 変換不能な社名向けに、社名から決まる日本語風スラッグを作る */
function pseudoSlug(seed: string): string {
  let h = 7;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 131 + seed.charCodeAt(i)) >>> 0;
  }
  let out = "";
  const count = 3 + (h % 2); // 3〜4音節
  for (let i = 0; i < count; i++) {
    out += SYLLABLES[h % SYLLABLES.length];
    h = (h * 2654435761 + 1) >>> 0;
  }
  return out;
}

/** 会社名からメールのドメイン用スラッグを作る（必ず何かしら返す） */
export function companySlug(name: string): string {
  let stripped = name
    .replace(/株式会社|合同会社|有限会社|一般社団法人|一般財団法人|公益社団法人/g, "")
    .replace(/[\s・．.、,＆&\-－–]/g, "")
    .trim();
  for (const [kanji, reading] of KANJI_READINGS) {
    stripped = stripped.split(kanji).join(reading);
  }
  const slug = kanaToRomaji(stripped).replace(/[^a-z0-9]/g, "");
  return slug.length >= 2 ? slug : pseudoSlug(name);
}

/** 会社名から info@ メールアドレスを自動生成する */
export function generateMail(name: string): string {
  return `info@${companySlug(name)}.com`;
}

/** 会社IDから決まる 050 番号を自動生成する（同じ会社なら常に同じ番号） */
export function generateTel(seed: string): string {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = (h1 * 31 + c) % 10000;
    h2 = (h2 * 37 + c) % 10000;
  }
  const p1 = String(1000 + (h1 % 9000)); // 先頭が0にならないように
  const p2 = String(h2).padStart(4, "0");
  return `050-${p1}-${p2}`;
}
