import assert from "node:assert/strict";
import { buildStepExplanationModel, buildAuditedStepExplanationPayload, buildAuditedTechniqueGuide, explanationCategoryForStep } from "../step-explanation.js";

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


// Source-audited uniqueness-family regressions. These fixtures mirror the
// detector's actual field semantics: step.candidates is not always the deadly
// pair (UET/AUR branches often store the target or structure union instead).
const auditedUniquenessCases = [
  {
    name: "UET + XY-Wing separates deadly pair and target digit",
    step: base({
      kind: "UniqueRectangle",
      title: "Uniqueness External Test + XY-Wing",
      description: "Uniqueness External Test + XY-Wing: 2/7 in r13c19 => r1c4,r2c1<>1",
      candidates: [1],
      cells: [c(0), c(8), c(18), c(26), c(1), c(3), c(5), c(21), c(12)],
      actions: [],
      eliminations: [elim(3, [1]), elim(9, [1])],
      groups: [
        { label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] },
        { label: "GuardiansA:2", cells: [c(1), c(3)] },
        { label: "GuardiansB:7", cells: [c(5)] },
        { label: "WingA:12", cells: [c(21)] },
        { label: "WingB:17", cells: [c(12)] },
      ],
    }),
    mustZh: ["致命数字组为2/7", "外部守护候选至少一真", "两翼中的1至少一真"],
    mustNotZh: ["致命数字为1", "致命数字组为1"],
    guideZh: ["Gₐ∨Gᵦ", "1是共同删数数字，不是致命数字"],
  },
  {
    name: "UET 1 uses pair from role data instead of delete mask",
    step: base({
      kind: "UniqueRectangle",
      title: "Uniqueness External Test 1",
      description: "Uniqueness External Test 1: 2/7r13c19 => r1c2<>4",
      candidates: [4],
      cells: [c(0), c(8), c(18), c(26), c(1)],
      actions: [],
      eliminations: [elim(1, [4])],
      groups: [
        { label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] },
        { label: "Guardians:27", cells: [c(1)] },
      ],
    }),
    mustZh: ["致命数字组为2/7", "只有一个守护格"],
    mustNotZh: ["致命数字组为4"],
  },
  {
    name: "AUR WXYZ union is not called deadly set",
    step: base({
      kind: "UniqueRectangle",
      title: "AUR + WXYZ-Ring",
      description: "AUR + WXYZ-Ring: 2/7UR in r13c19; extra candidates -{1/8} + {r2c4,r3c4,r3c6} construct a WXYZ-Wing {1/2/7/8} => r1c4<>1",
      candidates: [1, 2, 7, 8],
      cells: [c(0), c(8), c(18), c(26), c(1), c(5), c(12), c(21), c(23)],
      actions: [],
      eliminations: [elim(3, [1])],
      groups: [
        { label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] },
        { label: "Guardians:18", cells: [c(1), c(5)] },
        { label: "WXYZPivot:12", cells: [c(12)] },
        { label: "WXYZWings:1278", cells: [c(21), c(23)] },
      ],
    }),
    mustZh: ["致命数字组为2/7", "WXYZ待定数组"],
    mustNotZh: ["致命数字组为1/2/7/8"],
  },
  {
    name: "BUG+1 explains parity verification",
    step: base({
      kind: "BUGOne",
      title: "Bivalue Universal Grave + 1",
      description: "Bivalue Universal Grave + 1: => r1c1=3",
      candidates: [3],
      cells: [c(0)],
      actions: [place(0, 3)],
      eliminations: [],
      groups: [
        { label: "BUGPlusOneCell:237", cells: [c(0)] },
        { label: "ForcedCandidate:3", cells: [c(0)] },
      ],
    }),
    mustZh: ["候选为2/3/7", "出现0次或2次", "额外候选3必须成立"],
  },
  {
    name: "Unique Loop Type 4 uses loop and conjugate exit roles",
    step: base({
      kind: "UniqueLoop",
      title: "UL",
      description: "UL Type 4:{r1c1,r1c5,r5c5,r5c1} => r1c5<>2",
      candidates: [2, 7],
      cells: [c(0), c(4), c(40), c(36)],
      actions: [],
      eliminations: [elim(4, [2])],
      groups: [
        { label: "ULBody:27", cells: [c(0), c(4), c(40), c(36)] },
        { label: "ConjugateExit:7", cells: [c(4), c(40)] },
      ],
    }),
    mustZh: ["唯一环主体", "致命数字组为2/7", "共轭对"],
  },
  {
    name: "Extended Rectangle Type 3 preserves multi-digit deadly set",
    step: base({
      kind: "ExtendedRectangle",
      title: "Extended Rectangle",
      description: "Extended Rectangle Type 3: 123r157c12, With Naked Pair 69r1357c1 => r8c1<>9",
      candidates: [1, 2, 3],
      cells: [c(0), c(1), c(36), c(37), c(54), c(55)],
      actions: [],
      eliminations: [elim(63, [9])],
      groups: [
        { label: "XRBody:123", cells: [c(0), c(1), c(36), c(37), c(54), c(55)] },
        { label: "ExitCells:69", cells: [c(0), c(36), c(54)] },
        { label: "NakedSubset:69", cells: [c(0), c(36), c(54)] },
      ],
    }),
    mustZh: ["扩展矩形主体", "致命数字组为1/2/3", "裸数组"],
  },
];

for (const fixture of auditedUniquenessCases) {
  const payload = buildAuditedStepExplanationPayload(fixture.step, "zh");
  assert.ok(payload, `${fixture.name}: missing audited payload`);
  const text = [payload.structure, payload.principle, payload.deduction, payload.conclusion, ...(payload.checks || [])].join("\n");
  for (const expected of fixture.mustZh || []) assert.ok(text.includes(expected), `${fixture.name}: missing ${expected}\n${text}`);
  for (const forbidden of fixture.mustNotZh || []) assert.ok(!text.includes(forbidden), `${fixture.name}: contains forbidden ${forbidden}\n${text}`);
  const guide = buildAuditedTechniqueGuide(fixture.step, "zh");
  assert.equal(guide?.length, 6, `${fixture.name}: guide must have six audited fields`);
  const guideText = guide.join("\n");
  for (const expected of fixture.guideZh || []) assert.ok(guideText.includes(expected), `${fixture.name}: guide missing ${expected}\n${guideText}`);
  const en = buildAuditedStepExplanationPayload(fixture.step, "en");
  assert.ok(en && !/[\u4e00-\u9fff]/.test([en.structure, en.principle, en.deduction, en.conclusion].join("\n")), `${fixture.name}: English payload contains CJK`);
}


// Phase-1 branch ledger: every actual uniqueness/deadly-pattern output family
// has an explicit audited tutorial route. The purpose is not to invent a
// sample puzzle here, but to lock the detector's field semantics and prevent a
// future generic-card regression.
const phase1BranchCases = [
  ["GSP five symmetry variants", base({ kind: "GSP", title: "Gurth's symmetry placement", description: "Gurth's symmetry placement: Need rearrange rows to 321654987 => r5c5<>4\nCentral: 1<->9", candidates: [5], actions: [], eliminations: [elim(40, [4])], groups: [{ label: "Self:5", cells: [c(40)] }, { label: "Symmetry:Central", cells: [] }] }), "全局对称映射"],
  ["BUG+1", base({ kind: "BUGOne", title: "Bivalue Universal Grave + 1", description: "Bivalue Universal Grave + 1: => r5c5=7", candidates: [7], cells: [c(40)], actions: [place(40, 7)], eliminations: [], groups: [{ label: "BUGPlusOneCell:127", cells: [c(40)] }, { label: "ForcedCandidate:7", cells: [c(40)] }] }), "出现0次或2次"],
  ["BUG+n Type 1", base({ kind: "BUGPlusN", title: "BUG + 2", description: "BUG + 2 Type 1: => r1c1<>12", candidates: [3, 4], actions: [], eliminations: [elim(0, [1, 2])], groups: [{ label: "Guardian:34", cells: [c(0)] }] }), "同一格"],
  ["BUG+n Type 2", base({ kind: "BUGPlusN", title: "BUG + 2", description: "BUG + 2 (Type 2): => r1c3<>5", candidates: [5], actions: [], eliminations: [elim(2, [5])], groups: [{ label: "Guardian:5", cells: [c(0)] }, { label: "Guardian:5", cells: [c(1)] }] }), "同数字"],
  ["BUG+n cross guardian generic branch", base({ kind: "BUGPlusN", title: "BUG + 2", description: "BUG + 2: => r1c1<>7,r1c2<>3", candidates: [3, 7], actions: [], eliminations: [elim(0, [7]), elim(1, [3])], groups: [{ label: "Guardian:3", cells: [c(0)] }, { label: "Guardian:7", cells: [c(1)] }] }), "守护集合至少一真"],
  ["BUG+n Type 3", base({ kind: "BUGPlusN", title: "BUG + 3", description: "BUG + 3 Type 3: With Naked Triple (237) => r1c9<>7", candidates: [2, 3, 7], actions: [], eliminations: [elim(8, [7])], groups: [{ label: "Guardian:2", cells: [c(0)] }, { label: "Guardian:3", cells: [c(1)] }, { label: "Subset:237", cells: [c(2), c(3)] }] }), "裸数组"],
  ["BUG+n Type 4", base({ kind: "BUGPlusN", title: "BUG + 2", description: "BUG + 2 (Type 4): => r1c1<>3,r1c2<>3", candidates: [2, 3, 7], actions: [], eliminations: [elim(0, [3]), elim(1, [3])], groups: [{ label: "Guardian:7", cells: [c(0)] }, { label: "Guardian:7", cells: [c(1)] }, { label: "StrongLink:2", cells: [c(0), c(1)] }] }), "共轭"],

  ["Avoidable Rectangle Type 1", base({ kind: "AvoidableRectangle", title: "Avoidable Rectangle Type 1", description: "Avoidable Rectangle Type 1: 2/7 in r13c19 => r3c9<>27", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26)], actions: [], eliminations: [elim(26, [2, 7])], groups: [{ label: "ARBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "SolvedCorners:27", cells: [c(0), c(8), c(18)] }, { label: "TargetCorner:27", cells: [c(26)] }] }), "三个已填非提示角"],
  ["Avoidable Rectangle Type 2", base({ kind: "AvoidableRectangle", title: "Avoidable Rectangle Type 2", description: "Avoidable Rectangle Type 2: 2/7 in r13c19 => r2c4<>1", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26)], actions: [], eliminations: [elim(12, [1])], groups: [{ label: "ARBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "SolvedCorners:27", cells: [c(0), c(8)] }, { label: "Roof:1", cells: [c(18), c(26)] }] }), "两个未解屋顶角"],

  ["UR Type 1", base({ kind: "UniqueRectangle", title: "Unique Rectangle Type 1", description: "Uniqueness Test 1: 2/7 in r13c19 => r3c9<>27", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26)], actions: [], eliminations: [elim(26, [2, 7])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "ExitCell:1", cells: [c(26)] }] }), "一个破坏格"],
  ["UR Type 2", base({ kind: "UniqueRectangle", title: "Unique Rectangle Type 2", description: "Uniqueness Test 2: 2/7 in r13c19 => r2c4<>1", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26)], actions: [], eliminations: [elim(12, [1])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "ExitCells:1", cells: [c(18), c(26)] }] }), "共享一个至少一真的额外数字"],
  ["UR Type 5", base({ kind: "UniqueRectangle", title: "Unique Rectangle Type 5", description: "Uniqueness Test 5: 2/7 in r13c19 => r2c4<>1", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26)], actions: [], eliminations: [elim(12, [1])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "ExitCells:1", cells: [c(0), c(26)] }] }), "共享一个至少一真的额外数字"],
  ["UR Type 3", base({ kind: "UniqueRectangle", title: "Unique Rectangle Type 3", description: "Uniqueness Test 3: 2/7 in r13c19 => r1c4<>1", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26), c(3)], actions: [], eliminations: [elim(3, [1])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "ExitCells:13", cells: [c(18), c(26)] }, { label: "NakedSubset:123", cells: [c(3)] }] }), "裸数组"],
  ["UR Type 4", base({ kind: "UniqueRectangle", title: "Unique Rectangle Type 4", description: "Uniqueness Test 4: 2/7 in r13c19 => r3c19<>7", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26)], actions: [], eliminations: [elim(18, [7]), elim(26, [7])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "ExitCells:13", cells: [c(18), c(26)] }, { label: "ConjugateExit:2", cells: [c(18), c(26)] }] }), "共轭对"],
  ["UR Type 6", base({ kind: "UniqueRectangle", title: "Unique Rectangle Type 6", description: "Uniqueness Test 6: 2/7 in r13c19 => r1c19<>2", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26)], actions: [], eliminations: [elim(0, [2]), elim(8, [2])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "ExitCells:13", cells: [c(0), c(8)] }, { label: "ConfinedDeadly:2", cells: [c(0), c(8)] }] }), "外部落点被清空"],
  ["UR Type 7", base({ kind: "UniqueRectangle", title: "Unique Rectangle Type 7", description: "Uniqueness Test 7: 2/7 in r13c19; 2 strong links + 1 bivalue => r1c1<>7,S-Ring:=>r2c1<>2", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26)], actions: [], eliminations: [elim(0, [7]), elim(9, [2])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "UR7", cells: [c(0), c(8), c(18), c(26)] }] }), "S-Ring"],
  ["Hidden Rectangle", base({ kind: "UniqueRectangle", title: "Hidden Rectangle", description: "Hidden Rectangle: 2/7 in r13c19 => r3c9<>7", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26)], actions: [], eliminations: [elim(26, [7])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "HiddenLock:2", cells: [c(0), c(26)] }, { label: "TargetCorner:7", cells: [c(26)] }] }), "隐藏锁定"],
  ["Merged Uniqueness Test", base({ kind: "UniqueRectangle", title: "Uniqueness Test", description: "Uniqueness Test: 2/7 in r13c19 => r1c1<>2,r3c9<>7", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26)], actions: [], eliminations: [elim(0, [2]), elim(26, [7])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "Branch:Unique Rectangle Type 4", cells: [] }, { label: "Branch:Hidden Rectangle", cells: [] }] }), "多个唯一性分支合并"],

  ["AUR + XY-Wing", base({ kind: "UniqueRectangle", title: "AUR + XY-Wing", description: "AUR + XY-Wing: 2/7UR in r13c19; extra candidates -{1/3} + r2c4\\r3c4 construct a XY-Wing => r1c4<>1", candidates: [1], cells: [c(0), c(8), c(18), c(26), c(12), c(21)], actions: [], eliminations: [elim(3, [1])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "Guardians:13", cells: [c(18), c(26)] }, { label: "WingA:12", cells: [c(12)] }, { label: "WingB:13", cells: [c(21)] }] }), "经Wing传到共同数字1"],
  ["AUR + XYZ-Wing", base({ kind: "UniqueRectangle", title: "AUR + XYZ-Wing", description: "AUR + XYZ-Wing: 2/7UR in r13c19; extra candidates -{1/3/4} + r2c4\\r3c4 construct a XYZ-Wing => r1c4<>1", candidates: [1], cells: [c(0), c(8), c(18), c(26), c(12), c(21)], actions: [], eliminations: [elim(3, [1])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "Guardians:134", cells: [c(18), c(26)] }, { label: "WingA:12", cells: [c(12)] }, { label: "WingB:13", cells: [c(21)] }] }), "经Wing传到共同数字1"],
  ["AUR + WXYZ-Wing", base({ kind: "UniqueRectangle", title: "AUR + WXYZ-Wing", description: "AUR + WXYZ-Wing: 2/7UR in r13c19 => r1c4<>1", candidates: [1, 2, 7, 8], cells: [c(0), c(8), c(18), c(26), c(12), c(21), c(23)], actions: [], eliminations: [elim(3, [1])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "Guardians:18", cells: [c(18), c(26)] }, { label: "WXYZPivot:12", cells: [c(12)] }, { label: "WXYZWings:1278", cells: [c(21), c(23)] }] }), "WXYZ待定数组"],
  ["AUR + WXYZ-Ring", base({ kind: "UniqueRectangle", title: "AUR + WXYZ-Ring", description: "AUR + WXYZ-Ring: 2/7UR in r13c19 => r1c4<>1", candidates: [1, 2, 7, 8], cells: [c(0), c(8), c(18), c(26), c(12), c(21), c(23)], actions: [], eliminations: [elim(3, [1])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "Guardians:18", cells: [c(18), c(26)] }, { label: "WXYZPivot:12", cells: [c(12)] }, { label: "WXYZWings:1278", cells: [c(21), c(23)] }] }), "WXYZ待定数组/闭环"],

  ["UET 1", base({ kind: "UniqueRectangle", title: "Uniqueness External Test 1", description: "Uniqueness External Test 1: 2/7r13c19 => r1c2<>4", candidates: [4], cells: [c(0), c(8), c(18), c(26), c(1)], actions: [], eliminations: [elim(1, [4])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "Guardians:27", cells: [c(1)] }] }), "唯一外部守护格"],
  ["UET 2/4", base({ kind: "UniqueRectangle", title: "Uniqueness External Test 2/4", description: "Uniqueness External Test 2/4: 2/7 in r13c19 => r2c4<>7", candidates: [7], cells: [c(0), c(8), c(18), c(26), c(1), c(5)], actions: [], eliminations: [elim(12, [7])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "Guardians:7", cells: [c(1), c(5)] }] }), "没有外部守护"],
  ["UET 3", base({ kind: "UniqueRectangle", title: "Uniqueness External Test 3", description: "Uniqueness External Test 3: 2/7 in r13c19 => r1c4<>1", candidates: [2, 7], cells: [c(0), c(8), c(18), c(26), c(1), c(3)], actions: [], eliminations: [elim(3, [1])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "Guardians:27", cells: [c(1)] }, { label: "NakedSubset:127", cells: [c(3)] }] }), "裸数组共同锁定"],
  ["UET 3H", base({ kind: "UniqueRectangle", title: "Uniqueness External Test 3H", description: "Uniqueness External Test 3H: 2/7r13c19 + 1r1 => r1c4<>4", candidates: [1, 2, 7], cells: [c(0), c(8), c(18), c(26), c(1), c(3)], actions: [], eliminations: [elim(3, [4])], groups: [{ label: "URBody:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "Guardians:27", cells: [c(1)] }, { label: "HiddenSubset:1", cells: [c(3)] }] }), "隐性数组共同锁定"],
  ["UET + XY-Wing", auditedUniquenessCases[0].step, "两个双值翼格"],

  ["Unique Loop Type 1", base({ kind: "UniqueLoop", title: "UL", description: "UL Type 1:r1c16,r2c68,r3c18 => r2c6<>13", candidates: [1, 3], cells: [c(0), c(5), c(14), c(16), c(18), c(25)], actions: [], eliminations: [elim(14, [1, 3])], groups: [{ label: "ULBody:13", cells: [c(0), c(5), c(14), c(16), c(18), c(25)] }, { label: "ExitCell:9", cells: [c(14)] }] }), "一个破坏格"],
  ["Unique Loop Type 2", base({ kind: "UniqueLoop", title: "UL", description: "UL Type 2: r3c79,r5c78,r9c89 => r78c7,r4c9<>9", candidates: [3, 4], cells: [c(24), c(26), c(42), c(43), c(79), c(80)], actions: [], eliminations: [elim(60, [9])], groups: [{ label: "ULBody:34", cells: [c(24), c(26), c(42), c(43), c(79), c(80)] }, { label: "ExitCells:9", cells: [c(42), c(80)] }] }), "共享一个至少一真的额外数字"],
  ["Unique Loop Type 3", base({ kind: "UniqueLoop", title: "UL", description: "UL Type 3: {r3c78,r7c68,r8c67}(With Naked Triple:235) => r6c6<>235", candidates: [4, 6], cells: [c(24), c(25), c(59), c(61), c(69), c(70)], actions: [], eliminations: [elim(50, [2, 3, 5])], groups: [{ label: "ULBody:46", cells: [c(24), c(25), c(59), c(61), c(69), c(70)] }, { label: "ExitCells:235", cells: [c(59), c(69)] }, { label: "NakedSubset:235", cells: [c(14), c(41), c(59), c(69)] }] }), "裸数组"],
  ["Unique Loop Type 4", auditedUniquenessCases[4].step, "共轭对"],

  ["Extended Rectangle Type 1", base({ kind: "ExtendedRectangle", title: "Extended Rectangle", description: "Extended Rectangle Type 1: 345r249c45 => r4c5<>45", candidates: [3, 4, 5], cells: [c(12), c(13), c(30), c(31), c(75), c(76)], actions: [], eliminations: [elim(31, [4, 5])], groups: [{ label: "XRBody:345", cells: [c(12), c(13), c(30), c(31), c(75), c(76)] }, { label: "ExitCell:6", cells: [c(31)] }] }), "一个破坏格"],
  ["Extended Rectangle Type 2", base({ kind: "ExtendedRectangle", title: "Extended Rectangle", description: "Extended Rectangle Type 2: 369r46c247 => r4c1<>4", candidates: [3, 6, 9], cells: [c(28), c(31), c(46), c(49), c(64), c(67)], actions: [], eliminations: [elim(27, [4])], groups: [{ label: "XRBody:369", cells: [c(28), c(31), c(46), c(49), c(64), c(67)] }, { label: "ExitCells:4", cells: [c(28), c(46)] }] }), "共享一个至少一真的额外数字"],
  ["Extended Rectangle Type 3", auditedUniquenessCases[5].step, "裸数组"],
  ["Extended Rectangle Type 4", base({ kind: "ExtendedRectangle", title: "Extended Rectangle", description: "Extended Rectangle Type 4: 123r27c456 With conjugate pair 2r7c45 in r7 => r7c4<>1,r7c5<>3", candidates: [1, 2, 3], cells: [c(12), c(13), c(14), c(57), c(58), c(59)], actions: [], eliminations: [elim(57, [1]), elim(58, [3])], groups: [{ label: "XRBody:123", cells: [c(12), c(13), c(14), c(57), c(58), c(59)] }, { label: "ConjugateExit:2", cells: [c(57), c(58)] }] }), "共轭对"],
];

for (const [name, step, expectedZh] of phase1BranchCases) {
  const payload = buildAuditedStepExplanationPayload(step, "zh");
  assert.ok(payload, `${name}: no audited payload`);
  const guide = buildAuditedTechniqueGuide(step, "zh");
  assert.equal(guide?.length, 6, `${name}: guide does not have six fields`);
  const zhText = [payload.structure, payload.principle, payload.deduction, ...(payload.checks || []), ...guide].join("\n");
  assert.ok(zhText.includes(expectedZh), `${name}: missing branch marker ${expectedZh}\n${zhText}`);
  const enPayload = buildAuditedStepExplanationPayload(step, "en");
  const enGuide = buildAuditedTechniqueGuide(step, "en");
  assert.ok(enPayload && enGuide?.length === 6, `${name}: missing English audit route`);
  assert.ok(!/[\u4e00-\u9fff]/.test([enPayload.structure, enPayload.principle, enPayload.deduction, ...enGuide].join("\n")), `${name}: English contains CJK`);
}


const phase2FoundationCases = [
  ["Full House", base({ kind: "FullHouse", title: "Full House", house: "r1", candidates: [9], cells: [c(8)], actions: [place(8, 9)], eliminations: [], groups: [{ label: "House:r1", cells: [] }, { label: "Target:9", cells: [c(8)] }] }), "恰好一个未解格"],
  ["Naked Single", base({ kind: "NakedSingle", title: "Naked Single", candidates: [5], cells: [c(40)], actions: [place(40, 5)], eliminations: [], groups: [{ label: "Target:5", cells: [c(40)] }] }), "候选集合只剩5"],
  ["Hidden Single", base({ kind: "HiddenSingle", title: "Hidden Single", house: "c4", candidates: [7], cells: [c(30)], actions: [place(30, 7)], eliminations: [], groups: [{ label: "House:c4", cells: [] }, { label: "Target:7", cells: [c(30)] }] }), "候选位置集合"],
  ["Locked Candidates Pointing", base({ kind: "LockedCandidates", title: "Locked Candidates", house: "b1", candidates: [4], cells: [c(0), c(1)], actions: [], eliminations: [elim(3, [4])], groups: [{ label: "Branch:Pointing", cells: [] }, { label: "SourceHouse:b1", cells: [] }, { label: "TargetHouse:r1", cells: [] }, { label: "LockedCandidates:4", cells: [c(0), c(1)] }] }), "宫→行/列"],
  ["Locked Candidates Claiming", base({ kind: "LockedCandidates", title: "Locked Candidates", house: "r1", candidates: [4], cells: [c(0), c(1)], actions: [], eliminations: [elim(9, [4])], groups: [{ label: "Branch:Claiming", cells: [] }, { label: "SourceHouse:r1", cells: [] }, { label: "TargetHouse:b1", cells: [] }, { label: "LockedCandidates:4", cells: [c(0), c(1)] }] }), "行/列→宫"],
  ["Naked Pair", base({ kind: "NakedPair", title: "Naked Pair", house: "r1", candidates: [2, 7], cells: [c(0), c(1)], actions: [], eliminations: [elim(2, [2, 7])], groups: [{ label: "House:r1", cells: [] }, { label: "NakedSubset:2/7", cells: [c(0), c(1)] }] }), "|C|=|U|=2"],
  ["Naked Triple", base({ kind: "NakedTriple", title: "Naked Triple", house: "b1", candidates: [1, 4, 8], cells: [c(0), c(1), c(9)], actions: [], eliminations: [elim(10, [1, 4])], groups: [{ label: "House:b1", cells: [] }, { label: "NakedSubset:1/4/8", cells: [c(0), c(1), c(9)] }] }), "|C|=|U|=3"],
  ["Naked Quad", base({ kind: "NakedQuad", title: "Naked Quad", house: "c1", candidates: [1, 3, 6, 9], cells: [c(0), c(9), c(18), c(27)], actions: [], eliminations: [elim(36, [1, 9])], groups: [{ label: "House:c1", cells: [] }, { label: "NakedSubset:1/3/6/9", cells: [c(0), c(9), c(18), c(27)] }] }), "|C|=|U|=4"],
  ["Hidden Pair", base({ kind: "HiddenPair", title: "Hidden Pair", house: "r1", candidates: [3, 8], cells: [c(0), c(1)], actions: [], eliminations: [elim(0, [2]), elim(1, [5])], groups: [{ label: "House:r1", cells: [] }, { label: "HiddenSubset:3/8", cells: [c(0), c(1)] }] }), "|D|=|P(D)|=2"],
  ["Hidden Triple", base({ kind: "HiddenTriple", title: "Hidden Triple", house: "b1", candidates: [2, 5, 9], cells: [c(0), c(1), c(9)], actions: [], eliminations: [elim(0, [3])], groups: [{ label: "House:b1", cells: [] }, { label: "HiddenSubset:2/5/9", cells: [c(0), c(1), c(9)] }] }), "|D|=|P(D)|=3"],
  ["Hidden Quad", base({ kind: "HiddenQuad", title: "Hidden Quad", house: "c1", candidates: [1, 4, 6, 8], cells: [c(0), c(9), c(18), c(27)], actions: [], eliminations: [elim(0, [3])], groups: [{ label: "House:c1", cells: [] }, { label: "HiddenSubset:1/4/6/8", cells: [c(0), c(9), c(18), c(27)] }] }), "|D|=|P(D)|=4"],
  ["X-Wing", base({ kind: "XWing", title: "X-Wing", candidates: [6], cells: [c(0), c(4), c(36), c(40)], actions: [], eliminations: [elim(13, [6])], groups: [{ label: "Base:r15", cells: [c(0), c(4), c(36), c(40)] }, { label: "Cover:c15", cells: [] }, { label: "FishBody:6", cells: [c(0), c(4), c(36), c(40)] }] }), "n个真数正好填满n个覆盖容量"],
  ["Swordfish", base({ kind: "Swordfish", title: "Swordfish", candidates: [7], cells: [c(0), c(4), c(27), c(31), c(54), c(58)], actions: [], eliminations: [elim(13, [7])], groups: [{ label: "Base:r147", cells: [] }, { label: "Cover:c159", cells: [] }, { label: "FishBody:7", cells: [c(0), c(4), c(27), c(31), c(54), c(58)] }] }), "每个基准区域必须至少有2个、至多3个"],
  ["Jellyfish", base({ kind: "Jellyfish", title: "Jellyfish", candidates: [8], cells: [c(0), c(4), c(18), c(22), c(45), c(49), c(63), c(67)], actions: [], eliminations: [elim(13, [8])], groups: [{ label: "Base:r1368", cells: [] }, { label: "Cover:c1598", cells: [] }, { label: "FishBody:8", cells: [c(0), c(4), c(18), c(22), c(45), c(49), c(63), c(67)] }] }), "每个基准区域必须至少有2个、至多4个"],
  ["Finned X-Wing", base({ kind: "FinnedXWing", title: "Finned X-Wing", candidates: [5], cells: [c(0), c(4), c(9), c(13), c(14)], actions: [], eliminations: [elim(5, [5])], groups: [{ label: "Base:r12", cells: [] }, { label: "Cover:c15", cells: [] }, { label: "FishBody:5", cells: [c(0), c(4), c(9), c(13)] }, { label: "Fin:5", cells: [c(14)] }] }), "鳍全假时按普通鱼删数"],
  ["Finned Swordfish", base({ kind: "FinnedSwordfish", title: "Finned Swordfish", candidates: [9], cells: [c(0), c(4), c(8), c(27), c(31), c(54), c(58)], actions: [], eliminations: [elim(17, [9])], groups: [{ label: "Base:r147", cells: [] }, { label: "Cover:c159", cells: [] }, { label: "FishBody:9", cells: [c(0), c(4), c(27), c(31), c(54), c(58)] }, { label: "Fin:9", cells: [c(8)] }] }), "所有鳍同宫"],
  ["Finned Jellyfish", base({ kind: "FinnedJellyfish", title: "Finned Jellyfish", candidates: [4], cells: [c(0), c(4), c(8), c(27), c(31), c(54), c(58), c(72), c(76)], actions: [], eliminations: [elim(17, [4])], groups: [{ label: "Base:r1479", cells: [] }, { label: "Cover:c1597", cells: [] }, { label: "FishBody:4", cells: [c(0), c(4), c(27), c(31), c(54), c(58), c(72), c(76)] }, { label: "Fin:4", cells: [c(8)] }] }), "鳍跨宫时本实现不会成立"],
  ["Sashimi X-Wing", base({ kind: "FinnedXWing", title: "Sashimi X-Wing", candidates: [5], cells: [c(0), c(4), c(9), c(14)], actions: [], eliminations: [elim(5, [5])], groups: [{ label: "Base:r12", cells: [] }, { label: "Cover:c15", cells: [] }, { label: "FishBody:5", cells: [c(0), c(9), c(13)] }, { label: "Fin:5", cells: [c(14)] }] }), "鱼身候选少于2个"],
  ["Sashimi Swordfish", base({ kind: "FinnedSwordfish", title: "Sashimi Swordfish", candidates: [9], cells: [c(0), c(8), c(27), c(31), c(54), c(58)], actions: [], eliminations: [elim(17, [9])], groups: [{ label: "Base:r147", cells: [] }, { label: "Cover:c159", cells: [] }, { label: "FishBody:9", cells: [c(0), c(27), c(31), c(54), c(58)] }, { label: "Fin:9", cells: [c(8)] }] }), "Sashimi还要求"],
  ["Sashimi Jellyfish", base({ kind: "FinnedJellyfish", title: "Sashimi Jellyfish", candidates: [4], cells: [c(0), c(8), c(27), c(31), c(54), c(58), c(72), c(76)], actions: [], eliminations: [elim(17, [4])], groups: [{ label: "Base:r1479", cells: [] }, { label: "Cover:c1597", cells: [] }, { label: "FishBody:4", cells: [c(0), c(27), c(31), c(54), c(58), c(72), c(76)] }, { label: "Fin:4", cells: [c(8)] }] }), "去掉鳍后至少一个基准区域"],
];

for (const [name, step, expectedZh] of phase2FoundationCases) {
  const payload = buildAuditedStepExplanationPayload(step, "zh");
  const guide = buildAuditedTechniqueGuide(step, "zh");
  assert.ok(payload, `${name}: no phase-2 audited payload`);
  assert.equal(guide?.length, 6, `${name}: guide does not have six fields`);
  const zhText = [payload.structure, payload.principle, payload.deduction, ...(payload.checks || []), ...guide].join("\n");
  assert.ok(zhText.includes(expectedZh), `${name}: missing marker ${expectedZh}\n${zhText}`);
  const enPayload = buildAuditedStepExplanationPayload(step, "en");
  const enGuide = buildAuditedTechniqueGuide(step, "en");
  assert.ok(enPayload && enGuide?.length === 6, `${name}: missing English audit route`);
  assert.ok(!/[\u4e00-\u9fff]/.test([enPayload.structure, enPayload.principle, enPayload.deduction, ...enGuide].join("\n")), `${name}: English contains CJK`);
}

const phase2StructureWingCases = [
  ["Skyscraper row", base({ kind: "Skyscraper", title: "Skyscraper", candidates: [5], cells: [c(0), c(4), c(36), c(40)], actions: [], eliminations: [elim(13, [5])], groups: [{ label: "Branch:Row-Based", cells: [] }, { label: "BaseA:r1", cells: [] }, { label: "BaseB:r5", cells: [] }, { label: "Roofs:5", cells: [c(0), c(40)] }, { label: "LinkedSide:5", cells: [c(4), c(36)] }] }), "(L₁∨R₁)"],
  ["Skyscraper column", base({ kind: "Skyscraper", title: "Skyscraper", candidates: [6], cells: [c(0), c(36), c(4), c(40)], actions: [], eliminations: [elim(9, [6])], groups: [{ label: "Branch:Column-Based", cells: [] }, { label: "BaseA:c1", cells: [] }, { label: "BaseB:c5", cells: [] }, { label: "Roofs:6", cells: [c(0), c(40)] }, { label: "LinkedSide:6", cells: [c(36), c(4)] }] }), "列型"],
  ["2-String Kite", base({ kind: "TwoStringKite", title: "2-String Kite", candidates: [7], cells: [c(0), c(4), c(40), c(76)], actions: [], eliminations: [elim(36, [7])], groups: [{ label: "Branch:Standard", cells: [] }, { label: "RowStrong:7", cells: [c(0), c(4)] }, { label: "RowHouse:r1", cells: [] }, { label: "ColumnStrong:7", cells: [c(40), c(76)] }, { label: "ColumnHouse:c5", cells: [] }, { label: "RowOuter:7", cells: [c(0)] }, { label: "ColumnOuter:7", cells: [c(76)] }, { label: "OuterEndpoints:7", cells: [c(0), c(76)] }, { label: "RowInner:7", cells: [c(4)] }, { label: "ColumnInner:7", cells: [c(40)] }, { label: "Connector:7", cells: [c(4), c(40)] }, { label: "ConnectorHouse:b2", cells: [] }] }), "连接组总数恰好为2"],
  ["Grouped 2-String Kite", base({ kind: "TwoStringKite", title: "Grouped 2-String Kite", candidates: [2], cells: [c(1), c(6), c(7), c(15), c(24), c(60)], actions: [], eliminations: [elim(55, [2])], groups: [{ label: "Branch:Grouped", cells: [] }, { label: "RowStrong:2", cells: [c(1), c(6), c(7)] }, { label: "RowHouse:r1", cells: [] }, { label: "ColumnStrong:2", cells: [c(15), c(24), c(60)] }, { label: "ColumnHouse:c7", cells: [] }, { label: "RowOuter:2", cells: [c(1)] }, { label: "ColumnOuter:2", cells: [c(60)] }, { label: "OuterEndpoints:2", cells: [c(1), c(60)] }, { label: "RowInner:2", cells: [c(6), c(7)] }, { label: "ColumnInner:2", cells: [c(15), c(24)] }, { label: "Connector:2", cells: [c(6), c(7), c(15), c(24)] }, { label: "ConnectorHouse:b3", cells: [] }] }), "连接组总数大于2"],
  ["Empty Rectangle", base({ kind: "EmptyRectangle", title: "Empty Rectangle", candidates: [8], cells: [c(0), c(1), c(9), c(12), c(39)], actions: [], eliminations: [elim(3, [8])], groups: [{ label: "ERBox:b1", cells: [] }, { label: "ERBody:8", cells: [c(0), c(1), c(9)] }, { label: "ERIntersection:8", cells: [c(10)] }, { label: "StrongLink:8", cells: [c(12), c(39)] }, { label: "LinkHouse:c4", cells: [] }, { label: "OutsideEndpoint:8", cells: [c(39)] }, { label: "CoverCross:r2c2", cells: [] }] }), "交点本身不要求含该候选"],
  ["ERI Pair", base({ kind: "ERIPair", title: "ERI Pair", candidates: [2, 9], cells: [c(0), c(40), c(4), c(36)], actions: [], eliminations: [elim(4, [2]), elim(36, [9])], groups: [{ label: "Pair:2/9", cells: [c(0), c(40)] }, { label: "ERISupport:2/9", cells: [c(3), c(4), c(12)] }, { label: "ActiveERI:2/9", cells: [c(4)] }, { label: "OppositeERI:2/9", cells: [c(36)] }, { label: "Targets:2/9", cells: [c(4), c(36)] }] }), "不同宫带且不同宫栈"],
  ["W-Wing", base({ kind: "WWing", title: "W-Wing", candidates: [5], cells: [c(0), c(40), c(4), c(36)], actions: [], eliminations: [elim(20, [5])], groups: [{ label: "Branch:Standard", cells: [] }, { label: "Endpoints:2/5", cells: [c(0), c(40)] }, { label: "StrongLink:2", cells: [c(4), c(36)] }, { label: "LinkHouse:c5", cells: [] }, { label: "LinkToA:2", cells: [c(4)] }, { label: "LinkToB:2", cells: [c(36)] }, { label: "DeleteDigit:5", cells: [] }] }), "A(5)∨B(5)"],
  ["Grouped W-Wing", base({ kind: "WWing", title: "Grouped W-Wing", candidates: [5], cells: [c(0), c(40), c(4), c(13), c(36)], actions: [], eliminations: [elim(20, [5])], groups: [{ label: "Branch:Grouped", cells: [] }, { label: "Endpoints:2/5", cells: [c(0), c(40)] }, { label: "StrongLink:2", cells: [c(4), c(13), c(36)] }, { label: "LinkHouse:c5", cells: [] }, { label: "LinkToA:2", cells: [c(4), c(13)] }, { label: "LinkToB:2", cells: [c(36)] }, { label: "DeleteDigit:5", cells: [] }] }), "无一漏出两个端点"],
  ["XY-Wing", base({ kind: "XYWing", title: "XY-Wing", candidates: [3], cells: [c(0), c(1), c(9)], actions: [], eliminations: [elim(10, [3])], groups: [{ label: "Branch:XY-Wing", cells: [] }, { label: "Pivot:1/2", cells: [c(0)] }, { label: "WingA:1/3", cells: [c(1)] }, { label: "WingB:2/3", cells: [c(9)] }, { label: "SharedZ:3", cells: [c(1), c(9)] }] }), "A(Z)∨B(Z)"],
  ["XYZ-Wing", base({ kind: "XYZWing", title: "XYZ-Wing", candidates: [3], cells: [c(0), c(1), c(9)], actions: [], eliminations: [elim(10, [3])], groups: [{ label: "Branch:XYZ-Wing", cells: [] }, { label: "Pivot:1/2/3", cells: [c(0)] }, { label: "WingA:1/3", cells: [c(1)] }, { label: "WingB:2/3", cells: [c(9)] }, { label: "SharedZ:3", cells: [c(1), c(9)] }] }), "P(Z)∨A(Z)∨B(Z)"],
  ["Complete XYZ-Ring", base({ kind: "XYZRing", title: "Complete XYZ-Ring", candidates: [3], cells: [c(0), c(1), c(9), c(4), c(13)], actions: [], eliminations: [elim(10, [1]), elim(12, [3])], groups: [{ label: "Branch:Complete", cells: [] }, { label: "Pivot:1/2/3", cells: [c(0)] }, { label: "WingA:1/3", cells: [c(1)] }, { label: "WingB:2/3", cells: [c(9)] }, { label: "ConnectorZ:3", cells: [c(4), c(13)] }, { label: "ConnectorHouse:c5", cells: [] }, { label: "RingCoverA:r1", cells: [] }, { label: "RingCoverB:b2", cells: [] }] }), "两个非连接区域H₁、H₂覆盖全部环节点"],
  ["Half XYZ-Ring", base({ kind: "XYZRing", title: "Half XYZ-Ring", candidates: [3], cells: [c(0), c(1), c(9), c(4), c(13)], actions: [], eliminations: [elim(10, [1]), elim(12, [3])], groups: [{ label: "Branch:Half", cells: [] }, { label: "Pivot:1/2/3", cells: [c(0)] }, { label: "WingA:1/3", cells: [c(1)] }, { label: "WingB:2/3", cells: [c(9)] }, { label: "ConnectorZ:3", cells: [c(4), c(13)] }, { label: "ConnectorHouse:c5", cells: [] }, { label: "RingCoverA:r1", cells: [] }, { label: "RingCoverB:b2", cells: [] }] }), "两桥区域并看见枢轴"],
  ["WXYZ-Wing", base({ kind: "WXYZWing", title: "WXYZ-Wing", candidates: [4], cells: [c(0), c(1), c(2), c(9)], actions: [], eliminations: [elim(10, [4])], groups: [{ label: "Branch:Standard", cells: [] }, { label: "Pivot:1/2/3", cells: [c(0)] }, { label: "WingA:1/4", cells: [c(1)] }, { label: "WingB:2/4", cells: [c(2)] }, { label: "RemoteWing:3/4", cells: [c(9)] }, { label: "WXYZSet:1/2/3/4", cells: [c(0), c(1), c(2), c(9)] }, { label: "SharedZ:4", cells: [c(1), c(2), c(9)] }] }), "枢轴与远端翼都会被迫取W"],
  ["WXYZ-Wing Restricted Z", base({ kind: "WXYZWing", title: "WXYZ-Wing", candidates: [4], cells: [c(0), c(1), c(2), c(9)], actions: [], eliminations: [elim(10, [4]), elim(11, [1])], groups: [{ label: "Branch:Restricted-Z", cells: [] }, { label: "Pivot:1/2/3", cells: [c(0)] }, { label: "WingA:1/4", cells: [c(1)] }, { label: "WingB:2/4", cells: [c(2)] }, { label: "RemoteWing:3/4", cells: [c(9)] }, { label: "WXYZSet:1/2/3/4", cells: [c(0), c(1), c(2), c(9)] }, { label: "SharedZ:4", cells: [c(1), c(2), c(9)] }] }), "Restricted-Z附加删数"],
];

for (const [name, step, expectedZh] of phase2StructureWingCases) {
  const payload = buildAuditedStepExplanationPayload(step, "zh");
  const guide = buildAuditedTechniqueGuide(step, "zh");
  assert.ok(payload, `${name}: no phase-2 structure/wing payload`);
  assert.equal(guide?.length, 6, `${name}: guide does not have six fields`);
  const zhText = [payload.structure, payload.principle, payload.deduction, ...(payload.checks || []), ...guide].join("\n");
  assert.ok(zhText.includes(expectedZh), `${name}: missing marker ${expectedZh}\n${zhText}`);
  const enPayload = buildAuditedStepExplanationPayload(step, "en");
  const enGuide = buildAuditedTechniqueGuide(step, "en");
  assert.ok(enPayload && enGuide?.length === 6, `${name}: missing English audit route`);
  assert.ok(!/[\u4e00-\u9fff]/.test([enPayload.structure, enPayload.principle, enPayload.deduction, ...enGuide].join("\n")), `${name}: English contains CJK`);
}


const phase3Cases = [
  ["Broken Wing", base({ kind: "BrokenWing", title: "Broken Wing", candidates: [7], cells: [c(18), c(22), c(45), c(51), c(57), c(66), c(76)], actions: [], eliminations: [elim(73, [7])], groups: [{ label: "Branch:Odd-Loop Guardians", cells: [] }, { label: "BrokenLoop:7", cells: [c(18), c(22), c(45), c(51), c(57)] }, { label: "Guardians:7", cells: [c(66), c(76)] }, { label: "Targets:7", cells: [c(73)] }] }), "POM/模板只用于筛选可能删数目标"],
  ["Finned Franken Swordfish", base({ kind: "ComplexSwordfish", title: "Complex Swordfish", description: "Finned Franken Swordfish: 4r14b5\\c258 f r5c46 => r5c2<>4", candidates: [4], cells: [c(0), c(4), c(31), c(39), c(40)], actions: [], eliminations: [elim(37, [4])], groups: [{ label: "Branch:Finned Franken", cells: [] }, { label: "FishDigit:4", cells: [] }, { label: "Base:r14b5", cells: [c(0), c(4), c(31), c(39), c(40)] }, { label: "Cover:c258", cells: [c(1), c(4), c(7), c(37), c(40), c(43)] }, { label: "FishBody:4", cells: [c(0), c(4), c(31), c(40)] }, { label: "RegFins:4", cells: [c(39)] }, { label: "Targets:4", cells: [c(37)] }] }), "普通鳍是Base\\Cover候选"],
  ["Sashimi Mutant Jellyfish", base({ kind: "ComplexJellyfish", title: "Complex Jellyfish", description: "Sashimi Mutant Jellyfish", candidates: [6], cells: [c(0), c(4), c(10), c(30), c(40)], actions: [], eliminations: [elim(22, [6]), elim(40, [6])], groups: [{ label: "Branch:Sashimi Mutant", cells: [] }, { label: "FishDigit:6", cells: [] }, { label: "Base:r1c5b4b8", cells: [c(0), c(4), c(10), c(30), c(40)] }, { label: "Cover:r7c2b2b5", cells: [c(4), c(10), c(22), c(40)] }, { label: "FishBody:6", cells: [c(0), c(10), c(30)] }, { label: "RegFins:6", cells: [c(4)] }, { label: "EdoFins:6", cells: [c(40)] }, { label: "Targets:6", cells: [c(22)] }, { label: "CannibalTargets:6", cells: [c(40)] }] }), "Base或Cover内部允许同时混用行、列、宫"],
  ["Multi-Fish", base({ kind: "Multifish", title: "Multi-Fish", description: "Multi-Fish: 4 Truths:12r14,4 Links:1c2 2b5", candidates: [1, 2], cells: [c(0), c(1), c(27), c(28), c(40)], actions: [], eliminations: [elim(10, [1]), elim(40, [2])], groups: [{ label: "Branch:Row-Based", cells: [] }, { label: "SourceDigits:1/2", cells: [] }, { label: "TruthCount:4", cells: [] }, { label: "LinkCount:4", cells: [] }, { label: "Rank:0", cells: [] }, { label: "Truth:1/2r1", cells: [c(0), c(1)] }, { label: "Truth:1/2r4", cells: [c(27), c(28)] }, { label: "Link:1c2", cells: [c(1), c(10)] }, { label: "Link:2b5", cells: [c(30), c(40)] }, { label: "TruthCells", cells: [c(22)] }, { label: "CellLinks", cells: [c(31)] }, { label: "Targets", cells: [c(10)] }, { label: "CannibalTargets", cells: [c(40)] }] }), "严格Rank 0"],
];

for (const [name, step, expectedZh] of phase3Cases) {
  const payload = buildAuditedStepExplanationPayload(step, "zh");
  const guide = buildAuditedTechniqueGuide(step, "zh");
  assert.ok(payload, `${name}: no phase-3 audited payload`);
  assert.equal(guide?.length, 6, `${name}: guide does not have six fields`);
  const zhText = [payload.structure, payload.principle, payload.deduction, ...(payload.checks || []), ...guide].join("\n");
  assert.ok(zhText.includes(expectedZh), `${name}: missing marker ${expectedZh}\n${zhText}`);
  const enPayload = buildAuditedStepExplanationPayload(step, "en");
  const enGuide = buildAuditedTechniqueGuide(step, "en");
  assert.ok(enPayload && enGuide?.length === 6, `${name}: missing English audit route`);
  assert.ok(!/[\u4e00-\u9fff]/.test([enPayload.structure, enPayload.principle, enPayload.deduction, ...enGuide].join("\n")), `${name}: English contains CJK`);
}


const phase4Cases = [];
const phase4Step = (kind, title, branch, groups = [], candidates = [5]) => base({
  kind, title, candidates, cells: [c(0), c(1), c(9), c(10)], actions: [],
  eliminations: [elim(20, [candidates.at(-1) || 5])],
  groups: [{ label: `Branch:${branch}`, cells: [] }, ...groups],
});
const g = (label, cells = [], digits = "") => ({ label: `${label}${digits ? `:${digits}` : ""}`, cells });

phase4Cases.push(
  ["Almost Pair box ALS", phase4Step("AlmostPair", "Almost Pair", "Box-ALS / Line-AHS", [g("ActiveSector", [c(0), c(1)], "1/2"), g("ALS", [c(9)], "1/2"), g("AHS", [c(10)], "1/2"), g("Targets", [c(20)], "1/2")], [1, 2]), "不是朋友项目的通用ALC"],
  ["Almost Pair line ALS", phase4Step("AlmostPair", "Almost Pair", "Line-ALS / Box-AHS", [g("ActiveSector", [c(0), c(1)], "1/2"), g("ALS", [c(9)], "1/2"), g("AHS", [c(10)], "1/2")], [1, 2]), "Line-ALS / Box-AHS"],
  ["Almost Triple box ALS", phase4Step("AlmostTriple", "Almost Triple", "Box-ALS / Line-AHS", [g("ActiveSector", [c(0), c(1)], "1/2/3"), g("ALS", [c(9), c(10)], "1/2/3"), g("AHS", [c(18), c(19)], "1/2/3")], [1, 2, 3]), "2格/3数ALS"],
  ["Almost Triple line ALS", phase4Step("AlmostTriple", "Almost Triple", "Line-ALS / Box-AHS", [g("ActiveSector", [c(0), c(1)], "1/2/3"), g("ALS", [c(9), c(10)], "1/2/3"), g("AHS", [c(18), c(19)], "1/2/3")], [1, 2, 3]), "必须按Branch区分"],

  ["ALS-XZ single RCC", phase4Step("ALSXZ", "ALS-XZ", "Single-RCC XZ", [g("AlsA", [c(0), c(1)], "1/3/7"), g("AlsB", [c(9), c(10)], "2/3/7"), g("Rcc", [], "3"), g("Z", [], "7"), g("Targets", [c(20)], "7")], [3, 7]), "RCC要求A中的全部X"],
  ["ALS-XZ double RCC", phase4Step("ALSXZ", "ALS-XZ", "Double-RCC Rank-0", [g("AlsA", [c(0), c(1)], "1/3/7"), g("AlsB", [c(9), c(10)], "2/3/7"), g("Rcc", [], "3/7"), g("CannibalTargets", [c(1)], "7")], [3, 7]), "Double-RCC分支不能再套单Z删数解释"],
  ["ALS-XY-Wing standard", phase4Step("ALSXYWing", "ALS-XY-Wing", "Standard", [g("AlsA", [c(0)], "1/3"), g("AlsB", [c(9)], "2/3"), g("AlsC", [c(1), c(10)], "1/2/4"), g("RccX", [], "1"), g("RccY", [], "2"), g("Z", [], "3")], [1, 2, 3]), "A-C以RCC X"],
  ["ALS-XY-Wing triple linked", phase4Step("ALSXYWing", "ALS-XY-Wing", "Triple-Linked Rank-0", [g("AlsA", [c(0)], "1/3"), g("AlsB", [c(9)], "2/3"), g("AlsC", [c(1), c(10)], "1/2/3"), g("RccX", [], "1"), g("RccY", [], "2"), g("Z", [], "3")], [1, 2, 3]), "Triple-Linked分支还有第三链接"],
  ["ALS-W-Wing standard", phase4Step("ALSWWing", "ALS-W-Wing", "Standard", [g("AlsA", [c(0), c(1)], "1/5"), g("AlsB", [c(9), c(10)], "1/5"), g("StrongLink", [c(2), c(11)], "1"), g("Z", [], "5")], [1, 5]), "强链给出X_A∨X_B"],
  ["ALS-W-Wing grouped", phase4Step("ALSWWing", "Grouped ALS-W-Wing", "Grouped", [g("AlsA", [c(0), c(1)], "1/5"), g("AlsB", [c(9), c(10)], "1/5"), g("StrongLink", [c(2), c(3), c(11)], "1"), g("Z", [], "5")], [1, 5]), "强链端可以是组节点"],
  ["ALS-W-Wing rank zero", phase4Step("ALSWWing", "ALS-W-Wing", "Standard Rank-0", [g("AlsA", [c(0), c(1)], "1/5"), g("AlsB", [c(9), c(10)], "1/5"), g("StrongLink", [c(2), c(11)], "1"), g("SameHouseRcc", [], "2"), g("Z", [], "5")], [1, 5]), "按Rank 0产生额外删数"],
  ["AHS-XZ single", phase4Step("AHSXZ", "AHS-XZ", "Single-RCC XZ", [g("AhsA", [c(0), c(1)], "1/2/3"), g("AhsB", [c(9), c(10)], "1/2/4"), g("Rcc", [], "1")], [1, 3]), "不能把AHS-XZ照抄成ALS-XZ文字"],
  ["AHS-XZ double", phase4Step("AHSXZ", "AHS-XZ", "Double-RCC Rank-0", [g("AhsA", [c(0), c(1)], "1/2/3"), g("AhsB", [c(9), c(10)], "1/2/4"), g("Rcc", [], "1/2")], [1, 2]), "两个RCC把AHS位置需求"],
  ["Sue de Coq standard", phase4Step("SueDeCoq", "Sue de Coq", "Standard", [g("ActiveSector", [c(0), c(1)], "1/2/3"), g("SueB", [c(9), c(10)], "1/2"), g("SueL", [c(18)], "3/4"), g("SueInsular", [], "4")], [1, 2, 3, 4]), "候选容量等式"],
  ["Sue de Coq cannibal", phase4Step("SueDeCoq", "Cannibalized Sue de Coq", "Cannibalized", [g("ActiveSector", [c(0), c(1)], "1/2/3"), g("SueB", [c(9), c(10)], "1/2"), g("SueL", [c(18)], "2/3"), g("CannibalTargets", [c(1)], "2")], [1, 2, 3]), "Cannibalized分支要单独显示"],
);

for (const [branch, marker] of [
  ["Dual ER", "空矩形连接"], ["Dual S-Wing", "对角双值桥"], ["Triple", "三个Fireworks数字"],
  ["Quadruple", "四数字闭合容量"], ["Dual ALP", "中心双值ALP枢轴"],
  ["Dual W-Wing", "两个同候选双值格"], ["Exocet", "两格双值Base"],
]) {
  phase4Cases.push([`Fireworks ${branch}`, phase4Step("Fireworks", branch === "Triple" ? "Fireworks Triple" : branch === "Quadruple" ? "Fireworks Quadruple" : `Dual Fireworks ${branch.replace(/^Dual /, "")}`, branch, [g("FireworkArms", [c(0), c(1), c(9)], "1/2"), g(branch === "Dual ER" ? "ERConnector" : branch === "Dual S-Wing" ? "BivalueBridge" : branch === "Dual ALP" ? "ALPPivot" : branch === "Dual W-Wing" ? "BivaluePair" : branch === "Exocet" ? "BaseCells" : "Pit", [c(10)], "1/2"), g("Pit", [c(20)], "1/2")], [1, 2]), marker]);
}

phase4Cases.push(
  ["Bivalue Oddagon Type 1", phase4Step("BivalueOddagon", "Bivalue Oddagon Type 1", "Type 1 / Remote Pair", [g("OddagonBody", [c(0), c(1), c(10)], "2/7"), g("ExitCell", [c(20)], "2/7")], [2, 7]), "唯一出口格不能保留致命数字对"],
  ["Bivalue Oddagon Type 2", phase4Step("BivalueOddagon", "Bivalue Oddagon Type 2", "Type 2", [g("OddagonBody", [c(0), c(1), c(10)], "2/7"), g("Guardians", [c(20), c(21)], "5")], [2, 7]), "所有出口共享同一个额外数字"],
  ["Bivalue Oddagon Type 3", phase4Step("BivalueOddagon", "Bivalue Oddagon Type 3", "Type 3 / Locked Set", [g("OddagonBody", [c(0), c(1), c(10)], "2/7"), g("LockedSubset", [c(20), c(21)], "4/5")], [2, 7]), "同屋数组组成容量锁定"],
  ["Dual Bivalue Oddagon", phase4Step("BivalueOddagon", "Dual Bivalue Oddagon", "Dual", [g("OddagonA", [c(0), c(1), c(10)], "2/7"), g("OddagonB", [c(9), c(18), c(19)], "2/7"), g("SharedExit", [c(20)], "2/7")], [2, 7]), "两个Oddagon共享出口"],
);

for (const [branch, marker] of [
  ["Type 1", "单个额外候选是唯一破坏点"],
  ["Type 2", "两个单额外候选构成强关系"],
  ["RT + Triplet Lock Set", "RT与三数组容量合并"],
  ["RT + Triplet ERI", "RT通过ERI传递"],
  ["Almost Fireworks + Type 1 RT", "Almost Fireworks与Triplet Oddagon"],
  ["Almost Fireworks + Type 2", "Almost Fireworks与Triplet Oddagon"],
]) {
  phase4Cases.push([`Triplet Oddagon ${branch}`, phase4Step("TripletOddagon", `Triplet Oddagon ${branch}`, branch, [g("TripletBody", Array.from({length:12}, (_,i)=>c(i)), "1/2/3"), g("Targets", [c(20)], "4")], [1,2,3,4]), marker]);
}

phase4Cases.push(
  ["Death Blossom classic", phase4Step("DeathBlossom", "Death Blossom", "Classic Stem/Petals", [g("Stem", [c(0)], "1/2/3"), g("Victim", [c(20)], "5"), g("Petals", [c(1), c(9), c(10)], "1/2/3/5")], [5]), "Stem的每个候选分支"],
  ["Death Blossom complex 1", phase4Step("DeathBlossom", "Death Blossom Complex Type 1", "Complex Type 1", [g("Set", [c(0), c(1)], "1/2/3"), g("Petal", [c(9), c(10)], "1")], [3]), "核心Set具有给定自由度"],
  ["Death Blossom complex 2", phase4Step("DeathBlossom", "Death Blossom Complex Type 2", "Complex Type 2", [g("Set", [c(0), c(1)], "1/2/3"), g("Petal", [c(9), c(10)], "1"), g("Petal", [c(18), c(19)], "2")], [3]), "花瓣提供f个独立链接"],
  ["Death Blossom complex 3", phase4Step("DeathBlossom", "Death Blossom Complex Type 3", "Complex Type 3 (MSLS)", [g("Set", [c(0), c(1)], "1/2/3"), g("Petal", [c(9), c(10)], "1")], [3]), "Type 3(MSLS)必须按Rank 0"],
  ["Blossom Loop cell", phase4Step("BlossomLoop", "Cell Type Blossom Loop", "Cell Type", [g("Focus", [c(0)], "1/2/3"), g("BurringLoop", [c(1), c(10)], "5"), g("BurrBranch1", [c(9)], "1")], [5]), "Cell Type、Region Type、AALS Type"],
  ["Blossom Loop region", phase4Step("BlossomLoop", "Region Type Blossom Loop", "Region Type", [g("Focus", [c(0), c(1)], "5"), g("BurringLoop", [c(9), c(10)], "5"), g("BurrBranch1", [c(18)], "5")], [5]), "house中同数字位置"],
  ["Blossom Loop AALS", phase4Step("BlossomLoop", "AALS Type Blossom Loop", "AALS Type", [g("Focus", [c(0), c(1)], "1/2/3"), g("BurringLoop", [c(9), c(10)], "5"), g("BurrBranch1", [c(18)], "1")], [5]), "AALS唯一候选"],
);

for (const [name, step, expectedZh] of phase4Cases) {
  const payload = buildAuditedStepExplanationPayload(step, "zh");
  const guide = buildAuditedTechniqueGuide(step, "zh");
  assert.ok(payload, `${name}: no phase-4 audited payload`);
  assert.equal(guide?.length, 6, `${name}: guide does not have six fields`);
  const zhText = [payload.structure, payload.principle, payload.deduction, ...(payload.checks || []), ...guide].join("\n");
  assert.ok(zhText.includes(expectedZh), `${name}: missing marker ${expectedZh}\n${zhText}`);
  const enPayload = buildAuditedStepExplanationPayload(step, "en");
  const enGuide = buildAuditedTechniqueGuide(step, "en");
  assert.ok(enPayload && enGuide?.length === 6, `${name}: missing English audit route`);
  assert.ok(!/[\u4e00-\u9fff]/.test([enPayload.structure, enPayload.principle, enPayload.deduction, ...enGuide].join("\n")), `${name}: English contains CJK`);
}


const phase5Step = (kind, title, form, groups = [], candidates = [5]) => base({
  kind, title, candidates, cells: [c(0), c(1), c(9), c(10)], actions: [],
  eliminations: [elim(20, [candidates.at(-1) || 5])],
  nodes: [
    { id: 0, row: 0, col: 0, candidate: candidates[0] || 1, kind: "SingleCandidate", label: "start" },
    { id: 1, row: 1, col: 1, candidate: candidates.at(-1) || 5, kind: "SingleCandidate", label: "end" },
  ],
  edges: [{ from: 0, to: 1, label: "strong:row" }],
  groups: [
    { label: `Branch:${title}`, cells: [] },
    { label: `ChainFamily:${kind === "ALSChain" ? "ALS Chain" : kind}`, cells: [] },
    { label: `ChainForm:${form}`, cells: [] },
    { label: "DCL:DCL2", cells: [] },
    { label: `DigitCount:${new Set(candidates).size}`, cells: [] },
    { label: "NodeKinds:Single=2,Grouped=0,ALS=0", cells: [] },
    { label: "EndpointRelation:SameDigit", cells: [] },
    { label: "Start:5", cells: [c(0)] },
    { label: "End:5", cells: [c(10)] },
    { label: "Conclusion:Elimination", cells: [] },
    { label: "EdgeReason:row", cells: [] },
    ...groups,
  ],
});

const phase5Cases = [
  ["X-Chain", phase5Step("XChain", "X-Chain", "OpenChain", [], [5]), "整条链只使用一个数字"],
  ["X-Cycle", phase5Step("XChain", "X-Cycle", "Cycle", [], [5]), "每条弱关系两侧都有强关系"],
  ["XY-Chain", phase5Step("XYChain", "XY-Chain", "OpenChain", [{ label: "EdgeReason:cell", cells: [] }], [2, 7]), "双值格内两个候选"],
  ["AIC Type 1", phase5Step("AIC", "AIC Type 1", "OpenChain", [], [4]), "同一数字并形成至少一真的强端点推论"],
  ["AIC Type 2", (() => { const x = phase5Step("AIC", "AIC Type 2", "OpenChain", [], [4, 7]); x.groups = x.groups.map((q) => q.label === "EndpointRelation:SameDigit" ? { ...q, label: "EndpointRelation:DifferentDigit" } : q); return x; })(), "端点交换关系"],
  ["Continuous Nice Loop", phase5Step("AIC", "Continuous Nice Loop", "ContinuousLoop", [], [3]), "合并环内全部有效删数"],
  ["Discontinuous Nice Loop", (() => { const x = phase5Step("AIC", "Discontinuous Nice Loop", "DiscontinuousLoop", [], [3]); x.groups = x.groups.map((q) => q.label === "DCL:DCL2" ? { ...q, label: "DCL:DCL1" } : q); return x; })(), "不连续断点"],
  ["W-Wing by AIC", phase5Step("AIC", "W-Wing", "Wing", [{ label: "StrongPattern:VLV", cells: [] }], [2, 8]), "双值格—位置—双值格构成W型"],
  ["H-Ring by AIC", phase5Step("AIC", "H-Ring", "Ring", [{ label: "StrongPattern:VVL", cells: [] }], [2, 5, 8]), "两个双值格强边加一个位置强边构成H型"],
  ["S-Ring by AIC", phase5Step("AIC", "S-Ring", "Ring", [{ label: "StrongPattern:LVL", cells: [] }], [2, 8]), "位置—双值格—位置构成S型"],
  ["M2-Ring by AIC", phase5Step("AIC", "M2-Ring", "Ring", [{ label: "StrongPattern:VLL", cells: [] }], [2, 8]), "一个双值格强边加两个位置强边构成M型"],
  ["L1-Wing by AIC", phase5Step("AIC", "L1-Wing", "Wing", [{ label: "StrongPattern:LLL", cells: [] }, { label: "ThreeStrongClass:L1", cells: [] }], [5]), "只涉及一个数字，构成L1型"],
  ["L2-Wing by AIC", phase5Step("AIC", "L2-Wing", "Wing", [{ label: "StrongPattern:LLL", cells: [] }, { label: "ThreeStrongClass:L2", cells: [] }], [2, 8]), "共涉及两个数字，构成L2型"],
  ["L3-Wing by AIC", phase5Step("AIC", "L3-Wing", "Wing", [{ label: "StrongPattern:LLL", cells: [] }, { label: "ThreeStrongClass:L3", cells: [] }], [2, 5, 8]), "共涉及三个数字，构成L3型"],
  ["Grouped L1-Ring", phase5Step("GroupedAIC", "Grouped L1-Ring", "Ring", [{ label: "StrongPattern:LLL", cells: [] }, { label: "ThreeStrongClass:L1", cells: [] }, { label: "Grouped:true", cells: [] }, { label: "EdgeReason:group", cells: [] }], [7]), "链尾还能以弱关系接回链头"],
  ["Grouped L2-Wing", phase5Step("GroupedAIC", "Grouped L2-Wing", "Wing", [{ label: "StrongPattern:LLL", cells: [] }, { label: "ThreeStrongClass:L2", cells: [] }, { label: "Grouped:true", cells: [] }, { label: "EdgeReason:group", cells: [] }], [2, 8]), "组内候选整体充当一个逻辑端点"],
  ["Grouped L3-Ring", phase5Step("GroupedAIC", "Grouped L3-Ring", "Ring", [{ label: "StrongPattern:LLL", cells: [] }, { label: "ThreeStrongClass:L3", cells: [] }, { label: "Grouped:true", cells: [] }, { label: "EdgeReason:group", cells: [] }], [2, 5, 8]), "共涉及三个数字，构成L3型"],
  ["ALS DNL", (() => { const x = phase5Step("ALSChain", "ALS Discontinuous Nice Loop", "DiscontinuousLoop", [{ label: "EdgeReason:als", cells: [] }], [2, 8]); x.groups = x.groups.map((q) => q.label === "DCL:DCL2" ? { ...q, label: "DCL:DCL1" } : q); return x; })(), "不能把它简化为普通单候选AIC"],
  ["Complex ALS UR Guardian", phase5Step("ComplexAIC", "Complex ALS UR Guardian AIC Type 1", "OpenChain", [{ label: "EdgeReason:als", cells: [] }, { label: "EdgeReason:urguardian", cells: [] }], [2, 8]), "UR守护候选边"],
  ["Complex Tridagon AMSLS", phase5Step("ComplexAIC", "Complex Tridagon AIC Type 1", "OpenChain", [{ label: "EdgeReason:tridagon", cells: [] }, { label: "EdgeReason:amsls", cells: [] }], [2, 8]), "AMSLS秩结构边"],
];

for (const [name, step, expectedZh] of phase5Cases) {
  const payload = buildAuditedStepExplanationPayload(step, "zh");
  const guide = buildAuditedTechniqueGuide(step, "zh");
  assert.ok(payload, `${name}: no phase-5 audited payload`);
  assert.equal(guide?.length, 6, `${name}: guide does not have six fields`);
  const zhText = [payload.structure, payload.principle, payload.deduction, ...(payload.checks || []), ...guide].join("\n");
  assert.ok(zhText.includes(expectedZh), `${name}: missing marker ${expectedZh}\n${zhText}`);
  const enPayload = buildAuditedStepExplanationPayload(step, "en");
  const enGuide = buildAuditedTechniqueGuide(step, "en");
  assert.ok(enPayload && enGuide?.length === 6, `${name}: missing English audit route`);
  assert.ok(!/[\u4e00-\u9fff]/.test([enPayload.structure, enPayload.principle, enPayload.deduction, ...enGuide].join("\n")), `${name}: English contains CJK`);
}


// Phase 6: source-audited Force Chain, Dynamic Chain, Whip and Braid branches.
const phase6Cases = [
  ["Cell Force Chain", base({
    kind: "CellRegionFC", title: "Cell Force Chain", candidates: [6], actions: [], eliminations: [elim(20, [6])],
    chainBranches: [{ label: "branch 1", nodes: [], edges: [] }, { label: "branch 2", nodes: [], edges: [] }, { label: "branch 3", nodes: [], edges: [] }],
    groups: [
      { label: "ForceChainKind:Cell Force Chain", cells: [] },
      { label: "BranchCount:3", cells: [] },
      { label: "MergeRule:EndpointDeletionIntersection", cells: [] },
      { label: "Target:6", cells: [c(0)] },
      { label: "BranchEndpoint1:12", cells: [c(1)] },
      { label: "BranchEndpoint2:16", cells: [c(2)] },
      { label: "CommonTargets:6", cells: [c(20)] },
    ],
  }), "端点删数集合的交集"],
  ["Region Force Chain", base({
    kind: "CellRegionFC", title: "Region Force Chain", candidates: [4], actions: [], eliminations: [elim(30, [4])],
    chainBranches: [{ label: "branch 1", nodes: [], edges: [] }, { label: "branch 2", nodes: [], edges: [] }],
    groups: [{ label: "ForceChainKind:Region Force Chain", cells: [] }, { label: "BranchCount:2", cells: [] }, { label: "MergeRule:EndpointDeletionIntersection", cells: [] }, { label: "CommonTargets:4", cells: [c(30)] }],
  }), "输出仍是标准 Forcing Chain"],
  ["UR Force Chain", base({
    kind: "CellRegionFC", title: "UR Force Chain", candidates: [2], actions: [], eliminations: [elim(40, [2])],
    chainBranches: [{ label: "branch 1", nodes: [], edges: [] }, { label: "branch 2", nodes: [], edges: [] }],
    groups: [{ label: "ForceChainKind:UR Force Chain", cells: [] }, { label: "BranchCount:2", cells: [] }, { label: "MergeRule:EndpointDeletionIntersection", cells: [] }, { label: "WitnessUR:27", cells: [c(0), c(8), c(18), c(26)] }, { label: "CommonTargets:2", cells: [c(40)] }],
  }), "只是搜索实体分类"],
  ["Triplet Oddagon Force Chain", base({
    kind: "CellRegionFC", title: "Triplet Oddagon Force Chain", candidates: [8], actions: [], eliminations: [elim(50, [8])],
    chainBranches: [{ label: "branch 1", nodes: [], edges: [] }, { label: "branch 2", nodes: [], edges: [] }],
    groups: [{ label: "ForceChainKind:Triplet Oddagon Force Chain", cells: [] }, { label: "BranchCount:2", cells: [] }, { label: "MergeRule:EndpointDeletionIntersection", cells: [] }, { label: "WitnessTripletOddagon:238", cells: [c(0), c(10), c(20)] }, { label: "CommonTargets:8", cells: [c(50)] }],
  }), "对全部集合取交集"],
  ["Whip", base({
    kind: "Whip", title: "Whip[5]", candidates: [7], actions: [], eliminations: [elim(0, [7])],
    groups: [{ label: "Branch:Whip", cells: [] }, { label: "WhipLength:5", cells: [] }, { label: "Grouped:false", cells: [] }, { label: "ProofShape:SingleSpine", cells: [] }, { label: "Target:7", cells: [c(0)] }, { label: "Terminal:Cell", cells: [c(10)] }],
  }), "单一主干"],
  ["g-Whip", base({
    kind: "GWhip", title: "g-Whip[7]", candidates: [9], actions: [], eliminations: [elim(3, [9])],
    nodes: [{ id: 1, ...c(0), digit: 9, kind: "GroupCandidate", sectorCells: [c(0), c(1)] }],
    groups: [{ label: "Branch:g-Whip", cells: [] }, { label: "WhipLength:7", cells: [] }, { label: "Grouped:true", cells: [] }, { label: "ProofShape:SingleSpine", cells: [] }, { label: "Target:9", cells: [c(3)] }, { label: "GroupedNodeCount:1", cells: [] }, { label: "Terminal:Row:9", cells: [c(9), c(10)] }],
  }), "合法分组节点"],
  ["Dynamic contradiction ON", base({
    kind: "DynamicChain", title: "Dynamic Chain", candidates: [5], actions: [], eliminations: [elim(0, [5])],
    chainBranches: [{ label: "ON conclusion", nodes: [], edges: [] }, { label: "OFF conclusion", nodes: [], edges: [] }],
    groups: [{ label: "DynamicMode:Contradiction", cells: [] }, { label: "Source:5", cells: [c(0)] }, { label: "SourceState:ON", cells: [c(0)] }, { label: "Collision:8", cells: [c(20)] }, { label: "BranchCount:2", cells: [] }],
  }), "否定源ON就删去源候选"],
  ["Dynamic contradiction OFF", base({
    kind: "DynamicChain", title: "Dynamic Chain", candidates: [5], actions: [place(0, 5)], eliminations: [],
    chainBranches: [{ label: "ON conclusion", nodes: [], edges: [] }, { label: "OFF conclusion", nodes: [], edges: [] }],
    groups: [{ label: "DynamicMode:Contradiction", cells: [] }, { label: "Source:5", cells: [c(0)] }, { label: "SourceState:OFF", cells: [c(0)] }, { label: "Collision:8", cells: [c(20)] }, { label: "BranchCount:2", cells: [] }],
  }), "否定源OFF就确定源候选"],
  ["Dynamic verity placement", base({
    kind: "DynamicChain", title: "Dynamic Chain", candidates: [6], actions: [place(20, 6)], eliminations: [],
    chainBranches: [{ label: "Source ON branch", nodes: [], edges: [] }, { label: "Source OFF branch", nodes: [], edges: [] }],
    groups: [{ label: "DynamicMode:VerityPlacement", cells: [] }, { label: "Source:4", cells: [c(0)] }, { label: "Conclusion:6", cells: [c(20)] }, { label: "BranchCount:2", cells: [] }],
  }), "两种完备状态都推出同一出数或删数"],
  ["Dynamic verity elimination", base({
    kind: "DynamicChain", title: "Dynamic Chain", candidates: [6], actions: [], eliminations: [elim(20, [6])],
    chainBranches: [{ label: "Source ON branch", nodes: [], edges: [] }, { label: "Source OFF branch", nodes: [], edges: [] }],
    groups: [{ label: "DynamicMode:VerityElimination", cells: [] }, { label: "Source:4", cells: [c(0)] }, { label: "Conclusion:6", cells: [c(20)] }, { label: "BranchCount:2", cells: [] }],
  }), "结论与源候选真假无关"],
  ["Grouped Dynamic", base({
    kind: "DynamicChain", title: "Grouped Dynamic Chain", candidates: [3], actions: [], eliminations: [elim(30, [3])],
    chainBranches: [{ label: "ON", nodes: [], edges: [] }],
    groups: [{ label: "DynamicMode:Contradiction", cells: [] }, { label: "Source:3", cells: [c(0)] }, { label: "SourceState:ON", cells: [c(0)] }, { label: "Grouped:true", cells: [] }],
  }), "分组动态链"],
  ["Braid", base({
    kind: "Braid", title: "Braid[6]", candidates: [1], actions: [], eliminations: [elim(36, [1])],
    chainBranches: [{ label: "branch 1", nodes: [], edges: [] }, { label: "branch 2", nodes: [], edges: [] }, { label: "branch 3", nodes: [], edges: [] }],
    groups: [{ label: "Branch:Braid[6]", cells: [] }, { label: "ProofShape:Branching", cells: [] }, { label: "Grouped:false", cells: [] }, { label: "BraidRank:6", cells: [] }, { label: "Target:1", cells: [c(36)] }, { label: "ProofBranchCount:3", cells: [] }],
  }), "全部左链接可能"],
  ["g-Braid", base({
    kind: "GBraid", title: "g-Braid[8]", candidates: [6], actions: [], eliminations: [elim(67, [6])],
    chainBranches: [{ label: "branch 1", nodes: [], edges: [] }, { label: "branch 2", nodes: [], edges: [] }],
    groups: [{ label: "Branch:g-Braid[8]", cells: [] }, { label: "ProofShape:Branching", cells: [] }, { label: "Grouped:true", cells: [] }, { label: "BraidRank:8", cells: [] }, { label: "Target:6", cells: [c(67)] }, { label: "ProofBranchCount:2", cells: [] }],
  }), "分组Braid"],
  ["Braid search reclassified as Whip", base({
    kind: "Whip", title: "Whip[4]", candidates: [2], actions: [], eliminations: [elim(15, [2])],
    groups: [{ label: "Branch:Whip[4]", cells: [] }, { label: "ProofShape:SingleSpine", cells: [] }, { label: "Grouped:false", cells: [] }, { label: "BraidRank:4", cells: [] }, { label: "Target:2", cells: [c(15)] }],
  }), "单一主干"],
];

for (const [name, step, expectedZh] of phase6Cases) {
  const payload = buildAuditedStepExplanationPayload(step, "zh");
  const guide = buildAuditedTechniqueGuide(step, "zh");
  assert.ok(payload, `${name}: no phase-6 audited payload`);
  assert.equal(guide?.length, 6, `${name}: guide does not have six fields`);
  const zhText = [payload.structure, payload.principle, payload.deduction, ...(payload.checks || []), ...guide].join("\n");
  assert.ok(zhText.includes(expectedZh), `${name}: missing marker ${expectedZh}\n${zhText}`);
  if (step.kind === "CellRegionFC") {
    assert.ok(!zhText.includes("矛盾链"), `${name}: Force Chain must not be presented as a contradiction chain`);
  }
  const enPayload = buildAuditedStepExplanationPayload(step, "en");
  const enGuide = buildAuditedTechniqueGuide(step, "en");
  assert.ok(enPayload && enGuide?.length === 6, `${name}: missing English audit route`);
  assert.ok(!/[\u4e00-\u9fff]/.test([enPayload.structure, enPayload.principle, enPayload.deduction, ...enGuide].join("\n")), `${name}: English contains CJK`);
}


// Phase 7: source-audited SK Loop, MSLS, Exocet and BruteForce branches.
const phase7Cases = [
  ["SK Loop", base({
    kind: "SKLoop", title: "SK Loop", candidates: [1, 2, 3, 4], actions: [], eliminations: [elim(20, [4])], rank: 0,
    groups: [
      { label: "Branch:Domino/SK Loop", cells: [] }, { label: "CellCount:16", cells: [] },
      { label: "SegmentCount:8", cells: [] }, { label: "LinkSlotCount:16", cells: [] },
      { label: "LinkCount:16", cells: [] }, { label: "Rank:0", cells: [] },
      { label: "LoopBody", cells: [c(0), c(1), c(9), c(10)] },
      { label: "Link:1/4r1", cells: [c(0), c(1)] }, { label: "Link:2/3b1", cells: [c(9), c(10)] },
    ],
  }), "8个分组链接段"],
  ["MSLS Exact", base({
    kind: "MSLS", title: "MSLS", candidates: [2, 4, 5, 6, 7, 9], actions: [], eliminations: [elim(24, [7])], rank: 0,
    groups: [
      { label: "Branch:Exact Rank-0", cells: [] }, { label: "CellCount:6", cells: [] },
      { label: "LinkCount:6", cells: [] }, { label: "Rank:0", cells: [] },
      { label: "Core", cells: [c(12), c(13), c(14), c(15), c(16), c(17)] },
      { label: "Link:2r2", cells: [] }, { label: "Link:7b3", cells: [] },
    ],
  }), "选取最小覆盖"],
  ["MSLS Advanced Attachment", base({
    kind: "MSLS", title: "MSLS", candidates: [1, 2, 3, 4], actions: [], eliminations: [elim(30, [3])], rank: 0,
    groups: [
      { label: "Branch:Advanced Rank-0 with Attachment", cells: [] }, { label: "CellCount:8", cells: [] },
      { label: "LinkCount:8", cells: [] }, { label: "Rank:0", cells: [] },
      { label: "Core", cells: [c(0), c(1), c(9), c(10)] }, { label: "Attachment", cells: [c(18), c(19)] },
      { label: "PermutableDigits:2/4", cells: [] }, { label: "Link:2r1", cells: [] }, { label: "Link:4c2", cells: [] },
    ],
  }), "浮动数字枚举行侧/列侧分配"],
  ["Junior Exocet checks", base({
    kind: "JE", title: "Junior Exocet", candidates: [1, 2, 5, 9], actions: [], eliminations: [elim(40, [5])],
    groups: [
      { label: "Branch:Junior Exocet", cells: [] }, { label: "BaseCandidates:1/2/5/9", cells: [] },
      { label: "Base", cells: [c(0), c(1)] }, { label: "Targets Q", cells: [c(20)] }, { label: "Targets R", cells: [c(47)] },
      { label: "Cross", cells: [c(9), c(10), c(11)] }, { label: "Check:Locked Member In Target", cells: [] },
      { label: "Check:Mirror Check", cells: [] },
    ],
  }), "实际启用检查"],
  ["Senior Exocet checks", base({
    kind: "SeniorExocet", title: "Senior Exocet", candidates: [2, 4, 6, 8], actions: [], eliminations: [elim(50, [6])],
    groups: [
      { label: "Branch:Senior Exocet", cells: [] }, { label: "BaseCandidates:2/4/6/8", cells: [] },
      { label: "Base", cells: [c(0), c(1)] }, { label: "Targets", cells: [c(20), c(21), c(22)] },
      { label: "Cross", cells: [c(9), c(10), c(11)] }, { label: "TargetGroupA", cells: [c(20), c(21)] },
      { label: "TargetGroupB", cells: [c(22), c(23)] }, { label: "Check:Cross-Line Need", cells: [] },
      { label: "Check:Incompatible Base", cells: [] }, { label: "Check:Potential Target Cover House", cells: [] },
    ],
  }), "独立检查"],
  ["Weak Exocet Z only", base({
    kind: "WeakExocet", title: "Weak Exocet", candidates: [1, 2, 3, 4], actions: [], eliminations: [elim(40, [3])],
    groups: [
      { label: "Branch:Weak Exocet", cells: [] }, { label: "BaseCandidates:1/2/3/4", cells: [] },
      { label: "Base", cells: [c(0), c(1)] }, { label: "Targets", cells: [c(20), c(21), c(47), c(48)] },
      { label: "Cross", cells: [c(9), c(10), c(11)] }, { label: "WeakSeat", cells: [c(42)] },
      { label: "YLock:4", cells: [] }, { label: "YArea", cells: [c(36), c(37)] },
      { label: "ZZone", cells: [c(54), c(55)] }, { label: "ZZoneTargets", cells: [c(54), c(55)] },
      { label: "Check:Z zone check", cells: [] },
    ],
  }), "Z区检查"],
  ["Weak Exocet multi-check", base({
    kind: "WeakExocet", title: "Weak Exocet", candidates: [1, 2, 3, 4], actions: [], eliminations: [elim(6, [1, 4, 6]), elim(12, [9]), elim(55, [5, 9]), elim(71, [1]), elim(79, [3])],
    groups: [
      { label: "Branch:Weak Exocet", cells: [] }, { label: "BaseCandidates:1/2/3/4", cells: [] },
      { label: "Base", cells: [c(18), c(19)] }, { label: "Targets", cells: [c(3), c(12), c(6), c(15)] },
      { label: "Cross", cells: [c(29), c(38), c(47)] }, { label: "WeakSeat", cells: [c(42)] },
      { label: "YLock:3", cells: [] }, { label: "YArea", cells: [c(36), c(37)] },
      { label: "TCheckTargets", cells: [c(6), c(12)] }, { label: "ZZoneTargets", cells: [c(55)] },
      { label: "WZoneTargets", cells: [c(71), c(79)] }, { label: "MNodes", cells: [c(4), c(5)] },
      { label: "MCheckTargets", cells: [c(6)] },
      { label: "Check:Target Cells Check", cells: [] }, { label: "Check:Z zone check", cells: [] },
      { label: "Check:W zone check", cells: [] }, { label: "Check:Mirror Check", cells: [] },
    ],
  }), "M格检查（Mirror Check）"],
  ["Double JExocet", base({
    kind: "JE", title: "Double JExocet", candidates: [1, 2, 3, 4], actions: [], eliminations: [elim(60, [4])],
    groups: [
      { label: "Branch:Double JExocet", cells: [] }, { label: "BaseCandidates:1/2/3/4", cells: [] },
      { label: "Base A", cells: [c(0), c(1)] }, { label: "Base B", cells: [c(70), c(71)] },
      { label: "Targets A", cells: [c(20), c(21)] }, { label: "Targets B", cells: [c(47), c(48)] },
      { label: "Cross", cells: [c(9), c(10), c(11)] }, { label: "Check:True Base digits in non-S", cells: [] },
    ],
  }), "两套JE"],
  ["Almost JE4", base({
    kind: "JE", title: "Almost JE4", candidates: [1, 2, 5, 9], actions: [], eliminations: [elim(69, [1, 2, 5, 9])],
    groups: [
      { label: "Branch:Almost JE4", cells: [] }, { label: "MissingBaseDigit:1", cells: [] },
      { label: "Base A", cells: [c(67), c(68)] }, { label: "Base B", cells: [c(79), c(80)] },
      { label: "Targets A", cells: [c(56), c(60)] }, { label: "Targets B", cells: [c(56), c(57)] },
      { label: "Cross", cells: [c(2), c(3), c(6)] }, { label: "Check:S-cell requirement", cells: [] },
    ],
  }), "缺失数字1"],
  ["BruteForce verified solution", base({
    kind: "BruteForce", title: "BruteForce", candidates: [9], cells: [c(0)], actions: [place(0, 9)], eliminations: [],
    groups: [
      { label: "Branch:Verified-Solution Placement", cells: [] }, { label: "Source:CompleteSolution", cells: [] },
      { label: "CandidateCount:3", cells: [] },
    ],
  }), "完整终解已由全盘搜索验证"],
];

for (const [name, step, expectedZh] of phase7Cases) {
  const payload = buildAuditedStepExplanationPayload(step, "zh");
  const guide = buildAuditedTechniqueGuide(step, "zh");
  assert.ok(payload, `${name}: no phase-7 audited payload`);
  assert.equal(guide?.length, 6, `${name}: guide does not have six fields`);
  const zhText = [payload.structure, payload.principle, payload.deduction, ...(payload.checks || []), ...guide].join("\n");
  assert.ok(zhText.includes(expectedZh), `${name}: missing marker ${expectedZh}\n${zhText}`);
  const enPayload = buildAuditedStepExplanationPayload(step, "en");
  const enGuide = buildAuditedTechniqueGuide(step, "en");
  assert.ok(enPayload && enGuide?.length === 6, `${name}: missing English audit route`);
  assert.ok(!/[\u4e00-\u9fff]/.test([enPayload.structure, enPayload.principle, enPayload.deduction, ...enGuide].join("\n")), `${name}: English contains CJK`);
}

{
  const zOnlyStep = phase7Cases.find(([name]) => name === "Weak Exocet Z only")?.[1];
  const zOnlyPayload = buildAuditedStepExplanationPayload(zOnlyStep, "zh");
  const zOnlyGuide = buildAuditedTechniqueGuide(zOnlyStep, "zh");
  const text = [zOnlyPayload.structure, zOnlyPayload.principle, zOnlyPayload.deduction, ...(zOnlyPayload.checks || []), ...zOnlyGuide].join("\n");
  assert.ok(text.includes("Y区锁定4"), "Weak Exocet Z-only must show Y-lock 4");
  assert.ok(text.includes("Z区检查"), "Weak Exocet Z-only must show Z-zone check");
  assert.ok(!text.includes("W区检查删除"), "Weak Exocet Z-only must not invent W-zone proof");
  assert.ok(!text.includes("M格检查利用"), "Weak Exocet Z-only must not invent M-cell proof");
}

{
  const multiStep = phase7Cases.find(([name]) => name === "Weak Exocet multi-check")?.[1];
  const payload = buildAuditedStepExplanationPayload(multiStep, "zh");
  const guide = buildAuditedTechniqueGuide(multiStep, "zh");
  const text = [payload.structure, payload.principle, payload.deduction, ...(payload.checks || []), ...guide].join("\n");
  assert.ok(text.includes("T格检查"), "Weak Exocet multi-check must use T-cell terminology");
  assert.ok(text.includes("M格检查（Mirror Check）"), "Weak Exocet multi-check must use M-cell terminology");
  assert.ok(text.includes("不是T邻规则"), "Weak Exocet Mirror Check must not be called Adjacent Target");
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

console.log(`test-step-explanation: ok (${cases.length} baseline + ${auditedUniquenessCases.length} regression + ${phase1BranchCases.length} phase-1 + ${phase2FoundationCases.length} phase-2 foundation + ${phase2StructureWingCases.length} phase-2 structure/wing + ${phase3Cases.length} phase-3 fixtures + ${phase4Cases.length} phase-4 entity branches + ${phase5Cases.length} phase-5 chain branches + ${phase6Cases.length} phase-6 forcing/dynamic/whip/braid branches + ${phase7Cases.length} phase-7 rank/exocet/fallback branches, x2 locales)`);
