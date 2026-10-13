import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.match(
  source,
  /function batchLine\(result, trainingMode = false\)[\s\S]*result\?\.trainingLibrary/,
  "batch training output must consume the backend matched-step Library record"
);
assert.doesNotMatch(
  source,
  /function batchLine\(result, trainingMode = false\)[\s\S]{0,500}\bindex\b/,
  "generated batch lines must not prepend a sequence number"
);
assert.match(
  source,
  /writer\.write\(batchLine\(result, trainingMode\)\)/,
  "batch generation must tell the formatter whether matched-step output is required"
);

assert.match(
  source,
  /function batchTrainingStepColumns\(result\)[\s\S]*step\.kind[\s\S]*step\.title[\s\S]*step\.description/,
  "training output must append main technique, concrete subtype title, and step description"
);
assert.match(
  source,
  /if \(trainingMode\) \{[\s\S]{0,200}columns\.push\(\.\.\.batchTrainingStepColumns\(result\)\)/,
  "only training generation should append step classification columns"
);
assert.match(
  source,
  /const trainingSnapshot = result\.trainingState \|\| matchedRecord\?\.before \|\| null;/,
  "single training generation should prefer the backend matched-step state"
);
assert.match(
  source,
  /String\(result\.trainingLibrary \|\| ""\) \|\| snapshotToLibraryString\(trainingSnapshot\)/,
  "single training generation should prefer the backend matched-step Library record"
);

console.log("batch training matched-step Library output regression passed");
