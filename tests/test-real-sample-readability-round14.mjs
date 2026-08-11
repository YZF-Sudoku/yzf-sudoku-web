import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildAuditedStepExplanationPayload } from "../step-explanation.js";

const fixtureDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../tools/real_training_samples");
const records = [];
for (const file of fs.readdirSync(fixtureDir)
  .filter((name) => /^ROUND\d+_SEED_REAL_TRAINING_SAMPLES\.jsonl$/.test(name))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))) {
  const lines = fs.readFileSync(path.join(fixtureDir, file), "utf8").trim().split(/\r?\n/).map(JSON.parse);
  lines.shift();
  records.push(...lines);
}

const get = (kind, subtype = undefined) => {
  const record = records.find((item) => item.kind === kind && (subtype === undefined || item.subtype === subtype));
  assert.ok(record, `missing real sample ${kind}/${subtype ?? "*"}`);
  return record;
};
const payload = (record) => {
  const result = buildAuditedStepExplanationPayload(record.matchedStep, "zh");
  assert.ok(result, `missing audited payload ${record.kind}/${record.subtype || "top"}`);
  return result;
};

for (const record of [get("LockedCandidates", "Pointing"), get("NakedQuad"), get("HiddenQuad")]) {
  const p = payload(record);
  const firstScreen = `${p.structure}\n${p.principle}\n${p.deduction}`;
  assert.doesNotMatch(firstScreen, /[∨⇒¬⋃]/, `${record.kind} first screen must use human prose instead of formal symbols`);
}
assert.match(payload(get("NakedQuad")).checks.join("\n"), /\|C\|=\|U\|=4/, "Naked Quad strict invariant must remain in verification layer");
assert.match(payload(get("HiddenQuad")).checks.join("\n"), /\|D\|=\|P\(D\)\|=4/, "Hidden Quad strict invariant must remain in verification layer");

const alsTriple = payload(get("ALSXYWing", "Triple-Linked Rank-0"));
assert.match(alsTriple.principle, /不是“普通ALS-XY-Wing再多送一些删数”/, "ALS triple-linked must be explained as its own rank-0 branch");
assert.match(alsTriple.structure, /RCC X=.*RCC Y=.*RCC Z=/s, "ALS triple-linked must expose all three native RCCs");
assert.doesNotMatch(`${alsTriple.principle}\n${alsTriple.deduction}`, /共同Z至少|共同删数数字为Z/, "ALS triple-linked must not fall back to ordinary common-Z proof");

const grouped = get("GroupedAIC", "Grouped L3-Ring");
assert.ok(grouped.matchedStep.groups.some((g) => g.label === "NodeKinds:Single=6,Grouped=0,ALS=0"), "fixture must prove final replay has zero grouped nodes");
const groupedP = payload(grouped);
assert.match(groupedP.principle, /最终最短回放已化简为单候选节点/, "Grouped branch with Grouped=0 must explain replay simplification");
assert.doesNotMatch(groupedP.principle, /至少一个位置端.*组节点/, "Grouped=0 replay must not claim an actual grouped endpoint");

const l3 = payload(get("AIC", "L3-Wing"));
assert.match(l3.deduction, /起点为假.*终点(?:必)?为真.*同时把起点候选排除.*与终点候选冲突/s, "different-digit endpoint deletion must spell out both endpoint conflicts");

const alsXz = payload(get("ALSXZ", "Double-RCC Rank-0"));
assert.match(alsXz.principle, /每个ALS本来各有1个自由度.*两个.*RCC.*全部锁住/s, "Double-RCC ALS-XZ should explain why rank becomes zero in human terms");
assert.match(alsXz.deduction, /全部链接自由度.*超出可用容量/s, "Double-RCC ALS-XZ should connect rank 0 to the eliminations");

const ahsTriple = payload(get("AHSXYWing", "Triple-Linked Rank-0 Extended-RCC"));
assert.match(ahsTriple.principle, /每组AHS都恰有一个Extra格.*三条RCC.*只剩两个全局状态/s, "AHS triple-linked first principle should state the forced alternating states in readable order");

const je = payload(get("JE", "Junior Exocet"));
const jeText = [je.structure, je.principle, je.deduction, ...(je.checks || [])].join("\n");
assert.match(je.structure, /实际启用检查=X-Rule、T格检查/, "JE must localize real checks");
assert.doesNotMatch(jeText, /Check X-Rule|扩展飞鱼/, "JE user-facing explanation must not leak stale/raw labels");
assert.doesNotMatch(je.principle, /Mirror、Locked Member、True Base和JEPOM/, "JE first principle should not enumerate checks absent from this real step");

const senior = payload(get("SeniorExocet", "Senior Exocet"));
assert.match(senior.principle, /只使用实际列出的附加检查/, "Senior Exocet must state the actual-check-only contract");
assert.doesNotMatch(senior.principle, /Mirror.*Potential Target Cover House/, "Senior first principle should not list absent checks");

console.log("test-real-sample-readability-round14: ok (foundations + ALS/AHS + AIC + Exocet real samples)");
