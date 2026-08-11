import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAuditedStepExplanationPayload, buildAuditedTechniqueGuide } from "../step-explanation.js";

const fixture = new URL("../../tools/real_training_samples/ROUND23_AFW_TRIPLET_TYPE1_TYPE2_REAL_SAMPLES.jsonl", import.meta.url);
const lines = fs.readFileSync(fixture, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const manifest = lines.shift();
assert.equal(manifest.recordCount, 2);
const byTarget = new Map(lines.map((r) => [r.targetId, r]));
const type1 = byTarget.get("TripletOddagon::Almost Fireworks + Type 1");
const type2 = byTarget.get("TripletOddagon::Almost Fireworks + Type 2");
assert.ok(type1 && type2);

const cellName = (c) => `r${c.row + 1}c${c.col + 1}`;
const group = (step, prefix) => (step.groups || []).find((g) => String(g.label || "").startsWith(prefix));
const roleColors = (step, color, digit) => (step.colorCands || [])
  .filter((x) => x.color === color && (x.candidates || []).includes(digit))
  .map(cellName).sort();

{
  const s = type1.matchedStep;
  assert.ok((s.groups || []).some((g) => g.label === "Branch:Almost Fireworks + Type 1 RT"));
  const pre = group(s, "PreAFWEscapes");
  const slots = group(s, "AFWTripletSlots:249");
  const escape = group(s, "EscapeCell:6");
  assert.ok(pre && slots && escape);
  assert.deepEqual(pre.cells.map(cellName).sort(), ["r4c1", "r4c6", "r6c3"]);
  assert.deepEqual(slots.cells.map(cellName).sort(), ["r4c1", "r4c6"]);
  assert.deepEqual(escape.cells.map(cellName), ["r6c3"]);
  assert.ok(roleColors(s, 2, 6).includes("r6c3"), "Type1 outside-triplet escape candidate 6r6c3 must be highlighted");
  const p = buildAuditedStepExplanationPayload(s, "zh");
  assert.match(p.structure, /Escape|r6c3/);
  assert.match(p.deduction, /潜在escape\/guardian.*r4c1.*r4c6.*r6c3|占住Triplet的两个位置/);
  assert.match(p.deduction, /r4c1.*r4c6.*r6c3|组外候选/);
  assert.doesNotMatch(p.deduction, /排除.{0,6}两个特殊格/);
  assert.doesNotMatch([p.structure, p.principle, p.deduction].join("\n"), /[∨⇒¬⋃∈∧]/);
}

{
  const s = type2.matchedStep;
  assert.ok((s.groups || []).some((g) => g.label === "Branch:Almost Fireworks + Type 2"));
  const pre = group(s, "PreAFWEscapes");
  const slots = group(s, "AFWTripletSlots:249");
  const guardians = group(s, "Guardians:6");
  const remotePair = group(s, "AFWRemoteTripletPair:249");
  const witness = group(s, "AFWWitness:49");
  const baseHouse = group(s, "AFWBaseHouse:r4");
  const crossHouse = group(s, "AFWCrossHouse:c8");
  const crossBox = group(s, "AFWCrossBox:b6");
  assert.ok(pre && slots && guardians && remotePair && witness && baseHouse && crossHouse && crossBox,
    "AFW Type2 must emit the complete contradiction-proof geometry from the backend");
  assert.deepEqual(pre.cells.map(cellName).sort(), ["r4c1", "r4c6", "r6c3", "r6c4"]);
  assert.deepEqual(slots.cells.map(cellName).sort(), ["r4c1", "r4c6"]);
  assert.deepEqual(guardians.cells.map(cellName).sort(), ["r6c3", "r6c4"]);
  assert.deepEqual(remotePair.cells.map(cellName).sort(), ["r2c1", "r2c6"]);
  assert.deepEqual(witness.cells.map(cellName), ["r2c8"]);
  assert.deepEqual(roleColors(s, 2, 6), ["r6c3", "r6c4"], "both guardian candidates must use the guardian role colour");
  const target = group(s, "Targets");
  assert.ok(target && target.cells.map(cellName).includes("r6c2"));
  assert.ok(roleColors(s, 11, 6).includes("r6c2"), "6r6c2 elimination must remain the deletion colour");
  const p = buildAuditedStepExplanationPayload(s, "zh");
  const g = buildAuditedTechniqueGuide(s, "zh");
  assert.ok(p); assert.equal(g?.length, 6);
  assert.match(p.structure, /Guardians=.*r6c3.*r6c4|r6c3.*r6c4/);
  assert.match(p.deduction, /Guardians不可能全假|反设.*r6c3.*r6c4.*全假/);
  assert.match(p.deduction, /都取Triplet数字.*纯Triplet Oddagon/);
  assert.match(p.deduction, /① 两格都逃逸.*r4.*c8.*b6/);
  assert.match(p.deduction, /② 恰一格逃逸.*远程三数组对.*r2c1.*r2c6.*RT/);
  assert.match(p.deduction, /r2c8.*=4.*c8.*\{2\/9\}.*至少一个/);
  assert.match(p.deduction, /至少一个Guardian为真/);
  assert.match(g[2], /两格都逃逸.*恰一格逃逸|Guardians不可能全假/);
  assert.doesNotMatch([p.deduction, ...g].join("\n"), /排除.{0,6}两个特殊格/);
  assert.doesNotMatch(p.deduction, /若这些Guardians全部为假，主体会退回无解的Triplet Oddagon/);
  assert.doesNotMatch([p.structure, p.principle, p.deduction, ...g.slice(0, 3)].join("\n"), /[∨⇒¬⋃∈∧]/);

  const fake = structuredClone(s);
  fake.title = "Almost Fireworks + Type 1";
  fake.description = "fake Type 1 title/description";
  const fakeP = buildAuditedStepExplanationPayload(fake, "zh");
  assert.match(fakeP.deduction, /守护数字\{6\}|至少一个Guardian/,
    "visible title/description must not override backend Branch:Almost Fireworks + Type 2");
}

console.log("test-real-sample-readability-round23-afw-triplet: ok (AFW occupancy + paired Type1/Type2 roles + guardian highlighting)");
