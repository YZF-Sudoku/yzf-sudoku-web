import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");
const app = fs.readFileSync(path.join(repo, "web-app/app.js"), "utf8");
const registryStart = app.indexOf("const REAL_SAMPLE_SUBTARGETS = [");
const registryEnd = app.indexOf("].map(([kind, label, includeText, excludeText", registryStart);
assert.ok(registryStart >= 0 && registryEnd > registryStart, "real-sample subtype registry missing");
const registry = app.slice(registryStart, registryEnd);
const filters = [...registry.matchAll(/^\s*\["[^"]+",\s*"[^"]+",\s*"([^"]*)"(?:,\s*"[^"]*")?\],\s*$/gm)].map((m) => m[1]);

function cppFiles(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...cppFiles(p));
    else if (ent.isFile() && p.endsWith(".cpp")) out.push(p);
  }
  return out;
}

const literalBranches = new Set();
for (const file of cppFiles(path.join(repo, "engine-core/src"))) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/"(Branch:[^"\\]+)"/g)) {
    const label = match[1];
    // These are construction prefixes completed at runtime, not complete branch names.
    if (label === "Branch: " || label.endsWith("Complex Type ")) continue;
    literalBranches.add(label);
  }
}

for (const branch of [...literalBranches].sort()) {
  const suffix = branch.slice("Branch:".length);
  assert.ok(filters.some((filter) => filter === branch || filter.includes(suffix) || branch.includes(filter)),
    `backend branch is not represented in REAL_SAMPLE_SUBTARGETS: ${branch}`);
}

console.log(`real sample literal-branch coverage passed (${literalBranches.size} backend branch labels)`);
