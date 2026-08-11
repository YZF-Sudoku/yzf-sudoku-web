import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAuditedStepExplanationPayload, buildAuditedTechniqueGuide } from "../step-explanation.js";

const fixture = new URL("../../tools/real_training_samples/ROUND19_SEED_REAL_TRAINING_SAMPLES.jsonl", import.meta.url);
const lines = fs.readFileSync(fixture, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const manifest = lines.shift();
assert.equal(manifest.recordType, "manifest");
assert.equal(manifest.recordCount, 15);
const records = lines;
assert.equal(records.length, 15, "Round19 must retain all 15 currently closed Priority-5 real subtargets");
const get = (id) => { const r = records.find((x) => x.targetId === id); assert.ok(r, `missing ${id}`); return r; };
const labels = (r) => new Set((r.matchedStep.groups || []).map((g) => g.label));
const payload = (r) => { const p = buildAuditedStepExplanationPayload(r.matchedStep, "zh"); assert.ok(p, `missing payload ${r.targetId}`); return p; };
const guide = (r) => { const g = buildAuditedTechniqueGuide(r.matchedStep, "zh"); assert.equal(g?.length, 6, `missing six-field guide ${r.targetId}`); return g; };

for (const r of records) {
  assert.ok(r.trainingLibrary?.startsWith(":"), `${r.targetId} must retain replayable real Library`);
  const p = payload(r), g = guide(r);
  const first = [p.structure, p.principle, p.deduction, ...g.slice(0, 3)].join("\n");
  assert.doesNotMatch(first, /[∨⇒¬⋃∈∧]/, `${r.targetId} JS first screen must use causal prose, not event formulae`);
  const native = r.matchedStep.explanation?.zh;
  assert.ok(native, `${r.targetId} must retain current native explanation snapshot`);
  assert.doesNotMatch([native.structure, native.principle, native.deduction].join("\n"), /[∨⇒¬⋃∈∧]/,
    `${r.targetId} native first screen must use causal prose, not event formulae`);
}

// Oddagon / Broken Wing: exact backend roles, never title inference.
assert.ok(labels(get("BivalueOddagon::Type 1 / Remote Pair")).has("Branch:Type 1 / Remote Pair"));
assert.ok(labels(get("BivalueOddagon::Type 2")).has("Branch:Type 2"));
assert.ok(labels(get("BivalueOddagon::Type 3 / Locked Set")).has("Branch:Type 3 / Locked Set"));
assert.match(payload(get("BivalueOddagon::Type 3 / Locked Set")).deduction, /Locked Set|锁定|容量/);
assert.ok(labels(get("BrokenWing::Odd-Loop Guardians")).has("Branch:Odd-Loop Guardians"));
assert.match(guide(get("BrokenWing::Odd-Loop Guardians"))[2], /目标.*守护.*全部排除.*奇环|奇环.*矛盾/);

// Blossom Loop: three real backend branches; chainBranches, not fake group/text parsing, supply loop/branch counts.
for (const [id, branch] of [
  ["BlossomLoop::Cell Type", "Branch:Cell Type"],
  ["BlossomLoop::Region Type", "Branch:Region Type"],
  ["BlossomLoop::AALS Type", "Branch:AALS Type"],
]) {
  const r = get(id); assert.ok(labels(r).has(branch), `${id} missing exact backend Branch`);
  assert.ok((r.matchedStep.chainBranches || []).some((b) => /Burring Loop/i.test(b.label || "")), `${id} missing actual main chain branch`);
  assert.ok((r.matchedStep.chainBranches || []).some((b) => /^Burr Branch/i.test(b.label || "")), `${id} missing actual Burr Branch`);
}
{
  const r = get("BlossomLoop::Cell Type");
  const fake = structuredClone(r.matchedStep); fake.title = "AALS Type Blossom Loop"; fake.description = "AALS Type " + fake.description;
  const g = buildAuditedTechniqueGuide(fake, "zh");
  assert.match(g[0], /单元格型/);
  assert.doesNotMatch(g[0], /AALS型/);
  assert.match(g[0], /1条Burr Branch/);
}

// Fireworks: five real branches are separate, and a misleading title cannot switch branch semantics.
for (const branch of ["Dual ER", "Dual S-Wing", "Triple", "Quadruple", "Dual W-Wing"]) {
  assert.ok(labels(get(`Fireworks::${branch}`)).has(`Branch:${branch}`));
}
{
  const r = get("Fireworks::Dual ER"); const fake = structuredClone(r.matchedStep);
  fake.title = "Fireworks Exocet"; fake.description = "Fireworks Exocet " + fake.description;
  assert.match(buildAuditedTechniqueGuide(fake, "zh")[0], /双烟花空矩形/);
}

// Triplet Oddagon: Type 1 plus two real RT branches are explicit subtargets.
assert.ok(labels(get("TripletOddagon::Type 1")).has("Branch:Type 1"));
assert.ok(labels(get("TripletOddagon::RT + Triplet Lock Set")).has("Branch:RT + Triplet Lock Set"));
assert.ok(labels(get("TripletOddagon::RT + Triplet ERI")).has("Branch:RT + Triplet ERI"));
assert.match(payload(get("TripletOddagon::RT + Triplet Lock Set")).deduction, /Lock Set|容量/);
assert.match(payload(get("TripletOddagon::RT + Triplet ERI")).deduction, /ERI/);

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
assert.match(app, /\["TripletOddagon", "RT \+ Triplet Lock Set", "Branch:RT \+ Triplet Lock Set"\]/);
assert.match(app, /\["TripletOddagon", "RT \+ Triplet ERI", "Branch:RT \+ Triplet ERI"\]/);
assert.match(app, /\["BlossomLoop", "Cell Type", "Branch:Cell Type"\]/);
assert.match(app, /\["BlossomLoop", "Region Type", "Branch:Region Type"\]/);
assert.match(app, /\["BlossomLoop", "AALS Type", "Branch:AALS Type"\]/);

console.log("test-real-sample-readability-round19-oddagon-fireworks-blossom: ok (15 real Priority-5 subtargets; 5 rare branches still pending)");
