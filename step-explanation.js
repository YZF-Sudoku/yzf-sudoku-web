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
const ODDAGONS = new Set(["BivalueOddagon", "TripletOddagon"]);
const ALS_KINDS = new Set([
  "AlmostPair", "AlmostTriple", "SueDeCoq", "ALSXZ", "ALSXYWing", "ALSWWing",
  "AHSXZ", "AHSXYWing", "AHSWWing", "ALSChain", "AHSChain", "DeathBlossom",
]);
const CHAIN_KINDS = new Set([
  "XChain", "XYChain", "AIC", "GroupedAIC", "ComplexAIC", "Whip", "GWhip",
  "DynamicChain", "Braid", "GBraid",
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
  const digitBearing = /^(alsa|alsb|alsc|ahsa|ahsb|ahsc|rcc|rccx|rccy|x|z|stronglink|set|petal|fin|fins|regfin|regfins|eri|link)$/i.test(headKey);
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

function category(step) {
  const kind = String(step?.kind || "");
  const title = String(step?.title || "");
  if (DIRECT_KINDS.has(kind)) return "single";
  if (kind === "LockedCandidates") return "locked";
  if (NAKED_SUBSETS.has(kind)) return "nakedSubset";
  if (HIDDEN_SUBSETS.has(kind)) return "hiddenSubset";
  if (NORMAL_FISH.has(kind)) return "fish";
  if (FINNED_FISH.has(kind)) return "finnedFish";
  if (COMPLEX_FISH.has(kind)) return "complexFish";
  if (SINGLE_DIGIT.has(kind)) return "singleDigit";
  if (kind === "Fireworks") return "fireworks";
  if (REGULAR_WINGS.has(kind)) return kind === "WXYZWing" ? "bentAlsWing" : "wing";
  if (UNIQUENESS.has(kind)) return "uniqueness";
  if (ODDAGONS.has(kind)) return "oddagon";
  if (kind === "BrokenWing" || /Broken (?:Wing|Loop)|Guardian/i.test(title)) return "guardian";
  if (ALS_KINDS.has(kind)) return kind === "DeathBlossom" ? "deathBlossom" : "als";
  if (FORCING_KINDS.has(kind)) return "forcing";
  if (CHAIN_KINDS.has(kind)) {
    if (/\b(?:W|M|S|L|M2|M3)-?Wing\b|Nice Loop|Ring/i.test(title)) return "chain";
    return kind === "DynamicChain" ? "dynamic" : "chain";
  }
  if (RANK_KINDS.has(kind)) return kind === "BlossomLoop" ? "blossomLoop" : "rank";
  if (EXOCET_KINDS.has(kind)) return "exocet";
  if (Number(step?.rank || 0) !== 0 || /Rank|Multifish|MSLS|SK Loop/i.test(title)) return "rank";
  if (kind === "BruteForce") return "bruteForce";
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
  const cell = cellName(placement) || cellNames(structureCells(step), 1) || (zh ? "目标格" : "the target cell");
  const digit = Number(placement?.value ?? candidateValues(placement)[0]) || primaryDigits(step);
  if (kind === "HiddenSingle") {
    const house = houseLabel(step, locale);
    return {
      structure: zh ? `数字${digit}在${house}中的候选位置只剩${cell}。` : `Digit ${digit} has only one remaining position in ${house}: ${cell}.`,
      basis: zh ? "同一数字在每个行、列、宫中都必须出现一次，而且不能重复。" : "Each digit must appear exactly once in every row, column and box.",
      deduction: zh ? `如果${cell}不填${digit}，那么${house}中将没有位置可以放入${digit}。` : `If ${cell} were not ${digit}, ${house} would have no place for digit ${digit}.`,
    };
  }
  if (kind === "FullHouse") {
    const house = houseLabel(step, locale);
    return {
      structure: zh ? `${house}只剩${cell}尚未填数，缺少的数字是${digit}。` : `${house} has only ${cell} unfilled, and the missing digit is ${digit}.`,
      basis: zh ? "一个完整区域必须恰好包含数字1到9。" : "A complete house must contain digits 1 through 9 exactly once.",
      deduction: zh ? `${cell}只能补上该区域缺少的数字${digit}。` : `${cell} must take the missing digit ${digit}.`,
    };
  }
  return {
    structure: zh ? `${cell}的候选数只剩${digit}。` : `${cell} has only candidate ${digit} left.`,
    basis: zh ? "一个单元格最终只能填入一个数字。" : "A cell can contain only one digit.",
    deduction: zh ? `其他候选都已被排除，因此${cell}只能填${digit}。` : `All other candidates are excluded, so ${cell} must be ${digit}.`,
  };
}

function lockedExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const digit = primaryDigits(step) || (zh ? "目标数字" : "the target digit");
  const source = houseLabel(step, locale);
  const cells = structureCells(step);
  const locked = commonHouses(cells).filter((house) => house !== source);
  const target = locked[0] || (zh ? "同一交叉区域" : "one crossing house");
  return {
    structure: zh
      ? `数字${digit}在${source}中的所有候选位置都位于${target}${cellNames(cells) ? `（${cellNames(cells)}）` : ""}。`
      : `Every position for digit ${digit} in ${source} lies in ${target}${cellNames(cells) ? ` (${cellNames(cells)})` : ""}.`,
    basis: zh ? "数字必须在原区域中出现一次，因此它必然占用这条交叉区域中的一个位置。" : "The digit must occur once in the source house, so it must occupy one of those positions in the crossing house.",
    deduction: zh ? `因此，${target}中位于交叉部分之外的其他${digit}候选不能成立。` : `Therefore other ${digit} candidates in ${target}, outside the intersection, are false.`,
  };
}

function subsetExplanation(step, locale, hidden) {
  const zh = localeKey(locale) === "zh";
  const cells = cellNames(structureCells(step)) || (zh ? "高亮单元格" : "the highlighted cells");
  const digits = primaryDigits(step) || (zh ? "相关数字" : "the relevant digits");
  const house = houseLabel(step, locale);
  const count = FISH_SIZE[String(step?.kind || "")] || list(structureCells(step)).length || digitText(String(digits).match(/[1-9]/g) || []).length;
  if (hidden) {
    return {
      structure: zh ? `在${house}中，数字${digits}只可能出现在${cells}。` : `In ${house}, digits ${digits} can appear only in ${cells}.`,
      basis: zh ? `${count || "同样数量的"}个数字被限制在同样数量的单元格中，这些单元格必须留给它们。` : `${count || "The same number of"} digits are confined to the same number of cells, reserving those cells for them.`,
      deduction: zh ? `所以这些单元格中的其他候选数都可以删除。` : `Therefore all other candidates in those cells can be removed.`,
    };
  }
  return {
    structure: zh ? `在${house}中，${cells}只能容纳数字${digits}。` : `In ${house}, ${cells} can contain only digits ${digits}.`,
    basis: zh ? `${count || "同样数量的"}个单元格正好锁定同样数量的数字，因此这些数字必须全部填在这里。` : `${count || "The same number of"} cells lock the same number of digits, so those digits must fill these cells.`,
    deduction: zh ? `所以${house}中其他单元格不能再保留数字${digits}。` : `Therefore the other cells in ${house} cannot contain digits ${digits}.`,
  };
}

function fishExplanation(step, locale, mode) {
  const zh = localeKey(locale) === "zh";
  const digit = primaryDigits(step) || (zh ? "目标数字" : "the target digit");
  const axes = fishAxes(step);
  const finCells = groupCells(step, /fin/i);
  const bases = axes.bases.length ? axes.bases.join("、") : (zh ? "高亮的基准区域" : "the highlighted base sets");
  const covers = axes.covers.length ? axes.covers.join("、") : (zh ? "高亮的覆盖区域" : "the highlighted cover sets");
  const structure = zh
    ? `数字${digit}的候选在基准区域${bases}中，全部落入覆盖区域${covers}${finCells.length ? `；鳍候选为${finCells.join("、")}` : ""}。`
    : `For digit ${digit}, every candidate in base sets ${bases} lies in cover sets ${covers}${finCells.length ? `; the fin candidates are ${finCells.join(", ")}` : ""}.`;
  if (mode === "finnedFish") {
    return {
      structure,
      basis: zh ? "分两种情况：鳍为假时，结构退化为普通鱼；鳍为真时，鳍本身会排除与它同区域的目标候选。" : "Split into two cases: if the fin is false, the pattern becomes a normal fish; if the fin is true, the fin itself eliminates targets that see it.",
      deduction: zh ? "只有在这两种情况下都不能成立的候选，才是本步可以删除的候选。" : "Only candidates that are false in both cases may be eliminated.",
    };
  }
  if (mode === "complexFish") {
    return {
      structure,
      basis: zh ? "每个基准区域都必须提供一个该数字的真数；覆盖区域的总容量负责承接这些真数。" : "Each base set must provide one true instance of the digit, and the cover-set capacity must carry those truths.",
      deduction: zh ? "当基准区域的必要真数已经占满覆盖容量时，覆盖区域中不属于鱼身承接位置的额外候选不能成立。复杂鱼允许行、列、宫混合作为区域，但容量关系不变。" : "Once the required base truths fill the cover capacity, extra candidates in the covers outside the fish body are false. Complex fish may mix rows, columns and boxes, but the capacity argument is unchanged.",
    };
  }
  return {
    structure,
    basis: zh ? "每个基准区域都必须放入一个该数字，而这些真数只能分布在同样数量的覆盖区域中。" : "Each base set must contain the digit, and those truths can occupy only the same number of cover sets.",
    deduction: zh ? "覆盖区域的名额已经由基准区域中的真数占满，因此覆盖区域中鱼身之外的同数字候选可以删除。" : "The cover capacity is occupied by the base truths, so same-digit candidates in the covers outside the fish body can be removed.",
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

function uniquenessExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const kind = String(step?.kind || "");
  const title = String(step?.title || kind);
  const cells = cellNames(structureCells(step));
  if (kind === "GSP") {
    return {
      structure: zh ? `当前候选与完成盘中的对称映射${cells ? `（涉及${cells}）` : ""}共同形成 GSP 结构。` : `The current candidates and the solution's symmetry mapping${cells ? ` (involving ${cells})` : ""} form a GSP pattern.`,
      basis: zh ? "若保留目标候选，对称映射将产生另一个同样满足行、列、宫规则的完成盘。" : "Keeping the target would let the symmetry mapping produce another completed grid satisfying all row, column and box rules.",
      deduction: zh ? "这与题目的唯一解前提矛盾，因此目标候选不能成立。" : "That contradicts the puzzle's unique-solution premise, so the target is false.",
    };
  }
  if (kind === "BUGOne" || kind === "BUGPlusN") {
    return {
      structure: zh ? `除额外候选外，剩余盘面接近“每个未填格双值、每个候选在区域中出现两次”的 BUG 状态。` : `Apart from the extra candidates, the unsolved grid is near a BUG state: every unsolved cell is bivalue and every candidate occurs twice in each relevant house.`,
      basis: zh ? "完整 BUG 状态允许候选成对互换，会产生两个解。唯一解题必须由额外候选打破这种平衡。" : "A complete BUG state allows a paired swap and yields two solutions. A unique puzzle must be broken by the extra candidates.",
      deduction: zh ? "因此，后端报告的额外候选必须按该变体的约束取真或被删除。" : "Therefore the reported extra candidate must be true or eliminated according to the specific BUG variant.",
    };
  }
  return {
    structure: zh ? `${title}${cells ? `的致命主体位于${cells}` : "形成一个可交换的局部结构"}。` : `${title}${cells ? ` has its deadly core in ${cells}` : " forms a locally swappable pattern"}.`,
    basis: zh ? "唯一性技巧采用反证：如果目标候选保留，局部数字可以互换而不破坏行、列、宫规则，从而得到第二个解。" : "Uniqueness techniques use contradiction: keeping the target would allow a local digit swap without breaking row, column or box rules, producing a second solution.",
    deduction: zh ? "题目以唯一解为前提，因此会完成致命结构或消除全部破坏点的候选不能成立。具体 Type 的结构细节以原始证明为准。" : "Under the unique-solution premise, a candidate that completes the deadly pattern or removes every escape is false. The exact Type-specific structure is preserved in the backend proof.",
  };
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
  const grouped = nodes.filter((node) => /group/i.test(String(node?.kind || ""))).length;
  const sets = nodes.filter((node) => /als|ahs/i.test(String(node?.kind || ""))).length;
  const structureBits = [
    zh ? `${nodes.length || "若干"}个节点` : `${nodes.length || "several"} nodes`,
    edges.length ? (zh ? `${edges.length}条关系` : `${edges.length} inferences`) : "",
    grouped ? (zh ? `${grouped}个区块节点` : `${grouped} grouped nodes`) : "",
    sets ? (zh ? `${sets}个待定数组节点` : `${sets} ALS/AHS nodes`) : "",
  ];
  if (dynamic) {
    return {
      structure: zh ? `本步从一个候选的成立/不成立两种状态展开${branches.length || "多条"}动态分支（${sentenceParts(structureBits, locale)}）。` : `This step expands the ON/OFF states of one candidate into ${branches.length || "multiple"} dynamic branches (${sentenceParts(structureBits, locale)}).`,
      basis: zh ? "每个分支都使用合法的强关系、弱关系和子技巧继续传播；全部分支覆盖了原候选的所有可能状态。" : "Each branch propagates through valid strong/weak inferences and sub-techniques, and together the branches cover every possible state of the source candidate.",
      deduction: zh ? "当全部分支得到同一删数/出数，或某个假设同时推出候选成立和不成立时，该共同结论必然成立。具体分支见原始证明。" : "If every branch yields the same action, or an assumption derives a candidate both true and false, the common conclusion is forced. See the backend proof for the branches.",
    };
  }
  const kind = String(step?.kind || "");
  const title = String(step?.title || "");
  const isWhip = kind === "Whip" || kind === "GWhip";
  const isLoop = /Continuous|Nice Loop|Ring|Cycle/i.test(title);
  const structureText = structureBits.filter(Boolean).join(zh ? "、" : ", ");
  return {
    structure: zh ? `链由${structureText}组成${isLoop ? "，并首尾闭合" : ""}。` : `The chain contains ${structureText}${isLoop ? " and closes into a loop" : ""}.`,
    basis: zh ? "强关系表示两端至少一真，弱关系表示两端不能同时为真；两种关系交替传递真假状态。" : "A strong inference means at least one endpoint is true; a weak inference means the endpoints cannot both be true. Alternating them propagates truth values.",
    deduction: isWhip
      ? (zh ? "Whip 从目标候选为真的假设出发，逐层收紧候选，最终使某个区域或单元格没有合法候选，因此原假设为假。" : "A Whip assumes the target true, progressively restricts candidates, and ends with a cell or house having no legal candidate, so the assumption is false.")
      : (isLoop
        ? (zh ? "闭环使首尾关系同时生效：若为连续环，可在每个弱连接处产生删数；若为不连续环，断点处直接得到出数或删数。完整顺序见尤里卡表达式。" : "Closing the loop activates both end relations: a continuous loop eliminates at every weak link, while a discontinuous loop gives a placement or elimination at the break. See the Eureka expression for the exact order.")
        : (zh ? "链的两个端点不能同时为假，或某个假设沿链传递后回到矛盾；因此与端点关系冲突的目标候选可以删除。完整顺序见尤里卡表达式。" : "The endpoints cannot both be false, or an assumption propagates to contradiction; therefore the target conflicting with the endpoint relation is false. See the Eureka expression for the exact order.")),
  };
}

function forcingExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const branches = list(step?.chainBranches);
  const nodes = list(step?.nodes);
  return {
    structure: zh ? `对一个单元格或区域中的全部${branches.length || "可能"}种取值分别建立推理分支${nodes.length ? `，共记录${nodes.length}个链节点` : ""}。` : `A separate inference branch is built for every possible value in one cell or house${nodes.length ? `, recording ${nodes.length} chain nodes` : ""}.`,
    basis: zh ? "这些分支穷尽了目标单元格或区域的全部合法可能，因此至少有一条分支必须对应真实解。" : "The branches exhaust every legal possibility of the target cell or house, so at least one branch must match the solution.",
    deduction: zh ? "所有分支都得到的共同结论必然成立；若某分支产生矛盾，则该分支的起始假设可以排除。完整分支见原始证明。" : "A conclusion reached by every branch is forced; if one branch contradicts itself, its starting assumption is false. See the backend proof for the full branches.",
  };
}

function rankExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const rank = Number(step?.rank || 0);
  const truthGroups = groupsMatching(step, /truth|base/i);
  const linkGroups = groupsMatching(step, /link|cover/i);
  const groupText = sentenceParts([
    truthGroups.length ? (zh ? `强区域${truthGroups.length}组` : `${truthGroups.length} truth/base groups`) : "",
    linkGroups.length ? (zh ? `弱区域${linkGroups.length}组` : `${linkGroups.length} link/cover groups`) : "",
    Number.isFinite(rank) ? `rank ${rank}` : "",
  ], locale);
  const title = String(step?.title || "");
  if (/SK Loop/i.test(title) || String(step?.kind || "") === "SKLoop") {
    return {
      structure: zh ? `四宫矩形中的双数字链接首尾闭合，形成多米诺环${groupText ? `（${groupText}）` : ""}。` : `Two-digit links in a four-box rectangle close into a Domino/SK Loop${groupText ? ` (${groupText})` : ""}.`,
      basis: zh ? "环中的必要真数和可容纳真数的链接容量相等，构成零秩结构。" : "The required truths and the link capacity are equal, creating a rank-0 structure.",
      deduction: zh ? "因此每个链接必须恰好承接一个真数；会重复占用链接、或位于已被覆盖位置的额外候选可以删除。" : "Each link must carry exactly one truth, so candidates that double-cover a link or occupy already covered capacity can be removed.",
    };
  }
  return {
    structure: zh ? `本步把必须满足的强区域与容纳它们的弱区域作为整体比较${groupText ? `（${groupText}）` : ""}。` : `This step compares required truth regions with the link regions that can carry them${groupText ? ` (${groupText})` : ""}.`,
    basis: zh ? "强区域至少需要一个真数，弱区域至多容纳一个真数；rank 等于弱区域数减去强区域数。" : "Each truth region needs at least one true candidate, each link region can contain at most one, and rank is links minus truths.",
    deduction: rank === 0
      ? (zh ? "零秩时，弱区域的容量刚好被必要真数占满；额外候选若成立会挤占容量，因此可以删除。" : "At rank 0, the link capacity is exactly filled by the required truths; an extra candidate would consume unavailable capacity and is false.")
      : (zh ? "非零秩结构只允许使用后端明确证明的重叠、例外或守护关系；本步结论以原始证明列出的覆盖关系为准。" : "For nonzero rank, only explicitly proved overlaps, exceptions or guardians are usable; follow the backend proof for the exact coverage relation."),
  };
}

function exocetExplanation(step, locale) {
  const zh = localeKey(locale) === "zh";
  const baseGroups = groupsMatching(step, /^base(?:a|b|q|r)?$|^base\d*$/i);
  const targetGroups = groupsMatching(step, /^target|^targets/i);
  const cross = firstGroup(step, /^cross/i);
  const mirror = firstGroup(step, /^mirror/i);
  const weakSeat = firstGroup(step, /^weakseat|^weak/i);
  const roles = [];
  baseGroups.forEach((group, index) => roles.push(roleSummary(group, locale, zh ? `基准单元格${baseGroups.length > 1 ? String.fromCharCode(65 + index) : ""}` : `Base${baseGroups.length > 1 ? ` ${String.fromCharCode(65 + index)}` : ""}`)));
  targetGroups.forEach((group, index) => roles.push(roleSummary(group, locale, zh ? `目标单元格${targetGroups.length > 1 ? String.fromCharCode(65 + index) : ""}` : `Targets${targetGroups.length > 1 ? ` ${String.fromCharCode(65 + index)}` : ""}`)));
  if (cross) roles.push(roleSummary(cross, locale, zh ? "交叉单元格" : "Cross cells"));
  if (mirror) roles.push(roleSummary(mirror, locale, zh ? "镜面单元格" : "Mirror cells"));
  if (weakSeat) roles.push(roleSummary(weakSeat, locale, zh ? "弱位" : "Weak seat"));
  const title = String(step?.title || step?.kind || "Exocet");
  const isWeak = String(step?.kind || "") === "WeakExocet" || /Weak/i.test(title);
  return {
    structure: roles.length
      ? `${sentenceParts(roles, locale)}。`
      : (zh ? `${title} 的基准、目标和交叉结构由高亮与原始证明给出。` : `The highlighted cells and backend proof define the base, target and cross roles of ${title}.`),
    basis: isWeak
      ? (zh ? "衰弱飞鱼只保留部分基准—目标承接约束，因此不能套用完整初级飞鱼的全部删数规则。" : "A Weak Exocet preserves only part of the base-target carrying constraints, so the full Junior Exocet deletion set does not apply.")
      : (zh ? "基准单元格中的两个真数必须由目标单元格承接；交叉单元格和 S-cell 的容量保证目标不能改用不相容的数字。" : "The two true base digits must be carried by the target cells, while cross-cell and S-cell capacity prevents the targets from using incompatible digits."),
    deduction: zh ? "凡是会使某个基准真数无处承接、让目标单元格无法保持同一真数对，或使交叉容量超限的候选，都不能成立。扩展形态只采用原始证明明确给出的检查。" : "A candidate is false if it leaves a true base digit unsupported, prevents the targets from holding the same true pair, or exceeds cross-line capacity. Variants use only the checks explicitly stated in the backend proof.",
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
  return {
    structure: zh
      ? `${cells ? `搜索涉及${cells}` : "现有逻辑技巧未能继续推进盘面"}。`
      : `${cells ? `The search involves ${cells}` : "The available logical techniques could not advance the grid"}.`,
    basis: zh
      ? "穷举搜索会系统尝试仍然合法的候选，并在每个分支中持续检查行、列、宫约束；产生矛盾的分支会被回溯排除。"
      : "Exhaustive search systematically tries legal candidates and keeps checking row, column and box constraints; contradictory branches are discarded by backtracking.",
    deduction: zh
      ? "本步结论来自完整搜索，而不是一个可单独复核的逻辑技巧。它只应作为兜底结果，不应冒充普通技巧证明。"
      : "This conclusion comes from complete search rather than a separately checkable logical technique. It is a fallback result and is not presented as a normal technique proof.",
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
  const rank = Number(step?.rank || 0);
  if (digits) items.push(zh ? `候选 ${digits}` : `digits ${digits}`);
  if (cells) items.push(zh ? `结构格 ${cells}` : `${cells} cells`);
  if (nodes) items.push(zh ? `链节点 ${nodes}` : `${nodes} nodes`);
  if (branches) items.push(zh ? `分支 ${branches}` : `${branches} branches`);
  if (rank) items.push(`rank ${rank}`);
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
    checks: validationChecks(step, lang, type),
    meta: metaItems(step, lang, type),
  };
}

export function explanationCategoryForStep(step = {}) {
  return category(step);
}
