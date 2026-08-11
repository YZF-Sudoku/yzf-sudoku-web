import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const manual = fs.readFileSync(new URL("../user_manual.html", import.meta.url), "utf8");
const readme = fs.readFileSync(new URL("../README.md", import.meta.url), "utf8");

function extractFunction(source, name) {
  const marker = `function ${name}(`;
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

// Preserve the immediately preceding V525 UI change: there is no standalone
// all-technique-sample button; it remains a training-dropdown mode.
assert.doesNotMatch(html, /id="btnGenerateRealSamples"/);
assert.match(app, /const TRAINING_REAL_SAMPLES_KIND = "__YZF_ALL_REAL_SAMPLES__";/);

assert.match(html, /id="mobileSolveFocusPad"[^>]*hidden/);
assert.match(html, /id="mobileSolveFocusFollowToggle"/);
assert.match(html, /id="mobileSolveActions"/);
assert.match(html, /id="btnMobileSolveClear"/);
assert.match(html, /id="btnMobileSolveHint"[^>]*data-action="hint"/);
assert.doesNotMatch(html, /id="btnMobileSolveApply"/);
assert.match(html, /id="mobileSolveNumpadHost"/);
assert.match(html, /id="mobileSolveInputState"[^>]*>出数 · 未选格</);
assert.match(app, /inputModeTitle[\s\S]*?先点目标格[\s\S]*?焦点跟随操作盘/);
assert.match(manual, /统一使用格优先/);
assert.match(manual, /更多 → 焦点跟随操作盘/);
assert.doesNotMatch(manual, /先选数字与“出数\/候选”，再轻触格子/);
assert.doesNotMatch(manual, /普通做题优先使用“先选数字，再点格”/);
assert.match(readme, /Mobile solving is \*\*cell-first\*\*/);
assert.match(readme, /Focus-follow keypad \/ 焦点跟随操作盘/);
assert.match(readme, /Clear \/ 清除 \| Hint→Apply \/ 提示→应用/);
assert.doesNotMatch(readme, /keeps the existing number-first workflow/);

const tap = extractFunction(app, "handleCellTap");
assert.match(tap, /if \(mobileSolveActive\) \{[\s\S]*?selectedIndex = index;[\s\S]*?openMobileSolveFocusPad\(index\);[\s\S]*?return;/,
  "mobile board tap must only select/reposition focus before returning");
const mobileBranch = tap.slice(tap.indexOf("if (mobileSolveActive)"), tap.lastIndexOf("if (inputMode"));
assert.doesNotMatch(mobileBranch, /handleValueTap\(|handleCandidateTap\(|executeValueEdit\(|toggle_candidate_json/,
  "cell-first mobile tap must not edit the board");

const applyDigit = extractFunction(app, "applyMobileSolveDigit");
assert.match(applyDigit, /ensureMobileSolveSelection\(\)/);
assert.match(applyDigit, /engine\.toggle_candidate_json\(selectedIndex, value\)/);
assert.match(applyDigit, /executeValueEdit\(selectedIndex, nextValue\)/);
assert.match(applyDigit, /finishMobileSolveDigitInteraction\(\)/);

const numpad = extractFunction(app, "buildNumpad");
assert.match(numpad, /if \(mobileSolveActive\) \{[\s\S]*?applyMobileSolveDigit\(digit\);[\s\S]*?return;/,
  "fixed and floating mobile numpads must share applyMobileSolveDigit");


const hintToggle = extractFunction(app, "updateMobileSolveHintAction");
assert.match(hintToggle, /mobileSolveHintActionIsApply\(\)/);
assert.match(hintToggle, /mobileSolveApplyShort/);
assert.match(hintToggle, /mobileSolveHintShort/);
assert.match(hintToggle, /dataset\.action = applying \? "apply" : "hint"/);
const hintRun = extractFunction(app, "runMobileSolveHintAction");
assert.match(hintRun, /btnApply\?\.click\(\)/);
assert.match(hintRun, /btnStep\?\.click\(\)/);
assert.doesNotMatch(hintRun, /closeMobileSolveFocusPad\(\)/, "Hint→Apply must stay available in the same floating key position");
assert.match(html, /#btnMobileSolveClear \{ grid-area: 4 \/ 1; \}/);
assert.match(html, /#btnMobileSolveHint \{ grid-area: 4 \/ 2; \}/);
assert.match(manual, /清除｜提示\/应用｜标记｜更多/);

const clear = extractFunction(app, "clearMobileSolveSelection");
assert.doesNotMatch(clear, /toggle_candidate_json|handleCandidateTap|executeSimpleEngineEdit/,
  "Clear must not use the previous digit as an armed candidate in cell-first mode");

const mount = extractFunction(app, "mountMobileSolveFocusControls");
assert.match(mount, /mobileSolveFocusPad\.appendChild\(numpad\)/);
assert.match(mount, /mobileSolveFocusPad\.appendChild\(mobileSolveActions\)/);
assert.match(mount, /mobileSolveNumpadHost\?\.appendChild\(numpad\)/);
assert.match(mount, /restoreMobileSolveElement\(mobileSolveActionsHomeMarker, mobileSolveActions\)/);
assert.doesNotMatch(mount, /cloneNode|createElement/,
  "focus mode must move the live controls rather than clone a second keypad");

const keep = extractFunction(app, "mobileSolveFocusPadKeepsOpenAfterDigit");
for (const mode of ["candidateColor", "circle", "preElim", "elim"]) {
  assert.ok(keep.includes(`"${mode}"`), `${mode} must allow same-cell repeated digit actions`);
}
for (const mode of ["chain", "construction", "miniRegion", "block"]) {
  assert.ok(!keep.includes(`"${mode}"`), `${mode} must release the board after each endpoint/node`);
}

const context = extractFunction(app, "toggleMobileSolveContextAction");
assert.match(context, /manualMarkButton = manualMarkButton === "primary" \? "secondary" : "primary"/);
assert.match(context, /mode === "chain"[\s\S]*?"strong" : "weak"/);
assert.match(context, /mode === "construction"[\s\S]*?"constructionStrong" : "constructionWeak"/);

const digitDisabling = extractFunction(app, "syncMobileSolveCompletedDigitButtons");
assert.match(digitDisabling, /manualMarkRequiresExistingCandidate\(markMode\)/,
  "chain-like mark modes must disable digits that are not current candidates");
assert.match(digitDisabling, /isFixedCell\(selectedIndex\)/,
  "given cells must not accept mobile digit actions");

const lifecycle = extractFunction(app, "finishMobileSolveDigitInteraction");
assert.match(lifecycle, /mobileSolveFocusPadKeepsOpenAfterDigit\(\)/);
assert.match(lifecycle, /closeMobileSolveFocusPad\(\)/);

const layout = extractFunction(app, "applyMobileSolveLayout");
assert.match(layout, /const floatingControls = mobileSolveFocusFollow;/);
assert.match(layout, /const pad = floatingControls \? 0/);
assert.match(layout, /const actions = floatingControls \? 0/);
assert.match(layout, /marksPanelHeight[\s\S]*?manualMarksPanel\.scrollHeight/,
  "short portrait layout must budget the real mark-panel height, not a clipped grid track");

assert.match(app, /if \(mobileSolveFocusPadOpen\) \{[\s\S]*?closeMobileSolveFocusPad\(\);/,
  "Back/Escape stack must close the focus pad before leaving the mobile workflow");
assert.match(app, /manualMarkMode\?\.addEventListener\("change", \(\) => \{[\s\S]*?if \(mobileSolveActive\) closeMobileSolveFocusPad\(\);/,
  "changing manual mark mode must not leave a stale floating context pad");

console.log("mobile cell-first + focus-follow regression passed");
