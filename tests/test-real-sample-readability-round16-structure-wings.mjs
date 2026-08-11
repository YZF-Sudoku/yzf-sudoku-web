import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAuditedStepExplanationPayload, buildAuditedTechniqueGuide } from "../step-explanation.js";

const fixture = new URL("../../tools/real_training_samples/ROUND16_SEED_REAL_TRAINING_SAMPLES.jsonl", import.meta.url);
const lines = fs.readFileSync(fixture, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const manifest = lines.shift();
assert.equal(manifest.recordType, "manifest");
assert.equal(manifest.recordCount, 14);
const records = lines;
assert.equal(records.length, 14, "Round16 must retain all 14 real structure/wing samples");

const get = (id) => {
  const r = records.find((x) => x.targetId === id);
  assert.ok(r, `missing real sample ${id}`);
  return r;
};
const labels = (r) => new Set(r.matchedStep.groups.map((g) => g.label));
const payload = (r) => {
  const p = buildAuditedStepExplanationPayload(r.matchedStep, "zh");
  assert.ok(p, `missing audited payload ${r.targetId}`);
  return p;
};

for (const r of records) {
  assert.equal(r.source, "builtin-superhard-bank", `${r.targetId} must come from built-in bank`);
  assert.equal(r.provenance, "builtin-superhard-solvepath-findall", `${r.targetId} must be backend FindAll evidence`);
  assert.ok(r.trainingLibrary?.startsWith(":"), `${r.targetId} must retain replayable Library state`);
  const p = payload(r);
  const guide = buildAuditedTechniqueGuide(r.matchedStep, "zh");
  assert.equal(guide?.length, 6, `${r.targetId} must retain six-field guide`);
  const firstScreen = [p.structure, p.principle, p.deduction, ...guide.slice(0, 3)].join("\n");
  assert.doesNotMatch(firstScreen, /[∨⇒¬⋃]/, `${r.targetId} first screen must use human prose`);
  assert.doesNotMatch(firstScreen, /\b(?:Row-Based|Column-Based|Restricted-Z)\b/, `${r.targetId} Chinese first screen must not leak raw branch enum`);
  const native = r.matchedStep.explanation?.zh;
  assert.ok(native, `${r.targetId} must retain current native C++ explanation snapshot`);
  const nativeFirst = [native.structure, native.principle, native.deduction].join("\n");
  assert.doesNotMatch(nativeFirst, /[∨⇒¬⋃]/, `${r.targetId} native first screen must use human prose`);
}

// Single-digit geometry.
{
  const row = get("Skyscraper::Row-Based"), col = get("Skyscraper::Column-Based");
  assert.ok(labels(row).has("Branch:Row-Based"));
  assert.ok(labels(col).has("Branch:Column-Based"));
  assert.match(payload(row).principle, /两个楼顶至少一个为真/);
  assert.match(payload(col).structure, /摩天楼（列型）/);
  const fake = structuredClone(col.matchedStep);
  fake.title = "Row-Based Skyscraper";
  fake.description = `Row-Based ${fake.description}`;
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").structure, /摩天楼（列型）/, "Skyscraper Branch must beat misleading text");
}
{
  const std = get("TwoStringKite::Standard"), grp = get("TwoStringKite::Grouped");
  assert.ok(labels(std).has("Branch:Standard"));
  assert.ok(labels(grp).has("Branch:Grouped"));
  assert.match(payload(std).principle, /连接宫内的行组和列组互不重叠.*两个外端因此至少一个为真/s);
  assert.match(payload(grp).checks.join("\n"), /分组型连接候选并集多于2/);
  const fake = structuredClone(grp.matchedStep);
  fake.title = "2-String Kite";
  fake.description = fake.description.replace(/^Grouped /, "");
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").structure, /^分组型 2-String Kite/, "Grouped Kite must come from Branch only");
}
{
  const er = payload(get("EmptyRectangle"));
  assert.match(er.principle, /直接看见目标.*另一臂.*迫使远端为真.*远端同样看见目标/s);
  assert.match(er.deduction, /两种宫内落点都会击中同一个目标/);
}
{
  const eri = payload(get("ERIPair"));
  assert.match(eri.principle, /两个Pair端点不能取同一个数字.*必须互补地分别取这两个数字/s);
  assert.match(eri.deduction, /目标若为真.*活动宫必须留下的同数字落点/s);
  assert.match(eri.checks.join("\n"), /不能仅凭矩形外形外推/);
}

// Wing family.
{
  const std = get("WWing::Standard"), grp = get("WWing::Grouped");
  assert.ok(labels(std).has("Branch:Standard"));
  assert.ok(labels(grp).has("Branch:Grouped"));
  assert.match(payload(std).principle, /至少有一个取6|至少有一个取\d/);
  assert.match(payload(grp).checks.join("\n"), /分组型允许连接区域多于两个候选/);
  const fake = structuredClone(std.matchedStep);
  fake.title = "Grouped W-Wing";
  fake.description = `Grouped ${fake.description}`;
  assert.doesNotMatch(buildAuditedStepExplanationPayload(fake, "zh").structure, /^分组型/, "Standard W-Wing must not be promoted by title");
}
{
  const xy = payload(get("XYWing")), xyz = payload(get("XYZWing"));
  assert.match(xy.principle, /两个翼格中的Z至少一个为真/);
  assert.match(xy.deduction, /同时看见两个翼上的Z.*因此可删/s);
  assert.match(xyz.principle, /枢轴或两翼中的Z至少一个为真/);
  assert.match(xyz.deduction, /同时看见枢轴和两翼中的全部Z位置.*因此可删/s);
}
{
  const complete = get("XYZRing::Complete"), half = get("XYZRing::Half");
  assert.ok(labels(complete).has("Branch:Complete"));
  assert.ok(labels(half).has("Branch:Half"));
  assert.match(payload(complete).structure, /^完全型 XYZ-Ring/);
  assert.match(payload(complete).deduction, /两个覆盖区域又完整承接环上的Z/);
  assert.match(payload(half).structure, /^半环型 XYZ-Ring/);
  assert.match(payload(half).deduction, /两侧桥接范围并看见枢轴/);
  const fakeC = structuredClone(complete.matchedStep);
  fakeC.title = "Half XYZ-Ring";
  fakeC.description = fakeC.description.replace(/^Complete/, "Half");
  assert.match(buildAuditedStepExplanationPayload(fakeC, "zh").structure, /^完全型 XYZ-Ring/, "Complete Branch must beat misleading Half title");
  const fakeH = structuredClone(half.matchedStep);
  fakeH.title = "Complete XYZ-Ring";
  fakeH.description = fakeH.description.replace(/^Half/, "Complete");
  assert.match(buildAuditedStepExplanationPayload(fakeH, "zh").structure, /^半环型 XYZ-Ring/, "Half Branch must beat misleading Complete title");
}
{
  const std = get("WXYZWing::Standard"), rz = get("WXYZWing::Restricted-Z");
  assert.ok(labels(std).has("Branch:Standard"));
  assert.ok(labels(rz).has("Branch:Restricted-Z"));
  assert.match(payload(std).principle, /远端翼和枢轴会被迫取同一个非Z数字.*至少一个Z必须为真/s);
  assert.match(payload(rz).structure, /WXYZ-Wing（受限Z型）/);
  assert.match(payload(rz).deduction, /共同可见非Z目标也不能保留/);
  const fake = structuredClone(rz.matchedStep);
  fake.title = "Standard WXYZ-Wing";
  fake.description = `Standard ${fake.description}`;
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").structure, /WXYZ-Wing（受限Z型）/, "Restricted-Z must come from Branch only");
}

console.log("test-real-sample-readability-round16-structure-wings: ok (14 real built-in samples)");
