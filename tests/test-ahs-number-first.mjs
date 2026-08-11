/*
 * AHS 中文输出与动态解释必须以候选数组合@house为第一识别信息。
 * 格组用于承载位置与HLS证明，不能像ALS一样先列格再补候选。
 */
import assert from "node:assert/strict";
import { localizedStepDescription } from "../step-localization.js";
import { buildStepExplanationModel, buildAuditedTechniqueGuide } from "../step-explanation.js";

const c = (index) => ({ index, row: Math.floor(index / 9), col: index % 9 });
const elim = (index, candidates) => ({ ...c(index), candidates });
const base = (kind, title, candidates, cells, groups, target) => ({
  valid: true,
  kind,
  title,
  description: "",
  candidates,
  cells: cells.map(c),
  actions: [],
  eliminations: [elim(target.index, target.candidates)],
  groups,
  nodes: [],
  edges: [],
  chainBranches: [],
  rank: 0,
});

const ahsXZ = base("AHSXZ", "AHS-XZ", [2, 3, 5, 8, 9], [0, 4, 5, 3, 13, 21], [
  { label: "Branch:Classic Shared-Cell", cells: [] },
  { label: "AhsA:25@r1", cells: [c(0), c(4), c(5)] },
  { label: "AhsB:389@b2", cells: [c(3), c(4), c(13), c(21)] },
  { label: "Rcc:Shared-Cell", cells: [c(4)] },
], { index: 13, candidates: [2] });

const ahsXY = base("AHSXYWing", "AHS-XY-Wing", [1, 2, 4, 5, 7, 8], [11, 20, 29, 10, 12, 16, 17, 26, 35, 53], [
  { label: "AhsA:24@c3", cells: [c(11), c(20), c(29)] },
  { label: "AhsB(Pivot):1578@r2", cells: [c(10), c(11), c(12), c(16), c(17)] },
  { label: "AhsC:158@c9", cells: [c(17), c(26), c(35), c(53)] },
  { label: "RccX:Locked-Set Position", cells: [c(20), c(11)] },
  { label: "ExtraX(A):r3c3", cells: [c(20)] },
  { label: "HlsX(A):r3c3", cells: [c(20)] },
  { label: "SupportX(A):2", cells: [c(20)] },
  { label: "ExtraX(B):r2c3", cells: [c(11)] },
  { label: "HlsX(B):r2c3", cells: [c(11)] },
  { label: "SupportX(B):2", cells: [c(11)] },
  { label: "RccY:Overlap-Hall Group", cells: [c(26), c(17)] },
  { label: "ExtraY(C):r3c9", cells: [c(26)] },
  { label: "HlsY(C):r3c9", cells: [c(26)] },
  { label: "SupportY(C):1", cells: [c(26)] },
  { label: "ExtraY(B):r2c9", cells: [c(17)] },
  { label: "HlsY(B):r2c9", cells: [c(17)] },
  { label: "SupportY(B):1", cells: [c(17)] },
], { index: 35, candidates: [4] });

const ahsW = base("AHSWWing", "AHS-W-Wing", [1, 2, 6, 7, 8], [8, 16, 34, 43, 61, 33, 44, 53], [
  { label: "AhsA:167@c8", cells: [c(16), c(34), c(43), c(61)] },
  { label: "PivotA:1", cells: [c(8)] },
  { label: "Pivot:126", cells: [c(8)] },
  { label: "PivotB:26", cells: [c(8)] },
  { label: "AhsB:2678@b6", cells: [c(33), c(34), c(43), c(44), c(53)] },
  { label: "ExtraA:r2c8", cells: [c(16)] },
  { label: "HlsA:r2c8", cells: [c(16)] },
  { label: "SupportA:1", cells: [c(16)] },
  { label: "ExtraB:r56c9", cells: [c(44), c(53)] },
  { label: "HlsB:b6p169", cells: [c(33), c(44), c(53)] },
  { label: "SupportB:26", cells: [c(43), c(53)] },
], { index: 34, candidates: [3] });

for (const [step, expected] of [
  [ahsXZ, ["AHS A=25@r1{r1c1、r1c5、r1c6}", "AHS B=389@b2{"]],
  [ahsXY, ["AHS A=24@c3{", "枢纽AHS B=1578@r2{", "AHS C=158@c9{"]],
  [ahsW, ["AHS A=167@c8{", "AHS B=2678@b6{"]],
]) {
  const localized = localizedStepDescription(step, "zh");
  for (const token of expected) assert.ok(localized.includes(token), `${step.kind} localized output missing ${token}\n${localized}`);
  assert.ok(!localized.includes("结构格为"), `${step.kind} must not use the generic cell-first output`);
  const firstAhs = localized.indexOf("AHS A=");
  const firstCoord = localized.indexOf("{r");
  assert.ok(firstAhs >= 0 && firstAhs < firstCoord, `${step.kind} localized output must introduce the digit-set label before coordinates`);

  const model = buildStepExplanationModel(step, "zh");
  const structure = model.sections.find((section) => section.key === "structure")?.text || "";
  assert.ok(structure.startsWith("候选数组合优先："), `${step.kind} dynamic structure must explicitly be digit-first\n${structure}`);
  for (const token of expected) assert.ok(structure.includes(token), `${step.kind} dynamic structure missing ${token}\n${structure}`);
  assert.ok(structure.indexOf("AHS A=") < structure.indexOf("{r"), `${step.kind} dynamic explanation must name candidates/house before cells`);
  if (step.kind !== "AHSXYWing") assert.ok(!structure.includes("枢纽AHS B"), `${step.kind} must not mislabel AHS B as the pivot`);

  const guide = buildAuditedTechniqueGuide(step, "zh");
  const guideText = Array.isArray(guide) ? guide.join("\n") : JSON.stringify(guide);
  assert.ok(/数字集@house|候选数组合|数字集合/.test(guideText), `${step.kind} audited guide must instruct digit-first reading`);
}

console.log("AHS candidate-first localization and dynamic explanation tests passed.");

// Regression for generalized AHS-XZ protocol ownership.
// Semantic facts such as the AHS house are backend-owned. The frontend may
// localize/render them, but must never infer them from carrier cells.
const generalizedAhsXzWithHouse = base("AHSXZ", "AHS-XZ", [1, 2, 3, 6, 7, 8],
  [0, 3, 4, 6, 7, 8, 60, 61, 69, 79, 80], [
    { label: "Branch:Single-RCC XZ", cells: [] },
    { label: "AhsA:12367@r1", cells: [c(0), c(3), c(4), c(6), c(7), c(8)] },
    { label: "AhsB:1278@b9", cells: [c(60), c(61), c(69), c(79), c(80)] },
    { label: "Rcc:1", cells: [] },
  ], { index: 60, candidates: [2] });

{
  const localized = localizedStepDescription(generalizedAhsXzWithHouse, "zh");
  assert.ok(localized.includes("AHS A=12367@r1{"), `backend AHS-XZ house r1 must be rendered verbatim\n${localized}`);
  assert.ok(localized.includes("AHS B=1278@b9{"), `backend AHS-XZ house b9 must be rendered verbatim\n${localized}`);
  assert.ok(localized.includes("单 RCC XZ"), `Chinese AHS-XZ branch must be localized\n${localized}`);
  assert.ok(!localized.includes("Single-RCC XZ"), `Chinese output must not leak English branch enum\n${localized}`);
  assert.ok(!localized.includes("与house"), `Chinese output must not mix English house into prose\n${localized}`);

  const model = buildStepExplanationModel(generalizedAhsXzWithHouse, "zh");
  const text = model.sections.map((section) => section.text).join("\n");
  assert.ok(text.includes("AHS A=12367@r1{"), `dynamic explanation must consume backend r1 metadata\n${text}`);
  assert.ok(text.includes("AHS B=1278@b9{"), `dynamic explanation must consume backend b9 metadata\n${text}`);
}

const malformedAhsXzWithoutHouse = base("AHSXZ", "AHS-XZ", [1, 2, 3, 6, 7, 8],
  [0, 3, 4, 6, 7, 8, 60, 61, 69, 79, 80], [
    { label: "Branch:Single-RCC XZ", cells: [] },
    { label: "AhsA:12367", cells: [c(0), c(3), c(4), c(6), c(7), c(8)] },
    { label: "AhsB:1278", cells: [c(60), c(61), c(69), c(79), c(80)] },
    { label: "Rcc:1", cells: [] },
  ], { index: 60, candidates: [2] });

{
  const localized = localizedStepDescription(malformedAhsXzWithoutHouse, "zh");
  assert.ok(localized.includes("@元数据缺失{"), `missing backend house metadata must be exposed, not guessed\n${localized}`);
  assert.ok(!localized.includes("@r1{"), `frontend must not infer r1 from cells\n${localized}`);
  assert.ok(!localized.includes("@b9{"), `frontend must not infer b9 from cells\n${localized}`);

  const modelZh = buildStepExplanationModel(malformedAhsXzWithoutHouse, "zh");
  const textZh = modelZh.sections.map((section) => section.text).join("\n");
  assert.ok(textZh.includes("@元数据缺失{"), `dynamic explanation must expose missing backend metadata\n${textZh}`);
  assert.ok(!textZh.includes("@r1{"), `dynamic explanation must not infer r1\n${textZh}`);
  assert.ok(!textZh.includes("@b9{"), `dynamic explanation must not infer b9\n${textZh}`);

  const modelEn = buildStepExplanationModel(malformedAhsXzWithoutHouse, "en");
  const textEn = modelEn.sections.map((section) => section.text).join("\n");
  assert.ok(textEn.includes("@metadata missing{"), `English explanation must expose missing backend metadata\n${textEn}`);
  assert.ok(!/[\u3400-\u9fff]/u.test(textEn), `English explanation must not leak Chinese\n${textEn}`);
}

console.log("AHS backend-authoritative metadata tests passed.");
