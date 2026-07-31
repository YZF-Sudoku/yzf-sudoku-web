/*
 * 维护说明（简体中文）
 * 职责：步骤本地化。
 * 数据流：映射技巧名、格名、house 名和说明模板，不改变步骤结构。
 * 修改时注意：
 * - 本文件只应在明确理解数据流后修改；注释描述的是设计意图和维护约束。
 * - 重构时须保持既有求解结果、技巧优先级、前后端字段或测试基线不变。
 * - 主线程代码要避免长时间同步计算；耗时工作优先留在 Worker/WASM。
 * - 涉及移动端指针事件时同时检查鼠标、触摸、长按抑制和浏览器返回行为。
 */
// Frontend-only step localization.
// It receives a final StepResult after solving; workers and solver hot paths do not import this file.

export const STEP_LOCALIZATION_VERSION = "20260710-step-i18n-v5-title-proof";

const TECHNIQUE_NAMES = Object.freeze({
  zh: Object.freeze({
    FullHouse: "单元唯一",
    HiddenSingle: "排除",
    NakedSingle: "唯一余数",
    LockedCandidates: "区块",
    GSP: "宇宙法",
    NakedPair: "显性数对",
    NakedTriple: "显性三数组",
    HiddenPair: "隐性数对",
    HiddenTriple: "隐性三数组",
    NakedQuad: "显性四数组",
    HiddenQuad: "隐性四数组",
    XWing: "X翼",
    Swordfish: "剑鱼",
    Jellyfish: "水母",
    AlmostPair: "欠一数对",
    AlmostTriple: "欠一三数组",
    BUGOne: "BUG+1",
    AvoidableRectangle: "可规避矩形",
    Skyscraper: "摩天楼",
    TwoStringKite: "双线风筝",
    EmptyRectangle: "空矩形",
    ERIPair: "ERI Pair",
    WWing: "W-Wing",
    XYWing: "XY-Wing",
    XYZWing: "XYZ-Wing",
    XYZRing: "XYZ-Ring",
    BUGPlusN: "BUG+n",
    BivalueOddagon: "双值死环",
    WXYZWing: "WXYZ-Wing",
    UniqueRectangle: "唯一矩形",
    UniqueLoop: "唯一环",
    ExtendedRectangle: "拓展矩形",
    FinnedXWing: "鳍X翼",
    FinnedSwordfish: "鳍剑鱼",
    FinnedJellyfish: "鳍水母",
    SueDeCoq: "融合待定数组",
    Fireworks: "烟花数组",
    BrokenWing: "守护者",
    XChain: "同数链",
    XYChain: "双值格链",
    AIC: "AIC",
    GroupedAIC: "区块AIC",
    ALSXZ: "ALS-XZ",
    ALSXYWing: "ALS-XY-Wing",
    ALSWWing: "ALS-W-Wing",
    AHSXZ: "AHS-XZ",
    AHSXYWing: "AHS-XY-Wing",
    AHSWWing: "AHS-W-Wing",
    ALSChain: "待定数组链",
    AHSChain: "隐性待定数组链",
    DeathBlossom: "死亡绽放",
    ComplexSwordfish: "复杂剑鱼",
    ComplexJellyfish: "复杂水母",
    ComplexSquirmbagFish: "复杂五阶鱼",
    BlossomLoop: "绽放环",
    ComplexAIC: "复杂AIC",
    CellRegionFC: "单元格/区域强制链",
    Whip: "Whip",
    GWhip: "g-Whip",
    DynamicChain: "动态链",
    Braid: "Braid",
    GBraid: "g-Braid",
    SKLoop: "多米诺环",
    MSLS: "网",
    Multifish: "复数鱼",
    JE: "初级飞鱼",
    SeniorExocet: "高级飞鱼",
    WeakExocet: "衰弱飞鱼",
    TripletOddagon: "三值死环",
    BruteForce: "穷举求解",
  }),
  en: Object.freeze({
    FullHouse: "Full House",
    HiddenSingle: "Hidden Single",
    NakedSingle: "Naked Single",
    LockedCandidates: "Locked Candidates",
    GSP: "GSP",
    NakedPair: "Naked Pair",
    NakedTriple: "Naked Triple",
    HiddenPair: "Hidden Pair",
    HiddenTriple: "Hidden Triple",
    NakedQuad: "Naked Quad",
    HiddenQuad: "Hidden Quad",
    XWing: "X-Wing",
    Swordfish: "Swordfish",
    Jellyfish: "Jellyfish",
    AlmostPair: "Almost Pair",
    AlmostTriple: "Almost Triple",
    BUGOne: "BUG+1",
    AvoidableRectangle: "Avoidable Rectangle",
    Skyscraper: "Skyscraper",
    TwoStringKite: "2-String Kite",
    EmptyRectangle: "Empty Rectangle",
    ERIPair: "ERI Pair",
    WWing: "W-Wing",
    XYWing: "XY-Wing",
    XYZWing: "XYZ-Wing",
    XYZRing: "XYZ-Ring",
    BUGPlusN: "BUG+n",
    BivalueOddagon: "Bivalue Oddagon",
    WXYZWing: "WXYZ-Wing",
    UniqueRectangle: "Unique Rectangle",
    UniqueLoop: "Unique Loop",
    ExtendedRectangle: "Extended Rectangle",
    FinnedXWing: "Finned X-Wing",
    FinnedSwordfish: "Finned Swordfish",
    FinnedJellyfish: "Finned Jellyfish",
    SueDeCoq: "Sue de Coq",
    Fireworks: "Fireworks",
    BrokenWing: "Broken Wing",
    XChain: "X-Chain",
    XYChain: "XY-Chain",
    AIC: "AIC",
    GroupedAIC: "Grouped AIC",
    ALSXZ: "ALS-XZ",
    ALSXYWing: "ALS-XY-Wing",
    ALSWWing: "ALS-W-Wing",
    AHSXZ: "AHS-XZ",
    AHSXYWing: "AHS-XY-Wing",
    AHSWWing: "AHS-W-Wing",
    ALSChain: "ALS Chain",
    AHSChain: "AHS Chain",
    DeathBlossom: "Death Blossom",
    ComplexSwordfish: "Complex Swordfish",
    ComplexJellyfish: "Complex Jellyfish",
    ComplexSquirmbagFish: "Complex Squirmbag Fish",
    BlossomLoop: "Blossom Loop",
    ComplexAIC: "Complex AIC",
    CellRegionFC: "Cell/Region FC",
    Whip: "Whip",
    GWhip: "g-Whip",
    DynamicChain: "Dynamic Chain",
    Braid: "Braid",
    GBraid: "g-Braid",
    SKLoop: "SK Loop",
    MSLS: "MSLS",
    Multifish: "Multifish",
    JE: "JE",
    SeniorExocet: "Senior Exocet",
    WeakExocet: "Weak Exocet",
    TripletOddagon: "Triplet Oddagon",
    BruteForce: "Brute Force",
  }),
});


// Title localization follows two rules:
// 1) the backend title is authoritative whenever it carries a Type/Grouped/Dual/etc. qualifier;
// 2) terms without a verified Chinese name stay in English, wrapped by the known family name.
// The verified terms below follow Kazusa's Chinese tutorial terminology.
const TRUSTED_TITLE_TRANSLATIONS_ZH = Object.freeze({
  "Full House": "单元唯一",
  "Hidden Single": "排除",
  "Naked Single": "唯一余数",
  "Locked Candidates": "区块",
  "Gurth's symmetry placement": "宇宙法",
  "Gurth's Symmetrical Placement": "宇宙法",
  "Unique Rectangle": "唯一矩形",
  "Hidden Rectangle": "隐性矩形",
  "Avoidable Rectangle": "可规避矩形",
  "Unique Loop": "唯一环",
  "UL": "唯一环",
  "Extended Rectangle": "拓展矩形",
  "Bivalue Oddagon": "双值死环",
  "Triplet Oddagon": "三值死环",
  "Junior Exocet": "初级飞鱼",
  "JE": "初级飞鱼",
  "Senior Exocet": "高级飞鱼",
  "Weak Exocet": "衰弱飞鱼",
  "Double Exocet": "双飞鱼",
  "Double Junior Exocet": "双飞鱼",
  "Double JExocet": "双飞鱼",
  "Double JE": "双飞鱼",
  "Sue de Coq": "融合待定数组",
  "Fireworks": "烟花数组",
  "X-Chain": "同数链",
  "XY-Chain": "双值格链",
  "Grouped AIC": "区块 AIC",
  "ALS Chain": "待定数组链",
  "AHS Chain": "隐性待定数组链",
  "Death Blossom": "死亡绽放",
  "Blossom Loop": "绽放环",
  "Dynamic Chain": "动态链",
  "Grouped Dynamic Chain": "区块动态链",
  "SK Loop": "多米诺环",
  "MSLS": "网",
  "Multifish": "复数鱼",
  "Brute Force": "穷举求解",
});

const TITLE_VARIANT_MARKERS = /\b(?:type\s*\d+|grouped|dual|half|complete|almost|continuous|discontinuous|complex|external\s+test|cell\s+type|region\s+type|aals\s+type|force\s+chain|fireworks|exocet|oddagon|ring|wing|bug\s*\+\s*\d+)\b/i;
const TITLE_PREFIX_FAMILIES = /(?:rectangle|uniqueness|loop|oddagon|fireworks|exocet|wing|chain|blossom|bug\s*\+|symmetry|gsp|ul\b)/i;

function normalizeTitleKey(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function genericEnglishTechniqueName(kind) {
  return TECHNIQUE_NAMES.en?.[kind] || String(kind || "");
}

function descriptionTitlePrefix(step) {
  const description = String(step?.description || "").trim();
  if (!description) return "";
  const firstLine = description.split(/\r?\n/, 1)[0].trim();
  const match = firstLine.match(/^([^:\n]{1,140}):/);
  if (!match) return "";
  const prefix = match[1].trim();
  if (!prefix || /[=<>]/.test(prefix)) return "";
  const title = String(step?.title || "").trim();
  const generic = genericEnglishTechniqueName(step?.kind);
  const prefixKey = normalizeTitleKey(prefix);
  const familyMatches = [title, generic, step?.kind]
    .map(normalizeTitleKey)
    .filter(Boolean)
    .some((value) => prefixKey.startsWith(value) || value.startsWith(prefixKey));
  return (familyMatches || (TITLE_VARIANT_MARKERS.test(prefix) && TITLE_PREFIX_FAMILIES.test(prefix))) ? prefix : "";
}

function effectiveTechniqueTitle(step = {}) {
  const title = String(step?.title || "").trim();
  const prefix = descriptionTitlePrefix(step);
  if (prefix && TITLE_VARIANT_MARKERS.test(prefix)) return prefix;
  if (title) return title;
  return genericEnglishTechniqueName(step?.kind) || String(step?.kind || "");
}

function titleIsGenericForKind(step, title = effectiveTechniqueTitle(step)) {
  const key = normalizeTitleKey(title);
  if (!key) return true;
  const aliases = new Set([
    normalizeTitleKey(step?.kind),
    normalizeTitleKey(genericEnglishTechniqueName(step?.kind)),
  ]);
  if (step?.kind === "JE") aliases.add("junior exocet");
  if (step?.kind === "UniqueLoop") aliases.add("ul");
  if (step?.kind === "GSP") aliases.add("gurth's symmetry placement");
  return aliases.has(key);
}

function translateTypeSuffixZh(value) {
  return String(value || "")
    .replace(/\(\s*Type\s*(\d+)\s*\)/gi, "（$1 型）")
    .replace(/\bType\s*(\d+)\b/gi, "$1 型");
}

function localizeKnownFamilyVariantZh(step, title) {
  let match;
  if ((match = title.match(/^Unique Rectangle\s+Type\s*(\d+)$/i))) return `唯一矩形 ${match[1]} 型`;
  if (/^Hidden Rectangle$/i.test(title)) return "隐性矩形";
  if ((match = title.match(/^Avoidable Rectangle\s+Type\s*(\d+)$/i))) return `可规避矩形 ${match[1]} 型`;
  if ((match = title.match(/^Uniqueness External Test\s+(.+)$/i))) return `唯一性技巧（${title}）`;
  if ((match = title.match(/^(?:Extended Rectangle)\s+Type\s*(\d+)$/i))) return `拓展矩形 ${match[1]} 型`;
  if ((match = title.match(/^(?:UL|Unique Loop)\s+Type\s*(\d+)$/i))) return `唯一环 ${match[1]} 型`;
  if ((match = title.match(/^Bivalue Oddagon\s*\(\s*Type\s*(\d+)\s*\)$/i))) return `双值死环 ${match[1]} 型`;
  if ((match = title.match(/^Bivalue Oddagon\s+Type\s*(\d+)$/i))) return `双值死环 ${match[1]} 型`;
  if ((match = title.match(/^Triplet Oddagon\s+Type\s*(\d+)$/i))) return `三值死环 ${match[1]} 型`;
  if (/^Dual Bivalue Oddagon$/i.test(title)) return "双值死环（Dual Bivalue Oddagon）";
  if ((match = title.match(/^BUG\s*\+\s*(\d+)(.*)$/i))) {
    const suffix = translateTypeSuffixZh(match[2]).trim();
    return suffix ? `BUG + ${match[1]}（${suffix}）` : `BUG + ${match[1]}`;
  }
  if (/^Double (?:JExocet|Junior Exocet|JE|Exocet)$/i.test(title)) return "双飞鱼";
  if (/^Almost JE4$/i.test(title)) return "Almost JE4";
  if (/Nice Loop|Complex Grouped X-Chain/i.test(title)) {
    const base = TECHNIQUE_NAMES.zh?.[step?.kind] || "链";
    return `${base}（${title}）`;
  }
  if ((match = title.match(/^Grouped\s+(.+)$/i))) {
    const inner = localizeTechniqueTitleZh({ ...step, title: match[1], description: "" }, match[1], true);
    if (/^区块/.test(inner)) return inner;
    const separator = /^[A-Za-z0-9]/.test(inner || match[1]) ? " " : "";
    return `区块${separator}${inner || match[1]}`;
  }
  if (/^(?:Half|Complete) XYZ-Ring$/i.test(title)) return `XYZ-Ring（${title.startsWith("Half") ? "Half" : "Complete"}）`;
  if (/^(?:Dual )?Fireworks\b/i.test(title)) return `烟花数组（${title}）`;
  if (/^Cell Type Blossom Loop$/i.test(title)) return "单元格型绽放环";
  if (/^Region Type Blossom Loop$/i.test(title)) return "区域型绽放环";
  if (/^AALS Type Blossom Loop$/i.test(title)) return "绽放环（AALS Type Blossom Loop）";
  if (/^Death Blossom\b/i.test(title)) return title === "Death Blossom" ? "死亡绽放" : `死亡绽放（${title}）`;
  if (/^(?:Cell|Region|UR|Triplet Oddagon) Force Chain$/i.test(title)) {
    return title
      .replace(/^Cell Force Chain$/i, "单元格强制链")
      .replace(/^Region Force Chain$/i, "区域强制链")
      .replace(/^UR Force Chain$/i, "唯一矩形强制链")
      .replace(/^Triplet Oddagon Force Chain$/i, "三值死环强制链");
  }
  if (/^AUR \+ /i.test(title)) return title;
  return "";
}

function localizeTechniqueTitleZh(step, explicitTitle = "", nested = false) {
  const title = String(explicitTitle || effectiveTechniqueTitle(step)).trim();
  if (!title) return TECHNIQUE_NAMES.zh?.[step?.kind] || String(step?.kind || "");
  if (TRUSTED_TITLE_TRANSLATIONS_ZH[title]) return TRUSTED_TITLE_TRANSLATIONS_ZH[title];
  const variant = localizeKnownFamilyVariantZh(step, title);
  if (variant) return variant;
  const genericZh = TECHNIQUE_NAMES.zh?.[step?.kind] || "";
  if (titleIsGenericForKind(step, title)) return genericZh || title;
  // No verified Chinese term: preserve the exact backend title instead of inventing one.
  if (nested) return title;
  return genericZh ? `${genericZh}（${title}）` : title;
}

export function techniqueIdentityForStep(step = {}) {
  const kind = String(step?.kind || "").trim();
  const title = effectiveTechniqueTitle(step);
  if (!kind) return normalizeTitleKey(title);
  return titleIsGenericForKind(step, title) ? kind : `${kind}:${normalizeTitleKey(title)}`;
}

const CATEGORY_NAMES = Object.freeze({
  zh: Object.freeze({
    Basic: "基础技巧",
    Subsets: "数组",
    Fish: "鱼",
    ALS: "待定数组",
    AHS: "隐性待定数组",
    "Single Digit": "单数字技巧",
    Guardian: "守护者",
    Wings: "Wing",
    Uniqueness: "唯一性",
    Oddagon: "死环",
    "Negative Rank": "负秩结构",
    Chains: "链",
    "Rank Logic": "秩逻辑",
    Exocet: "飞鱼",
    Fallback: "兜底求解",
  }),
  en: Object.freeze({}),
});

const FISH_SIZES = Object.freeze({
  XWing: 2,
  Swordfish: 3,
  Jellyfish: 4,
  FinnedXWing: 2,
  FinnedSwordfish: 3,
  FinnedJellyfish: 4,
  ComplexSwordfish: 3,
  ComplexJellyfish: 4,
  ComplexSquirmbagFish: 5,
});

const NAKED_SUBSETS = new Set(["NakedPair", "NakedTriple", "NakedQuad"]);
const HIDDEN_SUBSETS = new Set(["HiddenPair", "HiddenTriple", "HiddenQuad"]);
const FINNED_FISH = new Set(["FinnedXWing", "FinnedSwordfish", "FinnedJellyfish"]);
const COMPLEX_FISH = new Set(["ComplexSwordfish", "ComplexJellyfish", "ComplexSquirmbagFish", "Multifish"]);
const SINGLE_DIGIT_PATTERNS = new Set(["Skyscraper", "TwoStringKite", "EmptyRectangle", "ERIPair"]);
const WINGS = new Set(["WWing", "XYWing", "XYZWing", "XYZRing", "WXYZWing"]);
const UNIQUENESS = new Set(["AvoidableRectangle", "UniqueRectangle", "UniqueLoop", "ExtendedRectangle", "BUGOne", "BUGPlusN", "GSP"]);
const ODDAGONS = new Set(["BivalueOddagon", "TripletOddagon"]);
const ALS_PATTERNS = new Set([
  "AlmostPair", "AlmostTriple", "SueDeCoq", "ALSXZ", "ALSXYWing", "ALSWWing",
  "AHSXZ", "AHSXYWing", "AHSWWing", "ALSChain", "AHSChain", "DeathBlossom",
]);
const CHAINS = new Set(["XChain", "XYChain", "AIC", "GroupedAIC", "ComplexAIC", "CellRegionFC", "Whip", "GWhip", "DynamicChain", "Braid", "GBraid"]);
const RANK_PATTERNS = new Set(["SKLoop", "MSLS", "BlossomLoop"]);
const EXOCETS = new Set(["JE", "SeniorExocet", "WeakExocet"]);

const localizedDescriptionCache = new WeakMap();
const parsedGroupCache = new WeakMap();

function normalizeLocale(locale) {
  const value = String(locale || "en").toLowerCase();
  if (value === "zh" || value.startsWith("zh-")) return "zh";
  if (value === "en" || value.startsWith("en-")) return "en";
  return value;
}

function validDigits(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map(Number)
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 9))]
    .sort((a, b) => a - b);
}

function numberList(values) {
  return validDigits(values).join("、");
}

function digitsCompact(values) {
  return validDigits(values).join("");
}

function cellIndex(cell) {
  if (Number.isInteger(cell?.index)) return Number(cell.index);
  if (Number.isInteger(cell?.row) && Number.isInteger(cell?.col)) return Number(cell.row) * 9 + Number(cell.col);
  return -1;
}

function cellName(cell) {
  if (Number.isInteger(cell?.row) && Number.isInteger(cell?.col)) {
    return `r${Number(cell.row) + 1}c${Number(cell.col) + 1}`;
  }
  const index = cellIndex(cell);
  if (index >= 0 && index < 81) return `r${Math.floor(index / 9) + 1}c${(index % 9) + 1}`;
  return "?";
}

function uniqueCells(cells) {
  const seen = new Set();
  const result = [];
  for (const cell of Array.isArray(cells) ? cells : []) {
    const name = cellName(cell);
    if (name === "?" || seen.has(name)) continue;
    seen.add(name);
    result.push({ ...cell, name });
  }
  return result;
}

function cellList(cells, max = 12) {
  const names = uniqueCells(cells).map((cell) => cell.name);
  if (names.length <= max) return names.join("、");
  return `${names.slice(0, max).join("、")}等${names.length}格`;
}

function actionCandidates(action) {
  if (Array.isArray(action?.candidates)) return action.candidates;
  if (Number.isInteger(action?.candidate)) return [Number(action.candidate)];
  if (Number.isInteger(action?.value)) return [Number(action.value)];
  return [];
}

function collectConclusions(step) {
  const placements = new Map();
  const eliminations = new Map();
  const add = (target, action, operator) => {
    const name = cellName(action);
    if (name === "?") return;
    const digits = operator === "="
      ? digitsCompact([action?.value ?? action?.candidate ?? actionCandidates(action)[0]])
      : slashDigits(actionCandidates(action));
    if (!digits) return;
    const text = `${name}${operator}${digits}`;
    target.set(text, text);
  };

  for (const action of Array.isArray(step?.actions) ? step.actions : []) {
    const type = String(action?.type || "").toLowerCase();
    if (type.includes("place")) add(placements, action, "=");
    if (type.includes("eliminate")) add(eliminations, action, "<>");
  }
  for (const action of Array.isArray(step?.eliminations) ? step.eliminations : []) add(eliminations, action, "<>");

  return { placements: [...placements.values()], eliminations: [...eliminations.values()] };
}

function conclusionTextZh(step) {
  const { placements, eliminations } = collectConclusions(step);
  const parts = [];
  if (placements.length) parts.push(`出数：${placements.join("，")}`);
  if (eliminations.length) parts.push(`删数：${eliminations.join("，")}`);
  return parts.length ? `${parts.join("；")}。` : "本步没有明确的出数或删数。";
}

function primaryDigits(step) {
  const direct = numberList(step?.candidates);
  if (direct) return direct;
  const values = [];
  for (const action of Array.isArray(step?.actions) ? step.actions : []) values.push(...actionCandidates(action));
  for (const action of Array.isArray(step?.eliminations) ? step.eliminations : []) values.push(...actionCandidates(action));
  return numberList(values);
}

function placement(step) {
  return (Array.isArray(step?.actions) ? step.actions : []).find((action) => String(action?.type || "").toLowerCase().includes("place"));
}

function structureCells(step) {
  if (Array.isArray(step?.cells) && step.cells.length) return step.cells;
  const result = [];
  for (const group of Array.isArray(step?.groups) ? step.groups : []) {
    if (Array.isArray(group?.cells)) result.push(...group.cells);
  }
  return result;
}

function unitNames(cells, key, prefix) {
  return [...new Set(uniqueCells(cells)
    .map((cell) => Number(cell?.[key]))
    .filter(Number.isInteger)
    .map((value) => value + 1))]
    .sort((a, b) => a - b)
    .map((value) => `${prefix}${value}`);
}

function roleCells(step, matcher) {
  const result = [];
  for (const group of Array.isArray(step?.groups) ? step.groups : []) {
    const label = String(group?.label || group?.name || group?.role || "");
    if (matcher.test(label) && Array.isArray(group?.cells)) result.push(...group.cells);
  }
  return result;
}

function normalizeGroupHead(value) {
  return String(value || "").toLowerCase().replace(/[\s_-]+/g, "");
}

function parseCompactHouses(value) {
  const houses = [];
  const seen = new Set();
  const text = String(value || "");
  const pattern = /([rcb])([1-9]+)/gi;
  let match = null;
  while ((match = pattern.exec(text)) !== null) {
    const prefix = match[1].toLowerCase();
    for (const digit of match[2]) {
      const name = `${prefix}${digit}`;
      if (!seen.has(name)) {
        seen.add(name);
        houses.push(name);
      }
    }
  }
  return houses;
}

function parseGroupRecord(group) {
  const label = String(group?.label || group?.name || group?.role || "");
  const colon = label.indexOf(":");
  const head = colon >= 0 ? label.slice(0, colon).trim() : label.trim();
  const tail = colon >= 0 ? label.slice(colon + 1).trim() : "";
  const headKey = normalizeGroupHead(head);
  const houses = parseCompactHouses(tail);
  const digitRole = /^(alsa|alsb|alsc|ahsa|ahsb|ahsb\(pivot\)|ahsc|rcc|rccx|rccy|x|stronglink|set|petal|fin|fins|regfin|regfins|eri|pivot|pivota|pivotb)$/i.test(headKey);
  const linkRole = /^(link|stronglink)$/i.test(headKey);
  let digitText = tail;
  // Structured ALS/AHS labels use digits@house.  The house index is metadata
  // and must never be folded into the candidate set.
  if (/^(alsa|alsb|alsc|ahsa|ahsb|ahsb\(pivot\)|ahsc)$/i.test(headKey)) {
    digitText = tail.split("@", 1)[0];
  } else if (linkRole) {
    const houseAt = tail.search(/[rcb]/i);
    if (houseAt >= 0) digitText = tail.slice(0, houseAt);
  }
  const digits = digitRole || linkRole
    ? validDigits((digitText.match(/[1-9]/g) || []).map(Number))
    : [];
  const count = /^(msls|core)$/i.test(headKey) && /^\d+$/.test(tail) ? Number(tail) : 0;
  return {
    label,
    head,
    headKey,
    tail,
    houses,
    digits,
    count,
    cells: Array.isArray(group?.cells) ? group.cells : [],
  };
}

function groupRecords(step) {
  if (!step || typeof step !== "object") return [];
  const cached = parsedGroupCache.get(step);
  if (cached) return cached;
  const records = (Array.isArray(step?.groups) ? step.groups : []).map(parseGroupRecord);
  parsedGroupCache.set(step, records);
  return records;
}

function findGroup(step, matcher) {
  return groupRecords(step).find((group) => matcher.test(group.headKey)) || null;
}

function findGroups(step, matcher) {
  return groupRecords(step).filter((group) => matcher.test(group.headKey));
}

function groupCellsText(group, max = 12) {
  return group ? cellList(group.cells, max) : "";
}

function slashDigits(values) {
  return validDigits(values).join("/");
}

function candidateDigitsForCells(step, cells) {
  const indexes = new Set(uniqueCells(cells).map((cell) => cellIndex(cell)).filter((index) => index >= 0));
  const values = [];
  for (const item of Array.isArray(step?.colorCands) ? step.colorCands : []) {
    if (Number(item?.color) === 11 || !indexes.has(cellIndex(item))) continue;
    values.push(...(Array.isArray(item?.candidates) ? item.candidates : []));
  }
  return validDigits(values);
}

function eliminationDigits(step) {
  const values = [];
  for (const item of Array.isArray(step?.eliminations) ? step.eliminations : []) values.push(...actionCandidates(item));
  for (const item of Array.isArray(step?.actions) ? step.actions : []) {
    if (String(item?.type || "").toLowerCase().includes("eliminate")) values.push(...actionCandidates(item));
  }
  return validDigits(values);
}

function nodeState(node) {
  const match = String(node?.label || "").match(/\b(ON|OFF)\s*$/i);
  return match ? match[1].toUpperCase() : "";
}

function nodeCandidateText(node) {
  const digit = Number(node?.digit || 0);
  const cells = Array.isArray(node?.sectorCells) && node.sectorCells.length
    ? cellList(node.sectorCells, 8)
    : cellName(node);
  if (!digit || !cells || cells === "?") return String(node?.label || "候选节点").replace(/\s+(ON|OFF)\s*$/i, "");
  return `${digit}${cells}`;
}

function dynamicContradictionText(step) {
  const states = new Map();
  for (const branch of Array.isArray(step?.chainBranches) ? step.chainBranches : []) {
    const nodes = Array.isArray(branch?.nodes) ? branch.nodes : [];
    if (!nodes.length) continue;
    const node = nodes[nodes.length - 1];
    const state = nodeState(node);
    if (!state) continue;
    const sector = (Array.isArray(node?.sectorCells) ? node.sectorCells : [])
      .map((cell) => cellIndex(cell))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)
      .join(",");
    const key = `${Number(node?.digit || 0)}:${sector || cellIndex(node)}`;
    if (!states.has(key)) states.set(key, { node, values: new Set() });
    states.get(key).values.add(state);
  }
  for (const entry of states.values()) {
    if (entry.values.has("ON") && entry.values.has("OFF")) {
      return `${nodeCandidateText(entry.node)}同时被推出成立和不成立`;
    }
  }
  return "不同推理分支导出互相冲突的结论";
}

function rankedTechniqueName(step, locale) {
  const base = techniqueNameForStep(step, locale);
  const rank = Number(step?.rank || 0);
  return rank > 0 && /^(Whip|GWhip|Braid|GBraid)$/i.test(String(step?.kind || "")) && !/\[\d+\]/.test(base)
    ? `${base}[${rank}]`
    : base;
}

// Technical chain/Eureka notation is language-neutral solver output.  Chinese
// prose may explain it, but must never replace it.  Keep extraction display-only
// and restricted to final StepResult descriptions; no solver/worker hot path uses it.
const LINEAR_CHAIN_NOTATION_KINDS = new Set([
  "XChain", "XYChain", "AIC", "GroupedAIC", "ComplexAIC",
  "Whip", "GWhip", "Braid", "GBraid", "CellRegionFC", "DynamicChain",
  "ALSChain", "AHSChain", "DeathBlossom", "BlossomLoop",
]);

function looksLikeTechnicalNotation(text) {
  const value = String(text || "").trim();
  return /(?:\br\d+(?:c\d+)?|\bc\d+|\bb\d+|=>|->|\s[=-]\s|\([^)]*[=-][^)]*\))/.test(value);
}

function stripTechniquePrefix(text) {
  const value = String(text || "").trim();
  const colon = value.indexOf(":");
  if (colon < 0) return value;
  const head = value.slice(0, colon);
  const body = value.slice(colon + 1).trim();
  return /[A-Za-z]/.test(head) && looksLikeTechnicalNotation(body) ? body : value;
}

function technicalChainNotation(step) {
  const kind = String(step?.kind || "");
  if (!LINEAR_CHAIN_NOTATION_KINDS.has(kind)) return "";
  const description = String(step?.description || "").trim();
  if (!description) return "";
  const lines = description.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (kind === "Whip" || kind === "GWhip") {
    // The first line is English prose; the following line(s) are the actual
    // reference-style chain and are valid in every UI language.
    const notation = lines.slice(1).filter(looksLikeTechnicalNotation).join("\n");
    return notation || (lines.length === 1 ? stripTechniquePrefix(lines[0]) : "");
  }

  if (kind === "CellRegionFC") {
    // Keep every assumption branch, but drop the English contradiction clause
    // after '|'; the localized prose already states the common conclusion.
    let body = stripTechniquePrefix(lines.join(" "));
    body = body.split("|")[0].trim();
    return looksLikeTechnicalNotation(body) ? body : "";
  }

  if (kind === "DynamicChain") {
    // Dynamic proof text is a branch list rather than one Eureka line.  Keep all
    // branch expressions, translate only the structural labels, and omit the
    // English first-line summary because the localized paragraph already covers it.
    return lines.slice(1).map((line) => line
      .replace(/^ON conclusion:\s*$/i, "成立分支：")
      .replace(/^OFF conclusion:\s*$/i, "不成立分支：")
      .replace(/^Chain\s*(\d+):\s*/i, "链$1："))
      .join("\n");
  }

  if (kind === "DeathBlossom") {
    // The first line is an English summary.  Remaining lines are petal chains.
    return lines.slice(1).filter(looksLikeTechnicalNotation).join("\n");
  }

  if (kind === "BlossomLoop") {
    // Preserve the loop/branch expressions while localizing their labels.
    return lines.slice(1).map((line) => line
      .replace(/^Burring Loop:\s*/i, "主环：")
      .replace(/^Burr Branch\s*(\d+):\s*/i, "分支$1："))
      .filter(looksLikeTechnicalNotation)
      .join("\n");
  }

  // AIC/X-Chain/ALS-Chain/Braid descriptions are already Eureka notation.
  const notation = stripTechniquePrefix(description);
  return looksLikeTechnicalNotation(notation) ? notation : "";
}

function appendTechnicalChainNotation(localizedText, step) {
  const notation = technicalChainNotation(step);
  if (!notation || String(localizedText || "").includes(notation)) return localizedText;
  return `${localizedText}\n链式：${notation}`;
}

function fishAxes(step, size) {
  const cells = structureCells(step);
  const rows = unitNames(cells, "row", "r");
  const cols = unitNames(cells, "col", "c");
  const eliminations = Array.isArray(step?.eliminations) ? step.eliminations : [];
  const erows = new Set(unitNames(eliminations, "row", "r"));
  const ecols = new Set(unitNames(eliminations, "col", "c"));
  if (rows.length === size && cols.length === size) {
    const rowsAsBase = [...ecols].some((value) => cols.includes(value)) && [...erows].some((value) => !rows.includes(value));
    const colsAsBase = [...erows].some((value) => rows.includes(value)) && [...ecols].some((value) => !cols.includes(value));
    if (rowsAsBase && !colsAsBase) return { bases: rows, covers: cols };
    if (colsAsBase && !rowsAsBase) return { bases: cols, covers: rows };
    return { bases: rows, covers: cols };
  }
  return { bases: rows, covers: cols };
}

function formatFishZh(step, name) {
  const digit = primaryDigits(step) || "目标数字";
  const size = FISH_SIZES[step?.kind] || 0;
  const { bases, covers } = fishAxes(step, size);
  const axes = bases.length && covers.length
    ? `数字${digit}在${bases.join("、")}中的候选位置全部落在${covers.join("、")}`
    : `数字${digit}形成${name}结构`;
  if (FINNED_FISH.has(step?.kind)) {
    const fins = roleCells(step, /fin|鳍/i);
    const finText = fins.length ? `，鳍为${cellList(fins)}` : "，并带有鳍候选";
    return `${name}：${axes}${finText}。只有鱼结构成立与鳍候选为真两种情况下都能排除的候选才可删除。${conclusionTextZh(step)}`;
  }
  if (COMPLEX_FISH.has(step?.kind)) {
    const baseGroup = findGroup(step, /^base$/i);
    const coverGroup = findGroup(step, /^cover$/i);
    const finGroups = findGroups(step, /fin/i);
    const baseText = baseGroup?.houses?.length ? baseGroup.houses.join("、") : "若干行、列或宫";
    const coverText = coverGroup?.houses?.length ? coverGroup.houses.join("、") : "对应覆盖单元";
    const fins = finGroups.flatMap((group) => group.cells);
    const finText = fins.length ? `；鳍候选位于${cellList(fins)}` : "";
    return `${name}：数字${digit}以${baseText}为基础单元，以${coverText}为覆盖单元${finText}。基础单元与覆盖单元的容量关系锁定了结构外候选。${conclusionTextZh(step)}`;
  }
  return `${name}：${axes}，构成${name}。${conclusionTextZh(step)}`;
}

function formatSubsetZh(step, name, hidden) {
  const cells = cellList(structureCells(step)) || "这些格";
  const digits = primaryDigits(step) || "相关数字";
  const house = String(step?.house || "相关单元");
  return hidden
    ? `${name}：数字${digits}在${house}中只出现在${cells}，因此这些格不能再保留其他候选数。${conclusionTextZh(step)}`
    : `${name}：${cells}在${house}中锁定数字${digits}，因此可从同一单元的其他格删去这些数字。${conclusionTextZh(step)}`;
}

function formatSingleDigitPatternZh(step, name) {
  const digit = primaryDigits(step) || "目标数字";
  const cells = cellList(structureCells(step));
  const reason = {
    Skyscraper: "两组共轭对形成交错结构，两个远端至少有一个为真",
    TwoStringKite: "一行与一列的共轭对通过同一宫相连，两个远端至少有一个为真",
    EmptyRectangle: "宫内空矩形结构与外部共轭对构成短链",
    ERIPair: "两个空矩形交叉结构共同限制目标候选",
  }[step?.kind] || "单数字结构共同限制目标候选";
  return `${name}：围绕数字${digit}${cells ? `在${cells}形成结构` : "形成结构"}；${reason}。${conclusionTextZh(step)}`;
}

function formatWingZh(step, name) {
  const cells = cellList(structureCells(step));
  const digits = primaryDigits(step);
  const digitText = digits ? `，涉及数字${digits}` : "";
  const details = {
    WWing: "两个双值格通过中间的强链关系相连，链的两端共同限制目标候选",
    XYWing: "枢轴格与两个翼格形成XY-Wing；无论枢轴取哪一个值，两个翼格中至少有一个会占用共同候选数",
    XYZWing: "枢轴格与两个翼格覆盖共同候选数的全部分支",
    XYZRing: "XYZ-Wing式推理首尾闭合成环",
    WXYZWing: "相关格构成四数字的Wing或待定数组结构",
  }[step?.kind] || "相关格形成Wing结构";
  return `${name}：${details}${cells ? `，结构格为${cells}` : ""}${digitText}。${conclusionTextZh(step)}`;
}

function formatUniquenessZh(step, name) {
  const cells = cellList(structureCells(step));
  if (step?.kind === "GSP") {
    return `${name}：若保留目标候选，盘面会形成与唯一解冲突的全局对称摆放。${conclusionTextZh(step)}`;
  }
  if (step?.kind === "BUGOne" || step?.kind === "BUGPlusN") {
    return `${name}：若不处理额外候选，余下盘面会进入全双值格致死状态，与题目的唯一解要求冲突。${conclusionTextZh(step)}`;
  }
  return `${name}：${cells ? `${cells}构成致命结构；` : ""}若保留目标候选，会出现可互换的另一种完成方式，与唯一解要求冲突。${conclusionTextZh(step)}`;
}

function formatOddagonZh(step, name) {
  const cells = cellList(structureCells(step));
  return `${name}：${cells ? `${cells}构成奇数死环；` : ""}若所有守护候选都为假，结构将进入无解状态，因此至少有一个守护候选必须为真。${conclusionTextZh(step)}`;
}

function formatAlsZh(step, name) {
  const cells = cellList(structureCells(step));
  const digits = primaryDigits(step);
  const describeAhs = (group, label) => {
    if (!group) return "";
    const digitSet = validDigits(group.digits).join("") || "相关数字";
    const house = group.houses.join("/") || "相关house";
    const positions = groupCellsText(group) || "相关格组";
    return `${label}=${digitSet}@${house}{${positions}}`;
  };
  const describeAls = (group, label) => {
    if (!group) return "";
    const digitText = group.digits.length ? `，候选数为${slashDigits(group.digits)}` : "";
    return `${label}为${groupCellsText(group)}${digitText}`;
  };

  if (step?.kind === "AlmostPair" || step?.kind === "AlmostTriple") {
    const ahs = findGroup(step, /^ahs$/i);
    const als = findGroup(step, /^als$/i);
    const parts = [];
    if (ahs) parts.push(`隐性待定部分为${groupCellsText(ahs)}`);
    if (als) parts.push(`显性待定部分为${groupCellsText(als)}`);
    const detail = parts.length ? `${parts.join("；")}。` : "相关格比锁定数组多一个自由候选。";
    return `${name}：${detail}两部分共同占用的候选容量受到同一单元约束。${conclusionTextZh(step)}`;
  }

  if (step?.kind === "AHSXZ") {
    const a = findGroup(step, /^ahsa$/i);
    const b = findGroup(step, /^ahsb$/i);
    const rcc = findGroup(step, /^rcc$/i);
    const branch = findGroup(step, /^branch$/i)?.tail || "AHS-XZ";
    const parts = [describeAhs(a, "AHS A"), describeAhs(b, "AHS B")].filter(Boolean);
    const x = slashDigits(rcc?.digits || []);
    if (x) parts.push(`受限公共候选数X=${x}`);
    else if (rcc?.tail) parts.push(`RCC=${rcc.tail}`);
    return `${name}（${branch}）：${parts.join("；")}。先按候选数组合与house确认AHS，再核对对应格位及RCC证明。${conclusionTextZh(step)}`;
  }

  if (step?.kind === "AHSXYWing") {
    const a = findGroup(step, /^ahsa$/i);
    const b = findGroup(step, /^ahsb(?:\(pivot\))?$/i);
    const c = findGroup(step, /^ahsc$/i);
    const rccX = findGroup(step, /^rccx$/i);
    const rccY = findGroup(step, /^rccy$/i);
    const parts = [describeAhs(a, "AHS A"), describeAhs(b, "枢纽AHS B"), describeAhs(c, "AHS C")].filter(Boolean);
    if (rccX?.tail) parts.push(`RCC X=${rccX.tail}`);
    if (rccY?.tail) parts.push(`RCC Y=${rccY.tail}`);
    return `${name}：${parts.join("；")}。AHS必须先读候选数组合@house，再核对Extra事件、局部HLS格组和逐数字支撑位置。${conclusionTextZh(step)}`;
  }

  if (step?.kind === "AHSWWing") {
    const a = findGroup(step, /^ahsa$/i);
    const b = findGroup(step, /^ahsb$/i);
    const pivot = findGroup(step, /^pivot$/i);
    const pivotA = findGroup(step, /^pivota$/i);
    const pivotB = findGroup(step, /^pivotb$/i);
    const parts = [describeAhs(a, "AHS A")].filter(Boolean);
    if (pivot) {
      const pivotDigits = validDigits(pivot.digits).join("") || "相关候选";
      const pivotCells = groupCellsText(pivot) || "枢纽格";
      const splitA = validDigits(pivotA?.digits).join("") || "A端组";
      const splitB = validDigits(pivotB?.digits).join("") || "B端组";
      parts.push(`枢纽=${pivotDigits}@${pivotCells}（${splitA}|${splitB}）`);
    }
    if (b) parts.push(describeAhs(b, "AHS B"));
    return `${name}：${parts.join("；")}。两端AHS均先按候选数组合与house阅读，再核对枢纽分组、Extra事件、HLS格组和支撑位置。${conclusionTextZh(step)}`;
  }

  if (step?.kind === "ALSXZ") {
    const a = findGroup(step, /^alsa$/i);
    const b = findGroup(step, /^alsb$/i);
    const rcc = findGroup(step, /^rcc$/i);
    const link = findGroup(step, /^link$/i);
    const x = slashDigits(rcc?.digits || []);
    const z = slashDigits(link?.digits?.length ? link.digits : eliminationDigits(step));
    const parts = [describeAls(a, "待定数组A"), describeAls(b, "待定数组B")].filter(Boolean);
    if (x) parts.push(`严格公共候选数X=${x}`);
    if (z) parts.push(`共同删数候选Z=${z}`);
    return `${name}：${parts.join("；")}。X不能同时在两个待定数组中取真，因此Z在两个数组外同时可见的位置不能成立。${conclusionTextZh(step)}`;
  }

  if (step?.kind === "ALSXYWing") {
    const a = findGroup(step, /^alsa$/i);
    const b = findGroup(step, /^alsb$/i);
    const c = findGroup(step, /^alsc$/i);
    const rccX = findGroup(step, /^rccx$/i);
    const rccY = findGroup(step, /^rccy$/i);
    const z = slashDigits(eliminationDigits(step));
    const parts = [describeAls(a, "待定数组A"), describeAls(b, "待定数组B"), describeAls(c, "待定数组C")].filter(Boolean);
    if (rccX?.digits?.length) parts.push(`A与B以X=${slashDigits(rccX.digits)}相连`);
    if (rccY?.digits?.length) parts.push(`B与C以Y=${slashDigits(rccY.digits)}相连`);
    return `${name}：${parts.join("；")}。无论中间数组B如何取值，A或C中至少一侧会占用连接关系${z ? `，所以共同候选Z=${z}` : ""}可在同时可见的位置删去。${conclusionTextZh(step)}`;
  }

  if (step?.kind === "ALSWWing") {
    const a = findGroup(step, /^alsa$/i);
    const b = findGroup(step, /^alsb$/i);
    const strong = findGroup(step, /^stronglink$/i);
    const z = slashDigits(eliminationDigits(step));
    const parts = [describeAls(a, "待定数组A"), describeAls(b, "待定数组B")].filter(Boolean);
    if (strong?.digits?.length) parts.push(`外部强链数字为${slashDigits(strong.digits)}`);
    return `${name}：${parts.join("；")}。外部强链保证两个待定数组中至少有一侧承担连接数字${z ? `，因此共同候选${z}` : ""}可从同时看见两侧的位置删去。${conclusionTextZh(step)}`;
  }

  if (step?.kind === "DeathBlossom") {
    const core = findGroup(step, /^set$/i);
    const petals = findGroups(step, /^petal$/i);
    const coreDigits = slashDigits(core?.digits || []);
    const petalSummary = petals.slice(0, 6).map((petal, index) => {
      const pd = slashDigits(petal.digits);
      return `花瓣${index + 1}=${groupCellsText(petal)}${pd ? `{${pd}}` : ""}`;
    }).join("、");
    return `${name}：核心集合为${groupCellsText(core) || "相关枢轴格"}${coreDigits ? `，候选数为${coreDigits}` : ""}；共连接${petals.length}个待定数组${petalSummary ? `（${petalSummary}）` : ""}。核心集合的每一种取值都会在某个花瓣中导出同一结论。${conclusionTextZh(step)}`;
  }

  if (step?.kind === "ALSChain" || step?.kind === "AHSChain") {
    const nodes = Array.isArray(step?.nodes) ? step.nodes : [];
    const structured = nodes.filter((node) => /als|ahs/i.test(String(node?.kind || ""))).length;
    return `${name}：链中包含${nodes.length || "若干"}个节点${structured ? `，其中${structured}个为待定数组节点` : ""}。待定数组之间通过严格公共候选数依次连接，链端共同限制目标候选。${conclusionTextZh(step)}`;
  }

  const reason = {
    SueDeCoq: "行列与宫交叉处的候选容量被两侧数组共同锁定",
    AHSXZ: "两个隐性待定数组通过共享关系相连",
    AHSXYWing: "三个隐性待定数组形成XY-Wing式关系",
    AHSWWing: "两个隐性待定数组通过外部强链相连",
  }[step?.kind] || "待定数组之间形成稳定的候选约束";
  return `${name}：${reason}${cells ? `，结构格为${cells}` : ""}${digits ? `，涉及数字${digits}` : ""}。${conclusionTextZh(step)}`;
}

function formatChainZh(step, name) {
  const nodeCount = Array.isArray(step?.nodes) ? step.nodes.length : 0;
  const edgeCount = Array.isArray(step?.edges) ? step.edges.length : 0;
  const scale = nodeCount ? `链中包含${nodeCount}个节点${edgeCount ? `、${edgeCount}条关系` : ""}` : "沿链中的强弱关系推进";
  const nodes = Array.isArray(step?.nodes) ? step.nodes : [];
  const groupedCount = nodes.filter((node) => /group/i.test(String(node?.kind || ""))).length;
  const alsCount = nodes.filter((node) => /als|ahs/i.test(String(node?.kind || ""))).length;
  const nodeTypes = [groupedCount ? `${groupedCount}个区块节点` : "", alsCount ? `${alsCount}个待定数组节点` : ""].filter(Boolean).join("、");

  if (step?.kind === "Whip" || step?.kind === "GWhip") {
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const assumption = first ? nodeCandidateText(first) : "目标候选";
    const endpoint = last ? nodeCandidateText(last) : "末端候选";
    return `${name}：假设${assumption}成立，沿${Number(step?.rank || 0) || Math.max(1, Math.ceil(nodeCount / 2))}层候选关系推进${nodeTypes ? `（含${nodeTypes}）` : ""}，最终使${endpoint}在末端约束中无法满足。原假设不成立。${conclusionTextZh(step)}`;
  }

  if (step?.kind === "DynamicChain") {
    const branches = Array.isArray(step?.chainBranches) ? step.chainBranches : [];
    const onCount = branches.filter((branch) => /^on\b/i.test(String(branch?.label || ""))).length;
    const offCount = branches.filter((branch) => /^off\b/i.test(String(branch?.label || ""))).length;
    const first = branches.find((branch) => Array.isArray(branch?.nodes) && branch.nodes.length)?.nodes?.[0] || nodes[0];
    const assumption = first ? nodeCandidateText(first) : "目标候选";
    return `${name}：以${assumption}为假设，展开${branches.length || "多个"}条动态推理分支${onCount || offCount ? `（正向${onCount}条、反向${offCount}条）` : ""}；${dynamicContradictionText(step)}，因此假设不成立。${conclusionTextZh(step)}`;
  }

  if (step?.kind === "CellRegionFC") {
    const branches = Array.isArray(step?.chainBranches) ? step.chainBranches : [];
    const assumptions = branches.map((branch) => {
      const first = Array.isArray(branch?.nodes) ? branch.nodes[0] : null;
      return first ? nodeCandidateText(first) : "";
    }).filter(Boolean);
    const shown = [...new Set(assumptions)].slice(0, 8).join("、");
    return `${name}：对目标单元的${branches.length || "全部"}种可能分别建立分支${shown ? `（${shown}）` : ""}，所有分支都导出共同结论。${conclusionTextZh(step)}`;
  }

  const reason = {
    XChain: "同一数字的强链与弱链交替连接，链的两端不能同时为假",
    XYChain: "双值格中的异数强链与同数弱链交替连接，链的两端不能同时为假",
    AIC: "交替推理链的强弱关系逐步传递，链端共同限制目标候选",
    GroupedAIC: "将同一区域内的一组候选视为节点后，强弱关系交替传递",
    ComplexAIC: "复合节点之间的强弱关系交替传递",
    CellRegionFC: "分别讨论单元格或区域内的全部可能分支，各分支得到共同结论",
    Whip: "假设目标候选为真后，候选关系逐步收紧并最终产生矛盾",
    GWhip: "将候选组视为节点后，假设目标候选为真会逐步导出矛盾",
    DynamicChain: "分支内允许继续调用子推理，所有有效分支最终得到共同结论或矛盾",
    Braid: "多个可回接的推理分支共同排除目标候选",
    GBraid: "将候选组视为节点后，多个可回接分支共同排除目标候选",
  }[step?.kind] || "强弱关系沿链传递并共同限制目标候选";
  return `${name}：${scale}；${reason}。${conclusionTextZh(step)}`;
}

function formatRankZh(step, name) {
  const cells = cellList(structureCells(step));
  const rank = Number(step?.rank || 0);
  const links = findGroups(step, /^link$/i);
  const linkText = links.slice(0, 10).map((link) => {
    const digits = slashDigits(link.digits);
    const houses = link.houses.join("、");
    return `${digits || "候选"}${houses ? `@${houses}` : ""}`;
  }).join("，");
  if (step?.kind === "MSLS") {
    const core = findGroup(step, /^msls$/i);
    const count = core?.count || uniqueCells(core?.cells || []).length || uniqueCells(structureCells(step)).length;
    return `${name}：${count || "若干"}个核心格与${links.length || "若干"}组链接构成零秩网${linkText ? `（${linkText}）` : ""}。每个真数都被链接容量完整覆盖，因此结构外与这些链接冲突的候选不能成立。${conclusionTextZh(step)}`;
  }
  if (step?.kind === "SKLoop") {
    return `${name}：${links.length || "若干"}组双数字链接首尾闭合${linkText ? `（${linkText}）` : ""}，形成多米诺环。环内每一段的候选容量互相锁定。${conclusionTextZh(step)}`;
  }
  const reason = {
    SKLoop: "分段融合待定数组首尾闭合成多米诺环，结构内的候选容量被完全锁定",
    MSLS: "相关单元与候选构成网状零秩结构，结构内的真数和链接容量达到平衡",
    BlossomLoop: "绽放分支首尾闭合成环，各分支共同限制结构外候选",
  }[step?.kind] || "结构满足秩约束";
  return `${name}：${reason}${rank ? `（秩${rank}）` : ""}${cells ? `，结构格为${cells}` : ""}。${conclusionTextZh(step)}`;
}

function localizeDescriptionTitlePrefixesZh(step, text) {
  return String(text || "").split(/\r?\n/).map((line) => {
    const match = line.match(/^(\s*)([^:\n]{1,140})(:)(.*)$/);
    if (!match) return line;
    const [, indent, prefix, , rest] = match;
    const candidateStep = { ...step, title: prefix.trim(), description: "" };
    const localized = localizeTechniqueTitleZh(candidateStep, prefix.trim());
    const plausible = TITLE_PREFIX_FAMILIES.test(prefix) || TITLE_VARIANT_MARKERS.test(prefix) ||
      normalizeTitleKey(prefix) === normalizeTitleKey(step?.title) ||
      normalizeTitleKey(prefix) === normalizeTitleKey(genericEnglishTechniqueName(step?.kind));
    return plausible && localized ? `${indent}${localized}：${rest}` : line;
  }).join("\n");
}

function localizeAlmostJe4ProofZh(text) {
  const translateAlmostProof = (_match, metDigits, missingDigit, contradictionCell = "") =>
    `${metDigits}满足 S-cell 条件，但${missingDigit}不满足；若两组 JE 的基准单元格都含有${missingDigit}，将导致矛盾` +
    `${contradictionCell ? `（经 Single + LC 推导，${contradictionCell.trim()} 为空）` : ""} =>`;
  return String(text || "")
    .replace(
      /([1-9]+)\s+meet the S-cell requirements,\s*but\s+([1-9]+)\s+is not satisfied\.\s*If both JE bases have\s+\2,\s*this leads to a contradiction(?:\s*\(Single \+ LC -> Empty:\s*([^)]+)\))?\s*=>/gi,
      translateAlmostProof,
    )
    .replace(
      /([1-9]+)\s+Meet the requirements of\s+s\s*-\s*cells,\s*but\s+([1-9]+)\s+is not satisfied!\s*If both JE bases have\s+\2,\s*this will lead to a contradiction!(?:\s*\(Single \+ LC -> Empty:\s*([^)]+)\))?\s*=>/g,
      translateAlmostProof,
    );
}

function localizeBackendDescriptionZh(step) {
  let text = String(step?.description || "").trim().replace(/\r\n/g, "\n");
  if (!text) return "";

  text = localizeAlmostJe4ProofZh(text);
  text = localizeDescriptionTitlePrefixesZh(step, text);

  // Only replace terms whose Chinese names are verified or whose meaning is
  // structurally unambiguous. Unknown technique names remain in English.
  const replacements = [
    [/Double JE - second Junior Exocet:/gi, "双飞鱼－第二个初级飞鱼："],
    [/Double JE - See all target\/base cells:/gi, "双飞鱼－同时看见全部目标单元格/基准单元格："],
    [/Double JE - True Base Cands in non-'S' cells:/gi, "双飞鱼－非 S-cell 中基准单元格里的真数："],
    [/Double JE - Three true base cands share cover house:/gi, "双飞鱼－三个基准真数共用同一覆盖区域："],
    [/Double JE - /gi, "双飞鱼－"],
    [/Base Cells-/gi, "基准单元格-"],
    [/Base Cell-/gi, "基准单元格-"],
    [/Target Cells-/gi, "目标单元格-"],
    [/Target Cell-/gi, "目标单元格-"],
    [/Crossline Cells-/gi, "交叉单元格-"],
    [/Cross Cells-/gi, "交叉单元格-"],
    [/Mirror Cells?/gi, "镜面单元格"],
    [/Cover-line cleanup:/gi, "覆盖线清理："],
    [/See all four base cells:/gi, "同时看见四个基准单元格："],
    [/Target Cells Check:/gi, "目标单元格检查："],
    [/Check X-Rule:/gi, "X 区域致命定理检查："],
    [/Mirror Check:/gi, "镜面单元格检查："],
    [/True Base digits in non-'S' cells:/gi, "非 S-cell 中基准单元格里的真数："],
    [/True Base digits:/gi, "基准单元格中的真数："],
    [/True Base Cands in non-'S' cells:/gi, "非 S-cell 中基准单元格里的真数："],
    [/True Base Cands?/gi, "基准单元格中的真数"],
    [/BaseCand only one cover house in cross-line:/gi, "基准候选数在交叉单元格中只落入一个覆盖区域："],
    [/Locked Member In Target:/gi, "目标单元格中的锁定成员："],
    [/Locked Member in T1:/gi, "T1 中的锁定成员："],
    [/Locked Member in T2:/gi, "T2 中的锁定成员："],
    [/Non BaseCands In Target Cells:/gi, "目标单元格中的非基准候选数："],
    [/True BaseCands False In Another Target:/gi, "基准真数在另一目标单元格中为假："],
    [/True BaseCands False In Base Cells Constraint:/gi, "受基准单元格约束而为假的基准真数："],
    [/Non Compatible BaseCands Check:/gi, "不兼容的基准候选数检查："],
    [/Potential Target seats in one cover house for cross-line:/gi, "交叉单元格在同一覆盖区域中的潜在目标位置："],
    [/Digit ([1-9]+) In Target House Only Seat Either In Target Or Seen Both Base Cells:/gi, "数字 $1 在目标区域中的唯一位置只能位于目标单元格，或同时看见两个基准单元格："],
    [/\bWith Naked Pair\b/gi, "结合显性数对"],
    [/\bWith Naked Triple\b/gi, "结合显性三数组"],
    [/\bWith Naked Quad(?:ruple)?\b/gi, "结合显性四数组"],
    [/\bWith conjugate pair\b/gi, "结合共轭对"],
    [/\bis fireworks\b/gi, "构成烟花数组"],
    [/Need rearrange rows to\s*/gi, "需要将行重排为 "],
    [/Need rearrange cols to\s*/gi, "需要将列重排为 "],
    [/Axisymmetric Conjugate Pair:/gi, "轴对称共轭对："],
    [/Candidate mapping:/gi, "数字映射："],
    [/Burring Loop:/gi, "毛刺环（Burring Loop）："],
    [/Burr Branch\s*(\d+):/gi, "毛刺分支 $1："],
    [/Anti-phase AIC:/gi, "反相 AIC（Anti-phase AIC）："],
    [/ON conclusion:/gi, "成立分支："],
    [/OFF conclusion:/gi, "不成立分支："],
    [/Chain\s*(\d+):/gi, "链 $1："],
    [/JEPOM:/gi, "JEPOM："],
  ];
  for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement);

  return text
    .replace(/\bType\s*(\d+)\b/gi, "$1 型")
    .replace(/：[ \t]+/g, "：")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function descriptionHasConclusion(step, text) {
  const value = String(text || "");
  if (/=>|<>|\br\d+c\d+\s*=/.test(value)) return true;
  const { placements, eliminations } = collectConclusions(step);
  return [...placements, ...eliminations].some((item) => value.includes(item));
}

function preserveBackendProofZh(step) {
  const description = String(step?.description || "").trim();
  if (!description) return "";
  const title = effectiveTechniqueTitle(step);
  const variant = !titleIsGenericForKind(step, title);
  const alwaysPreserve = new Set([
    "GSP", "AvoidableRectangle", "UniqueRectangle", "UniqueLoop", "ExtendedRectangle",
    "BUGOne", "BUGPlusN", "BivalueOddagon", "TripletOddagon", "Fireworks",
    "XChain", "XYChain", "AIC", "GroupedAIC", "ComplexAIC", "CellRegionFC",
    "Whip", "GWhip", "DynamicChain", "Braid", "GBraid", "SKLoop", "MSLS",
    "Multifish", "JE", "SeniorExocet", "WeakExocet", "DeathBlossom",
    "ALSChain", "AHSChain", "BlossomLoop",
  ]).has(String(step?.kind || ""));
  if (!variant && !alwaysPreserve && !/\n|Base Cells|Target Cells|Cross(?:line)? Cells|Mirror Check|Burring Loop|Burr Branch/i.test(description)) return "";

  let localized = localizeBackendDescriptionZh(step);
  if (!localized) return "";
  if (!descriptionHasConclusion(step, localized)) localized += `\n${conclusionTextZh(step)}`;
  return localized;
}

function localizeExocetDescriptionZh(description, step = {}) {
  return localizeBackendDescriptionZh({ ...step, description });
}

function formatExocetZh(step, name) {
  // Backend Exocet descriptions contain the authoritative structure and proof
  // details. Chinese localization must translate in place, never regenerate a
  // shorter generic paragraph that discards Almost/Double JE information.
  const localizedBackendDescription = localizeExocetDescriptionZh(step?.description, step);
  if (localizedBackendDescription) return localizedBackendDescription;

  const baseGroups = findGroups(step, /^base(?:\s+[ab])?$/i);
  const targetGroups = findGroups(step, /^targets?(?:\s+[qrab])?$/i);
  const cross = findGroup(step, /^cross$/i);
  const weakSeat = findGroup(step, /^weakseat$/i);
  const bases = uniqueCells(baseGroups.flatMap((group) => group.cells || []));
  const fallbackBases = bases.length ? bases : roleCells(step, /base|基/i);
  const baseDigits = candidateDigitsForCells(step, fallbackBases);
  const parts = [];
  if (fallbackBases.length) parts.push(`基准单元格为${cellList(fallbackBases)}`);
  if (baseDigits.length) parts.push(`基准单元格中的候选数为${slashDigits(baseDigits)}`);
  for (const target of targetGroups) parts.push(`${target.name || "目标单元格"}为${groupCellsText(target)}`);
  if (cross) parts.push(`交叉单元格共${uniqueCells(cross.cells).length}格`);
  if (weakSeat) parts.push(`弱位为${groupCellsText(weakSeat)}`);
  return `${name}：${parts.length ? parts.join("；") : "基准单元格与目标单元格形成飞鱼结构"}。基准单元格中的真数必须由目标区域承接，因此违反承接、交叉单元格或目标单元格检查的候选不能成立。${conclusionTextZh(step)}`;
}

function formatZhStep(step) {
  if (!step || typeof step !== "object") return "";
  const kind = String(step.kind || "");
  const name = rankedTechniqueName(step, "zh");
  const candidate = primaryDigits(step);
  const target = placement(step);
  const backendProof = preserveBackendProofZh(step);
  if (backendProof) return backendProof;

  if (kind === "NakedSingle" && target) {
    const digit = Number(target.value ?? actionCandidates(target)[0]);
    return `${name}：${cellName(target)}只剩候选数${digit}，所以${cellName(target)}=${digit}。`;
  }
  if (kind === "HiddenSingle" && target) {
    const digit = Number(target.value ?? actionCandidates(target)[0] ?? step?.candidates?.[0]);
    return `${name}：数字${digit}在${String(step.house || "相关单元")}中只有${cellName(target)}可以填入，所以${cellName(target)}=${digit}。`;
  }
  if (kind === "FullHouse" && target) {
    const digit = Number(target.value ?? actionCandidates(target)[0]);
    return `${name}：${String(step.house || "相关单元")}只剩${cellName(target)}未填，缺少数字${digit}，所以${cellName(target)}=${digit}。`;
  }
  if (kind === "LockedCandidates") {
    const cells = cellList(structureCells(step));
    return `${name}：数字${candidate || "目标数字"}在${String(step.house || "相关单元")}中的位置被锁定${cells ? `于${cells}` : "在同一行、列或宫内"}，因此可从交叉单元的其他位置删去该数字。${conclusionTextZh(step)}`;
  }
  if (NAKED_SUBSETS.has(kind)) return formatSubsetZh(step, name, false);
  if (HIDDEN_SUBSETS.has(kind)) return formatSubsetZh(step, name, true);
  if (FISH_SIZES[kind] || kind === "Multifish") return formatFishZh(step, name);
  if (SINGLE_DIGIT_PATTERNS.has(kind)) return formatSingleDigitPatternZh(step, name);
  if (WINGS.has(kind)) return formatWingZh(step, name);
  if (UNIQUENESS.has(kind)) return formatUniquenessZh(step, name);
  if (ODDAGONS.has(kind)) return formatOddagonZh(step, name);
  if (ALS_PATTERNS.has(kind)) {
    const text = formatAlsZh(step, name);
    return kind === "ALSChain" || kind === "AHSChain" || kind === "DeathBlossom"
      ? appendTechnicalChainNotation(text, step)
      : text;
  }
  if (kind === "Fireworks") {
    const cells = cellList(structureCells(step));
    return `${name}：${cells ? `${cells}中的候选数` : "核心候选数"}通过行、列与宫的出口形成数组容量约束。${conclusionTextZh(step)}`;
  }
  if (kind === "BrokenWing") return `${name}：若所有守护候选均为假，核心结构将产生矛盾，因此至少有一个守护候选必须为真。${conclusionTextZh(step)}`;
  if (CHAINS.has(kind)) return appendTechnicalChainNotation(formatChainZh(step, name), step);
  if (RANK_PATTERNS.has(kind)) {
    const text = formatRankZh(step, name);
    return kind === "BlossomLoop" ? appendTechnicalChainNotation(text, step) : text;
  }
  if (EXOCETS.has(kind)) return formatExocetZh(step, name);
  if (kind === "BruteForce") return `${name}：现有逻辑技巧未能继续推进，程序通过穷举分支得到结论。${conclusionTextZh(step)}`;

  const cells = cellList(structureCells(step));
  return `${name}：${cells ? `结构格为${cells}。` : ""}${conclusionTextZh(step)}`;
}

export function techniqueNameForStep(step = {}, locale = "en") {
  const normalized = normalizeLocale(locale);
  const effectiveTitle = effectiveTechniqueTitle(step);
  if (normalized === "zh") return localizeTechniqueTitleZh(step, effectiveTitle);
  if (effectiveTitle) return effectiveTitle;
  const table = TECHNIQUE_NAMES[normalized] || TECHNIQUE_NAMES.en;
  return table?.[step?.kind] || TECHNIQUE_NAMES.en[step?.kind] || step?.kind || "";
}

export function categoryNameForLocale(category, locale = "en") {
  const normalized = normalizeLocale(locale);
  return CATEGORY_NAMES[normalized]?.[category] || category || (normalized === "zh" ? "其他" : "Other");
}

export function localizedStepDescription(step, locale = "en") {
  if (!step || typeof step !== "object") return "";
  const normalized = normalizeLocale(locale);
  if (normalized !== "zh") return "";

  let localeCache = localizedDescriptionCache.get(step);
  if (!localeCache) {
    localeCache = new Map();
    localizedDescriptionCache.set(step, localeCache);
  }
  if (localeCache.has(normalized)) return localeCache.get(normalized);

  const result = formatZhStep(step);
  localeCache.set(normalized, result);
  return result;
}

export function clearLocalizedStepCache(step = null) {
  if (step && typeof step === "object") {
    localizedDescriptionCache.delete(step);
    parsedGroupCache.delete(step);
  }
}
