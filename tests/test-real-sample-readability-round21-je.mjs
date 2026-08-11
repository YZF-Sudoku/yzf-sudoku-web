import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAuditedStepExplanationPayload, buildAuditedTechniqueGuide } from "../step-explanation.js";
const fixture = new URL("../../tools/real_training_samples/ROUND21_JE_REAL_SAMPLES.jsonl", import.meta.url);
const lines = fs.readFileSync(fixture,"utf8").trim().split(/\r?\n/).map(JSON.parse);
const manifest=lines.shift(); assert.equal(manifest.recordCount,2); assert.equal(lines.length,2);
const get=id=>{const r=lines.find(x=>x.targetId===id); assert.ok(r,`missing ${id}`); return r;};
const labels=r=>(r.matchedStep.groups||[]).map(g=>g.label||"");
const group=(r,name)=>(r.matchedStep.groups||[]).find(g=>g.label===name);
for (const r of lines) {
  assert.ok(r.trainingLibrary.startsWith(":"));
  const p=buildAuditedStepExplanationPayload(r.matchedStep,"zh"); const g=buildAuditedTechniqueGuide(r.matchedStep,"zh");
  assert.ok(p); assert.equal(g?.length,6);
  assert.doesNotMatch([p.structure,p.principle,p.deduction,...g.slice(0,3)].join("\n"),/[∨⇒¬⋃∈∧]/);
  const n=r.matchedStep.explanation?.zh; assert.ok(n); assert.doesNotMatch([n.structure,n.principle,n.deduction].join("\n"),/[∨⇒¬⋃∈∧]/);
}
{
  const r=get("JE::Almost JE4"); assert.ok(labels(r).includes("Branch:Almost JE4")); assert.ok(labels(r).includes("MissingBaseDigit:3"));
  const p=buildAuditedStepExplanationPayload(r.matchedStep,"zh"); assert.match(p.structure,/Almost JE4/); assert.match(p.deduction,/缺失数字3|S-cell/);
  const fake=structuredClone(r.matchedStep); fake.title="Junior Exocet"; fake.description="Junior Exocet fake title";
  assert.match(buildAuditedStepExplanationPayload(fake,"zh").structure,/Almost JE4/);
}
{
  const r=get("JE::Double JExocet"); assert.ok(labels(r).includes("Branch:Double JExocet"));
  for (const name of ["Base A","Base B","Targets A Q","Targets A R","Targets B Q","Targets B R"]) assert.ok(group(r,name)?.cells?.length===2,`${name} must retain two real cells`);
  const p=buildAuditedStepExplanationPayload(r.matchedStep,"zh"); assert.match(p.structure,/Double JExocet/); assert.match(p.structure,/Base A.*Base B/s); assert.match(p.deduction,/两套JE|两套Junior Exocet/);
  assert.match(r.matchedStep.explanation.zh.structure,/Double JExocet.*Base A.*Base B/s);
  const fake=structuredClone(r.matchedStep); fake.title="Junior Exocet"; fake.description="Junior Exocet fake title";
  assert.match(buildAuditedStepExplanationPayload(fake,"zh").structure,/Double JExocet/);
}
console.log("test-real-sample-readability-round21-je: ok (2 current-backend JE closures)");
