import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAuditedStepExplanationPayload, buildAuditedTechniqueGuide } from "../step-explanation.js";

const fixture = new URL("../../tools/real_training_samples/ROUND20_SEED_REAL_TRAINING_SAMPLES.jsonl", import.meta.url);
const lines = fs.readFileSync(fixture, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const manifest = lines.shift();
assert.equal(manifest.recordType, "manifest");
assert.equal(manifest.recordCount, 30);
const records = lines;
assert.equal(records.length, 30, "Round20 must retain all thirty current real closures");
const get = (id) => { const r = records.find((x) => x.targetId === id); assert.ok(r, `missing ${id}`); return r; };
const labels = (r) => new Set((r.matchedStep.groups || []).map((g) => g.label));
const group = (r, prefix) => (r.matchedStep.groups || []).find((g) => (g.label || "").startsWith(prefix));
const payload = (r) => { const p = buildAuditedStepExplanationPayload(r.matchedStep, "zh"); assert.ok(p, `missing payload ${r.targetId}`); return p; };
const guide = (r) => { const g = buildAuditedTechniqueGuide(r.matchedStep, "zh"); assert.equal(g?.length, 6, `missing six-field guide ${r.targetId}`); return g; };

for (const r of records) {
  assert.ok(r.trainingLibrary?.startsWith(":"), `${r.targetId} must retain replayable real Library`);
  assert.ok(r.matchedStep?.explanation?.zh, `${r.targetId} must retain current native explanation snapshot`);
  const p = payload(r), g = guide(r);
  const jsFirst = [p.structure, p.principle, p.deduction, ...g.slice(0, 3)].join("\n");
  const native = r.matchedStep.explanation.zh;
  const nativeFirst = [native.structure, native.principle, native.deduction].join("\n");
  assert.doesNotMatch(jsFirst, /[∨⇒¬⋃∈∧]/, `${r.targetId} JS first screen must use causal prose`);
  assert.doesNotMatch(nativeFirst, /[∨⇒¬⋃∈∧]/, `${r.targetId} native first screen must use causal prose`);
}

// Two user-provided Fireworks samples close exact backend branches, including Exocet cannibal targets.
{
  const r = get("Fireworks::Dual ALP");
  assert.ok(labels(r).has("Branch:Dual ALP"));
  assert.ok(labels(r).has("ALPPivot:28"));
  assert.match(payload(r).structure, /双烟花近锁定数对/);
  const fake = structuredClone(r.matchedStep);
  fake.title = "Fireworks Exocet"; fake.description = "Fireworks Exocet " + fake.description;
  assert.match(buildAuditedTechniqueGuide(fake, "zh")[0], /双烟花近锁定数对/,
    "Dual ALP guide must stay backend-Branch driven under misleading title");
}
{
  const r = get("Fireworks::Exocet");
  assert.ok(labels(r).has("Branch:Exocet"));
  assert.ok(labels(r).has("Pit"));
  assert.ok(labels(r).has("CannibalTargets"));
  assert.match(payload(r).structure, /烟花Exocet/);
  assert.match(r.matchedStep.explanation.zh.structure, /BaseCells|Pit|自噬删数/);
  const fake = structuredClone(r.matchedStep);
  fake.title = "Dual Fireworks ALP"; fake.description = "Dual Fireworks ALP " + fake.description;
  assert.match(buildAuditedTechniqueGuide(fake, "zh")[0], /烟花Exocet/,
    "Exocet guide must stay backend-Branch driven under misleading title");
}

// User-provided Almost Fireworks + Type 1 RT is an exact real backend branch.
{
  const r = get("TripletOddagon::Almost Fireworks + Type 1");
  assert.ok(labels(r).has("Branch:Almost Fireworks + Type 1 RT"));
  assert.equal(group(r, "TripletBody:")?.cells?.length, 12);
  assert.match(payload(r).structure, /Almost Fireworks \+ 1 型 RT/);
}

// Corpus-guided Type 2 construction: 9 guardian candidates -> six safe removals -> three same-digit guardians.
// The final Library is accepted by the unmodified original detector; this test locks the real 3-guardian semantics.
{
  const r = get("TripletOddagon::Type 2");
  assert.equal(r.source, "uploaded-corpus-guided-guardian-pruning");
  assert.equal(r.sourceCorpus, "pub169_TE2_sorted.txt");
  assert.equal(r.sourceIndex, 825);
  assert.equal(r.guardianBeforeCount, 9);
  assert.equal(r.guardianAfterCount, 3);
  assert.deepEqual(r.guardianCandidateRemovals, ["424", "824", "535", "545", "745", "756"]);
  assert.ok(labels(r).has("Branch:Type 2"));
  assert.ok(labels(r).has("Guardians:9"));
  const guardians = group(r, "Guardians:");
  assert.equal(guardians?.cells?.length, 3, "real Type 2 sample must retain all three backend guardian cells");
  assert.equal(group(r, "TripletBody:")?.cells?.length, 12);

  const p = payload(r), g = guide(r), native = r.matchedStep.explanation.zh;
  for (const text of [p.structure, p.deduction, ...g.slice(0, 3), native.structure, native.deduction]) {
    assert.doesNotMatch(text, /两个单额外候选|两个.*Guardian|Two single extras/i,
      "Type 2 explanation must not collapse a 3-guardian real sample to the old two-guardian special case");
  }
  assert.match(p.structure, /r2c4、r3c5、r6c4\{9\}/);
  assert.match(p.deduction, /Guardians全部为假.*无解.*至少一个Guardian必须为真.*同时看见全部Guardians/s);
  assert.match(native.deduction, /Guardians全部为假.*至少一个Guardian必须为真.*同时看见全部Guardians/s);

  const fake = structuredClone(r.matchedStep);
  fake.title = "Triplet Oddagon Type 1"; fake.description = "Triplet Oddagon Type 1 fake title";
  const fp = buildAuditedStepExplanationPayload(fake, "zh");
  assert.match(fp.structure, /Triplet Oddagon（2 型）/,
    "Triplet Type 2 explanation must stay backend-Branch driven under misleading title");
  assert.match(fp.deduction, /至少一个Guardian必须为真/);
}

// Four common AIC branches are real training hits and must remain backend-Branch driven.
for (const [id, branch] of [["AIC::Type 1","AIC Type 1"],["AIC::Type 2","AIC Type 2"],["AIC::Continuous Nice Loop","Continuous Nice Loop"],["AIC::Discontinuous Nice Loop","Discontinuous Nice Loop"]]) {
  const r=get(id); assert.ok(labels(r).has(`Branch:${branch}`));
  assert.equal(r.matchedStep.rankAvailable,false,`${id} must not expose chain length as rank`);
  assert.match(payload(r).principle,/强关系.*弱关系|弱关系.*强关系/);
}

// Minimal solution-safe pruning closes two rare chain forms with the unmodified current detector.
{
  const r = get("ALSChain::ALS Continuous Nice Loop");
  assert.deepEqual(r.candidateRemovals, ["113"]);
  assert.equal(r.solutionProtected, true);
  assert.ok(labels(r).has("Branch:ALS Continuous Nice Loop"));
  assert.ok(labels(r).has("ChainForm:ContinuousLoop"));
  assert.match(payload(r).principle, /ALS/);
}
{
  const r = get("AIC::L1-Wing");
  assert.deepEqual(r.candidateRemovals, ["925"]);
  assert.equal(r.solutionProtected, true);
  assert.ok(labels(r).has("Branch:L1-Wing"));
  assert.ok(labels(r).has("StrongPattern:LLL"));
  assert.ok(labels(r).has("ThreeStrongClass:L1"));
  assert.ok(labels(r).has("DigitCount:1"));
  assert.equal(r.matchedStep.rankAvailable, false);
}

// ComplexAIC closures must be backed by exact compound-edge facts, not title text.
{
  const r = get("ComplexAIC::AMSLS");
  assert.equal(r.sourceIndex, 114);
  assert.ok(labels(r).has("EdgeReason:amsls"));
  assert.match(payload(r).principle, /AMSLS秩结构边/);
}

// Low-cost global closures: Claiming and both X-Chain forms are exact backend branches.
assert.ok(labels(get("LockedCandidates::Claiming")).has("Branch:Claiming"));
for (const b of ["X-Chain", "X-Cycle"]) {
  const r = get(`XChain::${b}`);
  assert.ok(labels(r).has(`Branch:${b}`));
  assert.match(payload(r).principle, /强关系.*弱关系|弱关系.*强关系/);
  assert.equal(r.matchedStep.rankAvailable, false, `${b} chain length must not be exposed as rank`);
}

// Uploaded high-ER corpus closes ComplexAIC Tridagon only through an actual compound-edge fact.
{
  const r = get("ComplexAIC::Tridagon");
  assert.ok(labels(r).has("EdgeReason:tridagon"));
  assert.match(r.matchedStep.title, /Triplet Oddagon/);
  assert.match(payload(r).principle, /Tridagon约束边/);
}

// Historical Library/puzzle seeds count only after current-backend replay.
for (const [id, branch] of [["AIC::S-Ring","S-Ring"],["GroupedAIC::Grouped L1-Ring","Grouped L1-Ring"],["GroupedAIC::Grouped L2-Wing","Grouped L2-Wing"],["GroupedAIC::Grouped M2-Ring","Grouped M2-Ring"]]) {
  const r=get(id); assert.ok(labels(r).has(`Branch:${branch}`), `${id} missing exact current backend branch`);
}
for (const [id, branch] of [["DynamicChain::Contradiction","Dynamic Contradiction Chain"],["DynamicChain::Verity Placement","Dynamic Verity Placement"],["DynamicChain::Verity Elimination","Dynamic Verity Elimination"]]) {
  const r=get(id); assert.ok(labels(r).has(`Branch:${branch}`), `${id} missing exact dynamic branch`);
}
assert.ok(labels(get("DynamicChain::Grouped Dynamic")).has("Grouped:true"));
assert.match(get("DynamicChain::Grouped Dynamic").matchedStep.title,/Grouped Dynamic Chain/);

// Additional real chain-family closures.
for (const [id, branch] of [["AIC::L2-Wing","L2-Wing"],["ALSChain::ALS Discontinuous Nice Loop","ALS Discontinuous Nice Loop"],["GroupedAIC::Grouped Continuous Nice Loop","Grouped Continuous Nice Loop"],["GroupedAIC::Grouped Discontinuous Nice Loop","Grouped Discontinuous Nice Loop"]]) {
  const r=get(id); assert.ok(labels(r).has(`Branch:${branch}`), `${id} missing exact backend branch`);
  assert.equal(r.matchedStep.rankAvailable,false,`${id} must not expose chain length as rank`);
}

// Three MSLS variants are distinct real backend branches with real Rank:0 metadata.
for (const b of ["Advanced Rank-0","Advanced Rank-0 with Attachment","Irregular Rank-0"]) {
  const r=get(`MSLS::${b}`); assert.ok(labels(r).has(`Branch:${b}`)); assert.ok(labels(r).has("Rank:0")); assert.equal(r.matchedStep.rankAvailable,true); assert.equal(r.matchedStep.rank,0);
}
assert.ok(labels(get("MSLS::Advanced Rank-0 with Attachment")).has("Attachment"));
assert.ok(labels(get("MSLS::Irregular Rank-0")).has("CoverFamilyCount:2"));

console.log("test-real-sample-readability-round20-rare-fireworks-triplet: ok (30 real Round20 closures; real 3-guardian Type 2 locked)");
