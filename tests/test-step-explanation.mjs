import assert from "node:assert/strict";
import { buildStepExplanationModel, explanationCategoryForStep } from "../step-explanation.js";

const c = (index) => ({ index, row: Math.floor(index / 9), col: index % 9 });
const elim = (index, candidates) => ({ ...c(index), candidates });
const place = (index, value) => ({ type: "place", ...c(index), value });
const base = (overrides = {}) => ({
  valid: true,
  kind: "NakedSingle",
  title: "Naked Single",
  description: "",
  candidates: [5],
  cells: [c(0)],
  actions: [place(0, 5)],
  eliminations: [],
  groups: [],
  nodes: [],
  edges: [],
  chainBranches: [],
  rank: 0,
  ...overrides,
});

const cases = [
  ["single", base()],
  ["single", base({ kind: "HiddenSingle", title: "Hidden Single", house: "r1" })],
  ["locked", base({ kind: "LockedCandidates", title: "Locked Candidates", house: "b1", candidates: [4], cells: [c(0), c(1)], actions: [], eliminations: [elim(3, [4])] })],
  ["nakedSubset", base({ kind: "NakedPair", title: "Naked Pair", house: "r1", candidates: [2, 7], cells: [c(0), c(1)], actions: [], eliminations: [elim(2, [2, 7])] })],
  ["hiddenSubset", base({ kind: "HiddenPair", title: "Hidden Pair", house: "c1", candidates: [3, 8], cells: [c(0), c(9)], actions: [], eliminations: [elim(0, [2]), elim(9, [5])] })],
  ["fish", base({ kind: "XWing", title: "X-Wing", candidates: [6], cells: [c(0), c(4), c(36), c(40)], actions: [], eliminations: [elim(13, [6])], groups: [{ label: "Base:r15", cells: [c(0), c(4), c(36), c(40)] }, { label: "Cover:c15", cells: [] }] })],
  ["finnedFish", base({ kind: "FinnedSwordfish", title: "Finned Swordfish", candidates: [9], cells: [c(0), c(4), c(8), c(27), c(31), c(54), c(58)], actions: [], eliminations: [elim(17, [9])], groups: [{ label: "Base:r147", cells: [] }, { label: "Cover:c159", cells: [] }, { label: "Fin:9", cells: [c(8)] }] })],
  ["singleDigit", base({ kind: "TwoStringKite", title: "2-String Kite", candidates: [7], cells: [c(0), c(4), c(40), c(76)], actions: [], eliminations: [elim(36, [7])] })],
  ["wing", base({ kind: "XYWing", title: "XY-Wing", candidates: [1, 2, 3], cells: [c(0), c(1), c(9)], actions: [], eliminations: [elim(10, [3])], groups: [{ label: "Pivot", cells: [c(0)] }, { label: "Wing A", cells: [c(1)] }, { label: "Wing B", cells: [c(9)] }] })],
  ["bentAlsWing", base({ kind: "WXYZWing", title: "WXYZ-Wing", candidates: [1, 2, 3, 4], cells: [c(0), c(1), c(9)], actions: [], eliminations: [elim(10, [4])] })],
  ["uniqueness", base({ kind: "UniqueRectangle", title: "Unique Rectangle Type 3", candidates: [2, 8], cells: [c(0), c(1), c(9), c(10)], actions: [], eliminations: [elim(10, [2])], description: "Unique Rectangle Type 3: deadly rectangle 28 with an extra subset." })],
  ["uniqueness", base({ kind: "GSP", title: "GSP Central", candidates: [5], cells: [c(0), c(80)], actions: [], eliminations: [elim(40, [5])], description: "Central symmetry candidate mapping: 1->9." })],
  ["als", base({ kind: "ALSXZ", title: "ALS-XZ", candidates: [3, 7], cells: [c(0), c(1), c(9)], actions: [], eliminations: [elim(10, [7])], groups: [{ label: "ALSA:137", cells: [c(0), c(1)] }, { label: "ALSB:237", cells: [c(9), c(10)] }, { label: "RCC:3", cells: [] }, { label: "Link:7", cells: [] }] })],
  ["chain", base({ kind: "AIC", title: "Continuous Nice Loop", candidates: [4], cells: [c(0), c(1), c(10)], actions: [], eliminations: [elim(9, [4])], nodes: [{ id: 1, ...c(0), digit: 4, kind: "SingleCandidate", label: "4r1c1 ON" }, { id: 2, ...c(1), digit: 4, kind: "SingleCandidate", label: "4r1c2 OFF" }], edges: [{ from: 1, to: 2, type: "weak" }, { from: 2, to: 1, type: "strong" }], description: "4r1c1 - 4r1c2 = 4r2c2 - 4r1c1 => r2c1<>4." })],
  ["dynamic", base({ kind: "DynamicChain", title: "Dynamic Contradiction Chain", candidates: [9], actions: [], eliminations: [elim(5, [9])], chainBranches: [{ label: "ON", nodes: [{ id: 1, ...c(0), digit: 9, label: "9r1c1 ON" }], edges: [] }, { label: "OFF", nodes: [{ id: 2, ...c(0), digit: 9, label: "9r1c1 OFF" }], edges: [] }], description: "If 9r1c1 then contradiction.\nON conclusion:\nChain 1: 9r1c1 = 2r1c2." })],
  ["forcing", base({ kind: "CellRegionFC", title: "Region Forcing Chain", candidates: [6], actions: [], eliminations: [elim(20, [6])], chainBranches: [{ label: "r1c1=1", nodes: [], edges: [] }, { label: "r1c1=2", nodes: [], edges: [] }], description: "r1c1=1 ... | r1c1=2 ... => r3c3<>6." })],
  ["rank", base({ kind: "MSLS", title: "MSLS", candidates: [1, 2, 3], cells: [c(0), c(1), c(9), c(10)], actions: [], eliminations: [elim(2, [1])], groups: [{ label: "Truth:r1", cells: [] }, { label: "Truth:c1", cells: [] }, { label: "Link:b1", cells: [] }, { label: "Link:r2", cells: [] }], rank: 0, description: "MSLS Rank 0: Truths=2 Links=2." })],
  ["exocet", base({ kind: "JE", title: "Almost JE4", candidates: [1, 2, 5, 9], cells: [c(67), c(68), c(79), c(80)], actions: [], eliminations: [elim(69, [1, 2, 5, 9])], groups: [{ label: "Base A", cells: [c(67), c(68)] }, { label: "Base B", cells: [c(79), c(80)] }, { label: "Targets A", cells: [c(56), c(60)] }, { label: "Targets B", cells: [c(56), c(57)] }, { label: "Cross", cells: [c(2), c(3), c(6)] }], description: "Almost JE4: Base Cells-(r8c5,r8c6)/(r9c8,r9c9); Target Cells-...\n259 meet the S-cell requirements, but 1 is not satisfied => r8c7<>1259." })],
  ["oddagon", base({ kind: "BivalueOddagon", title: "Dual Bivalue Oddagon", candidates: [2, 7], cells: [c(0), c(1), c(10)], actions: [], eliminations: [elim(20, [2])] })],
  ["guardian", base({ kind: "BrokenWing", title: "Broken Wing", candidates: [4], cells: [c(0), c(1), c(10)], actions: [], eliminations: [elim(20, [4])], groups: [{ label: "Guardians", cells: [c(0), c(10)] }] })],
  ["fireworks", base({ kind: "Fireworks", title: "Dual Fireworks ALP", candidates: [1, 8], cells: [c(0), c(4), c(36), c(40)], actions: [], eliminations: [elim(20, [8])], description: "Dual Fireworks ALP: exits r1/c1/b1." })],
  ["deathBlossom", base({ kind: "DeathBlossom", title: "Death Blossom Complex Type 2", candidates: [1, 2, 3], actions: [], eliminations: [elim(20, [3])], groups: [{ label: "Set:123", cells: [c(0)] }, { label: "Petal:1", cells: [c(1), c(2)] }, { label: "Petal:2", cells: [c(9), c(10)] }], description: "Stem r1c1.\nPetal 1: ...\nPetal 2: ..." })],
  ["blossomLoop", base({ kind: "BlossomLoop", title: "Cell Type Blossom Loop", candidates: [5], actions: [], eliminations: [elim(20, [5])], nodes: [{ id: 1, ...c(0), digit: 5, label: "5r1c1 ON" }], edges: [], description: "Burring Loop: 5r1c1 = 5r1c2.\nBurr Branch 1: ..." })],
  ["bruteForce", base({ kind: "BruteForce", title: "BruteForce", candidates: [9], cells: [c(0)], actions: [place(0, 9)], eliminations: [], description: "Solved by exhaustive search." })],
  ["generic", base({ kind: "UnknownFutureTechnique", title: "Unknown Future Technique", candidates: [9], cells: [c(0), c(10)], actions: [], eliminations: [elim(20, [9])], description: "Authoritative future proof." })],
];

for (const [expectedType, step] of cases) {
  assert.equal(explanationCategoryForStep(step), expectedType, `${step.title} category`);
  for (const locale of ["zh", "en"]) {
    const model = buildStepExplanationModel(step, locale);
    assert.equal(model.type, expectedType);
    assert.ok(model.sections.length >= 4, `${step.title} ${locale} lacks four sections`);
    for (const key of ["structure", "basis", "deduction", "conclusion"]) {
      assert.ok(model.sections.some((section) => section.key === key && section.text.trim()), `${step.title} ${locale} missing ${key}`);
    }
    assert.ok(model.checks.length >= 1);
    const allText = model.sections.map((section) => section.text).join("\n");
    assert.ok(allText.includes("r") || expectedType === "single", `${step.title} ${locale} should retain coordinates or be a direct step`);
    if (step.description && /=>|Chain|Loop|Base Cells|Target Cells|Branch|Rank/i.test(step.description)) {
      assert.ok(model.sections.some((section) => section.key === "eureka" && section.text === step.description), `${step.title} ${locale} must preserve backend proof exactly`);
    }
    if (locale === "zh") {
      for (const forbidden of ["Kazusa", "本技巧的专用模板尚未细化", "基础单元", "覆盖单元", "同一单元的其他格"]) {
        assert.ok(!allText.includes(forbidden), `${step.title} contains forbidden phrase: ${forbidden}`);
      }
    }
  }
}

// Every technique in the V486 engine registry must have an intentional category.
const registryKinds = [
  "FullHouse", "HiddenSingle", "NakedSingle", "LockedCandidates", "GSP",
  "NakedPair", "NakedTriple", "HiddenPair", "HiddenTriple", "NakedQuad", "HiddenQuad",
  "XWing", "Swordfish", "Jellyfish", "AlmostPair", "AlmostTriple", "BUGOne",
  "AvoidableRectangle", "Skyscraper", "TwoStringKite", "EmptyRectangle", "ERIPair",
  "WWing", "XYWing", "XYZWing", "XYZRing", "BUGPlusN", "BivalueOddagon",
  "WXYZWing", "UniqueRectangle", "UniqueLoop", "ExtendedRectangle", "FinnedXWing",
  "FinnedSwordfish", "FinnedJellyfish", "SueDeCoq", "Fireworks", "BrokenWing",
  "XChain", "XYChain", "AIC", "GroupedAIC", "ALSXZ", "ALSXYWing", "ALSWWing",
  "AHSXZ", "AHSXYWing", "AHSWWing", "ALSChain", "AHSChain", "DeathBlossom",
  "ComplexSwordfish", "ComplexJellyfish", "ComplexSquirmbagFish", "BlossomLoop",
  "ComplexAIC", "CellRegionFC", "Whip", "GWhip", "DynamicChain", "Braid", "GBraid",
  "SKLoop", "MSLS", "Multifish", "JE", "SeniorExocet", "WeakExocet",
  "TripletOddagon", "BruteForce",
];
for (const kind of registryKinds) {
  const type = explanationCategoryForStep({ kind, title: kind });
  assert.notEqual(type, "generic", `registered technique ${kind} must not fall through to generic`);
}

// Missing structured roles must not be invented.
const unknown = cases.at(-1)[1];
const unknownZh = buildStepExplanationModel(unknown, "zh");
const unknownText = unknownZh.sections.map((section) => section.text).join("\n");
assert.match(unknownText, /不猜测|不补造/);
assert.ok(!/枢轴格为|翼格为|基准区域为|覆盖区域为/.test(unknownText));

console.log(`test-step-explanation: ok (${cases.length} fixtures x 2 locales)`);
