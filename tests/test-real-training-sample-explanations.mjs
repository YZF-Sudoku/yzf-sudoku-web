import assert from "node:assert/strict";
import fs from "node:fs";
import { buildStepExplanationModel, buildAuditedStepExplanationPayload } from "../step-explanation.js";

const fixtureDirUrl = new URL("../../tools/real_training_samples/", import.meta.url);
const fixtureFiles = fs.readdirSync(fixtureDirUrl)
  .filter((name) => /^ROUND\d+_SEED_REAL_TRAINING_SAMPLES\.jsonl$/.test(name))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
assert.ok(fixtureFiles.length >= 1, "real training seed library files are missing");
const records = [];
for (const name of fixtureFiles) {
  const lines = fs.readFileSync(new URL(name, fixtureDirUrl), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
  const manifest = lines.shift();
  assert.equal(manifest.recordType, "manifest", `${name} manifest missing`);
  assert.match(manifest.provenance, /no synthetic StepResult/i, `${name} provenance contract missing`);
  records.push(...lines);
}
assert.ok(records.length >= 2, "real training seed library must retain at least two source-generated samples");

for (const record of records) {
  assert.equal(record.recordType, "real-training-sample");
  assert.ok(record.trainingLibrary?.startsWith(":"), `${record.kind} must retain the exact Library state`);
  assert.ok(record.matchedStep?.valid, `${record.kind} must retain a valid native matchedStep`);
  assert.equal(record.matchedStep.kind, record.kind, `${record.kind} provenance kind mismatch`);
  for (const locale of ["zh", "en"]) {
    const model = buildStepExplanationModel(record.matchedStep, locale);
    for (const key of ["structure", "basis", "deduction", "conclusion"]) {
      assert.ok(model.sections.some((section) => section.key === key && section.text.trim()),
        `${record.kind}/${record.subtype || "top"} ${locale} real sample missing ${key}`);
    }
    const text = model.sections.map((section) => section.text).join("\n");
    assert.ok(!text.includes("本技巧的专用模板尚未细化"), `${record.kind} fell back to obsolete generic teaching prose`);
  }
}

const pointing = records.find((record) => record.kind === "LockedCandidates" && record.subtype === "Pointing");
assert.ok(pointing, "real Pointing branch sample must be retained");
assert.ok(pointing.matchedStep.groups.some((group) => group.label === "Branch:Pointing"),
  "Pointing fixture must prove the native sub-technique branch, not title-text inference");
const quad = records.find((record) => record.kind === "NakedQuad");
assert.ok(quad?.matchedStep.groups.some((group) => /^SubsetCell:/.test(group.label)),
  "real Naked Quad fixture must retain backend subset-cell facts");

const hiddenQuad = records.find((record) => record.kind === "HiddenQuad");
assert.ok(hiddenQuad?.matchedStep.groups.some((group) => /^DigitPositions:/.test(group.label)),
  "real Hidden Quad fixture must retain backend digit-position facts");

const round12Msls = records.find((record) => record.kind === "MSLS" && /User explicit non-irregular/.test(record.subtype || ""));
assert.ok(round12Msls, "Round12 must retain the user-provided ordinary MSLS puzzle as a native FindAll fixture");
assert.ok(round12Msls.matchedStep.groups.some((group) => group.label === "Branch:Exact Rank-0"),
  "user ordinary MSLS sample must prove Exact Rank-0 rather than irregular MSLS");
assert.ok(!round12Msls.matchedStep.groups.some((group) => /Irregular/.test(group.label)),
  "user ordinary MSLS sample must not be mislabeled as irregular MSLS");

for (const [subtype, branch, pattern, klass] of [
  ["W-Wing", "Branch:W-Wing", "StrongPattern:VLV", "ThreeStrongClass:W"],
  ["M2-Ring", "Branch:M2-Ring", "StrongPattern:VLL", "ThreeStrongClass:M2"],
  ["L3-Wing", "Branch:L3-Wing", "StrongPattern:LLL", "ThreeStrongClass:L3"],
  ["Grouped L3-Ring", "Branch:Grouped L3-Ring", "StrongPattern:LLL", "ThreeStrongClass:L3"],
]) {
  const record = records.find((item) => item.subtype === subtype);
  assert.ok(record, `Round12 built-in bank sample missing ${subtype}`);
  const labels = new Set(record.matchedStep.groups.map((group) => group.label));
  for (const expected of [branch, "DCLLayer:3", pattern, klass]) {
    assert.ok(labels.has(expected), `${subtype} real sample missing backend classification ${expected}`);
  }
}

for (const subtype of ["Domino/SK Loop", "Junior Exocet", "Senior Exocet", "Weak Exocet", "Verified-Solution Placement", "Cell Force Chain", "Region Force Chain", "UR Force Chain"]) {
  const record = records.find((item) => item.subtype === subtype);
  assert.ok(record, `Round12 built-in bank sample missing ${subtype}`);
  assert.equal(record.source, "builtin-superhard-bank", `${subtype} must retain built-in-bank provenance`);
  assert.ok(Number.isInteger(record.bankIndex), `${subtype} must retain bankIndex`);
  assert.ok(Number.isInteger(record.solveStepIndex), `${subtype} must retain solveStepIndex`);
}

const dualOddagon = records.find((record) => record.kind === "BivalueOddagon" && record.subtype === "Dual");
assert.ok(dualOddagon, "real Dual Bivalue Oddagon sample must be retained");
for (const label of ["OddagonA:56", "OddagonB:56", "SharedExit:56"]) {
  assert.ok(dualOddagon.matchedStep.groups.some((group) => group.label === label),
    `Dual Oddagon fixture missing backend fact ${label}`);
}
const dualOddagonZh = buildStepExplanationModel(dualOddagon.matchedStep, "zh");
const dualOddagonText = dualOddagonZh.sections.map((section) => section.text).join("\n");
assert.match(dualOddagonText, /Oddagon A=.*Oddagon B=.*公共出口.*=/s,
  "Dual Oddagon explanation must display both native oddagons and their shared exit");

const alsXzRank0 = records.find((record) => record.kind === "ALSXZ" && /Double-RCC Rank-0/.test(record.subtype || ""));
assert.ok(alsXzRank0, "real ALS-XZ Double-RCC Rank-0 sample must be retained");
assert.equal(alsXzRank0.matchedStep.rankAvailable, true, "ALS-XZ Double-RCC must expose strict rank availability");
assert.equal(alsXzRank0.matchedStep.rank, 0, "ALS-XZ Double-RCC must expose backend Rank 0");
assert.ok(alsXzRank0.matchedStep.groups.some((group) => group.label === "Rank:0"),
  "ALS-XZ Double-RCC fixture must retain explicit backend Rank:0 fact");

const alsTriple = records.find((record) => record.kind === "ALSXYWing" && /Triple-Linked/.test(record.subtype || ""));
assert.ok(alsTriple, "real ALS-XY-Wing Triple-Linked Rank-0 sample must be retained");
assert.equal(alsTriple.matchedStep.rankAvailable, true, "ALS triple-linked fixture must expose rank availability from backend");
assert.equal(alsTriple.matchedStep.rank, 0, "ALS triple-linked fixture must expose backend Rank 0");
assert.ok(alsTriple.matchedStep.groups.some((group) => /^RccZ:/.test(group.label)),
  "ALS triple-linked fixture must expose the third A-B RCC as backend fact");
const alsTripleZh = buildStepExplanationModel(alsTriple.matchedStep, "zh");
const alsTripleText = alsTripleZh.sections.map((section) => section.text).join("\n");
assert.match(alsTripleText, /RCC Z\(A-B\)=9/,
  "ALS triple-linked explanation must render the native third RCC instead of inferring from title");

const ahsTriple = records.find((record) => record.kind === "AHSXYWing" && /Triple-Linked/.test(record.subtype || ""));
assert.ok(ahsTriple, "real AHS-XY-Wing Triple-Linked Extended-RCC sample must be retained");
assert.ok(ahsTriple.matchedStep.groups.some((group) => /^RccZ:/.test(group.label)),
  "AHS triple-linked fixture must retain the third RCC fact");
assert.ok(ahsTriple.matchedStep.groups.some((group) => /^SupportZ\(/.test(group.label)),
  "AHS triple-linked fixture must retain the third RCC support facts");
const ahsTripleZh = buildStepExplanationModel(ahsTriple.matchedStep, "zh");
const ahsTripleText = ahsTripleZh.sections.map((section) => section.text).join("\n");
assert.match(ahsTripleText, /RCC Z/, "AHS triple-linked explanation must render its third RCC");
assert.match(ahsTripleText, /支撑=|support/i, "AHS triple-linked explanation must surface third-RCC support facts");



const userFixtureFiles = fs.readdirSync(fixtureDirUrl)
  .filter((name) => /^ROUND\d+_USER_FINDALL_REAL_SAMPLES\.jsonl$/.test(name))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
const userRecords = [];
for (const name of userFixtureFiles) {
  const lines = fs.readFileSync(new URL(name, fixtureDirUrl), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
  const manifest = lines.shift();
  assert.equal(manifest.recordType, "manifest", `${name} manifest missing`);
  assert.match(manifest.provenance, /no synthetic StepResult/i, `${name} provenance contract missing`);
  userRecords.push(...lines);
}
if (userFixtureFiles.length) {
  assert.ok(userRecords.length >= 5, "Round11 user FindAll fixture must retain the five supplied real samples");
  for (const record of userRecords) {
    assert.equal(record.recordType, "user-findall-real-sample");
    assert.equal(record.provenance, "user-local-findall");
    assert.ok(record.sourceLibrary?.startsWith(":"), `${record.kind} must retain the exact user Library state`);
    assert.ok(record.matchedStep?.valid, `${record.kind} must retain a valid replayed matchedStep`);
    assert.equal(record.matchedStep.kind, record.kind, `${record.kind} replay kind mismatch`);
  }

  const payloadText = (record, locale = "zh") => {
    const payload = buildAuditedStepExplanationPayload(record.matchedStep, locale);
    assert.ok(payload, `${record.kind}/${record.subtype} missing audited payload`);
    return { payload, text: [payload.structure, payload.principle, payload.deduction, ...(payload.checks || [])].join("\n") };
  };

  const odd1 = userRecords.find((r) => r.kind === "BivalueOddagon" && /Type 1/.test(r.subtype));
  const odd2 = userRecords.find((r) => r.kind === "BivalueOddagon" && r.subtype === "Type 2");
  const trip1 = userRecords.find((r) => r.kind === "TripletOddagon" && r.subtype === "Type 1");
  const ahsXz = userRecords.find((r) => r.kind === "AHSXZ" && /Extended-RCC/.test(r.subtype));
  const ahsW = userRecords.find((r) => r.kind === "AHSWWing" && /Triple-Linked/.test(r.subtype));
  assert.ok(odd1 && odd2 && trip1 && ahsXz && ahsW, "Round11 five target branches must all be retained");

  assert.ok(odd1.matchedStep.groups.some((g) => g.label === "ExitCell:2"), "Type-1 Oddagon must expose native ExitCell:2");
  assert.match(payloadText(odd1).text, /唯一出口=.*r9c2.*组外候选=\{2\}/s, "Type-1 Oddagon explanation must use the real exit/outside candidate");
  assert.ok(odd2.matchedStep.groups.some((g) => g.label === "Guardians:9"), "Type-2 Oddagon must expose native Guardians:9");
  assert.match(payloadText(odd2).text, /Guardians=.*r8c3.*r8c9/s, "Type-2 Oddagon explanation must show real guardians");

  assert.ok(trip1.matchedStep.groups.some((g) => g.label === "EscapeCell:3"), "Triplet Type-1 must expose native EscapeCell:3");
  const tripZh = payloadText(trip1).payload;
  assert.match(`${tripZh.principle}\n${tripZh.deduction}`, /Negative Rank.*r4c6.*\{3\}/s, "Triplet Type-1 must explain the real negative-rank escape");
  assert.doesNotMatch(`${tripZh.principle}\n${tripZh.deduction}`, /不可唯一|第二解/, "Triplet Type-1 principle/deduction must not use uniqueness logic");
  const tripEn = payloadText(trip1, "en").payload;
  assert.doesNotMatch(`${tripEn.principle}\n${tripEn.deduction}`, /destroy uniqueness|second solution/i, "Triplet Type-1 English must not use uniqueness logic");

  for (const label of ["Rcc1ExtraA:r1c57", "Rcc1HlsA:r1c579", "Rcc1SupportA:8", "Rcc1ExtraB:r3c89", "Rcc1SupportB:8"]) {
    assert.ok(ahsXz.matchedStep.groups.some((g) => g.label === label), `AHS-XZ Extended fixture missing ${label}`);
  }
  const ahsXzText = payloadText(ahsXz).text;
  assert.match(ahsXzText, /RCC1=.*A端Extra=.*r1c5.*r1c7.*A端支撑=8@.*r1c7.*r1c9.*B端支撑=8@.*r3c9/s,
    "AHS-XZ Extended explanation must surface exact Extra/HLS/support proof facts");

  for (const label of ["WitnessZ:r2c3", "CandidateZ(AOnly):4@r2c3", "CandidateZ(BOnly):7@r2c3,9@r2c3"]) {
    assert.ok(ahsW.matchedStep.groups.some((g) => g.label === label), `AHS-W Triple fixture missing ${label}`);
  }
  assert.ok(!ahsW.matchedStep.groups.some((g) => /^CandidateZ\(Common\):/.test(g.label)), "AHS-W Shared-Cell sample must have no common candidate role");
  const ahsWText = payloadText(ahsW).text;
  assert.match(ahsWText, /共享格.*r2c3.*A端独有候选=\{4\}.*B端独有候选=\{7\/9\}.*公共候选=\{无\}/s,
    "AHS-W Triple explanation must prove Shared-Cell RCC from A-only/B-only/no-common candidates");

  const tripletFc = userRecords.find((r) => r.kind === "CellRegionFC" && r.subtype === "Triplet Oddagon Force Chain");
  assert.ok(tripletFc, "Round13 must retain the user-supplied Triplet Oddagon Force Chain real sample");
  const tripletFcLabels = new Set(tripletFc.matchedStep.groups.map((g) => g.label));
  for (const label of [
    "WitnessTripletOddagon:789",
    "TripletGuardian:1", "TripletGuardian:2", "TripletGuardian:6",
    "TripletGuardians:126", "TripletGuardianCount:3",
    "TripletGuardianBranch1:6", "TripletGuardianBranch2:1", "TripletGuardianBranch3:2",
  ]) {
    assert.ok(tripletFcLabels.has(label), `Triplet Oddagon Force Chain fixture missing backend fact ${label}`);
  }
  const tripletFcZh = payloadText(tripletFc).payload;
  const tripletWitness = tripletFc.matchedStep.groups.find((g) => g.label === "WitnessTripletOddagon:789");
  assert.equal(tripletWitness?.cells?.length, 12, "Triplet Oddagon Force Chain witness must retain all 12 body cells");
  assert.match(tripletFcZh.structure, /7\/8\/9.*Triplet Oddagon.*1@r4c4.*2@r6c8.*6@r1c8/s,
    "Triplet Oddagon Force Chain explanation must surface the real body and all guardians");
  assert.match(tripletFcZh.principle, /不能同时为假.*至少一个guardian必须成立/s,
    "Triplet Oddagon Force Chain must explain the at-least-one-guardian condition");
  assert.match(tripletFcZh.deduction, /分支1: 6@r1c8.*分支2: 1@r4c4.*分支3: 2@r6c8.*交集/s,
    "Triplet Oddagon Force Chain must map each guardian to its real displayed branch and intersect endpoint deletions");
}

console.log(`real training explanation acceptance passed (${records.length} source-generated samples + ${userRecords.length} user-FindAll replay samples)`);
