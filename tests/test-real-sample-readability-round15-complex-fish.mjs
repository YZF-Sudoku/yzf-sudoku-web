import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAuditedStepExplanationPayload } from "../step-explanation.js";

const fixture = new URL("../../tools/real_training_samples/ROUND15_SEED_REAL_TRAINING_SAMPLES.jsonl", import.meta.url);
const lines = fs.readFileSync(fixture, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const manifest = lines.shift();
assert.equal(manifest.recordType, "manifest");
const kinds = ["ComplexSwordfish", "ComplexJellyfish", "ComplexSquirmbagFish"];
const branches = ["Franken", "Mutant", "Finned Franken", "Finned Mutant", "Sashimi Franken", "Sashimi Mutant"];
const records = lines.filter((item) => kinds.includes(item.kind));
assert.equal(records.length, 18, "Round15 Complex Fish must retain the complete 3×6 real Branch matrix");

const get = (kind, subtype) => {
  const record = records.find((item) => item.kind === kind && item.subtype === subtype);
  assert.ok(record, `missing real Complex Fish sample ${kind}/${subtype}`);
  return record;
};
const labels = (record) => new Set(record.matchedStep.groups.map((g) => g.label));
const payload = (record) => {
  const p = buildAuditedStepExplanationPayload(record.matchedStep, "zh");
  assert.ok(p, `missing audited payload ${record.kind}/${record.subtype}`);
  return p;
};

for (const kind of kinds) {
  for (const branch of branches) {
    const record = get(kind, branch);
    assert.ok(labels(record).has(`Branch:${branch}`), `${kind}/${branch} must carry native backend Branch`);
    const p = payload(record);
    assert.match(p.principle, /每个Base看成.*必须交出一个\d.*每个Cover看成.*最多接收一个\d.*一一占满全部Cover/s,
      `${kind}/${branch} first screen must explain equal-capacity occupancy in plain language`);
    assert.doesNotMatch(p.principle, /\|B\||\|C\||Rank\s*[=0-9]/i,
      `${kind}/${branch} first screen must not lead with formula/rank jargon`);
    assert.match(p.structure, branch.includes("Mutant") ? /Mutant允许同一侧同时混用行、列、宫/ : /Franken只在单一方向的线中混入宫/,
      `${kind}/${branch} must explain Franken/Mutant geometry from Branch`);
    assert.match((p.checks || []).join("\n"), new RegExp(`Branch=${branch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      `${kind}/${branch} verification must cite backend Branch`);

    const nativeZh = record.matchedStep.explanation?.zh;
    assert.ok(nativeZh, `${kind}/${branch} missing native C++ explanation snapshot`);
    assert.match(nativeZh.principle, /每个Base看成.*必须交出一个.*每个Cover看成.*最多接收一个.*一一占满全部Cover/s,
      `${kind}/${branch} native explanation must use the same human-readable capacity proof`);
    assert.match(nativeZh.structure, new RegExp(branch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `${kind}/${branch} native structure must surface the full backend Branch`);
    assert.match((nativeZh.checks || []).join("\n"), branch.includes("Mutant") ? /Branch为Mutant/ : /Branch为Franken/,
      `${kind}/${branch} native verification must cite the backend geometry class`);
  }
}

for (const branch of ["Finned Franken", "Finned Mutant", "Sashimi Franken", "Sashimi Mutant"]) {
  for (const kind of kinds) {
    const p = payload(get(kind, branch));
    assert.match(p.deduction, /分两案看.*鳍.*全部为假.*满容量状态.*至少一个鳍为真.*同时看见全部鳍/s,
      `${kind}/${branch} must explain both fin-false and fin-true cases`);
  }
}
for (const branch of ["Sashimi Franken", "Sashimi Mutant"]) {
  for (const kind of kinds) {
    assert.match(payload(get(kind, branch)).deduction,
      /Sashimi只表示去掉鳍后至少一个Base只剩一个鱼身落点.*不改变这两案证明/s,
      `${kind}/${branch} must state exactly what Sashimi changes`);
  }
}

const endoRecords = records.filter((record) => [...labels(record)].some((x) => x.startsWith("EdoFins:")));
assert.ok(endoRecords.length >= 2, "Round15 must retain multiple real endo-fin samples");
for (const record of endoRecords) {
  const p = payload(record);
  assert.match(p.structure, /内生鳍/, `${record.targetId} must surface endo fins on the first screen`);
  assert.match((p.checks || []).join("\n"), /内生鳍来自多个Base的重叠/, `${record.targetId} must verify endo-fin provenance`);
}

const cannibalRecords = records.filter((record) => [...labels(record)].some((x) => x.startsWith("CannibalTargets:")));
assert.ok(cannibalRecords.length >= 6, "Round15 must retain several real cannibal-target samples");
for (const record of cannibalRecords) {
  const p = payload(record);
  assert.match(p.structure, /自噬目标/, `${record.targetId} must distinguish cannibal targets structurally`);
  assert.match(p.deduction, /同时落在多个Cover.*一次占掉多个.*名额/s,
    `${record.targetId} must explain why a cannibal target consumes multiple cover slots`);
}

// Branch classification must survive deliberately misleading visible text.
{
  const mutant = structuredClone(get("ComplexSwordfish", "Mutant").matchedStep);
  mutant.title = "Complex Swordfish";
  mutant.description = mutant.description.replace(/^Mutant Swordfish/, "Franken Swordfish");
  const p = buildAuditedStepExplanationPayload(mutant, "zh");
  assert.match(p.structure, /Mutant允许同一侧同时混用行、列、宫/, "Branch:Mutant must win over a misleading Franken description");
  assert.doesNotMatch(p.structure, /Franken只在单一方向的线中混入宫/, "Mutant must not be inferred from title text");
}
{
  const sashimi = structuredClone(get("ComplexJellyfish", "Sashimi Mutant").matchedStep);
  sashimi.description = sashimi.description.replace(/^Sashimi Mutant Jellyfish/, "Finned Franken Jellyfish");
  const p = buildAuditedStepExplanationPayload(sashimi, "zh");
  assert.match(p.structure, /Mutant允许同一侧同时混用行、列、宫/, "Sashimi Mutant geometry must come from Branch");
  assert.match(p.deduction, /Sashimi只表示/, "Sashimi classification must come from Branch even when title text lies");
}

console.log("test-real-sample-readability-round15-complex-fish: ok (18 real Complex Fish Branch samples)");
