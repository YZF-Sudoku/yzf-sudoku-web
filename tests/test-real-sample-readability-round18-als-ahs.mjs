import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAuditedStepExplanationPayload, buildAuditedTechniqueGuide } from "../step-explanation.js";

const fixture = new URL("../../tools/real_training_samples/ROUND18_SEED_REAL_TRAINING_SAMPLES.jsonl", import.meta.url);
const lines = fs.readFileSync(fixture, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const manifest = lines.shift();
assert.equal(manifest.recordType, "manifest");
assert.equal(manifest.recordCount, 27);
const records = lines;
assert.equal(records.length, 27, "Round18 must retain all 27 Priority-4 explicit subtargets");
const get = (id) => { const r = records.find((x) => x.targetId === id); assert.ok(r, `missing ${id}`); return r; };
const labels = (r) => new Set((r.matchedStep.groups || []).map((g) => g.label));
const payload = (r) => { const p = buildAuditedStepExplanationPayload(r.matchedStep, "zh"); assert.ok(p, `missing payload ${r.targetId}`); return p; };

for (const r of records) {
  assert.ok(r.trainingLibrary?.startsWith(":"), `${r.targetId} must retain replayable real Library`);
  const p = payload(r);
  const guide = buildAuditedTechniqueGuide(r.matchedStep, "zh");
  assert.equal(guide?.length, 6, `${r.targetId} must retain six-field guide`);
  const first = [p.structure, p.principle, p.deduction, ...guide.slice(0, 3)].join("\n");
  assert.doesNotMatch(first, /[∨⇒¬⋃∈∧]/, `${r.targetId} JS first screen must use causal prose, not event formulae`);
  const native = r.matchedStep.explanation?.zh;
  assert.ok(native, `${r.targetId} must retain current native explanation snapshot`);
  assert.doesNotMatch([native.structure, native.principle, native.deduction].join("\n"), /[∨⇒¬⋃∈∧]/,
    `${r.targetId} native first screen must use causal prose, not event formulae`);
}

// Almost Pair directions and Almost Triple intersection subtype must come from backend facts.
assert.ok(labels(get("AlmostPair::Box-ALS / Line-AHS")).has("Branch:Box-ALS / Line-AHS"));
assert.ok(labels(get("AlmostPair::Line-ALS / Box-AHS")).has("Branch:Line-ALS / Box-AHS"));
assert.ok(labels(get("AlmostTriple::Single-Intersection")).has("Subtype:Single-Intersection"));
assert.ok(labels(get("AlmostTriple::Double-Intersection")).has("Subtype:Double-Intersection"));
assert.match(payload(get("AlmostTriple::Double-Intersection")).principle, /交区.*恰占2个|交区恰占2个/);

// Standard/grouped/rank-0 ALS-W-Wing are three distinct real branches.
{
  const std = get("ALSWWing::Standard"), grp = get("ALSWWing::Grouped"), r0 = get("ALSWWing::Grouped Rank-0");
  assert.ok(labels(std).has("Branch:Standard"));
  assert.ok(labels(grp).has("Branch:Grouped"));
  assert.ok(!labels(grp).has("Branch:Grouped Rank-0"));
  assert.ok(labels(r0).has("Branch:Grouped Rank-0"));
  assert.match(payload(grp).deduction, /二选一|至少一侧|共同可见/);
  assert.match(payload(r0).deduction, /链接名额|结构自由度|容量/);
  const fake = structuredClone(r0.matchedStep); fake.title = "ALS-W-Wing"; fake.description = "Standard " + fake.description;
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").structure, /秩 0|秩0/,
    "Rank-0 ALS-W-Wing must remain backend-Branch driven under misleading title");
}

// AHS-XZ distinguishes single, double-rank0, rank2, and actual Extended-RCC evidence.
assert.ok([...labels(get("AHSXZ::Single-RCC XZ"))].some((x) => x.startsWith("Branch:Single-RCC XZ")));
assert.ok(labels(get("AHSXZ::Double-RCC Rank-0")).has("Branch:Double-RCC Rank-0"));
assert.ok([...labels(get("AHSXZ::Rank-2 RCC"))].some((x) => x.startsWith("Branch:Rank-2 RCC")));
assert.ok(labels(get("AHSXZ::Extended-RCC")).has("RccClass:Extended-RCC"));
assert.match(payload(get("AHSXZ::Single-RCC XZ")).principle, /两端Extra事件至少有一个必须成立|至少有一个.*Extra/);

// Multi-candidate AHS-W-Wing must not collapse to a bivalue-only explanation.
{
  const multi = get("AHSWWing::Multi-Candidate");
  assert.ok([...labels(multi)].some((x) => x.includes("Cell Strong Inference Multi-Candidate")));
  assert.match(payload(multi).structure, /枢纽.*5\/7\/9|枢纽.*5.*7.*9/);
  assert.match(payload(multi).deduction, /全部候选.*完整分|枢纽.*必定取|至少一端Extra/s);
  const fake = structuredClone(multi.matchedStep); fake.title = "AHS-W-Wing Bivalue"; fake.description = "Bivalue " + fake.description;
  assert.match(buildAuditedStepExplanationPayload(fake, "zh").structure, /5\/7\/9|5.*7.*9/);
}

// Standard and triple-linked AHS-XY-Wing must retain backend RCC facts, not title inference.
assert.ok([...labels(get("AHSXYWing::Standard"))].some((x) => x.startsWith("Branch:Standard")));
assert.ok(labels(get("AHSXYWing::Extended-RCC")).has("RccClass:Extended-RCC"));
assert.ok([...labels(get("AHSXYWing::Triple-Linked Rank-0"))].some((x) => x.startsWith("Branch:Triple-Linked Rank-0")));

// Death Blossom branches must remain separate; only Type 3 claims the MSLS validation route.
for (const [id, branch] of [
  ["DeathBlossom::Classic Stem/Petals", "Branch:Classic Stem/Petals"],
  ["DeathBlossom::Complex Type 1", "Branch:Complex Type 1"],
  ["DeathBlossom::Complex Type 2", "Branch:Complex Type 2"],
  ["DeathBlossom::Complex Type 3 (MSLS)", "Branch:Complex Type 3 (MSLS)"],
]) assert.ok(labels(get(id)).has(branch), `${id} missing exact backend branch`);
assert.doesNotMatch(payload(get("DeathBlossom::Complex Type 1")).principle, /完整MSLS Rank-0校验/);
assert.doesNotMatch(payload(get("DeathBlossom::Complex Type 2")).principle, /完整MSLS Rank-0校验/);
assert.match(payload(get("DeathBlossom::Complex Type 3 (MSLS)")).principle, /完整MSLS Rank-0校验/);

// Collector registry must use backend facts and preserve an exclusion for Grouped-vs-Rank0.
const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
assert.match(app, /\["AlmostPair", "Box-ALS \/ Line-AHS", "Branch:Box-ALS \/ Line-AHS"\]/);
assert.match(app, /\["ALSWWing", "Grouped", "Branch:Grouped", "Rank-0"\]/);
assert.match(app, /excludeText: target\.excludeText \|\| ""/);

// Sue de Coq standard/cannibal branches must use explicit backend roles; cannibalized includes structure-internal targets.
assert.ok(labels(get("SueDeCoq::Standard")).has("Branch:Standard"));
assert.ok(labels(get("SueDeCoq::Cannibalized")).has("Branch:Cannibalized"));
assert.match(payload(get("SueDeCoq::Cannibalized")).deduction, /自噬|结构内部/);

console.log("test-real-sample-readability-round18-als-ahs: ok (27 real Priority-4 subtargets)");
