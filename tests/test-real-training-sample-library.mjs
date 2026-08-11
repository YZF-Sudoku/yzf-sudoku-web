import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.doesNotMatch(html, /id="btnGenerateRealSamples"/, "real-sample mode must not use a separate button");
assert.match(app, /const TRAINING_REAL_SAMPLES_KIND = "__YZF_ALL_REAL_SAMPLES__";/,
  "all-technique real samples must be represented as a training dropdown mode");
assert.match(app, /realSamplesOption\.value = TRAINING_REAL_SAMPLES_KIND;/,
  "training dropdown must contain the all-technique real-sample option");
assert.match(app, /if \(kind === TRAINING_REAL_SAMPLES_KIND\) \{[\s\S]*?await generateRealTrainingSampleLibrary\(\);[\s\S]*?return;/,
  "the normal Training Generate button must route the dropdown's all-technique mode to the real-sample collector");
assert.match(app, /mode === "generate" && isRealSampleTrainingSelection\(\)[\s\S]*?await generateRealTrainingSampleLibrary\(\);[\s\S]*?return;/,
  "batch generate must not forward the real-sample pseudo-kind to the training worker");
assert.match(app, /if \(realSampleAbortController\) \{[\s\S]*?realSampleAbortController\.abort\(\);[\s\S]*?return;/,
  "the shared stop path must cancel an active all-technique sample collection");
assert.match(app, /const REAL_SAMPLE_SUBTARGETS = \[/, "sub-technique target registry missing");
assert.match(app, /function buildRealSampleTargets\(\)/, "all-technique target builder missing");
assert.match(app, /\.filter\(\(item\) => item\.implemented !== false\)/,
  "real-sample target builder must be driven by implemented techniques");
assert.match(app, /enabled: true/,
  "real-sample generation must not silently skip techniques disabled in the interactive config");
assert.match(app, /withIrregular: item\.kind === "MSLS" \? true/,
  "irregular MSLS branch must be enabled for sample discovery");
assert.match(app, /withJEPOM: item\.kind === "JE" \? true/,
  "JE optional branch must be enabled for sample discovery");

// Provenance contract: a successful record is accepted only if the backend
// returned both the exact pre-step Library state and the native matched StepResult.
assert.match(app, /result\?\.ok && result\?\.trainingLibrary && result\?\.matchedStep/,
  "sample success must require backend trainingLibrary + matchedStep");
assert.match(app, /trainingLibrary: ok \? result\.trainingLibrary : null/,
  "sample file must persist backend trainingLibrary");
assert.match(app, /matchedStep: ok \? result\.matchedStep : null/,
  "sample file must persist backend matchedStep");
assert.match(app, /recordType: ok \? "real-training-sample" : "sample-miss"/,
  "unmatched targets must be recorded as misses, never synthesized");
assert.doesNotMatch(app.slice(app.indexOf("function realSampleOutputRecord"), app.indexOf("async function generateRealTrainingSampleLibrary")),
  /StepResult|groups:\s*\[|eliminations:\s*\[/,
  "sample output path must not fabricate StepResult structure");

assert.match(app, /generateTrainingPuzzleInWorker\([\s\S]*?target\.kind,[\s\S]*?true,[\s\S]*?filter,[\s\S]*?\{ techniqueConfig, signal: controller\.signal \}/,
  "one-click library must call the real training generator in summary mode with cancel support");
assert.match(app, /maxAttemptsPerTarget: 5000/,
  "sample manifest should state the finite per-target search budget");
assert.match(app, /await writer\.write\(`\$\{JSON\.stringify\(record\)\}\\n`\)/,
  "every target result must be persisted incrementally");

const requiredSubtypeTokens = [
  "Single-RCC", "Double-RCC", "Triple-Linked", "Extended-RCC",
  "External Test 2/4", "Double-Intersection", "Irregular Rank-0",
  "Dynamic Verity Placement", "Complex Type 3", "Sashimi Mutant",
  "Branch:Unique Rectangle Type 7", "Branch:AUR + WXYZ-Ring", "Branch:Cross-Guardian",
  "Branch:AALS Type", "Double JExocet",
  "Branch:RT + Triplet Lock Set", "Branch:RT + Triplet ERI",
  // Chain subtypes must be part of the one-click real-sample audit too;
  // synthetic phase5/phase6 fixtures are not provenance evidence.
  "Branch:AIC Type 1", "Branch:AIC Type 2", "Branch:Continuous Nice Loop",
  "Branch:Discontinuous Nice Loop", "Branch:M2-Ring", "Branch:L3-Wing",
  "Branch:Grouped L2-Wing", "ForceChainKind:Cell Force Chain",
  "ForceChainKind:Triplet Oddagon Force Chain", "Grouped Dynamic Chain",
];
for (const token of requiredSubtypeTokens) {
  assert.ok(app.includes(token), `missing registered real-sample subtype target: ${token}`);
}

console.log("real training sample library regression passed");
