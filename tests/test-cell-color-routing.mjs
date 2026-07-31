/*
 * Regression guard for backend-authoritative whole-cell rendering.
 *
 * - Exocet keeps its established recovery path unchanged.
 * - AHS cell pairing is supplied only by StepResult.colorCells.
 * - Duplicate backend colorCells entries for one cell are preserved as bands.
 * - AHS candidate circles remain visible inside whole-cell fills.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(here, "../app.js");
const indexPath = path.resolve(here, "../index.html");
const appSource = fs.readFileSync(appPath, "utf8");
const indexSource = fs.readFileSync(indexPath, "utf8");

function extractFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} missing from app.js`);
  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = bodyStart; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1] || "";
    if (lineComment) { if (ch === "\n") lineComment = false; continue; }
    if (blockComment) { if (ch === "*" && next === "/") { blockComment = false; i += 1; } continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === "/" && next === "/") { lineComment = true; i += 1; continue; }
    if (ch === "/" && next === "*") { blockComment = true; i += 1; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  assert.fail(`${name} body is unterminated`);
}

const backendFn = extractFunction(appSource, "backendCellColorMap");
const solverFn = extractFunction(appSource, "solverCellColorMap");
const applyFn = extractFunction(appSource, "applySolverCellColor");
const candidateFn = extractFunction(appSource, "colorCandidateMapForCell");

const makeMaps = new Function(`
  let recovered = new Map();
  function isExocetStructureHint(hint) { return Boolean(hint?.isExocet); }
  function exocetCellColorMap() { return recovered; }
  ${backendFn}
  ${solverFn}
  return {
    backendCellColorMap,
    solverCellColorMap,
    setRecovered(value) { recovered = value; },
  };
`)();

const xyHint = {
  kind: "AHSXYWing",
  colorCells: [
    { color: 4, index: 11 },
    { color: 4, index: 12 },
    { color: 5, index: 17 },
    { color: 5, index: 26 },
    // One physical cell belongs to both backend-declared RCC pairs.
    { color: 4, index: 40 },
    { color: 5, index: 40 },
    { color: 4, index: 40 }, // duplicate must be deduplicated
  ],
};
assert.deepEqual([...makeMaps.backendCellColorMap(xyHint)], [
  [11, [4]], [12, [4]], [17, [5]], [26, [5]], [40, [4, 5]],
], "generic routing must preserve backend RCC pair colors and duplicate-cell bands");
assert.deepEqual([...makeMaps.solverCellColorMap(xyHint)], [
  [11, [4]], [12, [4]], [17, [5]], [26, [5]], [40, [4, 5]],
]);

const wHint = {
  kind: "AHSWWing",
  colorCells: [
    { color: 4, index: 16 }, { color: 4, index: 8 },
    { color: 5, index: 8 }, { color: 5, index: 53 },
  ],
};
assert.deepEqual(makeMaps.backendCellColorMap(wHint).get(8), [4, 5],
  "W-Wing pivot must retain both backend pair colors");

const makeCandidateMap = new Function(`
  const EXOCET_STRUCTURAL_CELL_COLORS = new Set([1, 4, 5, 6, 7, 8]);
  ${candidateFn}
  return colorCandidateMapForCell;
`)();
const ahsCandidateHint = {
  kind: "AHSXYWing",
  colorCands: [
    { color: 6, index: 12, candidates: [1, 5] },
    { color: 3, index: 12, candidates: [5] },
  ],
};
const ahsCandidates = makeCandidateMap(ahsCandidateHint, 12, 0);
assert.equal(ahsCandidates.get(1)?.baseColor, 6,
  "AHS candidates must remain highlighted inside an HLS whole-cell fill");
assert.equal(ahsCandidates.get(5)?.baseColor, 3,
  "later RCC/common candidate color must override the AHS base candidate color");
const exocetCandidates = makeCandidateMap(ahsCandidateHint, 12, 6);
assert.equal(exocetCandidates.has(1), false,
  "Exocet structural-role candidate suppression must remain available");
assert.equal(exocetCandidates.get(5)?.baseColor, 3);

makeMaps.setRecovered(new Map([[11, 4], [33, 1]]));
const exocetHint = {
  isExocet: true,
  colorCells: [{ color: 6, index: 11 }, { color: 5, index: 26 }],
};
assert.deepEqual([...makeMaps.solverCellColorMap(exocetHint)], [[11, 4], [33, 1]],
  "Exocet must keep its established recovery map and ignore generic colorCells routing");

const applyColor = new Function("FB_EXOCET_CELL_COLORS", "FB_BACK_COLORS", `${applyFn}; return applySolverCellColor;`)(
  { 4: "#FFC059", 5: "#B1A5F3", 6: "#F7A5A7" },
  { 4: "#C5E88E", 5: "#FFCBCB", 6: "#B2DFDF" },
);
function fakeNode() {
  return {
    classList: { values: [], add(...values) { this.values.push(...values); } },
    dataset: {},
    style: { values: new Map(), setProperty(key, value) { this.values.set(key, value); } },
  };
}
const single = fakeNode();
applyColor(single, [4]);
assert.deepEqual(single.classList.values, ["solver-cell-bkclr", "solver-cell-bkclr-4"]);
assert.equal(single.dataset.solverCellColors, "4");
assert.equal(single.style.values.get("--solver-cell-bg"), "#FFC059");

const dual = fakeNode();
applyColor(dual, [4, 5]);
assert.deepEqual(dual.classList.values, ["solver-cell-role-fill"]);
assert.equal(dual.dataset.solverCellColors, "4,5");
assert.match(dual.style.values.get("--solver-cell-role-bg"),
  /^linear-gradient\(90deg, #FFC059 0%, #FFC059 50%, #B1A5F3 50%, #B1A5F3 100%\)$/);

for (const forbidden of [
  "ahsCellRoleMap", "ahsRoleFromGroupLabel", "normalizeAhsCellRoles",
  "ahsCellRoleGradient", "applyAhsCellRoles", "AHS_CELL_ROLE_COLORS",
  "ahsDigitsFromLabel", "ahsSetDigitRoles", "ahsWitnessCandidateColor",
]) {
  assert.doesNotMatch(appSource, new RegExp(`(?:function|const)\\s+${forbidden}\\b`),
    `${forbidden} must not reconstruct backend AHS coloring in the frontend`);
}
assert.match(appSource, /applySolverCellColor\(node, solverCellFill\);/,
  "renderBoardSnapshot must render the backend-provided cell colors directly");
assert.match(appSource, /const suppressedStructuralColor = isExocetStructureHint\(hint\) \? solverCellColor : 0;/,
  "candidate suppression must remain restricted to Exocet");
assert.match(indexSource, /\.sudoku-cell\.solver-cell-role-fill\s*\{[^}]*background:/s,
  "multi-color backend cell-fill CSS is missing");

console.log("AHS backend RCC-pair cell colors / candidate colors / Exocet guard: OK");
