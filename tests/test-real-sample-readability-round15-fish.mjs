import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAuditedStepExplanationPayload } from "../step-explanation.js";

const fixture = new URL("../../tools/real_training_samples/ROUND15_SEED_REAL_TRAINING_SAMPLES.jsonl", import.meta.url);
const lines = fs.readFileSync(fixture, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const manifest = lines.shift();
assert.equal(manifest.recordType, "manifest");
const basicKinds = new Set(["XWing", "Swordfish", "Jellyfish", "FinnedXWing", "FinnedSwordfish", "FinnedJellyfish"]);
const records = lines.filter((item) => basicKinds.has(item.kind));
assert.equal(records.length, 9, "Round15 basic Fish pass must retain all 3 sizes x Standard/Finned/Sashimi");
const get = (kind, subtype) => {
  const record = records.find((item) => item.kind === kind && item.subtype === subtype);
  assert.ok(record, `missing real Fish sample ${kind}/${subtype}`);
  return record;
};
const payload = (record) => {
  const result = buildAuditedStepExplanationPayload(record.matchedStep, "zh");
  assert.ok(result, `missing audited Fish payload ${record.kind}/${record.subtype}`);
  return result;
};
const labels = (record) => new Set(record.matchedStep.groups.map((g) => g.label));

for (const kind of ["XWing", "Swordfish", "Jellyfish"]) {
  const record = get(kind, "Standard");
  assert.ok(labels(record).has("Branch:Standard"), `${kind} must carry native Branch:Standard`);
  const p = payload(record);
  assert.match(p.principle, /每个基准区域最终都必须放一个\d.*同样数量的覆盖区域.*一一占满全部覆盖区域/s,
    `${kind} first screen must explain the one-for-one cover occupancy`);
  assert.match(p.deduction, /鱼身之外.*会抢掉.*基准区域无法全部安置/s,
    `${kind} deletion must explain stolen cover capacity`);
  assert.match((p.checks || []).join("\n"), /Branch=Standard.*Base\\Cover.*Cover\\Base/s,
    `${kind} strict set invariant belongs in the verification layer`);
}

for (const [kind, size] of [["FinnedXWing", 2], ["FinnedSwordfish", 3], ["FinnedJellyfish", 4]]) {
  const record = get(kind, "Finned");
  assert.ok(labels(record).has("Branch:Finned"), `${kind} must carry native Branch:Finned`);
  assert.ok([...labels(record)].some((x) => x.startsWith("FinBox:b")), `${kind} must carry native FinBox`);
  const p = payload(record);
  assert.match(p.principle, new RegExp(`分两案看.*鳍都为假.*${size}个真数.*${size}个覆盖区域.*至少一枚鳍为真.*同一个鳍宫`, "s"),
    `${kind} must explain both fin-false and fin-true cases`);
  assert.doesNotMatch(p.deduction, /鳍本身排除目标/, `${kind} must not use the old over-broad fin wording`);
}

for (const kind of ["FinnedXWing", "FinnedSwordfish", "FinnedJellyfish"]) {
  const record = get(kind, "Sashimi");
  assert.ok(labels(record).has("Branch:Sashimi"), `${kind}/Sashimi must carry native Branch:Sashimi`);
  const p = payload(record);
  assert.match(p.deduction, /Sashimi只表示去掉鳍后至少一个基准区域只剩一个鱼身落点.*不改变上述二分证明/s,
    `${kind}/Sashimi must explain what Sashimi changes and what it does not`);
}

// Branch classification must come from backend facts, never the visible title.
{
  const sashimi = structuredClone(get("FinnedXWing", "Sashimi").matchedStep);
  sashimi.title = "Finned X-Wing";
  sashimi.description = sashimi.description.replace(/^Sashimi X-Wing/, "Finned X-Wing");
  const p = buildAuditedStepExplanationPayload(sashimi, "zh");
  assert.match(p.deduction, /Sashimi只表示/, "Branch:Sashimi must survive a misleading Finned title");
}
{
  const finned = structuredClone(get("FinnedXWing", "Finned").matchedStep);
  finned.title = "Sashimi X-Wing";
  finned.description = finned.description.replace(/^Finned X-Wing/, "Sashimi X-Wing");
  const p = buildAuditedStepExplanationPayload(finned, "zh");
  assert.doesNotMatch(p.deduction, /Sashimi只表示/, "Branch:Finned must not be promoted to Sashimi by title text");
}

// The stored native C++ explanation must carry the same backend-first classification.
for (const record of records) {
  const nativeZh = record.matchedStep.explanation?.zh;
  assert.ok(nativeZh, `${record.kind}/${record.subtype} missing native C++ explanation snapshot`);
  assert.match((nativeZh.checks || []).join("\n"), new RegExp(`Branch=${record.subtype}`),
    `${record.kind}/${record.subtype} native explanation must cite the backend branch`);
}

console.log("test-real-sample-readability-round15-fish: ok (9 real Standard/Finned/Sashimi Fish samples)");
