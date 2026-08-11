/*
 * 维护说明（简体中文）
 * 职责：前端步骤说明。
 * 数据流：依据结构化步骤生成可读说明和链表达式，配合本地化模块。
 * 修改时注意：
 * - 本文件只应在明确理解数据流后修改；注释描述的是设计意图和维护约束。
 * - 重构时须保持既有求解结果、技巧优先级、前后端字段或测试基线不变。
 * - 主线程代码要避免长时间同步计算；耗时工作优先留在 Worker/WASM。
 * - 涉及移动端指针事件时同时检查鼠标、触摸、长按抑制和浏览器返回行为。
 */
// Step explanation model.
//
// This module is deliberately display-only. It never changes solver output,
// actions, highlights, ordering or technique selection.  It builds a readable
// explanation from the authoritative StepResult fields.  When a role cannot be
// established from structured data, the text stays generic and preserves the
// backend proof instead of guessing a more specific structure.

const DIRECT_KINDS = new Set(["FullHouse", "NakedSingle", "HiddenSingle", "SingleCandidate"]);
const NAKED_SUBSETS = new Set(["NakedPair", "NakedTriple", "NakedQuad"]);
const HIDDEN_SUBSETS = new Set(["HiddenPair", "HiddenTriple", "HiddenQuad"]);
const NORMAL_FISH = new Set(["XWing", "Swordfish", "Jellyfish"]);
const FINNED_FISH = new Set(["FinnedXWing", "FinnedSwordfish", "FinnedJellyfish"]);
const COMPLEX_FISH = new Set(["ComplexSwordfish", "ComplexJellyfish", "ComplexSquirmbagFish", "Multifish"]);
const SINGLE_DIGIT = new Set(["Skyscraper", "TwoStringKite", "EmptyRectangle", "ERIPair"]);
const REGULAR_WINGS = new Set(["WWing", "XYWing", "XYZWing", "XYZRing", "WXYZWing"]);
const UNIQUENESS = new Set([
  "AvoidableRectangle", "UniqueRectangle", "UniqueLoop", "ExtendedRectangle",
  "BUGOne", "BUGPlusN", "GSP",
]);
const AUDITED_FOUNDATIONS = new Set([
  "FullHouse", "HiddenSingle", "NakedSingle", "LockedCandidates",
  "NakedPair", "NakedTriple", "NakedQuad",
  "HiddenPair", "HiddenTriple", "HiddenQuad",
  "XWing", "Swordfish", "Jellyfish",
  "FinnedXWing", "FinnedSwordfish", "FinnedJellyfish",
  "Skyscraper", "TwoStringKite", "EmptyRectangle", "ERIPair",
  "WWing", "XYWing", "XYZWing", "XYZRing", "WXYZWing",
]);
const AUDITED_PHASE3 = new Set([
  "BrokenWing", "ComplexSwordfish", "ComplexJellyfish", "ComplexSquirmbagFish", "Multifish",
]);
const AUDITED_PHASE4 = new Set([
  "AlmostPair", "AlmostTriple", "SueDeCoq", "ALSXZ", "ALSXYWing", "ALSWWing", "AHSXZ",
  "AHSXYWing", "AHSWWing", "Fireworks", "BivalueOddagon", "TripletOddagon", "DeathBlossom", "BlossomLoop",
]);
const AUDITED_PHASE5 = new Set([
  "XChain", "XYChain", "AIC", "GroupedAIC", "ALSChain", "ComplexAIC",
]);
const AUDITED_PHASE6 = new Set([
  "CellRegionFC", "Whip", "GWhip", "DynamicChain", "Braid", "GBraid",
]);
const AUDITED_PHASE7 = new Set([
  "SKLoop", "MSLS", "JE", "SeniorExocet", "WeakExocet", "BruteForce",
]);
const ODDAGONS = new Set(["BivalueOddagon", "TripletOddagon"]);
const ALS_KINDS = new Set([
  "AlmostPair", "AlmostTriple", "SueDeCoq", "ALSXZ", "ALSXYWing", "ALSWWing",
  "AHSXZ", "AHSXYWing", "AHSWWing", "DeathBlossom",
]);
const CHAIN_KINDS = new Set([
  "XChain", "XYChain", "AIC", "GroupedAIC", "ComplexAIC", "Whip", "GWhip",
  "DynamicChain", "Braid", "GBraid", "ALSChain", "AHSChain",
]);
const FORCING_KINDS = new Set(["CellRegionFC"]);
const RANK_KINDS = new Set(["SKLoop", "MSLS", "BlossomLoop"]);
const EXOCET_KINDS = new Set(["JE", "SeniorExocet", "WeakExocet"]);

const FISH_SIZE = Object.freeze({
  XWing: 2,
  FinnedXWing: 2,
  Swordfish: 3,
  FinnedSwordfish: 3,
  ComplexSwordfish: 3,
  Jellyfish: 4,
  FinnedJellyfish: 4,
  ComplexJellyfish: 4,
  ComplexSquirmbagFish: 5,
});

const LABELS = Object.freeze({
  zh: Object.freeze({
    structure: "结构",
    basis: "依据",
    deduction: "推导",
    conclusion: "结论",
    eureka: "尤里卡/原始证明",
    check: "核对",
  }),
  en: Object.freeze({
    structure: "Structure",
    basis: "Principle",
    deduction: "Deduction",
    conclusion: "Conclusion",
    eureka: "Eureka / backend proof",
    check: "Checks",
  }),
});

function localeKey(locale) {
  return String(locale || "zh").toLowerCase().startsWith("zh") ? "zh" : "en";
}

// Backend role metadata is intentionally language-neutral because the same
// StepResult feeds both locales.  Never paste those enum-like tails directly
// into Chinese prose: doing so was the main source of half-translated dynamic
// explanations (Standard / Branching / SourceState=ON, etc.).  Technical family
// names such as ALS, AHS, RCC, AIC, MSLS and Rank-0 remain unchanged.
function localizedSymmetryName(raw, locale = "zh") {
  const zh = localeKey(locale) === "zh";
  if (!zh) return String(raw || "");
  const key = String(raw || "").trim().toLowerCase();
  const map = new Map([
    ["diagonal", "主对角线对称"], ["antidiagonal", "副对角线对称"], ["central", "中心对称"],
    ["sticks symmetry type 1", "棒状对称 1 型"], ["sticks symmetry type 2", "棒状对称 2 型"],
  ]);
  return map.get(key) || String(raw || "");
}

function localizedProofMeta(value, locale = "zh") {
  const raw = String(value || "").trim();
  if (!raw || localeKey(locale) !== "zh") return raw;
  const exact = new Map([
    ["Standard", "标准型"],
    ["Grouped", "分组型"],
    ["Exact Rank-0", "精确秩 0"],
    ["Advanced Rank-0 with Attachment", "高级秩 0（含附加格）"],
    ["Irregular Rank-0", "异型秩 0"],
    ["Single-RCC XZ", "单 RCC XZ"],
    ["Locked-Set Position", "锁定数组位置型"],
    ["Shared-Cell", "共享格型"],
    ["shared-cell", "共享格型"],
    ["Double-RCC Rank-0", "双 RCC 秩 0"],
    ["Triple-Linked Rank-0", "三重链接秩 0"],
    ["Single-Intersection", "单交区"],
    ["Double-Intersection", "双交区"],
    ["Box-ALS / Line-AHS", "宫 ALS / 线 AHS"],
    ["Line-ALS / Box-AHS", "线 ALS / 宫 AHS"],
    ["Cannibalized", "自噬型"],
    ["Classic Stem/Petals", "经典茎/花瓣型"],
    ["Complex Type 1", "复杂 1 型"],
    ["Complex Type 2", "复杂 2 型"],
    ["Complex Type 3 (MSLS)", "复杂 3 型（MSLS）"],
    ["Row-Based", "行基型"],
    ["Column-Based", "列基型"],
    ["Complete", "完全型"],
    ["Half", "半型"],
    ["Restricted-Z", "受限 Z 型"],
    ["Type 1", "1 型"], ["Unique Rectangle Type 1", "1 型"],
    ["Type 2", "2 型"], ["Unique Rectangle Type 2", "2 型"],
    ["Type 3", "3 型"], ["Unique Rectangle Type 3", "3 型"],
    ["Type 4", "4 型"], ["Unique Rectangle Type 4", "4 型"],
    ["Type 5", "5 型"], ["Unique Rectangle Type 5", "5 型"],
    ["Type 6", "6 型"], ["Unique Rectangle Type 6", "6 型"],
    ["Type 7", "7 型"], ["Unique Rectangle Type 7", "7 型"],
    ["Hidden Rectangle", "隐性矩形"],
    ["External Test 1", "外部测试 1"], ["External Test 2/4", "外部测试 2/4"],
    ["External Test 3", "外部测试 3"], ["External Test 3H", "外部测试 3H"],
    ["External Test + XY-Wing", "外部测试 + XY-Wing"],
    ["AUR + XY-Wing", "AUR + XY-Wing"], ["AUR + XYZ-Wing", "AUR + XYZ-Wing"],
    ["AUR + WXYZ-Wing", "AUR + WXYZ-Wing"], ["AUR + WXYZ-Ring", "AUR + WXYZ-Ring"],
    ["Cross-Guardian", "交叉守护型"],
    ["Odd-Loop Guardians", "奇环守护型"],
    ["Verified-Solution Placement", "已验证终解落数"],
    ["Branching", "分叉型"],
    ["SingleSpine", "单主干型"],
    ["Contradiction", "矛盾型"],
    ["VerityPlacement", "共同真值出数"],
    ["VerityElimination", "共同真值删数"],
    ["ON", "成立"],
    ["OFF", "不成立"],
    ["ContinuousLoop", "连续环"],
    ["DiscontinuousLoop", "不连续环"],
    ["OpenChain", "开放链"],
    ["Cycle", "环"],
    ["Ring", "环"],
    ["Wing", "翼"],
    ["SameDigit", "同数字端点"],
    ["DifferentDigit", "异数字端点"],
    ["Cell Force Chain", "单元格强制链"],
    ["Region Force Chain", "区域强制链"],
    ["UR Force Chain", "唯一矩形强制链"],
    ["Triplet Oddagon Force Chain", "三值死环强制链"],
    ["Pointing", "指向型"],
    ["Claiming", "认领型"],
    ["Dynamic", "动态"],
    ["CompleteSolution", "完整终解"],
    ["Cell Type", "单元格型"],
    ["Region Type", "区域型"],
    ["AALS Type", "AALS型"],
    ["Cell", "单元格"],
    ["Row", "行"],
    ["Column", "列"],
    ["Box", "宫"],
  ]);
  if (exact.has(raw)) return exact.get(raw);
  const terminal = raw.match(/^(Cell|Row|Column|Box)(?::(.+))?$/i);
  if (terminal) {
    const head = ({ cell: "单元格", row: "行", column: "列", box: "宫" })[terminal[1].toLowerCase()] || terminal[1];
    return `${head}${terminal[2] ? `：${terminal[2]}` : ""}`;
  }
  return raw
    .replace(/\bComplex Type\s*(\d+)\b/gi, "复杂 $1 型")
    .replace(/\bType\s*(\d+)\b/gi, "$1 型")
    .replace(/\bGrouped\b/gi, "分组")
    .replace(/\bStandard\b/gi, "标准型")
    .replace(/\bBranching\b/gi, "分叉型")
    .replace(/\bSingleSpine\b/gi, "单主干型")
    .replace(/\bRow-Based\b/gi, "行基型")
    .replace(/\bColumn-Based\b/gi, "列基型")
    .replace(/\bRank-0\b/gi, "秩 0")
    .replace(/\bRank0\b/gi, "秩 0");
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== "" && value != null))];
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
  return index >= 0 && index < 81 ? `r${Math.floor(index / 9) + 1}c${(index % 9) + 1}` : "";
}

function cellNames(cells, max = 14, locale = "zh") {
  const names = unique(list(cells).map(cellName));
  const zh = localeKey(locale) === "zh";
  const separator = zh ? "、" : ", ";
  if (names.length <= max) return names.join(separator);
  return zh
    ? `${names.slice(0, max).join(separator)}等${names.length}格`
    : `${names.slice(0, max).join(separator)} … (${names.length} cells)`;
}

function candidateValues(item) {
  const values = [];
  if (Array.isArray(item?.candidates)) values.push(...item.candidates);
  if (Number.isInteger(item?.candidate)) values.push(item.candidate);
  if (Number.isInteger(item?.value)) values.push(item.value);
  return unique(values.map(Number).filter((value) => Number.isInteger(value) && value >= 1 && value <= 9)).sort((a, b) => a - b);
}

function digitText(values, separator = "/") {
  return unique(list(values).map(Number).filter((value) => Number.isInteger(value) && value >= 1 && value <= 9))
    .sort((a, b) => a - b)
    .join(separator);
}

function conclusionItems(step) {
  const placements = [];
  const eliminations = [];
  for (const action of list(step?.actions)) {
    const type = String(action?.type || "").toLowerCase();
    const name = cellName(action);
    if (!name) continue;
    if (type.includes("place")) {
      const digit = Number(action?.value ?? candidateValues(action)[0]);
      if (digit >= 1 && digit <= 9) placements.push(`${name}=${digit}`);
    }
    if (type.includes("eliminate")) {
      const digits = digitText(candidateValues(action));
      if (digits) eliminations.push(`${name}<>${digits}`);
    }
  }
  for (const action of list(step?.eliminations)) {
    const name = cellName(action);
    const digits = digitText(candidateValues(action));
    if (name && digits) eliminations.push(`${name}<>${digits}`);
  }
  return { placements: unique(placements), eliminations: unique(eliminations) };
}

function conclusionText(step, locale) {
  const lang = localeKey(locale);
  const { placements, eliminations } = conclusionItems(step);
  const parts = [];
  if (placements.length) parts.push(lang === "zh" ? `出数：${placements.join("，")}` : `Place: ${placements.join(", ")}`);
  if (eliminations.length) parts.push(lang === "zh" ? `删数：${eliminations.join("，")}` : `Eliminate: ${eliminations.join(", ")}`);
  return parts.join(lang === "zh" ? "；" : "; ") || (lang === "zh" ? "本步没有明确的出数或删数。" : "This step has no explicit placement or elimination.");
}

function primaryDigits(step) {
  const values = [...list(step?.candidates)];
  for (const item of list(step?.actions)) values.push(...candidateValues(item));
  for (const item of list(step?.eliminations)) values.push(...candidateValues(item));
  return digitText(values);
}

function structureCells(step) {
  const direct = list(step?.cells);
  if (direct.length) return direct;
  return list(step?.groups).flatMap((group) => list(group?.cells));
}

function houseLabel(step, locale) {
  const value = String(step?.house || "").trim();
  if (!value) return localeKey(locale) === "zh" ? "相关区域" : "the relevant house";
  return value;
}

function normalizeHead(value) {
  return String(value || "").toLowerCase().replace(/[\s_-]+/g, "");
}

function parseCompactHouses(value) {
  const result = [];
  const pattern = /([rcb])([1-9]+)/gi;
  let match = null;
  while ((match = pattern.exec(String(value || ""))) !== null) {
    for (const digit of match[2]) result.push(`${match[1].toLowerCase()}${digit}`);
  }
  return unique(result);
}

function groupRecord(group) {
  const label = String(group?.label || group?.name || group?.role || "").trim();
  const colon = label.indexOf(":");
  const head = (colon >= 0 ? label.slice(0, colon) : label).trim();
  const tail = (colon >= 0 ? label.slice(colon + 1) : "").trim();
  const headKey = normalizeHead(head);
  const digitBearing = /^(alsa|alsb|alsc|ahsa|ahsb|ahsb\(pivot\)|ahsc|rcc|rccx|rccy|rccz|x|z|stronglink|set|petal|fin|fins|regfin|regfins|edofin|edofins|eri|link|urbody|arbody|ulbody|xrbody|guardians?|guardiansa|guardiansb|winga|wingb|wxyzpivot|wxyzwings|bugplusonecell|forcedcandidate|exitcell|exitcells|escapecell|rcc\d+supporta|rcc\d+supportb|candidatez\(aonly\)|candidatez\(bonly\)|candidatez\(common\)|conjugateexit|confineddeadly|hiddenlock|nakedsubset|hiddensubset|subsetcell|digitpositions|solvedcorners|roof|targetcorner|self|target|targets|cannibaltargets|lockedcandidates|fishdigit|sourcedigits|fishbody|brokenloop|roofs|linkedside|rowstrong|columnstrong|rowouter|columnouter|rowinner|columninner|outerendpoints|connector|endpoints|linktoa|linktob|deletedigit|pivot|pivota|pivotb|supporta|supportb|supportx\(a\)|supportx\(b\)|supporty\(c\)|supporty\(b\)|supportz\(a\)|supportz\(b\)|supportz\(c\)|sharedz|connectorz|erbody|erintersection|outsideendpoint|pair|erisupport|activeeri|oppositeeri|remotewing|wxyzset|activesector|z|samehousercc|oddagonbody|oddagona|oddagonb|sharedexit|lockedsubset|tripletbody|afwremotetripletpair|afwwitness|witnesstripletoddagon|tripletguardian|tripletguardians|tripletguardianbranch\d+|fireworkarms|fireworkset|fireworka|fireworkb|sharedarms|erconnector|bivaluebridge|pit|alppivot|bivaluepair|basecells|basecandidates|stem|victim|petals|start|end)$/i.test(headKey);
  // Structured AHS/ALS labels may use "digits@house" (for example
  // AhsA:25@r1).  House numbers are metadata, not candidates.
  const candidateRoleWithPositions = /^candidatez\((?:aonly|bonly|common)\)$/i.test(headKey) && tail.includes("@");
  const digitTokens = candidateRoleWithPositions
    ? Array.from(tail.matchAll(/([1-9])@/g), (match) => match[1])
    : (tail.split("@", 1)[0].match(/[1-9]/g) || []);
  const digits = digitBearing ? unique(digitTokens.map(Number)).sort((a, b) => a - b) : [];
  return {
    label,
    head,
    headKey,
    tail,
    houses: parseCompactHouses(tail),
    digits,
    cells: list(group?.cells),
  };
}

function groups(step) {
  return list(step?.groups).map(groupRecord);
}

function groupsMatching(step, pattern) {
  return groups(step).filter((group) => pattern.test(group.headKey));
}

function firstGroup(step, pattern) {
  return groupsMatching(step, pattern)[0] || null;
}

function groupTails(step, head) {
  const key = normalizeHead(head);
  return groups(step).filter((group) => group.headKey === key && group.tail).map((group) => group.tail);
}

function firstGroupTail(step, head) {
  return groupTails(step, head)[0] || "";
}


function subsetCellFacts(step, locale = "zh") {
  const zh = localeKey(locale) === "zh";
  return groupsMatching(step, /^subsetcell$/i).map((group) => {
    const cell = cellNames(group.cells, 1, locale);
    const digits = digitText(group.digits);
    return cell && digits ? `${cell}={${digits}}` : "";
  }).filter(Boolean);
}

function hiddenDigitPositionFacts(step, locale = "zh") {
  const zh = localeKey(locale) === "zh";
  return groupsMatching(step, /^digitpositions$/i).map((group) => {
    const digit = digitText(group.digits);
    const cells = cellNames(group.cells, 14, locale);
    return digit && cells ? `${digit}${zh ? "→" : " -> "}${cells}` : "";
  }).filter(Boolean);
}

function tripletGuardianFacts(step, locale = "zh") {
  return groupsMatching(step, /^tripletguardian$/i).map((group) => {
    const digit = digitText(group.digits);
    const cells = cellNames(group.cells, 14, locale);
    return digit && cells ? `${digit}@${cells}` : "";
  }).filter(Boolean);
}

function tripletGuardianBranchFacts(step, locale = "zh") {
  const zh = localeKey(locale) === "zh";
  return groupsMatching(step, /^tripletguardianbranch\d+$/i).map((group) => {
    const match = group.headKey.match(/tripletguardianbranch(\d+)/i);
    const branch = match ? match[1] : "";
    const digit = digitText(group.digits);
    const cells = cellNames(group.cells, 14, locale);
    return branch && digit && cells ? `${zh ? "分支" : "branch "}${branch}: ${digit}@${cells}` : "";
  }).filter(Boolean);
}

function roleSummary(group, locale, fallback) {
  if (!group) return "";
  const lang = localeKey(locale);
  const cells = cellNames(group.cells, 14, locale);
  const digits = digitText(group.digits);
  const houses = group.houses.join(lang === "zh" ? "、" : ", ");
  const details = [];
  if (cells) details.push(cells);
  if (digits) details.push(lang === "zh" ? `候选数${digits}` : `digits ${digits}`);
  if (houses) details.push(houses);
  return `${fallback}${details.length ? (lang === "zh" ? `为${details.join("，")}` : `: ${details.join(", ")}`) : ""}`;
}

function ahsRoleSummary(group, locale, fallback) {
  if (!group) return "";
  const lang = localeKey(locale);
  const digits = list(group.digits).filter((digit) => Number(digit) >= 1 && Number(digit) <= 9).map(Number).sort((a, b) => a - b).join("") || (lang === "zh" ? "相关数字" : "digits");
  const houses = group.houses.join("/") || (lang === "zh" ? "元数据缺失" : "metadata missing");
  const cells = cellNames(group.cells, 14, locale) || (lang === "zh" ? "相关格组" : "cells");
  return `${fallback}=${digits}@${houses}{${cells}}`;
}

function cellHouseSet(cells, type) {
  const values = new Set();
  for (const cell of list(cells)) {
    const index = cellIndex(cell);
    if (index < 0) continue;
    const row = Math.floor(index / 9);
    const col = index % 9;
    if (type === "row") values.add(`r${row + 1}`);
    if (type === "col") values.add(`c${col + 1}`);
    if (type === "box") values.add(`b${Math.floor(row / 3) * 3 + Math.floor(col / 3) + 1}`);
  }
  return [...values].sort();
}

function commonHouses(cells) {
  const valid = list(cells).filter((cell) => cellIndex(cell) >= 0);
  if (!valid.length) return [];
  return ["row", "col", "box"].flatMap((type) => {
    const values = cellHouseSet(valid, type);
    return values.length === 1 ? values : [];
  });
}

function fishAxes(step) {
  const baseGroup = firstGroup(step, /^base$/i);
  const coverGroup = firstGroup(step, /^cover$/i);
  if (baseGroup?.houses?.length && coverGroup?.houses?.length) {
    return { bases: baseGroup.houses, covers: coverGroup.houses, exact: true };
  }
  const cells = structureCells(step);
  const rows = cellHouseSet(cells, "row");
  const cols = cellHouseSet(cells, "col");
  const size = FISH_SIZE[String(step?.kind || "")] || 0;
  if (size && rows.length === size && cols.length === size) {
    const eliminationRows = new Set(cellHouseSet(step?.eliminations, "row"));
    const eliminationCols = new Set(cellHouseSet(step?.eliminations, "col"));
    const rowBaseEvidence = [...eliminationRows].some((house) => !rows.includes(house));
    const colBaseEvidence = [...eliminationCols].some((house) => !cols.includes(house));
    if (rowBaseEvidence && !colBaseEvidence) return { bases: rows, covers: cols, exact: true };
    if (colBaseEvidence && !rowBaseEvidence) return { bases: cols, covers: rows, exact: true };
    return { bases: rows, covers: cols, exact: false };
  }
  return { bases: [], covers: [], exact: false };
}

function groupCells(step, pattern) {
  return unique(groupsMatching(step, pattern).flatMap((group) => group.cells).map(cellName));
}

function technicalProof(step) {
  const description = String(step?.description || "").trim();
  if (!description) return "";
  const kind = String(step?.kind || "");
  const title = String(step?.title || "");
  const chainLike = CHAIN_KINDS.has(kind) || FORCING_KINDS.has(kind) ||
    kind === "ALSChain" || kind === "AHSChain" || kind === "DeathBlossom" || kind === "BlossomLoop" ||
    /Chain|Loop|Ring|Whip|Braid|Eureka/i.test(title) || /=>|\s[=-]\s/.test(description);
  const structuredProof = /Base Cells|Target Cells|Cross(?:line)? Cells|Mirror Check|JEPOM|Contradiction|Branch|Truth|Link|Rank/i.test(description);
  return chainLike || structuredProof ? description : "";
}

function isWhipOrBraidStep(step) {
  return /^(Whip|GWhip|Braid|GBraid)$/i.test(String(step?.kind || ""));
}

function chainLengthOf(step) {
  const explicit = Number(step?.chainLength ?? step?.chain_length ?? 0);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const legacy = Number(step?.rank || 0);
  return isWhipOrBraidStep(step) && Number.isFinite(legacy) && legacy > 0 ? legacy : 0;
}

function hasStrictRank(step) {
  return step?.rankAvailable === true || step?.rank_available === true;
}

function strictRankOf(step) {
  return hasStrictRank(step) ? Number(step?.rank || 0) : 0;
}

function category(step) {
  const kind = String(step?.kind || "");
  const title = String(step?.title || "");

  // The producer kind is authoritative.  A Complex AIC title may mention ALS,
  // UR Guardian, Tridagon, Fish or Nice Loop as an internal edge; those words
  // do not change the family of the outer step.
  if (DIRECT_KINDS.has(kind)) return "single";
  if (kind === "LockedCandidates") return "locked";
  if (NAKED_SUBSETS.has(kind)) return "nakedSubset";
  if (HIDDEN_SUBSETS.has(kind)) return "hiddenSubset";
  if (NORMAL_FISH.has(kind)) return "fish";
  if (FINNED_FISH.has(kind)) return "finnedFish";
  if (COMPLEX_FISH.has(kind)) return "rank";
  if (SINGLE_DIGIT.has(kind)) return "singleDigit";
  if (kind === "Fireworks") return "fireworks";
  if (REGULAR_WINGS.has(kind)) return kind === "WXYZWing" ? "bentAlsWing" : "wing";
  if (UNIQUENESS.has(kind)) return "uniqueness";
  if (ODDAGONS.has(kind)) return "oddagon";
  if (kind === "BrokenWing") return "guardian";
  if (kind === "DeathBlossom") return "deathBlossom";
  if (kind === "BlossomLoop") return "blossomLoop";
  if (ALS_KINDS.has(kind)) return "als";
  if (FORCING_KINDS.has(kind)) return "forcing";
  if (CHAIN_KINDS.has(kind)) return kind === "DynamicChain" ? "dynamic" : "chain";
  if (RANK_KINDS.has(kind)) return "rank";
  if (EXOCET_KINDS.has(kind)) return "exocet";
  if (kind === "BruteForce") return "bruteForce";

  // Compatibility fallback for legacy/debug steps.  Do not use description
  // prose for classification: words such as "false" and "also" contain "als".
  if (/Broken (?:Wing|Loop)|Guardian/i.test(title)) return "guardian";
  if (/Rank|Multifish|MSLS|SK Loop/i.test(title)) return "rank";
  if (/Death Blossom/i.test(title)) return "deathBlossom";
  if (/Blossom Loop|Burring Loop|Burred Loop/i.test(title)) return "blossomLoop";
  if (/Continuous Nice Loop|Discontinuous Nice Loop|AIC|X-?Chain|XY-?Chain|Whip|Braid/i.test(title) || list(step?.nodes).length) return "chain";
  return "generic";
}

function sentenceParts(parts, locale) {
  const lang = localeKey(locale);
  return parts.filter(Boolean).join(lang === "zh" ? "；" : "; ");
}

function makeSection(key, text, locale, technical = false) {
  const value = String(text || "").trim();
  if (!value) return null;
  const lang = localeKey(locale);
  return { key, label: LABELS[lang][key] || key, text: value, technical };
}

function singleExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const kind = String(step?.kind || "");
  const placement = list(step?.actions).find((action) => String(action?.type || "").toLowerCase().includes("place"));
  const targetGroup = firstGroup(step, /^target$/i);
  const cell = cellName(placement) || cellNames(targetGroup?.cells, 1) || cellNames(structureCells(step), 1) || (zh ? "目标格" : "the target cell");
  const digit = Number(placement?.value ?? candidateValues(placement)[0]) || digitText(targetGroup?.digits) || primaryDigits(step);
  const houseGroup = firstGroup(step, /^house$/i);
  const house = houseGroup?.houses?.[0] || houseLabel(step, locale);
  if (kind === "HiddenSingle") {
    return {
      structure: zh ? `数字${digit}在${house}中的候选位置只剩${cell}。` : `Digit ${digit} has only one remaining candidate position in ${house}: ${cell}.`,
      basis: zh ? `数独规则要求${house}中数字${digit}恰好出现一次。` : `Sudoku requires digit ${digit} to occur exactly once in ${house}.`,
      deduction: zh ? `该区域内其余格都不能放${digit}，所以${cell}必须填${digit}。` : `Every other cell in that house excludes ${digit}, so ${cell} must be ${digit}.`,
    };
  }
  if (kind === "FullHouse") {
    return {
      structure: zh ? `${house}只剩${cell}一个空格，1到9中缺少的数字是${digit}。` : `${house} has only one empty cell, ${cell}, and the missing digit from 1–9 is ${digit}.`,
      basis: zh ? "每一行、列、宫都必须恰好包含数字1到9各一次。" : "Every row, column and box must contain digits 1 through 9 exactly once.",
      deduction: zh ? `${cell}只能补入缺失的数字${digit}。` : `${cell} must take the missing digit ${digit}.`,
    };
  }
  return {
    structure: zh ? `${cell}当前只剩候选${digit}。` : `${cell} currently has only candidate ${digit}.`,
    basis: zh ? "一个单元格最终只能取一个数字；候选集合缩为单元素时该值被强制。" : "A cell takes exactly one digit; a singleton candidate set forces that value.",
    deduction: zh ? `因此${cell}=${digit}。` : `Therefore ${cell}=${digit}.`,
  };
}

function lockedExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const branch = firstGroup(step, /^branch$/i)?.tail || (/claiming/i.test(String(step?.description || "")) ? "Claiming" : "Pointing");
  const source = firstGroup(step, /^sourcehouse$/i)?.houses?.[0] || houseLabel(step, locale);
  const target = firstGroup(step, /^targethouse$/i)?.houses?.[0] || (zh ? "交叉区域" : "the crossing house");
  const lockedGroup = firstGroup(step, /^lockedcandidates$/i);
  const digit = digitText(lockedGroup?.digits) || primaryDigits(step) || (zh ? "目标数字" : "the target digit");
  const cells = cellNames(lockedGroup?.cells || structureCells(step));
  const pointing = /pointing/i.test(branch);
  return {
    structure: zh
      ? `${pointing ? "宫指向" : "行列认领"}：数字${digit}在${source}中的全部候选都落在${target}${cells ? `的交区（${cells}）` : "的交区"}。`
      : `${pointing ? "Pointing" : "Claiming"}: every candidate for digit ${digit} in ${source} lies in the intersection with ${target}${cells ? ` (${cells})` : ""}.`,
    basis: zh
      ? `${source}中必须有一个${digit}为真，因此交区内至少一个高亮${digit}为真。`
      : `${source} must contain digit ${digit}, so at least one highlighted ${digit} in the intersection is true.`,
    deduction: zh
      ? `${target}中交区之外的候选${digit}与所有这些可能位置冲突，所以可以删除。`
      : `Any ${digit} in ${target} outside the intersection sees every possible source position and can be eliminated.`,
  };
}

function subsetExplanation(step, locale, hidden) {
  const zh = localeKey(locale) === "zh";
  const role = firstGroup(step, hidden ? /^hiddensubset$/i : /^nakedsubset$/i);
  const cells = cellNames(role?.cells || structureCells(step), 14, locale) || (zh ? "高亮单元格" : "the highlighted cells");
  const digits = digitText(role?.digits) || primaryDigits(step) || (zh ? "相关数字" : "the relevant digits");
  const house = firstGroup(step, /^house$/i)?.houses?.[0] || houseLabel(step, locale);
  const count = role?.cells?.length || list(structureCells(step)).length || digitText(String(digits).match(/[1-9]/g) || []).length;
  const cellFacts = subsetCellFacts(step, locale);
  const positionFacts = hiddenDigitPositionFacts(step, locale);
  if (hidden) {
    return {
      structure: zh
        ? `隐性${count}数组：数字${digits}在${house}中只可能出现在${cells}这${count}格。${positionFacts.length ? ` 逐数字位置：${positionFacts.join("；")}。` : ""}${cellFacts.length ? ` 这些格中的数组成员：${cellFacts.join("，")}。` : ""}`
        : `Hidden ${count}-subset: digits ${digits} can occur only in the ${count} cells ${cells} of ${house}.${positionFacts.length ? ` Positions by digit: ${positionFacts.join("; ")}.` : ""}${cellFacts.length ? ` Subset membership in those cells: ${cellFacts.join(", ")}.` : ""}`,
      basis: zh ? `这${count}个数字在${house}都必须各出现一次，而可用位置总共只有这${count}格，所以这些格必须由${digits}填满。` : `All ${count} digits must appear once in ${house}, and only these ${count} cells are available, so the cells must be filled by ${digits}.`,
      deduction: zh ? `因此这些格中不属于${digits}的其他候选都不可能成立，可以删除。` : `Therefore any other candidate in those cells, outside ${digits}, is impossible and can be removed.`,
    };
  }
  return {
    structure: zh
      ? `显性${count}数组：${house}中的${count}格${cells}合起来只有${digits}这${count}种候选。${cellFacts.length ? ` 逐格候选：${cellFacts.join("，")}。` : ""}`
      : `Naked ${count}-subset: the ${count} cells ${cells} in ${house} collectively contain only the ${count} digits ${digits}.${cellFacts.length ? ` Candidates by cell: ${cellFacts.join(", ")}.` : ""}`,
    basis: zh ? `这${count}格最终要填入${count}个数字，而它们合起来只有${count}种可能，所以${digits}必定全部落在这些格中；并不要求每一格都含全部数组数字。` : `These ${count} cells need ${count} values and collectively allow only ${count} digits, so ${digits} must occupy the cells; each cell need not contain every subset digit.`,
    deduction: zh ? `因此${house}中这些格之外的${digits}都不可能再出现，可以删除。` : `Therefore ${digits} cannot occur elsewhere in ${house} and can be eliminated there.`,
  };
}

function fishExplanation(step, locale, mode) {
  const zh = localeKey(locale) === "zh";
  const digit = primaryDigits(step) || (zh ? "目标数字" : "the target digit");
  const axes = fishAxes(step);
  const bodyCells = groupCells(step, /^fishbody$/i);
  const finCells = groupCells(step, /^fin$/i);
  const bases = axes.bases.length ? axes.bases.join("、") : (zh ? "高亮基准区域" : "the highlighted base sets");
  const covers = axes.covers.length ? axes.covers.join("、") : (zh ? "高亮覆盖区域" : "the highlighted cover sets");
  const kind = String(step?.kind || "");
  const branch = firstGroup(step, /^branch$/i)?.tail || (FINNED_FISH.has(kind) ? "Finned" : "Standard");
  const sashimi = /sashimi/i.test(branch);
  const finBox = firstGroup(step, /^finbox$/i)?.houses?.join(zh ? "、" : ", ") || "";
  const size = FISH_SIZE[kind] || axes.bases.length || axes.covers.length || 0;
  const baseName = size === 2 ? "X-Wing" : size === 3 ? "Swordfish" : size === 4 ? "Jellyfish" : "Fish";
  const structure = zh
    ? `数字${digit}以${bases}为基准区域、${covers}为覆盖区域${bodyCells.length ? `；鱼身候选为${bodyCells.join("、")}` : ""}${finCells.length ? `；鳍为${finCells.join("、")}` : ""}。`
    : `Digit ${digit} uses ${bases} as base sets and ${covers} as cover sets${bodyCells.length ? `; body candidates: ${bodyCells.join(", ")}` : ""}${finCells.length ? `; fins: ${finCells.join(", ")}` : ""}.`;
  if (mode === "finnedFish") {
    return {
      structure: zh
        ? `${sashimi ? "Sashimi" : "有鳍"}${baseName}：${structure}${finBox ? ` 鳍宫为${finBox}。` : ""}`
        : `${sashimi ? "Sashimi" : "Finned"} ${baseName}: ${structure}${finBox ? ` Fin box: ${finBox}.` : ""}`,
      basis: zh
        ? `分两案看：若所有鳍都为假，剩余鱼身按普通${baseName}成立；若至少一枚鳍为真，本步删数位于同一个鳍宫${finBox || ""}内，会与该真鳍直接冲突。`
        : `Use two cases: if every fin is false, the remaining body is an ordinary ${baseName}; if at least one fin is true, every reported target lies in the same fin box${finBox ? ` ${finBox}` : ""} and directly conflicts with that true fin.`,
      deduction: zh
        ? `${sashimi ? "Sashimi只表示去掉鳍后至少一个基准区域只剩一个鱼身落点；它不改变上述二分证明。" : ""}两种情况都排除后端报告的同一批目标，所以这些目标可删。`
        : `${sashimi ? "Sashimi only means that after removing the fins at least one base has a single body position; the two-case proof is unchanged. " : ""}Both cases eliminate the same backend-reported targets.`,
    };
  }
  if (mode === "complexFish") {
    return {
      structure,
      basis: zh ? "每个基准集合提供一个真数，覆盖集合的容量承接这些真数。" : "Each base set supplies one truth, carried by the capacity of the cover sets.",
      deduction: zh ? "覆盖容量被基准真数占满后，覆盖集合中的额外同数字候选可以删除。" : "Once the cover capacity is filled by the base truths, extra same-digit candidates in the covers are false.",
    };
  }
  return {
    structure,
    basis: zh ? `每个基准区域都必须含一个${digit}，而所有这些候选都被限制在同样数量的覆盖区域中。` : `Every base set must contain digit ${digit}, and all such candidates are confined to the same number of cover sets.`,
    deduction: zh ? `这些真数恰好占用各覆盖区域中的一个位置，因此覆盖区域内鱼身之外的${digit}不能成立。` : `Those truths occupy one position in each cover set, so ${digit} candidates in the covers but outside the fish body are false.`,
  };
}

function singleDigitExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const kind = String(step?.kind || "");
  const digit = primaryDigits(step) || (zh ? "目标数字" : "the target digit");
  const cells = cellNames(structureCells(step));
  if (kind === "TwoStringKite") {
    return {
      structure: zh ? `数字${digit}的一条行强关系和一条列强关系通过同一宫相连${cells ? `，结构格为${cells}` : ""}。` : `For digit ${digit}, one row strong link and one column strong link are connected through a box${cells ? `; the cells are ${cells}` : ""}.`,
      basis: zh ? "每条强关系的两个端点至少有一个为真，而宫内相连的两个端点不能同时为真。" : "At least one endpoint of each strong link is true, while the two connected endpoints in the box cannot both be true.",
      deduction: zh ? "因此两个外端至少有一个为真；任何同时看见这两个外端的同数字候选都不能成立。" : "Therefore at least one far endpoint is true, so any same-digit candidate that sees both far endpoints is false.",
    };
  }
  if (kind === "Skyscraper") {
    return {
      structure: zh ? `数字${digit}在两条平行区域中形成两条强关系${cells ? `，结构格为${cells}` : ""}。` : `Digit ${digit} forms two strong links in parallel houses${cells ? `; the cells are ${cells}` : ""}.`,
      basis: zh ? "一侧的两个端点互相看见，不能同时为真，因此另一侧两个“楼顶”至少有一个为真。" : "The two endpoints on one side see each other and cannot both be true, so at least one of the two opposite endpoints is true.",
      deduction: zh ? "同时看见两个楼顶的同数字候选会排除它们二者，因而不能成立。" : "A same-digit candidate that sees both top endpoints would make both false, so it can be removed.",
    };
  }
  if (kind === "EmptyRectangle") {
    return {
      structure: zh ? `数字${digit}在一个宫内形成空矩形交点，并由宫外的共轭对连接到目标位置${cells ? `（${cells}）` : ""}。` : `Digit ${digit} forms an empty-rectangle intersection in a box and is connected to the target by an external conjugate pair${cells ? ` (${cells})` : ""}.`,
      basis: zh ? "宫内该数字必须落在交叉行或交叉列的一侧；外部强关系把两种可能传递到同一目标。" : "The box digit must lie on one side of the intersecting row or column, and the external strong link carries both cases to the same target.",
      deduction: zh ? "目标候选在所有可能中都会被排除，因此可以删除。" : "The target is eliminated in every case and can be removed.",
    };
  }
  return {
    structure: zh ? `数字${digit}形成两个相互连接的空矩形交叉结构${cells ? `（${cells}）` : ""}。` : `Digit ${digit} forms two connected empty-rectangle intersections${cells ? ` (${cells})` : ""}.`,
    basis: zh ? "两个交叉结构共同覆盖目标数字的所有合法落点。" : "The two intersections cover every legal placement of the target digit.",
    deduction: zh ? "与这两组必要落点都冲突的目标候选不能成立。" : "A target candidate that conflicts with both required alternatives is false.",
  };
}

function wingExplanation(step, locale, bentAls = false) {
  const zh = localeKey(locale) === "zh";
  const kind = String(step?.kind || "");
  const cells = cellNames(structureCells(step));
  const digits = primaryDigits(step) || (zh ? "相关数字" : "the relevant digits");
  const pivot = groupCells(step, /pivot|hinge|stem|枢轴/i);
  const wings = groupCells(step, /wing|翼/i);
  if (bentAls || kind === "WXYZWing") {
    return {
      structure: zh ? `这些单元格${cells ? `（${cells}）` : ""}构成一个弯曲待定数组，涉及数字${digits}。` : `These cells${cells ? ` (${cells})` : ""} form a bent almost-locked set using digits ${digits}.`,
      basis: zh ? "该数组的候选容量只比单元格数多一个；共同候选数若在数组外成立，会使数组内部无法完成合法分配。" : "The set has exactly one more candidate than cells; an external common candidate would leave no legal assignment inside the set.",
      deduction: zh ? "因此，同时看见数组中该共同候选数所有位置的外部候选可以删除。" : "Therefore an external candidate that sees every occurrence of the common digit in the set can be removed.",
    };
  }
  if (kind === "WWing") {
    return {
      structure: zh ? `两个含有同一对数字的双值格${cells ? `（${cells}）` : ""}，通过其中一个数字的外部强关系相连。` : `Two bivalue cells with the same digit pair${cells ? ` (${cells})` : ""} are linked by an external strong link on one digit.`,
      basis: zh ? "外部强关系保证两个双值格中至少有一个必须取另一个共同数字。" : "The external strong link guarantees that at least one bivalue cell takes the other shared digit.",
      deduction: zh ? "同时看见这两个双值格的该共同数字候选不能成立。" : "A candidate for that shared digit that sees both bivalue cells is false.",
    };
  }
  const roleText = sentenceParts([
    pivot.length ? (zh ? `枢轴格${pivot.join("、")}` : `pivot ${pivot.join(", ")}`) : "",
    wings.length ? (zh ? `翼格${wings.join("、")}` : `wings ${wings.join(", ")}`) : "",
    !pivot.length && !wings.length && cells ? (zh ? `结构格${cells}` : `cells ${cells}`) : "",
    zh ? `涉及数字${digits}` : `digits ${digits}`,
  ], locale);
  if (kind === "XYZWing") {
    return {
      structure: zh ? `${roleText}，构成 XYZ-Wing。` : `${roleText}, forming an XYZ-Wing.`,
      basis: zh ? "枢轴格的三个候选覆盖全部分支；无论枢轴取哪个数字，共同候选数都会在枢轴或某个翼格中成立。" : "The three pivot candidates cover all branches; whatever the pivot takes, the common digit is true in the pivot or one wing.",
      deduction: zh ? "同时看见枢轴和两个翼格中共同候选位置的外部候选可以删除。" : "An external candidate that sees every relevant occurrence of the common digit can be removed.",
    };
  }
  if (kind === "XYZRing") {
    return {
      structure: zh ? `${roleText}，XYZ-Wing 的推理首尾闭合成环。` : `${roleText}; the XYZ-Wing inference closes into a ring.`,
      basis: zh ? "环上的强、弱关系交替传递，使每一处连接都受到双向约束。" : "Alternating strong and weak inferences propagate around the closed loop, constraining every link in both directions.",
      deduction: zh ? "与闭环关系冲突的候选按后端给出的尤里卡表达式删除。" : "Candidates conflicting with the closed loop are removed as shown by the backend Eureka expression.",
    };
  }
  return {
    structure: zh ? `${roleText}，构成 XY-Wing。` : `${roleText}, forming an XY-Wing.`,
    basis: zh ? "枢轴格只有两个候选；枢轴无论取哪一个值，都会迫使某个翼格取共同候选数。" : "The pivot is bivalue; either pivot value forces one wing to take the shared digit.",
    deduction: zh ? "因此两个翼格的共同候选数至少有一个为真，同时看见两个翼格的该候选可以删除。" : "Thus the shared digit is true in at least one wing, so a candidate that sees both wings can be removed.",
  };
}

function firstPairFromDescription(description) {
  const tail = String(description || "").split(":", 2)[1] || "";
  const digits = [];
  for (const ch of tail) {
    if (/[1-9]/.test(ch) && !digits.includes(Number(ch))) digits.push(Number(ch));
    if (digits.length === 2) return digits;
    if (/[A-Za-z]/.test(ch) && digits.length) break;
  }
  return digits.length === 2 ? digits : [];
}

function uniquenessRole(step, pattern) {
  return firstGroup(step, pattern);
}

function roleCellText(step, pattern, locale = "zh") {
  const role = uniquenessRole(step, pattern);
  return role ? cellNames(role.cells, 14, locale) : "";
}

function roleDigitText(step, pattern) {
  const role = uniquenessRole(step, pattern);
  return role ? digitText(role.digits) : "";
}

function deadlyDigitsForStep(step) {
  for (const pattern of [/^urbody$/i, /^arbody$/i, /^ulbody$/i, /^xrbody$/i]) {
    const digits = roleDigitText(step, pattern);
    if (digits) return digits;
  }
  return digitText(list(step?.candidates));
}

function firstCellsText(step, count = 4, locale = "zh") {
  return cellNames(structureCells(step).slice(0, count), 14, locale);
}

function uniquenessExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const kind = String(step?.kind || "");
  const title = String(step?.title || kind);
  const description = String(step?.description || "");
  const key = `${kind} ${title} ${description}`.toLowerCase();
  const branchValues = groupTails(step, "branch");
  const branchKey = branchValues.join(" ").toLowerCase();
  const mergedBranch = branchValues.length > 1;
  const branchDisplay = branchValues.map((value) => localizedProofMeta(value, locale)).join(zh ? "、" : ", ");
  const cells = cellNames(structureCells(step), 14, locale);
  const deadly = deadlyDigitsForStep(step);
  const conclusion = conclusionText(step, locale);
  const therefore = zh ? `因此：${conclusion}` : `Therefore: ${conclusion}`;

  if (kind === "GSP") {
    const symmetry = uniquenessRole(step, /^symmetry$/i)?.tail || "";
    const selfDigits = roleDigitText(step, /^self$/i);
    const selfCells = roleCellText(step, /^self$/i, locale);
    return {
      structure: zh
        ? `${symmetry ? `采用${symmetry}对称映射` : "盘面满足一组全局数字与位置对称映射"}${selfDigits ? `；自映射数字为${selfDigits}` : ""}${selfCells ? `；对称不动位置为${selfCells}` : ""}。`
        : `${symmetry ? `The grid uses ${symmetry} symmetry` : "The grid admits a global digit-and-position symmetry"}${selfDigits ? `; self-mapped digits: ${selfDigits}` : ""}${selfCells ? `; fixed positions: ${selfCells}` : ""}.`,
      basis: zh
        ? "GSP把一个完成盘映射为另一完成盘。给定数、数字配对、行列重排以及对称轴上的自映射数字必须服从同一映射，否则不能保持同一题面。"
        : "GSP maps one completed grid to another. Givens, digit pairs, row/column rearrangements and self-mapped digits on fixed positions must obey one mapping to preserve the same puzzle.",
      deduction: zh
        ? `被删候选与自映射位置、数字配对或轴上共轭条件不相容；保留它会让对称变换产生第二个解。${therefore}`
        : `Each eliminated candidate conflicts with a fixed position, digit pairing or axis-conjugacy requirement. Keeping it would let the symmetry transform produce a second solution. ${therefore}`,
      extraChecks: zh
        ? ["核对说明中的对称类型、行列重排和数字映射；不能只凭两个对称格下结论。"]
        : ["Check the symmetry type, row/column rearrangement and digit mapping; two symmetric cells alone are not sufficient."],
    };
  }

  if (kind === "BUGOne") {
    const extraCell = roleCellText(step, /^bugplusonecell$/i, locale) || cells || (zh ? "唯一三值格" : "the only trivalue cell");
    const extraDigits = roleDigitText(step, /^bugplusonecell$/i) || digitText(list(step?.candidates));
    const forced = roleDigitText(step, /^forcedcandidate$/i) || digitText(conclusionItems(step).placements.map((item) => Number(item.split("=")[1])));
    return {
      structure: zh
        ? `除${extraCell}外，所有未解格均为双值；该格候选为${extraDigits || "三个候选"}。`
        : `Every unsolved cell is bivalue except ${extraCell}, whose candidates are ${extraDigits || "three candidates"}.`,
      basis: zh
        ? "去掉正确的额外候选后，所有未解格双值，且每个区域中的每个候选出现0次或2次，形成可成对互换的完整BUG状态。"
        : "Removing the correct extra candidate leaves every unsolved cell bivalue and every house-digit occurring zero or twice, producing a complete swappable BUG state.",
      deduction: zh
        ? `为了避免完整BUG产生两个解，额外候选${forced || "后端给出的候选"}必须成立。${therefore}`
        : `To prevent the complete BUG from yielding two solutions, extra candidate ${forced || "reported by the backend"} must be true. ${therefore}`,
      extraChecks: zh
        ? ["核对恰好一个未解格为三值，其余未解格全为双值；去掉出数候选后所有区域计数必须为0或2。"]
        : ["Verify exactly one unsolved cell is trivalue, all others are bivalue, and removing the placed candidate leaves every house-digit count at zero or two."],
    };
  }

  if (kind === "BUGPlusN") {
    const guardianGroups = groupsMatching(step, /^guardian/i);
    const guardianCells = unique(guardianGroups.flatMap((group) => group.cells).map(cellName));
    const guardianDigits = digitText(guardianGroups.flatMap((group) => group.digits)) || digitText(list(step?.candidates));
    let deduction;
    if (/type 1/.test(branchKey)) deduction = zh
      ? `全部守护候选集中在同一格，因此该格必须取守护候选之一，伪双值对可以删除。${therefore}`
      : `All guardians lie in one cell, so that cell must take a guardian and its pseudo-bivalue pair can be removed. ${therefore}`;
    else if (/type 2/.test(branchKey)) deduction = zh
      ? `所有守护候选是同一数字且至少一真；同时看见全部守护位置的该数字可以删除。${therefore}`
      : `All guardians use one digit and at least one is true; the digit can be removed from any cell seeing every guardian. ${therefore}`;
    else if (/type 3/.test(branchKey)) deduction = zh
      ? `守护候选与同一区域的裸数组共同占满容量，数组外的相同候选会挤占必要名额。${therefore}`
      : `The guardians and a naked subset fill the house capacity; matching candidates outside the set consume a required slot. ${therefore}`;
    else if (/type 4/.test(branchKey)) deduction = zh
      ? `守护格中的一个伪双值数字形成共轭对；结合“至少一个守护为真”，可以排除另一伪双值数字。${therefore}`
      : `One pseudo-bivalue digit is conjugate across the guardian cells; combined with the guardian disjunction, the other pseudo-bivalue digit is eliminated. ${therefore}`;
    else if (/cross-guardian/.test(branchKey)) deduction = zh
      ? `两个守护格位于同一单位，并各自承担不同的单一守护数字。若其中一格取对方的守护数字，会在本格排除自己的守护，同时又在同一单位排除对方守护，于是全部守护同时消失并恢复完整BUG；因此这个交叉候选可删。${therefore}`
      : `The two guardian cells share one house and carry different single guardian digits. If either cell took the other guardian's digit, it would remove its own guardian in the same cell and the other guardian in the shared house, eliminating every escape and restoring the complete BUG; that cross-candidate is therefore removed. ${therefore}`;
    else deduction = zh
      ? `目标若成立，会同时排除全部守护候选并恢复完整BUG，因此目标不能成立。${therefore}`
      : `If the target were true, every guardian would be false and the complete BUG would return, so the target is impossible. ${therefore}`;
    return {
      structure: zh
        ? `移除守护候选${guardianDigits || "后端标出的候选"}后，盘面退化为完整BUG；守护位置为${guardianCells.join("、") || cells || "高亮格"}。`
        : `Removing guardian candidates ${guardianDigits || "reported by the backend"} collapses the grid to a complete BUG; guardian positions: ${guardianCells.join(", ") || cells || "the highlighted cells"}.`,
      basis: zh
        ? "完整BUG允许候选成对互换并产生第二解，所以守护候选中至少一个必须为真；具体Type再把这一析取条件与同格、共同可见格、共轭对或数组结合。"
        : "A complete BUG has a paired second solution, so at least one guardian is true; the Type-specific rule combines this disjunction with a common cell, common peers, a conjugate pair or a subset.",
      deduction,
    };
  }

  const isAR = kind === "AvoidableRectangle";
  const isUL = kind === "UniqueLoop";
  const isXR = kind === "ExtendedRectangle";
  const body = roleCellText(step, /^(urbody|arbody|ulbody|xrbody)$/i, locale)
    || ((kind === "UniqueRectangle" || isAR) ? firstCellsText(step, 4, locale) : cells);
  const pattern = zh ? (isAR ? "可避免矩形" : isUL ? "唯一环" : isXR ? "扩展矩形" : "唯一矩形")
    : (isAR ? "Avoidable Rectangle" : isUL ? "Unique Loop" : isXR ? "Extended Rectangle" : "Unique Rectangle");
  let structure = zh
    ? `${pattern}主体位于${body || "高亮区域"}${deadly ? `，致命数字组为${deadly}` : ""}。`
    : `The ${pattern} body is in ${body || "the highlighted region"}${deadly ? `, with deadly digit set ${deadly}` : ""}.`;
  if (branchDisplay && !mergedBranch) structure += zh ? ` 当前后端分支=${branchDisplay}。` : ` Backend branch=${branchDisplay}.`;
  const basis = isAR
    ? (zh
      ? "可避免矩形使用当前已经填入但并非原始提示的数字：若目标格按致命数字补全，已填数字可在四角互换，得到另一份满足同一原始题面的解。"
      : "An Avoidable Rectangle uses placed non-given digits. If the target completes the deadly pair, the placed digits can swap around the four corners and give another solution to the same original puzzle.")
    : (zh
      ? "主体若只剩致命数字组，就存在局部交替互换的第二种完成方式；唯一解题必须保留至少一个破坏点。"
      : "If the body contains only the deadly digit set, it has a second completion obtained by alternating those digits; a unique puzzle must retain at least one escape.");
  const targetDigit = digitText(list(step?.candidates));
  let deduction;
  const extraChecks = [];

  if (/external test \+ xy-wing/.test(branchKey)) {
    const ga = roleCellText(step, /^guardiansa$/i, locale);
    const gb = roleCellText(step, /^guardiansb$/i, locale);
    const wa = roleCellText(step, /^winga$/i, locale) || cellNames(structureCells(step).slice(-2, -1), 14, locale);
    const wb = roleCellText(step, /^wingb$/i, locale) || cellNames(structureCells(step).slice(-1), 14, locale);
    const da = roleDigitText(step, /^winga$/i);
    const db = roleDigitText(step, /^wingb$/i);
    structure += zh
      ? ` 外部守护候选分为${ga || "第一组"}和${gb || "第二组"}；双值翼格为${wa || "第一翼"}${da ? `{${da}}` : ""}与${wb || "第二翼"}${db ? `{${db}}` : ""}。`
      : ` External guardians split into ${ga || "group A"} and ${gb || "group B"}; bivalue wings: ${wa || "wing A"}${da ? `{${da}}` : ""} and ${wb || "wing B"}${db ? `{${db}}` : ""}.`;
    deduction = zh
      ? `外部守护候选至少一真。第一组任一守护为真会迫使第一翼取共同数字${targetDigit}；第二组任一守护为真会迫使第二翼取${targetDigit}。所以两翼中的${targetDigit}至少一真，同时看见两翼的目标${targetDigit}可删。${therefore}`
      : `At least one external guardian is true. A guardian in group A forces wing A to shared digit ${targetDigit}; a guardian in group B forces wing B to ${targetDigit}. Thus at least one wing contains ${targetDigit}, and a target seeing both wings can be removed. ${therefore}`;
    extraChecks.push(zh
      ? `致命数字组与删数数字必须分开：删数数字是两翼共同数字，不是${pattern}的致命数字。`
      : `Keep the deadly pair separate from the eliminated digit: the target is the wings' shared digit, not a deadly digit of the ${pattern}.`);
    extraChecks.push(zh
      ? "核对每个翼格看见对应数字的全部守护候选，且每个删数目标同时看见两个翼格。"
      : "Verify each wing sees every guardian of its associated deadly digit and every target sees both wings.");
  } else if (/external test 1/.test(branchKey)) deduction = zh
    ? `${pattern}外只有一个守护格；若该格不取致命数字之一，全部外部破坏点消失，主体成为致命结构。因此该格必须保留致命数字，其他候选可删。${therefore}`
    : `There is only one external guardian cell. If it took no deadly digit, every external escape would disappear and the body would become deadly; therefore it must keep a deadly digit and its other candidates are removed. ${therefore}`;
  else if (/external test 2\/4/.test(branchKey)) deduction = zh
    ? `一个致命数字没有外部守护位置，所以另一数字的守护候选中至少一个必须为真；同时看见全部守护位置的该数字可以删除。${therefore}`
    : `One deadly digit has no external guardian, so at least one guardian of the other digit is true; that digit can be removed from any cell seeing all guardians. ${therefore}`;
  else if (/external test 3h/.test(branchKey)) deduction = zh
    ? `外部守护候选与同一区域内的隐性数组共同限定落点；数组格内的其他候选会挤占必须留给守护数字和隐性数组数字的容量。${therefore}`
    : `The external guardians and a hidden subset in one house jointly restrict positions; other candidates in those cells consume capacity required by the guardian and hidden-subset digits. ${therefore}`;
  else if (/external test 3/.test(branchKey)) deduction = zh
    ? `外部守护候选与同一区域内的裸数组共同构成满容量集合；集合外的同数字候选会挤占必要名额。${therefore}`
    : `The external guardians and a naked subset in one house form a full-capacity set; matching digits outside it consume a required slot. ${therefore}`;
  else if (/aur \+ (xy|xyz)-wing/.test(branchKey)) {
    deduction = zh
      ? `屋顶额外候选至少一真，否则四角退化为致命矩形。翼节点把所有额外候选分支导向共同数字${targetDigit}，所以同时看见全部承接位置的${targetDigit}可删。${therefore}`
      : `At least one roof extra is true; otherwise the four corners collapse to the deadly rectangle. The Wing nodes route every extra-candidate branch to shared digit ${targetDigit}, so a target seeing every carrier can be removed. ${therefore}`;
    extraChecks.push(zh ? "本分支候选字段表示翼结构的共同删数数字，不是致命数字组。" : "In this branch step.candidates is the Wing target digit, not the deadly pair.");
  } else if (/aur \+ wxyz-(wing|ring)/.test(branchKey)) {
    const isWxyzRing = /wxyz-ring/.test(branchKey);
    deduction = zh
      ? `屋顶额外候选与三个外部节点组成WXYZ待定数组。若所有额外候选失效，UR主体致命；若任一额外候选成立，WXYZ结构仍把目标数字锁在结构内。${isWxyzRing ? "本分支还把四个结构数字闭合成环，因此可同时得到环上的附加删数。" : ""}${therefore}`
      : `The roof extras and three external nodes form a WXYZ almost-locked set. If every extra is false the UR body is deadly; if one is true the WXYZ structure still locks the target digit inside.${isWxyzRing ? " This branch also closes the four structural digits into a ring, yielding the additional ring eliminations." : ""} ${therefore}`;
    extraChecks.push(zh ? "本分支候选字段表示WXYZ结构数字并集，不能称为致命数字组。" : "Here step.candidates is the WXYZ digit union and must not be called the deadly set.");
  } else if (mergedBranch) {
    if (branchDisplay) structure += zh ? ` 已合并分支：${branchDisplay}。` : ` Merged branches: ${branchDisplay}.`;
    deduction = zh
      ? `同一主体同时满足多个唯一性分支；后端把各分支成立的删数合并到一步。每项结论都由至少一个明确分支阻止主体退化成可交换的第二解。${therefore}`
      : `The same body satisfies multiple uniqueness branches, so the backend merged their valid eliminations into one step. Every action is supported by at least one explicit branch preventing the body from collapsing into a swappable second solution. ${therefore}`;
  } else if (isAR && /type 1/.test(branchKey)) deduction = zh
    ? `三个已填非提示角已经确定致命数字对；第四角若取其中任一致命数字，就能交换四角得到另一解，因此这些候选可删。${therefore}`
    : `Three placed non-given corners fix the deadly pair. If the fourth took either deadly digit, the corners could swap into a second solution, so those candidates are removed. ${therefore}`;
  else if (isAR && /type 2/.test(branchKey)) deduction = zh
    ? `两个未解屋顶角共享同一额外数字。为避免两角都只剩致命数字，该额外数字至少一真；同时看见两角的同数字候选可删。${therefore}`
    : `The two unsolved roofs share one extra digit. To prevent both roofs containing only the deadly pair, that digit is true in at least one roof and can be removed from common peers. ${therefore}`;
  else if (/type 1/.test(branchKey)) deduction = zh
    ? `只有一个破坏格含额外候选；若它取致命数字，整个主体只剩致命数字组并产生第二完成方式，所以该格中的致命候选可删。${therefore}`
    : `Only one escape cell has extras. If it took a deadly digit, the body would contain only the deadly set and admit a second completion, so its deadly candidates are removed. ${therefore}`;
  else if (/type (2|5)/.test(branchKey)) deduction = zh
    ? `两个破坏格共享同一额外数字；若该数字两处都为假，主体退化为致命结构，所以它至少一真，并可从共同可见格删除。${therefore}`
    : `Two escape cells share one extra digit. If it were false in both, the body would be deadly, so it is true in at least one and can be removed from common peers. ${therefore}`;
  else if (/type 3/.test(branchKey)) deduction = zh
    ? `破坏格的额外候选与同一区域内的裸数组共同占满候选容量；数组外的同数字候选会挤占必要名额。${therefore}`
    : `The escape-cell extras and a naked subset in one house fill the candidate capacity; matching candidates outside consume a required slot. ${therefore}`;
  else if (/type 4/.test(branchKey)) deduction = zh
    ? `破坏格中的一个致命数字形成共轭对并至少一真，因此另一致命数字不能在相关破坏格中形成致命分配。${therefore}`
    : `One deadly digit is conjugate across the escape cells and is true in at least one, so the other deadly digit cannot form the deadly assignment there. ${therefore}`;
  else if (/type 6/.test(branchKey)) deduction = zh
    ? `一个致命数字在相关两行、两列的矩形外没有候选，落点被限制在四角；为避免交替致命分配，该数字可从两个破坏角删除。${therefore}`
    : `One deadly digit has no candidate outside the rectangle in the relevant rows and columns, so its positions are confined to the corners; it is removed from the escape corners to avoid the deadly alternating assignment. ${therefore}`;
  else if (/type 7/.test(branchKey)) deduction = zh
    ? `四角及外部强链连接致命数字端点。目标若成立，会关闭所有破坏出口并完成致命环；删数按说明中的强链或S-Ring证明成立。${therefore}`
    : `The corners and external strong links connect the deadly endpoints. If the target were true every escape would close and complete the deadly loop; eliminations follow from the recorded strong-link or S-Ring proof. ${therefore}`;
  else if (/hidden rectangle/.test(branchKey)) deduction = zh
    ? `行、列共轭关系把一个致命数字隐藏锁定在对角端点；保留目标会让另一致命数字完成可交换矩形，因此可删。${therefore}`
    : `Row and column conjugacies hidden-lock one deadly digit at opposite endpoints; keeping the target lets the other complete the swappable rectangle, so it is removed. ${therefore}`;
  else deduction = zh
    ? `被删候选若成立，会消除最后的破坏点，使主体只剩可交替互换的致命数字组。${therefore}`
    : `If an eliminated candidate were true, it would remove the last escape and leave only the alternatable deadly set. ${therefore}`;

  if (kind === "UniqueRectangle" || isAR) extraChecks.push(zh
    ? "核对四角位于两行、两列且只占两个宫；外部节点不能冒充矩形四角。"
    : "Verify the four corners occupy two rows, two columns and exactly two boxes; external nodes are not rectangle corners.");
  if (isUL) extraChecks.push(zh
    ? "核对致命数字沿环交替传播并闭合，非双值出口格与Type说明一致。"
    : "Verify the deadly digits alternate around a closed loop and non-bivalue exits match the Type rule.");
  if (isXR) extraChecks.push(zh
    ? "核对每一对扩展矩形格共享对应致命数字，且致命数字数等于配对数量。"
    : "Verify each Extended Rectangle pair supports its assigned deadly digits and the number of deadly digits equals the number of pairs.");
  return { structure, basis, deduction, extraChecks };
}

function alsExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const kind = String(step?.kind || "");
  const a = firstGroup(step, /^alsa$|^ahsa$/i);
  const b = firstGroup(step, /^alsb$|^ahsb(?:\(pivot\))?$/i);
  const c = firstGroup(step, /^alsc$|^ahsc$/i);
  const rcc = firstGroup(step, /^rcc$|^rccx$|^rccy$/i);
  const link = firstGroup(step, /^link$|^stronglink$/i);
  const branch = firstGroup(step, /^branch$/i);
  const branchKey = String(branch?.tail || "").toLowerCase();
  const roles = [
    roleSummary(a, locale, zh ? "待定数组A" : "ALS A"),
    roleSummary(b, locale, zh ? "待定数组B" : "ALS B"),
    roleSummary(c, locale, zh ? "待定数组C" : "ALS C"),
  ].filter(Boolean);
  const ahsBLabel = kind === "AHSXYWing"
    ? (zh ? "枢纽AHS B" : "pivot AHS B")
    : "AHS B";
  const ahsRoles = [
    ahsRoleSummary(a, locale, "AHS A"),
    ahsRoleSummary(b, locale, ahsBLabel),
    ahsRoleSummary(c, locale, "AHS C"),
  ].filter(Boolean);
  const structure = roles.length
    ? sentenceParts(roles, locale) + (zh ? "。" : ".")
    : (zh ? `高亮单元格${cellNames(structureCells(step)) ? `（${cellNames(structureCells(step))}）` : ""}构成待定数组结构。` : `The highlighted cells${cellNames(structureCells(step)) ? ` (${cellNames(structureCells(step))})` : ""} form an almost-locked-set structure.`);
  const ahsStructure = ahsRoles.length
    ? (zh ? `候选数组合优先：${sentenceParts(ahsRoles, locale)}。` : `Digit-set first: ${sentenceParts(ahsRoles, locale)}.`)
    : (zh ? "AHS应先按候选数组合与所属行、列或宫确认，再核对承载格组。" : "Read the AHS digit set and house first, then verify its carrier cells.");

  if (kind === "ALSXZ") {
    const x = digitText(rcc?.digits || []);
    const zGroup = firstGroup(step, /^z$/i);
    const z = digitText(zGroup?.digits || []);
    const doubleRcc = branchKey.includes("double-rcc");
    if (doubleRcc) {
      return {
        structure: `${structure}${x ? (zh ? ` 两个RCC数字为${x}，结构属于Double-RCC Rank-0分支。` : ` The two RCC digits are ${x}; this is the Double-RCC rank-0 branch.`) : ""}`,
        basis: zh
          ? "两个独立RCC把两组ALS闭合成Rank 0。这里不能套用普通ALS-XZ的“X不能两边同时为真，所以Z至少在一边为真”解释；删数来自Rank-0链接容量已被结构完全占用。"
          : "Two independent RCCs close the ALS pair to rank 0. Do not reuse the ordinary ALS-XZ statement that X cannot be true in both ALSs and therefore Z is true in one; eliminations come from fully occupied rank-0 link capacity.",
        deduction: zh
          ? "三条已占用关系之外的目标候选若保留，会额外占用已满的链接；结构内部若同一资源被重复占用，则形成自噬冲突。因此只保留后端实际给出的外部删数与结构内自噬删数。"
          : "A target outside the occupied relations would consume link capacity that is already full; inside the structure, consuming the same resource twice creates a cannibal conflict. Keep only the external and internal eliminations actually emitted by the backend.",
      };
    }
    return {
      structure: `${structure}${x ? (zh ? ` 严格共享候选数 X=${x}。` : ` Restricted common candidate X=${x}.`) : ""}${z ? (zh ? ` 共同删数候选 Z=${z}。` : ` Common elimination digit Z=${z}.`) : ""}`,
      basis: zh ? "一个ALS若失去一个候选数就会成为锁定集。单RCC数字X不能同时在两组ALS中取真，因此共同数字Z至少在其中一组ALS中取真。" : "If an ALS loses one candidate it becomes locked. The single RCC digit X cannot be true in both ALSs, so shared digit Z is true in at least one ALS.",
      deduction: zh ? "只有同时看见A、B两组中全部Z位置的外部Z候选才能删除。" : "Only an external Z candidate seeing every Z position in both ALSs can be removed.",
    };
  }

  if (kind === "AHSXZ") {
    return {
      structure: ahsStructure,
      basis: zh
        ? "AHS按数字—格位匹配工作：N个数字分布在N+1个格中，恰有一个格由AHS数字集之外的数字占据。RCC约束的是两侧Extra事件或局部HLS位置关系，而不是ALS候选容量。"
        : "AHS logic is a digit-position matching: N digits occupy N+1 cells, leaving exactly one cell for a digit outside the AHS set. Its RCC constrains Extra-events or local-HLS positions, not ALS candidate capacity.",
      deduction: zh
        ? "按后端给出的两个事件分支分别检查合法匹配；两个分支都排除的候选才可删除。"
        : "Check the legal matchings under the two backend event branches; only a candidate excluded in both branches can be removed.",
    };
  }

  if (kind === "AHSXYWing") {
    const rccX = firstGroup(step, /^rccx$/i);
    const rccY = firstGroup(step, /^rccy$/i);
    const rccZ = firstGroup(step, /^rccz$/i);
    const triple = branchKey.includes("triple-linked");
    const extraXA = firstGroup(step, /^extrax\(a\)$/i);
    const hlsXA = firstGroup(step, /^hlsx\(a\)$/i);
    const extraXB = firstGroup(step, /^extrax\(b\)$/i);
    const hlsXB = firstGroup(step, /^hlsx\(b\)$/i);
    const supportXA = firstGroup(step, /^supportx\(a\)$/i);
    const supportXB = firstGroup(step, /^supportx\(b\)$/i);
    const extraYC = firstGroup(step, /^extray\(c\)$/i);
    const hlsYC = firstGroup(step, /^hlsy\(c\)$/i);
    const extraYB = firstGroup(step, /^extray\(b\)$/i);
    const hlsYB = firstGroup(step, /^hlsy\(b\)$/i);
    const supportYC = firstGroup(step, /^supporty\(c\)$/i);
    const supportYB = firstGroup(step, /^supporty\(b\)$/i);
    const extraZA = firstGroup(step, /^extraz\(a\)$/i);
    const hlsZA = firstGroup(step, /^hlsz\(a\)$/i);
    const supportZA = firstGroup(step, /^supportz\(a\)$/i);
    const extraZC = firstGroup(step, /^extraz\(c\)$/i);
    const hlsZC = firstGroup(step, /^hlsz\(c\)$/i);
    const supportZC = firstGroup(step, /^supportz\(c\)$/i);
    const xText = [
      rccX?.tail,
      extraXA ? `${zh ? "A端Extra" : "A Extra"}=${cellNames(extraXA.cells)}` : "",
      hlsXA ? `${zh ? "A端HLS/见证格组" : "A local HLS/witness"}=${cellNames(hlsXA.cells)}` : "",
      supportXA?.digits?.length ? `${zh ? "A端支撑" : "A support"}=${digitText(supportXA.digits)}@${cellNames(supportXA.cells)}` : "",
      extraXB ? `${zh ? "枢纽Extra" : "pivot Extra"}=${cellNames(extraXB.cells)}` : "",
      hlsXB ? `${zh ? "枢纽HLS/见证格组" : "pivot local HLS/witness"}=${cellNames(hlsXB.cells)}` : "",
      supportXB?.digits?.length ? `${zh ? "枢纽支撑" : "pivot support"}=${digitText(supportXB.digits)}@${cellNames(supportXB.cells)}` : "",
    ].filter(Boolean).join(zh ? "，" : ", ");
    const yText = [
      rccY?.tail,
      extraYC ? `${zh ? "C端Extra" : "C Extra"}=${cellNames(extraYC.cells)}` : "",
      hlsYC ? `${zh ? "C端HLS/见证格组" : "C local HLS/witness"}=${cellNames(hlsYC.cells)}` : "",
      supportYC?.digits?.length ? `${zh ? "C端支撑" : "C support"}=${digitText(supportYC.digits)}@${cellNames(supportYC.cells)}` : "",
      extraYB ? `${zh ? "枢纽Extra" : "pivot Extra"}=${cellNames(extraYB.cells)}` : "",
      hlsYB ? `${zh ? "枢纽HLS/见证格组" : "pivot local HLS/witness"}=${cellNames(hlsYB.cells)}` : "",
      supportYB?.digits?.length ? `${zh ? "枢纽支撑" : "pivot support"}=${digitText(supportYB.digits)}@${cellNames(supportYB.cells)}` : "",
    ].filter(Boolean).join(zh ? "，" : ", ");
    const zText = triple ? [
      rccZ?.tail,
      extraZA ? `${zh ? "A端Extra" : "A Extra"}=${cellNames(extraZA.cells)}` : "",
      hlsZA ? `${zh ? "A端HLS/见证格组" : "A local HLS/witness"}=${cellNames(hlsZA.cells)}` : "",
      supportZA?.digits?.length ? `${zh ? "A端支撑" : "A support"}=${digitText(supportZA.digits)}@${cellNames(supportZA.cells)}` : "",
      extraZC ? `${zh ? "C端Extra" : "C Extra"}=${cellNames(extraZC.cells)}` : "",
      hlsZC ? `${zh ? "C端HLS/见证格组" : "C local HLS/witness"}=${cellNames(hlsZC.cells)}` : "",
      supportZC?.digits?.length ? `${zh ? "C端支撑" : "C support"}=${digitText(supportZC.digits)}@${cellNames(supportZC.cells)}` : "",
    ].filter(Boolean).join(zh ? "，" : ", ") : "";
    return {
      structure: `${ahsStructure}${triple ? (zh ? " 三重链接秩 0。" : " Triple-Linked Rank-0.") : ""}${xText ? (zh ? ` RCC X：${xText}。` : ` RCC X: ${xText}.`) : ""}${yText ? (zh ? ` RCC Y：${yText}。` : ` RCC Y: ${yText}.`) : ""}${zText ? (zh ? ` RCC Z：${zText}。` : ` RCC Z: ${zText}.`) : ""}`,
      basis: triple
        ? (zh
          ? "每组AHS都恰有一个Extra格。三条RCC分别保证相连的两组AHS中至少一端必须贡献Extra；而同一AHS不能同时为相邻两条边贡献Extra。于是任意一条边选定哪一端后，另外两条边会被迫交替，最终只剩两个全局状态，三条链接恰好闭合成Rank 0。"
          : "Each AHS has exactly one Extra cell. Each of the three RCCs says that at least one of its two endpoint AHSs must contribute the Extra event, while one AHS cannot serve both adjacent links at once. Choosing one endpoint on any link therefore forces the other two links to alternate, leaving exactly two global states and closing the three links to rank 0.")
        : (zh
          ? "枢纽AHS只有一个额外格。RCC X表示“A端Extra或枢纽X事件”，RCC Y表示“C端Extra或枢纽Y事件”；两个枢纽事件互斥且不能复用同一HLS证明资源，因此A端Extra与C端Extra至少一个成立。"
          : "The pivot AHS has one Extra cell. RCC X states ‘A Extra or pivot-X event’, and RCC Y states ‘C Extra or pivot-Y event’. The pivot events are disjoint and cannot reuse the same local-HLS proof resource, so at least one outer Extra-event holds."),
      deduction: triple
        ? (zh
          ? "程序分别枚举两个交替Rank-0状态下三个AHS的全部合法匹配；所有状态都不能容纳的结构内候选，以及每个状态都必被同数字看见的外部候选，才可删除。整格底色与候选色只显示后端实际RCC见证和支撑。"
          : "The solver enumerates every legal matching of all three AHSs in both alternating rank-0 states. Only internal candidates absent from every state and external candidates seen by the digit in every state are removed. Cell fills and candidate colors show only backend-emitted RCC witnesses and supports.")
        : (zh
          ? "分别在A端Extra、C端Extra条件下枚举全部合法AHS匹配；两分支共同排除的候选才是删数。整格底色标出参与RCC证明的局部HLS格组，候选色标出实际支撑位置。"
          : "Enumerate every legal AHS matching under the A-Extra and C-Extra branches. Only candidates excluded in both are removed. Cell fills mark the local-HLS cells used by each RCC, while candidate colors mark the actual support positions."),
    };
  }

  if (kind === "ALSXYWing") {
    const rccX = firstGroup(step, /^rccx$/i);
    const rccY = firstGroup(step, /^rccy$/i);
    const rccZ = firstGroup(step, /^rccz$/i);
    const zGroup = firstGroup(step, /^z$/i);
    const triple = branchKey.includes("triple-linked");
    const x = digitText(rccX?.digits || []);
    const y = digitText(rccY?.digits || []);
    const z = digitText((triple ? rccZ : zGroup)?.digits || []);
    const linkFacts = zh
      ? `RCC X(A-C)=${x || "?"}，RCC Y(B-C)=${y || "?"}${triple ? `，RCC Z(A-B)=${z || "?"}` : `，共同删数候选Z=${z || "?"}`}`
      : `RCC X(A-C)=${x || "?"}, RCC Y(B-C)=${y || "?"}${triple ? `, RCC Z(A-B)=${z || "?"}` : `, common elimination Z=${z || "?"}`}`;
    return {
      structure: `${structure}${zh ? ` ${triple ? "三重链接秩 0：" : ""}${linkFacts}。` : ` ${triple ? "Triple-Linked Rank-0: " : ""}${linkFacts}.`}`,
      basis: triple
        ? (zh
          ? "X把A-C受限连接，Y把B-C受限连接，而后端明确输出的RCC Z把A-B受限连接。三条独立RCC闭合三角形，Truth需求与Link容量相等，因此形成Rank 0。"
          : "X restrictively links A-C, Y links B-C, and the backend-emitted RCC Z links A-B. The three independent RCCs close the triangle with truth demand equal to link capacity, so the structure is rank 0.")
        : (zh
          ? "三个ALS按两条RCC连接：C分别通过X、Y连接A、B。无论C怎样完成，A或B中的共同Z至少一真。"
          : "The three ALSs are connected by two RCCs: C links to A through X and to B through Y. Whatever completes C, the common Z is true in A or B."),
      deduction: triple
        ? (zh
          ? "三条RCC已占满Rank-0链接容量；结构外会额外占用这些链接的候选，以及结构内造成重复占用的自噬候选，都不能成立。删数只采用后端实际输出的Targets/CannibalTargets。"
          : "The three RCCs occupy all rank-0 link capacity. External candidates that would consume an occupied link, and internal cannibal candidates that consume a resource twice, are false. Only backend-emitted Targets/CannibalTargets are used.")
        : (zh
          ? "同时看见A、B两端全部Z位置的外部Z若成立，会把两个可能承接Z的翼都排除，因此可删。"
          : "An external Z seeing every Z carrier in both outer ALSs would eliminate both possible Z carriers and can therefore be removed."),
    };
  }

  if (kind === "AHSWWing") {
    const pivot = firstGroup(step, /^pivot$/i);
    const pivotA = firstGroup(step, /^pivota$/i);
    const pivotB = firstGroup(step, /^pivotb$/i);
    const extraA = firstGroup(step, /^extraa$/i);
    const hlsA = firstGroup(step, /^hlsa$/i);
    const supportA = firstGroup(step, /^supporta$/i);
    const extraB = firstGroup(step, /^extrab$/i);
    const hlsB = firstGroup(step, /^hlsb$/i);
    const supportB = firstGroup(step, /^supportb$/i);
    const pivotDigits = digitText(pivot?.digits || []);
    const aDigits = digitText(pivotA?.digits || []);
    const bDigits = digitText(pivotB?.digits || []);
    const endpointA = [
      extraA ? `${zh ? "额外格组" : "Extra cells"}=${cellNames(extraA.cells)}` : "",
      hlsA ? `${zh ? "局部HLS格组" : "local HLS"}=${cellNames(hlsA.cells)}` : "",
      supportA ? `${zh ? "支撑位置" : "support positions"}=${cellNames(supportA.cells)}` : "",
    ].filter(Boolean).join(zh ? "，" : ", ");
    const endpointB = [
      extraB ? `${zh ? "额外格组" : "Extra cells"}=${cellNames(extraB.cells)}` : "",
      hlsB ? `${zh ? "局部HLS格组" : "local HLS"}=${cellNames(hlsB.cells)}` : "",
      supportB ? `${zh ? "支撑位置" : "support positions"}=${cellNames(supportB.cells)}` : "",
    ].filter(Boolean).join(zh ? "，" : ", ");
    return {
      structure: `${ahsStructure} ${zh ? "单格枢纽" : "Single-cell pivot"}${pivot ? `（${cellNames(pivot.cells)}{${pivotDigits}}）` : ""}${zh ? `完整分为A端组${aDigits || "（见高亮）"}与B端组${bDigits || "（见高亮）"}。` : ` is completely partitioned into A-side ${aDigits || "(highlighted)"} and B-side ${bDigits || "(highlighted)"}.`}${endpointA ? (zh ? ` A端：${endpointA}。` : ` A side: ${endpointA}.`) : ""}${endpointB ? (zh ? ` B端：${endpointB}。` : ` B side: ${endpointB}.`) : ""}`,
      basis: zh
        ? "枢纽每个候选都必须看见其所属端支撑数字的全部有效位置。取A端组候选会强制AHS A的Extra事件；取B端组候选会强制AHS B的Extra事件。枢纽必取一个候选，所以两个端点Extra事件至少一个成立；双值格只是最小特例。"
        : "Every pivot candidate must see every valid position of its assigned endpoint support digit. An A-side value forces AHS A's Extra-event, while a B-side value forces AHS B's Extra-event. The pivot takes one value, so at least one endpoint Extra-event holds; a bivalue cell is only the smallest special case.",
      deduction: zh
        ? "分别在A端Extra和B端Extra条件下枚举全部合法AHS匹配；两分支共同排除的候选可以删除。整格底色标出局部HLS格组，候选色只标真实支撑位置。"
        : "Enumerate all legal AHS matchings under the A-Extra and B-Extra branches. Candidates excluded in both can be removed. Cell fills mark the local-HLS cells, while candidate colors mark only real support positions.",
    };
  }
  if (kind === "ALSWWing") {
    return {
      structure: `${structure}${link ? ` ${roleSummary(link, locale, zh ? "外部强关系" : "external strong link")}。` : ""}`,
      basis: zh ? "外部强关系保证连接数字的两个端点至少有一个为真，从而迫使两个ALS中至少一侧承担共同删数候选。" : "The external strong link guarantees one endpoint is true, forcing at least one ALS to contain the common elimination digit.",
      deduction: zh ? "同时看见两个ALS中共同删数候选全部位置的外部候选可以删除。" : "An external candidate that sees every relevant occurrence in both ALSs can be removed.",
    };
  }
  if (kind === "ALSChain" || kind === "AHSChain") {
    return {
      structure,
      basis: zh ? "相邻待定数组由严格共享候选数连接，连接数字在相邻两组中不能同时为真，也不能同时缺失。" : "Adjacent almost-locked sets are joined by restricted common candidates, which cannot be true in both neighbors or absent from both.",
      deduction: zh ? "这些约束沿数组链传递，链的两端共同排除目标候选；完整传递过程见尤里卡/原始证明。" : "The constraints propagate through the ALS chain, and the two ends jointly eliminate the target; see the Eureka/backend proof for the full propagation.",
    };
  }
  return {
    structure,
    basis: zh ? "这些单元格的候选数与格位数量只差一个，形成待定数组。" : "The candidate count differs from the cell count by one, forming an almost-locked structure.",
    deduction: zh ? "结构间的受限共享候选数或强关系迫使目标候选无法成立。" : "Restricted common candidates or strong links between the structures rule out the target.",
  };
}

function chainExplanation(step, locale, dynamic = false) {
  const zh = localeKey(locale) === "zh";
  const nodes = list(step?.nodes);
  const edges = list(step?.edges);
  const branches = list(step?.chainBranches);
  const kind = String(step?.kind || "");
  const title = String(step?.title || "");
  const branch = groupTails(step, "Branch").join(zh ? "、" : ", ") || title;
  const family = firstGroupTail(step, "ChainFamily") || String(step?.chainType || step?.chain_type || "");
  const form = firstGroupTail(step, "ChainForm");
  const dcl = firstGroupTail(step, "DCL");
  const digitCount = firstGroupTail(step, "DigitCount");
  const strongPattern = firstGroupTail(step, "StrongPattern");
  const threeStrongClass = firstGroupTail(step, "ThreeStrongClass");
  const nodeKinds = firstGroupTail(step, "NodeKinds");
  const endpointRelation = firstGroupTail(step, "EndpointRelation");
  const conclusionKind = firstGroupTail(step, "Conclusion");
  const edgeReasons = groupTails(step, "EdgeReason");
  const grouped = firstGroupTail(step, "Grouped") === "true" || /grouped/i.test(title);
  const groupedNodeMatch = String(nodeKinds || "").match(/Grouped\s*=\s*(\d+)/i);
  const groupedNodeCount = groupedNodeMatch ? Number(groupedNodeMatch[1]) : nodes.filter((node) => /group/i.test(String(node?.kind || ""))).length;
  const hasActualGroupedNode = groupedNodeCount > 0;
  const startGroup = firstGroup(step, /^start$/i);
  const endGroup = firstGroup(step, /^end$/i);
  const isWing = form === "Wing";
  const isRing = form === "Ring";
  const isCycle = form === "Cycle";
  const isCnl = form === "ContinuousLoop" || isRing || isCycle;
  const isDnl = form === "DiscontinuousLoop" || dcl === "DCL1";
  const isWhip = kind === "Whip" || kind === "GWhip";
  const isBraid = kind === "Braid" || kind === "GBraid";
  const proofShape = firstGroupTail(step, "ProofShape");
  const whipLength = firstGroupTail(step, "WhipLength");
  const braidRank = firstGroupTail(step, "BraidRank");
  const proofBranchCount = firstGroupTail(step, "ProofBranchCount");
  const terminal = firstGroupTail(step, "Terminal");
  const targetGroup = firstGroup(step, /^target$/i);

  if (dynamic) {
    const mode = firstGroupTail(step, "DynamicMode") || String(step?.chainType || step?.chain_type || "");
    const modeDisplay = localizedProofMeta(mode, locale) || (zh ? "动态" : "Dynamic");
    const groupedDynamic = firstGroupTail(step, "Grouped") === "true" || /grouped/i.test(title);
    const source = firstGroup(step, /^source$/i);
    const conclusionGroup = firstGroup(step, /^conclusion$/i);
    const modeLower = mode.toLowerCase();
    return {
      structure: zh
        ? `${groupedDynamic ? "分组动态链" : "动态链"}：源候选${source ? `（${roleSummary(source, locale, "源") }）` : ""}的成立/不成立状态继续传播，共记录${branches.length || "多条"}实际网络分支；模式=${modeDisplay}${conclusionGroup ? `；结论=${roleSummary(conclusionGroup, locale, "结论")}` : ""}。`
        : `${groupedDynamic ? "Grouped Dynamic Chain" : "Dynamic Chain"}: the source candidate${source ? ` (${roleSummary(source, locale, "source")})` : ""} is propagated from its ON/OFF states through ${branches.length || "multiple"} recorded network branches; mode=${mode || "Dynamic"}${conclusionGroup ? `; conclusion=${roleSummary(conclusionGroup, locale, "conclusion")}` : ""}.`,
      basis: modeLower.includes("contradiction")
        ? (zh ? "某一源状态同时推出同一候选成立与不成立，因此该源状态不可能；否定源成立就删去源候选，否定源不成立就确定源候选。" : "One source state derives the same candidate both ON and OFF, so that source state is impossible. Refuting source-ON eliminates the source candidate; refuting source-OFF places it.")
        : (zh ? "源候选成立与不成立两种完备状态都推出同一出数或删数，因此该结论与源候选真假无关。" : "The complete source-ON and source-OFF cases both derive the same placement or elimination, so the conclusion is independent of the source candidate's truth value."),
      deduction: zh ? "只按后端实际记录的动态网络核对；分支汇合或单侧自相矛盾后得到当前结论。" : "Follow only the dynamic network recorded by the backend; branch convergence or a contradiction in one source state yields the current conclusion.",
    };
  }

  const structureParts = [];
  if (branch) structureParts.push(zh ? `实际分支：${branch}` : `Branch: ${branch}`);
  if (family) structureParts.push(zh ? `链族：${family}` : `family: ${family}`);
  if (strongPattern) structureParts.push(zh ? `三强边模式：${strongPattern}（V=双值格强边，L=行/列/宫或组强边）` : `three-strong-link pattern: ${strongPattern} (V=bivalue-cell, L=house/group)`);
  if (threeStrongClass) structureParts.push(zh ? `三强边分类：${threeStrongClass}` : `three-link class: ${threeStrongClass}`);
  structureParts.push(zh ? `节点/关系：${nodes.length}/${edges.length}` : `nodes/inferences: ${nodes.length}/${edges.length}`);
  if (digitCount) structureParts.push(zh ? `涉及数字：${digitCount}` : `digit count: ${digitCount}`);
  if (nodeKinds) structureParts.push(zh ? `节点构成：${nodeKinds}` : `node kinds: ${nodeKinds}`);
  if (proofShape) structureParts.push(zh ? `证明形态：${localizedProofMeta(proofShape, locale)}` : `proof shape: ${proofShape}`);
  if (whipLength) structureParts.push(zh ? `Whip长度：${whipLength}` : `Whip length: ${whipLength}`);
  if (braidRank) structureParts.push(zh ? `Braid秩/长度：${braidRank}` : `Braid rank/length: ${braidRank}`);
  if (proofBranchCount) structureParts.push(zh ? `证明分支数：${proofBranchCount}` : `proof branches: ${proofBranchCount}`);
  if (terminal) structureParts.push(zh ? `终止条件：${localizedProofMeta(terminal, locale)}` : `terminal condition: ${terminal}`);
  if (targetGroup) structureParts.push(roleSummary(targetGroup, locale, zh ? "目标" : "target"));
  if (startGroup || endGroup) {
    const start = roleSummary(startGroup, locale, zh ? "起点" : "Start") || (zh ? "起点未知" : "start unknown");
    const end = roleSummary(endGroup, locale, zh ? "终点" : "End") || (zh ? "终点未知" : "end unknown");
    structureParts.push(`${start} → ${end}`);
  }
  if (edgeReasons.length) structureParts.push(zh ? `实际边来源：${edgeReasons.join("、")}` : `edge sources: ${edgeReasons.join(", ")}`);
  const structure = `${structureParts.join(zh ? "；" : "; ")}。`;

  let basis = "";
  if (isWing || isRing) {
    let patternMeaning = {
      VVV: zh ? "三个双值格强边构成XY型" : "three bivalue-cell strong links form an XY pattern",
      VLV: zh ? "双值格—位置—双值格构成W型" : "bivalue-location-bivalue links form a W pattern",
      VVL: zh ? "两个双值格强边加一个位置强边构成H型" : "two bivalue-cell links plus one location link form an H pattern",
      LVV: zh ? "两个双值格强边加一个位置强边构成H型" : "two bivalue-cell links plus one location link form an H pattern",
      LVL: zh ? "位置—双值格—位置构成S型" : "location-bivalue-location links form an S pattern",
      VLL: zh ? "一个双值格强边加两个位置强边构成M型" : "one bivalue-cell link plus two location links form an M pattern",
      LLV: zh ? "一个双值格强边加两个位置强边构成M型" : "one bivalue-cell link plus two location links form an M pattern",
    }[strongPattern] || (zh ? "三条实际强边按源码规则形成该Wing/Ring分类" : "the actual three strong links determine this Wing/Ring classification");
    if (strongPattern === "LLL") {
      patternMeaning = threeStrongClass === "L1"
        ? (zh ? "三个位置强边只涉及一个数字，构成L1型（也可视为三强边X-Chain）" : "three location strong links use one digit, forming L1 (also a three-strong-link X-Chain)")
        : threeStrongClass === "L2"
          ? (zh ? "三个位置强边共涉及两个数字，构成L2型" : "three location strong links use two digits, forming L2")
          : threeStrongClass === "L3"
            ? (zh ? "三个位置强边共涉及三个数字，构成L3型" : "three location strong links use three digits, forming L3")
            : (zh ? "三个位置强边只能按实际数字数归入L1、L2或L3" : "three location strong links must classify as L1, L2 or L3 by actual digit count");
    }
    const groupedMeaning = grouped
      ? (hasActualGroupedNode
        ? (zh ? "；最终回放中确有组节点，组内候选整体充当一个逻辑端点。" : "; the final replay contains an actual grouped node whose candidates act as one logical endpoint.")
        : (zh ? "；该步骤来自Grouped AIC搜索分支，但最终最短回放已化简为单候选节点，因此本步不能再声称存在实际组节点。" : "; this step came from the Grouped AIC search branch, but the final shortest replay simplifies to single-candidate nodes, so no actual grouped node is claimed here."))
      : "。";
    basis = `${patternMeaning}${groupedMeaning}${isRing ? (zh ? "链尾还能以弱关系接回链头，所以是Ring。" : " The tail also weakly reconnects to the head, making a Ring.") : (zh ? "开放链的两个外端形成至少一真的端点推论。" : " The open endpoints form an at-least-one-true inference.")}`;
  } else if (kind === "XChain") {
    basis = zh ? "整条链只使用一个数字。行、列、宫（或组）中的共轭对提供强关系，同数字互相看见提供弱关系，二者严格交替。" : "The whole chain uses one digit. Conjugate pairs in rows, columns, boxes (or groups) provide strong links, while visible equal digits provide weak links, alternating strictly.";
  } else if (kind === "XYChain") {
    basis = zh ? "双值格内两个候选构成格内强关系；相邻节点的同数字候选互相看见，构成弱关系。沿这两类关系交替传递得到端点推论。" : "The two candidates in each bivalue cell form a cell strong link; equal digits in adjacent nodes see each other and form weak links. Alternating these relations yields the endpoint inference.";
  } else if (kind === "ALSChain" || kind === "AHSChain") {
    basis = zh ? "链节点可以是ALS/AHS候选扇区。数组容量和相邻数组间的受限公共候选提供强推论，再与普通弱关系交替；不能把它简化为普通单候选AIC。" : "Nodes may be ALS/AHS candidate sectors. Set capacity and restricted common candidates between adjacent sets provide strong inferences alternating with ordinary weak links; this is not merely a single-candidate AIC.";
  } else if (isWhip) {
    basis = zh ? "Whip从待删目标候选为真的假设开始，沿单一主干依次排除左链接候选，并在当时的局面中强制唯一右链接候选。每一步强关系可以依赖前面已经排除的候选；最终某格无候选，或某数字在行、列、宫中无落点。g-Whip只是在同一逻辑中允许合法分组节点。" : "A Whip assumes the target candidate true and follows one ordered spine, eliminating each left-linking candidate and forcing the unique right-linking candidate in the current partial state. Strong inferences may depend on candidates removed earlier in the spine; the terminal state empties a cell or removes every position of a digit from a row, column or box. g-Whip uses the same logic with valid grouped nodes.";
  } else if (isBraid) {
    basis = zh ? "Braid也从目标候选为真开始，但证明是分叉网络：每个分叉点必须覆盖当时所有左链接可能，各支路继续强制右链接候选，所有支路合起来排空终止格或区域。g-Braid允许分组节点；若回放只有一条主干，源码会按实际证明改名为Whip/g-Whip。" : "A Braid also assumes the target true, but its proof is a branching network. Every branch point must cover all currently possible left-linking candidates; each branch forces right-linking candidates, and together the branches empty the terminal cell or house. g-Braid permits grouped nodes. If replay has only one spine, the implementation renames the result Whip/g-Whip.";
  } else if (kind === "ComplexAIC") {
    const contexts = [];
    if (edgeReasons.includes("als")) contexts.push(zh ? "ALS容量边" : "ALS-capacity links");
    if (edgeReasons.includes("urguardian")) contexts.push(zh ? "UR守护候选边" : "UR-guardian links");
    if (edgeReasons.includes("tridagon")) contexts.push(zh ? "Tridagon约束边" : "Tridagon links");
    if (edgeReasons.includes("amsls")) contexts.push(zh ? "AMSLS秩结构边" : "AMSLS-rank links");
    if (edgeReasons.includes("fire")) contexts.push(zh ? "Fireworks边" : "Fireworks links");
    if (edgeReasons.includes("af")) contexts.push(zh ? "AF/扩展鱼边" : "AF/extended-fish links");
    if (edgeReasons.includes("group")) contexts.push(zh ? "组强边" : "grouped strong links");
    basis = zh ? `Complex AIC仍要求强、弱推论交替，但允许把已由对应搜索器证明的复合结构作为一个边或节点。本步实际使用：${contexts.join("、") || "普通格/屋关系"}。` : `A Complex AIC still alternates strong and weak inferences, but may use a compound structure already proved by its detector as one edge or node. This step actually uses: ${contexts.join(", ") || "ordinary cell/house relations"}.`;
  } else {
    basis = zh ? "每条强关系表示两端至少一真，每条弱关系表示两端不能同时为真；源码只接受强、弱交替且端点推论有效的路径。" : "Each strong inference says at least one endpoint is true, and each weak inference says both endpoints cannot be true. The solver accepts only alternating paths with a valid endpoint inference.";
  }

  let deduction = "";
  if (isWhip) {
    deduction = zh ? "沿记录的单主干逐步应用动态强关系后，终止格或终止区域失去全部合法候选，所以目标候选不可能成立。" : "Applying the recorded dynamic inferences along the single spine leaves the terminal cell or house without any legal candidate, so the target assumption is impossible.";
  } else if (isBraid) {
    deduction = zh ? "逐个分叉点核对全部左链接可能均已覆盖，并沿各支路传播；所有支路共同排空终止格或区域，因此目标候选可删。" : "At each branch point, verify that all left-linking alternatives are covered and propagate every branch; together they empty the terminal cell or house, so the target can be eliminated.";
  } else if (isDnl) {
    deduction = zh ? `链在同一候选或同一逻辑扇区形成不连续断点：一种状态沿链返回后要求相反状态，因此断点候选被强制定值或删除。后端结论类型为${conclusionKind || "断点结论"}。` : `The chain has a discontinuity at the same candidate or logical sector: propagation returns the opposite state, forcing a placement or elimination at the break. The recorded conclusion type is ${conclusionKind || "a discontinuity conclusion"}.`;
  } else if (isCnl) {
    deduction = zh ? "链尾以合法弱关系接回链头，使环中每条弱关系两侧都有强关系承接。任何同时冲突于某条弱关系两端的外部候选都不能成立；后端会合并环内全部有效删数。" : "A legal weak relation reconnects the tail to the head, so every weak link is flanked by strong inferences. Any external candidate conflicting with both ends of such a weak link is false; the backend merges all valid loop eliminations.";
  } else if (endpointRelation === "SameDigit") {
    deduction = zh ? "开放链两个端点是同一数字并形成至少一真的强端点推论；同时看见两个端点的该数字候选不能成立。" : "The two open endpoints carry the same digit and form an at-least-one-true inference; a candidate of that digit seeing both endpoints is false.";
  } else if (endpointRelation === "DifferentDigit") {
    deduction = zh ? "开放链表示：如果起点为假，沿交替链传播后终点必为真。因此一个目标候选只有在它一旦为真，会同时把起点候选排除、又与终点候选冲突时才可删除；那会迫使终点既真又假。本步只输出满足这两个端点冲突条件的实际删数。" : "The open chain gives ‘start false implies end true’. A target is removable only when making it true would both eliminate the start candidate and conflict with the end candidate, forcing the end to be both true and false. This step emits only targets satisfying those two endpoint conflicts.";
  } else {
    deduction = zh ? "沿尤里卡顺序传播后，端点得到后端核验的强推论；只有满足该端点关系的实际出数或删数才会输出。" : "Propagation along the Eureka order yields a backend-validated strong endpoint inference; only actions supported by that endpoint relation are emitted.";
  }
  return { structure, basis, deduction };
}

function forcingExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const branches = list(step?.chainBranches);
  const forceKind = firstGroupTail(step, "ForceChainKind") || String(step?.title || "Force Chain");
  const branchCount = firstGroupTail(step, "BranchCount") || String(branches.length || "");
  const commonTargets = firstGroup(step, /^commontargets$/i);
  const triplet = firstGroup(step, /^witnesstripletoddagon$/i);
  const guardians = tripletGuardianFacts(step, locale);
  const guardianBranches = tripletGuardianBranchFacts(step, locale);
  if (/triplet oddagon/i.test(forceKind) && triplet && guardians.length) {
    const tripletDigits = digitText(triplet.digits);
    const tripletCells = cellNames(triplet.cells, 14, locale);
    return {
      structure: zh
        ? `三值死环强制链：${tripletDigits}在${tripletCells}构成Triplet Oddagon主体；后端记录的组外守护候选为${guardians.join("、")}。`
        : `Triplet Oddagon Force Chain: ${tripletDigits} forms the Triplet Oddagon body on ${tripletCells}; the backend records the off-body guardians ${guardians.join(", ")}.`,
      basis: zh
        ? "这些守护候选不能同时为假；否则Triplet Oddagon主体会失去全部guardian，形成后端已核验的无解坏结构。因此至少一个guardian必须成立。"
        : "These guardians cannot all be false; otherwise the Triplet Oddagon body loses every guardian and becomes the backend-verified impossible pattern. Therefore at least one guardian must be true.",
      deduction: zh
        ? `${guardianBranches.length ? `后端把guardian与显示分支逐一对应（${guardianBranches.join("；")}）` : "后端分别从每个guardian成立的情况反向回放正常Forcing Chain"}，取得各分支端点可推出的删数集合，再取交集。因为至少一个guardian必真，所有分支共有的删数必然成立。`
        : `${guardianBranches.length ? `The backend maps the guardians to the displayed branches (${guardianBranches.join("; ")})` : "The backend replays an ordinary Forcing Chain for each guardian-true case"}, derives each endpoint elimination set, and intersects them. Since at least one guardian is true, every deletion common to all branches is valid.`,
    };
  }
  return {
    structure: zh
      ? `${forceKind}：后端把${branchCount || "各"}条关键分支反向回放为正常Forcing Chain，并分别取得端点可推出的删数集合${commonTargets ? `；共同目标=${roleSummary(commonTargets, locale, "目标")}` : ""}。`
      : `${forceKind}: the backend replays ${branchCount || "the critical"} branches in the displayed forcing direction and derives an endpoint deletion set from each${commonTargets ? `; common targets=${roleSummary(commonTargets, locale, "targets")}` : ""}.`,
    basis: zh
      ? "最终结论是所有分支端点删数集合的交集：无论实际落入哪一条强制分支，交集中的候选都会被排除。Cell、Region、UR 或 Triplet Oddagon 只标识搜索实体，输出仍是标准Forcing Chain。"
      : "The conclusion is the intersection of the endpoint-deletion sets from all branches: whichever forcing branch is realized, every candidate in the intersection is false. Cell, Region, UR or Triplet Oddagon labels identify the search entity; the output remains an ordinary Forcing Chain.",
    deduction: zh
      ? "逐条读取反向回放链的端点（单候选或ALS扇区），计算各自可删除的候选，再对所有分支求交集；后端只输出共同部分。"
      : "Read the endpoint of each reversed display branch (a single candidate or ALS sector), compute its elimination set, and intersect the sets across all branches; the backend emits only the common part.",
  };
}

function rankExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const rank = strictRankOf(step);
  const kind = String(step?.kind || "");
  const title = String(step?.title || "");
  if (kind === "SKLoop" || /SK Loop|Domino Loop/i.test(title)) {
    const body = firstGroup(step, /^loopbody$/i);
    const cellCount = firstGroupTail(step, "CellCount");
    const segmentCount = firstGroupTail(step, "SegmentCount") || "8";
    const linkSlotCount = firstGroupTail(step, "LinkSlotCount") || firstGroupTail(step, "LinkCount");
    const links = groupsMatching(step, /^link:/i).map(g => String(g?.label || "").replace(/^Link:/i, ""));
    return {
      structure: zh
        ? `Domino/SK Loop由${segmentCount}个分组链接段交替闭合${body ? `；${roleSummary(body, locale, "主体")}` : ""}${cellCount ? `；${cellCount}个主体格Truth` : ""}${linkSlotCount ? `，${linkSlotCount}个数字-house链接名额` : ""}${links.length ? `；8段链接=${links.join("、")}` : ""}。`
        : `The Domino/SK Loop closes ${segmentCount} grouped link segments${body ? `; body=${roleSummary(body, locale, "body")}` : ""}${cellCount ? `; ${cellCount} cell truths` : ""}${linkSlotCount ? `, ${linkSlotCount} digit-house link slots` : ""}${links.length ? `; the eight segments=${links.join(", ")}` : ""}.`,
      basis: zh
        ? `固定只有${segmentCount}个几何链接段，但每段可含多个数字；每个“数字+house”组合各计一个Link名额。本步${segmentCount}段合计${linkSlotCount || "相同数量的"}个Link名额，与${cellCount || "主体"}个格Truth相等，因此是严格Rank 0。标题中的Link数不是几何段数。`
        : `There are exactly ${segmentCount} geometric link segments, but each may carry several digits. Every digit-house pair counts as one link slot. The ${segmentCount} segments provide ${linkSlotCount || "the reported number of"} link slots, matching ${cellCount || "the body"} cell truths, so the structure is strict rank 0. The title's Link count is not the number of geometric segments.`,
      deduction: zh
        ? "结构外位于某个链接house中的同数字候选若成立，会额外占用已经满载的链接容量，因此可删。"
        : "A same-digit candidate outside the body but in one of the link houses would consume an already saturated link slot and is false.",
    };
  }
  if (kind === "MSLS") {
    const branch = firstGroupTail(step, "Branch") || "MSLS Rank-0";
    const branchLabel = localizedProofMeta(branch, locale);
    const core = firstGroup(step, /^core$/i);
    const attachment = firstGroup(step, /^attachment$/i);
    const cellCount = firstGroupTail(step, "CellCount");
    const linkCount = firstGroupTail(step, "LinkCount");
    const permutable = firstGroupTail(step, "PermutableDigits");
    const links = groupsMatching(step, /^link:/i).map(g => String(g?.label || "").replace(/^Link:/i, ""));
    const advanced = /advanced/i.test(branch);
    const irregular = /irregular/i.test(branch);
    const unionLinkCount = firstGroupTail(step, "UnionLinkCount");
    const coverFamilyCount = firstGroupTail(step, "CoverFamilyCount");
    return {
      structure: zh
        ? `${branchLabel}：${core ? roleSummary(core, locale, "核心") : "核心由高亮给出"}${attachment ? `；${roleSummary(attachment, locale, "附加格")}` : ""}${cellCount ? `；${cellCount}个格名额` : ""}${linkCount ? `、${linkCount}个逻辑链接名额` : ""}${unionLinkCount ? `；等价最小覆盖的链接并集=${unionLinkCount}` : ""}${coverFamilyCount ? `；最小覆盖族=${coverFamilyCount}` : ""}${links.length ? `；实际链接=${links.join("、")}` : ""}。`
        : `${branchLabel}: ${core ? roleSummary(core, locale, "core") : "the core is highlighted"}${attachment ? `; ${roleSummary(attachment, locale, "attachments")}` : ""}${cellCount ? `; ${cellCount} cell slots` : ""}${linkCount ? ` and ${linkCount} link slots` : ""}${links.length ? `; actual links=${links.join(", ")}` : ""}.`,
      basis: zh
        ? (irregular
          ? "异型MSLS把主体格中每个数字的候选位置作为待覆盖点，并允许行、列、宫的digit-house链接混合组成严格最小覆盖。每个数字的最小覆盖大小相加后必须恰好等于Cell Truth数，因此结构仍是Rank 0；存在多套等价最小覆盖时，结论必须对全部覆盖都安全。"
          : (advanced
            ? "高级MSLS为每个数字选择最低成本的行、列或宫覆盖；浮动数字枚举行侧/列侧分配，并可吸收被链接强制纳入的Attachment。最终格名额与链接名额相等。"
            : "精确MSLS比较每个数字在结构中占用的行、列、宫数量，选取最小覆盖作为链接；最小链接总数恰好等于结构格数。"))
        : (irregular
          ? "Irregular MSLS treats each digit's truth-cell candidates as points to cover and allows a strict minimum cover to mix row, column, and box digit-house links. The summed minimum-cover size equals the cell truths, and conclusions must be safe across every equivalent minimum cover."
          : (advanced
            ? "Advanced MSLS selects the cheapest row, column, or box cover for each digit, enumerates row/column choices for floating digits, and may absorb forced attachment cells. Final cell and link counts are equal."
            : "Exact MSLS compares the occupied rows, columns, and boxes for each digit and uses a minimum cover; the total minimum link count equals the number of structure cells.")),
      deduction: zh
        ? `${permutable ? `数字${permutable}可在等价最小覆盖之间置换，但容量不变。` : ""}${irregular && unionLinkCount ? `注意：LinkCount表示每一套最小覆盖真正占用的逻辑名额；UnionLinkCount=${unionLinkCount}只是所有等价覆盖中出现过的链接并集${coverFamilyCount ? `（共${coverFamilyCount}套）` : ""}，不能拿它计算Rank。` : ""}结构外候选会抢占选定链接容量；结构内被多个链接重复覆盖的候选形成自噬超额，均可删除。`
        : `${permutable ? `Digits ${permutable} may be permuted among equivalent minimum covers without changing capacity. ` : ""}Outside candidates steal selected-link capacity, while in-structure candidates covered by multiple links are cannibal overfills; both are eliminated.`,
    };
  }
  const chainLength = chainLengthOf(step);
  const truthGroups = groupsMatching(step, /truth|base/i);
  const linkGroups = groupsMatching(step, /link|cover/i);
  const groupText = sentenceParts([
    truthGroups.length ? (zh ? `强区域${truthGroups.length}组` : `${truthGroups.length} truth/base groups`) : "",
    linkGroups.length ? (zh ? `弱区域${linkGroups.length}组` : `${linkGroups.length} link/cover groups`) : "",
    chainLength > 0 ? `${zh ? "链长" : "chain length"} ${chainLength}` : "",
    hasStrictRank(step) ? `rank ${rank}` : "",
  ], locale);
  return {
    structure: zh ? `本步把必须满足的强区域与容纳它们的弱区域作为整体比较${groupText ? `（${groupText}）` : ""}。` : `This step compares required truth regions with the link regions that can carry them${groupText ? ` (${groupText})` : ""}.`,
    basis: zh ? "强区域至少需要一个真数，弱区域至多容纳一个真数；rank 等于弱区域数减去强区域数。" : "Each truth region needs at least one true candidate, each link region can contain at most one, and rank is links minus truths.",
    deduction: rank === 0
      ? (zh ? "零秩时，弱区域容量刚好被必要真数占满；额外候选若成立会挤占容量，因此可以删除。" : "At rank 0, link capacity is exactly filled by required truths; an extra candidate consumes unavailable capacity and is false.")
      : (zh ? "非零秩结构只使用后端明确证明的重叠、例外或守护关系。" : "For nonzero rank, use only the overlaps, exceptions, or guardians explicitly proved by the backend."),
  };
}

function exocetCheckLabel(raw, locale) {
  const zh = localeKey(locale) === "zh";
  const text = String(raw || "").trim();
  const key = text.toLowerCase();
  if (key === "target cells check") return zh ? "T格检查" : "T-cell check";
  if (key === "check x-rule" || key === "x-rule") return "X-Rule";
  if (key === "z zone check") return zh ? "Z区检查" : "Z-zone check";
  if (key === "w zone check") return zh ? "W区检查" : "W-zone check";
  if (key === "mirror check") return zh ? "M格检查（Mirror Check）" : "M-cell check (Mirror Check)";
  if (key.includes("adjacent target")) return zh ? "T邻规则（Adjacent Target）" : "Adjacent-Target rule";
  return text;
}

function exocetCheckRule(raw, locale) {
  const zh = localeKey(locale) === "zh";
  const text = String(raw || "").trim();
  const key = text.toLowerCase();
  if (key === "target cells check") return zh ? "T格检查：删除Target中不能由当前Base候选承接的候选" : "T-cell check: remove target candidates that cannot be carried by the current base candidates";
  if (key === "check x-rule" || key === "x-rule" || key.includes("x-rule")) return zh ? "X-Rule：排除无法同时满足两侧Target/Cross承接配额的Base候选" : "X-Rule: reject a base candidate that cannot satisfy the required target/cross support on both sides";
  if (key === "target-house lock") return zh ? "Target-House Lock：已锁定在Target house中的基准数字固定相应承接位置" : "Target-House Lock: a base digit locked in a target house fixes the corresponding support";
  if (key === "cross-line need") return zh ? "Cross-Line Need：逐个基准数字核对Cross/S-cell中必须保留的承接位置" : "Cross-Line Need: verify the required cross/S-cell supports for each base digit";
  if (key === "true base constraint") return zh ? "True Base Constraint：由Target/Cross约束已经确定为真Base的数字会排除与该承接冲突的候选" : "True Base Constraint: a base digit forced true by the target/cross constraints removes candidates incompatible with that support";
  if (key === "z zone check") return zh ? "Z区检查：删除Z格中的非基准候选" : "Z-zone check: remove non-base candidates from Z cells";
  if (key === "w zone check") return zh ? "W区检查：删除满足W区容量条件位置中的基准候选" : "W-zone check: remove base candidates from cells satisfying the W-zone capacity condition";
  if (key === "mirror check") return zh ? "Mirror Check：利用Target与镜面节点排除不兼容候选" : "Mirror Check: use targets and mirror nodes to remove incompatible candidates";
  if (key.includes("adjacent target")) return zh ? "Adjacent Target：利用相邻Target关系限制承接" : "Adjacent Target: use neighbouring target relations to constrain support";
  return `${exocetCheckLabel(text, locale)}${zh ? "：按该后端检查的实际约束产生本步删数" : ": apply only the constraint reported by this backend check"}`;
}

function exocetExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const branch = firstGroupTail(step, "Branch") || String(step?.title || step?.kind || "Exocet");
  const baseDigits = firstGroupTail(step, "BaseCandidates");
  const missingDigit = firstGroupTail(step, "MissingBaseDigit");
  const rawChecks = groupsMatching(step, /^check$/i).map(g => String(g?.tail || ""));
  const checks = rawChecks.map(check => exocetCheckLabel(check, locale));
  const base = firstGroup(step, /^base$/i);
  const baseA = firstGroup(step, /^basea$/i);
  const baseB = firstGroup(step, /^baseb$/i);
  const targetGroups = groupsMatching(step, /^target|^targets/i);
  const cross = firstGroup(step, /^cross$/i);
  const weakSeat = firstGroup(step, /^weakseat$/i);
  const yLock = firstGroupTail(step, "YLock");
  const yArea = firstGroup(step, /^yarea$/i);
  const zZone = firstGroup(step, /^zzone$/i);
  const zTargets = firstGroup(step, /^zzonetargets$/i);
  const wTargets = firstGroup(step, /^wzonetargets$/i);
  const mNodes = firstGroup(step, /^mnodes$/i);
  const mTargets = firstGroup(step, /^mchecktargets$/i);
  const tTargets = firstGroup(step, /^tchecktargets$/i);
  const roles = [];
  if (base) roles.push(roleSummary(base, locale, zh ? "Base" : "Base"));
  if (baseA) roles.push(roleSummary(baseA, locale, zh ? "Base A" : "Base A"));
  if (baseB) roles.push(roleSummary(baseB, locale, zh ? "Base B" : "Base B"));
  targetGroups.forEach((g, i) => {
    let label = zh ? `目标组${targetGroups.length > 1 ? i + 1 : ""}` : `Target group${targetGroups.length > 1 ? ` ${i + 1}` : ""}`;
    if (/^targetsaq$/i.test(g.headKey)) label = zh ? "A组Q目标" : "A-side Q targets";
    else if (/^targetsar$/i.test(g.headKey)) label = zh ? "A组R目标" : "A-side R targets";
    else if (/^targetsbq$/i.test(g.headKey)) label = zh ? "B组Q目标" : "B-side Q targets";
    else if (/^targetsbr$/i.test(g.headKey)) label = zh ? "B组R目标" : "B-side R targets";
    else if (/^targetsq$/i.test(g.headKey)) label = zh ? "Q目标" : "Q targets";
    else if (/^targetsr$/i.test(g.headKey)) label = zh ? "R目标" : "R targets";
    else if (/^targetgroupa$/i.test(g.headKey)) label = zh ? "目标组A" : "Target group A";
    else if (/^targetgroupb$/i.test(g.headKey)) label = zh ? "目标组B" : "Target group B";
    else if (/^targets$/i.test(g.headKey)) label = zh ? "Targets" : "Targets";
    roles.push(roleSummary(g, locale, label));
  });
  if (cross) roles.push(roleSummary(cross, locale, zh ? "Cross/S-cells" : "Cross/S-cells"));
  const weak = String(step?.kind || "") === "WeakExocet" || /weak/i.test(branch);
  const senior = String(step?.kind || "") === "SeniorExocet" || /senior/i.test(branch);
  const almost = /almost je4/i.test(branch);
  const doubleJe = /double/i.test(branch);
  if (weakSeat) roles.push(roleSummary(weakSeat, locale, zh ? "弱位" : "Weak seat"));
  if (weak && yLock) roles.push(zh ? `Y区锁定数字${yLock}` : `Y-area locked digit ${yLock}`);
  if (weak && yArea) roles.push(roleSummary(yArea, locale, zh ? "Y区支撑格" : "Y-area support cells"));
  if (weak && zZone) roles.push(roleSummary(zZone, locale, zh ? "Z区" : "Z-zone"));
  if (weak && zTargets) roles.push(roleSummary(zTargets, locale, zh ? "Z区删数目标" : "Z-zone targets"));
  if (weak && wTargets) roles.push(roleSummary(wTargets, locale, zh ? "W区删数目标" : "W-zone targets"));
  if (weak && mNodes) roles.push(roleSummary(mNodes, locale, zh ? "M格" : "M-nodes"));
  if (weak && mTargets) roles.push(roleSummary(mTargets, locale, zh ? "M格检查目标" : "M-check targets"));
  if (weak && tTargets) roles.push(roleSummary(tTargets, locale, zh ? "T格检查目标" : "T-cell check targets"));
  const rawCheckKey = rawChecks.join("|").toLowerCase();
  const hasTargetCheck = rawCheckKey.includes("target cells check");
  const hasZCheck = rawCheckKey.includes("z zone check");
  const hasWCheck = rawCheckKey.includes("w zone check");
  const hasMCheck = rawCheckKey.includes("mirror check");
  const hasAdjacentTarget = rawCheckKey.includes("adjacent target");
  const weakRules = [];
  if (yLock) weakRules.push(zh ? `数字${yLock}锁定在Y区` : `digit ${yLock} is locked in the Y area`);
  if (hasTargetCheck) weakRules.push(zh ? "T格检查删除目标格中的不兼容候选" : "the T-cell check removes incompatible target candidates");
  if (hasZCheck) weakRules.push(zh ? "Z区检查删除Z格中的非基准候选" : "the Z-zone check removes non-base candidates from the Z cells");
  if (hasWCheck) weakRules.push(zh ? "W区检查删除满足容量条件位置中的基准候选" : "the W-zone check removes base candidates from cells satisfying the W-zone capacity condition");
  if (hasMCheck) weakRules.push(zh ? "M格检查利用目标格与镜面节点删除不兼容候选" : "the M-cell check uses targets and mirror nodes to remove incompatible candidates");
  if (hasAdjacentTarget) weakRules.push(zh ? "T邻规则处理相邻Target约束" : "the Adjacent-Target rule handles neighbouring targets");
  return {
    structure: zh
      ? `${branch}：${roles.join("；")}${baseDigits ? `；基准候选=${baseDigits}` : ""}${checks.length ? `；实际启用检查=${checks.join("、")}` : ""}。`
      : `${branch}: ${roles.join("; ")}${baseDigits ? `; base candidates=${baseDigits}` : ""}${checks.length ? `; checks actually used=${checks.join(", ")}` : ""}.`,
    basis: weak
      ? (zh
        ? `Weak Exocet只保留当前弱结构能够证明的部分Base→Target同步。${weakRules.length ? `本步实际使用：${weakRules.join("；")}。` : "本步没有附加检查。"}`
        : `Weak Exocet preserves only the partial Base-to-Target synchronization proved by the current weak structure. ${weakRules.length ? `This step actually uses: ${weakRules.join("; ")}.` : "No additional check is present in this step."}`)
      : senior
        ? (zh ? "Senior Exocet允许多格Target，并用调整后的Cross-Line/S-cell集合为每个Base数字提供规定承接。本步只使用实际列出的附加检查；没有列出的检查不参与本步证明。" : "Senior Exocet permits multi-cell targets and uses an adjusted cross-line/S-cell set to provide the required support for each base digit. This proof uses only the additional checks actually listed by the step; absent checks do not participate.")
        : (zh ? "Junior Exocet的核心是：Base中的两个真数字必须分别由两侧Target承接，Cross/S-cells提供固定配额。本步只使用实际列出的附加检查；没有列出的子规则不参与本步证明。" : "Junior Exocet core relation is that the two true base digits must be carried by the two target sides, with a fixed quota supplied by the cross/S-cells. This proof uses only the additional checks actually listed by the step; absent sub-rules do not participate."),
    deduction: almost
      ? (zh ? `Almost JE4把两套JE通过S-cell配额联结；缺失数字${missingDigit || ""}若同时进入两套Base会触发记录的完整矛盾分支，因此得到本步结论。` : `Almost JE4 links two JE patterns through the S-cell quota. If the missing digit ${missingDigit || ""} enters both base pairs, the recorded complete contradiction branch is triggered, yielding the step conclusion.`)
      : doubleJe
        ? (zh ? "两套JE分别强制各自Base真数由对应Targets承接；共同可见、非S格True Base和共享Cover House检查再合并两套约束。" : "Each JE forces its own base truths into its targets; common-visibility, true-base-in-non-S, and shared-cover-house checks combine the two patterns.")
      : weak
        ? (zh
          ? `只合并本步实际触发的${[yLock ? "Y区锁定" : "", hasTargetCheck ? "T格检查" : "", hasZCheck ? "Z区检查" : "", hasWCheck ? "W区检查" : "", hasMCheck ? "M格检查" : "", hasAdjacentTarget ? "T邻规则" : ""].filter(Boolean).join("、") || "弱Exocet约束"}，得到本步删数。`
          : `Combine only the ${[yLock ? "Y-area lock" : "", hasTargetCheck ? "T-cell check" : "", hasZCheck ? "Z-zone check" : "", hasWCheck ? "W-zone check" : "", hasMCheck ? "M-cell check" : "", hasAdjacentTarget ? "Adjacent-Target rule" : ""].filter(Boolean).join(", ") || "Weak Exocet constraints actually emitted"} to obtain the eliminations.`)
        : (rawChecks.length
          ? (zh
            ? `只按后端本步实际列出的检查逐项推导：${rawChecks.map((check) => exocetCheckRule(check, locale)).join("；")}。没有列出的Exocet子规则不能补入证明。`
            : `Apply only the checks actually listed by this backend step: ${rawChecks.map((check) => exocetCheckRule(check, locale)).join("; ")}. Exocet sub-rules that are absent must not be added.`)
          : (zh ? "本步没有输出附加Check；只使用Base/Target/Cross主体约束，不补造子规则。" : "This step reports no additional Check; use only the Base/Target/Cross core relation and do not invent a sub-rule.")),
  };
}

function oddagonExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const title = String(step?.title || step?.kind || "Oddagon");
  const branch = firstGroupTail(step, "Branch") || title;
  if (String(step?.kind || "") === "BivalueOddagon" && /dual/i.test(branch)) {
    const oddagonA = firstGroup(step, /^oddagona$/i);
    const oddagonB = firstGroup(step, /^oddagonb$/i);
    const sharedExit = firstGroup(step, /^sharedexit$/i);
    if (oddagonA && oddagonB && sharedExit) {
      const aDigits = digitText(oddagonA.digits) || primaryDigits(step);
      const bDigits = digitText(oddagonB.digits) || primaryDigits(step);
      const exitDigits = digitText(sharedExit.digits) || primaryDigits(step);
      return {
        structure: zh
          ? `后端明确给出两个奇数双值环：Oddagon A=${cellNames(oddagonA.cells)}{${aDigits}}；Oddagon B=${cellNames(oddagonB.cells)}{${bDigits}}；公共出口(SharedExit)=${cellNames(sharedExit.cells)}{${exitDigits}}。`
          : `The backend explicitly reports two odd bivalue cycles: Oddagon A=${cellNames(oddagonA.cells)}{${aDigits}}; Oddagon B=${cellNames(oddagonB.cells)}{${bDigits}}; SharedExit=${cellNames(sharedExit.cells)}{${exitDigits}}.`,
        basis: zh
          ? `任一奇数环若只保留致命数字对，真假沿环交替一周会回到相反状态，因而必须由出口破坏。这里两个Oddagon共享出口；SharedExit就是同时打破两环矛盾的结构事实。`
          : `An odd cycle restricted to its deadly pair alternates back to the start with the opposite state and therefore needs an escape. These two independent oddagons share the same escape, explicitly reported as SharedExit.`,
        deduction: zh
          ? `SharedExit中后端标出的致命数字对不能成立；否则相应交替状态会把两个环重新封闭成无解结构。因此只删除本步实际输出的公共出口候选。`
          : `The deadly pair reported on SharedExit cannot hold, or the corresponding alternating state would close both cycles into an unsatisfiable structure. Apply only the eliminations actually emitted for the shared exit.`,
      };
    }
  }
  const cells = cellNames(structureCells(step));
  return {
    structure: zh ? `${title}${cells ? `的奇数交替主体位于${cells}` : "形成奇数交替结构"}，额外候选充当结构的出口。` : `${title}${cells ? ` has its odd alternating body in ${cells}` : " forms an odd alternating structure"}, with extra candidates acting as exits.`,
    basis: zh ? "若所有出口都失效，真假状态沿奇数环传播后会回到相反状态，或候选容量出现负秩矛盾，因此该主体本身无解。" : "If every exit is removed, truth alternation around the odd cycle returns with the opposite state, or the candidate capacity becomes negative-rank and unsatisfiable.",
    deduction: zh ? "会同时排除全部出口、从而强迫盘面进入该无解结构的候选不能成立。" : "A candidate that removes every exit and forces the grid into that unsatisfiable structure is false.",
  };
}

function guardianExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const guardians = groupCells(step, /guard|guardian|extra/i);
  return {
    structure: zh ? `守护候选${guardians.length ? `为${guardians.join("、")}` : "由高亮或原始证明标出"}；它们阻止一个无解主体完整成立。` : `The guardians${guardians.length ? ` are ${guardians.join(", ")}` : " are identified by the highlights or backend proof"}; they prevent an unsatisfiable core from becoming complete.`,
    basis: zh ? "如果所有守护候选都为假，剩余主体会形成死环、负秩或其他无解结构，所以守护候选中至少有一个必须为真。" : "If all guardians were false, the remaining core would be a dead loop, negative-rank pattern or another no-solution structure, so at least one guardian is true.",
    deduction: zh ? "同时看见所有守护候选、或一旦成立就会使所有守护候选失效的目标候选不能成立。" : "A target that sees every guardian, or whose truth would disable every guardian, is false.",
  };
}

function fireworksExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const cells = cellNames(structureCells(step));
  const digit = primaryDigits(step) || (zh ? "相关数字" : "the relevant digits");
  return {
    structure: zh ? `数字${digit}在行、列与宫的交叉出口形成烟花数组${cells ? `，核心单元格为${cells}` : ""}。` : `Digits ${digit} form a Fireworks array through row, column and box exits${cells ? `, with core cells ${cells}` : ""}.`,
    basis: zh ? "每个核心单元格的候选必须通过对应的行出口或列出口得到承接，而宫内交叉限制了这些出口可以同时取真的组合。" : "Each core candidate must be carried by its row or column exit, while the box intersection limits which exits can be true together.",
    deduction: zh ? "在所有合法出口分配中都无法成立的候选可以删除；具体出口组合和复合变体以原始证明为准。" : "Candidates absent from every legal exit assignment can be removed; see the backend proof for the exact exits and compound variant.",
  };
}

function deathBlossomExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const core = firstGroup(step, /^set$|^stem$|^core$/i);
  const petals = groupsMatching(step, /^petal/i);
  return {
    structure: zh
      ? `${roleSummary(core, locale, "中心单元格") || "中心单元格由高亮标出"}，连接${petals.length || "若干"}个花瓣待定数组。`
      : `${roleSummary(core, locale, "Stem") || "The stem is highlighted"}, connected to ${petals.length || "several"} ALS petals.`,
    basis: zh ? "中心单元格必须取其中一个候选；每一种取值都会激活相应花瓣，使花瓣内部的候选分配被锁定。" : "The stem must take one of its candidates; each possible value activates a corresponding petal and locks its internal assignment.",
    deduction: zh ? "如果每个中心取值分支都排除同一个目标候选，那么无论中心最终取什么，该目标都不能成立。各花瓣分支见原始证明。" : "If every stem-value branch eliminates the same target, that target is false regardless of the stem's final value. See the backend proof for the petal branches.",
  };
}

function blossomLoopExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  return {
    structure: zh ? `主环由强、弱关系首尾连接，并带有用于补足断点的动态或强制分支。` : `The main loop closes through strong and weak inferences, with dynamic or forcing branches repairing its breaks.`,
    basis: zh ? "这些分支使主环中的相关弱连接在整体上获得强关系效果；从秩角度看，必要真数与链接容量保持平衡。" : "The branches give the relevant weak links an effective strong-inference role; in rank terms, required truths and link capacity remain balanced.",
    deduction: zh ? "因此可以像连续环一样在相应连接处删数；主环和分支的完整顺序以原始证明为准。" : "This allows continuous-loop-style eliminations at the corresponding links; see the backend proof for the full loop and branches.",
  };
}


function bruteForceExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const cells = cellNames(structureCells(step));
  const branch = firstGroupTail(step, "Branch") || "Verified-Solution Placement";
  const source = firstGroupTail(step, "Source") || "CompleteSolution";
  const branchDisplay = localizedProofMeta(branch, locale);
  const sourceDisplay = localizedProofMeta(source, locale);
  const candidateCount = firstGroupTail(step, "CandidateCount");
  return {
    structure: zh
      ? `${branchDisplay}：${cells ? `选择未解格${cells}` : "选择一个未解格"}${candidateCount ? `，该格当前有${candidateCount}个候选` : ""}。`
      : `${branch}: ${cells ? `selects unsolved cell ${cells}` : "selects an unsolved cell"}${candidateCount ? ` with ${candidateCount} current candidates` : ""}.`,
    basis: zh
      ? `完整终解已由全盘搜索验证；本步骤只是从${sourceDisplay}读取该格的正确数字并作为兜底落盘，不把一次猜测包装成局部逻辑。`
      : `The complete solution has already been verified by full search. This fallback reads the cell's solved digit from ${source}; it does not dress one guess up as a local logical deduction.`,
    deduction: zh
      ? "本步只报告终解中的落数。BruteForce不参与技巧训练，也不应与人工逻辑技巧混合解释。"
      : "The step reports only the solved placement. BruteForce is excluded from technique training and is not explained as a human-style logical technique.",
  };
}

function genericExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const cells = cellNames(structureCells(step));
  const description = String(step?.description || "").trim();
  return {
    structure: zh ? `${cells ? `高亮结构位于${cells}` : "结构由盘面高亮和原始证明给出"}。` : `${cells ? `The highlighted structure is in ${cells}` : "The structure is defined by the grid highlights and backend proof"}.`,
    basis: zh ? "当前 JSON 没有提供足够的角色信息来安全重建更具体的证明，因此这里不猜测枢轴、翼、基准或覆盖角色。" : "The current JSON does not provide enough role data to reconstruct a more specific proof safely, so no pivot, wing, base or cover roles are guessed.",
    deduction: description
      ? (zh ? "请按原始证明逐项核对结构与结论；界面不会用通用模板覆盖它。" : "Verify the structure and conclusion against the backend proof; the UI does not replace it with a guessed template.")
      : (zh ? "请结合高亮确认本步结论覆盖了所有可能情况。" : "Use the highlights to verify that the conclusion covers every possible case."),
  };
}

function specificExplanation(step, locale, type) {
  if (type === "single") return singleExplanation(step, locale);
  if (type === "locked") return lockedExplanation(step, locale);
  if (type === "nakedSubset") return subsetExplanation(step, locale, false);
  if (type === "hiddenSubset") return subsetExplanation(step, locale, true);
  if (type === "fish" || type === "finnedFish" || type === "complexFish") return fishExplanation(step, locale, type);
  if (type === "singleDigit") return singleDigitExplanation(step, locale);
  if (type === "wing") return wingExplanation(step, locale, false);
  if (type === "bentAlsWing") return wingExplanation(step, locale, true);
  if (type === "uniqueness") return uniquenessExplanation(step, locale);
  if (type === "als") return alsExplanation(step, locale);
  if (type === "chain") return chainExplanation(step, locale, false);
  if (type === "dynamic") return chainExplanation(step, locale, true);
  if (type === "forcing") return forcingExplanation(step, locale);
  if (type === "rank") return rankExplanation(step, locale);
  if (type === "exocet") return exocetExplanation(step, locale);
  if (type === "oddagon") return oddagonExplanation(step, locale);
  if (type === "guardian") return guardianExplanation(step, locale);
  if (type === "fireworks") return fireworksExplanation(step, locale);
  if (type === "deathBlossom") return deathBlossomExplanation(step, locale);
  if (type === "blossomLoop") return blossomLoopExplanation(step, locale);
  if (type === "bruteForce") return bruteForceExplanation(step, locale);
  return genericExplanation(step, locale);
}

function validationChecks(step, locale, type) {
  const zh = localeKey(locale) === "zh";
  const checks = [];
  const conclusions = conclusionItems(step);
  if (type === "uniqueness") checks.push(zh ? "该结论依赖题目具有唯一解；允许多解的题不能使用唯一性技巧。" : "This conclusion assumes a unique solution; do not use uniqueness techniques on a multi-solution puzzle.");
  if (type === "chain" || type === "dynamic" || type === "forcing") checks.push(zh ? "逐段核对尤里卡中的强关系与弱关系是否与盘面高亮一致。" : "Check each strong and weak inference in the Eureka expression against the highlights.");
  if (type === "exocet") checks.push(zh ? "Exocet各分支只使用后端本步明确证明的删数；不能因为属于Exocet家族就自动套用完整Junior Exocet规则。" : "Each Exocet branch uses only eliminations explicitly proved by this backend step; do not apply the full Junior Exocet rule merely because the step belongs to the Exocet family.");
  if (type === "generic") checks.push(zh ? "由于角色数据不足，本说明只保留可验证信息，不补造具体结构角色。" : "Because role data is incomplete, this explanation preserves only verifiable facts and does not invent roles.");
  checks.push(zh
    ? `核对本步实际结论：出数${conclusions.placements.length}项，删数${conclusions.eliminations.length}项。`
    : `Verify the actual actions: ${conclusions.placements.length} placement(s), ${conclusions.eliminations.length} elimination(s).`);
  return checks;
}

function metaItems(step, locale, type) {
  const zh = localeKey(locale) === "zh";
  const items = [];
  const subsetRole = type === "hiddenSubset"
    ? firstGroup(step, /^hiddensubset$/i)
    : (type === "nakedSubset" ? firstGroup(step, /^nakedsubset$/i) : null);
  const tripletForceWitness = type === "forcing" ? firstGroup(step, /^witnesstripletoddagon$/i) : null;
  const rankCore = String(step?.kind || "") === "MSLS"
    ? firstGroup(step, /^core$/i)
    : (String(step?.kind || "") === "SKLoop" ? firstGroup(step, /^loopbody$/i) : null);
  const rankLinkDigits = (String(step?.kind || "") === "MSLS" || String(step?.kind || "") === "SKLoop")
    ? unique(groupsMatching(step, /^link$/i).flatMap((group) => group.digits)).sort((a, b) => a - b)
    : [];
  const exocetBaseDigits = type === "exocet" ? firstGroup(step, /^basecandidates$/i) : null;
  const exocetCoreCells = type === "exocet"
    ? unique([
        ...list(firstGroup(step, /^base$/i)?.cells),
        ...groupsMatching(step, /^targets|^targetgroup/i).flatMap((group) => group.cells),
      ].map(cellName).filter(Boolean))
    : [];
  const digits = subsetRole?.digits?.length
    ? digitText(subsetRole.digits)
    : (tripletForceWitness?.digits?.length
      ? digitText(tripletForceWitness.digits)
      : (rankLinkDigits.length
        ? digitText(rankLinkDigits)
        : (exocetBaseDigits?.digits?.length ? digitText(exocetBaseDigits.digits) : primaryDigits(step))));
  const cells = tripletForceWitness?.cells?.length
    ? unique(tripletForceWitness.cells.map(cellName)).length
    : (rankCore?.cells?.length
      ? unique(rankCore.cells.map(cellName)).length
      : (exocetCoreCells.length ? exocetCoreCells.length : unique(structureCells(step).map(cellName)).length));
  const nodes = list(step?.nodes).length;
  const branches = list(step?.chainBranches).length;
  const rank = strictRankOf(step);
  const chainLength = chainLengthOf(step);
  if (digits) items.push(zh ? `候选 ${digits}` : `digits ${digits}`);
  if (cells) items.push(zh ? `结构格 ${cells}` : `${cells} cells`);
  if (nodes) items.push(zh ? `链节点 ${nodes}` : `${nodes} nodes`);
  if (branches) items.push(zh ? `分支 ${branches}` : `${branches} branches`);
  if (chainLength > 0) items.push(`${zh ? "链长" : "chain length"} ${chainLength}`);
  if (hasStrictRank(step)) items.push(`rank ${rank}`);
  return items;
}

export function buildStepExplanationModel(step = {}, locale = "zh") {
  const lang = localeKey(locale);
  const type = category(step);
  const explanation = specificExplanation(step, lang, type);
  const proof = technicalProof(step);
  const sections = [
    makeSection("structure", explanation.structure, lang),
    makeSection("basis", explanation.basis, lang),
    makeSection("deduction", explanation.deduction, lang),
    makeSection("conclusion", conclusionText(step, lang), lang),
    makeSection("eureka", proof, lang, true),
  ].filter(Boolean);
  return {
    type,
    labels: LABELS[lang],
    sections,
    checks: [...list(explanation.extraChecks), ...validationChecks(step, lang, type)],
    meta: metaItems(step, lang, type),
  };
}

export function explanationCategoryForStep(step = {}) {
  return category(step);
}


function buildAuditedFoundationGuide(step = {}, locale = "zh") {
  const kind = String(step?.kind || "");
  if (!AUDITED_FOUNDATIONS.has(kind)) return null;
  const zh = localeKey(locale) === "zh";
  const targetGroup = firstGroup(step, /^target$/i);
  const targetCell = cellNames(targetGroup?.cells, 1, locale) || cellNames(structureCells(step), 1, locale) || (zh ? "目标格" : "the target cell");
  const targetDigit = digitText(targetGroup?.digits) || primaryDigits(step) || (zh ? "目标数字" : "the target digit");
  const sourceHouse = firstGroup(step, /^sourcehouse$/i)?.houses?.[0] || firstGroup(step, /^house$/i)?.houses?.[0] || houseLabel(step, locale);

  if (kind === "FullHouse") {
    return zh ? [
      `${sourceHouse}只剩${targetCell}一个空格，缺少的数字是${targetDigit}。`,
      `行、列、宫都必须恰好包含1到9各一次；其余八格已确定后，最后一格只能补入缺数。`,
      `设${sourceHouse}已出现数字集合为S，则${targetCell}的值属于{1,…,9}\\S。源码只在该差集恰好含一个数字${targetDigit}时返回。`,
      `① 找只剩一个空格的行、列或宫；② 列出已出现的八个数字；③ 找缺数${targetDigit}；④ 填入${targetCell}。`,
      `FB配色只把${targetCell}中的${targetDigit}标为cNormal(1)，并作为出数处理。`,
      `必须是区域内恰好一个未解格，而不是仅仅某个数字只剩一个候选位置；后者属于隐性单数。`,
    ] : [
      `${sourceHouse} has only one empty cell, ${targetCell}, and the missing digit is ${targetDigit}.`,
      `Every row, column and box contains digits 1–9 exactly once; after eight values are fixed, the last cell receives the missing digit.`,
      `If S is the set already present in ${sourceHouse}, then ${targetCell} lies in {1,…,9}\\S. The detector returns only when this difference is the singleton {${targetDigit}}.`,
      `1. Find a house with exactly one unsolved cell. 2. List its eight values. 3. Identify missing digit ${targetDigit}. 4. Place it in ${targetCell}.`,
      `FB colors only candidate ${targetDigit} in ${targetCell} as cNormal(1), then records a placement.`,
      `The house must have exactly one unsolved cell. If only one position remains for a digit while several cells are empty, that is a Hidden Single instead.`,
    ];
  }

  if (kind === "NakedSingle") {
    return zh ? [
      `${targetCell}的当前候选集合只剩${targetDigit}。`,
      `一个格最终只能填一个数字；同行、同列、同宫的排除已删去其余八个可能。`,
      `源码检查|C(${targetCell})|=1；当C(${targetCell})={${targetDigit}}时，直接得到${targetCell}=${targetDigit}。`,
      `① 查看目标格候选；② 确认只剩一个候选；③ 填入${targetDigit}。`,
      `FB只高亮${targetCell}中的候选${targetDigit}为cNormal(1)。`,
      `这里判断的是单格候选数为1，不要求某个区域只剩一个位置。`,
    ] : [
      `${targetCell} has the singleton candidate set {${targetDigit}}.`,
      `A cell takes exactly one digit; row, column and box constraints have removed every other value.`,
      `The detector checks |C(${targetCell})|=1. Since C(${targetCell})={${targetDigit}}, ${targetCell}=${targetDigit}.`,
      `1. Inspect the target cell. 2. Confirm it has one candidate. 3. Place ${targetDigit}.`,
      `FB highlights only candidate ${targetDigit} in ${targetCell} as cNormal(1).`,
      `This is a cell-level singleton; it does not require the digit to have only one position in a house.`,
    ];
  }

  if (kind === "HiddenSingle") {
    return zh ? [
      `数字${targetDigit}在${sourceHouse}中只剩${targetCell}一个候选位置。`,
      `${sourceHouse}必须出现一次${targetDigit}；其他格都已排除该数字，所以唯一位置被强制。`,
      `令P(${targetDigit},${sourceHouse})为该数字在区域内的候选位置集合。源码检查|P|=1，因此P={${targetCell}}并得到${targetCell}=${targetDigit}。`,
      `① 选定数字${targetDigit}与区域${sourceHouse}；② 扫描该区域全部空格；③ 确认只有${targetCell}含该候选；④ 出数。`,
      `FB只把${targetCell}中的${targetDigit}标为cNormal(1)。`,
      `区域内可以有多个空格；关键是数字${targetDigit}的候选位置恰好一个。`,
    ] : [
      `Digit ${targetDigit} has only one candidate position in ${sourceHouse}: ${targetCell}.`,
      `${sourceHouse} must contain ${targetDigit} once, and every other cell excludes it.`,
      `Let P(${targetDigit},${sourceHouse}) be the candidate-position set. The detector checks |P|=1, so P={${targetCell}} and ${targetCell}=${targetDigit}.`,
      `1. Choose digit ${targetDigit} and house ${sourceHouse}. 2. Scan every unsolved cell. 3. Confirm only ${targetCell} contains the digit. 4. Place it.`,
      `FB colors only candidate ${targetDigit} in ${targetCell} as cNormal(1).`,
      `The house may contain several empty cells; the requirement is one remaining position for this digit.`,
    ];
  }

  if (kind === "LockedCandidates") {
    const branch = firstGroup(step, /^branch$/i)?.tail || (/claiming/i.test(String(step?.description || "")) ? "Claiming" : "Pointing");
    const targetHouse = firstGroup(step, /^targethouse$/i)?.houses?.[0] || (zh ? "交叉区域" : "the crossing house");
    const locked = firstGroup(step, /^lockedcandidates$/i);
    const cells = cellNames(locked?.cells || structureCells(step), 14, locale);
    const digit = digitText(locked?.digits) || primaryDigits(step);
    const pointing = /pointing/i.test(branch);
    return zh ? [
      `${pointing ? "指向型（宫→行/列）" : "认领型（行/列→宫）"}：${sourceHouse}内数字${digit}的全部候选集中在${targetHouse}的交区${cells ? `（${cells}）` : ""}。`,
      `${sourceHouse}必须有一个${digit}为真，而它只能出现在交区；因此${targetHouse}交区外的${digit}不可能为真。`,
      `${sourceHouse}中的${digit}必须落在这些交区候选之一；所以${targetHouse}交区外若再保留${digit}，就会与源区域必需的${digit}冲突，直接删除即可。`,
      `① 确认分支是${pointing ? "宫→行/列" : "行/列→宫"}；② 找出${sourceHouse}中全部${digit}候选；③ 确认它们都在同一交区；④ 删除${targetHouse}交区外的${digit}。`,
      `交区候选用cNormal(1)，删除候选用cToDel(11)；不能把整个宫或整条线整格涂色代替候选高亮。`,
      `${pointing ? "指向型的源必须是宫，目标必须是行或列。" : "认领型的源必须是行或列，目标必须是宫。"} 源区域内不能漏掉任何该数字候选。`,
    ] : [
      `${pointing ? "Pointing (box to row/column)" : "Claiming (row/column to box)"}: every ${digit} candidate in ${sourceHouse} is confined to the intersection with ${targetHouse}${cells ? ` (${cells})` : ""}.`,
      `${sourceHouse} must contain one true ${digit}, and it can occur only in the intersection; therefore ${digit} candidates elsewhere in ${targetHouse} are false.`,
      `One of the intersection candidates must carry digit ${digit} for ${sourceHouse}. Any ${digit} outside the intersection in ${targetHouse} would conflict with that required placement, so it is false.`,
      `1. Confirm the ${pointing ? "box→line" : "line→box"} branch. 2. List every ${digit} in ${sourceHouse}. 3. Verify all lie in one intersection. 4. Remove ${digit} from the rest of ${targetHouse}.`,
      `Intersection candidates use cNormal(1); eliminations use cToDel(11). Do not replace candidate highlighting with whole-cell coloring.`,
      `${pointing ? "The source must be a box and the target a row or column." : "The source must be a row or column and the target a box."} No source candidate may be omitted.`,
    ];
  }

  if (NAKED_SUBSETS.has(kind) || HIDDEN_SUBSETS.has(kind)) {
    const hidden = HIDDEN_SUBSETS.has(kind);
    const role = firstGroup(step, hidden ? /^hiddensubset$/i : /^nakedsubset$/i);
    const house = firstGroup(step, /^house$/i)?.houses?.[0] || houseLabel(step, locale);
    const cells = cellNames(role?.cells || structureCells(step), 14, locale);
    const digits = digitText(role?.digits) || primaryDigits(step);
    const n = role?.cells?.length || list(structureCells(step)).length;
    const cellFacts = subsetCellFacts(step, locale);
    const positionFacts = hiddenDigitPositionFacts(step, locale);
    if (hidden) {
      return zh ? [
        `${house}中数字${digits}的所有候选位置合起来恰好是${n}格${cells}，构成${n === 2 ? "隐性数对" : n === 3 ? "隐性三数组" : "隐性四数组"}。${positionFacts.length ? ` 后端逐数字支撑位置：${positionFacts.join("；")}。` : ""}${cellFacts.length ? ` 数组格内实际成员：${cellFacts.join("，")}。` : ""}`,
        `这${n}个数字必须各在${house}出现一次；后端逐数字支撑位置全部落在这${n}格，因此这些格全部保留给数字${digits}。`,
        `这${n}个数字一共需要${n}个落点，而后端确认它们在${house}里总共也只有这${n}个可用格；因此这${n}格不会再留给其他数字。`,
        `① 在${house}选${n}个数字；② 合并它们的候选位置；③ 确认并集恰为${n}格；④ 删除这些格中的其他候选。`,
        `数字${digits}在数组格内用cNormal(1)，被删的其他候选用cToDel(11)。`,
        `严格条件：|D|=|P(D)|=${n}；不能只数格子，所选每个数字都必须至少在这些格中出现一次，而且位置并集必须恰好为${n}格。`,
      ] : [
        `In ${house}, all positions of digits ${digits} are confined to exactly ${n} cells ${cells}, forming a Hidden ${n === 2 ? "Pair" : n === 3 ? "Triple" : "Quad"}.`,
        `The ${n} digits must each occur once in ${house}, and only these ${n} cells are available, so the cells are reserved for them.`,
        `The ${n} digits need ${n} placements, and the backend confirms that these ${n} cells are their only available positions in ${house}; those cells therefore cannot hold other digits.`,
        `1. Select ${n} digits in ${house}. 2. Union their positions. 3. Confirm the union has ${n} cells. 4. Remove other candidates from those cells.`,
        `Subset digits use cNormal(1); removed extra candidates use cToDel(11).`,
        `Strict condition: |D|=|P(D)|=${n}. Every selected digit must appear at least once, and the position union must contain exactly ${n} cells.`,
      ];
    }
    return zh ? [
      `${house}中的${n}格${cells}，候选并集恰好是${n}个数字${digits}，构成${n === 2 ? "显性数对" : n === 3 ? "显性三数组" : "显性四数组"}。${cellFacts.length ? ` 后端逐格成员：${cellFacts.join("，")}。` : ""}`,
      `这${n}格最终必须各填一个数字；后端逐格成员的并集只有${n}种可能${digits}，因此这些数字全部被锁在这${n}格中。`,
      `这${n}格已经需要用完${digits}这${n}个数字，${house}里的其他格就不能再占用这些数字，因此把同数字候选从数组外删除。`,
      `① 在${house}选${n}个每格候选数不超过${n}的格；② 求候选并集；③ 确认并集大小为${n}；④ 从其他格删除${digits}。`,
      `数组格中实际存在的数字${digits}用cNormal(1)，区域其他格的删数用cToDel(11)。`,
      `严格条件：|C|=|U|=${n}，其中U为所选格候选并集。必须按候选并集判断；并非每个数组格都必须含全部${n}个数字。当前步骤只处理所报告的${house}，即使同一结构也锁在另一个区域。`,
    ] : [
      `The ${n} cells ${cells} in ${house} have candidate union ${digits} of size ${n}, forming a Naked ${n === 2 ? "Pair" : n === 3 ? "Triple" : "Quad"}.`,
      `The ${n} cells need ${n} values and collectively allow only those ${n} digits, so the digits are locked into the cells.`,
      `These ${n} cells must use all ${n} digits ${digits}, so no other cell in ${house} can use any of those digits.`,
      `1. Select ${n} cells in ${house}, each with at most ${n} candidates. 2. Form their union. 3. Confirm its size is ${n}. 4. Remove ${digits} elsewhere in the house.`,
      `Actual subset candidates use cNormal(1); eliminations elsewhere use cToDel(11).`,
      `Strict condition: |C|=|U|=${n}, where U is the candidate union. Use the union, not an assumption that every cell contains every digit. The step applies to the reported house only, even when the cells share a second house.`,
    ];
  }

  if (NORMAL_FISH.has(kind) || FINNED_FISH.has(kind)) {
    const finned = FINNED_FISH.has(kind);
    const branch = firstGroup(step, /^branch$/i)?.tail || (finned ? "Finned" : "Standard");
    const sashimi = /sashimi/i.test(branch);
    const axes = fishAxes(step);
    const bases = axes.bases.join(zh ? "、" : ", ") || (zh ? "基准区域" : "base sets");
    const covers = axes.covers.join(zh ? "、" : ", ") || (zh ? "覆盖区域" : "cover sets");
    const body = groupCells(step, /^fishbody$/i).join(zh ? "、" : ", ");
    const fins = groupCells(step, /^fin$/i).join(zh ? "、" : ", ");
    const finBox = firstGroup(step, /^finbox$/i)?.houses?.join(zh ? "、" : ", ") || "";
    const digit = primaryDigits(step);
    const size = FISH_SIZE[kind] || axes.bases.length;
    const baseName = size === 2 ? "X-Wing" : size === 3 ? "Swordfish" : "Jellyfish";
    const baseNameZh = size === 2 ? "X翼" : size === 3 ? "剑鱼" : "水母";
    if (finned) {
      return zh ? [
        `${step?.title || (sashimi ? `Sashimi ${baseName}` : `Finned ${baseName}`)}（后端分支${branch}）：数字${digit}以${bases}为基准区域；这些基准区域中的${digit}全部落在${covers}中${body ? `，鱼身为${body}` : ""}${fins ? `。 鳍为${fins}` : ""}${finBox ? `，全部位于${finBox}` : ""}。`,
        `分两案看：若所有鳍都为假，剩余鱼身就是同阶普通鱼，基准区域要求的${size}个真数会填满${size}个覆盖区域；若至少一枚鳍为真，本步删数位于同一个鳍宫${finBox || ""}内，会与该真鳍直接冲突。`,
        `${sashimi ? "Sashimi只表示去掉鳍后至少一个基准区域只剩一个鱼身落点；它不改变上述二分证明。" : ""}${sashimi ? "两种情况" : "无论鳍全假还是至少一枚鳍为真"}都排除本步目标，所以后端报告的这些目标可删。`,
        `① 选${size}个基准区域和${size}个覆盖区域；② 求“基准区域减覆盖区域”得到鳍；③ 核对后端给出的鳍所在宫${finBox ? ` ${finBox}` : ""}；④ 只删除该宫中“覆盖区域减基准区域”的${digit}。`,
        `鱼身候选用cNormal(1)，鳍用cFins(2)，删数用cToDel(11)。`,
        `核对后端 Branch=${branch}；所有鳍必须在同一宫${finBox ? ` ${finBox}` : ""}，且删数必须位于该鳍宫内的 Cover\\Base。`,
      ] : [
        `${step?.title || `${sashimi ? "Sashimi" : "Finned"} ${baseName}`} (backend branch ${branch}): digit ${digit} uses ${bases} as bases; all base candidates lie in ${covers}${body ? `; body candidates: ${body}` : ""}${fins ? `; fins: ${fins}` : ""}${finBox ? `, all in ${finBox}` : ""}.`,
        `Use two cases: if every fin is false, the remaining body is an ordinary fish and the ${size} base truths fill the ${size} covers; if at least one fin is true, every reported target lies in the same fin box${finBox ? ` ${finBox}` : ""} and directly conflicts with that true fin.`,
        `${sashimi ? "Sashimi only means that after removing the fins at least one base has a single body position; the two-case proof is unchanged. " : ""}Both cases eliminate the backend-reported targets.`,
        `1. Choose ${size} base and ${size} cover sets. 2. Compute fins as Base\\Cover. 3. Confirm the reported fin box${finBox ? ` ${finBox}` : ""}. 4. Eliminate digit ${digit} only from Cover\\Base in that box.`,
        `Body candidates use cNormal(1), fins cFins(2), and eliminations cToDel(11).`,
        `Verify backend Branch=${branch}; all fins must lie in one box${finBox ? ` ${finBox}` : ""}, and eliminations must be in Cover\\Base inside that fin box.`,
      ];
    }
    return zh ? [
      `${step?.title || baseName}：数字${digit}以${bases}为基准区域；这些基准区域中的${digit}全部落在${covers}中${body ? `，鱼身为${body}` : ""}。`,
      `每个基准区域最终都必须放一个${digit}。因为这些可能位置只分布在同样数量的覆盖区域中，而同一覆盖区域不能同时放两个${digit}，所以这些真数必须一一占满全部覆盖区域。`,
      `因此覆盖区域中鱼身之外的${digit}若为真，就会抢掉一个已经必须留给基准真数的位置，使基准区域无法全部安置，所以后端报告的这些目标可删。`,
      `① 选${size}个基准行或列；② 确认其${digit}候选只占${size}个垂直覆盖区域；③ 检查每个基准区域鱼身候选数在2到${size}之间；④ 删除覆盖区域中鱼身外的${digit}。`,
      `鱼身候选用cNormal(1)，删数用cToDel(11)。`,
      `核对后端 Branch=Standard，基准区域数与覆盖区域数相同，且 Base\\Cover 为空；删数只来自 Cover\\Base。`,
    ] : [
      `${step?.title || baseName}: digit ${digit} uses ${bases} as bases; all base candidates lie in ${covers}${body ? `; body candidates: ${body}` : ""}.`,
      `Each base must eventually place one ${digit}. Those possibilities are confined to the same number of covers, and one cover cannot contain two copies of ${digit}, so the base truths must occupy all covers one-for-one.`,
      `Therefore a ${digit} in a cover but outside the fish body would steal capacity required by the base truths, leaving no way to place them all; the backend-reported targets are false.`,
      `1. Choose ${size} base rows or columns. 2. Confirm their ${digit} candidates occupy only ${size} perpendicular covers. 3. Check each base has 2 through ${size} body candidates. 4. Remove ${digit} from the covers outside the body.`,
      `Body candidates use cNormal(1); eliminations use cToDel(11).`,
      `A normal fish permits no Base\\Cover candidates. Every base must have at least 2 and at most ${size} body candidates. Row- and column-oriented fish use the same proof.`,
    ];
  }

  if (kind === "Skyscraper") {
    const branch = firstGroup(step, /^branch$/i)?.tail || "";
    const branchDisplay = localizedProofMeta(branch, locale);
    const columnBased = /^column-based$/i.test(branch);
    const bases = [firstGroup(step, /^basea$/i)?.houses?.[0], firstGroup(step, /^baseb$/i)?.houses?.[0]].filter(Boolean).join(zh ? "、" : ", ");
    const roofs = groupCells(step, /^roofs$/i).join(zh ? "、" : ", ");
    const linked = groupCells(step, /^linkedside$/i).join(zh ? "、" : ", ");
    const digit = digitText(firstGroup(step, /^roofs$/i)?.digits) || primaryDigits(step);
    return zh ? [
      `摩天楼（${columnBased ? "列型" : "行型"}）：数字${digit}在两条平行基准区域${bases || ""}中各恰有两个候选；相连侧为${linked || "高亮连接端"}，两个楼顶为${roofs || "高亮楼顶"}。`,
      `每条基准区域中的两个${digit}构成强关系。相连侧的两个候选互相看见，不能同时为真，因此两个楼顶至少一个为真。`,
      `目标若取${digit}，会同时排除两个楼顶；但两个楼顶至少一个必须为真，所以目标不能保留。`,
      `① 找两条同方向区域且每条只有两个${digit}；② 找能在垂直方向互相看见的一侧端点；③ 确认另侧两个楼顶不在同一垂直区域；④ 删除同时看见两楼顶的${digit}。`,
      `FB配色：楼顶用cNormal(1)，相连侧用cFins(2)，删数用cToDel(11)。`,
      `以后端分支=${branchDisplay}为准。严格核对两条基准强关系、相连侧互斥和楼顶位置；源码还排除两个楼顶与连接端构成同一宫带/宫栈的退化形。`,
    ] : [
      `Skyscraper (${columnBased ? "column-based" : "row-based"}): digit ${digit} occurs exactly twice in each parallel base ${bases || ""}; ${linked || "the highlighted linked side"} is the aligned side and ${roofs || "the highlighted cells"} are the roofs.`,
      `Each base contains a strong link. The two linked-side candidates see each other and cannot both be true, so at least one roof is true.`,
      `If the target took ${digit}, it would eliminate both roofs; at least one roof must be true, so the target cannot remain.`,
      `1. Find two parallel houses with exactly two ${digit}s each. 2. Align one endpoint from each in a perpendicular house. 3. Confirm the roofs are not aligned. 4. Remove ${digit} from common peers of the roofs.`,
      `FB colours: roofs cNormal(1), linked side cFins(2), eliminations cToDel(11).`,
      `Use backend Branch=${branch}. Strictly verify the two base strong links, mutual exclusion of the linked side, and roof placement; the detector also rejects its same-chute degeneracy.`,
    ];
  }

  if (kind === "TwoStringKite") {
    const branch = firstGroup(step, /^branch$/i)?.tail || "Standard";
    const branchDisplay = localizedProofMeta(branch, locale);
    const grouped = /^grouped$/i.test(branch);
    const row = firstGroup(step, /^rowhouse$/i)?.houses?.[0] || "";
    const col = firstGroup(step, /^columnhouse$/i)?.houses?.[0] || "";
    const box = firstGroup(step, /^connectorhouse$/i)?.houses?.[0] || "";
    const outer = groupCells(step, /^outerendpoints$/i).join(zh ? "、" : ", ");
    const rowInner = groupCells(step, /^rowinner$/i).join(zh ? "、" : ", ");
    const colInner = groupCells(step, /^columninner$/i).join(zh ? "、" : ", ");
    const connector = groupCells(step, /^connector$/i).join(zh ? "、" : ", ");
    const digit = digitText(firstGroup(step, /^outerendpoints$/i)?.digits) || primaryDigits(step);
    return zh ? [
      `${grouped ? "分组型 " : ""}2-String Kite：数字${digit}在${row || "一行"}与${col || "一列"}中都只跨两个宫；离开连接宫${box || ""}后，行端与列端各只剩一个外端${outer ? `（${outer}）` : ""}。连接宫内的行组为${rowInner || "高亮行组"}，列组为${colInner || "高亮列组"}${connector ? `，合并连接组为${connector}` : ""}。`,
      `相关行中的${digit}必须由行外端或连接宫内行组承担，相关列同理。连接宫内的行组和列组互不重叠，而同一宫里${digit}只能出现一次，所以两组不能同时承担${digit}；两个外端因此至少一个为真。`,
      `目标同时看见两个外端。若目标取${digit}，两个外端都会被排除，连接宫内的行组和列组就会同时被迫承担${digit}，违反同宫唯一性。因此目标不能保留。`,
      grouped
        ? `① 选一行和一列，使${digit}在各自区域都恰好跨两个宫；② 行列候选集合不相交；③ 连接宫外各恰好一个外端；④ 连接宫内每侧可有一个或多个候选；⑤ 删除同时看见两个外端的${digit}。`
        : `① 选一行和一列，使${digit}在各自区域都恰好跨两个宫；② 行列候选集合不相交；③ 连接宫外各恰好一个外端；④ 连接宫内每侧各一个候选；⑤ 删除同时看见两个外端的${digit}。`,
      `FB配色：两个外端用cNormal(1)，连接宫内整个连接组用cFins(2)，删数用cToDel(11)。`,
      `以后端分支=${branchDisplay}为准。严格核对每条线只跨两个宫、连接宫外各只有一个外端且两个内组互不重叠；${grouped ? "分组型连接候选并集多于2，组端不能误读成单一共轭候选。" : "标准型连接候选并集恰好为2。"}`,
    ] : [
      `${grouped ? "Grouped " : ""}2-String Kite: digit ${digit} occupies exactly two boxes in ${row || "one row"} and ${col || "one column"}. Outside connector box ${box || ""}, each line has exactly one outer endpoint${outer ? ` (${outer})` : ""}. The in-box row group is ${rowInner || "highlighted"}, the column group is ${colInner || "highlighted"}${connector ? `, giving connector group ${connector}` : ""}.`,
      `The selected row must place ${digit} at its outer endpoint or in its in-box row group, and the selected column has the analogous choice. The two in-box groups are disjoint but share one box, so they cannot both carry ${digit}; at least one outer endpoint is true.`,
      `The target sees both outer endpoints. If it took ${digit}, both outers would be removed and both in-box groups would be forced to carry ${digit}, violating box uniqueness. Therefore the target cannot remain.`,
      grouped
        ? `1. Choose a row and column whose ${digit} candidates each occupy exactly two boxes. 2. Their candidate sets are disjoint. 3. Each has exactly one outer candidate outside the connector box. 4. Either in-box side may contain multiple candidates. 5. Remove ${digit} from common peers of the outers.`
        : `1. Choose a row and column whose ${digit} candidates each occupy exactly two boxes. 2. Their candidate sets are disjoint. 3. Each has one outer candidate outside the connector box. 4. Each in-box side has one candidate. 5. Remove ${digit} from common peers of the outers.`,
      `FB colours: outer endpoints cNormal(1), every in-box connector candidate cFins(2), eliminations cToDel(11).`,
      `Use backend Branch=${branch}. Strictly verify two-box occupancy on each line, exactly one outer candidate per line, and disjoint inner groups; ${grouped ? "the grouped connector union has more than two candidates and is not one conjugate pair." : "the standard connector union has exactly two candidates."}`,
    ];
  }

  if (kind === "EmptyRectangle") {
    const box = firstGroup(step, /^erbox$/i)?.houses?.[0] || houseLabel(step, locale);
    const body = groupCells(step, /^erbody$/i).join(zh ? "、" : ", ");
    const eri = groupCells(step, /^erintersection$/i).join(zh ? "、" : ", ");
    const link = groupCells(step, /^stronglink$/i).join(zh ? "、" : ", ");
    const outside = groupCells(step, /^outsideendpoint$/i).join(zh ? "、" : ", ");
    const linkHouse = firstGroup(step, /^linkhouse$/i)?.houses?.[0] || "";
    const digit = digitText(firstGroup(step, /^erbody$/i)?.digits) || primaryDigits(step);
    return zh ? [
      `Empty Rectangle：${box}内数字${digit}的候选${body || "高亮宫内候选"}可由一条宫内行和一条宫内列覆盖，它们的空交点为${eri || "ERI交点"}；外部${linkHouse || "区域"}强关系为${link || "高亮强链"}，远端为${outside || "高亮外端"}。`,
      `宫内${digit}必须落在行臂或列臂。若落在直接看见目标的那一臂，目标立即被排除；若落在另一臂，就会排掉外部强关系靠近空矩形的一端，迫使远端为真，而远端同样看见目标。`,
      `两种宫内落点都会击中同一个目标，所以目标不能取${digit}。`,
      `① 在一个宫中找${digit}候选可被一行加一列覆盖；② 标出行列交点；③ 找跨宫的同数字共轭对，使靠近端与一条ER臂相连；④ 删除在另一分支和远端分支中都会被看见的目标。`,
      `FB配色：外部强链用cNormal(1)，宫内ER候选用cFins(2)，普通删数用cToDel(11)，若删数落在强链本体则用Cannibalism(12)。`,
      `严格核对宫内候选确实由一行加一列覆盖，交点本身不要求含${digit}；外部强关系必须是真正共轭对，并且两种后端可见分支都指向同一目标。`,
    ] : [
      `Empty Rectangle: the ${digit} candidates ${body || "highlighted in-box candidates"} in ${box} are covered by one local row and one local column, whose empty intersection is ${eri || "the ERI"}; ${link || "the highlighted conjugate pair"} is the external strong link in ${linkHouse || "a house"}, with far endpoint ${outside || "highlighted"}.`,
      `The box digit must lie on the row arm or the column arm. On the arm that sees the target, the target is removed directly; on the other arm, the near endpoint of the external conjugate pair is removed, forcing the far endpoint, which also sees the target.`,
      `Both possible in-box placements eliminate the same target, so the target cannot take ${digit}.`,
      `1. Find a box whose ${digit} candidates are coverable by one row plus one column. 2. Mark their intersection. 3. Find a cross-box conjugate pair linked to one ER arm. 4. Remove the target hit in both the direct-arm and far-endpoint cases.`,
      `FB colours: external link cNormal(1), in-box ER candidates cFins(2), normal eliminations cToDel(11), and a deletion on the link itself Cannibalism(12).`,
      `Strictly verify the row-plus-column cover, note that the intersection need not contain ${digit}, and require a genuine external conjugate pair whose two backend visibility cases hit the same target.`,
    ];
  }

  if (kind === "ERIPair") {
    const pair = groupCells(step, /^pair$/i).join(zh ? "、" : ", ");
    const support = groupCells(step, /^erisupport$/i).join(zh ? "、" : ", ");
    const active = groupCells(step, /^activeeri$/i).join(zh ? "、" : ", ");
    const opposite = groupCells(step, /^oppositeeri$/i).join(zh ? "、" : ", ");
    const digits = digitText(firstGroup(step, /^pair$/i)?.digits) || primaryDigits(step);
    return zh ? [
      `ERI Pair：两个不互见的同候选双值格${pair || "高亮Pair"}含数字${digits}，位于不同宫带且不同宫栈；当前活动ERI为${active || "高亮活动顶点"}，对顶ERI为${opposite || "高亮对顶点"}，活动宫支持格为${support || "高亮支持格"}。`,
      `两个Pair端点不能取同一个数字。若它们都取${digits}中的某一个数字，活动ERI所在宫里这个数字的所有支持位置都会被Pair端点看见并排除，导致该宫无处放这个数字；另一个数字同理。因此两个端点必须互补地分别取这两个数字。`,
      `后端列出的目标位于这组互补取值与活动ERI共同形成的删除域中。目标若为真，会在其中一种互补取值下封死活动宫必须留下的同数字落点，所以不能保留。`,
      `① 找两个候选完全相同且互不相见的双值格；② 它们位于不同宫带和宫栈；③ 选择共同矩形顶点之一为活动ERI；④ 核对活动宫内这两个数字的全部候选都被Pair端点覆盖；⑤ 只应用后端报告的删除域。`,
      `FB配色：Pair双值格用cNormal(1)，ERI支持候选用cFins(2)，普通删数用cToDel(11)，活动ERI上的自噬删数用Cannibalism(12)。`,
      `严格核对活动宫中两个数字都至少有一个候选，且没有任何相关候选漏出两个Pair端点的可见范围；活动/对顶ERI上的结构内删数同样以后端删除域为准，不能仅凭矩形外形外推。`,
    ] : [
      `ERI Pair: two non-seeing identical bivalue cells ${pair || "highlighted"} contain ${digits} in different bands and stacks; active ERI=${active || "highlighted"}, opposite ERI=${opposite || "highlighted"}, active-box support=${support || "highlighted"}.`,
      `The two pair endpoints cannot take the same digit. If both took either member of ${digits}, every support for that digit in the active ERI box would be seen and removed by the endpoints, leaving the box nowhere to place it. The same holds for the other digit, so the endpoints must take complementary values.`,
      `Each backend-reported target lies in the deletion domain jointly enforced by that complementary assignment and the active ERI. If it were true, it would block the same-digit position the active box must retain in one complementary case, so it is false.`,
      `1. Find two identical non-seeing bivalue cells. 2. Put them in different bands and stacks. 3. Choose one common rectangle vertex as the active ERI. 4. Verify every relevant candidate in the active box is covered by a pair endpoint. 5. Apply only the backend-reported deletion domain.`,
      `FB colours: pair cells cNormal(1), ERI support cFins(2), normal eliminations cToDel(11), and an elimination at the active ERI Cannibalism(12).`,
      `Strictly verify that both digits occur in the active box and no relevant candidate escapes pair visibility; internal active/opposite-ERI deletions also come from the backend deletion domain and must not be inferred from rectangle shape alone.`,
    ];
  }

  if (kind === "WWing") {
    const branch = firstGroup(step, /^branch$/i)?.tail || "Standard";
    const branchDisplay = localizedProofMeta(branch, locale);
    const grouped = /^grouped$/i.test(branch);
    const endpoints = groupCells(step, /^endpoints$/i).join(zh ? "、" : ", ");
    const pair = digitText(firstGroup(step, /^endpoints$/i)?.digits);
    const strong = groupCells(step, /^stronglink$/i).join(zh ? "、" : ", ");
    const linkDigit = digitText(firstGroup(step, /^stronglink$/i)?.digits);
    const deleteDigit = digitText(firstGroup(step, /^deletedigit$/i)?.digits) || primaryDigits(step);
    const house = firstGroup(step, /^linkhouse$/i)?.houses?.[0] || houseLabel(step, locale);
    return zh ? [
      `${grouped ? "分组型 " : ""}W-Wing：两个互不相见的同候选双值格${endpoints || "高亮端点"}为{${pair}}；连接数字${linkDigit}通过${house}内${strong || "高亮连接候选"}形成${grouped ? "分组强关系" : "共轭强关系"}。`,
      `连接区域中的每个${linkDigit}都被至少一个端点看见。若两个端点都不取删数数字${deleteDigit}，它们就都会取${linkDigit}，把连接区域里的${linkDigit}全部排空；但该区域必须有一个${linkDigit}，所以两个端点至少有一个取${deleteDigit}。`,
      `目标若取${deleteDigit}并同时看见两个端点，就会让两个端点都不能取${deleteDigit}，与“至少一端取${deleteDigit}”矛盾，因此目标不能保留。`,
      `① 找两个候选对相同且互不相见的双值格；② 选一个数字作连接数字；③ 找一个区域，使其中全部连接数字候选都被两个端点的可见范围覆盖；④ 删除同时看见两个端点的另一个数字。`,
      `FB配色：连接数字在强关系和端点中用cFins(2)，端点的删数数字用cNormal(1)，目标用cToDel(11)。`,
      `以后端分支=${branchDisplay}为准。${grouped ? "分组型允许连接区域多于两个候选，但不能有候选漏出两个端点的可见范围。" : "标准型连接区域恰好有两个候选，形成普通共轭对。"} 两端点本身不能共享行、列或宫。`,
    ] : [
      `${grouped ? "Grouped " : ""}W-Wing: two non-seeing bivalue endpoints ${endpoints || "highlighted"} share {${pair}}; link digit ${linkDigit} is carried by ${strong || "the highlighted candidates"} in ${house} as a ${grouped ? "grouped strong relation" : "conjugate relation"}.`,
      `Every ${linkDigit} in the connector house is seen by at least one endpoint. If neither endpoint took deletion digit ${deleteDigit}, both would take ${linkDigit} and remove every ${linkDigit} from the connector house; since the house must contain the digit, at least one endpoint takes ${deleteDigit}.`,
      `If a target ${deleteDigit} sees both endpoints and were true, neither endpoint could take ${deleteDigit}, contradicting the required endpoint alternative. Therefore the target is false.`,
      `1. Find two identical non-seeing bivalue cells. 2. Choose one digit as the link digit. 3. Find a house where every link candidate is covered by endpoint visibility. 4. Remove the other digit from common peers of the endpoints.`,
      `FB colours: link digit in connector/endpoints cFins(2), other endpoint digit cNormal(1), targets cToDel(11).`,
      `Use backend Branch=${branch}. ${grouped ? "The grouped branch may contain more than two connector candidates, but none may escape both endpoint views." : "The standard branch contains exactly two connector candidates, forming an ordinary conjugate pair."} The endpoints share no house.`,
    ];
  }

  if (kind === "XYWing" || kind === "XYZWing") {
    const xyz = kind === "XYZWing";
    const pivot = firstGroup(step, /^pivot$/i);
    const wa = firstGroup(step, /^winga$/i);
    const wb = firstGroup(step, /^wingb$/i);
    const z = digitText(firstGroup(step, /^sharedz$/i)?.digits) || primaryDigits(step);
    const pText = `${cellNames(pivot?.cells, 1)}{${digitText(pivot?.digits)}}`;
    const aText = `${cellNames(wa?.cells, 1)}{${digitText(wa?.digits)}}`;
    const bText = `${cellNames(wb?.cells, 1)}{${digitText(wb?.digits)}}`;
    return zh ? [
      `${xyz ? "XYZ" : "XY"}-Wing：枢轴${pText}分别看见翼格${aText}与${bText}；两个翼格互不相见，共同候选为Z=${z}。`,
      xyz
        ? `枢轴本身也含Z。若枢轴取Z，Z已经在结构内为真；若枢轴取另外两个数字之一，相应分支会迫使某一翼取Z。因此枢轴或两翼中的Z至少一个为真。`
        : `枢轴只有两个非Z数字。它取其中任意一个，都会迫使对应的另一翼取Z，所以两个翼格中的Z至少一个为真。`,
      xyz
        ? `目标若取Z并同时看见枢轴和两翼中的全部Z位置，就会把结构内所有可能的Z都排除，与“至少一个结构Z为真”矛盾，因此可删。`
        : `目标若取Z并同时看见两个翼上的Z，就会把两个翼的Z都排除，与“至少一个翼Z为真”矛盾，因此可删。`,
      `① 找${xyz ? "三值" : "双值"}枢轴；② 找两个双值翼，各与枢轴共享不同数字；③ 两翼共同只含一个Z且彼此不共享区域；④ 删除${xyz ? "同时看见枢轴和两翼全部Z位置" : "同时看见两翼Z"}的目标。`,
      `FB配色：非Z结构候选用cNormal(1)，Z用cFins(2)，删数用cToDel(11)。`,
      `${xyz ? "严格核对枢轴为三值、两翼为双值，目标必须看见枢轴与两翼中的全部Z。" : "严格核对枢轴与两翼均为双值，枢轴不能含Z之外的第三数，目标只需看见两个翼Z。"} 两翼不能共享行、列或宫。`,
    ] : [
      `${xyz ? "XYZ" : "XY"}-Wing: pivot ${pText} sees wings ${aText} and ${bText}; the wings do not see each other and share Z=${z}.`,
      xyz
        ? `The pivot also contains Z. If it takes Z, Z is already true in the structure; if it takes either other digit, the corresponding case forces one wing to Z. Thus Z is true in the pivot or a wing.`
        : `The pivot contains the two non-Z digits. Whichever one it takes forces the corresponding opposite wing to Z, so at least one wing contains Z.`,
      xyz
        ? `A target Z seeing every Z in the pivot and both wings would eliminate every structural Z if true, contradicting the required structural Z, so it is false.`
        : `A target Z seeing both wing Zs would eliminate both if true, contradicting the required wing Z, so it is false.`,
      `1. Find a ${xyz ? "trivalue" : "bivalue"} pivot. 2. Find two bivalue wings sharing different pivot digits. 3. Their sole common digit is Z and the wings share no house. 4. Remove Z from cells seeing ${xyz ? "every pivot/wing Z" : "both wing Zs"}.`,
      `FB colours: non-Z structure candidates cNormal(1), Z cFins(2), eliminations cToDel(11).`,
      `${xyz ? "Strictly verify a trivalue pivot, bivalue wings, and full target visibility to every pivot/wing Z." : "Strictly verify a bivalue pivot and wings; a target need only see both wing Zs."} The wings share no row, column, or box.`,
    ];
  }

  if (kind === "XYZRing") {
    const branch = firstGroup(step, /^branch$/i)?.tail || "";
    const branchDisplay = localizedProofMeta(branch, locale);
    const complete = /^complete$/i.test(branch);
    const half = /^half$/i.test(branch);
    const pivot = groupCells(step, /^pivot$/i).join(zh ? "、" : ", ");
    const wings = [...groupCells(step, /^winga$/i), ...groupCells(step, /^wingb$/i)].join(zh ? "、" : ", ");
    const connector = groupCells(step, /^connectorz$/i).join(zh ? "、" : ", ");
    const z = digitText(firstGroup(step, /^connectorz$/i)?.digits) || primaryDigits(step);
    const connectorHouse = firstGroup(step, /^connectorhouse$/i)?.houses?.[0] || houseLabel(step, locale);
    const covers = [firstGroup(step, /^ringcovera$/i)?.houses?.[0], firstGroup(step, /^ringcoverb$/i)?.houses?.[0]].filter(Boolean).join(zh ? "、" : ", ");
    return zh ? [
      `${complete ? "完全型" : half ? "半环型" : "XYZ"} XYZ-Ring：枢轴${pivot || "高亮枢轴"}与两翼${wings || "高亮翼格"}形成XYZ核心；${connectorHouse}中的全部Z=${z}候选${connector || "高亮连接组"}都被两个翼端的可见范围覆盖，闭合成环。`,
      `XYZ核心把X、Y、Z三种取值分支传到两个翼端，连接区域里的Z又把两端闭合。${complete ? `完全型还有两个覆盖区域${covers || "后端RingCover"}完整覆盖整个环。` : `半环型只有两侧桥接覆盖，并没有完整覆盖整个环。`}`,
      complete
        ? `闭环先排除枢轴与对应翼共同可见的X/Y；两个覆盖区域又完整承接环上的Z，所以覆盖区域中结构外的Z若为真，就会抢掉环必须使用的位置，因此也可删。`
        : `闭环同样排除枢轴与对应翼共同可见的X/Y；Z只由两侧桥接约束，所以只有同时落入后端两侧桥接范围并看见枢轴的Z，才会与所有分支冲突。`,
      `① 建立XYZ枢轴和两个互不相见翼格；② 找一个区域，使其中全部Z都被两个翼端的可见范围覆盖；③ 以后端Branch判断完全型/半环型；④ 按对应覆盖关系应用X/Y及Z删数。`,
      `现有FB语义：核心非Z候选用cFins(2)，核心Z用cEdoFins(3)，额外连接Z用cNormal(1)，删数用cToDel(11)。`,
      `以后端分支=${branchDisplay}为准，不能从标题猜分支。连接区域内不能有Z漏出两个翼端的可见范围；${complete ? "完全型必须有两个额外RingCover完整覆盖全部环节点。" : "半环型只要求两侧桥接，Z目标还必须看见枢轴，不能套用完全型范围。"}`,
    ] : [
      `${complete ? "Complete" : half ? "Half" : "XYZ"} XYZ-Ring: pivot ${pivot || "highlighted"} and wings ${wings || "highlighted"} form an XYZ core; every Z=${z} in ${connectorHouse}, ${connector || "the highlighted connector group"}, is covered by wing visibility and closes the ring.`,
      `The XYZ core propagates the X/Y/Z alternatives to the wings, while connector Z candidates close the two sides. ${complete ? `Two cover houses ${covers || "the backend RingCovers"} cover the whole ring.` : `Only side-specific bridge covers exist; they do not cover the whole ring.`}`,
      complete
        ? `The ring removes X/Y from common peers of pivot and the matching wing; because the two covers completely carry the ring Zs, an extra Z in those covers would steal required ring capacity and is false.`
        : `The ring likewise removes X/Y from common peers of pivot and matching wing; a Z is false only when it lies in both backend bridge ranges and also sees the pivot, so it conflicts with every case.`,
      `1. Build an XYZ pivot with two non-seeing wings. 2. Find a house whose every Z is covered by wing visibility. 3. Use backend Branch to distinguish Complete/Half. 4. Apply branch-specific X/Y and Z eliminations.`,
      `Current FB semantics: core non-Z cFins(2), core Z cEdoFins(3), extra connector Z cNormal(1), eliminations cToDel(11).`,
      `Use backend Branch=${branch}; never infer the branch from the title. No connector-house Z may escape both wings. ${complete ? "Complete requires two additional RingCovers that cover every ring node." : "Half uses side bridges only, and a Z target must also see the pivot."}`,
    ];
  }

  if (kind === "WXYZWing") {
    const branch = firstGroup(step, /^branch$/i)?.tail || "Standard";
    const branchDisplay = localizedProofMeta(branch, locale);
    const restricted = /^restricted-z$/i.test(branch);
    const pivot = firstGroup(step, /^pivot$/i);
    const wa = firstGroup(step, /^winga$/i);
    const wb = firstGroup(step, /^wingb$/i);
    const wc = firstGroup(step, /^remotewing$/i);
    const allDigits = digitText(firstGroup(step, /^wxyzset$/i)?.digits);
    const z = digitText(firstGroup(step, /^sharedz$/i)?.digits) || primaryDigits(step);
    const zCells = groupCells(step, /^sharedz$/i).join(zh ? "、" : ", ");
    return zh ? [
      `WXYZ-Wing（${restricted ? "受限Z型" : "标准型"}）：枢轴${cellNames(pivot?.cells, 1)}{${digitText(pivot?.digits)}}与同区域两翼${cellNames(wa?.cells, 1)}{${digitText(wa?.digits)}}、${cellNames(wb?.cells, 1)}{${digitText(wb?.digits)}}，再加远端双值翼${cellNames(wc?.cells, 1)}{${digitText(wc?.digits)}}；四格候选并集为{${allDigits}}，公共受限数字Z=${z}位于${zCells}。`,
      `远端翼的非Z数字不在两个同区域翼中，却与枢轴共享；远端翼又看见枢轴。若结构内所有Z都为假，远端翼和枢轴会被迫取同一个非Z数字并冲突，所以结构内至少一个Z必须为真。`,
      `任何同时看见结构内全部Z位置的外部Z若为真，都会把这些Z全部排除，与“至少一个结构Z为真”矛盾。${restricted ? ` 受限Z型中全部Z位置还落在同一行、列或宫，使四格四数分配进一步闭合；后端报告的共同可见非Z目标也不能保留。` : ""}`,
      `① 选枢轴及与它同区域的两个翼；② 三格候选并集不超过三个数字；③ 加入一个看见枢轴的远端双值翼，使四格并集恰好四数字且只以Z与前两翼集合相交；④ 删除看见全部Z位置的Z。${restricted ? " 受限Z型再按后端闭合分配应用非Z删数。" : ""}`,
      `FB配色：结构中的Z用cFins(2)，其余W/X/Y用cNormal(1)，删数用cToDel(11)。`,
      `以后端分支=${branchDisplay}为准。四格并集必须恰好四数字；远端翼必须双值、在前三格共同区域之外但看见枢轴。${restricted ? "受限Z附加删数只在全部Z位置同属一个行、列或宫时成立。" : ""}`,
    ] : [
      `WXYZ-Wing (${restricted ? "Restricted-Z" : "Standard"}): pivot ${cellNames(pivot?.cells, 1)}{${digitText(pivot?.digits)}} and co-house wings ${cellNames(wa?.cells, 1)}{${digitText(wa?.digits)}}, ${cellNames(wb?.cells, 1)}{${digitText(wb?.digits)}}, plus remote bivalue wing ${cellNames(wc?.cells, 1)}{${digitText(wc?.digits)}} have union {${allDigits}}; restricted common digit Z=${z} occurs at ${zCells}.`,
      `The remote wing's non-Z digit is absent from the two co-house wings but shared with the pivot, and the remote wing sees the pivot. If every structural Z were false, the remote wing and pivot would be forced to the same non-Z digit and conflict, so at least one structural Z is true.`,
      `Any external Z seeing every structural Z position would eliminate them all if true, contradicting the required structural Z.${restricted ? ` In Restricted-Z, all Z positions also share one house, further closing the four-cell/four-digit allocation; backend-reported common-peer non-Z targets are false too.` : ""}`,
      `1. Choose a pivot and two co-house wings. 2. Their union uses at most three digits. 3. Add a pivot-seeing remote bivalue wing so the four-cell union is exactly four digits and its sole intersection with the first-wing union is Z. 4. Remove Z from cells seeing every Z position.${restricted ? " Apply backend closed-allocation non-Z eliminations as well." : ""}`,
      `FB colours: structural Z cFins(2), W/X/Y cNormal(1), eliminations cToDel(11).`,
      `Use backend Branch=${branch}. The four-cell union must contain exactly four digits; the remote wing is bivalue, outside the first three cells' common house, but sees the pivot.${restricted ? " Restricted-Z extras require all Z positions in one row, column, or box." : ""}`,
    ];
  }

  return null;
}


function buildAuditedPhase3Guide(step = {}, locale = "zh") {
  const zh = localeKey(locale) === "zh";
  const kind = String(step?.kind || "");
  const digit = digitText(firstGroup(step, /^(fishdigit|brokenloop)$/i)?.digits) || primaryDigits(step);

  if (kind === "BrokenWing") {
    const loopRole = firstGroup(step, /^brokenloop$/i);
    const guardianRole = firstGroup(step, /^guardians$/i);
    const targetRole = firstGroup(step, /^targets$/i);
    const cannibalRole = firstGroup(step, /^cannibaltargets$/i);
    const loop = cellNames(loopRole?.cells || [], 14, locale);
    const guardians = cellNames(guardianRole?.cells || [], 14, locale);
    const targets = cellNames(targetRole?.cells || step?.eliminations || [], 14, locale);
    const cannibals = cellNames(cannibalRole?.cells || [], 14, locale);
    const length = list(loopRole?.cells).length;
    return zh ? [
      `Broken Wing：数字${digit}在${loop || "高亮格"}形成长度${length || "为奇数"}的单数字奇环；每条本来不是共轭对的环边，由守护候选${guardians || "高亮守护候选"}补足。`,
      `若所有守护候选都为假，环上每一对相邻节点都会变成强关系。沿奇数条强弱交替关系绕行一周，会把起点同时推出真与假，因而“所有守护全假”不可能；守护集合至少一真。`,
      `反过来假设目标成立：因为目标同时看见所有守护候选，它会把这些守护全部排除，于是剩下的奇环被迫全部变成强关系并产生矛盾。因此目标不能成立。${cannibals ? ` 本步还有环内自噬删数${cannibals}。` : ""}`,
      `① 固定数字${digit}；② 沿共享行、列、宫的候选建立奇数环；③ 对每条非共轭边收集该区域中其余${digit}作为守护候选；④ 确认守护候选全假会令整环全部变成共轭边；⑤ 删除同时看见全部守护候选的${digit}${targets ? `（${targets}）` : ""}。`,
      `FB配色：奇环本体用cNormal(1)，守护候选用cFins(2)，普通删数用cToDel(11)，环内自噬删数使用颜色编号12。`,
      `环长度必须大于4且为奇数；相邻环节点必须共享有效区域；守护集合必须包含每条环边所在区域中除两端外的全部${digit}。POM/模板只用于筛选可能删数目标，不是本步逻辑证明。`,
    ] : [
      `Broken Wing: digit ${digit} forms a single-digit odd loop of length ${length || "odd"} on ${loop || "the highlighted cells"}. Every loop edge that is not already conjugate is completed by guardian candidates ${guardians || "highlighted"}.`,
      `If every guardian were false, every adjacent pair on the loop would become a strong link. Propagating alternating truth around an odd cycle returns to the start with the opposite value, so the all-guardians-false case is impossible; at least one guardian is true.`,
      `Assume the target is true. Because it sees every guardian, it would remove them all; the remaining odd loop would then be forced entirely into strong links and become contradictory. Therefore the target cannot be true.${cannibals ? ` The step also has cannibal eliminations at ${cannibals}.` : ""}`,
      `1. Fix digit ${digit}. 2. Build an odd loop through shared rows, columns and boxes. 3. For every non-conjugate edge, collect all other ${digit}s in that house as guardians. 4. Verify all guardians false makes every edge conjugate. 5. Remove ${digit} from cells seeing all guardians${targets ? ` (${targets})` : ""}.`,
      `FB colours: loop body cNormal(1), guardians cFins(2), ordinary eliminations cToDel(11), eliminations inside the loop Cannibalism(12).`,
      `The loop length must be odd and greater than four. Adjacent nodes must share a valid house, and the guardian set must include every other ${digit} on each loop edge's house. POM/template search is only a target filter, not the proof.`,
    ];
  }

  if (kind === "ComplexSwordfish" || kind === "ComplexJellyfish" || kind === "ComplexSquirmbagFish") {
    const branch = firstGroup(step, /^branch$/i)?.tail || "";
    const bases = firstGroup(step, /^base$/i)?.houses?.join(zh ? "、" : ", ") || (zh ? "高亮基准区域" : "the highlighted bases");
    const covers = firstGroup(step, /^cover$/i)?.houses?.join(zh ? "、" : ", ") || (zh ? "高亮覆盖区域" : "the highlighted covers");
    const body = groupCells(step, /^fishbody$/i).join(zh ? "、" : ", ");
    const regularFins = groupCells(step, /^regfins$/i).join(zh ? "、" : ", ");
    const endoFins = groupCells(step, /^edofins$/i).join(zh ? "、" : ", ");
    const targets = groupCells(step, /^targets$/i).join(zh ? "、" : ", ");
    const cannibals = groupCells(step, /^cannibaltargets$/i).join(zh ? "、" : ", ");
    const size = FISH_SIZE[kind] || firstGroup(step, /^base$/i)?.houses?.length || 0;
    const isMutant = /mutant/i.test(branch);
    const isSashimi = /sashimi/i.test(branch);
    const isFinned = /finned|sashimi/i.test(branch);
    const geometry = zh
      ? (isMutant ? "Mutant允许同一侧同时混用行、列、宫" : "Franken只在单一方向的线中混入宫")
      : (isMutant ? "Mutant may mix rows, columns and boxes on the same side" : "Franken mixes boxes with only one line direction");
    const branchZh = branch || "复杂鱼";
    return zh ? [
      `${branchZh}：数字${digit}使用${size}个Base（${bases}）与${size}个Cover（${covers}）；${geometry}${body ? `。鱼身为${body}` : ""}${regularFins ? `，普通鳍为${regularFins}` : ""}${endoFins ? `，内生鳍为${endoFins}` : ""}${cannibals ? `，自噬目标为${cannibals}` : ""}。`,
      `把每个Base看成“必须交出一个${digit}”的区域，把每个Cover看成“最多接收一个${digit}”的区域。Base与Cover数量相同，所以没有鳍时，Base必须交出的真数会一一占满全部Cover。`,
      `${isFinned ? `分两案看：若普通鳍和内生鳍全部为假，剩余鱼身回到等量Base/Cover的满容量状态，外部目标会抢占Cover名额${cannibals ? "，自噬目标同时落在多个Cover中，会一次占掉多个名额" : ""}；若至少一个鳍为真，本步保留的目标都同时看见全部鳍，会与那个真鳍直接冲突。${isSashimi ? "Sashimi只表示去掉鳍后至少一个Base只剩一个鱼身落点，不改变这两案证明。" : ""}` : `Base真数已经一一占满Cover。Cover中但Base外的${digit}若为真，会抢掉一个必需名额${cannibals ? `；${cannibals}同时落在多个Cover中，一旦为真会一次占掉多个Cover名额，使剩余Base无处安置` : ""}。`}`,
      `① 按${size}阶选择Base；② 选择同数目的Cover并按后端Branch核对Franken/Mutant几何；③ 区分鱼身、普通鳍与内生鳍；④ ${isFinned ? "核对每个目标同时看见全部鳍" : "删除Cover中Base外的候选"}${targets ? `（${targets}）` : ""}；⑤ ${cannibals ? `单独核对自噬删数${cannibals}` : "若无自噬目标则跳过"}。`,
      `FB配色：鱼身cNormal(1)，普通鳍cFins(2)，内生鳍cEdoFins(3)，普通删数cToDel(11)，结构内自噬删数(12)。`,
      `核对后端 Branch=${branch || "(missing)"}：Franken同一侧不能同时混用行、列，Mutant按实际行/列/宫组合核对；普通鳍来自Base\\Cover，内生鳍来自多个Base的重叠。若有鳍，所有外部与自噬目标必须同时看见全部鳍。POM只负责筛目标，不是证明。`,
    ] : [
      `${branch || "Complex Fish"}: digit ${digit} uses ${size} bases (${bases}) and ${size} covers (${covers}); ${geometry}${body ? `. Body: ${body}` : ""}${regularFins ? `; regular fins: ${regularFins}` : ""}${endoFins ? `; endo fins: ${endoFins}` : ""}${cannibals ? `; cannibal targets: ${cannibals}` : ""}.`,
      `Treat each base as a region that must supply one ${digit}, and each cover as a region that can receive at most one ${digit}. With equal counts, the base truths fill all covers one-for-one when there are no fins.`,
      `${isFinned ? `Use two cases: if every regular and endo fin is false, the remaining body returns to equal base/cover capacity, so an external target steals a cover slot${cannibals ? " and a cannibal target in multiple covers consumes multiple slots at once" : ""}; if at least one fin is true, every retained target sees all fins and conflicts with that true fin.${isSashimi ? " Sashimi only means that after removing the fins at least one base has one body position; it does not change the two-case proof." : ""}` : `The base truths already fill the covers one-for-one. A ${digit} in Cover\\Base steals a required slot${cannibals ? `; ${cannibals} lies in multiple covers and would consume several cover slots at once, leaving too few for the remaining bases` : ""}.`}`,
      `1. Choose ${size} bases. 2. Choose the same number of covers and verify Franken/Mutant geometry from the backend Branch. 3. Separate body, regular fins and endo fins. 4. ${isFinned ? "Verify every target sees every fin" : "remove candidates in Cover outside Base"}${targets ? ` (${targets})` : ""}. 5. ${cannibals ? `Check cannibal targets separately (${cannibals})` : "Skip if there are no cannibal targets"}.`,
      `FB colours: body cNormal(1), regular fins cFins(2), endo fins cEdoFins(3), ordinary eliminations cToDel(11), internal eliminations Cannibalism(12).`,
      `Verify backend Branch=${branch || "(missing)"}: Franken must not mix row and column lines on the same side; Mutant follows the reported row/column/box mix. Regular fins come from Base\\Cover and endo fins from base overlaps. With fins present, every external and cannibal target must see every fin. POM filters targets but is not the proof.`,
    ];
  }

  if (kind === "Multifish") {
    const branch = firstGroup(step, /^branch$/i)?.tail || "";
    const branchLabel = localizedProofMeta(branch, locale);
    const sourceDigits = digitText(firstGroup(step, /^sourcedigits$/i)?.digits) || primaryDigits(step);
    const truthGroups = groupsMatching(step, /^truth$/i);
    const linkGroups = groupsMatching(step, /^link$/i);
    const truthCount = Number(firstGroup(step, /^truthcount$/i)?.tail || truthGroups.length);
    const linkCount = Number(firstGroup(step, /^linkcount$/i)?.tail || linkGroups.length);
    const truthLabels = truthGroups.map((g) => g.tail).filter(Boolean).join(zh ? "、" : ", ");
    const linkLabels = linkGroups.map((g) => g.tail).filter(Boolean).join(zh ? "、" : ", ");
    const truthCells = groupCells(step, /^truthcells$/i).join(zh ? "、" : ", ");
    const cellLinks = groupCells(step, /^celllinks$/i).join(zh ? "、" : ", ");
    const targets = groupCells(step, /^targets$/i).join(zh ? "、" : ", ");
    const cannibals = groupCells(step, /^cannibaltargets$/i).join(zh ? "、" : ", ");
    return zh ? [
      `复数鱼（${branchLabel || "混合覆盖"}）：这不是单数字鱼。搜索从源数字${sourceDigits}出发，但最终证明以后端实际Truth/Link分组为准；平衡结构时还可能补入额外宫Truth或整格Truth。当前共有${truthCount}个“必须兑现的数字×区域任务”（Truth）和${linkCount}个“至多接收一个真候选的容量约束”（Link）。Truth为${truthLabels}${truthCells ? `，另有整格Truth=${truthCells}` : ""}；Link为${linkLabels}${cellLinks ? `，另有单格Link=${cellLinks}` : ""}${targets ? `；外部目标=${targets}` : ""}${cannibals ? `；结构内自噬目标=${cannibals}` : ""}。`,
      `把Truth想成必须完成的任务，把Link想成只有一个座位的限制。后端已经验证每个Truth的可选落点都被这些Link覆盖；任务数和座位数又正好相同，所以全部座位都必须留给这些任务，一一占满，不能再让别的候选插进来。`,
      `${targets ? "外部目标若为真，会先占掉一个已经必须留给Truth的Link座位，却没有增加新的必做任务，于是至少一个Truth无处安置。" : ""}${cannibals ? "结构内自噬目标已经属于这套结构；它若保留，会在已经排满的容量关系中造成重复占位或额外冲突，同样无法成立。" : ""}`,
      `① 把源数字${sourceDigits}只当作搜索起点，并读取后端${branchLabel || "基准方向"}；② 以实际Truth列表为准（它可能含额外宫Truth/整格Truth），逐项展开成必须完成的任务；③ 把每个Link逐项展开成一个容量座位${cellLinks ? "，其中单格Link同样只能容纳一个真候选" : ""}；④ 核对任务数与座位数相等且所有Truth候选都被Links覆盖；⑤ ${targets ? `删除抢座位的外部目标（${targets}）` : "没有外部目标需要处理"}${cannibals ? `，并单独核对结构内自噬${cannibals}` : ""}。`,
      `FB配色按区域类型区分Truth/Link：行用cFins(2)，列用cNormal(1)，宫用cAls1；附加格Truth用cEdoFins，格Link用cDouble(10)，普通删数cToDel(11)，自噬Cannibalism(12)。`,
      `严格核对：TruthCount=${truthCount}、LinkCount=${linkCount}、Rank=0，并确认每个Truth的全部候选都被Link体系覆盖；行基型/列基型方向以及TruthCells、CellLinks都只采用本步后端分组，不从标题猜测。满足这些条件后才可称为严格Rank 0。`,
    ] : [
      `Multi-Fish (${branch || "mixed cover"}): this is not a one-digit fish. The search starts from source digits ${sourceDigits}, but the proof follows the actual backend Truth/Link groups; balancing may add extra box truths or whole-cell truths. This step has ${truthCount} required digit-by-house tasks (Truths) and ${linkCount} capacity constraints that can accept at most one true candidate (Links). Truths: ${truthLabels}${truthCells ? `; extra cell truths=${truthCells}` : ""}; links: ${linkLabels}${cellLinks ? `; extra cell links=${cellLinks}` : ""}${targets ? `; external targets=${targets}` : ""}${cannibals ? `; internal cannibal targets=${cannibals}` : ""}.`,
      `Think of each Truth as a task that must be completed and each Link as a one-seat capacity constraint. The backend has verified that every possible placement for the Truths is covered by these Links. Because the number of required tasks equals the number of seats, all seats must be occupied by those tasks one-for-one; no extra candidate can take one.`,
      `${targets ? "If an external target were true, it would take a Link seat already needed by the Truths without adding a required task, leaving at least one Truth with nowhere to go." : ""}${cannibals ? " An internal cannibal target already belongs to the structure; keeping it would create duplicate occupancy or an extra conflict inside this already-full assignment." : ""}`,
      `1. Treat source digits ${sourceDigits} only as the search starting point and read the backend ${branch || "base orientation"}. 2. Follow the actual Truth list (which may add box/cell truths) and expand each required task. 3. Expand every Link into one capacity seat${cellLinks ? ", including cell links that can hold only one true candidate" : ""}. 4. Verify equal task/seat counts and full Truth coverage. 5. ${targets ? `Remove external targets that steal seats (${targets})` : "There are no external targets in this step"}${cannibals ? ` and check internal cannibals separately (${cannibals})` : ""}.`,
      `FB colours depend on house type: row Truth/Link cFins(2), column cNormal(1), box cAls1; extra cell truths cEdoFins, cell links cDouble(10), ordinary eliminations cToDel(11), cannibals Cannibalism(12).`,
      `Strict check: TruthCount=${truthCount}, LinkCount=${linkCount}, rank=0, and every candidate of every Truth is covered by the Link system. Row-Based/Column-Based, TruthCells, and CellLinks must come from this step's backend groups. Only then is this strict rank 0.`,
    ];
  }

  return null;
}


function buildAuditedPhase4Guide(step = {}, locale = "zh") {
  const zh = localeKey(locale) === "zh";
  const cn = (cells, max = 14) => cellNames(cells, max, locale);
  const kind = String(step?.kind || "");
  const branch = firstGroup(step, /^branch$/i)?.tail || String(step?.title || "");
  const branchLabel = localizedProofMeta(branch, locale);
  const targets = groupCells(step, /^targets$/i).join(zh ? "、" : ", ") || cn(step?.eliminations || []);
  const cannibals = groupCells(step, /^cannibaltargets$/i).join(zh ? "、" : ", ");

  if (kind === "AlmostPair" || kind === "AlmostTriple") {
    const sector = firstGroup(step, /^activesector$/i);
    const ahs = firstGroup(step, /^ahs$/i);
    const als = firstGroup(step, /^als$/i);
    const subtype = firstGroup(step, /^subtype$/i)?.tail || "";
    const subtypeLabel = localizedProofMeta(subtype, locale);
    const doubleIntersection = /double-intersection/i.test(subtype);
    const digits = digitText(sector?.digits) || primaryDigits(step);
    const n = kind === "AlmostPair" ? 2 : 3;
    const intersectionOccupancy = doubleIntersection ? 2 : 1;
    const outerCells = n - intersectionOccupancy;
    return zh ? [
      `${kind === "AlmostPair" ? "近似数对" : "近似三数组"}（${branchLabel}${subtype ? ` / ${subtypeLabel}` : ""}）：宫线交区${cn(sector?.cells)}承载数字组{${digits}}；交区一侧是ALS ${cn(als?.cells)}，另一侧是AHS ${cn(ahs?.cells)}。`,
      doubleIntersection
        ? `双交区子类要求1格/${n}数ALS、三格交区全部含{${digits}}，以及另一侧唯一1格AHS承载同一组数字。ALS外格先占1个活动数字，因而交区恰占2个，AHS格必须承接剩余1个。`
        : `源码要求ALS由${outerCells}格容纳${n}个数字，AHS由${outerCells}格锁住同一组${n}个数字。两侧共同迫使宫线交区中的这组数字恰占${intersectionOccupancy}个位置，因此ALS同侧的其余{${digits}}和AHS格中的额外候选可删。`,
      `设D为${n}个活动数字，A为${outerCells}格ALS，H为${outerCells}格AHS。A中的格都只能取D，所以A占用${outerCells}个D，交区必须占用${intersectionOccupancy}个D；H是另一house域外全部D的唯一${outerCells}个承载格，因此H中的额外候选可删。`,
      `① 选宫与相交行/列；② 在非交区一侧找${outerCells}格/${n}数ALS；③ 在另一侧确认恰有${outerCells}格包含全部活动数字；④ ${doubleIntersection ? "核对三格交区全部含活动数字" : "核对交区至少有两个活动格"}；⑤ 删除ALS同侧其余活动数字及AHS格中的额外数字${targets ? `（${targets}）` : ""}。`,
      `FB配色：活动交区候选cNormal(1)，AHS全部候选cFins(2)，ALS全部候选cEdoFins(3)，普通删数cToDel(11)。`,
      `必须按实际分支区分“宫 ALS / 线 AHS”与“线 ALS / 宫 AHS”，并按子类型区分单交区与双交区；近似数对/近似三数组不是朋友项目的通用ALC。`,
    ] : [
      `${kind === "AlmostPair" ? "Almost Pair" : "Almost Triple"} (${branchLabel}${subtype ? ` / ${subtypeLabel}` : ""}): the box-line intersection ${cn(sector?.cells)} carries digit set {${digits}}; one side contains ALS ${cn(als?.cells)}, the other AHS ${cn(ahs?.cells)}.`,
      doubleIntersection
        ? `The Double-Intersection subtype requires a one-cell/${n}-digit ALS, all three intersection cells carrying {${digits}}, and exactly one AHS carrier on the other side. The ALS consumes one active digit, forcing two into the intersection and the last into the AHS carrier.`
        : `The detector requires an ${outerCells}-cell/${n}-digit ALS and an ${outerCells}-cell AHS locking the same ${n} digits. Together they force exactly ${intersectionOccupancy} active digit into the intersection, eliminating those digits on the ALS side and extra candidates inside the AHS.`,
      `Let D be the ${n} active digits, A the ${outerCells}-cell ALS and H the ${outerCells}-cell AHS. Every A cell must take D, so A consumes ${outerCells} D placements and the intersection consumes ${intersectionOccupancy}; H is the only outside-intersection carrier set for the remaining D placements.`,
      `1. Choose a box and crossing line. 2. Find the ${outerCells}-cell/${n}-digit ALS on one side. 3. Verify exactly ${outerCells} outside carriers on the other. 4. ${doubleIntersection ? "Verify that all three intersection cells carry active digits" : "Verify at least two active intersection cells"}. 5. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: active intersection cNormal(1), AHS cFins(2), ALS cEdoFins(3), eliminations cToDel(11).`,
      `Respect both Branch orientation and the Single-/Double-Intersection Subtype. This FB Almost Pair/Triple is not a generic Almost Locked Candidates pattern.`,
    ];
  }

  if (kind === "ALSXZ") {
    const a = firstGroup(step, /^alsa$/i), b = firstGroup(step, /^alsb$/i);
    const x = digitText(firstGroup(step, /^rcc$/i)?.digits);
    const z = digitText(firstGroup(step, /^z$/i)?.digits);
    const rank0 = /double-rcc/i.test(branch);
    return zh ? [
      `ALS-XZ（${branchLabel}）：ALS A=${cn(a?.cells)}{${digitText(a?.digits)}}，ALS B=${cn(b?.cells)}{${digitText(b?.digits)}}，受限公共数字X=${x}${z ? `，共同目标Z=${z}` : ""}。`,
      `${rank0 ? "每个ALS本来各有1个自由度；两组ALS合起来有2个自由度。两个彼此独立的RCC正好把这两个自由度全部锁住，因此结构成为Rank 0。" : "X在A、B之间是受限公共候选：X不可能同时在两组ALS中成立，因此若X落在一侧，另一侧必须用非X候选；两组共同含有的Z至少在一侧成立。"}`,
      `${rank0 ? "两个RCC已经用完两组ALS的全部链接自由度；任何结构外候选若再占用其中一条RCC，或结构内候选造成同一链接重复占用，都会超出可用容量，因此按后端实际Targets/CannibalTargets删除。" : `假设一个同时看见A中所有Z与B中所有Z的外部Z成立，则两组ALS中的Z都为假；A、B被迫分别使用X，违反X的受限公共关系。故目标Z为假。`}${cannibals ? ` 结构内自噬删数：${cannibals}。` : ""}`,
      `① 验证每组都是n格/n+1数ALS；② 找RCC X=${x}，确认A中所有X与B中所有X互相可见；③ ${rank0 ? "核对第二个RCC并按Rank 0处理" : `找共同Z=${z}及其共同可见目标`}；④ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：A内部cAls1(4)，B内部cAls2(5)，RCC X用cEdoFins(3)，Z用cFins(2)，普通删数cToDel(11)，结构内自噬删数(12)。`,
      `RCC要求A中的全部X与B中的全部X两两互见；同一格重叠或仅部分互见不能当作RCC。双 RCC 分支不能再套单Z删数解释。`,
    ] : [
      `ALS-XZ (${branchLabel}): ALS A=${cn(a?.cells)}{${digitText(a?.digits)}}, ALS B=${cn(b?.cells)}{${digitText(b?.digits)}}, RCC X=${x}${z ? `, target Z=${z}` : ""}.`,
      `${rank0 ? "Each ALS contributes one degree of freedom, so the two ALSs have two in total. Two independent RCCs lock both degrees of freedom, making the structure rank 0." : "X is restricted common: it cannot be true in both ALSs, so the shared Z must survive in at least one side."}`,
      `${rank0 ? "The two RCCs consume all link freedom of the two ALSs. Any outside candidate that consumes one of those links again, or an internal candidate that double-consumes a link, exceeds the available capacity and is removed according to backend Targets/CannibalTargets." : `If an external Z seeing every Z in A and B were true, both ALS Z sets would be false and each ALS would be forced to X, violating the RCC.`}${cannibals ? ` Cannibal targets: ${cannibals}.` : ""}`,
      `1. Verify both n-cell/n+1-digit ALSs. 2. Verify RCC X=${x}. 3. ${rank0 ? "Verify the second RCC and use rank-0 capacity" : `identify common Z=${z} and common-peer targets`}. 4. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: A cAls1(4), B cAls2(5), RCC cEdoFins(3), Z cFins(2), ordinary deletions cToDel(11), internal deletions Cannibalism(12).`,
      `Every X in A must see every X in B. Partial visibility is not an RCC, and the double-RCC branch must not be explained as ordinary single-Z XZ.`,
    ];
  }

  if (kind === "ALSXYWing") {
    const a = firstGroup(step, /^alsa$/i), b = firstGroup(step, /^alsb$/i), c = firstGroup(step, /^alsc$/i);
    const rccX = firstGroup(step, /^rccx$/i), rccY = firstGroup(step, /^rccy$/i), rccZ = firstGroup(step, /^rccz$/i);
    const x = digitText(rccX?.digits), y = digitText(rccY?.digits);
    const triple = /triple-linked/i.test(branch);
    const z = digitText((triple ? rccZ : firstGroup(step, /^z$/i))?.digits);
    if (triple) {
      return zh ? [
        `ALS-XY-Wing（三重链接秩 0）：A=${cn(a?.cells)}，B=${cn(b?.cells)}，C=${cn(c?.cells)}；A-C以RCC X=${x}连接，B-C以RCC Y=${y}连接，A-B再以第三条RCC Z=${z}连接。`,
        `这一步不是“普通ALS-XY-Wing再多送一些删数”。三条RCC把三组ALS两两闭合；每条RCC都是独立的受限公共数字关系，三组ALS已经没有多余链接容量，因此整个结构直接成为Rank 0。`,
        `Rank 0下，任何结构外候选若再占用已经满载的链接，或结构内候选造成同一链接重复占用，都会让链接需求超过可用容量，所以后端输出相应外部删数与自噬删数。`,
        `① 核对三组ALS；② 验证A-C的RCC X=${x}；③ 验证B-C的RCC Y=${y}；④ 验证A-B的第三条RCC Z=${z}；⑤ 确认三条RCC彼此独立后按Rank-0容量核对本步Targets/CannibalTargets${targets ? `（${targets}）` : ""}。`,
        `FB配色应把A/B/C与三条RCC分别显示；第三条RCC不能继续当成普通Wing的“共同删数Z”着色。删数仍区分外部删数与自噬删数。`,
        `三重链接必须有后端真实RccX/RccY/RccZ三条RCC。三组ALS仅仅两两共享数字并不足以证明Rank 0。`,
      ] : [
        `ALS-XY-Wing (Triple-Linked Rank-0): A=${cn(a?.cells)}, B=${cn(b?.cells)}, C=${cn(c?.cells)}; A-C use RCC X=${x}, B-C RCC Y=${y}, and A-B a third RCC Z=${z}.`,
        `This is not an ordinary ALS-XY-Wing with bonus eliminations. Three independent RCCs close the three ALSs pairwise, leaving no spare link capacity and making the whole structure rank 0.`,
        `At rank 0, an outside candidate that consumes an already saturated link, or an internal candidate that double-consumes a link, exceeds the available capacity; the backend therefore emits the corresponding external and cannibal eliminations.`,
        `1. Verify all three ALSs. 2. Verify A-C RCC X=${x}. 3. Verify B-C RCC Y=${y}. 4. Verify A-B RCC Z=${z}. 5. After confirming independence, check the rank-0 Targets/CannibalTargets${targets ? ` (${targets})` : ""}.`,
        `Display A/B/C and all three RCCs separately. Do not colour the third RCC as the ordinary Wing's common elimination Z; keep external and cannibal eliminations distinct.`,
        `Triple-Linked requires real backend RccX/RccY/RccZ facts. Pairwise shared digits alone do not prove rank 0.`,
      ];
    }
    return zh ? [
      `ALS-XY-Wing（${branchLabel}）：A=${cn(a?.cells)}，B=${cn(b?.cells)}，枢纽ALS C=${cn(c?.cells)}；A-C以RCC X=${x}连接，B-C以RCC Y=${y}连接，共同删数数字为Z=${z}。`,
      `C分别通过X、Y与两个外翼相连。C无论怎样完成，都会迫使A或B至少一侧保留Z，因此两个外翼中的Z至少一个为真。`,
      `同时看见A、B两端全部Z位置的目标若成立，就会把两个可能承接Z的外翼一起排除，所以该目标Z不能成立。`,
      `① 核对三组ALS；② 验证A-C的RCC X与B-C的RCC Y；③ 找A、B共同候选Z；④ 删除同时看见A、B全部Z的候选${targets ? `（${targets}）` : ""}。`,
      `FB配色：A/B/C内部依次cAls1/2/3，RCC X/Y用cEdoFins(3)，Z用cFins(2)，删数cToDel(11)。`,
      `A与B不需要直接连接；两个RCC必须分别连接到同一枢纽C。`,
    ] : [
      `ALS-XY-Wing (${branchLabel}): A=${cn(a?.cells)}, B=${cn(b?.cells)}, hub ALS C=${cn(c?.cells)}; A-C use RCC X=${x}, B-C RCC Y=${y}, with target Z=${z}.`,
      `C connects to the two outer ALSs through X and Y. Whatever completes C forces Z to remain in A or B, so at least one outer Z is true.`,
      `A target Z seeing every Z carrier in both A and B would eliminate both possible Z carriers, so that target is false.`,
      `1. Verify all three ALSs. 2. Verify A-C RCC X and B-C RCC Y. 3. Find common Z in A and B. 4. Remove Z from common peers${targets ? ` (${targets})` : ""}.`,
      `FB colours: ALS A/B/C cAls1/2/3, RCCs cEdoFins(3), Z cFins(2), eliminations cToDel(11).`,
      `A and B need not connect directly; both RCCs must meet the same hub C.`,
    ];
  }

  if (kind === "ALSWWing") {
    const a = firstGroup(step, /^alsa$/i), b = firstGroup(step, /^alsb$/i);
    const strongGroups = groupsMatching(step, /^stronglink$/i);
    const strong = strongGroups.map((g) => `${digitText(g.digits)}@${g.houses.join("/") || cn(g.cells)}`).join(zh ? "、" : ", ");
    const residual = firstGroup(step, /^residualdigits$/i);
    const residualDigits = digitText(residual?.digits);
    const z = digitText(firstGroup(step, /^z$/i)?.digits) || digitText(step?.eliminations?.flatMap?.((x) => x?.candidates || []) || []);
    const rank0 = /rank-?0/i.test(branch);
    if (rank0) {
      return zh ? [
        `ALS-W-Wing（${branchLabel}）：两组ALS A=${cn(a?.cells)}、B=${cn(b?.cells)}由两条独立链接${strong || "后端高亮链接"}闭合${residualDigits ? `；其余结构数字为${residualDigits}` : ""}。`,
        "双链接分支不是普通W-Wing的共同Z证明。两条独立链接把两组ALS的自由度完全闭合，使结构成为秩 0；因此不要求存在单一共同Z。",
        "把两组ALS视为Truth需求，把两条实际强链接/同区域RCC视为独立Link容量。链接名额与结构自由度相等后，任何外部候选或结构内重复占用若再消耗链接容量都会造成超额，因此可删除。",
        `① 验证两组ALS；② 逐条核对后端给出的两个独立链接${strong ? `（${strong}）` : ""}；③ 核对其余结构数字${residualDigits || "（见后端角色）"}；④ 按秩 0 容量应用本步删数${targets ? `（${targets}）` : ""}。`,
        "FB配色应分别显示两组ALS、两条真实链接、其余结构数字和删数；不能继续使用普通W-Wing的单一Z着色模板。",
        "秩 0分支必须以实际第二链接或同区域RCC为证明依据；若只有一条链接，就不能套用本分支。",
      ] : [
        `ALS-W-Wing (${branch}): ALS A=${cn(a?.cells)} and B=${cn(b?.cells)} close through two independent links ${strong || "shown by the backend"}${residualDigits ? `; residual structure digits ${residualDigits}` : ""}.`,
        "This double-linked branch is not the ordinary common-Z W-Wing proof. Two independent links close the ALS freedoms to rank 0, so no single common Z is required.",
        "Treat the two ALSs as truth demand and the two actual strong links/same-house RCCs as independent link capacity. Once capacity equals the structure freedom, any outside or duplicate internal candidate that consumes more capacity is false.",
        `1. Verify both ALSs. 2. Verify both backend links${strong ? ` (${strong})` : ""}. 3. Check residual structure digits${residualDigits ? ` ${residualDigits}` : ""}. 4. Apply the rank-0 capacity eliminations${targets ? ` (${targets})` : ""}.`,
        "Display the two ALSs, both real links, residual structure digits and eliminations as separate roles; do not reuse the ordinary W-Wing single-Z colour template.",
        "A rank-0 branch requires the actual second link or same-house RCC. With only one link, this branch is not proved.",
      ];
    }
    return zh ? [
      `ALS-W-Wing（${branchLabel}）：两组ALS A=${cn(a?.cells)}、B=${cn(b?.cells)}由外部强链${strong || "高亮强链"}连接，共同目标数字为${z}。`,
      "强链数字在连接区域中恰有一个成立。若它在A侧为假，则A必须用共同目标数字；若在B侧为假，则B必须用共同目标数字。因此A、B中的目标数字至少一真。",
      "把连接数字看成二选一：强链至少会让一侧承接连接数字。没有承接连接数字的那一侧ALS就必须保留目标Z，因此两组ALS中的Z至少一侧成立；同时看见两侧全部Z位置的外部Z便不能成立。",
      `① 验证两组ALS；② 找连接它们的普通或分组强链；③ 确认强链端分别看见两组ALS内全部连接数字；④ 找共同Z并删除共同可见目标${targets ? `（${targets}）` : ""}。`,
      "FB配色：ALS内部cAls1/2，同屋RCC cEdoFins(3)，外部强链cDouble(10)，目标Z cFins(2)，删数cToDel(11)/自噬删数(12)。",
      "分组分支的强链端可以是组节点，不能降格成单候选强链。",
    ] : [
      `ALS-W-Wing (${branch}): ALS A=${cn(a?.cells)} and B=${cn(b?.cells)} are connected by ${strong || "the highlighted strong link"}; target digit ${z}.`,
      "Exactly one side of the connector is true. Whichever side is false forces the corresponding ALS to use target Z, so Z survives in A or B.",
      "Treat connector X as a two-way choice: at least one side carries X. The ALS on the side that does not carry X must retain target Z, so Z survives in at least one ALS; an outside Z seeing every Z position on both sides is therefore false.",
      `1. Verify both ALSs. 2. Find the ordinary/grouped strong connector. 3. Confirm each end sees all connector candidates in its ALS. 4. Remove common-peer Z${targets ? ` (${targets})` : ""}.`,
      "FB colours: ALS cAls1/2, same-house RCC cEdoFins(3), external strong link cDouble(10), Z cFins(2), deletions cToDel(11)/cannibal eliminations.",
      "Grouped endpoints are group nodes, not single-candidate links.",
    ];
  }

  if (kind === "AHSXYWing") {
    const triple = /triple-linked/i.test(branch);
    const a = firstGroup(step, /^ahsa$/i), b = firstGroup(step, /^ahsb(?:\(pivot\))?$/i), c = firstGroup(step, /^ahsc$/i);
    const rccX = firstGroup(step, /^rccx$/i), rccY = firstGroup(step, /^rccy$/i), rccZ = firstGroup(step, /^rccz$/i);
    const rccXLabel = localizedProofMeta(rccX?.tail || "高亮事件", locale);
    const rccYLabel = localizedProofMeta(rccY?.tail || "高亮事件", locale);
    const rccZLabel = localizedProofMeta(rccZ?.tail || "高亮事件", locale);
    const extraXA = firstGroup(step, /^extrax\(a\)$/i), hlsXA = firstGroup(step, /^hlsx\(a\)$/i), supportXA = firstGroup(step, /^supportx\(a\)$/i);
    const extraXB = firstGroup(step, /^extrax\(b\)$/i), hlsXB = firstGroup(step, /^hlsx\(b\)$/i), supportXB = firstGroup(step, /^supportx\(b\)$/i);
    const extraYC = firstGroup(step, /^extray\(c\)$/i), hlsYC = firstGroup(step, /^hlsy\(c\)$/i), supportYC = firstGroup(step, /^supporty\(c\)$/i);
    const extraYB = firstGroup(step, /^extray\(b\)$/i), hlsYB = firstGroup(step, /^hlsy\(b\)$/i), supportYB = firstGroup(step, /^supporty\(b\)$/i);
    const extraZA = firstGroup(step, /^extraz\(a\)$/i), hlsZA = firstGroup(step, /^hlsz\(a\)$/i), supportZA = firstGroup(step, /^supportz\(a\)$/i);
    const extraZC = firstGroup(step, /^extraz\(c\)$/i), hlsZC = firstGroup(step, /^hlsz\(c\)$/i), supportZC = firstGroup(step, /^supportz\(c\)$/i);
    const ahsLabel = (group) => `${digitText(group?.digits, "") || "?"}@${group?.houses?.join("/") || "house"}{${cn(group?.cells)}}`;
    const endpoint = (extra, hls, support, label) => [
      extra ? `${label}${zh ? "额外格" : " Extra"}=${cn(extra.cells)}` : "",
      hls ? `${zh ? "局部HLS/见证格组" : "local HLS/witness"}=${cn(hls.cells)}` : "",
      support ? `${zh ? "支撑" : "support"}=${digitText(support.digits)}@${cn(support.cells)}` : "",
    ].filter(Boolean).join(zh ? "，" : ", ");
    const xA = endpoint(extraXA, hlsXA, supportXA, zh ? "A端" : "A-side");
    const xB = endpoint(extraXB, hlsXB, supportXB, zh ? "枢纽X端" : "pivot-X");
    const yC = endpoint(extraYC, hlsYC, supportYC, zh ? "C端" : "C-side");
    const yB = endpoint(extraYB, hlsYB, supportYB, zh ? "枢纽Y端" : "pivot-Y");
    const zA = endpoint(extraZA, hlsZA, supportZA, zh ? "A端" : "A-side");
    const zC = endpoint(extraZC, hlsZC, supportZC, zh ? "C端" : "C-side");
    return zh ? [
      `AHS-XY-Wing${triple ? " 三重链接秩 0" : ""}：AHS A=${ahsLabel(a)}、枢纽AHS B=${ahsLabel(b)}、AHS C=${ahsLabel(c)}；RCC X=${rccXLabel}，RCC Y=${rccYLabel}${triple ? `，RCC Z=${rccZLabel}` : ""}。`,
      triple
        ? "每组AHS都恰有一个Extra格。三条RCC分别保证相连的两组AHS中至少一端必须贡献Extra；同一AHS又不能同时为相邻两条边贡献Extra。于是任意一条边选定哪一端后，其余两条边被迫交替，最终只剩两个全局状态，全部链接容量恰好闭合为Rank 0。"
        : "两条RCC都是AHS的额外格事件析取，不是普通候选强链。RCC X保证A端额外格事件或枢纽X事件成立，RCC Y保证C端额外格事件或枢纽Y事件成立；枢纽的X、Y事件互斥，因此A端额外格事件与C端额外格事件至少一个成立。",
      triple
        ? "三条RCC在三个AHS之间首尾闭合。每个AHS只能贡献一个Extra事件，所以一条边选定端点后，另外两条边的端点随之被迫交替，最终只剩两个互补的全局状态。程序枚举这两个状态的全部合法AHS匹配；两个状态都无法容纳的结构内候选，以及两个状态都会排除的外部候选，均可删除。"
        : "RCC X要求A端或枢纽X端至少一侧贡献Extra事件，RCC Y也要求C端或枢纽Y端至少一侧贡献Extra事件。枢纽的两个事件不能同时发生，而且两条RCC不能复用同一Hall/HLS证明资源，因此至少一个外翼Extra事件成立。分别枚举A端与C端成立时的合法AHS匹配；两个分支都排除的候选才可删除。",
      triple
        ? `① 按候选数组合及所属行、列或宫确认A、B、C；② 核对RCC X：${xA || "A端见证"}${xB ? `；${xB}` : ""}；③ 核对RCC Y：${yC || "C端见证"}${yB ? `；${yB}` : ""}；④ 核对RCC Z：${zA || "A端见证"}${zC ? `；${zC}` : ""}；⑤ 确认各端点事件互斥、证明资源独立及两个全局状态可行；⑥ 应用Rank-0删数${targets ? `（${targets}）` : ""}。`
        : `① 按候选数组合及所属行、列或宫确认A、B、C三组AHS；② 核对RCC X两端：${xA || "A端见证"}${xB ? `；${xB}` : ""}；③ 核对RCC Y两端：${yC || "C端见证"}${yB ? `；${yB}` : ""}；④ 确认枢纽事件互斥且证明资源不复用；⑤ 取两个外翼额外格事件分支的共同删数${targets ? `（${targets}）` : ""}。`,
      triple
        ? "整格底色分别标出RCC X、Y、Z的Hall/HLS证明格；第三条RCC使用独立的后端颜色。候选色仍只标真实支撑位置、端点独有/共有候选以及删数。"
        : "整格底色按RCC配对：RCC X两端的局部HLS/Hall见证格使用同一种底色，RCC Y两端使用另一种底色；同一格同时属于两条RCC时，只显示后端明确输出的双色条带。候选数颜色区分端点独有、共有及逐数字真实支撑位置。AHS本体应按“候选数组合+所属行/列/宫”阅读，不能按格子候选并集阅读。",
      triple
        ? "不能因外翼有一个重叠格就直接标三重链接。X/Y/Z必须分别是严格秩 1 RCC；若共享格仍能取两组AHS共有数字，它就不是共享格型 RCC。还必须验证同端事件与证明资源独立，并确认至少一个交替状态存在。"
        : "不能只因三组AHS之间存在两条边就判定成立。两条RCC必须各自是严格秩 1 事件，枢纽事件必须互斥，且不能复用同一HLS/Hall证明资源；任何合法匹配中的支撑位置都不能漏标。",
    ] : [
      `AHS-XY-Wing${triple ? " Triple-Linked Rank-0" : ""}: AHS A=${ahsLabel(a)}, pivot AHS B=${ahsLabel(b)}, and AHS C=${ahsLabel(c)}; RCC X=${rccXLabel}, RCC Y=${rccYLabel}${triple ? `, RCC Z=${rccZLabel}` : ""}.`,
      triple
        ? "Each AHS has exactly one Extra cell. Each RCC says that at least one of its two endpoint AHSs must contribute the Extra event, while one AHS cannot serve both adjacent links at once. Choosing one endpoint on any link forces the remaining two links to alternate, leaving exactly two global states and closing all link capacity to rank 0."
        : "The two RCCs are AHS Extra-event disjunctions, not ordinary candidate strong links. RCC X gives A-Extra or pivot-X; RCC Y gives C-Extra or pivot-Y. The two pivot events are mutually exclusive, so A-Extra or C-Extra must hold.",
      triple
        ? "Write the edges as (E_AX or E_BX), (E_CY or E_BY), and (E_AZ or E_CZ). Endpoint exclusivity leaves only the two alternating states E_AX/E_BY/E_CZ and E_AZ/E_BX/E_CY. Enumerate every legal AHS matching in both states; remove internal candidates absent from all states and external candidates seen by the digit in every state."
        : "Write the edges as (E_A or E_BX) and (E_C or E_BY). If E_BX and E_BY cannot both hold and the edges do not reuse the same Hall/HLS proof resource, then E_A or E_C. Enumerate every legal AHS matching under each outer event; only common eliminations are valid.",
      triple
        ? `1. Verify A, B, and C by digit set and house. 2. Verify RCC X: ${xA || "A witness"}${xB ? `; ${xB}` : ""}. 3. Verify RCC Y: ${yC || "C witness"}${yB ? `; ${yB}` : ""}. 4. Verify RCC Z: ${zA || "A witness"}${zC ? `; ${zC}` : ""}. 5. Check incident-event/resource independence and global-state feasibility. 6. Apply rank-0 eliminations${targets ? ` (${targets})` : ""}.`
        : `1. Verify A, B, and C by digit set and house. 2. Verify RCC X: ${xA || "A witness"}${xB ? `; ${xB}` : ""}. 3. Verify RCC Y: ${yC || "C witness"}${yB ? `; ${yB}` : ""}. 4. Check pivot-event exclusivity and proof-resource independence. 5. Keep only common branch eliminations${targets ? ` (${targets})` : ""}.`,
      triple
        ? "Cell fills separately mark the Hall/HLS proof cells of RCC X, Y, and Z; the third RCC uses its own backend colour. Candidate colours still mark exact supports, endpoint-only/common candidates, and eliminations."
        : "Cell fills encode RCC pairing: every local-HLS/Hall witness cell on RCC X uses one backend fill, and every cell on RCC Y uses another. A cell in both links shows only the two colours explicitly emitted by the backend. Candidate colours distinguish endpoint-only/common digits and exact per-digit supports. Read each AHS as digits@house, not as a cell-candidate union.",
      triple
        ? "Do not label Triple-Linked from a visible outer overlap alone. X/Y/Z must each be a strict rank-1 RCC. A shared cell that can still take a digit common to both AHSs is not a Shared-Cell RCC. Incident events/resources must be independent and at least one alternating state must be feasible."
        : "Two visible links are not enough. Both must be strict rank-1 events, the pivot events must be disjoint, proof resources must not be reused, and no support position from a legal matching may be omitted.",
    ];
  }

  if (kind === "AHSWWing") {
    const triple = /triple-linked/i.test(branch);
    const a = firstGroup(step, /^ahsa$/i), b = firstGroup(step, /^ahsb$/i), pivot = firstGroup(step, /^pivot$/i);
    const pivotA = firstGroup(step, /^pivota$/i), pivotB = firstGroup(step, /^pivotb$/i);
    const extraA = firstGroup(step, /^extraa$/i), hlsA = firstGroup(step, /^hlsa$/i), supportA = firstGroup(step, /^supporta$/i);
    const extraB = firstGroup(step, /^extrab$/i), hlsB = firstGroup(step, /^hlsb$/i), supportB = firstGroup(step, /^supportb$/i);
    const rccZ = firstGroup(step, /^rccz$/i);
    const extraZA = firstGroup(step, /^extraz\(a\)$/i), hlsZA = firstGroup(step, /^hlsz\(a\)$/i), supportZA = firstGroup(step, /^supportz\(a\)$/i);
    const extraZB = firstGroup(step, /^extraz\(b\)$/i), hlsZB = firstGroup(step, /^hlsz\(b\)$/i), supportZB = firstGroup(step, /^supportz\(b\)$/i);
    const witnessZ = firstGroup(step, /^witnessz$/i);
    const candidateZAOnly = firstGroup(step, /^candidatez\(aonly\)$/i);
    const candidateZBOnly = firstGroup(step, /^candidatez\(bonly\)$/i);
    const candidateZCommon = firstGroup(step, /^candidatez\(common\)$/i);
    const sharedCellZ = triple && /shared-cell/i.test(String(rccZ?.tail || "")) && witnessZ;
    const zAOnly = digitText(candidateZAOnly?.digits) || "";
    const zBOnly = digitText(candidateZBOnly?.digits) || "";
    const zCommon = digitText(candidateZCommon?.digits) || "";
    const sharedZFactZh = sharedCellZ ? `；共享格见证${cn(witnessZ.cells)}中，A端独有候选={${zAOnly || "无"}}，B端独有候选={${zBOnly || "无"}}，两组AHS公共候选={${zCommon || "无"}}` : "";
    const sharedZFactEn = sharedCellZ ? `; shared-cell witness ${cn(witnessZ.cells)} has A-only={${zAOnly || "none"}}, B-only={${zBOnly || "none"}}, common-to-both-AHS={${zCommon || "none"}}` : "";
    const ahsLabel = (group) => `${digitText(group?.digits, "") || "?"}@${group?.houses?.join("/") || "house"}{${cn(group?.cells)}}`;
    const aGroup = digitText(pivotA?.digits) || "?";
    const bGroup = digitText(pivotB?.digits) || "?";
    const pivotDigits = digitText(pivot?.digits) || `${aGroup}/${bGroup}`;
    const endpointWitness = (extra, hls, support) => [
      extra ? `${zh ? "额外格" : "Extra cells"}=${cn(extra.cells)}` : "",
      hls ? `${zh ? "局部HLS格组" : "local HLS"}=${cn(hls.cells)}` : "",
      support ? `${zh ? "支撑位置" : "support positions"}=${digitText(support.digits)}@${cn(support.cells)}` : "",
    ].filter(Boolean).join(zh ? "，" : ", ");
    const aWitness = endpointWitness(extraA, hlsA, supportA);
    const bWitness = endpointWitness(extraB, hlsB, supportB);
    const zAWitness = endpointWitness(extraZA, hlsZA, supportZA);
    const zBWitness = endpointWitness(extraZB, hlsZB, supportZB);
    return zh ? [
      `AHS-W-Wing${triple ? " 三重链接秩 0" : ""}：AHS A=${ahsLabel(a)}，单格枢纽${cn(pivot?.cells)}{${pivotDigits}}的全部候选完整分为A端组${aGroup}与B端组${bGroup}，AHS B=${ahsLabel(b)}${triple ? `；端点RCC Z=${rccZ?.tail || "高亮事件"}${sharedZFactZh}` : ""}。`,
      triple
        ? (sharedCellZ
          ? `枢纽只有两组候选：取A侧时会触发A端Extra，取B侧时会触发B端Extra。第三条RCC Z来自共享格${cn(witnessZ.cells)}：它只能取A端独有候选{${zAOnly || "?"}}或B端独有候选{${zBOnly || "?"}}，两组AHS在该格没有公共候选${zCommon ? `（当前却出现{${zCommon}}，应视为验收失败）` : ""}。因此共享格无论取什么都至少让A/B一端成为Extra，补上第三条独立链接；两种枢纽取值分别锁定一个互补状态，三条链接闭合为Rank 0。`
          : "枢纽候选分组给出A、B两条条件额外格链接，端点RCC Z再给出第三条独立秩 1 析取。同一端点的枢纽事件与Z事件互斥，因此只剩“枢纽取A组、B走Z”和“枢纽取B组、A走Z”两个交替状态，结构闭合为Rank 0。")
        : "这不是两个集合由外部强链直接连接。枢纽中每个候选都被指派到一侧AHS端点，并且必须看见该侧支撑数字在全部合法匹配中的所有位置；枢纽取该候选时，会排除这些支撑位置并强制相应AHS的额外格事件。",
      triple
        ? "枢纽取A端组时会触发A端Extra，同时第三条RCC只能由B端承接；枢纽取B端组时情况相反。于是只剩两个互补的Rank-0状态。程序枚举两个状态下的枢纽取值与AHS匹配，所有状态共同排除的候选都可删除。"
        : "枢纽的全部候选被完整分到A端组和B端组：取A端组中的任一候选都会触发A端Extra，取B端组中的任一候选都会触发B端Extra。枢纽必定取其中一个候选，所以至少一端Extra事件成立。分别枚举两端成立时的全部合法AHS匹配，两个分支共同排除的目标可删；双值枢纽只是每组各一个候选的最小特例。",
      triple
        ? `① 按候选数组合及所属行、列或宫确认两端AHS；② 确认枢纽${cn(pivot?.cells)}候选${pivotDigits}完整分成${aGroup}|${bGroup}；③ 核对A端${aWitness || "HLS与支撑"}；④ 核对B端${bWitness || "HLS与支撑"}；⑤ 核对RCC Z的A端${zAWitness || "见证"}与B端${zBWitness || "见证"}；⑥ 验证端点事件独立与两个全局状态后应用删数${targets ? `（${targets}）` : ""}。`
        : `① 按候选数组合及所属行、列或宫确认两端AHS；② 确认枢纽${cn(pivot?.cells)}的候选${pivotDigits}被完整分成${aGroup}|${bGroup}；③ 核对A端${aWitness || "HLS与支撑"}；④ 核对B端${bWitness || "HLS与支撑"}；⑤ 比较两个额外格事件分支并保留共同删数${targets ? `（${targets}）` : ""}。`,
      triple
        ? "A、B端局部HLS与枢纽继续使用两种配对底色；第三条端点RCC Z使用独立底色标出Hall/HLS见证。候选色只标真实逐数字支撑、枢纽分组与删数。"
        : "整格底色按枢纽配对：A端局部HLS与枢纽同用第一种底色，B端局部HLS与枢纽同用第二种底色，枢纽因同时连接两端而显示后端明确输出的双色条带。候选数颜色只标逐数字真实支撑位置，枢纽候选按A/B分组单独着色。不要把HLS格组、支撑候选和AHS本体混成一个普通集合节点。",
      triple
        ? (sharedCellZ ? `Shared-Cell RCC必须逐候选核对：WitnessZ=${cn(witnessZ.cells)}，AOnly={${zAOnly || "?"}}，BOnly={${zBOnly || "?"}}，Common={${zCommon || "无"}}；只有Common为空时，“共享格必为至少一端Extra”才成立。再核对枢纽覆盖、事件独立与全局状态可行。` : "除完整覆盖枢纽候选外，RCC Z必须是真实秩 1 关系；同端枢纽事件与Z事件及其证明资源必须互斥、独立，两个全局状态至少一个可行。端点重叠本身不能证明Rank 0。")
        : "枢纽不要求恰好双值，但其每个候选必须归入至少一侧且最终分组完整。每个枢纽候选都必须看见所属端支撑数字的全部有效位置；漏掉合法匹配位置、只存在普通弱可见关系或直接套普通W-Wing强链模板，结构都不成立。",
    ] : [
      `AHS-W-Wing${triple ? " Triple-Linked Rank-0" : ""}: AHS A=${ahsLabel(a)}; every candidate of single-cell pivot ${cn(pivot?.cells)}{${pivotDigits}} is partitioned into A-side ${aGroup} and B-side ${bGroup}; AHS B=${ahsLabel(b)}${triple ? `; endpoint RCC Z=${rccZ?.tail || "highlighted event"}${sharedZFactEn}` : ""}.`,
      triple
        ? (sharedCellZ
          ? `The pivot partition supplies two conditional Extra links. The third RCC Z is a backend-verified Shared-Cell event: witness ${cn(witnessZ.cells)} can take only A-only candidate(s) {${zAOnly || "?"}} or B-only candidate(s) {${zBOnly || "?"}}, with no candidate common to both AHS digit sets${zCommon ? ` (but {${zCommon}} is present, which should fail validation)` : ""}. Whatever value the shared cell takes, it is Extra for at least one endpoint, giving the independent rank-1 clause E_AZ or E_BZ. The three links close to rank 0.`
          : "The pivot partition supplies two conditional Extra links and endpoint RCC Z supplies the third independent rank-1 disjunction. At each endpoint the pivot event and Z event are mutually exclusive, leaving only pivot-A with B-Z or pivot-B with A-Z; the structure closes to rank 0.")
        : "This is not two set nodes joined directly by an external strong link. Every pivot value is assigned to an AHS endpoint and must see every valid support position for that endpoint; taking the value removes those supports and forces the endpoint Extra-event.",
      triple
        ? "Let the pivot groups be P_A and P_B and the endpoint RCC be E_AZ or E_BZ. A P_A value forces E_A and excludes E_AZ, hence E_BZ; the P_B branch symmetrically forces E_AZ. Enumerate pivot values and AHS matchings in both states; candidates excluded by every state are false."
        : "Let P=P_A union P_B with no uncovered pivot value. For p in P_A, p implies E_A; for p in P_B, p implies E_B. The pivot takes one value, hence E_A or E_B. Enumerate every legal AHS matching under each event; only eliminations common to both branches are valid. A bivalue pivot is only the smallest |P_A|=|P_B|=1 case.",
      triple
        ? `1. Verify both AHSs by digit set and house. 2. Confirm pivot ${cn(pivot?.cells)} candidates ${pivotDigits} are fully partitioned as ${aGroup}|${bGroup}. 3. Verify A-side ${aWitness || "HLS and supports"}. 4. Verify B-side ${bWitness || "HLS and supports"}. 5. Verify RCC Z at A (${zAWitness || "witness"}) and B (${zBWitness || "witness"}). 6. Check event/resource independence and global-state feasibility, then apply eliminations${targets ? ` (${targets})` : ""}.`
        : `1. Verify both AHS endpoints by digit set and house. 2. Confirm pivot ${cn(pivot?.cells)} candidates ${pivotDigits} are completely partitioned as ${aGroup}|${bGroup}. 3. Verify A-side ${aWitness || "HLS and supports"}. 4. Verify B-side ${bWitness || "HLS and supports"}. 5. Keep only common Extra-branch eliminations${targets ? ` (${targets})` : ""}.`,
      triple
        ? "The A/B local HLS groups and pivot retain their two pair fills; endpoint RCC Z uses an independent fill for its Hall/HLS witness. Candidate colours mark only exact supports, pivot groups, and eliminations."
        : "Cell fills encode pivot pairing: the A-side local HLS and pivot share one backend fill, and the B-side local HLS and pivot share another; the pivot therefore shows both explicit backend bands. Candidate colours mark exact per-digit supports and pivot candidates by side. Do not merge HLS cells, supports, and the AHS body into one ordinary set node.",
      triple
        ? (sharedCellZ ? `For a Shared-Cell RCC verify every candidate explicitly: WitnessZ=${cn(witnessZ.cells)}, AOnly={${zAOnly || "?"}}, BOnly={${zBOnly || "?"}}, Common={${zCommon || "none"}}. Only an empty Common set proves that the shared cell is Extra for at least one endpoint. Then verify pivot coverage, event independence, and global-state feasibility.` : "Besides complete pivot coverage, RCC Z must be a genuine rank-1 relation. The pivot and Z events/resources at each endpoint must be disjoint and independent, and at least one global state must be feasible. Endpoint overlap alone does not prove rank 0.")
        : "The pivot need not be bivalue, but every value must be covered by the complete partition. Each value must see every valid support position of its assigned endpoint. Missing a legal support, having only an ordinary weak visibility relation, or reusing an ordinary W-Wing strong-link template invalidates the structure.",
    ];
  }


  if (kind === "AHSXZ") {
    const a = firstGroup(step, /^ahsa$/i), b = firstGroup(step, /^ahsb$/i), rcc = firstGroup(step, /^rcc$/i);
    const rccClass = firstGroup(step, /^rccclass$/i);
    const extended = /extended-rcc/i.test(String(branch || "")) || /extended-rcc/i.test(String(rccClass?.tail || ""));
    const x = digitText(rcc?.digits) || localizedProofMeta(rcc?.tail || (zh ? "共享格" : "cell"), locale);
    const ahsLabel = (group) => {
      const digits = digitText(group?.digits, "") || "?";
      const house = group?.houses?.join("/") || "house";
      return `${digits}@${house}{${cn(group?.cells)}}`;
    };
    const rccEvidence = [];
    for (let i = 1; i <= 2; i += 1) {
      const rel = firstGroup(step, new RegExp(`^rcc${i}$`, "i"));
      if (!rel) continue;
      const extraA = firstGroup(step, new RegExp(`^rcc${i}extraa$`, "i"));
      const hlsA = firstGroup(step, new RegExp(`^rcc${i}hlsa$`, "i"));
      const supportA = firstGroup(step, new RegExp(`^rcc${i}supporta$`, "i"));
      const extraB = firstGroup(step, new RegExp(`^rcc${i}extrab$`, "i"));
      const hlsB = firstGroup(step, new RegExp(`^rcc${i}hlsb$`, "i"));
      const supportB = firstGroup(step, new RegExp(`^rcc${i}supportb$`, "i"));
      const witness = firstGroup(step, new RegExp(`^rcc${i}witness$`, "i"));
      rccEvidence.push({i, rel, extraA, hlsA, supportA, extraB, hlsB, supportB, witness});
    }
    const evidenceText = (ev) => {
      const kindLabel = localizedProofMeta(ev.rel?.tail || "RCC", locale);
      const aParts = [
        ev.extraA ? `${zh ? "A端Extra" : "A-Extra"}=${cn(ev.extraA.cells)}` : "",
        ev.hlsA ? `${zh ? "A端HLS/Hall" : "A HLS/Hall"}=${cn(ev.hlsA.cells)}` : "",
        ev.supportA?.cells?.length ? `${zh ? "A端支撑" : "A support"}=${digitText(ev.supportA.digits)}@${cn(ev.supportA.cells)}` : "",
      ].filter(Boolean).join(zh ? "，" : ", ");
      const bParts = [
        ev.extraB ? `${zh ? "B端Extra" : "B-Extra"}=${cn(ev.extraB.cells)}` : "",
        ev.hlsB ? `${zh ? "B端HLS/Hall" : "B HLS/Hall"}=${cn(ev.hlsB.cells)}` : "",
        ev.supportB?.cells?.length ? `${zh ? "B端支撑" : "B support"}=${digitText(ev.supportB.digits)}@${cn(ev.supportB.cells)}` : "",
      ].filter(Boolean).join(zh ? "，" : ", ");
      const w = ev.witness ? `${zh ? "，共享Hall见证" : ", shared Hall witness"}=${cn(ev.witness.cells)}` : "";
      return `${zh ? `RCC${ev.i}` : `RCC ${ev.i}`}=${kindLabel}${aParts ? `［${aParts}` : ""}${bParts ? `${aParts ? "；" : "［"}${bParts}` : ""}${aParts || bParts ? "］" : ""}${w}`;
    };
    const evidence = rccEvidence.map(evidenceText).join(zh ? "；" : "; ");
    const positional = rccEvidence.find((ev) => /locked-set position|same-digit position/i.test(String(ev.rel?.tail || "")) && ev.supportA?.cells?.length && ev.supportB?.cells?.length);
    const positionalProofZh = positional
      ? `以RCC${positional.i}为例：若A端Extra事件不发生于${cn(positional.extraA?.cells)}、B端Extra事件也不发生于${cn(positional.extraB?.cells)}，则两边局部HLS同时被激活，公共支撑数字${digitText(positional.supportA?.digits) || digitText(positional.supportB?.digits)}必须分别落在A端${cn(positional.supportA?.cells)}与B端${cn(positional.supportB?.cells)}。后端已验证这两组位置完全交叉互见，同一数字不可能同时在两边落子，因此两端Extra事件至少有一个必须成立。`
      : "Extended-RCC的成立必须由后端给出的Extra事件、Hall/HLS见证与精确支撑位置证明，不能从AHS重叠外观推断。";
    const positionalProofEn = positional
      ? `For RCC ${positional.i}, if the A-Extra event does not occur in ${cn(positional.extraA?.cells)} and the B-Extra event does not occur in ${cn(positional.extraB?.cells)}, both local HLS constraints activate. Common support digit ${digitText(positional.supportA?.digits) || digitText(positional.supportB?.digits)} must then occur in A positions ${cn(positional.supportA?.cells)} and B positions ${cn(positional.supportB?.cells)}. The backend has verified complete cross-visibility between those position sets, so the same digit cannot be placed on both sides; hence ExtraA or ExtraB.`
      : "An Extended-RCC must be proved by the backend Extra-events, Hall/HLS witnesses, and exact support positions, not inferred from visible AHS overlap.";
    return zh ? [
      `AHS-XZ（${branchLabel}）：AHS A=${ahsLabel(a)}，AHS B=${ahsLabel(b)}${evidence ? `；${evidence}` : `；受限公共资源X=${x || "cell"}`}。`,
      extended ? positionalProofZh : `AHS描述的是“少数数字只能落在少数格”的位置容量。RCC约束两端Extra事件，使两个AHS不能同时选择会破坏该受限资源的状态。`,
      `${/double-rcc|rank-2 rcc/i.test(branch) ? "两个RCC把AHS位置需求与Extra事件容量闭合为Rank 0；所有合法匹配都排除的结构外或自噬候选可删。" : "单RCC保证两端Extra事件至少有一个成立。程序分别在A端成立和B端成立时枚举完整AHS匹配，只有两个分支都排除的候选才是结论。"}${cannibals ? ` 自噬删数：${cannibals}。` : ""}`,
      `① 按数字集@house确认两组AHS；② 逐条读取后端RccN类型；③ 对Extended-RCC核对Extra、HLS/Hall和Support位置，不解析description猜关系；④ 核对支撑位置的完整互见/重叠Hall亏缺；⑤ 应用共同删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：AHS A/B分别cAls1(4)/cAls2(5)，RCC端点cEdoFins(3)，普通删数cToDel(11)，结构内自噬删数(12)。`,
      `AHS-XZ约束的是数字—格位容量，不能照抄ALS-XZ。尤其Extended-RCC可能由1↔2、1↔3、2↔3局部HLS位置组或多格Hall见证形成，必须以本步结构化RCC事实为准。`,
    ] : [
      `AHS-XZ (${branchLabel}): AHS A=${ahsLabel(a)}, AHS B=${ahsLabel(b)}${evidence ? `; ${evidence}` : `; restricted resource X=${x || "cell"}`}.`,
      extended ? positionalProofEn : `AHS is positional capacity: a small digit set is confined to a small cell set. The RCC constrains the endpoint Extra-events so both AHSs cannot choose states that consume the restricted resource incompatibly.`,
      `${/double-rcc|rank-2 rcc/i.test(branch) ? "Independent RCCs close the endpoint Extra-event capacity to rank 0; remove candidates excluded by every legal matching." : "A single RCC gives ExtraA or ExtraB. Enumerate complete AHS matchings under each event; only eliminations common to both branches are valid."}${cannibals ? ` Cannibal targets: ${cannibals}.` : ""}`,
      `1. Verify both digits@house AHSs. 2. Read each backend RccN type. 3. For Extended-RCC, verify Extra, HLS/Hall, and Support roles rather than parsing the description. 4. Verify complete support cross-visibility or Hall deficiency. 5. Apply common eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: AHS A/B cAls1(4)/cAls2(5), RCC endpoints cEdoFins(3), ordinary eliminations cToDel(11), internal eliminations Cannibalism(12).`,
      `AHS-XZ is digit-to-position capacity, not ALS-XZ with renamed nouns. Extended-RCC may use generalized local-HLS position groups or multi-cell Hall witnesses; trust only structured backend RCC facts.`,
    ];
  }

  if (kind === "SueDeCoq") {
    const sector = firstGroup(step, /^activesector$/i), box = firstGroup(step, /^sueb$/i), line = firstGroup(step, /^suel$/i), insular = firstGroup(step, /^sueinsular$/i);
    return zh ? [
      `Sue de Coq（${branchLabel}）：活动宫线交区${cn(sector?.cells)}含{${digitText(sector?.digits)}}；宫侧集合${cn(box?.cells)}使用{${digitText(box?.digits)}}，线侧集合${cn(line?.cells)}使用{${digitText(line?.digits)}}${insular ? `，交区独占数字为{${digitText(insular.digits)}}` : ""}。`,
      `交区、宫侧与线侧的格数自由度，恰好等于两侧链接数字及独占数字的总容量。因此这些数字被结构完全占用，宫/线其余位置不能再使用对应数字。`,
      `源码验证 |交区格|+|宫侧格|+|线侧格| = |宫链接数字|+|线链接数字|+|独占数字|。${/cannibalized/i.test(branch) ? "宫侧与线侧共享数字造成结构内部重复覆盖，产生结构内自噬删数。" : "两侧链接数字不产生内部重复覆盖。"}`,
      `① 选宫线交区的2或3格；② 选宫外集合与线外集合；③ 合并候选并核对容量等式；④ 分离宫链接、线链接、独占与共享数字；⑤ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：独占交区数字cAls1(4)，线链接cFins(2)，宫链接cEdoFins(3)，普通删数cToDel(11)，结构内自噬删数(12)。`,
      `必须使用实际候选容量等式；“交区看起来像两个ALS”并不足够。自噬型分支要单独显示共享数字和结构内删数。`,
    ] : [
      `Sue de Coq (${branchLabel}): active box-line intersection ${cn(sector?.cells)} has {${digitText(sector?.digits)}}; box side ${cn(box?.cells)} uses {${digitText(box?.digits)}}, line side ${cn(line?.cells)} uses {${digitText(line?.digits)}}${insular ? `, with insular digits {${digitText(insular.digits)}}` : ""}.`,
      `The cell freedom of intersection, box side and line side exactly equals the capacity of the two link sets plus insular digits, fully occupying those digits.`,
      `The detector verifies |intersection|+|box side|+|line side| = |box links|+|line links|+|insular|.${/cannibalized/i.test(branch) ? " Shared box/line digits create internal overlap and cannibal eliminations." : " There is no internal shared-link overlap."}`,
      `1. Choose 2 or 3 intersection cells. 2. Choose box-side and line-side sets. 3. Verify the capacity equality. 4. Separate box, line, insular and common digits. 5. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: insular cAls1(4), line links cFins(2), box links cEdoFins(3), ordinary deletions cToDel(11), internal deletions Cannibalism(12).`,
      `Use the exact candidate-capacity equality. A visual resemblance to two ALSs is insufficient; show common digits for the Cannibalized branch.`,
    ];
  }

  if (kind === "Fireworks") {
    const arms = groupsMatching(step, /^(fireworkarms|fireworkset|fireworka|fireworkb)$/i).map((g) => cn(g.cells)).filter(Boolean).join(zh ? "；" : "; ");
    const roleNamesZh = new Map([
      ["ERConnector", "空矩形连接"], ["BivalueBridge", "双值桥"], ["SharedArms", "共享臂"],
      ["ALPPivot", "近锁定数对枢轴"], ["BivaluePair", "双值对"], ["BaseCells", "基准格"], ["Pit", "核心交点"],
    ]);
    const aux = groupsMatching(step, /^(erconnector|bivaluebridge|sharedarms|alppivot|bivaluepair|basecells|pit)$/i)
      .map((g) => `${zh ? (roleNamesZh.get(g.head) || "辅助角色") : g.head}:${cn(g.cells)}`).join(zh ? "；" : "; ");
    const fwBranch = zh ? ({
      "Dual ER": "双烟花空矩形", "Dual S-Wing": "双烟花S翼", "Triple": "三烟花", "Quadruple": "四重烟花",
      "Dual ALP": "双烟花近锁定数对", "Dual W-Wing": "双烟花W翼", "Exocet": "烟花Exocet",
    }[branch] || branchLabel) : branchLabel;
    const explanations = {
      "Dual ER": zh ? "双数字烟花通过同一核心交点的行臂、列臂和宫臂成立；空矩形连接把两个数字的落点传递到目标宫。" : "A two-digit Fireworks shares a pit and uses an Empty Rectangle connector to transfer both digits.",
      "Dual S-Wing": zh ? "双数字烟花与对角双值桥组成S翼；桥取任一数字都会排除核心交点中的额外候选。" : "A two-digit Fireworks plus a diagonal bivalue bridge forms an S-Wing and removes extra pit candidates.",
      "Triple": zh ? "三个烟花数字占满三臂/三格容量，结构格额外候选和宫内其余三数字可删。" : "Three Fireworks digits fill the three-arm capacity, removing extras from the body and the remaining box sector.",
      "Quadruple": zh ? "两组双烟花交叠成四数字闭合容量；公共臂与两个核心交点只能容纳各自数字组。" : "Two dual Fireworks overlap into a closed four-digit allocation.",
      "Dual ALP": zh ? "两组相同双数字烟花由中心双值近锁定数对枢轴联结，枢轴与两组核心交点共同固定数字分配。" : "Two equal dual Fireworks are tied by a central bivalue ALP pivot.",
      "Dual W-Wing": zh ? "双数字烟花与两个同候选双值格构成W翼，交叉目标同时看见两种可能。" : "A dual Fireworks and two matching bivalue cells form a W-Wing.",
      "Exocet": zh ? "四个单数字烟花围绕同一核心交点组合成四数字结构，两格双值基准格把烟花候选投射到共同可见目标。" : "Four single-digit Fireworks around one pit combine with two bivalue bases into an Exocet-like projection.",
    };
    const core = explanations[branch] || (zh ? "本分支按后端给出的烟花组合结构证明。" : "This branch follows the reported Fireworks composition.");
    return zh ? [
      `烟花分支：${fwBranch}。主臂${arms || "见高亮结构"}${aux ? `；辅助角色${aux}` : ""}。`,
      core,
      `单个烟花要求某数字在一条行与一条列中，除核心交点所在宫外各至多一个外端；因此该数字若不在核心交点，就被迫落在相应外端。当前分支把两个到四个这样的析取关系与${fwBranch}辅助结构合并，得到目标不可能。`,
      `① 先核对每个单烟花的核心交点、行外端、列外端和宫；② 再按${fwBranch}核对空矩形、双值桥、共享臂、近锁定数对、W翼或基准格；③ 应用删数${targets ? `（${targets}）` : ""}。`,
      `配色随分支使用cAls1/cAls2区分烟花组，cFins标连接，cSTP(10)标双值桥或基准格，删数cToDel(11)。`,
      `不能只看到三格“烟花形状”就成立：行列候选必须满足源码的跨宫计数，且所有辅助格候选必须与实际分支完全一致。`,
    ] : [
      `Fireworks branch: ${fwBranch}. Main arms ${arms || "shown by highlights"}${aux ? `; auxiliary roles ${aux}` : ""}.`,
      core,
      `A single Fireworks confines a digit on a row and column so that outside the pit box each arm has at most one endpoint. The current branch combines two to four such disjunctions with its ${fwBranch} auxiliary structure to exclude the target.`,
      `1. Verify pit, row endpoint, column endpoint and box for every single Fireworks. 2. Verify the branch-specific ER/bridge/shared arms/ALP/W-Wing/bases. 3. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours use cAls1/cAls2 for Fireworks groups, cFins for connectors, cSTP(10) for bivalue bridges/bases, and cToDel(11) for eliminations.`,
      `A visual three-cell firework is not enough: row/column candidate counts and every auxiliary candidate must match the reported branch.`,
    ];
  }

  if (kind === "BivalueOddagon") {
    const body = firstGroup(step, /^oddagonbody$/i) || firstGroup(step, /^oddagona$/i);
    const oddagonA = firstGroup(step, /^oddagona$/i);
    const oddagonB = firstGroup(step, /^oddagonb$/i);
    const sharedExit = firstGroup(step, /^sharedexit$/i);
    const digits = digitText(body?.digits) || primaryDigits(step);
    const locked = firstGroup(step, /^lockedsubset$/i);
    const exit = firstGroup(step, /^exitcell$/i);
    const guardians = firstGroup(step, /^guardians$/i);
    const dual = /dual/i.test(branch) && oddagonA && oddagonB && sharedExit;
    if (dual) {
      const aDigits = digitText(oddagonA.digits) || digits;
      const bDigits = digitText(oddagonB.digits) || digits;
      const exitDigits = digitText(sharedExit.digits) || digits;
      return zh ? [
        `Dual Bivalue Oddagon：后端给出两个奇数环。Oddagon A=${cn(oddagonA.cells)}，致命数字对{${aDigits}}；Oddagon B=${cn(oddagonB.cells)}，致命数字对{${bDigits}}；两环公共出口=${cn(sharedExit.cells)}{${exitDigits}}。`,
        `单个奇数双值环若全程只允许同一数字对，真假沿环交替一周后会回到相反状态，所以必须有出口破坏矛盾。这里两个Oddagon共享出口，而两个环各自其余分支都已由真实结构封闭。`,
        `因此公共出口不能再取致命数字对{${exitDigits}}：若其中任一候选保留为真，相应交替状态会同时把两个环推回无解闭环。只应用后端实际输出的公共出口删数${targets ? `（${targets}）` : ""}。`,
        `① 分别沿Oddagon A、B核对奇数环和相邻格共享house；② 核对两环使用同一致命数字对；③ 确认SharedExit确实是两环共同出口；④ 删除SharedExit中后端给出的致命候选。`,
        `FB配色：两环分别cAls1/cAls2，共享部分cAls3，连接三值格cDouble(10)，公共出口删数cToDel(11)。`,
        `Dual不是“看见两个相似Oddagon”就成立；必须有后端明确的OddagonA、OddagonB与SharedExit事实。Oddagon编号按本项目/FB实际出口结构定义，不与其他软件Type编号硬对齐。`,
      ] : [
        `Dual Bivalue Oddagon: the backend reports two odd cycles. Oddagon A=${cn(oddagonA.cells)} with deadly pair {${aDigits}}; Oddagon B=${cn(oddagonB.cells)} with deadly pair {${bDigits}}; shared exit=${cn(sharedExit.cells)}{${exitDigits}}.`,
        `A single odd bivalue cycle restricted to the same pair alternates back to the starting cell with the opposite state, so an escape must break the contradiction. Here both cycles use the same escape while their remaining branches are closed by the reported structure.`,
        `Therefore the shared exit cannot retain deadly pair {${exitDigits}}. Keep only the eliminations emitted by the backend${targets ? ` (${targets})` : ""}.`,
        `1. Verify Oddagon A and B separately as odd cycles with peer-adjacent cells. 2. Verify the same deadly pair. 3. Verify SharedExit is common to both cycles. 4. Remove the backend-reported deadly candidates from the shared exit.`,
        `FB colours: the two cycles use cAls1/cAls2, their overlap cAls3, trivalue connectors cDouble(10), and the shared-exit deletion cToDel(11).`,
        `Dual is not established merely by seeing two similar oddagons; OddagonA, OddagonB and SharedExit must be explicit backend facts. Type numbering follows the project's actual escape structure.`,
      ];
    }
    const type1 = /type 1/i.test(branch);
    const type2 = /type 2/i.test(branch);
    const exitDigits = digitText(exit?.digits) || "";
    const guardianDigits = digitText(guardians?.digits) || "";
    const branchFactsZh = type1 && exit ? `；唯一出口=${cn(exit.cells)}，组外候选={${exitDigits || "?"}}` : type2 && guardians ? `；守护数字={${guardianDigits || "?"}}，Guardians=${cn(guardians.cells)}` : "";
    const branchFactsEn = type1 && exit ? `; sole exit=${cn(exit.cells)}, outside candidate(s)={${exitDigits || "?"}}` : type2 && guardians ? `; guardian digit={${guardianDigits || "?"}}, Guardians=${cn(guardians.cells)}` : "";
    return zh ? [
      `Bivalue Oddagon（${branchLabel}）：奇数长度闭环主体${cn(body?.cells || structureCells(step))}围绕数字对{${digits}}${branchFactsZh}${locked ? `，附加锁定数组${cn(locked.cells)}{${digitText(locked.digits)}}` : ""}。`,
      `这是Negative Rank/奇偶矛盾结构，不是“会出现第二解”的唯一性技巧。若环上每格都只在{${digits}}中取值，真假沿奇数环交替一周会回到与起点相反的状态，纯Oddagon因此无解，必须至少有一个真实出口/Guardian打破它。`,
      `${type1 ? `唯一出口格不能保留致命数字对。后端确认${cn(exit?.cells)}是唯一出口，并明确给出组外候选{${exitDigits || "?"}}。该格若取致命数字{${digits}}中的任一值，纯Oddagon重新闭合而无解，所以它必须取组外候选，删除该格的致命数字。` : type2 ? `所有出口共享同一个额外数字。后端确认共享守护数字{${guardianDigits || "?"}}，Guardians=${cn(guardians?.cells)}。若这些Guardian全假，纯Oddagon重新闭合而无解；故至少一个Guardian为真，同时看见全部Guardians的同数字目标可删。` : /type 3/i.test(branch) ? "多个出口额外数字与同屋数组组成容量锁定，数组外对应候选可删。" : "按后端给出的Oddagon出口/守护关系应用结论。"}`,
      `① 确认环长为奇数且相邻格共享house；② 每个主体格含致命数字对；③ 直接读取后端ExitCell/Guardians/LockedSubset，不从几何猜Type；④ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：主体cNormal(1)；出口/Guardian/Type 3锁定数组使用后端角色色；删数cToDel(11)。`,
      `Oddagon是Negative Rank坏结构，不要写成唯一性反证；Type编号按本项目/FB实际出口结构定义，不能与其他软件硬对齐。`,
    ] : [
      `Bivalue Oddagon (${branchLabel}): odd cycle ${cn(body?.cells || structureCells(step))} uses pair {${digits}}${branchFactsEn}${locked ? ` with locked set ${cn(locked.cells)}{${digitText(locked.digits)}}` : ""}.`,
      `This is a Negative-Rank/parity contradiction, not a uniqueness technique. If every loop cell were restricted to {${digits}}, truth would alternate around an odd cycle and return to the start in the opposite state. The pure Oddagon is unsatisfiable, so a real exit/guardian must break it.`,
      `${type1 ? `The backend identifies ${cn(exit?.cells)} as the sole exit and reports outside candidate(s) {${exitDigits || "?"}}. If that cell took either deadly digit {${digits}}, the pure Oddagon would close and become impossible, so it must take an outside candidate and its deadly digits are removed.` : type2 ? `The backend reports common guardian digit {${guardianDigits || "?"}} at ${cn(guardians?.cells)}. If every guardian were false, the pure Oddagon would close and be impossible; hence at least one guardian is true and common-peer targets on that digit are false.` : /type 3/i.test(branch) ? "Exit extras plus a same-house locked set saturate capacity." : "Apply the backend-reported Oddagon exit/guardian relation."}`,
      `1. Verify an odd loop and peer-adjacent cells. 2. Verify the deadly pair in every body cell. 3. Read backend ExitCell/Guardians/LockedSubset directly rather than inferring the Type from geometry. 4. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: body cNormal(1); exit/guardian/locked-set roles use backend role colours; deletions cToDel(11).`,
      `Oddagon is a Negative-Rank invalid structure, not a uniqueness argument. Type numbering follows the project's actual exit structure.`,
    ];
  }

  if (kind === "TripletOddagon") {
    const body = firstGroup(step, /^tripletbody$/i);
    const digits = digitText(body?.digits) || primaryDigits(step);
    const escape = firstGroup(step, /^escapecell$/i);
    const guardians = firstGroup(step, /^guardians$/i);
    const preAfwEscapes = firstGroup(step, /^preafwescapes$/i);
    const afwSlots = firstGroup(step, /^afwtripletslots$/i);
    const afwRemotePair = firstGroup(step, /^afwremotetripletpair$/i);
    const afwWitness = firstGroup(step, /^afwwitness$/i);
    const afwBaseHouse = firstGroupTail(step, "AFWBaseHouse");
    const afwCrossHouse = firstGroupTail(step, "AFWCrossHouse");
    const afwCrossBox = firstGroupTail(step, "AFWCrossBox");
    const type1 = /type 1(?: rt)?$/i.test(branch);
    const type2 = /type 2$/i.test(branch);
    const escapeDigits = digitText(escape?.digits) || "";
    const guardianDigits = digitText(guardians?.digits) || "";
    const witnessDigits = digitText(afwWitness?.digits) || "";
    const witnessExample = afwWitness?.digits?.[0] || null;
    const witnessRemainder = witnessExample && body?.digits?.length
      ? body.digits.filter((digit) => digit !== witnessExample)
      : [];
    const branchStructureZh = type1 && escape ? `；唯一Escape=${cn(escape.cells)}，三值组外候选={${escapeDigits || "?"}}` : type2 && guardians ? `；Guardians=${cn(guardians.cells)}{${guardianDigits || "?"}}` : "";
    const branchStructureEn = type1 && escape ? `; sole Escape=${cn(escape.cells)}, outside-triplet candidate(s)={${escapeDigits || "?"}}` : type2 && guardians ? `; Guardians=${cn(guardians.cells)}{${guardianDigits || "?"}}` : "";
    return zh ? [
      `Triplet Oddagon（${branchLabel}）：12格主体${cn(body?.cells || structureCells(step))}围绕三个数字{${digits}}形成三值Oddagon${branchStructureZh}。`,
      `这是Oddagon的三值Negative Rank推广。若12格主体全部被迫只使用{${digits}}，源码规定的带/栈交错结构会让三数字局部容量与奇交替约束无法同时满足，形成无解状态；真实extra/guardian必须破坏这个坏结构。`,
      `${/almost fireworks/i.test(branch) && type2 && guardians ? `只要${cn(guardians.cells)}中的任一守护候选{${guardianDigits || "?"}}为真，同时看见全部Guardians的同数字目标${targets ? `（${targets}）` : ""}就立即可删；真正需要证明的只是这些Guardians不可能全假。\n反设${cn(guardians.cells)}上的{${guardianDigits || "?"}}全部为假，它们便只能回到Triplet {${digits}}。若${afwSlots ? cn(afwSlots.cells) : "两个AFW占位格"}也都取Triplet数字，则12格直接闭合成纯Triplet Oddagon而矛盾；因此AFW占位格至少有一格必须以组外候选逃逸，剩下只有两种方式。\n① 两格都逃逸：${afwBaseHouse && afwCrossHouse ? `AFW基线${afwBaseHouse}与交叉线${afwCrossHouse}` : "AFW的基线与交叉线"}失去两个关键Triplet占位，${afwCrossBox ? `交叉宫${afwCrossBox}` : "交叉宫"}没有足够位置同时满足{${digits}}的Fireworks分布，矛盾。\n② 恰一格逃逸：另一格与${afwRemotePair ? `远程三数组对${cn(afwRemotePair.cells)}` : "对应的远程三数组对"}组成RT；${afwWitness ? `交叉见证格${cn(afwWitness.cells)}{${witnessDigits || "?"}}` : "交叉见证格"}若取某个Triplet数字x，RT会迫使剩余AFW占位格同取x，于是${afwCrossBox ? `${afwCrossBox}的宫约束` : "交叉宫约束"}使${afwCrossHouse || "交叉线"}无法再容纳其余两个Triplet数字${witnessExample && witnessRemainder.length === 2 ? `；本题例如令${cn(afwWitness.cells)}=${witnessExample}，剩余占位格也被迫为${witnessExample}，${afwCrossHouse || "交叉线"}会缺少{${witnessRemainder.join("/")}}中的至少一个` : ""}，仍矛盾。\n两种逃逸方式都不成立，所以反设错误：至少一个Guardian为真，删数成立。` : /almost fireworks/i.test(branch) && type1 && escape ? `${preAfwEscapes ? `纯Triplet视角原本有${preAfwEscapes.cells.length}个潜在escape/guardian：${cn(preAfwEscapes.cells)}。` : ""}${afwSlots ? `Almost Fireworks先占住Triplet的两个位置${cn(afwSlots.cells)}，迫使它们从{${digits}}中取值；这两处潜在Guardian因此由AFW结构消化。` : "Almost Fireworks先消化两个潜在Guardian。"}这样只剩${cn(escape.cells)}一个真实Escape，组外候选={${escapeDigits || "?"}}。若该格仍取Triplet数字，主体会退回无解结构；所以它必须取组外候选。` : /almost fireworks/i.test(branch) ? "Almost Fireworks先替Triplet Oddagon占用部分三数字位置，再只对剩余真实escape/guardian应用Oddagon约束。" : type1 ? (escape ? `单个额外候选是唯一破坏点。后端确认${cn(escape.cells)}是唯一含三值组外候选的逃逸格。若它取{${digits}}中的任一数字，12格全部落回纯Triplet Oddagon而无解；所以该格必须取组外候选{${escapeDigits || "?"}}，并删除{${digits}}。` : "单个额外候选是唯一破坏点；必须由后端EscapeCell事实确认后才能给出具体候选级解释。") : type2 ? (guardians ? `后端确认同一个守护数字{${guardianDigits || "?"}}分布在${cn(guardians.cells)}。若这些Guardians全部为假，12格主体会退回无解的纯Triplet Oddagon；因此至少一个Guardian必须为真，同时看见全部Guardians的同数字目标可删。` : "所有逃逸候选共享同一个守护数字；必须由后端Guardians事实确认具体数字与位置。") : /lock set/i.test(branch) ? "RT与三数组容量合并；Triplet Lock Set共同封闭局部容量。" : /eri/i.test(branch) ? "RT通过ERI传递；Triplet ERI把逃逸约束传递到目标。" : "按当前Branch约束实际escape事件。"}`,
      `① 核对12个主体格及三数字；② 直接读取后端EscapeCell/Guardians等真实extra角色；③ 按Branch核对RT/Lock Set/ERI/AFW附加结构；④ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：Triplet主体cNormal(1)，Escape/Guardian及附加RT/AFW结构按实际后端角色区分，删数cToDel(11)或Cannibalism(12)。`,
      `不能把任意12格三候选图形称为Triplet Oddagon；必须满足源码枚举的行列宫排列、extra数量及分支附加关系。尤其不要再把它解释成“不可唯一的三数字置换”。`,
    ] : [
      `Triplet Oddagon (${branchLabel}): the 12-cell body ${cn(body?.cells || structureCells(step))} uses triplet {${digits}}${branchStructureEn}.`,
      `This is the three-value Negative-Rank extension of Oddagon. If all 12 body cells are restricted to {${digits}}, the source-defined band/stack arrangement makes local three-digit capacity incompatible with the odd alternating constraints, producing an unsatisfiable state; a real extra/guardian must break it.`,
      `${/almost fireworks/i.test(branch) && type2 && guardians ? `If any guardian {${guardianDigits || "?"}} at ${cn(guardians.cells)} is true, every same-digit target seeing all guardians${targets ? ` (${targets})` : ""} is immediately false. It remains only to prove that the guardians cannot all be false. Assume they are all false, forcing those body cells back into triplet {${digits}}. If ${afwSlots ? cn(afwSlots.cells) : "both AFW slots"} also take triplet digits, the 12 cells close into the impossible pure Triplet Oddagon; hence at least one AFW slot must escape via an outside candidate. Only two escape patterns remain.\n(1) Both AFW slots escape: ${afwBaseHouse && afwCrossHouse ? `the AFW base ${afwBaseHouse} and cross line ${afwCrossHouse}` : "the AFW base and cross line"} lose two required triplet positions, leaving insufficient capacity in ${afwCrossBox || "the crossing box"} for the Fireworks distribution of {${digits}}. Contradiction.\n(2) Exactly one slot escapes: the surviving slot and ${afwRemotePair ? `remote triplet pair ${cn(afwRemotePair.cells)}` : "the remote triplet pair"} form an RT. If ${afwWitness ? `cross witness ${cn(afwWitness.cells)}{${witnessDigits || "?"}}` : "the cross witness"} takes a triplet digit x, the RT forces the surviving AFW slot to the same x; the crossing-box constraint then leaves ${afwCrossHouse || "the cross line"} unable to place the other two triplet digits${witnessExample && witnessRemainder.length === 2 ? `. In this sample, taking ${cn(afwWitness.cells)}=${witnessExample} forces the surviving slot to ${witnessExample}, so ${afwCrossHouse || "the cross line"} loses at least one of {${witnessRemainder.join("/")}}` : ""}. Contradiction again.\nBoth escape patterns fail, so the assumption is false: at least one guardian is true and the elimination follows.` : /almost fireworks/i.test(branch) && type1 && escape ? `${preAfwEscapes ? `Viewed as a pure Triplet Oddagon there are ${preAfwEscapes.cells.length} potential escape/guardian cells: ${cn(preAfwEscapes.cells)}. ` : ""}${afwSlots ? `Almost Fireworks first reserves the two Triplet slots ${cn(afwSlots.cells)}, forcing them to take one of {${digits}}; those two potential guardians are consumed by the AFW structure. ` : "Almost Fireworks first consumes two potential guardian slots. "}This leaves ${cn(escape.cells)} as the sole real escape with outside-triplet candidate(s) {${escapeDigits || "?"}}. If it still took a Triplet digit, the body would fall back into the impossible structure, so it must take an outside candidate.` : /almost fireworks/i.test(branch) ? "Almost Fireworks first occupies part of the Triplet-digit capacity, then the Oddagon logic applies only to the remaining real escapes/guardians." : type1 ? (escape ? `A single extra is the sole escape. The backend identifies ${cn(escape.cells)} as the sole cell with a candidate outside the triplet. If it took any of {${digits}}, all 12 cells would fall back into the impossible pure Triplet Oddagon, so it must take outside candidate(s) {${escapeDigits || "?"}} and the triplet digits are removed.` : "A single extra is the sole escape; a concrete candidate-level explanation requires the backend EscapeCell fact.") : type2 ? (guardians ? `The backend reports the same guardian digit {${guardianDigits || "?"}} across ${cn(guardians.cells)}. If all guardians were false, the 12-cell body would fall back into the impossible pure Triplet Oddagon; therefore at least one guardian is true, and a same-digit target seeing every guardian is false.` : "All escapes share one guardian digit; concrete digits and positions require backend Guardians facts.") : /lock set/i.test(branch) ? "RT combines with a locked triple capacity; the Triplet Locked Set closes local capacity." : /eri/i.test(branch) ? "RT is transferred through ERI to the target." : "The current Branch constrains the actual escape events."}`,
      `1. Verify the 12-cell triplet body. 2. Read backend EscapeCell/Guardians and other real extra roles directly. 3. Verify the RT/Lock Set/ERI/AFW branch. 4. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: triplet body cNormal(1); Escape/Guardian and auxiliary RT/AFW roles follow backend roles; deletions cToDel(11) or Cannibalism(12).`,
      `Not every 12-cell three-candidate shape qualifies; the exact row/column/box arrangement, extra count and branch relation must match the enumerator. Do not describe this as a uniqueness-destroying three-digit permutation.`,
    ];
  }

  if (kind === "DeathBlossom") {
    const stem = firstGroup(step, /^stem$/i), victim = firstGroup(step, /^victim$/i), set = firstGroup(step, /^set$/i), petals = groupsMatching(step, /^petals?$/i);
    const freedom = firstGroupTail(step, "Freedom");
    const stemDigit = firstGroupTail(step, "StemDigit");
    const workDigits = firstGroupTail(step, "WorkDigits");
    const zDigits = firstGroupTail(step, "Z");
    const petalRccs = groupsMatching(step, /^petalrcc$/i).map((g) => String(g?.tail || "")).filter(Boolean);
    const classic = /classic/i.test(branch);
    const type1 = /complex type 1/i.test(branch);
    const type2 = /complex type 2/i.test(branch);
    const type3 = /complex type 3/i.test(branch);
    const setCells = cn(set?.cells);
    const setDigits = digitText(set?.digits) || set?.tail || "";
    const petalCells = cn(petals.flatMap((g) => g.cells));
    const petalDetailZh = petals.map((g, i) => `花瓣${i + 1}=${cn(g.cells)}{${digitText(g.digits) || g.tail || "?"}}${petalRccs[i] ? `，RCC={${petalRccs[i]}}` : ""}`).join("；");
    const petalDetailEn = petals.map((g, i) => `petal ${i + 1}=${cn(g.cells)}{${digitText(g.digits) || g.tail || "?"}}${petalRccs[i] ? `, RCC={${petalRccs[i]}}` : ""}`).join("; ");
    return zh ? [
      `Death Blossom（${branchLabel}）：${classic ? `Stem ${cn(stem?.cells)}，Victim ${cn(victim?.cells)}，ALS花瓣覆盖${petalCells}` : `核心Set=${setCells}{${setDigits || "?"}}${freedom ? `，自由度=${freedom}` : ""}${stemDigit ? `，Stem数字=${stemDigit}` : ""}${workDigits ? `，工作数字={${workDigits}}` : ""}${zDigits ? `，Z={${zDigits}}` : ""}；${petalDetailZh || `${petals.length}个ALS花瓣`}`}。`,
      `${classic ? "Stem的每个候选分支都会激活一个对应ALS花瓣；所有分支都删除Victim中的同一候选，所以该候选无条件可删。" : type1 ? "1型要求Stem数字仍属于原始Set候选、但已不在临时工作数字中；因此Z关系把核心Set本身也纳入可见基底，删数必须同时由Set与花瓣共同支撑。" : type2 ? "2型不采用1型的Set+Stem特殊基底；Z删数由ALS花瓣承接，随后还会检查花瓣联合结构是否已形成更强的Rank-0覆盖。" : type3 ? "3型是在复杂结构基础上进一步通过完整MSLS Rank-0校验得到；最终删数来自实际核心集合+ALS结构的Rank-0覆盖，而不是只套用普通花瓣模板。" : "核心Set的自由分支由实际ALS花瓣及其RCC吸收；只使用本步导出的结构角色。"}`,
      `${classic ? "若Victim目标成立，则对Stem任一可能值，相应花瓣的RCC/共同可见关系都会矛盾；Stem必须取某值，故目标不可能。" : `当前Set自由度${freedom ? `=${freedom}` : "按后端输出"}；${petalRccs.length ? `花瓣RCC依次为${petalRccs.map((x) => `{${x}}`).join("、")}` : "RCC按本步结构读取"}。${type3 ? "只有在完整结构重新核验Truth/Link Rank 0后，才采用MSLS删数。" : "每个删数必须由当前类型对应的Z/RCC可见关系实际推出。"}`}${cannibals ? ` 自噬删数：${cannibals}。` : ""}`,
      `① 读取${branchLabel}；② ${classic ? "逐一核对Stem每个候选是否有对应ALS花瓣并都指向同一Victim目标" : `核对Set=${setCells || "高亮核心"}${freedom ? `的自由度${freedom}` : "自由度"}、每个花瓣及RCC${zDigits ? `、Z={${zDigits}}` : ""}`}${type3 ? "；③ 再独立核对MSLS Rank-0" : ""}；④ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：茎/Victim与Z用cFins(2)，RCC用cEdoFins(3)，ALS内部cAls2，核心集合用cAls1，普通删数cToDel(11)，自噬用Cannibalism(12)。`,
      `经典死亡绽放与复杂1/2/3型不是同一说明；复杂3型（MSLS）必须按Rank-0核心集合/链接结构解释。`,
    ] : [
      `Death Blossom (${branchLabel}): ${classic ? `stem ${cn(stem?.cells)}, victim ${cn(victim?.cells)}, ALS petals ${petalCells}` : `core set=${setCells}{${setDigits || "?"}}${freedom ? `, freedom=${freedom}` : ""}${stemDigit ? `, stem digit=${stemDigit}` : ""}${workDigits ? `, work digits={${workDigits}}` : ""}${zDigits ? `, Z={${zDigits}}` : ""}; ${petalDetailEn || `${petals.length} ALS petals`}`}.`,
      `${classic ? "Every stem candidate activates a corresponding ALS petal, and every branch removes the same victim candidate." : type1 ? "Type 1 keeps the stem digit in the original Set while it is absent from the temporary work-digit union, so the Set itself participates in the Z visibility base." : type2 ? "Type 2 does not use the Type-1 Set+stem special base; Z eliminations are carried by the ALS petals, followed by an optional rank-0 test of their union." : type3 ? "Type 3 is a Complex structure that also passes a complete MSLS rank-0 validation; its eliminations come from that actual Set+ALS cover." : "Use only the core Set, petals and RCC roles emitted by this step."}`,
      `${classic ? "If the victim target were true, each possible stem value would contradict its petal; the stem must take one value, so the target is impossible." : `Set freedom is ${freedom || "backend-reported"}; ${petalRccs.length ? `petal RCCs are ${petalRccs.map((x) => `{${x}}`).join(", ")}` : "read RCCs from the emitted structure"}. ${type3 ? "Apply the MSLS eliminations only after the full structure is revalidated as rank 0." : "Every elimination must follow the current type's actual Z/RCC visibility relation."}`}${cannibals ? ` Cannibal targets: ${cannibals}.` : ""}`,
      `1. Read ${branchLabel}. 2. ${classic ? "Verify one ALS petal for every stem candidate and a common victim" : "verify the actual Set freedom, every petal/RCC, and Z roles"}.${type3 ? " 3. Independently verify the MSLS rank-0 cover." : ""} Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: stem/victim and Z cFins(2), RCC cEdoFins(3), ALS internals cAls2, core set cAls1, ordinary deletions cToDel(11), cannibals Cannibalism(12).`,
      `Classic and Complex Types 1/2/3 require different explanations. Type 3 (MSLS) must be justified as a rank-0 set/link cover.`,
    ];
  }

  if (kind === "BlossomLoop") {
    const focus = firstGroup(step, /^focus$/i);
    const chainBranches = list(step?.chainBranches);
    const main = chainBranches.find((b) => /burring loop/i.test(String(b?.label || "")));
    const burrs = chainBranches.filter((b) => /^burr branch/i.test(String(b?.label || "")));
    const focusText = String(focus?.tail || "").trim() || cn(focus?.cells) || (zh ? "后端Focus" : "backend Focus");
    const mainNodes = list(main?.nodes).length;
    return zh ? [
      `Blossom Loop（${branchLabel}）：Focus=${focusText}；主Burring Loop含${mainNodes || "后端记录的"}个链节点，另有${burrs.length}条Burr Branch。`,
      `Focus中的候选/位置/AALS唯一分支必须有一个成立。主Burring Loop连接两条活动分支，其余Focus分支分别沿Burr Branch导向同一反相结论；所有分支闭合后形成全局Rank-0式循环。`,
      `逐一检查Focus的每种合法选择：无论哪一种成立，主Burring Loop或对应Burr Branch都会把同一个目标推到相反状态。Focus至少要选中一种，因此该目标在所有合法情况中都不能成立；反相AIC删数来自主环两端的相位关系，Burr Branch负责补齐主环没有直接覆盖的Focus选择。`,
      `① 按后端Branch区分Cell Type、Region Type、AALS Type；② 确认Focus分别是单格候选、house中同数字位置或AALS唯一候选；③ 核对Burring Loop；④ 对每个剩余Focus分支核对Burr Branch；⑤ 应用删数。`,
      `FB配色按链节点成立/不成立、ALS区域和Focus角色输出；不能只把整个链统一一种颜色。动态教程应保留毛刺主环与每条毛刺分支原始尤里卡。`,
      `Cell/Region Type在已知终解辅助搜索时只检查包含真分支的端点对；AALS Type检查三个OnlyCand分支。教程必须按后端Branch和Focus角色区分，标题只用于显示。`,
    ] : [
      `Blossom Loop (${branchLabel}): Focus=${focusText}; the main Burring Loop has ${mainNodes || "backend-recorded"} chain nodes, with ${burrs.length} Burr Branches.`,
      `One Focus candidate/position/AALS branch must be true. The main loop connects two active branches, while every remaining Focus branch follows a Burr Branch to the same opposite conclusion; together they close a global rank-0-like loop.`,
      `Check every legal Focus choice. Whichever one is true, the main Burring Loop or its Burr Branch drives the same target to the opposite state. Since one Focus choice must occur, that target is impossible in every legal case. Anti-phase AIC eliminations come from the phase relation of the main-loop endpoints, while Burr Branches cover Focus choices not handled directly by the main loop.`,
      `1. Read backend Branch to distinguish Cell, Region and AALS Type. 2. Verify the Focus role. 3. Verify the Burring Loop. 4. Verify one Burr Branch for every other Focus case. 5. Apply eliminations.`,
      `FB colours preserve ON/OFF chain nodes, ALS areas and Focus roles; do not flatten the whole chain to one colour. Keep the raw Burring Loop and each Burr Branch eureka.`,
      `Cell/Region Type may use the known solution only to select endpoint pairs containing the true branch; AALS Type checks all three OnlyCand branches. Explain from backend Branch and Focus roles; Title is display text only.`,
    ];
  }

  return null;
}

export function buildAuditedTechniqueGuide(step = {}, locale = "zh") {
  const kind = String(step?.kind || "");
  if (AUDITED_FOUNDATIONS.has(kind)) return buildAuditedFoundationGuide(step, locale);
  if (AUDITED_PHASE3.has(kind)) return buildAuditedPhase3Guide(step, locale);
  if (AUDITED_PHASE4.has(kind)) return buildAuditedPhase4Guide(step, locale);
  if (AUDITED_PHASE5.has(kind)) return buildAuditedPhase5Guide(step, locale);
  if (AUDITED_PHASE6.has(kind)) return buildAuditedPhase6Guide(step, locale);
  if (AUDITED_PHASE7.has(kind)) return buildAuditedPhase7Guide(step, locale);
  if (!UNIQUENESS.has(kind)) return null;
  const zh = localeKey(locale) === "zh";
  const title = String(step?.title || kind);
  const description = String(step?.description || "");
  const key = `${kind} ${title} ${description}`.toLowerCase();
  const branchValues = groupTails(step, "branch");
  const branchKey = branchValues.join(" ").toLowerCase();
  const mergedBranch = branchValues.length > 1;
  const branchDisplay = branchValues.map((value) => localizedProofMeta(value, locale)).join(zh ? "、" : ", ");
  const deadly = deadlyDigitsForStep(step) || (zh ? "相应致命数字组" : "the deadly digit set");
  const body = roleCellText(step, /^(urbody|arbody|ulbody|xrbody)$/i, locale)
    || ((kind === "UniqueRectangle" || kind === "AvoidableRectangle") ? firstCellsText(step, 4, locale) : cellNames(structureCells(step), 14, locale));
  const target = digitText(list(step?.candidates)) || (zh ? "目标数字" : "the target digit");
  const uniquenessCheck = zh
    ? "只适用于确认具有唯一解的标准数独；结构、角色或候选状态少一项都不能套用。"
    : "Use only on a standard Sudoku confirmed to have one solution; do not apply the rule if any structural role or candidate condition is missing.";

  if (kind === "GSP") {
    const symmetryRaw = uniquenessRole(step, /^symmetry$/i)?.tail || (zh ? "给定" : "reported");
    const symmetry = localizedSymmetryName(symmetryRaw, locale);
    const selfDigits = roleDigitText(step, /^self$/i);
    const selfCells = roleCellText(step, /^self$/i, locale);
    return zh ? [
      `本步使用${symmetry}全局对称映射；它不是局部四格唯一矩形。`,
      "把完成盘按同一位置变换和数字置换映射后，仍必须符合原题给定。与映射不相容的候选若保留，会生成另一完成盘。",
      `设位置变换为 σ、数字置换为 π，则任意完成盘数字满足 S(σ(c))=π(S(c))。${selfDigits ? `自映射数字${selfDigits}` : "自映射数字"}只能出现在对称不动位置${selfCells ? `（${selfCells}）` : ""}；违反该条件的候选为假。`,
      "① 确认对称类型；② 核对行列重排；③ 核对数字成对映射与自映射数字；④ 检查每个删数是否违反固定点或轴上共轭条件。",
      "自映射位置、数字映射和删数必须分层显示；对称格只是位置角色，不能把所有高亮格都叫作致命结构。",
      `${uniquenessCheck} 还要逐项核对说明中的行列重排和数字映射。`,
    ] : [
      `This step uses the reported ${symmetry} global symmetry; it is not a local four-cell Unique Rectangle.`,
      "A completed grid transformed by the same position symmetry and digit permutation must still match the givens. A candidate incompatible with that mapping would allow another completion.",
      `Let σ be the position transform and π the digit permutation. A solution obeys S(σ(c))=π(S(c)). ${selfDigits ? `Self-mapped digits ${selfDigits}` : "Self-mapped digits"} may occur only at fixed positions${selfCells ? ` (${selfCells})` : ""}; a violation is false.`,
      "1. Confirm the symmetry type. 2. Check row/column rearrangement. 3. Check paired and self-mapped digits. 4. Verify each elimination against fixed-point or axis-conjugacy conditions.",
      "Display fixed positions, digit mapping and eliminations as separate roles; symmetric cells alone are not a deadly pattern.",
      `${uniquenessCheck} Also verify every reported row/column and digit mapping.`,
    ];
  }

  if (kind === "BUGOne") {
    const cell = roleCellText(step, /^bugplusonecell$/i, locale) || cellNames(structureCells(step), 14, locale);
    const forced = roleDigitText(step, /^forcedcandidate$/i) || target;
    return zh ? [
      `全盘除${cell || "一个异常格"}外均为双值；异常格多出的候选${forced}是打破BUG双解的唯一出口。`,
      "假设该额外候选为假，所有未解格都会变成双值，且每个区域中的每个候选出现0次或2次，形成两种可互换完成方式。",
      `记去掉${forced}后的候选图为G。若每个格度数为2，且每个house-digit节点度数为0或2，则G的每个连通分量可二染色并翻转，产生第二解。因此${forced}必须为真。`,
      "① 确认只有一个三值格；② 假删结论候选；③ 逐区域核对每个数字出现次数为0或2；④ 将额外候选出数。",
      "异常格、额外候选和最终出数应单独标明；不要把异常格的全部候选都称为额外候选。",
      `${uniquenessCheck} 必须确认其余所有未解格都是双值。`,
    ] : [
      `Every unsolved cell is bivalue except ${cell || "one exceptional cell"}; extra candidate ${forced} is the only breaker of a BUG double solution.`,
      "If that extra candidate were false, every unsolved cell would be bivalue and every house-digit would occur zero or twice, producing two interchangeable completions.",
      `After removing ${forced}, let G be the candidate graph. If every cell has degree 2 and every house-digit node has degree 0 or 2, each component is two-colourable and can be flipped, giving a second solution. Hence ${forced} is true.`,
      "1. Confirm exactly one trivalue cell. 2. Temporarily remove the reported candidate. 3. Check every house-digit count is zero or two. 4. Place the extra candidate.",
      "Show the exceptional cell, extra candidate and placement separately; not every candidate in the cell is an extra.",
      `${uniquenessCheck} Every other unsolved cell must be bivalue.`,
    ];
  }

  if (kind === "BUGPlusN") {
    const gs = groupsMatching(step, /^guardian/i);
    const gd = digitText(gs.flatMap((group) => group.digits)) || target;
    const gc = unique(gs.flatMap((group) => group.cells).map(cellName)).join(zh ? "、" : ", ");
    let variant = zh ? "守护集合至少一真" : "at least one guardian is true";
    let math = zh ? `把所有守护候选看成一组选择：它们不能同时为假，否则盘面会退化为完整BUG；因此这组守护中至少有一个必须为真。` : `Treat all guardians as one set of alternatives: they cannot all be false, because that would collapse the grid to a complete BUG. Therefore at least one guardian is true.`;
    if (/type 1/.test(branchKey)) variant = zh ? "守护候选全在同一格，该格必须取守护之一" : "all guardians occupy one cell, which must take one of them";
    else if (/type 2/.test(branchKey)) variant = zh ? "守护候选同数字，公共可见位置可删该数字" : "all guardians use one digit, removable from common peers";
    else if (/type 3/.test(branchKey)) variant = zh ? "守护候选与裸数组共同锁满容量" : "guardians combine with a naked subset to fill capacity";
    else if (/type 4/.test(branchKey)) variant = zh ? "守护格中的共轭对与守护析取共同删数" : "a conjugate pair in guardian cells combines with the guardian disjunction";
    return zh ? [
      `去掉${gc || "高亮位置"}中的守护候选${gd}后，盘面会形成完整BUG；本分支为：${variant}。`,
      "完整BUG存在成对互换的第二解，因此守护候选不可能全部为假；类型1–4再利用同格、同数字、数组或共轭关系推出具体结论。",
      math,
      "① 找出所有异常格及其伪双值对；② 计算每格守护候选；③ 确认守护全假会闭合BUG；④ 按步骤说明识别类型并应用结论。",
      "每个Guardian分组只高亮该格真正多出的候选；StrongLink、Subset等辅助角色必须与Guardian分开显示。",
      `${uniquenessCheck} 不能漏掉任何异常候选，否则“守护至少一真”的析取不完整。`,
    ] : [
      `Removing guardian candidates ${gd} at ${gc || "the highlighted positions"} would create a complete BUG. This branch uses: ${variant}.`,
      "A complete BUG has a paired second solution, so the guardians cannot all be false. Types 1–4 then combine that disjunction with a common cell, one digit, a subset or a conjugate pair.",
      math,
      "1. Identify every exceptional cell and its pseudo-bivalue pair. 2. Compute each cell's guardians. 3. Verify all guardians false closes the BUG. 4. Identify the Type and apply its conclusion.",
      "Each Guardian group should highlight only the truly extra candidates; StrongLink and Subset roles must be shown separately.",
      `${uniquenessCheck} No exceptional candidate may be omitted from the guardian disjunction.`,
    ];
  }

  if (/external test \+ xy-wing/.test(branchKey)) {
    const ga = roleCellText(step, /^guardiansa$/i, locale) || (zh ? "第一组守护候选" : "guardian group A");
    const gb = roleCellText(step, /^guardiansb$/i, locale) || (zh ? "第二组守护候选" : "guardian group B");
    const wa = roleCellText(step, /^winga$/i, locale) || cellNames(structureCells(step).slice(-2, -1), 14, locale);
    const wb = roleCellText(step, /^wingb$/i, locale) || cellNames(structureCells(step).slice(-1), 14, locale);
    return zh ? [
      `以${deadly}为致命数字的唯一矩形，外部守护候选通过两个双值翼格转化为共同数字${target}的XY-Wing删数。`,
      `若所有${deadly}守护候选都为假，${body || "四角"}退化为致命矩形，所以守护集合至少一真。${ga}成立会迫使${wa || "第一翼"}取${target}；${gb}成立会迫使${wb || "第二翼"}取${target}。`,
      `两组守护候选至少有一组会提供一个真候选；对应的双值翼随之被迫取${target}。因此两个翼格中的${target}至少有一个为真，任何同时看见两翼的${target}都可删。`,
      `① 找${deadly}唯一矩形四角；② 分组找两类外部守护候选；③ 找分别看见对应全部守护候选的双值翼格；④ 删除同时看见两翼的${target}。`,
      `四角UR主体、两组守护候选、翼A、翼B和删数目标必须使用不同角色显示；${target}是共同删数数字，不是致命数字。`,
      `${uniquenessCheck} 还要确认每个翼格看见对应数字的全部守护候选，目标同时看见两个翼格。`,
    ] : [
      `A Unique Rectangle with deadly digits ${deadly} converts its external guardians through two bivalue wings into an XY-Wing elimination on shared digit ${target}.`,
      `If every ${deadly} guardian were false, ${body || "the four corners"} would become a deadly rectangle, so at least one guardian is true. ${ga} forces ${wa || "wing A"} to ${target}; ${gb} forces ${wb || "wing B"} to ${target}.`,
      `At least one guardian group supplies a true guardian, and its bivalue wing is then forced to ${target}. Thus ${target} is true in at least one wing, so any ${target} seeing both wings can be removed.`,
      `1. Find the ${deadly} UR body. 2. Split the external guardians by deadly digit. 3. Find a bivalue wing seeing every guardian in each group. 4. Remove ${target} from cells seeing both wings.`,
      `Show the UR body, two guardian groups, Wing A, Wing B and targets as separate roles. ${target} is the shared elimination digit, not a deadly digit.`,
      `${uniquenessCheck} Each wing must see every guardian of its associated deadly digit, and every target must see both wings.`,
    ];
  }

  const isAR = kind === "AvoidableRectangle";
  const isUL = kind === "UniqueLoop";
  const isXR = kind === "ExtendedRectangle";
  const family = zh ? (isAR ? "可避免矩形" : isUL ? "唯一环" : isXR ? "扩展矩形" : "唯一矩形") : (isAR ? "Avoidable Rectangle" : isUL ? "Unique Loop" : isXR ? "Extended Rectangle" : "Unique Rectangle");
  let variantIdea = zh ? "保留至少一个破坏致命结构的出口" : "retain at least one escape from the deadly structure";
  let math = zh ? `令D表示只含致命数字组${deadly}的主体。D有两个交替完成方式，所以唯一解盘面必须满足“至少一个破坏条件Eᵢ为真”。删数来自该析取与当前类型的附加约束。` : `Let D be the body restricted to deadly set ${deadly}. D has two alternating completions, so a unique puzzle requires at least one escape Eᵢ. The elimination follows from that disjunction plus the Type-specific constraint.`;
  let steps = zh ? "① 找致命主体；② 确认致命数字组；③ 找破坏格或外部角色；④ 按实际类型核对容量、共轭或翼关系；⑤ 应用结论。" : "1. Find the deadly body. 2. Confirm the deadly digit set. 3. Identify escape or external roles. 4. Check the actual Type's capacity/conjugacy/Wing relation. 5. Apply the conclusion.";
  let highlight = zh ? "致命主体、破坏格、辅助数组/强链和删数目标应分角色显示，不能把全部高亮格统称为矩形或环。" : "Display the deadly body, escape cells, auxiliary subset/strong link and targets as separate roles; do not call every highlighted cell the rectangle or loop.";
  if (/external test 1/.test(branchKey)) variantIdea = zh ? "唯一外部守护格必须保留致命数字之一" : "the sole external guardian cell must keep one deadly digit";
  else if (/external test 2\/4/.test(branchKey)) variantIdea = zh ? "一种致命数字没有外部守护，另一数字的守护集合至少一真" : "one deadly digit has no external guardian, so a guardian of the other digit is true";
  else if (/external test 3h/.test(branchKey)) variantIdea = zh ? "外部守护与隐性数组共同锁定区域容量" : "external guardians and a hidden subset lock house capacity";
  else if (/external test 3/.test(branchKey)) variantIdea = zh ? "外部守护与裸数组共同锁定区域容量" : "external guardians and a naked subset lock house capacity";
  else if (/aur \+ (xy|xyz)-wing/.test(branchKey)) variantIdea = zh ? `屋顶额外候选的至少一真条件经Wing传到共同数字${target}` : `the roof-extra disjunction is carried through a Wing to shared digit ${target}`;
  else if (/aur \+ wxyz-(wing|ring)/.test(branchKey)) variantIdea = zh ? "屋顶额外候选与三个外部节点形成WXYZ待定数组/闭环" : "roof extras and three external nodes form a WXYZ almost-locked set/ring";
  else if (mergedBranch) {
    variantIdea = branchDisplay
      ? (zh ? `多个唯一性分支合并：${branchDisplay}` : `multiple uniqueness branches are merged: ${branchDisplay}`)
      : (zh ? "多个唯一性分支产生不同删数并被合并" : "multiple uniqueness branches produce distinct merged eliminations");
  }
  else if (/hidden rectangle/.test(branchKey)) variantIdea = zh ? "行列共轭关系隐藏锁定一个致命数字" : "row and column conjugacies hidden-lock one deadly digit";
  else if (/type 1/.test(branchKey)) variantIdea = zh ? "只有一个破坏格，不能让它退化为致命数字组" : "there is one escape cell, which must not collapse to the deadly set";
  else if (/type (2|5)/.test(branchKey)) variantIdea = zh ? "两个破坏格共享一个至少一真的额外数字" : "two escape cells share one extra digit that is true in at least one";
  else if (/type 3/.test(branchKey)) variantIdea = zh ? "破坏候选与裸数组共同占满容量" : "escape candidates and a naked subset fill capacity";
  else if (/type 4/.test(branchKey)) variantIdea = zh ? "一个致命数字在破坏格中形成共轭对" : "one deadly digit is conjugate across the escape cells";
  else if (/type 6/.test(branchKey)) variantIdea = zh ? "一个致命数字的外部落点被清空，落点限制在主体角点" : "one deadly digit has no outside positions and is confined to the body corners";
  else if (/type 7/.test(branchKey)) variantIdea = zh ? "外部强链/S-Ring把致命端点连接成闭合约束" : "external strong links/S-Ring close the deadly endpoints";
  return zh ? [
    `${family}以${deadly}为致命数字组；当前分支的关键是：${variantIdea}。`,
    `若所有破坏条件都失效，${body || "高亮主体"}只剩${deadly}并出现两种交替完成方式；当前类型的额外关系把“至少一个破坏条件成立”转化为本步结论。`,
    math,
    steps,
    highlight,
    `${uniquenessCheck} ${kind === "UniqueRectangle" || isAR ? "四角还必须位于两行、两列且只占两个宫。" : "必须完整核对闭环/扩展配对结构。"}`,
  ] : [
    `${family} uses deadly digit set ${deadly}; this branch relies on: ${variantIdea}.`,
    `If every escape failed, ${body || "the highlighted body"} would contain only ${deadly} and admit two alternating completions. The Type-specific relation converts the required escape into this step's conclusion.`,
    math,
    steps,
    highlight,
    `${uniquenessCheck} ${kind === "UniqueRectangle" || isAR ? "The four corners must occupy two rows, two columns and exactly two boxes." : "Verify the complete loop/extended pairing structure."}`,
  ];
}

function buildAuditedPhase5Guide(step = {}, locale = "zh") {
  const kind = String(step?.kind || "");
  if (!AUDITED_PHASE5.has(kind)) return null;
  const zh = localeKey(locale) === "zh";
  const model = chainExplanation(step, locale, false);
  const rawBranches = groupTails(step, "Branch");
  const branch = (rawBranches.length ? rawBranches.map((value) => localizedProofMeta(value, locale)).join(zh ? "、" : ", ") : String(step?.title || kind));
  const form = firstGroupTail(step, "ChainForm");
  const pattern = firstGroupTail(step, "StrongPattern");
  const threeStrongClass = firstGroupTail(step, "ThreeStrongClass");
  const reasons = groupTails(step, "EdgeReason");
  const reasonLabels = reasons.map((value) => localizedProofMeta(value, locale));
  const looking = zh
    ? `① 按尤里卡顺序读取节点；② 逐边确认“=”强关系和“-”弱关系；③ ${pattern ? `按${pattern}核对V/L三强边分类` : "核对起点、终点及端点关系"}；④ ${form === "ContinuousLoop" || form === "Ring" || form === "Cycle" ? "逐条检查闭环弱边产生的删数" : form === "DiscontinuousLoop" ? "检查断点候选的强制定值/删数" : "检查两个开放端点共同推出的目标"}。`
    : `1. Read nodes in Eureka order. 2. Verify every '=' strong link and '-' weak link. 3. ${pattern ? `classify the three strong links by V/L pattern ${pattern}` : "verify start, end and endpoint relation"}. 4. ${form === "ContinuousLoop" || form === "Ring" || form === "Cycle" ? "check eliminations from every loop weak link" : form === "DiscontinuousLoop" ? "check the forced action at the discontinuity" : "check the target implied by the two open endpoints"}.`;
  const colours = zh
    ? `FB链配色以第一个显示节点cSTP(10)为锚点，随后沿路径交替使用cAls1(4)/cFins(2)；删数cToDel(11)。Complex AIC中的ALS、UR Guardian、Tridagon、AF、AMSLS等只按实际EdgeReason增加各自结构色。`
    : `FB chain colours anchor the first displayed node with cSTP(10), then alternate cAls1(4)/cFins(2) along the path; eliminations use cToDel(11). Complex AIC adds ALS, UR Guardian, Tridagon, AF or AMSLS context colours only when the corresponding EdgeReason is present.`;
  const check = zh
    ? `当前分支为${branch}。名称必须由实际路径得到：Wing/Ring按V/L模式和数字数分类${pattern === "LLL" ? `；LLL只有L1、L2、L3三种，本步为${threeStrongClass || "待核对"}` : ""}，CNL/DNL按端点闭合方式分类，Complex前缀只能来自本步列出的EdgeReason（${reasonLabels.join("、") || "普通关系"}）。`
    : `Current branch: ${branch}. The name must come from the actual path: Wing/Ring from V/L pattern plus digit count${pattern === "LLL" ? `; LLL has only L1, L2 and L3, and this step is ${threeStrongClass || "unresolved"}` : ""}, CNL/DNL from endpoint closure, and Complex prefixes only from the listed EdgeReason entries (${reasons.join(", ") || "ordinary relations"}).`;
  return [model.structure, model.basis, model.deduction, looking, colours, check];
}


function buildAuditedPhase6Guide(step = {}, locale = "zh") {
  const kind = String(step?.kind || "");
  if (!AUDITED_PHASE6.has(kind)) return null;
  const zh = localeKey(locale) === "zh";
  const model = kind === "CellRegionFC"
    ? forcingExplanation(step, locale)
    : (kind === "DynamicChain" ? chainExplanation(step, locale, true) : chainExplanation(step, locale, false));
  if (kind === "CellRegionFC") {
    const forceKindRaw = firstGroupTail(step, "ForceChainKind") || String(step?.title || "Force Chain");
    const forceKind = localizedProofMeta(forceKindRaw, locale);
    const branches = firstGroupTail(step, "BranchCount") || String(list(step?.chainBranches).length || "");
    const targets = firstGroup(step, /^commontargets$/i);
    const triplet = firstGroup(step, /^witnesstripletoddagon$/i);
    const guardians = tripletGuardianFacts(step, locale);
    const guardianBranches = tripletGuardianBranchFacts(step, locale);
    if (/triplet oddagon/i.test(forceKindRaw) && triplet && guardians.length) {
      return zh ? [
        model.structure,
        model.basis,
        model.deduction,
        `① 核对12格Triplet Oddagon主体及三值组；② 找出主体格中的全部组外guardian（${guardians.join("、")}）；③ 核对这些guardian不能同时为假；④ ${guardianBranches.length ? `逐条核对guardian与分支对应：${guardianBranches.join("；")}` : "逐条核对每个guardian成立时的显示分支"}；⑤ 对各分支端点删数集合求交集并应用共同删数。`,
        "高亮应把Triplet Oddagon主体三值候选、组外guardian、各条反向回放Force Chain以及最终共同删数分层显示；guardian是坏结构的真实逃逸条件，不应被隐藏成泛化的搜索实体标签。",
        "核对重点不是“看起来有三条链”，而是：12格主体确为后端Triplet Oddagon见证、全部guardian已列全、至少一个guardian必真，并且最终每个删数都属于所有guardian分支端点删数集合的交集。",
      ] : [
        model.structure,
        model.basis,
        model.deduction,
        `1. Verify the 12-cell Triplet Oddagon body and its three digits. 2. List every off-body guardian (${guardians.join(", ")}). 3. Verify that they cannot all be false. 4. ${guardianBranches.length ? `Verify the guardian-to-branch mapping: ${guardianBranches.join("; ")}` : "Verify the displayed branch for each guardian-true case"}. 5. Intersect the endpoint-elimination sets and apply the common deletions.`,
        "Highlight the Triplet Oddagon body digits, off-body guardians, each reversed Force Chain branch and the final common eliminations as separate roles. Guardians are the real escape conditions of the impossible pattern, not merely a search label.",
        "The audit target is not just the presence of three chains: verify the backend 12-cell Triplet Oddagon witness, complete guardian set, the at-least-one-guardian-true condition, and that every final deletion lies in the intersection of all guardian-branch endpoint deletion sets.",
      ];
    }
    return zh ? [
      `${forceKind}：${branches || "各"}条关键分支均已反向回放成正常Forcing Chain；每条分支都有自己的端点删数集合${targets ? `，${roleSummary(targets, locale, "共同目标")}` : ""}。`,
      "各分支代表完备的强制可能。无论实际落入哪一分支，若某候选都被该分支端点排除，则它属于共同结论；最终输出是所有分支端点删数集合的交集。",
      "对每条反向回放链读取末端单候选或ALS扇区，计算该端点可见范围内的删数集合，再对全部集合取交集。Cell、Region、UR、Triplet Oddagon只是搜索实体分类，不改变最终按分支共同结论输出的Forcing Chain语义。",
      "① 逐条确认显示链方向；② 确认每条链的端点；③ 独立列出各端点删数集合；④ 只保留所有集合共有的候选；⑤ 应用共同删数。",
      "高亮应分别显示各分支路径、端点扇区和最终共同删数；内部失效见证只用于搜索，不应冒充用户看到的主结论。",
      "核对最终每一个删数都确实属于每条分支的端点删数集合；输出仍是标准 Forcing Chain，按各分支共同结论呈现。",
    ] : [
      `${forceKind}: ${branches || "the critical"} branches are replayed in the normal forcing direction; each has its own endpoint-elimination set${targets ? `, with common targets ${roleSummary(targets, locale, "targets")}` : ""}.`,
      "The branches are exhaustive forcing cases. A candidate is a common conclusion only when every branch endpoint eliminates it; the final output is the intersection of all endpoint-elimination sets.",
      "For each reversed display chain, read the terminal single candidate or ALS sector, compute its elimination set, then intersect all sets. Cell, Region, UR and Triplet Oddagon identify the search entities and branch sources; the displayed proof uses the common forcing conclusion.",
      "1. Verify each displayed branch direction. 2. Identify every endpoint. 3. Compute each endpoint's elimination set independently. 4. Keep only candidates common to all sets. 5. Apply the common eliminations.",
      "Highlight branch paths, endpoint sectors and final common targets separately. Internal failure witnesses are search aids, not the user-facing conclusion.",
      "Verify that every final elimination belongs to every branch endpoint's elimination set; present the result as the common conclusion of a standard Forcing Chain.",
    ];
  }
  if (kind === "DynamicChain") {
    const modeRaw = firstGroupTail(step, "DynamicMode") || String(step?.chainType || "Dynamic");
    const mode = localizedProofMeta(modeRaw, locale);
    const grouped = firstGroupTail(step, "Grouped") === "true" || /grouped/i.test(String(step?.title || ""));
    const sourceStateRaw = firstGroupTail(step, "SourceState");
    const sourceState = localizedProofMeta(sourceStateRaw, locale);
    const contradiction = /contradiction/i.test(modeRaw);
    return zh ? [
      model.structure,
      model.basis,
      model.deduction,
      contradiction
        ? `① 找源候选；② 只在${sourceState || "指定"}源状态下沿动态网络传播；③ 核对同一候选被同时推出成立/不成立；④ ${sourceStateRaw === "OFF" ? "确定源候选" : "删除源候选"}。`
        : "① 分别传播源候选成立和不成立；② 核对两侧都推出同一个出数或删数；③ 输出共同结论。",
      grouped ? "分组动态链的组节点必须整体着色和核对；不能拆成任意单格强边。" : "按实际成立/不成立网络显示源、传播节点、汇合/碰撞和结论。",
      `当前模式为${mode}。矛盾型只否定发生冲突的一个源状态；共同真值型则要求源候选“成立/不成立”两侧得到完全相同的结论。`,
    ] : [
      model.structure,
      model.basis,
      model.deduction,
      contradiction
        ? `1. Identify the source. 2. Propagate only the ${sourceState || "reported"} source state. 3. Verify that one candidate is derived both ON and OFF. 4. ${sourceStateRaw === "OFF" ? "Place the source" : "Eliminate the source"}.`
        : "1. Propagate source ON and source OFF separately. 2. Verify both sides derive the same placement or elimination. 3. Emit the common conclusion.",
      grouped ? "Treat every grouped node as one proposition; do not split it into arbitrary single-cell strong links." : "Display the source, actual ON/OFF network, convergence/collision and conclusion separately.",
      `Current mode: ${mode}. Contradiction refutes only the conflicting source state; Verity requires exactly the same conclusion from source ON and source OFF.`,
    ];
  }
  const isWhip = kind === "Whip" || kind === "GWhip";
  const grouped = kind === "GWhip" || kind === "GBraid" || firstGroupTail(step, "Grouped") === "true";
  const shapeRaw = firstGroupTail(step, "ProofShape");
  const shape = localizedProofMeta(shapeRaw, locale);
  const terminal = firstGroupTail(step, "Terminal");
  if (isWhip) {
    return zh ? [
      model.structure,
      "Whip是一条单一主干。假设目标候选成立后，每个右链接候选都在当时已累计排除的局面中成为唯一可成立者；这不是把一条静态AIC简单拉长。",
      `沿主干传播后，${terminal ? `终止条件${localizedProofMeta(terminal, locale)}` : "某个终止格或区域-数字约束"}失去全部合法候选，因此目标假设为假。`,
      "① 假设目标为真；② 逐层核对左链接被排除；③ 核对右链接在当前局面中唯一；④ 确认终止格/区域被排空；⑤ 删除目标。",
      grouped ? "g-Whip 的组节点作为一个合法分组节点整体显示；成立/不成立主干和最终删数沿用FB链配色。" : "目标、主干成立/不成立节点、终止约束和删数分层显示。",
      "若完整回放出现真正分叉，就不是Whip而应归入Braid；Whip必须保持单主干。",
    ] : [
      model.structure,
      "A Whip is a single spine. Under the target assumption, each right-linking candidate is uniquely forced in the board state after all earlier path-local eliminations; it is not merely a long static AIC.",
      `Propagation leaves ${terminal ? `terminal condition ${terminal}` : "a terminal cell or house-digit constraint"} without a legal candidate, so the target assumption is false.`,
      "1. Assume the target. 2. Verify each left-linking candidate is removed. 3. Verify each right-linking candidate is unique in the current state. 4. Confirm the terminal constraint is emptied. 5. Eliminate the target.",
      grouped ? "Treat every g-Whip group as one legal grouped node; preserve FB ON/OFF path colours and the final deletion." : "Display target, ON/OFF spine nodes, terminal constraint and elimination as separate roles.",
      "If the complete replay genuinely branches, it is a Braid rather than a Whip. A Whip must remain SingleSpine.",
    ];
  }
  return zh ? [
    model.structure,
    `${grouped ? "分组" : ""}Braid允许分叉，但每个分叉点都必须覆盖当时全部左链接可能。所有分支共同组成完备证明；不能挑一条成功支路就下结论。`,
    "假设目标成立后，逐个展开全部合法分支；每条支路继续强制传播，最终所有分支共同排空终止格或区域，所以目标候选可删。",
    "① 假设目标成立；② 在每个分叉点列全左链接候选；③ 分别回放每条分支；④ 确认所有分支均导向同一终止失效；⑤ 删除目标。",
    grouped ? "g-Braid 中的分组节点必须整体显示；各分支、共享节点、终止约束和删数应保持不同角色。" : "各分支、共享节点、终止约束和删数应分层显示。",
    `实际证明形态必须为分叉型。${shapeRaw === "Branching" ? "本步已确认存在真实分叉，保持Braid/g-Braid分类。" : "若完整回放是单主干型，搜索器必须重命名为Whip/g-Whip。"}`,
  ] : [
    model.structure,
    `A ${grouped ? "grouped " : ""}Braid may branch, but every branch point must cover all currently possible left-linking candidates. The proof is exhaustive; one successful branch is insufficient.`,
    "Under the target assumption, expand every legal branch. Each branch continues forcing until all branches collectively empty the terminal cell or house, so the target is false.",
    "1. Assume the target. 2. Enumerate all left-linking candidates at every branch point. 3. Replay each branch. 4. Verify all branches reach the terminal failure. 5. Eliminate the target.",
    grouped ? "Keep grouped nodes intact and display branches, shared nodes, terminal constraint and deletion as separate roles." : "Display branches, shared nodes, terminal constraint and deletion as separate roles.",
    `The actual proof shape must be Branching. ${shapeRaw === "Branching" ? "This step contains genuine branching and remains Braid/g-Braid." : "If complete replay is SingleSpine, the detector must rename it Whip/g-Whip."}`,
  ];
}


function buildAuditedPhase7Guide(step = {}, locale = "zh") {
  const kind = String(step?.kind || "");
  if (!AUDITED_PHASE7.has(kind)) return null;
  const zh = localeKey(locale) === "zh";
  const model = kind === "SKLoop" || kind === "MSLS"
    ? rankExplanation(step, locale)
    : (kind === "BruteForce" ? bruteForceExplanation(step, locale) : exocetExplanation(step, locale));
  if (kind === "SKLoop") {
    return zh ? [
      model.structure, model.basis, model.deduction,
      "① 先确认只有8个分组链接段；② 逐段读取实际数字组；③ 将每个数字-house组合分别计为一个Link名额；④ 确认8段合计Link名额与主体格Truth数相等；⑤ 只删除结构外抢占链接容量的候选。",
      "按FB角色分别显示LoopBody、每一段Link和删数；一段Link可以含多个数字，不能压成单数字AIC环。",
      "SK Loop就是Domino Loop。它是严格Rank 0的八段闭环；标题中的16 Links表示数字链接名额，不表示16个几何段。",
    ] : [
      model.structure, model.basis, model.deduction,
      "1. Confirm there are exactly eight grouped link segments. 2. Read the actual digit set on each segment. 3. Count every digit-house pair as one Link slot. 4. Verify the eight segments' total Link slots equal the body cell truths. 5. Remove only outside candidates that steal saturated link capacity.",
      "Display LoopBody, every Link and eliminations as separate FB roles. One link may contain multiple digits and must not be flattened into a single-digit AIC loop.",
      "SK Loop and Domino Loop are the same family. It is a strict rank-0 eight-segment loop; '16 Links' in the title means digit-link slots, not sixteen geometric segments.",
    ];
  }
  if (kind === "MSLS") {
    const branch = firstGroupTail(step, "Branch") || "MSLS Rank-0";
    const branchLabel = localizedProofMeta(branch, locale);
    const advanced = /advanced/i.test(branch);
    const irregular = /irregular/i.test(branch);
    return zh ? [
      model.structure, model.basis, model.deduction,
      irregular
        ? "① 确认最终Truth格集合；② 对每个数字单独求可混合行/列/宫的严格最小cover；③ 将各数字最小cover大小相加，核对Logical LinkCount=CellCount；④ 若存在多套等价cover，区分每套实际逻辑链接数与UnionLinkCount链接并集；⑤ 只保留对全部等价cover都成立的外部/自噬删数。"
        : (advanced
          ? "① 确认核心格；② 为每个数字比较行/列/宫覆盖成本；③ 枚举浮动数字的行侧/列侧分配；④ 纳入被链接强制加入的Attachment；⑤ 核对CellCount=LinkCount并应用外部/自噬删数。"
          : "① 确认核心格；② 逐数字计算占用的行、列、宫；③ 选取最低成本覆盖；④ 核对最小链接总数等于核心格数；⑤ 应用外部与重复覆盖删数。"),
      irregular
        ? "异型分支必须分别显示Truth格、每个数字的实际最小cover、Logical LinkCount、UnionLinkCount/覆盖族以及删数；不能把链接并集数量误当Rank。"
        : "核心、附加格、实际链接、可置换数字和删数必须分层显示；不能只写一个笼统的秩 0。",
      `${branchLabel}。精确、高级/附加格、异型是不同搜索路径；只有实际输出的分支与角色可写入教程。`,
    ] : [
      model.structure, model.basis, model.deduction,
      irregular
        ? "1. Confirm the final truth-cell set. 2. For each digit, compute a strict minimum cover that may mix rows, columns and boxes. 3. Sum the per-digit minimum-cover sizes and verify Logical LinkCount=CellCount. 4. If equivalent covers exist, distinguish the logical link count of each cover from the UnionLinkCount union. 5. Keep only eliminations valid across every equivalent cover."
        : (advanced
          ? "1. Confirm the core. 2. Compare row/column/box cover cost for every digit. 3. Enumerate row-side/column-side choices for floating digits. 4. Absorb forced attachment cells. 5. Verify CellCount=LinkCount and apply outside/cannibal eliminations."
          : "1. Confirm the core. 2. Count occupied rows, columns and boxes for every digit. 3. Select the minimum cover. 4. Verify total minimum links equal core cells. 5. Apply outside and duplicate-cover eliminations."),
      irregular
        ? "Display truth cells, each digit's actual minimum covers, Logical LinkCount, UnionLinkCount/cover family and eliminations separately; never compute rank from the union count."
        : "Display Core, Attachment, actual Links, PermutableDigits and eliminations separately; do not reduce the step to a generic rank-0 sentence.",
      `${branchLabel}. Exact, Advanced/Attachment, and Irregular are distinct search paths; describe only the branch and roles actually emitted.`,
    ];
  }
  if (kind === "BruteForce") {
    return zh ? [
      model.structure, model.basis, model.deduction,
      "① 完整求解并验证唯一终解；② 选择候选数较少的未解格；③ 从已验证终解读取该格数字；④ 作为末端兜底落数。",
      "只高亮所选格和最终落数；不要伪造枢轴、链、数组或局部矛盾角色。",
      "BruteForce是已验证终解落数，不是技巧训练项，也不是把一次猜测包装成逻辑步骤。",
    ] : [
      model.structure, model.basis, model.deduction,
      "1. Solve and verify the complete unique solution. 2. Select an unsolved cell with a small candidate count. 3. Read its digit from the verified solution. 4. Place it as the terminal fallback.",
      "Highlight only the selected cell and solved placement; do not invent pivots, chains, subsets or local contradiction roles.",
      "BruteForce is a verified-solution placement, not a training technique and not a guess disguised as logic.",
    ];
  }
  const branch = firstGroupTail(step, "Branch") || String(step?.title || kind);
  const branchLabel = localizedProofMeta(branch, locale);
  const checks = groupsMatching(step, /^check$/i).map(g => exocetCheckLabel(String(g?.tail || ""), locale));
  const weak = kind === "WeakExocet";
  const yLock = firstGroupTail(step, "YLock");
  const weakActualZh = [yLock ? `Y区锁定${yLock}` : "", ...checks].filter(Boolean).join("、") || "当前弱结构约束";
  const weakActualEn = [yLock ? `Y-area lock ${yLock}` : "", ...checks].filter(Boolean).join(", ") || "the current weak-structure constraints";
  const hasMirrorCheck = checks.some(check => /M格检查|M-cell check/i.test(check));
  return zh ? [
    model.structure, model.basis, model.deduction,
    "① 确认Base及基准候选；② 核对Targets和Cross/S-cells角色；③ 只逐项执行本步实际列出的Check；④ 将每个Check对应的删数与高亮核对；⑤ 应用结论。",
    "Base、Target组、Cross/S-cells、Locked Non-base、Mirror、True Base等必须按实际角色分层显示；不能仅按JE/SE/WE标题统一着色。",
    `${branchLabel}；实际检查=${checks.join("、") || "无额外Check"}。${weak ? `本步只使用${weakActualZh}；未输出的检查不得补入证明。${hasMirrorCheck ? " Mirror Check是M格检查，不是T邻规则。" : ""}` : "没有输出的Exocet子规则不得补入证明。"}`,
  ] : [
    model.structure, model.basis, model.deduction,
    "1. Confirm the base and base candidates. 2. Verify target and cross/S-cell roles. 3. Apply only checks actually listed by this step. 4. Match every check to its eliminations and highlights. 5. Apply the conclusion.",
    "Display Base, target groups, cross/S-cells, locked non-base, Mirror, True Base and other actual roles separately; do not colour every JE/SE/WE the same way.",
    `${branchLabel}; actual checks=${checks.join(", ") || "none"}. ${weak ? `This step uses only ${weakActualEn}; do not add checks that were not emitted.${hasMirrorCheck ? " Mirror Check is the M-cell check, not the Adjacent-Target rule." : ""}` : "Do not add Exocet sub-rules that were not emitted."}`,
  ];
}

export function buildAuditedStepExplanationPayload(step = {}, locale = "zh") {
  const kind = String(step?.kind || "");
  if (!UNIQUENESS.has(kind) && !AUDITED_FOUNDATIONS.has(kind) && !AUDITED_PHASE3.has(kind) && !AUDITED_PHASE4.has(kind) && !AUDITED_PHASE5.has(kind) && !AUDITED_PHASE6.has(kind) && !AUDITED_PHASE7.has(kind)) return null;
  const model = buildStepExplanationModel(step, locale);
  const byKey = Object.fromEntries(model.sections.map((section) => [section.key, section.text]));
  const guide = AUDITED_FOUNDATIONS.has(kind)
    ? buildAuditedFoundationGuide(step, locale)
    : (AUDITED_PHASE3.has(kind) ? buildAuditedPhase3Guide(step, locale)
      : (AUDITED_PHASE4.has(kind) ? buildAuditedPhase4Guide(step, locale)
        : (AUDITED_PHASE5.has(kind) ? buildAuditedPhase5Guide(step, locale)
          : (AUDITED_PHASE6.has(kind) ? buildAuditedPhase6Guide(step, locale)
            : (AUDITED_PHASE7.has(kind) ? buildAuditedPhase7Guide(step, locale) : null)))));
  return {
    structure: guide?.[0] || byKey.structure || "",
    principle: guide?.[1] || byKey.basis || "",
    deduction: guide?.[2] || byKey.deduction || "",
    conclusion: byKey.conclusion || "",
    eureka: byKey.eureka || "",
    checks: guide?.[5] ? [guide[5], ...model.checks] : model.checks,
    meta: model.meta,
  };
}
