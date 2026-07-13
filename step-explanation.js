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
  "Fireworks", "BivalueOddagon", "TripletOddagon", "DeathBlossom", "BlossomLoop",
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

function cellNames(cells, max = 14) {
  const names = unique(list(cells).map(cellName));
  if (names.length <= max) return names.join("、");
  return `${names.slice(0, max).join("、")}等${names.length}格`;
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
  const digitBearing = /^(alsa|alsb|alsc|ahsa|ahsb|ahsc|rcc|rccx|rccy|x|z|stronglink|set|petal|fin|fins|regfin|regfins|edofin|edofins|eri|link|urbody|arbody|ulbody|xrbody|guardians?|guardiansa|guardiansb|winga|wingb|wxyzpivot|wxyzwings|bugplusonecell|forcedcandidate|exitcell|exitcells|conjugateexit|confineddeadly|hiddenlock|nakedsubset|hiddensubset|solvedcorners|roof|targetcorner|self|target|targets|cannibaltargets|lockedcandidates|fishdigit|sourcedigits|fishbody|brokenloop|roofs|linkedside|rowstrong|columnstrong|rowouter|columnouter|rowinner|columninner|outerendpoints|connector|endpoints|linktoa|linktob|deletedigit|pivot|sharedz|connectorz|erbody|erintersection|outsideendpoint|pair|erisupport|activeeri|oppositeeri|remotewing|wxyzset|activesector|z|samehousercc|oddagonbody|oddagona|oddagonb|sharedexit|lockedsubset|tripletbody|fireworkarms|fireworkset|fireworka|fireworkb|sharedarms|erconnector|bivaluebridge|pit|alppivot|bivaluepair|basecells|stem|victim|petals|start|end)$/i.test(headKey);
  const digits = digitBearing ? unique((tail.match(/[1-9]/g) || []).map(Number)).sort((a, b) => a - b) : [];
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

function roleSummary(group, locale, fallback) {
  if (!group) return "";
  const lang = localeKey(locale);
  const cells = cellNames(group.cells);
  const digits = digitText(group.digits);
  const houses = group.houses.join("、");
  const details = [];
  if (cells) details.push(cells);
  if (digits) details.push(lang === "zh" ? `候选数${digits}` : `digits ${digits}`);
  if (houses) details.push(houses);
  return `${fallback}${details.length ? (lang === "zh" ? `为${details.join("，")}` : `: ${details.join(", ")}`) : ""}`;
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
  const cells = cellNames(role?.cells || structureCells(step)) || (zh ? "高亮单元格" : "the highlighted cells");
  const digits = digitText(role?.digits) || primaryDigits(step) || (zh ? "相关数字" : "the relevant digits");
  const house = firstGroup(step, /^house$/i)?.houses?.[0] || houseLabel(step, locale);
  const count = role?.cells?.length || list(structureCells(step)).length || digitText(String(digits).match(/[1-9]/g) || []).length;
  if (hidden) {
    return {
      structure: zh ? `在${house}中，${count}个数字${digits}的全部候选位置合起来正好是${count}格：${cells}。` : `In ${house}, all positions for the ${count} digits ${digits} are confined to exactly ${count} cells: ${cells}.`,
      basis: zh ? `这${count}个数字必须各出现一次，因此这${count}格全部被数字${digits}占用。` : `Those ${count} digits must each occur once, so they occupy all ${count} cells.`,
      deduction: zh ? `这些格中的其他候选不属于隐性数组，均可删除。` : `All other candidates in those cells are outside the hidden subset and can be removed.`,
    };
  }
  return {
    structure: zh ? `在${house}中，${count}格${cells}的候选并集恰好只有${count}个数字${digits}。` : `In ${house}, the candidate union of the ${count} cells ${cells} contains exactly the ${count} digits ${digits}.`,
    basis: zh ? `这${count}格必须由这${count}个数字一一填满，数字${digits}不会落到${house}的其他格。` : `These ${count} cells must be filled by those ${count} digits, leaving none of them for other cells in ${house}.`,
    deduction: zh ? `${house}其他格中的数字${digits}可以删除。` : `Digits ${digits} can be eliminated from the other cells in ${house}.`,
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
  const title = String(step?.title || "");
  const sashimi = /^sashimi\b/i.test(title);
  const structure = zh
    ? `数字${digit}以${bases}为基准区域、${covers}为覆盖区域${bodyCells.length ? `；鱼身候选为${bodyCells.join("、")}` : ""}${finCells.length ? `；鳍为${finCells.join("、")}` : ""}。`
    : `Digit ${digit} uses ${bases} as base sets and ${covers} as cover sets${bodyCells.length ? `; body candidates: ${bodyCells.join(", ")}` : ""}${finCells.length ? `; fins: ${finCells.join(", ")}` : ""}.`;
  if (mode === "finnedFish") {
    return {
      structure: zh ? `${sashimi ? "Sashimi" : "有鳍"}鱼：${structure}` : `${sashimi ? "Sashimi" : "Finned"} fish: ${structure}`,
      basis: zh
        ? `所有鳍位于同一宫。若鳍全假，剩余结构按普通${title.replace(/^Sashimi |^Finned /i, "")}覆盖删数；若任一鳍为真，同宫内的目标候选${digit}被该鳍直接排除。`
        : `All fins lie in one box. If every fin is false, the remaining pattern acts as a normal ${title.replace(/^Sashimi |^Finned /i, "")}; if any fin is true, it directly excludes target ${digit} candidates in that box.`,
      deduction: zh
        ? `${sashimi ? "去掉鳍后至少一个基准区域的鱼身不足两个候选，这正是Sashimi分支；但上述真假两案仍都删除目标。" : "普通鱼案和鳍为真案都排除同一目标，所以该目标可删。"}`
        : `${sashimi ? "After removing the fins, at least one base has fewer than two body candidates, which is the Sashimi branch; both cases still eliminate the target." : "Both the normal-fish case and the true-fin case eliminate the same targets."}`,
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

function roleCellText(step, pattern) {
  const role = uniquenessRole(step, pattern);
  return role ? cellNames(role.cells) : "";
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
  const title = String(step?.title || "").toLowerCase();
  if (/external test|aur \+/.test(title)) {
    const pair = firstPairFromDescription(step?.description);
    if (pair.length === 2) return digitText(pair);
  }
  return digitText(list(step?.candidates));
}

function firstCellsText(step, count = 4) {
  return cellNames(structureCells(step).slice(0, count));
}

function uniquenessExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const kind = String(step?.kind || "");
  const title = String(step?.title || kind);
  const description = String(step?.description || "");
  const key = `${kind} ${title} ${description}`.toLowerCase();
  const cells = cellNames(structureCells(step));
  const deadly = deadlyDigitsForStep(step);
  const conclusion = conclusionText(step, locale);
  const therefore = zh ? `因此：${conclusion}` : `Therefore: ${conclusion}`;

  if (kind === "GSP") {
    const symmetry = uniquenessRole(step, /^symmetry$/i)?.tail || "";
    const selfDigits = roleDigitText(step, /^self$/i);
    const selfCells = roleCellText(step, /^self$/i);
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
    const extraCell = roleCellText(step, /^bugplusonecell$/i) || cells || (zh ? "唯一三值格" : "the only trivalue cell");
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
    if (/type 1/.test(key)) deduction = zh
      ? `全部守护候选集中在同一格，因此该格必须取守护候选之一，伪双值对可以删除。${therefore}`
      : `All guardians lie in one cell, so that cell must take a guardian and its pseudo-bivalue pair can be removed. ${therefore}`;
    else if (/type 2/.test(key)) deduction = zh
      ? `所有守护候选是同一数字且至少一真；同时看见全部守护位置的该数字可以删除。${therefore}`
      : `All guardians use one digit and at least one is true; the digit can be removed from any cell seeing every guardian. ${therefore}`;
    else if (/type 3/.test(key)) deduction = zh
      ? `守护候选与同一区域的裸数组共同占满容量，数组外的相同候选会挤占必要名额。${therefore}`
      : `The guardians and a naked subset fill the house capacity; matching candidates outside the set consume a required slot. ${therefore}`;
    else if (/type 4/.test(key)) deduction = zh
      ? `守护格中的一个伪双值数字形成共轭对；结合“至少一个守护为真”，可以排除另一伪双值数字。${therefore}`
      : `One pseudo-bivalue digit is conjugate across the guardian cells; combined with the guardian disjunction, the other pseudo-bivalue digit is eliminated. ${therefore}`;
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
  const body = roleCellText(step, /^(urbody|arbody|ulbody|xrbody)$/i)
    || ((kind === "UniqueRectangle" || isAR) ? firstCellsText(step, 4) : cells);
  const pattern = zh ? (isAR ? "可避免矩形" : isUL ? "唯一环" : isXR ? "扩展矩形" : "唯一矩形")
    : (isAR ? "Avoidable Rectangle" : isUL ? "Unique Loop" : isXR ? "Extended Rectangle" : "Unique Rectangle");
  let structure = zh
    ? `${pattern}主体位于${body || "高亮区域"}${deadly ? `，致命数字组为${deadly}` : ""}。`
    : `The ${pattern} body is in ${body || "the highlighted region"}${deadly ? `, with deadly digit set ${deadly}` : ""}.`;
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

  if (/external test \+ xy-wing/.test(key)) {
    const ga = roleCellText(step, /^guardiansa$/i);
    const gb = roleCellText(step, /^guardiansb$/i);
    const wa = roleCellText(step, /^winga$/i) || structureCells(step).slice(-2, -1).map(cellName).join("、");
    const wb = roleCellText(step, /^wingb$/i) || structureCells(step).slice(-1).map(cellName).join("、");
    const da = roleDigitText(step, /^winga$/i);
    const db = roleDigitText(step, /^wingb$/i);
    structure += zh
      ? ` 外部守护候选分为${ga || "第一组"}和${gb || "第二组"}；双值翼格为${wa || "第一翼"}${da ? `{${da}}` : ""}与${wb || "第二翼"}${db ? `{${db}}` : ""}。`
      : ` External guardians split into ${ga || "group A"} and ${gb || "group B"}; bivalue wings: ${wa || "wing A"}${da ? `{${da}}` : ""} and ${wb || "wing B"}${db ? `{${db}}` : ""}.`;
    deduction = zh
      ? `外部守护候选至少一真。第一组任一守护为真会迫使第一翼取共同数字${targetDigit}；第二组任一守护为真会迫使第二翼取${targetDigit}。所以两翼中的${targetDigit}至少一真，同时看见两翼的目标${targetDigit}可删。${therefore}`
      : `At least one external guardian is true. A guardian in group A forces wing A to shared digit ${targetDigit}; a guardian in group B forces wing B to ${targetDigit}. Thus at least one wing contains ${targetDigit}, and a target seeing both wings can be removed. ${therefore}`;
    extraChecks.push(zh
      ? "致命数字组与删数数字必须分开：删数数字是两翼共同数字，不是唯一矩形的致命数字。"
      : "Keep the deadly pair separate from the eliminated digit: the target is the wings' shared digit, not a deadly UR digit.");
    extraChecks.push(zh
      ? "核对每个翼格看见对应数字的全部守护候选，且每个删数目标同时看见两个翼格。"
      : "Verify each wing sees every guardian of its associated deadly digit and every target sees both wings.");
  } else if (/external test 1/.test(key)) deduction = zh
    ? `矩形外只有一个守护格；若该格不取致命数字之一，全部外部破坏点消失，主体成为致命矩形。因此该格必须保留致命数字，其他候选可删。${therefore}`
    : `There is only one external guardian cell. If it took no deadly digit, every external escape would disappear and the body would become deadly; therefore it must keep a deadly digit and its other candidates are removed. ${therefore}`;
  else if (/external test 2\/4/.test(key)) deduction = zh
    ? `一个致命数字没有外部守护位置，所以另一数字的守护候选中至少一个必须为真；同时看见全部守护位置的该数字可以删除。${therefore}`
    : `One deadly digit has no external guardian, so at least one guardian of the other digit is true; that digit can be removed from any cell seeing all guardians. ${therefore}`;
  else if (/external test 3h/.test(key)) deduction = zh
    ? `外部守护候选与同一区域内的隐性数组共同限定落点；数组格内的其他候选会挤占必须留给守护数字和隐性数组数字的容量。${therefore}`
    : `The external guardians and a hidden subset in one house jointly restrict positions; other candidates in those cells consume capacity required by the guardian and hidden-subset digits. ${therefore}`;
  else if (/external test 3/.test(key)) deduction = zh
    ? `外部守护候选与同一区域内的裸数组共同构成满容量集合；集合外的同数字候选会挤占必要名额。${therefore}`
    : `The external guardians and a naked subset in one house form a full-capacity set; matching digits outside it consume a required slot. ${therefore}`;
  else if (/aur \+ (xy|xyz)-wing/.test(key)) {
    deduction = zh
      ? `屋顶额外候选至少一真，否则四角退化为致命矩形。Wing节点把所有额外候选分支导向共同数字${targetDigit}，所以同时看见全部承接位置的${targetDigit}可删。${therefore}`
      : `At least one roof extra is true; otherwise the four corners collapse to the deadly rectangle. The Wing nodes route every extra-candidate branch to shared digit ${targetDigit}, so a target seeing every carrier can be removed. ${therefore}`;
    extraChecks.push(zh ? "本分支step.candidates是Wing共同删数数字，不是致命数字组。" : "In this branch step.candidates is the Wing target digit, not the deadly pair.");
  } else if (/aur \+ wxyz-(wing|ring)/.test(key)) {
    deduction = zh
      ? `屋顶额外候选与三个外部节点组成WXYZ待定数组。若所有额外候选失效，UR主体致命；若任一额外候选成立，WXYZ结构仍把目标数字锁在结构内。Ring分支还对四个结构数字形成闭环删数。${therefore}`
      : `The roof extras and three external nodes form a WXYZ almost-locked set. If every extra is false the UR body is deadly; if one is true the WXYZ structure still locks the target digit inside. The Ring branch also closes all four digits into a loop. ${therefore}`;
    extraChecks.push(zh ? "本分支step.candidates是WXYZ结构数字并集，不能称为致命数字组。" : "Here step.candidates is the WXYZ digit union and must not be called the deadly set.");
  } else if (isAR && /type 1/.test(key)) deduction = zh
    ? `三个已填非提示角已经确定致命数字对；第四角若取其中任一致命数字，就能交换四角得到另一解，因此这些候选可删。${therefore}`
    : `Three placed non-given corners fix the deadly pair. If the fourth took either deadly digit, the corners could swap into a second solution, so those candidates are removed. ${therefore}`;
  else if (isAR && /type 2/.test(key)) deduction = zh
    ? `两个未解屋顶角共享同一额外数字。为避免两角都只剩致命数字，该额外数字至少一真；同时看见两角的同数字候选可删。${therefore}`
    : `The two unsolved roofs share one extra digit. To prevent both roofs containing only the deadly pair, that digit is true in at least one roof and can be removed from common peers. ${therefore}`;
  else if (/type 1/.test(key)) deduction = zh
    ? `只有一个破坏格含额外候选；若它取致命数字，整个主体只剩致命数字组并产生第二完成方式，所以该格中的致命候选可删。${therefore}`
    : `Only one escape cell has extras. If it took a deadly digit, the body would contain only the deadly set and admit a second completion, so its deadly candidates are removed. ${therefore}`;
  else if (/type (2|5)/.test(key)) deduction = zh
    ? `两个破坏格共享同一额外数字；若该数字两处都为假，主体退化为致命结构，所以它至少一真，并可从共同可见格删除。${therefore}`
    : `Two escape cells share one extra digit. If it were false in both, the body would be deadly, so it is true in at least one and can be removed from common peers. ${therefore}`;
  else if (/type 3/.test(key)) deduction = zh
    ? `破坏格的额外候选与同一区域内的裸数组共同占满候选容量；数组外的同数字候选会挤占必要名额。${therefore}`
    : `The escape-cell extras and a naked subset in one house fill the candidate capacity; matching candidates outside consume a required slot. ${therefore}`;
  else if (/type 4/.test(key)) deduction = zh
    ? `破坏格中的一个致命数字形成共轭对并至少一真，因此另一致命数字不能在相关破坏格中形成致命分配。${therefore}`
    : `One deadly digit is conjugate across the escape cells and is true in at least one, so the other deadly digit cannot form the deadly assignment there. ${therefore}`;
  else if (/type 6/.test(key)) deduction = zh
    ? `一个致命数字在相关两行、两列的矩形外没有候选，落点被限制在四角；为避免交替致命分配，该数字可从两个破坏角删除。${therefore}`
    : `One deadly digit has no candidate outside the rectangle in the relevant rows and columns, so its positions are confined to the corners; it is removed from the escape corners to avoid the deadly alternating assignment. ${therefore}`;
  else if (/type 7/.test(key)) deduction = zh
    ? `四角及外部强链连接致命数字端点。目标若成立，会关闭所有破坏出口并完成致命环；删数按说明中的强链或S-Ring证明成立。${therefore}`
    : `The corners and external strong links connect the deadly endpoints. If the target were true every escape would close and complete the deadly loop; eliminations follow from the recorded strong-link or S-Ring proof. ${therefore}`;
  else if (/hidden rectangle/.test(key)) deduction = zh
    ? `行、列共轭关系把一个致命数字隐藏锁定在对角端点；保留目标会让另一致命数字完成可交换矩形，因此可删。${therefore}`
    : `Row and column conjugacies hidden-lock one deadly digit at opposite endpoints; keeping the target lets the other complete the swappable rectangle, so it is removed. ${therefore}`;
  else if (/uniqueness test/.test(key)) {
    const branches = groupsMatching(step, /^branch$/i).map((group) => group.tail).filter(Boolean);
    if (branches.length) structure += zh ? ` 已合并分支：${branches.join("、")}。` : ` Merged branches: ${branches.join(", ")}.`;
    deduction = zh
      ? `同一主体同时满足多个唯一性分支；后端合并了它们的不同删数，每项分别由对应Type阻止致命结构。${therefore}`
      : `The same body satisfies multiple uniqueness branches and the backend merged their distinct eliminations; each action follows from its corresponding Type. ${therefore}`;
  }
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
  const b = firstGroup(step, /^alsb$|^ahsb$/i);
  const c = firstGroup(step, /^alsc$|^ahsc$/i);
  const rcc = firstGroup(step, /^rcc$|^rccx$|^rccy$/i);
  const link = firstGroup(step, /^link$|^stronglink$/i);
  const roles = [
    roleSummary(a, locale, zh ? "待定数组A" : "ALS A"),
    roleSummary(b, locale, zh ? "待定数组B" : "ALS B"),
    roleSummary(c, locale, zh ? "待定数组C" : "ALS C"),
  ].filter(Boolean);
  const structure = roles.length
    ? sentenceParts(roles, locale) + (zh ? "。" : ".")
    : (zh ? `高亮单元格${cellNames(structureCells(step)) ? `（${cellNames(structureCells(step))}）` : ""}构成待定数组结构。` : `The highlighted cells${cellNames(structureCells(step)) ? ` (${cellNames(structureCells(step))})` : ""} form an almost-locked-set structure.`);
  if (kind === "ALSXZ" || kind === "AHSXZ") {
    const x = digitText(rcc?.digits || []);
    const z = digitText(link?.digits || candidateValues(step?.eliminations?.[0]));
    return {
      structure: `${structure}${x ? (zh ? ` 严格共享候选数 X=${x}。` : ` Restricted common candidate X=${x}.`) : ""}${z ? (zh ? ` 共同删数候选 Z=${z}。` : ` Common elimination digit Z=${z}.`) : ""}`,
      basis: zh ? "一个待定数组若失去某个候选数，就会变成锁定集。严格共享候选数不能同时在两个数组中为真，也不能让两个数组同时失去它。" : "If an ALS loses one candidate, it becomes a locked set. A restricted common candidate cannot be true in both ALSes and cannot be absent from both.",
      deduction: zh ? "因此两个数组中至少有一侧必须包含共同删数候选 Z；同时看见两侧全部 Z 位置的外部 Z 候选可以删除。" : "Therefore the common elimination digit Z is true in at least one ALS; an external Z candidate that sees all relevant Z positions in both ALSes can be removed.",
    };
  }
  if (kind === "ALSXYWing" || kind === "AHSXYWing") {
    return {
      structure,
      basis: zh ? "三个待定数组按 A—B—C 相连，B 分别通过两个严格共享候选数连接 A 和 C。" : "Three almost-locked sets form A—B—C, with B connected to A and C by two restricted common candidates.",
      deduction: zh ? "无论中间数组 B 怎样完成，A 或 C 中至少一侧会承担共同删数候选，因此同时看见两端该候选的外部位置可以删除。" : "Whatever assignment completes B, the common elimination digit is true in A or C, so an external candidate that sees both ends can be removed.",
    };
  }
  if (kind === "ALSWWing" || kind === "AHSWWing") {
    return {
      structure: `${structure}${link ? ` ${roleSummary(link, locale, zh ? "外部强关系" : "external strong link")}。` : ""}`,
      basis: zh ? "外部强关系保证连接数字的两个端点至少有一个为真，从而迫使两个待定数组中至少一侧承担共同删数候选。" : "The external strong link guarantees one endpoint is true, forcing at least one ALS to contain the common elimination digit.",
      deduction: zh ? "同时看见两个数组中共同删数候选全部位置的外部候选可以删除。" : "An external candidate that sees every relevant occurrence in both ALSes can be removed.",
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
    basis: zh ? "待定数组由 N 个单元格和 N+1 个候选数组成；少掉任意一个候选数后，其余候选会被锁定。" : "An ALS contains N cells and N+1 candidates; removing any one candidate locks the remaining candidates into the set.",
    deduction: zh ? "本步利用数组之间的共享候选、区域交叉或外部强关系，把所有可能都导向同一结论。具体关系以分组和原始证明为准。" : "This step uses shared candidates, house intersections or an external strong link so that every case yields the same conclusion. See the groups and backend proof for the exact relation.",
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
    const groupedDynamic = firstGroupTail(step, "Grouped") === "true" || /grouped/i.test(title);
    const source = firstGroup(step, /^source$/i);
    const conclusionGroup = firstGroup(step, /^conclusion$/i);
    const modeLower = mode.toLowerCase();
    return {
      structure: zh
        ? `${groupedDynamic ? "分组动态链" : "动态链"}：源候选${source ? `（${roleSummary(source, locale, "源") }）` : ""}的ON/OFF状态继续传播，共记录${branches.length || "多条"}实际网络分支；模式=${mode || "Dynamic"}${conclusionGroup ? `；结论=${roleSummary(conclusionGroup, locale, "结论")}` : ""}。`
        : `${groupedDynamic ? "Grouped Dynamic Chain" : "Dynamic Chain"}: the source candidate${source ? ` (${roleSummary(source, locale, "source")})` : ""} is propagated from its ON/OFF states through ${branches.length || "multiple"} recorded network branches; mode=${mode || "Dynamic"}${conclusionGroup ? `; conclusion=${roleSummary(conclusionGroup, locale, "conclusion")}` : ""}.`,
      basis: modeLower.includes("contradiction")
        ? (zh ? "某一源状态同时推出同一候选为ON和OFF，因此该源状态不可能；否定源ON就删去源候选，否定源OFF就确定源候选。" : "One source state derives the same candidate both ON and OFF, so that source state is impossible. Refuting source-ON eliminates the source candidate; refuting source-OFF places it.")
        : (zh ? "源候选ON与OFF两种完备状态都推出同一出数或删数，因此该结论与源候选真假无关。" : "The complete source-ON and source-OFF cases both derive the same placement or elimination, so the conclusion is independent of the source candidate's truth value."),
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
  if (proofShape) structureParts.push(zh ? `证明形态：${proofShape}` : `proof shape: ${proofShape}`);
  if (whipLength) structureParts.push(zh ? `Whip长度：${whipLength}` : `Whip length: ${whipLength}`);
  if (braidRank) structureParts.push(zh ? `Braid秩/长度：${braidRank}` : `Braid rank/length: ${braidRank}`);
  if (proofBranchCount) structureParts.push(zh ? `证明分支数：${proofBranchCount}` : `proof branches: ${proofBranchCount}`);
  if (terminal) structureParts.push(zh ? `终止条件：${terminal}` : `terminal condition: ${terminal}`);
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
    basis = `${patternMeaning}${grouped ? (zh ? "；其中至少一个位置端为组节点，组内候选整体充当一个逻辑端点。" : "; at least one location endpoint is grouped and acts as one logical endpoint.") : "。"}${isRing ? (zh ? "链尾还能以弱关系接回链头，所以是Ring。" : " The tail also weakly reconnects to the head, making a Ring.") : (zh ? "开放链的两个外端形成至少一真的端点推论。" : " The open endpoints form an at-least-one-true inference.")}`;
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
    deduction = zh ? "开放链把一个端点为假的假设传递为另一端点为真。两个不同数字端点在同一格或同一区域竞争时，后端按端点交换关系删除会破坏该推论的候选。" : "The open chain propagates falsity at one endpoint to truth at the other. When different-digit endpoints compete in the same cell or region, the backend removes endpoint candidates that would break this swap inference.";
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
        ? `Domino/SK Loop由${segmentCount}个分组链接段交替闭合${body ? `；主体=${roleSummary(body, locale, "主体")}` : ""}${cellCount ? `；${cellCount}个主体格Truth` : ""}${linkSlotCount ? `，${linkSlotCount}个数字-house链接名额` : ""}${links.length ? `；8段链接=${links.join("、")}` : ""}。`
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
    const core = firstGroup(step, /^core$/i);
    const attachment = firstGroup(step, /^attachment$/i);
    const cellCount = firstGroupTail(step, "CellCount");
    const linkCount = firstGroupTail(step, "LinkCount");
    const permutable = firstGroupTail(step, "PermutableDigits");
    const links = groupsMatching(step, /^link:/i).map(g => String(g?.label || "").replace(/^Link:/i, ""));
    const advanced = /advanced/i.test(branch);
    return {
      structure: zh
        ? `${branch}：${core ? roleSummary(core, locale, "核心") : "核心由高亮给出"}${attachment ? `；${roleSummary(attachment, locale, "附加格")}` : ""}${cellCount ? `；${cellCount}个格名额` : ""}${linkCount ? `、${linkCount}个链接名额` : ""}${links.length ? `；实际链接=${links.join("、")}` : ""}。`
        : `${branch}: ${core ? roleSummary(core, locale, "core") : "the core is highlighted"}${attachment ? `; ${roleSummary(attachment, locale, "attachments")}` : ""}${cellCount ? `; ${cellCount} cell slots` : ""}${linkCount ? ` and ${linkCount} link slots` : ""}${links.length ? `; actual links=${links.join(", ")}` : ""}.`,
      basis: zh
        ? (advanced
          ? "高级MSLS为每个数字选择最低成本的行、列或宫覆盖；浮动数字枚举行侧/列侧分配，并可吸收被链接强制纳入的Attachment。最终格名额与链接名额相等。"
          : "精确MSLS比较每个数字在结构中占用的行、列、宫数量，选取最小覆盖作为Link；最小Link总数恰好等于结构格数。")
        : (advanced
          ? "Advanced MSLS selects the cheapest row, column, or box cover for each digit, enumerates row/column choices for floating digits, and may absorb forced attachment cells. Final cell and link counts are equal."
          : "Exact MSLS compares the occupied rows, columns, and boxes for each digit and uses a minimum cover; the total minimum link count equals the number of structure cells."),
      deduction: zh
        ? `${permutable ? `数字${permutable}可在等价最小覆盖之间置换，但容量不变。` : ""}结构外候选会抢占选定Link容量；结构内被多个Link重复覆盖的候选形成自噬超额，均可删除。`
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
  if (key === "z zone check") return zh ? "Z区检查" : "Z-zone check";
  if (key === "w zone check") return zh ? "W区检查" : "W-zone check";
  if (key === "mirror check") return zh ? "M格检查（Mirror Check）" : "M-cell check (Mirror Check)";
  if (key.includes("adjacent target")) return zh ? "T邻规则（Adjacent Target）" : "Adjacent-Target rule";
  return text;
}

function exocetExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const branch = firstGroupTail(step, "Branch") || String(step?.title || step?.kind || "Exocet");
  const baseDigits = firstGroupTail(step, "BaseCandidates");
  const missingDigit = firstGroupTail(step, "MissingBaseDigit");
  const rawChecks = groupsMatching(step, /^check$/i).map(g => String(g?.tail || ""));
  const checks = rawChecks.map(check => exocetCheckLabel(check, locale));
  const base = firstGroup(step, /^base$/i);
  const baseA = firstGroup(step, /^base a$/i);
  const baseB = firstGroup(step, /^base b$/i);
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
  targetGroups.forEach((g, i) => roles.push(roleSummary(g, locale, zh ? `目标组${targetGroups.length > 1 ? i + 1 : ""}` : `Target group${targetGroups.length > 1 ? ` ${i + 1}` : ""}`)));
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
        ? (zh ? "Senior Exocet允许多格Target与调整后的Cross-Line/S-cell集合。Target-line AHS、Locked Non-base、X-Rule、Mirror、Incompatible Base和Potential Target Cover House是独立检查。" : "Senior Exocet permits multi-cell targets and an adjusted cross-line/S-cell set. Target-line AHS, locked non-base, X-Rule, Mirror, incompatible-base, and potential-target-cover-house tests are independent checks.")
        : (zh ? "Junior Exocet要求两个Base真数字分别由两侧Target承接，Cross/S-cells提供固定配额。Target Check、X-Rule、Mirror、Locked Member、True Base和JEPOM只在实际触发时生效。" : "Junior Exocet requires the two true base digits to be carried by the two target sides, with fixed quota supplied by the cross/S-cells. Target Check, X-Rule, Mirror, Locked Member, True Base, and JEPOM apply only when actually triggered."),
    deduction: almost
      ? (zh ? `Almost JE4把两套JE通过S-cell配额联结；缺失数字${missingDigit || ""}若同时进入两套Base会触发记录的完整矛盾分支，因此得到本步结论。` : `Almost JE4 links two JE patterns through the S-cell quota. If the missing digit ${missingDigit || ""} enters both base pairs, the recorded complete contradiction branch is triggered, yielding the step conclusion.`)
      : doubleJe
        ? (zh ? "两套JE分别强制各自Base真数由对应Targets承接；共同可见、非S格True Base和共享Cover House检查再合并两套约束。" : "Each JE forces its own base truths into its targets; common-visibility, true-base-in-non-S, and shared-cover-house checks combine the two patterns.")
      : weak
        ? (zh
          ? `只合并本步实际触发的${[yLock ? "Y区锁定" : "", hasTargetCheck ? "T格检查" : "", hasZCheck ? "Z区检查" : "", hasWCheck ? "W区检查" : "", hasMCheck ? "M格检查" : "", hasAdjacentTarget ? "T邻规则" : ""].filter(Boolean).join("、") || "弱Exocet约束"}，得到本步删数。`
          : `Combine only the ${[yLock ? "Y-area lock" : "", hasTargetCheck ? "T-cell check" : "", hasZCheck ? "Z-zone check" : "", hasWCheck ? "W-zone check" : "", hasMCheck ? "M-cell check" : "", hasAdjacentTarget ? "Adjacent-Target rule" : ""].filter(Boolean).join(", ") || "Weak Exocet constraints actually emitted"} to obtain the eliminations.`)
        : (zh ? "只逐项应用本步列出的检查：Target Check、X-Rule、Mirror、Locked Member、True Base或JEPOM等各自提供对应删数；没有列出的子规则不能补入证明。" : "Apply only the checks listed by this step. Target Check, X-Rule, Mirror, Locked Member, True Base, JEPOM, and other checks each justify their own eliminations; absent sub-rules must not be added."),
  };
}

function oddagonExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const title = String(step?.title || step?.kind || "Oddagon");
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
  const candidateCount = firstGroupTail(step, "CandidateCount");
  return {
    structure: zh
      ? `${branch}：${cells ? `选择未解格${cells}` : "选择一个未解格"}${candidateCount ? `，该格当前有${candidateCount}个候选` : ""}。`
      : `${branch}: ${cells ? `selects unsolved cell ${cells}` : "selects an unsolved cell"}${candidateCount ? ` with ${candidateCount} current candidates` : ""}.`,
    basis: zh
      ? `完整终解已由全盘搜索验证；本步骤只是从${source}读取该格的正确数字并作为兜底落盘，不把一次猜测包装成局部逻辑。`
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
  if (type === "exocet") checks.push(zh ? "扩展飞鱼只使用原始证明明确给出的删数，不自动套用完整初级飞鱼规则。" : "For Exocet variants, use only deletions explicitly proved by the backend; do not apply the full Junior Exocet rule automatically.");
  if (type === "generic") checks.push(zh ? "由于角色数据不足，本说明只保留可验证信息，不补造具体结构角色。" : "Because role data is incomplete, this explanation preserves only verifiable facts and does not invent roles.");
  checks.push(zh
    ? `核对本步实际结论：出数${conclusions.placements.length}项，删数${conclusions.eliminations.length}项。`
    : `Verify the actual actions: ${conclusions.placements.length} placement(s), ${conclusions.eliminations.length} elimination(s).`);
  return checks;
}

function metaItems(step, locale, type) {
  const zh = localeKey(locale) === "zh";
  const items = [];
  const digits = primaryDigits(step);
  const cells = unique(structureCells(step).map(cellName)).length;
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
  const targetCell = cellNames(targetGroup?.cells, 1) || cellNames(structureCells(step), 1) || (zh ? "目标格" : "the target cell");
  const targetDigit = digitText(targetGroup?.digits) || primaryDigits(step) || (zh ? "目标数字" : "the target digit");
  const sourceHouse = firstGroup(step, /^sourcehouse$/i)?.houses?.[0] || firstGroup(step, /^house$/i)?.houses?.[0] || houseLabel(step, locale);

  if (kind === "FullHouse") {
    return zh ? [
      `${sourceHouse}只剩${targetCell}一个空格，缺少的数字是${targetDigit}。`,
      `行、列、宫都必须恰好包含1到9各一次；其余八格已确定后，最后一格只能补入缺数。`,
      `设${sourceHouse}已出现数字集合为S，则${targetCell}的值属于{1,…,9}\\S。源码只在该差集恰好含一个数字${targetDigit}时返回。`,
      `① 找只剩一个空格的行、列或宫；② 列出已出现的八个数字；③ 找缺数${targetDigit}；④ 填入${targetCell}。`,
      `FB配色只把${targetCell}中的${targetDigit}标为cNormal(1)，并作为出数处理。`,
      `必须是区域内恰好一个未解格，而不是仅仅某个数字只剩一个候选位置；后者属于Hidden Single。`,
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
    const cells = cellNames(locked?.cells || structureCells(step));
    const digit = digitText(locked?.digits) || primaryDigits(step);
    const pointing = /pointing/i.test(branch);
    return zh ? [
      `${pointing ? "Pointing（宫指向行/列）" : "Claiming（行/列认领宫）"}：${sourceHouse}内数字${digit}的全部候选集中在${targetHouse}的交区${cells ? `（${cells}）` : ""}。`,
      `${sourceHouse}必须有一个${digit}为真，而它只能出现在交区；因此${targetHouse}交区外的${digit}不可能为真。`,
      `设交区候选集合为L。规则给出∨L=true；任一${targetHouse}交区外候选t都与L中每个候选互斥，故t⇒¬∨L，与∨L矛盾，所以t=false。`,
      `① 确认分支是${pointing ? "宫→行/列" : "行/列→宫"}；② 找出${sourceHouse}中全部${digit}候选；③ 确认它们都在同一交区；④ 删除${targetHouse}交区外的${digit}。`,
      `交区候选用cNormal(1)，删除候选用cToDel(11)；不能把整个宫或整条线整格涂色代替候选高亮。`,
      `${pointing ? "Pointing的源必须是宫，目标必须是行或列。" : "Claiming的源必须是行或列，目标必须是宫。"} 源区域内不能漏掉任何该数字候选。`,
    ] : [
      `${pointing ? "Pointing (box to row/column)" : "Claiming (row/column to box)"}: every ${digit} candidate in ${sourceHouse} is confined to the intersection with ${targetHouse}${cells ? ` (${cells})` : ""}.`,
      `${sourceHouse} must contain one true ${digit}, and it can occur only in the intersection; therefore ${digit} candidates elsewhere in ${targetHouse} are false.`,
      `Let L be the intersection candidates. We have ∨L=true. Any outside target t conflicts with every member of L, so t⇒¬∨L, contradicting ∨L; hence t=false.`,
      `1. Confirm the ${pointing ? "box→line" : "line→box"} branch. 2. List every ${digit} in ${sourceHouse}. 3. Verify all lie in one intersection. 4. Remove ${digit} from the rest of ${targetHouse}.`,
      `Intersection candidates use cNormal(1); eliminations use cToDel(11). Do not replace candidate highlighting with whole-cell coloring.`,
      `${pointing ? "The source must be a box and the target a row or column." : "The source must be a row or column and the target a box."} No source candidate may be omitted.`,
    ];
  }

  if (NAKED_SUBSETS.has(kind) || HIDDEN_SUBSETS.has(kind)) {
    const hidden = HIDDEN_SUBSETS.has(kind);
    const role = firstGroup(step, hidden ? /^hiddensubset$/i : /^nakedsubset$/i);
    const house = firstGroup(step, /^house$/i)?.houses?.[0] || houseLabel(step, locale);
    const cells = cellNames(role?.cells || structureCells(step));
    const digits = digitText(role?.digits) || primaryDigits(step);
    const n = role?.cells?.length || list(structureCells(step)).length;
    if (hidden) {
      return zh ? [
        `${house}中数字${digits}的所有候选位置合起来恰好是${n}格${cells}，构成Hidden ${n === 2 ? "Pair" : n === 3 ? "Triple" : "Quad"}。`,
        `这${n}个数字必须各在${house}出现一次，而可用位置只有这${n}格，所以这些格全部保留给数字${digits}。`,
        `令D为${n}个数字，P(D)为它们候选位置的并集。源码验证|D|=|P(D)|=${n}且每个d∈D至少出现一次；因此P(D)被D完全占用。`,
        `① 在${house}选${n}个数字；② 合并它们的候选位置；③ 确认并集恰为${n}格；④ 删除这些格中的其他候选。`,
        `数字${digits}在数组格内用cNormal(1)，被删的其他候选用cToDel(11)。`,
        `不能只数格子：所选每个数字都必须至少在这些格中出现一次，而且位置并集必须恰好为${n}格。`,
      ] : [
        `In ${house}, all positions of digits ${digits} are confined to exactly ${n} cells ${cells}, forming a Hidden ${n === 2 ? "Pair" : n === 3 ? "Triple" : "Quad"}.`,
        `The ${n} digits must each occur once in ${house}, and only these ${n} cells are available, so the cells are reserved for them.`,
        `Let D be the selected digits and P(D) their union of positions. The detector verifies |D|=|P(D)|=${n} and every d∈D appears at least once; hence D occupies P(D).`,
        `1. Select ${n} digits in ${house}. 2. Union their positions. 3. Confirm the union has ${n} cells. 4. Remove other candidates from those cells.`,
        `Subset digits use cNormal(1); removed extra candidates use cToDel(11).`,
        `Every selected digit must appear at least once, and the position union must contain exactly ${n} cells.`,
      ];
    }
    return zh ? [
      `${house}中的${n}格${cells}，候选并集恰好是${n}个数字${digits}，构成Naked ${n === 2 ? "Pair" : n === 3 ? "Triple" : "Quad"}。`,
      `这${n}格最终必须各填一个数字，而它们合计只有${n}种可能，因此数字${digits}全部被锁在这些格中。`,
      `令C为所选${n}格，U=⋃₍c∈C₎Cand(c)。源码验证|C|=|U|=${n}；由容量关系，U不能再占用${house}的其他格。`,
      `① 在${house}选${n}个每格候选数不超过${n}的格；② 求候选并集；③ 确认并集大小为${n}；④ 从其他格删除${digits}。`,
      `数组格中实际存在的数字${digits}用cNormal(1)，区域其他格的删数用cToDel(11)。`,
      `必须按候选并集判断；并非每个数组格都必须含全部${n}个数字。当前步骤只处理所报告的${house}，即使同一结构也锁在另一个区域。`,
    ] : [
      `The ${n} cells ${cells} in ${house} have candidate union ${digits} of size ${n}, forming a Naked ${n === 2 ? "Pair" : n === 3 ? "Triple" : "Quad"}.`,
      `The ${n} cells need ${n} values and collectively allow only those ${n} digits, so the digits are locked into the cells.`,
      `Let C be the selected cells and U=⋃₍c∈C₎Cand(c). The detector verifies |C|=|U|=${n}; by capacity, U cannot also occupy other cells of ${house}.`,
      `1. Select ${n} cells in ${house}, each with at most ${n} candidates. 2. Form their union. 3. Confirm its size is ${n}. 4. Remove ${digits} elsewhere in the house.`,
      `Actual subset candidates use cNormal(1); eliminations elsewhere use cToDel(11).`,
      `Use the union, not an assumption that every cell contains every digit. The step applies to the reported house only, even when the cells share a second house.`,
    ];
  }

  if (NORMAL_FISH.has(kind) || FINNED_FISH.has(kind)) {
    const finned = FINNED_FISH.has(kind);
    const sashimi = /^sashimi\b/i.test(String(step?.title || ""));
    const axes = fishAxes(step);
    const bases = axes.bases.join("、") || (zh ? "基准区域" : "base sets");
    const covers = axes.covers.join("、") || (zh ? "覆盖区域" : "cover sets");
    const body = groupCells(step, /^fishbody$/i).join(zh ? "、" : ", ");
    const fins = groupCells(step, /^fin$/i).join(zh ? "、" : ", ");
    const digit = primaryDigits(step);
    const size = FISH_SIZE[kind] || axes.bases.length;
    const baseName = size === 2 ? "X-Wing" : size === 3 ? "Swordfish" : "Jellyfish";
    if (finned) {
      return zh ? [
        `${sashimi ? "Sashimi " : "Finned "}${baseName}：数字${digit}的基准区域为${bases}，覆盖区域为${covers}${body ? `，鱼身为${body}` : ""}${fins ? `，鳍为${fins}` : ""}。`,
        `源码要求鱼身之外的全部鳍集中在同一宫，删数也位于该宫内的覆盖区域。鳍全假时按普通鱼删数；鳍任一为真时按宫约束删同一目标。`,
        `令F为鳍集合、T为删数。对任意t∈T：¬∨F时普通鱼推出¬t；∨F时，成立的鳍与t同宫推出¬t。因此无论∨F真假，t均为假。`,
        `① 选${size}个基准区域和${size}个覆盖区域；② 求Base\\Cover得到鳍；③ 确认所有鳍同宫；④ 只删除该宫中Cover\\Base的${digit}。`,
        `鱼身候选用cNormal(1)，鳍用cFins(2)，删数用cToDel(11)。`,
        `${sashimi ? "Sashimi还要求去掉鳍后至少一个基准区域的鱼身候选少于2个。" : "非Sashimi分支去掉鳍后各基准区域仍保留至少2个鱼身候选。"} 鳍跨宫时本实现不会成立。`,
      ] : [
        `${sashimi ? "Sashimi " : "Finned "}${baseName}: digit ${digit} uses bases ${bases} and covers ${covers}${body ? `; body ${body}` : ""}${fins ? `; fins ${fins}` : ""}.`,
        `The detector requires every fin outside the covers to lie in one box, with eliminations in that same box on Cover\\Base. If all fins are false, a normal fish eliminates the targets; if a fin is true, the box constraint eliminates them.`,
        `Let F be the fins and T the targets. For t∈T: when ¬∨F, the normal fish gives ¬t; when ∨F, a true fin shares the box with t and gives ¬t. Thus t is false in both cases.`,
        `1. Choose ${size} base and ${size} cover sets. 2. Compute fins as Base\\Cover. 3. Confirm all fins share one box. 4. Eliminate digit ${digit} only from Cover\\Base in that box.`,
        `Body candidates use cNormal(1), fins cFins(2), and eliminations cToDel(11).`,
        `${sashimi ? "For Sashimi, after removing fins at least one base has fewer than two body candidates." : "For the non-Sashimi branch, every base retains at least two body candidates after fins are removed."} Fins spanning multiple boxes are rejected.`,
      ];
    }
    return zh ? [
      `${baseName}：数字${digit}在${size}个基准区域${bases}中的所有候选都落入${size}个覆盖区域${covers}${body ? `，鱼身为${body}` : ""}。`,
      `每个基准区域都必须放置一个${digit}；同行或同列不能重复，所以这${size}个真数必须一一占用${size}个覆盖区域。`,
      `令Bᵢ为基准区域内的${digit}候选，且Bᵢ⊆C₁∪…∪Cₙ。每个Bᵢ至少一真、每个覆盖区域至多一真，n个真数正好填满n个覆盖容量；Cover\\Base中的${digit}为假。`,
      `① 选${size}个基准行或列；② 确认其${digit}候选只占${size}个垂直覆盖区域；③ 检查每个基准区域鱼身候选数在2到${size}之间；④ 删除覆盖区域中鱼身外的${digit}。`,
      `鱼身候选用cNormal(1)，删数用cToDel(11)。`,
      `普通鱼不允许Base\\Cover存在候选；每个基准区域必须至少有2个、至多${size}个鱼身候选。本项目行鱼和列鱼都使用同一逻辑。`,
    ] : [
      `${baseName}: every candidate for digit ${digit} in the ${size} base sets ${bases} lies in the ${size} cover sets ${covers}${body ? `; body ${body}` : ""}.`,
      `Each base set must place one ${digit}; row/column uniqueness forces the ${size} truths to occupy the ${size} covers one-for-one.`,
      `Let Bᵢ be the ${digit} candidates in each base, with Bᵢ⊆C₁∪…∪Cₙ. Every Bᵢ supplies a truth and every cover holds at most one, so n truths fill n cover capacities; ${digit} in Cover\\Base is false.`,
      `1. Choose ${size} base rows or columns. 2. Confirm their ${digit} candidates occupy only ${size} perpendicular covers. 3. Check each base has 2 through ${size} body candidates. 4. Remove ${digit} from the covers outside the body.`,
      `Body candidates use cNormal(1); eliminations use cToDel(11).`,
      `A normal fish permits no Base\\Cover candidates. Every base must have at least 2 and at most ${size} body candidates. Row- and column-oriented fish use the same proof.`,
    ];
  }

  if (kind === "Skyscraper") {
    const branch = firstGroup(step, /^branch$/i)?.tail || "";
    const bases = [firstGroup(step, /^basea$/i)?.houses?.[0], firstGroup(step, /^baseb$/i)?.houses?.[0]].filter(Boolean).join("、");
    const roofs = groupCells(step, /^roofs$/i).join(zh ? "、" : ", ");
    const linked = groupCells(step, /^linkedside$/i).join(zh ? "、" : ", ");
    const digit = digitText(firstGroup(step, /^roofs$/i)?.digits) || primaryDigits(step);
    return zh ? [
      `Skyscraper（${branch === "Column-Based" ? "列型" : "行型"}）：数字${digit}在两条平行基准区域${bases || ""}中各恰有两个候选；相连侧为${linked || "高亮连接端"}，两个楼顶为${roofs || "高亮楼顶"}。`,
      `每条基准区域中的两个${digit}构成强关系。相连侧的两个候选互相看见，不能同时为真，因此两个楼顶至少一个为真。`,
      `设两条强关系为(L₁∨R₁)与(L₂∨R₂)，其中L₁、L₂是相连侧。因L₁与L₂互斥，得到R₁∨R₂；任何同时看见R₁、R₂的${digit}均为假。`,
      `① 找两条同方向区域且每条只有两个${digit}；② 找能在垂直方向互相看见的一侧端点；③ 确认另侧两个楼顶不在同一垂直区域；④ 删除同时看见两楼顶的${digit}。`,
      `FB配色：楼顶用cNormal(1)，相连侧用cFins(2)，删数用cToDel(11)。`,
      `源码还排除“两个楼顶分别与连接端落在同一宫带/宫栈”的退化构型；两条基准区域必须各自恰好两个候选。`,
    ] : [
      `Skyscraper (${branch === "Column-Based" ? "column-based" : "row-based"}): digit ${digit} occurs exactly twice in each parallel base ${bases || ""}; ${linked || "the highlighted linked side"} is the aligned side and ${roofs || "the highlighted cells"} are the roofs.`,
      `Each base contains a strong link. The two linked-side candidates see each other and cannot both be true, so at least one roof is true.`,
      `Write the strong links as (L₁∨R₁) and (L₂∨R₂). Since L₁ and L₂ are mutually exclusive, R₁∨R₂ follows; any ${digit} seeing both roofs is false.`,
      `1. Find two parallel houses with exactly two ${digit}s each. 2. Align one endpoint from each in a perpendicular house. 3. Confirm the roofs are not aligned. 4. Remove ${digit} from common peers of the roofs.`,
      `FB colours: roofs cNormal(1), linked side cFins(2), eliminations cToDel(11).`,
      `The detector also rejects the degenerate same-chute arrangement; each base must contain exactly two candidates.`,
    ];
  }

  if (kind === "TwoStringKite") {
    const branch = firstGroup(step, /^branch$/i)?.tail || "Standard";
    const grouped = /grouped/i.test(branch) || /^grouped\b/i.test(String(step?.title || ""));
    const row = firstGroup(step, /^rowhouse$/i)?.houses?.[0] || "";
    const col = firstGroup(step, /^columnhouse$/i)?.houses?.[0] || "";
    const box = firstGroup(step, /^connectorhouse$/i)?.houses?.[0] || "";
    const outer = groupCells(step, /^outerendpoints$/i).join(zh ? "、" : ", ");
    const rowInner = groupCells(step, /^rowinner$/i).join(zh ? "、" : ", ");
    const colInner = groupCells(step, /^columninner$/i).join(zh ? "、" : ", ");
    const connector = groupCells(step, /^connector$/i).join(zh ? "、" : ", ");
    const digit = digitText(firstGroup(step, /^outerendpoints$/i)?.digits) || primaryDigits(step);
    return zh ? [
      `${grouped ? "Grouped " : ""}2-String Kite：数字${digit}在${row || "一行"}与${col || "一列"}中都只跨两个宫；离开连接宫${box || ""}后，行端与列端各只剩一个外端${outer ? `（${outer}）` : ""}。连接宫内的行组为${rowInner || "高亮行组"}，列组为${colInner || "高亮列组"}${connector ? `，合并连接组为${connector}` : ""}。`,
      grouped
        ? `行内候选可写成“行外端Oᵣ或连接宫行组Iᵣ至少一真”，列内同理为“O𝚌或连接宫列组I𝚌至少一真”。Iᵣ与I𝚌位于同一宫且两组互不重叠，宫内至多一个${digit}为真，因此两个外端至少一个为真。`
        : `行强关系和列强关系各至少一真；宫内两个连接端互相看见，不能同时为真，所以两个外端至少一个为真。`,
      grouped
        ? `设Iᵣ=∨(连接宫内行组)，I𝚌=∨(连接宫内列组)。有(Iᵣ∨Oᵣ)∧(I𝚌∨O𝚌)且¬(Iᵣ∧I𝚌)，故Oᵣ∨O𝚌。任何同时看见两个外端的${digit}都为假。`
        : `设行关系为Iᵣ∨Oᵣ，列关系为I𝚌∨O𝚌，且Iᵣ与I𝚌同宫互斥。于是Oᵣ∨O𝚌；任何同时看见两个外端的${digit}为假。`,
      grouped
        ? `① 选一行和一列，使该数字在各自区域都恰好跨两个宫；② 行、列候选集合不能相交；③ 在行列交点所属宫之外，各自必须恰好一个外端；④ 连接宫内允许每侧有一个或多个候选；⑤ 删除同时看见两个外端的${digit}。`
        : `① 选一行和一列，使该数字在各自区域都恰好跨两个宫；② 行、列候选集合不能相交；③ 在连接宫之外各自恰好一个外端；④ 连接宫内每侧各一个候选；⑤ 删除同时看见两个外端的${digit}。`,
      `FB配色：两个外端用cNormal(1)，连接宫内整个连接组用cFins(2)，删数用cToDel(11)。`,
      grouped
        ? `Grouped的判据是连接组总数大于2，不是行或列“恰好两个候选”。原始FB函数检查的是每条线的候选跨恰好两个宫，并要求连接宫外各恰好一个候选。`
        : `Standard分支的连接组总数恰好为2；搜索条件仍是每条线跨恰好两个宫，并非简单要求整行/整列只有两个候选。`,
    ] : [
      `${grouped ? "Grouped " : ""}2-String Kite: digit ${digit} occupies exactly two boxes in ${row || "one row"} and in ${col || "one column"}. Outside connector box ${box || ""}, each line has exactly one outer endpoint${outer ? ` (${outer})` : ""}. The in-box row group is ${rowInner || "highlighted"}, the column group is ${colInner || "highlighted"}${connector ? `, giving connector group ${connector}` : ""}.`,
      grouped
        ? `The row gives Iᵣ∨Oᵣ and the column gives I𝚌∨O𝚌, where Iᵣ and I𝚌 are grouped disjunctions inside one box. The two disjoint in-box groups cannot both contain the box's digit, so at least one outer endpoint is true.`
        : `Each line supplies a strong link. The two inner endpoints share a box and cannot both be true, so at least one outer endpoint is true.`,
      grouped
        ? `Let Iᵣ be the OR of the in-box row group and I𝚌 the OR of the in-box column group. From (Iᵣ∨Oᵣ)∧(I𝚌∨O𝚌) and ¬(Iᵣ∧I𝚌), Oᵣ∨O𝚌 follows. Any ${digit} seeing both outers is false.`
        : `Let the links be Iᵣ∨Oᵣ and I𝚌∨O𝚌, with Iᵣ and I𝚌 mutually exclusive in the box. Hence Oᵣ∨O𝚌, and any ${digit} seeing both outers is false.`,
      grouped
        ? `1. Choose a row and column whose ${digit} candidates each occupy exactly two boxes. 2. Their candidate sets must be disjoint. 3. Each has exactly one candidate outside the intersection box. 4. Either in-box side may contain multiple candidates. 5. Remove ${digit} from common peers of the outers.`
        : `1. Choose a row and column whose ${digit} candidates each occupy exactly two boxes. 2. Their candidate sets must be disjoint. 3. Each has one candidate outside the connector box. 4. Each in-box side has one candidate. 5. Remove ${digit} from common peers of the outers.`,
      `FB colours: outer endpoints cNormal(1), every in-box connector candidate cFins(2), eliminations cToDel(11).`,
      grouped
        ? `Grouped means the connector union contains more than two candidates. The FB detector counts boxes, not an exact total of two candidates per line, and requires exactly one candidate outside the connector box on each line.`
        : `Standard means the connector union contains exactly two candidates. The detector still counts boxes rather than requiring exactly two candidates across the entire row or column.`,
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
      `Empty Rectangle：${box}内数字${digit}的候选${body || "高亮宫内候选"}可由一条宫内行和一条宫内列覆盖，它们的空交点为${eri || "ERI交点"}；外部${linkHouse || "区域"}强关系为${link || "高亮强链"}。`,
      `宫内${digit}若不落在行臂，就必须落在列臂，反之亦然；外部共轭对把这两个分支连接到${outside || "外端"}，使目标在两种分支下都被排除。`,
      `令R、C为宫内两臂，E为交点，外部强关系为A∨B。宫约束给出“R臂有真数”∨“C臂有真数”；结合A∨B及可见关系，目标t在每一分支都满足¬t。`,
      `① 在一个宫中找同数字候选可被一行加一列覆盖；② 标出行列交点；③ 找跨宫的同数字二候选强关系，其中一端看见交点；④ 删除与交点同区域且看见外端的目标。`,
      `FB配色：外部强链用cNormal(1)，宫内ER候选用cFins(2)，普通删数用cToDel(11)，若删数落在强链本体则用Cannibalism(12)。`,
      `宫内候选至少两个；外部强关系必须恰好两个候选且分属不同宫。交点本身不要求含该候选，这正是“Empty”所在。`,
    ] : [
      `Empty Rectangle: the ${digit} candidates ${body || "highlighted in-box candidates"} in ${box} are covered by one local row and one local column, whose empty intersection is ${eri || "the ERI"}; ${link || "the highlighted conjugate pair"} is the external strong link in ${linkHouse || "a house"}.`,
      `If the box digit is not on the row arm it must be on the column arm, and vice versa. The external conjugate pair carries both cases to ${outside || "the far endpoint"}, eliminating the target in either case.`,
      `Let R and C be the two box arms and A∨B the external link. The box gives “a truth on R”∨“a truth on C”; together with A∨B and the visibility relations, every branch implies ¬t for the target.`,
      `1. Find a box whose digit candidates are coverable by one row plus one column. 2. Mark their intersection. 3. Find a cross-box conjugate pair with one endpoint seeing the intersection. 4. Remove the target sharing a house with the intersection and seeing the far endpoint.`,
      `FB colours: external link cNormal(1), in-box ER candidates cFins(2), normal eliminations cToDel(11), and a deletion on the link itself Cannibalism(12).`,
      `The box needs at least two candidates; the external link must contain exactly two candidates in different boxes. The intersection need not itself contain the digit.`,
    ];
  }

  if (kind === "ERIPair") {
    const pair = groupCells(step, /^pair$/i).join(zh ? "、" : ", ");
    const support = groupCells(step, /^erisupport$/i).join(zh ? "、" : ", ");
    const active = groupCells(step, /^activeeri$/i).join(zh ? "、" : ", ");
    const opposite = groupCells(step, /^oppositeeri$/i).join(zh ? "、" : ", ");
    const digits = digitText(firstGroup(step, /^pair$/i)?.digits) || primaryDigits(step);
    return zh ? [
      `ERI Pair：两个不互见的同候选双值格${pair || "高亮Pair"}含数字${digits}，位于不同宫带且不同宫栈；其两个共同可见矩形顶点中，当前活动ERI为${active || "高亮活动顶点"}，对顶点为${opposite || "高亮对顶点"}。`,
      `活动ERI所在宫中，数字${digits}的所有候选${support || "高亮支持格"}都被两个双值格覆盖。若该宫内某一数字不由支持格承担，就会迫使对应双值端点，并沿矩形顶点产生同样的排除。`,
      `对每个d∈${digits}，活动宫内d至少一真且每个支持位置都看见Pair A或Pair B。结合两双值格的互补取值，活动ERI、对顶点及与Pair-ERI共同可见的d候选不能保留。`,
      `① 找两个候选完全相同的双值格；② 它们所在宫既不在同一宫带也不在同一宫栈；③ 取两个共同可见顶点之一为活动ERI；④ 核对活动宫内两数字的全部候选都被Pair覆盖；⑤ 应用源码给出的删数集合。`,
      `FB配色：Pair双值格用cNormal(1)，ERI支持候选用cFins(2)，普通删数用cToDel(11)，活动ERI上的自噬删数用Cannibalism(12)。`,
      `两数字在活动宫中都必须至少存在一个候选；活动宫内不得有任何不看见两个Pair端点之一的相关候选。`,
    ] : [
      `ERI Pair: two non-seeing bivalue cells ${pair || "highlighted"} have the same pair ${digits} and occupy boxes in different bands and stacks. Of their two common-peer rectangle vertices, ${active || "the highlighted vertex"} is active and ${opposite || "the opposite vertex"} is opposite.`,
      `In the active vertex's box, every ${digits} candidate ${support || "highlighted"} is covered by one of the two pair cells. If a digit is not supplied by the support, the corresponding bivalue endpoint is forced and propagates the same exclusion through the rectangle vertices.`,
      `For each d∈${digits}, the active box contains a true d and every support position sees Pair A or Pair B. Combined with the complementary bivalue assignments, d cannot remain at the active/opposite vertices or at cells seeing a Pair endpoint and the active ERI.`,
      `1. Find two identical bivalue cells. 2. Their boxes must be in different bands and stacks. 3. Choose one of their two common-peer vertices as active. 4. Verify every occurrence of both digits in the active box is covered by the pair. 5. Apply the reported eliminations.`,
      `FB colours: pair cells cNormal(1), ERI support cFins(2), normal eliminations cToDel(11), and an elimination at the active ERI Cannibalism(12).`,
      `Both digits must have at least one candidate in the active box, with no uncovered relevant candidate there.`,
    ];
  }

  if (kind === "WWing") {
    const grouped = /grouped/i.test(firstGroup(step, /^branch$/i)?.tail || step?.title || "");
    const endpoints = groupCells(step, /^endpoints$/i).join(zh ? "、" : ", ");
    const pair = digitText(firstGroup(step, /^endpoints$/i)?.digits);
    const strong = groupCells(step, /^stronglink$/i).join(zh ? "、" : ", ");
    const linkDigit = digitText(firstGroup(step, /^stronglink$/i)?.digits);
    const deleteDigit = digitText(firstGroup(step, /^deletedigit$/i)?.digits) || primaryDigits(step);
    const house = firstGroup(step, /^linkhouse$/i)?.houses?.[0] || houseLabel(step, locale);
    return zh ? [
      `${grouped ? "Grouped " : ""}W-Wing：两个互不相见的同候选双值格${endpoints || "高亮端点"}为{${pair}}；其中${linkDigit}通过${house}内${strong || "高亮连接候选"}形成${grouped ? "分组强关系" : "共轭强关系"}。`,
      `连接区域中的每个${linkDigit}候选都被至少一个双值端点看见。若两个端点都不取${deleteDigit}，它们都会取${linkDigit}，从而排除连接区域内全部${linkDigit}，与该区域必须有一个${linkDigit}矛盾。`,
      `设端点为A={${pair}}、B={${pair}}，连接候选析取为∨L=true，且L⊆Peers(A)∪Peers(B)。假设¬A(${deleteDigit})∧¬B(${deleteDigit})，则A(${linkDigit})∧B(${linkDigit})，推出¬∨L，矛盾；故A(${deleteDigit})∨B(${deleteDigit})。`,
      `① 找两个候选对相同且互不相见的双值格；② 任选其中一个数字作连接数字；③ 找一个区域，其全部连接数字候选都分别被两个端点覆盖；④ 删除同时看见两端点的另一个数字。`,
      `FB配色：连接数字在强链和端点中用cFins(2)，端点的删数数字用cNormal(1)，目标用cToDel(11)。`,
      `${grouped ? "Grouped分支允许连接区域多于两个候选，但必须无一漏出两个端点的可见范围。" : "普通分支的连接区域恰好是两个候选。"} 两端点本身不能共享行、列或宫。`,
    ] : [
      `${grouped ? "Grouped " : ""}W-Wing: two non-seeing bivalue endpoints ${endpoints || "highlighted"} share pair {${pair}}; digit ${linkDigit} is connected through ${strong || "the highlighted candidates"} in ${house} as a ${grouped ? "grouped strong relation" : "conjugate link"}.`,
      `Every ${linkDigit} in the connector house is seen by at least one endpoint. If neither endpoint took ${deleteDigit}, both would take ${linkDigit}, eliminating every ${linkDigit} in the connector house, a contradiction.`,
      `Let A=B={${pair}}, with connector disjunction ∨L=true and L⊆Peers(A)∪Peers(B). Assuming ¬A(${deleteDigit})∧¬B(${deleteDigit}) forces A(${linkDigit})∧B(${linkDigit}), hence ¬∨L, contradiction; therefore A(${deleteDigit})∨B(${deleteDigit}).`,
      `1. Find two identical non-seeing bivalue cells. 2. Choose one digit as the link digit. 3. Find a house where every link candidate is covered by the endpoints. 4. Remove the other digit from common peers of the endpoints.`,
      `FB colours: link digit in connector and endpoints cFins(2), the other endpoint digit cNormal(1), targets cToDel(11).`,
      `${grouped ? "The grouped branch permits more than two connector candidates, but none may escape both endpoints' visibility." : "The standard connector contains exactly two candidates."} The endpoints must share no house.`,
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
        ? `枢轴含Z。若枢轴取Z则Z已在枢轴为真；若枢轴取另外两个数字之一，相应翼格被迫取Z。因此枢轴或两翼中的Z至少一个为真。`
        : `枢轴只有X/Y。枢轴取X会迫使Y/Z翼取Z，取Y会迫使X/Z翼取Z，因此两个翼格中的Z至少一个为真。`,
      xyz
        ? `P∈{X,Y,Z}，A={X,Z}，B={Y,Z}。P=Z∨(P=X⇒B=Z)∨(P=Y⇒A=Z)，故P(Z)∨A(Z)∨B(Z)。`
        : `P={X,Y}，A={X,Z}，B={Y,Z}。P=X⇒B=Z，P=Y⇒A=Z，故A(Z)∨B(Z)。`,
      `① 找${xyz ? "三值" : "双值"}枢轴；② 找两个双值翼，各与枢轴共享不同数字；③ 两翼共同只含一个Z且彼此不共享区域；④ 删除${xyz ? "同时看见枢轴和两翼" : "同时看见两翼"}的Z。`,
      `FB配色：非Z结构候选用cNormal(1)，Z用cFins(2)，删数用cToDel(11)。`,
      `${xyz ? "XYZ-Wing目标必须同时看见枢轴和两个翼格中的Z。" : "XY-Wing枢轴不能含Z，目标只需同时看见两个翼格。"} 两翼不能共享行、列或宫。`,
    ] : [
      `${xyz ? "XYZ" : "XY"}-Wing: pivot ${pText} sees wings ${aText} and ${bText}; the wings do not see each other and share Z=${z}.`,
      xyz
        ? `The pivot contains Z. If it takes Z, Z is true there; if it takes either other digit, the corresponding opposite wing is forced to Z. Thus Z is true in the pivot or a wing.`
        : `The pivot is {X,Y}. X forces the Y/Z wing to Z, while Y forces the X/Z wing to Z, so Z is true in at least one wing.`,
      xyz
        ? `P∈{X,Y,Z}, A={X,Z}, B={Y,Z}. P=Z∨(P=X⇒B=Z)∨(P=Y⇒A=Z), hence P(Z)∨A(Z)∨B(Z).`
        : `P={X,Y}, A={X,Z}, B={Y,Z}. P=X⇒B=Z and P=Y⇒A=Z, hence A(Z)∨B(Z).`,
      `1. Find a ${xyz ? "trivalue" : "bivalue"} pivot. 2. Find two bivalue wings sharing different pivot digits. 3. Their sole common digit is Z and the wings share no house. 4. Remove Z from cells seeing ${xyz ? "pivot and both wings" : "both wings"}.`,
      `FB colours: non-Z structure candidates cNormal(1), Z cFins(2), eliminations cToDel(11).`,
      `${xyz ? "An XYZ target must see Z in the pivot and both wings." : "The XY pivot must not contain Z; a target need only see both wings."} The wings may not share a row, column or box.`,
    ];
  }

  if (kind === "XYZRing") {
    const complete = /complete/i.test(firstGroup(step, /^branch$/i)?.tail || step?.title || "") && !/half/i.test(step?.title || "");
    const pivot = groupCells(step, /^pivot$/i).join(zh ? "、" : ", ");
    const wings = [...groupCells(step, /^winga$/i), ...groupCells(step, /^wingb$/i)].join(zh ? "、" : ", ");
    const connector = groupCells(step, /^connectorz$/i).join(zh ? "、" : ", ");
    const z = digitText(firstGroup(step, /^connectorz$/i)?.digits) || primaryDigits(step);
    const connectorHouse = firstGroup(step, /^connectorhouse$/i)?.houses?.[0] || houseLabel(step, locale);
    const covers = [firstGroup(step, /^ringcovera$/i)?.houses?.[0], firstGroup(step, /^ringcoverb$/i)?.houses?.[0]].filter(Boolean).join("、");
    return zh ? [
      `${complete ? "Complete" : "Half"} XYZ-Ring：枢轴${pivot || "高亮枢轴"}与两翼${wings || "高亮翼格"}形成XYZ核心；${connectorHouse}中的全部Z=${z}候选${connector || "高亮连接组"}都看见至少一个Z翼端，构成分组闭环。`,
      `XYZ核心保证分支在X、Y、Z之间传递；连接区域的Z候选又把两个翼端闭合。由此枢轴—翼格的X/Y公共可见位置可删；${complete ? `结构还能被两个覆盖区域${covers || "源码找到的两区域"}完整覆盖，因此这些覆盖区域中的结构外Z可删。` : `两侧只分别形成桥接区域，因此Z删数还必须同时满足看见枢轴的限制。`}`,
      `${complete ? "Complete分支：存在两个非连接区域H₁、H₂覆盖全部环节点，Z在H₁∪H₂中的额外位置会破坏闭环容量。" : "Half分支：分别存在覆盖“翼A+其可见连接Z”和“翼B+其可见连接Z”的桥接区域；只有位于两桥区域并看见枢轴的Z与两案均矛盾。"}`,
      `① 建立XYZ枢轴和两个互不相见翼格；② 找一个区域，其全部Z候选都被两个翼端的可见范围覆盖；③ 判断是否有两个额外区域完整覆盖全部结构，以区分Complete/Half；④ 按分支删除X/Y及Z。`,
      `现有FB语义：核心非Z候选用cFins(2)，核心Z用cEdoFins(3)，额外连接Z用cNormal(1)，删数用cToDel(11)。`,
      `不能把它简化成普通XYZ-Wing：必须完整核对连接区域内没有漏出的Z候选。Complete与Half的Z删数范围不同。`,
    ] : [
      `${complete ? "Complete" : "Half"} XYZ-Ring: pivot ${pivot || "highlighted"} and wings ${wings || "highlighted"} form an XYZ core; every Z=${z} in ${connectorHouse}, ${connector || "the highlighted connector group"}, sees at least one Z wing endpoint and closes a grouped ring.`,
      `The XYZ core propagates the X/Y/Z alternatives, while the connector Z group closes the two wing endpoints. This removes X/Y from common peers of pivot and the matching wing. ${complete ? `Two cover houses ${covers || "found by the detector"} cover the whole ring, so extra Z in those covers is false.` : `Only side-specific bridge houses exist, so a Z target must additionally see the pivot.`}`, 
      `${complete ? "Complete branch: two non-connector houses H₁,H₂ cover every ring node; extra Z in H₁∪H₂ violates the closed capacity." : "Half branch: one house covers wing A plus its visible connector-Z group and another covers wing B's side; only Z in those bridges that also sees the pivot is false."}`,
      `1. Build an XYZ pivot with two non-seeing wings. 2. Find a house whose every Z is covered by wing visibility. 3. Test whether two further houses cover the complete structure, distinguishing Complete from Half. 4. Apply the branch-specific X/Y and Z eliminations.`,
      `Current FB semantics: core non-Z cFins(2), core Z cEdoFins(3), extra connector Z cNormal(1), eliminations cToDel(11).`,
      `This is not a plain XYZ-Wing: no connector-house Z may escape both wings. Complete and Half have different Z target ranges.`,
    ];
  }

  if (kind === "WXYZWing") {
    const restricted = /restricted/i.test(firstGroup(step, /^branch$/i)?.tail || "");
    const pivot = firstGroup(step, /^pivot$/i);
    const wa = firstGroup(step, /^winga$/i);
    const wb = firstGroup(step, /^wingb$/i);
    const wc = firstGroup(step, /^remotewing$/i);
    const allDigits = digitText(firstGroup(step, /^wxyzset$/i)?.digits);
    const z = digitText(firstGroup(step, /^sharedz$/i)?.digits) || primaryDigits(step);
    const zCells = groupCells(step, /^sharedz$/i).join(zh ? "、" : ", ");
    return zh ? [
      `WXYZ-Wing：枢轴${cellNames(pivot?.cells, 1)}{${digitText(pivot?.digits)}}与同区域两翼${cellNames(wa?.cells, 1)}{${digitText(wa?.digits)}}、${cellNames(wb?.cells, 1)}{${digitText(wb?.digits)}}，再加远端双值翼${cellNames(wc?.cells, 1)}{${digitText(wc?.digits)}}，四格候选并集为{${allDigits}}，受限公共数字Z=${z}位于${zCells}。`,
      `远端翼的非Z数字W不在同区域两翼中，只能同时出现在枢轴；远端翼又看见枢轴。因此若结构内所有Z都为假，枢轴与远端翼都会被迫取W而冲突，所以结构内至少一个Z为真。`,
      `设远端翼={W,Z}，W∉Cand(同区域两翼)，且W∈Cand(枢轴)，远端翼∼枢轴。假设¬∨Z，则远端翼=W且枢轴=W，违反同区域唯一性，故∨Z=true。任何看见全部Z位置的外部Z为假。`,
      `① 选枢轴及与它同一行/列/宫的两个翼；② 三者并集不超过三数字；③ 找枢轴可见的远端双值翼，使总并集恰好四数字且只以一个Z与前两翼并集相交；④ 删除看见所有Z位置的Z。${restricted ? " Z位置全在一个区域时，源码还按闭合四数字分配删除其他数字的公共可见候选。" : ""}`,
      `FB配色：结构中的Z用cFins(2)，其余W/X/Y用cNormal(1)，删数用cToDel(11)。`,
      `四格并集必须恰好四数字；远端翼必须是双值且不在前三格共同区域内，但必须看见枢轴。${restricted ? "Restricted-Z附加删数只在全部Z位置同一行、列或宫时成立。" : ""}`,
    ] : [
      `WXYZ-Wing: pivot ${cellNames(pivot?.cells, 1)}{${digitText(pivot?.digits)}} and two co-house wings ${cellNames(wa?.cells, 1)}{${digitText(wa?.digits)}}, ${cellNames(wb?.cells, 1)}{${digitText(wb?.digits)}}, plus remote bivalue wing ${cellNames(wc?.cells, 1)}{${digitText(wc?.digits)}}, have union {${allDigits}}. Restricted common digit Z=${z} occurs at ${zCells}.`,
      `The remote wing's non-Z digit W is absent from the two co-house wings and therefore also occurs in the pivot; the remote wing sees the pivot. If every structural Z were false, both pivot and remote wing would be forced to W, a contradiction. Hence some structural Z is true.`,
      `Let the remote wing be {W,Z}, with W absent from the two co-house wings, W present in the pivot, and remote wing seeing pivot. Assuming ¬∨Z forces remote=W and pivot=W, impossible; therefore ∨Z=true. Any external Z seeing all Z positions is false.`,
      `1. Choose a pivot and two wings sharing one row/column/box. 2. Their union uses at most three digits. 3. Add a pivot-seeing remote bivalue wing so the total union is exactly four and its sole intersection with the first-wing union is Z. 4. Remove Z from cells seeing every Z position.${restricted ? " If all Z positions share one house, the detector also removes common-peer occurrences of the other digits from the closed four-value allocation." : ""}`,
      `FB colours: structural Z cFins(2), W/X/Y cNormal(1), eliminations cToDel(11).`,
      `The four-cell union must contain exactly four digits. The remote wing is bivalue, outside the first three cells' common house, but must see the pivot.${restricted ? " Restricted-Z extra eliminations require all Z positions in one row, column or box." : ""}`,
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
    const loop = cellNames(loopRole?.cells || []);
    const guardians = cellNames(guardianRole?.cells || []);
    const targets = cellNames(targetRole?.cells || step?.eliminations || []);
    const cannibals = cellNames(cannibalRole?.cells || []);
    const length = list(loopRole?.cells).length;
    return zh ? [
      `Broken Wing：数字${digit}在${loop || "高亮格"}形成长度${length || "为奇数"}的单数字奇环；每条本来不是共轭对的环边，由守护候选${guardians || "高亮Guardians"}补足。`,
      `若所有守护候选都为假，环上每一对相邻节点都会变成强关系。沿奇数条强弱交替关系绕行一周，会把起点同时推出真与假，因而“所有守护全假”不可能；守护集合至少一真。`,
      `设守护析取为G₁∨…∨Gₙ。假设目标t成立；因为t看见每个Gᵢ，得到¬G₁∧…∧¬Gₙ，奇环闭合后矛盾。因此t=false。${cannibals ? ` 本步还有环内自噬删数${cannibals}。` : ""}`,
      `① 固定数字${digit}；② 沿共享行、列、宫的候选建立奇数环；③ 对每条非共轭边收集该区域中其余${digit}作为Guardians；④ 确认Guardians全假会令整环全部变成共轭边；⑤ 删除同时看见全部Guardians的${digit}${targets ? `（${targets}）` : ""}。`,
      `FB配色：奇环本体cNormal(1)，Guardians cFins(2)，普通删数cToDel(11)，落在环本体内的自噬删数Cannibalism(12)。`,
      `环长度必须大于4且为奇数；相邻环节点必须共享有效区域；Guardian集合必须包含每条环边所在区域中除两端外的全部${digit}。POM/模板只用于筛选可能删数目标，不是本步逻辑证明。`,
    ] : [
      `Broken Wing: digit ${digit} forms a single-digit odd loop of length ${length || "odd"} on ${loop || "the highlighted cells"}. Every loop edge that is not already conjugate is completed by guardian candidates ${guardians || "highlighted"}.`,
      `If every guardian were false, every adjacent pair on the loop would become a strong link. Propagating alternating truth around an odd cycle returns to the start with the opposite value, so the all-guardians-false case is impossible; at least one guardian is true.`,
      `Let the guardian disjunction be G₁∨…∨Gₙ. If target t were true, it would see and falsify every Gᵢ, closing the contradictory odd loop. Hence t=false.${cannibals ? ` The step also has cannibal eliminations at ${cannibals}.` : ""}`,
      `1. Fix digit ${digit}. 2. Build an odd loop through shared rows, columns and boxes. 3. For every non-conjugate edge, collect all other ${digit}s in that house as guardians. 4. Verify all guardians false makes every edge conjugate. 5. Remove ${digit} from cells seeing all guardians${targets ? ` (${targets})` : ""}.`,
      `FB colours: loop body cNormal(1), guardians cFins(2), ordinary eliminations cToDel(11), eliminations inside the loop Cannibalism(12).`,
      `The loop length must be odd and greater than four. Adjacent nodes must share a valid house, and the guardian set must include every other ${digit} on each loop edge's house. POM/template search is only a target filter, not the proof.`,
    ];
  }

  if (kind === "ComplexSwordfish" || kind === "ComplexJellyfish" || kind === "ComplexSquirmbagFish") {
    const branch = firstGroup(step, /^branch$/i)?.tail || String(step?.description || "").split(":", 1)[0];
    const bases = firstGroup(step, /^base$/i)?.houses?.join(zh ? "、" : ", ") || (zh ? "高亮Base" : "the highlighted bases");
    const covers = firstGroup(step, /^cover$/i)?.houses?.join(zh ? "、" : ", ") || (zh ? "高亮Cover" : "the highlighted covers");
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
      ? (isMutant ? "Base或Cover内部允许同时混用行、列、宫" : "至少使用宫，但Base与Cover各自不混用行、列两类线")
      : (isMutant ? "rows, columns and boxes may be mixed on one side" : "boxes are used, while each side does not mix row and column lines");
    return zh ? [
      `${branch || "Complex Fish"}：数字${digit}使用${size}个Base（${bases}）与${size}个Cover（${covers}）；${geometry}${body ? `。鱼身为${body}` : ""}${regularFins ? `，普通鳍为${regularFins}` : ""}${endoFins ? `，内生鳍为${endoFins}` : ""}。`,
      `每个Base必须提供一个${digit}真数，${size}个Cover提供同样数量的容量。${isFinned ? "若所有鳍为假，结构退化为Rank 0复杂鱼；若任一鳍为真，只能删除同时看见全部鳍的目标。" : "Base真数正好填满Cover容量。"}`,
      `令B为Base真数需求、C为Cover容量。无鳍时|B|=|C|=${size}且Base候选被Cover覆盖，所以Cover\\Base中的${digit}为假。普通鳍是Base\\Cover候选；内生鳍是同时属于多个Base、会被重复计数的候选，二者都进入鳍析取。${isSashimi ? "去掉鳍后至少一个Base只剩一个鱼身候选，这是Sashimi分支。" : ""}${cannibals ? ` Cover重叠造成的结构内删数为${cannibals}。` : ""}`,
      `① 按${size}阶选择Base；② 选择同数目的Cover并判断Franken/Mutant几何；③ 区分鱼身、普通鳍与内生鳍；④ ${isFinned ? "只保留同时受全部鳍影响的删数" : "删除Cover中Base之外的候选"}${targets ? `（${targets}）` : ""}；⑤ 单独核对Cannibalism。`,
      `FB配色：鱼身cNormal(1)，普通鳍cFins(2)，内生鳍cEdoFins(3)，普通删数cToDel(11)，结构内删数Cannibalism(12)。`,
      `Complex Fish由POM给出的“不可能候选”驱动搜索，但最终证明必须由当前Base/Cover/Fin结构独立成立。Franken与Mutant、Finned与Sashimi都必须按Branch实际输出区分，不能统称“复杂鱼”。`,
    ] : [
      `${branch || "Complex Fish"}: digit ${digit} uses ${size} bases (${bases}) and ${size} covers (${covers}); ${geometry}${body ? `. Body: ${body}` : ""}${regularFins ? `; regular fins: ${regularFins}` : ""}${endoFins ? `; endo fins: ${endoFins}` : ""}.`,
      `Each base supplies one true ${digit}, while the ${size} covers provide equal capacity. ${isFinned ? "If every fin is false the pattern is a rank-0 complex fish; if a fin is true, only targets seeing every fin remain eliminable." : "The base truths exactly fill the cover capacity."}`,
      `Let B be the base truth demand and C the cover capacity. Without fins, |B|=|C|=${size} and the covers contain all base candidates, so ${digit} in Cover\\Base is false. Regular fins lie in Base\\Cover; endo fins belong to multiple bases and would be double-counted, so both enter the fin disjunction.${isSashimi ? " After removing fins, at least one base has a single body candidate, defining the Sashimi branch." : ""}${cannibals ? ` Structural overlap gives cannibal eliminations at ${cannibals}.` : ""}`,
      `1. Choose ${size} bases. 2. Choose ${size} covers and classify Franken/Mutant geometry. 3. Separate body, regular fins and endo fins. 4. ${isFinned ? "Keep only eliminations affected by every fin" : "remove cover candidates outside the bases"}${targets ? ` (${targets})` : ""}. 5. Check cannibal eliminations separately.`,
      `FB colours: body cNormal(1), regular fins cFins(2), endo fins cEdoFins(3), ordinary eliminations cToDel(11), internal eliminations Cannibalism(12).`,
      `POM supplies impossible-candidate search targets, but the reported Base/Cover/Fin structure must prove the step by itself. Distinguish Franken from Mutant and Finned from Sashimi using the actual Branch output.`,
    ];
  }

  if (kind === "Multifish") {
    const branch = firstGroup(step, /^branch$/i)?.tail || "";
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
      `Multi-Fish（${branch || "混合覆盖"}）：候选数字组为${sourceDigits}；Truth共${truthCount}个${truthLabels ? `（${truthLabels}）` : ""}，Link共${linkCount}个${linkLabels ? `（${linkLabels}）` : ""}${truthCells ? `，附加格Truth为${truthCells}` : ""}${cellLinks ? `，格Link为${cellLinks}` : ""}。`,
      `每个Truth至少要命中一个候选，每个Link至多容纳一个真候选。源码只在Truth数与Link数相等时输出，即严格Rank 0；因此所有Link容量都被Truth需求占满。`,
      `设Truth集合为T₁…Tₙ，Link集合为L₁…Lₙ。每个Tᵢ至少一真且每个Lⱼ至多一真，又有全部Truth候选被Links覆盖，所以n个真数必须一一占满n个Links。Link中的结构外候选为假；同时落在多个Link或结构内部的冲突候选形成Cannibalism${cannibals ? `（${cannibals}）` : ""}。`,
      `① 确认源数字组${sourceDigits}和${branch || "Base方向"}；② 逐项读取Truth与Link，而不是把它当成单数字普通鱼；③ 核对Truth数=${truthCount}、Link数=${linkCount}；④ 确认每个Truth的全部候选均被Link体系覆盖；⑤ 应用普通删数${targets ? `（${targets}）` : ""}与自噬删数。`,
      `FB配色按区域类型区分Truth/Link：行用cFins(2)，列用cNormal(1)，宫用cAls1；附加格Truth用cEdoFins，格Link用cDouble(10)，普通删数cToDel(11)，自噬Cannibalism(12)。`,
      `Multi-Fish是多数字、混合区域和格约束组成的Rank 0覆盖，不等同于普通单数字Fish。必须使用实际Truth/Link列表核对，不能仅凭“数量相等”猜测覆盖成立。`,
    ] : [
      `Multi-Fish (${branch || "mixed cover"}): source digits ${sourceDigits}; ${truthCount} truths${truthLabels ? ` (${truthLabels})` : ""} and ${linkCount} links${linkLabels ? ` (${linkLabels})` : ""}${truthCells ? `, extra cell truths ${truthCells}` : ""}${cellLinks ? `, cell links ${cellLinks}` : ""}.`,
      `Every truth needs at least one true candidate and every link holds at most one. The detector emits only when the truth and link counts are equal, i.e. strict rank 0, so the truth demand fills all link capacity.`,
      `Let the truths be T₁…Tₙ and links L₁…Lₙ. Each Tᵢ supplies a truth, each Lⱼ accepts at most one, and all truth candidates are covered by the links. Thus n truths occupy n links one-for-one. Candidates in links but outside the structure are false; internal or multi-link conflicts are cannibal eliminations${cannibals ? ` at ${cannibals}` : ""}.`,
      `1. Confirm source digits ${sourceDigits} and ${branch || "base orientation"}. 2. Read every Truth and Link rather than treating this as a one-digit fish. 3. Verify truth count ${truthCount} equals link count ${linkCount}. 4. Confirm the links cover every truth candidate. 5. Apply ordinary targets${targets ? ` (${targets})` : ""} and cannibal targets.`,
      `FB colours depend on house type: row Truth/Link cFins(2), column cNormal(1), box cAls1; extra cell truths cEdoFins, cell links cDouble(10), ordinary eliminations cToDel(11), cannibals Cannibalism(12).`,
      `Multi-Fish is a rank-0 cover over multiple digits, mixed houses and cell constraints, not an ordinary single-digit fish. Use the explicit Truth/Link list; equal counts alone do not prove coverage.`,
    ];
  }

  return null;
}


function buildAuditedPhase4Guide(step = {}, locale = "zh") {
  const zh = localeKey(locale) === "zh";
  const kind = String(step?.kind || "");
  const branch = firstGroup(step, /^branch$/i)?.tail || String(step?.title || "");
  const targets = groupCells(step, /^targets$/i).join(zh ? "、" : ", ") || cellNames(step?.eliminations || []);
  const cannibals = groupCells(step, /^cannibaltargets$/i).join(zh ? "、" : ", ");

  if (kind === "AlmostPair" || kind === "AlmostTriple") {
    const sector = firstGroup(step, /^activesector$/i);
    const ahs = firstGroup(step, /^ahs$/i);
    const als = firstGroup(step, /^als$/i);
    const digits = digitText(sector?.digits) || primaryDigits(step);
    const n = kind === "AlmostPair" ? 2 : 3;
    return zh ? [
      `${kind === "AlmostPair" ? "Almost Pair" : "Almost Triple"}（${branch}）：宫线交区${cellNames(sector?.cells)}承载数字组{${digits}}；交区一侧是ALS ${cellNames(als?.cells)}，另一侧是AHS ${cellNames(ahs?.cells)}。`,
      `源码要求ALS由${n - 1}格容纳${n}个数字，AHS由${n - 1}格锁住同一组${n}个数字。两侧共同迫使宫线交区中的这组数字占用固定容量，因此ALS同侧的其余{${digits}}和AHS格中的额外候选可删。`,
      `设D为${n}个活动数字，A为${n - 1}格ALS，H为${n - 1}格AHS。A需要D中的至少一个数字落入交区，H又只允许D占据H的${n - 1}个位置；宫线两侧容量相加后，目标候选若成立会使D的所需位置数超过可用容量。`,
      `① 选宫与相交行/列；② 在非交区一侧找${n - 1}格/${n}数ALS；③ 在另一侧找${n - 1}格AHS；④ 核对交区至少有两个活动候选；⑤ 删除ALS同侧其余活动数字及AHS格中的额外数字${targets ? `（${targets}）` : ""}。`,
      `FB配色：活动交区候选cNormal(1)，AHS全部候选cFins(2)，ALS全部候选cEdoFins(3)，普通删数cToDel(11)。`,
      `必须按Branch区分“Box-ALS / Line-AHS”与“Line-ALS / Box-AHS”；Almost Pair/Triple不是朋友项目的通用ALC，也不能只凭格数套用。`,
    ] : [
      `${kind === "AlmostPair" ? "Almost Pair" : "Almost Triple"} (${branch}): the box-line intersection ${cellNames(sector?.cells)} carries digit set {${digits}}; one side contains ALS ${cellNames(als?.cells)}, the other AHS ${cellNames(ahs?.cells)}.`,
      `The detector requires an ${n - 1}-cell/${n}-digit ALS and an ${n - 1}-cell AHS locking the same ${n} digits. Together they fix the box-line capacity, eliminating those digits on the ALS side and extra candidates inside the AHS.`,
      `Let D be the ${n} active digits, A the ${n - 1}-cell ALS and H the ${n - 1}-cell AHS. A forces at least one D into the intersection while H reserves its ${n - 1} positions for D; a target would exceed available capacity.`,
      `1. Choose a box and crossing line. 2. Find the ${n - 1}-cell/${n}-digit ALS on one side. 3. Find the matching AHS on the other. 4. Verify at least two active intersection candidates. 5. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: active intersection cNormal(1), AHS cFins(2), ALS cEdoFins(3), eliminations cToDel(11).`,
      `Respect the Branch orientation. This FB Almost Pair/Triple is not a generic Almost Locked Candidates pattern and cannot be inferred from cell counts alone.`,
    ];
  }

  if (kind === "ALSXZ") {
    const a = firstGroup(step, /^alsa$/i), b = firstGroup(step, /^alsb$/i);
    const x = digitText(firstGroup(step, /^rcc$/i)?.digits);
    const z = digitText(firstGroup(step, /^z$/i)?.digits);
    const rank0 = /double-rcc/i.test(branch);
    return zh ? [
      `ALS-XZ（${branch}）：ALS A=${cellNames(a?.cells)}{${digitText(a?.digits)}}，ALS B=${cellNames(b?.cells)}{${digitText(b?.digits)}}，受限公共数字X=${x}${z ? `，共同目标Z=${z}` : ""}。`,
      `${rank0 ? "两个RCC把两组ALS组成双链接Rank 0结构；所有链接容量被占满，结构外和结构内的超额候选都可删。" : "X在A、B之间是受限公共候选：X不可能同时在两组ALS中成立，因此若X落在一侧，另一侧必须用非X候选；两组共同含有的Z至少在一侧成立。"}`,
      `${rank0 ? "双RCC意味着A与B之间有两个相互独立的受限公共数字，Truth与Link数量相等。" : `假设一个同时看见A中所有Z与B中所有Z的外部Z成立，则两组ALS中的Z都为假；A、B被迫分别使用X，违反X的受限公共关系。故目标Z为假。`}${cannibals ? ` 结构内自噬删数：${cannibals}。` : ""}`,
      `① 验证每组都是n格/n+1数ALS；② 找RCC X=${x}，确认A中所有X与B中所有X互相可见；③ ${rank0 ? "核对第二个RCC并按Rank 0处理" : `找共同Z=${z}及其共同可见目标`}；④ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：A内部cAls1(4)，B内部cAls2(5)，RCC X用cEdoFins(3)，Z用cFins(2)，普通删数cToDel(11)，结构内删数Cannibalism(12)。`,
      `RCC要求A中的全部X与B中的全部X两两互见；同一格重叠或仅部分互见不能当作RCC。Double-RCC分支不能再套单Z删数解释。`,
    ] : [
      `ALS-XZ (${branch}): ALS A=${cellNames(a?.cells)}{${digitText(a?.digits)}}, ALS B=${cellNames(b?.cells)}{${digitText(b?.digits)}}, RCC X=${x}${z ? `, target Z=${z}` : ""}.`,
      `${rank0 ? "Two RCCs make a doubly linked rank-0 structure; all link capacity is occupied." : "X is restricted common: it cannot be true in both ALSs, so the shared Z must survive in at least one side."}`,
      `${rank0 ? "Two independent RCCs equalize truth and link counts." : `If an external Z seeing every Z in A and B were true, both ALS Z sets would be false and each ALS would be forced to X, violating the RCC.`}${cannibals ? ` Cannibal targets: ${cannibals}.` : ""}`,
      `1. Verify both n-cell/n+1-digit ALSs. 2. Verify RCC X=${x}. 3. ${rank0 ? "Verify the second RCC and use rank-0 capacity" : `identify common Z=${z} and common-peer targets`}. 4. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: A cAls1(4), B cAls2(5), RCC cEdoFins(3), Z cFins(2), ordinary deletions cToDel(11), internal deletions Cannibalism(12).`,
      `Every X in A must see every X in B. Partial visibility is not an RCC, and the double-RCC branch must not be explained as ordinary single-Z XZ.`,
    ];
  }

  if (kind === "ALSXYWing") {
    const a = firstGroup(step, /^alsa$/i), b = firstGroup(step, /^alsb$/i), c = firstGroup(step, /^alsc$/i);
    const x = digitText(firstGroup(step, /^rccx$/i)?.digits), y = digitText(firstGroup(step, /^rccy$/i)?.digits), z = digitText(firstGroup(step, /^z$/i)?.digits);
    return zh ? [
      `ALS-XY-Wing（${branch}）：A=${cellNames(a?.cells)}，B=${cellNames(b?.cells)}，枢纽ALS C=${cellNames(c?.cells)}；A-C以RCC X=${x}连接，B-C以RCC Y=${y}连接，共同删数数字为Z=${z}。`,
      `C必须用X、Y或其他内部数字。若C不用X，则A中的X不能被C排除，A被迫转向含Z的状态；同理C不用Y会迫使B侧含Z。无论C的分配如何，A或B中的Z至少一真。`,
      `假设目标Z成立并同时看见A、B中的全部Z，则A、B的Z都假。A只能通过X满足，B只能通过Y满足，C中的X和Y同时被排除；这与C仍需满足ALS容量矛盾。${/triple-linked/i.test(branch) ? " Triple-Linked分支还有第三链接，形成Rank 0并产生额外/自噬删数。" : ""}`,
      `① 核对三组ALS；② 验证A-C的RCC X与B-C的RCC Y；③ 找A、B共同候选Z；④ 删除同时看见A、B全部Z的候选${targets ? `（${targets}）` : ""}。`,
      `FB配色：A/B/C内部依次cAls1/2/3，RCC X/Y用cEdoFins(3)，Z用cFins(2)；Triple-Linked的Rank 0 Z用cDouble(10)，删数cToDel(11)/Cannibalism(12)。`,
      `A与B不需要直接连接；两个RCC必须分别连接到同一枢纽C。Triple-Linked分支必须按实际第三链接说明。`,
    ] : [
      `ALS-XY-Wing (${branch}): A=${cellNames(a?.cells)}, B=${cellNames(b?.cells)}, hub ALS C=${cellNames(c?.cells)}; A-C use RCC X=${x}, B-C RCC Y=${y}, with target Z=${z}.`,
      `Whatever C does, the RCCs force Z to survive in A or B.`,
      `If a target Z seeing every Z in A and B were true, both outer Z sets would be false. A would require X and B require Y, excluding both X and Y from C and violating C's ALS capacity.${/triple-linked/i.test(branch) ? " The triple-linked branch adds a third link and becomes rank 0." : ""}`,
      `1. Verify three ALSs. 2. Verify A-C RCC X and B-C RCC Y. 3. Find common Z in A and B. 4. Remove Z from common peers${targets ? ` (${targets})` : ""}.`,
      `FB colours: ALS A/B/C cAls1/2/3, RCCs cEdoFins(3), Z cFins(2), rank-0 Z cDouble(10), deletions cToDel(11)/Cannibalism(12).`,
      `A and B need not connect directly; both RCCs must meet the same hub C. Explain the triple-linked branch separately when present.`,
    ];
  }

  if (kind === "ALSWWing") {
    const a = firstGroup(step, /^alsa$/i), b = firstGroup(step, /^alsb$/i);
    const strong = groupsMatching(step, /^stronglink$/i).map((g) => `${digitText(g.digits)}@${g.houses.join("/") || cellNames(g.cells)}`).join(zh ? "、" : ", ");
    const z = digitText(firstGroup(step, /^z$/i)?.digits) || primaryDigits(step);
    return zh ? [
      `ALS-W-Wing（${branch}）：两组ALS A=${cellNames(a?.cells)}、B=${cellNames(b?.cells)}由外部强链${strong || "高亮StrongLink"}连接，共同目标数字为${z}。`,
      `强链数字在连接区域中恰有一个成立。若它在A侧为假，则A必须用共同目标数字；若在B侧为假，则B必须用共同目标数字。因此A、B中的目标数字至少一真。`,
      `设连接数字为X、目标为Z。强链给出X_A∨X_B且¬(X_A∧X_B)。ALS容量给出¬X_A⇒Z_A、¬X_B⇒Z_B，所以Z_A∨Z_B。共同可见的外部Z可删。${/rank-0/i.test(branch) ? " 本分支含双强链或同屋RCC，链接数与自由度相等，按Rank 0产生额外删数。" : ""}`,
      `① 验证两组ALS；② 找连接它们的普通或Grouped强链；③ 确认强链端分别看见两组ALS内全部连接数字；④ 找共同Z并删除共同可见目标${targets ? `（${targets}）` : ""}。`,
      `FB配色：ALS内部cAls1/2，同屋RCC cEdoFins(3)，外部强链cDouble(10)，目标Z cFins(2)，删数cToDel(11)/Cannibalism(12)。`,
      `Grouped分支的强链端可以是组节点，不能降格成单候选强链；Rank-0分支还要核对第二链接或同屋RCC。`,
    ] : [
      `ALS-W-Wing (${branch}): ALS A=${cellNames(a?.cells)} and B=${cellNames(b?.cells)} are connected by ${strong || "the highlighted strong link"}; target digit ${z}.`,
      `Exactly one side of the connector is true. Whichever side is false forces the corresponding ALS to use target Z, so Z survives in A or B.`,
      `For connector X and target Z: X_A∨X_B with not both; ALS capacity gives ¬X_A⇒Z_A and ¬X_B⇒Z_B, hence Z_A∨Z_B. Common-peer Z is false.${/rank-0/i.test(branch) ? " A second link or same-house RCC makes this branch rank 0." : ""}`,
      `1. Verify both ALSs. 2. Find the ordinary/grouped strong connector. 3. Confirm each end sees all connector candidates in its ALS. 4. Remove common-peer Z${targets ? ` (${targets})` : ""}.`,
      `FB colours: ALS cAls1/2, same-house RCC cEdoFins(3), external strong link cDouble(10), Z cFins(2), deletions cToDel(11)/Cannibalism(12).`,
      `Grouped endpoints are group nodes, not single-candidate links. Rank-0 output requires the additional link to be verified.`,
    ];
  }

  if (kind === "AHSXZ") {
    const a = firstGroup(step, /^ahsa$/i), b = firstGroup(step, /^ahsb$/i), x = digitText(firstGroup(step, /^rcc$/i)?.digits);
    return zh ? [
      `AHS-XZ（${branch}）：AHS A=${cellNames(a?.cells)}{${digitText(a?.digits)}}与B=${cellNames(b?.cells)}{${digitText(b?.digits)}}通过受限公共位置/数字X=${x || "cell"}连接。`,
      `AHS描述的是“少数数字只能落在少数格”的位置容量。RCC使两个AHS不能同时占用同一连接资源；若目标候选保留，会使两组AHS所需位置超过可用格或令连接资源被重复占用。`,
      `${/double-rcc/i.test(branch) ? "两个RCC把AHS位置需求与链接容量锁成Rank 0，因此结构外与结构内的超额候选都可删。" : "单RCC分支中，A、B共同的Z位置至少一侧必须保留；同时看见所有Z位置的目标为假。"}${cannibals ? ` 自噬删数：${cannibals}。` : ""}`,
      `① 在各自house中找AHS；② 确认X由具体格对或同格候选构成受限公共关系；③ 区分Single-RCC与Double-RCC；④ 应用目标删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：AHS A/B分别cAls1(4)/cAls2(5)，RCC端点cEdoFins(3)，普通删数cToDel(11)，结构内删数Cannibalism(12)。`,
      `AHS的数字数与位置数关系和ALS相反；不能把AHS-XZ照抄成ALS-XZ文字。RCC可以由不同格或同一交格形成，必须按实际输出核对。`,
    ] : [
      `AHS-XZ (${branch}): AHS A=${cellNames(a?.cells)}{${digitText(a?.digits)}} and B=${cellNames(b?.cells)}{${digitText(b?.digits)}} share restricted resource X=${x || "cell"}.`,
      `AHS logic is positional capacity: a small digit set is confined to a small cell set. The RCC prevents both AHSs from consuming the connector simultaneously.`,
      `${/double-rcc/i.test(branch) ? "Two RCCs form a rank-0 positional cover." : "With one RCC, the shared Z position must survive on one side; a target seeing all Z positions is false."}${cannibals ? ` Cannibal targets: ${cannibals}.` : ""}`,
      `1. Identify both AHSs in their houses. 2. Verify the cell/digit RCC. 3. Distinguish single from double RCC. 4. Apply targets${targets ? ` (${targets})` : ""}.`,
      `FB colours: AHS A/B cAls1(4)/cAls2(5), RCC endpoints cEdoFins(3), ordinary eliminations cToDel(11), internal eliminations Cannibalism(12).`,
      `AHS reverses the ALS digit/cell capacity relation; do not reuse ALS-XZ wording. Verify the actual RCC geometry.`,
    ];
  }

  if (kind === "SueDeCoq") {
    const sector = firstGroup(step, /^activesector$/i), box = firstGroup(step, /^sueb$/i), line = firstGroup(step, /^suel$/i), insular = firstGroup(step, /^sueinsular$/i);
    return zh ? [
      `Sue de Coq（${branch}）：活动宫线交区${cellNames(sector?.cells)}含{${digitText(sector?.digits)}}；宫侧集合${cellNames(box?.cells)}使用{${digitText(box?.digits)}}，线侧集合${cellNames(line?.cells)}使用{${digitText(line?.digits)}}${insular ? `，交区独占数字为{${digitText(insular.digits)}}` : ""}。`,
      `交区、宫侧与线侧的格数自由度，恰好等于两侧链接数字及独占数字的总容量。因此这些数字被结构完全占用，宫/线其余位置不能再使用对应数字。`,
      `源码验证 |交区格|+|宫侧格|+|线侧格| = |宫链接数字|+|线链接数字|+|独占数字|。${/cannibalized/i.test(branch) ? "宫侧与线侧共享数字造成结构内部重复覆盖，产生Cannibalism。" : "两侧链接数字不产生内部重复覆盖。"}`,
      `① 选宫线交区的2或3格；② 选宫外集合与线外集合；③ 合并候选并核对容量等式；④ 分离宫链接、线链接、独占与共享数字；⑤ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：独占交区数字cAls1(4)，线链接cFins(2)，宫链接cEdoFins(3)，普通删数cToDel(11)，结构内删数Cannibalism(12)。`,
      `必须使用实际候选容量等式；“交区看起来像两个ALS”并不足够。Cannibalized分支要单独显示共享数字和结构内删数。`,
    ] : [
      `Sue de Coq (${branch}): active box-line intersection ${cellNames(sector?.cells)} has {${digitText(sector?.digits)}}; box side ${cellNames(box?.cells)} uses {${digitText(box?.digits)}}, line side ${cellNames(line?.cells)} uses {${digitText(line?.digits)}}${insular ? `, with insular digits {${digitText(insular.digits)}}` : ""}.`,
      `The cell freedom of intersection, box side and line side exactly equals the capacity of the two link sets plus insular digits, fully occupying those digits.`,
      `The detector verifies |intersection|+|box side|+|line side| = |box links|+|line links|+|insular|.${/cannibalized/i.test(branch) ? " Shared box/line digits create internal overlap and cannibal eliminations." : " There is no internal shared-link overlap."}`,
      `1. Choose 2 or 3 intersection cells. 2. Choose box-side and line-side sets. 3. Verify the capacity equality. 4. Separate box, line, insular and common digits. 5. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: insular cAls1(4), line links cFins(2), box links cEdoFins(3), ordinary deletions cToDel(11), internal deletions Cannibalism(12).`,
      `Use the exact candidate-capacity equality. A visual resemblance to two ALSs is insufficient; show common digits for the Cannibalized branch.`,
    ];
  }

  if (kind === "Fireworks") {
    const arms = groupsMatching(step, /^(fireworkarms|fireworkset|fireworka|fireworkb)$/i).map((g) => cellNames(g.cells)).filter(Boolean).join(zh ? "；" : "; ");
    const aux = groupsMatching(step, /^(erconnector|bivaluebridge|sharedarms|alppivot|bivaluepair|basecells|pit)$/i).map((g) => `${g.head}:${cellNames(g.cells)}`).join(zh ? "；" : "; ");
    const explanations = {
      "Dual ER": zh ? "双数字Fireworks通过同一pit的行臂、列臂和宫臂成立；空矩形连接把两个数字的落点传递到目标宫。" : "A two-digit Fireworks shares a pit and uses an Empty Rectangle connector to transfer both digits.",
      "Dual S-Wing": zh ? "双数字Fireworks与对角双值桥组成S-Wing；桥取任一数字都会排除pit中的额外候选。" : "A two-digit Fireworks plus a diagonal bivalue bridge forms an S-Wing and removes extra pit candidates.",
      "Triple": zh ? "三个Fireworks数字占满三臂/三格容量，结构格额外候选和宫内其余三数字可删。" : "Three Fireworks digits fill the three-arm capacity, removing extras from the body and the remaining box sector.",
      "Quadruple": zh ? "两组双Fireworks交叠成四数字闭合容量；公共臂与两个pit只能容纳各自数字组。" : "Two dual Fireworks overlap into a closed four-digit allocation.",
      "Dual ALP": zh ? "两组相同双数字Fireworks由中心双值ALP枢轴联结，枢轴与两组pit共同固定数字分配。" : "Two equal dual Fireworks are tied by a central bivalue ALP pivot.",
      "Dual W-Wing": zh ? "双数字Fireworks与两个同候选双值格构成W-Wing，交叉目标同时看见两种可能。" : "A dual Fireworks and two matching bivalue cells form a W-Wing.",
      "Exocet": zh ? "四个单数字Fireworks围绕同一pit组合成四数字结构，两格双值Base把Fireworks候选投射到共同可见目标。" : "Four single-digit Fireworks around one pit combine with two bivalue bases into an Exocet-like projection.",
    };
    const core = explanations[branch] || (zh ? "本分支按源码的Fireworks组合结构证明。" : "This branch follows the reported Fireworks composition.");
    return zh ? [
      `Fireworks分支：${branch}。主臂${arms || "见高亮结构"}${aux ? `；辅助角色${aux}` : ""}。`,
      core,
      `单个Fireworks要求某数字在一条行与一条列中，除pit所在宫外各至多一个外端；因此该数字若不在pit，就被迫落在相应外端。当前分支把两个到四个这样的析取关系与${branch}辅助结构合并，得到目标不可能。`,
      `① 先核对每个单Fireworks的pit、行外端、列外端和宫；② 再按${branch}核对ER/双值桥/共享臂/ALP/W-Wing/Base；③ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色随分支使用cAls1/cAls2区分Fireworks组，cFins标连接，cSTP(10)标双值桥或Base，删数cToDel(11)。`,
      `不能只看到三格“烟花形状”就成立：行列候选必须满足源码的跨宫计数，且所有辅助格候选必须与Branch完全一致。`,
    ] : [
      `Fireworks branch: ${branch}. Main arms ${arms || "shown by highlights"}${aux ? `; auxiliary roles ${aux}` : ""}.`,
      core,
      `A single Fireworks confines a digit on a row and column so that outside the pit box each arm has at most one endpoint. The current branch combines two to four such disjunctions with its ${branch} auxiliary structure to exclude the target.`,
      `1. Verify pit, row endpoint, column endpoint and box for every single Fireworks. 2. Verify the branch-specific ER/bridge/shared arms/ALP/W-Wing/bases. 3. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours use cAls1/cAls2 for Fireworks groups, cFins for connectors, cSTP(10) for bivalue bridges/bases, and cToDel(11) for eliminations.`,
      `A visual three-cell firework is not enough: row/column candidate counts and every auxiliary candidate must match the reported Branch.`,
    ];
  }

  if (kind === "BivalueOddagon") {
    const body = firstGroup(step, /^oddagonbody$/i) || firstGroup(step, /^oddagona$/i);
    const digits = digitText(body?.digits) || primaryDigits(step);
    const locked = firstGroup(step, /^lockedsubset$/i);
    return zh ? [
      `Bivalue Oddagon（${branch}）：奇数长度闭环主体${cellNames(body?.cells || structureCells(step))}只使用数字对{${digits}}${locked ? `，附加锁定数组${cellNames(locked.cells)}{${digitText(locked.digits)}}` : ""}。`,
      `若每个环格都只在{${digits}}中取值，沿环交替放置会在奇数步后要求起点同时取两个相反状态，无法完成。因此至少一个额外候选/出口条件必须成立。`,
      `${/type 1/i.test(branch) ? "唯一出口格不能保留致命数字对，否则奇环无破坏点。" : /type 2/i.test(branch) ? "所有出口共享同一个额外数字；该数字至少一真，所以共同可见目标可删。" : /type 3/i.test(branch) ? "多个出口额外数字与同屋数组组成容量锁定，数组外对应候选可删。" : "两个Oddagon共享出口并由相同三值格连接；共享出口的致命数字对可删。"}`,
      `① 确认环长为奇数且相邻格共享house；② 每个主体格含致命数字对；③ 按${branch}核对唯一出口、共享guardian、锁定数组或双环共享出口；④ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：主体cNormal(1)；Type 2 guardian/Type 3锁定数组cFins(2)；Dual两环分别cAls1/cAls2、共享部分cAls3，连接三值格cDouble(10)，删数cToDel(11)。`,
      `Oddagon编号是本项目/FB体系，不能直接与其他软件的Type编号硬对齐；必须按实际出口结构判断。`,
    ] : [
      `Bivalue Oddagon (${branch}): an odd-length loop ${cellNames(body?.cells || structureCells(step))} uses deadly pair {${digits}}${locked ? ` with locked set ${cellNames(locked.cells)}{${digitText(locked.digits)}}` : ""}.`,
      `If every loop cell used only {${digits}}, alternating values around an odd cycle would return to the start with the opposite requirement. Some escape must exist.`,
      `${/type 1/i.test(branch) ? "The sole exit cannot retain the deadly pair." : /type 2/i.test(branch) ? "All exits share one extra digit, so one guardian is true and common-peer targets are false." : /type 3/i.test(branch) ? "Exit extras plus a same-house locked set saturate capacity." : "Two oddagons share an exit and matching trivalue connectors, allowing the deadly pair to be removed from the shared exit."}`,
      `1. Verify an odd loop and shared houses. 2. Verify the deadly pair in every body cell. 3. Check the branch-specific exit/guardian/locked-set/dual-loop condition. 4. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: body cNormal(1); guardians/locked set cFins(2); Dual loops cAls1/cAls2 with shared cAls3, connectors cDouble(10), deletions cToDel(11).`,
      `Type numbering follows the FB/project implementation and may not match another solver; classify by the actual exit structure.`,
    ];
  }

  if (kind === "TripletOddagon") {
    const body = firstGroup(step, /^tripletbody$/i);
    const digits = digitText(body?.digits) || primaryDigits(step);
    return zh ? [
      `Triplet Oddagon（${branch}）：12格主体${cellNames(body?.cells || structureCells(step))}围绕三个数字{${digits}}形成三值Oddagon；当前分支再叠加RT、Triplet Lock Set、Triplet ERI或Almost Fireworks。`,
      `主体若完全只由三个数字按三条带/栈交替排列，会形成不可唯一的三数字置换。额外候选是破坏点；各分支用强关系、锁定集合、ERI或Fireworks把破坏点约束为至少一真/至少一假。`,
      `${/almost fireworks/i.test(branch) ? "Almost Fireworks与Triplet Oddagon共同约束额外候选。" : /type 1$/i.test(branch) ? "单个额外候选是唯一破坏点，因此主体外对应结论成立。" : /type 2$/i.test(branch) ? "两个单额外候选构成强关系，公共可见目标可删。" : /lock set/i.test(branch) ? "RT与三数组容量合并。" : /eri/i.test(branch) ? "RT通过ERI传递。" : "按当前Branch约束额外候选。"}`,
      `① 核对12个主体格及三数字；② 找每格超出三数字的extra；③ 按Branch核对RT/Lock Set/ERI/AFW附加结构；④ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：Triplet主体cNormal(1)，附加RT/AFW结构按cAls1/cFins/cDouble区分，删数cToDel(11)或Cannibalism(12)。`,
      `不能把任意12格三候选图形称为Triplet Oddagon；行列宫排列、extra数量与Branch附加关系必须全部满足源码枚举。`,
    ] : [
      `Triplet Oddagon (${branch}): a 12-cell body ${cellNames(body?.cells || structureCells(step))} uses triplet {${digits}}, with RT, Triplet Lock Set, Triplet ERI or Almost Fireworks depending on the branch.`,
      `If the body used only the three digits in the required band/stack arrangement, a three-digit permutation would destroy uniqueness. Extra candidates are escapes constrained by the branch-specific strong relation.`,
      `${/almost fireworks/i.test(branch) ? "Almost Fireworks constrains the extra candidates together with the oddagon." : /type 1$/i.test(branch) ? "A single extra is the sole escape." : /type 2$/i.test(branch) ? "Two single extras form a strong relation." : /lock set/i.test(branch) ? "RT combines with a locked triple capacity." : /eri/i.test(branch) ? "RT is transferred through ERI." : "The current Branch constrains the extra candidates."}`,
      `1. Verify the 12-cell triplet body. 2. Identify candidates outside the triplet. 3. Verify the RT/Lock Set/ERI/AFW branch. 4. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: triplet body cNormal(1), auxiliary RT/AFW roles cAls1/cFins/cDouble, deletions cToDel(11) or Cannibalism(12).`,
      `Not every 12-cell three-candidate shape qualifies; the exact row/column/box arrangement, extra count and branch relation must match the enumerator.`,
    ];
  }

  if (kind === "DeathBlossom") {
    const stem = firstGroup(step, /^stem$/i), victim = firstGroup(step, /^victim$/i), set = firstGroup(step, /^set$/i), petals = groupsMatching(step, /^petals?$/i);
    return zh ? [
      `Death Blossom（${branch}）：${/classic/i.test(branch) ? `Stem ${cellNames(stem?.cells)}，Victim ${cellNames(victim?.cells)}，ALS花瓣覆盖${cellNames(petals.flatMap((g) => g.cells))}` : `核心Set ${cellNames(set?.cells)}，由${petals.length}个ALS花瓣连接`}。`,
      `${/classic/i.test(branch) ? "Stem的每个候选分支都会激活一个对应ALS花瓣；所有分支都删除Victim中的同一候选，所以该候选无条件可删。" : "核心Set具有给定自由度；每个自由分支由一个ALS花瓣吸收。花瓣把所有核心可能分配压缩到相同删数，Complex Type 3还以MSLS Rank 0校验。"}`,
      `${/classic/i.test(branch) ? "若Victim目标成立，则对Stem任一可能值，相应花瓣的RCC/共同可见关系都会矛盾；Stem必须取某值，故目标不可能。" : "设核心自由度为f，花瓣提供f个独立链接；当链接容量等于自由度时，结构Rank 0，链接外候选及重复覆盖候选可删。"}${cannibals ? ` 自噬删数：${cannibals}。` : ""}`,
      `① 读取Branch；② ${/classic/i.test(branch) ? "逐一核对Stem每个候选是否有对应ALS花瓣并都指向同一Victim目标" : "核对Set自由度、花瓣RCC及Rank 0覆盖"}；③ 应用删数${targets ? `（${targets}）` : ""}。`,
      `FB配色：Stem/Victim与Z用cFins(2)，RCC用cEdoFins(3)，ALS内部cAls2，核心Set cAls1，普通删数cToDel(11)，自噬Cannibalism(12)。`,
      `经典Death Blossom与Complex Type 1/2/3不是同一说明；Type 3(MSLS)必须按Rank 0 Set/Link结构解释。`,
    ] : [
      `Death Blossom (${branch}): ${/classic/i.test(branch) ? `stem ${cellNames(stem?.cells)}, victim ${cellNames(victim?.cells)}, ALS petals ${cellNames(petals.flatMap((g) => g.cells))}` : `core set ${cellNames(set?.cells)} with ${petals.length} ALS petals`}.`,
      `${/classic/i.test(branch) ? "Every stem candidate activates a corresponding ALS petal, and every branch removes the same victim candidate." : "The core set has a stated degree of freedom; ALS petals absorb every branch, and Type 3 uses an MSLS rank-0 check."}`,
      `${/classic/i.test(branch) ? "If the victim target were true, each possible stem value would contradict its petal; the stem must take one value, so the target is impossible." : "With f degrees of freedom and f independent links, the structure is rank 0; outside-link and overlap candidates are false."}${cannibals ? ` Cannibal targets: ${cannibals}.` : ""}`,
      `1. Read the Branch. 2. ${/classic/i.test(branch) ? "Verify one ALS petal for every stem candidate and a common victim" : "verify set freedom, petal RCCs and rank-0 cover"}. 3. Apply eliminations${targets ? ` (${targets})` : ""}.`,
      `FB colours: stem/victim and Z cFins(2), RCC cEdoFins(3), ALS internals cAls2, core set cAls1, ordinary deletions cToDel(11), cannibals Cannibalism(12).`,
      `Classic and Complex Types 1/2/3 require different explanations. Type 3 (MSLS) must be justified as a rank-0 set/link cover.`,
    ];
  }

  if (kind === "BlossomLoop") {
    const focus = firstGroup(step, /^focus$/i);
    const main = firstGroup(step, /^burringloop$/i);
    const burrs = groupsMatching(step, /^burrbranch/i);
    return zh ? [
      `Blossom Loop（${String(step?.title || branch)}）：Focus=${cellNames(focus?.cells)}{${digitText(focus?.digits)}}；Burring Loop覆盖${cellNames(main?.cells)}，另有${burrs.length}条Burr Branch。`,
      `Focus中的候选/位置/AALS唯一分支必须有一个成立。主Burring Loop连接两条活动分支，其余Focus分支分别沿Burr Branch导向同一反相结论；所有分支闭合后形成全局Rank-0式循环。`,
      `对Focus的每个可能分支fᵢ，都存在路径推出相同目标¬t；而∨fᵢ=true，所以¬t。反相AIC删数来自主环两端相位关系；Burr分支修补主环中未覆盖的Focus分支。`,
      `① 按标题区分Cell Type、Region Type、AALS Type；② 确认Focus分别是单格候选、house中同数字位置或AALS唯一候选；③ 核对Burring Loop；④ 对每个剩余Focus分支核对Burr Branch；⑤ 应用删数。`,
      `FB配色按链节点ON/OFF、ALS区域和Focus角色输出；不能只把整个链统一一种颜色。动态教程应保留Burring Loop与每条Burr Branch原始尤里卡。`,
      `Cell/Region Type在已知终解辅助搜索时只检查包含真分支的端点对；AALS Type检查三个OnlyCand分支。教程必须按实际Title和Focus角色区分。`,
    ] : [
      `Blossom Loop (${String(step?.title || branch)}): Focus=${cellNames(focus?.cells)}{${digitText(focus?.digits)}}; Burring Loop spans ${cellNames(main?.cells)}, with ${burrs.length} Burr Branches.`,
      `One Focus candidate/position/AALS branch must be true. The main loop connects two active branches, while every remaining Focus branch follows a Burr Branch to the same opposite conclusion; together they close a global rank-0-like loop.`,
      `For every Focus case fᵢ there is a path to the same ¬t, and ∨fᵢ=true, so ¬t. Anti-phase AIC eliminations come from the phase relation of main-loop endpoints; Burr Branches repair uncovered Focus cases.`,
      `1. Distinguish Cell, Region and AALS Type. 2. Verify the Focus role. 3. Verify the Burring Loop. 4. Verify one Burr Branch for every other Focus case. 5. Apply eliminations.`,
      `FB colours preserve ON/OFF chain nodes, ALS areas and Focus roles; do not flatten the whole chain to one colour. Keep the raw Burring Loop and each Burr Branch eureka.`,
      `Cell/Region Type may use the known solution only to select endpoint pairs containing the true branch; AALS Type checks all three OnlyCand branches. Explain the actual Title and Focus role.`,
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
  const deadly = deadlyDigitsForStep(step) || (zh ? "相应致命数字组" : "the deadly digit set");
  const body = roleCellText(step, /^(urbody|arbody|ulbody|xrbody)$/i)
    || ((kind === "UniqueRectangle" || kind === "AvoidableRectangle") ? firstCellsText(step, 4) : cellNames(structureCells(step)));
  const target = digitText(list(step?.candidates)) || (zh ? "目标数字" : "the target digit");
  const uniquenessCheck = zh
    ? "只适用于确认具有唯一解的标准数独；结构、角色或候选状态少一项都不能套用。"
    : "Use only on a standard Sudoku confirmed to have one solution; do not apply the rule if any structural role or candidate condition is missing.";

  if (kind === "GSP") {
    const symmetry = uniquenessRole(step, /^symmetry$/i)?.tail || (zh ? "给定" : "reported");
    const selfDigits = roleDigitText(step, /^self$/i);
    const selfCells = roleCellText(step, /^self$/i);
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
    const cell = roleCellText(step, /^bugplusonecell$/i) || cellNames(structureCells(step));
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
    let math = zh ? `令守护析取为 G₁∨…∨Gₙ。若全部Gᵢ为假，盘面退化为完整BUG，因此该析取必真。` : `Let the guardian disjunction be G₁∨…∨Gₙ. If every Gᵢ were false, the grid would be a complete BUG, so the disjunction is true.`;
    if (/type 1/.test(key)) variant = zh ? "守护候选全在同一格，该格必须取守护之一" : "all guardians occupy one cell, which must take one of them";
    else if (/type 2/.test(key)) variant = zh ? "守护候选同数字，公共可见位置可删该数字" : "all guardians use one digit, removable from common peers";
    else if (/type 3/.test(key)) variant = zh ? "守护候选与裸数组共同锁满容量" : "guardians combine with a naked subset to fill capacity";
    else if (/type 4/.test(key)) variant = zh ? "守护格中的共轭对与守护析取共同删数" : "a conjugate pair in guardian cells combines with the guardian disjunction";
    return zh ? [
      `去掉${gc || "高亮位置"}中的守护候选${gd}后，盘面会形成完整BUG；本分支为：${variant}。`,
      "完整BUG存在成对互换的第二解，因此守护候选不可能全部为假；Type 1–4 再利用同格、同数字、数组或共轭关系推出具体结论。",
      math,
      "① 找出所有异常格及其伪双值对；② 计算每格守护候选；③ 确认守护全假会闭合BUG；④ 按步骤说明识别Type并应用结论。",
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

  if (/external test \+ xy-wing/.test(key)) {
    const ga = roleCellText(step, /^guardiansa$/i) || (zh ? "第一组守护候选" : "guardian group A");
    const gb = roleCellText(step, /^guardiansb$/i) || (zh ? "第二组守护候选" : "guardian group B");
    const wa = roleCellText(step, /^winga$/i) || cellNames(structureCells(step).slice(-2, -1));
    const wb = roleCellText(step, /^wingb$/i) || cellNames(structureCells(step).slice(-1));
    return zh ? [
      `以${deadly}为致命数字的唯一矩形，外部守护候选通过两个双值翼格转化为共同数字${target}的XY-Wing删数。`,
      `若所有${deadly}守护候选都为假，${body || "四角"}退化为致命矩形，所以守护集合至少一真。${ga}成立会迫使${wa || "第一翼"}取${target}；${gb}成立会迫使${wb || "第二翼"}取${target}。`,
      `设两类守护析取为 Gₐ∨Gᵦ。双值翼给出 Gₐ⇒Wₐ(${target})、Gᵦ⇒Wᵦ(${target})，故 Wₐ(${target})∨Wᵦ(${target})。任何同时看见两翼的${target}均为假。`,
      `① 找${deadly}唯一矩形四角；② 分组找两类外部守护候选；③ 找分别看见对应全部守护候选的双值翼格；④ 删除同时看见两翼的${target}。`,
      `四角UR主体、两组Guardians、Wing A、Wing B和删数目标必须使用不同角色显示；${target}是共同删数数字，不是致命数字。`,
      `${uniquenessCheck} 还要确认每个翼格看见对应数字的全部守护候选，目标同时看见两个翼格。`,
    ] : [
      `A Unique Rectangle with deadly digits ${deadly} converts its external guardians through two bivalue wings into an XY-Wing elimination on shared digit ${target}.`,
      `If every ${deadly} guardian were false, ${body || "the four corners"} would become a deadly rectangle, so at least one guardian is true. ${ga} forces ${wa || "wing A"} to ${target}; ${gb} forces ${wb || "wing B"} to ${target}.`,
      `Let the guardian disjunction be Gₐ∨Gᵦ. The bivalue wings give Gₐ⇒Wₐ(${target}) and Gᵦ⇒Wᵦ(${target}), hence Wₐ(${target})∨Wᵦ(${target}). Any ${target} seeing both wings is false.`,
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
  let math = zh ? `令D表示只含致命数字组${deadly}的主体。D有两个交替完成方式，所以唯一解盘面必须满足“至少一个破坏条件Eᵢ为真”。删数来自该析取与当前Type附加约束。` : `Let D be the body restricted to deadly set ${deadly}. D has two alternating completions, so a unique puzzle requires at least one escape Eᵢ. The elimination follows from that disjunction plus the Type-specific constraint.`;
  let steps = zh ? "① 找致命主体；② 确认致命数字组；③ 找破坏格或外部角色；④ 按实际Type核对容量/共轭/Wing关系；⑤ 应用结论。" : "1. Find the deadly body. 2. Confirm the deadly digit set. 3. Identify escape or external roles. 4. Check the actual Type's capacity/conjugacy/Wing relation. 5. Apply the conclusion.";
  let highlight = zh ? "致命主体、破坏格、辅助数组/强链和删数目标应分角色显示，不能把全部高亮格统称为矩形或环。" : "Display the deadly body, escape cells, auxiliary subset/strong link and targets as separate roles; do not call every highlighted cell the rectangle or loop.";
  if (/external test 1/.test(key)) variantIdea = zh ? "唯一外部守护格必须保留致命数字之一" : "the sole external guardian cell must keep one deadly digit";
  else if (/external test 2\/4/.test(key)) variantIdea = zh ? "一种致命数字没有外部守护，另一数字的守护集合至少一真" : "one deadly digit has no external guardian, so a guardian of the other digit is true";
  else if (/external test 3h/.test(key)) variantIdea = zh ? "外部守护与隐性数组共同锁定区域容量" : "external guardians and a hidden subset lock house capacity";
  else if (/external test 3/.test(key)) variantIdea = zh ? "外部守护与裸数组共同锁定区域容量" : "external guardians and a naked subset lock house capacity";
  else if (/aur \+ (xy|xyz)-wing/.test(key)) variantIdea = zh ? `屋顶额外候选的至少一真条件经Wing传到共同数字${target}` : `the roof-extra disjunction is carried through a Wing to shared digit ${target}`;
  else if (/aur \+ wxyz-(wing|ring)/.test(key)) variantIdea = zh ? "屋顶额外候选与三个外部节点形成WXYZ待定数组/闭环" : "roof extras and three external nodes form a WXYZ almost-locked set/ring";
  else if (/hidden rectangle/.test(key)) variantIdea = zh ? "行列共轭关系隐藏锁定一个致命数字" : "row and column conjugacies hidden-lock one deadly digit";
  else if (/type 1/.test(key)) variantIdea = zh ? "只有一个破坏格，不能让它退化为致命数字组" : "there is one escape cell, which must not collapse to the deadly set";
  else if (/type (2|5)/.test(key)) variantIdea = zh ? "两个破坏格共享一个至少一真的额外数字" : "two escape cells share one extra digit that is true in at least one";
  else if (/type 3/.test(key)) variantIdea = zh ? "破坏候选与裸数组共同占满容量" : "escape candidates and a naked subset fill capacity";
  else if (/type 4/.test(key)) variantIdea = zh ? "一个致命数字在破坏格中形成共轭对" : "one deadly digit is conjugate across the escape cells";
  else if (/type 6/.test(key)) variantIdea = zh ? "一个致命数字的外部落点被清空，落点限制在主体角点" : "one deadly digit has no outside positions and is confined to the body corners";
  else if (/type 7/.test(key)) variantIdea = zh ? "外部强链/S-Ring把致命端点连接成闭合约束" : "external strong links/S-Ring close the deadly endpoints";
  else if (/uniqueness test/.test(key)) {
    const branches = groupsMatching(step, /^branch$/i).map((group) => group.tail).filter(Boolean);
    variantIdea = branches.length
      ? (zh ? `多个唯一性分支合并：${branches.join("、")}` : `multiple uniqueness branches are merged: ${branches.join(", ")}`)
      : (zh ? "多个唯一性分支产生不同删数并被合并" : "multiple uniqueness branches produce distinct merged eliminations");
  }
  return zh ? [
    `${family}以${deadly}为致命数字组；当前分支的关键是：${variantIdea}。`,
    `若所有破坏条件都失效，${body || "高亮主体"}只剩${deadly}并出现两种交替完成方式；当前Type的额外关系把“至少一个破坏条件成立”转化为本步结论。`,
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
  const branch = groupTails(step, "Branch").join(zh ? "、" : ", ") || String(step?.title || kind);
  const form = firstGroupTail(step, "ChainForm");
  const pattern = firstGroupTail(step, "StrongPattern");
  const threeStrongClass = firstGroupTail(step, "ThreeStrongClass");
  const reasons = groupTails(step, "EdgeReason");
  const looking = zh
    ? `① 按尤里卡顺序读取节点；② 逐边确认“=”强关系和“-”弱关系；③ ${pattern ? `按${pattern}核对V/L三强边分类` : "核对起点、终点及端点关系"}；④ ${form === "ContinuousLoop" || form === "Ring" || form === "Cycle" ? "逐条检查闭环弱边产生的删数" : form === "DiscontinuousLoop" ? "检查断点候选的强制定值/删数" : "检查两个开放端点共同推出的目标"}。`
    : `1. Read nodes in Eureka order. 2. Verify every '=' strong link and '-' weak link. 3. ${pattern ? `classify the three strong links by V/L pattern ${pattern}` : "verify start, end and endpoint relation"}. 4. ${form === "ContinuousLoop" || form === "Ring" || form === "Cycle" ? "check eliminations from every loop weak link" : form === "DiscontinuousLoop" ? "check the forced action at the discontinuity" : "check the target implied by the two open endpoints"}.`;
  const colours = zh
    ? `FB链配色以第一个显示节点cSTP(10)为锚点，随后沿路径交替使用cAls1(4)/cFins(2)；删数cToDel(11)。Complex AIC中的ALS、UR Guardian、Tridagon、AF、AMSLS等只按实际EdgeReason增加各自结构色。`
    : `FB chain colours anchor the first displayed node with cSTP(10), then alternate cAls1(4)/cFins(2) along the path; eliminations use cToDel(11). Complex AIC adds ALS, UR Guardian, Tridagon, AF or AMSLS context colours only when the corresponding EdgeReason is present.`;
  const check = zh
    ? `当前分支为${branch}。名称必须由实际路径得到：Wing/Ring按V/L模式和数字数分类${pattern === "LLL" ? `；LLL只有L1、L2、L3三种，本步为${threeStrongClass || "待核对"}` : ""}，CNL/DNL按端点闭合方式分类，Complex前缀只能来自本步列出的EdgeReason（${reasons.join("、") || "普通关系"}）。`
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
    const forceKind = firstGroupTail(step, "ForceChainKind") || String(step?.title || "Force Chain");
    const branches = firstGroupTail(step, "BranchCount") || String(list(step?.chainBranches).length || "");
    const targets = firstGroup(step, /^commontargets$/i);
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
    const mode = firstGroupTail(step, "DynamicMode") || String(step?.chainType || "Dynamic");
    const grouped = firstGroupTail(step, "Grouped") === "true" || /grouped/i.test(String(step?.title || ""));
    const sourceState = firstGroupTail(step, "SourceState");
    const contradiction = /contradiction/i.test(mode);
    return zh ? [
      model.structure,
      model.basis,
      model.deduction,
      contradiction
        ? `① 找源候选；② 只在${sourceState || "指定"}源状态下沿动态网络传播；③ 核对同一候选被同时推出ON/OFF；④ ${sourceState === "OFF" ? "确定源候选" : "删除源候选"}。`
        : "① 分别传播源候选ON和OFF；② 核对两侧都推出同一个出数或删数；③ 输出共同结论。",
      grouped ? "Grouped Dynamic Chain 的组节点必须整体着色和核对；不能拆成任意单格强边。" : "按实际ON/OFF网络显示源、传播节点、汇合/碰撞和结论。",
      `当前模式为${mode}。Contradiction只否定发生冲突的一个源状态；Verity则要求源ON与源OFF两侧得到完全相同的结论。`,
    ] : [
      model.structure,
      model.basis,
      model.deduction,
      contradiction
        ? `1. Identify the source. 2. Propagate only the ${sourceState || "reported"} source state. 3. Verify that one candidate is derived both ON and OFF. 4. ${sourceState === "OFF" ? "Place the source" : "Eliminate the source"}.`
        : "1. Propagate source ON and source OFF separately. 2. Verify both sides derive the same placement or elimination. 3. Emit the common conclusion.",
      grouped ? "Treat every grouped node as one proposition; do not split it into arbitrary single-cell strong links." : "Display the source, actual ON/OFF network, convergence/collision and conclusion separately.",
      `Current mode: ${mode}. Contradiction refutes only the conflicting source state; Verity requires exactly the same conclusion from source ON and source OFF.`,
    ];
  }
  const isWhip = kind === "Whip" || kind === "GWhip";
  const grouped = kind === "GWhip" || kind === "GBraid" || firstGroupTail(step, "Grouped") === "true";
  const shape = firstGroupTail(step, "ProofShape");
  const terminal = firstGroupTail(step, "Terminal");
  if (isWhip) {
    return zh ? [
      model.structure,
      "Whip是一条单一主干。假设目标候选成立后，每个右链接候选都在当时已累计排除的局面中成为唯一可成立者；这不是把一条静态AIC简单拉长。",
      `沿主干传播后，${terminal ? `终止条件${terminal}` : "某个终止格或house-digit约束"}失去全部合法候选，因此目标假设为假。`,
      "① 假设目标为真；② 逐层核对左链接被排除；③ 核对右链接在当前局面中唯一；④ 确认终止格/区域被排空；⑤ 删除目标。",
      grouped ? "g-Whip 的组节点作为一个合法分组节点整体显示；ON/OFF主干和最终删数沿用FB链配色。" : "目标、主干ON/OFF节点、终止约束和删数分层显示。",
      "若完整回放出现真正分叉，就不是Whip而应归入Braid；Whip必须保持SingleSpine。",
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
    `实际证明形态必须为Branching。${shape === "Branching" ? "本步已确认存在真实分叉，保持Braid/g-Braid分类。" : "若完整回放是SingleSpine，搜索器必须重命名为Whip/g-Whip。"}`,
  ] : [
    model.structure,
    `A ${grouped ? "grouped " : ""}Braid may branch, but every branch point must cover all currently possible left-linking candidates. The proof is exhaustive; one successful branch is insufficient.`,
    "Under the target assumption, expand every legal branch. Each branch continues forcing until all branches collectively empty the terminal cell or house, so the target is false.",
    "1. Assume the target. 2. Enumerate all left-linking candidates at every branch point. 3. Replay each branch. 4. Verify all branches reach the terminal failure. 5. Eliminate the target.",
    grouped ? "Keep grouped nodes intact and display branches, shared nodes, terminal constraint and deletion as separate roles." : "Display branches, shared nodes, terminal constraint and deletion as separate roles.",
    `The actual proof shape must be Branching. ${shape === "Branching" ? "This step contains genuine branching and remains Braid/g-Braid." : "If complete replay is SingleSpine, the detector must rename it Whip/g-Whip."}`,
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
    const advanced = /advanced/i.test(branch);
    return zh ? [
      model.structure, model.basis, model.deduction,
      advanced
        ? "① 确认核心格；② 为每个数字比较行/列/宫覆盖成本；③ 枚举浮动数字的行侧/列侧分配；④ 纳入被链接强制加入的Attachment；⑤ 核对CellCount=LinkCount并应用外部/自噬删数。"
        : "① 确认核心格；② 逐数字计算占用的行、列、宫；③ 选取最低成本覆盖；④ 核对最小Link总数等于核心格数；⑤ 应用外部与重复覆盖删数。",
      "Core、Attachment、实际Link、PermutableDigits和删数必须分层显示；不能只写一个笼统的Rank 0。",
      `${branch}。Exact与Advanced/Attachment是不同搜索路径；只有实际输出的分支与角色可写入教程。`,
    ] : [
      model.structure, model.basis, model.deduction,
      advanced
        ? "1. Confirm the core. 2. Compare row/column/box cover cost for every digit. 3. Enumerate row-side/column-side choices for floating digits. 4. Absorb forced attachment cells. 5. Verify CellCount=LinkCount and apply outside/cannibal eliminations."
        : "1. Confirm the core. 2. Count occupied rows, columns and boxes for every digit. 3. Select the minimum cover. 4. Verify total minimum links equal core cells. 5. Apply outside and duplicate-cover eliminations.",
      "Display Core, Attachment, actual Links, PermutableDigits and eliminations separately; do not reduce the step to a generic rank-0 sentence.",
      `${branch}. Exact and Advanced/Attachment are distinct search paths; describe only the branch and roles actually emitted.`,
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
    `${branch}；实际检查=${checks.join("、") || "无额外Check"}。${weak ? `本步只使用${weakActualZh}；未输出的检查不得补入证明。${hasMirrorCheck ? " Mirror Check是M格检查，不是T邻规则。" : ""}` : "没有输出的Exocet子规则不得补入证明。"}`,
  ] : [
    model.structure, model.basis, model.deduction,
    "1. Confirm the base and base candidates. 2. Verify target and cross/S-cell roles. 3. Apply only checks actually listed by this step. 4. Match every check to its eliminations and highlights. 5. Apply the conclusion.",
    "Display Base, target groups, cross/S-cells, locked non-base, Mirror, True Base and other actual roles separately; do not colour every JE/SE/WE the same way.",
    `${branch}; actual checks=${checks.join(", ") || "none"}. ${weak ? `This step uses only ${weakActualEn}; do not add checks that were not emitted.${hasMirrorCheck ? " Mirror Check is the M-cell check, not the Adjacent-Target rule." : ""}` : "Do not add Exocet sub-rules that were not emitted."}`,
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
