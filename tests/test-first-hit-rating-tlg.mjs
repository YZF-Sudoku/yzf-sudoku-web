import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(html, /id="trainingTextFilterFindAll"[^>]*checked/,
  "training filter must expose a backward-compatible Find All switch");
assert.match(app, /findAll:\s*trainingTextFilterFindAll\?\.checked !== false/,
  "dialog must send the Find All\/First hit choice to the backend");
assert.match(app, /const ratingSnapshot = currentSnapshot \|\| getCurrentSnapshot\(\)/,
  "rating must use the state currently displayed on the board");
assert.match(app, /const useWorker = Boolean\(initialCandidateSukaku\)/,
  "only an initially imported Sukaku should use the rating worker");
assert.match(app, /engine\.rate_import_text_json\(input\)/,
  "main-thread and Worker rating must call the same current-state interface");
assert.match(html, /\.tlg-context-submenu::before[\s\S]*left:\s*-6px[\s\S]*width:\s*6px/,
  "TLG submenu must bridge the visual hover gutter");
assert.match(app, /wrapper\.addEventListener\("pointerleave", scheduleClose\)/,
  "TLG submenu must use delayed pointer-leave closing");

assert.match(app, /function refreshTlgSolverSelectionMarksWithoutRender\(\)/,
  "TLG context menu must refresh selection without rebuilding the board");
assert.match(app, /tlgContextMenuScrollGuardUntil = performance\.now\(\) \+ 250/,
  "TLG context menu must ignore its opening layout scroll but still close on later user scroll");
assert.doesNotMatch(app, /function openTlgSolverContextMenu[\s\S]{0,1800}renderBoardSnapshot\(currentSnapshot, currentHint\);/,
  "opening the TLG context menu must not trigger a board-render scroll close");
assert.match(app, /at least one endpoint must be a current Truth or Virtual Set candidate/,
  "TLG Link guidance must require one current structure-anchor endpoint");
assert.match(app, /function tlgCandidateIsCurrentLinkAnchor[\s\S]*tlgCandidateIsCurrentTruthMember[\s\S]*tlgCandidateIsCurrentVirtualSetMember/,
  "TLG Link anchors must include both Truth and Virtual Set candidates");
assert.match(app, /linkHasAnchorEndpoint[\s\S]*tlgCandidateIsCurrentLinkAnchor/,
  "dual-endpoint Link input must reject pairs with no structure-anchor endpoint");
assert.match(app, /tlgLinkDescriptorHasCurrentAnchorMember/,
  "right-click Link insertion must reject descriptors disconnected from Truths and Virtual Sets");
console.log("test-first-hit-rating-tlg: ok");
