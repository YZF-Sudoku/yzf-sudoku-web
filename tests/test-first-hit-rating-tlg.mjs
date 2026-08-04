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

console.log("test-first-hit-rating-tlg: ok");
