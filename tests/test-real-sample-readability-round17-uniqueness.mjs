import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAuditedStepExplanationPayload, buildAuditedTechniqueGuide } from "../step-explanation.js";

const fixture = new URL("../../tools/real_training_samples/ROUND17_SEED_REAL_TRAINING_SAMPLES.jsonl", import.meta.url);
const lines = fs.readFileSync(fixture, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const manifest = lines.shift();
assert.equal(manifest.recordType, "manifest");
assert.equal(manifest.recordCount, 38);
assert.equal(manifest.builtinCount, 35);
assert.equal(manifest.userFindAllCount, 2);
assert.equal(manifest.trainingGeneratedCount, 1);
const records = lines;
assert.equal(records.length, 38, "Round17 must retain the complete closed real uniqueness sample set");

const pending = JSON.parse(fs.readFileSync(new URL("../../tools/real_training_samples/ROUND17_PENDING_REAL_SAMPLE_TARGETS.json", import.meta.url), "utf8"));
assert.equal(pending.status, "CLOSED");
assert.deepEqual(pending.pending, []);

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
  assert.ok(r.trainingLibrary?.startsWith(":"), `${r.targetId} must retain replayable Library state`);
  assert.ok(r.matchedStep?.groups?.some((g) => g.label.startsWith("Branch:")), `${r.targetId} must be backend-Branch driven`);
  const p = payload(r);
  const guide = buildAuditedTechniqueGuide(r.matchedStep, "zh");
  assert.equal(guide?.length, 6, `${r.targetId} must retain six-field guide`);
  const firstScreen = [p.structure, p.principle, p.deduction, ...guide.slice(0, 3)].join("\n");
  assert.doesNotMatch(firstScreen, /[∨⇒¬⋃]/, `${r.targetId} first screen must use human prose`);
  const native = r.matchedStep.explanation?.zh;
  assert.ok(native, `${r.targetId} must retain current native C++ explanation snapshot`);
  assert.doesNotMatch([native.structure, native.principle, native.deduction].join("\n"), /[∨⇒¬⋃]/,
    `${r.targetId} native first screen must use human prose`);
}

// UR subtype must come from backend Branch, not a human title.
{
  const r = get("UniqueRectangle::Type 1");
  assert.deepEqual([...labels(r)].filter((x) => x.startsWith("Branch:")), ["Branch:Unique Rectangle Type 1"]);
  const fake = structuredClone(r.matchedStep);
  fake.title = "Uniqueness Test 7";
  fake.description = `Uniqueness Test 7: ${fake.description}`;
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").structure, /当前后端分支=1 型/);
}

// Type 6 is a genuinely merged real step, not a manufactured standalone fixture.
{
  const r = get("UniqueRectangle::Type 6");
  const b = [...labels(r)].filter((x) => x.startsWith("Branch:"));
  assert.ok(b.includes("Branch:Unique Rectangle Type 6"));
  assert.ok(b.includes("Branch:Hidden Rectangle"));
  assert.ok(b.includes("Branch:Unique Rectangle Type 7"));
  assert.match(payload(r).structure, /已合并分支：.*6 型.*隐性矩形.*7 型/);
  assert.match(payload(r).deduction, /同一主体同时满足多个唯一性分支/);
}

// External Test 3 and 3H must remain naked-vs-hidden subset branches.
for (const prefix of ["UniqueRectangle", "UniqueLoop"]) {
  const naked = get(`${prefix}::External Test 3`);
  const hidden = get(`${prefix}::External Test 3H`);
  assert.ok(labels(naked).has("Branch:External Test 3"));
  assert.ok(naked.matchedStep.groups.some((g) => g.label.startsWith("NakedSubset:")), `${prefix} External Test 3 must carry NakedSubset`);
  assert.ok(labels(hidden).has("Branch:External Test 3H"));
  assert.ok(hidden.matchedStep.groups.some((g) => g.label.startsWith("HiddenSubset:")), `${prefix} External Test 3H must carry HiddenSubset`);
  assert.match(payload(naked).deduction, /裸数组.*满容量集合/);
  assert.match(payload(hidden).deduction, /隐性数组.*限定落点/);
  const fake = structuredClone(naked.matchedStep);
  fake.title = `${fake.title} 3H HiddenSubset`;
  fake.description = `External Test 3H ${fake.description}`;
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").deduction, /裸数组/, `${prefix} Branch 3 must beat misleading 3H title`);
}

// WXYZ Wing and Ring are separate backend branches; only Ring may claim closure.
{
  const wing = get("UniqueRectangle::AUR + WXYZ-Wing");
  const ring = get("UniqueRectangle::AUR + WXYZ-Ring");
  assert.ok(labels(wing).has("Branch:AUR + WXYZ-Wing"));
  assert.ok(labels(ring).has("Branch:AUR + WXYZ-Ring"));
  assert.doesNotMatch(payload(wing).deduction, /闭合成环|附加删数/);
  assert.match(payload(ring).deduction, /闭合成环.*附加删数/);
  const fakeW = structuredClone(wing.matchedStep);
  fakeW.title = "AUR + WXYZ-Ring";
  fakeW.description = `AUR + WXYZ-Ring ${fakeW.description}`;
  assert.doesNotMatch(buildAuditedStepExplanationPayload(fakeW, "zh").deduction, /闭合成环/,
    "WXYZ-Wing must not become Ring from title text");
  const fakeR = structuredClone(ring.matchedStep);
  fakeR.title = "AUR + WXYZ-Wing";
  fakeR.description = fakeR.description.replace(/Ring/g, "Wing");
  assert.match(buildAuditedStepExplanationPayload(fakeR, "zh").deduction, /闭合成环/,
    "WXYZ-Ring must stay Ring from backend Branch");
}


// BUG Type 1 is a real user FindAll hit: all guardians are concentrated in one cell.
{
  const type1 = get("BUGPlusN::Type 1");
  assert.equal(type1.source, "user-FindAll");
  assert.ok(labels(type1).has("Branch:Type 1"));
  assert.deepEqual(type1.matchedStep.eliminations.map((e) => [e.row, e.col, e.candidates]), [[0, 2, [5, 9]]]);
  assert.match(payload(type1).structure, /守护位置为r1c3/);
  assert.match(payload(type1).deduction, /全部守护候选集中在同一格.*必须取守护候选之一.*伪双值对(?:可删|可以删除)/s);
  const fake = structuredClone(type1.matchedStep);
  fake.title = "BUG + 2 Generic";
  fake.description = `Generic ${fake.description}`;
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").deduction, /全部守护候选集中在同一格/,
    "BUG Type 1 must stay backend-Branch driven even under a misleading title");
}

// BUG generic and cross-guardian are explicit backend branches.
{
  const cross = get("BUGPlusN::Cross-Guardian");
  assert.ok(labels(cross).has("Branch:Cross-Guardian"));
  assert.match(payload(cross).deduction, /两个守护格位于同一单位.*不同的单一守护数字.*全部守护同时消失/s);
  const fake = structuredClone(cross.matchedStep);
  fake.title = "BUG + 3 Generic";
  fake.description = `Generic ${fake.description}`;
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").deduction, /两个守护格位于同一单位/,
    "Cross-Guardian must come from Branch only");
}
{
  const generic = get("BUGPlusN::Generic");
  assert.equal(generic.source, "user-FindAll");
  assert.ok(labels(generic).has("Branch:Generic"));
  assert.match(payload(generic).deduction, /同时排除全部守护候选并恢复完整BUG/);
  const fake = structuredClone(generic.matchedStep);
  fake.title = "BUG + 1 Type 1";
  fake.description = `Type 1 ${fake.description}`;
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").deduction, /同时排除全部守护候选/,
    "Generic BUG must not become Type 1 from title text");
}

{
  const xyz = get("UniqueRectangle::AUR + XYZ-Wing");
  assert.equal(xyz.source, "training-generator");
  assert.ok(labels(xyz).has("Branch:AUR + XYZ-Wing"));
  assert.match(payload(xyz).deduction, /屋顶额外候选至少一真.*共同数字2.*可删/s);
  const fake = structuredClone(xyz.matchedStep);
  fake.title = "AUR + XY-Wing";
  fake.description = fake.description.replace(/XYZ-Wing/g, "XY-Wing");
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").structure, /AUR \+ XYZ-Wing/,
    "AUR XYZ branch must beat misleading XY title");
}

console.log("test-real-sample-readability-round17-uniqueness: ok (38 real samples; uniqueness family fully closed)");
