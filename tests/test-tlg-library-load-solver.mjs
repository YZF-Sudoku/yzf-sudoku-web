import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const manual = fs.readFileSync(new URL("../user_manual.html", import.meta.url), "utf8");
const standalone = fs.readFileSync(new URL("../../tools/build_standalone_html.py", import.meta.url), "utf8");
const browserHarness = fs.readFileSync(new URL("../../tools/test_ui_foundation_browser.py", import.meta.url), "utf8");

function extractFunction(source, name) {
  const marker = `${name.startsWith("async ") ? "" : "function "}${name}`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} missing`);
  const bodyStart = source.indexOf("{", start);
  let depth = 0, quote = "", escaped = false, line = false, block = false;
  for (let i = bodyStart; i < source.length; i += 1) {
    const ch = source[i], next = source[i + 1] || "";
    if (line) { if (ch === "\n") line = false; continue; }
    if (block) { if (ch === "*" && next === "/") { block = false; i += 1; } continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === "/" && next === "/") { line = true; i += 1; continue; }
    if (ch === "/" && next === "*") { block = true; i += 1; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  assert.fail(`${name} unterminated`);
}

assert.match(html, /id="btnTlgLibraryLoadSolver"[^>]*>载入解题器</);
assert.match(app, /const btnTlgLibraryLoadSolver = document\.getElementById\("btnTlgLibraryLoadSolver"\)/);
assert.match(app, /\["tlgLibraryLoadSolverAction", "载入解题器", "Load into Solver"\]/);
assert.match(app, /\["btnTlgLibraryLoadSolver", "tlgLibraryLoadSolverAction"\]/);
assert.match(app, /btnTlgLibraryLoadSolver\?\.addEventListener\("click"/);
assert.match(app, /let wasmModule = null;/);
assert.match(app, /wasmModule = mod;/);
assert.match(app, /localizeBackendMessage/);

const convert = extractFunction(app, "tlgLibrarySolverImportText(record)");
assert.match(convert, /record\?\.premiseMode === "candidate-grid-asserted"/);
assert.match(convert, /record\.initialCandidates/);
assert.match(convert, /baselineMasks\[cell\] \|= activeMasks\[cell\]/);
assert.match(convert, /legalCandidateMaskForBoard\(valuesText, cell\)/);
assert.match(convert, /return `:0000:s:/);

const load = extractFunction(app, "async function tlgLibraryLoadSelectedIntoSolver()");
assert.match(load, /probe = new wasmModule\.Engine\(\)/);
assert.match(load, /probe\.import_puzzle_json\(libraryText\)/);
assert.match(load, /localizeBackendMessage/);
assert.match(load, /tlgSolverEnable\.dispatchEvent\(new Event\("change"/);
assert.match(load, /await importPuzzleFromCurrentInput/);
assert.match(load, /tlgLibraryLoadSolverSuccess/);
assert.match(load, /probe\?\.delete\?\.\(\)/);

assert.match(manual, /读取、载入解题器、插入、替换、追加、删除/);
assert.match(manual, /两种前提的导入语义/);
assert.match(manual, /Read, Load into Solver, Insert, Replace, Append, and Delete/);
assert.match(standalone, /localizeBackendMessage/);
assert.match(browserHarness, /localizeBackendMessage/);

console.log("TLG library load-into-solver regression passed");
