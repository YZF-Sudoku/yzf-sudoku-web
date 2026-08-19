/*
 * YZF Sudoku 工作现场持久化（UI 副线）。
 *
 * 本模块只保存“可恢复的用户现场”：近期盘面快照与 OCR 校正草稿。
 * 它不参与求解，不解释盘面，也不直接操作 DOM；业务层负责验证并导入数据。
 */

const RECENT_PUZZLES_KEY = "yzf_ui_recent_puzzles_v1";
const OCR_DRAFT_FALLBACK_KEY = "yzf_ui_ocr_draft_fallback_v1";
const DATABASE_NAME = "yzf-ui-workspace-v1";
const DATABASE_VERSION = 1;
const STORE_NAME = "drafts";
const OCR_DRAFT_ID = "ocr-correction";
const MAX_RECENT_PUZZLES = 12;

function safeJsonParse(text, fallback) {
  try {
    const value = JSON.parse(String(text || ""));
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

function normalizeRecentRecord(record) {
  if (!record || typeof record !== "object") return null;
  const libraryString = String(record.libraryString || "").trim();
  if (!libraryString) return null;
  const savedAt = Number(record.savedAt || Date.now());
  const identitySource = String(record.identity || record.id || libraryString);
  return {
    version: 1,
    id: String(record.id || hashWorkspaceText(identitySource)),
    identity: identitySource,
    savedAt: Number.isFinite(savedAt) ? savedAt : Date.now(),
    libraryString,
    language: record.language === "en" ? "en" : "zh",
    filled: Math.max(0, Math.min(81, Number(record.filled || 0))),
    clues: Math.max(0, Math.min(81, Number(record.clues || 0))),
    candidateCells: Math.max(0, Math.min(81, Number(record.candidateCells || 0))),
    source: String(record.source || "session"),
    manualMarks: record.manualMarks && typeof record.manualMarks === "object" ? record.manualMarks : null,
    manualMarkCount: Math.max(0, Number(record.manualMarkCount || 0)),
    solveTimer: record.solveTimer && typeof record.solveTimer === "object" ? {
      version: 1,
      state: ["idle", "running", "paused", "finished"].includes(record.solveTimer.state) ? record.solveTimer.state : "idle",
      elapsedMs: Math.max(0, Number(record.solveTimer.elapsedMs || 0)),
    } : null,
    previewValues: Array.isArray(record.previewValues) && record.previewValues.length === 81
      ? record.previewValues.map((value) => {
        const digit = Number(value || 0);
        return Number.isInteger(digit) && digit >= 1 && digit <= 9 ? digit : 0;
      })
      : [],
    previewGivens: Array.isArray(record.previewGivens) && record.previewGivens.length === 81
      ? record.previewGivens.map(Boolean)
      : [],
  };
}

export function hashWorkspaceText(text) {
  // 32-bit FNV-1a 足以用于本地列表去重；它不是安全哈希，也不用于校验文件。
  let hash = 0x811c9dc5;
  const value = String(text || "");
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `w${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function loadRecentPuzzleRecords() {
  try {
    const parsed = safeJsonParse(localStorage.getItem(RECENT_PUZZLES_KEY), []);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeRecentRecord)
      .filter(Boolean)
      .sort((a, b) => b.savedAt - a.savedAt)
      .slice(0, MAX_RECENT_PUZZLES);
  } catch {
    return [];
  }
}

export function upsertRecentPuzzleRecord(record) {
  const normalized = normalizeRecentRecord(record);
  if (!normalized) return [];
  const records = loadRecentPuzzleRecords();
  const next = [normalized, ...records.filter((item) => item.id !== normalized.id)]
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, MAX_RECENT_PUZZLES);
  try {
    localStorage.setItem(RECENT_PUZZLES_KEY, JSON.stringify(next));
  } catch {
    // 存储配额不足时，保留当前运行现场；近期列表只是辅助能力，不能阻断主保存流程。
  }
  window.dispatchEvent(new CustomEvent("yzf-workspacechange", { detail: { kind: "recent" } }));
  return next;
}

export function removeRecentPuzzleRecord(id) {
  const target = String(id || "");
  const next = loadRecentPuzzleRecords().filter((item) => item.id !== target);
  try { localStorage.setItem(RECENT_PUZZLES_KEY, JSON.stringify(next)); } catch {}
  window.dispatchEvent(new CustomEvent("yzf-workspacechange", { detail: { kind: "recent" } }));
  return next;
}

export function clearRecentPuzzleRecords() {
  try { localStorage.removeItem(RECENT_PUZZLES_KEY); } catch {}
  window.dispatchEvent(new CustomEvent("yzf-workspacechange", { detail: { kind: "recent" } }));
}

function openWorkspaceDatabase() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("indexeddb-unavailable"));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("indexeddb-open-failed"));
  });
}

async function withDraftStore(mode, callback) {
  const database = await openWorkspaceDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      let result;
      try {
        result = callback(store);
      } catch (error) {
        reject(error);
        return;
      }
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error || new Error("indexeddb-transaction-failed"));
      transaction.onabort = () => reject(transaction.error || new Error("indexeddb-transaction-aborted"));
    });
  } finally {
    database.close();
  }
}

function normalizeOcrDraft(draft) {
  if (!draft || typeof draft !== "object") return null;
  if (!Array.isArray(draft.cells) || draft.cells.length !== 81) return null;
  return {
    id: OCR_DRAFT_ID,
    version: 1,
    savedAt: Number(draft.savedAt || Date.now()),
    cells: draft.cells,
    originalCells: Array.isArray(draft.originalCells) && draft.originalCells.length === 81
      ? draft.originalCells
      : draft.cells,
    previewUrl: String(draft.previewUrl || ""),
    selectedIndex: Math.max(0, Math.min(80, Number(draft.selectedIndex || 0))),
    mode: ["given", "solved", "candidate"].includes(draft.mode) ? draft.mode : "given",
  };
}

export async function saveOcrCorrectionDraft(draft) {
  const normalized = normalizeOcrDraft({ ...draft, savedAt: Date.now() });
  if (!normalized) return false;
  try {
    await withDraftStore("readwrite", (store) => store.put(normalized));
    try { localStorage.removeItem(OCR_DRAFT_FALLBACK_KEY); } catch {}
  } catch {
    // IndexedDB 被隐私模式或浏览器策略禁用时，退化为不含预览图的轻量草稿。
    const fallback = { ...normalized, previewUrl: "" };
    try {
      localStorage.setItem(OCR_DRAFT_FALLBACK_KEY, JSON.stringify(fallback));
    } catch {
      return false;
    }
  }
  window.dispatchEvent(new CustomEvent("yzf-workspacechange", { detail: { kind: "ocr-draft" } }));
  return true;
}

export async function loadOcrCorrectionDraft() {
  try {
    let value = null;
    await withDraftStore("readonly", (store) => {
      const request = store.get(OCR_DRAFT_ID);
      request.onsuccess = () => { value = request.result || null; };
    });
    const normalized = normalizeOcrDraft(value);
    if (normalized) return normalized;
  } catch {
    // 继续尝试 localStorage 轻量回退。
  }
  try {
    return normalizeOcrDraft(safeJsonParse(localStorage.getItem(OCR_DRAFT_FALLBACK_KEY), null));
  } catch {
    return null;
  }
}

export async function clearOcrCorrectionDraft() {
  try { await withDraftStore("readwrite", (store) => store.delete(OCR_DRAFT_ID)); } catch {}
  try { localStorage.removeItem(OCR_DRAFT_FALLBACK_KEY); } catch {}
  window.dispatchEvent(new CustomEvent("yzf-workspacechange", { detail: { kind: "ocr-draft" } }));
}
