import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAuditedStepExplanationPayload, buildAuditedTechniqueGuide } from "../step-explanation.js";

const fixture = new URL("../../tools/real_training_samples/ROUND15_SEED_REAL_TRAINING_SAMPLES.jsonl", import.meta.url);
const lines = fs.readFileSync(fixture, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const manifest = lines.shift();
assert.equal(manifest.recordType, "manifest");
const records = lines.filter((item) => item.kind === "Multifish");
assert.equal(records.length, 4, "Round15 Multi-Fish pass must retain 4 real backend samples");

const get = (targetId) => {
  const record = records.find((item) => item.targetId === targetId);
  assert.ok(record, `missing real Multi-Fish sample ${targetId}`);
  return record;
};
const labels = (record) => new Set(record.matchedStep.groups.map((g) => g.label));
const payload = (record) => {
  const p = buildAuditedStepExplanationPayload(record.matchedStep, "zh");
  assert.ok(p, `missing audited Multi-Fish payload ${record.targetId}`);
  return p;
};

const row = get("Multifish::Row-Based");
const cannibalOnly = get("Multifish::Row-Based::CannibalOnly");
const column = get("Multifish::Column-Based::CellLinksCannibal");
const truthCells = get("Multifish::Row-Based::TruthCells");

assert.ok(labels(row).has("Branch:Row-Based"), "row sample must retain backend Branch:Row-Based");
assert.ok(labels(column).has("Branch:Column-Based"), "column sample must retain backend Branch:Column-Based");
assert.ok(labels(column).has("CellLinks"), "column sample must retain a real CellLinks structure");
assert.ok([...labels(cannibalOnly)].some((x) => x.startsWith("CannibalTargets")), "cannibal-only sample must retain backend CannibalTargets");
assert.ok(!labels(cannibalOnly).has("Targets"), "cannibal-only sample must really have no ordinary Targets");
assert.ok(labels(truthCells).has("TruthCells"), "Round15 must retain a real TruthCells structure");
assert.ok(labels(truthCells).has("CellLinks"), "TruthCells sample must also retain its real CellLinks structure");

for (const record of records) {
  const p = payload(record);
  assert.match(p.structure, /这不是单数字鱼.*搜索从源数字.*最终证明以后端实际Truth\/Link分组为准.*必须兑现的数字×区域任务.*至多接收一个真候选的容量约束/s,
    `${record.targetId} first screen must translate Truth/Link into human task/capacity language`);
  assert.match(p.principle, /Truth想成必须完成的任务.*Link想成只有一个座位.*任务数和座位数.*一一占满/s,
    `${record.targetId} first-screen proof must explain the equal task/seat occupancy`);
  assert.doesNotMatch(p.principle, /Rank\s*[=:]?\s*0|TruthCount|LinkCount|严格/i,
    `${record.targetId} first-screen principle must not lead with rank/count jargon`);
  assert.match((p.checks || []).join("\n"), /TruthCount=.*LinkCount=.*Rank=0.*行基型\/列基型方向.*后端分组.*不从标题猜测/s,
    `${record.targetId} strict rank facts must remain in the verification layer`);

  const nativeZh = record.matchedStep.explanation?.zh;
  assert.ok(nativeZh, `${record.targetId} missing native C++ explanation snapshot`);
  assert.match(nativeZh.structure, /这不是单数字鱼.*搜索从源数字.*实际Truth\/Link分组.*必须兑现的数字×区域任务.*容量约束/s,
    `${record.targetId} native structure must use the same human explanation`);
  assert.match(nativeZh.principle, /Truth想成必须完成的任务.*Link想成只有一个座位.*一一占满/s,
    `${record.targetId} native principle must match the JS readability model`);
  assert.doesNotMatch(nativeZh.principle, /Rank\s*[=:]?\s*0|TruthCount|LinkCount|严格/i,
    `${record.targetId} native first-screen principle must keep strict rank jargon downstream`);
}

{
  const p = payload(row);
  assert.match(p.structure, /复数鱼（行基型）/, "Row-Based must be localized as 行基型");
  assert.match(p.deduction, /外部目标若为真.*占掉.*Link座位.*Truth无处安置/s,
    "ordinary Multi-Fish must explain external target as stolen capacity");
  assert.doesNotMatch(p.deduction, /结构内自噬目标/, "ordinary sample must not invent a cannibal branch");
}

{
  const p = payload(cannibalOnly);
  assert.match(p.structure, /结构内自噬目标=/, "cannibal-only structure must explicitly identify internal targets");
  assert.match(p.deduction, /结构内自噬目标已经属于这套结构.*重复占位或额外冲突/s,
    "cannibal-only deduction must explain its internal contradiction");
  assert.doesNotMatch(p.deduction, /外部目标若为真/, "cannibal-only sample must not discuss a nonexistent ordinary target");
  const native = cannibalOnly.matchedStep.explanation.zh.deduction;
  assert.doesNotMatch(native, /外部目标若为真/, "native cannibal-only explanation must not invent external targets");
}

{
  const p = payload(column);
  assert.match(p.structure, /复数鱼（列基型）/, "Column-Based must be localized as 列基型");
  assert.match(p.structure, /另有单格Link=/, "real CellLinks must be visible on the first screen");
  assert.match(p.deduction, /外部目标若为真.*结构内自噬目标已经属于这套结构/s,
    "mixed sample must explain ordinary and cannibal targets separately");
  const guide = buildAuditedTechniqueGuide(column.matchedStep, "zh") || [];
  assert.match(guide.join("\n"), /单格Link同样只能容纳一个真候选/s,
    "real CellLinks sample must explain the one-seat cell-link rule");
}

// Branch direction must be read from backend Branch, not title/description prose.
{
  const fake = structuredClone(column.matchedStep);
  fake.title = "Row-Based Multi-Fish";
  fake.description = `Row-Based ${fake.description}`;
  const p = buildAuditedStepExplanationPayload(fake, "zh");
  assert.match(p.structure, /复数鱼（列基型）/, "Branch:Column-Based must survive misleading visible text");
  assert.doesNotMatch(p.structure, /复数鱼（行基型）/, "visible title must not override backend Branch");
}

{
  const p = payload(truthCells);
  assert.match(p.structure, /源数字4\/7\/8\/9.*平衡结构时还可能补入额外宫Truth或整格Truth.*6b1.*2\/5b2.*整格Truth=r3c7、r3c9/s,
    "TruthCells sample must explain why final Truth digits may exceed SourceDigits");
  assert.match(p.structure, /另有单格Link=/, "TruthCells sample must render its real cell links too");
  assert.doesNotMatch(p.deduction, /结构内自噬目标/, "TruthCells sample without CannibalTargets must not invent cannibal prose");
  const native = truthCells.matchedStep.explanation.zh;
  assert.match(native.structure, /搜索从源数字4\/7\/8\/9出发.*平衡结构时还可能补入额外宫Truth或整格Truth/s,
    "native TruthCells explanation must not misstate SourceDigits as the complete proof digit set");
}

console.log("test-real-sample-readability-round15-multifish: ok (4 real Multi-Fish samples incl. TruthCells/CellLinks/cannibal)");
