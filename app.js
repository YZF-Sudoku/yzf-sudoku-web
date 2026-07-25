import createModule from "./sudoku_wasm.js?v=wasm-a33fe8b22cb55aa9";
import {
  categoryNameForLocale,
  localizedStepDescription,
  techniqueIdentityForStep,
  techniqueNameForStep,
} from "./step-localization.js?v=20260710-step-i18n-v5-title-proof";
import {
  TECHNIQUE_TUTORIAL_CARDS,
  TECHNIQUE_TUTORIAL_FIELDS,
} from "./technique-tutorial-data.js?v=20260713-dynamic-tutorial-v8";
import {
  buildAuditedStepExplanationPayload,
  buildAuditedTechniqueGuide,
} from "./step-explanation.js?v=20260713-dynamic-tutorial-audit-v8";
import {
  appStatusDescriptor,
  difficultyDescriptor,
  difficultyLevels,
} from "./ui-localization.js?v=ui-d5a841241e91";
import { createTlgDiagramRenderer } from "./tlg-diagram-renderer.js?v=tlg-4c2e94ce3029";

const APP_VERSION = "wasm-a33fe8b22cb55aa9";
const MANUAL_VERSION = "manual-5275ef564eeb";
const MOBILE_SOLVE_PREFERENCES_KEY = "yzf-mobile-solve-preferences-v1";
const MOBILE_NEW_PUZZLE_DIFFICULTY_KEY = "yzf-mobile-new-puzzle-difficulty-v1";
const TRAINING_TEXT_FILTER_STORAGE_KEY = "yzf-training-text-filter-v1";
const TRAINING_OTP_STORAGE_KEY = "yzf-training-otp-v1";
const OCR_ASSET_VERSION = "20260630-role-glyph-core-v8";
const OCR_CORRECTION_UI_VERSION = "20260629-ocr-correction-v7.1-gridfix";
const OTP_INELIGIBLE_TECHNIQUES = new Set([
  "FullHouse", "HiddenSingle", "NakedSingle", "LockedCandidates",
  "NakedPair", "HiddenPair", "NakedTriple", "HiddenTriple",
  "NakedQuad", "HiddenQuad", "BruteForce",
]);

const COACH_BASE32_CHARS = "0123456789abcdefghijklmnopqrstuv";
const COACH_BASE32_REVERSE = new Map([...COACH_BASE32_CHARS].map((ch, index) => [ch, index]));

const tree = document.getElementById("tree");
const allStepsTree = document.getElementById("allStepsTree");
const allStepsFilterText = document.getElementById("allStepsFilterText");
const allStepsFilterTechnique = document.getElementById("allStepsFilterTechnique");
const allStepsSortMode = document.getElementById("allStepsSortMode");
const allStepsFilterReplaceable = document.getElementById("allStepsFilterReplaceable");
const allStepsFilterClear = document.getElementById("allStepsFilterClear");
const allStepsFilterStatus = document.getElementById("allStepsFilterStatus");
const branchPanel = document.getElementById("branchPanel");
const board = document.getElementById("board");
const boardStage = document.getElementById("boardStage");
const boardMeta = document.getElementById("boardMeta");
const hintPanel = document.getElementById("hintPanel");
const stepExplainPanel = document.getElementById("stepExplainPanel");
const btnStepExplain = document.getElementById("btnStepExplain");
const stepExplainDialog = document.getElementById("stepExplainDialog");
const stepExplainDialogContent = document.getElementById("stepExplainDialogContent");
const stepExplainDialogClose = document.getElementById("stepExplainDialogClose");
const yzfUnderlay = document.getElementById("yzfUnderlay");
const yzfOverlay = document.getElementById("yzfOverlay");
const yzfDebugSampleSelect = document.getElementById("yzfDebugSampleSelect");
const btnYzfDebugLoad = document.getElementById("btnYzfDebugLoad");
const btnYzfDebugClear = document.getElementById("btnYzfDebugClear");
const yzfOverlayStatus = document.getElementById("yzfOverlayStatus");
const yzfOverlayModeNote = document.getElementById("yzfOverlayModeNote");
const tlgSolverPanel = document.getElementById("tlgSolverPanel");
const tlgSolverEnable = document.getElementById("tlgSolverEnable");
const tlgSolverMode = document.getElementById("tlgSolverMode");
const tlgSolverAurGroupWrap = document.getElementById("tlgSolverAurGroupWrap");
const tlgSolverAurGroup = document.getElementById("tlgSolverAurGroup");
const tlgSolverVirtualGroupWrap = document.getElementById("tlgSolverVirtualGroupWrap");
const tlgSolverVirtualGroup = document.getElementById("tlgSolverVirtualGroup");
const tlgSolverLinkType = document.getElementById("tlgSolverLinkType");
const tlgSolverTruthsToApplyWrap = document.getElementById("tlgSolverTruthsToApplyWrap");
const tlgSolverTruthsToApply = document.getElementById("tlgSolverTruthsToApply");
const tlgSolverAurPremiseMode = document.getElementById("tlgSolverAurPremiseMode");
const btnTlgImportCandidates = document.getElementById("btnTlgImportCandidates");
const btnTlgFindEliminations = document.getElementById("btnTlgFindEliminations");
const btnTlgConvertTruths = document.getElementById("btnTlgConvertTruths");
const btnTlgRemoveUnused = document.getElementById("btnTlgRemoveUnused");
const btnTlgClear = document.getElementById("btnTlgClear");
const btnTlgLibrary = document.getElementById("btnTlgLibrary");
const tlgLibraryDialog = document.getElementById("tlgLibraryDialog");
const btnTlgLibraryClose = document.getElementById("btnTlgLibraryClose");
const btnTlgLibraryRead = document.getElementById("btnTlgLibraryRead");
const btnTlgLibraryInsert = document.getElementById("btnTlgLibraryInsert");
const btnTlgLibraryReplace = document.getElementById("btnTlgLibraryReplace");
const btnTlgLibraryAppend = document.getElementById("btnTlgLibraryAppend");
const btnTlgLibraryDelete = document.getElementById("btnTlgLibraryDelete");
const tlgLibraryImportMode = document.getElementById("tlgLibraryImportMode");
const btnTlgLibraryImport = document.getElementById("btnTlgLibraryImport");
const btnTlgLibraryExportSelected = document.getElementById("btnTlgLibraryExportSelected");
const btnTlgLibraryExportAll = document.getElementById("btnTlgLibraryExportAll");
const btnTlgLibraryCopyText = document.getElementById("btnTlgLibraryCopyText");
const btnTlgLibraryCopyCompact = document.getElementById("btnTlgLibraryCopyCompact");
const btnTlgLibraryPasteText = document.getElementById("btnTlgLibraryPasteText");
const btnTlgLibraryImportText = document.getElementById("btnTlgLibraryImportText");
const btnTlgLibraryExportText = document.getElementById("btnTlgLibraryExportText");
const btnTlgLibraryLoadText = document.getElementById("btnTlgLibraryLoadText");
const btnTlgLibraryClearText = document.getElementById("btnTlgLibraryClearText");
const btnTlgLibraryCloseText = document.getElementById("btnTlgLibraryCloseText");
const tlgLibraryFileInput = document.getElementById("tlgLibraryFileInput");
const tlgLibraryTextFileInput = document.getElementById("tlgLibraryTextFileInput");
const tlgLibrarySharePanel = document.getElementById("tlgLibrarySharePanel");
const tlgLibraryShareText = document.getElementById("tlgLibraryShareText");
const tlgLibraryShareSummary = document.getElementById("tlgLibraryShareSummary");
const tlgLibrarySearch = document.getElementById("tlgLibrarySearch");
const tlgLibraryCount = document.getElementById("tlgLibraryCount");
const tlgLibraryList = document.getElementById("tlgLibraryList");
const tlgLibraryEmpty = document.getElementById("tlgLibraryEmpty");
const tlgLibraryTitle = document.getElementById("tlgLibraryTitle");
const tlgLibraryTags = document.getElementById("tlgLibraryTags");
const tlgLibrarySource = document.getElementById("tlgLibrarySource");
const tlgLibraryNotes = document.getElementById("tlgLibraryNotes");
const tlgLibraryRecordSummary = document.getElementById("tlgLibraryRecordSummary");
const tlgLibraryStatus = document.getElementById("tlgLibraryStatus");
const tlgSolverStatus = document.getElementById("tlgSolverStatus");
const tlgSolverStateList = document.getElementById("tlgSolverStateList");
const tlgSolverImportText = document.getElementById("tlgSolverImportText");
const tlgSolverRaw = document.getElementById("tlgSolverRaw");
const tlgSolverDebug = document.getElementById("tlgSolverDebug");
const tlgSolverSolution = document.getElementById("tlgSolverSolution");
const tlgSolverSolutionPanel = document.getElementById("tlgSolverSolutionPanel");
const btnGenerate = document.getElementById("btnGenerate");
const btnGenerateTraining = document.getElementById("btnGenerateTraining");
const btnBatchGenerate = document.getElementById("btnBatchGenerate");
const btnBatchStop = document.getElementById("btnBatchStop");
const btnLoad = document.getElementById("btnLoad");
const btnImageOcrClipboard = document.getElementById("btnImageOcrClipboard");
const preferClipboardLoad = document.getElementById("preferClipboardLoad");
const btnClearSavedSession = document.getElementById("btnClearSavedSession");
const imageOcrInput = document.getElementById("imageOcrInput");
const imageOcrCameraInput = document.getElementById("imageOcrCameraInput");

let localSudokuOcrModulePromise = null;
let ortScriptPromise = null;
let localSudokuOcrLoadAttempt = 0;
const APP_SESSION_STORAGE_KEY = "yzf_sudoku_session_v1";
const SHARED_PUZZLE_QUERY_PARAM = "p";
const LEGACY_SHARED_PUZZLE_QUERY_PARAM = "puzzle";
const SHARED_PUZZLE_S1_PREFIX = "s1.";
const SHARED_PUZZLE_S1_DATA_BYTES = 102;
const SHARED_PUZZLE_S1_TOTAL_BYTES = 106;
const SHARED_PUZZLE_S1_TEXT_LENGTH = 145;
const EXPORT_FORMAT_STORAGE_KEY = "yzf_sudoku_export_format_v1";
let appSessionSaveTimer = 0;
let appSessionRestoring = false;
let appSaveStatus = { state: "saved", values: {} };
let pwaStatus = { state: "initializing", values: {} };
let pwaRegistration = null;
let pwaInstallPrompt = null;
let pwaCacheReady = false;
let pwaReloadRequested = false;
let pwaLastFailure = null;
const PWA_APPLY_PENDING_STORAGE_KEY = "yzf-pwa-apply-pending-v1";
let pwaPendingVersion = (() => {
  try { return sessionStorage.getItem(PWA_APPLY_PENDING_STORAGE_KEY) || ""; } catch { return ""; }
})();
let pwaActivationRequested = !!pwaPendingVersion;
let pwaTargetVersion = pwaPendingVersion && pwaPendingVersion !== "1" ? pwaPendingVersion : "";
let pwaActivationTimer = 0;
let pwaWaitingSyncTimer = 0;
let pwaObservedInstallingWorker = null;
let pwaObservedActivationWorker = null;
let pwaActivationCommandWorker = null;
let pwaActivationPort = null;
let pwaActivationReloadScheduled = false;
let transientStatus = { state: "", values: {} };
let transientStatusTimer = 0;
let appBackGuardInstalled = false;
let appBackPopHandling = false;


function loadScriptOnce(src) {
  const existing = document.querySelector(`script[data-yzf-src="${src}"]`);
  if (existing) {
    if (existing.dataset.failed === "1") {
      existing.remove();
    } else if (existing.dataset.loaded === "1") {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error(uif("scriptLoadFailed", { src }))), { once: true });
      });
    }
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.yzfSrc = src;
    script.addEventListener("load", () => {
      script.dataset.loaded = "1";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => {
      script.dataset.failed = "1";
      script.remove();
      reject(new Error(uif("scriptLoadFailed", { src })));
    }, { once: true });
    document.head.appendChild(script);
  });
}

async function loadLocalSudokuOcrModule() {
  if (localSudokuOcrModulePromise) return localSudokuOcrModulePromise;

  const attempt = ++localSudokuOcrLoadAttempt;
  const loadPromise = (async () => {
    if (globalThis.YZF_STANDALONE) {
      if (typeof recognizeSudokuImageToCoachJson !== "function") {
        throw new Error("Standalone OCR bundle incomplete: local OCR module was not inlined");
      }
      return {
        recognizeSudokuImageToCoachJson,
        localSudokuOcrAttribution: typeof localSudokuOcrAttribution === "function" ? localSudokuOcrAttribution : null,
      };
    }

    if (!globalThis.ort) {
      if (!ortScriptPromise) {
        const ortScriptUrl = new URL(
          `./ocr/ort/ort.min.js?v=${encodeURIComponent(OCR_ASSET_VERSION)}`,
          import.meta.url,
        ).href;
        ortScriptPromise = loadScriptOnce(ortScriptUrl);
      }
      try {
        await ortScriptPromise;
      } catch (error) {
        ortScriptPromise = null;
        throw error;
      }
    }

    // A failed dynamic import is cached by its exact URL in browsers.
    // The attempt suffix allows a real retry without reloading the whole page.
    const moduleUrl = new URL(
      `./ocr/local-sudoku-ocr.js?v=${encodeURIComponent(OCR_ASSET_VERSION)}&attempt=${attempt}`,
      import.meta.url,
    ).href;
    return import(moduleUrl);
  })();

  localSudokuOcrModulePromise = loadPromise;
  try {
    return await loadPromise;
  } catch (error) {
    if (localSudokuOcrModulePromise === loadPromise) localSudokuOcrModulePromise = null;
    throw error;
  }
}


function isLocalSudokuOcrRuntimeLoadError(error) {
  const message = String(error?.message || error || "");
  return /(?:ONNX Runtime|OCR session initialization failed|no available backend|Failed to fetch|dynamically imported module|WebAssembly backend)/i.test(message);
}

async function resetLocalSudokuOcrLoaderAfterFailure() {
  if (globalThis.YZF_STANDALONE) return;
  try {
    const mod = await localSudokuOcrModulePromise;
    if (typeof mod?.resetLocalSudokuOcrRuntime === "function") {
      mod.resetLocalSudokuOcrRuntime();
    }
  } catch {}

  localSudokuOcrModulePromise = null;
  ortScriptPromise = null;
  document.querySelectorAll('script[data-yzf-src*="/ocr/ort/ort.min.js"]').forEach((script) => script.remove());
  try {
    delete globalThis.ort;
  } catch {
    globalThis.ort = undefined;
  }
}

async function localSudokuOcrAttributionSafe() {
  try {
    const mod = await loadLocalSudokuOcrModule();
    return typeof mod.localSudokuOcrAttribution === "function" ? mod.localSudokuOcrAttribution() : null;
  } catch {
    return null;
  }
}
const btnExportPuzzle = document.getElementById("btnExportPuzzle");
const btnSharePuzzle = document.getElementById("btnSharePuzzle");
const exportFormatSelect = document.getElementById("exportFormatSelect");
const btnRate = document.getElementById("btnRate");
const btnStep = document.getElementById("btnStep");
const btnApply = document.getElementById("btnApply");
const btnAllSteps = document.getElementById("btnAllSteps");
const btnUndo = document.getElementById("btnUndo");
const btnRedo = document.getElementById("btnRedo");
const btnSolve = document.getElementById("btnSolve");
const lang = document.getElementById("lang");
const givens = document.getElementById("givens");
const numpad = document.getElementById("numpad");
const manualMarksPanel = document.getElementById("manualMarksPanel");
const manualMarkMode = document.getElementById("manualMarkMode");
const manualMarkLineType = document.getElementById("manualMarkLineType");
const manualMarkPrimary = document.getElementById("manualMarkPrimary");
const manualMarkSecondary = document.getElementById("manualMarkSecondary");
const manualMarkSwatches = document.getElementById("manualMarkSwatches");
const manualMarkCustomColor = document.getElementById("manualMarkCustomColor");
const manualMarkAddColor = document.getElementById("manualMarkAddColor");
const manualMarkApplyElims = document.getElementById("manualMarkApplyElims");
const manualMarkScreenshot = document.getElementById("manualMarkScreenshot");
const manualMarkCleanEasy = document.getElementById("manualMarkCleanEasy");
const manualMarkClear = document.getElementById("manualMarkClear");
const manualMarkUndoLine = document.getElementById("manualMarkUndoLine");
const manualMarkCancelChain = document.getElementById("manualMarkCancelChain");
const manualMarkFinishBlock = document.getElementById("manualMarkFinishBlock");
const manualMarkUndoBlock = document.getElementById("manualMarkUndoBlock");
const manualMarkStatus = document.getElementById("manualMarkStatus");
const difficultySelect = document.getElementById("difficultySelect");
const batchMode = document.getElementById("batchMode");
const batchFilename = document.getElementById("batchFilename");
const batchPanel = batchFilename?.closest("details") || null;
const batchSolveFile = document.getElementById("batchSolveFile");
const batchStatus = document.getElementById("batchStatus");
const trainingTechniqueSelect = document.getElementById("trainingTechniqueSelect");
const trainingOtp = document.getElementById("trainingOtp");
const trainingOtpOption = document.getElementById("trainingOtpOption");
const btnTrainingTextFilter = document.getElementById("btnTrainingTextFilter");
const trainingTextFilterDialog = document.getElementById("trainingTextFilterDialog");
const trainingTextFilterInclude = document.getElementById("trainingTextFilterInclude");
const trainingTextFilterExclude = document.getElementById("trainingTextFilterExclude");
const trainingTextFilterCaseSensitive = document.getElementById("trainingTextFilterCaseSensitive");
const btnTrainingTextFilterClose = document.getElementById("btnTrainingTextFilterClose");
const btnTrainingTextFilterClear = document.getElementById("btnTrainingTextFilterClear");
const btnTrainingTextFilterApply = document.getElementById("btnTrainingTextFilterApply");
const techniqueList = document.getElementById("techniqueList");
const btnTechAllIn = document.getElementById("btnTechAllIn");
const btnTechHighSpeed = document.getElementById("btnTechHighSpeed");
const btnTechExtremeSpeed = document.getElementById("btnTechExtremeSpeed");
const btnTechWhipRating = document.getElementById("btnTechWhipRating");
const btnTechBraidRating = document.getElementById("btnTechBraidRating");
const tabButtons = [...document.querySelectorAll(".tab-button")];
const tabPanels = [...document.querySelectorAll("[data-tab-panel]")];
const btnFullscreen = document.getElementById("btnFullscreen");
const btnMobileSolveMode = document.getElementById("btnMobileSolveMode");
const mobileSolveShell = document.getElementById("mobileSolveShell");
const mobileSolveBoardHost = document.getElementById("mobileSolveBoardHost");
const mobileSolveNumpadHost = document.getElementById("mobileSolveNumpadHost");
const mobileSolveMarksHost = document.getElementById("mobileSolveMarksHost");
const mobileSolveMarksDrawerHost = document.getElementById("mobileSolveMarksDrawerHost");
const mobileSolveStatus = document.getElementById("mobileSolveStatus");
const mobileSolveInputState = document.getElementById("mobileSolveInputState");
const mobileSolveDrawer = document.getElementById("mobileSolveDrawer");
const mobileSolveBackdrop = document.getElementById("mobileSolveBackdrop");
const mobileSolveLang = document.getElementById("mobileSolveLang");
const mobileSolveWakeLockToggle = document.getElementById("mobileSolveWakeLockToggle");
const mobileSolveWakeLockStatus = document.getElementById("mobileSolveWakeLockStatus");
const btnMobileSolveExit = document.getElementById("btnMobileSolveExit");
const btnMobileSolveNewPuzzle = document.getElementById("btnMobileSolveNewPuzzle");
const btnMobileSolveFullscreen = document.getElementById("btnMobileSolveFullscreen");
const mobileSolveNewPuzzleBackdrop = document.getElementById("mobileSolveNewPuzzleBackdrop");
const mobileSolveNewPuzzlePanel = document.getElementById("mobileSolveNewPuzzlePanel");
const mobileSolveNewPuzzleOptions = document.getElementById("mobileSolveNewPuzzleOptions");
const mobileSolveNewPuzzleWarning = document.getElementById("mobileSolveNewPuzzleWarning");
const btnMobileSolveNewPuzzleClose = document.getElementById("btnMobileSolveNewPuzzleClose");
const btnMobileSolveNewPuzzleCancel = document.getElementById("btnMobileSolveNewPuzzleCancel");
const btnMobileSolveNewPuzzleGenerate = document.getElementById("btnMobileSolveNewPuzzleGenerate");
const btnMobileSolveInputMode = document.getElementById("btnMobileSolveInputMode");
const btnMobileSolveClear = document.getElementById("btnMobileSolveClear");
const btnMobileSolveUndo = document.getElementById("btnMobileSolveUndo");
const btnMobileSolveRedo = document.getElementById("btnMobileSolveRedo");
const btnMobileSolveMarks = document.getElementById("btnMobileSolveMarks");
const btnMobileSolveMore = document.getElementById("btnMobileSolveMore");
const btnMobileSolveDrawerClose = document.getElementById("btnMobileSolveDrawerClose");
const btnMobileSolveHint = document.getElementById("btnMobileSolveHint");
const btnMobileSolveApply = document.getElementById("btnMobileSolveApply");
const btnMobileSolveAllSteps = document.getElementById("btnMobileSolveAllSteps");
const btnMobileSolveInput = document.getElementById("btnMobileSolveInput");
const btnMobileSolveCandidates = document.getElementById("btnMobileSolveCandidates");
const btnMobileSolveSameDigit = document.getElementById("btnMobileSolveSameDigit");
const btnMobileSolveAnalysis = document.getElementById("btnMobileSolveAnalysis");
const appStatusControls = [...document.querySelectorAll("[data-app-status-kind]")];
const appStatusToast = document.getElementById("appStatusToast");
const mobileBackDepthBadge = document.getElementById("mobileBackDepthBadge");

let engine = null;
let trainingTextFilter = { includeText: "", excludeText: "", caseSensitive: false };
let solverWorker = null;
let solverTaskSeq = 0;
const solverWorkerRequests = new Map();
let solverBusyTask = "";
let ratingWorker = null;
let ratingTaskSeq = 0;
let ratingTask = null;
let batchWorker = null;
let batchTaskSeq = 0;
let batchWorkerActiveReject = null;
let lastSolveData = null;
let lastAllStepsData = null;
const ALL_STEPS_STTE_FILTER_KEY = "__stte__";
let allStepsFilterState = { query: "", technique: "", sortMode: "default", replaceableOnly: false };
let branchUndoData = null;
let originalBoard = "";
let currentHint = null;
let currentStepExplainContext = null;
let currentSnapshot = null;
let previewSnapshotActive = false;
let currentPreviewRecord = null;
let selectedIndex = -1;
let selectedDigit = 1;
let inputMode = "value";
let boardPointerMode = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ? "mouse" : "touch";
let mobileSolveActive = false;
let mobileSolveDrawerOpen = false;
let mobileSolveLayoutRaf = 0;
let mobileSolveScrollY = 0;
let mobileSolveBoardHomeMarker = null;
let mobileSolveNumpadHomeMarker = null;
let mobileSolveManualMarksHomeMarker = null;
let mobileSolveManualMarksWasOpen = false;
let mobileSolveMarksOpen = false;
let mobileSolveMarksPlacement = "";
let mobileSolveCandidatesVisible = true;
let mobileSolveSameDigitHighlight = true;
let mobileSolveKeepScreenAwake = true;
let mobileSolveScreenWakeLock = null;
let mobileSolveWakeLockRequest = null;
let mobileSolveWakeLockGeneration = 0;
let mobileSolveWakeLockUnexpectedRelease = false;
let mobileSolveWakeLockFailed = false;
let mobileSolveNewPuzzleOpen = false;
let mobileSolvePuzzleBaselineSignature = "";
let ocrCorrectionState = null;
let ocrCorrectionRoot = null;
let ocrCorrectionSelectedIndex = 0;
let ocrCorrectionMode = "given";
let ocrCorrectionHistory = [];
let ocrCorrectionHistoryIndex = -1;
let techniqueState = [];
let whipMemoryMode = "auto";
let whipCompareGWhip = false;
let batchAbortRequested = false;
let yzfDebugSampleData = null;
let yzfDebugControlsInitialized = false;
let yzfSelectedBranchMode = "all";
let yzfBranchContext = {
  active: false,
  branches: [],
  branchTexts: [],
  summaryText: "",
  contextKey: "",
};

function normalizeBoardPointerMode(pointerType = "") {
  return String(pointerType || "").toLowerCase() === "mouse" ? "mouse" : "touch";
}

function setBoardPointerMode(pointerType = "") {
  const next = normalizeBoardPointerMode(pointerType);
  if (boardPointerMode === next && document.body.classList.contains(`board-pointer-${next}`)) return next;
  boardPointerMode = next;
  document.body.classList.toggle("board-pointer-mouse", next === "mouse");
  document.body.classList.toggle("board-pointer-touch", next !== "mouse");
  return next;
}

function boardEventUsesMouse(event, fallbackNode = null) {
  const pointerType = event?.pointerType || fallbackNode?.dataset?.boardPointerType || "";
  return normalizeBoardPointerMode(pointerType || boardPointerMode) === "mouse";
}

setBoardPointerMode(boardPointerMode);
let yzfHintBaseText = "";

const APP_URL_PARAMS = new URLSearchParams(window.location.search);
const APP_DEBUG_MODE = APP_URL_PARAMS.get("dev") === "1" || APP_URL_PARAMS.get("debug") === "1";

const tlgDiagramRenderer = createTlgDiagramRenderer({
  boardStage,
  board,
  overlay: yzfOverlay,
  underlay: yzfUnderlay,
  getCandidateCenter,
  getCellRectLogical,
  candidateKey: tlgSolverCandidateKey,
  boxIndex: tlgSolverBoxIndex,
  canonicalDescriptor: tlgCanonicalDescriptor,
  normalizeResponseCandidate: normalizeTlgResponseCandidate,
});

const SVG_NS = "http://www.w3.org/2000/svg";
const YZF_DEBUG_SAMPLE_PATHS = new Map([
  ["yzf_typ4_grouped_with_candidates", "./debug_samples/yzf_typ4_grouped_with_candidates.json"],
  ["yzf_typ4_grouped_no_candidates", "./debug_samples/yzf_typ4_grouped_no_candidates.json"],
  ["yzf_typ4_no_debug_path", "./debug_samples/yzf_typ4_no_debug_path.json"],
  ["yzf_typ4_promoted_grouped_aic_stepresult", "./debug_samples/yzf_typ4_promoted_grouped_aic_stepresult.json"],
]);

const YZF_SAMPLE_PUZZLE_FALLBACKS = new Map([
  ["yzf_typ4_promoted_grouped_aic_stepresult",
    "53.67.91." +
    "67.19.34." +
    "19.34.56." +
    "85.76.42." +
    "42.85.79." +
    "71.92.85." +
    "96.53.28." +
    "28.41.63." +
    "34.28.17."],
]);

const REF_TECHNIQUES = [
  ["FullHouse", "Full House", "Basic", 1, 4],
  ["HiddenSingle", "Hidden Single", "Basic", 1, 8],
  ["NakedSingle", "Naked Single", "Basic", 1, 14],
  ["LockedCandidates", "Locked Candidates", "Basic", 2, 50],
  ["GSP", "GSP", "Subsets", 2, 55],
  ["NakedPair", "Naked Pair", "Subsets", 2, 60],
  ["NakedTriple", "Naked Triple", "Subsets", 2, 80],
  ["HiddenPair", "Hidden Pair", "Subsets", 2, 70],
  ["HiddenTriple", "Hidden Triple", "Subsets", 2, 100],
  ["NakedQuad", "Naked Quad", "Subsets", 2, 120],
  ["HiddenQuad", "Hidden Quad", "Subsets", 2, 150],
  ["XWing", "X-Wing", "Fish", 3, 140],
  ["Swordfish", "Swordfish", "Fish", 3, 150],
  ["Jellyfish", "Jellyfish", "Fish", 3, 160],
  ["AlmostPair", "Almost Pair", "ALS", 3, 140],
  ["AlmostTriple", "Almost Triple", "ALS", 3, 160],
  ["BUGOne", "BUGOne", "Single Digit", 3, 100],
  ["AvoidableRectangle", "AR", "Uniqueness", 3, 100],
  ["Skyscraper", "Skyscraper", "Single Digit", 3, 130],
  ["TwoStringKite", "Two String Kite", "Single Digit", 3, 150],
  ["EmptyRectangle", "ER", "Single Digit", 3, 120],
  ["ERIPair", "ERI Pair", "Single Digit", 3, 130],
  ["WWing", "W-Wing", "Wings", 3, 150],
  ["XYWing", "XY-Wing", "Wings", 3, 160],
  ["XYZWing", "XYZ-Wing", "Wings", 3, 180],
  ["XYZRing", "XYZ-Ring", "Wings", 3, 190],
  ["BUGPlusN", "BUG + n", "Uniqueness", 3, 190],
  ["BivalueOddagon", "Bivalue Oddagon", "Negative Rank", 3, 190],
  ["WXYZWing", "WXYZ-Wing", "Wings", 3, 200],
  ["UniqueRectangle", "UR", "Uniqueness", 3, 150],
  ["UniqueLoop", "UL", "Uniqueness", 3, 200],
  ["ExtendedRectangle", "Extended Rectangle", "Uniqueness", 3, 200],
  ["FinnedXWing", "Finned X-Wing", "Fish", 3, 140],
  ["FinnedSwordfish", "Finned SwordFish", "Fish", 3, 220],
  ["FinnedJellyfish", "Finned JellyFish", "Fish", 3, 250],
  ["SueDeCoq", "Sue de Coq", "ALS", 3, 250],
  ["Fireworks", "Fireworks", "Single Digit", 3, 250],
  ["BrokenWing", "Broken Wing", "Guardian", 3, 250],
  ["XChain", "X-Chain", "Chains", 4, 260],
  ["XYChain", "XY-Chain", "Chains", 4, 260],
  ["AIC", "AIC", "Chains", 4, 280],
  ["GroupedAIC", "Grouped AIC", "Chains", 4, 290],
  ["ALSXZ", "ALS-XZ", "ALS", 4, 300],
  ["ALSXYWing", "ALS-XY-Wing", "ALS", 4, 320],
  ["ALSWWing", "ALS-W-Wing", "ALS", 4, 340],
  ["AHSXZ", "AHS-XZ", "AHS", 4, 300],
  ["AHSXYWing", "AHS-XY-Wing", "AHS", 4, 320],
  ["AHSWWing", "AHS-W-Wing", "AHS", 4, 340],
  ["ALSChain", "ALS Chain", "ALS", 4, 350],
  ["AHSChain", "AHS Chain", "AHS", 4, 350],
  ["DeathBlossom", "Death Blossom", "ALS", 4, 360],
  ["ComplexSwordfish", "Complex SwordFish", "Fish", 4, 350],
  ["ComplexJellyfish", "Complex JellyFish", "Fish", 4, 350],
  ["ComplexSquirmbagFish", "Complex SquirmbagFish", "Fish", 4, 370],
  ["BlossomLoop", "Blossom Loop", "Rank Logic", 5, 400],
  ["ComplexAIC", "Complex AIC", "Chains", 5, 400],
  ["CellRegionFC", "Cell/Region FC", "Chains", 5, 400],
  ["Whip", "Whip", "Chains", 5, 450],
  ["GWhip", "g-Whip", "Chains", 5, 475],
  ["DynamicChain", "Dynamic Chain", "Chains", 5, 500],
  ["Braid", "Braid", "Chains", 5, 500],
  ["GBraid", "g-Braid", "Chains", 5, 500],
  ["SKLoop", "SK Loop", "Rank Logic", 4, 500],
  ["MSLS", "MSLS", "Rank Logic", 4, 500],
  ["Multifish", "Multifish", "Fish", 4, 500],
  ["JE", "JE", "Exocet", 4, 500],
  ["SeniorExocet", "Senior Exocet", "Exocet", 4, 600],
  ["WeakExocet", "Weak Exocet", "Exocet", 4, 500],
  ["TripletOddagon", "Triplet Oddagon", "Negative Rank", 4, 500],
  ["BruteForce", "BruteForce", "Fallback", 5, 10000],
].map(([kind, title, category, difficulty, score], index) => ({
  kind,
  title,
  category,
  difficulty,
  score,
  colorLevel: null,
  order: index,
  enabled: false,
  implemented: false,
}));

const REF_TECHNIQUE_BKCLR = [
  5, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 4,
];
const REF_TECHNIQUE_BY_KIND = new Map(REF_TECHNIQUES.map((item, index) => [
  item.kind,
  {
    ...item,
    colorLevel: (REF_TECHNIQUE_BKCLR[index + 1] ?? 0) + 1,
  },
]));

const REF_TECHNIQUE_BY_TITLE = new Map();
for (const item of REF_TECHNIQUES) {
  REF_TECHNIQUE_BY_TITLE.set(item.title.toLowerCase(), item);
  REF_TECHNIQUE_BY_TITLE.set(item.kind.toLowerCase(), item);
}

function referenceTechniqueForStep(step = {}) {
  const chainType = String(step.chainType || "").trim();
  if (chainType) {
    const byChain = REF_TECHNIQUE_BY_TITLE.get(chainType.toLowerCase());
    if (byChain) return byChain;
  }
  const kind = String(step.kind || "").trim();
  if (kind && REF_TECHNIQUE_BY_KIND.has(kind)) return REF_TECHNIQUE_BY_KIND.get(kind);
  const title = String(step.title || "").trim();
  if (title) {
    const byTitle = REF_TECHNIQUE_BY_TITLE.get(title.toLowerCase());
    if (byTitle) return byTitle;
  }
  return null;
}

const i18n = {
  zh: {
    path: "解题路径",
    allSteps: "可选步骤",
    hintDesc: "提示",
    status: "状态",
    steps: "步数",
    board: "盘面",
    noAction: "没有可显示的出数或删数",
    inHouse: "在",
    onlyCell: "中只能放在",
    onlyEmpty: "只剩",
    remove: "删除",
    from: "从",
    technique: {
      FullHouse: "满宫唯一",
      HiddenSingle: "隐性唯一数",
      NakedSingle: "显性唯一数",
      LockedCandidates: "区块删减",
      NakedPair: "显性数对",
      NakedTriple: "显性三数组",
      NakedQuad: "显性四数组",
      HiddenPair: "隐性数对",
      HiddenTriple: "隐性三数组",
      HiddenQuad: "隐性四数组",
      XWing: "X-Wing",
      Swordfish: "剑鱼",
      Jellyfish: "水母",
      AlmostPair: "Almost Pair",
      AlmostTriple: "Almost Triple",
      BUGOne: "BUG+1",
      Skyscraper: "摩天楼",
      TwoStringKite: "双线风筝",
      EmptyRectangle: "空矩形",
      ERIPair: "ERI Pair",
      WWing: "W-Wing",
      XYWing: "XY-Wing",
      XYZWing: "XYZ-Wing",
      XYZRing: "XYZ-Ring",
      UniqueRectangle: "唯一矩形",
      WXYZWing: "WXYZ-Wing",
      BruteForce: "猜数",
    },
    category: {
      Basic: "基础",
      Subsets: "数组",
      Fish: "鱼",
      ALS: "ALS",
      AHS: "AHS",
      "Single Digit": "单数字",
      Wings: "Wing",
      Uniqueness: "唯一性",
      Oddagon: "Oddagon",
      "Negative Rank": "负秩",
      Chains: "链",
      "Rank Logic": "秩逻辑",
      Exocet: "Exocet",
      Fallback: "兜底",
    },
  },
  en: {
    path: "Solution Path",
    allSteps: "Available Steps",
    hintDesc: "Hint.Desc",
    status: "status",
    steps: "steps",
    board: "board",
    noAction: "No placement or elimination to display",
    inHouse: "in",
    onlyCell: "can only be in",
    onlyEmpty: "only empty cell is",
    remove: "remove",
    from: "from",
    technique: {
      FullHouse: "Full House",
      HiddenSingle: "Hidden Single",
      NakedSingle: "Naked Single",
      LockedCandidates: "Locked Candidates",
      NakedPair: "Naked Pair",
      NakedTriple: "Naked Triple",
      NakedQuad: "Naked Quad",
      HiddenPair: "Hidden Pair",
      HiddenTriple: "Hidden Triple",
      HiddenQuad: "Hidden Quad",
      XWing: "X-Wing",
      Swordfish: "Swordfish",
      Jellyfish: "Jellyfish",
      AlmostPair: "Almost Pair",
      AlmostTriple: "Almost Triple",
      BUGOne: "BUG+1",
      Skyscraper: "Skyscraper",
      TwoStringKite: "2-String Kite",
      EmptyRectangle: "Empty Rectangle",
      ERIPair: "ERI Pair",
      WWing: "W-Wing",
      XYWing: "XY-Wing",
      XYZWing: "XYZ-Wing",
      XYZRing: "XYZ-Ring",
      UniqueRectangle: "Unique Rectangle",
      WXYZWing: "WXYZ-Wing",
      BruteForce: "Brute Force",
    },
    category: {},
  },
};


const uiText = { zh: {}, en: {} };
for (const [key, zh, en] of [
  ["boardHeading", "盘面", "Board"],
  ["brandSubtitle", "移动优先逻辑训练器", "Mobile-first logic trainer"],
  ["manualLink", "使用手册", "Manual"],
  ["techniqueHelp", "技巧说明", "Techniques"],
  ["initialHint", "等待加载题面。", "Waiting for puzzle to load."],
  ["branch", "分支", "Branch"],
  ["allBranches", "全部分支", "All branches"],
  ["expandBranches", "展开分支选择", "Expand branch selector"],
  ["collapseBranches", "收起分支选择", "Collapse branch selector"],
  ["branchPickerLabel", "选择显示的分支", "Choose the branch to display"],
  ["branchShortcutHint", "快捷键：←/→ 或 [ / ] 顺序切换分支", "Shortcut: ←/→ or [ / ] cycles branches"],
  ["branchOverview", "全部分支", "All branches"],
  ["mainActionsLabel", "主要操作", "Main actions"],
  ["numberPadLabel", "数字键盘", "Number pad"],
  ["manualMarkActionLabel", "手工标记操作", "Manual mark actions"],
  ["manualMarkColorsLabel", "手工标记颜色", "Manual mark colors"],
  ["allStepsFilterAria", "可选步骤过滤", "Available steps filter"],
  ["filterByTechnique", "按技巧过滤", "Filter by technique"],
  ["allStepsSortAria", "可选步骤排序", "Available step sort"],
  ["controls", "操作", "Controls"],
  ["techniques", "技巧", "Techniques"],
  ["path", "解题路径", "Solution Path"],
  ["allSteps", "可选步骤", "Available Steps"],
  ["generate", "生成", "Generate"],
  ["generateTraining", "训练生成", "Training puzzle"],
  ["load", "加载", "Load"],
  ["undo", "撤销", "Undo"],
  ["redo", "重做", "Redo"],
  ["step", "提示一步", "Hint step"],
  ["solve", "自动解题", "Solve"],
  ["apply", "应用提示", "Apply hint"],
  ["stepExplain", "解释", "Explain"],
  ["stepExplainTitle", "动态教程：为什么这一步成立", "Dynamic tutorial: why this step works"],
  ["stepExplainUnavailable", "当前没有可解释的步骤。", "No explainable step is selected."],
  ["stepTutorialGuide", "技巧原理", "Technique guide"],
  ["stepTutorialCurrent", "当前步骤", "Current step"],
  ["close", "关闭", "Close"],
  ["fullscreen", "全屏", "Fullscreen"],
  ["exitFullscreen", "退出全屏", "Exit fullscreen"],
  ["mobileSolveEntry", "做题", "Solve"],
  ["mobileSolveMode", "做题模式", "Solve mode"],
  ["mobileSolveExit", "返回", "Back"],
  ["mobileSolveNewPuzzle", "新题", "New"],
  ["mobileSolveNewPuzzleTitle", "生成新题", "New puzzle"],
  ["mobileSolveNewPuzzleHint", "选择难度后生成，生成完成后继续留在做题模式。", "Choose a difficulty and generate without leaving solve mode."],
  ["mobileSolveNewPuzzleWarning", "当前作答进度或标记将在生成新题后清除。", "Your current progress or manual marks will be cleared when a new puzzle is generated."],
  ["mobileSolveNewPuzzleConfirm", "当前作答进度或标记将被清除，确定生成新题吗？", "Your current progress or manual marks will be cleared. Generate a new puzzle?"],
  ["mobileSolveNewPuzzleGenerate", "生成", "Generate"],
  ["mobileSolveNewPuzzleGenerating", "生成中…", "Generating…"],
  ["mobileSolveNewPuzzleCancel", "取消", "Cancel"],
  ["mobileSolveNewPuzzleDifficulty", "难度", "Difficulty"],
  ["mobileSolveMore", "更多", "More"],
  ["mobileSolveMoreTitle", "更多功能", "More tools"],
  ["mobileSolveValueShort", "出数", "Value"],
  ["mobileSolveCandidateShort", "候选", "Cand."],
  ["mobileSolveHintShort", "提示", "Hint"],
  ["mobileSolveApplyShort", "应用", "Apply"],
  ["mobileSolveClear", "清除", "Clear"],
  ["mobileSolveInput", "题面输入", "Puzzle input"],
  ["mobileSolveAnalysis", "分析模式", "Analysis mode"],
  ["mobileSolveLanguage", "语言", "Language"],
  ["mobileSolveActions", "做题操作", "Solve controls"],
  ["mobileSolveMarks", "标记", "Marks"],
  ["mobileSolveMarksActive", "标记中", "Marking"],
  ["mobileSolveHideMarks", "收起", "Hide"],
  ["mobileSolveMarksTitle", "手工标记", "Manual marks"],
  ["mobileSolveHideCandidates", "隐藏候选数", "Hide candidates"],
  ["mobileSolveShowCandidates", "显示候选数", "Show candidates"],
  ["mobileSolveDisableSameDigit", "关闭同数字高亮", "Disable same-digit highlight"],
  ["mobileSolveEnableSameDigit", "开启同数字高亮", "Enable same-digit highlight"],
  ["mobileSolveWakeLock", "屏幕常亮", "Keep screen awake"],
  ["mobileSolveWakeLockActive", "做题时保持屏幕常亮：已启用", "Keep screen awake while solving: active"],
  ["mobileSolveWakeLockWaiting", "进入做题模式后自动启用", "Activates automatically in Solve Mode"],
  ["mobileSolveWakeLockOff", "已关闭；手机将按系统设置息屏", "Off; the phone may sleep normally"],
  ["mobileSolveWakeLockReleased", "已被系统释放；关闭再开启可重试", "Released by the system; toggle off and on to retry"],
  ["mobileSolveWakeLockFailed", "启用失败；关闭再开启可重试", "Activation failed; toggle off and on to retry"],
  ["mobileSolveWakeLockUnsupported", "当前浏览器不支持屏幕常亮", "Screen Wake Lock is unavailable in this browser"],
  ["mobileInputState", "{mode} · {digit}", "{mode} · {digit}"],
  ["mobileSelectCellFirst", "请先选择一个单元格。", "Select a cell first."],
  ["mobileNothingToClear", "当前单元格没有可清除的内容。", "There is nothing to clear in this cell."],
  ["difficulty", "难度", "Difficulty"],
  ["training", "训练", "Training"],
  ["trainingOtpLabel", "OTP", "OTP"],
  ["trainingOtpTitle", "生成 One Trick Pony：Basic 解到停滞后，存在一个符合筛选且可 Single to the End 的关键步骤。", "Generate a One Trick Pony: after Basic techniques stall, a matching key step must lead to Singles to the End."],
  ["trainingOtpAll", "任意技巧 OTP", "Any-technique OTP"],
  ["trainingOtpUnsupported", "OTP 的关键步骤必须是非 Basic 逻辑技巧；唯一数、区块、数组和 BruteForce 不能作为 OTP 目标。", "The OTP key step must be a non-Basic logical technique; singles, locked candidates, subsets, and BruteForce cannot be OTP targets."],
  ["trainingTextFilterButton", "文字过滤", "Text filter"],
  ["trainingTextFilterTitle", "训练文字过滤", "Training text filter"],
  ["trainingTextFilterIntro", "条件由前端指定，C++ 后端只在同一个目标技巧步骤内匹配，不会跨步骤拼接。", "The frontend supplies the conditions. The C++ backend matches them within one step of the selected technique; conditions are never combined across steps."],
  ["trainingTextFilterIncludeLabel", "必须包含", "Must contain"],
  ["trainingTextFilterIncludeHint", "每行一个条件；同一步必须包含全部非空条件。", "One condition per line; every non-empty condition must occur in the same step."],
  ["trainingTextFilterIncludePlaceholder", "例如：\nUniqueness Test 7\ngrouped conjugate pair", "Example:\nUniqueness Test 7\ngrouped conjugate pair"],
  ["trainingTextFilterExcludeLabel", "不得包含", "Must not contain"],
  ["trainingTextFilterExcludeHint", "每行一个条件；同一步命中任意一项即排除。", "One condition per line; a step is rejected if any condition occurs."],
  ["trainingTextFilterExcludePlaceholder", "例如：\nS-Ring", "Example:\nS-Ring"],
  ["trainingTextFilterCaseSensitive", "区分英文字母大小写", "Case-sensitive English matching"],
  ["trainingTextFilterClear", "清空", "Clear"],
  ["trainingTextFilterCancel", "取消", "Cancel"],
  ["trainingTextFilterApply", "应用", "Apply"],
  ["trainingTextFilterInactiveTitle", "设置训练步骤文字过滤", "Configure training-step text filtering"],
  ["trainingTextFilterActiveTitle", "文字过滤已启用：包含 {include} 项，排除 {exclude} 项", "Text filter enabled: {include} include, {exclude} exclude"],
  ["tlgSolverTitle", "TLG Solver", "TLG Solver"],
  ["tlgSolverEnable", "启用 TLG 编辑", "Enable TLG editing"],
  ["tlgSolverModeLabel", "输入模式", "Input Mode"],
  ["tlgModeTruths", "Truths", "Truths"],
  ["tlgModeLinks", "Links", "Links"],
  ["tlgModeVirtualSet", "Virtual Set", "Virtual Set"],
  ["tlgModeAur", "AUR", "AUR"],
  ["tlgModeDaur", "DAUR", "DAUR"],
  ["tlgModeGur", "GUR", "GUR"],
  ["tlgAurGroupLabel", "AUR 分组", "AUR Group"],
  ["tlgAurGroup1", "AUR 1", "AUR 1"],
  ["tlgAurGroup2", "AUR 2", "AUR 2"],
  ["tlgVirtualGroupLabel", "Virtual Set 分组", "Virtual Set Group"],
  ["tlgVirtualSet1", "Virtual Set 1", "Virtual Set 1"],
  ["tlgVirtualSet2", "Virtual Set 2", "Virtual Set 2"],
  ["tlgSolverLinkTypeLabel", "Link 类型", "Link Type"],
  ["tlgLinkAuto", "自动", "Auto"],
  ["tlgLinkRowColumn", "行/列", "Row/Column"],
  ["tlgLinkBox", "宫", "Box"],
  ["tlgLinkCell", "单元格", "Cell"],
  ["tlgTruthsToApply", "应用 Truths 数", "Truths to Apply"],
  ["tlgAurPremiseModeLabel", "唯一性门控", "Uniqueness Gate"],
  ["tlgAurPremiseUnique", "唯一解：核验初始可交换局面", "Unique puzzle: verify initial swap pair"],
  ["tlgAurPremiseTraining", "训练盘：允许初始缺数", "Training grid: allow missing initial candidates"],
  ["tlgImportCandidates", "导入 TLG 候选盘面", "Import TLG Candidate Grid"],
  ["tlgFindEliminations", "查找删数", "Find Eliminations"],
  ["tlgConvertTruths", "转换冗余 Truths", "Convert Redundant Truths"],
  ["tlgRemoveUnused", "移除未使用 Links", "Remove Unused Links"],
  ["tlgClearState", "清空 TLG 状态", "Clear TLG State"],
  ["tlgLibraryButton", "TLG 题库", "TLG Library"],
  ["tlgLibraryDialogTitle", "TLG 逻辑题库", "TLG Logic Library"],
  ["tlgLibraryReadAction", "读取", "Read"],
  ["tlgLibraryInsertAction", "插入", "Insert"],
  ["tlgLibraryReplaceAction", "替换", "Replace"],
  ["tlgLibraryAppendAction", "追加", "Append"],
  ["tlgLibraryDeleteAction", "删除", "Delete"],
  ["tlgLibraryImportModeLabel", "导入方式", "Import Mode"],
  ["tlgLibraryImportAppend", "追加到末尾", "Append to End"],
  ["tlgLibraryImportInsert", "插入到当前位置", "Insert at Current Position"],
  ["tlgLibraryImportReplaceAll", "替换整个题库", "Replace Entire Library"],
  ["tlgLibraryImportAction", "导入 .tlgdb", "Import .tlgdb"],
  ["tlgLibraryExportSelectedAction", "导出选中", "Export Selected"],
  ["tlgLibraryExportAllAction", "导出题库", "Export Library"],
  ["tlgLibraryCopyTextAction", "复制样例", "Copy Case"],
  ["tlgLibraryCopyCompactAction", "复制单行", "Copy One Line"],
  ["tlgLibraryPasteTextAction", "粘贴样例", "Paste Case"],
  ["tlgLibraryImportTextAction", "导入文本", "Import Text"],
  ["tlgLibraryExportTextAction", "导出文本", "Export Text"],
  ["tlgLibraryShareToolbarAria", "TLG 文字样例操作", "TLG text-case actions"],
  ["tlgLibraryShareTextLabel", "文字样例", "Text Case"],
  ["tlgLibraryShareTextPlaceholder", "粘贴 YZF-TLG-CASE:2 多行样例，或 YZFTLG2 单行样例；兼容旧版 v1。", "Paste a multiline YZF-TLG-CASE:2 case or a one-line YZFTLG2 case; legacy v1 remains supported."],
  ["tlgLibraryLoadTextAction", "载入样例", "Load Case"],
  ["tlgLibraryClearTextAction", "清空", "Clear"],
  ["tlgLibraryCloseTextAction", "收起", "Collapse"],
  ["tlgLibraryShareEmptyHint", "可粘贴别人分享的 TLG 文字样例；解析成功后会先显示结构摘要。", "Paste a shared TLG text case here. A structure summary is shown before it is loaded."],
  ["tlgLibrarySearchPlaceholder", "搜索标题、标签、来源或笔记", "Search title, tags, source, or notes"],
  ["tlgLibraryColumnIndex", "序号", "No."],
  ["tlgLibraryColumnTitle", "标题", "Title"],
  ["tlgLibraryColumnType", "类型", "Type"],
  ["tlgLibraryColumnResult", "结构", "Structure"],
  ["tlgLibraryEmpty", "题库尚无记录。", "The library has no records yet."],
  ["tlgLibraryTitleLabel", "标题", "Title"],
  ["tlgLibraryTagsLabel", "标签", "Tags"],
  ["tlgLibrarySourceLabel", "来源", "Source"],
  ["tlgLibraryNotesLabel", "学习笔记", "Study Notes"],
  ["tlgLibraryTagsPlaceholder", "例如：AUR, Rank 0", "Example: AUR, Rank 0"],
  ["tlgLibraryEditorHint", "请选择一条记录，或填写资料后保存当前 TLG。", "Select a record, or enter metadata and save the current TLG."],
  ["tlgLibraryIdle", "本地题库使用固定 2048 字节记录；请定期导出 .tlgdb 备份。", "The local library uses fixed 2048-byte records. Export a .tlgdb backup regularly."],
  ["tlgLibraryRecordListAria", "TLG 题库记录", "TLG library records"],
  ["tlgLibraryEditorAria", "TLG 记录资料", "TLG record metadata"],
  ["tlgLibraryToolbarAria", "题库记录操作", "Library record actions"],
  ["tlgLibraryDefaultTitle", "TLG 逻辑 {stamp}", "TLG Logic {stamp}"],
  ["tlgLibraryUntitled", "未命名记录 {index}", "Untitled Record {index}"],
  ["tlgLibraryUntitledPlain", "未命名记录", "Untitled Record"],
  ["tlgLibraryResultUnit", "结论", " results"],
  ["tlgLibraryRecordSummary", "类型：{type}\nTruths：{truths}　Links：{links}\n活动候选：{candidates}　结论：{results}\n最后修改：{date}", "Type: {type}\nTruths: {truths}  Links: {links}\nActive candidates: {candidates}  Results: {results}\nLast modified: {date}"],
  ["tlgLibraryLoadedToSolver", "已从题库恢复：{title}", "Restored from library: {title}"],
  ["tlgLibraryNoGrid", "当前没有可保存的数独盘面或候选状态。", "There is no Sudoku grid or candidate state to save."],
  ["tlgLibraryTextTooLong", "{field} 超过固定记录上限（最多 {limit} 个 UTF-8 字节）。", "{field} exceeds the fixed-record limit ({limit} UTF-8 bytes maximum)."],
  ["tlgLibraryInvalidRecordSize", "TLG 记录长度不是固定的 2048 字节。", "The TLG record is not the fixed 2048-byte size."],
  ["tlgLibraryInvalidRecordMagic", "无法识别该 TLG 记录。", "This TLG record is not recognized."],
  ["tlgLibraryUnsupportedRecordVersion", "暂不支持 TLG 记录版本 {version}。", "TLG record version {version} is not supported."],
  ["tlgLibraryRecordCrcFailed", "TLG 记录校验失败，内容可能已损坏。", "The TLG record checksum failed; the record may be damaged."],
  ["tlgLibraryInvalidTextLength", "TLG 记录中的文本长度字段无效。", "A text-length field in the TLG record is invalid."],
  ["tlgLibraryFileTooShort", "文件过短，不是有效的 TLG 题库。", "The file is too short to be a valid TLG library."],
  ["tlgLibraryInvalidFileMagic", "文件标识不正确；请选择 YZF TLG .tlgdb 题库。", "Invalid file signature. Select a YZF TLG .tlgdb library."],
  ["tlgLibraryUnsupportedFileVersion", "暂不支持 TLG 题库版本 {version}。", "TLG library version {version} is not supported."],
  ["tlgLibraryIncompatibleLayout", "该题库的记录布局与当前版本不兼容。", "This library record layout is incompatible with the current version."],
  ["tlgLibraryFileLengthMismatch", "题库长度不符：应为 {expected} 字节，实际为 {actual} 字节。", "Library length mismatch: expected {expected} bytes, got {actual} bytes."],
  ["tlgLibraryHeaderCrcFailed", "题库文件头校验失败。", "The library header checksum failed."],
  ["tlgLibraryDuplicateIdInFile", "题库文件含有重复记录 ID：{id}。", "The library file contains duplicate record ID {id}."],
  ["tlgLibraryIndexedDbUnavailable", "当前浏览器不支持本地 TLG 题库存储。", "This browser does not support local TLG library storage."],
  ["tlgLibraryOpenFailed", "无法打开本地 TLG 题库。", "Could not open the local TLG library."],
  ["tlgLibraryStorageFailed", "本地 TLG 题库写入失败。", "Could not write the local TLG library."],
  ["tlgLibraryStoredRecordDamaged", "本地题库第 {id} 条记录已损坏：{error}", "Local record {id} is damaged: {error}"],
  ["tlgLibrarySelectFirst", "请先选择一条题库记录。", "Select a library record first."],
  ["tlgLibrarySolverBusy", "TLG 正在计算；请等待当前操作完成后再读取或保存题库。", "TLG is still computing. Wait for the current operation before reading or saving the library."],
  ["tlgLibraryDuplicateConfirm", "题库中已有相同逻辑（{title}）。仍要保存一份吗？", "The library already contains the same logic ({title}). Save another copy?"],
  ["tlgLibraryReplaced", "已替换第 {index} 条：{title}", "Replaced record {index}: {title}"],
  ["tlgLibraryInserted", "已插入为第 {index} 条：{title}", "Inserted as record {index}: {title}"],
  ["tlgLibraryAppended", "已追加为第 {index} 条：{title}", "Appended as record {index}: {title}"],
  ["tlgLibraryDeleteConfirm", "确定删除“{title}”吗？", "Delete “{title}”?"],
  ["tlgLibraryDeleted", "已删除：{title}", "Deleted: {title}"],
  ["tlgLibraryRead", "已读取：{title}", "Read: {title}"],
  ["tlgLibraryNothingToExport", "题库中没有可导出的记录。", "There are no records to export."],
  ["tlgLibraryExportedSelected", "已导出选中记录：{count} 条，{bytes} 字节。", "Exported the selected record: {count} record, {bytes} bytes."],
  ["tlgLibraryExportedAll", "已导出题库：{count} 条，{bytes} 字节。", "Exported library: {count} records, {bytes} bytes."],
  ["tlgLibraryEmptyImport", "导入文件不含任何 TLG 记录。", "The imported file contains no TLG records."],
  ["tlgLibraryReplaceAllConfirm", "这会删除本地现有题库，并用文件中的 {count} 条记录替换。确定继续吗？", "This will delete the current local library and replace it with {count} records from the file. Continue?"],
  ["tlgLibraryImported", "已导入 {count} 条 TLG 记录。", "Imported {count} TLG records."],
  ["tlgLibraryImportFailed", "TLG 题库导入失败：{error}", "TLG library import failed: {error}"],
  ["tlgLibraryTextCopied", "TLG 文字样例已复制到剪贴板（{bytes} 字节）。", "The TLG text case was copied to the clipboard ({bytes} bytes)."],
  ["tlgLibraryCompactCopied", "TLG 单行样例已复制到剪贴板（{bytes} 字节）。", "The one-line TLG case was copied to the clipboard ({bytes} bytes)."],
  ["tlgLibraryClipboardReadFailed", "无法直接读取剪贴板；请在文字样例框中手动粘贴。", "The clipboard could not be read directly. Paste into the text-case box manually."],
  ["tlgLibraryClipboardWriteFailed", "复制失败；请展开文字样例后手动复制。", "Copy failed. Expand the text-case box and copy it manually."],
  ["tlgLibraryTextExported", "已导出文字样例：{bytes} 字节。", "Exported the text case ({bytes} bytes)."],
  ["tlgLibraryTextFileReadFailed", "无法读取文字样例文件：{error}", "Could not read the text-case file: {error}"],
  ["tlgLibraryTextEmpty", "请先粘贴或导入 TLG 文字样例。", "Paste or import a TLG text case first."],
  ["tlgLibraryTextInvalidHeader", "无法识别 TLG 文字样例格式。", "The TLG text-case format is not recognized."],
  ["tlgLibraryTextUnsupportedVersion", "暂不支持 TLG 文字样例版本 {version}。", "TLG text-case version {version} is not supported."],
  ["tlgLibraryTextMissingField", "TLG 文字样例缺少必要字段：{field}。", "The TLG text case is missing required field {field}."],
  ["tlgLibraryTextInvalidField", "TLG 文字样例字段 {field} 无效。", "Field {field} in the TLG text case is invalid."],
  ["tlgLibraryTextInvalidCandidate", "无法识别候选：{value}。", "Unrecognized candidate: {value}."],
  ["tlgLibraryTextInvalidDescriptor", "无法识别 Truth/Link 描述符：{value}。", "Unrecognized Truth/Link descriptor: {value}."],
  ["tlgLibraryTextInvalidBitmap", "字段 {field} 的候选位图无效。", "The candidate bitmap in field {field} is invalid."],
  ["tlgLibraryTextCrcFailed", "文字样例校验失败，内容可能被截断或改动。", "The text-case checksum failed; the content may have been truncated or changed."],
  ["tlgLibraryTextPreview", "标题：{title}\n类型：{type}\nTruths：{truths}　Links：{links}\n活动候选：{candidates}　结论：{results}\n文字大小：{bytes} 字节", "Title: {title}\nType: {type}\nTruths: {truths}  Links: {links}\nActive candidates: {candidates}  Results: {results}\nText size: {bytes} bytes"],
  ["tlgLibraryTextLoadConfirm", "载入文字样例“{title}”？当前 TLG 临时状态将被替换。", "Load text case “{title}”? The current temporary TLG state will be replaced."],
  ["tlgLibraryTextLoaded", "已载入文字样例：{title}", "Loaded text case: {title}"],
  ["tlgLibraryTextParseFailed", "文字样例解析失败：{error}", "Text-case parse failed: {error}"],
  ["tlgLibraryTextReady", "文字样例解析成功，可以载入。", "The text case parsed successfully and is ready to load."],
  ["tlgLibraryTextPanelOpened", "请粘贴文字样例，然后确认载入。", "Paste a text case, then confirm to load it."],
  ["tlgLibraryLoading", "正在读取本地 TLG 题库…", "Loading the local TLG library…"],
  ["tlgLibraryOpenError", "无法打开 TLG 题库：{error}", "Could not open the TLG library: {error}"],
  ["tlgStatusOptional", "TLG Solver 是可选附加功能，放在操作区最下方；未启用 TLG 编辑时不会影响现有解题流程。", "TLG Solver is optional and parked at the bottom of Controls. Existing solver behavior is unchanged unless TLG editing is enabled."],
  ["tlgEditingEnabled", "TLG 编辑已启用", "TLG editing enabled"],
  ["tlgStateTitle", "当前 TLG 状态", "Current TLG State"],
  ["tlgSolutionTitle", "Truths/Links 结果", "Truths/Links Result"],
  ["tlgNoInput", "暂无 TLG 输入。", "No TLG input yet."],
  ["tlgDebugImport", "调试 / 导入", "Debug / Import"],
  ["tlgDebugPlaceholder", "仅用于调试导入；TLG 主要通过盘面点击输入。", "Debug import only. Board input is the primary TLG workflow."],
  ["tlgTruths", "Truths", "Truths"],
  ["tlgLinks", "Links", "Links"],
  ["tlgUserLinks", "用户 Links", "User Links"],
  ["tlgVirtualSet", "Virtual Set", "Virtual Set"],
  ["tlgAurCorners", "AUR Corners", "AUR Corners"],
  ["tlgDaurCandidates", "DAUR 候选池", "DAUR Candidate Pool"],
  ["tlgDaurCandidateAdded", "已加入 DAUR 候选池：{value}", "Added to DAUR candidate pool: {value}"],
  ["tlgDaurCandidateRemoved", "已移除 DAUR 候选池：{value}", "Removed from DAUR candidate pool: {value}"],
  ["tlgGurCandidates", "GUR 通用候选云", "GUR Generic Candidate Cloud"],
  ["tlgGurCandidateAdded", "已加入 GUR 通用候选云：{value}", "Added to GUR candidate cloud: {value}"],
  ["tlgGurCandidateRemoved", "已移除 GUR 通用候选云：{value}", "Removed from GUR candidate cloud: {value}"],
  ["tlgAurCornerAddedGroup", "已加入 {group} 角候选：{value}", "Added {group} corner: {value}"],
  ["tlgAurCornerRemovedGroup", "已移除 {group} 角候选：{value}", "Removed {group} corner: {value}"],
  ["tlgRemove", "删除", "Remove"],
  ["tlgRemoved", "已移除 {category}: {value}", "Removed {category}: {value}"],
  ["tlgVirtualCandidateAdded", "已加入 Virtual Set 候选：{value}", "Added virtual candidate: {value}"],
  ["tlgVirtualCandidateRemoved", "已移除 Virtual Set 候选：{value}", "Removed virtual candidate: {value}"],
  ["tlgAurCornerAdded", "已加入 AUR 角候选：{value}", "Added AUR corner: {value}"],
  ["tlgAurCornerRemoved", "已移除 AUR 角候选：{value}", "Removed AUR corner: {value}"],
  ["tlgEndpointSelected", "已选端点：{value}。请选择第二个候选。", "Selected endpoint: {value}. Choose a second candidate."],
  ["tlgTruthAdded", "已添加 truth：{value}", "Added truth: {value}"],
  ["tlgTruthRemoved", "已移除 truth：{value}", "Removed truth: {value}"],
  ["tlgLinkAdded", "已添加 link：{value}", "Added link: {value}"],
  ["tlgLinkRemoved", "已移除 link：{value}", "Removed link: {value}"],
  ["tlgCellTruthAdded", "已添加 cell truth：{value}", "Added cell truth: {value}"],
  ["tlgCellTruthRemoved", "已移除 cell truth：{value}", "Removed cell truth: {value}"],
  ["tlgTruthPairInvalid", "未添加 truth：Truth 模式只接受同一单元格的两个不同候选，或同一 house 中同数字的两个候选。", "Truth not added: Truth mode only accepts two different candidates in one cell, or two same-digit candidates in one house."],
  ["tlgUnavailable", "tlgSolverFindEliminationsV440 不可用；应用 v440/v441 后需要重新编译 wasm。", "tlgSolverFindEliminationsV440 is not available; rebuild wasm after applying v440/v441."],
  ["tlgResponse", "TLG Solver 响应", "TLG Solver response"],
  ["tlgParseFailed", "TLG_SOLVER_RESPONSE_PARSE_FAILED", "TLG_SOLVER_RESPONSE_PARSE_FAILED"],
  ["tlgFailed", "TLG Solver 失败：{error}", "TLG Solver failed: {error}"],
  ["tlgFindRunning", "正在查找删数并规范化 Links…", "Finding eliminations and normalizing links…"],
  ["tlgConvertRunning", "正在按稳定顺序转换 Truths To Links…", "Converting Truths To Links in deterministic order…"],
  ["tlgRemoveRunning", "正在按稳定顺序移除未使用 Links…", "Removing unused Links in deterministic order…"],
  ["tlgConvertSummary", "转换完成：Truths={truths}，Links={links}，转换={moved}，删数={elims}", "Convert complete: Truths={truths}, Links={links}, Moved={moved}, Eliminations={elims}"],
  ["tlgRemoveSummary", "清理完成：Truths={truths}，Links={links}，移除={removed}，删数={elims}", "Cleanup complete: Truths={truths}, Links={links}, Removed={removed}, Eliminations={elims}"],
  ["tlgPhase1Summary", "查找完成：Truths={truths}，Links={links}，删数={elims}", "Find completed: Truths={truths}, Links={links}, Eliminations={elims}"],
  ["tlgNoConsequencesSummary", "计算完成，但没有找到 Links 或删数：Truths={truths}", "Computed, but no Links or eliminations were found: Truths={truths}"],
  ["tlgParsedOnlySummary", "TLG 已解析，但尚未计算删数：Truths={truths}，Links={links}", "TLG parsed, but eliminations were not computed: Truths={truths}, Links={links}"],
  ["tlgCandidateGridImportedUnique", "TLG 候选盘面已导入：{candidates} 个候选。已保存为初始候选盘，并按唯一解模式核验 AUR/DUR 的初始交换前提。", "TLG candidate grid imported: {candidates} candidates. It is preserved as the initial candidate grid, and AUR/DUR swap premises will be verified in unique-puzzle mode."],
  ["tlgCandidateGridImportedTraining", "TLG 训练候选盘已导入：{candidates} 个候选。训练模式允许初始缺数，只核验当前 deadly completion。", "TLG training grid imported: {candidates} candidates. Training mode allows missing initial candidates and checks only the current deadly completion."],
  ["tlgSummaryTruths", "Truths={count}", "Truths={count}"],
  ["tlgSummaryLinks", "Links={count}", "Links={count}"],
  ["tlgSummaryUserLinks", "用户 Links={count}", "User Links={count}"],
  ["tlgSummaryResultLinks", "结果 Links={count}", "Result Links={count}"],
  ["tlgSummaryVirtual", "Virtual={count}", "Virtual={count}"],
  ["tlgSummaryAurs", "AUR={count}", "AURs={count}"],
  ["tlgSummaryAurCorners", "AUR 角候选={count}", "AUR Corners={count}"],
  ["tlgSummaryDaurCandidates", "DAUR 候选={count}", "DAUR Candidates={count}"],
  ["tlgSummaryGurCandidates", "GUR 候选={count}", "GUR Candidates={count}"],
  ["tlgSummaryGurAccepted", "GUR 约束={count}", "GUR Constraints={count}"],
  ["tlgSummaryPremiseUnique", "门控=唯一解", "Gate=Unique"],
  ["tlgSummaryPremiseTraining", "门控=训练盘", "Gate=Training"],
  ["tlgSummaryDaurExpanded", "DAUR→AUR/DUR={count}", "DAUR→AUR/DUR={count}"],
  ["tlgSummaryGrid", "候选盘={count} 个候选", "Grid={count} Candidates"],
  ["tlgSummarySelected", "已选={count}", "Selected={count}"],
  ["tlgSummaryEndpoint", "端点={value}", "Endpoint={value}"],
  ["tlgSolutionTruths", "{count} Truths = {{body}}", "{count} Truths = {{body}}"],
  ["tlgSolutionLinks", "{count} Links = {{body}}", "{count} Links = {{body}}"],
  ["tlgSolutionVirtualSet", "Virtual Set {group}[k={cardinality}] = {{body}}", "Virtual Set {group}[k={cardinality}] = {{body}}"],
  ["tlgSolutionAurs", "{count} 个定式 AUR = {body}", "{count} Fixed AURs = {body}"],
  ["tlgSolutionDaurPool", "DAUR 候选池 = {{body}}", "DAUR Pool = {{body}}"],
  ["tlgSolutionDaurExpanded", "DAUR 展开 AUR/DUR 约束 = {count}", "DAUR Expanded AUR/DUR Constraints = {count}"],
  ["tlgSolutionGurPool", "GUR 通用候选云 = {{body}}", "GUR Candidate Cloud = {{body}}"],
  ["tlgSolutionGurAccepted", "GUR 枚举约束 = {count}", "GUR Enumerated Constraints = {count}"],
  ["tlgSolutionEliminations", "{count} 个删数 --> {body}", "{count} Eliminations --> {body}"],
  ["tlgSolutionNoEliminations", "0 个删数", "0 Eliminations"],
  ["tlgSolutionAssignments", "{count} 个出数 --> {body}", "{count} Assignments --> {body}"],
  ["tlgResultActionFailed", "TLG 操作失败", "TLG action failed"],
  ["tlgBackendSolutionBudget", "投影解数量超过预算", "solution budget exceeded"],
  ["tlgBackendSearchBudget", "投影搜索节点超过预算", "search-node budget exceeded"],
  ["tlgBackendIncompleteSolutionBudget", "投影搜索未完成，无法生成删数：投影解数量超过预算", "Cannot materialize eliminations because the projection search exceeded the solution budget."],
  ["tlgBackendIncompleteSearchBudget", "投影搜索未完成，无法生成删数：搜索节点超过预算", "Cannot materialize eliminations because the projection search exceeded the search-node budget."],
  ["tlgBackendInvalidPlan", "规范化方案无效，无法建立投影上下文", "Cannot build a projection context from an invalid normalized plan."],
  ["tlgBackendNoProjection", "该结构没有合法投影解，无法生成结果", "The structure has no valid projection solution to materialize."],
  ["tlgBackendNoDaurForms", "DAUR 候选池没有展开出有效的定式 AUR 或六格 DUR", "The DAUR candidate pool did not expand to any valid fixed AUR or six-cell DUR form."],
  ["tlgBackendNoInitialSwap", "DAUR 候选池没有任何满足初始可交换前提的构型", "The DAUR candidate pool has no form satisfying the initial swap premise."],
  ["tlgBackendFixedAurInitialSwap", "初始盘面没有同时支持定式 AUR 的两个可交换完成", "The initial grid does not support both swappable completions of the fixed AUR."],
  ["tlgBackendSixCellInitialSwap", "初始盘面没有支持该六格 DUR 的可交换完成对：", "The initial grid has no swappable completion pair for this six-cell DUR: "],
  ["tlgBackendTrainingGrid", "使用了 TLG 训练候选盘；未核验唯一解前提", "A TLG training candidate grid was used; the uniqueness premise was not verified."],
  ["tlgActionsAria", "TLG Solver 操作", "TLG Solver actions"],
  ["tlgCandidateGridEmpty", "输入框为空；请先粘贴 Sukaku 候选盘面。", "The input box is empty. Paste a Sukaku candidate grid first."],
  ["tlgCandidateGridInvalid", "无法识别 TLG 候选盘面：需要 729 字符 Sukaku，或 81 个候选单元格。", "Unrecognized TLG candidate grid. Use a 729-character Sukaku or 81 candidate-cell tokens."],
  ["tlgCandidateGridEmptyCell", "TLG 候选盘面包含无候选单元格：{cell}。", "The TLG candidate grid contains a cell with no candidates: {cell}."],
  ["tlgContextCandidate", "候选数 {value}", "Candidate {value}"],
  ["tlgContextCandidates", "已选 {count} 个候选数", "{count} Candidates selected"],
  ["tlgAddSubTruth", "添加/移除 Truth", "Add/Sub Truth"],
  ["tlgAddSubLink", "添加/移除 Link", "Add/Sub Link"],
  ["tlgMenuRow", "行", "Row"],
  ["tlgMenuColumn", "列", "Column"],
  ["tlgMenuCell", "单元格", "Cell"],
  ["tlgMenuBox", "宫", "Box"],
  ["tlgMenuClearAll", "全部清除", "Clear All"],
  ["tlgToggleVirtualBatch", "切换到 Virtual Set", "Toggle in Virtual Set"],
  ["tlgToggleVirtualSet1Batch", "切换 Virtual Set 1", "Toggle Virtual Set 1"],
  ["tlgToggleVirtualSet2Batch", "切换 Virtual Set 2", "Toggle Virtual Set 2"],
  ["tlgClearVirtualBatch", "清空 Virtual Set", "Clear the Virtual Set"],
  ["tlgToggleAurBatch", "切换 AUR 角候选", "Toggle AUR Corner"],
  ["tlgToggleAur1Batch", "切换 AUR 1 角候选", "Toggle AUR 1 Corners"],
  ["tlgToggleAur2Batch", "切换 AUR 2 角候选", "Toggle AUR 2 Corners"],
  ["tlgToggleDaurBatch", "切换 DAUR 候选池", "Toggle DAUR Candidate Pool"],
  ["tlgToggleGurBatch", "切换 GUR 通用候选云", "Toggle GUR Candidate Cloud"],
  ["tlgToggleGurCells", "切换 GUR 通用格", "Toggle GUR Cells"],
  ["tlgGurCellsToggledOn", "已将 {cells} 个格的 {count} 个当前候选加入 GUR 通用候选云。", "Added {count} current candidates from {cells} cells to the GUR candidate cloud."],
  ["tlgGurCellsToggledOff", "已从 GUR 通用候选云移除 {cells} 个格的 {count} 个当前候选。", "Removed {count} current candidates from {cells} cells from the GUR candidate cloud."],
  ["tlgClearAurBatch", "清空 AUR 角候选", "Clear AUR Corners"],
  ["tlgClearAllLogic", "清空全部逻辑", "Clear All Logic"],
  ["tlgCandidatesSelected", "已选择 {count} 个候选数；电脑右键或手机长按可打开 TLG 菜单。", "{count} candidates selected; right-click on desktop or long-press on touch to open the TLG menu."],
  ["tlgClearCandidateSelection", "清空候选选择", "Clear Candidate Selection"],
  ["tlgBatchAdded", "已添加 {count} 个 {kind}。", "Added {count} {kind} descriptors."],
  ["tlgBatchRemoved", "已移除 {count} 个 {kind}。", "Removed {count} {kind} descriptors."],
  ["tlgBatchToggledOn", "已加入 {count} 个候选数到 {kind}。", "Added {count} candidates to {kind}."],
  ["tlgBatchToggledOff", "已从 {kind} 移除 {count} 个候选数。", "Removed {count} candidates from {kind}."],
  ["tlgTruthsCleared", "已清空全部 Truths。", "Cleared all Truths."],
  ["tlgLinksCleared", "已清空全部 Links。", "Cleared all Links."],
  ["tlgVirtualCleared", "已清空 Virtual Set。", "Cleared the Virtual Set."],
  ["tlgAurCleared", "已清空全部 AUR 角候选。", "Cleared all AUR corners."],
  ["tlgDaurCleared", "已清空 DAUR 候选池。", "Cleared the DAUR candidate pool."],
  ["tlgGurCleared", "已清空 GUR 通用候选云。", "Cleared the GUR candidate cloud."],
  ["tlgLogicCleared", "已清空全部 TLG 逻辑；候选盘面保持不变。", "Cleared all TLG logic; the candidate grid was preserved."],
  ["batchGenerate", "批量任务", "Batch tasks"],
  ["batchMode", "模式", "Mode"],
  ["batchModeGenerate", "批量出题", "Batch generation"],
  ["batchModeSolve", "批量解题", "Batch solving"],
  ["batchSolveFile", "解题输入文件", "Solve input file"],
  ["batchSolveFileHint", "从文本文件载入，一行一题。", "Load a text file; one puzzle per line."],
  ["filename", "输出文件名", "Output filename"],
  ["startBatch", "开始", "Start"],
  ["stop", "停止", "Stop"],
  ["batchStatusIdle", "批量出题/批量解题共用面板。批量出题持续写入输出文件，批量解题从文本文件读取，一行一题。", "Shared panel for batch generation and solving. Generation writes continuously; solving reads a text file, one puzzle per line."],
  ["moreInput", "更多：题面输入与导出评分", "More: puzzle input, export, and rating"],
  ["preferClipboardLoad", "剪贴板优先", "Clipboard first"],
  ["preferClipboardLoadTitle", "加载题目时优先使用剪贴板，失败后再用文本框", "Prefer clipboard when loading puzzles, then fall back to the text box"],
  ["exportPuzzle", "导出题串", "Export puzzle"],
  ["sharePuzzle", "分享题面", "Share puzzle"],
  ["sharePuzzleTitle", "生成包含当前盘面定长编码的链接，并复制到剪贴板。", "Create a link containing the fixed-length encoding of the current board and copy it to the clipboard."],
  ["exportFormatLabel", "导出格式", "Export format"],
  ["exportFormatOriginal", "原始题串", "Original puzzle"],
  ["exportFormatKnown", "已知数字串", "Known digits"],
  ["exportFormatCandidates", "候选数字串", "Candidates text"],
  ["exportFormatSukaku", "Sukaku 字串", "Sukaku string"],
  ["exportFormatLibrary", "Library 题串", "Library string"],
  ["exportFormatCoach", "To Coach", "To Coach"],
  ["clearSavedSession", "清除本地现场", "Clear saved session"],
  ["clearSavedSessionTitle", "清除浏览器中自动保存的上次盘面和技巧配置；不会清空当前盘面。", "Clear the last board and technique settings saved in this browser; the current board is not cleared."],
  ["sessionRestored", "已恢复上次关闭时的盘面和技巧配置。", "Restored the board and technique settings from the last session."],
  ["sharedPuzzleLoaded", "已从分享链接导入题面。", "Imported the puzzle from the shared link."],
  ["sharedPuzzleEmpty", "分享链接中的题面参数为空，未恢复本地现场。", "The puzzle parameter in the shared link is empty; the saved local session was not restored."],
  ["sharedPuzzleInvalid", "分享链接题面编码无效：{message}", "The shared puzzle encoding is invalid: {message}"],
  ["sessionRestoreFailed", "恢复上次现场失败：{message}", "Failed to restore the last session: {message}"],
  ["sessionCleared", "已清除本地保存的盘面和技巧配置。", "Cleared the saved board and technique settings in this browser."],
  ["ratePuzzle", "评分当前题目", "Rate puzzle"],
  ["rateCancel", "取消评分", "Cancel rating"],
  ["rateStarting", "正在启动后台评分……再次点击可取消。", "Starting background rating... Click again to cancel."],
  ["rateRunning", "正在后台评分：已运行 {seconds} 秒。再次点击可取消。", "Rating in the background: {seconds} seconds elapsed. Click again to cancel."],
  ["rateCancelled", "评分已取消。", "Rating cancelled."],
  ["rateWorkerFailed", "后台评分失败：{error}", "Background rating failed: {error}"],
  ["rateForegroundFallback", "当前环境不支持后台 Worker，评分将在前台运行，期间界面可能暂时无响应。", "Background Worker is unavailable in this environment. Rating will run on the main thread and the page may temporarily stop responding."],
  ["allStepsFilterPlaceholder", "过滤：技巧、删数或描述", "Filter: technique / action / description"],
  ["allTechniques", "全部技巧", "All techniques"],
  ["defaultSort", "默认排序", "Default order"],
  ["conclusionSort", "出数/删数优先", "Placements/eliminations first"],
  ["replaceable", "可替换", "Replaceable"],
  ["clear", "清除", "Clear"],
  ["noAllSteps", "暂无可选步骤。", "No available steps yet."],
  ["overlayLegend", "图例", "Overlay legend"],
  ["onNode", "ON node：绿色小点", "ON node: green dot"],
  ["offNode", "OFF node：橙色小点", "OFF node: orange dot"],
  ["groupedSector", "GroupedSector：组合候选区域", "GroupedSector: grouped candidate area"],
  ["strongEdge", "Strong edge：实线", "Strong edge: solid line"],
  ["weakEdge", "Weak edge：虚线", "Weak edge: dashed line"],
  ["groupEdge", "组合边：紫色", "Group edge: purple"],
  ["afAux", "AF 辅助：cover row 水平，cover column 垂直", "AF auxiliary: cover row horizontal; cover column vertical"],
  ["debugCandidate", "Debug candidate：红叉，仅调试", "Debug candidate: red cross, debug only"],
  ["overlayDebugOnly", "仅调试，不作为正式删数", "Debug only; not a formal elimination"],
  ["chooseDigit", "选择数字", "Choose digit"],
  ["candidateMode", "候选", "Candidates"],
  ["valueMode", "出数", "Values"],
  ["inputModeTitle", "触摸/触控笔：切换出数/候选模式，先选数字再点格。鼠标直接在盘面使用左/右键。", "Touch/pen: toggle Value/Candidate, choose a digit, then tap a cell. Mouse input uses direct left/right clicks on the board."],
  ["currentInput", "当前", "Current"],
  ["techPresetAll", "全选", "All In"],
  ["techPresetHighSpeed", "高速", "High Speed"],
  ["techPresetExtremeSpeed", "极速", "Extreme Speed"],
  ["techPresetWhipRating", "whip评分", "Whip Rating"],
  ["techPresetBraidRating", "braid评分", "Braid Rating"],
  ["techniquePresetApplied", "已应用技巧预设：{preset}。", "Applied technique preset: {preset}."],
  ["wasmLoadFailed", "wasm 加载失败", "wasm load failed"],
  ["scriptLoadFailed", "脚本加载失败：{src}", "Script load failed: {src}"],
  ["unsupportedFullscreen", "当前浏览器不支持网页全屏，请尝试添加到主屏幕/PWA，或使用安卓 Chrome 测试。", "This browser does not support page fullscreen. Try adding it to the home screen/PWA, or use Chrome on Android."],
  ["fullscreenFailed", "全屏失败", "Fullscreen failed"],
  ["optionsUpdated", "技巧配置已更新。", "Technique settings updated."],
  ["operationFailed", "操作失败。", "Operation failed."],
  ["fixedCell", "题目固定数不可修改。", "Givens cannot be edited."],
  ["fixedCandidate", "题目固定数不可修改候选。", "Candidates on givens cannot be edited."],
  ["solvedCandidate", "已出数格不可修改候选。", "Candidates on solved cells cannot be edited."],
  ["importClipboardRetry", "输入区内容不是合法题串，已从剪贴板读取并尝试加载。", "The input is not a valid puzzle string; read from the clipboard and tried loading it."],
  ["loadFailedPrefix", "加载失败：", "Load failed: "],
  ["importUnknownFormat", "未识别的题面格式", "Unrecognized puzzle format"],
  ["importedPuzzle", "已导入：{format}{candidates}。", "Imported: {format}{candidates}."],
  ["importedWithCandidates", "，含候选数", ", with candidates"],
  ["ocrDoneLog", "本地图片识别完成。{attribution}", "Local image recognition completed. {attribution}"],
  ["ocrDoneLogNoAttribution", "本地图片识别完成。", "Local image recognition completed."],
  ["ocrDoneStatus", "本地图片识别完成：{clue} 个提示数，{userDigits} 个出数，{cand} 个候选格。{uniqueText} {draftText}", "Local image recognition completed: {clue} givens, {userDigits} solved digits, {cand} candidate cells. {uniqueText} {draftText}"],
  ["ocrNoImageSelected", "未选择图片", "No image selected"],
  ["ocrInvalidImageFile", "请选择 PNG/JPG/WebP 等图片文件。", "Please choose a PNG/JPG/WebP image file."],
  ["ocrRecognizingLocal", "正在本地识别图片……首次加载模型可能稍慢。不会上传图片，也不会访问 sudoku-ocr.com。", "Recognizing the image locally... First model load may be slow. No image is uploaded and sudoku-ocr.com is not used."],
  ["ocrResourceWasm", "运行库", "runtime"],
  ["ocrResourceLocalizer", "定位模型", "localizer model"],
  ["ocrResourceClassifier", "识别模型", "classifier model"],
  ["ocrResourceModule", "模块", "module"],
  ["ocrResourceProgress", "正在准备 OCR {asset}：{loaded}/{total} MB（{percent}%）", "Preparing OCR {asset}: {loaded}/{total} MB ({percent}%)"],
  ["ocrResourceResume", "正在续传 OCR {asset}：已保存 {loaded}/{total} MB（{percent}%）", "Resuming OCR {asset}: {loaded}/{total} MB saved ({percent}%)"],
  ["ocrResourceCache", "正在从本地缓存读取 OCR {asset}：{loaded}/{total} MB（{percent}%）", "Reading OCR {asset} from local cache: {loaded}/{total} MB ({percent}%)"],
  ["ocrResourceRetry", "OCR {asset} 下载中断，正在第 {attempt} 次重试……", "OCR {asset} download was interrupted; retrying (attempt {attempt})..."],
  ["ocrResourceProbe", "正在检测 OCR {asset} 是否支持断点续传……", "Checking whether OCR {asset} supports resumable download..."],
  ["ocrResourceAssembling", "OCR {asset} 下载完成，正在组装并校验……", "OCR {asset} download completed; assembling and validating..."],
  ["ocrNoCoachJson", "OCR 未返回 Coach JSON", "OCR did not return Coach JSON"],
  ["ocrFailed", "本地图片识别失败：{message}", "Local image recognition failed: {message}"],
  ["ocrAttribution", "数独图片识别使用 Alex Kubiesa / Sudoku OCR 训练的本地模型；未使用在线 fallback。", "Sudoku image recognition uses a local model trained by Alex Kubiesa / Sudoku OCR; no online fallback is used."],
  ["ocrPickImage", "选择图片识别", "Recognize image"],
  ["ocrCameraImage", "拍照识别", "Take photo"],
  ["ocrClipboardImage", "从剪贴板识别", "Recognize clipboard"],
  ["ocrClipboardUnsupported", "当前浏览器不支持按钮读取剪贴板图片。桌面端可复制截图后按 Ctrl+V；手机端请用“选择图片识别”或“拍照识别”。", "This browser does not support reading clipboard images from a button. On desktop, copy a screenshot and press Ctrl+V; on mobile, use Recognize image or Take photo."],
  ["ocrReadingClipboard", "正在读取剪贴板图片……", "Reading clipboard image..."],
  ["ocrClipboardNoImage", "剪贴板中没有图片。请先截图/复制图片，或使用“选择图片识别”“拍照识别”。", "No image found in the clipboard. Copy a screenshot first, or use Recognize image / Take photo."],
  ["ocrClipboardReadFailed", "读取剪贴板图片失败：{message}。桌面端也可以直接按 Ctrl+V 粘贴截图。", "Failed to read clipboard image: {message}. On desktop, you can also press Ctrl+V after copying a screenshot."],
  ["clipboardReadUnsupported", "当前浏览器不支持读取剪贴板", "This browser does not support reading text from the clipboard"],
  ["clipboardEmpty", "剪贴板为空", "Clipboard is empty"],
  ["clipboardPreferredLoaded", "已优先从剪贴板读取并尝试加载。", "Read the puzzle from the clipboard first and tried loading it."],
  ["clipboardPreferredFailed", "剪贴板读取/导入失败，已改用输入框内容：{error}", "Clipboard read/import failed, so the text box content was used instead: {error}"],
  ["inputEmptyClipboardLoaded", "输入区为空，已从剪贴板读取并尝试加载。", "Input was empty; read from the clipboard and tried loading it."],
  ["inputEmptyClipboardFailed", "输入区为空，且无法读取剪贴板：{error}", "Input was empty and clipboard read failed: {error}"],
  ["workerTaskFailed", "后台任务失败", "Background task failed"],
  ["solveBusy", "自动解题中...", "Solving..."],
  ["findAllBusy", "搜索中...", "Searching..."],
  ["wasmLoaded", "wasm 已加载。", "wasm loaded."],
  ["exportCopied", "题串已导出并复制到剪贴板。", "Puzzle string exported and copied to the clipboard."],
  ["shareUnavailable", "分享失败：当前没有可编码的有效盘面。", "Share failed: the current board cannot be encoded."],
  ["shareCopied", "分享链接已复制到剪贴板：{url}", "Share link copied to the clipboard: {url}"],
  ["shareClipboardFailed", "分享链接已生成，但浏览器未允许写入剪贴板：{url}", "The share link was created, but the browser did not allow clipboard access: {url}"],
  ["exportToInput", "题串已导出到输入框。", "Puzzle string exported to the input box."],
  ["rateNoPuzzle", "评分失败：当前没有有效题串。", "Rating failed: no valid puzzle string is available."],
  ["rateFailedSimple", "评分失败。", "Rating failed."],
  ["rateInputSuffix", "。输入格式：{format}{mode}", ". Input format: {format}{mode}"],
  ["rateUseCandidateState", "，使用候选状态，SKFR=rateSukaku", ", using candidate state, SKFR=rateSukaku"],
  ["rateUsePuzzle", "，SKFR=ratePuzzle", ", SKFR=ratePuzzle"],
  ["applyPreviewNoAfter", "应用预览步骤失败：无法由 before+step 生成 after。", "Failed to apply preview step: cannot produce after from before+step."],
  ["applyPreviewImportFailed", "应用预览步骤失败：{error}", "Failed to apply preview step: {error}"],
  ["importFailedGeneric", "无法导入", "cannot import"],
  ["appliedPreviewStep", "已应用当前预览步骤。", "Applied the current preview step."],
  ["appliedHint", "已应用当前提示。", "Applied the current hint."],
  ["allStepsCannotSerialize", "所有步骤搜索失败：当前盘面无法序列化为候选盘状态。", "All-steps search failed: the current board cannot be serialized with candidate state."],
  ["allStepsFailed", "所有步骤搜索失败：{error}", "All-steps search failed: {error}"],
  ["allStepsSourceStep", "，来源步骤 #{step}", ", source step #{step}"],
  ["elapsedMs", "，用时 {elapsed} ms", ", elapsed {elapsed} ms"],
  ["allStepsFound", "当前盘面共找到 {count} 个可用步骤{source}{time}。", "Found {count} available steps for the current board{source}{time}."],
  ["unknownError", "未知错误", "unknown error"],
  ["undoDone", "已撤销一步。", "Undid one step."],
  ["undoNone", "没有可撤销的步骤。", "No step to undo."],
  ["redoDone", "已重做一步。", "Redid one step."],
  ["redoNone", "没有可重做的步骤。", "No step to redo."],
  ["allStepsFilterShowing", "显示 {shown} / {total}", "Showing {shown} / {total}"],
  ["allStepsFilterKeyword", "关键词：{query}", "Keyword: {query}"],
  ["allStepsFilterTechnique", "技巧：{technique}", "Technique: {technique}"],
  ["allStepsFilterConclusionSort", "排序：出数/删数优先", "Sort: placements/eliminations first"],
  ["allStepsFilterReplaceableOnly", "仅可替换", "Replaceable only"],
  ["allStepsFilterStteOption", "STTE（Single to the End）", "STTE (Single to the End)"],
  ["listSeparator", "；", "; "],
  ["solvePathCannotSerialize", "自动解题失败：当前盘面无法序列化为候选盘状态。", "Auto solve failed: the current board cannot be serialized with candidate state."],
  ["solveCompleted", "自动解题完成：status={status}，步骤 {steps}，用时 {elapsed} ms。", "Auto solve completed: status={status}, steps {steps}, elapsed {elapsed} ms."],
  ["solvePathRenderFailed", "解题路径渲染失败：{error}", "Failed to render solve path: {error}"],
  ["solveFailed", "自动解题失败：{error}", "Auto solve failed: {error}"],
  ["generatingPuzzle", "正在生成题目：{difficulty}...", "Generating puzzle: {difficulty}..."],
  ["generateFailed", "{difficulty} 生成失败{last}。", "{difficulty} generation failed{last}."],
  ["lastRating", "，最后评分 {rating}", ", last rating {rating}"],
  ["generatedPuzzle", "已生成 {difficulty}：{clues} 个已知数，{rating}。", "Generated {difficulty}: {clues} givens, {rating}."],
  ["noTrainingTechnique", "未指定技巧", "No specific technique"],
  ["difficultyTitle", "生成题目时使用参考项目的 ER 难度分档", "Use the reference ER difficulty bands when generating puzzles"],
  ["trainingTitle", "生成解题路径中包含指定技巧的题目", "Generate a puzzle whose solve path contains the selected technique"],
  ["unrated", "未评分", "Unrated"],
  ["ratingFailed", "评分未通过：{rating}", "Rating failed: {rating}"],
  ["seconds", "{seconds} 秒", "{seconds}s"],
  ["stoppingBatch", "正在停止批量出题...", "Stopping batch generation..."],
  ["batchTrainingStart", "批量训练题库开始：技巧 {technique}，难度 {difficulty}。点击停止结束并写入文件。", "Training batch started: technique {technique}, difficulty {difficulty}. Click Stop to finish and write the file."],
  ["batchStart", "批量出题开始：难度 {difficulty}。点击停止结束并写入文件。", "Batch generation started: difficulty {difficulty}. Click Stop to finish and write the file."],
  ["batchSolveStart", "批量解题开始：目标 {target} 题。", "Batch solving started: target {target} puzzles."],
  ["batchStoppingPrefix", "正在停止，", "Stopping, "],
  ["batchLastPuzzle", "，上一题 {attempts}", ", previous puzzle {attempts}"],
  ["batchTrainingProgress", "{prefix}批量训练题库中：已生成 {generated} 题，批次 {attempts}，失败 {failed} 次{last}，已用时 {elapsed}。", "{prefix}Training batch: generated {generated}, batches {attempts}, failures {failed}{last}, elapsed {elapsed}."],
  ["batchProgress", "{prefix}批量出题中：已生成 {generated} 题，批次 {attempts}，失败 {failed} 次{last}，已用时 {elapsed}。", "{prefix}Batch generation: generated {generated}, attempts {attempts}, failures {failed}{last}, elapsed {elapsed}."],
  ["batchSolveProgress", "{prefix}批量解题中：{generated}/{target}，失败 {failed} 次{last}，已用时 {elapsed}。", "{prefix}Batch solving: {generated}/{target}, failures {failed}{last}, elapsed {elapsed}."],
  ["batchLatest", "{status} 最新 {rating}。", "{status} Latest {rating}."],
  ["batchSearchAttempts", "搜索 {attempts} 次", "searched {attempts} times"],
  ["batchGenerateAttempts", "生成 {attempts} 次", "generated {attempts} times"],
  ["batchWrittenDirect", "已写入磁盘文件", "Written to disk file"],
  ["batchDownloadReady", "已生成下载文件", "Download file generated"],
  ["batchTrainingDone", "{mode}：{filename}，训练技巧 {technique}，成功 {generated} 题，批次 {attempts}，总用时 {elapsed}。", "{mode}: {filename}, technique {technique}, success {generated}, batches {attempts}, total time {elapsed}."],
  ["batchDone", "{mode}：{filename}，成功 {generated} 题，尝试 {attempts} 次，总用时 {elapsed}。", "{mode}: {filename}, success {generated}, attempts {attempts}, total time {elapsed}."],
  ["batchSolveDone", "{mode}：{filename}，解题 {generated}/{target}，失败 {failed} 次，总用时 {elapsed}。", "{mode}: {filename}, solved {generated}/{target}, failures {failed}, total time {elapsed}."],
  ["batchCancelled", "批量任务已停止。", "Batch task stopped."],
  ["batchFailed", "批量任务失败：{error}", "Batch task failed: {error}"],
  ["batchSolveNoInput", "请先选择批量解题输入文件。文件需为纯文本，一行一题。", "Choose a batch solving input file first. It must be plain text, one puzzle per line."],
  ["batchInvalidStep", "批量出题发现技巧错误，已停止：{detail}", "Batch stopped on an invalid step: {detail}"],
  ["invalidStep", "步骤无效", "Invalid step"],
  ["trainingNeedTechnique", "请先在“训练”下拉框选择一个技巧，或勾选 OTP 搜索全部 OTP。", "Choose a technique in the Training dropdown, or enable OTP to search all OTP puzzles."],
  ["trainingSearching", "正在搜索包含 {technique} 的训练题，已用时 {elapsed}...", "Searching for a training puzzle containing {technique}; elapsed {elapsed}..."],
  ["otpSearching", "正在搜索 {technique}，已用时 {elapsed}...", "Searching for {technique}; elapsed {elapsed}..."],
  ["trainingInvalidSyncFailed", "训练生成发现技巧错误，但失败谜题同步到主引擎失败。", "Training generation found an invalid technique, but syncing the failed puzzle to the main engine failed."],
  ["trainingInvalidFound", "训练生成中发现技巧错误{detail}{step}", "Training generation found an invalid technique{detail}{step}"],
  ["trainingStepTextPrefix", "；{step}", "; {step}"],
  ["trainingFailed", "训练题生成失败：{error}{last}。", "Training puzzle generation failed: {error}{last}."],
  ["trainingSyncFailed", "训练题已生成，但主引擎同步失败。", "Training puzzle was generated, but syncing it to the main engine failed."],
  ["trainingGenerated", "已生成 {technique} 训练题并停在技巧出现前的盘面：尝试 {attempts} 次，{rating}。", "Generated a {technique} training puzzle and stopped at the board just before the technique appears: {attempts} attempts, {rating}."],
  ["otpGenerated", "已生成 {technique} OTP，并停在 Basic 无法继续的关键盘面：Basic {basicSteps} 步，尝试 {attempts} 次，{rating}。", "Generated a {technique} OTP and stopped at the key board where Basic techniques stall: {basicSteps} Basic steps, {attempts} attempts, {rating}."],
  ["exportUnavailable", "当前盘面无法导出：没有有效 81 位题面或候选盘状态。", "Cannot export the current board: no valid 81-char puzzle or candidate state."],
  ["coachCompressUnsupported", "当前环境不支持 Coach 题串压缩", "This environment does not support Coach string compression"],
  ["coachDecompressUnsupported", "当前环境不支持 Coach 题串解压", "This environment does not support Coach string decompression"],
  ["coachInvalidChar", "Coach 编码包含非法字符：{ch}", "Coach encoding contains an invalid character: {ch}"],
  ["currentStateSyncFailed", "当前盘面状态同步失败：{error}", "Failed to sync the current board state: {error}"],
  ["waitingWasm", "等待 wasm 加载。", "Waiting for wasm to load."],
  ["branchShorter", "路径缩短 {count} 步", "Path shortened by {count} step(s)"],
  ["branchLonger", "路径增加 {count} 步", "Path lengthened by {count} step(s)"],
  ["branchStepsUnchanged", "步数未变", "Step count unchanged"],
  ["branchScoreLower", "评分降低 {score}", "Rating decreased by {score}"],
  ["branchScoreHigher", "评分提高 {score}", "Rating increased by {score}"],
  ["branchScoreUnchanged", "评分未变", "Rating unchanged"],
  ["branchAppliedTitle", "分叉路径已应用", "Branched path applied"],
  ["branchStepLabel", "第 {index} 步", "Step {index}"],
  ["branchSomeStep", "某一步", "one step"],
  ["branchPanelDetail", "{step} ← 可选 #{candidate}；步数 {oldSteps}→{newSteps}（{stepDelta}），评分 {oldScore}→{newScore}（{scoreDelta}），hash={hash}", "{step} ← option #{candidate}; steps {oldSteps}→{newSteps} ({stepDelta}), rating {oldScore}→{newScore} ({scoreDelta}), hash={hash}"],
  ["branchOldStep", "原步骤", "old step"],
  ["branchNewStep", "新步骤", "new step"],
  ["branchUnnamedStep", "未命名步骤", "unnamed step"],
  ["branchTechniqueChanged", "技法变化：{oldTitle} → {newTitle}", "Technique changed: {oldTitle} → {newTitle}"],
  ["branchTechniqueKept", "技法保持：{title}", "Technique unchanged: {title}"],
  ["branchUndoButton", "撤销分叉", "Undo branch"],
  ["branchNoUndo", "没有可撤销的分叉路径。", "No branched path to undo."],
  ["branchUndoDone", "已撤销最近一次分叉，恢复原解题路径。", "Undid the latest branch and restored the original solve path."],
  ["branchNotBound", "当前可选步骤没有绑定到解题路径中的 before 盘面，不能替换路径。", "This optional step is not bound to a before-board in the solve path, so it cannot replace the path."],
  ["branchMissingApi", "当前 wasm 尚未包含 solve_path_for_import_json，请重新编译并刷新页面。", "The current wasm build does not include solve_path_for_import_json; rebuild and refresh."],
  ["branchNoMatchingBefore", "替换失败：自动解题路径中没有找到相同 beforeHash 的步骤。", "Replacement failed: no step with the same beforeHash was found in the auto-solve path."],
  ["branchSameStep", "可选步骤与当前路径第 {index} 步相同，未替换。", "The optional step is the same as path step {index}; nothing was replaced."],
  ["branchApplyAfterFailed", "替换失败：无法由 before + 可选步骤推出后续盘面。", "Replacement failed: could not produce the after-board from before + optional step."],
  ["branchSerializeFailed", "替换失败：替换后的盘面无法序列化为候选盘状态。", "Replacement failed: the board after replacement cannot be serialized with candidate state."],
  ["branchTailFailed", "替换失败：后续路径重算失败：{error}", "Replacement failed: recomputing the tail path failed: {error}"],
  ["branchReplaced", "已用可选步骤替换第 {index} 步，并从此处重算后续路径。新路径 {steps} 步。", "Replaced path step {index} with the optional step and recomputed the tail. New path has {steps} step(s)."],
  ["branchRowTitle", "单击预览；右键或长按：替换路径并从此处重算", "Click to preview; right-click or long-press to replace the path from here"],
  ["whipMemoryLabel", "Whip/gWhip 内存：", "Whip/gWhip memory:"],
  ["whipMemoryAuto", "自动（普通求解关闭，Whip 评分开启）", "Auto (off for normal solving, on for Whip rating)"],
  ["whipMemoryNormal", "普通（速度优先）", "Normal (speed first)"],
  ["whipMemoryLarge", "大内存（覆盖率优先）", "Large memory (coverage first)"],
  ["whipMemoryTitle", "影响 Whip/gWhip 队列上限：普通 Whip 19000、gWhip 50000；大内存 99000。", "Controls Whip/gWhip queue limits: normal Whip 19000, gWhip 50000; large memory 99000."],
  ["whipCompareGWhipLabel", "gWhip 参与最短长度比较", "Compare shortest length with gWhip"],
  ["whipCompareGWhipTitle", "启用后，当 Whip 与 gWhip 同时开启时比较两者的全局最短长度；仅当 gWhip 更短时返回 gWhip，同长度仍优先 Whip。", "When both Whip and gWhip are enabled, compare their globally shortest lengths. gWhip is returned only when strictly shorter; Whip wins ties."],
  ["techniqueHeader", "技巧", "Technique"],
  ["scoreHeader", "评分", "Score"],
  ["difficultyLevel", "难度 {level}", "Difficulty {level}"],
  ["manualMarksTitle", "手工标记", "Manual Marks"],
  ["manualMarkModeLabel", "模式", "Mode"],
  ["manualMarkLineLabel", "链线", "Line"],
  ["manualMarkColorLabel", "颜色", "Color"],
  ["markAddColor", "添加自定义色", "Add custom color"],
  ["markCustomColorTitle", "选择自定义标记颜色", "Choose custom mark color"],
  ["markColorAdded", "已添加自定义颜色。", "Added custom color."],
  ["markColorSelected", "已选择颜色 {id}。", "Selected color {id}."],
  ["markModeOff", "关闭标记", "Marks off"],
  ["markCellColor", "整格上色", "Color cells"],
  ["markCandidateColor", "候选上色", "Color candidates"],
  ["markCircle", "候选画圈", "Circle candidates"],
  ["markPreElim", "预备删数", "Pre-eliminations"],
  ["markElim", "正式删数", "Eliminations"],
  ["markChain", "手动画链", "Draw chain"],
  ["markConstruction", "构造链", "Construction"],
  ["markMiniRegion", "微型区域", "Mini-Region"],
  ["markBlock", "区块标记", "Block mark"],
  ["markPrimary", "添加", "Add"],
  ["markSecondary", "删除", "Erase"],
  ["markPrimaryTitle", "添加当前模式标记；手机轻触目标，电脑左键目标。", "Add the current mark: tap on touch devices or left-click on desktop."],
  ["markSecondaryTitle", "删除当前模式标记；手机长按目标，电脑右键目标。", "Erase the current mark: long-press on touch devices or right-click on desktop."],
  ["markStrong", "强链（实线）", "Strong / solid"],
  ["markWeak", "弱链（虚线）", "Weak / dashed"],
  ["markConstructionStrong", "构造强链", "Construction strong"],
  ["markConstructionWeak", "构造弱链", "Construction weak"],
  ["markStrongAction", "强链", "Strong"],
  ["markWeakAction", "弱链", "Weak"],
  ["markConstructionStrongAction", "构造强链", "Construction strong"],
  ["markConstructionWeakAction", "构造弱链", "Construction weak"],
  ["markMiniRegionGreenAction", "绿色区域", "Green region"],
  ["markMiniRegionBlueAction", "蓝色区域", "Blue region"],
  ["markMiniRegionGreen", "绿色", "green"],
  ["markMiniRegionBlue", "蓝色", "blue"],
  ["markApplyElims", "应用全部删数", "Apply all eliminations"],
  ["markCleanEasy", "清除简单步骤", "With cleaning easy steps"],
  ["markCleanedEasy", "已清除 {count} 个简单步骤。", "Cleaned {count} easy steps."],
  ["markAppliedElimsWithClean", "已应用 {count} 个手工删数，并清除 {easy} 个简单步骤。", "Applied {count} manual eliminations and cleaned {easy} easy steps."],
  ["markScreenshotButton", "截图", "Screenshot"],
  ["markScreenshotTitle", "按屏幕当前显示原样截图盘面及全部手工标记。桌面端复制到剪贴板，手机端打开系统分享。", "Capture the board exactly as currently displayed, including all manual marks. Copies to the clipboard on desktop and opens system share on mobile."],
  ["markScreenshotShareTitle", "数独盘面截图", "Sudoku board screenshot"],
  ["markScreenshotPreparing", "正在生成盘面截图……", "Generating board screenshot..."],
  ["markScreenshotCopied", "已复制截图到剪贴板。", "Screenshot copied to clipboard."],
  ["markScreenshotShared", "已打开系统分享。", "System share opened."],
  ["markScreenshotShareCancelled", "已取消分享。", "Sharing cancelled."],
  ["markScreenshotDownloaded", "浏览器不支持直接复制图片，已下载截图。", "This browser cannot copy images directly; screenshot downloaded instead."],
  ["markScreenshotShareUnavailableDownloaded", "当前手机浏览器不支持图片系统分享，已下载截图。", "This mobile browser cannot share image files through the system share sheet; the screenshot was downloaded instead."],
  ["markScreenshotShareFailedDownloaded", "系统分享失败，已下载截图：{error}", "System sharing failed; the screenshot was downloaded instead: {error}"],
  ["markScreenshotNoBoard", "当前没有可截图的盘面。", "There is no board to capture."],
  ["markScreenshotFailed", "截图失败：{error}", "Screenshot failed: {error}"],
  ["markNoElimsButCleaned", "没有手工删数，已清除 {easy} 个简单步骤。", "No manual eliminations; cleaned {easy} easy steps."],
  ["markEasyCleanStopped", "简单步骤清除已停止：{reason}", "Easy-step cleaning stopped: {reason}"],
  ["markClearAll", "清空标记", "Clear marks"],
  ["markUndoLine", "撤销线/区域", "Undo line/region"],
  ["markCancelChain", "取消起点", "Cancel start"],
  ["markFinishBlock", "完成区块", "Finish block"],
  ["markUndoBlock", "撤销区块", "Undo block"],
  ["markOffStatus", "关闭标记。", "Marks are off."],
  ["markCellSelected", "已选 {cell}，请点数字选择候选。", "Selected {cell}; choose a digit on the keypad."],
  ["markAdded", "已标记 {target}。", "Marked {target}."],
  ["markRemoved", "已清除 {target} 的标记。", "Cleared marks on {target}."],
  ["markChainStart", "链起点：{target}。请选择终点。", "Chain start: {target}. Choose the endpoint."],
  ["markChainAdded", "已添加链线：{from} -> {to}。", "Added chain line: {from} -> {to}."],
  ["markChainUpdated", "已将链线 {from} -> {to} 改为{type}。", "Changed chain line {from} -> {to} to {type}."],
  ["markChainRemoved", "已删除链线：{from} -> {to}。", "Removed chain line: {from} -> {to}."],
  ["markMiniRegionStart", "微型区域起点：{target}。请选择第二个候选。", "Mini-Region start: {target}. Choose the second candidate."],
  ["markMiniRegionAdded", "已添加{type}微型区域：{from} -> {to}。", "Added a {type} Mini-Region: {from} -> {to}."],
  ["markMiniRegionUpdated", "已将微型区域 {from} -> {to} 改为{type}。", "Changed Mini-Region {from} -> {to} to {type}."],
  ["markMiniRegionRemoved", "已删除微型区域：{from} -> {to}。", "Removed Mini-Region: {from} -> {to}."],
  ["markExistingCandidateRequired", "{target} 当前不是有效候选，不能作为链、构造、微型区域或区块端点。", "{target} is not an active candidate and cannot be used as a chain, construction, Mini-Region, or block endpoint."],
  ["mouseCandidateAbsent", "{target} 当前不存在；请先右键恢复该候选，再用左键出数。", "{target} is absent. Restore the candidate with right-click before setting it with left-click."],
  ["markBlockAdded", "已加入区块：{target}。", "Added to block: {target}."],
  ["markBlockRemoved", "已移除区块标记：{target}。", "Removed block mark on {target}."],
  ["markBlockFinished", "已完成区块标记。", "Finished block mark."],
  ["markBlockUndone", "已撤销上一个区块标记。", "Undid the last block mark."],
  ["markNoBlock", "没有可完成或撤销的区块。", "No block mark to finish or undo."],
  ["markChainCancelled", "已取消链起点。", "Cancelled chain start."],
  ["markLineUndone", "已撤销上一条链线或微型区域。", "Undid the latest chain line or Mini-Region."],
  ["markAllCleared", "已清空手工标记。", "Cleared all manual marks."],
  ["markAppliedElims", "已应用 {count} 个手工删数。", "Applied {count} manual eliminations."],
  ["markNoElims", "没有可应用的手工删数。", "No manual eliminations to apply."],
  ["markModeHint", "鼠标：左键/右键按 FB 规则操作；触摸或触控笔：先选格，再用大数字键和面板按钮。链、构造链与微型区域的左右键分别表示两种关系。", "Mouse: left/right click follows the FB rules. Touch or pen: select a cell, then use the large digit keys and panel buttons. For chains, construction, and Mini-Regions, left/right represent the two relation types."],
  ["workerUnsupported", "当前浏览器不支持后台 Worker", "This browser does not support background Workers"],
  ["trainingWorkerFailed", "训练题生成失败", "Training puzzle generation failed"],
  ["trainingWorkerRuntimeFailed", "训练题 Worker 运行失败", "Training worker failed"],
]) {
  uiText.zh[key] = zh;
  uiText.en[key] = en;
}

function ui(key) {
  return uiText[lang.value]?.[key] ?? uiText.zh[key] ?? key;
}

function uif(key, values = {}) {
  return ui(key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function appStatusLanguage() {
  return lang?.value === "en" ? "en" : "zh";
}

function renderAppStatus(kind, state, values = {}) {
  const descriptor = appStatusDescriptor(kind, state, appStatusLanguage(), values);
  for (const control of appStatusControls) {
    if (control.dataset.appStatusKind !== kind) continue;
    control.dataset.state = state;
    control.dataset.tone = descriptor.tone;
    control.title = descriptor.label;
    control.setAttribute("aria-label", descriptor.label);
    if (kind === "transient") control.hidden = !state || state === "idle";
    if (kind === "back") control.hidden = state === "leaveApp";
    const badge = control.querySelector("[data-app-back-badge]");
    if (badge && kind === "back") badge.textContent = values.depth > 1 ? String(values.depth) : "";
  }
  if (kind === "back" && btnMobileSolveExit) {
    btnMobileSolveExit.dataset.state = state;
    btnMobileSolveExit.dataset.tone = descriptor.tone;
    btnMobileSolveExit.title = descriptor.label;
    btnMobileSolveExit.setAttribute("aria-label", descriptor.label);
    if (mobileBackDepthBadge) mobileBackDepthBadge.textContent = values.depth > 1 ? String(values.depth) : "";
  }
  return descriptor;
}

function showAppStatusToast(kind, state, values = {}, options = {}) {
  const descriptor = renderAppStatus(kind, state, values);
  if (appStatusToast) {
    appStatusToast.textContent = descriptor.label;
    appStatusToast.dataset.tone = descriptor.tone;
    appStatusToast.dataset.visible = "true";
    window.clearTimeout(transientStatusTimer);
    transientStatusTimer = window.setTimeout(() => {
      appStatusToast.dataset.visible = "false";
      if (kind === "transient") {
        transientStatus = { state: "", values: {} };
        renderAppStatus("transient", "idle", {});
      }
    }, Math.max(1200, Number(options.duration || 2800)));
  }
  return descriptor;
}

function setTransientStatus(state, values = {}, options = {}) {
  transientStatus = { state, values };
  return showAppStatusToast("transient", state, values, options);
}

function setAppSaveStatus(state, values = {}) {
  appSaveStatus = { state, values };
  return renderAppStatus("save", state, values);
}

function megabytes(value) {
  return (Math.max(0, Number(value) || 0) / 1_000_000).toFixed(1);
}

function pwaInstalledDisplayMode() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches === true
    || window.matchMedia?.("(display-mode: fullscreen)")?.matches === true
    || window.navigator.standalone === true;
}

function effectiveReadyPwaState() {
  if (!navigator.onLine) return pwaCacheReady ? "offlineReady" : "offlinePartial";
  if (pwaInstalledDisplayMode()) return "installed";
  if (pwaInstallPrompt) return "installable";
  return "ready";
}

function setPwaStatus(state, values = {}) {
  pwaStatus = { state, values };
  return renderAppStatus("pwa", state, values);
}

function refreshPwaStatusLanguage() {
  renderAppStatus("pwa", pwaStatus.state, pwaStatus.values);
  renderAppStatus("save", appSaveStatus.state, appSaveStatus.values);
  const back = currentAppBackState();
  renderAppStatus("back", back.state, { depth: back.depth });
  if (transientStatus.state) renderAppStatus("transient", transientStatus.state, transientStatus.values);
  else renderAppStatus("transient", "idle", {});
}

function currentAppBackState() {
  const layers = [];
  if (typeof ocrCorrectionIsActive === "function" && ocrCorrectionIsActive()) layers.push("closeDialog");
  if (stepExplainDialog?.open) layers.push("closeDialog");
  if (trainingTextFilterDialog?.open) layers.push("closeDialog");
  if (tlgLibraryDialog?.open) layers.push("closeDialog");
  if (mobileSolveNewPuzzleOpen) layers.push("closeNewPuzzle");
  if (mobileSolveMarksOpen) layers.push("closeMarks");
  else if (mobileSolveDrawerOpen) layers.push("closeDrawer");
  if (mobileSolveActive) layers.push("exitSolve");
  return { state: layers[0] || "leaveApp", depth: layers.length };
}

function updateAppBackStatus() {
  const back = currentAppBackState();
  renderAppStatus("back", back.state, { depth: back.depth });
  return back;
}

async function closeTopAppUiLayer() {
  if (typeof ocrCorrectionIsActive === "function" && ocrCorrectionIsActive()) {
    return closeOcrCorrection(true) !== false;
  }
  if (stepExplainDialog?.open) {
    closeStepExplanationDialog();
    updateAppBackStatus();
    return true;
  }
  if (trainingTextFilterDialog?.open) {
    closeTrainingTextFilterDialog();
    updateAppBackStatus();
    return true;
  }
  if (tlgLibraryDialog?.open) {
    tlgLibraryDialog.close();
    updateAppBackStatus();
    return true;
  }
  if (mobileSolveNewPuzzleOpen) {
    setMobileSolveNewPuzzlePanel(false);
    updateAppBackStatus();
    return true;
  }
  if (mobileSolveMarksOpen) {
    closeMobileSolveMarks();
    updateAppBackStatus();
    return true;
  }
  if (mobileSolveDrawerOpen) {
    setMobileSolveDrawer(false);
    updateAppBackStatus();
    return true;
  }
  if (mobileSolveActive) {
    await exitMobileSolveMode();
    updateAppBackStatus();
    return true;
  }
  return false;
}

function installAppBackNavigation() {
  if (!window.history?.pushState || appBackGuardInstalled) return;
  try {
    const baseState = { ...(history.state || {}), yzfAppRoot: true };
    history.replaceState(baseState, "", window.location.href);
    history.pushState({ ...baseState, yzfAppGuard: true }, "", window.location.href);
    appBackGuardInstalled = true;
  } catch {
    return;
  }
  window.addEventListener("popstate", async () => {
    if (appBackPopHandling) return;
    appBackPopHandling = true;
    try {
      const closed = await closeTopAppUiLayer();
      if (closed) {
        history.pushState({ ...(history.state || {}), yzfAppGuard: true }, "", window.location.href);
      } else {
        appBackGuardInstalled = false;
        history.back();
      }
    } finally {
      appBackPopHandling = false;
      window.requestAnimationFrame(updateAppBackStatus);
    }
  });
  const observer = new MutationObserver(() => window.requestAnimationFrame(updateAppBackStatus));
  for (const target of [document.body, stepExplainDialog, trainingTextFilterDialog, tlgLibraryDialog, mobileSolveShell, mobileSolveDrawer, mobileSolveNewPuzzlePanel]) {
    if (target) observer.observe(target, { attributes: true, attributeFilter: ["open", "hidden", "class"] });
  }
  document.addEventListener("click", () => window.requestAnimationFrame(updateAppBackStatus), { passive: true });
  updateAppBackStatus();
}

function setPwaActivationPending(pending, version = pwaTargetVersion) {
  pwaActivationRequested = !!pending;
  pwaPendingVersion = pending ? (String(version || "") || "1") : "";
  try {
    if (pending) sessionStorage.setItem(PWA_APPLY_PENDING_STORAGE_KEY, pwaPendingVersion);
    else sessionStorage.removeItem(PWA_APPLY_PENDING_STORAGE_KEY);
  } catch {}
}

function clearPwaActivationTimer() {
  if (pwaActivationTimer) window.clearTimeout(pwaActivationTimer);
  pwaActivationTimer = 0;
}

function closePwaActivationPort() {
  try { pwaActivationPort?.close?.(); } catch {}
  pwaActivationPort = null;
}

function completePwaActivationAndReload() {
  if (pwaActivationReloadScheduled) return;
  pwaActivationReloadScheduled = true;
  pwaCacheReady = true;
  clearPwaActivationTimer();
  closePwaActivationPort();
  pwaActivationCommandWorker = null;
  setPwaActivationPending(false);
  pwaReloadRequested = false;
  setTransientStatus("updateComplete", {}, { duration: 1200 });
  window.setTimeout(() => window.location.reload(), 120);
}

function failPwaActivation(message, asset = "") {
  clearPwaActivationTimer();
  closePwaActivationPort();
  pwaActivationCommandWorker = null;
  setPwaActivationPending(false);
  pwaReloadRequested = false;
  pwaLastFailure = {
    version: pwaTargetVersion,
    asset: String(asset || ""),
    message: String(message || "Service Worker activation failed"),
  };
  setPwaStatus("updateError", {
    message: pwaLastFailure.message,
    asset: pwaLastFailure.asset,
  });
}

function handlePwaActivationProtocol(data = {}) {
  const type = String(data.type || "");
  if (data.version) pwaTargetVersion = String(data.version);
  if (type === "YZF_PWA_ACTIVATION_ACCEPTED") {
    setPwaActivationPending(true, pwaTargetVersion);
    pwaReloadRequested = true;
    setPwaStatus("updating");
    schedulePwaActivationTimeout(60000);
    return true;
  }
  if (type === "YZF_PWA_ACTIVATION_REPAIRING") {
    setPwaActivationPending(true, pwaTargetVersion);
    pwaReloadRequested = true;
    setPwaStatus("updateRepairing", {
      loaded: megabytes(data.loadedBytes),
      total: megabytes(data.totalBytes),
      network: megabytes(data.networkBytes),
      reused: megabytes(data.reusedBytes),
      resumed: megabytes(data.resumedBytes),
      done: Number(data.done || 0),
      count: Number(data.count || 0),
      asset: String(data.asset || ""),
    });
    schedulePwaActivationTimeout(120000);
    return true;
  }
  if (type === "YZF_PWA_ACTIVATING") {
    setPwaActivationPending(true, pwaTargetVersion);
    pwaReloadRequested = true;
    setPwaStatus("updating");
    schedulePwaActivationTimeout(60000);
    return true;
  }
  if (type === "YZF_PWA_ACTIVATION_ERROR") {
    failPwaActivation(String(data.message || "Service Worker activation failed"), String(data.asset || ""));
    return true;
  }
  return false;
}

function observePwaActivationWorker(worker) {
  if (!worker || worker === pwaObservedActivationWorker) return;
  pwaObservedActivationWorker = worker;
  const sync = () => {
    if (worker.state === "activating") {
      setPwaStatus("updating");
      schedulePwaActivationTimeout(60000);
    } else if (worker.state === "activated") {
      completePwaActivationAndReload();
    } else if (worker.state === "redundant" && pwaActivationRequested) {
      failPwaActivation(pwaLastFailure?.message || "The new Service Worker became redundant during activation", pwaLastFailure?.asset || "");
    }
  };
  worker.addEventListener("statechange", sync);
  sync();
}

function schedulePwaActivationTimeout(timeoutMs = 45000) {
  clearPwaActivationTimer();
  pwaActivationTimer = window.setTimeout(() => {
    pwaActivationTimer = 0;
    if (!pwaActivationRequested) return;
    if (pwaObservedActivationWorker?.state === "activated") {
      completePwaActivationAndReload();
      return;
    }
    const waiting = pwaRegistration?.waiting;
    if (waiting) {
      pwaCacheReady = true;
      failPwaActivation(pwaLastFailure?.message || "The browser kept the new Service Worker waiting and did not confirm activation", pwaLastFailure?.asset || "");
    } else {
      failPwaActivation(pwaLastFailure?.message || "Service Worker activation timed out", pwaLastFailure?.asset || "");
    }
  }, timeoutMs);
}

function requestPwaWorkerActivation(worker) {
  if (!worker) return false;
  if (pwaActivationCommandWorker === worker && pwaActivationRequested && pwaActivationTimer) return true;
  pwaActivationCommandWorker = worker;
  observePwaActivationWorker(worker);
  setPwaActivationPending(true, pwaTargetVersion);
  pwaReloadRequested = true;
  setPwaStatus("updating");
  closePwaActivationPort();
  try {
    if (typeof MessageChannel === "function") {
      const channel = new MessageChannel();
      pwaActivationPort = channel.port1;
      channel.port1.onmessage = (event) => handlePwaActivationProtocol(event.data || {});
      channel.port1.start?.();
      worker.postMessage({ type: "YZF_PWA_SKIP_WAITING", version: pwaTargetVersion }, [channel.port2]);
    } else {
      worker.postMessage({ type: "YZF_PWA_SKIP_WAITING", version: pwaTargetVersion });
    }
  } catch (error) {
    failPwaActivation(error instanceof Error ? error.message : String(error));
    return false;
  }
  schedulePwaActivationTimeout(60000);
  return true;
}

function syncPwaWaitingState({ activateIfRequested = true } = {}) {
  const waiting = pwaRegistration?.waiting;
  if (!waiting) return false;
  pwaLastFailure = null;
  pwaCacheReady = true;
  observePwaActivationWorker(waiting);
  if (activateIfRequested && pwaActivationRequested) requestPwaWorkerActivation(waiting);
  else setPwaStatus("updateReady");
  return true;
}

function schedulePwaWaitingSync(attempt = 0) {
  if (pwaWaitingSyncTimer) window.clearTimeout(pwaWaitingSyncTimer);
  pwaWaitingSyncTimer = window.setTimeout(() => {
    pwaWaitingSyncTimer = 0;
    if (syncPwaWaitingState()) return;
    const installing = pwaRegistration?.installing;
    if (installing && !["redundant", "activated"].includes(installing.state) && attempt < 40) {
      schedulePwaWaitingSync(attempt + 1);
    }
  }, attempt === 0 ? 0 : 50);
}

function observePwaInstallingWorker(worker) {
  if (!worker || worker === pwaObservedInstallingWorker) return;
  pwaObservedInstallingWorker = worker;
  const sync = () => {
    if (worker.state === "installed") {
      // registration.waiting is assigned at the end of installation. Poll for
      // that authoritative state instead of turning the cloud purple from an
      // earlier worker message.
      schedulePwaWaitingSync();
    } else if (worker.state === "redundant" && ["checking", "downloading", "updating"].includes(pwaStatus.state)) {
      setPwaActivationPending(false);
      clearPwaActivationTimer();
      const message = pwaLastFailure?.message || "Service Worker installation was interrupted";
      setPwaStatus(pwaCacheReady ? "updateError" : "error", {
        message,
        asset: pwaLastFailure?.asset || "",
      });
    }
  };
  worker.addEventListener("statechange", sync);
  sync();
}

async function waitForPwaWaitingWorker(timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const waiting = pwaRegistration?.waiting;
    if (waiting) return waiting;
    const installing = pwaRegistration?.installing;
    if (!installing || installing.state === "redundant") break;
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  return pwaRegistration?.waiting || null;
}

async function activatePwaUpdate() {
  setPwaActivationPending(true);
  pwaReloadRequested = true;
  setPwaStatus("updating");
  let waiting = pwaRegistration?.waiting || null;
  if (!waiting && pwaRegistration) {
    observePwaInstallingWorker(pwaRegistration.installing);
    schedulePwaWaitingSync();
    try { await pwaRegistration.update(); } catch {}
    waiting = await waitForPwaWaitingWorker();
  }
  if (waiting) {
    requestPwaWorkerActivation(waiting);
    return;
  }
  setPwaActivationPending(false);
  pwaReloadRequested = false;
  setPwaStatus("updateError", { message: "The new Service Worker is not waiting yet", asset: "" });
}

async function promptPwaInstall() {
  if (!pwaInstallPrompt) {
    showAppStatusToast("pwa", pwaStatus.state, pwaStatus.values);
    return;
  }
  const promptEvent = pwaInstallPrompt;
  pwaInstallPrompt = null;
  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  if (choice?.outcome === "accepted") setTransientStatus("installAccepted");
  else setTransientStatus("installDismissed");
  setPwaStatus(effectiveReadyPwaState());
}

async function retryPwaPreparation() {
  if (!pwaRegistration || !navigator.onLine) return false;
  setPwaStatus("checking");
  try {
    // Always perform an update check first. A failed installing worker becomes
    // redundant, so messaging the old active worker cannot resume that new
    // release. registration.update() recreates the installer, which reopens
    // the same versioned staging cache and continues from its checkpoints.
    await pwaRegistration.update();
    if (pwaRegistration.waiting) {
      pwaCacheReady = true;
      setPwaStatus("updateReady");
      return true;
    }
    if (pwaRegistration.installing) {
      setPwaStatus("downloading", {
        loaded: "0.0", total: "?", network: "0.0", reused: "0.0", resumed: "0.0", done: 0, count: 0,
      });
      return true;
    }
    // No newer worker was found. Repair the currently active release instead;
    // this covers cleared or partially evicted Cache Storage entries.
    const worker = navigator.serviceWorker.controller || pwaRegistration.active;
    if (worker) {
      worker.postMessage({ type: "YZF_PWA_REPAIR" });
      return true;
    }
    throw new Error("No active or installing Service Worker is available");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setPwaStatus(pwaCacheReady ? "updateError" : "error", {
      message,
      asset: pwaLastFailure?.asset || "",
    });
    return false;
  }
}

async function handlePwaStatusAction() {
  if (pwaStatus.state === "updateReady") {
    await activatePwaUpdate();
    return;
  }
  if (pwaInstallPrompt && ["ready", "installable"].includes(pwaStatus.state)) {
    await promptPwaInstall();
    return;
  }
  if (["incomplete", "error", "updateError"].includes(pwaStatus.state) && pwaRegistration) {
    if (!navigator.onLine) {
      showAppStatusToast("pwa", pwaStatus.state, pwaStatus.values, { duration: 3600 });
      return;
    }
    await retryPwaPreparation();
    return;
  }
  showAppStatusToast("pwa", pwaStatus.state, pwaStatus.values, { duration: 3600 });
}

function handlePwaWorkerMessage(event) {
  const data = event.data || {};
  if (!String(data.type || "").startsWith("YZF_PWA_")) return;
  if (data.type === "YZF_PWA_PROGRESS") {
    pwaTargetVersion = String(data.version || pwaTargetVersion || "");
    const values = {
      loaded: megabytes(data.loadedBytes),
      total: megabytes(data.totalBytes),
      network: megabytes(data.networkBytes),
      reused: megabytes(data.reusedBytes),
      resumed: megabytes(data.resumedBytes),
      done: Number(data.done || 0),
      count: Number(data.count || 0),
      asset: String(data.asset || ""),
      phase: String(data.phase || ""),
    };
    if (pwaActivationRequested) {
      setPwaStatus("updateRepairing", values);
      schedulePwaActivationTimeout(120000);
    } else {
      setPwaStatus("downloading", values);
    }
    return;
  }
  if (data.type === "YZF_PWA_STAGED" || data.type === "YZF_PWA_UPDATE_READY") {
    pwaTargetVersion = String(data.version || pwaTargetVersion || "");
    pwaLastFailure = null;
    pwaCacheReady = true;
    // UPDATE_READY from V6 may arrive before registration.waiting exists. The
    // cloud becomes purple only after the browser confirms a waiting worker.
    schedulePwaWaitingSync();
    return;
  }
  if ([
    "YZF_PWA_ACTIVATION_ACCEPTED",
    "YZF_PWA_ACTIVATION_REPAIRING",
    "YZF_PWA_ACTIVATING",
    "YZF_PWA_ACTIVATION_ERROR",
  ].includes(data.type)) {
    handlePwaActivationProtocol(data);
    return;
  }
  if (data.type === "YZF_PWA_READY") {
    const readyVersion = String(data.version || "");
    pwaLastFailure = null;
    pwaCacheReady = true;
    if (pwaActivationRequested) {
      const targetMatches = !pwaPendingVersion || pwaPendingVersion === "1" || !readyVersion || readyVersion === pwaPendingVersion;
      if (!targetMatches) return;
      pwaTargetVersion = readyVersion || pwaTargetVersion || "";
      completePwaActivationAndReload();
      return;
    }
    pwaTargetVersion = readyVersion || pwaTargetVersion || "";
    setPwaStatus(effectiveReadyPwaState());
    return;
  }
  if (data.type === "YZF_PWA_MISSING") {
    pwaCacheReady = false;
    setPwaStatus(navigator.onLine ? "incomplete" : "offlinePartial");
    return;
  }
  if (data.type === "YZF_PWA_ERROR") {
    pwaTargetVersion = String(data.version || pwaTargetVersion || "");
    pwaLastFailure = {
      version: pwaTargetVersion,
      asset: String(data.asset || ""),
      message: String(data.message || "unknown error"),
    };
    setPwaStatus(pwaCacheReady ? "updateError" : "error", {
      message: pwaLastFailure.message,
      asset: pwaLastFailure.asset,
      loaded: megabytes(data.loadedBytes),
      total: megabytes(data.totalBytes),
      network: megabytes(data.networkBytes),
      reused: megabytes(data.reusedBytes),
      resumed: megabytes(data.resumedBytes),
    });
  }
}

async function installPwaSupport() {
  if (globalThis.YZF_STANDALONE) {
    pwaCacheReady = true;
    setPwaStatus("installed");
    return;
  }
  if (!("serviceWorker" in navigator) || (!window.isSecureContext && location.hostname !== "localhost" && location.hostname !== "127.0.0.1")) {
    setPwaStatus("unsupported");
    return;
  }
  navigator.serviceWorker.addEventListener("message", handlePwaWorkerMessage);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    pwaCacheReady = true;
    if (pwaReloadRequested || pwaActivationRequested) completePwaActivationAndReload();
    else setPwaStatus(effectiveReadyPwaState());
  });
  window.addEventListener("online", () => {
    if (["offlineReady", "offlinePartial"].includes(pwaStatus.state)) setPwaStatus(effectiveReadyPwaState());
  });
  window.addEventListener("offline", () => setPwaStatus(pwaCacheReady ? "offlineReady" : "offlinePartial"));
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    pwaInstallPrompt = event;
    if (pwaCacheReady && !pwaInstalledDisplayMode()) setPwaStatus("installable");
  });
  window.addEventListener("appinstalled", () => {
    pwaInstallPrompt = null;
    setPwaStatus("installed");
  });
  setPwaStatus("checking");
  try {
    pwaRegistration = await navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" });
    pwaRegistration.addEventListener("updatefound", () => {
      const worker = pwaRegistration.installing;
      if (!worker) return;
      if (navigator.serviceWorker.controller) {
        setPwaStatus("downloading", {
          loaded: "0.0", total: "?", network: "0.0", reused: "0.0", resumed: "0.0", done: 0, count: 0,
        });
      }
      observePwaInstallingWorker(worker);
    });
    observePwaInstallingWorker(pwaRegistration.installing);
    if (syncPwaWaitingState()) return;
    const statusWorker = navigator.serviceWorker.controller || pwaRegistration.active;
    if (statusWorker) statusWorker.postMessage({ type: "YZF_PWA_GET_STATUS" });
    navigator.serviceWorker.ready.then((registration) => {
      pwaRegistration = registration;
      observePwaInstallingWorker(registration.installing);
      if (syncPwaWaitingState()) return;
      const worker = navigator.serviceWorker.controller || registration.active;
      if (worker) worker.postMessage({ type: "YZF_PWA_GET_STATUS" });
    }).catch(() => {});
  } catch (error) {
    setPwaStatus("error", { message: error instanceof Error ? error.message : String(error) });
  }
}

function installAppStatusControls() {
  for (const control of appStatusControls) {
    control.addEventListener("click", async () => {
      const kind = control.dataset.appStatusKind;
      if (kind === "pwa") await handlePwaStatusAction();
      else if (kind === "save") {
        if (appSaveStatus.state === "dirty" || appSaveStatus.state === "error") saveAppSessionNow();
        else showAppStatusToast("save", appSaveStatus.state, appSaveStatus.values);
      } else if (kind === "back") {
        if (!(await closeTopAppUiLayer())) showAppStatusToast("back", "leaveApp");
      } else if (kind === "transient" && transientStatus.state) {
        showAppStatusToast("transient", transientStatus.state, transientStatus.values);
      }
    });
  }
  btnMobileSolveExit?.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!(await closeTopAppUiLayer()) && mobileSolveActive) await exitMobileSolveMode();
  }, { capture: true });
  renderAppStatus("save", "saved");
  renderAppStatus("pwa", "initializing");
  renderAppStatus("transient", "idle", {});
  updateAppBackStatus();
}


const MANUAL_MARK_CUSTOM_COLORS_KEY = "yzf_manual_mark_custom_colors_v1";
const MANUAL_MARK_COLORS = [
  { id: "1", bg: "#3FDA65", text: "#0b2412" },
  { id: "2", bg: "#7FBBFF", text: "#082f49" },
  { id: "3", bg: "#D8B2FF", text: "#3b0764" },
  { id: "4", bg: "#C5E88E", text: "#173018" },
  { id: "5", bg: "#FFCBCB", text: "#7a0012" },
  { id: "6", bg: "#B2DFDF", text: "#164e63" },
  { id: "7", bg: "#FCDCA5", text: "#7c2d12" },
  { id: "8", bg: "#FFF176", text: "#422006" },
  { id: "9", bg: "#FF8A80", text: "#4a0612" },
  { id: "10", bg: "#80CBC4", text: "#073b3a" },
  { id: "11", bg: "#90CAF9", text: "#082f49" },
  { id: "12", bg: "#CE93D8", text: "#3b0764" },
  { id: "13", bg: "#A5D6A7", text: "#0b3d1a" },
  { id: "14", bg: "#FFE082", text: "#5c2e00" },
  { id: "15", bg: "#B0BEC5", text: "#102a43" },
  { id: "16", bg: "#F48FB1", text: "#5b0a24" },
  { id: "17", bg: "#9FA8DA", text: "#1e1b4b" },
  { id: "18", bg: "#DCE775", text: "#3f3f0a" },
];

function normalizeManualColor(value) {
  const match = String(value || "").trim().match(/^#?([0-9a-fA-F]{6})$/);
  return match ? `#${match[1].toUpperCase()}` : "";
}

function manualColorTextFor(hex) {
  const value = normalizeManualColor(hex);
  if (!value) return "#111827";
  const r = parseInt(value.slice(1, 3), 16);
  const g = parseInt(value.slice(3, 5), 16);
  const b = parseInt(value.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
  return luminance > 150 ? "#111827" : "#ffffff";
}

function loadManualCustomColors() {
  try {
    const raw = localStorage.getItem(MANUAL_MARK_CUSTOM_COLORS_KEY);
    const list = JSON.parse(raw || "[]");
    if (!Array.isArray(list)) return;
    for (const item of list) {
      const bg = normalizeManualColor(item?.bg || item);
      if (!bg) continue;
      if (MANUAL_MARK_COLORS.some((color) => normalizeManualColor(color.bg) === bg)) continue;
      const id = `custom-${bg.slice(1)}`;
      MANUAL_MARK_COLORS.push({ id, bg, text: item?.text || manualColorTextFor(bg), custom: true });
    }
  } catch {}
}

function saveManualCustomColors() {
  try {
    const custom = MANUAL_MARK_COLORS.filter((color) => color.custom).map((color) => ({ bg: color.bg, text: color.text }));
    localStorage.setItem(MANUAL_MARK_CUSTOM_COLORS_KEY, JSON.stringify(custom));
  } catch {}
}

loadManualCustomColors();
const manualMarks = {
  cellColors: new Map(),
  candidateColors: new Map(),
  circles: new Map(),
  preEliminations: new Set(),
  eliminations: new Set(),
  chains: [],
  miniRegions: [],
  blocks: [],
};
let manualBlockDraft = null;
let manualMarkButton = "primary";
let manualMarkColorId = "4";
let manualChainStart = null;
let manualMiniRegionStart = null;

function manualMarkModeValue() {
  return manualMarkMode?.value || "off";
}

function manualMarksActive() {
  return manualMarkModeValue() !== "off";
}

function manualMarkNeedsDigit(mode = manualMarkModeValue()) {
  return ["candidateColor", "circle", "preElim", "elim", "chain", "construction", "miniRegion", "block"].includes(mode);
}

function manualMarkRequiresExistingCandidate(mode = manualMarkModeValue()) {
  return ["chain", "construction", "miniRegion", "block"].includes(mode);
}

const MANUAL_MARK_LONG_PRESS_MS = 580;
const MANUAL_MARK_PROTECTED_HOLD_MS = 460;
const MANUAL_MARK_LONG_PRESS_MOVE_PX = 12;
let manualMarkSuppressTouchClickUntil = 0;
let manualMarkSuppressTouchClickKey = "";

function manualMarkTouchEraseCandidateMode(mode = manualMarkModeValue()) {
  return ["candidateColor", "circle", "preElim", "elim", "block"].includes(mode);
}

function manualMarkSuppressionKeyResolver(suppressionKey) {
  return () => String(typeof suppressionKey === "function" ? suppressionKey() : suppressionKey || "");
}

function manualMarkFollowupSuppressor(target, resolvedSuppressionKey) {
  return (event) => {
    // Hybrid tablets may emit a synthetic mouse action immediately after touch.
    if (boardEventUsesMouse(event, target)) return;
    if (Date.now() > manualMarkSuppressTouchClickUntil) return;
    if (manualMarkSuppressTouchClickKey !== resolvedSuppressionKey()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type === "click") {
      manualMarkSuppressTouchClickUntil = 0;
      manualMarkSuppressTouchClickKey = "";
    }
  };
}

function installManualMarkLongPress(target, enabled, onLongPress, suppressionKey = "") {
  if (!target || typeof enabled !== "function" || typeof onLongPress !== "function") return;
  let timer = 0;
  let pointerId = null;
  let startX = 0;
  let startY = 0;

  const clearTimer = () => {
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
    pointerId = null;
  };
  const resolvedSuppressionKey = manualMarkSuppressionKeyResolver(suppressionKey);
  const suppressFollowup = manualMarkFollowupSuppressor(target, resolvedSuppressionKey);

  target.style.touchAction = "manipulation";
  target.addEventListener("click", suppressFollowup, true);
  target.addEventListener("contextmenu", suppressFollowup, true);
  target.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    if (!enabled()) return;
    clearTimer();
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    timer = window.setTimeout(() => {
      timer = 0;
      if (!enabled()) {
        pointerId = null;
        return;
      }
      // renderBoardSnapshot() replaces the touched cell/candidate node. Keep the
      // suppression window global so the synthetic click is also intercepted by
      // the freshly rendered replacement element instead of re-adding the mark.
      manualMarkSuppressTouchClickUntil = Date.now() + 1000;
      manualMarkSuppressTouchClickKey = resolvedSuppressionKey();
      pointerId = null;
      try { navigator.vibrate?.(12); } catch {}
      onLongPress();
    }, MANUAL_MARK_LONG_PRESS_MS);
  }, { passive: true });
  target.addEventListener("pointermove", (event) => {
    if (!timer || event.pointerId !== pointerId) return;
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > MANUAL_MARK_LONG_PRESS_MOVE_PX) {
      clearTimer();
    }
  }, { passive: true });
  target.addEventListener("pointerup", clearTimer, { passive: true });
  target.addEventListener("pointercancel", clearTimer, { passive: true });
  target.addEventListener("pointerleave", clearTimer, { passive: true });
}


function installManualMarkProtectedTouch(target, enabled, onShortTouch, onLongPress, suppressionKey = "") {
  if (!target || typeof enabled !== "function" || typeof onLongPress !== "function") return;
  let timer = 0;
  let touchId = null;
  let startX = 0;
  let startY = 0;
  let longPressFired = false;

  const resolvedSuppressionKey = manualMarkSuppressionKeyResolver(suppressionKey);
  const armFollowupSuppression = () => {
    manualMarkSuppressTouchClickUntil = Date.now() + 1000;
    manualMarkSuppressTouchClickKey = resolvedSuppressionKey();
  };
  const clearTimer = () => {
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
  };
  const reset = () => {
    clearTimer();
    touchId = null;
    longPressFired = false;
  };
  const findTouch = (list) => {
    if (touchId == null) return null;
    for (const touch of Array.from(list || [])) {
      if (touch.identifier === touchId) return touch;
    }
    return null;
  };
  const suppressFollowup = manualMarkFollowupSuppressor(target, resolvedSuppressionKey);

  // Candidate glyphs and numpad buttons may be claimed by the browser's native
  // text-selection/callout gesture before a pointer-based long press fires.
  // Own the touch sequence only while candidate-mark erasing is available.
  target.style.touchAction = "manipulation";
  target.style.userSelect = "none";
  target.style.webkitUserSelect = "none";
  target.style.webkitTouchCallout = "none";
  target.addEventListener("click", suppressFollowup, true);
  target.addEventListener("contextmenu", (event) => {
    // Keep the native context menu suppressed for touch/pen long-press only.
    // A real mouse right-click must reach the FB-style mark handler below.
    if (boardEventUsesMouse(event, target)) return;
    if (!enabled() && Date.now() > manualMarkSuppressTouchClickUntil) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  target.addEventListener("touchstart", (event) => {
    if (!enabled()) return;
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    event.preventDefault();
    event.stopPropagation();
    reset();
    touchId = touch.identifier;
    startX = touch.clientX;
    startY = touch.clientY;
    timer = window.setTimeout(() => {
      timer = 0;
      if (!enabled() || touchId == null) return;
      longPressFired = true;
      armFollowupSuppression();
      try { navigator.vibrate?.(12); } catch {}
      onLongPress();
    }, MANUAL_MARK_PROTECTED_HOLD_MS);
  }, { passive: false });
  target.addEventListener("touchmove", (event) => {
    const touch = findTouch(event.changedTouches) || findTouch(event.touches);
    if (!touch) return;
    event.preventDefault();
    if (Math.hypot(touch.clientX - startX, touch.clientY - startY) > MANUAL_MARK_LONG_PRESS_MOVE_PX) {
      reset();
    }
  }, { passive: false });
  target.addEventListener("touchend", (event) => {
    const touch = findTouch(event.changedTouches);
    if (!touch) return;
    event.preventDefault();
    event.stopPropagation();
    const shouldTap = Boolean(timer) && !longPressFired;
    clearTimer();
    armFollowupSuppression();
    touchId = null;
    if (shouldTap && typeof onShortTouch === "function") onShortTouch();
    longPressFired = false;
  }, { passive: false });
  target.addEventListener("touchcancel", (event) => {
    if (touchId == null) return;
    event.preventDefault();
    reset();
  }, { passive: false });
}

function manualMarkKey(cell, digit) {
  return `${Number(cell)}:${Number(digit)}`;
}

function manualMarkParseKey(key) {
  const [cell, digit] = String(key).split(":").map(Number);
  return { cell, digit };
}

function manualMarkCellText(cell) {
  const index = Number(cell);
  return `r${Math.floor(index / 9) + 1}c${(index % 9) + 1}`;
}

function manualMarkTargetText(cell, digit = 0) {
  const base = manualMarkCellText(cell);
  return digit ? `${base}#${digit}` : base;
}

function manualMarkColorById(id) {
  return MANUAL_MARK_COLORS.find((item) => String(item.id) === String(id)) || null;
}

function currentManualMarkColor() {
  return manualMarkColorById(manualMarkColorId) || MANUAL_MARK_COLORS[0];
}

function setManualMarkStatus(message) {
  if (manualMarkStatus) manualMarkStatus.textContent = message;
  scheduleAppSessionSave();
  if (mobileSolveActive && mobileSolveMarksOpen && mobileSolveStatus) {
    mobileSolveStatus.textContent = String(message || "");
    mobileSolveStatus.title = String(message || "");
  }
}

function manualBlockEndpointKey(endpoint) {
  return manualMarkKey(endpoint?.cell, endpoint?.digit);
}

function manualBlockHasEndpoint(block, cell, digit) {
  const key = manualMarkKey(cell, digit);
  return Array.isArray(block?.nodes) && block.nodes.some((node) => manualBlockEndpointKey(node) === key);
}

function manualBlockCandidateColorId(cell, digit) {
  const key = manualMarkKey(cell, digit);
  if (manualBlockDraft?.nodes?.some((node) => manualBlockEndpointKey(node) === key)) {
    return manualBlockDraft.colorId || manualMarkColorId;
  }
  for (let i = manualMarks.blocks.length - 1; i >= 0; i -= 1) {
    const block = manualMarks.blocks[i];
    if (block?.nodes?.some((node) => manualBlockEndpointKey(node) === key)) {
      return block.colorId || manualMarkColorId;
    }
  }
  return "";
}

function ensureManualBlockDraft() {
  if (!manualBlockDraft) {
    manualBlockDraft = { colorId: String(manualMarkColorId), nodes: [] };
  }
  return manualBlockDraft;
}

function removeManualBlockTarget(cell, digit) {
  const key = manualMarkKey(cell, digit);
  let removed = false;
  if (manualBlockDraft?.nodes) {
    const before = manualBlockDraft.nodes.length;
    manualBlockDraft.nodes = manualBlockDraft.nodes.filter((node) => manualBlockEndpointKey(node) !== key);
    removed = removed || manualBlockDraft.nodes.length !== before;
    if (manualBlockDraft.nodes.length === 0) manualBlockDraft = null;
  }
  for (const block of manualMarks.blocks) {
    if (!Array.isArray(block.nodes)) continue;
    const before = block.nodes.length;
    block.nodes = block.nodes.filter((node) => manualBlockEndpointKey(node) !== key);
    removed = removed || block.nodes.length !== before;
  }
  manualMarks.blocks = manualMarks.blocks.filter((block) => Array.isArray(block.nodes) && block.nodes.length > 0);
  return removed;
}

function finishManualBlockDraft() {
  if (!manualBlockDraft || !Array.isArray(manualBlockDraft.nodes) || manualBlockDraft.nodes.length === 0) {
    setManualMarkStatus(ui("markNoBlock"));
    return false;
  }
  manualMarks.blocks.push({
    colorId: manualBlockDraft.colorId || String(manualMarkColorId),
    nodes: manualBlockDraft.nodes.map((node) => ({ cell: Number(node.cell), digit: Number(node.digit) })),
  });
  manualBlockDraft = null;
  renderBoardSnapshot(currentSnapshot, currentHint);
  setManualMarkStatus(ui("markBlockFinished"));
  return true;
}

function undoManualBlock() {
  if (manualBlockDraft && Array.isArray(manualBlockDraft.nodes) && manualBlockDraft.nodes.length > 0) {
    manualBlockDraft.nodes.pop();
    if (manualBlockDraft.nodes.length === 0) manualBlockDraft = null;
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(ui("markBlockUndone"));
    return true;
  }
  if (manualMarks.blocks.length > 0) {
    manualMarks.blocks.pop();
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(ui("markBlockUndone"));
    return true;
  }
  setManualMarkStatus(ui("markNoBlock"));
  return false;
}

function updateManualMarkControls() {
  const mode = manualMarkModeValue();
  const active = manualMarksActive();
  const hadManualFocus = Boolean(document.body?.classList.contains("manual-marks-focus"));
  document.body?.classList.toggle("manual-marks-focus", active);
  if (hadManualFocus !== active) {
    window.dispatchEvent(new Event("yzf-layout-modechange"));
  }
  if (active) {
    activateTab("controls");
  }
  if (manualMarksPanel) {
    manualMarksPanel.classList.toggle("active", active);
    manualMarksPanel.dataset.mobileMarkMode = mode;
    manualMarksPanel.open = mobileSolveActive && mobileSolveMarksOpen ? true : active;
  }
  if (mobileSolveActive && manualMarkNeedsDigit(mode) && !mobileSolveCandidatesVisible) {
    mobileSolveCandidatesVisible = true;
    saveMobileSolvePreferences();
    applyMobileSolvePreferences();
  }
  if (mobileSolveActive) updateMobileSolveMarksButton();
  if (mobileSolveActive && mobileSolveMarksOpen) scheduleMobileSolveLayout();
  manualMarkPrimary?.classList.toggle("active", manualMarkButton === "primary");
  manualMarkSecondary?.classList.toggle("active", manualMarkButton === "secondary");
  manualMarkSwatches?.querySelectorAll(".manual-mark-swatch").forEach((button) => {
    button.classList.toggle("active", String(button.dataset.colorId) === String(manualMarkColorId));
  });
  if (manualMarkLineType) manualMarkLineType.disabled = !["chain", "construction"].includes(mode);
  const actionKeys = mode === "chain"
    ? ["markStrongAction", "markWeakAction"]
    : mode === "construction"
      ? ["markConstructionStrongAction", "markConstructionWeakAction"]
      : mode === "miniRegion"
        ? ["markMiniRegionGreenAction", "markMiniRegionBlueAction"]
        : ["markPrimary", "markSecondary"];
  setTextById("manualMarkPrimary", ui(actionKeys[0]));
  setTextById("manualMarkSecondary", ui(actionKeys[1]));
  if (manualMarkFinishBlock) manualMarkFinishBlock.disabled = mode !== "block";
  if (manualMarkUndoBlock) manualMarkUndoBlock.disabled = mode !== "block";
  if (manualMarkStatus && (!manualMarkStatus.textContent || manualMarkStatus.textContent === uiText.zh.markOffStatus || manualMarkStatus.textContent === uiText.en.markOffStatus)) {
    setManualMarkStatus(active ? ui("markModeHint") : ui("markOffStatus"));
  }
}

function buildManualMarkSwatches() {
  if (!manualMarkSwatches) return;
  manualMarkSwatches.replaceChildren();
  for (const color of MANUAL_MARK_COLORS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "manual-mark-swatch";
    button.dataset.colorId = String(color.id);
    button.style.setProperty("--swatch-bg", color.bg);
    button.title = color.custom ? `${ui("manualMarkColorLabel")} ${color.bg}` : `${ui("manualMarkColorLabel")} ${color.id}`;
    button.setAttribute("aria-label", button.title);
    button.addEventListener("click", () => {
      manualMarkColorId = String(color.id);
      updateManualMarkControls();
      setManualMarkStatus(uif("markColorSelected", { id: color.custom ? color.bg : color.id }));
    });
    manualMarkSwatches.appendChild(button);
  }
  updateManualMarkControls();
}

function applyManualMarksToCellElement(cellNode, cellIndex) {
  // TLG editing owns the board while enabled. Preserve manual marks in memory,
  // but do not mix their visual language with Truth/Link/AUR/elimination marks.
  if (tlgSolverEditingActive()) {
    applyTlgSolverMarksToCellElement(cellNode, cellIndex);
    return;
  }
  const cellColor = manualMarks.cellColors.get(cellIndex);
  if (cellColor) {
    const color = manualMarkColorById(cellColor.colorId) || currentManualMarkColor();
    cellNode.classList.add("manual-cell-color");
    cellNode.style.setProperty("--manual-cell-bg", color.bg);
  }
  const candidates = cellNode.querySelectorAll(".candidate[data-digit]");
  candidates.forEach((candidate) => {
    const digit = Number(candidate.dataset.digit || 0);
    if (!digit) return;
    const key = manualMarkKey(cellIndex, digit);
    const candidateColor = manualMarks.candidateColors.get(key);
    if (candidateColor) {
      const color = manualMarkColorById(candidateColor.colorId) || currentManualMarkColor();
      candidate.classList.add("manual-mark-color");
      candidate.style.setProperty("--manual-cand-bg", color.bg);
      candidate.style.setProperty("--manual-cand-text", color.text);
    }
    const circle = manualMarks.circles.get(key);
    if (circle) {
      const color = manualMarkColorById(circle.colorId) || currentManualMarkColor();
      candidate.classList.add("manual-circle");
      candidate.style.setProperty("--manual-circle-color", color.bg);
      candidate.style.setProperty("--manual-circle-text", color.text);
    }
    const blockColorId = manualBlockCandidateColorId(cellIndex, digit);
    if (blockColorId) {
      const color = manualMarkColorById(blockColorId) || currentManualMarkColor();
      candidate.classList.add("manual-block-node");
      candidate.style.setProperty("--manual-block-color", color.bg);
    }
    if (manualMarks.preEliminations.has(key)) candidate.classList.add("manual-pre-elim");
    if (manualMarks.eliminations.has(key)) candidate.classList.add("manual-elim");
  });
  applyTlgSolverMarksToCellElement(cellNode, cellIndex);
}

function manualMarkCandidateTargetAvailable(mode, cellIndex, digit) {
  if (!manualMarkRequiresExistingCandidate(mode) || boardCandidateExists(cellIndex, digit)) return true;
  renderBoardSnapshot(currentSnapshot, currentHint);
  setManualMarkStatus(uif("markExistingCandidateRequired", { target: manualMarkTargetText(cellIndex, digit) }));
  return false;
}

function attachManualMarkCandidateHandlers(cellNode, cellIndex) {
  cellNode.querySelectorAll(".candidate[data-digit]").forEach((candidate) => {
    candidate.addEventListener("pointerdown", (event) => {
      candidate.dataset.boardPointerType = event.pointerType || "";
      setBoardPointerMode(event.pointerType || "");
    }, { passive: true });
    candidate.addEventListener("click", (event) => {
      const digit = Number(candidate.dataset.digit || 0);
      if (handleTlgSolverCandidateClick(cellIndex, digit, event, candidate)) return;
      const mouseInput = boardEventUsesMouse(event, candidate);
      if (manualMarksActive()) {
        if (!mouseInput || !digit) return;
        event.preventDefault();
        event.stopPropagation();
        selectedIndex = cellIndex;
        const mode = manualMarkModeValue();
        if (!manualMarkCandidateTargetAvailable(mode, cellIndex, digit)) return;
        applyManualMarkTarget(cellIndex, digit, "mousePrimary");
        return;
      }
      if (!mouseInput || !digit) return;
      event.preventDefault();
      event.stopPropagation();
      selectedIndex = cellIndex;
      if (!engine || !currentSnapshot) return;
      if (isFixedCell(cellIndex)) {
        renderBoardSnapshot(currentSnapshot, currentHint);
        setStatus(ui("fixedCell"));
        return;
      }
      const cell = currentSnapshot.cells?.[cellIndex];
      if (cell?.value > 0) return;
      if (!boardCandidateExists(cellIndex, digit)) {
        renderBoardSnapshot(currentSnapshot, currentHint);
        setStatus(uif("mouseCandidateAbsent", { target: manualMarkTargetText(cellIndex, digit) }));
        return;
      }
      selectedDigit = digit;
      refreshAfterEdit(engine.set_value_json(cellIndex, digit));
    });
    candidate.addEventListener("contextmenu", (event) => {
      const digit = Number(candidate.dataset.digit || 0);
      if (openTlgSolverContextMenu(cellIndex, digit, event, candidate)) return;
      const mouseInput = boardEventUsesMouse(event, candidate);
      if (manualMarksActive()) {
        if (!mouseInput || !digit) return;
        event.preventDefault();
        event.stopPropagation();
        selectedIndex = cellIndex;
        const mode = manualMarkModeValue();
        if (!manualMarkCandidateTargetAvailable(mode, cellIndex, digit)) return;
        applyManualMarkTarget(cellIndex, digit, "mouseSecondary");
        return;
      }
      if (!mouseInput || !digit) return;
      event.preventDefault();
      event.stopPropagation();
      selectedIndex = cellIndex;
      if (!engine || !currentSnapshot) return;
      if (isFixedCell(cellIndex)) {
        setStatus(ui("fixedCandidate"));
        return;
      }
      const cell = currentSnapshot.cells?.[cellIndex];
      if (cell?.value > 0) {
        setStatus(ui("solvedCandidate"));
        return;
      }
      selectedDigit = digit;
      refreshAfterEdit(engine.toggle_candidate_json(cellIndex, digit));
    });
    installManualMarkProtectedTouch(
      candidate,
      () => {
        if (tlgSolverEditingActive() || !manualMarksActive() || !manualMarkTouchEraseCandidateMode()) return false;
        return !manualMarkRequiresExistingCandidate() || Boolean(candidate.textContent.trim());
      },
      () => {
        selectedIndex = cellIndex;
        renderBoardSnapshot(currentSnapshot, currentHint);
        setManualMarkStatus(uif("markCellSelected", { cell: manualMarkCellText(cellIndex) }));
      },
      () => {
        const digit = Number(candidate.dataset.digit || 0);
        if (!digit) return;
        if (manualMarkRequiresExistingCandidate() && !boardCandidateExists(cellIndex, digit)) return;
        selectedIndex = cellIndex;
        applyManualMarkTarget(cellIndex, digit, "mouseSecondary");
      },
      () => `candidate:${cellIndex}:${Number(candidate.dataset.digit || 0)}`
    );
    installTlgCandidateProtectedTouch(candidate, cellIndex);
  });
}

function clearManualMarkOverlay() {
  document.getElementById("manualMarkOverlay")?.remove();
}

function manualMarkCandidateCenter(cell, digit) {
  const el = getBoardCandidateElement(cell, digit);
  const stageRect = boardStage?.getBoundingClientRect?.();
  const rect = el?.getBoundingClientRect?.();
  if (stageRect && rect && stageRect.width > 0 && rect.width > 0) {
    return {
      x: ((rect.left + rect.width / 2) - stageRect.left) * (900 / stageRect.width),
      y: ((rect.top + rect.height / 2) - stageRect.top) * (900 / stageRect.height),
    };
  }
  const rectLogical = getCellRectLogical(Number(cell));
  const digitIndex = Math.max(0, Math.min(8, Number(digit) - 1));
  return {
    x: rectLogical.x + (digitIndex % 3) * (rectLogical.width / 3) + (rectLogical.width / 6),
    y: rectLogical.y + Math.floor(digitIndex / 3) * (rectLogical.height / 3) + (rectLogical.height / 6),
  };
}

function normalizeManualChainType(type) {
  const value = String(type || "strong");
  if (value === "weak" || value === "constructionStrong" || value === "constructionWeak") return value;
  return "strong";
}

function manualMarkLineTypeForButton(button = "primary", mode = manualMarkModeValue(), mouseAction = false) {
  const secondary = button === "secondary";
  if (mouseAction) {
    if (mode === "construction") return secondary ? "constructionWeak" : "constructionStrong";
    return secondary ? "weak" : "strong";
  }
  const selected = normalizeManualChainType(manualMarkLineType?.value || "strong");
  if (mode === "construction") {
    return selected === "weak" || selected === "constructionWeak" ? "constructionWeak" : "constructionStrong";
  }
  return selected === "weak" || selected === "constructionWeak" ? "weak" : "strong";
}

function manualChainEndpointEquals(a, b) {
  return Number(a?.cell) === Number(b?.cell) && Number(a?.digit) === Number(b?.digit);
}

function manualChainEdgeMatches(edge, from, to) {
  return (
    manualChainEndpointEquals(edge?.from, from) && manualChainEndpointEquals(edge?.to, to)
  ) || (
    manualChainEndpointEquals(edge?.from, to) && manualChainEndpointEquals(edge?.to, from)
  );
}

function manualChainTypeText(type) {
  const keyByType = {
    strong: "markStrong",
    weak: "markWeak",
    constructionStrong: "markConstructionStrong",
    constructionWeak: "markConstructionWeak",
  };
  return ui(keyByType[normalizeManualChainType(type)] || "markStrong");
}

function editManualChainEdge(from, to, type) {
  const normalizedType = normalizeManualChainType(type);
  const existingIndex = manualMarks.chains.findIndex((edge) => manualChainEdgeMatches(edge, from, to));
  if (existingIndex < 0) {
    manualMarks.chains.push({ from: { ...from }, to: { ...to }, type: normalizedType });
    return "added";
  }

  const existing = manualMarks.chains[existingIndex];
  if (normalizeManualChainType(existing?.type) === normalizedType) {
    manualMarks.chains.splice(existingIndex, 1);
    return "removed";
  }

  // A link is identified by its two endpoints, regardless of drawing direction.
  // Keep the latest drawing direction so manual arrow rendering follows the user's gesture.
  manualMarks.chains[existingIndex] = {
    from: { ...from },
    to: { ...to },
    type: normalizedType,
  };
  return "updated";
}

function manualMiniRegionMatches(region, from, to) {
  return manualChainEdgeMatches(region, from, to);
}

function editManualMiniRegion(from, to, type) {
  const normalizedType = type === "blue" ? "blue" : "green";
  const existingIndex = manualMarks.miniRegions.findIndex((region) => manualMiniRegionMatches(region, from, to));
  if (existingIndex < 0) {
    manualMarks.miniRegions.push({ from: { ...from }, to: { ...to }, type: normalizedType });
    return "added";
  }
  if (manualMarks.miniRegions[existingIndex]?.type === normalizedType) {
    manualMarks.miniRegions.splice(existingIndex, 1);
    return "removed";
  }
  manualMarks.miniRegions[existingIndex] = { from: { ...from }, to: { ...to }, type: normalizedType };
  return "updated";
}

function manualMarkShortenedLine(start, end, offset = 9) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x1: start.x + (dx / len) * offset,
    y1: start.y + (dy / len) * offset,
    x2: end.x - (dx / len) * offset,
    y2: end.y - (dy / len) * offset,
  };
}

function manualChainNodeId(endpoint, index) {
  return 900000 + index;
}

function manualChainNodeFromEndpoint(endpoint, index) {
  return {
    nodeId: manualChainNodeId(endpoint, index),
    nodeKind: "SingleCandidate",
    kind: "SingleCandidate",
    cell: Number(endpoint.cell),
    digit: Number(endpoint.digit),
    digitDisplay: Number(endpoint.digit),
    state: index % 2 === 0 ? "ON" : "OFF",
  };
}

function manualChainEdgeReason(edge) {
  const a = edge?.from || {};
  const b = edge?.to || {};
  if (!Number.isInteger(a.cell) || !Number.isInteger(b.cell)) return "manual";
  if (a.cell === b.cell) return "cell";
  const ar = Math.floor(a.cell / 9);
  const ac = a.cell % 9;
  const br = Math.floor(b.cell / 9);
  const bc = b.cell % 9;
  if (ar === br) return "row";
  if (ac === bc) return "column";
  if (Math.floor(ar / 3) === Math.floor(br / 3) && Math.floor(ac / 3) === Math.floor(bc / 3)) return "box";
  return "manual";
}

function manualChainStrength(edge) {
  const type = normalizeManualChainType(edge?.type);
  return (type === "weak" || type === "constructionWeak") ? "weak" : "strong";
}

function clearManualChainEndpointHighlights() {
  board?.querySelectorAll(".candidate.manual-chain-start, .candidate.manual-chain-pending, .candidate.manual-chain-on, .candidate.manual-chain-off").forEach((node) => {
    node.classList.remove("manual-chain-start", "manual-chain-pending", "manual-chain-on", "manual-chain-off");
  });
}

function addManualChainEndpointClass(cell, digit, className) {
  if (!Number.isInteger(cell) || !Number.isInteger(digit)) return false;
  if (!boardCandidateExists(cell, digit)) return false;
  getBoardCandidateElement(cell, digit)?.classList.add(className);
  return true;
}

function applyManualChainEndpointHighlights() {
  clearManualChainEndpointHighlights();
  if (tlgSolverEditingActive()) return;

  if (manualChainStart) {
    addManualChainEndpointClass(manualChainStart.cell, manualChainStart.digit, "manual-chain-start");
    addManualChainEndpointClass(manualChainStart.cell, manualChainStart.digit, "manual-chain-pending");
  }
  if (manualMiniRegionStart) {
    addManualChainEndpointClass(manualMiniRegionStart.cell, manualMiniRegionStart.digit, "manual-chain-start");
    addManualChainEndpointClass(manualMiniRegionStart.cell, manualMiniRegionStart.digit, "manual-chain-pending");
  }

  for (const edge of manualMarks.chains || []) {
    if (!edge?.from || !edge?.to) continue;
    addManualChainEndpointClass(Number(edge.from.cell), Number(edge.from.digit), "manual-chain-start");
    const targetClass = manualChainStrength(edge) === "strong" ? "manual-chain-on" : "manual-chain-off";
    addManualChainEndpointClass(Number(edge.to.cell), Number(edge.to.digit), targetClass);
  }
  for (const region of manualMarks.miniRegions || []) {
    if (!region?.from || !region?.to) continue;
    addManualChainEndpointClass(Number(region.from.cell), Number(region.from.digit), "manual-chain-start");
    addManualChainEndpointClass(Number(region.to.cell), Number(region.to.digit), region.type === "blue" ? "manual-chain-off" : "manual-chain-on");
  }
}


function manualBlockColor(block) {
  return manualMarkColorById(block?.colorId) || currentManualMarkColor();
}

function manualBlockExistingPoints(block) {
  const seen = new Set();
  const points = [];
  for (const node of block?.nodes || []) {
    const cell = Number(node.cell);
    const digit = Number(node.digit);
    if (!boardCandidateExists(cell, digit)) continue;
    const key = manualMarkKey(cell, digit);
    if (seen.has(key)) continue;
    seen.add(key);
    points.push({ ...manualMarkCandidateCenter(cell, digit), cell, digit });
  }
  return points;
}

function manualConvexHull(points) {
  if (points.length <= 2) return points.slice();
  const sorted = points.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function manualExpandedPolygon(points, padding = 16) {
  if (points.length === 0) return [];
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  return points.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / len) * padding, y: p.y + (dy / len) * padding };
  });
}

function renderManualBlockMark(layer, block, draft = false) {
  const points = manualBlockExistingPoints(block);
  if (points.length === 0) return;
  const color = manualBlockColor(block);
  const common = {
    class: `manual-block-mark${draft ? " draft" : ""}`,
    stroke: color.bg,
    fill: color.bg,
  };
  if (points.length === 1) {
    layer.appendChild(createSvgElement("circle", {
      ...common,
      cx: points[0].x,
      cy: points[0].y,
      r: 18,
    }));
    return;
  }
  if (points.length === 2) {
    const line = manualMarkShortenedLine(points[0], points[1], 0);
    layer.appendChild(createSvgElement("path", {
      ...common,
      class: `${common.class} capsule`,
      d: `M ${line.x1.toFixed(2)} ${line.y1.toFixed(2)} L ${line.x2.toFixed(2)} ${line.y2.toFixed(2)}`,
    }));
    return;
  }
  const hull = manualExpandedPolygon(manualConvexHull(points), 18);
  if (hull.length < 3) return;
  const d = hull.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ") + " Z";
  layer.appendChild(createSvgElement("path", { ...common, d }));
}

function renderManualBlockMarks(svg) {
  const hasDraft = manualBlockDraft?.nodes?.length > 0;
  if (!hasDraft && manualMarks.blocks.length === 0) return;
  const layer = createSvgElement("g", { "data-layer": "manual-block-marks" });
  for (const block of manualMarks.blocks) renderManualBlockMark(layer, block, false);
  if (hasDraft) renderManualBlockMark(layer, manualBlockDraft, true);
  svg.appendChild(layer);
}

function renderManualMiniRegions(svg) {
  if (!manualMarks.miniRegions.length) return;
  const layer = createSvgElement("g", { "data-layer": "manual-mini-regions" });
  for (const region of manualMarks.miniRegions) {
    if (!boardCandidateExists(region.from?.cell, region.from?.digit) || !boardCandidateExists(region.to?.cell, region.to?.digit)) continue;
    const start = manualMarkCandidateCenter(region.from.cell, region.from.digit);
    const end = manualMarkCandidateCenter(region.to.cell, region.to.digit);
    const line = manualMarkShortenedLine(start, end, 0);
    const color = region.type === "blue" ? "#2563eb" : "#16a34a";
    layer.appendChild(createSvgElement("path", {
      class: `manual-mini-region ${region.type === "blue" ? "blue" : "green"}`,
      d: `M ${line.x1.toFixed(2)} ${line.y1.toFixed(2)} L ${line.x2.toFixed(2)} ${line.y2.toFixed(2)}`,
      stroke: color,
    }));
  }
  svg.appendChild(layer);
}

function renderManualMarkOverlay() {
  clearManualMarkOverlay();
  if (tlgSolverEditingActive()) return;
  const hasBlocks = manualMarks.blocks.length > 0 || (manualBlockDraft?.nodes?.length > 0);
  if (!boardStage || (manualMarks.chains.length === 0 && manualMarks.miniRegions.length === 0 && !hasBlocks)) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "manualMarkOverlay";
  svg.classList.add("manual-mark-overlay");
  svg.setAttribute("viewBox", "0 0 900 900");
  svg.setAttribute("aria-hidden", "true");

  createOverlayMarkerDefs(svg);
  renderManualMiniRegions(svg);
  renderManualBlockMarks(svg);
  const edgeLayer = createSvgElement("g", { "data-layer": "manual-chain-edges" });
  const nodeById = new Map();
  const overlaySample = {
    sourceKind: "manual-marks",
    title: "Manual Chain",
    chainType: "Manual Chain",
    path: { nodes: [], edges: [] },
  };
  const pathEdges = [];

  manualMarks.chains.forEach((manualEdge, index) => {
    if (!boardCandidateExists(manualEdge.from.cell, manualEdge.from.digit) ||
        !boardCandidateExists(manualEdge.to.cell, manualEdge.to.digit)) {
      return;
    }
    const fromNode = manualChainNodeFromEndpoint(manualEdge.from, index * 2);
    const toNode = manualChainNodeFromEndpoint(manualEdge.to, index * 2 + 1);
    nodeById.set(fromNode.nodeId, fromNode);
    nodeById.set(toNode.nodeId, toNode);
    overlaySample.path.nodes.push(fromNode, toNode);
    const edge = {
      edgeId: `manual-chain-${index}`,
      fromNodeId: fromNode.nodeId,
      toNodeId: toNode.nodeId,
      strength: manualChainStrength(manualEdge),
      reason: manualChainEdgeReason(manualEdge),
      transition: manualChainStrength(manualEdge) === "strong" ? "OFF->ON" : "ON->OFF",
      role: "manual-chain",
    };
    if (manualEdge.type === "constructionStrong" || manualEdge.type === "constructionWeak") {
      // Construction chain is the same manual-chain implementation; this flag only switches color to orange.
      edge.manualConstruction = true;
    }
    pathEdges.push(edge);
    overlaySample.path.edges.push(edge);
  });

  const laneMap = buildOverlayEdgeLaneMap(pathEdges, nodeById, overlaySample);
  const manualOrderedDirections = new Map();
  for (const edge of pathEdges) {
    // Manual chains should follow the user's drawing order: start candidate -> end candidate.
    // Generic overlay code normally orients strong links toward the ON node, which is
    // correct for solver-produced chains but reverses manually drawn strong arrows.
    manualOrderedDirections.set(edge.edgeId, { sourceId: edge.fromNodeId, targetId: edge.toNodeId });
  }
  for (const edge of pathEdges) {
    const laneOffset = laneMap.get(`${edge.fromNodeId}->${edge.toNodeId}`) ?? 0;
    renderOverlayEdge(edgeLayer, edge, nodeById, overlaySample, laneOffset, manualOrderedDirections);
  }
  svg.appendChild(edgeLayer);
  boardStage.appendChild(svg);
}


function clearManualMarks() {
  manualMarks.cellColors.clear();
  manualMarks.candidateColors.clear();
  manualMarks.circles.clear();
  manualMarks.preEliminations.clear();
  manualMarks.eliminations.clear();
  manualMarks.chains.length = 0;
  manualMarks.miniRegions.length = 0;
  manualMarks.blocks.length = 0;
  manualBlockDraft = null;
  manualChainStart = null;
  manualMiniRegionStart = null;
  renderBoardSnapshot(currentSnapshot, currentHint);
  setManualMarkStatus(ui("markAllCleared"));
}

function clearManualMarkAt(cell, digit = 0, mode = manualMarkModeValue()) {
  if (mode === "cellColor" || !digit) {
    manualMarks.cellColors.delete(Number(cell));
  }
  if (digit) {
    const key = manualMarkKey(cell, digit);
    if (mode === "candidateColor") manualMarks.candidateColors.delete(key);
    else if (mode === "circle") manualMarks.circles.delete(key);
    else if (mode === "preElim") manualMarks.preEliminations.delete(key);
    else if (mode === "elim") manualMarks.eliminations.delete(key);
    else if (mode === "chain" || mode === "construction") {
      manualMarks.chains = manualMarks.chains.filter((edge) => !(
        (edge.from.cell === cell && edge.from.digit === digit) ||
        (edge.to.cell === cell && edge.to.digit === digit)
      ));
      if (manualChainStart?.cell === cell && manualChainStart?.digit === digit) manualChainStart = null;
    } else if (mode === "miniRegion") {
      manualMarks.miniRegions = manualMarks.miniRegions.filter((region) => !(
        (region.from.cell === cell && region.from.digit === digit) ||
        (region.to.cell === cell && region.to.digit === digit)
      ));
      if (manualMiniRegionStart?.cell === cell && manualMiniRegionStart?.digit === digit) manualMiniRegionStart = null;
    } else if (mode === "block") {
      removeManualBlockTarget(cell, digit);
    }
  }
}

function applyManualMarkTarget(cell, digit = 0, forcedButton = null) {
  const mode = manualMarkModeValue();
  const rawButton = forcedButton || manualMarkButton;
  const mouseAction = String(rawButton).startsWith("mouse");
  const button = String(rawButton).toLowerCase().includes("secondary") ? "secondary" : "primary";
  if (mode === "off") return false;
  const color = currentManualMarkColor();
  const cellIndex = Number(cell);
  const digitValue = Number(digit || 0);
  if (manualMarkNeedsDigit(mode) && (!digitValue || (manualMarkRequiresExistingCandidate(mode) && !boardCandidateExists(cellIndex, digitValue)))) {
    selectedIndex = cellIndex;
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(uif("markCellSelected", { cell: manualMarkCellText(cellIndex) }));
    return true;
  }

  if (button === "secondary" && !["chain", "construction", "miniRegion"].includes(mode)) {
    clearManualMarkAt(cellIndex, digitValue, mode);
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(uif("markRemoved", { target: manualMarkTargetText(cellIndex, digitValue) }));
    return true;
  }

  if (mode === "cellColor") {
    manualMarks.cellColors.set(cellIndex, { colorId: color.id });
  } else if (mode === "candidateColor") {
    manualMarks.candidateColors.set(manualMarkKey(cellIndex, digitValue), { colorId: color.id });
  } else if (mode === "circle") {
    manualMarks.circles.set(manualMarkKey(cellIndex, digitValue), { colorId: color.id });
  } else if (mode === "preElim") {
    manualMarks.preEliminations.add(manualMarkKey(cellIndex, digitValue));
  } else if (mode === "elim") {
    manualMarks.eliminations.add(manualMarkKey(cellIndex, digitValue));
  } else if (mode === "block") {
    const draft = ensureManualBlockDraft();
    if (!manualBlockHasEndpoint(draft, cellIndex, digitValue)) {
      draft.nodes.push({ cell: cellIndex, digit: digitValue });
    }
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(uif("markBlockAdded", { target: manualMarkTargetText(cellIndex, digitValue) }));
    return true;
  } else if (mode === "chain" || mode === "construction") {
    const endpoint = { cell: cellIndex, digit: digitValue };
    if (!manualChainStart) {
      manualChainStart = endpoint;
      renderBoardSnapshot(currentSnapshot, currentHint);
      setManualMarkStatus(uif("markChainStart", { target: manualMarkTargetText(cellIndex, digitValue) }));
      return true;
    }
    let chainAction = "none";
    const requestedType = manualMarkLineTypeForButton(button, mode, mouseAction);
    if (manualChainStart.cell !== endpoint.cell || manualChainStart.digit !== endpoint.digit) {
      chainAction = editManualChainEdge(manualChainStart, endpoint, requestedType);
    }
    const fromText = manualMarkTargetText(manualChainStart.cell, manualChainStart.digit);
    const toText = manualMarkTargetText(endpoint.cell, endpoint.digit);
    manualChainStart = null;
    renderBoardSnapshot(currentSnapshot, currentHint);
    if (chainAction === "removed") {
      setManualMarkStatus(uif("markChainRemoved", { from: fromText, to: toText }));
    } else if (chainAction === "updated") {
      setManualMarkStatus(uif("markChainUpdated", {
        from: fromText,
        to: toText,
        type: manualChainTypeText(requestedType),
      }));
    } else {
      setManualMarkStatus(uif("markChainAdded", { from: fromText, to: toText }));
    }
    return true;
  } else if (mode === "miniRegion") {
    const endpoint = { cell: cellIndex, digit: digitValue };
    if (!manualMiniRegionStart) {
      manualMiniRegionStart = endpoint;
      renderBoardSnapshot(currentSnapshot, currentHint);
      setManualMarkStatus(uif("markMiniRegionStart", { target: manualMarkTargetText(cellIndex, digitValue) }));
      return true;
    }
    let action = "none";
    const regionType = button === "secondary" ? "blue" : "green";
    if (!manualChainEndpointEquals(manualMiniRegionStart, endpoint)) {
      action = editManualMiniRegion(manualMiniRegionStart, endpoint, regionType);
    }
    const fromText = manualMarkTargetText(manualMiniRegionStart.cell, manualMiniRegionStart.digit);
    const toText = manualMarkTargetText(endpoint.cell, endpoint.digit);
    manualMiniRegionStart = null;
    renderBoardSnapshot(currentSnapshot, currentHint);
    const typeText = ui(regionType === "blue" ? "markMiniRegionBlue" : "markMiniRegionGreen");
    if (action === "removed") {
      setManualMarkStatus(uif("markMiniRegionRemoved", { from: fromText, to: toText }));
    } else if (action === "updated") {
      setManualMarkStatus(uif("markMiniRegionUpdated", { from: fromText, to: toText, type: typeText }));
    } else {
      setManualMarkStatus(uif("markMiniRegionAdded", { from: fromText, to: toText, type: typeText }));
    }
    return true;
  }
  renderBoardSnapshot(currentSnapshot, currentHint);
  setManualMarkStatus(uif("markAdded", { target: manualMarkTargetText(cellIndex, digitValue) }));
  return true;
}

const MANUAL_MARK_EASY_CLEANING_KINDS = new Set([
  "FullHouse",
  "HiddenSingle",
  "LockedCandidates",
  "NakedSingle",
  "NakedPair",
  "HiddenPair",
  "NakedTriple",
  "HiddenTriple",
  "NakedQuad",
  "HiddenQuad",
]);

function isManualMarkEasyCleaningStep(step) {
  if (!step || step.ok === false || step.done || step.solved) return false;
  const kind = String(step.kind || step.technique || step.title || "").trim();
  if (MANUAL_MARK_EASY_CLEANING_KINDS.has(kind)) return true;
  const title = String(step.title || step.name || "").replace(/\s+/g, "").toLowerCase();
  return [
    "fullhouse",
    "hiddensingle",
    "lockedcandidates",
    "lockedcandidate",
    "nakedsingle",
    "nakedpair",
    "hiddenpair",
    "nakedtriple",
    "hiddentriple",
    "nakedquad",
    "hiddenquad",
  ].includes(title);
}

function resetEngineHintCacheToCurrentSnapshot() {
  const snapshotText = snapshotToLibraryString(currentSnapshot);
  if (!snapshotText || !engine) return false;
  const result = parseJson(engine.import_puzzle_json(snapshotText));
  if (!result?.ok) return false;
  currentSnapshot = result.state || currentSnapshot;
  currentHint = null;
  return true;
}


function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas-blob"));
    }, "image/png");
  });
}

let manualScreenshotDomCache = null;
let manualScreenshotDomCacheVersion = 0;
let manualScreenshotDomCacheTimer = 0;
let manualScreenshotDomCachePromise = null;

function manualScreenshotTransparentColor(value) {
  const color = String(value || "").replace(/\s+/g, "").toLowerCase();
  return !color || color === "transparent" || color === "rgba(0,0,0,0)" || color === "hsla(0,0%,0%,0)";
}

function manualScreenshotBackgroundColor() {
  let node = boardStage;
  while (node) {
    const color = getComputedStyle(node).backgroundColor;
    if (!manualScreenshotTransparentColor(color)) return color;
    node = node.parentElement;
  }
  return "#ffffff";
}

function manualScreenshotCopyAttributes(source, target) {
  for (const attr of Array.from(source.attributes || [])) {
    target.setAttribute(attr.name, attr.value);
  }
}

function manualScreenshotCssText() {
  const chunks = [];
  for (const sheet of Array.from(document.styleSheets || [])) {
    try {
      for (const rule of Array.from(sheet.cssRules || [])) chunks.push(rule.cssText);
    } catch {
      const owner = sheet.ownerNode;
      if (owner?.tagName === "STYLE" && owner.textContent) chunks.push(owner.textContent);
    }
  }
  return chunks.join("\n");
}

function manualScreenshotCloneAncestorShell(stageClone) {
  let content = stageClone;
  let source = boardStage?.parentElement || null;
  while (source && source !== document.body) {
    const shell = source.cloneNode(false);
    // Keep the real ancestor classes/IDs so responsive selectors such as
    // .mobile-solve-shell .board-stage still match, while removing ancestor
    // layout from the detached capture document.
    shell.style.setProperty("display", "contents", "important");
    shell.appendChild(content);
    content = shell;
    source = source.parentElement;
  }
  return content;
}

function manualScreenshotLoadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("dom-screenshot-image"));
    image.src = url;
  });
}

async function captureBoardStageDomCanvas() {
  if (!boardStage || !currentSnapshot) throw new Error("board-stage");
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const rect = boardStage.getBoundingClientRect();
  const width = Math.max(1, Math.ceil(rect.width || boardStage.clientWidth || 720));
  const height = Math.max(1, Math.ceil(rect.height || boardStage.clientHeight || width));
  const viewportWidth = Math.max(width, Math.ceil(window.innerWidth || document.documentElement.clientWidth || width));
  const viewportHeight = Math.max(height, Math.ceil(window.innerHeight || document.documentElement.clientHeight || height));
  const scale = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  const stageClone = boardStage.cloneNode(true);
  stageClone.style.setProperty("position", "absolute", "important");
  stageClone.style.setProperty("left", "0", "important");
  stageClone.style.setProperty("top", "0", "important");
  stageClone.style.setProperty("width", `${width}px`, "important");
  stageClone.style.setProperty("height", `${height}px`, "important");
  stageClone.style.setProperty("max-width", "none", "important");
  stageClone.style.setProperty("margin", "0", "important");
  stageClone.style.setProperty("transform", "none", "important");

  const body = document.createElement("body");
  manualScreenshotCopyAttributes(document.body, body);
  body.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  body.style.cssText = document.body.style.cssText;
  const rootStyle = getComputedStyle(document.documentElement);
  for (let i = 0; i < rootStyle.length; i += 1) {
    const property = rootStyle[i];
    if (property.startsWith("--")) body.style.setProperty(property, rootStyle.getPropertyValue(property));
  }
  body.style.setProperty("position", "relative", "important");
  body.style.setProperty("width", `${viewportWidth}px`, "important");
  body.style.setProperty("height", `${viewportHeight}px`, "important");
  body.style.setProperty("min-width", "0", "important");
  body.style.setProperty("min-height", "0", "important");
  body.style.setProperty("margin", "0", "important");
  body.style.setProperty("padding", "0", "important");
  body.style.setProperty("overflow", "hidden", "important");
  body.style.setProperty("background", manualScreenshotBackgroundColor(), "important");

  const style = document.createElement("style");
  style.textContent = manualScreenshotCssText();
  body.append(style, manualScreenshotCloneAncestorShell(stageClone));

  const serialized = new XMLSerializer().serializeToString(body);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${viewportWidth}" height="${viewportHeight}" viewBox="0 0 ${viewportWidth} ${viewportHeight}">`,
    `<foreignObject x="0" y="0" width="100%" height="100%">${serialized}</foreignObject>`,
    "</svg>",
  ].join("");

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const image = await manualScreenshotLoadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas-context");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = manualScreenshotBackgroundColor();
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height, 0, 0, width, height);
  return canvas;
}

async function captureBoardStagePngBlob() {
  return await canvasToPngBlob(await captureBoardStageDomCanvas());
}

function invalidateManualScreenshotDomCache(options = {}) {
  manualScreenshotDomCacheVersion += 1;
  manualScreenshotDomCache = null;
  if (manualScreenshotDomCacheTimer) {
    window.clearTimeout(manualScreenshotDomCacheTimer);
    manualScreenshotDomCacheTimer = 0;
  }
  if (!currentSnapshot || !boardStage || !manualScreenshotPrefersSystemShare()) return;

  if (manualMarkScreenshot) {
    manualMarkScreenshot.disabled = true;
    manualMarkScreenshot.setAttribute("aria-busy", "true");
  }
  const delay = options.immediate ? 0 : 90;
  manualScreenshotDomCacheTimer = window.setTimeout(() => {
    manualScreenshotDomCacheTimer = 0;
    void refreshManualScreenshotDomCache();
  }, delay);
}

async function refreshManualScreenshotDomCache() {
  if (!currentSnapshot || !boardStage) return null;
  if (manualScreenshotDomCachePromise) {
    await manualScreenshotDomCachePromise;
    const ready = manualScreenshotCachedBlob();
    if (ready) return manualScreenshotDomCache;
    return await refreshManualScreenshotDomCache();
  }

  const version = manualScreenshotDomCacheVersion;
  manualScreenshotDomCachePromise = (async () => {
    try {
      const blob = await captureBoardStagePngBlob();
      const rect = boardStage.getBoundingClientRect();
      if (version === manualScreenshotDomCacheVersion) {
        manualScreenshotDomCache = {
          blob,
          version,
          width: Math.ceil(rect.width || 0),
          height: Math.ceil(rect.height || 0),
        };
      }
      return version === manualScreenshotDomCacheVersion ? manualScreenshotDomCache : null;
    } catch {
      if (version === manualScreenshotDomCacheVersion) manualScreenshotDomCache = null;
      return null;
    } finally {
      manualScreenshotDomCachePromise = null;
      if (version === manualScreenshotDomCacheVersion && manualMarkScreenshot) {
        manualMarkScreenshot.disabled = false;
        manualMarkScreenshot.removeAttribute("aria-busy");
      }
    }
  })();

  const result = await manualScreenshotDomCachePromise;
  if (version !== manualScreenshotDomCacheVersion) return await refreshManualScreenshotDomCache();
  return result;
}

function manualScreenshotCachedBlob() {
  const cache = manualScreenshotDomCache;
  if (!cache || cache.version !== manualScreenshotDomCacheVersion) return null;
  const rect = boardStage?.getBoundingClientRect?.();
  if (!rect) return null;
  if (Math.abs(cache.width - Math.ceil(rect.width || 0)) > 1 || Math.abs(cache.height - Math.ceil(rect.height || 0)) > 1) return null;
  return cache.blob || null;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function manualScreenshotPrefersSystemShare() {
  const userAgent = String(navigator.userAgent || "");
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches === true;
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const ipadDesktopMode = /Macintosh/i.test(userAgent) && Number(navigator.maxTouchPoints || 0) > 1;
  return mobileSolveActive || coarsePointer || mobileUserAgent || ipadDesktopMode;
}

function manualScreenshotFilename() {
  return `yzf-sudoku-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
}

function shareManualBoardScreenshot() {
  if (!currentSnapshot || !boardStage) {
    setManualMarkStatus(ui("markScreenshotNoBoard"));
    return Promise.resolve(false);
  }

  const button = manualMarkScreenshot;
  if (button) button.disabled = true;
  setManualMarkStatus(ui("markScreenshotPreparing"));

  const shareMobileBlob = (blob) => {
    const filename = manualScreenshotFilename();
    const file = typeof File === "function" ? new File([blob], filename, { type: "image/png" }) : null;
    let canShareFile = false;
    if (file && window.isSecureContext && typeof navigator.share === "function") {
      try {
        canShareFile = typeof navigator.canShare === "function"
          ? navigator.canShare({ files: [file] })
          : false;
      } catch {
        canShareFile = false;
      }
    }

    if (!canShareFile) {
      downloadBlob(blob, filename);
      setManualMarkStatus(ui("markScreenshotShareUnavailableDownloaded"));
      if (button) button.disabled = false;
      return Promise.resolve(true);
    }

    let shareResult;
    try {
      // With the mobile pre-render cache this call stays inside the original
      // button activation, which is required by iOS/Android system sharing.
      shareResult = navigator.share({
        title: ui("markScreenshotShareTitle"),
        files: [file],
      });
    } catch (error) {
      downloadBlob(blob, filename);
      setManualMarkStatus(uif("markScreenshotShareFailedDownloaded", { error: error?.message || String(error) }));
      if (button) button.disabled = false;
      return Promise.resolve(true);
    }

    return Promise.resolve(shareResult)
      .then(() => {
        setManualMarkStatus(ui("markScreenshotShared"));
        return true;
      })
      .catch((error) => {
        if (error?.name === "AbortError") {
          setManualMarkStatus(ui("markScreenshotShareCancelled"));
          return false;
        }
        downloadBlob(blob, filename);
        setManualMarkStatus(uif("markScreenshotShareFailedDownloaded", { error: error?.message || String(error) }));
        return true;
      })
      .finally(() => {
        if (button) button.disabled = false;
      });
  };

  if (manualScreenshotPrefersSystemShare()) {
    const cachedBlob = manualScreenshotCachedBlob();
    if (cachedBlob) return shareMobileBlob(cachedBlob);

    // Normally unreachable because the mobile button remains disabled while
    // the WYSIWYG cache is refreshing. Keep a fresh async fallback for unusual
    // browsers that dispatch a click despite the disabled transition.
    return refreshManualScreenshotDomCache()
      .then((cache) => {
        const blob = cache?.blob || manualScreenshotCachedBlob();
        if (!blob) throw new Error("dom-screenshot-cache");
        return shareMobileBlob(blob);
      })
      .catch((error) => {
        setManualMarkStatus(uif("markScreenshotFailed", { error: error?.message || String(error) }));
        if (button) button.disabled = false;
        return false;
      });
  }

  return (async () => {
    try {
      const blob = await captureBoardStagePngBlob();
      const filename = manualScreenshotFilename();
      if (window.isSecureContext && navigator.clipboard?.write && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setManualMarkStatus(ui("markScreenshotCopied"));
          return true;
        } catch {
          // Preserve the existing desktop fallback when image clipboard access is denied.
        }
      }

      downloadBlob(blob, filename);
      setManualMarkStatus(ui("markScreenshotDownloaded"));
      return true;
    } catch (error) {
      setManualMarkStatus(uif("markScreenshotFailed", { error: error?.message || String(error) }));
      return false;
    } finally {
      if (button) button.disabled = false;
    }
  })();
}

function cleanManualEasySteps(maxSteps = 200) {
  if (!engine) return { count: 0, stopped: "engine" };
  let cleaned = 0;
  let stopped = "none";
  for (let guard = 0; guard < maxSteps; guard += 1) {
    const stepText = engine.next_step_json();
    const step = parseJson(stepText);
    if (!step || step.ok === false) {
      stopped = step?.error || "no-step";
      break;
    }
    if (step.done || step.solved || !step.kind) {
      stopped = "done";
      break;
    }
    if (!isManualMarkEasyCleaningStep(step)) {
      stopped = step.kind || step.title || "advanced-step";
      resetEngineHintCacheToCurrentSnapshot();
      break;
    }
    const appliedText = engine.apply_hint_json();
    const applied = parseJson(appliedText);
    if (!applied?.ok) {
      stopped = applied?.error || "apply-failed";
      break;
    }
    applySnapshotRefreshState(applied.state);
    cleaned += 1;
  }
  if (cleaned >= maxSteps) stopped = "limit";
  currentHint = null;
  renderBoardSnapshot(currentSnapshot, null);
  updateInputControls();
  return { count: cleaned, stopped };
}

async function applyManualMarkedEliminations() {
  if (!engine || !currentSnapshot) {
    setManualMarkStatus(ui("markNoElims"));
    return;
  }
  let applied = 0;
  let lastResponse = "";
  const keys = [...manualMarks.eliminations];
  for (const key of keys) {
    const { cell, digit } = manualMarkParseKey(key);
    const snapshotCell = currentSnapshot?.cells?.[cell];
    if (snapshotCell?.value > 0) continue;
    if (!Array.isArray(snapshotCell?.candidates) || !snapshotCell.candidates.includes(digit)) continue;
    lastResponse = engine.toggle_candidate_json(cell, digit);
    applied += 1;
    manualMarks.eliminations.delete(key);
  }
  if (applied > 0 && lastResponse) {
    refreshAfterEdit(lastResponse);
  } else {
    renderBoardSnapshot(currentSnapshot, currentHint);
  }

  const shouldCleanEasy = !!manualMarkCleanEasy?.checked;
  let cleaned = 0;
  if (shouldCleanEasy) {
    const cleanResult = cleanManualEasySteps();
    cleaned = cleanResult.count || 0;
  }

  if (applied > 0 && cleaned > 0) {
    setManualMarkStatus(uif("markAppliedElimsWithClean", { count: applied, easy: cleaned }));
  } else if (applied > 0) {
    setManualMarkStatus(uif("markAppliedElims", { count: applied }));
  } else if (cleaned > 0) {
    setManualMarkStatus(uif("markNoElimsButCleaned", { easy: cleaned }));
  } else {
    setManualMarkStatus(ui("markNoElims"));
  }
}

function initManualMarksControls() {
  buildManualMarkSwatches();
  manualMarksPanel?.addEventListener("toggle", () => {
    if (manualMarksActive() && !manualMarksPanel.open) {
      manualMarksPanel.open = true;
    }
  });
  manualMarkMode?.addEventListener("change", () => {
    manualChainStart = null;
    manualMiniRegionStart = null;
    updateManualMarkControls();
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(manualMarksActive() ? ui("markModeHint") : ui("markOffStatus"));
  });
  manualMarkLineType?.addEventListener("change", () => {
    const weak = String(manualMarkLineType.value).toLowerCase().includes("weak");
    manualMarkButton = weak ? "secondary" : "primary";
    updateManualMarkControls();
  });
  manualMarkPrimary?.addEventListener("click", () => {
    manualMarkButton = "primary";
    const mode = manualMarkModeValue();
    if (manualMarkLineType && mode === "chain") manualMarkLineType.value = "strong";
    if (manualMarkLineType && mode === "construction") manualMarkLineType.value = "constructionStrong";
    updateManualMarkControls();
  });
  manualMarkSecondary?.addEventListener("click", () => {
    manualMarkButton = "secondary";
    const mode = manualMarkModeValue();
    if (manualMarkLineType && mode === "chain") manualMarkLineType.value = "weak";
    if (manualMarkLineType && mode === "construction") manualMarkLineType.value = "constructionWeak";
    updateManualMarkControls();
  });
  manualMarkAddColor?.addEventListener("click", () => {
    const bg = normalizeManualColor(manualMarkCustomColor?.value || "");
    if (!bg) return;
    let existing = MANUAL_MARK_COLORS.find((color) => normalizeManualColor(color.bg) === bg);
    if (!existing) {
      existing = { id: `custom-${bg.slice(1)}`, bg, text: manualColorTextFor(bg), custom: true };
      MANUAL_MARK_COLORS.push(existing);
      saveManualCustomColors();
      buildManualMarkSwatches();
      setManualMarkStatus(ui("markColorAdded"));
    }
    manualMarkColorId = String(existing.id);
    updateManualMarkControls();
  });
  manualMarkApplyElims?.addEventListener("click", applyManualMarkedEliminations);
  manualMarkScreenshot?.addEventListener("click", shareManualBoardScreenshot);
  manualMarkClear?.addEventListener("click", clearManualMarks);
  manualMarkUndoLine?.addEventListener("click", () => {
    if (manualMarkModeValue() === "miniRegion") manualMarks.miniRegions.pop();
    else manualMarks.chains.pop();
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(ui("markLineUndone"));
  });
  manualMarkCancelChain?.addEventListener("click", () => {
    manualChainStart = null;
    manualMiniRegionStart = null;
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(ui("markChainCancelled"));
  });
  manualMarkFinishBlock?.addEventListener("click", finishManualBlockDraft);
  manualMarkUndoBlock?.addEventListener("click", undoManualBlock);
  board?.addEventListener("contextmenu", (event) => {
    if (manualMarksActive()) event.preventDefault();
  });
  window.addEventListener("resize", () => {
    if (manualMarks.chains.length > 0 || manualMarks.miniRegions.length > 0) window.requestAnimationFrame(renderManualMarkOverlay);
    invalidateManualScreenshotDomCache();
  }, { passive: true });
  updateManualMarkControls();
}

function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setButtonText(button, value) {
  if (!button) return;
  const label = button.querySelector(".action-label");
  if (label) label.textContent = value;
  else button.textContent = value;
  button.title = value;
  button.setAttribute("aria-label", value);
}


function setTitleAndAria(el, value) {
  if (!el) return;
  el.title = value;
  el.setAttribute("aria-label", value);
}

function setInputLabelByControl(controlId, value) {
  const control = document.getElementById(controlId);
  const label = control?.closest(".generate-options") || control?.closest("label");
  const span = label?.querySelector(":scope > span");
  if (span) span.textContent = value;
}

function setLocalizedTexts(bindings) {
  for (const binding of bindings) {
    const [id, key] = typeof binding === "string" ? [binding, binding] : binding;
    setTextById(id, ui(key));
  }
}

function setLocalizedButtons(bindings) {
  for (const [button, key] of bindings) setButtonText(button, ui(key));
}

function setLocalizedSelectOptions(select, labels) {
  if (!select) return;
  for (const option of select.options) {
    const key = labels[option.value];
    if (key) option.textContent = ui(key);
  }
}

function currentDifficultyLanguage() {
  return lang?.value === "en" ? "en" : "zh";
}

function difficultyLabel(value, { withRange = false } = {}) {
  const descriptor = difficultyDescriptor(value, currentDifficultyLanguage());
  return withRange ? descriptor.label : descriptor.name;
}

function difficultyControlLevels(container, selector) {
  return [...(container?.querySelectorAll(selector) || [])].map((node) => Number(node.value));
}

function difficultyControlsMatch(levels) {
  const desktopLevels = difficultySelect ? [...difficultySelect.options].map((option) => Number(option.value)) : levels;
  const mobileLevels = mobileSolveNewPuzzleOptions
    ? difficultyControlLevels(mobileSolveNewPuzzleOptions, 'input[name="mobileSolveNewPuzzleDifficulty"]')
    : levels;
  return desktopLevels.length === levels.length
    && mobileLevels.length === levels.length
    && levels.every((level, index) => desktopLevels[index] === level && mobileLevels[index] === level);
}

function rebuildDifficultyControls(levels) {
  const selectedDesktop = String(difficultySelect?.value || "0");
  const selectedMobile = mobileSolveNewPuzzleOptions
    ?.querySelector('input[name="mobileSolveNewPuzzleDifficulty"]:checked')?.value || selectedDesktop;

  if (difficultySelect) {
    const fragment = document.createDocumentFragment();
    for (const level of levels) {
      const option = document.createElement("option");
      option.value = String(level);
      fragment.appendChild(option);
    }
    difficultySelect.replaceChildren(fragment);
    difficultySelect.value = levels.includes(Number(selectedDesktop)) ? selectedDesktop : "0";
  }

  if (mobileSolveNewPuzzleOptions) {
    const fragment = document.createDocumentFragment();
    for (const level of levels) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "mobileSolveNewPuzzleDifficulty";
      input.value = String(level);
      const text = document.createElement("span");
      const name = document.createElement("b");
      name.dataset.difficultyName = String(level);
      const range = document.createElement("small");
      range.dataset.difficultyRange = String(level);
      text.append(name, range);
      label.append(input, text);
      fragment.appendChild(label);
    }
    mobileSolveNewPuzzleOptions.replaceChildren(fragment);
    const checked = mobileSolveNewPuzzleOptions.querySelector(`input[name="mobileSolveNewPuzzleDifficulty"][value="${selectedMobile}"]`)
      || mobileSolveNewPuzzleOptions.querySelector('input[name="mobileSolveNewPuzzleDifficulty"][value="0"]');
    if (checked) checked.checked = true;
  }
}

function updateDifficultySelectCompactWidth() {
  if (!difficultySelect) return;
  const text = String(difficultySelect.selectedOptions?.[0]?.textContent || "").trim();
  let units = 0;
  for (const ch of text) units += ch.codePointAt(0) > 0x7f ? 2 : 1;
  const width = Math.max(124, Math.min(196, 30 + units * 6.2));
  difficultySelect.style.width = `${Math.round(width)}px`;
}

function updateDifficultyControlsLanguage() {
  const levels = difficultyLevels();
  if (!difficultyControlsMatch(levels)) rebuildDifficultyControls(levels);

  for (const level of levels) {
    const descriptor = difficultyDescriptor(level, currentDifficultyLanguage());
    const option = difficultySelect?.querySelector(`option[value="${level}"]`);
    if (option) {
      option.textContent = descriptor.label;
      option.title = descriptor.label;
    }
    const mobileName = mobileSolveNewPuzzleOptions?.querySelector(`[data-difficulty-name="${level}"]`);
    const mobileRange = mobileSolveNewPuzzleOptions?.querySelector(`[data-difficulty-range="${level}"]`);
    if (mobileName) mobileName.textContent = descriptor.name;
    if (mobileRange) mobileRange.textContent = descriptor.range;
  }
  updateDifficultySelectCompactWidth();
}

function applyStaticLanguage() {
  document.documentElement.lang = lang.value === "en" ? "en" : "zh-CN";
  const linkLangSuffix = `?lang=${encodeURIComponent(lang.value || "zh")}`;
  const manualLinkEl = document.getElementById("manualLink");
  if (manualLinkEl) manualLinkEl.href = `./user_manual.html${linkLangSuffix}&v=${encodeURIComponent(MANUAL_VERSION)}`;
  const techniquesLinkEl = document.getElementById("techniquesLink");
  if (techniquesLinkEl) techniquesLinkEl.href = `./techniques.html${linkLangSuffix}`;
  setLocalizedTexts([
    "brandSubtitle", "manualLink", ["techniquesLink", "techniqueHelp"], "boardHeading",
  ]);
  if (yzfHintBaseText === (lang.value === "en" ? uiText.zh.initialHint : uiText.en.initialHint)) {
    yzfHintBaseText = ui("initialHint");
  }
  if (!currentHint && !currentSnapshot && !lastSolveData) {
    yzfHintBaseText = ui("initialHint");
  }
  renderYzfBranchHintPanel();
  document.querySelector(".global-actions")?.setAttribute("aria-label", ui("mainActionsLabel"));
  if (numpad) numpad.setAttribute("aria-label", ui("numberPadLabel"));
  setLocalizedButtons([
    [btnGenerate, "generate"], [btnGenerateTraining, "generateTraining"], [btnLoad, "load"],
    [btnUndo, "undo"], [btnRedo, "redo"], [btnStep, "step"], [btnAllSteps, "allSteps"],
    [btnSolve, "solve"], [btnApply, "apply"], [btnStepExplain, "stepExplain"],
    [btnTechAllIn, "techPresetAll"], [btnTechHighSpeed, "techPresetHighSpeed"],
    [btnTechExtremeSpeed, "techPresetExtremeSpeed"], [btnTechWhipRating, "techPresetWhipRating"],
    [btnTechBraidRating, "techPresetBraidRating"],
  ]);
  setLocalizedTexts([
    ["stepExplainDialogTitle", "stepExplainTitle"], ["stepExplainDialogClose", "close"],
  ]);
  updateStepExplainButtonState();
  if (stepExplainDialog?.open && currentStepExplainContext?.step) {
    refreshOpenStepExplanationDialog();
  }
  updateFullscreenButton();
  updateMobileSolveLanguage();
  setLocalizedTexts([
    ["tabBtnControls", "controls"], ["tabBtnTechniques", "techniques"],
    ["tabBtnPath", "path"], ["tabBtnAllSteps", "allSteps"],
  ]);
  setInputLabelByControl("difficultySelect", ui("difficulty"));
  updateDifficultyControlsLanguage();
  setInputLabelByControl("trainingTechniqueSelect", ui("training"));
  if (difficultySelect) {
    difficultySelect.title = ui("difficultyTitle");
    difficultySelect.setAttribute("aria-label", ui("difficulty"));
  }
  if (trainingTechniqueSelect) {
    trainingTechniqueSelect.title = ui("trainingTitle");
    trainingTechniqueSelect.setAttribute("aria-label", ui("training"));
  }
  setTextById("trainingOtpLabel", ui("trainingOtpLabel"));
  if (trainingOtpOption) {
    trainingOtpOption.title = ui("trainingOtpTitle");
    trainingOtpOption.setAttribute("aria-label", ui("trainingOtpTitle"));
  }
  setLocalizedTexts([
    ["trainingTextFilterButtonText", "trainingTextFilterButton"],
    ["trainingTextFilterDialogTitle", "trainingTextFilterTitle"],
    "trainingTextFilterIntro", "trainingTextFilterIncludeLabel", "trainingTextFilterIncludeHint",
    "trainingTextFilterExcludeLabel", "trainingTextFilterExcludeHint", ["trainingTextFilterCaseSensitiveLabel", "trainingTextFilterCaseSensitive"],
    ["btnTrainingTextFilterClear", "trainingTextFilterClear"],
    ["btnTrainingTextFilterCancel", "trainingTextFilterCancel"],
    ["btnTrainingTextFilterApply", "trainingTextFilterApply"],
  ]);
  if (trainingTextFilterInclude) trainingTextFilterInclude.placeholder = ui("trainingTextFilterIncludePlaceholder");
  if (trainingTextFilterExclude) trainingTextFilterExclude.placeholder = ui("trainingTextFilterExcludePlaceholder");
  if (btnTrainingTextFilterClose) btnTrainingTextFilterClose.setAttribute("aria-label", ui("close"));
  updateTrainingTextFilterButton();
  setLocalizedTexts([
    "tlgSolverTitle", ["tlgSolverEnableLabel", "tlgSolverEnable"], "tlgSolverModeLabel",
    ["tlgSolverAurGroupLabel", "tlgAurGroupLabel"], ["tlgSolverVirtualGroupLabel", "tlgVirtualGroupLabel"], "tlgSolverLinkTypeLabel",
    ["tlgSolverTruthsToApplyLabel", "tlgTruthsToApply"], ["tlgSolverAurPremiseModeLabel", "tlgAurPremiseModeLabel"],
    ["btnTlgImportCandidates", "tlgImportCandidates"], ["btnTlgFindEliminations", "tlgFindEliminations"],
    ["btnTlgConvertTruths", "tlgConvertTruths"], ["btnTlgRemoveUnused", "tlgRemoveUnused"],
    ["btnTlgClear", "tlgClearState"], ["btnTlgLibrary", "tlgLibraryButton"], "tlgLibraryDialogTitle",
    ["btnTlgLibraryRead", "tlgLibraryReadAction"], ["btnTlgLibraryInsert", "tlgLibraryInsertAction"],
    ["btnTlgLibraryReplace", "tlgLibraryReplaceAction"], ["btnTlgLibraryAppend", "tlgLibraryAppendAction"],
    ["btnTlgLibraryDelete", "tlgLibraryDeleteAction"], "tlgLibraryImportModeLabel",
    ["btnTlgLibraryImport", "tlgLibraryImportAction"],
    ["btnTlgLibraryExportSelected", "tlgLibraryExportSelectedAction"],
    ["btnTlgLibraryExportAll", "tlgLibraryExportAllAction"],
    ["btnTlgLibraryCopyText", "tlgLibraryCopyTextAction"],
    ["btnTlgLibraryCopyCompact", "tlgLibraryCopyCompactAction"],
    ["btnTlgLibraryPasteText", "tlgLibraryPasteTextAction"],
    ["btnTlgLibraryImportText", "tlgLibraryImportTextAction"],
    ["btnTlgLibraryExportText", "tlgLibraryExportTextAction"], "tlgLibraryShareTextLabel",
    ["btnTlgLibraryLoadText", "tlgLibraryLoadTextAction"],
    ["btnTlgLibraryClearText", "tlgLibraryClearTextAction"],
    ["btnTlgLibraryCloseText", "tlgLibraryCloseTextAction"],
    "tlgLibraryColumnIndex", "tlgLibraryColumnTitle", "tlgLibraryColumnType", "tlgLibraryColumnResult",
    "tlgLibraryEmpty", "tlgLibraryTitleLabel", "tlgLibraryTagsLabel", "tlgLibrarySourceLabel", "tlgLibraryNotesLabel",
  ]);
  setTitleAndAria(btnTlgLibraryClose, ui("close"));
  if (tlgLibrarySearch) {
    tlgLibrarySearch.placeholder = ui("tlgLibrarySearchPlaceholder");
    tlgLibrarySearch.setAttribute("aria-label", ui("tlgLibrarySearchPlaceholder"));
  }
  if (tlgLibraryTags) tlgLibraryTags.placeholder = ui("tlgLibraryTagsPlaceholder");
  if (tlgLibraryShareText) {
    tlgLibraryShareText.placeholder = ui("tlgLibraryShareTextPlaceholder");
    tlgLibraryShareText.setAttribute("aria-label", ui("tlgLibraryShareTextLabel"));
  }
  if (tlgLibraryShareSummary) {
    if (String(tlgLibraryShareText?.value || "").trim()) tlgLibraryPreviewShareText();
    else tlgLibraryShareSummary.textContent = ui("tlgLibraryShareEmptyHint");
  }
  setLocalizedSelectOptions(tlgLibraryImportMode, {
    append: "tlgLibraryImportAppend", insert: "tlgLibraryImportInsert", replaceAll: "tlgLibraryImportReplaceAll",
  });
  document.querySelector(".tlg-library-toolbar")?.setAttribute("aria-label", ui("tlgLibraryToolbarAria"));
  document.querySelector(".tlg-library-sharebar")?.setAttribute("aria-label", ui("tlgLibraryShareToolbarAria"));
  document.querySelector(".tlg-library-list-panel")?.setAttribute("aria-label", ui("tlgLibraryRecordListAria"));
  document.querySelector(".tlg-library-editor")?.setAttribute("aria-label", ui("tlgLibraryEditorAria"));
  if (tlgLibraryDialog?.open) renderTlgLibrary();
  setLocalizedTexts([
    ["tlgSolverStateTitle", "tlgStateTitle"], ["tlgSolverSolutionTitle", "tlgSolutionTitle"],
    ["tlgSolverDebugSummary", "tlgDebugImport"],
  ]);
  document.querySelector(".tlg-solver-controls")?.setAttribute("aria-label", ui("tlgActionsAria"));
  if (tlgSolverImportText) tlgSolverImportText.placeholder = ui("tlgDebugPlaceholder");
  setLocalizedSelectOptions(tlgSolverMode, {
    truths: "tlgModeTruths", links: "tlgModeLinks", virtualSet: "tlgModeVirtualSet",
    aur: "tlgModeAur", daur: "tlgModeDaur", gur: "tlgModeGur",
  });
  setLocalizedSelectOptions(tlgSolverAurGroup, { "0": "tlgAurGroup1", "1": "tlgAurGroup2" });
  setLocalizedSelectOptions(tlgSolverVirtualGroup, { "0": "tlgVirtualSet1", "1": "tlgVirtualSet2" });
  setLocalizedSelectOptions(tlgSolverLinkType, {
    auto: "tlgLinkAuto", rowColumn: "tlgLinkRowColumn", box: "tlgLinkBox", cell: "tlgLinkCell",
  });
  setLocalizedSelectOptions(tlgSolverAurPremiseMode, {
    "unique-puzzle-derived": "tlgAurPremiseUnique",
    "candidate-grid-asserted": "tlgAurPremiseTraining",
  });
  if (tlgSolverStatus && (tlgSolverStatus.textContent === uiText.zh.tlgStatusOptional || tlgSolverStatus.textContent === uiText.en.tlgStatusOptional || /TLG Solver/.test(tlgSolverStatus.textContent))) {
    updateTlgSolverUi();
  }
  const batchSummary = document.querySelector(".input-panel.batch-panel summary") || [...document.querySelectorAll(".input-panel summary")].find((el) => /批量|Batch/i.test(el.textContent));
  if (batchSummary) batchSummary.textContent = ui("batchGenerate");
  setInputLabelByControl("batchMode", ui("batchMode"));
  setInputLabelByControl("batchFilename", ui("filename"));
  setInputLabelByControl("batchSolveFile", ui("batchSolveFile"));
  updateBatchModeLabels();
  setLocalizedTexts([["btnBatchGenerate", "startBatch"], ["btnBatchStop", "stop"]]);
  if (batchStatus && (batchStatus.textContent === uiText.zh.batchStatusIdle || batchStatus.textContent === uiText.en.batchStatusIdle)) {
    batchStatus.textContent = ui("batchStatusIdle");
  }
  const moreSummary = [...document.querySelectorAll(".input-panel summary")].find((el) => /更多|More/i.test(el.textContent));
  if (moreSummary) moreSummary.textContent = ui("moreInput");
  setLocalizedTexts([
    ["preferClipboardLoadLabel", "preferClipboardLoad"], ["btnExportPuzzle", "exportPuzzle"], ["btnSharePuzzle", "sharePuzzle"],
    ["btnClearSavedSession", "clearSavedSession"], ["btnImageOcrPickText", "ocrPickImage"],
    ["btnImageOcrCameraText", "ocrCameraImage"], ["btnImageOcrClipboard", "ocrClipboardImage"],
  ]);
  setTitleAndAria(document.getElementById("preferClipboardLoadChip"), ui("preferClipboardLoadTitle"));
  setTitleAndAria(btnSharePuzzle, ui("sharePuzzleTitle"));
  updateExportFormatLabels();
  setTitleAndAria(btnClearSavedSession, ui("clearSavedSessionTitle"));
  setTextById("btnRate", ratingTask ? ui("rateCancel") : ui("ratePuzzle"));
  document.querySelector(".all-steps-filter")?.setAttribute("aria-label", ui("allStepsFilterAria"));
  if (allStepsFilterText) {
    allStepsFilterText.placeholder = ui("allStepsFilterPlaceholder");
    allStepsFilterText.setAttribute("aria-label", ui("allStepsFilterPlaceholder"));
  }
  if (allStepsFilterTechnique) allStepsFilterTechnique.setAttribute("aria-label", ui("filterByTechnique"));
  if (allStepsSortMode) allStepsSortMode.setAttribute("aria-label", ui("allStepsSortAria"));
  if (allStepsFilterTechnique?.options?.[0]) allStepsFilterTechnique.options[0].textContent = ui("allTechniques");
  if (allStepsSortMode?.options?.[0]) allStepsSortMode.options[0].textContent = ui("defaultSort");
  if (allStepsSortMode?.options?.[1]) allStepsSortMode.options[1].textContent = ui("conclusionSort");
  const replaceableLabel = allStepsFilterReplaceable?.closest("label");
  if (replaceableLabel) {
    const input = allStepsFilterReplaceable;
    replaceableLabel.replaceChildren(input, document.createTextNode(` ${ui("replaceable")}`));
  }
  setLocalizedTexts([["allStepsFilterClear", "clear"]]);
  if (allStepsFilterStatus && (allStepsFilterStatus.textContent === uiText.zh.noAllSteps || allStepsFilterStatus.textContent === uiText.en.noAllSteps)) {
    allStepsFilterStatus.textContent = ui("noAllSteps");
  }
  setLocalizedTexts([["yzfOverlayModeNote", "overlayDebugOnly"]]);
  const legendSummary = document.querySelector(".yzf-debug-legend summary");
  if (legendSummary) legendSummary.textContent = ui("overlayLegend");
  const legendItems = [...document.querySelectorAll(".yzf-debug-legend .yzf-legend-item span:last-child")];
  ["onNode", "offNode", "groupedSector", "strongEdge", "weakEdge", "groupEdge", "afAux", "debugCandidate"].forEach((key, idx) => {
    if (legendItems[idx]) legendItems[idx].textContent = ui(key);
  });

  setLocalizedTexts([
    "manualMarksTitle", "manualMarkModeLabel", "manualMarkLineLabel", "manualMarkColorLabel",
    ["manualMarkAddColorText", "markAddColor"],
  ]);
  document.querySelector(".manual-mark-actions")?.setAttribute("aria-label", ui("manualMarkActionLabel"));
  if (manualMarkSwatches) manualMarkSwatches.setAttribute("aria-label", ui("manualMarkColorsLabel"));
  if (manualMarkCustomColor) manualMarkCustomColor.title = ui("markCustomColorTitle");
  setLocalizedSelectOptions(manualMarkMode, {
    off: "markModeOff", cellColor: "markCellColor", candidateColor: "markCandidateColor",
    circle: "markCircle", preElim: "markPreElim", elim: "markElim", chain: "markChain",
    construction: "markConstruction", miniRegion: "markMiniRegion", block: "markBlock",
  });
  setLocalizedSelectOptions(manualMarkLineType, {
    strong: "markStrong", weak: "markWeak",
    constructionStrong: "markConstructionStrong", constructionWeak: "markConstructionWeak",
  });
  setLocalizedTexts([
    ["manualMarkPrimary", "markPrimary"], ["manualMarkSecondary", "markSecondary"],
    ["manualMarkApplyElims", "markApplyElims"], ["manualMarkScreenshot", "markScreenshotButton"],
    ["manualMarkCleanEasyLabel", "markCleanEasy"], ["manualMarkClear", "markClearAll"],
    ["manualMarkUndoLine", "markUndoLine"], ["manualMarkCancelChain", "markCancelChain"],
    ["manualMarkFinishBlock", "markFinishBlock"], ["manualMarkUndoBlock", "markUndoBlock"],
  ]);
  setTitleAndAria(manualMarkPrimary, ui("markPrimaryTitle"));
  setTitleAndAria(manualMarkSecondary, ui("markSecondaryTitle"));
  setTitleAndAria(manualMarkScreenshot, ui("markScreenshotTitle"));
  if (manualMarkStatus && (manualMarkStatus.textContent === uiText.zh.markOffStatus || manualMarkStatus.textContent === uiText.en.markOffStatus || manualMarkStatus.textContent === "关闭标记。")) {
    manualMarkStatus.textContent = manualMarksActive() ? ui("markModeHint") : ui("markOffStatus");
  }
  buildManualMarkSwatches();
  updateManualMarkControls();
  renderTrainingTechniqueOptionsOnly();
  updateInputControls();
  refreshPwaStatusLanguage();
}

function text(key) {
  return i18n[lang.value][key];
}

function techniqueName(step) {
  return techniqueNameForStep(step, lang.value);
}

function isWhipOrBraidStep(step) {
  return /^(Whip|GWhip|Braid|GBraid)$/i.test(String(step?.kind || ""));
}

function stepChainLength(step) {
  const explicit = Number(step?.chainLength ?? step?.chain_length ?? 0);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;

  // Compatibility with pre-fix JSON where Whip/Braid length was published as rank.
  const legacy = Number(step?.rank || 0);
  return isWhipOrBraidStep(step) && Number.isFinite(legacy) && legacy > 0 ? legacy : 0;
}

function stepHasStrictRank(step) {
  return step?.rankAvailable === true || step?.rank_available === true;
}

function stepStrictRank(step) {
  return stepHasStrictRank(step) ? Number(step?.rank || 0) : 0;
}

function stepDisplayName(step) {
  const base = techniqueName(step);
  const chainLength = stepChainLength(step);
  if (chainLength > 0 && isWhipOrBraidStep(step) && !/\[\d+\]/.test(base)) {
    return `${base}[${chainLength}]`;
  }
  return base;
}

function categoryName(category) {
  return categoryNameForLocale(category, lang.value);
}

function paintBeforeLongTask() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 50);
      });
    });
  });
}

function debugLog(value) {
  if (!APP_DEBUG_MODE) return;
  console.debug("[YZF]", value);
}

function debugLogUi(key, values = null) {
  debugLog(values ? uif(key, values) : ui(key));
}

function relocalizeIfExactText(element, key) {
  if (!element) return;
  const text = element.textContent || "";
  if (text === (uiText.zh?.[key] || "") || text === (uiText.en?.[key] || "")) {
    element.textContent = ui(key);
  }
}

function setStatus(message) {
  clearYzfBranchContext({ preserveHint: false });
  setYzfHintBaseText(message);
}

function activateTab(name) {
  for (const button of tabButtons) {
    const active = button.dataset.tab === name;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  }
  for (const panel of tabPanels) {
    panel.hidden = panel.dataset.tabPanel !== name;
  }
}

function formatRating(rating) {
  if (!rating) return ui("unrated");
  const yzf = rating.yzfRate?.score != null ? `, YZFRate=${rating.yzfRate.score}` : "";
  const body = `ER=${rating.er}, EP=${rating.ep}, ED=${rating.ed}${rating.aig != null ? `, AIG=${rating.aig}` : ""}${yzf}`;
  if (!rating.ok) {
    return uif("ratingFailed", { rating: body });
  }
  return `ER=${rating.er}, EP=${rating.ep}, ED=${rating.ed}${yzf}`;
}

function selectedDifficultyLabel() {
  return difficultyLabel(difficultySelect?.value || 0, { withRange: true });
}

function normalizePuzzle(text) {
  const chars = [...text.trim()].filter((ch) => /[0-9.]/.test(ch));
  while (chars.length < 81) chars.push(".");
  return chars.slice(0, 81).map((ch) => (ch === "0" ? "." : ch)).join("");
}

function snapshotBoardString(snapshot = currentSnapshot) {
  const boardText = snapshot?.board || "";
  return boardText.length === 81 ? boardText.replaceAll("0", ".") : "";
}

function snapshotGivensString(snapshot = currentSnapshot) {
  const givensText = snapshot?.givens || "";
  if (givensText.length === 81) return givensText.replaceAll("0", ".");
  return normalizePuzzle(originalBoard || givens.value || "");
}

function snapshotMatchesOriginal(snapshot = currentSnapshot) {
  const boardText = snapshotBoardString(snapshot);
  const givensText = snapshotGivensString(snapshot);
  return boardText.length === 81 && givensText.length === 81 && boardText === givensText;
}

function mobileSolveSnapshotSignature(snapshot = currentSnapshot) {
  if (!snapshot) return "";
  const cells = Array.isArray(snapshot.cells) ? snapshot.cells : [];
  return JSON.stringify({
    board: snapshotBoardString(snapshot),
    givens: snapshotGivensString(snapshot),
    cells: cells.map((cell) => [Number(cell?.value || 0), ...(Array.isArray(cell?.candidates) ? cell.candidates.map(Number) : [])]),
  });
}

function mobileSolveManualMarksHaveContent() {
  return manualMarks.cellColors.size > 0
    || manualMarks.candidateColors.size > 0
    || manualMarks.circles.size > 0
    || manualMarks.preEliminations.size > 0
    || manualMarks.eliminations.size > 0
    || manualMarks.chains.length > 0
    || manualMarks.miniRegions.length > 0
    || manualMarks.blocks.length > 0
    || Boolean(manualBlockDraft?.nodes?.length)
    || Boolean(manualChainStart)
    || Boolean(manualMiniRegionStart);
}

function mobileSolveCurrentPuzzleHasProgress() {
  if (mobileSolveManualMarksHaveContent()) return true;
  if (!currentSnapshot) return false;
  const currentSignature = mobileSolveSnapshotSignature(currentSnapshot);
  if (mobileSolvePuzzleBaselineSignature) return currentSignature !== mobileSolvePuzzleBaselineSignature;
  return !snapshotMatchesOriginal(currentSnapshot);
}

function candidateMaskFromArray(values) {
  return (values || []).reduce((mask, digit) => mask | (1 << digit), 0);
}

function peerIndexes(index) {
  const peers = new Set();
  const row = Math.floor(index / 9);
  const col = index % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let c = 0; c < 9; c += 1) peers.add(row * 9 + c);
  for (let r = 0; r < 9; r += 1) peers.add(r * 9 + col);
  for (let dr = 0; dr < 3; dr += 1) {
    for (let dc = 0; dc < 3; dc += 1) {
      peers.add((boxRow + dr) * 9 + boxCol + dc);
    }
  }
  peers.delete(index);
  return [...peers];
}

function legalCandidateMaskForBoard(boardText, index) {
  if (/[1-9]/.test(boardText[index] || ".")) return 0;
  let mask = 0x3fe;
  for (const peer of peerIndexes(index)) {
    const digit = Number(boardText[peer] || 0);
    if (digit >= 1 && digit <= 9) {
      mask &= ~(1 << digit);
    }
  }
  return mask;
}

function cloneSnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.cells)) return null;
  const revision = Number(snapshot.revision ?? snapshot.version ?? 0) + 1;
  return {
    ...snapshot,
    version: revision,
    revision,
    stateHash: "",
    givens: snapshotGivensString(snapshot),
    cells: snapshot.cells.map((cell, index) => ({
      index,
      row: Math.floor(index / 9),
      col: index % 9,
      value: Number(cell?.value || 0),
      given: Boolean(cell?.given),
      count: Number(cell?.count || 0),
      candidates: Array.isArray(cell?.candidates) ? [...cell.candidates] : [],
    })),
  };
}

function stepPlacementActions(step) {
  const actions = Array.isArray(step?.actions) ? step.actions : [];
  const placements = Array.isArray(step?.placements) ? step.placements : [];
  return [...actions.filter((action) => action.type === "place"), ...placements]
    .map((action) => ({
      ...action,
      index: Number.isInteger(action.index) ? action.index : cellIndex(action.row, action.col),
      value: Number(action.value),
    }))
    .filter((action) => action.index >= 0 && action.index < 81 && action.value >= 1 && action.value <= 9);
}

function stepEliminationActions(step) {
  return (Array.isArray(step?.eliminations) ? step.eliminations : [])
    .map((action) => ({
      ...action,
      index: Number.isInteger(action.index) ? action.index : cellIndex(action.row, action.col),
      candidates: Array.isArray(action.candidates) ? action.candidates.map(Number) : [],
    }))
    .filter((action) => action.index >= 0 && action.index < 81 && action.candidates.length > 0);
}

function normalizeSnapshotCells(snapshot) {
  const boardText = snapshotBoardString(snapshot);
  for (let index = 0; index < 81; index += 1) {
    const cell = snapshot.cells[index];
    const value = Number(boardText[index] || 0);
    cell.index = index;
    cell.row = Math.floor(index / 9);
    cell.col = index % 9;
    cell.value = value >= 1 && value <= 9 ? value : Number(cell.value || 0);
    if (cell.value > 0) {
      cell.candidates = [];
    } else {
      cell.candidates = [...new Set(cell.candidates || [])]
        .map(Number)
        .filter((digit) => digit >= 1 && digit <= 9)
        .sort((a, b) => a - b);
    }
    cell.count = cell.candidates.length;
  }
}

function applyStepToSnapshot(snapshot, step) {
  const next = cloneSnapshot(snapshot);
  const boardText = snapshotBoardString(next);
  if (!next || boardText.length !== 81) return null;

  const boardChars = [...boardText];
  for (const action of stepEliminationActions(step)) {
    const cell = next.cells[action.index];
    if (!cell || cell.value > 0) continue;
    const removed = new Set(action.candidates);
    cell.candidates = (cell.candidates || []).filter((digit) => !removed.has(digit));
  }

  for (const action of stepPlacementActions(step)) {
    const cell = next.cells[action.index];
    if (!cell) continue;
    boardChars[action.index] = String(action.value);
    cell.value = action.value;
    cell.candidates = [];

    const removedMask = 1 << action.value;
    for (const peer of peerIndexes(action.index)) {
      const peerCell = next.cells[peer];
      if (!peerCell || peerCell.value > 0) continue;
      peerCell.candidates = (peerCell.candidates || []).filter((digit) => (removedMask & (1 << digit)) === 0);
    }
  }

  next.board = boardChars.join("");
  normalizeSnapshotCells(next);
  return next;
}

function snapshotToLibraryString(snapshot = currentSnapshot) {
  const boardText = snapshotBoardString(snapshot);
  if (boardText.length !== 81 || !Array.isArray(snapshot?.cells)) {
    return "";
  }

  const original = snapshotGivensString(snapshot);
  let boardPart = "";
  for (let index = 0; index < 81; index += 1) {
    const ch = boardText[index] || ".";
    if (/[1-9]/.test(ch)) {
      boardPart += original[index] === ch ? ch : `+${ch}`;
      continue;
    }
    boardPart += ".";
  }

  let eliminations = "";
  for (let index = 0; index < 81; index += 1) {
    if (/[1-9]/.test(boardText[index] || ".")) continue;
    const legalMask = legalCandidateMaskForBoard(boardText, index);
    const candidateMask = candidateMaskFromArray(snapshot.cells[index]?.candidates || []);
    const removedMask = legalMask & ~candidateMask;
    const row = Math.floor(index / 9) + 1;
    const col = (index % 9) + 1;
    for (let digit = 1; digit <= 9; digit += 1) {
      if ((removedMask & (1 << digit)) !== 0) {
        eliminations += `${digit}${row}${col} `;
      }
    }
  }
  return `:0000:x:${boardPart}:${eliminations.trim()}::`;
}


function snapshotToOriginalPuzzleString(snapshot = currentSnapshot) {
  const givensText = snapshotGivensString(snapshot);
  if (givensText.length !== 81) return "";
  return [...givensText].map((ch) => (ch >= "1" && ch <= "9") ? ch : ".").join("");
}

function snapshotToKnownDigitsString(snapshot = currentSnapshot) {
  const boardText = snapshotBoardString(snapshot);
  if (boardText.length !== 81) return "";
  return [...boardText].map((ch) => (ch >= "1" && ch <= "9") ? ch : ".").join("");
}

function cellCandidateTextForExport(snapshot, index) {
  const boardText = snapshotBoardString(snapshot);
  const value = boardText[index] || ".";
  if (value >= "1" && value <= "9") return value;
  const candidates = Array.isArray(snapshot?.cells?.[index]?.candidates)
    ? snapshot.cells[index].candidates
    : [];
  return candidates
    .filter((digit) => Number.isInteger(digit) && digit >= 1 && digit <= 9)
    .sort((a, b) => a - b)
    .join("");
}

function snapshotToCandidatesTextString(snapshot = currentSnapshot) {
  const boardText = snapshotBoardString(snapshot);
  if (boardText.length !== 81 || !Array.isArray(snapshot?.cells)) return "";

  const widths = new Array(9).fill(1);
  for (let col = 0; col < 9; col += 1) {
    for (let row = 0; row < 9; row += 1) {
      const text = cellCandidateTextForExport(snapshot, row * 9 + col);
      widths[col] = Math.max(widths[col], text.length || 1);
    }
  }

  const borderSegment = (cols) => cols.map((col) => "-".repeat(widths[col])).join("-");
  const top = `,-${borderSegment([0, 1, 2])},-${borderSegment([3, 4, 5])},-${borderSegment([6, 7, 8])},`;
  const mid = `:-${borderSegment([0, 1, 2])}+-${borderSegment([3, 4, 5])}+-${borderSegment([6, 7, 8])}:`;
  const bottom = `'-${borderSegment([0, 1, 2])}'-${borderSegment([3, 4, 5])}'-${borderSegment([6, 7, 8])}'`;
  const lines = [top];
  for (let row = 0; row < 9; row += 1) {
    const parts = [];
    for (let boxCol = 0; boxCol < 3; boxCol += 1) {
      const cells = [];
      for (let offset = 0; offset < 3; offset += 1) {
        const col = boxCol * 3 + offset;
        const text = cellCandidateTextForExport(snapshot, row * 9 + col);
        cells.push((text || "").padEnd(widths[col], " "));
      }
      parts.push(cells.join(" "));
    }
    lines.push(`| ${parts[0]} | ${parts[1]} | ${parts[2]} |`);
    if (row === 2 || row === 5) lines.push(mid);
  }
  lines.push(bottom);
  return lines.join("\n");
}

function snapshotToSukakuString(snapshot = currentSnapshot) {
  const boardText = snapshotBoardString(snapshot);
  if (boardText.length !== 81 || !Array.isArray(snapshot?.cells)) return "";
  let output = "";
  for (let index = 0; index < 81; index += 1) {
    const value = boardText[index] || ".";
    const mask = value >= "1" && value <= "9"
      ? (1 << Number(value))
      : candidateMaskFromArray(snapshot.cells[index]?.candidates || []);
    for (let digit = 1; digit <= 9; digit += 1) {
      output += (mask & (1 << digit)) !== 0 ? String(digit) : "0";
    }
  }
  return output;
}

function encodeCoachBase32(bytes) {
  let buffer = 0;
  let bits = 0;
  let output = "";
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += COACH_BASE32_CHARS[(buffer >> bits) & 31];
    }
  }
  if (bits > 0) {
    output += COACH_BASE32_CHARS[(buffer << (5 - bits)) & 31];
  }
  return output;
}

async function deflateCoachBytes(bytes) {
  if (typeof CompressionStream !== "undefined") {
    const stream = new Response(bytes).body.pipeThrough(new CompressionStream("deflate"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  if (typeof process !== "undefined" && process.versions?.node) {
    const { deflateSync } = await import("node:zlib");
    return deflateSync(bytes);
  }
  throw new Error(ui("coachCompressUnsupported"));
}

async function snapshotToCoachString(snapshot = currentSnapshot) {
  const coachJson = snapshotToCoachJson(snapshot);
  if (!coachJson) return "";
  const payload = {
    gridSize: 9,
    givenDigits: coachJson.givenDigits.replaceAll(".", "0"),
    userCellCandidates: coachJson.userCellCandidates,
  };
  const userDigits = coachJson.userDigits.replaceAll(".", "0");
  if (/[1-9]/.test(userDigits)) payload.userDigits = userDigits;
  const json = JSON.stringify(payload);
  const compressed = await deflateCoachBytes(new TextEncoder().encode(json));
  return `SCv7_32_${encodeCoachBase32(compressed)}`;
}

function getExportFormat() {
  const value = exportFormatSelect?.value || "library";
  return ["original", "known", "candidates", "sukaku", "library", "coach"].includes(value) ? value : "library";
}

async function selectedExportPuzzleString(snapshot = currentSnapshot) {
  switch (getExportFormat()) {
    case "original": return snapshotToOriginalPuzzleString(snapshot);
    case "known": return snapshotToKnownDigitsString(snapshot);
    case "candidates": return snapshotToCandidatesTextString(snapshot);
    case "sukaku": return snapshotToSukakuString(snapshot);
    case "coach": return await snapshotToCoachString(snapshot);
    case "library":
    default:
      return snapshotToLibraryString(snapshot);
  }
}

function selectedExportFormatLabel() {
  const format = getExportFormat();
  const labels = {
    original: "exportFormatOriginal",
    known: "exportFormatKnown",
    candidates: "exportFormatCandidates",
    sukaku: "exportFormatSukaku",
    library: "exportFormatLibrary",
    coach: "exportFormatCoach",
  };
  return ui(labels[format] || "exportFormatLibrary");
}

function loadExportFormatSetting() {
  if (!exportFormatSelect) return;
  try {
    const saved = localStorage.getItem(EXPORT_FORMAT_STORAGE_KEY);
    if (saved && [...exportFormatSelect.options].some((option) => option.value === saved)) {
      exportFormatSelect.value = saved;
    }
  } catch {}
}

function saveExportFormatSetting() {
  if (!exportFormatSelect) return;
  try {
    localStorage.setItem(EXPORT_FORMAT_STORAGE_KEY, getExportFormat());
  } catch {}
}

function updateExportFormatLabels() {
  if (!exportFormatSelect) return;
  const labels = {
    original: ui("exportFormatOriginal"),
    known: ui("exportFormatKnown"),
    candidates: ui("exportFormatCandidates"),
    sukaku: ui("exportFormatSukaku"),
    library: ui("exportFormatLibrary"),
    coach: ui("exportFormatCoach"),
  };
  for (const option of exportFormatSelect.options) {
    option.textContent = labels[option.value] || option.textContent;
  }
  exportFormatSelect.title = ui("exportFormatLabel");
  exportFormatSelect.setAttribute("aria-label", ui("exportFormatLabel"));
}

function normalizeCoachDigitString(value) {
  const chars = [...String(value || "")].filter((ch) => /[0-9.]/.test(ch));
  while (chars.length < 81) chars.push(".");
  return chars.slice(0, 81).map((ch) => (ch >= "1" && ch <= "9") ? ch : ".").join("");
}

function parseCoachCandidateMasks(value) {
  const tokens = String(value || "").split("-");
  const masks = new Array(81).fill(0);
  for (let index = 0; index < 81; index += 1) {
    const raw = tokens[index] ?? "0";
    const parsed = Number.parseInt(raw, 10);
    masks[index] = Number.isFinite(parsed) ? (parsed & 0x3fe) : 0;
  }
  return masks;
}

function snapshotToCoachJson(snapshot = currentSnapshot) {
  const boardText = snapshotBoardString(snapshot);
  if (boardText.length !== 81 || !Array.isArray(snapshot?.cells)) return null;
  const givenSource = snapshotGivensString(snapshot);
  let givenDigits = "";
  let userDigits = "";
  const masks = [];
  for (let index = 0; index < 81; index += 1) {
    const value = boardText[index] || ".";
    const given = givenSource[index] || ".";
    if (given >= "1" && given <= "9") {
      givenDigits += given;
      userDigits += ".";
      masks.push("0");
    } else if (value >= "1" && value <= "9") {
      givenDigits += ".";
      userDigits += value;
      masks.push("0");
    } else {
      givenDigits += ".";
      userDigits += ".";
      masks.push(String(candidateMaskFromArray(snapshot.cells[index]?.candidates || [])));
    }
  }
  return {
    givenDigits,
    userDigits,
    userCellCandidates: masks.join("-"),
  };
}

function exportedPuzzleString() {
  const boardText = snapshotBoardString();
  if (boardText.length === 81) {
    const exported = snapshotMatchesOriginal() && !previewSnapshotActive
      ? boardText
      : snapshotToLibraryString();
    return exported || "";
  }

  const rawPuzzle = String(givens.value || "").trim();
  if (/^[0-9.]{81}$/.test(rawPuzzle)) {
    return rawPuzzle.replaceAll("0", ".");
  }

  return "";
}

function sharedPuzzleCrc16(bytes, length = bytes.length) {
  let crc = 0xffff;
  for (let index = 0; index < length; index += 1) {
    crc ^= bytes[index] << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0
        ? ((crc << 1) ^ 0x1021) & 0xffff
        : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

function sharedPuzzleBytesToBase64Url(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function sharedPuzzleBase64UrlToBytes(text) {
  if (!/^[A-Za-z0-9_-]+$/u.test(text)) {
    throw new Error("Base64URL contains invalid characters");
  }
  const padded = `${text.replaceAll("-", "+").replaceAll("_", "/")}${"=".repeat((4 - (text.length % 4)) % 4)}`;
  let binary = "";
  try {
    binary = atob(padded);
  } catch {
    throw new Error("Base64URL decoding failed");
  }
  return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}

function sharedPuzzleCompactCandidateMask(values) {
  return (values || []).reduce((mask, digitValue) => {
    const digit = Number(digitValue);
    return Number.isInteger(digit) && digit >= 1 && digit <= 9
      ? mask | (1 << (digit - 1))
      : mask;
  }, 0);
}

function encodeSnapshotToSharedS1(snapshot = currentSnapshot) {
  const boardText = snapshotBoardString(snapshot);
  const givensText = snapshotGivensString(snapshot);
  if (boardText.length !== 81 || givensText.length !== 81 || !Array.isArray(snapshot?.cells) || snapshot.cells.length < 81) {
    return "";
  }

  const states = new Uint16Array(81);
  for (let index = 0; index < 81; index += 1) {
    const value = Number(boardText[index] || 0);
    if (value >= 1 && value <= 9) {
      const isGiven = Boolean(snapshot.cells[index]?.given) || givensText[index] === String(value);
      states[index] = (isGiven ? 511 : 520) + value;
    } else {
      states[index] = sharedPuzzleCompactCandidateMask(snapshot.cells[index]?.candidates || []);
    }
  }

  const bytes = new Uint8Array(SHARED_PUZZLE_S1_TOTAL_BYTES);
  bytes[0] = 0x59; // Y
  bytes[1] = 0x31; // 1
  let outputOffset = 2;
  let buffer = 0;
  let bufferedBits = 0;
  for (const state of states) {
    buffer = (buffer << 10) | state;
    bufferedBits += 10;
    while (bufferedBits >= 8) {
      bufferedBits -= 8;
      bytes[outputOffset] = (buffer >>> bufferedBits) & 0xff;
      outputOffset += 1;
      buffer &= (1 << bufferedBits) - 1;
    }
  }
  if (bufferedBits > 0) {
    bytes[outputOffset] = (buffer << (8 - bufferedBits)) & 0xff;
    outputOffset += 1;
  }
  if (outputOffset !== 2 + SHARED_PUZZLE_S1_DATA_BYTES) {
    throw new Error("s1 payload packing length mismatch");
  }

  const crc = sharedPuzzleCrc16(bytes, SHARED_PUZZLE_S1_TOTAL_BYTES - 2);
  bytes[SHARED_PUZZLE_S1_TOTAL_BYTES - 2] = (crc >>> 8) & 0xff;
  bytes[SHARED_PUZZLE_S1_TOTAL_BYTES - 1] = crc & 0xff;
  const encoded = `${SHARED_PUZZLE_S1_PREFIX}${sharedPuzzleBytesToBase64Url(bytes)}`;
  if (encoded.length !== SHARED_PUZZLE_S1_TEXT_LENGTH) {
    throw new Error("s1 text length mismatch");
  }
  return encoded;
}

function decodeSharedS1States(encoded) {
  if (!encoded.startsWith(SHARED_PUZZLE_S1_PREFIX)) {
    throw new Error("unsupported share encoding");
  }
  if (encoded.length !== SHARED_PUZZLE_S1_TEXT_LENGTH) {
    throw new Error(`s1 length must be ${SHARED_PUZZLE_S1_TEXT_LENGTH} characters`);
  }

  const bytes = sharedPuzzleBase64UrlToBytes(encoded.slice(SHARED_PUZZLE_S1_PREFIX.length));
  if (bytes.length !== SHARED_PUZZLE_S1_TOTAL_BYTES) {
    throw new Error("s1 byte length mismatch");
  }
  if (bytes[0] !== 0x59 || bytes[1] !== 0x31) {
    throw new Error("s1 header mismatch");
  }
  const expectedCrc = (bytes[SHARED_PUZZLE_S1_TOTAL_BYTES - 2] << 8)
    | bytes[SHARED_PUZZLE_S1_TOTAL_BYTES - 1];
  const actualCrc = sharedPuzzleCrc16(bytes, SHARED_PUZZLE_S1_TOTAL_BYTES - 2);
  if (expectedCrc !== actualCrc) {
    throw new Error("s1 checksum mismatch");
  }
  if ((bytes[2 + SHARED_PUZZLE_S1_DATA_BYTES - 1] & 0x3f) !== 0) {
    throw new Error("s1 padding bits are not zero");
  }

  const states = new Uint16Array(81);
  let inputOffset = 2;
  let buffer = 0;
  let bufferedBits = 0;
  for (let index = 0; index < 81; index += 1) {
    while (bufferedBits < 10) {
      buffer = (buffer << 8) | bytes[inputOffset];
      inputOffset += 1;
      bufferedBits += 8;
    }
    bufferedBits -= 10;
    const state = (buffer >>> bufferedBits) & 0x3ff;
    buffer &= (1 << bufferedBits) - 1;
    if (state > 529) {
      throw new Error(`s1 cell state is out of range at cell ${index + 1}`);
    }
    states[index] = state;
  }
  return states;
}

function sharedS1StatesToLibraryString(states) {
  if (!states || states.length !== 81) {
    throw new Error("s1 must contain 81 cell states");
  }

  const boardChars = new Array(81).fill(".");
  let boardPart = "";
  for (let index = 0; index < 81; index += 1) {
    const state = Number(states[index]);
    if (state >= 512 && state <= 520) {
      const digit = state - 511;
      boardChars[index] = String(digit);
      boardPart += String(digit);
    } else if (state >= 521 && state <= 529) {
      const digit = state - 520;
      boardChars[index] = String(digit);
      boardPart += `+${digit}`;
    } else {
      boardPart += ".";
    }
  }

  const boardText = boardChars.join("");
  let eliminations = "";
  for (let index = 0; index < 81; index += 1) {
    const state = Number(states[index]);
    if (state > 511) continue;
    const candidateMask = state << 1;
    const legalMask = legalCandidateMaskForBoard(boardText, index);
    const removedMask = legalMask & ~candidateMask;
    const row = Math.floor(index / 9) + 1;
    const col = (index % 9) + 1;
    for (let digit = 1; digit <= 9; digit += 1) {
      if ((removedMask & (1 << digit)) !== 0) {
        eliminations += `${digit}${row}${col} `;
      }
    }
  }
  return `:0000:x:${boardPart}:${eliminations.trim()}::`;
}

function decodeSharedPuzzleValue(value) {
  const text = String(value || "").trim();
  if (text.startsWith(SHARED_PUZZLE_S1_PREFIX)) {
    return sharedS1StatesToLibraryString(decodeSharedS1States(text));
  }
  return text;
}

function sharedPuzzleParameterFromCurrentUrl() {
  try {
    const url = new URL(window.location.href);
    for (const name of [SHARED_PUZZLE_QUERY_PARAM, LEGACY_SHARED_PUZZLE_QUERY_PARAM]) {
      if (url.searchParams.has(name)) {
        return {
          present: true,
          name,
          value: String(url.searchParams.get(name) || "").trim(),
        };
      }
    }
    return { present: false, name: "", value: "" };
  } catch {
    return { present: false, name: "", value: "" };
  }
}

function buildPuzzleShareUrl(encodedPuzzle) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set(SHARED_PUZZLE_QUERY_PARAM, encodedPuzzle);
  return url.toString();
}

async function importSharedPuzzleFromUrl() {
  const shared = sharedPuzzleParameterFromCurrentUrl();
  if (!shared.present) return { present: false, loaded: false };
  if (!shared.value) {
    setStatus(ui("sharedPuzzleEmpty"));
    return { present: true, loaded: false };
  }

  let importText = "";
  try {
    importText = decodeSharedPuzzleValue(shared.value);
  } catch (error) {
    setStatus(uif("sharedPuzzleInvalid", {
      message: error instanceof Error ? error.message : String(error),
    }));
    return { present: true, loaded: false };
  }

  givens.value = importText;
  const result = await importPuzzleFromCurrentInput({
    clipboardFallback: false,
    preferClipboardFirst: false,
    clipboardAlreadyTried: true,
    urlImport: true,
  });
  if (result?.ok) {
    setStatus(ui("sharedPuzzleLoaded"));
    return { present: true, loaded: true };
  }
  return { present: true, loaded: false };
}

async function shareCurrentPuzzle() {
  let encodedPuzzle = "";
  try {
    encodedPuzzle = encodeSnapshotToSharedS1();
  } catch (error) {
    setStatus(uif("sharedPuzzleInvalid", {
      message: error instanceof Error ? error.message : String(error),
    }));
    setTransientStatus("shareFailed", { message: error instanceof Error ? error.message : String(error) });
    return;
  }
  if (!encodedPuzzle) {
    setStatus(ui("shareUnavailable"));
    setTransientStatus("shareFailed", { message: ui("shareUnavailable") });
    return;
  }

  const url = buildPuzzleShareUrl(encodedPuzzle);
  // Start clipboard writing and the system share request in the same user
  // activation turn. Awaiting one before invoking the other can make Android
  // browsers reject the second privileged API.
  const copyPromise = copyText(url);
  let shared = false;
  let shareError = null;
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: "YZF Sudoku",
        text: appStatusLanguage() === "en" ? "Shared Sudoku puzzle" : "分享一个数独题面",
        url,
      });
      shared = true;
    } catch (error) {
      if (error?.name !== "AbortError") shareError = error;
    }
  }
  const copied = await copyPromise;
  setStatus(uif(copied ? "shareCopied" : "shareClipboardFailed", { url }));
  if (shared) setTransientStatus("shared");
  else if (copied) setTransientStatus("copied");
  else if (shareError) setTransientStatus("shareFailed", { message: shareError instanceof Error ? shareError.message : String(shareError) });
  else setTransientStatus("shareCancelled");
  debugLog(JSON.stringify({
    ok: true,
    action: "share_puzzle",
    format: "s1",
    parameterLength: encodedPuzzle.length,
    url,
    copied,
    shared,
  }, null, 2));
}

function currentSessionLibraryString() {
  if (!engine || appSessionRestoring || previewSnapshotActive) return "";
  return exportedPuzzleString();
}

function currentSessionTechniqueConfig() {
  if (!engine) return null;
  try {
    return getTechniqueConfigPayload(techniqueState.length ? techniqueState : loadTechniqueState());
  } catch {
    return null;
  }
}

function buildAppSessionPayload() {
  const libraryString = currentSessionLibraryString();
  const techniqueConfig = currentSessionTechniqueConfig();
  if (!libraryString && !techniqueConfig) return null;
  return {
    version: 1,
    savedAt: Date.now(),
    language: lang?.value || "zh",
    libraryString,
    techniqueConfig,
  };
}

function saveAppSessionNow() {
  if (appSessionRestoring) return false;
  setAppSaveStatus("saving");
  try {
    const payload = buildAppSessionPayload();
    if (!payload) {
      setAppSaveStatus("saved");
      return true;
    }
    localStorage.setItem(APP_SESSION_STORAGE_KEY, JSON.stringify(payload));
    setAppSaveStatus("saved");
    return true;
  } catch (error) {
    console.warn("Failed to save YZF session", error);
    setAppSaveStatus("error", { message: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

function scheduleAppSessionSave() {
  if (appSessionRestoring) return;
  setAppSaveStatus("dirty");
  if (appSessionSaveTimer) window.clearTimeout(appSessionSaveTimer);
  appSessionSaveTimer = window.setTimeout(() => {
    appSessionSaveTimer = 0;
    saveAppSessionNow();
  }, 350);
}

function flushAppSessionSave() {
  if (appSessionSaveTimer) {
    window.clearTimeout(appSessionSaveTimer);
    appSessionSaveTimer = 0;
  }
  return saveAppSessionNow();
}

async function restoreAppSession(options = {}) {
  if (!engine) return false;
  const restorePuzzle = options.restorePuzzle !== false;
  const announce = options.announce !== false;
  let payload = null;
  try {
    const raw = localStorage.getItem(APP_SESSION_STORAGE_KEY);
    if (!raw) return false;
    payload = JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to read YZF session", error);
    return false;
  }
  if (!payload || payload.version !== 1) return false;
  appSessionRestoring = true;
  try {
    if (payload.language && lang && [...lang.options].some((option) => option.value === payload.language)) {
      lang.value = payload.language;
      applyStaticLanguage();
    }
    if (payload.techniqueConfig && typeof engine.set_techniques_json === "function") {
      engine.set_techniques_json(JSON.stringify(payload.techniqueConfig));
      loadTechniqueState();
    }
    if (restorePuzzle && payload.libraryString) {
      givens.value = payload.libraryString;
      const restored = await importPuzzleFromCurrentInput({ clipboardFallback: false, sessionRestore: true });
      if (!restored?.ok) {
        throw new Error(restored?.error || ui("importUnknownFormat"));
      }
    }
    renderTechniques();
    if (announce) {
      setStatus(ui("sessionRestored"));
      setTransientStatus("restored");
    }
    setAppSaveStatus("saved");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (announce) setStatus(uif("sessionRestoreFailed", { message }));
    console.warn("Failed to restore YZF session", error);
    return false;
  } finally {
    appSessionRestoring = false;
  }
}

function clearSavedAppSession() {
  try {
    localStorage.removeItem(APP_SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear YZF session", error);
  }
  setStatus(ui("sessionCleared"));
}

function syncEngineToCurrentSnapshot() {
  if (!engine || !currentSnapshot || (snapshotMatchesOriginal() && !previewSnapshotActive)) {
    return true;
  }
  const text = snapshotToLibraryString();
  const result = parseJson(engine.import_puzzle_json(text));
  if (!result?.ok) {
    setStatus(uif("currentStateSyncFailed", { error: result?.error || ui("importFailedGeneric") }));
    return false;
  }
  givens.value = text;
  originalBoard = result.state?.givens || result.givens || result.puzzle || snapshotGivensString();
  currentSnapshot = result.state || currentSnapshot;
  previewSnapshotActive = false;
  currentPreviewRecord = null;
    return true;
}

async function copyText(text) {
  if (!navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function decodeCoachBase32(encoded) {
  const values = [...encoded.trim().toLowerCase()].map((ch) => {
    const value = COACH_BASE32_REVERSE.get(ch);
    if (value == null) {
      throw new Error(uif("coachInvalidChar", { ch }));
    }
    return value;
  });

  const outputLength = Math.floor(values.length * 5 / 8);
  const bytes = new Uint8Array(outputLength);
  let inPos = 0;
  let outPos = 0;
  while (inPos < values.length && outPos < outputLength) {
    const enc1 = values[inPos] ?? 0;
    const enc2 = values[inPos + 1] ?? 0;
    const enc3 = values[inPos + 2] ?? 0;
    const enc4 = values[inPos + 3] ?? 0;
    const enc5 = values[inPos + 4] ?? 0;
    const enc6 = values[inPos + 5] ?? 0;
    const enc7 = values[inPos + 6] ?? 0;
    const enc8 = values[inPos + 7] ?? 0;
    if (outPos < outputLength) bytes[outPos++] = (enc1 << 3) | (enc2 >> 2);
    if (outPos < outputLength) bytes[outPos++] = ((enc2 & 0x03) << 6) | (enc3 << 1) | (enc4 >> 4);
    if (outPos < outputLength) bytes[outPos++] = ((enc4 & 0x0f) << 4) | (enc5 >> 1);
    if (outPos < outputLength) bytes[outPos++] = ((enc5 & 0x01) << 7) | (enc6 << 2) | (enc7 >> 3);
    if (outPos < outputLength) bytes[outPos++] = ((enc7 & 0x07) << 5) | enc8;
    inPos += 8;
  }
  return bytes;
}

async function inflateCoachBytes(bytes) {
  if (typeof DecompressionStream !== "undefined") {
    const stream = new Response(bytes).body.pipeThrough(new DecompressionStream("deflate"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  if (typeof process !== "undefined" && process.versions?.node) {
    const { inflateSync } = await import("node:zlib");
    return inflateSync(bytes);
  }
  throw new Error(ui("coachDecompressUnsupported"));
}

function candidateGridTokensForImport(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;

  const tokens = raw
    .replace(/[|,;]+/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/[^1-9]/g, ""))
    .filter(Boolean);
  if (tokens.length !== 81) return null;

  // Framed ASCII grids are unambiguous.  For plain whitespace input, require
  // at least one multi-digit cell so an ordinary spaced 81-digit puzzle is not
  // rewritten as a candidate-state import.
  const framedAscii = /-{3,}/.test(raw) && raw.includes("|");
  const hasMultiCandidate = tokens.some((token) => token.length > 1);
  if (!framedAscii && !hasMultiCandidate) return null;

  return tokens.map((token) => [...new Set([...token])].sort().join(""));
}

function candidateGridTokensToCoachJson(tokens) {
  if (!Array.isArray(tokens) || tokens.length !== 81) return "";

  const givenDigits = tokens
    .map((token) => token.length === 1 ? token : ".")
    .join("");
  const userCellCandidates = tokens
    .map((token) => {
      if (token.length === 1) return "0";
      let mask = 0;
      for (const ch of token) mask |= 1 << Number(ch);
      return String(mask);
    })
    .join("-");

  // The bundled WASM already supports Sudoku Coach JSON carrying givens plus
  // per-cell candidate masks.  This preserves the established candidate-grid
  // meaning: singleton cells become large solved digits, while multi-digit
  // cells remain restricted candidate sets.
  return JSON.stringify({
    givenDigits,
    userDigits: ".".repeat(81),
    userCellCandidates,
  });
}

function normalizeCandidateGridImportText(text) {
  const tokens = candidateGridTokensForImport(text);
  return tokens ? candidateGridTokensToCoachJson(tokens) : "";
}

async function preprocessImportText(text) {
  const raw = (text || "").trim();
  if (!raw.startsWith("SCv7_32_")) {
    return normalizeCandidateGridImportText(raw) || raw;
  }
  const compressed = decodeCoachBase32(raw.slice(8));
  const jsonBytes = await inflateCoachBytes(compressed);
  return new TextDecoder().decode(jsonBytes);
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function selectTreeRow(row) {
  document.querySelectorAll(".tree-row.selected").forEach((item) => {
    item.classList.remove("selected");
  });
  row.classList.add("selected");
}

function createTreeRow(label, detail, expandable, childList, valueClass = "", onSelect = null, rowClass = "") {
  const row = document.createElement("div");
  row.className = `tree-row${rowClass ? ` ${rowClass}` : ""}`;

  const toggle = document.createElement("button");
  toggle.className = expandable ? "tree-toggle" : "tree-toggle empty";
  toggle.type = "button";
  toggle.textContent = expandable ? "-" : "";
  toggle.tabIndex = expandable ? 0 : -1;

  if (expandable) {
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const collapsed = childList.classList.toggle("hidden");
      toggle.textContent = collapsed ? "+" : "-";
    });
  }

  const key = document.createElement("span");
  key.className = "tree-key";
  key.textContent = label;

  const colon = document.createElement("span");
  colon.className = "tree-colon";
  colon.textContent = detail ? ":" : "";

  const valueText = document.createElement("span");
  valueText.className = `tree-value ${valueClass}`;
  valueText.textContent = detail || "";

  row.append(toggle, key, colon, valueText);
  row.addEventListener("click", () => {
    selectTreeRow(row);
    if (onSelect) onSelect();
  });
  row.addEventListener("dblclick", () => {
    if (!expandable) return;
    const collapsed = childList.classList.toggle("hidden");
    toggle.textContent = collapsed ? "+" : "-";
  });

  return row;
}

function cellName(item) {
  return `r${item.row + 1}c${item.col + 1}`;
}

function cellIndex(row, col) {
  return row * 9 + col;
}


function createSvgElement(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    node.setAttribute(key, String(value));
  }
  return node;
}

function setStatusElementState(element, message, tone = "info") {
  if (!element) return;
  const visible = Boolean(message);
  element.textContent = message || "";
  element.classList.toggle("hidden", !visible);
  if (visible) {
    element.dataset.tone = tone;
  } else {
    delete element.dataset.tone;
  }
}

function buildStaticSnapshotFromPuzzle(puzzle) {
  const boardText = String(puzzle || "").trim();
  const cells = Array.from({ length: 81 }, (_, index) => {
    const char = boardText[index] || ".";
    const value = char >= "1" && char <= "9" ? Number(char) : 0;
    return {
      index,
      row: Math.floor(index / 9),
      col: index % 9,
      box: Math.floor(Math.floor(index / 9) / 3) * 3 + Math.floor((index % 9) / 3),
      value,
      candidates: [],
      count: 0,
    };
  });
  return {
    version: "yzf-typ4-debug-sample",
    board: boardText,
    cells,
  };
}

function setYzfOverlayModeNote(message) {
  if (!yzfOverlayModeNote) return;
  yzfOverlayModeNote.textContent = message;
}

function clearChainOverlay(message = "") {
  yzfDebugSampleData = null;
  clearBoardChainHighlights();
  yzfUnderlay?.replaceChildren();
  yzfOverlay?.replaceChildren();
  setYzfOverlayModeNote(ui("overlayDebugOnly"));
  if (message) {
    setStatusElementState(yzfOverlayStatus, message, "debug");
  } else {
    setStatusElementState(yzfOverlayStatus, "");
  }
}

function getSamplePuzzleInfo(sampleJson) {
  if (typeof sampleJson?.puzzle === "string" && sampleJson.puzzle.length === 81) {
    return {
      puzzle: sampleJson.puzzle,
      source: "json",
    };
  }
  const sampleName = typeof sampleJson?.sampleName === "string" ? sampleJson.sampleName : "";
  const fallbackPuzzle = YZF_SAMPLE_PUZZLE_FALLBACKS.get(sampleName) || "";
  return {
    puzzle: fallbackPuzzle,
    source: fallbackPuzzle ? "fallback" : "missing",
  };
}

function normalizeSectorCells(sectorCells, fallbackCell = null) {
  if (Array.isArray(sectorCells) && sectorCells.length > 0) {
    return sectorCells.map((entry) => {
      if (Number.isInteger(entry)) return entry;
      if (entry && Number.isInteger(entry.index)) return entry.index;
      return null;
    }).filter(Number.isInteger);
  }
  if (Number.isInteger(fallbackCell)) {
    return [fallbackCell];
  }
  return [];
}

const ALS_CHAIN_HIGHLIGHT_CLASSES = [
  "chain-als-1",
  "chain-als-2",
  "chain-als-3",
  "chain-als-4",
  "chain-als-5",
];

const AF_CHAIN_AUX_CLASS = "chain-af-aux";
const AF_CHAIN_AUX_ROW_COVER_CLASS = "chain-af-aux-cover-row";
const AF_CHAIN_AUX_COL_COVER_CLASS = "chain-af-aux-cover-col";


function parseSudokuCellsDisplay(text) {
  const cells = [];
  const seen = new Set();
  const raw = String(text || "");

  const appendCell = (cell) => {
    if (!Number.isInteger(cell) || cell < 0 || cell >= 81 || seen.has(cell)) return;
    seen.add(cell);
    cells.push(cell);
  };

  // Standard row/column notation used by most chain text, e.g.
  // r7c5, r7c12, r18c5, r379c1.  Multiple rows/columns mean the Cartesian
  // product of the row and column digits.
  const rcPattern = /r([1-9]+)c([1-9]+)/gi;
  let match;
  while ((match = rcPattern.exec(raw)) !== null) {
    const rows = String(match[1] || "").split("").map((ch) => Number(ch)).filter((n) => n >= 1 && n <= 9);
    const cols = String(match[2] || "").split("").map((ch) => Number(ch)).filter((n) => n >= 1 && n <= 9);

    for (const row of rows) {
      for (const col of cols) {
        appendCell((row - 1) * 9 + (col - 1));
      }
    }
  }

  // ALS formatter may use box-position notation to keep large ALS labels short,
  // e.g. b8p24579.  The old parser only understood r...c..., so ALS edge
  // labels written this way were only partially highlighted through their
  // endpoint nodes.  Decode bNp... with row-major box numbering and row-major
  // position numbering inside each box.
  const bpPattern = /b([1-9])p([1-9]+)/gi;
  while ((match = bpPattern.exec(raw)) !== null) {
    const box = Number(match[1]);
    const positions = String(match[2] || "").split("").map((ch) => Number(ch)).filter((n) => n >= 1 && n <= 9);
    const boxRow = Math.floor((box - 1) / 3) * 3;
    const boxCol = ((box - 1) % 3) * 3;

    for (const pos of positions) {
      const row = boxRow + Math.floor((pos - 1) / 3);
      const col = boxCol + ((pos - 1) % 3);
      appendCell(row * 9 + col);
    }
  }

  return cells;
}

function makeAlsMetaKey(cells, digits, fallbackKey = "") {
  const cellKey = [...new Set(cells)].filter(Number.isInteger).sort((a, b) => a - b).join(",");
  const digitKey = [...new Set(digits)].filter((digit) => digit >= 1 && digit <= 9).sort((a, b) => a - b).join("");
  if (cellKey || digitKey) return `cells:${cellKey}|digits:${digitKey}`;
  return String(fallbackKey || "als");
}

function cellHouseKeys(cell) {
  if (!Number.isInteger(cell) || cell < 0 || cell >= 81) return [];
  const row = Math.floor(cell / 9);
  const col = cell % 9;
  const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  return [`r${row}`, `c${col}`, `b${box}`];
}

function commonHouseKeysForCells(cells) {
  const normalized = [...new Set(cells)].filter((cell) => Number.isInteger(cell) && cell >= 0 && cell < 81);
  if (normalized.length === 0) return [];

  const first = normalized[0];
  const firstRow = Math.floor(first / 9);
  const firstCol = first % 9;
  const firstBox = Math.floor(firstRow / 3) * 3 + Math.floor(firstCol / 3);

  const sameRow = normalized.every((cell) => Math.floor(cell / 9) === firstRow);
  const sameCol = normalized.every((cell) => cell % 9 === firstCol);
  const sameBox = normalized.every((cell) => {
    const row = Math.floor(cell / 9);
    const col = cell % 9;
    return Math.floor(row / 3) * 3 + Math.floor(col / 3) === firstBox;
  });

  const houses = [];
  if (sameRow) houses.push(`r${firstRow}`);
  if (sameCol) houses.push(`c${firstCol}`);
  if (sameBox) houses.push(`b${firstBox}`);
  return houses;
}

function touchedHouseKeysForCells(cells) {
  const houses = new Set();
  for (const cell of cells) {
    for (const house of cellHouseKeys(cell)) houses.add(house);
  }
  return [...houses];
}

function alsHouseKeysForCells(cells) {
  const common = commonHouseKeysForCells(cells);
  return common.length > 0 ? common : touchedHouseKeysForCells(cells);
}

function buildAlsMeta(cells, digits, fallbackKey) {
  const normalizedCells = [...new Set(cells)].filter(Number.isInteger).sort((a, b) => a - b);
  const normalizedDigits = [...new Set(digits)].filter((digit) => digit >= 1 && digit <= 9).sort((a, b) => a - b);
  return {
    key: makeAlsMetaKey(normalizedCells, normalizedDigits, fallbackKey),
    fallbackKey,
    cells: normalizedCells,
    digits: normalizedDigits,
    houseKeys: alsHouseKeysForCells(normalizedCells),
  };
}

function parseAlsNodeMeta(node) {
  const nodeKind = node?.nodeKind || node?.kind || "";
  if (nodeKind !== "AlsCandidateSector") return null;

  const label = String(node?.label || "");
  const match = label.match(/\(([1-9])\s*([=-])\s*([1-9]*)\)\s*([^\s\[]+)/i);
  const digits = new Set();
  let alsCells = [];
  let fallbackKey = "";

  if (match) {
    digits.add(Number(match[1]));
    for (const ch of String(match[3] || "")) {
      const digit = Number(ch);
      if (digit >= 1 && digit <= 9) digits.add(digit);
    }
    alsCells = parseSudokuCellsDisplay(match[4]);
    fallbackKey = match[4];
  }

  // Fall back to the current ALS candidate-sector if the formatter label is
  // unavailable.  This still highlights the current restricted common digit.
  if (digits.size === 0) {
    const digit = Number(node?.digitDisplay || node?.digit || 0);
    if (digit >= 1 && digit <= 9) digits.add(digit);
  }
  if (alsCells.length === 0) {
    alsCells = normalizeSectorCells(node?.sectorCells, Number.isInteger(node?.cell) ? node.cell : null);
  }
  if (!fallbackKey) {
    fallbackKey = alsCells.join(",") || String(node?.originalNodeId ?? node?.nodeId ?? "als");
  }

  return buildAlsMeta(alsCells, digits, fallbackKey);
}

function parseAlsEdgeMeta(edge) {
  if (!edge || String(edge.reason || "").toLowerCase() !== "als") return null;
  const label = String(edge.alsLabel || "").trim();
  if (!label) return null;

  const match = label.match(/\(([1-9])\s*([=-])\s*([1-9]*)\)\s*([^\s\[]+)/i);
  if (!match) return null;

  const digits = new Set([Number(match[1])]);
  for (const ch of String(match[3] || "")) {
    const digit = Number(ch);
    if (digit >= 1 && digit <= 9) digits.add(digit);
  }

  const meta = buildAlsMeta(parseSudokuCellsDisplay(match[4]), digits, match[4] || label);
  return meta.cells.length > 0 && meta.digits.length > 0 ? meta : null;
}

function mergeAlsMeta(target, source) {
  const cells = new Set(target.cells || []);
  for (const cell of source.cells || []) cells.add(cell);

  const digits = new Set(target.digits || []);
  for (const digit of source.digits || []) digits.add(digit);

  target.cells = [...cells].filter(Number.isInteger).sort((a, b) => a - b);
  target.digits = [...digits].filter((digit) => digit >= 1 && digit <= 9).sort((a, b) => a - b);
  target.houseKeys = alsHouseKeysForCells(target.cells);
  return target;
}

function collectAlsMetas(pathNodes, pathEdges = []) {
  const metaByKey = new Map();

  const appendMeta = (meta) => {
    if (!meta || meta.cells.length === 0 || meta.digits.length === 0) return;
    if (metaByKey.has(meta.key)) {
      mergeAlsMeta(metaByKey.get(meta.key), meta);
    } else {
      metaByKey.set(meta.key, { ...meta });
    }
  };

  for (const node of pathNodes || []) {
    if (nodeTouchesReasonEdge(node, pathEdges, "af") ||
        nodeTouchesReasonEdge(node, pathEdges, "urguardian")) {
      continue;
    }
    appendMeta(parseAlsNodeMeta(node));
  }

  for (const edge of pathEdges || []) {
    appendMeta(parseAlsEdgeMeta(edge));
  }

  return [...metaByKey.values()];
}

function alsMetasShareHouse(left, right) {
  if (!left || !right || left.key === right.key) return false;
  const leftHouses = new Set(left.houseKeys || []);
  for (const house of right.houseKeys || []) {
    if (leftHouses.has(house)) return true;
  }
  return false;
}

function countAlsHouseConflicts(meta, colorClass, assignedMetas, classByKey) {
  let conflicts = 0;
  for (const other of assignedMetas) {
    if (classByKey.get(other.key) !== colorClass) continue;
    if (alsMetasShareHouse(meta, other)) conflicts += 1;
  }
  return conflicts;
}

function countAlsColorUses(colorClass, assignedMetas, classByKey) {
  let uses = 0;
  for (const other of assignedMetas) {
    if (classByKey.get(other.key) === colorClass) uses += 1;
  }
  return uses;
}

function chooseLeastUsedAlsClass(classes, assignedMetas, classByKey) {
  let bestClass = classes[0] || ALS_CHAIN_HIGHLIGHT_CLASSES[0];
  let bestUseCount = Number.POSITIVE_INFINITY;

  for (const className of classes) {
    const uses = countAlsColorUses(className, assignedMetas, classByKey);
    if (uses < bestUseCount) {
      bestClass = className;
      bestUseCount = uses;
    }
  }

  return bestClass;
}

function chooseAlsHighlightClass(meta, assignedMetas, classByKey) {
  const usedInSameHouse = new Set();
  const usedGlobally = new Set();

  for (const other of assignedMetas) {
    const otherClass = classByKey.get(other.key);
    if (!otherClass) continue;
    usedGlobally.add(otherClass);
    if (alsMetasShareHouse(meta, other)) usedInSameHouse.add(otherClass);
  }

  // First priority: avoid same-house color collisions.
  // Second priority: when the palette is still enough, avoid reusing colors at
  // all.  This keeps visually separate ALS containers distinct even when they
  // are in different houses.
  const safeUnusedClass = ALS_CHAIN_HIGHLIGHT_CLASSES.find((className) => {
    return !usedInSameHouse.has(className) && !usedGlobally.has(className);
  });
  if (safeUnusedClass) return safeUnusedClass;

  const safeClasses = ALS_CHAIN_HIGHLIGHT_CLASSES.filter((className) => !usedInSameHouse.has(className));
  if (safeClasses.length > 0) {
    return chooseLeastUsedAlsClass(safeClasses, assignedMetas, classByKey);
  }

  // More ALS containers share one house than there are colors.  This is not
  // perfectly colorable, so choose the color that creates the fewest same-house
  // collisions.  If tied, prefer the globally least-used color to keep the
  // board easier to read.
  let bestClass = ALS_CHAIN_HIGHLIGHT_CLASSES[0];
  let bestConflictCount = Number.POSITIVE_INFINITY;
  let bestUseCount = Number.POSITIVE_INFINITY;
  for (const className of ALS_CHAIN_HIGHLIGHT_CLASSES) {
    const conflicts = countAlsHouseConflicts(meta, className, assignedMetas, classByKey);
    const uses = countAlsColorUses(className, assignedMetas, classByKey);
    if (conflicts < bestConflictCount || (conflicts === bestConflictCount && uses < bestUseCount)) {
      bestClass = className;
      bestConflictCount = conflicts;
      bestUseCount = uses;
    }
  }
  return bestClass;
}

function buildAlsHighlightClassMap(pathNodes, pathEdges = []) {
  const metas = collectAlsMetas(pathNodes, pathEdges);
  const classByKey = new Map();
  const assignedMetas = [];

  // Color the most constrained ALS first so same-house ALS are less likely to
  // collide when the palette is tight.
  const orderedMetas = metas.slice().sort((a, b) => {
    const degreeA = metas.filter((other) => alsMetasShareHouse(a, other)).length;
    const degreeB = metas.filter((other) => alsMetasShareHouse(b, other)).length;
    if (degreeA !== degreeB) return degreeB - degreeA;
    if ((b.houseKeys?.length || 0) !== (a.houseKeys?.length || 0)) {
      return (b.houseKeys?.length || 0) - (a.houseKeys?.length || 0);
    }
    return String(a.key).localeCompare(String(b.key));
  });

  for (const meta of orderedMetas) {
    const colorClass = chooseAlsHighlightClass(meta, assignedMetas, classByKey);
    classByKey.set(meta.key, colorClass);
    assignedMetas.push(meta);
  }

  return classByKey;
}

function parseYzfEdgeType(type) {
  const raw = String(type || "");
  const parts = raw.split(":");
  const [strengthRaw = "", reasonRaw = "", transitionRaw = ""] = parts;
  const alsLabelPart = parts.find((part) => String(part || "").startsWith("alsLabel="));
  const afLabelPart = parts.find((part) => String(part || "").startsWith("afLabel="));
  const urLabelPart = parts.find((part) => String(part || "").startsWith("urLabel="));
  const amslsLabelPart = parts.find((part) => String(part || "").startsWith("amslsLabel="));
  const rolePart = parts.find((part) => String(part || "").startsWith("role="));
  return {
    strength: strengthRaw === "weak" ? "weak" : "strong",
    reason: reasonRaw || "unknown",
    transition: transitionRaw || "",
    alsLabel: alsLabelPart ? alsLabelPart.slice("alsLabel=".length) : "",
    afLabel: afLabelPart ? afLabelPart.slice("afLabel=".length) : "",
    urLabel: urLabelPart ? urLabelPart.slice("urLabel=".length) : "",
    amslsLabel: amslsLabelPart ? amslsLabelPart.slice("amslsLabel=".length) : "",
    role: rolePart ? rolePart.slice("role=".length) : "",
  };
}

function extractStateFromLabel(label) {
  const text = String(label || "");
  if (/\bON\b/i.test(text)) return "ON";
  if (/\bOFF\b/i.test(text)) return "OFF";
  return "";
}

function normalizeStepResultPathNodes(stepNodes = []) {
  return (Array.isArray(stepNodes) ? stepNodes : []).map((node, pathIndex) => {
    const cell = Number.isInteger(node.index) && node.index >= 0 ? node.index : null;
    const nodeKind = node.kind || node.nodeKind || "SingleCandidate";
    const digitDisplay = Number(node.digit || node.digitDisplay || 0);

    return {
      // 关键：前端 path 内部 ID 用 pathIndex，不能用后端 node.id。
      // 不连续环里同一个后端 id 可能出现两次，状态还不同。
      nodeId: pathIndex,
      originalNodeId: Number.isInteger(node.id) ? node.id : pathIndex,
      pathIndex,

      nodeKind,
      kind: nodeKind,
      digitDisplay,
      state: extractStateFromLabel(node.label),
      label: node.label || "",

      cell,
      row: Number.isInteger(node.row) ? node.row : (cell != null ? Math.floor(cell / 9) : -1),
      col: Number.isInteger(node.col) ? node.col : (cell != null ? cell % 9 : -1),
      sectorCells: normalizeSectorCells(node.sectorCells, cell),
    };
  });
}

function normalizeStepResultPathEdges(stepEdges = [], pathNodes = []) {
  const edges = Array.isArray(stepEdges) ? stepEdges : [];

  // 1) 标准开放链：edges = nodes - 1
  // nodes 顺序就是 path occurrence 顺序，edges 顺序就是相邻链段。
  if (pathNodes.length >= 2 && edges.length === pathNodes.length - 1) {
    return edges.map((edge, index) => {
      const parsed = parseYzfEdgeType(edge.type);
      return {
        edgeId: Number.isInteger(edge.id) ? edge.id : index,

        // 用 pathIndex 连接相邻 occurrence，而不是用 edge.from / edge.to 查全局 id。
        // 这样能正确支持 Discontinuous Nice Loop 里同一个 originalNodeId 重复出现。
        fromNodeId: pathNodes[index].nodeId,
        toNodeId: pathNodes[index + 1].nodeId,
        fromPathIndex: index,
        toPathIndex: index + 1,

        originalFromNodeId: edge.from,
        originalToNodeId: edge.to,

        strength: parsed.strength,
        reason: parsed.reason,
        transition: parsed.transition,
        rawType: edge.type || "",
        role: edge.role || parsed.role || "",
        alsLabel: parsed.alsLabel || "",
        afLabel: parsed.afLabel || "",
        urLabel: parsed.urLabel || "",
        amslsLabel: parsed.amslsLabel || "",
      };
    });
  }

  // 2) Cycle / Ring：edges = nodes
  // 最后一条边必须从最后一个 occurrence 回到第一个 occurrence。
  // 否则闭合边会被错误映射成 last -> last，导致少画一条边、最后节点状态也无法更新。
  if (pathNodes.length >= 3 && edges.length === pathNodes.length) {
    return edges.map((edge, index) => {
      const parsed = parseYzfEdgeType(edge.type);
      const fromIndex = index;
      const toIndex = (index + 1) % pathNodes.length;

      return {
        edgeId: Number.isInteger(edge.id) ? edge.id : index,

        fromNodeId: pathNodes[fromIndex].nodeId,
        toNodeId: pathNodes[toIndex].nodeId,
        fromPathIndex: fromIndex,
        toPathIndex: toIndex,

        originalFromNodeId: edge.from,
        originalToNodeId: edge.to,

        strength: parsed.strength,
        reason: parsed.reason,
        transition: parsed.transition,
        rawType: edge.type || "",
        role: edge.role || parsed.role || "",
        alsLabel: parsed.alsLabel || "",
        afLabel: parsed.afLabel || "",
        urLabel: parsed.urLabel || "",
        amslsLabel: parsed.amslsLabel || "",
      };
    });
  }

  // 3) fallback：Braid/Force 等证明图可能有分支边，edges 数量不等于 nodes-1。
  // 这时必须按后端 edge.from / edge.to 指向的 node.id 映射，而不能按 edge
  // 下标硬连相邻 occurrence。
  const nodeByOriginalId = new Map();
  pathNodes.forEach((node, index) => {
    nodeByOriginalId.set(node.originalNodeId, { node, index });
  });
  return edges.map((edge, index) => {
    const parsed = parseYzfEdgeType(edge.type);
    const fallbackFromIndex = Math.min(index, Math.max(0, pathNodes.length - 1));
    const fallbackToIndex = Math.min(index + 1, Math.max(0, pathNodes.length - 1));
    const mappedFrom = nodeByOriginalId.get(edge.from);
    const mappedTo = nodeByOriginalId.get(edge.to);
    const fromIndex = mappedFrom?.index ?? fallbackFromIndex;
    const toIndex = mappedTo?.index ?? fallbackToIndex;

    return {
      edgeId: Number.isInteger(edge.id) ? edge.id : index,
      fromNodeId: mappedFrom?.node?.nodeId ?? pathNodes[fromIndex]?.nodeId ?? fromIndex,
      toNodeId: mappedTo?.node?.nodeId ?? pathNodes[toIndex]?.nodeId ?? toIndex,
      fromPathIndex: fromIndex,
      toPathIndex: toIndex,

      originalFromNodeId: edge.from,
      originalToNodeId: edge.to,

      strength: parsed.strength,
      reason: parsed.reason,
      transition: parsed.transition,
      rawType: edge.type || "",
      role: edge.role || parsed.role || "",
      alsLabel: parsed.alsLabel || "",
      afLabel: parsed.afLabel || "",
      urLabel: parsed.urLabel || "",
      amslsLabel: parsed.amslsLabel || "",
    };
  });
}


function cellSetKey(cells) {
  return [...new Set(cells || [])]
    .filter((cell) => Number.isInteger(cell) && cell >= 0 && cell < 81)
    .sort((a, b) => a - b)
    .join(",");
}

function cellsEqualAsSet(left, right) {
  return cellSetKey(left) === cellSetKey(right);
}

function afLineCells(lineType, digitsText) {
  const cells = new Set();
  const kind = String(lineType || "").toLowerCase();
  const positions = String(digitsText || "")
    .split("")
    .map((ch) => Number(ch))
    .filter((value) => value >= 1 && value <= 9);

  for (const position of positions) {
    const zero = position - 1;
    if (kind === "r") {
      for (let col = 0; col < 9; ++col) cells.add(zero * 9 + col);
    } else if (kind === "c") {
      for (let row = 0; row < 9; ++row) cells.add(row * 9 + zero);
    }
  }
  return cells;
}

function intersectCellSets(left, right) {
  const out = [];
  for (const cell of left || []) {
    if (right?.has?.(cell)) out.push(cell);
  }
  return out;
}

function parseAfAnnotationText(text) {
  const raw = String(text || "");
  const metas = [];
  const pattern = /([1-9])((?:r[1-9]+c[1-9]+(?:\/[r]?[1-9]*c?[1-9]+)*)|(?:[brcp][^\s=><()]+))\((r|c)([1-9]+)\\(r|c)([1-9]+)\)/gi;
  let match;
  while ((match = pattern.exec(raw)) !== null) {
    const digit = Number(match[1]);
    const endpointText = String(match[2] || "");
    const firstLineType = String(match[3] || "").toLowerCase();
    const firstMaskText = String(match[4] || "");
    const secondLineType = String(match[5] || "").toLowerCase();
    const secondMaskText = String(match[6] || "");
    const firstLineCells = afLineCells(firstLineType, firstMaskText);
    const secondLineCells = afLineCells(secondLineType, secondMaskText);
    const fishCells = intersectCellSets(firstLineCells, secondLineCells)
      .filter((cell) => boardCandidateExists(cell, digit));
    const endpointCells = parseSudokuCellsDisplay(endpointText);

    if (digit >= 1 && digit <= 9 && fishCells.length > 0) {
      metas.push({
        digit,
        endpointText,
        endpointCells: [...new Set(endpointCells)].sort((a, b) => a - b),
        firstLineType,
        firstMaskText,
        secondLineType,
        secondMaskText,
        cells: [...new Set(fishCells)].sort((a, b) => a - b),
      });
    }
  }
  return metas;
}

function collectAfHighlightMetas(overlaySample, pathNodes = [], pathEdges = []) {
  const afEdges = (pathEdges || []).filter((edge) => String(edge?.reason || "").toLowerCase() === "af");
  if (afEdges.length === 0) return [];

  const nodeById = new Map((pathNodes || []).map((node) => [node.nodeId, node]));
  const sources = [
    overlaySample?.explanation,
    overlaySample?.description,
    overlaySample?.chainText,
    ...(afEdges || []).map((edge) => edge.afLabel || edge.rawType || ""),
  ];

  const parsedMetas = [];
  for (const source of sources) {
    for (const meta of parseAfAnnotationText(source)) parsedMetas.push(meta);
  }
  if (parsedMetas.length === 0) return [];

  const selected = [];
  const seen = new Set();
  for (const edge of afEdges) {
    const fromNode = nodeById.get(edge.fromNodeId);
    const toNode = nodeById.get(edge.toNodeId);
    const edgeNodes = [fromNode, toNode].filter(Boolean);
    const afNode = edgeNodes.find((node) => (node.nodeKind === "GroupedSector" || node.kind === "GroupedSector")) || edgeNodes[edgeNodes.length - 1];
    const nodeDigit = Number(afNode?.digitDisplay || afNode?.digit || 0);
    const nodeSector = normalizeSectorCells(afNode?.sectorCells, Number.isInteger(afNode?.cell) ? afNode.cell : null);

    let meta = parsedMetas.find((candidate) => {
      return candidate.digit === nodeDigit && cellsEqualAsSet(candidate.endpointCells, nodeSector);
    });
    if (!meta) {
      meta = parsedMetas.find((candidate) => candidate.digit === nodeDigit);
    }
    if (!meta) continue;

    const key = `${meta.digit}|${cellSetKey(meta.cells)}|${meta.firstLineType}${meta.firstMaskText}|${meta.secondLineType}${meta.secondMaskText}`;
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(meta);
  }

  return selected;
}

function applyTransitionStatesToPathNodes(pathNodes = [], pathEdges = []) {
  for (const edge of pathEdges || []) {
    const parts = String(edge.transition || "").split("->");
    if (parts.length !== 2) continue;

    const fromState = parts[0].trim().toUpperCase();
    const toState = parts[1].trim().toUpperCase();

    const fromNode = pathNodes[edge.fromPathIndex];
    const toNode = pathNodes[edge.toPathIndex];

    if (fromNode && (fromState === "ON" || fromState === "OFF")) {
      fromNode.state = fromState;
    }
    if (toNode && (toState === "ON" || toState === "OFF")) {
      toNode.state = toState;
    }
  }
}

function normalizeDebugYzfTyp4Sample(sampleJson) {
  const puzzleInfo = getSamplePuzzleInfo(sampleJson);
  return {
    sampleName: sampleJson.sampleName || "unknown",
    sourceKind: "debug",
    puzzle: puzzleInfo.puzzle,
    puzzleSource: puzzleInfo.source,
    title: sampleJson.technique || "Grouped AIC debug",
    chainType: sampleJson.technique || "Grouped AIC debug",
    isDebugOnly: sampleJson.debugOnly !== false,
    isManualPromotedStepResult: false,
    conclusionReadyForStepResult: sampleJson.conclusionReadyForStepResult === true,
    outcome: sampleJson.outcome || "Unknown",
    endpointRelation: sampleJson.endpointRelation || "",
    endpointInference: sampleJson.endpointInference || "",
    selectedPathRank: Number(sampleJson.selectedPathRank || 0),
    selectedPathReason: sampleJson.selectedPathReason || "",
    explanation: sampleJson.explanation || "",
    rank: null,
    path: {
      nodes: Array.isArray(sampleJson?.path?.nodes) ? sampleJson.path.nodes.map((node) => ({
        nodeId: node.nodeId,
        nodeKind: node.nodeKind || "SingleCandidate",
        digitDisplay: Number(node.digitDisplay || 0),
        state: node.state || extractStateFromLabel(node.label),
        label: node.label || "",
        cell: Number.isInteger(node.cell) ? node.cell : null,
        sectorCells: normalizeSectorCells(node.sectorCells, node.cell),
      })) : [],
      edges: Array.isArray(sampleJson?.path?.edges) ? sampleJson.path.edges.map((edge) => ({
        edgeId: edge.edgeId,
        fromNodeId: edge.fromNodeId,
        toNodeId: edge.toNodeId,
        strength: edge.strength === "weak" ? "weak" : "strong",
        reason: edge.reason || "unknown",
        transition: edge.transition || "",
        role: edge.role || "",
      })) : [],
    },
    endpoints: sampleJson.endpoints || {},
    candidateMarks: Array.isArray(sampleJson?.debugCandidates) ? sampleJson.debugCandidates.map((candidate) => ({
      cell: candidate.cell,
      row: candidate.row,
      col: candidate.col,
      digitDisplay: Number(candidate.digitDisplay || 0),
      label: candidate.label || "",
      reason: candidate.reason || "",
      startSectorCells: normalizeSectorCells(candidate.startSectorCells),
      endSectorCells: normalizeSectorCells(candidate.endSectorCells),
      conclusionReadyForStepResult: candidate.conclusionReadyForStepResult === true,
      candidateKind: "debug",
    })) : [],
    stats: sampleJson.stats || {},
    statusText: "",
  };
}

function normalizePromotedGroupedAicStepResult(sampleJson) {
  const puzzleInfo = getSamplePuzzleInfo(sampleJson);
  const pathNodes = Array.isArray(sampleJson?.nodes) ? sampleJson.nodes.map((node) => {
    const cell = Number.isInteger(node.index) ? node.index : null;
    const sectorCells = normalizeSectorCells(node.sectorCells, cell);
    return {
      nodeId: node.id,
      nodeKind: node.kind || "SingleCandidate",
      digitDisplay: Number(node.digit || 0),
      state: extractStateFromLabel(node.label),
      label: node.label || "",
      cell,
      sectorCells,
    };
  }) : [];

  const pathEdges = Array.isArray(sampleJson?.edges) ? sampleJson.edges.map((edge, index) => {
    const parsed = parseYzfEdgeType(edge.type);
    return {
      edgeId: index,
      fromNodeId: edge.from,
      toNodeId: edge.to,
      strength: parsed.strength,
      reason: parsed.reason,
      transition: parsed.transition,
    };
  }) : [];

  const firstNode = pathNodes[0] || null;
  const lastNode = pathNodes[pathNodes.length - 1] || null;
  const digitDisplay = firstNode?.digitDisplay || lastNode?.digitDisplay || 0;

  return {
    sampleName: sampleJson.sampleName || "unknown",
    sourceKind: "promoted-stepresult",
    puzzle: puzzleInfo.puzzle,
    puzzleSource: puzzleInfo.source,
    title: sampleJson.title || "Grouped AIC",
    chainType: sampleJson.chainType || sampleJson.title || "Grouped AIC",
    isDebugOnly: false,
    isManualPromotedStepResult: sampleJson.manualPromotedSample !== false,
    notFromDefaultSolver: sampleJson.notFromDefaultSolver !== false,
    conclusionReadyForStepResult: true,
    outcome: "PromotedGroupedAICStepResult",
    endpointRelation: "SameDigitSingleEndpoint",
    endpointInference: "StrongEndpointInference",
    selectedPathRank: 0,
    selectedPathReason: "manual_promoted_stepresult_sample",
    explanation: sampleJson.description || "Grouped AIC manual promoted sample; not from default solver.",
    rankAvailable: sampleJson.rankAvailable === true,
    rank: Number.isInteger(sampleJson.rank) ? sampleJson.rank : 0,
    chainLength: Number.isInteger(sampleJson.chainLength) ? sampleJson.chainLength : 0,
    path: {
      nodes: pathNodes,
      edges: pathEdges,
    },
    branches: [],
    endpoints: {
      startNodeId: firstNode?.nodeId ?? null,
      endNodeId: lastNode?.nodeId ?? null,
      startNodeKind: firstNode?.nodeKind || "",
      endNodeKind: lastNode?.nodeKind || "",
      digitDisplay,
      startSectorCells: firstNode?.sectorCells || [],
      endSectorCells: lastNode?.sectorCells || [],
      endpointSectorsOverlap: false,
      endpointSectorValidationPassed: true,
      endpointSectorRejectReason: "",
    },
    candidateMarks: Array.isArray(sampleJson?.eliminations) ? sampleJson.eliminations.map((candidate) => ({
      cell: candidate.index,
      row: candidate.row,
      col: candidate.col,
      digitDisplay: Array.isArray(candidate.candidates) && candidate.candidates.length > 0 ? Number(candidate.candidates[0] || 0) : 0,
      label: `r${Number(candidate.row) + 1}c${Number(candidate.col) + 1}#${Array.isArray(candidate.candidates) && candidate.candidates.length > 0 ? candidate.candidates[0] : ""}`,
      reason: "common peer of grouped AIC strong endpoint inference",
      startSectorCells: firstNode?.sectorCells || [],
      endSectorCells: lastNode?.sectorCells || [],
      conclusionReadyForStepResult: true,
      candidateKind: "formal",
    })) : [],
    stats: {
      pathLength: pathEdges.length,
      visitedStates: 0,
      groupedNodesInPath: pathNodes.filter((node) => node.nodeKind === "GroupedSector").length,
      groupEdgesInPath: pathEdges.filter((edge) => edge.reason === "group").length,
    },
    statusText: "",
  };
}

function normalizeYzfOverlaySample(sampleJson) {
  if (
    sampleJson &&
    typeof sampleJson === "object" &&
    typeof sampleJson.sourceKind === "string" &&
    sampleJson.path &&
    Array.isArray(sampleJson.path.nodes) &&
    Array.isArray(sampleJson.path.edges) &&
    Array.isArray(sampleJson.candidateMarks)
  ) {
    return sampleJson;
  }
  if (sampleJson?.path && sampleJson?.debugOnly !== undefined) {
    return normalizeDebugYzfTyp4Sample(sampleJson);
  }
  if (
    typeof sampleJson?.chainType === "string" &&
    sampleJson.chainType.startsWith("Grouped ") &&
    Array.isArray(sampleJson?.nodes) &&
    Array.isArray(sampleJson?.edges)
  ) {
    return normalizePromotedGroupedAicStepResult(sampleJson);
  }
  return {
    sampleName: sampleJson?.sampleName || "unknown",
    sourceKind: "unknown",
    puzzle: getSamplePuzzleInfo(sampleJson).puzzle,
    puzzleSource: getSamplePuzzleInfo(sampleJson).source,
    title: sampleJson?.title || sampleJson?.technique || "Unknown sample",
    chainType: sampleJson?.chainType || "",
    isDebugOnly: true,
    isManualPromotedStepResult: false,
    conclusionReadyForStepResult: false,
    outcome: sampleJson?.outcome || "Unknown",
    endpointRelation: sampleJson?.endpointRelation || "",
    endpointInference: sampleJson?.endpointInference || "",
    selectedPathRank: 0,
    selectedPathReason: "",
    explanation: sampleJson?.description || "",
    rank: null,
    path: { nodes: [], edges: [] },
    endpoints: {},
    candidateMarks: [],
    stats: {},
    statusText: "",
  };
}

function readBoardGeometryLogical() {
  const stageRect = boardStage?.getBoundingClientRect?.();
  const style = board ? window.getComputedStyle(board) : null;
  const stageSize = Math.max(1, Number(stageRect?.width || 900));
  const gridLinePx = Math.max(0.25, Number.parseFloat(style?.getPropertyValue("--yzf-grid-line-width") || "") || 1);
  const factorRaw = Number.parseFloat(style?.getPropertyValue("--yzf-box-line-factor") || "");
  const boxFactor = Number.isFinite(factorRaw) && factorRaw > 0 ? factorRaw : 2;
  const boxLinePx = Math.max(0.25, Number.parseFloat(style?.getPropertyValue("--yzf-box-line-width") || "") || gridLinePx * boxFactor);
  const configuredCellPx = Number.parseFloat(style?.getPropertyValue("--yzf-cell-size") || "");
  const totalLinePx = 6 * gridLinePx + 4 * boxLinePx;
  const cellSizePx = Number.isFinite(configuredCellPx) && configuredCellPx > 0
    ? configuredCellPx
    : Math.max(1, (stageSize - totalLinePx) / 9);
  const boardSizePx = 9 * cellSizePx + totalLinePx;
  const scale = 900 / Math.max(1, boardSizePx);

  const contentStartPx = (index) => {
    const boxLinesBefore = Math.floor(index / 3);
    const normalLinesBefore = index - boxLinesBefore;
    return boxLinePx
      + index * cellSizePx
      + boxLinesBefore * boxLinePx
      + normalLinesBefore * gridLinePx;
  };

  return {
    gridLinePx,
    boxFactor,
    boxLinePx,
    totalLinePx,
    cellSizePx,
    boardSizePx,
    scale,
    contentStartPx,
  };
}

function getCellRectLogical(cell) {
  const row = Math.floor(cell / 9);
  const col = cell % 9;
  const geometry = readBoardGeometryLogical();
  const x = geometry.contentStartPx(col) * geometry.scale;
  const y = geometry.contentStartPx(row) * geometry.scale;
  const size = geometry.cellSizePx * geometry.scale;
  return {
    cell,
    row,
    col,
    x,
    y,
    width: size,
    height: size,
    cx: x + size / 2,
    cy: y + size / 2,
  };
}

function getCandidateCenter(cell, digitDisplay) {
  const candidateElement = board?.querySelector(`.sudoku-cell[data-cell-index="${cell}"] .candidate[data-digit="${digitDisplay}"]`);
  const stageRect = boardStage?.getBoundingClientRect?.();
  const candidateRect = candidateElement?.getBoundingClientRect?.();
  if (stageRect && candidateRect && candidateRect.width > 0 && candidateRect.height > 0) {
    return {
      x: ((candidateRect.left + candidateRect.width / 2) - stageRect.left) * (900 / stageRect.width),
      y: ((candidateRect.top + candidateRect.height / 2) - stageRect.top) * (900 / stageRect.height),
    };
  }
  const rect = getCellRectLogical(cell);
  const digitIndex = Math.max(0, Math.min(8, Number(digitDisplay) - 1));
  const candidateRow = Math.floor(digitIndex / 3);
  const candidateCol = digitIndex % 3;
  return {
    x: rect.x + candidateCol * (rect.width / 3) + (rect.width / 6),
    y: rect.y + candidateRow * (rect.height / 3) + (rect.height / 6),
  };
}

function getSectorCenter(sectorCells) {
  const cells = Array.isArray(sectorCells) ? sectorCells : [];
  if (!cells.length) {
    return { x: 450, y: 450 };
  }
  const sum = cells.reduce((acc, cell) => {
    const rect = getCellRectLogical(cell);
    acc.x += rect.cx;
    acc.y += rect.cy;
    return acc;
  }, { x: 0, y: 0 });
  return {
    x: sum.x / cells.length,
    y: sum.y / cells.length,
  };
}

function makeCandidateAnchor(cell, digit, nodeKind) {
  const point = getCandidateCenter(cell, digit);
  return {
    x: point.x,
    y: point.y,
    cell,
    digitDisplay: digit,
    nodeKind,
  };
}

function getCandidateSectorAnchors(cells, digit, nodeKind) {
  const normalizedCells = [...new Set(cells || [])]
    .filter((cell) => Number.isInteger(cell) && cell >= 0 && cell < 81);

  // GroupedSector / AlsCandidateSector 的 sectorCells 是一个区域集合，
  // 但某个 digit 未必真实存在于每个格子。画线锚点必须优先落在
  // 实际拥有该候选数的位置，否则 ALS 边会选到错误锚点，严重时
  // 最后一条边会看起来“没画出来”。
  const presentCells = normalizedCells.filter((cell) => boardCandidateExists(cell, digit));
  const anchorCells = presentCells.length > 0 ? presentCells : normalizedCells;

  return anchorCells.map((cell) => makeCandidateAnchor(cell, digit, nodeKind));
}

function getNodeAnchorCandidates(node) {
  const digit = Number(node?.digitDisplay || node?.digit || 0);
  if (!Number.isInteger(digit) || digit < 1 || digit > 9) return [];

  const nodeKind = node?.nodeKind || node?.kind || "SingleCandidate";

  if (nodeKind === "GroupedSector" || nodeKind === "AlsCandidateSector") {
    return getCandidateSectorAnchors(normalizeSectorCells(node.sectorCells, null), digit, nodeKind);
  }

  if (Number.isInteger(node?.cell) && node.cell >= 0 && node.cell < 81) {
    return [makeCandidateAnchor(node.cell, digit, nodeKind)];
  }

  const fallbackCells = normalizeSectorCells(node?.sectorCells, null);
  if (fallbackCells.length > 0) {
    return getCandidateSectorAnchors(fallbackCells, digit, nodeKind);
  }

  return [];
}

function sameHouseForCells(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return false;
  const ar = Math.floor(a / 9);
  const ac = a % 9;
  const br = Math.floor(b / 9);
  const bc = b % 9;
  return ar === br || ac === bc || (Math.floor(ar / 3) === Math.floor(br / 3) && Math.floor(ac / 3) === Math.floor(bc / 3));
}

function edgeReasonMatchesCells(reason, a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return false;
  const ar = Math.floor(a / 9);
  const ac = a % 9;
  const br = Math.floor(b / 9);
  const bc = b % 9;
  const normalized = String(reason || "").toLowerCase();

  if (normalized === "row") return ar === br;
  if (normalized === "column" || normalized === "col") return ac === bc;
  if (normalized === "box") {
    return Math.floor(ar / 3) === Math.floor(br / 3) && Math.floor(ac / 3) === Math.floor(bc / 3);
  }

  // group 边通常跨 group sector，最短即可；cell 边同格即可。
  if (normalized === "cell") return a === b;
  if (normalized === "group") return true;

  return sameHouseForCells(a, b);
}

function chooseBestAnchorPairForEdge(sourceNode, targetNode, edge) {
  const sourceCandidates = getNodeAnchorCandidates(sourceNode);
  const targetCandidates = getNodeAnchorCandidates(targetNode);

  if (!sourceCandidates.length || !targetCandidates.length) {
    return null;
  }

  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const source of sourceCandidates) {
    for (const target of targetCandidates) {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distanceSquared = dx * dx + dy * dy;

      // 优先符合 edge.reason 的候选点组合；不符合也不是完全禁止，只加惩罚。
      const reasonPenalty = edgeReasonMatchesCells(edge?.reason, source.cell, target.cell) ? 0 : 1000000;

      // 轻微偏好同行/同列/同宫，避免在距离接近时选出别扭的斜线。
      const housePenalty = sameHouseForCells(source.cell, target.cell) ? 0 : 50000;

      // 轻微偏好更直的线：横竖线优先，其次斜线。
      const straightPenalty = (Math.abs(dx) < 1 || Math.abs(dy) < 1) ? 0 : 500;

      const score = reasonPenalty + housePenalty + straightPenalty + distanceSquared;

      if (score < bestScore) {
        bestScore = score;
        best = { source, target };
      }
    }
  }

  return best;
}

function getAnchorPointRadius(anchor) {
  if (!anchor || !Number.isInteger(anchor.cell) || !Number.isInteger(anchor.digitDisplay)) {
    return 10;
  }

  const candidateElement = getBoardCandidateElement(anchor.cell, anchor.digitDisplay);
  const stageRect = boardStage?.getBoundingClientRect?.();

  if (candidateElement && stageRect && stageRect.width > 0) {
    const beforeStyle = window.getComputedStyle(candidateElement, "::before");
    const beforeWidth = Number.parseFloat(beforeStyle?.width || "");
    if (Number.isFinite(beforeWidth) && beforeWidth > 0) {
      return (beforeWidth * 0.5) * (900 / stageRect.width);
    }

    const rect = candidateElement.getBoundingClientRect?.();
    if (rect && rect.width > 0 && rect.height > 0) {
      return (Math.max(rect.width, rect.height) * 0.45) * (900 / stageRect.width);
    }
  }

  return 10;
}

function pointOnCircleToward(center, toward, radius, rotateDegrees = 0) {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const length = Math.hypot(dx, dy);

  if (!Number.isFinite(length) || length < 1e-6) {
    return { x: center.x, y: center.y };
  }

  let ux = dx / length;
  let uy = dy / length;

  if (rotateDegrees) {
    const rotated = rotateVector(ux, uy, rotateDegrees * Math.PI / 180);
    ux = rotated.x;
    uy = rotated.y;
  }

  return {
    x: center.x + ux * radius,
    y: center.y + uy * radius,
  };
}

function distancePointToLineSegmentForAnchors(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= 1e-6) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  const projX = start.x + t * dx;
  const projY = start.y + t * dy;

  return Math.hypot(point.x - projX, point.y - projY);
}

function straightEdgeWouldHitOtherCandidate(start, end, sourceNode, targetNode, pathNodes) {
  const sourceId = sourceNode?.nodeId;
  const targetId = targetNode?.nodeId;

  for (const node of pathNodes || []) {
    if (!node) continue;
    if (node.nodeId === sourceId || node.nodeId === targetId) continue;

    const anchors = getNodeAnchorCandidates(node);
    for (const anchor of anchors) {
      const radius = getAnchorPointRadius(anchor);
      const distance = distancePointToLineSegmentForAnchors(anchor, start, end);

      if (distance < radius + 3) {
        return true;
      }
    }
  }

  return false;
}

function chooseCurveOrientationFromCollision(sourceAnchor, targetAnchor, sourceNode, targetNode, pathNodes) {
  const dx = targetAnchor.x - sourceAnchor.x;
  const dy = targetAnchor.y - sourceAnchor.y;
  const horizontalLike = Math.abs(dx) >= Math.abs(dy);

  let nearestPoint = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const node of pathNodes || []) {
    if (!node) continue;
    if (node.nodeId === sourceNode?.nodeId || node.nodeId === targetNode?.nodeId) continue;

    for (const anchor of getNodeAnchorCandidates(node)) {
      const distance = distancePointToLineSegmentForAnchors(anchor, sourceAnchor, targetAnchor);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPoint = anchor;
      }
    }
  }

  if (!nearestPoint) {
    return horizontalLike ? "up" : "left";
  }

  const midX = (sourceAnchor.x + targetAnchor.x) / 2;
  const midY = (sourceAnchor.y + targetAnchor.y) / 2;

  if (horizontalLike) {
    return nearestPoint.y >= midY ? "up" : "down";
  }

  return nearestPoint.x >= midX ? "left" : "right";
}

function bezierControlOffsetForOrientation(start, end, orientation, offset) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  switch (orientation) {
    case "up":
      return { x: midX, y: Math.min(start.y, end.y) - offset };
    case "down":
      return { x: midX, y: Math.max(start.y, end.y) + offset };
    case "left":
      return { x: Math.min(start.x, end.x) - offset, y: midY };
    case "right":
      return { x: Math.max(start.x, end.x) + offset, y: midY };
    default: {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const normal = normalizeVector(-dy, dx);
      return {
        x: midX + normal.x * offset,
        y: midY + normal.y * offset,
      };
    }
  }
}

function buildCandidateCircleAwareEdgeGeometry(sourceNode, targetNode, edge, laneOffset = 0, pathNodes = []) {
  const anchorPair = chooseBestAnchorPairForEdge(sourceNode, targetNode, edge);

  if (!anchorPair) {
    return buildOverlayEdgeGeometry(sourceNode, targetNode, edge, laneOffset, null);
  }

  const sourceAnchor = anchorPair.source;
  const targetAnchor = anchorPair.target;
  const sourceRadius = getAnchorPointRadius(sourceAnchor);
  const targetRadius = getAnchorPointRadius(targetAnchor);

  // 先按候选圆心到候选圆心连线，取与两端高亮圆的交点。
  const straightStart = pointOnCircleToward(sourceAnchor, targetAnchor, sourceRadius, 0);
  const straightEnd = pointOnCircleToward(targetAnchor, sourceAnchor, targetRadius, 0);

  const braidEdgeRole = String(edge?.role || "").toLowerCase();
  const braidSemanticEdge = braidEdgeRole === "braid-main" || braidEdgeRole === "braid-branch";
  const lineHitsOther = braidSemanticEdge ? false : straightEdgeWouldHitOtherCandidate(
    straightStart,
    straightEnd,
    sourceNode,
    targetNode,
    pathNodes
  );

  const visibleLength = Math.hypot(targetAnchor.x - sourceAnchor.x, targetAnchor.y - sourceAnchor.y) - sourceRadius - targetRadius;
  const sameCell = sourceAnchor.cell === targetAnchor.cell;
  const shortNonCellLink = !sameCell && Number.isFinite(visibleLength) && visibleLength < OVERLAY_SHORT_EDGE_MIN_VISIBLE_LENGTH;
  // Braid/g-Braid edges are backend-owned MakeBraidHint edges.  Do not curve
  // them around other chain candidates: that collision-avoidance geometry makes
  // a single FB branch 0 spine look like a tree.  Keep the backend edge order
  // visually literal and only use lane offsets if multiple identical lanes are
  // actually present.
  const needCurve = (braidSemanticEdge ? false : (lineHitsOther || shortNonCellLink)) || Math.abs(laneOffset) > 0;

  if (!needCurve) {
    return {
      labelPoint: {
        x: (straightStart.x + straightEnd.x) / 2,
        y: (straightStart.y + straightEnd.y) / 2,
      },
      pathD: `M ${straightStart.x} ${straightStart.y} L ${straightEnd.x} ${straightEnd.y}`,
    };
  }

  // 如果直线会穿过其它候选高亮圆，则改成三阶贝塞尔曲线。
  // 起终点仍在两端高亮圆上，只是绕圆心旋转约 60 度。
  const orientation = chooseCurveOrientationFromCollision(
    sourceAnchor,
    targetAnchor,
    sourceNode,
    targetNode,
    pathNodes
  );

  const rotations = getCurveEndpointRotations(sourceAnchor, targetAnchor, orientation);
  const start = pointOnCircleToward(sourceAnchor, targetAnchor, sourceRadius, rotations.startDegrees);
  const end = pointOnCircleToward(targetAnchor, sourceAnchor, targetRadius, rotations.endDegrees);

  const distance = Math.hypot(end.x - start.x, end.y - start.y) || 1;
  const unitX = (end.x - start.x) / distance;
  const unitY = (end.y - start.y) / distance;

  const curveOffset = Math.max(edgeCurveBaseOffset(edge, laneOffset), Math.abs(laneOffset) * 2, 22);
  const candidateStep = getOverlayCandidateStep();

  const controlMid = bezierControlOffsetForOrientation(start, end, orientation, curveOffset);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const offsetX = controlMid.x - midX;
  const offsetY = controlMid.y - midY;

  const control1 = {
    x: start.x + unitX * candidateStep + offsetX,
    y: start.y + unitY * candidateStep + offsetY,
  };

  const control2 = {
    x: end.x - unitX * candidateStep + offsetX,
    y: end.y - unitY * candidateStep + offsetY,
  };

  return {
    labelPoint: {
      x: (control1.x + control2.x) / 2,
      y: (control1.y + control2.y) / 2,
    },
    pathD: `M ${start.x} ${start.y} C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${end.x} ${end.y}`,
  };
}


function getOverlayNodeAnchor(node) {
  if (!node) return { x: 450, y: 450 };
  if (node.nodeKind === "GroupedSector") {
    return getSectorCenter(node.sectorCells || []);
  }
  if (Number.isInteger(node.cell) && Number.isInteger(node.digitDisplay)) {
    return getCandidateCenter(node.cell, node.digitDisplay);
  }
  return getSectorCenter(node.sectorCells || []);
}

function getOverlayNodeRadius(node) {
  if (node?.nodeKind === "GroupedSector") {
    return 14;
  }
  if (Number.isInteger(node?.cell) && Number.isInteger(node?.digitDisplay)) {
    const candidateElement = getBoardCandidateElement(node.cell, node.digitDisplay);
    const stageRect = boardStage?.getBoundingClientRect?.();
    if (candidateElement && stageRect) {
      const beforeStyle = window.getComputedStyle(candidateElement, "::before");
      const beforeWidth = Number.parseFloat(beforeStyle?.width || "");
      if (Number.isFinite(beforeWidth) && beforeWidth > 0 && stageRect.width > 0) {
        return (beforeWidth * 0.5) * (900 / stageRect.width);
      }
      const rect = candidateElement.getBoundingClientRect?.();
      if (rect && rect.width > 0) {
        return (Math.max(rect.width, rect.height) * 0.8) * (900 / stageRect.width);
      }
    }
  }
  return 12.5;
}

function getColinearityKey(sourceNode, targetNode) {
  const source = getOverlayNodeAnchor(sourceNode);
  const target = getOverlayNodeAnchor(targetNode);
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  if (Math.abs(dx) < 1) return `v:${Math.round(source.x)}`;
  if (Math.abs(dy) < 1) return `h:${Math.round(source.y)}`;
  return "";
}

function buildDirectedChainOrder(pathNodes, pathEdges) {
  const nodes = Array.isArray(pathNodes) ? pathNodes : [];
  const edges = Array.isArray(pathEdges) ? pathEdges : [];
  if (!nodes.length || !edges.length) {
    return { orderedNodeIds: [], orderedEdges: [], ok: false };
  }
  const nodeById = new Map(nodes.map((node) => [node.nodeId, node]));
  const adjacency = new Map(nodes.map((node) => [node.nodeId, []]));
  const indegree = new Map(nodes.map((node) => [node.nodeId, 0]));
  for (const edge of edges) {
    const originalFrom = nodeById.get(edge.fromNodeId);
    const originalTo = nodeById.get(edge.toNodeId);
    if (!originalFrom || !originalTo) continue;
    const directed = resolveEdgeArrowTarget(edge, originalFrom, originalTo);
    const sourceId = directed.source?.nodeId;
    const targetId = directed.target?.nodeId;
    if (!Number.isInteger(sourceId) || !Number.isInteger(targetId)) continue;
    if (!adjacency.has(sourceId)) adjacency.set(sourceId, []);
    adjacency.get(sourceId).push({ edge, next: targetId });
    indegree.set(targetId, (indegree.get(targetId) || 0) + 1);
  }
  const startCandidates = [...adjacency.keys()].filter((nodeId) => (adjacency.get(nodeId)?.length || 0) > 0 && (indegree.get(nodeId) || 0) === 0);
  if (startCandidates.length !== 1) {
    return { orderedNodeIds: nodes.map((node) => node.nodeId), orderedEdges: edges.slice(), ok: false };
  }
  const orderedNodeIds = [];
  const orderedEdges = [];
  const visited = new Set();
  let currentId = startCandidates[0];
  while (currentId != null && !visited.has(currentId)) {
    visited.add(currentId);
    orderedNodeIds.push(currentId);
    const nextOptions = adjacency.get(currentId) || [];
    if (!nextOptions.length) break;
    const nextItem = nextOptions[0];
    orderedEdges.push(nextItem.edge);
    currentId = nextItem.next;
  }
  return {
    orderedNodeIds,
    orderedEdges,
    ok: orderedNodeIds.length === nodes.length && orderedEdges.length === edges.length,
  };
}

function buildUndirectedChainOrder(pathNodes, pathEdges) {
  const nodes = Array.isArray(pathNodes) ? pathNodes : [];
  const edges = Array.isArray(pathEdges) ? pathEdges : [];
  if (!nodes.length || !edges.length) {
    return { orderedNodeIds: [], orderedEdges: [], ok: false };
  }
  const adjacency = new Map(nodes.map((node) => [node.nodeId, []]));
  for (const edge of edges) {
    if (!adjacency.has(edge.fromNodeId) || !adjacency.has(edge.toNodeId)) continue;
    adjacency.get(edge.fromNodeId).push({ edge, next: edge.toNodeId });
    adjacency.get(edge.toNodeId).push({ edge, next: edge.fromNodeId });
  }
  const endpoints = [...adjacency.entries()]
    .filter(([, links]) => links.length === 1)
    .map(([nodeId]) => nodeId);
  if (endpoints.length !== 2) {
    return { orderedNodeIds: nodes.map((node) => node.nodeId), orderedEdges: edges.slice(), ok: false };
  }
  const nodeById = new Map(nodes.map((node) => [node.nodeId, node]));
  endpoints.sort((a, b) => {
    const nodeA = nodeById.get(a);
    const nodeB = nodeById.get(b);
    const groupedA = nodeA?.nodeKind === "GroupedSector" || nodeA?.kind === "GroupedSector";
    const groupedB = nodeB?.nodeKind === "GroupedSector" || nodeB?.kind === "GroupedSector";
    if (groupedA !== groupedB) return groupedA ? 1 : -1;
    const cellA = Number.isInteger(nodeA?.cell) ? nodeA.cell : 999;
    const cellB = Number.isInteger(nodeB?.cell) ? nodeB.cell : 999;
    return cellA - cellB;
  });

  const orderedNodeIds = [];
  const orderedEdges = [];
  const visitedNodes = new Set();
  const visitedEdges = new Set();
  let currentId = endpoints[0];
  let previousId = null;
  while (currentId != null && !visitedNodes.has(currentId)) {
    visitedNodes.add(currentId);
    orderedNodeIds.push(currentId);
    const nextOptions = (adjacency.get(currentId) || []).filter((item) => !visitedEdges.has(item.edge.edgeId) && item.next !== previousId);
    if (!nextOptions.length) break;
    const nextItem = nextOptions[0];
    orderedEdges.push(nextItem.edge);
    visitedEdges.add(nextItem.edge.edgeId);
    previousId = currentId;
    currentId = nextItem.next;
  }
  return {
    orderedNodeIds,
    orderedEdges,
    ok: orderedNodeIds.length === nodes.length && orderedEdges.length === edges.length,
  };
}

function buildCycleChainOrder(pathNodes, pathEdges) {
  const nodes = Array.isArray(pathNodes) ? pathNodes : [];
  const edges = Array.isArray(pathEdges) ? pathEdges : [];

  if (!nodes.length || !edges.length) {
    return { orderedNodeIds: [], orderedEdges: [], ok: false, isCycle: false };
  }

  // 后端 StepResult 对 Cycle / Ring 输出为：
  // nodes = 环上的 occurrence 顺序
  // edges = 相邻边 + 最后一条闭合边
  if (nodes.length >= 3 && edges.length === nodes.length) {
    return {
      orderedNodeIds: nodes.map((node) => node.nodeId),
      orderedEdges: edges.slice(),
      ok: true,
      isCycle: true,
    };
  }

  return { orderedNodeIds: [], orderedEdges: [], ok: false, isCycle: false };
}

function buildOverlayPathOrder(pathNodes, pathEdges) {
  let ordered = buildDirectedChainOrder(pathNodes, pathEdges);
  if (!ordered.ok) {
    ordered = buildUndirectedChainOrder(pathNodes, pathEdges);
  }
  if (!ordered.ok) {
    ordered = buildCycleChainOrder(pathNodes, pathEdges);
  }
  return ordered;
}

function createOverlayMarkerDefs(svgRoot) {
  const defs = createSvgElement("defs", {});
  const markerSpecs = [
    { id: "yzfArrowStrong", color: "#ef4444" },
    { id: "yzfArrowWeak", color: "#ef4444" },
    { id: "yzfArrowGroup", color: "#ef4444" },
    { id: "yzfArrowBlossomMain", color: "#16a34a" },
    { id: "yzfArrowBlossomBranch", color: "#ef4444" },
    { id: "yzfArrowBraidMain", color: "#ef4444" },
    { id: "yzfArrowBraidBranch", color: "#2563eb" },
    { id: "yzfArrowManualConstruction", color: "#f97316" },
  ];
  for (const markerSpec of markerSpecs) {
    const marker = createSvgElement("marker", {
      id: markerSpec.id,
      markerWidth: 5,
      markerHeight: 5,
      refX: 4,
      refY: 2.5,
      orient: "auto",
      markerUnits: "strokeWidth",
    });
    marker.appendChild(createSvgElement("path", {
      d: "M 0 0 L 5 2.5 L 0 5 z",
      fill: markerSpec.color,
      opacity: 0.92,
    }));
    defs.appendChild(marker);
  }
  svgRoot.appendChild(defs);
}

function resolveEdgeArrowTarget(edge, fromNode, toNode) {
  const targetState = edge?.strength === "strong" ? "ON" : "OFF";
  if ((fromNode?.state || "") === targetState && (toNode?.state || "") !== targetState) {
    return { source: toNode, target: fromNode };
  }
  if ((toNode?.state || "") === targetState && (fromNode?.state || "") !== targetState) {
    return { source: fromNode, target: toNode };
  }
  return { source: fromNode, target: toNode };
}

function buildOrderedEdgeDirectionMap(orderedPath) {
  const map = new Map();
  const orderedNodeIds = Array.isArray(orderedPath?.orderedNodeIds) ? orderedPath.orderedNodeIds : [];
  const orderedEdges = Array.isArray(orderedPath?.orderedEdges) ? orderedPath.orderedEdges : [];
  const isCycle = orderedPath?.isCycle === true || (
    orderedNodeIds.length >= 3 &&
    orderedEdges.length === orderedNodeIds.length
  );

  for (let index = 0; index < orderedEdges.length; index += 1) {
    const edge = orderedEdges[index];
    const sourceId = orderedNodeIds[index];
    const targetId = (index + 1 < orderedNodeIds.length)
      ? orderedNodeIds[index + 1]
      : (isCycle ? orderedNodeIds[0] : null);

    if (!edge || !Number.isInteger(sourceId) || !Number.isInteger(targetId)) continue;
    map.set(edge.edgeId, { sourceId, targetId });
  }

  return map;
}

function rotateVector(x, y, radians) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

function normalizeVector(dx, dy) {
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length, length };
}

function edgeCurveBaseOffset(edge, laneOffset = 0) {
  return (edge?.reason === "group" ? 28 : 18) + Math.abs(laneOffset) * 0.6;
}

function getOverlayCandidateStep() {
  return getCellRectLogical(0).width / 3;
}

function getCurveEndpointRotations(sourceAnchor, targetAnchor, orientation) {
  const sourceIsLeft = sourceAnchor.x <= targetAnchor.x;
  const sourceIsUpper = sourceAnchor.y <= targetAnchor.y;
  switch (orientation) {
    case "up":
      return sourceIsLeft ? { startDegrees: -60, endDegrees: 60 } : { startDegrees: 60, endDegrees: -60 };
    case "down":
      return sourceIsLeft ? { startDegrees: 60, endDegrees: -60 } : { startDegrees: -60, endDegrees: 60 };
    case "left":
      return sourceIsUpper ? { startDegrees: 60, endDegrees: -60 } : { startDegrees: -60, endDegrees: 60 };
    case "right":
      return sourceIsUpper ? { startDegrees: -60, endDegrees: 60 } : { startDegrees: 60, endDegrees: -60 };
    default:
      return { startDegrees: 0, endDegrees: 0 };
  }
}

function buildOverlayEdgeGeometry(sourceNode, targetNode, edge, laneOffset = 0, curveDescriptor = null) {
  const sourceAnchor = getOverlayNodeAnchor(sourceNode);
  const targetAnchor = getOverlayNodeAnchor(targetNode);
  const dx = targetAnchor.x - sourceAnchor.x;
  const dy = targetAnchor.y - sourceAnchor.y;
  const direction = normalizeVector(dx, dy);
  const unitX = direction.x;
  const unitY = direction.y;
  const startRadius = getOverlayNodeRadius(sourceNode);
  const endRadius = getOverlayNodeRadius(targetNode);
  const normalX = -unitY;
  const normalY = unitX;
  const baseStart = {
    x: sourceAnchor.x + unitX * startRadius,
    y: sourceAnchor.y + unitY * startRadius,
  };
  const baseEnd = {
    x: targetAnchor.x - unitX * endRadius,
    y: targetAnchor.y - unitY * endRadius,
  };

  if (!curveDescriptor?.enabled) {
    const start = {
      x: baseStart.x + normalX * laneOffset,
      y: baseStart.y + normalY * laneOffset,
    };
    const end = {
      x: baseEnd.x + normalX * laneOffset,
      y: baseEnd.y + normalY * laneOffset,
    };
    return {
      labelPoint: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
      pathD: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
    };
  }

  const curveOffset = curveDescriptor.offset || edgeCurveBaseOffset(edge, laneOffset);
  const midX = (sourceAnchor.x + targetAnchor.x) / 2;
  const midY = (sourceAnchor.y + targetAnchor.y) / 2;
  let control = { x: midX, y: midY };
  let offsetX = 0;
  let offsetY = 0;
  switch (curveDescriptor.orientation) {
    case "up":
      offsetY = -curveOffset;
      control = { x: midX, y: Math.min(sourceAnchor.y, targetAnchor.y) + offsetY };
      break;
    case "down":
      offsetY = curveOffset;
      control = { x: midX, y: Math.max(sourceAnchor.y, targetAnchor.y) + offsetY };
      break;
    case "left":
      offsetX = -curveOffset;
      control = { x: Math.min(sourceAnchor.x, targetAnchor.x) + offsetX, y: midY };
      break;
    case "right":
      offsetX = curveOffset;
      control = { x: Math.max(sourceAnchor.x, targetAnchor.x) + offsetX, y: midY };
      break;
    default:
      offsetX = normalX * curveOffset;
      offsetY = normalY * curveOffset;
      control = { x: midX + offsetX, y: midY + offsetY };
      break;
  }
  const rotations = getCurveEndpointRotations(sourceAnchor, targetAnchor, curveDescriptor.orientation);
  const startDirBase = normalizeVector(control.x - sourceAnchor.x, control.y - sourceAnchor.y);
  const endDirBase = normalizeVector(control.x - targetAnchor.x, control.y - targetAnchor.y);
  const rotatedStart = rotateVector(startDirBase.x, startDirBase.y, rotations.startDegrees * Math.PI / 180);
  const rotatedEnd = rotateVector(endDirBase.x, endDirBase.y, rotations.endDegrees * Math.PI / 180);
  const start = {
    x: sourceAnchor.x + rotatedStart.x * startRadius,
    y: sourceAnchor.y + rotatedStart.y * startRadius,
  };
  const end = {
    x: targetAnchor.x + rotatedEnd.x * endRadius,
    y: targetAnchor.y + rotatedEnd.y * endRadius,
  };
  const candidateStep = getOverlayCandidateStep();
  const control1 = {
    x: start.x + unitX * candidateStep + offsetX,
    y: start.y + unitY * candidateStep + offsetY,
  };
  const control2 = {
    x: end.x - unitX * candidateStep + offsetX,
    y: end.y - unitY * candidateStep + offsetY,
  };
  return {
    labelPoint: { x: (control1.x + control2.x) / 2, y: (control1.y + control2.y) / 2 },
    pathD: `M ${start.x} ${start.y} C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${end.x} ${end.y}`,
  };
}


function buildAlsEdgeGeometry(sourceNode, targetNode, edge, laneOffset = 0) {
  const anchorPair = chooseBestAnchorPairForEdge(sourceNode, targetNode, edge);
  if (!anchorPair) {
    return buildOverlayEdgeGeometry(sourceNode, targetNode, edge, laneOffset, null);
  }

  const sourceAnchor = anchorPair.source;
  const targetAnchor = anchorPair.target;
  const dx = targetAnchor.x - sourceAnchor.x;
  const dy = targetAnchor.y - sourceAnchor.y;
  const direction = normalizeVector(dx, dy);
  const unitX = direction.x;
  const unitY = direction.y;
  const normalX = -unitY;
  const normalY = unitX;
  const startRadius = getAnchorPointRadius(sourceAnchor);
  const endRadius = getAnchorPointRadius(targetAnchor);

  // ALS strong links are logical links through the ALS container.  They may
  // connect a single candidate to a candidate-sector node.  The generic edge
  // geometry may curve them away to avoid highlight circles; for short ALS
  // links this can make the final link appear missing.  Draw ALS links as an
  // explicit endpoint-to-endpoint segment, with only the lane offset applied.
  const start = {
    x: sourceAnchor.x + unitX * startRadius + normalX * laneOffset,
    y: sourceAnchor.y + unitY * startRadius + normalY * laneOffset,
  };
  const end = {
    x: targetAnchor.x - unitX * endRadius + normalX * laneOffset,
    y: targetAnchor.y - unitY * endRadius + normalY * laneOffset,
  };

  return {
    labelPoint: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
    pathD: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
  };
}

function getOverlayEdgeLaneOffset(edgeOrderIndex = 0) {
  const laneCycle = [0, -7, 7, -12, 12, -16, 16];
  return laneCycle[edgeOrderIndex % laneCycle.length] || 0;
}

function buildOverlayEdgeLaneMap(pathEdges, nodeById, overlaySample) {
  const laneMap = new Map();
  const colinearGroups = new Map();
  for (const edge of pathEdges || []) {
    if (shouldSuppressOverlayEdge(overlaySample, edge)) continue;
    const fromNode = nodeById.get(edge.fromNodeId);
    const toNode = nodeById.get(edge.toNodeId);
    if (!fromNode || !toNode) continue;
    if (shouldSuppressShortOverlayEdge(overlaySample, edge, fromNode, toNode)) continue;
    const key = getColinearityKey(fromNode, toNode);
    if (!key) continue;
    if (!colinearGroups.has(key)) colinearGroups.set(key, []);
    colinearGroups.get(key).push(edge);
  }
  for (const edges of colinearGroups.values()) {
    if (edges.length < 2) continue;
    edges.forEach((edge, index) => {
      laneMap.set(`${edge.fromNodeId}->${edge.toNodeId}`, getOverlayEdgeLaneOffset(index + 1));
      laneMap.set(`${edge.toNodeId}->${edge.fromNodeId}`, getOverlayEdgeLaneOffset(index + 1));
    });
  }
  return laneMap;
}

const OVERLAY_SHORT_EDGE_MIN_VISIBLE_LENGTH = 70;

function shouldSuppressShortOverlayEdge(overlaySample, edge, fromNode, toNode) {
  if (!fromNode || !toNode) return false;

  const reason = String(edge?.reason || "").toLowerCase();

  // ALS/AF links often connect a candidate to a sector/body node; their
  // dedicated geometry intentionally keeps short logical links visible.
  if (reason === "als" || reason === "af") return false;

  const anchorPair = chooseBestAnchorPairForEdge(fromNode, toNode, edge);
  if (!anchorPair) return false;

  const rawLength = Math.hypot(
    anchorPair.target.x - anchorPair.source.x,
    anchorPair.target.y - anchorPair.source.y
  );
  const sourceRadius = getAnchorPointRadius(anchorPair.source);
  const targetRadius = getAnchorPointRadius(anchorPair.target);
  const visibleLength = rawLength - sourceRadius - targetRadius;

  // DrawHintBack-level rule: only same-cell short links may be omitted and
  // represented by endpoint highlights.  Short links between different cells
  // still carry structural information and must be drawn; the geometry layer
  // may curve them to keep the endpoints readable.
  const sameCell = anchorPair.source.cell === anchorPair.target.cell;
  return sameCell && Number.isFinite(visibleLength) && visibleLength < OVERLAY_SHORT_EDGE_MIN_VISIBLE_LENGTH;
}

function shouldSuppressOverlayEdge(overlaySample, edge) {
  const reason = String(edge?.reason || "").toLowerCase();

  // Force Chain 反向包装后，最后一段是缩链 endpoint 到具体删数候选的边。
  // 多删数时这个边会误导读者，以候选删除标记表达即可，不画线。
  if (isForceChainRenderOverlay(overlaySample) && edge?.forceTerminalEdge) {
    return true;
  }

  // cell 边表示同一格内两个候选之间的强/弱关系。
  // 这种关系用同格候选高亮表达即可，不需要画线，否则会在同一个 cell 内糊成一团。
  if (reason === "cell") {
    return true;
  }

  return false;
}
function isContinuousNiceLoopOverlay(overlaySample) {
  const title = String(overlaySample?.title || "").toLowerCase();
  if (!title.includes("continuous nice loop")) return false;
  return !title.includes("discontinuous nice loop");
}

function nodePrimaryDigit(node) {
  const digit = Number(node?.digitDisplay || node?.digit || 0);
  return Number.isInteger(digit) && digit >= 1 && digit <= 9 ? digit : 0;
}

function nodesHaveEdge(pathEdges, sourceNodeId, targetNodeId) {
  return (pathEdges || []).some((edge) => (
    (edge.fromNodeId === sourceNodeId && edge.toNodeId === targetNodeId) ||
    (edge.fromNodeId === targetNodeId && edge.toNodeId === sourceNodeId)
  ));
}

function inferWeakEdgeReasonBetweenNodes(sourceNode, targetNode) {
  const sourceAnchors = getNodeAnchorCandidates(sourceNode);
  const targetAnchors = getNodeAnchorCandidates(targetNode);
  for (const source of sourceAnchors) {
    for (const target of targetAnchors) {
      if (!Number.isInteger(source.cell) || !Number.isInteger(target.cell)) continue;
      const sourceRow = Math.floor(source.cell / 9);
      const sourceCol = source.cell % 9;
      const targetRow = Math.floor(target.cell / 9);
      const targetCol = target.cell % 9;
      if (sourceRow === targetRow) return "row";
      if (sourceCol === targetCol) return "column";
      if (Math.floor(sourceRow / 3) === Math.floor(targetRow / 3) && Math.floor(sourceCol / 3) === Math.floor(targetCol / 3)) {
        return "box";
      }
    }
  }
  return "weak";
}

function buildContinuousLoopClosingEdge(overlaySample, pathNodes, pathEdges) {
  if (!isContinuousNiceLoopOverlay(overlaySample)) return null;
  if (!Array.isArray(pathNodes) || pathNodes.length < 2) return null;
  const firstNode = pathNodes[0];
  const lastNode = pathNodes[pathNodes.length - 1];
  if (!firstNode || !lastNode) return null;
  if (firstNode.nodeId === lastNode.nodeId) return null;
  const firstDigit = nodePrimaryDigit(firstNode);
  const lastDigit = nodePrimaryDigit(lastNode);
  if (!firstDigit || firstDigit !== lastDigit) return null;
  if (nodesHaveEdge(pathEdges, firstNode.nodeId, lastNode.nodeId)) return null;

  return {
    edgeId: "synthetic-continuous-loop-closing-edge",
    fromNodeId: lastNode.nodeId,
    toNodeId: firstNode.nodeId,
    strength: "weak",
    reason: inferWeakEdgeReasonBetweenNodes(lastNode, firstNode),
    transition: "ON->OFF",
    synthetic: true,
  };
}


function parseUrGuardianLabelText(raw) {
  const text = String(raw || "");
  const metas = [];
  const pattern = /(?:\{UR:)?([1-9]{2})r([1-9]{2})c([1-9]{2})(?:\})?/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const digits = String(match[1] || "").split("").map(Number).filter((d) => d >= 1 && d <= 9);
    const rows = String(match[2] || "").split("").map((r) => Number(r) - 1).filter((r) => r >= 0 && r < 9);
    const cols = String(match[3] || "").split("").map((c) => Number(c) - 1).filter((c) => c >= 0 && c < 9);
    const cells = [];
    for (const row of rows) {
      for (const col of cols) cells.push(row * 9 + col);
    }
    if (digits.length === 2 && cells.length === 4) {
      metas.push({
        label: `${digits.join("")}r${rows.map((r) => r + 1).join("")}c${cols.map((c) => c + 1).join("")}`,
        digits,
        cells: [...new Set(cells)].sort((a, b) => a - b),
      });
    }
  }
  return metas;
}

function collectUrGuardianHighlightMetas(overlaySample, pathEdges = []) {
  const sources = [
    overlaySample?.explanation,
    overlaySample?.description,
    overlaySample?.chainText,
    ...(pathEdges || []).map((edge) => edge.urLabel || edge.rawType || ""),
  ];
  const seen = new Set();
  const metas = [];
  for (const source of sources) {
    for (const meta of parseUrGuardianLabelText(source)) {
      if (seen.has(meta.label)) continue;
      seen.add(meta.label);
      metas.push(meta);
    }
  }
  return metas;
}

function clearBoardChainHighlights() {
  board?.querySelectorAll(".candidate.chain-start, .candidate.chain-on, .candidate.chain-off, .candidate.chain-remove, .candidate.chain-af-aux, .candidate.chain-ur-body, .candidate.chain-als-1, .candidate.chain-als-2, .candidate.chain-als-3, .candidate.chain-als-4, .candidate.chain-als-5").forEach((node) => {
    node.classList.remove("chain-start", "chain-on", "chain-off", "chain-remove", AF_CHAIN_AUX_CLASS, AF_CHAIN_AUX_ROW_COVER_CLASS, AF_CHAIN_AUX_COL_COVER_CLASS, "chain-ur-body", ...ALS_CHAIN_HIGHLIGHT_CLASSES);
  });
}

function applyBackendAfOutlinesFromColorCands(colorCands) {
  // V433: color=13/14 are rendered twice-safe.  The board construction path
  // adds these classes while creating candidate spans; this helper re-adds the
  // same outline classes after clearBoardChainHighlights() removes transient
  // chain classes for SVG/path rendering.
  if (!Array.isArray(colorCands) || colorCands.length === 0) return;

  for (const item of colorCands) {
    const cell = Number(item?.index);
    const color = Number(item?.color || item?.colorIndex || 0);
    if (!Number.isInteger(cell) || cell < 0 || cell >= 81) continue;
    if (color !== 13 && color !== 14) continue;

    for (const rawDigit of item?.candidates || []) {
      const digit = Number(rawDigit);
      if (!Number.isInteger(digit) || digit < 1 || digit > 9) continue;
      const candidate = getBoardCandidateElement(cell, digit);
      if (!candidate || !boardCandidateExists(cell, digit)) continue;

      candidate.classList.add(AF_CHAIN_AUX_CLASS);
      if (color === 13) {
        candidate.classList.add(AF_CHAIN_AUX_ROW_COVER_CLASS);
      } else {
        candidate.classList.add(AF_CHAIN_AUX_COL_COVER_CLASS);
      }
    }
  }
}

function getBoardCandidateElement(cell, digitDisplay) {
  return board?.querySelector(`.sudoku-cell[data-cell-index="${cell}"] .candidate[data-digit="${digitDisplay}"]`) || null;
}

function boardCandidateExists(cell, digitDisplay) {
  const candidate = getBoardCandidateElement(cell, digitDisplay);
  if (!candidate) return false;

  // renderCandidates() creates nine candidate slots for layout stability, but
  // only the real candidates have visible text.  ALS containers hold a union
  // candidate mask, so do not color every union digit in every ALS cell; only
  // color digits that are actually present in that cell on the current board.
  return candidate.textContent.trim() === String(digitDisplay);
}

function addBoardCandidateClassIfPresent(cell, digitDisplay, className) {
  if (!boardCandidateExists(cell, digitDisplay)) return false;
  getBoardCandidateElement(cell, digitDisplay)?.classList.add(className);
  return true;
}

function applyBoardChainHighlights(overlaySample, startNodeId) {
  clearBoardChainHighlights();
  applyBackendAfOutlinesFromColorCands(overlaySample?.colorCands);

  const pathNodes = overlaySample?.path?.nodes || [];
  const pathEdges = overlaySample?.path?.edges || [];
  const forceRender = isForceChainRenderOverlay(overlaySample);
  const usesBackendCandidateColors = overlaySample?.hasBackendColorCands === true;
  const alsClassByKey = buildAlsHighlightClassMap(pathNodes, pathEdges);

  if (!usesBackendCandidateColors) {
    // ALS nodes are represented in StepResult as restricted candidate-sector
    // nodes, while the board highlight should show the whole ALS container.
    // The full ALS cells/candidate mask are available in the label, e.g.
    // "(7=2348)r7c4789 [r7c48] OFF".  Use that metadata to color the ALS
    // container first; the ordinary ON/OFF chain highlight is then layered on
    // the actual path candidate-sector below.
    const paintAlsMeta = (meta) => {
      if (!meta || meta.cells.length === 0 || meta.digits.length === 0) return;
      const alsClass = alsClassByKey.get(meta.key) || ALS_CHAIN_HIGHLIGHT_CLASSES[0];
      for (const cell of meta.cells) {
        for (const digit of meta.digits) {
          addBoardCandidateClassIfPresent(cell, digit, alsClass);
        }
      }
    };

    for (const node of pathNodes) {
      if (nodeTouchesReasonEdge(node, pathEdges, "af") ||
          nodeTouchesReasonEdge(node, pathEdges, "urguardian")) {
        continue;
      }
      paintAlsMeta(parseAlsNodeMeta(node));
    }
    for (const edge of pathEdges) {
      if (String(edge?.reason || "").toLowerCase() === "af" ||
          String(edge?.reason || "").toLowerCase() === "urguardian") {
        continue;
      }
      paintAlsMeta(parseAlsEdgeMeta(edge));
    }
  }

  // Always layer ON/OFF/start chain highlights over backend-owned structure colors.
  // Backend colorCands describe the AMSLS/ALS/AF body; they should not suppress
  // the actual path endpoints used by the chain renderer.
  {
    for (const node of pathNodes) {
      const digit = Number(node.digitDisplay || node.digit || 0);
      if (!Number.isInteger(digit) || digit < 1 || digit > 9) continue;

      let highlightClass = "chain-off";
      const rawState = String(node.state || "").toUpperCase();
      const displayState = forceRender
        ? (rawState === "ON" ? "OFF" : (rawState === "OFF" ? "ON" : rawState))
        : rawState;
      if ((forceRender && node.forceBranchStart) || (!forceRender && node.nodeId === startNodeId)) {
        highlightClass = "chain-start";
      } else if (displayState === "ON") {
        highlightClass = "chain-on";
      }

      if (node.nodeKind === "GroupedSector" || node.kind === "GroupedSector" ||
          node.nodeKind === "AlsCandidateSector" || node.kind === "AlsCandidateSector") {
        const sectorCells = normalizeSectorCells(node.sectorCells);

        for (const cell of sectorCells) {
          addBoardCandidateClassIfPresent(cell, digit, highlightClass);
        }

        continue;
      }

      if (!Number.isInteger(node.cell)) continue;
      getBoardCandidateElement(node.cell, digit)?.classList.add(highlightClass);
    }

  }

  for (const candidate of overlaySample?.candidateMarks || []) {
    if (!Number.isInteger(candidate?.cell) || !Number.isInteger(candidate?.digitDisplay)) continue;
    getBoardCandidateElement(candidate.cell, candidate.digitDisplay)?.classList.add("chain-remove");
  }

  if (!usesBackendCandidateColors) {
    // UR Guardian carries the deadly-pattern body, e.g. {UR:34r89c57}.
    // Color the UR body's deadly candidates as context in addition to the two
    // guardian sectors that participate in the actual chain.
    for (const meta of collectUrGuardianHighlightMetas(overlaySample, pathEdges)) {
      for (const cell of meta.cells || []) {
        for (const digit of meta.digits || []) {
          const candidate = getBoardCandidateElement(cell, digit);
          if (!candidate || !boardCandidateExists(cell, digit)) continue;
          if (candidate.classList.contains("chain-remove")) continue;
          candidate.classList.add("chain-ur-body");
        }
      }
    }

    // Almost Fish carries additional truth-set / cover-set context such as
    // 6r8c29(c259\r1568).  The grouped endpoint itself is part of the chain and
    // is already colored ON/OFF above; color the other candidate occurrences in
    // the AF fish pattern so the frontend matches the reference project's visual
    // explanation without overwriting the actual chain nodes or eliminations.
    for (const meta of collectAfHighlightMetas(overlaySample, pathNodes, pathEdges)) {
      for (const cell of meta.cells || []) {
        const candidate = getBoardCandidateElement(cell, meta.digit);
        if (!candidate || !boardCandidateExists(cell, meta.digit)) continue;
        if (candidate.classList.contains("chain-start") ||
            candidate.classList.contains("chain-on") ||
            candidate.classList.contains("chain-off") ||
            candidate.classList.contains("chain-remove")) {
          continue;
        }
        candidate.classList.add(AF_CHAIN_AUX_CLASS);
        if (String(meta.secondLineType || "").toLowerCase() === "r") {
          candidate.classList.add(AF_CHAIN_AUX_ROW_COVER_CLASS);
        } else if (String(meta.secondLineType || "").toLowerCase() === "c") {
          candidate.classList.add(AF_CHAIN_AUX_COL_COVER_CLASS);
        }
      }
    }
  }
}

function renderOverlayEdge(layer, edge, nodeById, overlaySample, laneOffset = 0, orderedEdgeDirections = null) {
  const fromNode = nodeById.get(edge.fromNodeId);
  const toNode = nodeById.get(edge.toNodeId);
  if (!fromNode || !toNode) return;
  if (shouldSuppressOverlayEdge(overlaySample, edge)) return;
  if (shouldSuppressShortOverlayEdge(overlaySample, edge, fromNode, toNode)) return;

  const directEdgeDirection = isForceChainRenderOverlay(overlaySample) || isBraidRenderOverlay(overlaySample);
  let directed = directEdgeDirection
    ? { source: fromNode, target: toNode }
    : resolveEdgeArrowTarget(edge, fromNode, toNode);

  if (!directEdgeDirection) {
    const orderedDirection = orderedEdgeDirections?.get(edge.edgeId);
    if (orderedDirection) {
      const orderedSource = nodeById.get(orderedDirection.sourceId);
      const orderedTarget = nodeById.get(orderedDirection.targetId);
      if (orderedSource && orderedTarget) {
        directed = { source: orderedSource, target: orderedTarget };
      }
    }
  }

  const anchorPair = chooseBestAnchorPairForEdge(directed.source, directed.target, edge);
  if (!anchorPair) return;

  const logicalEdgeReason = String(edge.reason || "").toLowerCase();
  const geometry = (logicalEdgeReason === "als" || logicalEdgeReason === "af")
    ? buildAlsEdgeGeometry(directed.source, directed.target, edge, laneOffset)
    : buildCandidateCircleAwareEdgeGeometry(
        directed.source,
        directed.target,
        edge,
        laneOffset,
        overlaySample?.path?.nodes || []
      );

  const edgeReason = String(edge.reason || "").toLowerCase();
  const edgeRole = String(edge.role || "").toLowerCase();
  const classes = [
    "yzf-overlay-edge",
    edge.strength === "weak" ? "weak" : "strong",
    edgeReason === "group" ? "group" : "",
    edgeRole === "blossom-main" ? "blossom-main" : "",
    edgeRole === "blossom-branch" ? "blossom-branch" : "",
    edgeRole === "braid-main" ? "braid-main" : "",
    edgeRole === "braid-branch" ? "braid-branch" : "",
    edgeReason === "als" ? "als" : "",
    edgeReason === "af" ? "af" : "",
    edge.manualConstruction ? "manual-construction" : "",
  ].filter(Boolean).join(" ");

  const markerId = edgeRole === "blossom-main"
    ? "yzfArrowBlossomMain"
    : (edgeRole === "blossom-branch"
      ? "yzfArrowBlossomBranch"
      : (edgeRole === "braid-main"
        ? "yzfArrowBraidMain"
        : (edgeRole === "braid-branch"
          ? "yzfArrowBraidBranch"
          : (edge.manualConstruction
            ? "yzfArrowManualConstruction"
            : (edgeReason === "group"
              ? "yzfArrowGroup"
              : (edge.strength === "weak" ? "yzfArrowWeak" : "yzfArrowStrong"))))));

  layer.appendChild(createSvgElement("path", {
    class: classes,
    d: geometry.pathD,
    "marker-end": `url(#${markerId})`,
  }));
}

function renderCandidateMarks(layer, overlaySample) {
  for (const candidate of overlaySample?.candidateMarks || []) {
    const center = getCandidateCenter(candidate.cell, candidate.digitDisplay);
    const isFormal = candidate.candidateKind === "formal";
    layer.appendChild(createSvgElement("line", {
      class: `yzf-overlay-candidate-mark${isFormal ? " formal" : ""}`,
      x1: center.x - 7,
      y1: center.y - 7,
      x2: center.x + 7,
      y2: center.y + 7,
    }));
    layer.appendChild(createSvgElement("line", {
      class: `yzf-overlay-candidate-mark${isFormal ? " formal" : ""}`,
      x1: center.x - 7,
      y1: center.y + 7,
      x2: center.x + 7,
      y2: center.y - 7,
    }));
    /*
    const label = createSvgElement("text", {
      class: `yzf-overlay-candidate-label${isFormal ? " formal" : ""}`,
      x: center.x + 8,
      y: center.y - 6,
    });
    label.textContent = String(candidate.digitDisplay ?? "");
    layer.appendChild(label);
    */
  }
}

function renderOverlayBanner() {
  // Keep the debug-only notice in the side control panel/status area
  // so the SVG overlay does not cover cells or candidate digits.
}

function clearRenderedChainOverlay() {
  clearBoardChainHighlights();
  yzfUnderlay?.replaceChildren();
  yzfOverlay?.replaceChildren();
  clearYzfBranchContext();
}

function renderChainOverlay(sampleJson) {
  if (!yzfOverlay || !yzfUnderlay) return;
  yzfUnderlay.replaceChildren();
  yzfOverlay.replaceChildren();
  const overlaySample = normalizeYzfOverlaySample(sampleJson);
  yzfDebugSampleData = overlaySample;
  updateYzfBranchNavigation(overlaySample);
  const renderSample = overlaySampleForBranchMode(overlaySample);

  const pathNodes = renderSample?.path?.nodes || [];
  const pathEdges = renderSample?.path?.edges || [];
  const outcome = overlaySample?.outcome || "Unknown";
  const reason = typeof renderSample?.selectedPathReason === "string" ? renderSample.selectedPathReason : "";
  const unsupportedReason = sampleJson?.unsupportedReason || "";
  const endpointRelation = overlaySample?.endpointRelation || "Unknown";
  const debugOnly = overlaySample?.isDebugOnly !== false;
  const readyForStep = overlaySample?.conclusionReadyForStepResult === true;
  const manualPromoted = overlaySample?.isManualPromotedStepResult === true;
  const manualAdvancedStepResult = overlaySample?.isManualAdvancedStepResult === true;
  const defaultSolverStepResult = overlaySample?.sourceKind === "default-solver-stepresult";

  if (!pathNodes.length || !pathEdges.length) {
    clearBoardChainHighlights();
    if (overlaySample?.sourceKind === "manual-advanced-stepresult") {
      setStatusElementState(yzfOverlayStatus,
        `Sample=${overlaySample?.sampleName || "manual_advanced_result"}; title=${overlaySample?.title || ""}; chainType=${overlaySample?.chainType || ""}; manual advanced result; not from default solver; no renderable chain path`,
        "error");
      return;
    }
    if (defaultSolverStepResult) {
      setStatusElementState(yzfOverlayStatus,
        `title=${overlaySample?.title || ""}; chainType=${overlaySample?.chainType || ""}; default solver result; no renderable chain path`,
        "error");
      return;
    }
    setStatusElementState(yzfOverlayStatus,
      `Sample=${overlaySample?.sampleName || "unknown"}; outcome=${outcome}; endpointRelation=${endpointRelation}; debugOnly=${debugOnly}; conclusionReadyForStepResult=${readyForStep}; No debug path found${unsupportedReason ? `; reason=${unsupportedReason}` : ""}`,
      "debug");
    return;
  }

  const nodeById = new Map(pathNodes.map((node) => [node.nodeId, node]));
  const forceRender = isForceChainRenderOverlay(renderSample);
  const braidRender = isBraidRenderOverlay(renderSample);
  const directRender = forceRender || braidRender;
  const orderedPath = directRender
    ? {
      ok: true,
      orderedNodeIds: pathNodes.map((node) => node.nodeId),
      orderedEdges: pathEdges,
      isCycle: false,
    }
    : buildOverlayPathOrder(pathNodes, pathEdges);
  const startNodeId = forceRender
    ? (pathNodes.find((node) => node.forceBranchStart)?.nodeId ?? pathNodes[0]?.nodeId ?? null)
    : (orderedPath.orderedNodeIds[0] ?? pathNodes[0]?.nodeId ?? null);
  const orderedEdgeDirections = directRender ? null : buildOrderedEdgeDirectionMap(orderedPath);
  const laneMap = buildOverlayEdgeLaneMap(pathEdges, nodeById, renderSample);
  applyBoardChainHighlights(renderSample, startNodeId);
  const edgeLayer = createSvgElement("g", { "data-layer": "edges" });
  const candidateLayer = createSvgElement("g", { "data-layer": "debug-candidates" });
  const bannerLayer = createSvgElement("g", { "data-layer": "banner" });

  createOverlayMarkerDefs(yzfOverlay);
  for (const edge of pathEdges) {
    const laneOffset = laneMap.get(`${edge.fromNodeId}->${edge.toNodeId}`) ?? 0;
    renderOverlayEdge(edgeLayer, edge, nodeById, renderSample, laneOffset, orderedEdgeDirections);
  }
  const closingEdge = forceRender ? null : buildContinuousLoopClosingEdge(renderSample, pathNodes, pathEdges);
  if (closingEdge) {
    renderOverlayEdge(edgeLayer, closingEdge, nodeById, renderSample, 0, orderedEdgeDirections);
  }
  renderCandidateMarks(candidateLayer, renderSample);
  renderOverlayBanner(bannerLayer);

  yzfOverlay.append(edgeLayer, candidateLayer, bannerLayer);

  const candidateCount = Array.isArray(overlaySample?.candidateMarks) ? overlaySample.candidateMarks.length : 0;
  let message = "";
  if (manualAdvancedStepResult) {
    if (manualPromoted) {
      message = `Sample=${overlaySample?.sampleName || "unknown"}; title=${overlaySample?.title || "Grouped AIC"}; chainType=${overlaySample?.chainType || "Grouped AIC"}; rank=${overlaySample?.rank ?? 0}; eliminations=${candidateCount}; nodes=${pathNodes.length}; edges=${pathEdges.length}; puzzleSource=${overlaySample?.puzzleSource || "unknown"}; manual promoted sample; not from default solver`;
    } else {
      message = `Sample=${overlaySample?.sampleName || "unknown"}; title=${overlaySample?.title || ""}; chainType=${overlaySample?.chainType || ""}; rank=${overlaySample?.rank ?? 0}; eliminations=${candidateCount}; nodes=${pathNodes.length}; edges=${pathEdges.length}; puzzleSource=${overlaySample?.puzzleSource || "unknown"}; manual advanced result; not from default solver`;
    }
  } else if (defaultSolverStepResult) {
    message = `title=${overlaySample?.title || ""}; chainType=${overlaySample?.chainType || ""}; eliminations=${candidateCount}; nodes=${pathNodes.length}; edges=${pathEdges.length}; default solver result`;
  } else {
    message = candidateCount > 0
      ? `Sample=${overlaySample?.sampleName || "unknown"}; outcome=${outcome}; endpointRelation=${endpointRelation}; debugOnly=${debugOnly}; conclusionReadyForStepResult=${readyForStep}; debugCandidates=${candidateCount}; debug only`
      : `Sample=${overlaySample?.sampleName || "unknown"}; outcome=${outcome}; endpointRelation=${endpointRelation}; debugOnly=${debugOnly}; conclusionReadyForStepResult=${readyForStep}; No debug candidates; debug only`;
  }
  setStatusElementState(yzfOverlayStatus, message + (reason ? `; selected=${reason}` : ""), "debug");
}

function renderYzfTyp4Overlay(sampleJson) {
  return renderChainOverlay(sampleJson);
}

async function loadYzfTyp4DebugSample(sampleName) {
  const path = YZF_DEBUG_SAMPLE_PATHS.get(sampleName);
  if (!path) {
    setStatusElementState(yzfOverlayStatus, `Unknown YZF typ=4 debug sample: ${sampleName}`, "error");
    return false;
  }
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    setStatusElementState(yzfOverlayStatus, `Failed to load debug sample: ${sampleName}`, "error");
    return false;
  }
  const sampleJson = await response.json();
  sampleJson.sampleName = sampleName;
  const overlaySample = normalizeYzfOverlaySample(sampleJson);
  currentHint = null;
  lastSolveData = null;
  previewSnapshotActive = false;
  currentPreviewRecord = null;
  selectedIndex = -1;
  currentSnapshot = buildStaticSnapshotFromPuzzle(overlaySample.puzzle || "");
  setYzfOverlayModeNote(
    overlaySample.isManualPromotedStepResult
      ? "manual promoted sample / not from default solver"
      : ui("overlayDebugOnly")
  );
  if (overlaySample.isManualPromotedStepResult && overlaySample.puzzleSource === "fallback") {
    console.debug("YZF typ=4 promoted sample fallback puzzle used", sampleName);
  }
  setYzfHintBaseText(overlaySample.isManualPromotedStepResult
    ? "YZF typ=4 promoted manual StepResult sample loaded. not from default solver"
    : "YZF typ=4 debug sample loaded.");
  renderBoardSnapshot(currentSnapshot, null);
  renderChainOverlay(sampleJson);
  return true;
}

function initYzfTyp4DebugOverlayControls() {
  if (!APP_DEBUG_MODE) {
    return;
  }
  if (yzfDebugControlsInitialized) return;
  if (!yzfDebugSampleSelect || !btnYzfDebugLoad || !btnYzfDebugClear || !yzfOverlayStatus) return;

  btnYzfDebugLoad?.addEventListener("click", async () => {
    const sampleName = yzfDebugSampleSelect?.value || "yzf_typ4_grouped_with_candidates";
    try {
      await loadYzfTyp4DebugSample(sampleName);
    } catch (error) {
      console.error(error);
      setStatusElementState(yzfOverlayStatus, `Failed to load debug sample: ${error?.message || error}`, "error");
    }
  });

  btnYzfDebugClear?.addEventListener("click", () => {
    clearChainOverlay("YZF typ=4 debug overlay cleared.");
    setYzfHintBaseText("YZF typ=4 debug overlay cleared.");
  });

  yzfDebugControlsInitialized = true;
}

function isBranchShortcutEditableTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("input, textarea, select, button, [contenteditable=\"true\"], [role=\"textbox\"]"));
}

function installYzfBranchKeyboardNavigation() {
  document.addEventListener("keydown", (event) => {
    if (!yzfBranchContext.active || yzfBranchContext.branches.length <= 1) return;
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target?.closest?.(".forcing-branch-nav")) return;
    if (isBranchShortcutEditableTarget(event.target)) return;

    let delta = 0;
    if (event.key === "ArrowRight" || event.key === "]") delta = 1;
    else if (event.key === "ArrowLeft" || event.key === "[") delta = -1;
    if (!delta) return;

    event.preventDefault();
    cycleYzfBranch(delta);
  });
}

installYzfBranchKeyboardNavigation();


if (APP_DEBUG_MODE) {
  window.initYzfTyp4DebugOverlayControls = initYzfTyp4DebugOverlayControls;
  window.loadYzfTyp4DebugSample = loadYzfTyp4DebugSample;
  window.clearYzfTyp4Overlay = clearChainOverlay;
  window.renderYzfTyp4Overlay = renderYzfTyp4Overlay;
}


function normalizeStepResultChainBranches(branches = []) {
  return (Array.isArray(branches) ? branches : []).map((branch, branchIndex) => {
    const nodes = normalizeStepResultPathNodes(branch?.nodes || []);
    const edges = normalizeStepResultPathEdges(branch?.edges || [], nodes);
    applyTransitionStatesToPathNodes(nodes, edges);
    return {
      label: String(branch?.label || `branch ${branchIndex + 1}`),
      role: String(branch?.role || ""),
      path: { nodes, edges },
    };
  }).filter((branch) => branch.path.nodes.length > 0 && branch.path.edges.length > 0);
}
function stepResultHasRenderableChain(stepResult) {
  const hasPath = Array.isArray(stepResult?.nodes) && stepResult.nodes.length > 0 &&
    Array.isArray(stepResult?.edges) && stepResult.edges.length > 0;
  if (hasPath) return true;
  return Array.isArray(stepResult?.chainBranches) && stepResult.chainBranches.some((branch) => (
    Array.isArray(branch?.nodes) && branch.nodes.length > 0 &&
    Array.isArray(branch?.edges) && branch.edges.length > 0
  ));
}


function isForceChainRenderOverlay(overlaySample) {
  return isForceChainStepResult(overlaySample);
}

function isBraidRenderOverlay(overlaySample) {
  const title = String(overlaySample?.title || "");
  const chainType = String(overlaySample?.chainType || "");
  return /\bg-?Braid\b/i.test(title) || /\bg-?Braid\b/i.test(chainType);
}

function reindexOverlayBranchPath(branch, branchIndex, nextIds) {
  const nodeIdMap = new Map();
  const branchLabel = branch?.label || `branch ${branchIndex + 1}`;
  const branchRole = String(branch?.role || "");
  const isForceBranch = /=>/.test(branchLabel);
  const nodes = (branch?.path?.nodes || []).map((node, nodeIndex) => {
    const nodeId = nextIds.node++;
    nodeIdMap.set(node.nodeId, nodeId);
    return {
      ...node,
      nodeId,
      pathIndex: nodeId,
      branchIndex,
      branchLabel,
      forceChainBranch: isForceBranch,
      forceBranchStart: isForceBranch && nodeIndex === 0,
    };
  });
  const rawEdges = (branch?.path?.edges || []);
  const edges = rawEdges.map((edge, edgeIndex) => ({
    ...edge,
    edgeId: nextIds.edge++,
    fromNodeId: nodeIdMap.get(edge.fromNodeId) ?? edge.fromNodeId,
    toNodeId: nodeIdMap.get(edge.toNodeId) ?? edge.toNodeId,
    fromPathIndex: nodeIdMap.get(edge.fromNodeId) ?? edge.fromPathIndex,
    toPathIndex: nodeIdMap.get(edge.toNodeId) ?? edge.toPathIndex,
    branchIndex,
    branchLabel,
    role: edge.role || branchRole,
    forceChainEdge: isForceBranch,
    forceTerminalEdge: isForceBranch && edgeIndex === rawEdges.length - 1,
  }));
  return { nodes, edges };
}

function overlayNodeVisualKey(node) {
  const nodeKind = String(node?.nodeKind || node?.kind || "SingleCandidate");
  const state = String(node?.state || extractStateFromLabel(node?.label) || "").toUpperCase();
  const digit = Number(node?.digitDisplay || node?.digit || 0);
  const cell = Number.isInteger(node?.cell) ? node.cell : null;
  if (cell != null && digit > 0) {
    return `cell:${cell}:digit:${digit}:state:${state}`;
  }
  return `kind:${nodeKind}:digit:${digit}:state:${state}:cells:${cellSetKey(node?.sectorCells || [])}:label:${String(node?.label || "")}`;
}

function overlayEdgeVisualKey(edge, fromNode, toNode) {
  const leftKey = overlayNodeVisualKey(fromNode);
  const rightKey = overlayNodeVisualKey(toNode);
  const [a, b] = leftKey <= rightKey ? [leftKey, rightKey] : [rightKey, leftKey];
  const strength = String(edge?.strength || "strong").toLowerCase();
  const reason = String(edge?.reason || "unknown").toLowerCase();
  const transition = String(edge?.transition || "").toUpperCase();
  return `${a}|${b}|${strength}|${reason}|${transition}`;
}

function combineOverlayBranches(overlaySample, branches) {
  const nodes = [];
  const edges = [];
  const nodeIdByVisualKey = new Map();
  const nodeByCombinedId = new Map();
  const seenEdges = new Set();
  let nextNodeId = 0;
  let nextEdgeId = 0;
  let skippedDuplicateEdges = 0;

  branches.forEach((branch, branchIndex) => {
    const branchLabel = branch?.label || `branch ${branchIndex + 1}`;
    const branchRole = String(branch?.role || "");
    const isForceBranch = /=>/.test(branchLabel);
    const branchNodeMap = new Map();

    for (const [nodeIndex, node] of (branch?.path?.nodes || []).entries()) {
      const visualKey = overlayNodeVisualKey(node);
      let combinedId = nodeIdByVisualKey.get(visualKey);
      if (combinedId == null) {
        combinedId = nextNodeId++;
        nodeIdByVisualKey.set(visualKey, combinedId);
        const combinedNode = {
          ...node,
          nodeId: combinedId,
          pathIndex: combinedId,
          branchIndex: -1,
          branchLabel: "all branches / merged",
          branchRole,
          sourceBranchLabels: [branchLabel],
          forceChainBranch: isForceBranch,
          forceBranchStart: isForceBranch && nodeIndex === 0,
        };
        nodes.push(combinedNode);
        nodeByCombinedId.set(combinedId, combinedNode);
      } else {
        const combinedNode = nodeByCombinedId.get(combinedId);
        if (combinedNode) {
          if (!Array.isArray(combinedNode.sourceBranchLabels)) combinedNode.sourceBranchLabels = [];
          if (!combinedNode.sourceBranchLabels.includes(branchLabel)) {
            combinedNode.sourceBranchLabels.push(branchLabel);
          }
          combinedNode.forceChainBranch = combinedNode.forceChainBranch || isForceBranch;
          combinedNode.forceBranchStart = combinedNode.forceBranchStart || (isForceBranch && nodeIndex === 0);
        }
      }
      branchNodeMap.set(node.nodeId, combinedId);
    }

    for (const [edgeIndex, edge] of (branch?.path?.edges || []).entries()) {
      const fromNodeId = branchNodeMap.get(edge.fromNodeId);
      const toNodeId = branchNodeMap.get(edge.toNodeId);
      if (fromNodeId == null || toNodeId == null || fromNodeId === toNodeId) {
        continue;
      }
      const fromNode = nodeByCombinedId.get(fromNodeId);
      const toNode = nodeByCombinedId.get(toNodeId);
      if (!fromNode || !toNode) continue;
      const visualEdgeKey = overlayEdgeVisualKey(edge, fromNode, toNode);
      if (seenEdges.has(visualEdgeKey)) {
        skippedDuplicateEdges += 1;
        continue;
      }
      seenEdges.add(visualEdgeKey);
      edges.push({
        ...edge,
        edgeId: nextEdgeId++,
        fromNodeId,
        toNodeId,
        fromPathIndex: fromNodeId,
        toPathIndex: toNodeId,
        branchIndex: -1,
        branchLabel: "all branches / merged",
        role: edge.role || branchRole,
        sourceBranchLabel: branchLabel,
        forceChainEdge: isForceBranch,
        forceTerminalEdge: isForceBranch && edgeIndex === (branch?.path?.edges || []).length - 1,
      });
    }
  });

  return {
    ...overlaySample,
    path: { nodes, edges },
    selectedPathReason: `${branches.length} branches / merged graph; duplicateEdgesSkipped=${skippedDuplicateEdges}`,
  };
}

function overlaySampleForBranchMode(overlaySample) {
  const branches = Array.isArray(overlaySample?.branches) ? overlaySample.branches : [];
  if (branches.length <= 1) {
    return overlaySample;
  }
  const mode = yzfSelectedBranchMode || "all";
  if (mode !== "all") {
    const index = Math.max(0, Math.min(branches.length - 1, Number(mode) - 1));
    const selected = reindexOverlayBranchPath(branches[index], index, { node: 0, edge: 0 });
    return {
      ...overlaySample,
      path: selected,
      selectedPathReason: branches[index]?.label || `branch ${index + 1}`,
    };
  }
  return combineOverlayBranches(overlaySample, branches);
}

function branchContextKey(overlaySample, branches) {
  const labels = branches.map((branch) => String(branch?.label || "")).join("\u241f");
  return [
    String(overlaySample?.sourceKind || ""),
    String(overlaySample?.title || ""),
    String(overlaySample?.chainType || ""),
    labels,
  ].join("\u241e");
}

function forcingBranchDisplayTexts(step, branches) {
  const details = forceChainDescriptionDetails(step);
  const detailBranches = details.filter((line) => /^branch\s+\d+\s*:/i.test(line));
  return branches.map((branch, index) => {
    const detail = String(detailBranches[index] || "").replace(/^branch\s+\d+\s*:\s*/i, "").trim();
    return detail || String(branch?.label || `${ui("branch")} ${index + 1}`).trim();
  });
}


function forcingBranchSummaryText(step, fallback = "") {
  const text = extractStepDescriptionChainText(step);
  const [, reasonPart = ""] = text.split(/\s+\|\s+/, 2);
  const title = String(step?.title || step?.chainType || techniqueName(step) || "Forcing Chain").trim();
  if (reasonPart.trim()) return `${title}: ${reasonPart.trim()}`;
  return String(fallback || title).trim();
}

function clearYzfBranchContext(options = {}) {
  const { preserveHint = true } = options;
  yzfBranchContext = { active: false, branches: [], branchTexts: [], summaryText: "", contextKey: "" };
  yzfSelectedBranchMode = "all";
  if (preserveHint) renderYzfBranchHintPanel();
}

function setYzfHintBaseText(text) {
  yzfHintBaseText = String(text || "");
  renderYzfBranchHintPanel();
  syncMobileSolveStatus();
}

function branchModeSequence() {
  if (!yzfBranchContext.active) return ["all"];
  return ["all", ...yzfBranchContext.branches.map((_, index) => String(index + 1))];
}

function selectYzfBranchMode(mode, options = {}) {
  const { focusSelected = false } = options;
  const sequence = branchModeSequence();
  const normalized = sequence.includes(String(mode)) ? String(mode) : "all";
  if (normalized === yzfSelectedBranchMode && !focusSelected) return;
  yzfSelectedBranchMode = normalized;
  if (yzfDebugSampleData) renderChainOverlay(yzfDebugSampleData);
  else renderYzfBranchHintPanel();
  if (focusSelected) {
    window.requestAnimationFrame(() => {
      hintPanel?.querySelector(`[data-branch-mode="${CSS.escape(normalized)}"]`)?.focus({ preventScroll: true });
    });
  }
}

function cycleYzfBranch(delta) {
  const sequence = branchModeSequence();
  if (sequence.length <= 1) return;
  const currentIndex = Math.max(0, sequence.indexOf(yzfSelectedBranchMode));
  const nextIndex = (currentIndex + Number(delta || 0) + sequence.length) % sequence.length;
  selectYzfBranchMode(sequence[nextIndex]);
}

function renderYzfBranchHintPanel() {
  if (!hintPanel) return;
  hintPanel.replaceChildren();
  const message = document.createElement("div");
  message.className = "hint-main-text";
  message.textContent = yzfBranchContext.active
    ? (yzfBranchContext.summaryText || yzfHintBaseText || ui("initialHint"))
    : (yzfHintBaseText || ui("initialHint"));
  hintPanel.appendChild(message);

  if (!yzfBranchContext.active || yzfBranchContext.branches.length <= 1) return;

  const nav = document.createElement("div");
  nav.className = "forcing-branch-nav";
  nav.setAttribute("role", "listbox");
  nav.setAttribute("aria-label", ui("branchPickerLabel"));

  const entries = [
    { mode: "all", text: ui("branchOverview"), indexText: "Σ" },
    ...yzfBranchContext.branches.map((branch, index) => ({
      mode: String(index + 1),
      text: yzfBranchContext.branchTexts[index] || branch?.label || `${ui("branch")} ${index + 1}`,
      indexText: String(index + 1),
    })),
  ];

  entries.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "forcing-branch-line";
    button.dataset.branchMode = entry.mode;
    button.setAttribute("role", "option");
    const selected = entry.mode === yzfSelectedBranchMode;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
    button.title = entry.text;

    const index = document.createElement("span");
    index.className = "forcing-branch-index";
    index.textContent = entry.indexText;
    const text = document.createElement("span");
    text.className = "forcing-branch-text";
    text.textContent = entry.text;
    button.append(index, text);

    button.addEventListener("click", () => selectYzfBranchMode(entry.mode));
    button.addEventListener("keydown", (event) => {
      let delta = 0;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") delta = 1;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") delta = -1;
      if (!delta) return;
      event.preventDefault();
      cycleYzfBranch(delta);
      window.requestAnimationFrame(() => {
        hintPanel?.querySelector(`[data-branch-mode="${CSS.escape(yzfSelectedBranchMode)}"]`)?.focus({ preventScroll: true });
      });
    });
    nav.appendChild(button);
  });

  const shortcut = document.createElement("div");
  shortcut.className = "forcing-branch-shortcut";
  shortcut.textContent = ui("branchShortcutHint");
  nav.appendChild(shortcut);
  hintPanel.appendChild(nav);

  window.requestAnimationFrame(() => {
    hintPanel.querySelector(".forcing-branch-line.is-selected")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
}

function updateYzfBranchNavigation(overlaySample) {
  const branches = Array.isArray(overlaySample?.branches) ? overlaySample.branches : [];
  const isForcing = branches.length > 1 && isForceChainRenderOverlay(overlaySample);
  if (!isForcing) {
    clearYzfBranchContext();
    return;
  }

  const nextKey = branchContextKey(overlaySample, branches);
  const changed = nextKey !== yzfBranchContext.contextKey;
  yzfBranchContext = {
    active: true,
    branches,
    branchTexts: forcingBranchDisplayTexts(currentHint || overlaySample, branches),
    summaryText: forcingBranchSummaryText(currentHint || overlaySample, yzfHintBaseText),
    contextKey: nextKey,
  };
  if (changed) yzfSelectedBranchMode = "all";
  const sequence = branchModeSequence();
  if (!sequence.includes(yzfSelectedBranchMode)) yzfSelectedBranchMode = "all";
  renderYzfBranchHintPanel();
}

function normalizeManualAdvancedStepResult(stepResult, puzzle, responseMeta = {}) {
  const pathNodes = normalizeStepResultPathNodes(stepResult?.nodes || []);
  const pathEdges = normalizeStepResultPathEdges(stepResult?.edges || [], pathNodes);
  applyTransitionStatesToPathNodes(pathNodes, pathEdges);
  const branches = normalizeStepResultChainBranches(stepResult?.chainBranches || []);

  const firstNode = pathNodes[0] || null;
  const lastNode = pathNodes[pathNodes.length - 1] || null;
  const digitDisplay = firstNode?.digitDisplay || lastNode?.digitDisplay || 0;

  return {
    sampleName: "manual_advanced_result",
    sourceKind: "manual-advanced-stepresult",
    puzzle: String(puzzle || ""),
    puzzleSource: "json",
    title: stepResult?.title || "",
    chainType: stepResult?.chainType || "",
    isDebugOnly: false,
    isManualPromotedStepResult: (stepResult?.chainType || "") === "Grouped AIC",
    isManualAdvancedStepResult: true,
    notFromDefaultSolver: true,
    conclusionReadyForStepResult: true,
    outcome: responseMeta.status || "Ok",
    endpointRelation: responseMeta.endpointRelation || "",
    endpointInference: responseMeta.endpointInference || "",
    selectedPathRank: 0,
    selectedPathReason: "manual_advanced_stepresult",
    explanation: responseMeta.description || stepResult?.description || lang.value === "en" ? "Manual advanced result; also available in default solving when enabled" : "高级技巧结果；启用后也可由默认求解使用",
    rankAvailable: stepResult?.rankAvailable === true,
    rank: Number.isInteger(stepResult?.rank) ? stepResult.rank : 0,
    chainLength: Number.isInteger(stepResult?.chainLength) ? stepResult.chainLength : 0,
    hasBackendColorCands: Array.isArray(stepResult?.colorCands) && stepResult.colorCands.length > 0,
    // V433: keep backend colorCands in the overlay model.  renderBoardSnapshot()
    // paints color=13/14 first, but renderChainOverlay()->applyBoardChainHighlights()
    // clears all chain-* board classes before drawing path highlights.  Without
    // carrying colorCands into the overlay pass, the AF / EdoFin outline class is
    // removed immediately after it is added, so the user sees no ellipse.
    colorCands: Array.isArray(stepResult?.colorCands) ? stepResult.colorCands : [],
    path: {
      nodes: pathNodes,
      edges: pathEdges,
    },
    branches,
    endpoints: {
      startNodeId: firstNode?.nodeId ?? null,
      endNodeId: lastNode?.nodeId ?? null,
      startNodeKind: firstNode?.nodeKind || "",
      endNodeKind: lastNode?.nodeKind || "",
      digitDisplay,
      startSectorCells: firstNode?.sectorCells || [],
      endSectorCells: lastNode?.sectorCells || [],
      endpointSectorsOverlap: false,
      endpointSectorValidationPassed: true,
      endpointSectorRejectReason: "",
    },
    candidateMarks: Array.isArray(stepResult?.eliminations) ? stepResult.eliminations.flatMap((candidate) => {
      const digits = Array.isArray(candidate.candidates)
        ? candidate.candidates.map(Number).filter((digit) => digit >= 1 && digit <= 9)
        : [];
      return digits.map((digit) => ({
        cell: candidate.index,
        row: candidate.row,
        col: candidate.col,
        digitDisplay: digit,
        label: `r${Number(candidate.row) + 1}c${Number(candidate.col) + 1}#${digit}`,
        reason: "manual advanced elimination",
        startSectorCells: firstNode?.sectorCells || [],
        endSectorCells: lastNode?.sectorCells || [],
        conclusionReadyForStepResult: true,
        candidateKind: "formal",
      }));
    }) : [],
    stats: {},
    statusText: "",
  };
}

function normalizeDefaultSolverStepResult(stepResult, puzzle, responseMeta = {}) {
  const overlaySample = normalizeManualAdvancedStepResult(stepResult, puzzle, responseMeta);
  return {
    ...overlaySample,
    sampleName: "default_solver_result",
    sourceKind: "default-solver-stepresult",
    isManualPromotedStepResult: false,
    isManualAdvancedStepResult: false,
    notFromDefaultSolver: false,
    explanation: responseMeta.description || stepResult?.description || "default solver result",
  };
}

function extractStepDescriptionChainText(stepResult) {
  const description = String(stepResult?.description || "").trim();
  if (!description) return "";
  const title = String(stepResult?.title || "").trim();
  let text = description;
  if (title && text.startsWith(`${title}:`)) {
    text = text.slice(title.length + 1).trim();
  }
  return text.replace(/\.$/, "");
}

function isForceChainStepResult(stepResult) {
  const text = [stepResult?.kind, stepResult?.title, stepResult?.chainType].map((value) => String(value || "")).join(" ");
  return !/\b(?:g-?Braid|Braid)\b/i.test(text) &&
    /(?:\bForce(?:ing)? Chain\b|Cell\s*\/?\s*Region\s*FC|CellRegionFC|Dynamic\s+(?:Forcing\s+)?Chain)/i.test(text);
}

function forceChainDescriptionDetails(stepResult) {
  const text = extractStepDescriptionChainText(stepResult);
  if (!text || !isForceChainStepResult(stepResult)) {
    return [];
  }
  const [branchPart, reasonPart = ""] = text.split(/\s+\|\s+/, 2);
  const lines = branchPart
    .split(/\s*;\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => `branch ${index + 1}: ${part}`);
  if (reasonPart.trim()) {
    lines.push(`reason: ${reasonPart.trim()}`);
  }
  return lines;
}

function nodeTouchesReasonEdge(node, edges = [], reason = "") {
  const nodeId = Number(node?.nodeId);
  const normalizedReason = String(reason || "").toLowerCase();
  if (!Number.isInteger(nodeId) || !normalizedReason) return false;
  return edges.some((edge) => String(edge?.reason || "").toLowerCase() === normalizedReason &&
    (edge.fromNodeId === nodeId || edge.toNodeId === nodeId));
}

function candidatesText(candidates) {
  return Array.isArray(candidates) ? candidates.join("") : "";
}

function placementText(action) {
  return `${cellName(action)}=${action.value}`;
}

function eliminationText(action) {
  return `${cellName(action)}<>${candidatesText(action.candidates)}`;
}

function actionText(step) {
  const placements = (step.actions || [])
    .filter((action) => action.type === "place")
    .map(placementText);
  const eliminations = (step.eliminations || []).map(eliminationText);
  return [...placements, ...eliminations].join(", ");
}


function isRankedChainSummaryStep(step) {
  return step?.kind === "Whip" ||
    step?.kind === "GWhip" ||
    step?.kind === "Braid" ||
    step?.kind === "GBraid";
}

function rankedChainSummaryText(step) {
  const action = actionText(step);
  const summary = action ? `${stepDisplayName(step)}: => ${action}` : "";
  const desc = String(step?.description || "").trim();
  if (!desc) return summary;

  // For backend-owned chain techniques, description is the reference-style
  // Eureka/MakeBraidHint text.  It must be displayed as-is and must not be
  // regenerated by the frontend.  Also avoid duplicating older payloads that
  // accidentally copied title/conclusion into description.
  if (summary && desc === summary) return summary;
  if (summary && desc.startsWith(summary)) {
    const rest = desc.slice(summary.length).trim();
    return rest ? `${summary}\n${rest.replace(/^[:：]\s*/, "")}` : summary;
  }
  return summary ? `${summary}\n${desc}` : desc;
}

function isFishStep(step) {
  return step?.kind === "XWing" ||
    step?.kind === "Swordfish" ||
    step?.kind === "Jellyfish" ||
    step?.kind === "FinnedXWing" ||
    step?.kind === "FinnedSwordfish" ||
    step?.kind === "FinnedJellyfish";
}

function isReferenceDescStep(step) {
  return isFishStep(step) ||
    step?.kind === "Skyscraper" ||
    step?.kind === "TwoStringKite" ||
    step?.kind === "EmptyRectangle" ||
    step?.kind === "ERIPair" ||
    step?.kind === "WWing" ||
    step?.kind === "XYWing" ||
    step?.kind === "XYZWing" ||
    step?.kind === "XYZRing" ||
    step?.kind === "UniqueRectangle" ||
    step?.kind === "WXYZWing" ||
    step?.kind === "BUGOne" ||
    step?.kind === "BUGPlusN" ||
    step?.kind === "BivalueOddagon" ||
    step?.kind === "ExtendedRectangle" ||
    step?.kind === "UniqueLoop" ||
    step?.kind === "SueDeCoq" ||
    step?.kind === "ALSXZ" ||
    step?.kind === "SKLoop" ||
    step?.kind === "MSLS" ||
    step?.kind === "JE" ||
    step?.kind === "SeniorExocet" ||
    step?.kind === "WeakExocet" ||
    step?.kind === "TripletOddagon" ||
    step?.kind === "Whip" ||
    step?.kind === "GWhip";
}

function unitSummary(cells, key, prefix) {
  const units = [...new Set((cells || []).map((cell) => cell[key] + 1))].sort((a, b) => a - b);
  return units.map((unit) => `${prefix}${unit}`).join("/");
}

function startsWithTechniquePrefix(description, step, name) {
  const desc = String(description || "").trim();
  if (!desc) return false;
  const lower = desc.toLowerCase();
  const names = [name, step?.title, step?.chainType]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean);
  return names.some((value) => lower.startsWith(`${value.toLowerCase()}:`));
}

function descriptionWithTechniqueName(step, name, fallback = "") {
  const desc = String(step?.description || fallback || "").trim();
  if (!desc) return "";
  return startsWithTechniquePrefix(desc, step, name) ? desc : `${name}: ${desc}`;
}

function shouldPreferStepDescription(step) {
  const text = `${step?.kind || ""} ${step?.title || ""} ${step?.chainType || ""}`;
  return /ALSChain|AIC|X-?Chain|XY-?Chain|Nice Loop|Ring/i.test(text);
}

function fishStructureText(step) {
  if (step.description) return step.description;
  const cells = step.cells || [];
  const fishCells = cells.map(cellName).join(", ");
  const rows = unitSummary(cells, "row", "r");
  const cols = unitSummary(cells, "col", "c");
  const candidate = candidatesText(step.candidates);
  const action = actionText(step);
  if (lang.value === "zh") {
    return `${techniqueName(step)}: 候选 ${candidate}，鱼结构 ${fishCells}，行 ${rows}，列 ${cols} => 删除 ${action}`;
  }
  return `${techniqueName(step)}: candidate ${candidate}, fish cells ${fishCells}, rows ${rows}, columns ${cols} => remove ${action}`;
}

function formatLegacyHintDesc(step) {
  const name = techniqueName(step);
  const action = actionText(step);
  const candidate = candidatesText(step.candidates);
  const house = step.house || "";
  const placement = (step.actions || []).find((item) => item.type === "place");
  const locale = i18n[lang.value];

  if (isRankedChainSummaryStep(step)) {
    const summary = rankedChainSummaryText(step);
    if (summary) return summary;
  }

  if (isReferenceDescStep(step)) {
    return step.description || fishStructureText(step);
  }

  if (step.description && startsWithTechniquePrefix(step.description, step, name)) {
    return step.description;
  }

  if (shouldPreferStepDescription(step) && step.description) {
    return descriptionWithTechniqueName(step, name);
  }

  if (step.kind === "NakedSingle" && placement) {
    return `${name}: ${placementText(placement)}`;
  }
  if (step.kind === "HiddenSingle" && placement) {
    return `${name}: ${candidate} ${locale.inHouse} ${house} ${locale.onlyCell} ${cellName(placement)} => ${placementText(placement)}`;
  }
  if (step.kind === "FullHouse" && placement) {
    return `${name}: ${house} ${locale.onlyEmpty} ${cellName(placement)} => ${placementText(placement)}`;
  }
  if (step.eliminations && step.eliminations.length > 0) {
    return `${name}: ${candidate || step.title} ${house ? `${locale.inHouse} ${house} ` : ""}=> ${locale.remove} ${action}`;
  }
  return descriptionWithTechniqueName(step, name, locale.noAction) || `${name}: ${locale.noAction}`;
}


function formatHintDesc(step) {
  // Lazy display-only localization: solving has already completed here.
  const localized = localizedStepDescription(step, lang.value);
  return localized || formatLegacyHintDesc(step);
}


function stepExplainCellList(cells, max = 14) {
  if (!Array.isArray(cells) || cells.length === 0) return "";
  const names = cells
    .filter((cell) => Number.isInteger(cell?.row) && Number.isInteger(cell?.col))
    .map(cellName);
  const unique = [...new Set(names)];
  if (unique.length <= max) return unique.join(", ");
  return `${unique.slice(0, max).join(", ")} … (+${unique.length - max})`;
}

function stepExplainNodeList(nodes, max = 8) {
  if (!Array.isArray(nodes) || nodes.length === 0) return "";
  const items = nodes.map(chainNodeText);
  if (items.length <= max) return items.join("; ");
  return `${items.slice(0, max).join("; ")} … (+${items.length - max})`;
}

function stepExplainKindKey(step = {}) {
  return `${step.kind || ""} ${step.title || ""} ${step.chainType || ""} ${step.description || ""}`.toLowerCase();
}

function stepExplainConclusion(step = {}) {
  const action = actionText(step);
  if (action) return action;
  return lang.value === "zh" ? "本步没有明确出数/删数。" : "No explicit placement/elimination in this step.";
}

function stepExplainTemplateType(step = {}) {
  const kind = String(step.kind || "");
  const title = String(step.title || "");
  const titleKey = `${title} ${step.chainType || ""}`.toLowerCase();

  // Exact producer identity wins.  Internal edge names in a Complex AIC title
  // (ALS, UR Guardian, Tridagon, Almost Fish...) are annotations, not a request
  // to replace the outer chain tutorial with another technique family.
  if (["FullHouse", "HiddenSingle", "NakedSingle", "SingleCandidate"].includes(kind)) return "single";
  if (kind === "LockedCandidates") return "locked";
  if (["NakedPair", "NakedTriple", "NakedQuad", "HiddenPair", "HiddenTriple", "HiddenQuad"].includes(kind)) return "subset";
  if (["Skyscraper", "TwoStringKite"].includes(kind)) return "turbot";
  if (["EmptyRectangle", "ERIPair"].includes(kind)) return "singleDigit";
  if (["ComplexSwordfish", "ComplexJellyfish", "ComplexSquirmbagFish", "Multifish", "RankMultifish"].includes(kind)) return "rankFish";
  if (["SKLoop", "MSLS"].includes(kind)) return "rank0";
  if (["JE", "SeniorExocet", "WeakExocet"].includes(kind)) return "exocet";
  if (["CellRegionFC", "DynamicChain"].includes(kind)) return "forcing";
  if (["DeathBlossom", "BlossomLoop"].includes(kind)) return "blossom";
  if (["BivalueOddagon", "TripletOddagon"].includes(kind)) return "oddagon";
  if (["GSP", "BUGOne", "BUGPlusN", "AvoidableRectangle", "UniqueRectangle", "UniqueLoop", "ExtendedRectangle"].includes(kind)) return "unique";
  if (kind === "BrokenWing") return "guardian";
  if (kind === "Fireworks") return "fireworks";
  if (["XWing", "Swordfish", "Jellyfish", "FinnedXWing", "FinnedSwordfish", "FinnedJellyfish"].includes(kind)) return "fish";
  if (kind === "WXYZWing") return "alsWing";
  if (["AlmostPair", "AlmostTriple", "SueDeCoq", "ALSXZ", "ALSXYWing", "ALSWWing", "AHSXZ", "AHSXYWing", "AHSWWing"].includes(kind)) return "als";
  if (["WWing", "XYWing", "XYZWing", "XYZRing"].includes(kind)) return "wing";
  if (["ALSChain", "AHSChain", "XChain", "XYChain", "AIC", "GroupedAIC", "ComplexAIC", "Whip", "GWhip", "Braid", "GBraid"].includes(kind)) {
    if (["AIC", "GroupedAIC"].includes(kind) && /(?:grouped\s*)?m3\s*-?\s*wing|m3wing|m\s*-?\s*wing|s\s*-?\s*wing|l\s*-?\s*wing|w\s*-?\s*wing/i.test(titleKey)) return "aicWing";
    return "chain";
  }
  if (kind === "BruteForce") return "bruteForce";

  // Conservative compatibility fallback.  Deliberately excludes description:
  // ordinary prose frequently contains substrings such as "als" in "false".
  if (/full house|hidden single|naked single|single candidate/.test(titleKey)) return "single";
  if (/locked candidates|pointing|claiming/.test(titleKey)) return "locked";
  if (/naked (pair|triple|quad)|hidden (pair|triple|quad)|subset/.test(titleKey)) return "subset";
  if (/skyscraper|2-string kite|two-string kite|turbot/.test(titleKey)) return "turbot";
  if (/empty rectangle|eri pair/.test(titleKey)) return "singleDigit";
  if (/multi\s*-?\s*fish|multifish|complex\s+(swordfish|jellyfish|squirmbag|fish)|rank\s*fish/.test(titleKey)) return "rankFish";
  if (/sk\s*loop|msls|rank\s*0|rank-zero|zero\s*rank/.test(titleKey)) return "rank0";
  if (/exocet|jexocet|junior\s*exocet|senior\s*exocet|weak\s*exocet/.test(titleKey)) return "exocet";
  if (/force\s*chain|forcing\s*chain|dynamic\s*chain/.test(titleKey)) return "forcing";
  if (/death\s*blossom|blossom\s*loop|burring\s*loop|burred\s*loop/.test(titleKey)) return "blossom";
  if (/oddagon|tridagon/.test(titleKey)) return "oddagon";
  if (/unique|\bur\b|bug|avoidable|deadly|hidden\s*rectangle|unique\s*loop|extended\s*rectangle|gsp|gurth/.test(titleKey)) return "unique";
  if (/broken\s*wing|broken\s*loop|guardian\s*logic/.test(titleKey)) return "guardian";
  if (/fireworks?/.test(titleKey)) return "fireworks";
  if (/x-wing|swordfish|jellyfish|finned|sashimi|fish/.test(titleKey)) return "fish";
  if (/wxyz|vwxyz|bent almost|bent subset/.test(titleKey)) return "alsWing";
  if (/als|ahs|almost locked|almost hidden|sue de coq/.test(titleKey) && !/als chain|ahs chain/.test(titleKey)) return "als";
  if (/xy-wing|xyz-wing|xyz-ring|w-wing/.test(titleKey)) return "wing";
  if (/rank|base cover|cover set/.test(titleKey)) return "rank";
  if (/whip|braid|chain|aic|nice loop|cycle|ring/.test(titleKey) || (Array.isArray(step.nodes) && step.nodes.length > 0)) return "chain";
  if (/brute force|bruteforce/.test(titleKey)) return "bruteForce";
  return "generic";
}

function stepExplainBuildLines(step = {}) {
  const zh = lang.value === "zh";
  const type = stepExplainTemplateType(step);
  const cellsText = stepExplainCellList(step.cells || []);
  const nodesText = stepExplainNodeList(step.nodes || []);
  const cand = candidatesText(step.candidates);
  const house = step.house || "";
  const conclusion = stepExplainConclusion(step);
  const elims = Array.isArray(step.eliminations) ? step.eliminations.length : 0;
  const places = Array.isArray(step.actions) ? step.actions.filter((a) => a.type === "place").length : 0;
  const structureCount = Array.isArray(step.cells) ? step.cells.length : 0;
  const edgeCount = Array.isArray(step.edges) ? step.edges.length : 0;
  const groupCount = Array.isArray(step.groups) ? step.groups.length : 0;
  const rank = stepStrictRank(step);
  const chainLength = stepChainLength(step);

  const lines = [];
  const checks = [];
  let proof = "";

  if (type === "single") {
    lines.push(zh ? `先看结论 ${conclusion}。` : `Start from the conclusion ${conclusion}.`);
    lines.push(zh ? `核对目标格或目标区域${house ? ` ${house}` : ""}：其他数字/位置都已经被盘面条件排除。` : `Check the target cell/house${house ? ` ${house}` : ""}: every other value or position has already been excluded by sudoku constraints.`);
    proof = zh ? "数学逻辑：一个格只能填一个数字，一个区域内同一个数字也只能出现一次。当候选集或落点集合只剩唯一选择时，若不取它就会导致该格无数可填，或该数字在本区域无处可放，所以它必然成立。" : "Logic: a cell can contain only one digit, and a digit can appear only once in a house. If only one candidate or one position remains, rejecting it would leave either the cell or the digit without any legal option, so it is forced.";
    checks.push(zh ? "确认高亮格确实只剩该候选，或高亮区域内该数字只剩这一个落点。" : "Verify the highlighted cell has only that candidate, or the highlighted house has only that position for the digit.");
  } else if (type === "locked") {
    lines.push(zh ? `观察候选 ${cand || "目标数字"} 在一个宫/行/列中的所有落点。` : `Observe all positions of candidate ${cand || "the target digit"} in the highlighted box/row/column.`);
    lines.push(zh ? `这些落点被锁在交叉的同一行、列或宫内，因此结论 ${conclusion} 可删。` : `Those positions are locked into the same crossing row/column/box, so ${conclusion} can be removed.`);
    proof = zh ? "数学逻辑：目标数字必须在原区域内出现一次，而它所有可能位置又都落在交叉区域中。因此这个数字必然占用那条交叉行/列/宫的一个位置；交叉区域外同一行/列/宫里的同数字候选不可能再成立。" : "Logic: the digit must occur once in the original house, and all its possible positions lie inside the crossing house. Therefore the digit must occupy that crossing house, so the same digit outside the intersection in that house cannot be true.";
    checks.push(zh ? "确认被删除候选与锁定候选是同一个数字，并且位于交叉区域外。" : "Verify removed candidates are the same digit and lie outside the locked intersection.");
  } else if (type === "subset") {
    lines.push(zh ? `看高亮的子集${cellsText ? `：${cellsText}` : ""}${house ? `，所在区域 ${house}` : ""}。` : `Look at the highlighted subset${cellsText ? `: ${cellsText}` : ""}${house ? ` in ${house}` : ""}.`);
    lines.push(zh ? `子集把若干数字与若干格互相锁定，因此结论 ${conclusion} 可删。` : `The subset locks the digits and cells together, so ${conclusion} can be removed.`);
    proof = zh ? "数学逻辑：N 个格如果只能容纳同一组 N 个数字，那么这 N 个数字必须全部填在这些格里，区域内其他格不能再含这些数字；反过来，N 个数字如果在某区域内只能落入 N 个格，那么这些格必须专门留给这些数字，格内其他候选可以删除。这是容量/抽屉原理。" : "Logic: if N cells can contain only the same N digits, those digits must fill those cells and can be removed elsewhere in the house. Conversely, if N digits can appear only in N cells of a house, those cells are reserved for them and other candidates in those cells can be removed. This is a capacity/pigeonhole argument.";
    checks.push(zh ? "数清楚：参与格数与锁定数字数相同。" : "Count carefully: the number of involved cells must match the number of locked digits.");
  } else if (type === "turbot") {
    const isKite = /kite|twostringkite|2-string|two string/i.test(stepExplainKindKey(step));
    lines.push(zh
      ? `只观察候选 ${cand || "目标数字"}，把这个结构按两条强链来读，而不是按普通 base-cover 鱼来读。`
      : `Look only at candidate ${cand || "the target digit"}; read this pattern as two strong links, not as an ordinary base-cover fish.`);
    lines.push(zh
      ? (isKite ? `双线风筝由一条行强链和一条列强链组成，两个靠近宫内的端点互相看见，两个远端至少一真，因此 ${conclusion}。` : `摩天楼由两条平行行/列强链组成，一侧端点互相看见，另一侧两个“楼顶”至少一真，因此 ${conclusion}。`)
      : (isKite ? `A 2-String Kite has one row strong link and one column strong link; the two near endpoints see each other, so at least one of the far endpoints is true, giving ${conclusion}.` : `A Skyscraper has two parallel row/column strong links; one side sees each other, so at least one of the two top endpoints is true, giving ${conclusion}.`));
    proof = zh
      ? "数学逻辑：强链表示同一行/列/宫内该数字只有两个位置，因此两端至少一真。两个强链之间通过一个弱关系连接；弱关系表示连接端不能同时为真。若第一个远端为假，则第一个强链迫使近端为真；近端为真又通过弱关系迫使另一近端为假；另一近端为假后，第二条强链迫使第二个远端为真。反向同理，所以两个远端至少有一个为真。任何同时看见这两个远端的同数字候选若成立，就会把两个远端都排除，违反“至少一真”，所以可删。"
      : "Logic: a strong link means the digit has only two positions in a row, column, or box, so at least one end is true. The two strong links are joined by a weak link; the weak link means the joined endpoints cannot both be true. If the first far endpoint is false, its strong link makes the near endpoint true; the weak link makes the other near endpoint false; the second strong link then makes the second far endpoint true. The reverse direction is symmetric, so at least one far endpoint is true. Any same-digit candidate that sees both far endpoints would make both false, contradicting that result, so it can be removed.";
    checks.push(zh
      ? (isKite ? "确认一条强链在行、一条强链在列；宫内连接端是弱连接，删数同时看见两个远端。" : "确认两条强链分别在两条平行行/列中；底部连接端互相看见，删数同时看见两个楼顶端。")
      : (isKite ? "Verify one strong link is in a row and one in a column; the box-side joined endpoints see each other, and the deletion sees both far endpoints." : "Verify the two strong links are in parallel rows/columns; the joined base endpoints see each other, and the deletion sees both top endpoints."));
  } else if (type === "singleDigit") {
    const isEriPair = String(step.kind || "") === "ERIPair";
    lines.push(zh
      ? `只观察候选 ${cand || "目标数字"}，按宫内 ER/ERI 入口与外部共轭关系组成的短链读取。`
      : `Look only at candidate ${cand || "the target digit"}; read the in-box ER/ERI entry and the external conjugate relation as a short chain.`);
    lines.push(zh
      ? `${isEriPair ? "两个 ERI 入口共同限制目标候选" : "空矩形入口与外部强对把两个端点连接起来"}，因此 ${conclusion}。`
      : `${isEriPair ? "The two ERI entries jointly constrain the target" : "The empty-rectangle entry and the external strong pair connect the two endpoints"}, therefore ${conclusion}.`);
    proof = zh
      ? "数学逻辑：宫内 ER/ERI 结构把同一数字压缩成可传递的入口，再与行列中的共轭对形成强弱链。若目标候选成立，会同时切断所有可行端点，与至少一个端点必须为真矛盾。"
      : "Logic: the in-box ER/ERI structure compresses the digit into an inference entry and combines with row/column conjugate pairs as a strong/weak chain. If the target were true, it would disable every viable endpoint, contradicting that at least one endpoint must be true.";
    checks.push(zh ? "确认这是同一数字的 ER/ERI 短链，不要按唯一矩形或普通 base-cover 鱼解释。" : "Verify this is a same-digit ER/ERI short chain, not a uniqueness rectangle or an ordinary base-cover fish.");
  } else if (type === "fireworks") {
    lines.push(zh ? `观察 Fireworks 核心和它向相关行列承接的候选集合，结论为 ${conclusion}。` : `Inspect the Fireworks core and the candidates it projects into the related rows and columns; the conclusion is ${conclusion}.`);
    proof = zh ? "数学逻辑：核心候选不能任意全部离开，否则相关数字在行、列或宫中的可用位置会被压缩到不足以完成合法分配。删数来自这些出口和承接位置的容量限制。" : "Logic: the core candidates cannot all leave freely; otherwise the available positions in the related rows, columns, or box would have insufficient capacity for a legal assignment. Eliminations follow from those exit/support constraints.";
    checks.push(zh ? "核对核心、出口和受影响行列，不要把 Fireworks 默认解释成 Broken Wing/Guardian。" : "Check the core, exits, and affected rows/columns; do not default Fireworks to Broken-Wing/Guardian logic.");
  } else if (type === "bruteForce") {
    lines.push(zh ? `这是搜索兜底结论：${conclusion}。` : `This is a search fallback conclusion: ${conclusion}.`);
    proof = zh ? "BruteForce 通过尝试候选并检查能否完成全盘来验证结论；它可靠，但不是局部手工技巧证明。" : "BruteForce verifies the conclusion by trying candidates and checking whether the grid can be completed. It is reliable, but it is not a local human-technique proof.";
    checks.push(zh ? "不要把该步骤当作可复用的局部技巧模板。" : "Do not treat this step as a reusable local technique pattern.");
  } else if (type === "guardian") {
    const key = stepExplainKindKey(step);
    const isBrokenWing = /broken\s*wing|brokenwing/.test(key);
    const isBrokenLoop = /broken\s*loop|pattern\s*having\s*no\s*solution|no\s*solution\s*pattern/.test(key);
    const isUrGuardian = /ur\s*guardian|urguardian/.test(key);
    const isFireworks = /fireworks|firework/.test(key);
    lines.push(zh
      ? `本步按 Guardian / Broken Pattern 逻辑读，不按普通 Wing、Fish 或唯一性模板读。`
      : `Read this as Guardian / Broken-Pattern logic, not as an ordinary Wing, Fish, or uniqueness template.`);
    lines.push(zh
      ? `先找 guardian / 守护者候选：如果这些守护者全部为假，剩余结构会变成非法结构；因此守护者中至少一个必须为真，从而推出 ${conclusion}。`
      : `First identify the guardians. If all guardians were false, the remaining structure would become illegal; therefore at least one guardian must be true, giving ${conclusion}.`);
    proof = zh
      ? `数学逻辑：Kazusa 把 Broken Wing 放在 Guardian Logic 下说明，核心不是“枢纽格 + 翼格”，而是“守护者阻止一个坏结构成立”。先假设所有 guardian 都不成立；此时盘面会退化成某种不可接受的结构，例如全强链死环、无解图形、零秩/负秩容量冲突。既然真实解不能进入这个坏结构，至少一个 guardian 必须为真。于是任何同时看见所有 guardian 的同数字候选都不能为真；若只有一个 guardian，它甚至可以直接被确认为真。${isBrokenWing ? " Broken Wing 只是这个逻辑的历史名称，不应要求用户寻找普通 Wing 的 pivot。" : ""}${isBrokenLoop ? " Broken Loop / Pattern Having No Solution 也是同一口径：守护者为假时，剩余环或图形本身无解。" : ""}${isUrGuardian ? " 注意：UR Guardian 名称里虽然有 guardian，但仍属于唯一性技巧，应按唯一解前提解释，不应从 UR/BUG 体系挪到普通 Guardian。" : ""}${isFireworks ? " 注意：Kazusa 将 Fireworks 放在全部标记技巧的烟花数组体系，不应默认按 Guardian Logic 解释；只有输出明确写成 guardian/broken-pattern 时才使用本模板。" : ""}`
      : `Logic: Kazusa explains Broken Wing under Guardian Logic. The core is not a pivot plus wing cells; guardians are candidates that prevent a bad structure from becoming active. Assume every guardian is false. The remaining pattern degenerates into an invalid structure, such as an all-strong-link dead loop, a no-solution pattern, or a rank/capacity conflict. Since the real solution cannot enter that bad structure, at least one guardian must be true. Any same-digit candidate that sees every guardian would make them all false and can be removed; if there is only one guardian, it may be placed. ${isBrokenWing ? "Broken Wing is a historical name for this logic and should not be read as a classic pivot-wing." : ""}${isBrokenLoop ? "Broken Loop / Pattern Having No Solution uses the same reading: without the guardians, the remaining loop or pattern has no solution." : ""}${isUrGuardian ? "Note: a UR Guardian name still belongs to the uniqueness family and must be explained with the unique-solution premise, not moved into ordinary Guardian Logic." : ""}${isFireworks ? "Note: Kazusa treats Fireworks as a full-marking fireworks-array family; only outputs explicitly marked guardian/broken-pattern should use this template." : ""}`;
    checks.push(zh ? "不要找枢纽格；先找 guardian 候选，以及 guardian 全假时会剩下什么坏结构。" : "Do not look for a pivot; identify the guardian candidates and the bad structure left when all guardians are false.");
    checks.push(zh ? "确认删数同时看见所有 guardian，或该删数一旦成立会使所有 guardian 失效。" : "Verify the deletion sees every guardian, or that making it true would disable every guardian.");
    checks.push(zh ? "UR、BUG、AR、UL、XR、GSP 不从唯一性体系挪走；若名称里出现 UR Guardian，应解释为唯一性结构的破坏点，并明确唯一解前提。" : "UR/BUG/AR/UL/XR/GSP stay in the uniqueness family; if a name says UR Guardian, explain it as a guard for a uniqueness deadly pattern under the unique-solution premise.");
  } else if (type === "fish") {
    lines.push(zh ? `本步把候选 ${cand || "鱼数字"} 的若干 base 区域与 cover 区域配对。` : `This step pairs base sets and cover sets for candidate ${cand || "the fish digit"}.`);
    lines.push(zh ? `base 中所有鱼数字都被 cover 覆盖，cover 里不属于 base 的同数字候选可删：${conclusion}。` : `All fish candidates in the bases are covered by the covers; same-digit candidates in the covers but outside the bases can be removed: ${conclusion}.`);
    proof = zh ? "数学逻辑：每个 base 区域都必须放入一个鱼数字；如果这些可能落点全部落在同数量的 cover 区域中，那么这些 cover 区域会被 base 的鱼数字占满。于是 cover 区域里额外的同数字候选不可能成立。带鳍鱼则用分支理解：鳍成立时直接限制删数；鳍不成立时退化为普通鱼，同样删数。" : "Logic: each base set must contain the fish digit once. If all possible positions in the bases are covered by the same number of cover sets, those covers are occupied by the base placements. Extra same-digit candidates in the covers cannot be true. For finned fish, either the fin is true and sees the deletion, or the fin is false and the pattern becomes a normal fish.";
    checks.push(zh ? "确认删数在 cover 区域内，但不在 base 与 cover 的交点结构中。" : "Verify the deletion is in a cover set but outside the base-cover intersections.");
  } else if (type === "blossom") {
    const key = stepExplainKindKey(step);
    const isLoop = /blossom\s*loop|blossomloop|burring\s*loop|burringloop|burred\s*loop/.test(key);
    lines.push(zh
      ? (isLoop
        ? `本步按“绽放环”来读：它介于标准连续环和网之间，是带动态/强制分支的 Rank 0 环状结构，不按普通 AIC Loop 或普通 ALS Blossom 读。`
        : `本步按 Death Blossom / ALS 分支结构来读，不按普通 Wing 来读。`)
      : (isLoop
        ? `Read this as a Blossom Loop: a rank-0 loop with dynamic/forcing branches, sitting between a standard continuous loop and a net. Do not read it as an ordinary AIC loop or a plain ALS Blossom.`
        : `Read this as a Death Blossom / ALS-branch structure, not as an ordinary wing.`));
    lines.push(zh
      ? (isLoop
        ? `绽放环的关键是环中弱关系在整体上都可以按强关系使用：动态分支或强制分支会把断点补上，因此每处弱关系都能产生连续环式删数，结论 ${conclusion}。`
        : `Death Blossom 从中心 stem 分叉到多个 ALS 花瓣；中心格必取一种情况，而所有情况都排除同一目标，因此 ${conclusion}。`)
      : (isLoop
        ? `The key point is that every weak link in the loop can be treated as strong at the global level: dynamic or forcing branches repair the break, so the loop gets continuous-loop-style eliminations, giving ${conclusion}.`
        : `A Death Blossom branches from a central stem into several ALS petals. The stem must take one case, and every case excludes the same target, so ${conclusion}.`));
    proof = zh
      ? (isLoop
        ? "数学逻辑：绽放环不是普通枢纽 Wing，也不是单纯 ALS-XZ。它是带动态分支和强制分支的环状结构，证明口径接近 Rank 0 连续环/网。环内强区域 Truth 表示至少要有一个候选为真，弱区域 Link 表示最多只能有一个候选为真。标准绽放环中 Truth 数与 Link 数相等，所以结构内真候选数量既至少为 Truth 个，又至多为 Link 个；两者相等时，每个弱区域都必须恰好容纳一个真候选。于是每一处弱关系都可像强关系一样参与删数。若某个外部候选成立，会破坏这种一一配额，导致某个弱区域无真、某个强区域无法满足，或沿动态/强制分支绕回矛盾，因此该候选不能成立。动态分支按动态链观察；强制分支按毛刺/多毛刺链观察。"
        : "数学逻辑：Death Blossom 是以 stem 为中心的多分支 ALS 证明。中心 stem 的候选至少有一个必须成立；对 stem 的每一种可能取值，对应花瓣 ALS 都会被迫形成锁定分配，并排除同一个目标候选。因为所有分支都排除该目标，所以目标候选无论 stem 取哪种情况都不能成立。")
      : (isLoop
        ? "Logic: a Blossom Loop is not a classic pivot wing and not merely ALS-XZ. It is a loop with dynamic and forcing branches, best read as a rank-0 continuous-loop/net-like structure. Truth regions require at least one true candidate; Link regions allow at most one true candidate. In a standard Blossom Loop, the number of Truth regions equals the number of Link regions, so the pattern must contain exactly that many true candidates and each Link region is filled exactly once. This lets every weak link act like a strong link for eliminations. If an external candidate were true, it would break this one-for-one quota, leave a Truth unsatisfied, leave a Link without its needed truth, or propagate through the dynamic/forcing branches back to contradiction. Dynamic branches are checked like dynamic chains; forcing branches are checked like fin/burr branches."
        : "Logic: a Death Blossom is a multi-branch ALS proof around a central stem. The stem must take one of its candidates; in every stem case, a corresponding ALS petal becomes locked and excludes the same target candidate. Since every branch excludes the target, the target is false.");
    checks.push(zh
      ? (isLoop
        ? "核对它是否是标准绽放环：分支的分开与汇合节点应能整体按强/弱区域连接，并且 Truth 数与 Link 数相等，即 Rank = 0。"
        : "先找 stem，再看每个 ALS 花瓣和共同目标。")
      : (isLoop
        ? "Verify it is a standard Blossom Loop: branch split/merge nodes must connect as whole Truth/Link regions, and Truth count must equal Link count, i.e. Rank = 0."
        : "Find the stem first, then each ALS petal and the common target."));
    checks.push(zh
      ? (isLoop
        ? "不要只因为名称含 Loop 就按普通 AIC 环解释；也不要把它写成 Death Blossom 的简单闭合版。先看主环，再看动态分支和强制/毛刺分支如何把每处弱关系补成强关系。"
        : "确认每个 ALS 花瓣满足格数与候选数的容量条件，并且所有 stem 分支都排除同一目标。")
      : (isLoop
        ? "Do not treat it as an ordinary AIC loop merely because the name contains Loop, and do not describe it as just a closed Death Blossom. Read the main loop first, then verify how dynamic and forcing/burr branches turn each weak link into a strong inference."
        : "Verify each ALS petal satisfies the cell/candidate capacity condition, and every stem branch excludes the same target."));
  } else if (type === "unique") {
    lines.push(zh ? `本步使用唯一解前提，观察高亮的致命结构${cellsText ? `：${cellsText}` : ""}。` : `This step uses the uniqueness assumption and checks the highlighted deadly pattern${cellsText ? `: ${cellsText}` : ""}.`);
    lines.push(zh ? `若保留/放入被删候选，会形成两个数字可互换的第二解；这不是允许多解，而是与谜题唯一解前提矛盾，因此结论 ${conclusion} 成立。` : `If the removed candidate were kept/placed, the pattern would allow two interchangeable solutions. That is not accepting multiple solutions; it contradicts the puzzle's uniqueness assumption, so ${conclusion} follows.`);
    proof = zh ? "数学逻辑：唯一性技巧采用反证法，前提是当前谜题被视为合格的唯一解数独。UR、UL、XR、AR、BUG、GSP 等致命结构都保持在唯一性类别中；即使某个变体文字里出现 guard/guardian，也只是“防止致命结构成立的破坏点”，不是普通 Guardian Logic。若某些候选被保留或某些破坏点消失，局部数字可以成对互换而不破坏行列宫约束，从而构造出第二个完成盘。这与唯一解前提矛盾，所以任何会把盘面推入该致命结构的候选都必须删除；若题目本身允许多解，则不能使用这类结论。" : "Logic: uniqueness techniques are proofs by contradiction under the assumption that the puzzle has a unique solution. UR, UL, XR, AR, BUG, GSP, and related deadly-pattern families stay in this uniqueness category even when a variant is described with a guard/guardian. Keeping certain candidates or removing the guard would let digits be swapped locally without breaking row/column/box rules, constructing a second completed grid. That contradicts the uniqueness assumption, so any candidate that forces the deadly state is false. If the puzzle is allowed to have multiple solutions, this class of conclusion must not be used.";
    checks.push(zh ? "先确认这是唯一解题；非唯一题或尚未确认唯一性的 OCR 草稿不应使用唯一性技巧。" : "First confirm the puzzle is intended to have a unique solution; do not use uniqueness techniques on non-unique puzzles or OCR drafts whose uniqueness has not been confirmed.");
  } else if (type === "als") {
    lines.push(zh ? `观察高亮的 ALS/AHS 结构${cellsText ? `：${cellsText}` : ""}。` : `Observe the highlighted ALS/AHS structures${cellsText ? `: ${cellsText}` : ""}.`);
    lines.push(zh ? `它们通过受限公共候选或强制候选互相约束，所以结论 ${conclusion} 可删/可出。` : `They constrain one another through restricted common candidates or forced candidates, so ${conclusion} follows.`);
    proof = zh ? "数学逻辑：ALS 是 N 个格含 N+1 个候选，少掉任意一个候选后就会变成锁定集。若两个 ALS 通过受限公共候选相连，该公共候选不能在两个 ALS 中同时失效；否则两边都会被迫成锁定集并造成容量冲突。能同时看到相关受限位置的外部候选因此不能成立。AHS 是对数字/位置关系的对偶表达。" : "Logic: an ALS has N cells and N+1 candidates; removing one candidate turns it into a locked set. When two ALSs share a restricted common candidate, that candidate cannot be absent from both ALSs, or both sides are forced into incompatible locked-set states. External candidates that see the restricted positions can therefore be removed. AHS is the dual view using digits/positions.";
    checks.push(zh ? "确认每个 ALS 在同一 house 内，且格数比候选数少 1。" : "Verify each ALS lies in one house and has one more candidate than cells.");
  } else if (type === "aicWing") {
    lines.push(zh ? `按步骤描述里的 Eureka/AIC 顺序阅读${nodesText ? `：${nodesText}` : ""}。` : `Read the Eureka/AIC text in order${nodesText ? `: ${nodesText}` : ""}.`);
    lines.push(zh ? `这个名称里的 Wing 是链结构的压缩命名，不是普通“枢纽 + 两翼”的双翼模板；它通常由两条或三条强关系串联，推出结论 ${conclusion}。` : `Here “Wing” is a compressed chain name, not the ordinary pivot-plus-two-wings template; it is usually made from two or three strong links and implies ${conclusion}.`);
    proof = zh ? "数学逻辑：Kazusa 的 W-Wing 先按两个分支读：某个区域内目标数字的所有落点必有一个成立，每个落点都会推出一个同数字翼端，因此这些翼端至少一真；多分支 W-Wing 只是把两个分支扩展成三个或更多分支。YZF 里由 FindAIC 命名的 M-Wing、S-Wing、L1/L2/L3-Wing、M3-Wing、Grouped M3-Wing 更应按 AIC/强制链理解。等号段表示强关系：两端至少一真；短横段表示弱关系：两端不能同时真。多个强关系经弱关系连接后，会得到某组端点至少一真，或得到目标候选若成立就沿链传播到矛盾。因此删数不是来自一个固定双翼枢纽，而是来自这条多强链/多分支覆盖了目标候选的全部可能。" : "Logic: Kazusa's W-Wing is first a branch proof: every possible position of the target digit in a house has one true branch, and each branch forces a same-digit wing endpoint, so at least one endpoint is true. Multi-Branch W-Wing extends this from two branches to three or more. In YZF, M-Wing, S-Wing, L1/L2/L3-Wing, M3-Wing, and Grouped M3-Wing names emitted by FindAIC should be read as AIC/forcing-chain compressions. Equality segments are strong links: at least one end is true; dash segments are weak links: both ends cannot be true. Several strong links joined by weak links prove that a set of endpoints has at least one truth, or that the target candidate propagates to contradiction. The deletion comes from complete multi-strong-link/branch coverage, not from a fixed two-wing pivot.";
    checks.push(zh ? "不要强行找普通 Wing 的 pivot；逐段核对描述中的每个“=”是否真是强关系，每个“-”是否真是弱关系。" : "Do not force a classic wing pivot; verify each '=' segment is a real strong link and each '-' segment is a real weak link.");
    checks.push(zh ? "Grouped 节点要当作一个分组端点读：组内任一候选成立都代表该端点成立。" : "Read grouped nodes as one grouped endpoint: any true candidate in the group makes that endpoint true.");
  } else if (type === "alsWing") {
    lines.push(zh ? `把 WXYZ/VWXYZ 视为 ALS-XZ 或 Bent Almost Set 的特例来读。` : `Read WXYZ/VWXYZ as a special case of ALS-XZ or a bent almost set.`);
    lines.push(zh ? `核心集合比锁定集合多一个自由候选；受限公共候选把分支锁住，因此共同受限的目标得到结论 ${conclusion}。` : `The core set has one extra candidate beyond a locked set; restricted common candidates lock the branches, so the shared target gives ${conclusion}.`);
    proof = zh ? "数学逻辑：WXYZ-Wing 不宜简单说成 XY/XYZ-Wing 的更大双翼版。更准确地说，它是一个四候选的 ALS-XZ/Bent Almost Subset。核心区域内的格数与候选数只差 1；当受限公共候选被某一侧使用或排除时，剩余候选会被迫形成锁定分配。目标候选若成立，会同时破坏所有合法分配分支，或同时看见所有可能承担目标数字的位置，所以目标候选可删。" : "Logic: WXYZ-Wing is better treated as a four-candidate ALS-XZ/Bent Almost Subset, not merely as a larger XY/XYZ-Wing. The core has one more candidate than cells; once a restricted common candidate is used or excluded on one side, the remaining candidates are forced into a locked allocation. If the target candidate were true, it would break every legal allocation branch, or it would see all possible positions that can carry the target digit, so it can be removed.";
    checks.push(zh ? "核对核心集合是否满足“格数 + 1 个候选”的 ALS/Bent Set 条件。" : "Verify the core satisfies the ALS/Bent-Set condition: one more candidate than cells.");
    checks.push(zh ? "核对删数是否确实同时受所有可能目标落点限制，而不是只看见其中一部分。" : "Verify the deletion is restricted by all possible target positions, not just some of them.");
  } else if (type === "wing") {
    lines.push(zh ? `先找枢纽/翼格以及它们共享的候选关系。` : `First identify the pivot/wing cells and their shared candidates.`);
    lines.push(zh ? `普通 XY/XYZ 类 Wing 是小型分支证明；若是多个翼端，则应按多翼分支覆盖来读，而不是误解成固定双翼。结论 ${conclusion} 来自所有分支都排除同一目标。` : `Ordinary XY/XYZ-style wings are small case splits; if multiple wing endpoints are present, read it as multi-wing branch coverage rather than a fixed two-wing pattern. ${conclusion} follows because every branch excludes the same target.`);
    proof = zh ? "数学逻辑：Kazusa 对 XY/XYZ/WXYZ/VWXYZ 的统一讲法是分支覆盖。枢纽或核心格只有少数可选情况；逐一讨论后，每一种情况都会让某个同数字翼端成立，或核心格自身承担目标数字。若某个外部候选同时看见所有可能成立的目标数字位置，它成立就会把这些位置全部排除，违反“至少一个成立”，所以可删。XY-Wing 少一个目标候选，XYZ 以后则可视为更完整的多格多候选分支；若结构扩展成多翼，必须覆盖全部翼端。" : "Logic: Kazusa presents XY/XYZ/WXYZ/VWXYZ as branch coverage. The pivot or core cell has only a few cases; in every case, one same-digit wing endpoint becomes true, or the core itself carries the target digit. Any external candidate that sees every possible true target position would eliminate all of them, contradicting the at-least-one-true result. XY-Wing lacks one target candidate, while XYZ and larger wings are fuller multi-cell/multi-candidate branches. If the pattern has multiple wings, all endpoints must be covered.";
    checks.push(zh ? "确认被删候选同时看见所有可能推出的翼端同数字候选；多翼结构要检查全部翼端。" : "Verify the removed candidate sees every possible same-digit wing endpoint; for multi-wing patterns, check every endpoint.");
  } else if (type === "chain") {
    lines.push(zh ? `按链路顺序阅读节点${nodesText ? `：${nodesText}` : ""}。` : `Read the chain in node order${nodesText ? `: ${nodesText}` : ""}.`);
    lines.push(zh ? `强弱关系交替传递真假；端点、环或反证路径推出结论 ${conclusion}。` : `Truth alternates through strong and weak links; endpoints, loops, or contradiction paths imply ${conclusion}.`);
    proof = zh ? "数学逻辑：Kazusa 的双强链章节把强关系解释为“两端至少一真”，弱关系解释为“两端不能同真”。AIC/X-Chain/XY-Chain 就是把这些关系按 Eureka 顺序串起来。若链头和链尾共同看见某候选，该候选为真会让两个端点都假，违反链推出的“至少一真”；若形成不连续环，则某候选会推出自身冲突、区域无候选或格子无候选，所以它可删。Whip/Braid 仍可按反证链读：假设目标成立后，经过一串强制选择必达矛盾。" : "Logic: Kazusa's two-strong-link chapter defines a strong inference as at least one end true, and a weak inference as not both true. AIC/X-Chain/XY-Chain strings those inferences in Eureka order. If two endpoints both see a candidate, making that candidate true would make both endpoints false and violate the chain's at-least-one-true result. In a discontinuous loop, an assumption forces self-conflict, an empty house, or an empty cell, so it is false. Whip/Braid steps can still be read as contradiction chains: assume the target, follow forced choices, and reach impossibility.";
    checks.push(zh ? "确认线条方向只是阅读辅助；真正依据是强/弱关系、端点可见性和是否真的覆盖全部分支。" : "Line direction is a reading aid; the proof rests on strong/weak links, endpoint visibility, and complete branch coverage.");
  } else if (type === "forcing") {
    lines.push(zh ? `按强制链分支读：先找起点，再逐条核对所有可能分支是否都走向同一结论 ${conclusion}。` : `Read this as forcing-chain branches: find the start, then verify every possible branch reaches the common conclusion ${conclusion}.`);
    lines.push(zh ? `它不是普通“头尾取交集”的链；结论来自完备分支、归并分支、鱼鳍分支或动态分支共同排除目标。` : `This is not an ordinary endpoint-intersection chain; the conclusion comes from complete branches, merged branches, fin branches, or dynamic branches all excluding the target.`);
    proof = zh ? "数学逻辑：Kazusa 的强制链章节强调，强制链依赖多个分支。若从某个格、某个区域或某个候选出发，所有合法分支最终都推出同一个删数/出数，那么真实分支无论是哪一个，共同结论都必然成立；若某个假设让某一行/列/宫的某数字全部无处可放，或让某格无候选，则该假设为假。归并强制链把起点延后后，多个目标可接入同一批分支并一并删除；鳍链则把“鱼鳍真”和“鱼鳍假时链成立”作为两类分支取交集。" : "Logic: Kazusa's forcing-chain chapter emphasizes multiple branches. Starting from a cell, house, or candidate, if every legal branch reaches the same placement/elimination, the common conclusion is true no matter which branch is real. If an assumption leaves a row/column/box with no place for a digit, or a cell with no candidates, that assumption is false. Merged forcing chains move the start later so several targets can join the same branch proof; finned chains split into the fin-true branch and the fin-false chain branch and take their common deletion.";
    checks.push(zh ? "确认分支是完备的：格强制链要覆盖该格所有候选；区域强制链要覆盖该区域该数字所有落点。" : "Verify branch completeness: a cell forcing chain must cover all candidates of the cell; a region forcing chain must cover all positions of the digit in the house.");
    checks.push(zh ? "若是动态链，注意分支内部还会继续分叉，必须看到所有子分支都指向同一目标。" : "For dynamic chains, branches may split again; every sub-branch must still reach the same target.");
  } else if (type === "rankFish") {
    lines.push(zh ? `本步按 Kazusa 秩理论里的复数鱼/复杂鱼来读：先分强区域与弱区域，再看 rank，而不是按普通 X-Wing/Swordfish 的形状模板来读。` : `Read this as Kazusa-style rank-theory Multifish/Complex Fish: identify strong sectors, weak sectors, and rank, rather than using an ordinary X-Wing/Swordfish shape template.`);
    lines.push(zh ? `强区域给出必须满足的候选名额，弱区域负责覆盖这些名额；当覆盖计数锁定后，多余位置推出 ${conclusion}。` : `Strong sectors supply required candidate placements and weak sectors cover them; once the count is locked, extra covered positions imply ${conclusion}.`);
    proof = zh ? "数学逻辑：Kazusa 的秩理论把强区域定义为必须且只能填入一个实例，把弱区域定义为最多只能填入一个实例；秩可理解为“最多可容纳次数 − 实际必须填入次数”。复数鱼把多个数字、多个行列宫或单元格空间一起计数。若强区域数量与弱区域容量相等，且结构内候选被弱区域完整覆盖，就形成 Rank 0：每个弱区域的容量都要被必要实例用掉。任何弱区域中的额外候选若成立，会抢占容量，使某个强区域无处安置或某个弱区域超额，所以可删。Complex Fish 也是同一思想，只是 base/cover 可由更混合的区域组成；rank 非 0 时必须按输出的 guardian/例外条件核对，不能自动套 Rank 0 删法。" : "Logic: Kazusa's rank theory defines a strong sector as requiring exactly one instance, and a weak sector as allowing at most one; rank is the available capacity minus the required truths. Multifish counts several digits and several row/column/box/cell spaces together. If the number of strong sectors equals weak capacity and all in-structure candidates are covered by weak sectors, the pattern is rank 0: every weak sector's capacity is consumed by required instances. Any extra candidate in a weak sector would steal capacity, leaving a strong sector unsupported or overfilling a weak sector, so it can be removed. Complex Fish uses the same idea with more mixed base/cover sectors; nonzero rank must be checked through the reported guardians/exceptions, not by automatically applying rank-0 deletions.";
    checks.push(zh ? "核对说明中的强区域/弱区域数量是否相等；若 step 标出 rank，应优先核对 rank=0 或对应 rank 约束。" : "Check whether the listed strong and weak sectors have equal counts; if the step reports rank, verify rank 0 or the reported rank condition first.");
    checks.push(zh ? "Multi-Fish 的删数通常落在弱区域覆盖到的额外候选，不要按普通鱼只找一组 base 行/列。" : "Multifish deletions usually lie in extra candidates covered by weak sectors; do not look only for one ordinary set of base rows/columns.");
  } else if (type === "rank0") {
    lines.push(zh ? `本步按 MSLS / Rank 0 或 Rank 1 覆盖计数读：先看 Home/Away 数字集、被选中的行列宫，以及 NS/HS/DC 是否平衡。` : `Read this as MSLS / Rank-0 or Rank-1 cover counting: first check the Home/Away digit sets, the selected houses, and whether NS/HS/DC are balanced.`);
    lines.push(zh ? `当“需要放入的 digit covers”与“能够容纳它们的核心格/隐藏格”形成锁定，任何会打破 NS、HS、DC 不等式的候选都可推出 ${conclusion}。` : `When the required digit covers are locked to the core naked/hidden cells that can hold them, any candidate that breaks the NS/HS/DC balance gives ${conclusion}.`);
    proof = zh
      ? "数学逻辑：Kazusa 把 MSLS 归到秩理论里的“网”，强调可以用单元格作强区域、用相关连接作弱区域构成零秩结构；David P Bird 的 MSLS 口径则更适合用户手算，不必强迫用户先分强弱区域。先把数字分成 Home set 与 Away set，再给若干行、列、宫分配这些数字覆盖；已给/已定数字从该 house 的覆盖中扣除，只留下仍需安置的 digit covers。记 NS 为所有候选都被覆盖的核心格数，HS 为至少有一个候选被覆盖的格数，DC 为 digit covers 总数，通常有 HS ≥ DC ≥ NS。若 DC = NS，就形成 Multi-Sector Naked Set：NS 个核心格必须容纳 DC 个必要数字，容量刚好用满，所以部分覆盖格中的被覆盖候选、以及核心格中被覆盖两次的候选若成立，都会导致核心格还要用更少的 digit covers 填满，最终出现某格无数可填或某格要放两个数的矛盾。若 HS = DC，则按 Multi-Sector Hidden Set 读：HS 个可容纳格最多容纳 DC 个必要数字，容量也被锁死，未覆盖的额外候选会破坏隐藏集合容量。Rank 1 / Almost 形态则允许一个例外名额；只有所有可能例外都被定位后，其余 potential eliminations 才能删除。SK Loop 是 MSLS 的典型外观之一，常见为四宫矩形和对角给定数；它可以写成链，但用户解释应优先按多区域锁定集合的容量证明读。"
      : "Logic: Kazusa places MSLS under rank-theory “nets”: cells can act as strong sectors, while related links/covers act as weak sectors to form a rank-0 structure. In David P Bird's more hand-solving-friendly MSLS reading, the user does not need to start by labeling weak and strong sectors. Split the digits into a Home set and its Away complement, assign those covers to selected rows/columns/boxes, and subtract already-given/solved digits from each house, leaving only the digit covers still to be placed. Let NS be the number of cells whose candidates are all covered, HS the number of cells with at least one covered candidate, and DC the number of digit covers; normally HS ≥ DC ≥ NS. If DC = NS, the core cells form a Multi-Sector Naked Set: the NS cells must hold exactly the DC required digits, so capacity is fully used. A covered candidate in a partially covered cell, or a twice-covered candidate inside the core, would consume one of those required covers and leave too few covers to fill the core, eventually forcing an empty cell or a cell with two digits. If HS = DC, read it as a Multi-Sector Hidden Set: the possible cells have exactly the capacity needed for the required covers, so uncovered extras are false. Rank-1/almost cases allow one exception; the remaining potential eliminations are valid only after the exception is localized. SK Loop is a typical MSLS-looking pattern, often a four-box rectangle with diagonal givens; it may be written as a chain, but the user proof should be the multi-sector capacity argument.";
    checks.push(zh ? "先核对 Home/Away 或 Base/Roof 数字集，再核对每个被选 house 中还需要放置哪些数字覆盖。" : "First check the Home/Away or Base/Roof digit sets, then check which digit covers still need placement in each selected house.");
    checks.push(zh ? "核对 NS、HS、DC：MS-NS 常看 DC=NS；MS-HS 常看 HS=DC；Almost/Rank 1 只能删除被证明不是例外的候选。" : "Check NS, HS, and DC: MS-NS usually relies on DC=NS; MS-HS on HS=DC; Almost/Rank-1 forms can delete only candidates proven not to be the exception.");
    checks.push(zh ? "SK Loop 不要按普通链环解释；先看四宫矩形、对角给定数和 Home set 是否构成 MSLS 等量覆盖。" : "Do not read SK Loop as an ordinary chain loop; first check whether the four-box rectangle, diagonal givens, and Home set form an MSLS equal-cover pattern.");
    checks.push(zh ? "删数应是 potential eliminations：部分覆盖格中的被覆盖候选、核心格中被覆盖两次的候选，或隐藏集合中未覆盖的额外候选。" : "Deletions should be potential eliminations: covered candidates in partially covered cells, twice-covered candidates inside the core, or uncovered extras in a hidden-set reading.");
  } else if (type === "rank") {
    lines.push(zh ? `本步把 base 集合、cover 集合和候选覆盖关系作为整体比较。` : `This step compares base sets, cover sets, and candidate coverage as one structure.`);
    lines.push(zh ? `当 cover 足以覆盖 base 的必要占位，多余交叠位置或 rank 约束位置可得出 ${conclusion}。` : `When the covers account for the required base placements, extra overlaps or rank-constrained positions imply ${conclusion}.`);
    proof = zh ? "数学逻辑：秩理论把“必须满足的约束”看成 base，把“可容纳这些满足项的位置”看成 cover。若 cover 数量与 base 数量相等，cover 会被必要项占满，额外候选不能成立；若存在 rank 差，则删数/出数来自覆盖冗余、交叠或 guardian 对所有可能性的限制。" : "Logic: rank logic treats required constraints as bases and the places that can satisfy them as covers. If the number of covers equals the number of bases, the covers are filled by the required placements and extra candidates are false. With nonzero rank, eliminations/placements come from cover redundancy, overlaps, or guardians restricting all possibilities.";
    checks.push(zh ? "优先核对 base/cover 数量、rank 标注和删数是否落在被覆盖的额外位置。" : "Check base/cover counts, rank, and whether deletions are covered extras.");
  } else if (type === "exocet") {
    const key = stepExplainKindKey(step);
    const isMutant = /mutant|交叉|变异/.test(key);
    const isSenior = /senior|高级/.test(key);
    const isWeak = /weak|弱/.test(key);
    const isDouble = /double|双/.test(key);
    lines.push(zh
      ? `观察 base cells、target cells、cross lines/cross cells，以及可能出现的 companion、mirror、guardian。`
      : `Observe the base cells, target cells, cross lines/cross cells, and any companions, mirrors, or guardians.`);
    lines.push(zh
      ? `JExocet 说明的核心是：两个 target cells 合起来必须持有与 base cells 相同的一对真数字；与这个同步关系不兼容的候选推出 ${conclusion}。`
      : `The core JExocet reading is that the two target cells together must hold the same true digit pair as the base cells; candidates incompatible with that synchronization give ${conclusion}.`);
    if (isWeak) {
      proof = zh
        ? `数学逻辑：Weak Exocet 只保留 Exocet 骨架中一部分稳定约束，所以不能套用完整 JE 的全部删数。仍然可以使用的部分是 base-target 同步的“所有分支覆盖”：base 中每一种可行真数对，都必须在 target/cross 结构里找到相容承接。若某候选在所有可行承接中都会造成某个 base 数字无处安置、target 无法承接，或 cross/cross-line 容量冲突，它就可删。`
        : `Logic: Weak Exocet preserves only part of the stable Exocet constraints, so the full JE deletion set must not be applied wholesale. The usable part is all-branch coverage of base-target synchronization: every viable true digit pair in the base must have a compatible target/cross arrangement. A candidate can be removed only when it conflicts with every viable arrangement by blocking a base digit, target placement, or cross-line capacity.`;
    } else {
      proof = zh
        ? `数学逻辑：JExocet Definition 的目标是证明一对 target cells 必须合起来持有 base cells 中的同一对真数字。base cells 位于一条迷你线，确定 base cross-line；另外两条平行 cross-lines 与 target/cross cells 共同形成 S-cell 容量限制。对任一真正进入 base 的数字来说，它在三条 cross-lines 中需要满足固定次数；普通 S cells 最多只能提供其中一部分，因此 target cells 必须承担缺少的必要落点。于是 target 中的非 base 数字可删；任何破坏“base 真数对 = target 真数对”的候选，都会让某个 base 数字无法承接，或让 cross-line/S-cell 容量超限，所以可删。${isSenior ? " Senior Exocet 扩大了 S-cell 集合，target 可能落在交叉结构内部；仍然依靠同一个容量证明：S cells 只能提供两次承接，target 必须提供第三次承接。" : " Junior Exocet 先按标准 base/target/cross/companion 角色核对。"}${isMutant ? " Mutant Exocet 把 cross 结构推广到更混合的行列组合，常可附带 rank/Multifish 视角；动态说明只按结论列出的目标逐项核对，不自动扩展删数。" : ""}${isDouble ? " Double JE 需要分别核对两个 JE2 子结构如何共存，再使用它们共同推出的额外限制。" : ""}`
        : `Logic: the JExocet definition proves that the two target cells together must hold the same true digit pair as the base cells. The base cells sit in a mini-line and define the base cross-line; two further parallel cross-lines plus target/cross cells impose S-cell capacity limits. For any digit that is true in the base, its appearances across the three cross-lines must satisfy a fixed count. Ordinary S cells can provide only part of that count, so the target cells must provide the missing required placements. Therefore non-base digits in targets can be removed, and any candidate that breaks “true base pair = true target pair” would leave a base digit unsupported or overfill the cross-line/S-cell capacity, so it can be removed. ${isSenior ? "Senior Exocet expands the S-cell set and targets may sit inside the cross structure; the same capacity proof applies: S cells can provide only two supports, so the targets must provide the third." : "Junior Exocet starts by checking the standard base/target/cross/companion roles."}${isMutant ? " Mutant Exocet generalizes the cross structure to mixed row/column combinations and may also have a rank/Multifish reading; verify only the listed conclusions, not an expanded deletion set." : ""}${isDouble ? " Double JE requires checking how the two JE2 subpatterns coexist before using their additional shared restrictions." : ""}`;
    }
    checks.push(zh ? "先核对 base 候选集合；target cells 应只承接 base 真数字，而不是把 cross 区域里的所有候选一概删除。" : "First check the base candidate set; target cells should carry only the true base digits, but that does not mean every candidate in the cross area is deleted.");
    checks.push(zh ? "核对 S-cell/cross-line 容量：每个 base 数字的承接次数必须由 target/cross 结构满足，删数只能来自破坏该配额的候选。" : "Check S-cell/cross-line capacity: each base digit's required supports must be supplied by the target/cross structure, and deletions must come only from candidates that break that quota.");
    checks.push(zh ? "Senior、Mutant、Double、JE+、Almost JE 等扩展形态只继承被证明仍成立的推论；不要自动套用完整 Junior Exocet 的所有删数规则。" : "Senior, Mutant, Double, JE+, and Almost JE variants inherit only the inferences that remain proven; do not automatically apply every full Junior Exocet deletion rule.");
  } else if (type === "oddagon") {
    const key = stepExplainKindKey(step);
    const isTriplet = /triplet|tri[-\s]*value|trivalue|tridagon|三/.test(key);
    lines.push(zh
      ? `本步按 Kazusa 的 Rank Logic / Negative Rank 口径读，不按 UR/BUG 唯一性模板读。`
      : `Read this with Kazusa's Rank Logic / Negative-Rank model, not as a UR/BUG uniqueness template.`);
    lines.push(zh
      ? `先看奇数交替主体，再看 guardian/额外候选如何阻止坏结构完整成立；会把结构推入负秩矛盾的候选推出 ${conclusion}。`
      : `First inspect the odd alternating body, then the guardians/extras that prevent the bad structure from becoming complete; candidates that force the negative-rank contradiction give ${conclusion}.`);
    proof = zh
      ? `数学逻辑：Oddagon/Tridagon 在 Kazusa 体系里属于 Rank Logic 的 Negative Rank。它不是“如果成立会有第二解”的唯一性反证，而是“结构本身无法满足”的容量/奇偶矛盾。Bivalue Oddagon 可以理解为奇数个双值强约束围成的交替环：沿环传播真假，偶数环可以闭合，奇数环回到起点时会要求同一状态同时为真/假，或要求两个相邻位置取同一侧状态，导致无解。${isTriplet ? "Trivalue/Triplet Oddagon 是同一负秩思想的三值推广：三数字在奇结构中被配额和交替关系卡死，若额外候选被去掉或某候选被保留，就会出现某个数字缺位、重复占位或局部容量无法满足。" : ""}因此，guardian 或额外候选只是阻止坏结构成立的出口；若某个删数候选会排除所有出口，或把盘面强迫进这个负秩结构，它就必须为假。这个结论不依赖“唯一解第二解”前提，但必须核对奇数结构和所有出口是否完整。`
      : `Logic: in Kazusa's taxonomy, Oddagon/Tridagon belongs to Rank Logic / Negative Ranks. It is not a uniqueness proof saying that a second solution would appear; it is an unsatisfiable structure/capacity contradiction. A Bivalue Oddagon can be read as an odd ring of bivalue strong constraints: truth alternation can close on an even ring, but on an odd ring it returns to the start with inconsistent truth requirements or adjacent endpoints requiring the same state. ${isTriplet ? "Trivalue/Triplet Oddagon generalizes the same negative-rank idea: the three digits are trapped by quota and alternation constraints, so removing the exits or keeping a forcing candidate causes a missing digit, duplicate placement, or local capacity failure. " : ""}Guardians or extra candidates are exits that prevent the bad structure from becoming active. A deletion is valid only when the candidate would remove every exit or force the grid into that negative-rank contradiction. This does not rely on the unique-solution/second-solution premise, but the odd structure and all exits must be checked.`;
    checks.push(zh ? "确认它不是 UR/BUG：Oddagon 的核心是奇数/负秩无解矛盾，不是可互换第二解。" : "Verify it is not UR/BUG: Oddagon is an odd/negative-rank no-solution contradiction, not an interchangeable-second-solution proof.");
    checks.push(zh ? "确认奇数结构、候选集合和 guardian/额外候选完整；删数必须确实会消灭所有出口或触发负秩矛盾。" : "Verify the odd structure, digit set, and guardians/extras are complete; the deletion must truly remove all exits or trigger the negative-rank contradiction.");
  } else {
    lines.push(zh ? `先看高亮结构${cellsText ? `：${cellsText}` : ""}，再看结论 ${conclusion}。` : `First inspect the highlighted structure${cellsText ? `: ${cellsText}` : ""}, then the conclusion ${conclusion}.`);
    lines.push(zh ? "本技巧的专用模板尚未细化；当前说明使用通用“结构限制所有可能性”的读法。" : "This technique does not yet have a specialized template; this uses the generic all-cases-covered reading." );
    proof = zh ? "数学逻辑：系统找到的结构会把目标候选的所有可能情况分完。若每个分支都排除同一个候选，或只有一个分支能避免冲突，那么对应删数/出数就是必然结论。" : "Logic: the found structure partitions the possible cases. If every case excludes the same candidate, or only one case avoids contradiction, the corresponding deletion/placement is forced.";
    checks.push(zh ? "核对高亮结构、结论位置以及候选数字是否一致。" : "Check that the highlighted structure, target cells, and digits match the conclusion.");
  }

  if (step.description) {
    checks.push(zh ? "原始步骤描述可作为 Eureka/结构文本，对照盘面逐段核验。" : "Use the original step description as Eureka/structure text and verify it against the grid.");
  }
  if (elims > 0 || places > 0) {
    checks.push(zh ? `本步结论数量：出数 ${places}，删数 ${elims}。` : `Conclusion count: placements ${places}, eliminations ${elims}.`);
  }

  const meta = [];
  if (cand) meta.push(zh ? `候选 ${cand}` : `candidate ${cand}`);
  if (house) meta.push(house);
  if (structureCount) meta.push(zh ? `结构格 ${structureCount}` : `${structureCount} cells`);
  if (edgeCount) meta.push(zh ? `链边 ${edgeCount}` : `${edgeCount} edges`);
  if (groupCount) meta.push(zh ? `分组 ${groupCount}` : `${groupCount} groups`);
  if (chainLength) meta.push(zh ? `链长 ${chainLength}` : `chain length ${chainLength}`);
  if (stepHasStrictRank(step)) meta.push(`rank ${rank}`);

  return { type, lines, proof, checks, meta };
}


function stepTutorialCardKey(step = {}) {
  const aliases = {
    RankMultifish: "Multifish",
    AHSChain: "ALSChain",
    AHSXYWing: "ALSXYWing",
    AHSWWing: "ALSWWing",
  };
  const direct = aliases[step.kind] || step.kind;
  if (direct && TECHNIQUE_TUTORIAL_CARDS[direct]) return direct;

  const key = stepExplainKindKey(step);
  const titleAliases = [
    [/hidden rectangle|uniqueness test|unique rectangle|ur type|ur guardian/, "UniqueRectangle"],
    [/continuous nice loop|discontinuous nice loop|complex aic/, "ComplexAIC"],
    [/grouped aic/, "GroupedAIC"],
    [/death blossom/, "DeathBlossom"],
    [/blossom loop|burring loop|burred loop/, "BlossomLoop"],
    [/senior exocet/, "SeniorExocet"],
    [/weak exocet/, "WeakExocet"],
    [/junior exocet|\bje\b/, "JE"],
    [/multi[- ]?fish/, "Multifish"],
  ];
  for (const [pattern, cardKey] of titleAliases) {
    if (pattern.test(key) && TECHNIQUE_TUTORIAL_CARDS[cardKey]) return cardKey;
  }
  return "";
}

function appendStepExplainSection(parent, headingText, bodyText, extraClass = "") {
  if (!String(bodyText || "").trim()) return null;
  const section = document.createElement("section");
  section.className = `step-explain-section ${extraClass}`.trim();
  const heading = document.createElement("div");
  heading.className = "step-explain-section-heading";
  heading.textContent = headingText;
  const body = document.createElement("div");
  body.className = "step-explain-section-body";
  body.textContent = String(bodyText);
  section.append(heading, body);
  parent.appendChild(section);
  return section;
}

function buildTechniqueTutorialGuide(step = {}) {
  const locale = lang.value === "en" ? "en" : "zh";
  const auditedCard = buildAuditedTechniqueGuide(step, locale);
  const cardKey = auditedCard ? "" : stepTutorialCardKey(step);
  const card = auditedCard || (cardKey ? TECHNIQUE_TUTORIAL_CARDS[cardKey]?.[locale] : null);
  if (!Array.isArray(card) || card.length === 0) return null;

  const group = document.createElement("section");
  group.className = "step-tutorial-group step-tutorial-guide";
  const title = document.createElement("h3");
  title.className = "step-tutorial-group-title";
  title.textContent = ui("stepTutorialGuide");
  group.appendChild(title);

  const sections = document.createElement("div");
  sections.className = "step-explain-sections";
  const fields = TECHNIQUE_TUTORIAL_FIELDS[locale] || [];
  card.forEach((text, index) => {
    appendStepExplainSection(sections, fields[index] || "", text, index === 2 ? "step-explain-section-math" : "");
  });
  group.appendChild(sections);
  return group;
}

function createCurrentStepGroup() {
  const group = document.createElement("section");
  group.className = "step-tutorial-group step-tutorial-current";
  const title = document.createElement("h3");
  title.className = "step-tutorial-group-title";
  title.textContent = ui("stepTutorialCurrent");
  group.appendChild(title);
  return group;
}

function buildStepExplanationContent(step, snapshot = currentSnapshot) {
  const zh = lang.value === "zh";
  // Audited families use the source-verified browser model first. This keeps
  // explanations correct even when an older cached WASM still contains the
  // former one-template-per-category text. Non-audited families continue to
  // use the authoritative backend payload until their source audit is closed.
  const audited = buildAuditedStepExplanationPayload(step, zh ? "zh" : "en");
  const backend = audited || step?.explanation?.[zh ? "zh" : "en"];
  const legacyWhipBraidRankPayload = isWhipOrBraidStep(step) &&
    step?.rankAvailable !== true &&
    !Number.isInteger(step?.chainLength) &&
    Number(step?.rank || 0) > 0;
  const fragment = document.createDocumentFragment();

  const subtitle = document.createElement("div");
  subtitle.className = "step-explain-subtitle";
  const displayName = stepDisplayName(step);
  const description = formatHintDesc(step);
  const normalizedDescription = description.replace(/^\s+/, "");
  const repeatsName = normalizedDescription.startsWith(`${displayName}:`)
    || normalizedDescription.startsWith(`${displayName}：`)
    || normalizedDescription === displayName;
  subtitle.textContent = repeatsName ? normalizedDescription : `${displayName} · ${normalizedDescription}`;
  fragment.appendChild(subtitle);

  const guide = buildTechniqueTutorialGuide(step);
  if (guide) fragment.appendChild(guide);

  const currentGroup = createCurrentStepGroup();

  // V486 explanation contract: current WASM provides the full bilingual model.
  // The legacy formatter remains only as a compatibility fallback for old JSON.
  if (!backend || typeof backend !== "object" || legacyWhipBraidRankPayload) {
    const data = stepExplainBuildLines(step, snapshot);
    const sections = document.createElement("div");
    sections.className = "step-explain-sections";
    data.lines.forEach((line, index) => {
      appendStepExplainSection(
        sections,
        zh ? `推导 ${index + 1}` : `Deduction ${index + 1}`,
        line,
      );
    });
    appendStepExplainSection(sections, zh ? "数学逻辑" : "Logic", data.proof, "step-explain-section-math");
    appendStepExplainSection(sections, zh ? "结论" : "Conclusion", stepExplainConclusion(step), "step-explain-section-conclusion");
    currentGroup.appendChild(sections);
    if (Array.isArray(data.meta) && data.meta.length > 0) {
      const meta = document.createElement("div");
      meta.className = "step-explain-meta";
      data.meta.forEach((item) => {
        const span = document.createElement("span");
        span.className = "step-explain-pill";
        span.textContent = String(item);
        meta.appendChild(span);
      });
      currentGroup.appendChild(meta);
    }
    fragment.appendChild(currentGroup);
    return fragment;
  }

  const labels = zh
    ? { structure: "结构", principle: "依据", deduction: "推导", conclusion: "结论", eureka: "尤里卡／原始证明", checks: "当前步骤核对" }
    : { structure: "Structure", principle: "Principle", deduction: "Deduction", conclusion: "Conclusion", eureka: "Eureka / formal proof", checks: "Current-step checks" };

  const sections = document.createElement("div");
  sections.className = "step-explain-sections";
  appendStepExplainSection(sections, labels.structure, backend.structure);
  appendStepExplainSection(sections, labels.principle, backend.principle);
  appendStepExplainSection(sections, labels.deduction, backend.deduction);
  appendStepExplainSection(sections, labels.conclusion, backend.conclusion, "step-explain-section-conclusion");

  if (backend.eureka) {
    const details = document.createElement("details");
    details.className = "step-explain-details";
    const summary = document.createElement("summary");
    summary.textContent = labels.eureka;
    const pre = document.createElement("pre");
    pre.className = "step-explain-eureka";
    pre.textContent = String(backend.eureka);
    details.append(summary, pre);
    sections.appendChild(details);
  }
  currentGroup.appendChild(sections);

  if (Array.isArray(backend.checks) && backend.checks.length > 0) {
    const details = document.createElement("details");
    details.className = "step-explain-details";
    const summary = document.createElement("summary");
    summary.textContent = labels.checks;
    const ul = document.createElement("ul");
    backend.checks.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = String(line);
      ul.appendChild(li);
    });
    details.append(summary, ul);
    currentGroup.appendChild(details);
  }

  if (Array.isArray(backend.meta) && backend.meta.length > 0) {
    const meta = document.createElement("div");
    meta.className = "step-explain-meta";
    backend.meta.forEach((item) => {
      const span = document.createElement("span");
      span.className = "step-explain-pill";
      span.textContent = String(item);
      meta.appendChild(span);
    });
    currentGroup.appendChild(meta);
  }

  fragment.appendChild(currentGroup);
  return fragment;
}

function updateStepExplainButtonState(step = currentHint, snapshot = currentSnapshot) {
  const enabled = Boolean(step && step.valid);
  currentStepExplainContext = enabled ? { step, snapshot } : null;
  if (!btnStepExplain) return;
  btnStepExplain.classList.remove("hidden");
  btnStepExplain.disabled = !enabled;
  const label = ui("stepExplain");
  const unavailable = ui("stepExplainUnavailable");
  setButtonText(btnStepExplain, label);
  btnStepExplain.title = enabled ? label : unavailable;
  btnStepExplain.setAttribute("aria-label", enabled ? label : unavailable);
}

function closeStepExplanationDialog() {
  if (!stepExplainDialog) return;
  if (typeof stepExplainDialog.close === "function" && stepExplainDialog.open) {
    stepExplainDialog.close();
  } else {
    stepExplainDialog.classList.add("hidden");
  }
}

function stepExplainViewportRect() {
  const vv = window.visualViewport;
  const left = vv?.offsetLeft || 0;
  const top = vv?.offsetTop || 0;
  const width = vv?.width || window.innerWidth;
  const height = vv?.height || window.innerHeight;
  return { left, top, right: left + width, bottom: top + height, width, height };
}

function positionStepExplanationDialog() {
  if (!stepExplainDialog?.open || !boardStage) return;
  const viewport = stepExplainViewportRect();
  const boardRect = boardStage.getBoundingClientRect();
  const gap = 8;
  const minUsefulWidth = Math.min(300, Math.max(240, viewport.width * 0.52));
  const minUsefulHeight = 180;

  const candidates = [
    {
      name: "right",
      left: boardRect.right + gap,
      top: viewport.top + gap,
      width: viewport.right - boardRect.right - gap * 2,
      height: viewport.height - gap * 2,
      preference: 4,
    },
    {
      name: "below",
      left: viewport.left + gap,
      top: boardRect.bottom + gap,
      width: viewport.width - gap * 2,
      height: viewport.bottom - boardRect.bottom - gap * 2,
      preference: 3,
    },
    {
      name: "left",
      left: viewport.left + gap,
      top: viewport.top + gap,
      width: boardRect.left - viewport.left - gap * 2,
      height: viewport.height - gap * 2,
      preference: 2,
    },
    {
      name: "above",
      left: viewport.left + gap,
      top: viewport.top + gap,
      width: viewport.width - gap * 2,
      height: boardRect.top - viewport.top - gap * 2,
      preference: 1,
    },
  ].filter((item) => item.width >= 220 && item.height >= 130);

  let chosen = candidates
    .filter((item) => item.width >= minUsefulWidth && item.height >= minUsefulHeight)
    .sort((a, b) => (b.preference - a.preference) || (b.width * b.height - a.width * a.height))[0];
  if (!chosen) {
    chosen = candidates.sort((a, b) => (b.width * b.height - a.width * a.height) || (b.preference - a.preference))[0];
  }
  if (!chosen) return;

  stepExplainDialog.dataset.placement = chosen.name;
  stepExplainDialog.style.transform = "none";
  stepExplainDialog.style.left = `${Math.round(chosen.left)}px`;
  stepExplainDialog.style.top = `${Math.round(chosen.top)}px`;
  stepExplainDialog.style.width = `${Math.max(220, Math.floor(chosen.width))}px`;
  stepExplainDialog.style.height = `${Math.max(130, Math.floor(chosen.height))}px`;
}

function refreshOpenStepExplanationDialog() {
  const ctx = currentStepExplainContext;
  if (!ctx?.step || !ctx.step.valid || !stepExplainDialogContent) return;
  const title = `${ui("stepExplainTitle")} · ${stepDisplayName(ctx.step)}`;
  setTextById("stepExplainDialogTitle", title);
  setTextById("stepExplainDialogClose", ui("close"));
  stepExplainDialogContent.replaceChildren(buildStepExplanationContent(ctx.step, ctx.snapshot));
  requestAnimationFrame(positionStepExplanationDialog);
}

function openStepExplanationDialog() {
  const ctx = currentStepExplainContext;
  if (!ctx?.step || !ctx.step.valid) {
    setStatus(ui("stepExplainUnavailable"));
    return;
  }
  if (!stepExplainDialog || !stepExplainDialogContent) return;
  stepExplainDialog.classList.remove("hidden");
  if (!stepExplainDialog.open) {
    if (typeof stepExplainDialog.show === "function") stepExplainDialog.show();
    else stepExplainDialog.setAttribute("open", "");
  }
  refreshOpenStepExplanationDialog();
}

function renderStepExplanation(step = null, snapshot = currentSnapshot) {
  // V441: explanation is no longer rendered inline. Keep the topbar Explain
  // button disabled/enabled by current step, and generate the tutorial dialog on demand.
  if (stepExplainPanel) {
    stepExplainPanel.classList.add("hidden");
    stepExplainPanel.replaceChildren();
  }
  updateStepExplainButtonState(step, snapshot);
}


function getBoardState() {
  if (!engine) return null;
  return parseJson(engine.state_json());
}

function getCandidateState() {
  if (!engine) return null;
  return parseJson(engine.get_candidates_json());
}

function getCurrentSnapshot() {
  const state = getBoardState();
  const candidates = getCandidateState();
  if (!state) return null;
  return {
    version: Number(state.version ?? state.revision ?? 0),
    revision: Number(state.revision ?? state.version ?? 0),
    stateHash: state.stateHash || "",
    board: state.board,
    givens: snapshotGivensString(state),
    cells: Array.isArray(state.cells) ? state.cells : (candidates?.cells || []),
  };
}

function hintPlacementMap(hint) {
  const map = new Map();
  for (const action of hint?.actions || []) {
    if (action.type === "place") {
      map.set(action.index, action.value);
    }
  }
  return map;
}

function hintEliminationMap(hint) {
  const map = new Map();
  for (const action of hint?.eliminations || []) {
    map.set(action.index, new Set(action.candidates || []));
  }
  return map;
}

function hintStructureSet(hint) {
  return new Set((hint?.cells || []).map((cell) => cell.index));
}

function hintCandidateSet(hint) {
  return new Set(hint?.candidates || []);
}

// Mirrors FreeBasic BackColor(1 To 14). Index 0 is intentionally unused.
const FB_BACK_COLORS = [
  null,
  "#3FDA65",
  "#7FBBFF",
  "#D8B2FF",
  "#C5E88E",
  "#FFCBCB",
  "#B2DFDF",
  "#FCDCA5",
  "#F7A5A7",
  "#FFFF00",
  "#FFA500",
  "#FF7684",
  "#EB0000",
  "#FA8072",
  "#FA8072",
];

// Exact whole-cell colors used by the FB project's Exocet CellBack layer.
// PatternGame.inc: PenA=#FFC059, PenB=#B1A5F3, PenC=#F7A5A7,
// PenD=#86E8D0, PenE=#86F280.  Keep this separate from FB_BACK_COLORS:
// the latter is the candidate-level bkclr palette shared by other techniques.
const FB_EXOCET_CELL_COLORS = Object.freeze({
  1: "#86E8D0", // PenD: Cross cells
  4: "#FFC059", // PenA: first Base
  5: "#B1A5F3", // PenB: first Targets
  6: "#F7A5A7", // PenC: second Base / Weak Exocet Y-lock
  7: "#86F280", // PenE: second Targets
  8: "#86F280", // PenE: Weak Exocet weak seat
});

const FB_TEXT_COLORS = [
  null,
  "#053b18",
  "#043c6f",
  "#4a1d6f",
  "#365314",
  "#7a0012",
  "#064e3b",
  "#7c2d12",
  "#7a0012",
  "#713f12",
  "#7c2d12",
  "#7a0012",
  "#ffffff",
  "#7a0012",
  "#7a0012",
];

function colorCandidateMapForCell(hint, index, suppressedStructuralColor = 0) {
  const result = new Map();
  for (const item of hint?.colorCands || []) {
    if (Number(item?.index) !== index) continue;
    const color = Number(item?.color || item?.colorIndex || 0);
    if (!Number.isInteger(color) || color < 1 || color > 14) continue;
    // When a JE role is represented by an FB-style whole-cell background,
    // suppress every role-level candidate fill in that cell.  This also
    // neutralizes stale Double-JE payloads that used 4/5/6 for the second
    // Base/Target/Cross instead of FB's 6/7/1 mapping.
    if (suppressedStructuralColor && EXOCET_STRUCTURAL_CELL_COLORS.has(color)) continue;
    for (const digit of item?.candidates || []) {
      const parsed = Number(digit);
      if (parsed < 1 || parsed > 9) continue;

      // V432: AF / EdoFin auxiliary colors 13/14 are not normal bkclr fills.
      // They are outline-only ellipses.  Keep them separate from normal
      // candidate background colors so a candidate can show both:
      //   normal bkclr 1..12 + AF outline 13/14.
      const mark = result.get(parsed) || { baseColor: null, afCoverRow: false, afCoverCol: false };
      if (color === 13) {
        mark.afCoverRow = true;   // horizontal ellipse / row-cover direction
      } else if (color === 14) {
        mark.afCoverCol = true;   // vertical ellipse / column-cover direction
      } else {
        // The backend owns normal candidate-level classification.  If duplicate
        // normal entries ever exist, the later backend entry wins, matching the
        // FreeBasic pc(nc)=bkclr(...) sequence.
        mark.baseColor = color;
      }
      result.set(parsed, mark);
    }
  }
  return result;
}

function hasColorCandidateData(hint) {
  return Array.isArray(hint?.colorCands) && hint.colorCands.length > 0;
}

const EXOCET_STRUCTURAL_CELL_COLORS = new Set([1, 4, 5, 6, 7, 8]);

function isExocetStructureHint(hint) {
  if (!hint?.valid) return false;
  const key = `${hint.kind || ""} ${hint.title || ""}`.toLowerCase();
  return hint.kind === "JE"
    || hint.kind === "WeakExocet"
    || /(?:jexocet|exocet|almost\s+je4)/.test(key);
}

function groupCellIndexes(group) {
  const result = [];
  for (const cell of group?.cells || []) {
    const index = Number(typeof cell === "number" ? cell : cell?.index);
    if (Number.isInteger(index) && index >= 0 && index < 81) result.push(index);
  }
  return result;
}

function parseCellNotationSet(text) {
  const result = new Set();
  const source = String(text || "");
  const pattern = /r([1-9]+)c([1-9]+)/gi;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    for (const rch of match[1]) {
      for (const cch of match[2]) {
        const row = Number(rch) - 1;
        const col = Number(cch) - 1;
        const index = row * 9 + col;
        if (row >= 0 && row < 9 && col >= 0 && col < 9) result.add(index);
      }
    }
  }
  return result;
}

function describedJuniorExocetRoles(hint) {
  const roles = [];
  const description = String(hint?.description || "");
  const pattern = /(?:Double JE\s*-\s*second\s+)?Junior Exocet\s*:\s*Base Cells-([^;\n]+);\s*Target Cells-([^;\n]+);\s*Cross Cells-([^\n]+)/gi;
  let match;
  while ((match = pattern.exec(description)) !== null) {
    roles.push({
      base: parseCellNotationSet(match[1]),
      targets: parseCellNotationSet(match[2]),
      cross: parseCellNotationSet(match[3].split(/\s*=>/)[0]),
    });
  }
  return roles;
}

function colorCandidateRoleCells(hint) {
  const byColor = new Map();
  for (const item of hint?.colorCands || []) {
    const color = Number(item?.color ?? item?.colorIndex ?? 0);
    const index = Number(item?.index);
    if (!EXOCET_STRUCTURAL_CELL_COLORS.has(color)) continue;
    if (!Number.isInteger(index) || index < 0 || index >= 81) continue;
    if (!byColor.has(color)) byColor.set(color, new Set());
    byColor.get(color).add(index);
  }
  return byColor;
}

function exocetCellColorMap(hint) {
  const result = new Map();
  if (!isExocetStructureHint(hint)) return result;

  const roleCells = colorCandidateRoleCells(hint);
  const groups = Array.isArray(hint?.groups) ? hint.groups : [];
  const hasBackendRoleColors = roleCells.size > 0;

  const setGroupColor = (group, color, activeOnly = false) => {
    const active = roleCells.get(color);
    for (const index of groupCellIndexes(group)) {
      if (activeOnly && hasBackendRoleColors && !active?.has(index)) continue;
      result.set(index, color);
    }
  };

  // FB Hint.CBK paints cross cells first, then role-specific cells.  Applying
  // the same order lets targets/base cells override a cross background when a
  // Senior/Mutant geometry overlaps the cross structure.
  for (const group of groups) {
    const label = String(group?.label || "").trim().toLowerCase();
    if (/^cross(?:\b|\s|:)/.test(label)) setGroupColor(group, 1, false);
  }
  for (const group of groups) {
    const label = String(group?.label || "").trim().toLowerCase();
    if (/^targets?\s*b(?:\b|\s|:)/.test(label)) {
      setGroupColor(group, 7, true);
    } else if (/^targets?(?:\s+[aqr])?(?:\b|\s|:)/.test(label)) {
      setGroupColor(group, 5, true);
    }
  }
  for (const group of groups) {
    const label = String(group?.label || "").trim().toLowerCase();
    if (/^base\s*b(?:\b|\s|:)/.test(label)) {
      setGroupColor(group, 6, false);
    } else if (/^base(?:\s+a)?(?:\b|\s|:)/.test(label)) {
      setGroupColor(group, 4, false);
    }
  }
  for (const group of groups) {
    const label = String(group?.label || "").trim().toLowerCase();
    if (/weak\s*seat|weak\s*cell/.test(label)) setGroupColor(group, 8, false);
  }

  // Compatibility recovery for older Double-JE WASM payloads.  They returned
  // only the primary StepGroups and encoded the second JE with the wrong
  // candidate palette (Base/Target/Cross = 4/5/6).  The backend description is
  // structured and stable, so recover both JE2 geometries here; a freshly
  // rebuilt backend supplies equivalent groups directly.
  const described = describedJuniorExocetRoles(hint);
  const setDescribed = (cells, color, activeOnly = false) => {
    for (const index of cells || []) {
      if (activeOnly && hasBackendRoleColors) {
        let active = false;
        for (const roleColor of EXOCET_STRUCTURAL_CELL_COLORS) {
          if (roleCells.get(roleColor)?.has(index)) { active = true; break; }
        }
        if (!active) continue;
      }
      result.set(index, color);
    }
  };
  if (described.length > 0) {
    setDescribed(described[0].cross, 1, false);
    setDescribed(described[0].targets, 5, true);
    setDescribed(described[0].base, 4, false);
  }
  if (described.length > 1) {
    setDescribed(described[1].cross, 1, false);
    setDescribed(described[1].targets, 7, true);
    setDescribed(described[1].base, 6, false);
  }

  // Weak Exocet's two Y-lock cells are penc in FB but are not represented by a
  // dedicated StepGroup.  Preserve them from backend color 6.
  if (hint?.kind === "WeakExocet") {
    for (const index of roleCells.get(6) || []) {
      if (!result.has(index)) result.set(index, 6);
    }
  }

  return result;
}

function applySolverCellColor(node, color) {
  if (!node || !Number.isInteger(color) || color < 1 || color > 12) return;
  node.classList.add("solver-cell-bkclr", `solver-cell-bkclr-${color}`);
  node.dataset.solverCellColor = String(color);
  node.style.setProperty("--solver-cell-bg", FB_EXOCET_CELL_COLORS[color] || FB_BACK_COLORS[color] || "#eef5ff");
}

function avoidableRectangleValueHighlightClass(hint, cell, value, structureCells = null) {
  // Avoidable Rectangle contains solved corner cells.  Candidate-only
  // highlighting misses those corners, so color the solved/given value when
  // it belongs to the structured rectangle and is one of the AR base digits.
  // Use structured StepResult data (kind/cells/candidates), not description text.
  if (hint?.kind !== "AvoidableRectangle") return "";
  const index = Number(cell?.index);
  if (!Number.isInteger(index) || index < 0 || index >= 81) return "";
  const digit = Number(value || 0);
  if (!Number.isInteger(digit) || digit < 1 || digit > 9) return "";

  const structure = structureCells || hintStructureSet(hint);
  if (!structure.has(index)) return "";

  const baseDigits = hintCandidateSet(hint);
  return baseDigits.has(digit) ? "focus" : "";
}

function isGiven(index, value) {
  const givensText = snapshotGivensString(currentSnapshot);
  return value > 0 && givensText[index] >= "1" && givensText[index] <= "9";
}

function isFixedCell(index) {
  const givensText = snapshotGivensString(currentSnapshot);
  return givensText[index] >= "1" && givensText[index] <= "9";
}

function makeCellClass(index, hint) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const classes = ["sudoku-cell"];
  if (col % 3 === 0) classes.push("box-left");
  if (row % 3 === 0) classes.push("box-top");
  if (col === 8) classes.push("box-right");
  if (row === 8) classes.push("box-bottom");
  if ((hint?.cells || []).some((cell) => cell.index === index)) classes.push("hint-structure");
  if ((hint?.actions || []).some((action) => action.index === index)) classes.push("hint-place");
  if ((hint?.eliminations || []).some((action) => action.index === index)) classes.push("hint-eliminate");
  if (index === selectedIndex) classes.push("selected");
  return classes.join(" ");
}

function renderValue(value, className) {
  const node = document.createElement("div");
  node.className = `cell-value ${className}`;
  node.textContent = value;
  return node;
}

function renderCandidates(candidates, removals, focus = null, colorMap = null) {
  const grid = document.createElement("div");
  grid.className = "candidate-grid";
  const set = new Set(candidates || []);
  for (let digit = 1; digit <= 9; digit += 1) {
    const item = document.createElement("span");
    item.className = "candidate";
    item.dataset.digit = String(digit);
    tlgDiagramRenderer.applyCandidateLayoutStyle(item, digit);
    if (set.has(digit)) {
      item.textContent = digit;
      const fbMark = colorMap instanceof Map ? colorMap.get(digit) : null;
      const fbColor = typeof fbMark === "number" ? fbMark : Number(fbMark?.baseColor || 0);
      const hasAfRowCover = typeof fbMark === "object" && fbMark?.afCoverRow === true;
      const hasAfColCover = typeof fbMark === "object" && fbMark?.afCoverCol === true;

      if (fbColor >= 1 && fbColor <= 12) {
        item.classList.add("bkclr", `bkclr-${fbColor}`);
        item.dataset.color = String(fbColor);
        item.style.setProperty("--bkclr-bg", FB_BACK_COLORS[fbColor] || "#30d45f");
        item.style.setProperty("--bkclr-text", FB_TEXT_COLORS[fbColor] || "#111827");
      }

      if (hasAfRowCover || hasAfColCover) {
        item.classList.add(AF_CHAIN_AUX_CLASS);
        item.dataset.afOutline = hasAfRowCover && hasAfColCover ? "row-col" : (hasAfRowCover ? "row" : "col");
        if (hasAfRowCover) item.classList.add(AF_CHAIN_AUX_ROW_COVER_CLASS);
        if (hasAfColCover) item.classList.add(AF_CHAIN_AUX_COL_COVER_CLASS);
      }

      if (!(fbColor >= 1 && fbColor <= 12) && !hasAfRowCover && !hasAfColCover) {
        if (removals?.has(digit)) {
          item.classList.add("remove");
        } else if (focus?.has(digit)) {
          item.classList.add("focus");
        }
      }
    }
    grid.appendChild(item);
  }
  return grid;
}

function renderBoardSnapshot(snapshot, hint = currentHint) {
  // Do not blend solver/step highlights into the dedicated TLG editing view.
  const tlgDiagramActive = tlgSolverEditingActive();
  if (tlgDiagramActive) hint = null;
  snapshot = tlgSolverEffectiveSnapshot(snapshot);
  tlgDiagramRenderer.prepare({
    enabled: tlgDiagramActive,
    snapshot,
    state: tlgDiagramRenderState(),
  });
  board.replaceChildren();

  if (!snapshot) {
    clearRenderedChainOverlay();
    boardMeta.textContent = "";
    clearManualChainEndpointHighlights();
    clearManualMarkOverlay();
    clearYzfBranchContext({ preserveHint: false });
    setYzfHintBaseText(ui("waitingWasm"));
    renderStepExplanation(null, null);
    invalidateManualScreenshotDomCache();
    return;
  }

  const placements = hintPlacementMap(hint);
  const eliminations = hintEliminationMap(hint);
  const isChainHint = stepResultHasRenderableChain(hint);
  const structure = hintStructureSet(hint);
  const solverCellColors = exocetCellColorMap(hint);
  const cells = snapshot.cells || [];
  const filled = [...snapshot.board].filter((ch) => ch >= "1" && ch <= "9").length;
  const revision = snapshot.revision ?? snapshot.version ?? 0;
  const hashText = snapshot.stateHash ? `, hash=${String(snapshot.stateHash).slice(0, 8)}` : "";
  boardMeta.textContent = `revision=${revision}, filled=${filled}/81${hashText}`;

  for (let index = 0; index < 81; index += 1) {
    const cell = cells[index] || { value: 0, candidates: [] };
    const node = document.createElement("div");
    node.className = makeCellClass(index, hint);
    node.dataset.cellIndex = String(index);
    const solverCellColor = Number(solverCellColors.get(index) || 0);
    if (isExocetStructureHint(hint)) node.classList.remove("hint-structure");
    applySolverCellColor(node, solverCellColor);
    // FB-aligned 17-track grid: odd tracks are equal cell content areas;
    // even tracks are independently sized normal/box lines.
    node.style.gridColumn = String((index % 9) * 2 + 1);
    node.style.gridRow = String(Math.floor(index / 9) * 2 + 1);
    node.title = `r${Math.floor(index / 9) + 1}c${(index % 9) + 1}`;
    node.addEventListener("pointerdown", (event) => {
      node.dataset.boardPointerType = event.pointerType || "";
      setBoardPointerMode(event.pointerType || "");
    }, { passive: true });
    installManualMarkLongPress(
      node,
      () => !tlgSolverEditingActive() && manualMarksActive() && manualMarkModeValue() === "cellColor",
      () => {
        selectedIndex = index;
        applyManualMarkTarget(index, 0, "secondary");
      },
      `cell:${index}`
    );
    node.addEventListener("click", (event) => {
      if (handleTlgSolverCellClick(index, event)) return;
      selectedIndex = index;
      if (boardEventUsesMouse(event, node)) {
        if (manualMarksActive()) {
          if (manualMarkModeValue() === "cellColor") {
            applyManualMarkTarget(index, 0, "mousePrimary");
          } else {
            renderBoardSnapshot(currentSnapshot, currentHint);
            setManualMarkStatus(uif("markCellSelected", { cell: manualMarkCellText(index) }));
          }
          return;
        }
        const currentCell = currentSnapshot?.cells?.[index];
        if (currentCell?.value > 0) {
          if (isFixedCell(index)) {
            renderBoardSnapshot(currentSnapshot, currentHint);
            setStatus(ui("fixedCell"));
          } else {
            refreshAfterEdit(engine.set_value_json(index, 0));
          }
        } else {
          renderBoardSnapshot(currentSnapshot, currentHint);
        }
        return;
      }
      handleCellTap(index);
    });
    node.addEventListener("contextmenu", (event) => {
      if (tlgSolverEditingActive()) {
        consumeTlgSolverFixedCellEvent(event);
        closeTlgSolverContextMenu();
        return;
      }
      if (!boardEventUsesMouse(event, node)) return;
      if (manualMarksActive()) {
        event.preventDefault();
        selectedIndex = index;
        if (manualMarkModeValue() === "cellColor") {
          applyManualMarkTarget(index, 0, "mouseSecondary");
        } else {
          renderBoardSnapshot(currentSnapshot, currentHint);
          setManualMarkStatus(uif("markCellSelected", { cell: manualMarkCellText(index) }));
        }
        return;
      }
      event.preventDefault();
    });

    if (placements.has(index)) {
      node.appendChild(renderCandidates(
        cell.candidates?.length ? cell.candidates : [placements.get(index)],
        null,
        new Set([placements.get(index)])
      ));
    } else if (cell.value > 0) {
      const valueClasses = [isGiven(index, cell.value) ? "given" : "solved"];
      const structureValueClass = avoidableRectangleValueHighlightClass(hint, { ...cell, index }, cell.value, structure);
      if (structureValueClass) valueClasses.push(structureValueClass);
      node.appendChild(renderValue(cell.value, valueClasses.join(" ")));
    } else {
      const colorMap = hasColorCandidateData(hint)
        ? colorCandidateMapForCell(hint, index, solverCellColor)
        : null;
      node.appendChild(renderCandidates(
        cell.candidates,
        eliminations.get(index),
        null,
        colorMap
      ));
    }

    applyManualMarksToCellElement(node, index);
    attachManualMarkCandidateHandlers(node, index);
    board.appendChild(node);
  }
  applyManualChainEndpointHighlights();
  renderManualMarkOverlay();

  if (hint?.valid) {
    setYzfHintBaseText(formatHintDesc(hint));
    renderStepExplanation(hint, snapshot);
    if (isChainHint) {
      setYzfOverlayModeNote("default solver result");
      renderChainOverlay(normalizeDefaultSolverStepResult(hint, snapshot.board || "", hint));
    } else {
      setYzfOverlayModeNote("");
      clearRenderedChainOverlay();
    }
  } else {
    clearYzfBranchContext({ preserveHint: false });
    renderYzfBranchHintPanel();
    renderStepExplanation(null, snapshot);
    setYzfOverlayModeNote("");
    clearRenderedChainOverlay();
  }

  if (tlgDiagramActive) {
    tlgDiagramRenderer.render();
  }

  // Solver overlay rendering may touch candidate classes for chain hints.
  // Re-apply manual-chain endpoint classes last so the user's hand-drawn
  // start/end markers remain visible and are not masked by solver highlights.
  applyManualChainEndpointHighlights();
  syncMobileSolveDigitHighlights();
  syncMobileSolveCompletedDigitButtons();
  invalidateManualScreenshotDomCache();
}

function clearStepViewState(options = {}) {
  const {
    resetSelectedIndex = false,
    clearSolveTree = true,
    clearAllStepsTree = true,
    clearHint = true,
  } = options;

  if (clearHint) {
    currentHint = null;
  }
  previewSnapshotActive = false;
  currentPreviewRecord = null;
  lastSolveData = null;
  lastAllStepsData = null;

  if (resetSelectedIndex) {
    selectedIndex = -1;
  }
  if (clearSolveTree) {
    tree.replaceChildren();
  }
  if (clearAllStepsTree) {
    allStepsTree?.replaceChildren();
  }

  clearBranchState();
}

function applySnapshotRefreshState(nextSnapshot = null) {
  currentSnapshot = nextSnapshot || getCurrentSnapshot();
  clearStepViewState();
    renderBoardSnapshot(currentSnapshot, null);
  updateInputControls();
  scheduleAppSessionSave();
}

function resetBoardContextForSnapshot(nextSnapshot = null, options = {}) {
  currentSnapshot = nextSnapshot || getCurrentSnapshot();
  mobileSolvePuzzleBaselineSignature = mobileSolveSnapshotSignature(currentSnapshot);
  clearStepViewState(options);
  renderBoardSnapshot(currentSnapshot, null);
  scheduleAppSessionSave();
}

function refreshAfterEdit(responseText) {
  const result = parseJson(responseText);
  if (!result?.ok) {
    setStatus(result?.error || ui("operationFailed"));
    renderBoardSnapshot(currentSnapshot, currentHint);
    return false;
  }
  applySnapshotRefreshState(result.state);
  return true;
}

function refreshAfterHistory(responseText, changedText, emptyText) {
  const result = parseJson(responseText);
  if (!result?.ok) {
    setStatus(result?.error || ui("operationFailed"));
    return false;
  }
  if (!result.changed) {
    setStatus(result.description || emptyText);
    return false;
  }

  applySnapshotRefreshState(result.state);
  setStatus(changedText);
  return true;
}

function handleValueTap(index) {
  if (tlgSolverEditingActive()) return;
  if (isFixedCell(index)) {
    renderBoardSnapshot(currentSnapshot, currentHint);
    setStatus(ui("fixedCell"));
    return;
  }

  const cell = currentSnapshot?.cells?.[index];
  const currentValue = cell?.value || 0;
  const nextValue = currentValue === selectedDigit ? 0 : selectedDigit;
  const result = engine.set_value_json(index, nextValue);
  refreshAfterEdit(result);
}

function handleCandidateTap(index) {
  if (tlgSolverEditingActive()) return;
  if (isFixedCell(index)) {
    renderBoardSnapshot(currentSnapshot, currentHint);
    setStatus(ui("fixedCandidate"));
    return;
  }

  const cell = currentSnapshot?.cells?.[index];
  if (cell?.value > 0) {
    renderBoardSnapshot(currentSnapshot, currentHint);
    setStatus(ui("solvedCandidate"));
    return;
  }

  const result = engine.toggle_candidate_json(index, selectedDigit);
  refreshAfterEdit(result);
}

function handleCellTap(index) {
  if (tlgSolverEditingActive()) return;
  if (!engine || !currentSnapshot) {
    renderBoardSnapshot(currentSnapshot, currentHint);
    return;
  }
  if (manualMarksActive()) {
    if (manualMarkModeValue() === "cellColor") {
      applyManualMarkTarget(index, 0, manualMarkButton);
    } else {
      selectedIndex = index;
      renderBoardSnapshot(currentSnapshot, currentHint);
      setManualMarkStatus(uif("markCellSelected", { cell: manualMarkCellText(index) }));
    }
    return;
  }
  if (inputMode === "candidate") {
    handleCandidateTap(index);
  } else {
    handleValueTap(index);
  }
}

function buildNumpad() {
  numpad.replaceChildren();
  for (let digit = 1; digit <= 9; digit += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = digit;
    button.dataset.digit = String(digit);
    const applyNumpadDigit = () => {
      selectedDigit = digit;
      if (manualMarksActive() && manualMarkNeedsDigit() && selectedIndex >= 0) {
        applyManualMarkTarget(selectedIndex, digit, manualMarkButton);
      }
      updateInputControls();
    };
    button.addEventListener("click", applyNumpadDigit);
    installManualMarkProtectedTouch(
      button,
      () => manualMarksActive() && manualMarkTouchEraseCandidateMode() && selectedIndex >= 0,
      applyNumpadDigit,
      () => {
        selectedDigit = digit;
        applyManualMarkTarget(selectedIndex, digit, "secondary");
        updateInputControls();
      },
      `numpad:${digit}`
    );
    numpad.appendChild(button);
  }
  const mode = document.createElement("button");
  mode.type = "button";
  mode.className = "mode-toggle";
  mode.addEventListener("click", () => {
    inputMode = inputMode === "candidate" ? "value" : "candidate";
    updateInputControls();
  });
  numpad.appendChild(mode);

  updateInputControls();
}

function updateInputControls() {
  numpad.classList.toggle("candidate-mode", inputMode === "candidate");
  numpad.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.digit) === selectedDigit);
    if (button.dataset.digit) {
      button.title = `${ui("chooseDigit")} ${button.dataset.digit}`;
    }
  });
  const modeButton = numpad.querySelector(".mode-toggle");
  if (modeButton) {
    modeButton.textContent = inputMode === "candidate" ? ui("candidateMode") : ui("valueMode");
    modeButton.classList.toggle("active", inputMode === "candidate");
    modeButton.title = ui("inputModeTitle");
  }
  numpad.title = `${ui("currentInput")}: ${inputMode === "candidate" ? ui("candidateMode") : ui("valueMode")} ${selectedDigit}. ${ui("inputModeTitle")}`;
  updateMobileSolveInputState();
  syncMobileSolveDigitHighlights();
  syncMobileSolveCompletedDigitButtons();
}

function loadTechniqueState() {
  if (!engine) return [];
  const result = parseJson(engine.techniques_json());
  whipMemoryMode = normalizeWhipMemoryMode(result?.whipMemoryMode || whipMemoryMode);
  if (typeof result?.whipCompareGWhip === "boolean") {
    whipCompareGWhip = result.whipCompareGWhip;
  }
  techniqueState = mergeReferenceTechniques(result?.techniques || []);
  return techniqueState;
}

function normalizeWhipMemoryMode(value) {
  return ["auto", "normal", "large"].includes(value) ? value : "auto";
}

function getTechniqueConfigPayload(state = techniqueState) {
  const payload = {
    whipMemoryMode: normalizeWhipMemoryMode(whipMemoryMode),
    whipCompareGWhip: Boolean(whipCompareGWhip),
  };
  for (const item of (state || []).filter((tech) => tech.implemented !== false)) {
    payload[item.kind] = Boolean(item.enabled);
    if (item.kind === "ComplexAIC") {
      payload.ComplexAICWithAMSLS = Boolean(item.withAMSLS);
    }
    if (item.kind === "JE") {
      payload.JEWithJEPOM = Boolean(item.withJEPOM);
    }
  }
  return payload;
}

function applyTechniqueState(
  nextState,
  nextWhipMemoryMode = whipMemoryMode,
  nextWhipCompareGWhip = whipCompareGWhip
) {
  if (!engine) return;
  whipMemoryMode = normalizeWhipMemoryMode(nextWhipMemoryMode);
  whipCompareGWhip = Boolean(nextWhipCompareGWhip);
  const payload = getTechniqueConfigPayload(nextState);
  const result = parseJson(engine.set_techniques_json(JSON.stringify(payload)));
  if (typeof result?.whipCompareGWhip === "boolean") {
    whipCompareGWhip = result.whipCompareGWhip;
  }
  techniqueState = mergeReferenceTechniques(result?.techniques || nextState, nextState);
  currentHint = null;
  renderTechniques();
  renderBoardSnapshot(currentSnapshot, null);
  setStatus(ui("optionsUpdated"));
  scheduleAppSessionSave();
}

function getSolverWorker() {
  if (window.YZF_STANDALONE) return null;
  if (typeof Worker === "undefined") return null;
  if (!solverWorker) {
    solverWorker = new Worker(`./solver-worker.js?v=${APP_VERSION}`, { type: "module" });
    solverWorker.addEventListener("message", (event) => {
      const message = event.data || {};
      const pending = solverWorkerRequests.get(message.requestId);
      if (!pending) return;
      solverWorkerRequests.delete(message.requestId);
      if (message.type === "result") {
        pending.resolve(message);
      } else {
        pending.reject(new Error(message.error || ui("workerTaskFailed")));
      }
    });
    solverWorker.addEventListener("error", (event) => {
      for (const pending of solverWorkerRequests.values()) {
        pending.reject(new Error(event.message || ui("workerTaskFailed")));
      }
      solverWorkerRequests.clear();
      solverWorker = null;
    });
  }
  return solverWorker;
}

function setSolverBusy(task, busy) {
  solverBusyTask = busy ? task : "";
  if (btnSolve) {
    btnSolve.disabled = busy;
    const label = btnSolve.querySelector(".action-label");
    if (label) label.textContent = busy && task === "solve" ? ui("solveBusy") : ui("solve");
    btnSolve.setAttribute("aria-busy", busy && task === "solve" ? "true" : "false");
  }
  if (btnAllSteps) {
    btnAllSteps.disabled = busy;
    const label = btnAllSteps.querySelector(".action-label");
    if (label) label.textContent = busy && task === "findall" ? ui("findAllBusy") : ui("allSteps");
    btnAllSteps.setAttribute("aria-busy", busy && task === "findall" ? "true" : "false");
  }
}

async function runSolverWorkerTask(task, payload) {
  const worker = getSolverWorker();
  if (!worker) {
    if (!engine) {
      throw new Error(ui("wasmLoadFailed"));
    }
    const startedAt = performance.now();
    const techniqueConfig = getTechniqueConfigPayload(techniqueState.length ? techniqueState : loadTechniqueState());
    if (typeof engine.set_techniques_json === "function") {
      engine.set_techniques_json(JSON.stringify(techniqueConfig));
    }
    let resultText = "";
    if (task === "solve") {
      resultText = engine.solve_path_for_import_json(
        String(payload?.snapshotLibrary || ""),
        Number(payload?.maxSteps || 500)
      );
    } else if (task === "findall") {
      resultText = engine.all_steps_for_import_json(
        String(payload?.snapshotLibrary || ""),
        Number(payload?.sourceStepIndex || 0)
      );
    } else if (task === "tlg") {
      if (typeof engine.tlgSolverFindEliminationsV440 !== "function") {
        throw new Error(ui("tlgUnavailable"));
      }
      resultText = engine.tlgSolverFindEliminationsV440(String(payload?.requestJson || ""));
    } else {
      throw new Error(ui("workerUnsupported"));
    }
    return { type: "result", resultText, elapsedMs: performance.now() - startedAt, fallback: true };
  }
  const requestId = ++solverTaskSeq;
  return new Promise((resolve, reject) => {
    solverWorkerRequests.set(requestId, { resolve, reject });
    worker.postMessage({
      type: task,
      requestId,
      techniqueConfig: getTechniqueConfigPayload(techniqueState.length ? techniqueState : loadTechniqueState()),
      ...payload,
    });
  });
}


function setRatingBusy(busy) {
  if (!btnRate) return;
  setButtonText(btnRate, busy ? ui("rateCancel") : ui("ratePuzzle"));
  btnRate.setAttribute("aria-busy", busy ? "true" : "false");
  btnRate.dataset.ratingBusy = busy ? "true" : "false";
}

function finishRatingTask(task, { cancelled = false } = {}) {
  if (!task || ratingTask !== task) return;
  if (task.timer) window.clearInterval(task.timer);
  if (ratingWorker) {
    ratingWorker.terminate();
    ratingWorker = null;
  }
  ratingTask = null;
  setRatingBusy(false);
  if (cancelled) setStatus(ui("rateCancelled"));
}

function cancelRatingTask() {
  if (!ratingTask) return false;
  const task = ratingTask;
  const reject = task.reject;
  finishRatingTask(task, { cancelled: true });
  if (typeof reject === "function") reject(new Error("rating_cancelled"));
  return true;
}

async function runRatingTask(input, fallbackPuzzle) {
  const canUseWorker = !window.YZF_STANDALONE && typeof Worker !== "undefined";
  if (!canUseWorker) {
    setRatingBusy(true);
    setStatus(ui("rateForegroundFallback"));
    // Let the warning paint before entering the synchronous WASM call.
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    try {
      const startedAt = performance.now();
      const resultText = typeof engine.rate_import_text_json === "function"
        ? engine.rate_import_text_json(input)
        : engine.rate_puzzle_json(fallbackPuzzle);
      return { resultText, elapsedMs: performance.now() - startedAt, fallback: true };
    } finally {
      setRatingBusy(false);
    }
  }

  const task = {
    id: ++ratingTaskSeq,
    startedAt: performance.now(),
    timer: 0,
  };
  ratingTask = task;
  setRatingBusy(true);
  setStatus(ui("rateStarting"));
  task.timer = window.setInterval(() => {
    if (ratingTask !== task) return;
    const seconds = Math.max(0, Math.floor((performance.now() - task.startedAt) / 1000));
    setYzfHintBaseText(uif("rateRunning", { seconds }));
  }, 1000);

  return new Promise((resolve, reject) => {
    task.reject = reject;
    const worker = new Worker(`./rating-worker.js?v=${APP_VERSION}`, { type: "module" });
    ratingWorker = worker;
    worker.addEventListener("message", (event) => {
      const message = event.data || {};
      if (ratingTask !== task || message.requestId !== task.id) return;
      if (message.type === "started") return;
      finishRatingTask(task);
      if (message.type === "result") {
        resolve(message);
      } else {
        reject(new Error(message.error || ui("workerTaskFailed")));
      }
    });
    worker.addEventListener("error", (event) => {
      if (ratingTask !== task) return;
      finishRatingTask(task);
      reject(new Error(event.message || ui("workerTaskFailed")));
    });
    worker.postMessage({
      type: "rate",
      requestId: task.id,
      input,
      fallbackPuzzle,
    });
  });
}

function mergeReferenceTechniques(engineTechniques, previousState = techniqueState) {
  const previousByKind = new Map(previousState.map((item) => [item.kind, item]));
  const engineByKind = new Map((engineTechniques || []).map((item) => [item.kind, item]));
  const merged = REF_TECHNIQUES.map((ref) => {
    const engineItem = engineByKind.get(ref.kind);
    const previous = previousByKind.get(ref.kind);
    return {
      ...ref,
      ...(previous || {}),
      ...(engineItem || {}),
      title: engineItem?.title || ref.title,
      category: engineItem?.category || ref.category,
      score: engineItem?.score ?? ref.score,
      difficulty: engineItem?.difficulty ?? ref.difficulty,
      enabled: engineItem ? Boolean(engineItem.enabled) : Boolean(previous?.enabled),
      withAMSLS: engineItem?.withAMSLS ?? previous?.withAMSLS ?? false,
      withJEPOM: engineItem?.withJEPOM ?? previous?.withJEPOM ?? false,
      implemented: Boolean(engineItem),
    };
  });

  for (const item of engineTechniques || []) {
    if (!REF_TECHNIQUES.some((ref) => ref.kind === item.kind)) {
      merged.push({ ...item, order: merged.length, implemented: true, category: item.category || "Other" });
    }
  }
  return merged;
}

function renderTrainingTechniqueOptionsOnly() {
  if (!trainingTechniqueSelect) return;
  const state = techniqueState.length ? techniqueState : loadTechniqueState();
  const previous = trainingTechniqueSelect.value;
  trainingTechniqueSelect.replaceChildren();
  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = ui("noTrainingTechnique");
  noneOption.style.backgroundColor = "#fff";
  noneOption.style.color = "#1d2430";
  trainingTechniqueSelect.appendChild(noneOption);
  for (const item of state.filter((tech) => tech.implemented !== false)) {
    const option = document.createElement("option");
    option.value = item.kind;
    option.textContent = `${techniqueName(item)} (${item.difficulty})`;
    option.style.backgroundColor = techniqueBackgroundColor(item.kind);
    option.style.color = "#1d2430";
    trainingTechniqueSelect.appendChild(option);
  }
  if ([...trainingTechniqueSelect.options].some((option) => option.value === previous)) {
    trainingTechniqueSelect.value = previous;
  }
  updateTrainingTechniqueSelectColor();
}

function renderTechniques() {
  if (!techniqueList) return;
  const state = techniqueState.length ? techniqueState : loadTechniqueState();
  techniqueList.replaceChildren();
  renderTrainingTechniqueOptionsOnly();
  const memoryRow = document.createElement("div");
  memoryRow.className = "technique-memory-row";
  const memoryLabel = document.createElement("label");
  memoryLabel.textContent = ui("whipMemoryLabel");
  const memorySelect = document.createElement("select");
  const memoryOptions = [
    ["auto", ui("whipMemoryAuto")],
    ["normal", ui("whipMemoryNormal")],
    ["large", ui("whipMemoryLarge")],
  ];
  for (const [value, text] of memoryOptions) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    memorySelect.appendChild(option);
  }
  memorySelect.value = normalizeWhipMemoryMode(whipMemoryMode);
  memorySelect.title = ui("whipMemoryTitle");
  memorySelect.className = "technique-memory-select";
  memorySelect.addEventListener("change", () => applyTechniqueState(state, memorySelect.value, whipCompareGWhip));
  memoryLabel.appendChild(memorySelect);
  memoryLabel.className = "technique-memory-control";
  memoryRow.appendChild(memoryLabel);

  const compareLabel = document.createElement("label");
  compareLabel.className = "technique-option-check";
  compareLabel.title = ui("whipCompareGWhipTitle");
  const compareCheckbox = document.createElement("input");
  compareCheckbox.type = "checkbox";
  compareCheckbox.checked = Boolean(whipCompareGWhip);
  compareCheckbox.addEventListener("change", () => (
    applyTechniqueState(state, memorySelect.value, compareCheckbox.checked)
  ));
  const compareText = document.createElement("span");
  compareText.textContent = ui("whipCompareGWhipLabel");
  compareLabel.append(compareCheckbox, compareText);
  memoryRow.appendChild(compareLabel);
  techniqueList.appendChild(memoryRow);

  const table = document.createElement("table");
  table.className = "technique-table";
  const thead = document.createElement("thead");
  const header = document.createElement("tr");
  for (const text of [ui("techniqueHeader"), ui("scoreHeader")]) {
    const th = document.createElement("th");
    th.textContent = text;
    header.appendChild(th);
  }
  thead.appendChild(header);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const ordered = [...state].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  for (const item of ordered) {
    const row = document.createElement("tr");
    row.className = "technique-row";
    row.classList.toggle("disabled", item.implemented === false);
    row.style.backgroundColor = techniqueBackgroundColor(item.kind);
    row.title = `${categoryName(item.category || "Other")} / ${uif("difficultyLevel", { level: techniqueColorLevel(item.kind) })} / ${ui("scoreHeader")} ${item.score ?? 0}`;

    const nameCell = document.createElement("td");
    const label = document.createElement("label");
    label.className = "technique-name-cell";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(item.enabled);
    input.disabled = item.implemented === false;
    input.addEventListener("change", () => {
      const next = techniqueState.map((tech) => (
        tech.kind === item.kind ? { ...tech, enabled: input.checked } : tech
      ));
      applyTechniqueState(next);
    });

    const name = document.createElement("span");
    name.textContent = techniqueName(item);
    label.append(input, name);
    nameCell.appendChild(label);

    const addSubOption = (key, text) => {
      const subLabel = document.createElement("label");
      subLabel.className = "technique-suboption";
      const subInput = document.createElement("input");
      subInput.type = "checkbox";
      subInput.checked = Boolean(item[key]);
      subInput.disabled = item.implemented === false || !input.checked;
      subInput.addEventListener("change", () => {
        const next = techniqueState.map((tech) => (
          tech.kind === item.kind ? { ...tech, [key]: subInput.checked } : tech
        ));
        applyTechniqueState(next);
      });
      const subText = document.createElement("span");
      subText.textContent = text;
      subLabel.append(subInput, subText);
      nameCell.appendChild(subLabel);
    };
    if (item.kind === "ComplexAIC") addSubOption("withAMSLS", "with AMSLS");
    if (item.kind === "JE") addSubOption("withJEPOM", "with JEPOM");

    const scoreCell = document.createElement("td");
    scoreCell.className = "technique-score-cell";
    scoreCell.textContent = String(item.score ?? 0);

    row.append(nameCell, scoreCell);
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  techniqueList.appendChild(table);
}

function renderBoard(hint = currentHint) {
  currentSnapshot = getCurrentSnapshot();
  previewSnapshotActive = false;
  currentPreviewRecord = null;
  if (!hint) {
      }
  renderBoardSnapshot(currentSnapshot, hint);
}

function renderLeaf(label, detail, valueClass = "") {
  const item = document.createElement("li");
  item.appendChild(createTreeRow(label, detail, false, null, valueClass));
  return item;
}

function renderBranch(label, detail, children, open = true, onSelect = null, rowClass = "") {
  const item = document.createElement("li");
  const list = document.createElement("ul");
  if (!open) {
    list.className = "hidden";
  }

  for (const child of children) {
    list.appendChild(child);
  }

  item.appendChild(createTreeRow(label, detail, true, list, "", onSelect, rowClass));
  item.appendChild(list);
  return item;
}

function stepDifficultyLevel(step) {
  const ref = REF_TECHNIQUE_BY_KIND.get(step?.kind);
  if (ref?.colorLevel) return ref.colorLevel;
  return 1;
}

function techniqueColorLevel(kind) {
  return REF_TECHNIQUE_BY_KIND.get(kind)?.colorLevel || 1;
}

function techniqueBackgroundColor(kind) {
  return [
    "rgb(255, 255, 255)",
    "rgb(100, 255, 100)",
    "rgb(255, 255, 100)",
    "rgb(255, 150, 80)",
    "rgb(255, 100, 100)",
  ][techniqueColorLevel(kind) - 1] || "rgb(255, 255, 255)";
}

function normalizeTrainingTextFilter(value) {
  return {
    includeText: String(value?.includeText || "").replace(/\r\n?/g, "\n").trim(),
    excludeText: String(value?.excludeText || "").replace(/\r\n?/g, "\n").trim(),
    caseSensitive: Boolean(value?.caseSensitive),
    otp: Boolean(value?.otp),
  };
}

function trainingTextFilterLineCount(text) {
  return String(text || "").split(/\n/).map((line) => line.trim()).filter(Boolean).length;
}

function isTrainingTextFilterActive(value = trainingTextFilter) {
  const normalized = normalizeTrainingTextFilter(value);
  return Boolean(normalized.includeText || normalized.excludeText);
}

function loadTrainingTextFilter() {
  try {
    return normalizeTrainingTextFilter(JSON.parse(localStorage.getItem(TRAINING_TEXT_FILTER_STORAGE_KEY) || "null"));
  } catch {
    return normalizeTrainingTextFilter(null);
  }
}

function saveTrainingTextFilter() {
  try {
    localStorage.setItem(TRAINING_TEXT_FILTER_STORAGE_KEY, JSON.stringify(trainingTextFilter));
  } catch {
    // Optional persistence only.
  }
}

function trainingOtpEnabled() {
  return Boolean(trainingOtp?.checked);
}

function loadTrainingOtp() {
  try {
    return localStorage.getItem(TRAINING_OTP_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveTrainingOtp() {
  try {
    localStorage.setItem(TRAINING_OTP_STORAGE_KEY, trainingOtpEnabled() ? "1" : "0");
  } catch {
    // Optional persistence only.
  }
}

function isOtpEligibleTechnique(kind) {
  return Boolean(kind) && !OTP_INELIGIBLE_TECHNIQUES.has(String(kind));
}

function currentTrainingTextFilterPayload() {
  return {
    ...normalizeTrainingTextFilter(trainingTextFilter),
    otp: trainingOtpEnabled(),
  };
}

function updateTrainingTextFilterButton() {
  if (!btnTrainingTextFilter) return;
  const include = trainingTextFilterLineCount(trainingTextFilter.includeText);
  const exclude = trainingTextFilterLineCount(trainingTextFilter.excludeText);
  const active = include > 0 || exclude > 0;
  btnTrainingTextFilter.classList.toggle("active", active);
  btnTrainingTextFilter.setAttribute("aria-pressed", active ? "true" : "false");
  const title = active
    ? uif("trainingTextFilterActiveTitle", { include, exclude })
    : ui("trainingTextFilterInactiveTitle");
  btnTrainingTextFilter.title = title;
  btnTrainingTextFilter.setAttribute("aria-label", title);
}

function openTrainingTextFilterDialog() {
  if (!trainingTextFilterDialog) return;
  if (trainingTextFilterInclude) trainingTextFilterInclude.value = trainingTextFilter.includeText;
  if (trainingTextFilterExclude) trainingTextFilterExclude.value = trainingTextFilter.excludeText;
  if (trainingTextFilterCaseSensitive) trainingTextFilterCaseSensitive.checked = trainingTextFilter.caseSensitive;
  if (typeof trainingTextFilterDialog.showModal === "function") {
    trainingTextFilterDialog.showModal();
  } else {
    trainingTextFilterDialog.setAttribute("open", "");
  }
  window.setTimeout(() => trainingTextFilterInclude?.focus(), 0);
}

function closeTrainingTextFilterDialog() {
  if (!trainingTextFilterDialog) return;
  if (typeof trainingTextFilterDialog.close === "function" && trainingTextFilterDialog.open) {
    trainingTextFilterDialog.close();
  } else {
    trainingTextFilterDialog.removeAttribute("open");
  }
}

function applyTrainingTextFilterDialog() {
  trainingTextFilter = normalizeTrainingTextFilter({
    includeText: trainingTextFilterInclude?.value || "",
    excludeText: trainingTextFilterExclude?.value || "",
    caseSensitive: trainingTextFilterCaseSensitive?.checked,
  });
  saveTrainingTextFilter();
  updateTrainingTextFilterButton();
  closeTrainingTextFilterDialog();
}

trainingTextFilter = loadTrainingTextFilter();
if (trainingOtp) trainingOtp.checked = loadTrainingOtp();

function updateTrainingTechniqueSelectColor() {
  if (!trainingTechniqueSelect) return;
  trainingTechniqueSelect.style.backgroundColor = techniqueBackgroundColor(trainingTechniqueSelect.value);
}

function generateTrainingPuzzleInWorker(
  kind,
  difficulty,
  maxAttempts = 0,
  summary = false,
  textFilter = currentTrainingTextFilterPayload()
) {
  const normalizedFilter = normalizeTrainingTextFilter(textFilter);
  const filterJson = JSON.stringify(normalizedFilter);
  const filteredMethod = summary
    ? "generate_training_puzzle_summary_filtered_json"
    : "generate_training_puzzle_filtered_json";
  const legacyMethod = summary
    ? "generate_training_puzzle_summary_json"
    : "generate_training_puzzle_json";
  const otp = Boolean(normalizedFilter.otp);
  const requestKind = otp ? String(kind || "") : String(kind || "BruteForce");

  if (window.YZF_STANDALONE || !window.Worker) {
    if (!engine) {
      throw new Error(ui("wasmLoadFailed"));
    }
    if (typeof engine[filteredMethod] === "function") {
      return Promise.resolve(engine[filteredMethod](
        requestKind,
        Number(difficulty || 0),
        Number(maxAttempts || 0),
        filterJson
      ));
    }
    if (otp || isTrainingTextFilterActive(normalizedFilter) || typeof engine[legacyMethod] !== "function") {
      throw new Error(ui("trainingWorkerFailed"));
    }
    return Promise.resolve(engine[legacyMethod](requestKind, Number(difficulty || 0), Number(maxAttempts || 0)));
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(`./training-worker.js?v=${APP_VERSION}`, { type: "module" });
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      worker.terminate();
      callback(value);
    };

    worker.addEventListener("message", (event) => {
      const message = event.data || {};
      if (message.type === "result") {
        finish(resolve, message.resultText);
      } else if (message.type === "error") {
        finish(reject, new Error(message.error || ui("trainingWorkerFailed")));
      }
    });
    worker.addEventListener("error", (event) => {
      finish(reject, new Error(event.message || ui("trainingWorkerRuntimeFailed")));
    });
    worker.postMessage({ type: "generate", kind, difficulty, maxAttempts, summary, textFilter: normalizedFilter });
  });
}

function startTrainingTimer(label, { otp = false } = {}) {
  const start = Date.now();
  const key = otp ? "otpSearching" : "trainingSearching";
  setStatus(uif(key, { technique: label, elapsed: uif("seconds", { seconds: 0 }) }));
  return window.setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    setStatus(uif(key, { technique: label, elapsed: uif("seconds", { seconds: elapsed }) }));
  }, 1000);
}

function formatElapsedSeconds(startTime) {
  return uif("seconds", { seconds: Math.floor((Date.now() - startTime) / 1000) });
}

function sanitizeFilename(name) {
  const fallback = "sudoku-batch.txt";
  const cleaned = String(name || fallback).replace(/[\\/:*?"<>|]+/g, "-").trim();
  return cleaned || fallback;
}

function selectedTrainingTechniqueName() {
  const kind = trainingTechniqueSelect?.value || "";
  if (!kind) return "";
  const state = techniqueState.length ? techniqueState : loadTechniqueState();
  const item = state.find((technique) => technique.kind === kind);
  if (item) return techniqueName(item);
  return String(trainingTechniqueSelect?.selectedOptions?.[0]?.textContent || kind)
    .replace(/\s*\([^()]*\)\s*$/, "")
    .trim();
}

function trainingTechniqueNameForKind(kind) {
  const normalized = String(kind || "");
  if (!normalized) return "";
  const state = techniqueState.length ? techniqueState : loadTechniqueState();
  const item = state.find((technique) => technique.kind === normalized);
  return item ? techniqueName(item) : normalized;
}

function defaultBatchFilename() {
  if (batchMode?.value === "solve") return "sudoku-batch-solve.tsv";
  const technique = selectedTrainingTechniqueName();
  if (trainingOtpEnabled()) {
    return sanitizeFilename(technique ? `${technique}-OTP.txt` : "OTP.txt");
  }
  return technique ? sanitizeFilename(`${technique}.txt`) : "sudoku-batch.txt";
}

let batchFilenameAutoValue = "sudoku-batch.txt";

function syncBatchFilenameDefault() {
  if (!batchFilename) return;
  const current = String(batchFilename.value || "").trim();
  const userEdited = batchFilename.dataset.userEdited === "true";
  if (userEdited && current && current !== batchFilenameAutoValue) return;
  const next = defaultBatchFilename();
  batchFilename.value = next;
  batchFilenameAutoValue = next;
  batchFilename.dataset.userEdited = "false";
}

function generatedLibraryPuzzleString(puzzle) {
  const chars = [...String(puzzle || "")].filter((ch) => /[0-9.]/.test(ch));
  if (chars.length !== 81) return "";
  const normalized = chars.map((ch) => (ch === "0" ? "." : ch)).join("");
  return `:0000:x:${normalized}:::`;
}

function formatSkfrScore(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? (numeric / 10).toFixed(1) : "";
}

function generatedYzfScore(result) {
  return result?.solve?.yzfRate
    ?? result?.solve?.rating?.score
    ?? result?.yzfRate
    ?? result?.rating?.yzfRate?.score
    ?? "";
}

function batchLine(result, index) {
  return [
    index,
    generatedLibraryPuzzleString(result?.puzzle),
    generatedYzfScore(result),
    formatSkfrScore(result?.rating?.er),
  ].join("\t") + "\n";
}

function invalidStepDetail(result) {
  const invalidRecord = (result?.solve?.path || result?.path || []).find((record) => record.invalid);
  if (!invalidRecord) {
    return ui("invalidStep");
  }
  const cell = (invalidRecord.index ?? -1) >= 0
    ? `r${Math.floor(invalidRecord.index / 9) + 1}c${(invalidRecord.index % 9) + 1}`
    : "r?c?";
  return `${invalidRecord.error || ui("invalidStep")}, ${invalidRecord.action || "action"} ${cell}${invalidRecord.digit ? `=${invalidRecord.digit}` : ""}`;
}

async function stopBatchOnInvalidStep(writer, result, trainingKind) {
  if (result.solve) {
    renderSolvePath(JSON.stringify(result.solve));
  } else {
    renderSolvePath(JSON.stringify(result));
  }
  const detail = invalidStepDetail(result);
  const puzzle = result.puzzle || result.solve?.initial?.board || result.initial?.board || "";
  await writer.write(`# invalid_step\t${trainingKind || ""}\t${puzzle}\t${detail}\n`);
  updateBatchStatus(uif("batchInvalidStep", { detail }));
  console.error("batch invalid step", result);
}

async function openBatchWriter(filename) {
  if (window.showSaveFilePicker) {
    const handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [{
        description: "Text file",
        accept: { "text/plain": [".txt", ".tsv"] },
      }],
    });
    return {
      direct: true,
      write: async (chunk) => {
        const file = await handle.getFile();
        const writable = await handle.createWritable({ keepExistingData: true });
        await writable.seek(file.size);
        await writable.write(chunk);
        await writable.close();
      },
      close: async () => { },
      abort: async () => { },
    };
  }

  const chunks = [];
  return {
    direct: false,
    write: (chunk) => chunks.push(chunk),
    close: () => {
      const blob = new Blob(chunks, { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    abort: () => {
      chunks.length = 0;
    },
  };
}

function setBatchRunning(running) {
  if (btnBatchGenerate) btnBatchGenerate.disabled = running;
  if (btnBatchStop) btnBatchStop.disabled = !running;
}

function updateBatchStatus(message) {
  if (batchStatus) {
    batchStatus.textContent = message;
  }
  setStatus(message);
}

function updateBatchModeLabels() {
  if (batchMode) {
    const generateOption = batchMode.querySelector('option[value="generate"]');
    const solveOption = batchMode.querySelector('option[value="solve"]');
    if (generateOption) generateOption.textContent = ui("batchModeGenerate");
    if (solveOption) solveOption.textContent = ui("batchModeSolve");
  }
  updateBatchModeUi();
}

function updateBatchModeUi() {
  const mode = batchMode?.value || "generate";
  const solving = mode === "solve";
  if (batchSolveFile) {
    batchSolveFile.closest("label")?.classList.toggle("hidden", !solving);
  }
  syncBatchFilenameDefault();
  if (batchStatus && !batchStatus.textContent.trim()) {
    batchStatus.textContent = ui("batchStatusIdle");
  }
}

function isEditablePasteTarget(target) {
  const el = target instanceof Element ? target : target?.parentElement;
  return Boolean(el?.closest?.("input, textarea, select, [contenteditable='true'], [contenteditable='']"));
}

async function collectBatchSolveInputLinesFromFile() {
  const file = batchSolveFile?.files?.[0] || null;
  if (!file) return [];
  const raw = await file.text();
  return raw.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function batchSolveLine(result, index) {
  const rating = result.rating || {};
  return [
    index,
    result.puzzle || result.input || "",
    result.solution || "",
    result.status || "",
    result.steps ?? "",
    rating.score ?? result.yzfRate ?? "",
    rating.hardestKind || "",
    rating.hardestChainLength ?? "",
    rating.hardestRankAvailable ? (rating.hardestRank ?? "") : "",
    rating.hardestTitle || "",
    result.error || "",
  ].join("\t") + "\n";
}

function getBatchWorker() {
  if (window.YZF_STANDALONE || typeof Worker === "undefined") return null;
  if (!batchWorker) {
    batchWorker = new Worker(`./batch-worker.js?v=${APP_VERSION}`, { type: "module" });
  }
  return batchWorker;
}


function runBatchTaskInWorker(config, handlers) {
  const worker = getBatchWorker();
  if (!worker) {
    return runBatchTaskInMainEngine(config, handlers);
  }
  const taskId = ++batchTaskSeq;
  return new Promise((resolve, reject) => {
    batchWorkerActiveReject = reject;
    let itemChain = Promise.resolve();
    const cleanup = () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      if (batchWorkerActiveReject === reject) batchWorkerActiveReject = null;
    };
    const finishResolve = (value) => {
      itemChain.then(() => {
        cleanup();
        resolve(value);
      }, (error) => {
        cleanup();
        reject(error);
      });
    };
    const onMessage = (event) => {
      const message = event.data || {};
      if (message.taskId !== taskId) return;
      if (message.type === "item") {
        itemChain = itemChain.then(() => handlers.onItem?.(message.result));
      } else if (message.type === "progress") {
        handlers.onProgress?.(message);
      } else if (message.type === "invalid_step") {
        itemChain = itemChain.then(() => handlers.onInvalidStep?.(message.result));
        finishResolve({ status: "invalid_step", ...message });
      } else if (message.type === "done") {
        finishResolve(message);
      } else if (message.type === "cancelled") {
        finishResolve(message);
      } else if (message.type === "error") {
        cleanup();
        reject(new Error(message.error || ui("batchFailed")));
      }
    };
    const onError = (event) => {
      cleanup();
      reject(new Error(event.message || ui("batchFailed")));
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage({ type: "start", taskId, config });
  });
}

async function runBatchTaskInMainEngine(config, handlers) {
  if (!engine) throw new Error(ui("wasmLoadFailed"));
  const techniqueConfig = config.techniqueConfig;
  if (techniqueConfig && typeof engine.set_techniques_json === "function") {
    engine.set_techniques_json(JSON.stringify(techniqueConfig));
  }
  let generated = 0;
  let attempts = 0;
  let failed = 0;
  const puzzles = Array.isArray(config.puzzles) ? config.puzzles : [];
  const target = config.mode === "solve" ? puzzles.length : Number(config.target || 0);
  const hasFiniteTarget = config.mode === "solve" || target > 0;
  const emitProgress = () => handlers.onProgress?.({ generated, attempts, failed, target: hasFiniteTarget ? target : 0 });
  while (!batchAbortRequested && (!hasFiniteTarget || generated < target)) {
    attempts += 1;
    let result = null;
    if (config.mode === "solve") {
      const input = puzzles[generated];
      const imported = parseJson(engine.import_puzzle_json(input));
      if (!imported?.ok) {
        failed += 1;
        result = { ok: false, input, error: imported?.error || "import failed" };
      } else {
        const solve = parseJson(engine.solve_summary_json(Number(config.maxSteps || 500)));
        result = {
          ok: solve?.ok !== false,
          input,
          puzzle: imported.puzzle || imported.givens || input,
          solution: imported.solution || "",
          status: solve?.status || "unknown",
          steps: solve?.steps ?? "",
          yzfRate: solve?.yzfRate ?? "",
          rating: solve?.rating || {},
          solve,
        };
        if (solve?.status === "invalid_step") {
          result.solve = solve;
          handlers.onInvalidStep?.(result);
          return { status: "invalid_step", generated, failed, attempts, target };
        }
      }
      generated += 1;
      handlers.onItem?.(result);
    } else {
      const trainingKind = config.trainingKind || "";
      const normalizedTrainingFilter = normalizeTrainingTextFilter(config.trainingTextFilter);
      const otp = Boolean(normalizedTrainingFilter.otp || config.otp);
      const trainingMode = Boolean(trainingKind || otp);
      const filterJson = JSON.stringify({ ...normalizedTrainingFilter, otp });
      const text = trainingMode
        ? engine.generate_training_puzzle_summary_filtered_json(
            trainingKind,
            Number(config.difficulty || 0),
            Number(config.maxAttempts || 0),
            filterJson
          )
        : engine.generate_puzzle_difficulty_json(Number(config.difficulty || 0), 0);
      result = parseJson(text);
      if (result?.ok) {
        if (!trainingMode) {
          const solve = parseJson(engine.solve_summary_json(500));
          result.solve = solve;
          if (solve?.status === "invalid_step") {
            handlers.onInvalidStep?.(result);
            return { status: "invalid_step", generated, failed, attempts, target };
          }
        }
        generated += 1;
        handlers.onItem?.(result);
      } else {
        failed += 1;
        if (result?.status === "invalid_step") {
          handlers.onInvalidStep?.(result);
          return { status: "invalid_step", generated, failed, attempts, target };
        }
      }
    }
    emitProgress();
    if ((attempts & 7) === 0) await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return { status: batchAbortRequested ? "cancelled" : "done", generated, failed, attempts, target };
}

function chainNodeText(node) {
  const label = node.label ? ` ${node.label}` : "";
  const cell = Number.isInteger(node.row) && Number.isInteger(node.col)
    ? `r${node.row + 1}c${node.col + 1}`
    : `#${node.index}`;
  return `${node.id}: ${cell}${node.digit ? `=${node.digit}` : ""}${label}`;
}

function chainEdgeText(edge) {
  return `${edge.from} -> ${edge.to}${edge.type ? ` (${edge.type})` : ""}`;
}


function stepRecordBeforeHash(record) {
  return String(record?.beforeHash || record?.before?.stateHash || "");
}

function isBranchableOptionalStep(record) {
  return Boolean(
    record?.step &&
    record?.before &&
    stepRecordBeforeHash(record) &&
    lastSolveData &&
    Array.isArray(lastSolveData.path) &&
    lastSolveData.path.length > 0 &&
    findSolvePathReplacementIndex(record) >= 0
  );
}

function findSolvePathReplacementIndex(candidateRecord) {
  const path = Array.isArray(lastSolveData?.path) ? lastSolveData.path : [];
  const beforeHash = stepRecordBeforeHash(candidateRecord);
  const sourceStepIndex = Number(candidateRecord?.sourceStepIndex || 0);
  if (sourceStepIndex > 0) {
    const index = sourceStepIndex - 1;
    const pathHash = stepRecordBeforeHash(path[index]);
    if (path[index] && pathHash && pathHash === beforeHash) {
      return index;
    }
  }
  return path.findIndex((record) => stepRecordBeforeHash(record) === beforeHash);
}

function scoreForStepRecord(record) {
  return Number(record?.score ?? 0) || 0;
}

function summarizePathRating(path) {
  let score = 0;
  let hardestScore = 0;
  let hardestMetric = 0;
  let hardestRankAvailable = false;
  let hardestRank = 0;
  let hardestChainLength = 0;
  let hardestKind = "";
  let hardestTitle = "";
  for (const record of path || []) {
    const step = record?.step || record || {};
    const stepScore = scoreForStepRecord(record);
    const chainLength = stepChainLength(step);
    const strictRank = stepStrictRank(step);
    const stepMetric = chainLength || strictRank;
    score += stepScore;
    const kind = step?.kind || record?.kind || "";
    if (stepScore > hardestScore || (stepScore === hardestScore && stepMetric > hardestMetric)) {
      hardestScore = stepScore;
      hardestMetric = stepMetric;
      hardestRankAvailable = stepHasStrictRank(step);
      hardestRank = hardestRankAvailable ? strictRank : 0;
      hardestChainLength = chainLength;
      hardestKind = kind;
      hardestTitle = step?.title || stepDisplayName(step) || kind;
    }
  }
  return {
    type: "YZFRate",
    score,
    hardestScore,
    hardestRankAvailable,
    hardestRank,
    hardestChainLength,
    hardestKind,
    hardestTitle,
  };
}

function renumberPathRecords(path) {
  return (path || []).map((record, index) => ({
    ...record,
    stepIndex: index + 1,
  }));
}


function cloneJsonSafe(value) {
  if (value === undefined || value === null) return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function stepCandidateListFromAction(action) {
  if (!action) return [];
  if (Array.isArray(action.candidates)) return action.candidates.map(Number).filter(Boolean);
  if (Number.isInteger(action.candidate)) return [Number(action.candidate)];
  if (Number.isInteger(action.value)) return [Number(action.value)];
  return [];
}

function stepActionKey(step) {
  const placements = [];
  const eliminations = [];
  for (const action of step?.actions || []) {
    const type = String(action?.type || "").toLowerCase();
    const index = Number(action?.index);
    if (!Number.isInteger(index)) continue;
    const candidates = stepCandidateListFromAction(action);
    if (type.includes("place")) {
      for (const digit of candidates) placements.push(`${index}:${digit}`);
    } else if (type.includes("eliminate")) {
      for (const digit of candidates) eliminations.push(`${index}:${digit}`);
    }
  }
  for (const elimination of step?.eliminations || []) {
    const index = Number(elimination?.index);
    if (!Number.isInteger(index)) continue;
    const candidates = stepCandidateListFromAction(elimination);
    for (const digit of candidates) eliminations.push(`${index}:${digit}`);
  }
  placements.sort();
  eliminations.sort();
  return `P=${[...new Set(placements)].join("|")};E=${[...new Set(eliminations)].join("|")}`;
}

function stepReplacementKey(step) {
  return [
    step?.kind || "",
    step?.title || "",
    step?.chainType || "",
    stepActionKey(step),
  ].join("::");
}

function isSameStepResult(a, b) {
  if (!a || !b) return false;
  return stepReplacementKey(a) === stepReplacementKey(b);
}

function originalPathRecordForCandidate(candidateRecord) {
  const index = findSolvePathReplacementIndex(candidateRecord);
  if (index < 0) return null;
  return lastSolveData?.path?.[index] || null;
}

function isCandidateSameAsOriginal(candidateRecord) {
  const original = originalPathRecordForCandidate(candidateRecord);
  return Boolean(original?.step && candidateRecord?.step && isSameStepResult(original.step, candidateRecord.step));
}

function canReplaceOptionalStep(record) {
  return isBranchableOptionalStep(record) && !isCandidateSameAsOriginal(record);
}

function pathTotalScore(data) {
  if (Number.isFinite(Number(data?.rating?.score))) return Number(data.rating.score);
  if (Number.isFinite(Number(data?.yzfRate))) return Number(data.yzfRate);
  return summarizePathRating(data?.path || []).score;
}

function signedDeltaText(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n === 0) return "±0";
  return n > 0 ? `+${n}` : String(n);
}

function branchStepDeltaLabel(oldSteps, newSteps) {
  const delta = Number(newSteps || 0) - Number(oldSteps || 0);
  if (delta < 0) return uif("branchShorter", { count: Math.abs(delta) });
  if (delta > 0) return uif("branchLonger", { count: delta });
  return ui("branchStepsUnchanged");
}

function branchScoreDeltaLabel(oldScore, newScore) {
  const delta = Number(newScore || 0) - Number(oldScore || 0);
  if (delta < 0) return uif("branchScoreLower", { score: Math.abs(delta) });
  if (delta > 0) return uif("branchScoreHigher", { score: delta });
  return ui("branchScoreUnchanged");
}

function branchDeltaTone(oldSteps, newSteps, oldScore, newScore) {
  const stepDelta = Number(newSteps || 0) - Number(oldSteps || 0);
  const scoreDelta = Number(newScore || 0) - Number(oldScore || 0);
  if (stepDelta < 0 || (stepDelta === 0 && scoreDelta < 0)) return "better";
  if (stepDelta > 0 || (stepDelta === 0 && scoreDelta > 0)) return "worse";
  return "neutral";
}

function updateBranchPanel(data = lastSolveData) {
  if (!branchPanel) return;
  branchPanel.replaceChildren();
  branchPanel.classList.add("hidden");
  if (!data?.branched || !data?.branchSummary) return;

  const summary = data.branchSummary;
  const title = document.createElement("div");
  title.className = "branch-panel-title";
  title.textContent = ui("branchAppliedTitle");

  const detail = document.createElement("div");
  detail.className = "branch-panel-detail";
  const stepText = Number(summary.replacedStepIndex || 0) > 0 ? uif("branchStepLabel", { index: summary.replacedStepIndex }) : ui("branchSomeStep");
  const oldSteps = Number(summary.oldSteps || 0);
  const newSteps = Number(summary.newSteps || 0);
  const oldScore = Number(summary.oldScore || 0);
  const newScore = Number(summary.newScore || 0);
  const candidateIndex = Number(summary.candidateIndex || 0);
  const hash = String(summary.beforeHash || "").slice(0, 16);
  const stepDelta = newSteps - oldSteps;
  const scoreDelta = newScore - oldScore;
  detail.textContent = uif("branchPanelDetail", { step: stepText, candidate: candidateIndex || "?", oldSteps, newSteps, stepDelta: signedDeltaText(stepDelta), oldScore, newScore, scoreDelta: signedDeltaText(scoreDelta), hash });

  const delta = document.createElement("div");
  delta.className = `branch-panel-delta ${branchDeltaTone(oldSteps, newSteps, oldScore, newScore)}`;
  delta.textContent = `${branchStepDeltaLabel(oldSteps, newSteps)}；${branchScoreDeltaLabel(oldScore, newScore)}`;

  const titleChange = document.createElement("div");
  titleChange.className = "branch-panel-change";
  const oldTitle = String(summary.oldTitle || ui("branchOldStep"));
  const newTitle = String(summary.newTitle || ui("branchNewStep"));
  if (oldTitle && newTitle && oldTitle !== newTitle) {
    titleChange.textContent = uif("branchTechniqueChanged", { oldTitle, newTitle });
  } else {
    titleChange.textContent = uif("branchTechniqueKept", { title: newTitle || oldTitle || ui("branchUnnamedStep") });
  }

  const actions = document.createElement("div");
  actions.className = "branch-panel-actions";
  const undoButton = document.createElement("button");
  undoButton.type = "button";
  undoButton.className = "compact";
  undoButton.textContent = ui("branchUndoButton");
  undoButton.addEventListener("click", undoLastBranch);
  actions.appendChild(undoButton);

  branchPanel.append(title, detail, delta, titleChange, actions);
  branchPanel.classList.remove("hidden");
}

function clearBranchState() {
  branchUndoData = null;
  updateBranchPanel(null);
}

function undoLastBranch() {
  if (!branchUndoData?.solveData) {
    setStatus(ui("branchNoUndo"));
    return;
  }
  lastSolveData = cloneJsonSafe(branchUndoData.solveData);
  currentHint = branchUndoData.currentHint || null;
  currentSnapshot = branchUndoData.currentSnapshot || lastSolveData?.initial || getCurrentSnapshot();
  previewSnapshotActive = Boolean(branchUndoData.previewSnapshotActive);
  currentPreviewRecord = branchUndoData.currentPreviewRecord || null;
  branchUndoData = null;
  if (tree) tree.replaceChildren(renderSolveTreeView(lastSolveData));
  updateBranchPanel(lastSolveData);
  activateTab("path");
  renderBoardSnapshot(currentSnapshot, currentHint);
  setStatus(ui("branchUndoDone"));
}

function rebuildSolvePathWithCandidate(candidateRecord) {
  if (!engine) return;
  if (!isBranchableOptionalStep(candidateRecord)) {
    setStatus(ui("branchNotBound"));
    return;
  }
  if (typeof engine.solve_path_for_import_json !== "function") {
    setStatus(ui("branchMissingApi"));
    return;
  }

  const replaceIndex = findSolvePathReplacementIndex(candidateRecord);
  if (replaceIndex < 0) {
    setStatus(ui("branchNoMatchingBefore"));
    return;
  }

  const originalRecord = lastSolveData?.path?.[replaceIndex] || null;
  if (originalRecord?.step && candidateRecord.step && isSameStepResult(originalRecord.step, candidateRecord.step)) {
    setStatus(uif("branchSameStep", { index: replaceIndex + 1 }));
    return;
  }

  const replacementStep = candidateRecord.step;
  const beforeSnapshot = candidateRecord.before;
  const beforeHash = stepRecordBeforeHash(candidateRecord);
  const afterSnapshot = applyStepToSnapshot(beforeSnapshot, replacementStep);
  if (!afterSnapshot) {
    setStatus(ui("branchApplyAfterFailed"));
    return;
  }

  const afterLibrary = snapshotToLibraryString(afterSnapshot);
  if (!afterLibrary) {
    setStatus(ui("branchSerializeFailed"));
    return;
  }

  let tailData = null;
  try {
    tailData = parseJson(engine.solve_path_for_import_json(afterLibrary, 500));
  } catch (error) {
    console.error(error);
  }
  if (!tailData?.ok) {
    setStatus(uif("branchTailFailed", { error: tailData?.error || ui("unknownError") }));
    return;
  }

  const oldSolveData = cloneJsonSafe(lastSolveData);
  const oldSteps = Number(lastSolveData?.path?.length || 0);
  const oldScore = pathTotalScore(lastSolveData);

  const prefix = (lastSolveData.path || []).slice(0, replaceIndex).map((record) => ({ ...record }));
  const replacementRecord = {
    ...candidateRecord,
    stepIndex: replaceIndex + 1,
    beforeHash,
    before: beforeSnapshot,
    step: replacementStep,
    score: scoreForStepRecord(candidateRecord),
    branched: true,
    branchSource: "optionalStep",
    replacementCandidateIndex: candidateRecord.candidateIndex || 0,
    replacedOriginalStepIndex: replaceIndex + 1,
  };
  const tail = (tailData.path || []).map((record) => ({ ...record }));
  const combinedPath = renumberPathRecords([...prefix, replacementRecord, ...tail]);
  const rating = summarizePathRating(combinedPath);
  const finalSnapshot = tailData.final || afterSnapshot;
  const combined = {
    ...lastSolveData,
    ok: true,
    status: tailData.status || "stalled",
    branched: true,
    branchSource: {
      sourceStepIndex: Number(candidateRecord.sourceStepIndex || 0),
      beforeHash,
      candidateIndex: Number(candidateRecord.candidateIndex || 0),
      replacedStepIndex: replaceIndex + 1,
    },
    branchSummary: {
      sourceStepIndex: Number(candidateRecord.sourceStepIndex || 0),
      beforeHash,
      candidateIndex: Number(candidateRecord.candidateIndex || 0),
      replacedStepIndex: replaceIndex + 1,
      oldSteps,
      newSteps: combinedPath.length,
      oldScore,
      newScore: rating.score,
      oldTitle: originalRecord?.step?.title || originalRecord?.step?.kind || "",
      newTitle: replacementStep?.title || replacementStep?.kind || "",
    },
    steps: combinedPath.length,
    yzfRate: rating.score,
    rating,
    board: tailData.board || snapshotBoardString(finalSnapshot),
    final: finalSnapshot,
    path: combinedPath,
  };

  branchUndoData = {
    solveData: oldSolveData,
    currentHint,
    currentSnapshot,
    previewSnapshotActive,
    currentPreviewRecord,
  };

  lastSolveData = combined;
  currentHint = replacementStep;
  currentSnapshot = beforeSnapshot;
  previewSnapshotActive = true;
  currentPreviewRecord = replacementRecord;
  tree.replaceChildren(renderSolveTreeView(combined));
  updateBranchPanel(combined);
  activateTab("path");
  renderBoardSnapshot(currentSnapshot, currentHint);
  setStatus(uif("branchReplaced", { index: replaceIndex + 1, steps: combinedPath.length }));
}

function installOptionalStepBranchHandlers(item, record) {
  if (!canReplaceOptionalStep(record)) return;
  const row = item.querySelector(":scope > .tree-row");
  if (!row) return;
  row.classList.add("branchable-step-row");
  row.title = ui("branchRowTitle");
  row.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    rebuildSolvePathWithCandidate(record);
  });

  let longPressTimer = 0;
  const clearLongPress = () => {
    if (longPressTimer) {
      window.clearTimeout(longPressTimer);
      longPressTimer = 0;
    }
  };
  row.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    clearLongPress();
    longPressTimer = window.setTimeout(() => {
      longPressTimer = 0;
      rebuildSolvePathWithCandidate(record);
    }, 650);
  });
  row.addEventListener("pointerup", clearLongPress);
  row.addEventListener("pointercancel", clearLongPress);
  row.addEventListener("pointerleave", clearLongPress);
  row.addEventListener("pointermove", clearLongPress);
}

function renderStepNode(record, index) {
  const step = record.step || record;
  const children = [
    renderLeaf(text("hintDesc"), formatHintDesc(step), "string"),
  ];
  if (step.chainType) {
    children.push(renderLeaf("chainType", step.chainType, "string"));
  }
  if (Array.isArray(step.nodes) && step.nodes.length > 0) {
    children.push(renderBranch(
      "nodes",
      `${step.nodes.length}`,
      step.nodes.map((node) => renderLeaf("node", chainNodeText(node), "string")),
      false
    ));
  }
  if (Array.isArray(step.edges) && step.edges.length > 0) {
    children.push(renderBranch(
      "edges",
      `${step.edges.length}`,
      step.edges.map((edge) => renderLeaf("edge", chainEdgeText(edge), "string")),
      false
    ));
  }
  if (Array.isArray(step.groups) && step.groups.length > 0) {
    children.push(renderLeaf("groups", `${step.groups.length}`, "number"));
  }
  if (Array.isArray(step.links) && step.links.length > 0) {
    children.push(renderLeaf("links", `${step.links.length}`, "number"));
  }
  const chainLength = stepChainLength(step);
  if (chainLength > 0) {
    children.push(renderLeaf(lang.value === "zh" ? "链长" : "chainLength", String(chainLength), "number"));
  }
  if (stepHasStrictRank(step)) {
    children.push(renderLeaf("rank", String(stepStrictRank(step)), "number"));
  }
  if (record.beforeHash || record.before?.stateHash) {
    children.push(renderLeaf("beforeHash", record.beforeHash || record.before.stateHash, "string"));
  }
  const branchable = isBranchableOptionalStep(record);
  const replaceable = canReplaceOptionalStep(record);
  const sameAsOriginal = branchable && !replaceable;
  if (replaceable) {
    children.push(renderLeaf("操作", "右键/长按：替换路径并从此处重算", "string"));
  } else if (sameAsOriginal) {
    children.push(renderLeaf("操作", "与当前路径步骤相同", "string"));
  }

  // Keep Chinese path rows compact.  The localized explanation and complete
  // language-neutral chain notation live in the expandable Hint.Desc leaf.
  // English retains the legacy reference-style row summary.
  const summaryText = isRankedChainSummaryStep(step)
    ? (lang.value === "zh"
      ? (actionText(step) ? `${stepDisplayName(step)}: => ${actionText(step)}` : stepDisplayName(step))
      : rankedChainSummaryText(step))
    : "";
  const label = `#${record.stepIndex || index + 1} ${summaryText || stepDisplayName(step)}`;
  const detailParts = [];
  if (!summaryText && step.house) detailParts.push(`house=${step.house}`);
  if (summaryText && step.house) detailParts.push(`house=${step.house}`);
  if (replaceable) detailParts.push("可替换");
  if (sameAsOriginal) detailParts.push("当前步骤");
  const rowClass = `step-row step-difficulty-${stepDifficultyLevel(step)}${replaceable ? " branchable-step-row" : ""}`;
  const item = renderBranch(label, detailParts.join(", "), children, false, () => {
    currentHint = step;
    currentSnapshot = record.before || currentSnapshot;
    previewSnapshotActive = true;
    currentPreviewRecord = record;
    renderBoardSnapshot(currentSnapshot, currentHint);
  }, rowClass);
  installOptionalStepBranchHandlers(item, record);
  return item;
}

function syncCollapsedButtons(root) {
  root.querySelectorAll("li").forEach((item) => {
    const button = item.querySelector(":scope > .tree-row > .tree-toggle");
    const children = item.querySelector(":scope > ul");
    if (!button || !children) return;
    button.textContent = children.classList.contains("hidden") ? "+" : "-";
  });
}

function renderStepCollectionTreeView(data, options = {}) {
  const view = document.createElement("div");
  view.className = "json-treeview";

  const root = document.createElement("ul");
  const stepNodes = (data.path || []).map((step, index) => renderStepNode(step, index));
  const rootLabel = options.rootLabel || text("path");
  const detailParts = [
    `${text("status")}=${data.status}`,
    `${text("steps")}=${data.steps ?? data.candidateCount ?? 0}`,
  ];
  if (data.mode) {
    detailParts.push(`mode=${data.mode}`);
  }
  if (Number(data.sourceStepIndex || 0) > 0) {
    detailParts.push(`sourceStep=#${data.sourceStepIndex}`);
  }
  if (data.yzfRate !== undefined) {
    detailParts.push(`YZFRate=${data.yzfRate ?? 0}`);
  }
  const rating = data.rating || summarizePathRating(data.path || []);
  const hardestBase = rating?.hardestKind
    ? techniqueName({ kind: rating.hardestKind, title: rating.hardestTitle || rating.hardestKind })
    : String(rating?.hardestTitle || "");
  const hardestLength = Number(rating?.hardestChainLength || 0);
  const hardest = hardestBase
    ? `${hardestBase}${hardestLength > 0 && !/\[\d+\]/.test(hardestBase) ? `[${hardestLength}]` : ""}`
    : "";
  if (hardest) {
    detailParts.push(`Hardest=${hardest}`);
  }
  if (data.beforeHash || data.initial?.stateHash) {
    detailParts.push(`beforeHash=${data.beforeHash || data.initial.stateHash}`);
  }
  if (data.board) {
    detailParts.push(`${text("board")}=${data.board}`);
  }
  root.appendChild(renderBranch(
    rootLabel,
    detailParts.join(", "),
    stepNodes,
    true
  ));
  view.appendChild(root);
  syncCollapsedButtons(view);
  return view;
}

function renderSolveTreeView(data) {
  return renderStepCollectionTreeView(data, { rootLabel: text("path") });
}

function allStepsTechniqueLabel(record) {
  return techniqueName(record?.step || record || {});
}

function allStepsTechniqueFilterInfo(record) {
  const step = record?.step || record || {};
  const identity = techniqueIdentityForStep(step);
  const ref = referenceTechniqueForStep(step);
  if (ref && identity && identity !== ref.kind) {
    return {
      key: identity,
      label: techniqueName(step),
      order: (ref.order ?? 9999) + 0.01,
    };
  }
  if (ref) {
    return {
      key: ref.kind,
      label: techniqueName({ kind: ref.kind, title: ref.title }),
      order: ref.order ?? 9999,
    };
  }
  const label = allStepsTechniqueLabel(record) || String(step.chainType || step.kind || "Other");
  return { key: identity || label, label, order: 9999 };
}

function allStepsPlacementCount(step = {}) {
  const actions = Array.isArray(step.actions) ? step.actions : [];
  const actionPlaces = actions.filter((action) => action?.type === "place").length;
  const placements = Array.isArray(step.placements) ? step.placements.length : 0;
  return actionPlaces + placements;
}

function allStepsEliminationCount(step = {}) {
  const eliminations = Array.isArray(step.eliminations) ? step.eliminations : [];
  return eliminations.reduce((total, elimination) => {
    const candidates = Array.isArray(elimination?.candidates) ? elimination.candidates.length : 0;
    return total + Math.max(1, candidates);
  }, 0);
}

function compareAllStepsByConclusion(a, b) {
  const stepA = a?.step || a || {};
  const stepB = b?.step || b || {};
  const placeA = allStepsPlacementCount(stepA);
  const placeB = allStepsPlacementCount(stepB);
  if (placeA !== placeB) return placeB - placeA;
  const elimA = allStepsEliminationCount(stepA);
  const elimB = allStepsEliminationCount(stepB);
  if (elimA !== elimB) return elimB - elimA;
  return (a.__allStepsOriginalIndex ?? 0) - (b.__allStepsOriginalIndex ?? 0);
}

function sortAllStepsRecords(records) {
  const decorated = records.map((record, index) => ({ ...record, __allStepsOriginalIndex: record.__allStepsOriginalIndex ?? index }));
  if (allStepsFilterState.sortMode === "conclusion") {
    return decorated.sort(compareAllStepsByConclusion);
  }
  return decorated.sort((a, b) => (a.__allStepsOriginalIndex ?? 0) - (b.__allStepsOriginalIndex ?? 0));
}

function normalizedFilterText(value) {
  return String(value || "").trim().toLowerCase();
}

function allStepsRecordSearchText(record) {
  const step = record?.step || record || {};
  const pieces = [
    step.kind,
    step.title,
    step.chainType,
    step.description,
    step.house,
    formatHintDesc(step),
    stepActionKey(step),
    record?.beforeHash,
    record?.before?.stateHash,
  ];
  for (const action of step.actions || []) {
    pieces.push(action?.type, action?.row, action?.col, action?.value, action?.candidate, (action?.candidates || []).join(""));
  }
  for (const elimination of step.eliminations || []) {
    pieces.push(elimination?.row, elimination?.col, (elimination?.candidates || []).join(""));
  }
  return pieces.filter((part) => part !== undefined && part !== null).join(" ").toLowerCase();
}

function allStepsRecordMatchesFilter(record) {
  const query = normalizedFilterText(allStepsFilterState.query);
  if (query) {
    const haystack = allStepsRecordSearchText(record);
    const tokens = query.split(/\s+/).filter(Boolean);
    if (!tokens.every((token) => haystack.includes(token))) return false;
  }
  if (allStepsFilterState.technique === ALL_STEPS_STTE_FILTER_KEY) {
    if (record?.stte !== true) return false;
  } else if (allStepsFilterState.technique && allStepsTechniqueFilterInfo(record).key !== allStepsFilterState.technique) {
    return false;
  }
  if (allStepsFilterState.replaceableOnly && !canReplaceOptionalStep(record)) {
    return false;
  }
  return true;
}

function filteredAllStepsData(data) {
  if (!data) return data;
  const originalPath = Array.isArray(data.path) ? data.path : [];
  const path = sortAllStepsRecords(originalPath.filter(allStepsRecordMatchesFilter));
  return {
    ...data,
    path,
    steps: path.length,
    candidateCount: path.length,
    filteredCount: path.length,
    totalCandidateCount: originalPath.length,
  };
}

function setSelectOptions(select, values, allLabel) {
  if (!select) return;
  const previous = select.value;
  select.replaceChildren();
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = allLabel;
  select.appendChild(allOption);
  const optionValues = [];
  for (const item of values) {
    const value = typeof item === "object" ? item.value : item;
    const label = typeof item === "object" ? item.label : item;
    if (!value) continue;
    optionValues.push(value);
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label || value;
    select.appendChild(option);
  }
  if (optionValues.includes(previous)) {
    select.value = previous;
  } else {
    select.value = "";
    if (select === allStepsFilterTechnique) allStepsFilterState.technique = "";
  }
}

function refreshAllStepsFilterOptions(data = lastAllStepsData) {
  const records = Array.isArray(data?.path) ? data.path : [];
  const byKey = new Map();
  for (const record of records) {
    const info = allStepsTechniqueFilterInfo(record);
    if (!info.key) continue;
    const existing = byKey.get(info.key);
    if (!existing || info.order < existing.order) byKey.set(info.key, info);
  }
  const techniques = [
    { value: ALL_STEPS_STTE_FILTER_KEY, label: ui("allStepsFilterStteOption") },
    ...[...byKey.values()]
      .sort((a, b) => (a.order - b.order) || a.label.localeCompare(b.label))
      .map((info) => ({ value: info.key, label: info.label })),
  ];
  setSelectOptions(allStepsFilterTechnique, techniques, ui("allTechniques"));
}

function updateAllStepsFilterStatus(filteredData, originalData = lastAllStepsData) {
  if (!allStepsFilterStatus) return;
  const total = Array.isArray(originalData?.path) ? originalData.path.length : 0;
  const shown = Array.isArray(filteredData?.path) ? filteredData.path.length : 0;
  const parts = [uif("allStepsFilterShowing", { shown, total })];
  if (allStepsFilterState.query) parts.push(uif("allStepsFilterKeyword", { query: allStepsFilterState.query }));
  if (allStepsFilterState.technique) {
    const selected = allStepsFilterTechnique?.selectedOptions?.[0]?.textContent || allStepsFilterState.technique;
    parts.push(uif("allStepsFilterTechnique", { technique: selected }));
  }
  if (allStepsFilterState.sortMode === "conclusion") parts.push(ui("allStepsFilterConclusionSort"));
  if (allStepsFilterState.replaceableOnly) parts.push(ui("allStepsFilterReplaceableOnly"));
  allStepsFilterStatus.textContent = total ? parts.join(ui("listSeparator")) : ui("noAllSteps");
}

function rerenderAllStepsTree() {
  if (!allStepsTree || !lastAllStepsData) return;
  refreshAllStepsFilterOptions(lastAllStepsData);
  allStepsTree.replaceChildren(renderAllStepsTreeView(lastAllStepsData));
}

function resetAllStepsFilter() {
  allStepsFilterState = { query: "", technique: "", sortMode: "default", replaceableOnly: false };
  if (allStepsFilterText) allStepsFilterText.value = "";
  if (allStepsFilterTechnique) allStepsFilterTechnique.value = "";
  if (allStepsSortMode) allStepsSortMode.value = "default";
  if (allStepsFilterReplaceable) allStepsFilterReplaceable.checked = false;
  updateAllStepsFilterStatus(null, null);
}

function renderAllStepsTreeView(data) {
  const filtered = filteredAllStepsData(data);
  updateAllStepsFilterStatus(filtered, data);
  return renderStepCollectionTreeView(filtered, { rootLabel: text("allSteps") });
}

function enterStepPreview(data) {
  currentHint = null;
  currentSnapshot = data.initial || getCurrentSnapshot();
  previewSnapshotActive = false;
  currentPreviewRecord = null;
  renderBoardSnapshot(currentSnapshot, null);
}

function parseAndPreviewStepCollection(text, tabName) {
  const data = JSON.parse(text);
  activateTab(tabName);
  enterStepPreview(data);
  return data;
}

function renderSolvePath(text) {
  const data = parseAndPreviewStepCollection(text, "path");
  lastSolveData = data;
  branchUndoData = null;
  tree.replaceChildren(renderSolveTreeView(data));
  updateBranchPanel(data);
}

function renderAllStepsPath(text) {
  const data = parseAndPreviewStepCollection(text, "allSteps");
  lastAllStepsData = data;
  refreshAllStepsFilterOptions(data);
  if (allStepsTree) {
    allStepsTree.replaceChildren(renderAllStepsTreeView(data));
  }
}


const tlgSolverState = {
  selectedEndpoint: null,
  selectedCandidates: new Set(),
  busyTask: "",
  truths: [],
  // User-authored Links are persistent TLG input.  They must never be replaced
  // merely because Find Eliminations derived an automatic Link set.
  links: [],
  // The last successful solver structure is kept separately for result
  // highlighting and follow-up structure-mutation actions.
  resultLinks: [],
  resultLinksAvailable: false,
  virtualSets: [new Set(), new Set()],
  virtualSetCardinalities: [1, 1],
  aurGroups: [new Set(), new Set()],
  dynamicAurCandidates: new Set(),
  genericAurCandidates: new Set(),
  eliminations: [],
  assignments: [],
  lastResponse: null,
  lastStatusResponse: null,
  lastMessage: "",
  lastTone: "",
  candidateGrid: null,
};

function tlgSolverCandidateKey(cellIndex, digit) {
  return `${cellIndex}:${digit}`;
}

function tlgSolverNrc(cellIndex, digit) {
  return `${digit}r${Math.floor(cellIndex / 9) + 1}c${(cellIndex % 9) + 1}`;
}

function tlgSolverCellText(cellIndex) {
  return `r${Math.floor(cellIndex / 9) + 1}c${(cellIndex % 9) + 1}`;
}

function tlgSolverBoxIndex(cellIndex) {
  const row = Math.floor(cellIndex / 9);
  const col = cellIndex % 9;
  return Math.floor(row / 3) * 3 + Math.floor(col / 3) + 1;
}

function tlgSolverEditingActive() {
  return !!tlgSolverEnable?.checked;
}

function tlgSelectedVirtualSetIndex() {
  return Math.max(0, Math.min(1, Number(tlgSolverVirtualGroup?.value || 0) || 0));
}

function tlgSelectedVirtualSet() {
  return tlgSolverState.virtualSets[tlgSelectedVirtualSetIndex()];
}

function tlgSyncVirtualCardinalityInput() {
  if (!tlgSolverTruthsToApply) return;
  const index = tlgSelectedVirtualSetIndex();
  tlgSolverTruthsToApply.value = String(tlgSolverState.virtualSetCardinalities[index] || 1);
}

function tlgStoreVirtualCardinalityInput() {
  const index = tlgSelectedVirtualSetIndex();
  const value = Math.max(1, Math.min(4, Number(tlgSolverTruthsToApply?.value || 1) || 1));
  tlgSolverState.virtualSetCardinalities[index] = value;
  if (tlgSolverTruthsToApply) tlgSolverTruthsToApply.value = String(value);
}

function tlgSolverEffectiveSnapshot(snapshot = currentSnapshot) {
  if (tlgSolverEditingActive() && tlgSolverState.candidateGrid?.snapshot) {
    return tlgSolverState.candidateGrid.snapshot;
  }
  return snapshot;
}

function tlgSolverCellAcceptsInput(cellIndex) {
  const cell = tlgSolverEffectiveSnapshot()?.cells?.[cellIndex];
  return !!cell && Number(cell.value || 0) <= 0;
}

function consumeTlgSolverFixedCellEvent(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  return true;
}

function parseTlgCandidateGridText(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return { ok: false, errorKey: "tlgCandidateGridEmpty" };

  let cells = null;
  const compact = [...text].filter((ch) => /[0-9.]/.test(ch));
  if (compact.length === 729) {
    cells = Array.from({ length: 81 }, (_, cellIndex) => {
      const digits = [];
      for (let offset = 0; offset < 9; offset += 1) {
        const ch = compact[cellIndex * 9 + offset];
        if (ch >= "1" && ch <= "9") {
          const digit = Number(ch);
          if (!digits.includes(digit)) digits.push(digit);
        }
      }
      return digits.sort((a, b) => a - b);
    });
  } else {
    const tokens = text
      .replace(/[|,;]+/g, " ")
      .split(/\s+/)
      .map((token) => token.replace(/[^1-9]/g, ""))
      .filter(Boolean);
    if (tokens.length === 81) {
      cells = tokens.map((token) => [...new Set([...token].map(Number))].sort((a, b) => a - b));
    }
  }

  if (!cells || cells.length !== 81) {
    return { ok: false, errorKey: "tlgCandidateGridInvalid" };
  }
  const emptyCell = cells.findIndex((digits) => !digits.length);
  if (emptyCell >= 0) {
    return {
      ok: false,
      errorKey: "tlgCandidateGridEmptyCell",
      errorArgs: { cell: tlgSolverCellText(emptyCell) },
    };
  }

  const activeCandidates = new Set();
  cells.forEach((digits, cellIndex) => {
    digits.forEach((digit) => activeCandidates.add(tlgSolverCandidateKey(cellIndex, digit)));
  });
  const snapshot = {
    board: ".".repeat(81),
    givens: ".".repeat(81),
    cells: cells.map((candidates, index) => ({ index, value: 0, candidates: [...candidates] })),
    revision: "TLG",
    source: "tlg-candidate-grid",
    hasCandidates: true,
  };
  return {
    ok: true,
    activeCandidates,
    initialCandidates: new Set(activeCandidates),
    snapshot,
    count: activeCandidates.size,
    format: compact.length === 729 ? "sukaku729" : "candidateCells81",
  };
}

function importTlgCandidateGridFromMainInput() {
  if (!tlgSolverEditingActive() || tlgSolverState.busyTask) return;
  const parsed = parseTlgCandidateGridText(givens?.value || "");
  if (!parsed.ok) {
    const message = parsed.errorArgs ? uif(parsed.errorKey, parsed.errorArgs) : ui(parsed.errorKey);
    setTlgSolverStatus(message, "error");
    return;
  }
  clearTlgSolverComputedResult();
  closeTlgSolverContextMenu();
  tlgSolverState.selectedEndpoint = null;
  tlgSolverState.selectedCandidates.clear();
  tlgSolverState.candidateGrid = parsed;
  selectedIndex = -1;
  const premiseMode = tlgSolverAurPremiseMode?.value || "unique-puzzle-derived";
  const message = uif(
    premiseMode === "candidate-grid-asserted" ? "tlgCandidateGridImportedTraining" : "tlgCandidateGridImportedUnique",
    { candidates: parsed.count },
  );
  tlgSolverState.lastMessage = message;
  tlgSolverState.lastTone = "ok";
  renderBoardSnapshot(currentSnapshot, null);
  updateTlgSolverUi();
}

function setTlgSolverStatus(text, tone = "") {
  if (!tlgSolverStatus) return;
  tlgSolverStatus.textContent = text;
  if (tone) tlgSolverStatus.dataset.tone = tone;
  else tlgSolverStatus.removeAttribute("data-tone");
}

function clearTlgSolverComputedResult() {
  tlgSolverState.eliminations = [];
  tlgSolverState.assignments = [];
  tlgSolverState.resultLinks = [];
  tlgSolverState.resultLinksAvailable = false;
  tlgSolverState.lastResponse = null;
  tlgSolverState.lastStatusResponse = null;
  if (tlgSolverSolutionPanel) tlgSolverSolutionPanel.hidden = true;
  if (tlgSolverSolution) {
    tlgSolverSolution.hidden = true;
    tlgSolverSolution.textContent = "";
  }
  if (tlgSolverRaw) {
    tlgSolverRaw.hidden = true;
    tlgSolverRaw.textContent = "";
  }
}

function announceTlgSolver(text, tone = "ok") {
  // Any input edit invalidates the result-only Links/eliminations while
  // preserving the user's own Links for the next request.
  clearTlgSolverComputedResult();
  tlgSolverState.lastMessage = text;
  tlgSolverState.lastTone = tone;
  setTlgSolverStatus(`${text} | ${summarizeTlgSolverState()}`, tone);
}

function tlgSolverPrettyValue(value) {
  return String(value || "")
    .replace(/^descriptor-truth:/, "")
    .replace(/^descriptor-link:/, "")
    .replace(/^cell-truth:/, "")
    .replace(/^row-truth:/, "")
    .replace(/^column-truth:/, "")
    .replace(/^box-truth:/, "")
    .replace(/^row-link:/, "")
    .replace(/^column-link:/, "")
    .replace(/^box-link:/, "")
    .replace(/^cell-link:/, "")
    .replace(/^link:/, "");
}

function tlgSolverEffectiveLinks() {
  return tlgSolverState.resultLinksAvailable
    ? tlgSolverState.resultLinks
    : tlgSolverState.links;
}

function tlgSolverRequestLinks(action) {
  // A fresh Find must inspect only user-authored Links.  An empty user list is
  // the backend signal to derive automatic Links again.  Follow-up mutation
  // actions operate on the last successful result structure instead.
  if (action === "findAllEliminations") return tlgSolverState.links;
  return tlgSolverEffectiveLinks();
}

function tlgSolverCandidateKeyToNrc(key) {
  const [cellText, digitText] = String(key || "").split(":");
  const cellIndex = Number(cellText);
  const digit = Number(digitText);
  if (!Number.isFinite(cellIndex) || !Number.isFinite(digit)) return String(key || "");
  return tlgSolverNrc(cellIndex, digit);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function groupTlgDescriptors(items, truthStyle = false) {
  const groups = new Map();
  const order = [];
  for (const rawItem of items || []) {
    const value = tlgSolverPrettyValue(rawItem);
    const match = /^([1-9])([rcnb])([1-9])$/i.exec(value);
    if (!match) {
      order.push({ fallback: value });
      continue;
    }
    const digit = Number(match[1]);
    const type = match[2].toLowerCase();
    const index = match[3];
    const key = `${type}:${index}`;
    if (!groups.has(key)) {
      const record = { key, type, index, digits: [] };
      groups.set(key, record);
      order.push(record);
    }
    const record = groups.get(key);
    if (!record.digits.includes(digit)) record.digits.push(digit);
  }
  return order.map((record) => {
    if (record.fallback != null) return record.fallback;
    const digits = record.digits.slice().sort((a, b) => a - b).join("");
    const type = truthStyle ? record.type.toUpperCase() : record.type;
    return `${digits}${type}${record.index}`;
  });
}

function formatTlgAurGroup(group) {
  const points = [...(group || [])].map((key) => {
    const [cellText, digitText] = String(key).split(":");
    const cell = Number(cellText);
    const digit = Number(digitText);
    return {
      digit,
      row: Math.floor(cell / 9) + 1,
      column: (cell % 9) + 1,
      token: tlgSolverCandidateKeyToNrc(key),
    };
  }).filter((point) => Number.isInteger(point.digit) && point.digit >= 1 && point.digit <= 9);
  const uniqueDesc = (values) => [...new Set(values)].sort((a, b) => b - a);
  const digits = uniqueDesc(points.map((point) => point.digit));
  const rows = uniqueDesc(points.map((point) => point.row));
  const columns = uniqueDesc(points.map((point) => point.column));
  if (digits.length === 2 && rows.length === 2 && columns.length === 2) {
    return `(${digits.join("")})R${rows.join("")}C${columns.join("")}`;
  }
  return `{${points.map((point) => point.token).join(" ")}}`;
}

function normalizeTlgResponseCandidate(candidate) {
  if (!candidate || typeof candidate !== "object") return null;
  const digit = Number(candidate.digit || 0);
  let cell = Number(candidate.cell);
  if (!Number.isInteger(cell) || cell < 0 || cell >= 81) {
    const row = Number(candidate.row);
    const column = Number(candidate.column);
    if (Number.isInteger(row) && row >= 1 && row <= 9 && Number.isInteger(column) && column >= 1 && column <= 9) {
      cell = (row - 1) * 9 + (column - 1);
    }
  }
  if (!Number.isInteger(cell) || cell < 0 || cell >= 81 || !Number.isInteger(digit) || digit < 1 || digit > 9) return null;
  return { cell, digit, row: Math.floor(cell / 9) + 1, column: (cell % 9) + 1 };
}

function formatTlgElimination(candidate) {
  const normalized = normalizeTlgResponseCandidate(candidate);
  return normalized ? `r${normalized.row}c${normalized.column}<>${normalized.digit}` : String(candidate?.token || "");
}

function formatTlgAssignment(candidate) {
  const normalized = normalizeTlgResponseCandidate(candidate);
  return normalized ? `r${normalized.row}c${normalized.column}=${normalized.digit}` : String(candidate?.token || "");
}

function buildTlgSolutionText(response) {
  const truthItems = response?.truthsCanonical || response?.truthsState || tlgSolverState.truths;
  const linkItems = response?.linksCanonical || response?.linksState || tlgSolverEffectiveLinks();
  const truths = groupTlgDescriptors(truthItems, true);
  const links = groupTlgDescriptors(linkItems, false);
  const activeAurGroups = tlgSolverState.aurGroups.filter((group) => group.size > 0);
  const eliminations = (Array.isArray(response?.eliminations) ? response.eliminations : []).map(formatTlgElimination).filter(Boolean);
  const assignments = (Array.isArray(response?.assignments) ? response.assignments : []).map(formatTlgAssignment).filter(Boolean);
  const lines = [];
  lines.push(`     ${uif("tlgSolutionTruths", { count: truthItems.length, body: truths.join(" ") })}`);
  lines.push(`     ${uif("tlgSolutionLinks", { count: linkItems.length, body: links.join(" ") })}`);
  tlgSolverState.virtualSets.forEach((group, index) => {
    if (!group.size) return;
    lines.push(`     ${uif("tlgSolutionVirtualSet", {
      group: index + 1,
      cardinality: tlgSolverState.virtualSetCardinalities[index] || 1,
      body: [...group].map(tlgSolverCandidateKeyToNrc).join(" "),
    })}`);
  });
  if (activeAurGroups.length > 0) {
    lines.push(`     ${uif("tlgSolutionAurs", {
      count: activeAurGroups.length,
      body: activeAurGroups.map(formatTlgAurGroup).join(", "),
    })}`);
  }
  if (tlgSolverState.dynamicAurCandidates.size > 0) {
    const expanded = Number(response?.counts?.daurExpandedAurs || 0);
    lines.push(`     ${uif("tlgSolutionDaurPool", {
      body: [...tlgSolverState.dynamicAurCandidates].map(tlgSolverCandidateKeyToNrc).join(" "),
    })}`);
    lines.push(`     ${uif("tlgSolutionDaurExpanded", { count: expanded })}`);
  }
  if (tlgSolverState.genericAurCandidates.size > 0) {
    const accepted = Number(response?.counts?.gurAccepted || 0);
    lines.push(`     ${uif("tlgSolutionGurPool", {
      body: [...tlgSolverState.genericAurCandidates].map(tlgSolverCandidateKeyToNrc).join(" "),
    })}`);
    lines.push(`     ${uif("tlgSolutionGurAccepted", { count: accepted })}`);
  }
  if (eliminations.length > 0) {
    lines.push(`     ${uif("tlgSolutionEliminations", { count: eliminations.length, body: eliminations.join(", ") })}`);
  } else {
    lines.push(`     ${ui("tlgSolutionNoEliminations")}`);
  }
  if (assignments.length > 0) {
    lines.push(`     ${uif("tlgSolutionAssignments", { count: assignments.length, body: assignments.join(", ") })}`);
  }
  return lines.join("\n");
}

function renderTlgSolverChipList(title, items, category, mapper = (v) => v) {
  if (!items.length) return "";
  const lis = items.map((value) => {
    const raw = String(value);
    const label = String(mapper(value));
    return `<li class="tlg-solver-chip"><span>${escapeHtml(label)}</span><button type="button" title="${escapeHtml(ui("tlgRemove"))}" aria-label="${escapeHtml(ui("tlgRemove"))} ${escapeHtml(label)}" data-tlg-remove-category="${escapeHtml(category)}" data-tlg-remove-value="${escapeHtml(raw)}">×</button></li>`;
  }).join("");
  return `<div class="tlg-solver-state-group"><div class="tlg-solver-state-group-title">${escapeHtml(title)} (${items.length})</div><ul class="tlg-solver-state-items">${lis}</ul></div>`;
}

function renderTlgSolverStateList() {
  if (!tlgSolverStateList) return;
  const parts = [];
  parts.push(renderTlgSolverChipList(ui("tlgTruths"), tlgSolverState.truths, "truths", tlgSolverPrettyValue));
  parts.push(renderTlgSolverChipList(ui("tlgUserLinks"), tlgSolverState.links, "links", tlgSolverPrettyValue));
  parts.push(renderTlgSolverChipList(ui("tlgVirtualSet1"), [...tlgSolverState.virtualSets[0]], "virtual0", tlgSolverCandidateKeyToNrc));
  parts.push(renderTlgSolverChipList(ui("tlgVirtualSet2"), [...tlgSolverState.virtualSets[1]], "virtual1", tlgSolverCandidateKeyToNrc));
  parts.push(renderTlgSolverChipList(`${ui("tlgAurCorners")} 1`, [...tlgSolverState.aurGroups[0]], "aur0", tlgSolverCandidateKeyToNrc));
  parts.push(renderTlgSolverChipList(`${ui("tlgAurCorners")} 2`, [...tlgSolverState.aurGroups[1]], "aur1", tlgSolverCandidateKeyToNrc));
  parts.push(renderTlgSolverChipList(ui("tlgDaurCandidates"), [...tlgSolverState.dynamicAurCandidates], "daur", tlgSolverCandidateKeyToNrc));
  parts.push(renderTlgSolverChipList(ui("tlgGurCandidates"), [...tlgSolverState.genericAurCandidates], "gur", tlgSolverCandidateKeyToNrc));
  const html = parts.filter(Boolean).join("");
  tlgSolverStateList.innerHTML = html || ui("tlgNoInput");
}

function removeTlgSolverStateItem(category, value) {
  if (category === "truths") tlgSolverState.truths = tlgSolverState.truths.filter((item) => item !== value);
  else if (category === "links") tlgSolverState.links = tlgSolverState.links.filter((item) => item !== value);
  else if (category === "virtual0") tlgSolverState.virtualSets[0].delete(value);
  else if (category === "virtual1") tlgSolverState.virtualSets[1].delete(value);
  else if (category === "aur0") tlgSolverState.aurGroups[0].delete(value);
  else if (category === "aur1") tlgSolverState.aurGroups[1].delete(value);
  else if (category === "daur") tlgSolverState.dynamicAurCandidates.delete(value);
  else if (category === "gur") tlgSolverState.genericAurCandidates.delete(value);
  tlgSolverState.selectedEndpoint = null;
  const candidateCategory = category === "virtual0" || category === "virtual1" || category === "aur0" || category === "aur1" || category === "daur" || category === "gur";
  const categoryLabels = {
    truths: ui("tlgTruths"),
    links: ui("tlgUserLinks"),
    virtual0: ui("tlgVirtualSet1"),
    virtual1: ui("tlgVirtualSet2"),
    aur0: ui("tlgAurGroup1"),
    aur1: ui("tlgAurGroup2"),
    daur: ui("tlgDaurCandidates"),
    gur: ui("tlgGurCandidates"),
  };
  announceTlgSolver(uif("tlgRemoved", {
    category: categoryLabels[category] || category,
    value: tlgSolverPrettyValue(candidateCategory ? tlgSolverCandidateKeyToNrc(value) : value),
  }));
  renderBoardSnapshot(currentSnapshot, currentHint);
  updateTlgSolverUi();
}

function updateTlgSolverActionGate(response = tlgSolverState.lastResponse) {
  const actions = response?.actions || {};
  const busy = !!tlgSolverState.busyTask;
  const convertEnabled = actions?.convertTruthsToLinks?.enabled === true;
  const removeEnabled = actions?.removeUnusedLinks?.enabled === true;
  if (btnTlgConvertTruths) btnTlgConvertTruths.disabled = busy || !convertEnabled;
  if (btnTlgRemoveUnused) btnTlgRemoveUnused.disabled = busy || !removeEnabled;
}

function setTlgSolverBusy(task, busy) {
  tlgSolverState.busyTask = busy ? String(task || "tlg") : "";
  updateTlgSolverUi();
}

function summarizeTlgSolverState(prefix = "") {
  const parts = [];
  if (prefix) parts.push(prefix);
  parts.push(uif("tlgSummaryTruths", { count: tlgSolverState.truths.length }));
  parts.push(uif("tlgSummaryUserLinks", { count: tlgSolverState.links.length }));
  if (tlgSolverState.resultLinksAvailable) {
    parts.push(uif("tlgSummaryResultLinks", { count: tlgSolverState.resultLinks.length }));
  }
  parts.push(`${ui("tlgVirtualSet1")}: ${tlgSolverState.virtualSets[0].size}`);
  parts.push(`${ui("tlgVirtualSet2")}: ${tlgSolverState.virtualSets[1].size}`);
  const activeAurGroups = tlgSolverState.aurGroups.filter((group) => group.size > 0);
  const aurCorners = activeAurGroups.reduce((sum, group) => sum + group.size, 0);
  parts.push(uif("tlgSummaryAurs", { count: activeAurGroups.length }));
  parts.push(uif("tlgSummaryAurCorners", { count: aurCorners }));
  parts.push(uif("tlgSummaryDaurCandidates", { count: tlgSolverState.dynamicAurCandidates.size }));
  parts.push(uif("tlgSummaryGurCandidates", { count: tlgSolverState.genericAurCandidates.size }));
  parts.push(ui((tlgSolverAurPremiseMode?.value || "unique-puzzle-derived") === "candidate-grid-asserted"
    ? "tlgSummaryPremiseTraining"
    : "tlgSummaryPremiseUnique"));
  const expandedDaurAurs = Number(tlgSolverState.lastResponse?.counts?.daurExpandedAurs || 0);
  if (tlgSolverState.dynamicAurCandidates.size > 0 && expandedDaurAurs > 0) {
    parts.push(uif("tlgSummaryDaurExpanded", { count: expandedDaurAurs }));
  }
  const acceptedGurs = Number(tlgSolverState.lastResponse?.counts?.gurAccepted || 0);
  if (tlgSolverState.genericAurCandidates.size > 0 && acceptedGurs > 0) {
    parts.push(uif("tlgSummaryGurAccepted", { count: acceptedGurs }));
  }
  if (tlgSolverState.candidateGrid) parts.push(uif("tlgSummaryGrid", { count: tlgSolverState.candidateGrid.count }));
  if (tlgSolverState.selectedCandidates.size) parts.push(uif("tlgSummarySelected", { count: tlgSolverState.selectedCandidates.size }));
  if (tlgSolverState.selectedEndpoint) parts.push(uif("tlgSummaryEndpoint", {
    value: tlgSolverNrc(tlgSolverState.selectedEndpoint.cellIndex, tlgSolverState.selectedEndpoint.digit),
  }));
  return parts.join(" | ");
}

function updateTlgSolverUi() {
  const enabled = tlgSolverEditingActive();
  const busy = !!tlgSolverState.busyTask;
  if (tlgSolverEnable) tlgSolverEnable.disabled = busy;
  if (tlgSolverMode) tlgSolverMode.disabled = !enabled || busy;
  if (tlgSolverAurPremiseMode) tlgSolverAurPremiseMode.disabled = !enabled || busy;
  if (btnTlgImportCandidates) btnTlgImportCandidates.disabled = !enabled || busy;
  const mode = tlgSolverMode?.value || "truths";
  const aurMode = mode === "aur";
  const virtualMode = mode === "virtualSet";
  if (tlgSolverAurGroupWrap) tlgSolverAurGroupWrap.hidden = !aurMode;
  if (tlgSolverAurGroup) tlgSolverAurGroup.disabled = !enabled || !aurMode || busy;
  if (tlgSolverVirtualGroupWrap) tlgSolverVirtualGroupWrap.hidden = !virtualMode;
  if (tlgSolverVirtualGroup) tlgSolverVirtualGroup.disabled = !enabled || !virtualMode || busy;
  if (tlgSolverTruthsToApplyWrap) tlgSolverTruthsToApplyWrap.hidden = !virtualMode;
  if (tlgSolverTruthsToApply) tlgSolverTruthsToApply.disabled = !enabled || !virtualMode || busy;
  if (tlgSolverLinkType) tlgSolverLinkType.disabled = !enabled || busy;
  if (btnTlgFindEliminations) {
    btnTlgFindEliminations.disabled = !enabled || busy;
    btnTlgFindEliminations.setAttribute("aria-busy", busy ? "true" : "false");
  }
  if (btnTlgClear) btnTlgClear.disabled = busy;
  updateTlgSolverActionGate();
  renderTlgSolverStateList();
  if (tlgSolverDebug) tlgSolverDebug.hidden = !APP_DEBUG_MODE;
  if (tlgSolverSolution) {
    if (enabled && tlgSolverState.lastResponse) {
      if (tlgSolverSolutionPanel) tlgSolverSolutionPanel.hidden = false;
      tlgSolverSolution.hidden = false;
      tlgSolverSolution.textContent = buildTlgSolutionText(tlgSolverState.lastResponse);
    } else {
      if (tlgSolverSolutionPanel) tlgSolverSolutionPanel.hidden = true;
      tlgSolverSolution.hidden = true;
      tlgSolverSolution.textContent = "";
    }
  }
  if (!enabled) {
    setTlgSolverStatus(ui("tlgStatusOptional"));
  } else if (tlgSolverState.lastMessage) {
    setTlgSolverStatus(`${tlgSolverState.lastMessage} | ${summarizeTlgSolverState(ui("tlgEditingEnabled"))}`, tlgSolverState.lastTone || "ok");
  } else {
    setTlgSolverStatus(summarizeTlgSolverState(ui("tlgEditingEnabled")));
  }
}

function applyTlgSolverMarksToCellElement(cellNode, cellIndex) {
  if (!tlgSolverEditingActive()) return;
  if (!tlgSolverCellAcceptsInput(cellIndex)) return;

  const candidates = [...cellNode.querySelectorAll(".candidate[data-digit]")];
  candidates.forEach((candidate) => {
    const digit = Number(candidate.dataset.digit || 0);
    if (!digit || !candidate.textContent.trim()) return;
    const key = tlgSolverCandidateKey(cellIndex, digit);
    if (tlgSolverState.virtualSets[0].has(key)) candidate.classList.add("tlg-virtual-candidate", "tlg-virtual-candidate-a");
    if (tlgSolverState.virtualSets[1].has(key)) candidate.classList.add("tlg-virtual-candidate", "tlg-virtual-candidate-b");
    if (tlgSolverState.aurGroups[0].has(key)) candidate.classList.add("tlg-aur-group-a");
    if (tlgSolverState.aurGroups[1].has(key)) candidate.classList.add("tlg-aur-group-b");
    if (tlgSolverState.dynamicAurCandidates.has(key)) candidate.classList.add("tlg-daur-candidate");
    if (tlgSolverState.genericAurCandidates.has(key)) candidate.classList.add("tlg-gur-candidate");
    if (tlgSolverState.selectedCandidates.has(key)) candidate.classList.add("tlg-selected-candidate");

    const isElimination = tlgSolverState.eliminations.some((item) => {
      const normalized = normalizeTlgResponseCandidate(item);
      return normalized && normalized.cell === cellIndex && normalized.digit === digit;
    });
    if (isElimination) candidate.classList.add("tlg-elimination");
    if (tlgDiagramRenderer.isCandidateCovered(key)) candidate.classList.add("tlg-diagram-covered");

    const endpoint = tlgSolverState.selectedEndpoint;
    if (endpoint && endpoint.cellIndex === cellIndex && endpoint.digit === digit) {
      candidate.classList.add("tlg-selected-endpoint");
    }
  });
}

function tlgDiagramRenderState() {
  return {
    truths: tlgSolverState.truths,
    links: tlgSolverEffectiveLinks(),
    virtualSets: tlgSolverState.virtualSets,
    aurGroups: tlgSolverState.aurGroups,
    dynamicAurCandidates: tlgSolverState.dynamicAurCandidates,
    genericAurCandidates: tlgSolverState.genericAurCandidates,
    selectedCandidates: tlgSolverState.selectedCandidates,
    selectedEndpoint: tlgSolverState.selectedEndpoint,
    eliminations: tlgSolverState.eliminations,
    assignments: tlgSolverState.assignments,
  };
}

if (APP_DEBUG_MODE) {
  window.__YZF_TLG_DIAGRAM_TEST__ = Object.freeze({
    applyFixture(fixture = {}) {
      const cells = Array.from({ length: 81 }, (_, index) => ({
        index,
        value: Number(fixture.cells?.[index]?.value || 0),
        candidates: [...new Set((fixture.cells?.[index]?.candidates || [9]).map(Number))]
          .filter((digit) => digit >= 1 && digit <= 9)
          .sort((a, b) => a - b),
      }));
      const snapshot = {
        board: String(fixture.board || ".".repeat(81)).slice(0, 81).padEnd(81, "."),
        givens: String(fixture.givens || ".".repeat(81)).slice(0, 81).padEnd(81, "."),
        cells,
        revision: "TLG-TEST",
        source: "tlg-diagram-browser-test",
      };
      const activeCandidates = new Set();
      cells.forEach((cell, index) => cell.candidates.forEach((digit) => activeCandidates.add(tlgSolverCandidateKey(index, digit))));
      if (tlgSolverEnable) tlgSolverEnable.checked = true;
      tlgSolverState.candidateGrid = {
        snapshot,
        activeCandidates,
        initialCandidates: new Set(activeCandidates),
        count: activeCandidates.size,
        format: "test",
      };
      tlgSolverState.truths = [...(fixture.truths || [])];
      tlgSolverState.links = [...(fixture.links || [])];
      tlgSolverState.resultLinks = [...(fixture.resultLinks || [])];
      tlgSolverState.resultLinksAvailable = !!fixture.resultLinksAvailable;
      tlgSolverState.virtualSets = [
        new Set(fixture.virtual1 || fixture.virtualCandidates || []),
        new Set(fixture.virtual2 || []),
      ];
      tlgSolverState.virtualSetCardinalities = [
        Math.max(1, Math.min(4, Number(fixture.virtualCardinality1 || 1) || 1)),
        Math.max(1, Math.min(4, Number(fixture.virtualCardinality2 || 1) || 1)),
      ];
      tlgSolverState.aurGroups = [new Set(fixture.aur1 || []), new Set(fixture.aur2 || [])];
      tlgSolverState.dynamicAurCandidates = new Set(fixture.daur || []);
      tlgSolverState.genericAurCandidates = new Set(fixture.gur || []);
      tlgSolverState.selectedCandidates = new Set(fixture.selected || []);
      tlgSolverState.selectedEndpoint = fixture.endpoint || null;
      tlgSolverState.eliminations = [...(fixture.eliminations || [])];
      tlgSolverState.assignments = [...(fixture.assignments || [])];
      renderBoardSnapshot(currentSnapshot, null);
      updateTlgSolverUi();
      return tlgDiagramRenderer.inspect();
    },
    disable() {
      if (tlgSolverEnable) tlgSolverEnable.checked = false;
      tlgSolverState.candidateGrid = null;
      renderBoardSnapshot(currentSnapshot, null);
      updateTlgSolverUi();
    },
    async captureStats() {
      const canvas = await captureBoardStageDomCanvas();
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const pixels = context?.getImageData(0, 0, canvas.width, canvas.height).data || [];
      const counts = { blue: 0, red: 0, purple: 0, green: 0, brown: 0 };
      for (let index = 0; index < pixels.length; index += 16) {
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const a = pixels[index + 3];
        if (a < 96) continue;
        if (b > 145 && b > r * 1.12 && b > g * 1.06) counts.blue += 1;
        if (r > 155 && r > g * 1.45 && r > b * 1.28) counts.red += 1;
        if (r > 105 && b > 105 && r > g * 1.18 && b > g * 1.12) counts.purple += 1;
        if (g > 90 && g > r * 1.18 && g > b * 1.03) counts.green += 1;
        if (r > 105 && g > 55 && r > g * 1.2 && g > b * 1.2) counts.brown += 1;
      }
      return { width: canvas.width, height: canvas.height, ...counts };
    },
    render() { renderBoardSnapshot(currentSnapshot, null); },
    inspect() {
      return {
        ...tlgDiagramRenderer.inspect(),
        endpoint: tlgSolverState.selectedEndpoint ? { ...tlgSolverState.selectedEndpoint } : null,
      };
    },
  });
}

let tlgTouchSuppressClickUntil = 0;
let tlgTouchSuppressCandidateKey = "";

function installTlgCandidateProtectedTouch(candidate, cellIndex) {
  if (!candidate) return;
  let timer = 0;
  let touchId = null;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let longPressFired = false;
  const suppressionKey = () => `tlg:${cellIndex}:${Number(candidate.dataset.digit || 0)}`;
  const enabled = () => {
    const digit = Number(candidate.dataset.digit || 0);
    return tlgSolverEditingActive() && !tlgSolverState.busyTask &&
      tlgSolverCellAcceptsInput(cellIndex) && digit > 0 && Boolean(candidate.textContent.trim());
  };
  const clearTimer = () => {
    if (timer) window.clearTimeout(timer);
    timer = 0;
  };
  const reset = () => {
    clearTimer();
    touchId = null;
    longPressFired = false;
  };
  const findTouch = (list) => {
    if (touchId == null) return null;
    return Array.from(list || []).find((touch) => touch.identifier === touchId) || null;
  };
  const suppressFollowup = (event) => {
    if (Date.now() > tlgTouchSuppressClickUntil) return;
    if (tlgTouchSuppressCandidateKey !== suppressionKey()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type === "click") {
      tlgTouchSuppressClickUntil = 0;
      tlgTouchSuppressCandidateKey = "";
    }
  };
  const armSuppression = () => {
    tlgTouchSuppressClickUntil = Date.now() + 1100;
    tlgTouchSuppressCandidateKey = suppressionKey();
  };
  const syntheticEvent = (additive = false) => ({
    preventDefault() {},
    stopPropagation() {},
    clientX: lastX,
    clientY: lastY,
    ctrlKey: additive,
    metaKey: false,
    pointerType: "touch",
    tlgTouch: true,
  });

  candidate.style.touchAction = "manipulation";
  candidate.style.userSelect = "none";
  candidate.style.webkitUserSelect = "none";
  candidate.style.webkitTouchCallout = "none";
  candidate.addEventListener("click", suppressFollowup, true);
  candidate.addEventListener("contextmenu", (event) => {
    if (Date.now() <= tlgTouchSuppressClickUntil && tlgTouchSuppressCandidateKey === suppressionKey()) {
      suppressFollowup(event);
    }
  }, true);
  candidate.addEventListener("touchstart", (event) => {
    if (!enabled()) return;
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    event.preventDefault();
    event.stopPropagation();
    reset();
    touchId = touch.identifier;
    startX = lastX = touch.clientX;
    startY = lastY = touch.clientY;
    timer = window.setTimeout(() => {
      timer = 0;
      if (!enabled() || touchId == null) return;
      longPressFired = true;
      armSuppression();
      try { navigator.vibrate?.(12); } catch {}
      const digit = Number(candidate.dataset.digit || 0);
      // Touch long-press is additive so users can close the menu, long-press
      // more candidates, then execute one batch operation.
      openTlgSolverContextMenu(cellIndex, digit, syntheticEvent(true), candidate);
    }, MANUAL_MARK_LONG_PRESS_MS);
  }, { passive: false });
  candidate.addEventListener("touchmove", (event) => {
    const touch = findTouch(event.changedTouches) || findTouch(event.touches);
    if (!touch) return;
    event.preventDefault();
    lastX = touch.clientX;
    lastY = touch.clientY;
    if (Math.hypot(lastX - startX, lastY - startY) > MANUAL_MARK_LONG_PRESS_MOVE_PX) reset();
  }, { passive: false });
  candidate.addEventListener("touchend", (event) => {
    const touch = findTouch(event.changedTouches);
    if (!touch) return;
    event.preventDefault();
    event.stopPropagation();
    lastX = touch.clientX;
    lastY = touch.clientY;
    const shouldTap = Boolean(timer) && !longPressFired;
    clearTimer();
    armSuppression();
    touchId = null;
    if (shouldTap && enabled()) {
      const digit = Number(candidate.dataset.digit || 0);
      handleTlgSolverCandidateClick(cellIndex, digit, syntheticEvent(false), candidate);
    }
    longPressFired = false;
  }, { passive: false });
  candidate.addEventListener("touchcancel", (event) => {
    if (touchId == null) return;
    event.preventDefault();
    reset();
  }, { passive: false });
}

let tlgContextMenuNode = null;
let tlgContextMenuListenersInstalled = false;

function tlgSelectedCandidatePoints() {
  return [...tlgSolverState.selectedCandidates].map((key) => {
    const [cellText, digitText] = String(key).split(":");
    const cellIndex = Number(cellText);
    const digit = Number(digitText);
    return { key, cellIndex, digit };
  }).filter((point) => Number.isInteger(point.cellIndex) && point.cellIndex >= 0 && point.cellIndex < 81 && Number.isInteger(point.digit) && point.digit >= 1 && point.digit <= 9);
}

function tlgCandidatePointFromNrc(value) {
  const match = /^([1-9])r([1-9])c([1-9])$/i.exec(String(value || "").trim());
  if (!match) return null;
  return { digit: Number(match[1]), row: Number(match[2]), column: Number(match[3]) };
}

function tlgDescriptorFromEndpointPair(rawValue) {
  const raw = String(rawValue || "").trim().toLowerCase();
  const matches = [...raw.matchAll(/([1-9]r[1-9]c[1-9])/g)];
  if (matches.length < 2) return "";
  const a = tlgCandidatePointFromNrc(matches[0][1]);
  const b = tlgCandidatePointFromNrc(matches[1][1]);
  if (!a || !b) return "";
  const sameCell = a.row === b.row && a.column === b.column;
  const sameDigit = a.digit === b.digit;
  const sameRow = a.row === b.row;
  const sameColumn = a.column === b.column;
  const boxOf = (point) => Math.floor((point.row - 1) / 3) * 3 + Math.floor((point.column - 1) / 3) + 1;
  const sameBox = boxOf(a) === boxOf(b);

  if (raw.startsWith("cell-") || (sameCell && !raw.startsWith("row-") && !raw.startsWith("column-") && !raw.startsWith("box-"))) {
    return sameCell ? `${a.row}n${a.column}` : "";
  }
  if (raw.startsWith("row-")) return sameDigit && sameRow ? `${a.digit}r${a.row}` : "";
  if (raw.startsWith("column-")) return sameDigit && sameColumn ? `${a.digit}c${a.column}` : "";
  if (raw.startsWith("box-")) return sameDigit && sameBox ? `${a.digit}b${boxOf(a)}` : "";
  if (sameCell) return `${a.row}n${a.column}`;
  if (sameDigit && sameRow) return `${a.digit}r${a.row}`;
  if (sameDigit && sameColumn) return `${a.digit}c${a.column}`;
  if (sameDigit && sameBox) return `${a.digit}b${boxOf(a)}`;
  return "";
}

function tlgCanonicalDescriptor(value) {
  const raw = String(value || "").trim().toLowerCase();
  const stripped = raw.replace(
    /^(descriptor-truth:|descriptor-link:|truth-descriptor:|link-descriptor:|row-truth:|column-truth:|box-truth:)/,
    "",
  );
  if (/^[1-9][rcnb][1-9]$/.test(stripped)) return stripped;
  const cellTruth = /^cell-truth:r([1-9])c([1-9])$/.exec(raw);
  if (cellTruth) return `${cellTruth[1]}n${cellTruth[2]}`;
  return tlgDescriptorFromEndpointPair(raw);
}

function tlgCanonicalDescriptorState(values, kind) {
  const prefix = kind === "links" ? "descriptor-link:" : "descriptor-truth:";
  const out = [];
  const seen = new Set();
  for (const value of values || []) {
    const canonical = tlgCanonicalDescriptor(value);
    const key = canonical || `raw:${String(value || "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(canonical ? `${prefix}${canonical}` : value);
  }
  return out;
}

function tlgDescriptorForCandidate(cellIndex, digit, family) {
  const row = Math.floor(cellIndex / 9) + 1;
  const column = (cellIndex % 9) + 1;
  if (family === "row") return `${digit}r${row}`;
  if (family === "column") return `${digit}c${column}`;
  if (family === "cell") return `${row}n${column}`;
  if (family === "box") return `${digit}b${tlgSolverBoxIndex(cellIndex)}`;
  return "";
}

function tlgBatchToggleDescriptors(kind, tokens, label = kind) {
  const normalizedState = tlgCanonicalDescriptorState(
    kind === "links" ? tlgSolverState.links : tlgSolverState.truths,
    kind,
  );
  if (kind === "links") tlgSolverState.links = normalizedState;
  else tlgSolverState.truths = normalizedState;
  const target = kind === "links" ? tlgSolverState.links : tlgSolverState.truths;
  const normalized = [...new Set((tokens || []).map((token) => String(token || "").toLowerCase()).filter((token) => /^[1-9][rcnb][1-9]$/.test(token)))];
  if (!normalized.length) return;
  const tokenSet = new Set(normalized);
  const existing = new Set(target.map(tlgCanonicalDescriptor).filter(Boolean));
  const remove = normalized.every((token) => existing.has(token));
  let changedCount = 0;
  if (remove) {
    const next = target.filter((item) => {
      const matched = tokenSet.has(tlgCanonicalDescriptor(item));
      if (matched) changedCount += 1;
      return !matched;
    });
    if (kind === "links") tlgSolverState.links = next;
    else tlgSolverState.truths = next;
  } else {
    const prefix = kind === "links" ? "descriptor-link:" : "descriptor-truth:";
    for (const token of normalized) {
      if (existing.has(token)) continue;
      target.push(`${prefix}${token}`);
      existing.add(token);
      changedCount += 1;
    }
  }
  tlgSolverState.selectedEndpoint = null;
  tlgSolverState.selectedCandidates.clear();
  announceTlgSolver(uif(remove ? "tlgBatchRemoved" : "tlgBatchAdded", { count: changedCount, kind: label }));
  renderBoardSnapshot(currentSnapshot, currentHint);
  updateTlgSolverUi();
}

function tlgBatchToggleCandidateSet(target, label) {
  const keys = [...tlgSolverState.selectedCandidates];
  if (!keys.length) return;
  const remove = keys.every((key) => target.has(key));
  for (const key of keys) {
    if (remove) target.delete(key);
    else target.add(key);
  }
  tlgSolverState.selectedEndpoint = null;
  tlgSolverState.selectedCandidates.clear();
  announceTlgSolver(uif(remove ? "tlgBatchToggledOff" : "tlgBatchToggledOn", { count: keys.length, kind: label }));
  renderBoardSnapshot(currentSnapshot, currentHint);
  updateTlgSolverUi();
}

function tlgActiveCandidateKeysForCell(cellIndex) {
  const prefix = `${cellIndex}:`;
  if (tlgSolverState.candidateGrid?.activeCandidates) {
    return [...tlgSolverState.candidateGrid.activeCandidates].filter((key) => String(key).startsWith(prefix));
  }
  const cell = tlgSolverEffectiveSnapshot()?.cells?.[cellIndex];
  if (!cell || Number(cell.value || 0) > 0) return [];
  return [...new Set(cell.candidates || [])]
    .map(Number)
    .filter((digit) => digit >= 1 && digit <= 9)
    .map((digit) => tlgSolverCandidateKey(cellIndex, digit));
}

function tlgBatchToggleGurCells() {
  const cells = [...new Set([...tlgSolverState.selectedCandidates].map((key) => Number(String(key).split(":")[0])))]
    .filter((cellIndex) => Number.isInteger(cellIndex) && tlgSolverCellAcceptsInput(cellIndex));
  if (!cells.length) return;
  const keys = [...new Set(cells.flatMap(tlgActiveCandidateKeysForCell))];
  if (!keys.length) return;
  const remove = keys.every((key) => tlgSolverState.genericAurCandidates.has(key));
  for (const key of keys) {
    if (remove) tlgSolverState.genericAurCandidates.delete(key);
    else tlgSolverState.genericAurCandidates.add(key);
  }
  tlgSolverState.selectedEndpoint = null;
  tlgSolverState.selectedCandidates.clear();
  announceTlgSolver(uif(remove ? "tlgGurCellsToggledOff" : "tlgGurCellsToggledOn", {
    cells: cells.length,
    count: keys.length,
  }));
  renderBoardSnapshot(currentSnapshot, currentHint);
  updateTlgSolverUi();
}

function clearTlgSolverLogicOnly(messageKey = "tlgLogicCleared") {
  tlgSolverState.selectedEndpoint = null;
  tlgSolverState.selectedCandidates.clear();
  tlgSolverState.truths = [];
  tlgSolverState.links = [];
  tlgSolverState.resultLinks = [];
  tlgSolverState.resultLinksAvailable = false;
  tlgSolverState.virtualSets.forEach((group) => group.clear());
  tlgSolverState.virtualSetCardinalities = [1, 1];
  tlgSolverState.aurGroups.forEach((group) => group.clear());
  tlgSolverState.dynamicAurCandidates.clear();
  tlgSolverState.genericAurCandidates.clear();
  clearTlgSolverComputedResult();
  tlgSolverState.lastMessage = ui(messageKey);
  tlgSolverState.lastTone = "ok";
  renderBoardSnapshot(currentSnapshot, currentHint);
  updateTlgSolverUi();
}

function closeTlgSolverContextMenu() {
  tlgContextMenuNode?.remove();
  tlgContextMenuNode = null;
}

function tlgMenuButton(label, handler, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `tlg-context-item ${className}`.trim();
  button.setAttribute("role", "menuitem");
  button.textContent = label;
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handler();
    closeTlgSolverContextMenu();
  });
  return button;
}

function tlgMenuSubmenu(label, entries) {
  const wrapper = document.createElement("div");
  wrapper.className = "tlg-context-submenu-wrap";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "tlg-context-item tlg-context-submenu-trigger";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  trigger.textContent = label;
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const open = !wrapper.classList.contains("tlg-context-submenu-open");
    wrapper.parentElement?.querySelectorAll?.(".tlg-context-submenu-wrap.tlg-context-submenu-open").forEach((node) => {
      if (node !== wrapper) {
        node.classList.remove("tlg-context-submenu-open");
        node.querySelector?.(".tlg-context-submenu-trigger")?.setAttribute("aria-expanded", "false");
      }
    });
    wrapper.classList.toggle("tlg-context-submenu-open", open);
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  const submenu = document.createElement("div");
  submenu.className = "tlg-context-submenu";
  submenu.setAttribute("role", "menu");
  for (const entry of entries) {
    if (entry.separator) {
      const separator = document.createElement("div");
      separator.className = "tlg-context-separator";
      separator.setAttribute("role", "separator");
      submenu.appendChild(separator);
    } else {
      submenu.appendChild(tlgMenuButton(entry.label, entry.handler));
    }
  }
  wrapper.append(trigger, submenu);
  return wrapper;
}

function installTlgContextMenuListeners() {
  if (tlgContextMenuListenersInstalled) return;
  tlgContextMenuListenersInstalled = true;
  document.addEventListener("pointerdown", (event) => {
    if (tlgContextMenuNode && !tlgContextMenuNode.contains(event.target)) closeTlgSolverContextMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTlgSolverContextMenu();
  });
  window.addEventListener("blur", closeTlgSolverContextMenu);
  window.addEventListener("resize", closeTlgSolverContextMenu);
  window.addEventListener("scroll", closeTlgSolverContextMenu, true);
}

function openTlgSolverContextMenu(cellIndex, digit, event, candidate) {
  if (!tlgSolverEditingActive()) return false;
  // Right-click/long-press on any TLG board location is exclusively owned by
  // TLG. Invalid or empty slots are swallowed instead of restoring candidates
  // through the ordinary board editor or opening the browser context menu.
  consumeTlgSolverFixedCellEvent(event);
  closeTlgSolverContextMenu();
  if (tlgSolverState.busyTask) return true;
  if (!tlgSolverCellAcceptsInput(cellIndex)) return true;
  if (!digit || !candidate?.textContent?.trim()) return true;
  installTlgContextMenuListeners();

  const key = tlgSolverCandidateKey(cellIndex, digit);
  const additive = !!(event?.ctrlKey || event?.metaKey);
  if (!tlgSolverState.selectedCandidates.has(key)) {
    if (!additive) tlgSolverState.selectedCandidates.clear();
    tlgSolverState.selectedCandidates.add(key);
  }
  tlgSolverState.selectedEndpoint = null;
  selectedIndex = cellIndex;
  renderBoardSnapshot(currentSnapshot, currentHint);

  const points = tlgSelectedCandidatePoints();
  const root = document.createElement("div");
  root.className = "tlg-context-menu";
  root.setAttribute("role", "menu");
  root.addEventListener("contextmenu", (menuEvent) => menuEvent.preventDefault());
  const header = document.createElement("div");
  header.className = "tlg-context-header";
  header.textContent = points.length === 1
    ? uif("tlgContextCandidate", { value: tlgSolverNrc(points[0].cellIndex, points[0].digit) })
    : uif("tlgContextCandidates", { count: points.length });
  root.appendChild(header);

  const familyEntries = (kind) => [
    ["row", "tlgMenuRow"], ["column", "tlgMenuColumn"], ["cell", "tlgMenuCell"], ["box", "tlgMenuBox"],
  ].map(([family, labelKey]) => ({
    label: ui(labelKey),
    handler: () => tlgBatchToggleDescriptors(kind, points.map((point) => tlgDescriptorForCandidate(point.cellIndex, point.digit, family)), kind === "links" ? ui("tlgLinks") : ui("tlgTruths")),
  }));
  root.appendChild(tlgMenuSubmenu(ui("tlgAddSubTruth"), familyEntries("truths")));
  root.appendChild(tlgMenuSubmenu(ui("tlgAddSubLink"), familyEntries("links")));

  const separator1 = document.createElement("div");
  separator1.className = "tlg-context-separator";
  separator1.setAttribute("role", "separator");
  root.appendChild(separator1);
  root.appendChild(tlgMenuButton(ui("tlgToggleVirtualSet1Batch"), () =>
    tlgBatchToggleCandidateSet(tlgSolverState.virtualSets[0], ui("tlgVirtualSet1"))));
  root.appendChild(tlgMenuButton(ui("tlgToggleVirtualSet2Batch"), () =>
    tlgBatchToggleCandidateSet(tlgSolverState.virtualSets[1], ui("tlgVirtualSet2"))));
  root.appendChild(tlgMenuButton(ui("tlgToggleAur1Batch"), () => {
    tlgBatchToggleCandidateSet(tlgSolverState.aurGroups[0], ui("tlgAurGroup1"));
  }));
  root.appendChild(tlgMenuButton(ui("tlgToggleAur2Batch"), () => {
    tlgBatchToggleCandidateSet(tlgSolverState.aurGroups[1], ui("tlgAurGroup2"));
  }));
  root.appendChild(tlgMenuButton(ui("tlgToggleDaurBatch"), () => {
    tlgBatchToggleCandidateSet(tlgSolverState.dynamicAurCandidates, ui("tlgDaurCandidates"));
  }));
  root.appendChild(tlgMenuButton(ui("tlgToggleGurCells"), () => {
    tlgBatchToggleGurCells();
  }));
  root.appendChild(tlgMenuButton(ui("tlgToggleGurBatch"), () => {
    tlgBatchToggleCandidateSet(tlgSolverState.genericAurCandidates, ui("tlgGurCandidates"));
  }));
  const separator2 = document.createElement("div");
  separator2.className = "tlg-context-separator";
  separator2.setAttribute("role", "separator");
  root.appendChild(separator2);
  root.appendChild(tlgMenuButton(ui("tlgClearCandidateSelection"), () => {
    tlgSolverState.selectedCandidates.clear();
    tlgSolverState.selectedEndpoint = null;
    renderBoardSnapshot(currentSnapshot, currentHint);
    updateTlgSolverUi();
  }));
  root.appendChild(tlgMenuButton(ui("tlgClearAllLogic"), () => clearTlgSolverLogicOnly()));

  document.body.appendChild(root);
  const menuWidth = root.offsetWidth || 250;
  const menuHeight = root.offsetHeight || 360;
  const margin = 8;
  let left = Math.max(margin, Math.min(Number(event?.clientX || 0), window.innerWidth - menuWidth - margin));
  let top = Math.max(margin, Math.min(Number(event?.clientY || 0), window.innerHeight - menuHeight - margin));
  root.style.left = `${left}px`;
  root.style.top = `${top}px`;
  if (left + menuWidth + 250 > window.innerWidth) root.classList.add("tlg-context-open-left");
  tlgContextMenuNode = root;
  setTlgSolverStatus(uif("tlgCandidatesSelected", { count: points.length }));
  return true;
}

function inferTlgSetFromEndpoints(a, b, mode) {
  const ar = Math.floor(a.cellIndex / 9), ac = a.cellIndex % 9;
  const br = Math.floor(b.cellIndex / 9), bc = b.cellIndex % 9;
  const sameCell = a.cellIndex === b.cellIndex;
  const sameDigit = a.digit === b.digit;
  const sameRow = ar === br;
  const sameCol = ac === bc;
  const sameBox = tlgSolverBoxIndex(a.cellIndex) === tlgSolverBoxIndex(b.cellIndex);
  if (mode === "links") {
    const forced = tlgSolverLinkType?.value || "auto";
    if ((forced === "cell" || forced === "auto") && sameCell) {
      return `cell-link:${tlgSolverNrc(a.cellIndex, a.digit)}~${tlgSolverNrc(b.cellIndex, b.digit)}`;
    }
    if (forced === "box" && sameBox) return `box-link:${tlgSolverNrc(a.cellIndex, a.digit)}~${tlgSolverNrc(b.cellIndex, b.digit)}`;
    if (sameRow) return `row-link:r${ar + 1}:${tlgSolverNrc(a.cellIndex, a.digit)}~${tlgSolverNrc(b.cellIndex, b.digit)}`;
    if (sameCol) return `column-link:c${ac + 1}:${tlgSolverNrc(a.cellIndex, a.digit)}~${tlgSolverNrc(b.cellIndex, b.digit)}`;
    if (sameBox) return `box-link:b${tlgSolverBoxIndex(a.cellIndex)}:${tlgSolverNrc(a.cellIndex, a.digit)}~${tlgSolverNrc(b.cellIndex, b.digit)}`;
    return `link:${tlgSolverNrc(a.cellIndex, a.digit)}~${tlgSolverNrc(b.cellIndex, b.digit)}`;
  }
  if (sameCell) return `cell-truth:${tlgSolverCellText(a.cellIndex)}`;
  if (sameDigit && sameRow) return `row-truth:${a.digit}r${ar + 1}`;
  if (sameDigit && sameCol) return `column-truth:${a.digit}c${ac + 1}`;
  if (sameDigit && sameBox) return `box-truth:${a.digit}b${tlgSolverBoxIndex(a.cellIndex)}`;
  return "";
}

function toggleTlgDescriptorValue(array, value, kind) {
  const canonical = tlgCanonicalDescriptor(value);
  if (!canonical) {
    const idx = array.indexOf(value);
    if (idx >= 0) {
      array.splice(idx, 1);
      return false;
    }
    array.push(value);
    return true;
  }
  const matches = [];
  for (let index = 0; index < array.length; index += 1) {
    if (tlgCanonicalDescriptor(array[index]) === canonical) matches.push(index);
  }
  if (matches.length) {
    for (let index = matches.length - 1; index >= 0; index -= 1) array.splice(matches[index], 1);
    return false;
  }
  const prefix = kind === "links" ? "descriptor-link:" : "descriptor-truth:";
  array.push(`${prefix}${canonical}`);
  return true;
}

function handleTlgSolverCandidateClick(cellIndex, digit, event, candidate) {
  if (!tlgSolverEditingActive()) return false;
  // TLG owns every board event while editing is enabled. Even an empty
  // candidate slot is a handled no-op; it must never fall through to normal
  // Value/Candidate input or manual-mark handlers.
  consumeTlgSolverFixedCellEvent(event);
  closeTlgSolverContextMenu();
  if (tlgSolverState.busyTask) return true;
  if (!tlgSolverCellAcceptsInput(cellIndex)) return true;
  const mode = tlgSolverMode?.value || "truths";
  if (!digit || !candidate?.textContent?.trim()) {
    // Empty candidate positions are the only practical cell-background target
    // in the 3x3 candidate grid. Preserve the documented Cell Truth shortcut
    // for a plain Truths-mode click, but never let Ctrl/Command selection or
    // other TLG modes fall through to ordinary Sudoku editing.
    if (mode === "truths" && !(event?.ctrlKey || event?.metaKey)) {
      return toggleTlgSolverCellTruth(cellIndex);
    }
    return true;
  }
  selectedIndex = cellIndex;
  const key = tlgSolverCandidateKey(cellIndex, digit);
  if (event?.ctrlKey || event?.metaKey) {
    if (tlgSolverState.selectedCandidates.has(key)) tlgSolverState.selectedCandidates.delete(key);
    else tlgSolverState.selectedCandidates.add(key);
    tlgSolverState.selectedEndpoint = null;
    renderBoardSnapshot(currentSnapshot, currentHint);
    setTlgSolverStatus(uif("tlgCandidatesSelected", { count: tlgSolverState.selectedCandidates.size }));
    return true;
  }
  if (tlgSolverState.selectedCandidates.size) tlgSolverState.selectedCandidates.clear();
  if (mode === "virtualSet") {
    const virtualSet = tlgSelectedVirtualSet();
    const added = !virtualSet.has(key);
    if (added) virtualSet.add(key);
    else virtualSet.delete(key);
    tlgSolverState.selectedEndpoint = null;
    announceTlgSolver(uif(added ? "tlgVirtualCandidateAdded" : "tlgVirtualCandidateRemoved", { value: tlgSolverNrc(cellIndex, digit) }));
    renderBoardSnapshot(currentSnapshot, currentHint);
    updateTlgSolverUi();
    return true;
  }
  if (mode === "aur") {
    const groupIndex = Math.max(0, Math.min(1, Number(tlgSolverAurGroup?.value || 0) || 0));
    const group = tlgSolverState.aurGroups[groupIndex];
    const added = !group.has(key);
    if (added) group.add(key);
    else group.delete(key);
    tlgSolverState.selectedEndpoint = null;
    announceTlgSolver(uif(added ? "tlgAurCornerAddedGroup" : "tlgAurCornerRemovedGroup", {
      group: ui(groupIndex === 0 ? "tlgAurGroup1" : "tlgAurGroup2"),
      value: tlgSolverNrc(cellIndex, digit),
    }));
    renderBoardSnapshot(currentSnapshot, currentHint);
    updateTlgSolverUi();
    return true;
  }
  if (mode === "daur") {
    const added = !tlgSolverState.dynamicAurCandidates.has(key);
    if (added) tlgSolverState.dynamicAurCandidates.add(key);
    else tlgSolverState.dynamicAurCandidates.delete(key);
    tlgSolverState.selectedEndpoint = null;
    announceTlgSolver(uif(added ? "tlgDaurCandidateAdded" : "tlgDaurCandidateRemoved", {
      value: tlgSolverNrc(cellIndex, digit),
    }));
    renderBoardSnapshot(currentSnapshot, currentHint);
    updateTlgSolverUi();
    return true;
  }
  if (mode === "gur") {
    const added = !tlgSolverState.genericAurCandidates.has(key);
    if (added) tlgSolverState.genericAurCandidates.add(key);
    else tlgSolverState.genericAurCandidates.delete(key);
    tlgSolverState.selectedEndpoint = null;
    announceTlgSolver(uif(added ? "tlgGurCandidateAdded" : "tlgGurCandidateRemoved", {
      value: tlgSolverNrc(cellIndex, digit),
    }));
    renderBoardSnapshot(currentSnapshot, currentHint);
    updateTlgSolverUi();
    return true;
  }
  const point = { cellIndex, digit };
  if (!tlgSolverState.selectedEndpoint) {
    tlgSolverState.selectedEndpoint = point;
    announceTlgSolver(uif("tlgEndpointSelected", { value: tlgSolverNrc(cellIndex, digit) }));
    renderBoardSnapshot(currentSnapshot, currentHint);
    updateTlgSolverUi();
    return true;
  }
  const value = inferTlgSetFromEndpoints(tlgSolverState.selectedEndpoint, point, mode);
  if (!value) {
    tlgSolverState.selectedEndpoint = null;
    setTlgSolverStatus(ui("tlgTruthPairInvalid"), "error");
    renderBoardSnapshot(currentSnapshot, currentHint);
    updateTlgSolverUi();
    return true;
  }
  const added = mode === "links" ? toggleTlgDescriptorValue(tlgSolverState.links, value, "links") : toggleTlgDescriptorValue(tlgSolverState.truths, value, "truths");
  announceTlgSolver(uif(mode === "links" ? (added ? "tlgLinkAdded" : "tlgLinkRemoved") : (added ? "tlgTruthAdded" : "tlgTruthRemoved"), { value: tlgSolverPrettyValue(value) }));
  tlgSolverState.selectedEndpoint = null;
  renderBoardSnapshot(currentSnapshot, currentHint);
  updateTlgSolverUi();
  return true;
}

function toggleTlgSolverCellTruth(cellIndex) {
  tlgSolverState.selectedCandidates.clear();
  selectedIndex = cellIndex;
  const value = `cell-truth:${tlgSolverCellText(cellIndex)}`;
  const added = toggleTlgDescriptorValue(tlgSolverState.truths, value, "truths");
  tlgSolverState.selectedEndpoint = null;
  announceTlgSolver(uif(added ? "tlgCellTruthAdded" : "tlgCellTruthRemoved", { value: tlgSolverCellText(cellIndex) }));
  renderBoardSnapshot(currentSnapshot, currentHint);
  updateTlgSolverUi();
  return true;
}

function handleTlgSolverCellClick(cellIndex, event) {
  if (!tlgSolverEditingActive()) return false;
  // Non-candidate cell clicks are also owned by TLG. In Truths mode the cell
  // background toggles a Cell Truth; in every other mode it is a safe no-op.
  consumeTlgSolverFixedCellEvent(event);
  closeTlgSolverContextMenu();
  if (tlgSolverState.busyTask) return true;
  if (!tlgSolverCellAcceptsInput(cellIndex)) return true;
  if ((tlgSolverMode?.value || "truths") !== "truths") return true;
  return toggleTlgSolverCellTruth(cellIndex);
}

function tlgCandidateKeysToPayload(keys) {
  return [...new Set(keys)].map((key) => {
    const [cellText, digitText] = String(key).split(":");
    const cellIndex = Number(cellText);
    const digit = Number(digitText);
    return {
      digit,
      cellIndex,
      row: Math.floor(cellIndex / 9) + 1,
      column: (cellIndex % 9) + 1,
      source: tlgSolverNrc(cellIndex, digit),
    };
  }).filter((candidate) =>
    Number.isInteger(candidate.cellIndex) && candidate.cellIndex >= 0 && candidate.cellIndex < 81 &&
    Number.isInteger(candidate.digit) && candidate.digit >= 1 && candidate.digit <= 9
  );
}

function tlgSolverActiveCandidatePayload() {
  const keys = tlgSolverState.candidateGrid
    ? [...tlgSolverState.candidateGrid.activeCandidates]
    : (tlgSolverEffectiveSnapshot()?.cells || []).flatMap((cell, cellIndex) => {
        if (Number(cell?.value || 0) > 0) return [];
        return (Array.isArray(cell?.candidates) ? cell.candidates : [])
          .map((digit) => tlgSolverCandidateKey(cellIndex, Number(digit)));
      });
  return tlgCandidateKeysToPayload(keys);
}

function tlgSolverInitialCandidatePayload() {
  if (tlgSolverState.candidateGrid?.initialCandidates) {
    return tlgCandidateKeysToPayload([...tlgSolverState.candidateGrid.initialCandidates]);
  }

  const givensText = snapshotGivensString(currentSnapshot);
  if (givensText.length !== 81) return [];
  const keys = [];
  for (let cellIndex = 0; cellIndex < 81; cellIndex += 1) {
    if (/[1-9]/.test(givensText[cellIndex] || ".")) continue;
    const mask = legalCandidateMaskForBoard(givensText, cellIndex);
    for (let digit = 1; digit <= 9; digit += 1) {
      if ((mask & (1 << digit)) !== 0) keys.push(tlgSolverCandidateKey(cellIndex, digit));
    }
  }
  return tlgCandidateKeysToPayload(keys);
}

function buildTlgSolverRequestV440(action = "findAllEliminations") {
  tlgStoreVirtualCardinalityInput();
  const virtualSets = tlgSolverState.virtualSets.map((group, index) => ({
    candidates: tlgCandidateKeysToPayload(group),
    cardinality: tlgSolverState.virtualSetCardinalities[index] || 1,
  })).filter((group) => group.candidates.length > 0);
  const legacyVirtualCandidates = virtualSets.length === 1 ? virtualSets[0].candidates : [];
  const aurGroups = tlgSolverState.aurGroups
    .map((group) => tlgCandidateKeysToPayload(group))
    .filter((corners) => corners.length > 0)
    .map((corners) => ({ corners }));
  const legacyAur = aurGroups.length === 1 ? { corners: aurGroups[0].corners } : undefined;
  const dynamicAurCandidates = tlgCandidateKeysToPayload(tlgSolverState.dynamicAurCandidates);
  const genericAurCandidates = tlgCandidateKeysToPayload(tlgSolverState.genericAurCandidates);
  const activeCandidates = tlgSolverActiveCandidatePayload();
  const aurPremiseMode = tlgSolverAurPremiseMode?.value || "unique-puzzle-derived";
  const initialCandidates = aurPremiseMode === "unique-puzzle-derived"
    ? tlgSolverInitialCandidatePayload()
    : [];
  return {
    inputKind: "tlg-solver-board-first-v440",
    action,
    visibleName: "TLG Solver",
    interaction: "board-first",
    candidateStateMode: "tlg-only",
    aurPremiseMode,
    activeCandidates,
    ...(aurPremiseMode === "unique-puzzle-derived" ? { initialCandidates } : {}),
    editingEnabled: tlgSolverEditingActive(),
    inputMode: tlgSolverMode?.value || "truths",
    linkType: tlgSolverLinkType?.value || "auto",
    truths: tlgCanonicalDescriptorState(tlgSolverState.truths, "truths"),
    links: tlgCanonicalDescriptorState(tlgSolverRequestLinks(action), "links"),
    virtualSets,
    ...(legacyVirtualCandidates.length ? { virtualSet: { candidates: legacyVirtualCandidates } } : {}),
    aurs: aurGroups,
    daurs: dynamicAurCandidates.length ? [{ candidates: dynamicAurCandidates }] : [],
    gurs: genericAurCandidates.length ? [{ candidates: genericAurCandidates }] : [],
    ...(legacyAur ? { aur: legacyAur } : {}),
    assumptions: { truthsToApply: virtualSets[0]?.cardinality || 1 },
    debugImportText: String(tlgSolverImportText?.value || ""),
    pipeline: ["find-all-eliminations", "convert-redundant-truths-to-links", "remove-unused-links"],
    actionGate: { convertAndRemoveRequireEliminationsOrAssignments: true },
  };
}

function callTlgSolverFindEliminationsV440(optionsOrJson = null) {
  if (!engine || typeof engine.tlgSolverFindEliminationsV440 !== "function") {
    throw new Error(ui("tlgUnavailable"));
  }
  const request = optionsOrJson || buildTlgSolverRequestV440();
  const requestJson = typeof request === "string" ? request : JSON.stringify(request);
  return engine.tlgSolverFindEliminationsV440(requestJson);
}

function localizeTlgBackendMessage(value) {
  const source = String(value || "");
  if (!source || lang.value !== "zh") return source;
  const exact = new Map([
    ["TLG_ACTION_FAILED", ui("tlgResultActionFailed")],
    ["solution-budget-exceeded", ui("tlgBackendSolutionBudget")],
    ["search-budget-exceeded", ui("tlgBackendSearchBudget")],
    ["cannot materialize an incomplete projection search: solution-budget-exceeded", ui("tlgBackendIncompleteSolutionBudget")],
    ["cannot materialize an incomplete projection search: search-budget-exceeded", ui("tlgBackendIncompleteSearchBudget")],
    ["cannot build projection context from an invalid normalized plan", ui("tlgBackendInvalidPlan")],
    ["cannot materialize a structure with no projection solutions", ui("tlgBackendNoProjection")],
    ["candidate pool did not expand to any valid fixed AUR or six-cell DUR forms", ui("tlgBackendNoDaurForms")],
    ["candidate pool has no form with an initially swappable completion pair", ui("tlgBackendNoInitialSwap")],
    ["initial grid does not contain both swappable 2x2 completions", ui("tlgBackendFixedAurInitialSwap")],
    ["a TLG-only candidate grid was used; uniqueness was not checked", ui("tlgBackendTrainingGrid")],
  ]);
  if (exact.has(source)) return exact.get(source);
  const sixCellPrefix = "initial grid contains no swappable six-cell completion pair for ";
  if (source.startsWith(sixCellPrefix)) {
    return `${ui("tlgBackendSixCellInitialSwap")}${source.slice(sixCellPrefix.length)}`;
  }
  return source;
}

function formatTlgResponseStatus(response) {
  const counts = response?.counts || {};
  const rank = response?.rank || {};
  let summary = localizeTlgBackendMessage(response?.result || response?.status || ui("tlgResponse"));
  if (response?.ok !== false && (response?.phase === "find-eliminations" || response?.phase === "find-eliminations-phase1")) {
    const foundLinks = counts.links ?? tlgSolverEffectiveLinks().length;
    const foundElims = counts.eliminations ?? 0;
    summary = foundLinks === 0 && foundElims === 0
      ? uif("tlgNoConsequencesSummary", { truths: counts.truths ?? tlgSolverState.truths.length })
      : uif("tlgPhase1Summary", {
          rank: rank.available ? rank.excess : "?",
          truths: counts.truths ?? tlgSolverState.truths.length,
          links: foundLinks,
          elims: foundElims,
        });
  } else if (response?.ok !== false && response?.phase === "convert-truths-to-links") {
    summary = uif("tlgConvertSummary", {
      truths: counts.truths ?? tlgSolverState.truths.length,
      links: counts.links ?? tlgSolverState.links.length,
      moved: response?.mutation?.movedTruthsToLinks?.length ?? counts.redundantTruths ?? 0,
      elims: counts.eliminations ?? 0,
    });
  } else if (response?.ok !== false && response?.phase === "remove-unused-links") {
    summary = uif("tlgRemoveSummary", {
      truths: counts.truths ?? tlgSolverState.truths.length,
      links: counts.links ?? tlgSolverState.links.length,
      removed: response?.mutation?.removedLinks?.length ?? counts.unusedLinks ?? 0,
      elims: counts.eliminations ?? 0,
    });
  } else if (response?.ok !== false && response?.phase === "parsed-only") {
    summary = uif("tlgParsedOnlySummary", {
      truths: counts.truths ?? tlgSolverState.truths.length,
      links: counts.links ?? tlgSolverState.links.length,
    });
  }
  const errors = Array.isArray(response?.validationErrors) && response.validationErrors.length
    ? ` | ${response.validationErrors.map(localizeTlgBackendMessage).join("; ")}`
    : "";
  const localizedResult = localizeTlgBackendMessage(response?.result || "");
  const result = response?.ok === false && localizedResult && localizedResult !== summary ? ` | ${localizedResult}` : "";
  return {
    text: `${summary}${result}${errors}`,
    tone: response?.ok === false ? "error" : "ok",
  };
}

function renderTlgSolverResponse(response, rawText) {
  const responseOk = response?.ok !== false;
  if (responseOk) {
    const phase = String(response?.phase || "");
    if (Array.isArray(response?.truthsState)) tlgSolverState.truths = [...response.truthsState];
    if (Array.isArray(response?.linksState)) {
      tlgSolverState.resultLinks = [...response.linksState];
      tlgSolverState.resultLinksAvailable = true;
      // Find is observational: whether Links were automatic or explicit, it
      // must not mutate the user's input list.  Convert/Remove are explicit
      // structure edits, so their successful output becomes the new user state.
      if (phase === "convert-truths-to-links" || phase === "remove-unused-links") {
        tlgSolverState.links = [...response.linksState];
      }
    }
    tlgSolverState.eliminations = (Array.isArray(response?.eliminations) ? response.eliminations : [])
      .map(normalizeTlgResponseCandidate)
      .filter(Boolean);
    tlgSolverState.assignments = (Array.isArray(response?.assignments) ? response.assignments : [])
      .map(normalizeTlgResponseCandidate)
      .filter(Boolean);
    tlgSolverState.lastResponse = response;
    updateTlgSolverActionGate(response);
    if (tlgSolverSolutionPanel) tlgSolverSolutionPanel.hidden = false;
    if (tlgSolverSolution) {
      tlgSolverSolution.hidden = false;
      tlgSolverSolution.textContent = buildTlgSolutionText(response);
    }
  }
  if (tlgSolverRaw) {
    tlgSolverRaw.hidden = !APP_DEBUG_MODE;
    tlgSolverRaw.textContent = APP_DEBUG_MODE ? (rawText || JSON.stringify(response, null, 2)) : "";
  }
  tlgSolverState.lastStatusResponse = response;
  const formattedStatus = formatTlgResponseStatus(response);
  const statusText = formattedStatus.text;
  tlgSolverState.lastMessage = statusText;
  tlgSolverState.lastTone = formattedStatus.tone;
  setTlgSolverStatus(statusText, tlgSolverState.lastTone);
  renderBoardSnapshot(currentSnapshot, currentHint);
  renderTlgSolverStateList();
}

async function runTlgSolverAction(action, runningMessage) {
  if (tlgSolverState.busyTask) return null;
  setTlgSolverBusy(action, true);
  try {
    if (runningMessage) setTlgSolverStatus(runningMessage);
    const requestJson = JSON.stringify(buildTlgSolverRequestV440(action));
    const workerResult = await runSolverWorkerTask("tlg", { requestJson });
    const raw = String(workerResult?.resultText || "");
    const response = parseJson(raw) || { ok: false, result: ui("tlgParseFailed") };
    renderTlgSolverResponse(response, raw);
    return response;
  } catch (error) {
    console.error(error);
    tlgSolverState.lastMessage = uif("tlgFailed", { error: error?.message || error });
    tlgSolverState.lastTone = "error";
    setTlgSolverStatus(tlgSolverState.lastMessage, "error");
    return null;
  } finally {
    setTlgSolverBusy(action, false);
  }
}

async function runTlgSolverFindEliminations() {
  // The ordinary board-selection highlight is unrelated to the TLG proof
  // overlay.  Clear it as soon as a search starts, and again after completion,
  // so a previously active cell cannot be mistaken for Truth/Link/AUR output.
  selectedIndex = -1;
  renderBoardSnapshot(currentSnapshot, currentHint);
  try {
    return await runTlgSolverAction("findAllEliminations", ui("tlgFindRunning"));
  } finally {
    selectedIndex = -1;
    renderBoardSnapshot(currentSnapshot, currentHint);
  }
}

async function runTlgSolverConvertTruths() {
  return runTlgSolverAction("convertTruthsToLinks", ui("tlgConvertRunning"));
}

async function runTlgSolverRemoveUnusedLinks() {
  return runTlgSolverAction("removeUnusedLinks", ui("tlgRemoveRunning"));
}

function clearTlgSolverState() {
  closeTlgSolverContextMenu();
  tlgSolverState.selectedEndpoint = null;
  tlgSolverState.selectedCandidates.clear();
  tlgSolverState.busyTask = "";
  tlgSolverState.truths = [];
  tlgSolverState.links = [];
  tlgSolverState.virtualSets.forEach((group) => group.clear());
  tlgSolverState.virtualSetCardinalities = [1, 1];
  tlgSolverState.aurGroups.forEach((group) => group.clear());
  tlgSolverState.dynamicAurCandidates.clear();
  tlgSolverState.genericAurCandidates.clear();
  tlgSolverState.eliminations = [];
  tlgSolverState.assignments = [];
  tlgSolverState.resultLinks = [];
  tlgSolverState.resultLinksAvailable = false;
  tlgSolverState.lastResponse = null;
  tlgSolverState.lastStatusResponse = null;
  tlgSolverState.lastMessage = "";
  tlgSolverState.lastTone = "";
  tlgSolverState.candidateGrid = null;
  if (tlgSolverImportText) tlgSolverImportText.value = "";
  if (tlgSolverSolutionPanel) tlgSolverSolutionPanel.hidden = true;
  if (tlgSolverSolution) {
    tlgSolverSolution.hidden = true;
    tlgSolverSolution.textContent = "";
  }
  if (tlgSolverRaw) {
    tlgSolverRaw.hidden = true;
    tlgSolverRaw.textContent = "";
  }
  if (btnTlgConvertTruths) btnTlgConvertTruths.disabled = true;
  if (btnTlgRemoveUnused) btnTlgRemoveUnused.disabled = true;
  renderBoardSnapshot(currentSnapshot, currentHint);
  updateTlgSolverUi();
}

function initTlgSolverControls() {
  if (!tlgSolverPanel) return;
  tlgSolverEnable?.addEventListener("change", () => {
    closeTlgSolverContextMenu();
    tlgSolverState.selectedEndpoint = null;
    tlgSolverState.selectedCandidates.clear();
    selectedIndex = -1;
    if (!tlgSolverEditingActive()) {
      tlgSolverState.candidateGrid = null;
      clearTlgSolverComputedResult();
      tlgSolverState.lastMessage = "";
      tlgSolverState.lastTone = "";
    }
    // TLG is a dedicated proof view: solver hints, chain overlays and manual
    // annotations remain stored, but are visually suppressed until TLG exits.
    renderBoardSnapshot(currentSnapshot, tlgSolverEditingActive() ? null : currentHint);
    updateTlgSolverUi();
  });
  tlgSolverMode?.addEventListener("change", () => {
    closeTlgSolverContextMenu();
    tlgSolverState.selectedEndpoint = null;
    tlgSolverState.selectedCandidates.clear();
    if ((tlgSolverMode?.value || "truths") === "virtualSet") tlgSyncVirtualCardinalityInput();
    renderBoardSnapshot(currentSnapshot, currentHint);
    updateTlgSolverUi();
  });
  tlgSolverAurGroup?.addEventListener("change", () => {
    tlgSolverState.selectedEndpoint = null;
    updateTlgSolverUi();
  });
  tlgSolverVirtualGroup?.addEventListener("change", () => {
    tlgSolverState.selectedEndpoint = null;
    tlgSyncVirtualCardinalityInput();
    updateTlgSolverUi();
  });
  tlgSolverTruthsToApply?.addEventListener("change", () => {
    tlgStoreVirtualCardinalityInput();
    clearTlgSolverComputedResult();
    updateTlgSolverUi();
  });
  tlgSolverLinkType?.addEventListener("change", updateTlgSolverUi);
  tlgSolverAurPremiseMode?.addEventListener("change", () => {
    clearTlgSolverComputedResult();
    tlgSolverState.lastMessage = "";
    tlgSolverState.lastTone = "";
    updateTlgSolverUi();
  });
  btnTlgImportCandidates?.addEventListener("click", importTlgCandidateGridFromMainInput);
  btnTlgFindEliminations?.addEventListener("click", () => { void runTlgSolverFindEliminations(); });
  btnTlgConvertTruths?.addEventListener("click", () => { void runTlgSolverConvertTruths(); });
  btnTlgRemoveUnused?.addEventListener("click", () => { void runTlgSolverRemoveUnusedLinks(); });
  btnTlgClear?.addEventListener("click", clearTlgSolverState);
  tlgSolverStateList?.addEventListener("click", (event) => {
    if (tlgSolverState.busyTask) return;
    const button = event.target?.closest?.("button[data-tlg-remove-category]");
    if (!button) return;
    removeTlgSolverStateItem(button.dataset.tlgRemoveCategory || "", button.dataset.tlgRemoveValue || "");
  });
  installTlgContextMenuListeners();
  initTlgLibraryControls();
  if (tlgSolverDebug) tlgSolverDebug.hidden = !APP_DEBUG_MODE;
  tlgSyncVirtualCardinalityInput();
  updateTlgSolverUi();
}

const TLG_LIBRARY_DB_NAME = "yzf-tlg-library-v1";
const TLG_LIBRARY_DB_VERSION = 1;
const TLG_LIBRARY_FILE_MAGIC = "YZFTLGDB";
const TLG_LIBRARY_RECORD_MAGIC = "TLGR";
const TLG_LIBRARY_FILE_HEADER_SIZE = 64;
const TLG_LIBRARY_RECORD_SIZE = 2048;
const TLG_LIBRARY_SCHEMA_VERSION = 2;
const TLG_LIBRARY_SUPPORTED_SCHEMA_VERSIONS = Object.freeze(new Set([1, 2]));
const TLG_LIBRARY_ORDER_STEP = 1024;
const TLG_LIBRARY_TEXT_LIMITS_V1 = Object.freeze({ title: 128, tags: 96, source: 128, notes: 512 });
const TLG_LIBRARY_TEXT_LIMITS = Object.freeze({ title: 128, tags: 96, source: 128, notes: 507 });
const TLG_LIBRARY_OFFSETS = Object.freeze({
  givens: 64,
  values: 105,
  initialCandidates: 146,
  activeCandidates: 238,
  truths: 330,
  links: 371,
  aur1: 412,
  aur2: 504,
  daur: 596,
  gur: 688,
  virtual: 780,
  virtual1: 780,
  resultLinks: 872,
  eliminations: 913,
  assignments: 1005,
  title: 1097,
  tags: 1225,
  source: 1321,
  notes: 1449,
  virtual2: 1956,
});
const TLG_LIBRARY_MODE_VALUES = Object.freeze(["truths", "links", "virtualSet", "aur", "daur", "gur"]);
const TLG_LIBRARY_LINK_TYPE_VALUES = Object.freeze(["auto", "rowColumn", "box", "cell"]);

let tlgLibraryDbPromise = null;
let tlgLibraryRecords = [];
let tlgLibrarySelectedId = null;
let tlgLibraryNextId = 1;
let tlgLibraryBusy = false;
let tlgLibraryCrcTable = null;
let tlgLibrarySharePreview = null;
let tlgLibrarySharePreviewTimer = 0;

function tlgLibrarySetStatus(message, tone = "") {
  if (!tlgLibraryStatus) return;
  tlgLibraryStatus.textContent = String(message || "");
  if (tone) tlgLibraryStatus.dataset.tone = tone;
  else tlgLibraryStatus.removeAttribute("data-tone");
}

function tlgLibraryBuildCrcTable() {
  if (tlgLibraryCrcTable) return tlgLibraryCrcTable;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }
    table[i] = value >>> 0;
  }
  tlgLibraryCrcTable = table;
  return table;
}

function tlgLibraryCrc32(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || 0);
  const table = tlgLibraryBuildCrcTable();
  let crc = 0xffffffff;
  for (const byte of bytes) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function tlgLibraryAsciiWrite(bytes, offset, text, length) {
  for (let i = 0; i < length; i += 1) bytes[offset + i] = text.charCodeAt(i) || 0;
}

function tlgLibraryAsciiRead(bytes, offset, length) {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function tlgLibraryEncodeText(value, maxBytes, fieldKey) {
  const encoded = new TextEncoder().encode(String(value || "").trim());
  if (encoded.length > maxBytes) {
    throw new Error(uif("tlgLibraryTextTooLong", {
      field: ui(fieldKey),
      limit: maxBytes,
    }));
  }
  return encoded;
}

function tlgLibraryWriteText(bytes, offset, maxBytes, encoded) {
  bytes.fill(0, offset, offset + maxBytes);
  bytes.set(encoded.subarray(0, maxBytes), offset);
}

function tlgLibraryReadText(bytes, offset, length) {
  if (!length) return "";
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(offset, offset + length));
}

function tlgLibraryPackDigits(text) {
  const normalized = String(text || "").padEnd(81, ".").slice(0, 81);
  const bytes = new Uint8Array(41);
  for (let index = 0; index < 81; index += 1) {
    const ch = normalized[index];
    const value = ch >= "1" && ch <= "9" ? Number(ch) : 0;
    const byteIndex = index >> 1;
    if ((index & 1) === 0) bytes[byteIndex] |= value & 0x0f;
    else bytes[byteIndex] |= (value & 0x0f) << 4;
  }
  return bytes;
}

function tlgLibraryUnpackDigits(bytes) {
  let text = "";
  for (let index = 0; index < 81; index += 1) {
    const packed = bytes[index >> 1] || 0;
    const value = (index & 1) === 0 ? (packed & 0x0f) : ((packed >> 4) & 0x0f);
    text += value >= 1 && value <= 9 ? String(value) : ".";
  }
  return text;
}

function tlgLibraryCandidateIdFromKey(key) {
  const [cellText, digitText] = String(key || "").split(":");
  const cellIndex = Number(cellText);
  const digit = Number(digitText);
  if (!Number.isInteger(cellIndex) || cellIndex < 0 || cellIndex >= 81 || !Number.isInteger(digit) || digit < 1 || digit > 9) return -1;
  return cellIndex * 9 + digit - 1;
}

function tlgLibraryCandidateKeyFromId(candidateId) {
  const value = Number(candidateId);
  if (!Number.isInteger(value) || value < 0 || value >= 729) return "";
  return tlgSolverCandidateKey(Math.floor(value / 9), (value % 9) + 1);
}

function tlgLibraryPackCandidateKeys(keys) {
  const bytes = new Uint8Array(92);
  for (const key of keys || []) {
    const id = tlgLibraryCandidateIdFromKey(key);
    if (id < 0) continue;
    bytes[id >> 3] |= 1 << (id & 7);
  }
  return bytes;
}

function tlgLibraryUnpackCandidateKeys(bytes) {
  const values = new Set();
  for (let id = 0; id < 729; id += 1) {
    if ((bytes[id >> 3] & (1 << (id & 7))) !== 0) values.add(tlgLibraryCandidateKeyFromId(id));
  }
  return values;
}

function tlgLibraryDescriptorId(token) {
  const match = /^([1-9])([rcnb])([1-9])$/i.exec(String(token || "").trim());
  if (!match) return -1;
  const first = Number(match[1]) - 1;
  const second = Number(match[3]) - 1;
  const family = match[2].toLowerCase();
  const base = family === "r" ? 0 : family === "c" ? 81 : family === "n" ? 162 : 243;
  return base + first * 9 + second;
}

function tlgLibraryDescriptorToken(id) {
  const value = Number(id);
  if (!Number.isInteger(value) || value < 0 || value >= 324) return "";
  const family = value < 81 ? "r" : value < 162 ? "c" : value < 243 ? "n" : "b";
  const local = value % 81;
  return `${Math.floor(local / 9) + 1}${family}${(local % 9) + 1}`;
}

function tlgLibraryPackDescriptors(values) {
  const bytes = new Uint8Array(41);
  for (const raw of values || []) {
    const canonical = tlgCanonicalDescriptor(raw);
    const id = tlgLibraryDescriptorId(canonical);
    if (id < 0) continue;
    bytes[id >> 3] |= 1 << (id & 7);
  }
  return bytes;
}

function tlgLibraryUnpackDescriptors(bytes, kind) {
  const prefix = kind === "links" ? "descriptor-link:" : "descriptor-truth:";
  const values = [];
  for (let id = 0; id < 324; id += 1) {
    if ((bytes[id >> 3] & (1 << (id & 7))) !== 0) values.push(prefix + tlgLibraryDescriptorToken(id));
  }
  return values;
}

function tlgLibraryCandidateKeysFromPayload(payload) {
  const keys = new Set();
  for (const candidate of payload || []) {
    const normalized = normalizeTlgResponseCandidate(candidate);
    if (normalized) keys.add(tlgSolverCandidateKey(normalized.cell, normalized.digit));
  }
  return keys;
}

function tlgLibraryCandidateObjectsFromKeys(keys) {
  return [...(keys || [])].map((key) => {
    const id = tlgLibraryCandidateIdFromKey(key);
    if (id < 0) return null;
    const cell = Math.floor(id / 9);
    const digit = (id % 9) + 1;
    return { cell, digit, row: Math.floor(cell / 9) + 1, column: (cell % 9) + 1 };
  }).filter(Boolean);
}

function tlgLibraryNormalizeMeta(meta = {}) {
  return {
    title: String(meta.title || "").trim(),
    tags: String(meta.tags || "").trim(),
    source: String(meta.source || "").trim(),
    notes: String(meta.notes || "").trim(),
  };
}

function tlgLibraryDefaultTitle() {
  const now = new Date();
  const stamp = new Intl.DateTimeFormat(lang.value === "en" ? "en-CA" : "zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(now);
  return uif("tlgLibraryDefaultTitle", { stamp });
}

function tlgLibraryCurrentMeta() {
  return tlgLibraryNormalizeMeta({
    title: tlgLibraryTitle?.value || "",
    tags: tlgLibraryTags?.value || "",
    source: tlgLibrarySource?.value || "",
    notes: tlgLibraryNotes?.value || "",
  });
}

function tlgLibraryCaptureState(meta, identity = {}) {
  const snapshot = tlgSolverEffectiveSnapshot(currentSnapshot);
  const values = snapshotBoardString(snapshot);
  const givensText = snapshotGivensString(snapshot);
  if (values.length !== 81 || givensText.length !== 81 || !Array.isArray(snapshot?.cells)) {
    throw new Error(ui("tlgLibraryNoGrid"));
  }
  const normalizedMeta = tlgLibraryNormalizeMeta(meta);
  if (!normalizedMeta.title) normalizedMeta.title = tlgLibraryDefaultTitle();
  const now = Math.floor(Date.now() / 1000);
  const activeCandidates = new Set(tlgSolverActiveCandidatePayload().map((item) => tlgSolverCandidateKey(item.cellIndex, item.digit)));
  const initialCandidates = new Set(tlgSolverInitialCandidatePayload().map((item) => tlgSolverCandidateKey(item.cellIndex, item.digit)));
  const truths = tlgCanonicalDescriptorState(tlgSolverState.truths, "truths");
  const links = tlgCanonicalDescriptorState(tlgSolverState.links, "links");
  const resultLinks = tlgCanonicalDescriptorState(tlgSolverState.resultLinks, "links");
  return {
    id: Number(identity.id || 0) >>> 0,
    createdAt: Number(identity.createdAt || now) >>> 0,
    updatedAt: now >>> 0,
    meta: normalizedMeta,
    givens: givensText,
    values,
    initialCandidates,
    activeCandidates,
    truths,
    links,
    aur1: new Set(tlgSolverState.aurGroups[0]),
    aur2: new Set(tlgSolverState.aurGroups[1]),
    daur: new Set(tlgSolverState.dynamicAurCandidates),
    gur: new Set(tlgSolverState.genericAurCandidates),
    virtual1: new Set(tlgSolverState.virtualSets[0]),
    virtual2: new Set(tlgSolverState.virtualSets[1]),
    // Legacy aliases keep old in-memory consumers and v1 import paths safe.
    virtual: new Set(tlgSolverState.virtualSets[0]),
    resultLinks,
    eliminations: tlgLibraryCandidateKeysFromPayload(tlgSolverState.eliminations),
    assignments: tlgLibraryCandidateKeysFromPayload(tlgSolverState.assignments),
    virtualCardinalities: [...tlgSolverState.virtualSetCardinalities],
    truthsToApply: tlgSolverState.virtualSetCardinalities[0] || 1,
    premiseMode: tlgSolverAurPremiseMode?.value || "unique-puzzle-derived",
    inputMode: tlgSolverMode?.value || "truths",
    aurGroup: Math.max(0, Math.min(1, Number(tlgSolverAurGroup?.value || 0) || 0)),
    virtualGroup: tlgSelectedVirtualSetIndex(),
    linkType: tlgSolverLinkType?.value || "auto",
    hasCandidateGrid: !!tlgSolverState.candidateGrid,
    resultLinksAvailable: !!tlgSolverState.resultLinksAvailable,
    hasResult: tlgSolverState.eliminations.length > 0 || tlgSolverState.assignments.length > 0 || !!tlgSolverState.lastResponse,
  };
}

function tlgLibraryEncodeRecord(record) {
  const bytes = new Uint8Array(TLG_LIBRARY_RECORD_SIZE);
  const view = new DataView(bytes.buffer);
  const title = tlgLibraryEncodeText(record.meta?.title, TLG_LIBRARY_TEXT_LIMITS.title, "tlgLibraryTitleLabel");
  const tags = tlgLibraryEncodeText(record.meta?.tags, TLG_LIBRARY_TEXT_LIMITS.tags, "tlgLibraryTagsLabel");
  const source = tlgLibraryEncodeText(record.meta?.source, TLG_LIBRARY_TEXT_LIMITS.source, "tlgLibrarySourceLabel");
  const notes = tlgLibraryEncodeText(record.meta?.notes, TLG_LIBRARY_TEXT_LIMITS.notes, "tlgLibraryNotesLabel");
  const virtual1 = record.virtual1 || record.virtual || new Set();
  const virtual2 = record.virtual2 || new Set();
  const cardinalities = Array.isArray(record.virtualCardinalities)
    ? record.virtualCardinalities
    : [record.truthsToApply || 1, 1];
  const virtualCardinality1 = Math.max(1, Math.min(4, Number(cardinalities[0] || 1) || 1));
  const virtualCardinality2 = Math.max(1, Math.min(4, Number(cardinalities[1] || 1) || 1));
  const aurGroup = Math.max(0, Math.min(1, Number(record.aurGroup || 0) || 0));
  const virtualGroup = Math.max(0, Math.min(1, Number(record.virtualGroup || 0) || 0));

  tlgLibraryAsciiWrite(bytes, 0, TLG_LIBRARY_RECORD_MAGIC, 4);
  view.setUint16(4, TLG_LIBRARY_SCHEMA_VERSION, true);
  let flags = 0;
  if (record.hasCandidateGrid) flags |= 1;
  if (record.premiseMode === "candidate-grid-asserted") flags |= 2;
  if (record.resultLinksAvailable) flags |= 4;
  if (record.hasResult) flags |= 8;
  view.setUint16(6, flags, true);
  view.setUint32(8, Number(record.id || 0) >>> 0, true);
  view.setUint32(12, Number(record.createdAt || 0) >>> 0, true);
  view.setUint32(16, Number(record.updatedAt || 0) >>> 0, true);
  view.setUint32(20, 0, true);
  view.setUint32(24, 0, true);
  view.setUint32(28, tlgLibraryCrc32(new TextEncoder().encode(APP_VERSION)), true);
  view.setUint8(32, (virtualCardinality1 & 0x0f) | ((virtualCardinality2 & 0x0f) << 4));
  view.setUint8(33, Math.max(0, TLG_LIBRARY_MODE_VALUES.indexOf(record.inputMode)));
  view.setUint8(34, aurGroup | (virtualGroup << 1));
  view.setUint8(35, Math.max(0, TLG_LIBRARY_LINK_TYPE_VALUES.indexOf(record.linkType)));
  view.setUint16(36, record.truths.size ?? record.truths.length ?? 0, true);
  view.setUint16(38, record.links.size ?? record.links.length ?? 0, true);
  view.setUint16(40, record.resultLinks.size ?? record.resultLinks.length ?? 0, true);
  view.setUint16(42, record.eliminations.size ?? record.eliminations.length ?? 0, true);
  view.setUint16(44, record.assignments.size ?? record.assignments.length ?? 0, true);
  view.setUint16(46, virtual1.size ?? virtual1.length ?? 0, true);
  view.setUint16(48, record.aur1.size ?? record.aur1.length ?? 0, true);
  view.setUint16(50, record.aur2.size ?? record.aur2.length ?? 0, true);
  view.setUint16(52, record.daur.size ?? record.daur.length ?? 0, true);
  view.setUint16(54, record.gur.size ?? record.gur.length ?? 0, true);
  view.setUint16(56, title.length, true);
  view.setUint16(58, tags.length, true);
  view.setUint16(60, source.length, true);
  view.setUint16(62, notes.length, true);
  bytes.set(tlgLibraryPackDigits(record.givens), TLG_LIBRARY_OFFSETS.givens);
  bytes.set(tlgLibraryPackDigits(record.values), TLG_LIBRARY_OFFSETS.values);
  bytes.set(tlgLibraryPackCandidateKeys(record.initialCandidates), TLG_LIBRARY_OFFSETS.initialCandidates);
  bytes.set(tlgLibraryPackCandidateKeys(record.activeCandidates), TLG_LIBRARY_OFFSETS.activeCandidates);
  bytes.set(tlgLibraryPackDescriptors(record.truths), TLG_LIBRARY_OFFSETS.truths);
  bytes.set(tlgLibraryPackDescriptors(record.links), TLG_LIBRARY_OFFSETS.links);
  bytes.set(tlgLibraryPackCandidateKeys(record.aur1), TLG_LIBRARY_OFFSETS.aur1);
  bytes.set(tlgLibraryPackCandidateKeys(record.aur2), TLG_LIBRARY_OFFSETS.aur2);
  bytes.set(tlgLibraryPackCandidateKeys(record.daur), TLG_LIBRARY_OFFSETS.daur);
  bytes.set(tlgLibraryPackCandidateKeys(record.gur), TLG_LIBRARY_OFFSETS.gur);
  bytes.set(tlgLibraryPackCandidateKeys(virtual1), TLG_LIBRARY_OFFSETS.virtual1);
  bytes.set(tlgLibraryPackDescriptors(record.resultLinks), TLG_LIBRARY_OFFSETS.resultLinks);
  bytes.set(tlgLibraryPackCandidateKeys(record.eliminations), TLG_LIBRARY_OFFSETS.eliminations);
  bytes.set(tlgLibraryPackCandidateKeys(record.assignments), TLG_LIBRARY_OFFSETS.assignments);
  tlgLibraryWriteText(bytes, TLG_LIBRARY_OFFSETS.title, TLG_LIBRARY_TEXT_LIMITS.title, title);
  tlgLibraryWriteText(bytes, TLG_LIBRARY_OFFSETS.tags, TLG_LIBRARY_TEXT_LIMITS.tags, tags);
  tlgLibraryWriteText(bytes, TLG_LIBRARY_OFFSETS.source, TLG_LIBRARY_TEXT_LIMITS.source, source);
  tlgLibraryWriteText(bytes, TLG_LIBRARY_OFFSETS.notes, TLG_LIBRARY_TEXT_LIMITS.notes, notes);
  bytes.set(tlgLibraryPackCandidateKeys(virtual2), TLG_LIBRARY_OFFSETS.virtual2);

  const structuralMain = bytes.subarray(TLG_LIBRARY_OFFSETS.givens, TLG_LIBRARY_OFFSETS.title);
  const structural = new Uint8Array(structuralMain.length + 92);
  structural.set(structuralMain, 0);
  structural.set(bytes.subarray(TLG_LIBRARY_OFFSETS.virtual2, TLG_LIBRARY_OFFSETS.virtual2 + 92), structuralMain.length);
  view.setUint32(24, tlgLibraryCrc32(structural), true);
  const crcBytes = bytes.slice();
  new DataView(crcBytes.buffer).setUint32(20, 0, true);
  view.setUint32(20, tlgLibraryCrc32(crcBytes), true);
  return bytes;
}

function tlgLibraryDecodeRecord(input, { skipCrc = false } = {}) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || 0);
  if (bytes.byteLength !== TLG_LIBRARY_RECORD_SIZE) throw new Error(ui("tlgLibraryInvalidRecordSize"));
  if (tlgLibraryAsciiRead(bytes, 0, 4) !== TLG_LIBRARY_RECORD_MAGIC) throw new Error(ui("tlgLibraryInvalidRecordMagic"));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint16(4, true);
  if (!TLG_LIBRARY_SUPPORTED_SCHEMA_VERSIONS.has(version)) {
    throw new Error(uif("tlgLibraryUnsupportedRecordVersion", { version }));
  }
  if (!skipCrc) {
    const expected = view.getUint32(20, true);
    const copy = bytes.slice();
    new DataView(copy.buffer).setUint32(20, 0, true);
    if (tlgLibraryCrc32(copy) !== expected) throw new Error(ui("tlgLibraryRecordCrcFailed"));
  }
  const limits = version === 1 ? TLG_LIBRARY_TEXT_LIMITS_V1 : TLG_LIBRARY_TEXT_LIMITS;
  const lengths = {
    title: view.getUint16(56, true), tags: view.getUint16(58, true), source: view.getUint16(60, true), notes: view.getUint16(62, true),
  };
  for (const [key, length] of Object.entries(lengths)) {
    if (length > limits[key]) throw new Error(ui("tlgLibraryInvalidTextLength"));
  }
  const flags = view.getUint16(6, true);
  const packedCardinalities = view.getUint8(32);
  const virtualCardinality1 = version === 1
    ? Math.max(1, Math.min(4, packedCardinalities || 1))
    : Math.max(1, Math.min(4, packedCardinalities & 0x0f || 1));
  const virtualCardinality2 = version === 1
    ? 1
    : Math.max(1, Math.min(4, (packedCardinalities >> 4) & 0x0f || 1));
  const packedGroups = view.getUint8(34);
  const virtual1 = tlgLibraryUnpackCandidateKeys(bytes.subarray(TLG_LIBRARY_OFFSETS.virtual1, TLG_LIBRARY_OFFSETS.virtual1 + 92));
  const virtual2 = version === 1
    ? new Set()
    : tlgLibraryUnpackCandidateKeys(bytes.subarray(TLG_LIBRARY_OFFSETS.virtual2, TLG_LIBRARY_OFFSETS.virtual2 + 92));
  return {
    bytes: bytes.slice(),
    version,
    id: view.getUint32(8, true),
    createdAt: view.getUint32(12, true),
    updatedAt: view.getUint32(16, true),
    contentHash: view.getUint32(24, true),
    engineHash: view.getUint32(28, true),
    hasCandidateGrid: (flags & 1) !== 0,
    premiseMode: (flags & 2) !== 0 ? "candidate-grid-asserted" : "unique-puzzle-derived",
    resultLinksAvailable: (flags & 4) !== 0,
    hasResult: (flags & 8) !== 0,
    truthsToApply: virtualCardinality1,
    virtualCardinalities: [virtualCardinality1, virtualCardinality2],
    inputMode: TLG_LIBRARY_MODE_VALUES[view.getUint8(33)] || "truths",
    aurGroup: Math.min(1, packedGroups & 1),
    virtualGroup: version === 1 ? 0 : Math.min(1, (packedGroups >> 1) & 1),
    linkType: TLG_LIBRARY_LINK_TYPE_VALUES[view.getUint8(35)] || "auto",
    givens: tlgLibraryUnpackDigits(bytes.subarray(TLG_LIBRARY_OFFSETS.givens, TLG_LIBRARY_OFFSETS.givens + 41)),
    values: tlgLibraryUnpackDigits(bytes.subarray(TLG_LIBRARY_OFFSETS.values, TLG_LIBRARY_OFFSETS.values + 41)),
    initialCandidates: tlgLibraryUnpackCandidateKeys(bytes.subarray(TLG_LIBRARY_OFFSETS.initialCandidates, TLG_LIBRARY_OFFSETS.initialCandidates + 92)),
    activeCandidates: tlgLibraryUnpackCandidateKeys(bytes.subarray(TLG_LIBRARY_OFFSETS.activeCandidates, TLG_LIBRARY_OFFSETS.activeCandidates + 92)),
    truths: tlgLibraryUnpackDescriptors(bytes.subarray(TLG_LIBRARY_OFFSETS.truths, TLG_LIBRARY_OFFSETS.truths + 41), "truths"),
    links: tlgLibraryUnpackDescriptors(bytes.subarray(TLG_LIBRARY_OFFSETS.links, TLG_LIBRARY_OFFSETS.links + 41), "links"),
    aur1: tlgLibraryUnpackCandidateKeys(bytes.subarray(TLG_LIBRARY_OFFSETS.aur1, TLG_LIBRARY_OFFSETS.aur1 + 92)),
    aur2: tlgLibraryUnpackCandidateKeys(bytes.subarray(TLG_LIBRARY_OFFSETS.aur2, TLG_LIBRARY_OFFSETS.aur2 + 92)),
    daur: tlgLibraryUnpackCandidateKeys(bytes.subarray(TLG_LIBRARY_OFFSETS.daur, TLG_LIBRARY_OFFSETS.daur + 92)),
    gur: tlgLibraryUnpackCandidateKeys(bytes.subarray(TLG_LIBRARY_OFFSETS.gur, TLG_LIBRARY_OFFSETS.gur + 92)),
    virtual: virtual1,
    virtual1,
    virtual2,
    resultLinks: tlgLibraryUnpackDescriptors(bytes.subarray(TLG_LIBRARY_OFFSETS.resultLinks, TLG_LIBRARY_OFFSETS.resultLinks + 41), "links"),
    eliminations: tlgLibraryUnpackCandidateKeys(bytes.subarray(TLG_LIBRARY_OFFSETS.eliminations, TLG_LIBRARY_OFFSETS.eliminations + 92)),
    assignments: tlgLibraryUnpackCandidateKeys(bytes.subarray(TLG_LIBRARY_OFFSETS.assignments, TLG_LIBRARY_OFFSETS.assignments + 92)),
    meta: {
      title: tlgLibraryReadText(bytes, TLG_LIBRARY_OFFSETS.title, lengths.title),
      tags: tlgLibraryReadText(bytes, TLG_LIBRARY_OFFSETS.tags, lengths.tags),
      source: tlgLibraryReadText(bytes, TLG_LIBRARY_OFFSETS.source, lengths.source),
      notes: tlgLibraryReadText(bytes, TLG_LIBRARY_OFFSETS.notes, lengths.notes),
    },
  };
}

function tlgLibraryRewriteIdentity(input, id, { preserveCreatedAt = true, touchUpdatedAt = false } = {}) {
  const bytes = input instanceof Uint8Array ? input.slice() : new Uint8Array(input || 0).slice();
  const view = new DataView(bytes.buffer);
  const now = Math.floor(Date.now() / 1000);
  view.setUint32(8, Number(id) >>> 0, true);
  if (!preserveCreatedAt) view.setUint32(12, now, true);
  if (touchUpdatedAt) view.setUint32(16, now, true);
  view.setUint32(20, 0, true);
  view.setUint32(20, tlgLibraryCrc32(bytes), true);
  return bytes;
}

function tlgLibraryBuildFile(records) {
  const ordered = [...records].sort((a, b) => a.order - b.order);
  const bytes = new Uint8Array(TLG_LIBRARY_FILE_HEADER_SIZE + ordered.length * TLG_LIBRARY_RECORD_SIZE);
  const view = new DataView(bytes.buffer);
  tlgLibraryAsciiWrite(bytes, 0, TLG_LIBRARY_FILE_MAGIC, 8);
  view.setUint16(8, TLG_LIBRARY_SCHEMA_VERSION, true);
  view.setUint16(10, TLG_LIBRARY_RECORD_SIZE, true);
  view.setUint32(12, ordered.length, true);
  view.setUint16(16, TLG_LIBRARY_FILE_HEADER_SIZE, true);
  view.setUint16(18, 0, true);
  const now = Math.floor(Date.now() / 1000);
  view.setUint32(20, now, true);
  view.setUint32(24, now, true);
  view.setUint32(28, Math.max(tlgLibraryNextId, 1), true);
  view.setUint32(32, 0, true);
  ordered.forEach((entry, index) => {
    bytes.set(entry.bytes instanceof Uint8Array ? entry.bytes : new Uint8Array(entry.bytes), TLG_LIBRARY_FILE_HEADER_SIZE + index * TLG_LIBRARY_RECORD_SIZE);
  });
  const headerCopy = bytes.slice(0, TLG_LIBRARY_FILE_HEADER_SIZE);
  new DataView(headerCopy.buffer).setUint32(32, 0, true);
  view.setUint32(32, tlgLibraryCrc32(headerCopy), true);
  return bytes;
}

function tlgLibraryParseFile(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || 0);
  if (bytes.length < TLG_LIBRARY_FILE_HEADER_SIZE) throw new Error(ui("tlgLibraryFileTooShort"));
  if (tlgLibraryAsciiRead(bytes, 0, 8) !== TLG_LIBRARY_FILE_MAGIC) throw new Error(ui("tlgLibraryInvalidFileMagic"));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint16(8, true);
  const recordSize = view.getUint16(10, true);
  const count = view.getUint32(12, true);
  const headerSize = view.getUint16(16, true);
  if (!TLG_LIBRARY_SUPPORTED_SCHEMA_VERSIONS.has(version)) throw new Error(uif("tlgLibraryUnsupportedFileVersion", { version }));
  if (recordSize !== TLG_LIBRARY_RECORD_SIZE || headerSize !== TLG_LIBRARY_FILE_HEADER_SIZE) throw new Error(ui("tlgLibraryIncompatibleLayout"));
  const expectedLength = headerSize + count * recordSize;
  if (bytes.length !== expectedLength) throw new Error(uif("tlgLibraryFileLengthMismatch", { expected: expectedLength, actual: bytes.length }));
  const expectedCrc = view.getUint32(32, true);
  const headerCopy = bytes.slice(0, headerSize);
  new DataView(headerCopy.buffer).setUint32(32, 0, true);
  if (tlgLibraryCrc32(headerCopy) !== expectedCrc) throw new Error(ui("tlgLibraryHeaderCrcFailed"));
  const records = [];
  const seenIds = new Set();
  for (let index = 0; index < count; index += 1) {
    const offset = headerSize + index * recordSize;
    const recordBytes = bytes.slice(offset, offset + recordSize);
    const decoded = tlgLibraryDecodeRecord(recordBytes);
    if (seenIds.has(decoded.id)) throw new Error(uif("tlgLibraryDuplicateIdInFile", { id: decoded.id }));
    seenIds.add(decoded.id);
    records.push({ id: decoded.id, order: (index + 1) * TLG_LIBRARY_ORDER_STEP, bytes: recordBytes, decoded });
  }
  const nextId = records.reduce((value, entry) => Math.max(value, entry.id + 1), Math.max(view.getUint32(28, true), 1));
  return { records, nextId };
}


const TLG_TEXT_CASE_VERSION = 2;
const TLG_TEXT_CASE_HEADER = `YZF-TLG-CASE:${TLG_TEXT_CASE_VERSION}`;
const TLG_TEXT_COMPACT_HEADER = `YZFTLG${TLG_TEXT_CASE_VERSION}`;

function tlgTextBase64UrlEncodeBytes(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || 0);
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, Math.min(bytes.length, offset + chunkSize)));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function tlgTextBase64UrlDecodeBytes(value, field = "") {
  const text = String(value || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!text || /[^A-Za-z0-9+/=]/.test(text)) throw new Error(uif("tlgLibraryTextInvalidBitmap", { field }));
  const padded = text + "=".repeat((4 - (text.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  } catch {
    throw new Error(uif("tlgLibraryTextInvalidBitmap", { field }));
  }
}

function tlgTextBase64UrlEncodeUtf8(value) {
  return tlgTextBase64UrlEncodeBytes(new TextEncoder().encode(String(value || "")));
}

function tlgTextBase64UrlDecodeUtf8(value, field = "META") {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(tlgTextBase64UrlDecodeBytes(value, field));
  } catch (error) {
    if (error?.message) throw error;
    throw new Error(uif("tlgLibraryTextInvalidField", { field }));
  }
}

function tlgTextHexCrc(value) {
  return tlgLibraryCrc32(new TextEncoder().encode(String(value || ""))).toString(16).toUpperCase().padStart(8, "0");
}

function tlgTextNormalizeDigits(value, field) {
  const text = String(value || "").trim().replace(/0/g, ".");
  if (text.length !== 81 || /[^.1-9]/.test(text)) throw new Error(uif("tlgLibraryTextInvalidField", { field }));
  return text;
}

function tlgTextCandidateTokenFromKey(key, compact = false) {
  const id = tlgLibraryCandidateIdFromKey(key);
  if (id < 0) return "";
  const digit = (id % 9) + 1;
  const cell = Math.floor(id / 9);
  const row = Math.floor(cell / 9) + 1;
  const column = (cell % 9) + 1;
  return compact ? `${digit}${row}${column}` : `${digit}r${row}c${column}`;
}

function tlgTextCandidateKeyFromToken(raw) {
  const token = String(raw || "").trim();
  if (!token) return "";
  let match = /^([1-9])r([1-9])c([1-9])$/i.exec(token);
  if (!match) match = /^([1-9])([1-9])([1-9])$/.exec(token);
  if (!match) throw new Error(uif("tlgLibraryTextInvalidCandidate", { value: token }));
  const digit = Number(match[1]);
  const row = Number(match[2]);
  const column = Number(match[3]);
  return tlgSolverCandidateKey((row - 1) * 9 + column - 1, digit);
}

function tlgTextSplitTokens(value) {
  return String(value || "").trim().split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean);
}

function tlgTextSerializeCandidateSet(values, compact = false) {
  return [...(values || [])]
    .map((key) => ({ key, id: tlgLibraryCandidateIdFromKey(key) }))
    .filter((item) => item.id >= 0)
    .sort((a, b) => a.id - b.id)
    .map((item) => tlgTextCandidateTokenFromKey(item.key, compact))
    .join(compact ? "," : " ");
}

function tlgTextParseCandidateSet(value) {
  const result = new Set();
  for (const token of tlgTextSplitTokens(value)) result.add(tlgTextCandidateKeyFromToken(token));
  return result;
}

function tlgTextSerializeDescriptors(values, compact = false) {
  return [...(values || [])]
    .map((raw) => tlgCanonicalDescriptor(raw))
    .filter((token) => tlgLibraryDescriptorId(token) >= 0)
    .sort((a, b) => tlgLibraryDescriptorId(a) - tlgLibraryDescriptorId(b))
    .join(compact ? "," : " ");
}

function tlgTextParseDescriptors(value, kind) {
  const prefix = kind === "links" ? "descriptor-link:" : "descriptor-truth:";
  const result = [];
  const seen = new Set();
  for (const raw of tlgTextSplitTokens(value)) {
    const canonical = tlgCanonicalDescriptor(raw);
    if (tlgLibraryDescriptorId(canonical) < 0) throw new Error(uif("tlgLibraryTextInvalidDescriptor", { value: raw }));
    if (!seen.has(canonical)) {
      seen.add(canonical);
      result.push(prefix + canonical);
    }
  }
  result.sort((a, b) => tlgLibraryDescriptorId(tlgCanonicalDescriptor(a)) - tlgLibraryDescriptorId(tlgCanonicalDescriptor(b)));
  return result;
}

function tlgTextRecordFlags(record) {
  let flags = 0;
  if (record.hasCandidateGrid) flags |= 1;
  if (record.premiseMode === "candidate-grid-asserted") flags |= 2;
  if (record.resultLinksAvailable) flags |= 4;
  if (record.hasResult) flags |= 8;
  return flags;
}

function tlgTextRecordFromFields(fields, version = TLG_TEXT_CASE_VERSION) {
  for (const key of ["GIVENS", "VALUES", "INITIAL-BITS", "ACTIVE-BITS"]) {
    if (!fields.has(key)) throw new Error(uif("tlgLibraryTextMissingField", { field: key }));
  }
  const initialBytes = tlgTextBase64UrlDecodeBytes(fields.get("INITIAL-BITS"), "INITIAL-BITS");
  const activeBytes = tlgTextBase64UrlDecodeBytes(fields.get("ACTIVE-BITS"), "ACTIVE-BITS");
  if (initialBytes.length !== 92) throw new Error(uif("tlgLibraryTextInvalidBitmap", { field: "INITIAL-BITS" }));
  if (activeBytes.length !== 92) throw new Error(uif("tlgLibraryTextInvalidBitmap", { field: "ACTIVE-BITS" }));
  const options = new Map();
  for (const item of String(fields.get("OPTIONS") || "").split(";")) {
    const split = item.indexOf("=");
    if (split > 0) options.set(item.slice(0, split).trim().toLowerCase(), item.slice(split + 1).trim());
  }
  const flags = Math.max(0, Number(fields.get("FLAGS") || 0) || 0) >>> 0;
  const premiseMode = options.get("premise") || ((flags & 2) ? "candidate-grid-asserted" : "unique-puzzle-derived");
  const inputMode = options.get("mode") || "truths";
  const linkType = options.get("link") || "auto";
  if (!TLG_LIBRARY_MODE_VALUES.includes(inputMode)) throw new Error(uif("tlgLibraryTextInvalidField", { field: "OPTIONS.mode" }));
  if (!TLG_LIBRARY_LINK_TYPE_VALUES.includes(linkType)) throw new Error(uif("tlgLibraryTextInvalidField", { field: "OPTIONS.link" }));
  if (!["unique-puzzle-derived", "candidate-grid-asserted"].includes(premiseMode)) throw new Error(uif("tlgLibraryTextInvalidField", { field: "OPTIONS.premise" }));
  const parseJsonText = (key) => {
    const value = fields.get(key);
    if (value == null || value === "") return "";
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "string" ? parsed : String(parsed ?? "");
    } catch {
      throw new Error(uif("tlgLibraryTextInvalidField", { field: key }));
    }
  };
  const card1 = Math.max(1, Math.min(4, Number(options.get("v1") || options.get("truths") || 1) || 1));
  const card2 = Math.max(1, Math.min(4, Number(options.get("v2") || 1) || 1));
  const aurGroup = Math.max(0, Math.min(1, Number(options.get("aur") || 0) || 0));
  const virtualGroup = version === 1 ? 0 : Math.max(0, Math.min(1, Number(options.get("vgroup") || 0) || 0));
  const virtual1 = tlgTextParseCandidateSet(fields.get("VIRTUAL1") ?? fields.get("VIRTUAL"));
  const virtual2 = tlgTextParseCandidateSet(fields.get("VIRTUAL2"));
  const record = {
    id: Math.max(0, Number(fields.get("ID") || 0) || 0) >>> 0,
    createdAt: Math.max(0, Number(fields.get("CREATED") || 0) || 0) >>> 0,
    updatedAt: Math.max(0, Number(fields.get("UPDATED") || 0) || 0) >>> 0,
    meta: tlgLibraryNormalizeMeta({
      title: parseJsonText("TITLE"),
      tags: parseJsonText("TAGS"),
      source: parseJsonText("SOURCE"),
      notes: parseJsonText("NOTE"),
    }),
    givens: tlgTextNormalizeDigits(fields.get("GIVENS"), "GIVENS"),
    values: tlgTextNormalizeDigits(fields.get("VALUES"), "VALUES"),
    initialCandidates: tlgLibraryUnpackCandidateKeys(initialBytes),
    activeCandidates: tlgLibraryUnpackCandidateKeys(activeBytes),
    truths: tlgTextParseDescriptors(fields.get("TRUTHS"), "truths"),
    links: tlgTextParseDescriptors(fields.get("LINKS"), "links"),
    aur1: tlgTextParseCandidateSet(fields.get("AUR1")),
    aur2: tlgTextParseCandidateSet(fields.get("AUR2")),
    daur: tlgTextParseCandidateSet(fields.get("DAUR")),
    gur: tlgTextParseCandidateSet(fields.get("GUR")),
    virtual: virtual1,
    virtual1,
    virtual2,
    resultLinks: tlgTextParseDescriptors(fields.get("RESULT-LINKS"), "links"),
    eliminations: tlgTextParseCandidateSet(fields.get("ELIM")),
    assignments: tlgTextParseCandidateSet(fields.get("SET")),
    truthsToApply: card1,
    virtualCardinalities: [card1, card2],
    premiseMode,
    inputMode,
    aurGroup,
    virtualGroup,
    linkType,
    hasCandidateGrid: (flags & 1) !== 0 || activeBytes.some((value) => value !== 0),
    resultLinksAvailable: (flags & 4) !== 0 || !!String(fields.get("RESULT-LINKS") || "").trim(),
    hasResult: (flags & 8) !== 0 || !!String(fields.get("ELIM") || fields.get("SET") || "").trim(),
  };
  if (!record.meta.title) record.meta.title = ui("tlgLibraryUntitledPlain");
  if (!record.createdAt) record.createdAt = Math.floor(Date.now() / 1000);
  if (!record.updatedAt) record.updatedAt = record.createdAt;
  return record;
}

function tlgLibrarySerializeTextCase(record, { compact = false } = {}) {
  const flags = tlgTextRecordFlags(record);
  const virtual1 = record.virtual1 || record.virtual || new Set();
  const virtual2 = record.virtual2 || new Set();
  const cards = Array.isArray(record.virtualCardinalities) ? record.virtualCardinalities : [record.truthsToApply || 1, 1];
  const card1 = Math.max(1, Math.min(4, Number(cards[0] || 1) || 1));
  const card2 = Math.max(1, Math.min(4, Number(cards[1] || 1) || 1));
  const virtualGroup = Math.max(0, Math.min(1, Number(record.virtualGroup || 0) || 0));
  if (compact) {
    const metadata = tlgTextBase64UrlEncodeUtf8(JSON.stringify(tlgLibraryNormalizeMeta(record.meta)));
    const optionValues = [
      record.premiseMode === "candidate-grid-asserted" ? "C" : "U",
      Math.max(0, TLG_LIBRARY_MODE_VALUES.indexOf(record.inputMode)),
      Math.max(0, Math.min(1, Number(record.aurGroup || 0) || 0)),
      Math.max(0, TLG_LIBRARY_LINK_TYPE_VALUES.indexOf(record.linkType)),
      flags,
      Number(record.createdAt || 0) >>> 0,
      Number(record.updatedAt || 0) >>> 0,
      virtualGroup,
    ].join(",");
    const parts = [
      TLG_TEXT_COMPACT_HEADER,
      `M=${metadata}`,
      `G=${tlgTextNormalizeDigits(record.givens, "GIVENS")}`,
      `V=${tlgTextNormalizeDigits(record.values, "VALUES")}`,
      `I=${tlgTextBase64UrlEncodeBytes(tlgLibraryPackCandidateKeys(record.initialCandidates))}`,
      `P=${tlgTextBase64UrlEncodeBytes(tlgLibraryPackCandidateKeys(record.activeCandidates))}`,
      `T=${tlgTextSerializeDescriptors(record.truths, true)}`,
      `L=${tlgTextSerializeDescriptors(record.links, true)}`,
      `A1=${tlgTextSerializeCandidateSet(record.aur1, true)}`,
      `A2=${tlgTextSerializeCandidateSet(record.aur2, true)}`,
      `D=${tlgTextSerializeCandidateSet(record.daur, true)}`,
      `GUR=${tlgTextSerializeCandidateSet(record.gur, true)}`,
      `W1=${card1},${tlgTextSerializeCandidateSet(virtual1, true)}`,
      `W2=${card2},${tlgTextSerializeCandidateSet(virtual2, true)}`,
      `R=${tlgTextSerializeDescriptors(record.resultLinks, true)}`,
      `E=${tlgTextSerializeCandidateSet(record.eliminations, true)}`,
      `S=${tlgTextSerializeCandidateSet(record.assignments, true)}`,
      `O=${optionValues}`,
    ];
    const body = parts.join("|");
    return `${body}|H=${tlgTextHexCrc(body)}`;
  }
  const lines = [
    TLG_TEXT_CASE_HEADER,
    `TITLE:${JSON.stringify(String(record.meta?.title || ""))}`,
    `TAGS:${JSON.stringify(String(record.meta?.tags || ""))}`,
    `SOURCE:${JSON.stringify(String(record.meta?.source || ""))}`,
    `GIVENS:${tlgTextNormalizeDigits(record.givens, "GIVENS")}`,
    `VALUES:${tlgTextNormalizeDigits(record.values, "VALUES")}`,
    `INITIAL-BITS:${tlgTextBase64UrlEncodeBytes(tlgLibraryPackCandidateKeys(record.initialCandidates))}`,
    `ACTIVE-BITS:${tlgTextBase64UrlEncodeBytes(tlgLibraryPackCandidateKeys(record.activeCandidates))}`,
    `TRUTHS:${tlgTextSerializeDescriptors(record.truths)}`,
    `LINKS:${tlgTextSerializeDescriptors(record.links)}`,
    `AUR1:${tlgTextSerializeCandidateSet(record.aur1)}`,
    `AUR2:${tlgTextSerializeCandidateSet(record.aur2)}`,
    `DAUR:${tlgTextSerializeCandidateSet(record.daur)}`,
    `GUR:${tlgTextSerializeCandidateSet(record.gur)}`,
    `VIRTUAL1[${card1}]:${tlgTextSerializeCandidateSet(virtual1)}`,
    `VIRTUAL2[${card2}]:${tlgTextSerializeCandidateSet(virtual2)}`,
    `RESULT-LINKS:${tlgTextSerializeDescriptors(record.resultLinks)}`,
    `ELIM:${tlgTextSerializeCandidateSet(record.eliminations)}`,
    `SET:${tlgTextSerializeCandidateSet(record.assignments)}`,
    `OPTIONS:premise=${record.premiseMode || "unique-puzzle-derived"};mode=${record.inputMode || "truths"};aur=${Math.max(0, Math.min(1, Number(record.aurGroup || 0) || 0))};link=${record.linkType || "auto"};vgroup=${virtualGroup}`,
    `FLAGS:${flags}`,
    `ID:${Number(record.id || 0) >>> 0}`,
    `CREATED:${Number(record.createdAt || 0) >>> 0}`,
    `UPDATED:${Number(record.updatedAt || 0) >>> 0}`,
    `NOTE:${JSON.stringify(String(record.meta?.notes || ""))}`,
  ];
  const body = `${lines.join("\n")}\n`;
  return `${body}CRC32:${tlgTextHexCrc(body)}\nEND`;
}

function tlgLibraryParseMultilineTextCase(text) {
  const normalized = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();
  const lines = normalized.split("\n");
  const header = String(lines.shift() || "").trim();
  const match = /^YZF-TLG-CASE:(\d+)$/.exec(header);
  if (!match) throw new Error(ui("tlgLibraryTextInvalidHeader"));
  const version = Number(match[1]);
  if (![1, 2].includes(version)) throw new Error(uif("tlgLibraryTextUnsupportedVersion", { version: match[1] }));
  const fields = new Map();
  const virtualOptions = [];
  let crcValue = "";
  const bodyLines = [header];
  for (const line of lines) {
    if (line === "END") break;
    const split = line.indexOf(":");
    if (split < 0) continue;
    const rawKey = line.slice(0, split).trim();
    const value = line.slice(split + 1);
    if (rawKey === "CRC32") {
      crcValue = value.trim().toUpperCase();
      continue;
    }
    bodyLines.push(line);
    const v1Match = /^VIRTUAL\[(\d+)\]$/.exec(rawKey);
    const v2Match = /^VIRTUAL([12])\[(\d+)\]$/.exec(rawKey);
    if (v1Match) {
      fields.set("VIRTUAL1", value);
      virtualOptions.push(`v1=${v1Match[1]}`);
    } else if (v2Match) {
      fields.set(`VIRTUAL${v2Match[1]}`, value);
      virtualOptions.push(`v${v2Match[1]}=${v2Match[2]}`);
    } else {
      fields.set(rawKey, value);
    }
  }
  if (crcValue) {
    const body = `${bodyLines.join("\n")}\n`;
    if (tlgTextHexCrc(body) !== crcValue) throw new Error(ui("tlgLibraryTextCrcFailed"));
  }
  if (virtualOptions.length) {
    const current = fields.get("OPTIONS") || "";
    fields.set("OPTIONS", `${current}${current ? ";" : ""}${virtualOptions.join(";")}`);
  }
  return tlgTextRecordFromFields(fields, version);
}

function tlgLibraryParseCompactTextCase(text) {
  const normalized = String(text || "").replace(/^\uFEFF/, "").trim();
  const parts = normalized.split("|");
  const header = parts.shift();
  const match = /^YZFTLG(\d+)$/.exec(header || "");
  if (!match) throw new Error(ui("tlgLibraryTextInvalidHeader"));
  const version = Number(match[1]);
  if (![1, 2].includes(version)) throw new Error(uif("tlgLibraryTextUnsupportedVersion", { version: match[1] }));
  const fields = new Map();
  let crcValue = "";
  const bodyParts = [header];
  for (const part of parts) {
    const split = part.indexOf("=");
    if (split < 1) continue;
    const key = part.slice(0, split);
    const value = part.slice(split + 1);
    if (key === "H") crcValue = value.toUpperCase();
    else {
      fields.set(key, value);
      bodyParts.push(part);
    }
  }
  if (crcValue && tlgTextHexCrc(bodyParts.join("|")) !== crcValue) throw new Error(ui("tlgLibraryTextCrcFailed"));
  let meta;
  try {
    meta = JSON.parse(tlgTextBase64UrlDecodeUtf8(fields.get("M"), "M"));
  } catch {
    throw new Error(uif("tlgLibraryTextInvalidField", { field: "M" }));
  }
  const options = String(fields.get("O") || "").split(",");
  if (options.length < 8) throw new Error(uif("tlgLibraryTextInvalidField", { field: "O" }));
  const modeIndex = Number(options[1]);
  const linkIndex = Number(options[3]);
  if (!TLG_LIBRARY_MODE_VALUES[modeIndex] || !TLG_LIBRARY_LINK_TYPE_VALUES[linkIndex]) throw new Error(uif("tlgLibraryTextInvalidField", { field: "O" }));

  let card1 = 1;
  let card2 = 1;
  let virtual1 = "";
  let virtual2 = "";
  let flags = 0;
  let created = "0";
  let updated = "0";
  let virtualGroup = 0;
  if (version === 1) {
    const virtualParts = String(fields.get("W") || "0,").split(",");
    card1 = Math.max(1, Math.min(4, Number(virtualParts.shift() || options[4] || 1) || 1));
    virtual1 = virtualParts.join(",");
    flags = Math.max(0, Number(options[5] || 0) || 0) >>> 0;
    created = options[6] || "0";
    updated = options[7] || "0";
  } else {
    const virtualParts1 = String(fields.get("W1") || "1,").split(",");
    const virtualParts2 = String(fields.get("W2") || "1,").split(",");
    card1 = Math.max(1, Math.min(4, Number(virtualParts1.shift() || 1) || 1));
    card2 = Math.max(1, Math.min(4, Number(virtualParts2.shift() || 1) || 1));
    virtual1 = virtualParts1.join(",");
    virtual2 = virtualParts2.join(",");
    flags = Math.max(0, Number(options[4] || 0) || 0) >>> 0;
    created = options[5] || "0";
    updated = options[6] || "0";
    virtualGroup = Math.max(0, Math.min(1, Number(options[7] || 0) || 0));
  }
  const mapped = new Map([
    ["TITLE", JSON.stringify(String(meta?.title || ""))],
    ["TAGS", JSON.stringify(String(meta?.tags || ""))],
    ["SOURCE", JSON.stringify(String(meta?.source || ""))],
    ["NOTE", JSON.stringify(String(meta?.notes || ""))],
    ["GIVENS", fields.get("G") || ""],
    ["VALUES", fields.get("V") || ""],
    ["INITIAL-BITS", fields.get("I") || ""],
    ["ACTIVE-BITS", fields.get("P") || ""],
    ["TRUTHS", fields.get("T") || ""],
    ["LINKS", fields.get("L") || ""],
    ["AUR1", fields.get("A1") || ""],
    ["AUR2", fields.get("A2") || ""],
    ["DAUR", fields.get("D") || ""],
    ["GUR", fields.get("GUR") || ""],
    ["VIRTUAL1", virtual1],
    ["VIRTUAL2", virtual2],
    ["RESULT-LINKS", fields.get("R") || ""],
    ["ELIM", fields.get("E") || ""],
    ["SET", fields.get("S") || ""],
    ["OPTIONS", `premise=${options[0] === "C" ? "candidate-grid-asserted" : "unique-puzzle-derived"};mode=${TLG_LIBRARY_MODE_VALUES[modeIndex]};aur=${options[2] || 0};link=${TLG_LIBRARY_LINK_TYPE_VALUES[linkIndex]};v1=${card1};v2=${card2};vgroup=${virtualGroup}`],
    ["FLAGS", String(flags)],
    ["CREATED", created],
    ["UPDATED", updated],
  ]);
  return tlgTextRecordFromFields(mapped, version);
}

function tlgLibraryParseTextCase(text) {
  const normalized = String(text || "").trim();
  if (!normalized) throw new Error(ui("tlgLibraryTextEmpty"));
  if (/^YZFTLG[12]\|/.test(normalized)) return tlgLibraryParseCompactTextCase(normalized);
  if (/^YZF-TLG-CASE:[12](?:\r?\n|$)/.test(normalized)) return tlgLibraryParseMultilineTextCase(normalized);
  throw new Error(ui("tlgLibraryTextInvalidHeader"));
}

function tlgDebugNormalizeLibraryRecord(input = {}) {
  const asSet = (value) => new Set(value instanceof Set ? value : (Array.isArray(value) ? value : []));
  const now = 1_700_000_000;
  const virtual1 = asSet(input.virtual1 || input.virtual);
  return {
    id: Number(input.id || 7) >>> 0,
    createdAt: Number(input.createdAt || now) >>> 0,
    updatedAt: Number(input.updatedAt || now + 1) >>> 0,
    meta: tlgLibraryNormalizeMeta(input.meta || { title: "dual-vset", tags: "test", source: "debug", notes: "round-trip" }),
    givens: String(input.givens || ".".repeat(81)).slice(0, 81).padEnd(81, "."),
    values: String(input.values || ".".repeat(81)).slice(0, 81).padEnd(81, "."),
    initialCandidates: asSet(input.initialCandidates),
    activeCandidates: asSet(input.activeCandidates),
    truths: [...(input.truths || [])],
    links: [...(input.links || [])],
    aur1: asSet(input.aur1),
    aur2: asSet(input.aur2),
    daur: asSet(input.daur),
    gur: asSet(input.gur),
    virtual: new Set(virtual1),
    virtual1,
    virtual2: asSet(input.virtual2),
    resultLinks: [...(input.resultLinks || [])],
    eliminations: asSet(input.eliminations),
    assignments: asSet(input.assignments),
    truthsToApply: Math.max(1, Math.min(4, Number(input.truthsToApply || input.virtualCardinalities?.[0] || 1) || 1)),
    virtualCardinalities: [
      Math.max(1, Math.min(4, Number(input.virtualCardinalities?.[0] || input.truthsToApply || 1) || 1)),
      Math.max(1, Math.min(4, Number(input.virtualCardinalities?.[1] || 1) || 1)),
    ],
    premiseMode: input.premiseMode || "candidate-grid-asserted",
    inputMode: input.inputMode || "virtualSet",
    aurGroup: Math.max(0, Math.min(1, Number(input.aurGroup || 0) || 0)),
    virtualGroup: Math.max(0, Math.min(1, Number(input.virtualGroup || 0) || 0)),
    linkType: input.linkType || "auto",
    hasCandidateGrid: input.hasCandidateGrid !== false,
    resultLinksAvailable: !!input.resultLinksAvailable,
    hasResult: !!input.hasResult,
  };
}

function tlgDebugPlainLibraryRecord(record) {
  const sorted = (value) => [...(value || [])].sort((a, b) => String(a).localeCompare(String(b)));
  return {
    version: Number(record.version || 0),
    id: Number(record.id || 0),
    createdAt: Number(record.createdAt || 0),
    updatedAt: Number(record.updatedAt || 0),
    meta: { ...(record.meta || {}) },
    givens: record.givens,
    values: record.values,
    initialCandidates: sorted(record.initialCandidates),
    activeCandidates: sorted(record.activeCandidates),
    truths: sorted(record.truths),
    links: sorted(record.links),
    aur1: sorted(record.aur1),
    aur2: sorted(record.aur2),
    daur: sorted(record.daur),
    gur: sorted(record.gur),
    virtual1: sorted(record.virtual1 || record.virtual),
    virtual2: sorted(record.virtual2),
    resultLinks: sorted(record.resultLinks),
    eliminations: sorted(record.eliminations),
    assignments: sorted(record.assignments),
    virtualCardinalities: [...(record.virtualCardinalities || [record.truthsToApply || 1, 1])],
    premiseMode: record.premiseMode,
    inputMode: record.inputMode,
    aurGroup: Number(record.aurGroup || 0),
    virtualGroup: Number(record.virtualGroup || 0),
    linkType: record.linkType,
    hasCandidateGrid: !!record.hasCandidateGrid,
    resultLinksAvailable: !!record.resultLinksAvailable,
    hasResult: !!record.hasResult,
  };
}

function tlgDebugLegacyBinaryRecord(input) {
  const record = tlgDebugNormalizeLibraryRecord(input);
  record.virtual2.clear();
  record.virtualCardinalities[1] = 1;
  record.virtualGroup = 0;
  const bytes = tlgLibraryEncodeRecord(record);
  const view = new DataView(bytes.buffer);
  view.setUint16(4, 1, true);
  view.setUint8(32, record.virtualCardinalities[0]);
  view.setUint8(34, record.aurGroup & 1);
  bytes.fill(0, TLG_LIBRARY_OFFSETS.virtual2, TLG_LIBRARY_RECORD_SIZE);
  view.setUint32(24, tlgLibraryCrc32(bytes.subarray(TLG_LIBRARY_OFFSETS.givens, TLG_LIBRARY_OFFSETS.title)), true);
  view.setUint32(20, 0, true);
  view.setUint32(20, tlgLibraryCrc32(bytes), true);
  return bytes;
}

function tlgDebugSerializeLegacyTextCase(input, { compact = false } = {}) {
  const record = tlgDebugNormalizeLibraryRecord(input);
  const card = record.virtualCardinalities[0];
  const flags = tlgTextRecordFlags(record);
  if (compact) {
    const metadata = tlgTextBase64UrlEncodeUtf8(JSON.stringify(tlgLibraryNormalizeMeta(record.meta)));
    const options = [
      record.premiseMode === "candidate-grid-asserted" ? "C" : "U",
      Math.max(0, TLG_LIBRARY_MODE_VALUES.indexOf(record.inputMode)),
      record.aurGroup,
      Math.max(0, TLG_LIBRARY_LINK_TYPE_VALUES.indexOf(record.linkType)),
      card,
      flags,
      record.createdAt,
      record.updatedAt,
    ].join(",");
    const parts = [
      "YZFTLG1",
      `M=${metadata}`,
      `G=${tlgTextNormalizeDigits(record.givens, "GIVENS")}`,
      `V=${tlgTextNormalizeDigits(record.values, "VALUES")}`,
      `I=${tlgTextBase64UrlEncodeBytes(tlgLibraryPackCandidateKeys(record.initialCandidates))}`,
      `P=${tlgTextBase64UrlEncodeBytes(tlgLibraryPackCandidateKeys(record.activeCandidates))}`,
      `T=${tlgTextSerializeDescriptors(record.truths, true)}`,
      `L=${tlgTextSerializeDescriptors(record.links, true)}`,
      `A1=${tlgTextSerializeCandidateSet(record.aur1, true)}`,
      `A2=${tlgTextSerializeCandidateSet(record.aur2, true)}`,
      `D=${tlgTextSerializeCandidateSet(record.daur, true)}`,
      `GUR=${tlgTextSerializeCandidateSet(record.gur, true)}`,
      `W=${card},${tlgTextSerializeCandidateSet(record.virtual1, true)}`,
      `R=${tlgTextSerializeDescriptors(record.resultLinks, true)}`,
      `E=${tlgTextSerializeCandidateSet(record.eliminations, true)}`,
      `S=${tlgTextSerializeCandidateSet(record.assignments, true)}`,
      `O=${options}`,
    ];
    const body = parts.join("|");
    return `${body}|H=${tlgTextHexCrc(body)}`;
  }
  const v2 = tlgLibrarySerializeTextCase(record);
  const bodyLines = v2.replace(/^YZF-TLG-CASE:2/, "YZF-TLG-CASE:1")
    .split("\n")
    .filter((line) => !line.startsWith("VIRTUAL2[") && !line.startsWith("CRC32:") && line !== "END")
    .map((line) => line.replace(/^VIRTUAL1\[(\d+)\]:/, "VIRTUAL[$1]:"));
  const body = `${bodyLines.join("\n")}\n`;
  return `${body}CRC32:${tlgTextHexCrc(body)}\nEND`;
}

function tlgLibraryOpenDb() {
  if (tlgLibraryDbPromise) return tlgLibraryDbPromise;
  tlgLibraryDbPromise = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error(ui("tlgLibraryIndexedDbUnavailable")));
      return;
    }
    const request = indexedDB.open(TLG_LIBRARY_DB_NAME, TLG_LIBRARY_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("records")) {
        const store = db.createObjectStore("records", { keyPath: "id" });
        store.createIndex("order", "order", { unique: true });
      }
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error(ui("tlgLibraryOpenFailed")));
  });
  return tlgLibraryDbPromise;
}

function tlgLibraryRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error(ui("tlgLibraryStorageFailed")));
  });
}

function tlgLibraryTransactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error(ui("tlgLibraryStorageFailed")));
    transaction.onabort = () => reject(transaction.error || new Error(ui("tlgLibraryStorageFailed")));
  });
}

async function tlgLibraryLoadRecords() {
  const db = await tlgLibraryOpenDb();
  const transaction = db.transaction(["records", "meta"], "readonly");
  const done = tlgLibraryTransactionDone(transaction);
  const rawRequest = tlgLibraryRequest(transaction.objectStore("records").getAll());
  const nextRequest = tlgLibraryRequest(transaction.objectStore("meta").get("nextId"));
  const [raw, nextMeta] = await Promise.all([rawRequest, nextRequest]);
  await done;
  const records = [];
  for (const item of raw || []) {
    try {
      const bytes = item.bytes instanceof ArrayBuffer ? new Uint8Array(item.bytes) : new Uint8Array(item.bytes || 0);
      const decoded = tlgLibraryDecodeRecord(bytes);
      records.push({ id: Number(item.id), order: Number(item.order), bytes: bytes.slice(), decoded });
    } catch (error) {
      throw new Error(uif("tlgLibraryStoredRecordDamaged", { id: item.id, error: error?.message || error }));
    }
  }
  records.sort((a, b) => a.order - b.order || a.id - b.id);
  tlgLibraryRecords = records;
  tlgLibraryNextId = records.reduce((value, entry) => Math.max(value, entry.id + 1), Math.max(Number(nextMeta?.value || 1), 1));
  if (tlgLibrarySelectedId != null && !records.some((entry) => entry.id === tlgLibrarySelectedId)) tlgLibrarySelectedId = null;
  return records;
}

async function tlgLibraryPutEntries(entries, nextId = tlgLibraryNextId) {
  const db = await tlgLibraryOpenDb();
  const transaction = db.transaction(["records", "meta"], "readwrite");
  const store = transaction.objectStore("records");
  for (const entry of entries) {
    store.put({ id: entry.id, order: entry.order, bytes: entry.bytes.buffer.slice(entry.bytes.byteOffset, entry.bytes.byteOffset + entry.bytes.byteLength) });
  }
  transaction.objectStore("meta").put({ key: "nextId", value: nextId });
  await tlgLibraryTransactionDone(transaction);
}

async function tlgLibraryDeleteEntry(id) {
  const db = await tlgLibraryOpenDb();
  const transaction = db.transaction("records", "readwrite");
  transaction.objectStore("records").delete(id);
  await tlgLibraryTransactionDone(transaction);
}

async function tlgLibraryReplaceAll(entries, nextId) {
  const db = await tlgLibraryOpenDb();
  const transaction = db.transaction(["records", "meta"], "readwrite");
  const store = transaction.objectStore("records");
  store.clear();
  entries.forEach((entry, index) => {
    const order = (index + 1) * TLG_LIBRARY_ORDER_STEP;
    entry.order = order;
    store.put({ id: entry.id, order, bytes: entry.bytes.buffer.slice(entry.bytes.byteOffset, entry.bytes.byteOffset + entry.bytes.byteLength) });
  });
  transaction.objectStore("meta").put({ key: "nextId", value: nextId });
  await tlgLibraryTransactionDone(transaction);
}

async function tlgLibraryRenumber(entries = tlgLibraryRecords) {
  entries.forEach((entry, index) => { entry.order = (index + 1) * TLG_LIBRARY_ORDER_STEP; });
  await tlgLibraryReplaceAll(entries, tlgLibraryNextId);
}

function tlgLibrarySelectedEntry() {
  return tlgLibraryRecords.find((entry) => entry.id === tlgLibrarySelectedId) || null;
}

function tlgLibraryTypeLabel(record) {
  const types = [];
  if (record.aur1.size || record.aur2.size) types.push("AUR");
  if (record.daur.size) types.push("DAUR");
  if (record.gur.size) types.push("GUR");
  if ((record.virtual1 || record.virtual)?.size) types.push("VSet1");
  if (record.virtual2?.size) types.push("VSet2");
  return types.length ? types.join("+") : "TLG";
}

function tlgLibraryStructureLabel(record) {
  const resultCount = record.eliminations.size + record.assignments.size;
  return `T${record.truths.length}/L${record.links.length}${resultCount ? ` · ${resultCount}${ui("tlgLibraryResultUnit")}` : ""}`;
}

function tlgLibraryFormatTime(seconds) {
  if (!seconds) return "";
  try {
    return new Intl.DateTimeFormat(lang.value === "en" ? "en" : "zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(seconds * 1000));
  } catch {
    return "";
  }
}

function tlgLibraryRecordSearchText(entry) {
  const record = entry.decoded;
  return [record.meta.title, record.meta.tags, record.meta.source, record.meta.notes, tlgLibraryTypeLabel(record), record.givens, record.values]
    .join(" ").toLocaleLowerCase();
}

function tlgLibraryFillEditor(record = null) {
  if (tlgLibraryTitle) tlgLibraryTitle.value = record?.meta?.title || "";
  if (tlgLibraryTags) tlgLibraryTags.value = record?.meta?.tags || "";
  if (tlgLibrarySource) tlgLibrarySource.value = record?.meta?.source || "";
  if (tlgLibraryNotes) tlgLibraryNotes.value = record?.meta?.notes || "";
  if (tlgLibraryRecordSummary) {
    tlgLibraryRecordSummary.textContent = record
      ? uif("tlgLibraryRecordSummary", {
          type: tlgLibraryTypeLabel(record),
          truths: record.truths.length,
          links: record.links.length,
          candidates: record.activeCandidates.size,
          results: record.eliminations.size + record.assignments.size,
          date: tlgLibraryFormatTime(record.updatedAt),
        })
      : ui("tlgLibraryEditorHint");
  }
}

function tlgLibraryUpdateButtons() {
  const selected = !!tlgLibrarySelectedEntry();
  const solverBusy = !!tlgSolverState.busyTask;
  [btnTlgLibraryRead, btnTlgLibraryReplace, btnTlgLibraryDelete].forEach((button) => {
    if (button) button.disabled = tlgLibraryBusy || solverBusy || !selected;
  });
  if (btnTlgLibraryExportSelected) btnTlgLibraryExportSelected.disabled = tlgLibraryBusy || !selected;
  [btnTlgLibraryInsert, btnTlgLibraryAppend].forEach((button) => {
    if (button) button.disabled = tlgLibraryBusy || solverBusy;
  });
  if (btnTlgLibraryImport) btnTlgLibraryImport.disabled = tlgLibraryBusy;
  if (btnTlgLibraryExportAll) btnTlgLibraryExportAll.disabled = tlgLibraryBusy || tlgLibraryRecords.length === 0;
  [btnTlgLibraryCopyText, btnTlgLibraryCopyCompact, btnTlgLibraryPasteText, btnTlgLibraryImportText, btnTlgLibraryExportText].forEach((button) => {
    if (button) button.disabled = tlgLibraryBusy || solverBusy;
  });
  if (btnTlgLibraryLoadText) btnTlgLibraryLoadText.disabled = tlgLibraryBusy || solverBusy || !tlgLibrarySharePreview;
  if (btnTlgLibraryClearText) btnTlgLibraryClearText.disabled = tlgLibraryBusy || !String(tlgLibraryShareText?.value || "").length;
}

function renderTlgLibrary() {
  if (!tlgLibraryList) return;
  const query = String(tlgLibrarySearch?.value || "").trim().toLocaleLowerCase();
  const filtered = query ? tlgLibraryRecords.filter((entry) => tlgLibraryRecordSearchText(entry).includes(query)) : tlgLibraryRecords;
  tlgLibraryList.replaceChildren();
  filtered.forEach((entry) => {
    const record = entry.decoded;
    const row = document.createElement("tr");
    row.className = "tlg-library-row";
    row.dataset.tlgLibraryId = String(entry.id);
    row.tabIndex = 0;
    row.setAttribute("aria-selected", entry.id === tlgLibrarySelectedId ? "true" : "false");
    const index = tlgLibraryRecords.indexOf(entry) + 1;
    const cells = [String(index), record.meta.title || uif("tlgLibraryUntitled", { index }), tlgLibraryTypeLabel(record), tlgLibraryStructureLabel(record)];
    cells.forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
      td.title = text;
      row.appendChild(td);
    });
    tlgLibraryList.appendChild(row);
  });
  if (tlgLibraryEmpty) tlgLibraryEmpty.hidden = filtered.length > 0;
  if (tlgLibraryCount) tlgLibraryCount.textContent = `${filtered.length} / ${tlgLibraryRecords.length}`;
  const selected = tlgLibrarySelectedEntry();
  if (selected) tlgLibraryFillEditor(selected.decoded);
  else if (!tlgLibraryRecords.length) tlgLibraryFillEditor(null);
  tlgLibraryUpdateButtons();
}

function tlgLibrarySelect(id, { focus = false } = {}) {
  const numericId = Number(id);
  if (!tlgLibraryRecords.some((entry) => entry.id === numericId)) return;
  tlgLibrarySelectedId = numericId;
  renderTlgLibrary();
  if (focus) tlgLibraryList?.querySelector?.(`[data-tlg-library-id="${numericId}"]`)?.focus?.();
}

function tlgLibrarySnapshotFromRecord(record) {
  const active = record.activeCandidates;
  const cells = Array.from({ length: 81 }, (_, index) => {
    const value = Number(record.values[index] || 0) || 0;
    const candidates = [];
    if (!value) {
      for (let digit = 1; digit <= 9; digit += 1) {
        if (active.has(tlgSolverCandidateKey(index, digit))) candidates.push(digit);
      }
    }
    return { index, value, candidates };
  });
  return {
    board: record.values,
    givens: record.givens,
    cells,
    revision: "TLG-LIBRARY",
    source: "tlg-library",
    hasCandidates: true,
  };
}

function tlgLibraryApplyRecord(record) {
  closeTlgSolverContextMenu();
  if (tlgSolverPanel) tlgSolverPanel.open = true;
  if (tlgSolverEnable) tlgSolverEnable.checked = true;
  if (tlgSolverMode) tlgSolverMode.value = TLG_LIBRARY_MODE_VALUES.includes(record.inputMode) ? record.inputMode : "truths";
  if (tlgSolverAurGroup) tlgSolverAurGroup.value = String(record.aurGroup || 0);
  if (tlgSolverVirtualGroup) tlgSolverVirtualGroup.value = String(record.virtualGroup || 0);
  if (tlgSolverLinkType) tlgSolverLinkType.value = TLG_LIBRARY_LINK_TYPE_VALUES.includes(record.linkType) ? record.linkType : "auto";
  if (tlgSolverAurPremiseMode) tlgSolverAurPremiseMode.value = record.premiseMode;
  tlgSolverState.selectedEndpoint = null;
  tlgSolverState.selectedCandidates.clear();
  tlgSolverState.busyTask = "";
  tlgSolverState.truths = [...record.truths];
  tlgSolverState.links = [...record.links];
  tlgSolverState.resultLinks = [...record.resultLinks];
  tlgSolverState.resultLinksAvailable = record.resultLinksAvailable;
  tlgSolverState.virtualSets = [
    new Set(record.virtual1 || record.virtual || []),
    new Set(record.virtual2 || []),
  ];
  const storedVirtualCardinalities = Array.isArray(record.virtualCardinalities)
    ? record.virtualCardinalities
    : [record.truthsToApply || 1, 1];
  tlgSolverState.virtualSetCardinalities = [
    Math.max(1, Math.min(4, Number(storedVirtualCardinalities[0] || 1) || 1)),
    Math.max(1, Math.min(4, Number(storedVirtualCardinalities[1] || 1) || 1)),
  ];
  tlgSyncVirtualCardinalityInput();
  tlgSolverState.aurGroups = [new Set(record.aur1), new Set(record.aur2)];
  tlgSolverState.dynamicAurCandidates = new Set(record.daur);
  tlgSolverState.genericAurCandidates = new Set(record.gur);
  tlgSolverState.eliminations = tlgLibraryCandidateObjectsFromKeys(record.eliminations);
  tlgSolverState.assignments = tlgLibraryCandidateObjectsFromKeys(record.assignments);
  const snapshot = tlgLibrarySnapshotFromRecord(record);
  tlgSolverState.candidateGrid = {
    activeCandidates: new Set(record.activeCandidates),
    initialCandidates: new Set(record.initialCandidates),
    snapshot,
    count: record.activeCandidates.size,
    format: `tlgdb-v${record.version || TLG_LIBRARY_SCHEMA_VERSION}`,
    source: "tlg-library",
  };
  if (record.hasResult || record.resultLinksAvailable) {
    tlgSolverState.lastResponse = {
      ok: true,
      phase: "library-snapshot",
      truthsCanonical: record.truths,
      linksCanonical: record.resultLinksAvailable ? record.resultLinks : record.links,
      eliminations: tlgSolverState.eliminations,
      assignments: tlgSolverState.assignments,
      counts: {
        truths: record.truths.length,
        links: record.resultLinksAvailable ? record.resultLinks.length : record.links.length,
        eliminations: record.eliminations.size,
        assignments: record.assignments.size,
      },
    };
    tlgSolverState.lastStatusResponse = tlgSolverState.lastResponse;
  } else {
    tlgSolverState.lastResponse = null;
    tlgSolverState.lastStatusResponse = null;
  }
  tlgSolverState.lastMessage = uif("tlgLibraryLoadedToSolver", { title: record.meta.title || ui("tlgLibraryUntitledPlain") });
  tlgSolverState.lastTone = "ok";
  selectedIndex = -1;
  renderBoardSnapshot(currentSnapshot, null);
  updateTlgSolverUi();
}

function tlgLibraryCheckDuplicate(recordBytes, excludedId = null) {
  const decoded = tlgLibraryDecodeRecord(recordBytes);
  return tlgLibraryRecords.find((entry) => entry.id !== excludedId && entry.decoded.contentHash === decoded.contentHash) || null;
}

async function tlgLibrarySave(mode) {
  if (tlgLibraryBusy) return;
  if (tlgSolverState.busyTask) {
    tlgLibrarySetStatus(ui("tlgLibrarySolverBusy"), "error");
    return;
  }
  const selected = tlgLibrarySelectedEntry();
  if (mode === "replace" && !selected) {
    tlgLibrarySetStatus(ui("tlgLibrarySelectFirst"), "error");
    return;
  }
  tlgLibraryBusy = true;
  tlgLibraryUpdateButtons();
  try {
    const id = mode === "replace" ? selected.id : tlgLibraryNextId++;
    const createdAt = mode === "replace" ? selected.decoded.createdAt : undefined;
    const state = tlgLibraryCaptureState(tlgLibraryCurrentMeta(), { id, createdAt });
    const bytes = tlgLibraryEncodeRecord(state);
    const duplicate = tlgLibraryCheckDuplicate(bytes, mode === "replace" ? id : null);
    if (duplicate && !confirm(uif("tlgLibraryDuplicateConfirm", { title: duplicate.decoded.meta.title || ui("tlgLibraryUntitledPlain") }))) {
      if (mode !== "replace") tlgLibraryNextId -= 1;
      return;
    }
    let order;
    if (mode === "append" || !selected) {
      order = tlgLibraryRecords.length ? tlgLibraryRecords[tlgLibraryRecords.length - 1].order + TLG_LIBRARY_ORDER_STEP : TLG_LIBRARY_ORDER_STEP;
    } else if (mode === "replace") {
      order = selected.order;
    } else {
      const selectedIndex = tlgLibraryRecords.indexOf(selected);
      const previous = selectedIndex > 0 ? tlgLibraryRecords[selectedIndex - 1].order : 0;
      const next = selected.order;
      order = Math.floor((previous + next) / 2);
      if (order <= previous || order >= next) {
        await tlgLibraryRenumber(tlgLibraryRecords);
        const refreshedSelected = tlgLibrarySelectedEntry();
        const refreshedIndex = tlgLibraryRecords.indexOf(refreshedSelected);
        const refreshedPrevious = refreshedIndex > 0 ? tlgLibraryRecords[refreshedIndex - 1].order : 0;
        order = Math.floor((refreshedPrevious + refreshedSelected.order) / 2);
      }
    }
    await tlgLibraryPutEntries([{ id, order, bytes }], tlgLibraryNextId);
    tlgLibrarySelectedId = id;
    await tlgLibraryLoadRecords();
    renderTlgLibrary();
    tlgLibrarySetStatus(uif(mode === "replace" ? "tlgLibraryReplaced" : mode === "insert" ? "tlgLibraryInserted" : "tlgLibraryAppended", {
      index: tlgLibraryRecords.findIndex((entry) => entry.id === id) + 1,
      title: state.meta.title,
    }), "ok");
  } catch (error) {
    tlgLibrarySetStatus(error?.message || String(error), "error");
  } finally {
    tlgLibraryBusy = false;
    tlgLibraryUpdateButtons();
  }
}

async function tlgLibraryDeleteSelected() {
  const selected = tlgLibrarySelectedEntry();
  if (!selected || tlgLibraryBusy) return;
  if (!confirm(uif("tlgLibraryDeleteConfirm", { title: selected.decoded.meta.title || ui("tlgLibraryUntitledPlain") }))) return;
  tlgLibraryBusy = true;
  tlgLibraryUpdateButtons();
  try {
    const oldIndex = tlgLibraryRecords.indexOf(selected);
    await tlgLibraryDeleteEntry(selected.id);
    await tlgLibraryLoadRecords();
    const next = tlgLibraryRecords[Math.min(oldIndex, tlgLibraryRecords.length - 1)] || null;
    tlgLibrarySelectedId = next?.id ?? null;
    renderTlgLibrary();
    tlgLibrarySetStatus(uif("tlgLibraryDeleted", { title: selected.decoded.meta.title || ui("tlgLibraryUntitledPlain") }), "ok");
  } catch (error) {
    tlgLibrarySetStatus(error?.message || String(error), "error");
  } finally {
    tlgLibraryBusy = false;
    tlgLibraryUpdateButtons();
  }
}

function tlgLibraryReadSelected() {
  const selected = tlgLibrarySelectedEntry();
  if (!selected || tlgLibraryBusy) return;
  if (tlgSolverState.busyTask) {
    tlgLibrarySetStatus(ui("tlgLibrarySolverBusy"), "error");
    return;
  }
  try {
    tlgLibraryApplyRecord(selected.decoded);
    tlgLibrarySetStatus(uif("tlgLibraryRead", { title: selected.decoded.meta.title || ui("tlgLibraryUntitledPlain") }), "ok");
    if (tlgLibraryDialog?.open) tlgLibraryDialog.close();
  } catch (error) {
    tlgLibrarySetStatus(error?.message || String(error), "error");
  }
}

function tlgLibraryDownload(bytes, filename, mimeType = "application/octet-stream") {
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function tlgLibraryFilename(prefix) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
  return `${prefix}_${stamp}.tlgdb`;
}

function tlgLibraryExport(selectedOnly = false) {
  const records = selectedOnly ? [tlgLibrarySelectedEntry()].filter(Boolean) : tlgLibraryRecords;
  if (!records.length) {
    tlgLibrarySetStatus(ui("tlgLibraryNothingToExport"), "error");
    return;
  }
  const bytes = tlgLibraryBuildFile(records);
  tlgLibraryDownload(bytes, tlgLibraryFilename(selectedOnly ? "YZF_TLG_case" : "YZF_TLG_library"));
  tlgLibrarySetStatus(uif(selectedOnly ? "tlgLibraryExportedSelected" : "tlgLibraryExportedAll", { count: records.length, bytes: bytes.length }), "ok");
}

async function tlgLibraryImportFile(file) {
  if (!file || tlgLibraryBusy) return;
  tlgLibraryBusy = true;
  tlgLibraryUpdateButtons();
  try {
    const parsed = tlgLibraryParseFile(new Uint8Array(await file.arrayBuffer()));
    if (!parsed.records.length) throw new Error(ui("tlgLibraryEmptyImport"));
    const mode = tlgLibraryImportMode?.value || "append";
    if (mode === "replaceAll") {
      if (!confirm(uif("tlgLibraryReplaceAllConfirm", { count: parsed.records.length }))) return;
      const ids = new Set();
      let nextId = 1;
      const entries = parsed.records.map((entry) => {
        let id = entry.id;
        if (!id || ids.has(id)) id = nextId;
        while (ids.has(id)) id += 1;
        ids.add(id);
        nextId = Math.max(nextId, id + 1);
        const bytes = tlgLibraryRewriteIdentity(entry.bytes, id);
        return { id, order: 0, bytes };
      });
      await tlgLibraryReplaceAll(entries, Math.max(nextId, parsed.nextId));
      tlgLibrarySelectedId = entries[0]?.id ?? null;
    } else {
      const usedIds = new Set(tlgLibraryRecords.map((entry) => entry.id));
      const imported = parsed.records.map((entry) => {
        let id = tlgLibraryNextId++;
        while (usedIds.has(id)) id = tlgLibraryNextId++;
        usedIds.add(id);
        return { id, order: 0, bytes: tlgLibraryRewriteIdentity(entry.bytes, id) };
      });
      if (mode === "insert" && tlgLibrarySelectedEntry()) {
        const selected = tlgLibrarySelectedEntry();
        const selectedIndex = tlgLibraryRecords.indexOf(selected);
        const previous = selectedIndex > 0 ? tlgLibraryRecords[selectedIndex - 1].order : 0;
        const gap = selected.order - previous;
        if (gap > imported.length) {
          imported.forEach((entry, index) => { entry.order = previous + Math.floor(gap * (index + 1) / (imported.length + 1)); });
          await tlgLibraryPutEntries(imported, tlgLibraryNextId);
        } else {
          const combined = [...tlgLibraryRecords];
          combined.splice(selectedIndex, 0, ...imported);
          await tlgLibraryReplaceAll(combined, tlgLibraryNextId);
        }
      } else {
        let order = tlgLibraryRecords.length ? tlgLibraryRecords[tlgLibraryRecords.length - 1].order : 0;
        imported.forEach((entry) => { order += TLG_LIBRARY_ORDER_STEP; entry.order = order; });
        await tlgLibraryPutEntries(imported, tlgLibraryNextId);
      }
      tlgLibrarySelectedId = imported[0]?.id ?? tlgLibrarySelectedId;
    }
    await tlgLibraryLoadRecords();
    renderTlgLibrary();
    tlgLibrarySetStatus(uif("tlgLibraryImported", { count: parsed.records.length }), "ok");
  } catch (error) {
    tlgLibrarySetStatus(uif("tlgLibraryImportFailed", { error: error?.message || error }), "error");
  } finally {
    if (tlgLibraryFileInput) tlgLibraryFileInput.value = "";
    tlgLibraryBusy = false;
    tlgLibraryUpdateButtons();
  }
}


function tlgLibrarySetShareSummary(message, tone = "") {
  if (!tlgLibraryShareSummary) return;
  tlgLibraryShareSummary.textContent = String(message || "");
  if (tone) tlgLibraryShareSummary.dataset.tone = tone;
  else tlgLibraryShareSummary.removeAttribute("data-tone");
}

function tlgLibraryShowSharePanel(show = true) {
  if (!tlgLibrarySharePanel) return;
  tlgLibrarySharePanel.hidden = !show;
  if (show) requestAnimationFrame(() => tlgLibraryShareText?.focus?.());
}

function tlgLibraryShareRecord() {
  return tlgLibraryCaptureState(tlgLibraryCurrentMeta());
}

function tlgLibraryTextByteLength(value) {
  return new TextEncoder().encode(String(value || "")).length;
}

function tlgLibraryTextPreviewMessage(record, text) {
  return uif("tlgLibraryTextPreview", {
    title: record.meta.title || ui("tlgLibraryUntitledPlain"),
    type: tlgLibraryTypeLabel(record),
    truths: record.truths.length,
    links: record.links.length,
    candidates: record.activeCandidates.size,
    results: record.eliminations.size + record.assignments.size,
    bytes: tlgLibraryTextByteLength(text),
  });
}

function tlgLibraryPreviewShareText() {
  const text = String(tlgLibraryShareText?.value || "").trim();
  tlgLibrarySharePreview = null;
  if (!text) {
    tlgLibrarySetShareSummary(ui("tlgLibraryShareEmptyHint"));
    tlgLibraryUpdateButtons();
    return null;
  }
  try {
    const record = tlgLibraryParseTextCase(text);
    tlgLibrarySharePreview = record;
    tlgLibrarySetShareSummary(tlgLibraryTextPreviewMessage(record, text), "ok");
    tlgLibrarySetStatus(ui("tlgLibraryTextReady"), "ok");
    tlgLibraryUpdateButtons();
    return record;
  } catch (error) {
    tlgLibrarySetShareSummary(uif("tlgLibraryTextParseFailed", { error: error?.message || error }), "error");
    tlgLibraryUpdateButtons();
    return null;
  }
}

function tlgLibraryScheduleSharePreview() {
  clearTimeout(tlgLibrarySharePreviewTimer);
  tlgLibrarySharePreview = null;
  tlgLibrarySharePreviewTimer = setTimeout(() => tlgLibraryPreviewShareText(), 180);
  tlgLibraryUpdateButtons();
}

function tlgLibrarySetShareText(text, { preview = true } = {}) {
  if (tlgLibraryShareText) tlgLibraryShareText.value = String(text || "");
  tlgLibraryShowSharePanel(true);
  if (preview) tlgLibraryPreviewShareText();
  else {
    tlgLibrarySharePreview = null;
    tlgLibrarySetShareSummary(ui("tlgLibraryShareEmptyHint"));
    tlgLibraryUpdateButtons();
  }
}

async function tlgLibraryWriteClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand?.("copy");
  textarea.remove();
  if (!copied) throw new Error(ui("tlgLibraryClipboardWriteFailed"));
}

async function tlgLibraryCopyCurrentText(compact = false) {
  if (tlgLibraryBusy || tlgSolverState.busyTask) return;
  try {
    const record = tlgLibraryShareRecord();
    const text = tlgLibrarySerializeTextCase(record, { compact });
    await tlgLibraryWriteClipboard(text);
    tlgLibrarySetStatus(uif(compact ? "tlgLibraryCompactCopied" : "tlgLibraryTextCopied", { bytes: tlgLibraryTextByteLength(text) }), "ok");
  } catch (error) {
    try {
      const record = tlgLibraryShareRecord();
      tlgLibrarySetShareText(tlgLibrarySerializeTextCase(record, { compact }));
    } catch {
      // Preserve the original error below.
    }
    tlgLibrarySetStatus(error?.message || ui("tlgLibraryClipboardWriteFailed"), "error");
  }
}

function tlgLibrarySafeFilenamePart(value) {
  const normalized = String(value || "TLG_case").trim().replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_").replace(/\s+/g, " ");
  return (normalized || "TLG_case").slice(0, 72);
}

function tlgLibraryExportCurrentText() {
  if (tlgLibraryBusy || tlgSolverState.busyTask) return;
  try {
    const record = tlgLibraryShareRecord();
    const text = tlgLibrarySerializeTextCase(record);
    const filename = `${tlgLibrarySafeFilenamePart(record.meta.title)}.tlg.txt`;
    tlgLibraryDownload(new TextEncoder().encode(text), filename, "text/plain;charset=utf-8");
    tlgLibrarySetStatus(uif("tlgLibraryTextExported", { bytes: tlgLibraryTextByteLength(text) }), "ok");
  } catch (error) {
    tlgLibrarySetStatus(error?.message || String(error), "error");
  }
}

async function tlgLibraryOpenPastePanel() {
  tlgLibraryShowSharePanel(true);
  tlgLibrarySetStatus(ui("tlgLibraryTextPanelOpened"));
  if (String(tlgLibraryShareText?.value || "").trim()) {
    tlgLibraryPreviewShareText();
    return;
  }
  try {
    if (!navigator.clipboard?.readText) throw new Error(ui("tlgLibraryClipboardReadFailed"));
    const text = await navigator.clipboard.readText();
    if (String(text || "").trim()) tlgLibrarySetShareText(text);
    else tlgLibrarySetShareSummary(ui("tlgLibraryShareEmptyHint"));
  } catch {
    tlgLibrarySetShareSummary(ui("tlgLibraryShareEmptyHint"));
    tlgLibrarySetStatus(ui("tlgLibraryClipboardReadFailed"), "error");
  }
}

async function tlgLibraryImportTextFile(file) {
  if (!file || tlgLibraryBusy) return;
  try {
    const text = await file.text();
    tlgLibrarySetShareText(text);
  } catch (error) {
    tlgLibrarySetStatus(uif("tlgLibraryTextFileReadFailed", { error: error?.message || error }), "error");
  } finally {
    if (tlgLibraryTextFileInput) tlgLibraryTextFileInput.value = "";
  }
}

function tlgLibraryLoadShareText() {
  if (tlgLibraryBusy || tlgSolverState.busyTask) return;
  const record = tlgLibrarySharePreview || tlgLibraryPreviewShareText();
  if (!record) return;
  const title = record.meta.title || ui("tlgLibraryUntitledPlain");
  if (!confirm(uif("tlgLibraryTextLoadConfirm", { title }))) return;
  try {
    tlgLibraryApplyRecord(record);
    tlgLibraryFillEditor(record);
    tlgLibrarySetStatus(uif("tlgLibraryTextLoaded", { title }), "ok");
  } catch (error) {
    tlgLibrarySetStatus(uif("tlgLibraryTextParseFailed", { error: error?.message || error }), "error");
  }
}

function tlgLibraryClearShareText() {
  if (tlgLibraryShareText) tlgLibraryShareText.value = "";
  tlgLibrarySharePreview = null;
  tlgLibrarySetShareSummary(ui("tlgLibraryShareEmptyHint"));
  tlgLibraryUpdateButtons();
}

async function openTlgLibraryDialog() {
  if (!tlgLibraryDialog || tlgLibraryBusy) return;
  try {
    tlgLibraryBusy = true;
    tlgLibrarySetStatus(ui("tlgLibraryLoading"));
    await tlgLibraryLoadRecords();
    if (tlgLibrarySelectedId == null && tlgLibraryRecords.length) tlgLibrarySelectedId = tlgLibraryRecords[0].id;
    renderTlgLibrary();
    if (typeof tlgLibraryDialog.showModal === "function") tlgLibraryDialog.showModal();
    else tlgLibraryDialog.setAttribute("open", "");
    tlgLibrarySetStatus(ui("tlgLibraryIdle"));
  } catch (error) {
    setTlgSolverStatus(uif("tlgLibraryOpenError", { error: error?.message || error }), "error");
  } finally {
    tlgLibraryBusy = false;
    tlgLibraryUpdateButtons();
  }
}

function initTlgLibraryControls() {
  if (!btnTlgLibrary || !tlgLibraryDialog) return;
  btnTlgLibrary.addEventListener("click", () => { void openTlgLibraryDialog(); });
  btnTlgLibraryClose?.addEventListener("click", () => tlgLibraryDialog.close());
  tlgLibraryDialog.addEventListener("click", (event) => {
    if (event.target === tlgLibraryDialog) tlgLibraryDialog.close();
  });
  btnTlgLibraryRead?.addEventListener("click", tlgLibraryReadSelected);
  btnTlgLibraryInsert?.addEventListener("click", () => { void tlgLibrarySave("insert"); });
  btnTlgLibraryReplace?.addEventListener("click", () => { void tlgLibrarySave("replace"); });
  btnTlgLibraryAppend?.addEventListener("click", () => { void tlgLibrarySave("append"); });
  btnTlgLibraryDelete?.addEventListener("click", () => { void tlgLibraryDeleteSelected(); });
  btnTlgLibraryImport?.addEventListener("click", () => tlgLibraryFileInput?.click());
  btnTlgLibraryExportSelected?.addEventListener("click", () => tlgLibraryExport(true));
  btnTlgLibraryExportAll?.addEventListener("click", () => tlgLibraryExport(false));
  btnTlgLibraryCopyText?.addEventListener("click", () => { void tlgLibraryCopyCurrentText(false); });
  btnTlgLibraryCopyCompact?.addEventListener("click", () => { void tlgLibraryCopyCurrentText(true); });
  btnTlgLibraryPasteText?.addEventListener("click", () => { void tlgLibraryOpenPastePanel(); });
  btnTlgLibraryImportText?.addEventListener("click", () => tlgLibraryTextFileInput?.click());
  btnTlgLibraryExportText?.addEventListener("click", tlgLibraryExportCurrentText);
  btnTlgLibraryLoadText?.addEventListener("click", tlgLibraryLoadShareText);
  btnTlgLibraryClearText?.addEventListener("click", tlgLibraryClearShareText);
  btnTlgLibraryCloseText?.addEventListener("click", () => tlgLibraryShowSharePanel(false));
  tlgLibraryFileInput?.addEventListener("change", () => { void tlgLibraryImportFile(tlgLibraryFileInput.files?.[0]); });
  tlgLibraryTextFileInput?.addEventListener("change", () => { void tlgLibraryImportTextFile(tlgLibraryTextFileInput.files?.[0]); });
  tlgLibraryShareText?.addEventListener("input", tlgLibraryScheduleSharePreview);
  tlgLibrarySearch?.addEventListener("input", renderTlgLibrary);
  tlgLibraryList?.addEventListener("click", (event) => {
    const row = event.target?.closest?.("tr[data-tlg-library-id]");
    if (row) tlgLibrarySelect(row.dataset.tlgLibraryId);
  });
  tlgLibraryList?.addEventListener("dblclick", (event) => {
    const row = event.target?.closest?.("tr[data-tlg-library-id]");
    if (!row) return;
    tlgLibrarySelect(row.dataset.tlgLibraryId);
    tlgLibraryReadSelected();
  });
  tlgLibraryList?.addEventListener("keydown", (event) => {
    const row = event.target?.closest?.("tr[data-tlg-library-id]");
    if (!row) return;
    if (event.key === "Enter") {
      event.preventDefault();
      tlgLibrarySelect(row.dataset.tlgLibraryId);
      tlgLibraryReadSelected();
    }
  });
  tlgLibrarySetShareSummary(ui("tlgLibraryShareEmptyHint"));
  tlgLibraryUpdateButtons();
}


function getManualAdvancedDefaultPuzzle() {
  const fromInput = (givens?.value || "").trim();
  if (fromInput) {
    return fromInput;
  }
  return "53..7...." +
    "6..195..." +
    ".98....6." +
    "8...6...3" +
    "4..8.3..1" +
    "7...2...6" +
    ".6....28." +
    "...419..5" +
    "....8..79";
}

function manualAdvancedStepTest(request, puzzle = "") {
  if (!engine || typeof engine.manual_advanced_step_json !== "function") {
    throw new Error("manual_advanced_step_json is not available");
  }
  const finalPuzzle = (puzzle || getManualAdvancedDefaultPuzzle()).trim();
  const requestJson = typeof request === "string" ? request : JSON.stringify(request || {});
  return engine.manual_advanced_step_json(finalPuzzle, requestJson);
}

function createWasmModuleOptions() {
  const options = {
    locateFile: (path) => path.endsWith(".wasm") ? `./${path}?v=${APP_VERSION}` : path,
  };
  if (window.YZF_EMBEDDED_WASM_BINARY instanceof Uint8Array) {
    options.wasmBinary = window.YZF_EMBEDDED_WASM_BINARY;
  }
  return options;
}

async function init() {
  const mod = await createModule(createWasmModuleOptions());
  engine = new mod.Engine();
  if (APP_DEBUG_MODE) {
    window.manualAdvancedStepTest = manualAdvancedStepTest;
    window.tlgSolverRequestV440 = buildTlgSolverRequestV440;
    window.tlgSolverFindEliminationsV440 = callTlgSolverFindEliminationsV440;
    window.__YZF_TLG_SERIALIZATION_TEST__ = Object.freeze({
      schemaVersion: TLG_LIBRARY_SCHEMA_VERSION,
      normalize: (record) => tlgDebugPlainLibraryRecord(tlgDebugNormalizeLibraryRecord(record)),
      encode: (record) => [...tlgLibraryEncodeRecord(tlgDebugNormalizeLibraryRecord(record))],
      decode: (bytes) => tlgDebugPlainLibraryRecord(tlgLibraryDecodeRecord(Uint8Array.from(bytes || []))),
      encodeLegacyV1: (record) => [...tlgDebugLegacyBinaryRecord(record)],
      serialize: (record, compact = false) => tlgLibrarySerializeTextCase(tlgDebugNormalizeLibraryRecord(record), { compact: !!compact }),
      serializeLegacyV1: (record, compact = false) => tlgDebugSerializeLegacyTextCase(record, { compact: !!compact }),
      parse: (text) => tlgDebugPlainLibraryRecord(tlgLibraryParseTextCase(text)),
    });
  }
  buildNumpad();
  loadTechniqueState();
  const sharedParameter = sharedPuzzleParameterFromCurrentUrl();
  let restoredSession = false;
  let sharedPuzzle = { present: sharedParameter.present, loaded: false };
  if (sharedParameter.present) {
    await restoreAppSession({ restorePuzzle: false, announce: false });
    sharedPuzzle = await importSharedPuzzleFromUrl();
  } else {
    restoredSession = await restoreAppSession();
  }
  renderTechniques();
  activateTab("controls");
  debugLogUi("wasmLoaded");
  if (!sharedPuzzle.loaded && !restoredSession) {
    renderBoard(null);
  }
  if (!APP_DEBUG_MODE) {
    document.querySelector(".yzf-debug-panel")?.classList.add("hidden");
  }
  initYzfTyp4DebugOverlayControls();
  initTlgSolverControls();
  initManualMarksControls();
}

for (const button of tabButtons) {
  button.addEventListener("click", () => {
    activateTab(button.dataset.tab);
  });
}

trainingTechniqueSelect?.addEventListener("change", () => {
  updateTrainingTechniqueSelectColor();
  syncBatchFilenameDefault();
});
trainingOtp?.addEventListener("change", () => {
  saveTrainingOtp();
  syncBatchFilenameDefault();
});
btnTrainingTextFilter?.addEventListener("click", openTrainingTextFilterDialog);
btnTrainingTextFilterApply?.addEventListener("click", applyTrainingTextFilterDialog);
btnTrainingTextFilterClear?.addEventListener("click", () => {
  if (trainingTextFilterInclude) trainingTextFilterInclude.value = "";
  if (trainingTextFilterExclude) trainingTextFilterExclude.value = "";
  if (trainingTextFilterCaseSensitive) trainingTextFilterCaseSensitive.checked = false;
  trainingTextFilterInclude?.focus();
});
trainingTextFilterDialog?.addEventListener("click", (event) => {
  if (event.target === trainingTextFilterDialog) closeTrainingTextFilterDialog();
});
batchMode?.addEventListener("change", updateBatchModeUi);
batchFilename?.addEventListener("input", () => {
  batchFilename.dataset.userEdited = String(batchFilename.value || "").trim() === batchFilenameAutoValue
    ? "false"
    : "true";
});
batchPanel?.addEventListener("toggle", () => {
  if (batchPanel.open) syncBatchFilenameDefault();
});

async function readClipboardTextForLoad() {
  if (!navigator.clipboard?.readText) {
    return { ok: false, error: ui("clipboardReadUnsupported") };
  }
  try {
    const text = String(await navigator.clipboard.readText() || "").trim();
    if (!text) {
      return { ok: false, error: ui("clipboardEmpty") };
    }
    return { ok: true, text };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function loadPuzzleFromClipboardFirstEnabled() {
  return preferClipboardLoad?.checked !== false;
}

async function retryPuzzleImportFromClipboard(options, rawInput) {
  if (!options.clipboardFallback || options.clipboardAlreadyTried) return null;
  const clipboard = await readClipboardTextForLoad();
  if (!clipboard.ok || clipboard.text === rawInput) return null;
  givens.value = clipboard.text;
  setStatus(ui("importClipboardRetry"));
  return importPuzzleFromCurrentInput({ ...options, clipboardAlreadyTried: true });
}

async function importPuzzleFromCurrentInput(options = {}) {
  if (!engine) return;
  if (options.preferClipboardFirst && !options.clipboardAlreadyTried) {
    const fallbackInput = (givens.value || "").trim();
    const clipboard = await readClipboardTextForLoad();
    if (clipboard.ok) {
      givens.value = clipboard.text;
      setStatus(ui("clipboardPreferredLoaded"));
      const result = await importPuzzleFromCurrentInput({
        ...options,
        preferClipboardFirst: false,
        clipboardAlreadyTried: true,
      });
      if (result?.ok) return result;
      givens.value = fallbackInput;
      if (fallbackInput) {
        setStatus(uif("clipboardPreferredFailed", { error: result?.error || ui("importUnknownFormat") }));
        return importPuzzleFromCurrentInput({
          ...options,
          preferClipboardFirst: false,
          clipboardFallback: false,
          clipboardAlreadyTried: true,
        });
      }
      return result;
    }
    if (fallbackInput) {
      givens.value = fallbackInput;
      setStatus(uif("clipboardPreferredFailed", { error: clipboard.error }));
      return importPuzzleFromCurrentInput({
        ...options,
        preferClipboardFirst: false,
        clipboardFallback: false,
        clipboardAlreadyTried: true,
      });
    }
    setStatus(uif("inputEmptyClipboardFailed", { error: clipboard.error }));
    debugLog(ui("loadFailedPrefix") + uif("inputEmptyClipboardFailed", { error: clipboard.error }));
    return { ok: false, error: clipboard.error };
  }
  const rawInput = (givens.value || "").trim();
  if (options.clipboardFallback && !options.clipboardAlreadyTried && !rawInput) {
    const clipboard = await readClipboardTextForLoad();
    if (clipboard.ok) {
      givens.value = clipboard.text;
      setStatus(ui("inputEmptyClipboardLoaded"));
      return importPuzzleFromCurrentInput({ ...options, clipboardAlreadyTried: true });
    }
    setStatus(uif("inputEmptyClipboardFailed", { error: clipboard.error }));
    debugLog(ui("loadFailedPrefix") + uif("inputEmptyClipboardFailed", { error: clipboard.error }));
    return { ok: false, error: clipboard.error };
  }
  let importText = "";
  try {
    importText = await preprocessImportText(rawInput);
  } catch (error) {
    const clipboardRetry = await retryPuzzleImportFromClipboard(options, rawInput);
    if (clipboardRetry) return clipboardRetry;
    const message = error instanceof Error ? error.message : "Coach puzzle string decode failed";
    debugLog(ui("loadFailedPrefix") + message);
    setStatus(ui("loadFailedPrefix") + message);
    return { ok: false, error: message };
  }
  const result = parseJson(engine.import_puzzle_json(importText));
  if (result?.ok) {
    originalBoard = result.state?.givens || result.givens || result.puzzle;
    givens.value = result.givens === result.puzzle && !result.hasCandidates ? result.puzzle : rawInput;
    resetBoardContextForSnapshot(result.state, { resetSelectedIndex: true });
        debugLog(JSON.stringify(result, null, 2));
    setStatus(uif("importedPuzzle", { format: result.format, candidates: result.hasCandidates ? ui("importedWithCandidates") : "" }));
    updateInputControls();
    scheduleAppSessionSave();
    return result;
  } else {
    clearStepViewState({ resetSelectedIndex: true });
    const clipboardRetry = await retryPuzzleImportFromClipboard(options, rawInput);
    if (clipboardRetry) return clipboardRetry;
        const error = result?.error || ui("importUnknownFormat");
    debugLog(ui("loadFailedPrefix") + error);
    setStatus(ui("loadFailedPrefix") + error);
    return { ok: false, error };
  }
}


let ocrResourceProgressActive = false;

function ocrResourceDisplayName(asset) {
  if (asset === "wasm") return ui("ocrResourceWasm");
  if (asset === "localizer") return ui("ocrResourceLocalizer");
  if (asset === "classifier") return ui("ocrResourceClassifier");
  if (asset === "module") return ui("ocrResourceModule");
  return String(asset || "OCR");
}

function ocrMegabytes(value) {
  return (Math.max(0, Number(value) || 0) / 1_000_000).toFixed(2);
}

window.addEventListener("yzf-ocr-resource-progress", (event) => {
  if (!ocrResourceProgressActive) return;
  const detail = event?.detail || {};
  const asset = ocrResourceDisplayName(detail.asset);
  const values = {
    asset,
    loaded: ocrMegabytes(detail.loaded),
    total: ocrMegabytes(detail.total),
    percent: Number(detail.percent || 0),
    attempt: Number(detail.attempt || 0),
  };
  if (detail.phase === "retry") {
    setStatus(uif("ocrResourceRetry", values));
  } else if (detail.phase === "probing") {
    setStatus(uif("ocrResourceProbe", values));
  } else if (detail.phase === "resume") {
    setStatus(uif("ocrResourceResume", values));
  } else if (detail.phase === "cache") {
    setStatus(uif("ocrResourceCache", values));
  } else if (detail.phase === "assembling") {
    setStatus(uif("ocrResourceAssembling", values));
  } else if (detail.total > 0 && (detail.phase === "downloading" || detail.phase === "ready")) {
    setStatus(uif("ocrResourceProgress", values));
  }
});


function ocrCorrectionLanguage() {
  return String(lang?.value || "zh").toLowerCase().startsWith("en") ? "en" : "zh";
}

function ocrCorrectionText(key) {
  const dict = {
    zh: {
      title: "OCR 对照校正",
      subtitle: "左侧对照识别图片，右侧直接修改识别结果。点图片或盘面可同步选格。",
      source: "识别图片",
      board: "校正盘面",
      selected: "当前格",
      given: "提示数",
      solved: "出数",
      candidate: "候选数",
      clear: "清空",
      previous: "上一格",
      next: "下一格",
      undo: "撤销",
      redo: "重做",
      reset: "恢复识别结果",
      fullscreen: "全屏校正",
      exitFullscreen: "退出全屏",
      cancel: "取消",
      confirm: "确认并导入",
      clueCount: "提示数 {clue}",
      solvedCount: "出数 {solved}",
      candidateCount: "候选格 {candidate}",
      empty: "空格",
      candidateHint: "候选模式下，数字键用于添加或删除候选数。",
      valueHint: "提示数和出数模式下，点击数字直接替换当前格。",
      closeConfirm: "放弃本次 OCR 校正结果？",
      noPreview: "没有可显示的识别图片",
    },
    en: {
      title: "OCR Review & Correction",
      subtitle: "Compare the recognized image on the left and edit the grid on the right. Tapping either side selects the same cell.",
      source: "Recognized image",
      board: "Correction grid",
      selected: "Selected cell",
      given: "Given",
      solved: "Solved digit",
      candidate: "Candidates",
      clear: "Clear",
      previous: "Previous",
      next: "Next",
      undo: "Undo",
      redo: "Redo",
      reset: "Reset OCR result",
      fullscreen: "Fullscreen review",
      exitFullscreen: "Exit fullscreen",
      cancel: "Cancel",
      confirm: "Confirm & import",
      clueCount: "Givens {clue}",
      solvedCount: "Solved {solved}",
      candidateCount: "Candidate cells {candidate}",
      empty: "Empty",
      candidateHint: "In candidate mode, number keys toggle candidates.",
      valueHint: "In Given or Solved mode, a number replaces the selected cell.",
      closeConfirm: "Discard this OCR correction?",
      noPreview: "No recognized image is available",
    },
  };
  return dict[ocrCorrectionLanguage()]?.[key] || dict.zh[key] || key;
}

function ocrCorrectionIsActive() {
  return Boolean(ocrCorrectionState && ocrCorrectionRoot?.isConnected);
}

function ocrCorrectionCloneCells(cells) {
  return (cells || []).map((cell, index) => ({
    index,
    value: Number(cell?.value || 0),
    role: cell?.role === "given" || cell?.role === "solved" ? cell.role : "candidate",
    candidateMask: Number(cell?.candidateMask || 0) & 0x3fe,
    originalConfidence: Number.isFinite(Number(cell?.originalConfidence)) ? Number(cell.originalConfidence) : null,
  }));
}

function ocrCorrectionCellsFromResult(ocr) {
  const resultCells = Array.isArray(ocr?.cells) ? ocr.cells : [];
  if (resultCells.length === 81) {
    return resultCells.map((cell, index) => {
      const rawValue = String(cell?.value ?? ".");
      const value = /^[1-9]$/.test(rawValue) ? Number(rawValue) : Number(cell?.value || 0);
      return {
        index,
        value: value >= 1 && value <= 9 ? value : 0,
        role: value >= 1 && value <= 9 ? (cell?.isGiven ? "given" : "solved") : "candidate",
        candidateMask: value >= 1 && value <= 9 ? 0 : (Number(cell?.candidateMask || 0) & 0x3fe),
        originalConfidence: Number.isFinite(Number(cell?.confidence)) ? Number(cell.confidence) : null,
      };
    });
  }

  const given = normalizeCoachDigitString(ocr?.coachJson?.givenDigits || "");
  const solved = normalizeCoachDigitString(ocr?.coachJson?.userDigits || "");
  const masks = parseCoachCandidateMasks(ocr?.coachJson?.userCellCandidates || "");
  return Array.from({ length: 81 }, (_, index) => {
    const g = given[index] || ".";
    const u = solved[index] || ".";
    const value = g >= "1" && g <= "9" ? Number(g) : (u >= "1" && u <= "9" ? Number(u) : 0);
    return {
      index,
      value,
      role: value ? (g >= "1" && g <= "9" ? "given" : "solved") : "candidate",
      candidateMask: value ? 0 : (Number(masks[index] || 0) & 0x3fe),
      originalConfidence: null,
    };
  });
}

function ocrCorrectionAllCandidateMasks(cells = ocrCorrectionState?.cells) {
  if (!Array.isArray(cells) || cells.length !== 81) return null;
  const masks = [];
  for (const cell of cells) {
    const mask = Number(cell?.candidateMask || 0) & 0x3fe;
    if (Number(cell?.value || 0) !== 0 || cell?.role !== "candidate" || mask === 0) {
      return null;
    }
    masks.push(mask);
  }
  return masks;
}

function ocrCorrectionSukakuString(masks) {
  if (!Array.isArray(masks) || masks.length !== 81) return "";
  let output = "";
  for (const rawMask of masks) {
    const mask = Number(rawMask || 0) & 0x3fe;
    for (let digit = 1; digit <= 9; digit += 1) {
      output += (mask & (1 << digit)) !== 0 ? String(digit) : "0";
    }
  }
  return output;
}

function ocrCorrectionLibraryString(cells = ocrCorrectionState?.cells) {
  if (!Array.isArray(cells) || cells.length !== 81) return "";

  let boardText = "";
  let boardPart = "";
  for (const cell of cells) {
    const value = Number(cell?.value || 0);
    const digit = value >= 1 && value <= 9 ? String(value) : ".";
    boardText += digit;
    if (digit === ".") {
      boardPart += ".";
    } else if (cell?.role === "solved") {
      boardPart += `+${digit}`;
    } else {
      boardPart += digit;
    }
  }

  const eliminations = [];
  for (let index = 0; index < 81; index += 1) {
    if (boardText[index] !== ".") continue;
    const candidateMask = Number(cells[index]?.candidateMask || 0) & 0x3fe;
    // A zero mask in OCR correction means “no candidate information was
    // entered for this ordinary empty cell”, not “delete every candidate”.
    // Leave it untouched so the engine generates the legal candidates.
    if (candidateMask === 0) continue;
    const legalMask = legalCandidateMaskForBoard(boardText, index);
    const removedMask = legalMask & ~candidateMask;
    const row = Math.floor(index / 9) + 1;
    const col = (index % 9) + 1;
    for (let digit = 1; digit <= 9; digit += 1) {
      if ((removedMask & (1 << digit)) !== 0) {
        eliminations.push(`${digit}${row}${col}`);
      }
    }
  }
  return `:0000:x:${boardPart}:${eliminations.join(" ")}::`;
}

function ocrCorrectionCounts() {
  let clue = 0;
  let solved = 0;
  let candidate = 0;
  for (const cell of ocrCorrectionState?.cells || []) {
    if (cell.value && cell.role === "given") clue += 1;
    else if (cell.value && cell.role === "solved") solved += 1;
    else if (cell.candidateMask) candidate += 1;
  }
  return { clue, solved, candidate };
}

function ocrCorrectionPushHistory() {
  if (!ocrCorrectionState) return;
  const snapshot = ocrCorrectionCloneCells(ocrCorrectionState.cells);
  ocrCorrectionHistory = ocrCorrectionHistory.slice(0, ocrCorrectionHistoryIndex + 1);
  ocrCorrectionHistory.push(snapshot);
  if (ocrCorrectionHistory.length > 100) ocrCorrectionHistory.shift();
  ocrCorrectionHistoryIndex = ocrCorrectionHistory.length - 1;
}

function ocrCorrectionRestoreHistory(index) {
  if (!ocrCorrectionState || index < 0 || index >= ocrCorrectionHistory.length) return;
  ocrCorrectionHistoryIndex = index;
  ocrCorrectionState.cells = ocrCorrectionCloneCells(ocrCorrectionHistory[index]);
  renderOcrCorrection();
}

function ocrCorrectionCellLabel(cell, index) {
  const row = Math.floor(index / 9) + 1;
  const col = index % 9 + 1;
  if (cell.value) {
    const role = ocrCorrectionText(cell.role === "given" ? "given" : "solved");
    return `r${row}c${col}: ${cell.value}, ${role}`;
  }
  const candidates = [];
  for (let digit = 1; digit <= 9; digit += 1) {
    if (cell.candidateMask & (1 << digit)) candidates.push(digit);
  }
  return `r${row}c${col}: ${candidates.length ? candidates.join(",") : ocrCorrectionText("empty")}`;
}

function ensureOcrCorrectionUi() {
  if (ocrCorrectionRoot?.isConnected) return ocrCorrectionRoot;
  const root = document.createElement("section");
  root.id = "ocrCorrectionRoot";
  root.className = "ocr-correction-root";
  root.hidden = true;
  root.innerHTML = `
    <style>
      body.ocr-correction-mode { overflow: hidden !important; }
      .ocr-correction-root[hidden] { display: none !important; }
      .ocr-correction-root { position: fixed; inset: 0; z-index: 2147483000; display: grid; grid-template-rows: auto minmax(0,1fr); background: #eef3f9; color: #172234; font-family: system-ui,-apple-system,"Segoe UI",sans-serif; }
      .ocr-correction-root, .ocr-correction-root * { box-sizing: border-box; }
      .ocr-correction-header { display:flex; align-items:center; gap:10px; min-height:52px; padding:8px 12px; border-bottom:1px solid #c9d4e2; background:#fff; box-shadow:0 2px 10px rgba(29,48,75,.08); }
      .ocr-correction-title-wrap { min-width:0; flex:1; }
      .ocr-correction-title { font-size:17px; font-weight:750; }
      .ocr-correction-subtitle { margin-top:2px; color:#62718a; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .ocr-correction-header-actions { display:flex; gap:6px; }
      .ocr-correction-root button { min-height:36px; margin:0 !important; border:1px solid #aebbd0; border-radius:9px; padding:6px 10px; background:#fff; color:#172234; font:inherit; cursor:pointer; touch-action:manipulation; box-sizing:border-box; }
      .ocr-correction-root button:active { transform:translateY(1px); }
      .ocr-correction-root button.primary { border-color:#245dc1; background:#2868d5; color:#fff; font-weight:700; }
      .ocr-correction-root button.danger-lite { color:#8b2635; }
      .ocr-correction-workspace { min-height:0; display:grid; grid-template-columns:minmax(260px,1fr) minmax(300px,1fr) minmax(210px,.7fr); gap:10px; padding:10px; overflow:hidden; }
      .ocr-correction-card { min-width:0; min-height:0; display:flex; flex-direction:column; border:1px solid #c9d4e2; border-radius:13px; background:#fff; box-shadow:0 5px 18px rgba(29,48,75,.08); overflow:hidden; }
      .ocr-correction-card-title { flex:0 0 auto; padding:8px 10px; border-bottom:1px solid #dde4ee; font-size:13px; font-weight:700; }
      .ocr-correction-image-body, .ocr-correction-board-body { min-height:0; flex:1; display:grid; place-items:center; padding:8px; overflow:auto; }
      .ocr-correction-image-stage { position:relative; width:min(100%, calc(100dvh - 154px)); aspect-ratio:1; background:#f4f6f9; border:2px solid #263c5e; }
      .ocr-correction-image-stage img { display:block; width:100%; height:100%; object-fit:contain; }
      .ocr-correction-image-grid { position:absolute; inset:0; display:grid; grid-template-columns:repeat(9,minmax(0,1fr)); grid-template-rows:repeat(9,minmax(0,1fr)); overflow:hidden; }
      .ocr-correction-image-cell { width:100% !important; height:100% !important; min-width:0 !important; min-height:0 !important; max-width:none !important; max-height:none !important; margin:0 !important; padding:0 !important; border:0 !important; border-right:1px solid rgba(31,53,84,.25) !important; border-bottom:1px solid rgba(31,53,84,.25) !important; border-radius:0 !important; background:transparent !important; align-self:stretch !important; justify-self:stretch !important; appearance:none; -webkit-appearance:none; transform:none !important; }
      .ocr-correction-image-cell:nth-child(9n+3), .ocr-correction-image-cell:nth-child(9n+6) { border-right-width:2px !important; border-right-color:rgba(12,31,59,.65) !important; }
      .ocr-correction-image-cell:nth-child(n+19):nth-child(-n+27), .ocr-correction-image-cell:nth-child(n+46):nth-child(-n+54) { border-bottom-width:2px !important; border-bottom-color:rgba(12,31,59,.65) !important; }
      .ocr-correction-image-cell.selected { outline:3px solid #ff9d00; outline-offset:-3px; background:rgba(255,190,43,.18) !important; }
      .ocr-correction-board { width:min(100%, calc(100dvh - 154px)); aspect-ratio:1; display:grid; grid-template-columns:repeat(9,minmax(0,1fr)); grid-template-rows:repeat(9,minmax(0,1fr)); grid-auto-flow:row; border:3px solid #1c2c45; background:#fff; overflow:hidden; contain:layout paint; }
      .ocr-correction-cell { position:relative; width:100% !important; height:100% !important; min-width:0 !important; min-height:0 !important; max-width:none !important; max-height:none !important; margin:0 !important; padding:0 !important; border:0 !important; border-right:1px solid #8b99ac !important; border-bottom:1px solid #8b99ac !important; border-radius:0 !important; display:grid; place-items:center; align-self:stretch !important; justify-self:stretch !important; background:#fff !important; overflow:hidden; appearance:none; -webkit-appearance:none; transform:none !important; }
      .ocr-correction-cell:nth-child(9n+3), .ocr-correction-cell:nth-child(9n+6) { border-right:3px solid #1c2c45 !important; }
      .ocr-correction-cell:nth-child(n+19):nth-child(-n+27), .ocr-correction-cell:nth-child(n+46):nth-child(-n+54) { border-bottom:3px solid #1c2c45 !important; }
      .ocr-correction-cell.selected { outline:3px solid #ff9d00; outline-offset:-3px; z-index:2; }
      .ocr-correction-cell .ocr-value { font-size:clamp(16px,4.2vmin,34px); line-height:1; font-weight:700; }
      .ocr-correction-cell.ocr-role-given .ocr-value { color:#111; }
      .ocr-correction-cell.ocr-role-solved .ocr-value { color:#1f67c9; }
      .ocr-correction-candidates { position:absolute; inset:2px; display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr); font-size:clamp(6px,1.35vmin,11px); color:#40516b; line-height:1; }
      .ocr-correction-candidates span { display:grid; place-items:center; }
      .ocr-correction-controls { min-height:0; overflow:auto; padding:10px; gap:9px; }
      .ocr-correction-selected { padding:8px 9px; border-radius:9px; background:#eef4ff; color:#244979; font-weight:700; }
      .ocr-correction-zoom { width:100%; aspect-ratio:2.5/1; min-height:76px; border:1px solid #b8c5d6; border-radius:9px; background-color:#f4f6f9; background-repeat:no-repeat; image-rendering:auto; }
      .ocr-correction-mode-row { display:grid; grid-template-columns:repeat(3,1fr); gap:5px; }
      .ocr-correction-mode-row button.active { border-color:#245dc1; background:#dce9ff; color:#174b9e; font-weight:700; }
      .ocr-correction-keypad { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
      .ocr-correction-keypad button { min-height:46px; font-size:20px; font-weight:700; }
      .ocr-correction-nav, .ocr-correction-edit-actions { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
      .ocr-correction-summary { display:flex; flex-wrap:wrap; gap:5px; color:#5b6a80; font-size:12px; }
      .ocr-correction-summary span { padding:4px 7px; border-radius:99px; background:#eef2f7; }
      .ocr-correction-hint { color:#65758c; font-size:12px; line-height:1.4; }
      @media (orientation: landscape) and (max-height: 800px) {
        .ocr-correction-header { min-height:44px; padding:5px 8px; }
        .ocr-correction-subtitle { display:none; }
        .ocr-correction-workspace { grid-template-columns:minmax(230px,34vw) minmax(250px,38vw) minmax(180px,1fr); gap:6px; padding:6px; }
        .ocr-correction-card-title { padding:5px 8px; }
        .ocr-correction-image-body, .ocr-correction-board-body { padding:4px; }
        .ocr-correction-image-stage, .ocr-correction-board { width:min(100%, calc(100dvh - 98px)); }
        .ocr-correction-controls { padding:6px; gap:5px; }
        .ocr-correction-zoom { min-height:54px; }
        .ocr-correction-keypad { grid-template-columns:repeat(5,1fr); gap:4px; }
        .ocr-correction-keypad button { min-height:34px; padding:3px; font-size:16px; }
        .ocr-correction-root button { min-height:32px; padding:4px 7px; font-size:12px; }
      }
      @media (orientation: portrait), (max-width: 700px) {
        .ocr-correction-header { padding:6px; }
        .ocr-correction-subtitle { display:none; }
        .ocr-correction-header-actions .ocr-correction-fullscreen { display:none; }
        .ocr-correction-workspace { display:block; overflow:auto; padding:6px; }
        .ocr-correction-card { min-height:auto; margin-bottom:8px; }
        .ocr-correction-image-body, .ocr-correction-board-body { flex:none; overflow:visible; height:min(94vw,430px); min-height:min(94vw,430px); }
        .ocr-correction-image-stage, .ocr-correction-board { width:min(94vw,430px); }
        .ocr-correction-controls { overflow:visible; }
        .ocr-correction-zoom { max-height:130px; }
        .ocr-correction-keypad { grid-template-columns:repeat(5,1fr); }
        .ocr-correction-keypad button { min-height:42px; }
      }
    </style>
    <header class="ocr-correction-header">
      <div class="ocr-correction-title-wrap">
        <div class="ocr-correction-title"></div>
        <div class="ocr-correction-subtitle"></div>
      </div>
      <div class="ocr-correction-header-actions">
        <button type="button" class="ocr-correction-fullscreen"></button>
        <button type="button" class="ocr-correction-cancel danger-lite"></button>
        <button type="button" class="ocr-correction-confirm primary"></button>
      </div>
    </header>
    <div class="ocr-correction-workspace">
      <section class="ocr-correction-card ocr-correction-image-card">
        <div class="ocr-correction-card-title ocr-correction-source-title"></div>
        <div class="ocr-correction-image-body">
          <div class="ocr-correction-image-stage">
            <img class="ocr-correction-source-image" alt="OCR recognized Sudoku" />
            <div class="ocr-correction-image-grid"></div>
          </div>
        </div>
      </section>
      <section class="ocr-correction-card ocr-correction-board-card">
        <div class="ocr-correction-card-title ocr-correction-board-title"></div>
        <div class="ocr-correction-board-body"><div class="ocr-correction-board"></div></div>
      </section>
      <aside class="ocr-correction-card ocr-correction-controls">
        <div class="ocr-correction-selected"></div>
        <div class="ocr-correction-zoom"></div>
        <div class="ocr-correction-summary"></div>
        <div class="ocr-correction-mode-row">
          <button type="button" data-mode="given"></button>
          <button type="button" data-mode="solved"></button>
          <button type="button" data-mode="candidate"></button>
        </div>
        <div class="ocr-correction-hint"></div>
        <div class="ocr-correction-keypad"></div>
        <div class="ocr-correction-nav">
          <button type="button" class="ocr-correction-previous"></button>
          <button type="button" class="ocr-correction-next"></button>
        </div>
        <div class="ocr-correction-edit-actions">
          <button type="button" class="ocr-correction-clear"></button>
          <button type="button" class="ocr-correction-reset"></button>
          <button type="button" class="ocr-correction-undo"></button>
          <button type="button" class="ocr-correction-redo"></button>
        </div>
      </aside>
    </div>`;
  root.dataset.version = OCR_CORRECTION_UI_VERSION;
  document.body.appendChild(root);
  ocrCorrectionRoot = root;

  const imageGrid = root.querySelector(".ocr-correction-image-grid");
  const boardGrid = root.querySelector(".ocr-correction-board");
  for (let index = 0; index < 81; index += 1) {
    const imageCell = document.createElement("button");
    imageCell.type = "button";
    imageCell.className = "ocr-correction-image-cell";
    imageCell.dataset.index = String(index);
    imageGrid.appendChild(imageCell);

    const boardCell = document.createElement("button");
    boardCell.type = "button";
    boardCell.className = "ocr-correction-cell";
    boardCell.dataset.index = String(index);
    boardGrid.appendChild(boardCell);
  }

  const keypad = root.querySelector(".ocr-correction-keypad");
  for (let digit = 1; digit <= 9; digit += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.digit = String(digit);
    button.textContent = String(digit);
    keypad.appendChild(button);
  }

  root.addEventListener("click", async (event) => {
    const target = event.target instanceof Element ? event.target.closest("button") : null;
    if (!target) return;
    if (target.matches(".ocr-correction-image-cell,.ocr-correction-cell")) {
      selectOcrCorrectionCell(Number(target.dataset.index || 0));
      return;
    }
    if (target.dataset.mode) {
      ocrCorrectionMode = target.dataset.mode;
      renderOcrCorrection();
      return;
    }
    if (target.dataset.digit) {
      editOcrCorrectionCell(Number(target.dataset.digit));
      return;
    }
    if (target.matches(".ocr-correction-clear")) { clearOcrCorrectionCell(); return; }
    if (target.matches(".ocr-correction-previous")) { selectOcrCorrectionCell(ocrCorrectionSelectedIndex - 1); return; }
    if (target.matches(".ocr-correction-next")) { selectOcrCorrectionCell(ocrCorrectionSelectedIndex + 1); return; }
    if (target.matches(".ocr-correction-undo")) { ocrCorrectionRestoreHistory(ocrCorrectionHistoryIndex - 1); return; }
    if (target.matches(".ocr-correction-redo")) { ocrCorrectionRestoreHistory(ocrCorrectionHistoryIndex + 1); return; }
    if (target.matches(".ocr-correction-reset")) {
      ocrCorrectionState.cells = ocrCorrectionCloneCells(ocrCorrectionState.originalCells);
      ocrCorrectionPushHistory();
      renderOcrCorrection();
      return;
    }
    if (target.matches(".ocr-correction-fullscreen")) { await toggleFullscreen(); return; }
    if (target.matches(".ocr-correction-cancel")) { closeOcrCorrection(true); return; }
    if (target.matches(".ocr-correction-confirm")) { await confirmOcrCorrection(); }
  });

  root.addEventListener("keydown", (event) => {
    if (!ocrCorrectionIsActive()) return;
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      editOcrCorrectionCell(Number(event.key));
    } else if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
      event.preventDefault();
      clearOcrCorrectionCell();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectOcrCorrectionCell(ocrCorrectionSelectedIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      selectOcrCorrectionCell(ocrCorrectionSelectedIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectOcrCorrectionCell(ocrCorrectionSelectedIndex - 9);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      selectOcrCorrectionCell(ocrCorrectionSelectedIndex + 9);
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      ocrCorrectionRestoreHistory(ocrCorrectionHistoryIndex + (event.shiftKey ? 1 : -1));
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeOcrCorrection(true);
    }
  });
  return root;
}

function selectOcrCorrectionCell(index) {
  ocrCorrectionSelectedIndex = Math.max(0, Math.min(80, Number(index) || 0));
  renderOcrCorrection();
  const button = ocrCorrectionRoot?.querySelector(`.ocr-correction-cell[data-index="${ocrCorrectionSelectedIndex}"]`);
  button?.focus?.({ preventScroll: true });
}

function editOcrCorrectionCell(digit) {
  const cell = ocrCorrectionState?.cells?.[ocrCorrectionSelectedIndex];
  if (!cell || digit < 1 || digit > 9) return;
  if (ocrCorrectionMode === "candidate") {
    cell.value = 0;
    cell.role = "candidate";
    cell.candidateMask ^= (1 << digit);
  } else {
    const same = cell.value === digit && cell.role === ocrCorrectionMode;
    cell.value = same ? 0 : digit;
    cell.role = same ? "candidate" : ocrCorrectionMode;
    cell.candidateMask = 0;
  }
  ocrCorrectionPushHistory();
  renderOcrCorrection();
}

function clearOcrCorrectionCell() {
  const cell = ocrCorrectionState?.cells?.[ocrCorrectionSelectedIndex];
  if (!cell) return;
  cell.value = 0;
  cell.role = "candidate";
  cell.candidateMask = 0;
  ocrCorrectionPushHistory();
  renderOcrCorrection();
}

function renderOcrCorrection() {
  const root = ensureOcrCorrectionUi();
  if (!ocrCorrectionState || root.hidden) return;
  root.querySelector(".ocr-correction-title").textContent = ocrCorrectionText("title");
  root.querySelector(".ocr-correction-subtitle").textContent = ocrCorrectionText("subtitle");
  root.querySelector(".ocr-correction-source-title").textContent = ocrCorrectionText("source");
  root.querySelector(".ocr-correction-board-title").textContent = ocrCorrectionText("board");
  root.querySelector(".ocr-correction-cancel").textContent = ocrCorrectionText("cancel");
  root.querySelector(".ocr-correction-confirm").textContent = ocrCorrectionText("confirm");
  root.querySelector(".ocr-correction-fullscreen").textContent = ocrCorrectionText(isFullscreen() ? "exitFullscreen" : "fullscreen");
  root.querySelector(".ocr-correction-previous").textContent = ocrCorrectionText("previous");
  root.querySelector(".ocr-correction-next").textContent = ocrCorrectionText("next");
  root.querySelector(".ocr-correction-clear").textContent = ocrCorrectionText("clear");
  root.querySelector(".ocr-correction-reset").textContent = ocrCorrectionText("reset");
  root.querySelector(".ocr-correction-undo").textContent = ocrCorrectionText("undo");
  root.querySelector(".ocr-correction-redo").textContent = ocrCorrectionText("redo");
  root.querySelector(".ocr-correction-undo").disabled = ocrCorrectionHistoryIndex <= 0;
  root.querySelector(".ocr-correction-redo").disabled = ocrCorrectionHistoryIndex >= ocrCorrectionHistory.length - 1;

  for (const button of root.querySelectorAll(".ocr-correction-mode-row button")) {
    const mode = button.dataset.mode;
    button.textContent = ocrCorrectionText(mode);
    button.classList.toggle("active", mode === ocrCorrectionMode);
    button.setAttribute("aria-pressed", mode === ocrCorrectionMode ? "true" : "false");
  }
  root.querySelector(".ocr-correction-hint").textContent = ocrCorrectionText(ocrCorrectionMode === "candidate" ? "candidateHint" : "valueHint");

  const source = root.querySelector(".ocr-correction-source-image");
  if (ocrCorrectionState.previewUrl) {
    source.src = ocrCorrectionState.previewUrl;
    source.hidden = false;
  } else {
    source.removeAttribute("src");
    source.hidden = true;
  }

  const selected = ocrCorrectionState.cells[ocrCorrectionSelectedIndex];
  const row = Math.floor(ocrCorrectionSelectedIndex / 9);
  const col = ocrCorrectionSelectedIndex % 9;
  const selectedDescription = ocrCorrectionCellLabel(selected, ocrCorrectionSelectedIndex).replace(/^r\d+c\d+:\s*/, "");
  root.querySelector(".ocr-correction-selected").textContent = `${ocrCorrectionText("selected")}: r${row + 1}c${col + 1} · ${selectedDescription}`;
  const zoom = root.querySelector(".ocr-correction-zoom");
  if (ocrCorrectionState.previewUrl) {
    zoom.style.backgroundImage = `url("${ocrCorrectionState.previewUrl}")`;
    zoom.style.backgroundSize = "900% 900%";
    zoom.style.backgroundPosition = `${col * 12.5}% ${row * 12.5}%`;
  } else {
    zoom.style.backgroundImage = "none";
  }

  const counts = ocrCorrectionCounts();
  const summary = root.querySelector(".ocr-correction-summary");
  summary.innerHTML = "";
  for (const [key, value] of [["clueCount", counts.clue], ["solvedCount", counts.solved], ["candidateCount", counts.candidate]]) {
    const chip = document.createElement("span");
    chip.textContent = ocrCorrectionText(key).replace(`{${key === "clueCount" ? "clue" : key === "solvedCount" ? "solved" : "candidate"}}`, String(value));
    summary.appendChild(chip);
  }

  const boardButtons = root.querySelectorAll(".ocr-correction-cell");
  const imageButtons = root.querySelectorAll(".ocr-correction-image-cell");
  ocrCorrectionState.cells.forEach((cell, index) => {
    const button = boardButtons[index];
    const roleClass = cell.value ? `ocr-role-${cell.role}` : "ocr-role-candidate";
    button.className = `ocr-correction-cell ${roleClass}${index === ocrCorrectionSelectedIndex ? " selected" : ""}`;
    button.setAttribute("aria-label", ocrCorrectionCellLabel(cell, index));
    button.innerHTML = "";
    if (cell.value) {
      const value = document.createElement("span");
      value.className = "ocr-value";
      value.textContent = String(cell.value);
      button.appendChild(value);
    } else if (cell.candidateMask) {
      const grid = document.createElement("span");
      grid.className = "ocr-correction-candidates";
      for (let digit = 1; digit <= 9; digit += 1) {
        const slot = document.createElement("span");
        slot.textContent = cell.candidateMask & (1 << digit) ? String(digit) : "";
        grid.appendChild(slot);
      }
      button.appendChild(grid);
    }
    imageButtons[index].classList.toggle("selected", index === ocrCorrectionSelectedIndex);
    imageButtons[index].setAttribute("aria-label", ocrCorrectionCellLabel(cell, index));
  });
}

async function openOcrCorrection(ocr) {
  if (!ocr?.coachJson) throw new Error(ui("ocrNoCoachJson"));
  if (mobileSolveActive) await exitMobileSolveMode({ exitFullscreen: false });
  const root = ensureOcrCorrectionUi();
  const preview = ocr.preview || {};
  const cells = ocrCorrectionCellsFromResult(ocr);
  ocrCorrectionState = {
    ocr,
    cells,
    originalCells: ocrCorrectionCloneCells(cells),
    previewUrl: preview.warpedDataUrl || preview.warped || "",
  };
  ocrCorrectionSelectedIndex = 0;
  ocrCorrectionMode = "given";
  ocrCorrectionHistory = [];
  ocrCorrectionHistoryIndex = -1;
  ocrCorrectionPushHistory();
  root.hidden = false;
  document.body.classList.add("ocr-correction-mode");
  renderOcrCorrection();
  root.querySelector(".ocr-correction-cell")?.focus?.({ preventScroll: true });
  return { ok: true, correction: true };
}

function closeOcrCorrection(confirmDiscard = false) {
  if (!ocrCorrectionIsActive()) return true;
  if (confirmDiscard && ocrCorrectionHistoryIndex > 0 && !window.confirm(ocrCorrectionText("closeConfirm"))) return false;
  ocrCorrectionRoot.hidden = true;
  document.body.classList.remove("ocr-correction-mode");
  ocrCorrectionState = null;
  ocrCorrectionHistory = [];
  ocrCorrectionHistoryIndex = -1;
  return true;
}

async function confirmOcrCorrection() {
  if (!ocrCorrectionState) return;
  const cells = ocrCorrectionCloneCells(ocrCorrectionState.cells);
  const allCandidateMasks = ocrCorrectionAllCandidateMasks(cells);
  const importFormat = allCandidateMasks ? "sukaku" : "library";
  const importText = allCandidateMasks
    ? ocrCorrectionSukakuString(allCandidateMasks)
    : ocrCorrectionLibraryString(cells);
  if (!importText) return { ok: false, error: ui("importUnknownFormat") };

  const previousInput = givens.value;
  givens.value = importText;
  const result = await importPuzzleFromCurrentInput({
    clipboardFallback: false,
    preferClipboardFirst: false,
    clipboardAlreadyTried: true,
  });
  if (result?.ok) {
    closeOcrCorrection(false);
    // Keep the exact OCR import record visible.  Pure-given Library records are
    // otherwise normalized by the generic loader to a plain 81-char puzzle,
    // hiding which import path was used.
    givens.value = importText;
    result.source = "local-image-ocr";
    result.ocrImportFormat = importFormat;
    const attribution = await localSudokuOcrAttributionSafe();
    if (attribution) debugLog(uif("ocrDoneLog", { attribution }));
    else debugLog(ui("ocrDoneLogNoAttribution"));
  } else {
    // Keep the correction session alive after an invalid/non-unique import so
    // the user can repair the OCR result instead of losing all edits.
    givens.value = previousInput;
  }
  return result;
}

async function recognizeAndImportImageFile(file) {
  if (!file) return { ok: false, error: ui("ocrNoImageSelected") };
  if (!file.type?.startsWith?.("image/")) {
    const error = ui("ocrInvalidImageFile");
    setStatus(error);
    return { ok: false, error };
  }
  try {
    ocrResourceProgressActive = true;
    setStatus(ui("ocrRecognizingLocal"));
    const { recognizeSudokuImageToCoachJson } = await loadLocalSudokuOcrModule();
    const ocr = await recognizeSudokuImageToCoachJson(file);
    if (!ocr?.coachJson) throw new Error(ui("ocrNoCoachJson"));
    return await openOcrCorrection(ocr);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isLocalSudokuOcrRuntimeLoadError(error)) {
      await resetLocalSudokuOcrLoaderAfterFailure();
    }
    setStatus(uif("ocrFailed", { message }));
    debugLog(uif("ocrFailed", { message }));
    return { ok: false, error: message };
  } finally {
    ocrResourceProgressActive = false;
    if (imageOcrInput) imageOcrInput.value = "";
    if (imageOcrCameraInput) imageOcrCameraInput.value = "";
  }
}


btnLoad.addEventListener("click", async () => {
  await importPuzzleFromCurrentInput({
    clipboardFallback: true,
    preferClipboardFirst: loadPuzzleFromClipboardFirstEnabled(),
  });
});


async function recognizeFirstClipboardImage() {
  if (!navigator.clipboard?.read) {
    const message = ui("ocrClipboardUnsupported");
    setStatus(message);
    debugLog(message);
    return { ok: false, error: message };
  }
  try {
    setStatus(ui("ocrReadingClipboard"));
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types?.find((t) => t.startsWith("image/"));
      if (!type) continue;
      const blob = await item.getType(type);
      const ext = type.includes("png") ? "png" : type.includes("jpeg") ? "jpg" : "webp";
      const file = new File([blob], `clipboard-sudoku.${ext}`, { type });
      return await recognizeAndImportImageFile(file);
    }
    const message = ui("ocrClipboardNoImage");
    setStatus(message);
    return { ok: false, error: message };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(uif("ocrClipboardReadFailed", { message }));
    debugLog(uif("ocrClipboardReadFailed", { message }));
    return { ok: false, error: message };
  }
}


btnImageOcrClipboard?.addEventListener("click", async () => {
  await recognizeFirstClipboardImage();
});

imageOcrInput?.addEventListener("change", async () => {
  const file = imageOcrInput.files?.[0];
  await recognizeAndImportImageFile(file);
});

imageOcrCameraInput?.addEventListener("change", async () => {
  const file = imageOcrCameraInput.files?.[0];
  await recognizeAndImportImageFile(file);
});

window.addEventListener("paste", async (event) => {
  if (isEditablePasteTarget(event.target)) return;
  const items = Array.from(event.clipboardData?.items || []);
  const imageItem = items.find((item) => item.type?.startsWith?.("image/"));
  if (!imageItem) return;
  const file = imageItem.getAsFile();
  if (!file) return;
  event.preventDefault();
  await recognizeAndImportImageFile(file);
});

function generatePuzzleAtDifficulty(difficulty) {
  if (!engine) return null;
  const normalizedDifficulty = Number.isInteger(Number(difficulty)) && Number(difficulty) >= 0 && Number(difficulty) <= 6
    ? Number(difficulty)
    : 0;
  if (difficultySelect) difficultySelect.value = String(normalizedDifficulty);
  updateDifficultySelectCompactWidth();
  setStatus(uif("generatingPuzzle", { difficulty: selectedDifficultyLabel() }));
  const result = parseJson(engine.generate_puzzle_difficulty_json(normalizedDifficulty, 0));
  if (!result?.ok) {
    const last = result?.lastRating ? uif("lastRating", { rating: formatRating(result.lastRating) }) : "";
    setStatus(uif("generateFailed", { difficulty: difficultyLabel(result?.difficultyName ?? normalizedDifficulty), last }));
    return result || { ok: false };
  }

  originalBoard = result.state?.givens || result.puzzle;
  givens.value = result.puzzle;
  resetBoardContextForSnapshot(result.state, { resetSelectedIndex: true });
    setStatus(uif("generatedPuzzle", { difficulty: difficultyLabel(result.difficultyName ?? normalizedDifficulty), clues: result.clues, rating: formatRating(result.rating) }));
  updateInputControls();
  return result;
}

btnGenerate.addEventListener("click", () => {
  generatePuzzleAtDifficulty(Number(difficultySelect.value || 0));
});

btnBatchStop?.addEventListener("click", () => {
  batchAbortRequested = true;
  updateBatchStatus(ui("stoppingBatch"));
  batchWorker?.postMessage({ type: "cancel" });
});

btnBatchGenerate?.addEventListener("click", async () => {
  if (!engine) return;
  const mode = batchMode?.value === "solve" ? "solve" : "generate";
  const filename = sanitizeFilename(batchFilename?.value || defaultBatchFilename());
  const difficulty = Number(difficultySelect.value || 0);
  const trainingKind = mode === "generate" ? (trainingTechniqueSelect?.value || "") : "";
  const otp = mode === "generate" && trainingOtpEnabled();
  if (otp && trainingKind && !isOtpEligibleTechnique(trainingKind)) {
    updateBatchStatus(ui("trainingOtpUnsupported"));
    return;
  }
  const selectedTrainingLabel = selectedTrainingTechniqueName() || trainingKind;
  const trainingLabel = otp
    ? (selectedTrainingLabel ? `${selectedTrainingLabel} OTP` : ui("trainingOtpAll"))
    : selectedTrainingLabel;
  const trainingMode = Boolean(trainingKind || otp);
  const puzzles = mode === "solve" ? await collectBatchSolveInputLinesFromFile() : [];
  if (mode === "solve" && !puzzles.length) {
    updateBatchStatus(ui("batchSolveNoInput"));
    return;
  }

  let writer = null;
  let generated = 0;
  let attempts = 0;
  let failed = 0;
  let lastPuzzleAttempts = "";
  const startTime = Date.now();
  let timer = null;

  batchAbortRequested = false;
  setBatchRunning(true);

  try {
    writer = await openBatchWriter(filename);
    // Output is one result per line. No header row, so generated/solved files can be chained directly.
    updateBatchStatus(mode === "solve"
      ? uif("batchSolveStart", { target: puzzles.length })
      : (trainingMode
        ? uif("batchTrainingStart", { technique: trainingLabel, difficulty: selectedDifficultyLabel() })
        : uif("batchStart", { difficulty: selectedDifficultyLabel() })));

    const batchProgressStatus = () => {
      const prefix = batchAbortRequested ? ui("batchStoppingPrefix") : "";
      const lastText = lastPuzzleAttempts ? uif("batchLastPuzzle", { attempts: lastPuzzleAttempts }) : "";
      const values = { prefix, generated, target: puzzles.length, attempts, failed, last: lastText, elapsed: formatElapsedSeconds(startTime) };
      if (mode === "solve") return uif("batchSolveProgress", values);
      return trainingMode ? uif("batchTrainingProgress", values) : uif("batchProgress", values);
    };
    timer = window.setInterval(() => {
      updateBatchStatus(batchProgressStatus());
    }, 1000);

    const config = {
      mode,
      target: mode === "solve" ? puzzles.length : 0,
      difficulty,
      trainingKind,
      otp,
      trainingTextFilter: currentTrainingTextFilterPayload(),
      maxAttempts: 0,
      maxSteps: 500,
      puzzles,
      techniqueConfig: getTechniqueConfigPayload(techniqueState.length ? techniqueState : loadTechniqueState()),
    };

    const final = await runBatchTaskInWorker(config, {
      onItem: async (result) => {
        if (batchAbortRequested) return;
        if (mode === "solve") {
          generated += 1;
          if (!result?.ok) failed += 1;
          await writer.write(batchSolveLine(result, generated));
          lastPuzzleAttempts = result?.status || "";
        } else {
          generated += 1;
          await writer.write(batchLine(result, generated));
          lastPuzzleAttempts = trainingMode
            ? uif("batchSearchAttempts", { attempts: result.attempts ?? "?" })
            : uif("batchGenerateAttempts", { attempts: result.attempts ?? "?" });
        }
        updateBatchStatus(mode === "generate"
          ? uif("batchLatest", { status: batchProgressStatus(), rating: formatRating(result?.rating) })
          : batchProgressStatus());
      },
      onProgress: (progress) => {
        attempts = Number(progress.attempts ?? attempts);
        failed = Number(progress.failed ?? failed);
        updateBatchStatus(batchProgressStatus());
      },
      onInvalidStep: async (result) => {
        await stopBatchOnInvalidStep(writer, result, trainingKind);
      },
    });

    await writer.close();
    const outMode = writer.direct ? ui("batchWrittenDirect") : ui("batchDownloadReady");
    if (final?.status === "cancelled" || batchAbortRequested) {
      updateBatchStatus(ui("batchCancelled"));
    } else if (mode === "solve") {
      updateBatchStatus(uif("batchSolveDone", { mode: outMode, filename, generated, target: puzzles.length, failed, elapsed: formatElapsedSeconds(startTime) }));
    } else {
      updateBatchStatus(trainingMode
        ? uif("batchTrainingDone", { mode: outMode, filename, technique: trainingLabel, generated, attempts, elapsed: formatElapsedSeconds(startTime) })
        : uif("batchDone", { mode: outMode, filename, generated, attempts, elapsed: formatElapsedSeconds(startTime) }));
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      updateBatchStatus(ui("batchCancelled"));
    } else {
      try {
        await writer?.abort?.();
      } catch {
        // ignore abort cleanup errors
      }
      updateBatchStatus(uif("batchFailed", { error: error instanceof Error ? error.message : String(error) }));
    }
  } finally {
    if (timer != null) {
      window.clearInterval(timer);
    }
    batchAbortRequested = false;
    setBatchRunning(false);
  }
});

btnGenerateTraining?.addEventListener("click", async () => {
  if (!engine) return;
  const difficulty = Number(difficultySelect.value || 0);
  const kind = trainingTechniqueSelect?.value || "";
  const otp = trainingOtpEnabled();
  if (!kind && !otp) {
    setStatus(ui("trainingNeedTechnique"));
    return;
  }
  if (otp && kind && !isOtpEligibleTechnique(kind)) {
    setStatus(ui("trainingOtpUnsupported"));
    return;
  }
  const selectedLabel = selectedTrainingTechniqueName() || kind;
  const label = otp
    ? (selectedLabel ? `${selectedLabel} OTP` : ui("trainingOtpAll"))
    : selectedLabel;
  const timer = startTrainingTimer(label, { otp });
  btnGenerateTraining.disabled = true;
  await paintBeforeLongTask();

  try {
    const result = parseJson(await generateTrainingPuzzleInWorker(kind, difficulty, 0));
    if (!result?.ok) {
      if (result?.status === "invalid_step") {
        window.__lastTrainingResult = result;
        console.log("[training invalid_step result]", result);

        const puzzle = result.puzzle || result.failedPuzzle || "";

        if (puzzle) {
          if (!engine.load(puzzle)) {
            setStatus(ui("trainingInvalidSyncFailed"));
            debugLog(JSON.stringify(result, null, 2));
            return;
          }
        }

        currentSnapshot = result.state || getCurrentSnapshot();
        originalBoard = puzzle || originalBoard;
        givens.value = puzzle || givens.value;

        currentHint = null;
        selectedIndex = -1;
        previewSnapshotActive = false;
        currentPreviewRecord = null;
        lastSolveData = null;
        lastAllStepsData = null;
        allStepsTree?.replaceChildren();
        clearBranchState();

                renderBoardSnapshot(currentSnapshot, null);
        updateInputControls();

        if (result.solve) {
          renderSolvePath(JSON.stringify(result.solve));
        } else {
          tree.replaceChildren();
          allStepsTree?.replaceChildren();
          lastSolveData = null;
          lastAllStepsData = null;
        }

        const invalidRecord = (result.solve?.path || []).find((record) => record.invalid);
        const stepText = invalidRecord?.step ? formatHintDesc(invalidRecord.step) : "";
        const detail = invalidRecord
          ? `: ${invalidRecord.error || ui("invalidStep")}, ${invalidRecord.action || "action"} r${(invalidRecord.index ?? 0) >= 0 ? Math.floor(invalidRecord.index / 9) + 1 : "?"}c${(invalidRecord.index ?? 0) >= 0 ? (invalidRecord.index % 9) + 1 : "?"}${invalidRecord.digit ? `=${invalidRecord.digit}` : ""}`
          : "";

        setStatus(uif("trainingInvalidFound", { detail, step: stepText ? uif("trainingStepTextPrefix", { step: stepText }) : "" }));
        debugLog(JSON.stringify(result, null, 2));
        return;
      }
      const last = result?.lastRating ? ui("lastRating").replace("{rating}", formatRating(result.lastRating)) : "";
      setStatus(uif("trainingFailed", { error: result?.error || label, last }));
      debugLog(JSON.stringify(result, null, 2));
      return;
    }

    if (result.otp) {
      const otpSnapshot = result.otpState || null;
      const otpLibrary = snapshotToLibraryString(otpSnapshot);
      const imported = otpLibrary ? parseJson(engine.import_puzzle_json(otpLibrary)) : null;
      if (!otpSnapshot || !otpLibrary || !imported?.ok) {
        setStatus(ui("trainingSyncFailed"));
        debugLog(JSON.stringify({ ...result, otpSnapshotFound: Boolean(otpSnapshot), otpLibrary, imported }, null, 2));
        return;
      }

      originalBoard = result.puzzle;
      givens.value = otpLibrary;
      resetBoardContextForSnapshot(imported.state || otpSnapshot, { resetSelectedIndex: true });
      const matchedTechnique = trainingTechniqueNameForKind(result.technique) || result.technique || "OTP";
      debugLog({ ...result, otpLibrary, otpTechnique: matchedTechnique });
      setStatus(uif("otpGenerated", {
        technique: matchedTechnique,
        basicSteps: result.otpBasicSteps ?? 0,
        attempts: result.attempts,
        rating: formatRating(result.rating),
      }));
      updateInputControls();
      return;
    }

    const matchedIndex = Math.max(0, Number(result.matchedStepIndex || 0) - 1);
    const matchedRecord = Array.isArray(result.solve?.path) ? result.solve.path[matchedIndex] : null;
    const trainingSnapshot = matchedRecord?.before || null;
    originalBoard = result.puzzle;
    const trainingLibrary = snapshotToLibraryString(trainingSnapshot);
    const imported = trainingLibrary ? parseJson(engine.import_puzzle_json(trainingLibrary)) : null;
    if (!trainingSnapshot || !trainingLibrary || !imported?.ok) {
      setStatus(ui("trainingSyncFailed"));
      debugLog(JSON.stringify({ ...result, trainingSnapshotFound: Boolean(trainingSnapshot), trainingLibrary, imported }, null, 2));
      return;
    }

    givens.value = trainingLibrary;
    resetBoardContextForSnapshot(imported.state || trainingSnapshot, { resetSelectedIndex: true });
    debugLog({ ...result, trainingLibrary, trainingStepIndex: matchedIndex + 1 });
    setStatus(uif("trainingGenerated", { technique: selectedLabel, attempts: result.attempts, rating: formatRating(result.rating) }));
    updateInputControls();
  } finally {
    window.clearInterval(timer);
    btnGenerateTraining.disabled = false;
  }
});

loadExportFormatSetting();
updateExportFormatLabels();

exportFormatSelect?.addEventListener("change", () => {
  saveExportFormatSetting();
});

btnSharePuzzle?.addEventListener("click", shareCurrentPuzzle);

btnExportPuzzle?.addEventListener("click", async () => {
  const puzzle = await selectedExportPuzzleString();
  if (!puzzle) {
    setStatus(ui("exportUnavailable"));
    debugLog(JSON.stringify({
      ok: false,
      error: "exported_puzzle_unavailable",
    }, null, 2));
    return;
  }
  givens.value = puzzle;
  const copied = await copyText(puzzle);
  const format = getExportFormat();
  debugLog(JSON.stringify({
    ok: true,
    format,
    formatLabel: selectedExportFormatLabel(),
    puzzle,
    givens: originalBoard,
    copied,
  }, null, 2));
  setStatus(copied ? ui("exportCopied") : ui("exportToInput"));
});

btnRate.addEventListener("click", async () => {
  if (ratingTask) {
    cancelRatingTask();
    return;
  }
  if (!engine) return;

  const rawInput = String(givens.value || "").trim();
  const rawLooksLikeCandidateState = rawInput.includes(":") || rawInput.includes("\t") || rawInput.includes("|") || rawInput.includes("userCellCandidates") || rawInput.length >= 729;
  const currentExported = exportedPuzzleString();
  const input = rawLooksLikeCandidateState
    ? rawInput
    : (currentExported || rawInput || snapshotBoardString(currentSnapshot));

  if (!input) {
    setStatus(ui("rateNoPuzzle"));
    return;
  }

  try {
    const message = await runRatingTask(input, normalizePuzzle(input));
    const result = parseJson(message.resultText);
    if (!result) {
      setStatus(ui("rateFailedSimple"));
      return;
    }

    const suffix = result.inputFormat
      ? uif("rateInputSuffix", { format: result.inputFormat, mode: result.usedCandidateState ? ui("rateUseCandidateState") : ui("rateUsePuzzle") })
      : "";
    setStatus(`${formatRating(result)}${suffix}`);
    debugLog(JSON.stringify({ ...result, backgroundElapsedMs: message.elapsedMs }, null, 2));
  } catch (error) {
    if (String(error?.message || "") === "rating_cancelled") return;
    setStatus(uif("rateWorkerFailed", { error: error instanceof Error ? error.message : String(error) }));
  }
});


btnStep.addEventListener("click", () => {
  if (!engine) return;
  const text = engine.next_step_json();
  currentHint = parseJson(text);
  renderBoard(currentHint);
  debugLog(text);
});

btnApply.addEventListener("click", () => {
  if (!engine) return;
  if (previewSnapshotActive && currentPreviewRecord) {
    const afterSnapshot = currentPreviewRecord.after ||
      applyStepToSnapshot(currentPreviewRecord.before || currentSnapshot, currentPreviewRecord.step || currentPreviewRecord);
    if (!afterSnapshot) {
      setStatus(ui("applyPreviewNoAfter"));
      return;
    }

    const nextText = snapshotToLibraryString(afterSnapshot);
    const result = parseJson(engine.import_puzzle_json(nextText));
    if (!result?.ok) {
      setStatus(uif("applyPreviewImportFailed", { error: result?.error || ui("importFailedGeneric") }));
      return;
    }
    currentHint = null;
    currentSnapshot = result.state || afterSnapshot;
    lastSolveData = null;
    lastAllStepsData = null;
    tree.replaceChildren();
    allStepsTree?.replaceChildren();
    previewSnapshotActive = false;
    currentPreviewRecord = null;
    givens.value = nextText;
    originalBoard = result.state?.givens || result.givens || result.puzzle || snapshotGivensString(currentSnapshot);
        renderBoardSnapshot(currentSnapshot, null);
    debugLog(JSON.stringify(result, null, 2));
    updateInputControls();
    setStatus(ui("appliedPreviewStep"));
    return;
  }
  currentHint = null;
  const text = engine.apply_hint_json();
  if (refreshAfterEdit(text)) {
    debugLog(text);
    setStatus(ui("appliedHint"));
  } else {
    debugLog(text);
  }
});


btnStepExplain?.addEventListener("click", openStepExplanationDialog);
stepExplainDialogClose?.addEventListener("click", closeStepExplanationDialog);
stepExplainDialog?.addEventListener("close", () => {
  stepExplainDialog.classList.add("hidden");
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && stepExplainDialog?.open) closeStepExplanationDialog();
});
window.addEventListener("resize", positionStepExplanationDialog);
window.addEventListener("orientationchange", () => requestAnimationFrame(positionStepExplanationDialog));
document.addEventListener("fullscreenchange", () => requestAnimationFrame(positionStepExplanationDialog));
window.visualViewport?.addEventListener("resize", positionStepExplanationDialog);
window.visualViewport?.addEventListener("scroll", positionStepExplanationDialog);

allStepsFilterText?.addEventListener("input", () => {
  allStepsFilterState.query = allStepsFilterText.value || "";
  rerenderAllStepsTree();
});
allStepsFilterTechnique?.addEventListener("change", () => {
  allStepsFilterState.technique = allStepsFilterTechnique.value || "";
  rerenderAllStepsTree();
});
allStepsSortMode?.addEventListener("change", () => {
  allStepsFilterState.sortMode = allStepsSortMode.value || "default";
  rerenderAllStepsTree();
});
allStepsFilterReplaceable?.addEventListener("change", () => {
  allStepsFilterState.replaceableOnly = Boolean(allStepsFilterReplaceable.checked);
  rerenderAllStepsTree();
});
allStepsFilterClear?.addEventListener("click", () => {
  resetAllStepsFilter();
  rerenderAllStepsTree();
});

btnAllSteps?.addEventListener("click", async () => {
  if (!engine || solverBusyTask) return;
  const sourceSnapshot = currentSnapshot || getCurrentSnapshot();
  const sourceStepIndex = Number(currentPreviewRecord?.sourceStepIndex || currentPreviewRecord?.stepIndex || 0);
  try {
    setSolverBusy("findall", true);
    setStatus(ui("findAllBusy"));
    let raw = "";
    let elapsed = 0;
    if (typeof engine.all_steps_for_import_json === "function" && sourceSnapshot) {
      const snapshotLibrary = snapshotToLibraryString(sourceSnapshot);
      if (!snapshotLibrary) {
        setStatus(ui("allStepsCannotSerialize"));
        return;
      }
      const result = await runSolverWorkerTask("findall", { snapshotLibrary, sourceStepIndex });
      raw = result.resultText;
      elapsed = Number(result.elapsedMs || 0);
    } else {
      if (!syncEngineToCurrentSnapshot()) return;
      const start = performance.now();
      raw = engine.all_steps_json();
      elapsed = performance.now() - start;
    }
    debugLog(raw);
    renderAllStepsPath(raw);
    const data = parseJson(raw);
    if (!data?.ok) {
      setStatus(uif("allStepsFailed", { error: data?.error || ui("unknownError") }));
      return;
    }
    const sourceText = Number(data?.sourceStepIndex || 0) > 0 ? uif("allStepsSourceStep", { step: data.sourceStepIndex }) : "";
    const timeText = elapsed > 0 ? uif("elapsedMs", { elapsed: elapsed.toFixed(1) }) : "";
    setStatus(uif("allStepsFound", { count: data?.candidateCount ?? data?.steps ?? 0, source: sourceText, time: timeText }));
  } catch (err) {
    console.error(err);
    debugLog(uif("allStepsFailed", { error: err?.message || err }));
    setStatus(uif("allStepsFailed", { error: err?.message || err }));
  } finally {
    setSolverBusy("findall", false);
  }
});

btnUndo?.addEventListener("click", () => {
  if (!engine) return;
  refreshAfterHistory(engine.undo_json(), ui("undoDone"), ui("undoNone"));
});

btnRedo?.addEventListener("click", () => {
  if (!engine) return;
  refreshAfterHistory(engine.redo_json(), ui("redoDone"), ui("redoNone"));
});

btnSolve.addEventListener("click", async () => {
  if (!engine || solverBusyTask) return;
  const sourceSnapshot = currentSnapshot || getCurrentSnapshot();
  try {
    setSolverBusy("solve", true);
    setStatus(ui("solveBusy"));
    let raw = "";
    let elapsed = 0;
    if (typeof engine.solve_path_for_import_json === "function" && sourceSnapshot) {
      const snapshotLibrary = snapshotToLibraryString(sourceSnapshot);
      if (!snapshotLibrary) {
        setStatus(ui("solvePathCannotSerialize"));
        return;
      }
      const result = await runSolverWorkerTask("solve", { snapshotLibrary, maxSteps: 500 });
      raw = result.resultText;
      elapsed = Number(result.elapsedMs || 0);
    } else {
      const start = performance.now();
      raw = engine.solve_path_json(500);
      elapsed = performance.now() - start;
    }

    debugLog(raw);

    renderSolvePath(raw);
    const data = parseJson(raw);
    setStatus(uif("solveCompleted", { status: data?.status || "unknown", steps: data?.steps ?? "?", elapsed: elapsed.toFixed(1) }));
  } catch (err) {
    console.error(err);
    debugLog(uif("solvePathRenderFailed", { error: err }));
    setStatus(uif("solveFailed", { error: err?.message || err }));
  } finally {
    setSolverBusy("solve", false);
  }
});

function ensureMobileSolveHomeMarkers() {
  if (!mobileSolveBoardHomeMarker && boardStage?.parentNode) {
    mobileSolveBoardHomeMarker = document.createComment("mobile-solve-board-home");
    boardStage.parentNode.insertBefore(mobileSolveBoardHomeMarker, boardStage);
  }
  if (!mobileSolveNumpadHomeMarker && numpad?.parentNode) {
    mobileSolveNumpadHomeMarker = document.createComment("mobile-solve-numpad-home");
    numpad.parentNode.insertBefore(mobileSolveNumpadHomeMarker, numpad);
  }
  if (!mobileSolveManualMarksHomeMarker && manualMarksPanel?.parentNode) {
    mobileSolveManualMarksHomeMarker = document.createComment("mobile-solve-manual-marks-home");
    manualMarksPanel.parentNode.insertBefore(mobileSolveManualMarksHomeMarker, manualMarksPanel);
  }
}

function restoreMobileSolveElement(marker, element) {
  if (!marker?.parentNode || !element) return;
  marker.parentNode.insertBefore(element, marker.nextSibling);
}

function loadMobileSolvePreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(MOBILE_SOLVE_PREFERENCES_KEY) || "null");
    if (typeof saved?.candidatesVisible === "boolean") {
      mobileSolveCandidatesVisible = saved.candidatesVisible;
    }
    if (typeof saved?.sameDigitHighlight === "boolean") {
      mobileSolveSameDigitHighlight = saved.sameDigitHighlight;
    }
    if (typeof saved?.keepScreenAwake === "boolean") {
      mobileSolveKeepScreenAwake = saved.keepScreenAwake;
    }
  } catch {
    // Keep defaults when storage is unavailable or an old value is malformed.
  }
}

function saveMobileSolvePreferences() {
  try {
    localStorage.setItem(MOBILE_SOLVE_PREFERENCES_KEY, JSON.stringify({
      candidatesVisible: mobileSolveCandidatesVisible,
      sameDigitHighlight: mobileSolveSameDigitHighlight,
      keepScreenAwake: mobileSolveKeepScreenAwake,
    }));
  } catch {
    // The mode remains fully usable when persistent storage is blocked.
  }
}


function mobileSolveWakeLockSupported() {
  return Boolean(window.isSecureContext && navigator.wakeLock && typeof navigator.wakeLock.request === "function");
}

function mobileSolveWakeLockIsActive() {
  return Boolean(mobileSolveScreenWakeLock && mobileSolveScreenWakeLock.released !== true);
}

function updateMobileSolveWakeLockUi() {
  const supported = mobileSolveWakeLockSupported();
  if (mobileSolveWakeLockToggle) {
    mobileSolveWakeLockToggle.checked = mobileSolveKeepScreenAwake;
    mobileSolveWakeLockToggle.disabled = !supported;
    mobileSolveWakeLockToggle.setAttribute("aria-checked", mobileSolveKeepScreenAwake ? "true" : "false");
    mobileSolveWakeLockToggle.title = ui("mobileSolveWakeLock");
  }
  let stateKey = "mobileSolveWakeLockWaiting";
  if (!supported) stateKey = "mobileSolveWakeLockUnsupported";
  else if (!mobileSolveKeepScreenAwake) stateKey = "mobileSolveWakeLockOff";
  else if (mobileSolveWakeLockFailed) stateKey = "mobileSolveWakeLockFailed";
  else if (mobileSolveWakeLockUnexpectedRelease) stateKey = "mobileSolveWakeLockReleased";
  else if (mobileSolveWakeLockIsActive()) stateKey = "mobileSolveWakeLockActive";
  if (mobileSolveWakeLockStatus) {
    mobileSolveWakeLockStatus.textContent = ui(stateKey);
    mobileSolveWakeLockStatus.dataset.state = stateKey;
  }
}

async function releaseMobileSolveWakeLock(options = {}) {
  const { announce = false } = options;
  mobileSolveWakeLockGeneration += 1;
  mobileSolveWakeLockUnexpectedRelease = false;
  mobileSolveWakeLockFailed = false;
  const sentinel = mobileSolveScreenWakeLock;
  mobileSolveScreenWakeLock = null;
  mobileSolveWakeLockRequest = null;
  if (sentinel && sentinel.released !== true) {
    try { await sentinel.release(); } catch { /* Browser already released it. */ }
  }
  updateMobileSolveWakeLockUi();
  if (announce) setTransientStatus("wakeLockDisabled");
}

async function requestMobileSolveWakeLock(options = {}) {
  const { announceFailure = true, announceSuccess = false } = options;
  if (!mobileSolveKeepScreenAwake || !mobileSolveActive || document.visibilityState !== "visible") {
    updateMobileSolveWakeLockUi();
    return false;
  }
  if (mobileSolveWakeLockIsActive()) {
    updateMobileSolveWakeLockUi();
    return true;
  }
  if (mobileSolveWakeLockRequest) return mobileSolveWakeLockRequest;
  if (!mobileSolveWakeLockSupported()) {
    updateMobileSolveWakeLockUi();
    if (announceFailure) setTransientStatus("wakeLockUnsupported", {}, { duration: 3600 });
    return false;
  }

  const generation = ++mobileSolveWakeLockGeneration;
  mobileSolveWakeLockFailed = false;
  const request = (async () => {
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      const stillWanted = generation === mobileSolveWakeLockGeneration
        && mobileSolveKeepScreenAwake
        && mobileSolveActive
        && document.visibilityState === "visible";
      if (!stillWanted) {
        try { await sentinel.release(); } catch { /* Ignore a stale request. */ }
        return false;
      }
      mobileSolveScreenWakeLock = sentinel;
      mobileSolveWakeLockUnexpectedRelease = false;
      mobileSolveWakeLockFailed = false;
      sentinel.addEventListener("release", () => {
        const wasCurrent = mobileSolveScreenWakeLock === sentinel;
        if (wasCurrent) mobileSolveScreenWakeLock = null;
        const unexpected = wasCurrent
          && mobileSolveKeepScreenAwake
          && mobileSolveActive
          && document.visibilityState === "visible";
        mobileSolveWakeLockUnexpectedRelease = unexpected;
        updateMobileSolveWakeLockUi();
        if (unexpected) setTransientStatus("wakeLockReleased", {}, { duration: 4200 });
      }, { once: true });
      updateMobileSolveWakeLockUi();
      if (announceSuccess) setTransientStatus("wakeLockActive");
      return true;
    } catch (error) {
      if (generation === mobileSolveWakeLockGeneration) {
        mobileSolveScreenWakeLock = null;
        mobileSolveWakeLockFailed = true;
      }
      updateMobileSolveWakeLockUi();
      if (announceFailure) {
        setTransientStatus("wakeLockFailed", {
          message: error instanceof Error ? error.message : String(error),
        }, { duration: 4200 });
      }
      return false;
    } finally {
      if (mobileSolveWakeLockRequest === request) mobileSolveWakeLockRequest = null;
    }
  })();
  mobileSolveWakeLockRequest = request;
  return request;
}

async function setMobileSolveKeepScreenAwake(enabled, options = {}) {
  mobileSolveKeepScreenAwake = Boolean(enabled);
  saveMobileSolvePreferences();
  updateMobileSolveWakeLockUi();
  if (mobileSolveKeepScreenAwake) {
    await requestMobileSolveWakeLock({
      announceFailure: options.announce !== false,
      announceSuccess: options.announce !== false,
    });
  } else {
    await releaseMobileSolveWakeLock({ announce: options.announce !== false });
  }
}

function clearMobileSolveDigitHighlights() {
  board?.querySelectorAll(".sudoku-cell.mobile-same-digit, .sudoku-cell.mobile-same-digit-value, .sudoku-cell.mobile-same-digit-candidate").forEach((cell) => {
    cell.classList.remove("mobile-same-digit", "mobile-same-digit-value", "mobile-same-digit-candidate");
  });
}

function syncMobileSolveDigitHighlights() {
  clearMobileSolveDigitHighlights();
  if (!mobileSolveActive || !mobileSolveSameDigitHighlight || !currentSnapshot) return;
  const digit = Number(selectedDigit || 0);
  if (!Number.isInteger(digit) || digit < 1 || digit > 9) return;
  for (const node of board?.querySelectorAll(".sudoku-cell[data-cell-index]") || []) {
    const index = Number(node.dataset.cellIndex);
    const cell = currentSnapshot.cells?.[index];
    const isPlacedDigit = Number(cell?.value || 0) === digit;
    const hasVisibleCandidate = mobileSolveCandidatesVisible
      && Number(cell?.value || 0) === 0
      && Array.isArray(cell?.candidates)
      && cell.candidates.some((candidate) => Number(candidate) === digit);
    if (isPlacedDigit) {
      node.classList.add("mobile-same-digit", "mobile-same-digit-value");
    } else if (hasVisibleCandidate) {
      node.classList.add("mobile-same-digit", "mobile-same-digit-candidate");
    }
  }
}

function syncMobileSolveCompletedDigitButtons() {
  const counts = new Uint8Array(10);
  if (mobileSolveActive && currentSnapshot) {
    for (const cell of currentSnapshot.cells || []) {
      const value = Number(cell?.value || 0);
      if (value >= 1 && value <= 9) counts[value] += 1;
    }
  }
  for (const button of numpad?.querySelectorAll("button[data-digit]") || []) {
    const digit = Number(button.dataset.digit || 0);
    const complete = mobileSolveActive && digit >= 1 && digit <= 9 && counts[digit] >= 9;
    button.disabled = complete;
    if (complete) {
      button.dataset.complete = "true";
      button.setAttribute("aria-disabled", "true");
    } else {
      delete button.dataset.complete;
      button.removeAttribute("aria-disabled");
    }
  }
}

function updateMobileSolvePreferenceButtons() {
  if (btnMobileSolveCandidates) {
    const candidatesHidden = !mobileSolveCandidatesVisible;
    const label = ui(candidatesHidden ? "mobileSolveShowCandidates" : "mobileSolveHideCandidates");
    setButtonText(btnMobileSolveCandidates, label);
    btnMobileSolveCandidates.title = label;
    btnMobileSolveCandidates.setAttribute("aria-label", label);
    btnMobileSolveCandidates.setAttribute("aria-pressed", candidatesHidden ? "true" : "false");
  }
  if (btnMobileSolveSameDigit) {
    const label = ui(mobileSolveSameDigitHighlight ? "mobileSolveDisableSameDigit" : "mobileSolveEnableSameDigit");
    setButtonText(btnMobileSolveSameDigit, label);
    btnMobileSolveSameDigit.title = label;
    btnMobileSolveSameDigit.setAttribute("aria-label", label);
    btnMobileSolveSameDigit.setAttribute("aria-pressed", mobileSolveSameDigitHighlight ? "true" : "false");
  }
  updateMobileSolveWakeLockUi();
}

function applyMobileSolvePreferences() {
  mobileSolveShell?.classList.toggle("mobile-hide-candidates", !mobileSolveCandidatesVisible);
  updateMobileSolvePreferenceButtons();
  syncMobileSolveDigitHighlights();
  syncMobileSolveCompletedDigitButtons();
}

function toggleMobileSolveCandidates() {
  mobileSolveCandidatesVisible = !mobileSolveCandidatesVisible;
  saveMobileSolvePreferences();
  applyMobileSolvePreferences();
}

function toggleMobileSolveSameDigitHighlight() {
  mobileSolveSameDigitHighlight = !mobileSolveSameDigitHighlight;
  saveMobileSolvePreferences();
  applyMobileSolvePreferences();
}

function updateMobileSolveMarksButton() {
  if (!btnMobileSolveMarks) return;
  const markActive = manualMarksActive();
  const label = ui(mobileSolveMarksOpen ? "mobileSolveHideMarks" : (markActive ? "mobileSolveMarksActive" : "mobileSolveMarks"));
  setButtonText(btnMobileSolveMarks, label);
  btnMobileSolveMarks.title = ui("mobileSolveMarksTitle");
  btnMobileSolveMarks.setAttribute("aria-label", ui("mobileSolveMarksTitle"));
  btnMobileSolveMarks.setAttribute("aria-pressed", mobileSolveMarksOpen ? "true" : "false");
  btnMobileSolveMarks.dataset.markActive = markActive ? "true" : "false";
}

function mountMobileSolveManualMarks(host, placement) {
  if (!manualMarksPanel || !host) return false;
  manualMarksPanel.classList.add("mobile-manual-marks");
  manualMarksPanel.dataset.mobileMarkMode = manualMarkModeValue();
  manualMarksPanel.open = true;
  host.hidden = false;
  host.appendChild(manualMarksPanel);
  mobileSolveMarksPlacement = placement;
  return true;
}

function restoreMobileSolveManualMarks() {
  if (!manualMarksPanel) return;
  manualMarksPanel.classList.remove("mobile-manual-marks");
  manualMarksPanel.removeAttribute("data-mobile-mark-mode");
  restoreMobileSolveElement(mobileSolveManualMarksHomeMarker, manualMarksPanel);
  manualMarksPanel.open = manualMarksActive() || mobileSolveManualMarksWasOpen;
  if (mobileSolveMarksHost) mobileSolveMarksHost.hidden = true;
  if (mobileSolveMarksDrawerHost) mobileSolveMarksDrawerHost.hidden = true;
  mobileSolveShell?.classList.remove("mobile-marks-inline");
  mobileSolveDrawer?.classList.remove("mobile-marks-view");
  mobileSolveMarksPlacement = "";
}

function mobileSolveInlineMarksSpace() {
  if (!mobileSolveActive || !mobileSolveShell?.classList.contains("is-portrait")) return -1;
  const viewport = mobileSolveViewport();
  const shellStyle = window.getComputedStyle(mobileSolveShell);
  const paddingX = (Number.parseFloat(shellStyle.paddingLeft) || 0) + (Number.parseFloat(shellStyle.paddingRight) || 0);
  const paddingY = (Number.parseFloat(shellStyle.paddingTop) || 0) + (Number.parseFloat(shellStyle.paddingBottom) || 0);
  const gap = Number.parseFloat(shellStyle.gap) || 5;
  const availableWidth = Math.max(108, viewport.width - paddingX);
  const availableHeight = Math.max(108, viewport.height - paddingY);
  const top = mobileSolveShell.querySelector(".mobile-solve-topbar")?.getBoundingClientRect().height || 44;
  const status = mobileSolveStatus?.getBoundingClientRect().height || 29;
  const pad = mobileSolveNumpadHost?.getBoundingClientRect().height || 89;
  const actions = mobileSolveShell.querySelector(".mobile-solve-actions")?.getBoundingClientRect().height || 38;
  const fixedHeight = top + status + pad + actions + gap * 4;
  return availableHeight - availableWidth - fixedHeight;
}

function mobileSolveInlineMarksRequiredSpace(viewportWidth) {
  // The mobile variant hides the panel summary/title and uses a compact grid.
  // Keep a small allowance for English labels and sub-pixel rounding instead
  // of reserving the old 228px drawer-oriented height on every phone.
  if (viewportWidth <= 360) return 202;
  if (viewportWidth <= 390) return 176;
  return 170;
}

function shouldInlineMobileSolveMarks() {
  const viewport = mobileSolveViewport();
  if (viewport.width > viewport.height) return false;
  return viewport.width >= 360 &&
    mobileSolveInlineMarksSpace() >= mobileSolveInlineMarksRequiredSpace(viewport.width);
}

function openMobileSolveMarks() {
  if (!mobileSolveActive || !manualMarksPanel) return;
  ensureMobileSolveHomeMarkers();
  mobileSolveManualMarksWasOpen = manualMarksPanel.open;
  mobileSolveMarksOpen = true;
  setMobileSolveDrawer(false, { preserveMarks: true });
  mobileSolveShell?.classList.add("mobile-marks-inline");
  mountMobileSolveManualMarks(mobileSolveMarksHost, "inline");
  updateManualMarkControls();
  updateMobileSolveMarksButton();
  scheduleMobileSolveLayout();
}

function closeMobileSolveMarks(options = {}) {
  const { closeDrawer = true } = options;
  if (!mobileSolveMarksOpen) return;
  const wasDrawer = mobileSolveMarksPlacement === "drawer";
  mobileSolveMarksOpen = false;
  restoreMobileSolveManualMarks();
  updateMobileSolveMarksButton();
  syncMobileSolveStatus();
  if (wasDrawer && closeDrawer) setMobileSolveDrawer(false, { preserveMarks: true });
  scheduleMobileSolveLayout();
}

function toggleMobileSolveMarks() {
  if (mobileSolveMarksOpen) closeMobileSolveMarks();
  else openMobileSolveMarks();
}

function reconcileMobileSolveMarksPlacement() {
  if (!mobileSolveMarksOpen || !manualMarksPanel) return;
  if (mobileSolveMarksPlacement !== "inline") {
    setMobileSolveDrawer(false, { preserveMarks: true });
    if (mobileSolveMarksDrawerHost) mobileSolveMarksDrawerHost.hidden = true;
    mobileSolveDrawer?.classList.remove("mobile-marks-view");
    mobileSolveShell?.classList.add("mobile-marks-inline");
    mountMobileSolveManualMarks(mobileSolveMarksHost, "inline");
  }
  updateMobileSolveMarksButton();
}

function mobileSolveViewport() {
  const visual = window.visualViewport;
  return {
    width: Math.max(1, Number(visual?.width || window.innerWidth || document.documentElement.clientWidth || 1)),
    height: Math.max(1, Number(visual?.height || window.innerHeight || document.documentElement.clientHeight || 1)),
    offsetLeft: Number(visual?.offsetLeft || 0),
    offsetTop: Number(visual?.offsetTop || 0),
  };
}

function isMobileSolveRecommendedViewport() {
  const viewport = mobileSolveViewport();
  return viewport.width <= 900 || window.matchMedia?.("(pointer: coarse)")?.matches === true;
}

function mobileSolveBoardGeometry(rawSize) {
  const style = board ? window.getComputedStyle(board) : null;
  const gridLine = Math.max(0.25, Number.parseFloat(style?.getPropertyValue("--yzf-grid-line-width") || "") || 1);
  const factorRaw = Number.parseFloat(style?.getPropertyValue("--yzf-box-line-factor") || "");
  const boxFactor = Number.isFinite(factorRaw) && factorRaw > 0 ? factorRaw : 2;
  const boxLine = gridLine * boxFactor;
  const totalLineWidth = 6 * gridLine + 4 * boxLine;
  // FB uses an integer real-cell size after subtracting all line tracks.
  // Do not force a multiple of three here: candidate thirds may be fractional,
  // and the 1px quantum lets the mobile board occupy much more of the viewport.
  const cellSize = Math.max(12, Math.floor(Math.max(0, rawSize - totalLineWidth) / 9));
  return {
    gridLine,
    boxFactor,
    boxLine,
    totalLineWidth,
    cellSize,
    boardSize: 9 * cellSize + totalLineWidth,
    boxLinePos1: boxLine + 3 * cellSize + 2 * gridLine,
    boxLinePos2: 2 * boxLine + 6 * cellSize + 4 * gridLine,
  };
}

function setMobileSolveBoardSize(rawSize) {
  if (!mobileSolveShell) return 0;
  const geometry = mobileSolveBoardGeometry(rawSize);
  const { boardSize, cellSize, gridLine, boxFactor, boxLine, boxLinePos1, boxLinePos2 } = geometry;
  mobileSolveShell.style.setProperty("--mobile-board-size", `${boardSize}px`);
  mobileSolveShell.style.setProperty("--yzf-board-size", `${boardSize}px`);
  mobileSolveShell.style.setProperty("--yzf-cell-size", `${cellSize}px`);
  mobileSolveShell.style.setProperty("--yzf-grid-line-width", `${gridLine}px`);
  mobileSolveShell.style.setProperty("--yzf-box-line-factor", String(boxFactor));
  mobileSolveShell.style.setProperty("--yzf-box-line-width", `${boxLine}px`);
  mobileSolveShell.style.setProperty("--yzf-box-line-pos-1", `${boxLinePos1}px`);
  mobileSolveShell.style.setProperty("--yzf-box-line-pos-2", `${boxLinePos2}px`);
  mobileSolveShell.style.setProperty("--yzf-value-font-size", `${Math.max(20, Math.min(62, Math.round(cellSize * 0.62)))}px`);
  mobileSolveShell.style.setProperty("--yzf-candidate-font-size", `${Math.max(7, Math.min(20, cellSize * 0.29))}px`);
  mobileSolveShell.style.setProperty("--yzf-candidate-grid-padding", "0px");
  return boardSize;
}

function applyMobileSolveLayout() {
  if (!mobileSolveActive || !mobileSolveShell) return;
  const viewport = mobileSolveViewport();
  const landscape = viewport.width > viewport.height;
  mobileSolveShell.classList.toggle("is-landscape", landscape);
  mobileSolveShell.classList.toggle("is-portrait", !landscape);
  reconcileMobileSolveMarksPlacement();
  mobileSolveShell.style.left = `${viewport.offsetLeft}px`;
  mobileSolveShell.style.top = `${viewport.offsetTop}px`;
  mobileSolveShell.style.width = `${viewport.width}px`;
  mobileSolveShell.style.height = `${viewport.height}px`;

  const shellStyle = window.getComputedStyle(mobileSolveShell);
  const paddingX = (Number.parseFloat(shellStyle.paddingLeft) || 0) + (Number.parseFloat(shellStyle.paddingRight) || 0);
  const paddingY = (Number.parseFloat(shellStyle.paddingTop) || 0) + (Number.parseFloat(shellStyle.paddingBottom) || 0);
  const gap = Number.parseFloat(shellStyle.gap) || 5;
  const availableWidth = Math.max(108, viewport.width - paddingX);
  const availableHeight = Math.max(108, viewport.height - paddingY);

  if (landscape) {
    // Prioritize the full available height. The control column may shrink down
    // to its tested 150px minimum instead of reserving an arbitrary 38%/360px.
    const minimumControlWidth = 150;
    setMobileSolveBoardSize(Math.min(availableHeight, availableWidth - minimumControlWidth - 8));
    return;
  }

  // First use all available width. On the next frame, measure the real toolbar,
  // status, keypad and action heights and reduce only when a short viewport needs it.
  setMobileSolveBoardSize(availableWidth);
  window.requestAnimationFrame(() => {
    if (!mobileSolveActive || !mobileSolveShell?.classList.contains("is-portrait")) return;
    const top = mobileSolveShell.querySelector(".mobile-solve-topbar")?.getBoundingClientRect().height || 0;
    const status = mobileSolveStatus?.getBoundingClientRect().height || 0;
    const pad = mobileSolveNumpadHost?.getBoundingClientRect().height || 0;
    const actions = mobileSolveShell.querySelector(".mobile-solve-actions")?.getBoundingClientRect().height || 0;
    const marks = !mobileSolveMarksHost?.hidden ? (mobileSolveMarksHost.getBoundingClientRect().height || 0) : 0;
    const fixedHeight = top + status + pad + actions + marks + gap * (marks > 0 ? 5 : 4);
    setMobileSolveBoardSize(Math.min(availableWidth, availableHeight - fixedHeight));
  });
}

function scheduleMobileSolveLayout() {
  if (!mobileSolveActive) return;
  window.cancelAnimationFrame(mobileSolveLayoutRaf);
  mobileSolveLayoutRaf = window.requestAnimationFrame(applyMobileSolveLayout);
}

function compactMobileSolveStatusText() {
  const base = String(hintPanel?.innerText || yzfHintBaseText || ui("initialHint")).trim();
  return base.split(/\r?\n/).find((line) => line.trim())?.trim() || ui("initialHint");
}

function syncMobileSolveStatus() {
  if (!mobileSolveStatus) return;
  const text = compactMobileSolveStatusText();
  mobileSolveStatus.textContent = text;
  mobileSolveStatus.title = text;
}

function updateMobileSolveInputState() {
  const mode = inputMode === "candidate" ? ui("candidateMode") : ui("valueMode");
  if (mobileSolveInputState) {
    mobileSolveInputState.textContent = uif("mobileInputState", { mode, digit: selectedDigit });
  }
  if (btnMobileSolveInputMode) {
    btnMobileSolveInputMode.textContent = ui(inputMode === "candidate" ? "mobileSolveCandidateShort" : "mobileSolveValueShort");
    btnMobileSolveInputMode.title = ui("inputModeTitle");
    btnMobileSolveInputMode.setAttribute("aria-label", ui("inputModeTitle"));
    btnMobileSolveInputMode.setAttribute("aria-pressed", inputMode === "candidate" ? "true" : "false");
  }
}

function updateMobileSolveLanguage() {
  setTextById("btnMobileSolveMode", ui("mobileSolveEntry"));
  setTitleAndAria(btnMobileSolveMode, ui("mobileSolveMode"));
  setTextById("mobileSolveTitle", ui("mobileSolveMode"));
  setTextById("mobileSolveExitText", ui("mobileSolveExit"));
  updateAppBackStatus();
  setTextById("btnMobileSolveNewPuzzle", ui("mobileSolveNewPuzzle"));
  setTitleAndAria(btnMobileSolveNewPuzzle, ui("mobileSolveNewPuzzleTitle"));
  setTextById("mobileSolveNewPuzzleTitle", ui("mobileSolveNewPuzzleTitle"));
  setTextById("mobileSolveNewPuzzleHint", ui("mobileSolveNewPuzzleHint"));
  setTextById("mobileSolveNewPuzzleWarning", ui("mobileSolveNewPuzzleWarning"));
  setTextById("mobileSolveNewPuzzleDifficultyLegend", ui("mobileSolveNewPuzzleDifficulty"));
  setTextById("btnMobileSolveNewPuzzleClose", ui("close"));
  setTextById("btnMobileSolveNewPuzzleCancel", ui("mobileSolveNewPuzzleCancel"));
  if (!btnMobileSolveNewPuzzleGenerate?.disabled) setTextById("btnMobileSolveNewPuzzleGenerate", ui("mobileSolveNewPuzzleGenerate"));
  setTextById("btnMobileSolveClear", ui("mobileSolveClear"));
  if (btnMobileSolveInputMode) {
    btnMobileSolveInputMode.title = ui("inputModeTitle");
    btnMobileSolveInputMode.setAttribute("aria-label", ui("inputModeTitle"));
  }
  updateMobileSolveMarksButton();
  setTextById("btnMobileSolveUndo", ui("undo"));
  setTextById("btnMobileSolveRedo", ui("redo"));
  setTextById("btnMobileSolveMore", ui("mobileSolveMore"));
  setTextById("mobileSolveDrawerTitle", ui("mobileSolveMoreTitle"));
  setTextById("btnMobileSolveDrawerClose", ui("close"));
  setTextById("btnMobileSolveHint", ui("mobileSolveHintShort"));
  setTitleAndAria(btnMobileSolveHint, ui("step"));
  setTextById("btnMobileSolveApply", ui("mobileSolveApplyShort"));
  setTitleAndAria(btnMobileSolveApply, ui("apply"));
  setTextById("btnMobileSolveAllSteps", ui("allSteps"));
  setTextById("btnMobileSolveInput", ui("mobileSolveInput"));
  setTextById("btnMobileSolveAnalysis", ui("mobileSolveAnalysis"));
  setTextById("mobileSolveLanguageLabel", ui("mobileSolveLanguage"));
  setTextById("mobileSolveWakeLockLabel", ui("mobileSolveWakeLock"));
  updateMobileSolveWakeLockUi();
  mobileSolveShell?.setAttribute("aria-label", ui("mobileSolveMode"));
  mobileSolveShell?.querySelector(".mobile-solve-actions")?.setAttribute("aria-label", ui("mobileSolveActions"));
  mobileSolveDrawer?.setAttribute("aria-label", ui("mobileSolveMoreTitle"));
  if (mobileSolveLang) mobileSolveLang.value = lang.value || "zh";
  updateMobileSolvePreferenceButtons();
  updateMobileSolveInputState();
  syncMobileSolveStatus();
}

function normalizeMobileNewPuzzleDifficulty(value) {
  const difficulty = Number(value);
  return Number.isInteger(difficulty) && difficulty >= 0 && difficulty <= 6 ? difficulty : 0;
}

function loadMobileNewPuzzleDifficulty() {
  let difficulty = normalizeMobileNewPuzzleDifficulty(difficultySelect?.value || 0);
  try {
    const stored = localStorage.getItem(MOBILE_NEW_PUZZLE_DIFFICULTY_KEY);
    if (stored != null) difficulty = normalizeMobileNewPuzzleDifficulty(stored);
  } catch {
    // Keep the currently selected difficulty when storage is unavailable.
  }
  if (difficultySelect) difficultySelect.value = String(difficulty);
  return difficulty;
}

function saveMobileNewPuzzleDifficulty(difficulty) {
  const normalized = normalizeMobileNewPuzzleDifficulty(difficulty);
  if (difficultySelect) difficultySelect.value = String(normalized);
  try { localStorage.setItem(MOBILE_NEW_PUZZLE_DIFFICULTY_KEY, String(normalized)); } catch { /* optional */ }
  return normalized;
}

function syncMobileNewPuzzleDifficultyChoice(difficulty = difficultySelect?.value || 0) {
  const normalized = normalizeMobileNewPuzzleDifficulty(difficulty);
  const option = mobileSolveNewPuzzleOptions?.querySelector(`input[name="mobileSolveNewPuzzleDifficulty"][value="${normalized}"]`);
  if (option) option.checked = true;
  return normalized;
}

function setMobileSolveNewPuzzlePanel(open) {
  mobileSolveNewPuzzleOpen = Boolean(open && mobileSolveActive);
  if (mobileSolveNewPuzzlePanel) mobileSolveNewPuzzlePanel.hidden = !mobileSolveNewPuzzleOpen;
  if (mobileSolveNewPuzzleBackdrop) mobileSolveNewPuzzleBackdrop.hidden = !mobileSolveNewPuzzleOpen;
  btnMobileSolveNewPuzzle?.setAttribute("aria-expanded", mobileSolveNewPuzzleOpen ? "true" : "false");
  if (mobileSolveNewPuzzleOpen) {
    syncMobileNewPuzzleDifficultyChoice(difficultySelect?.value || loadMobileNewPuzzleDifficulty());
    if (mobileSolveNewPuzzleWarning) mobileSolveNewPuzzleWarning.hidden = !mobileSolveCurrentPuzzleHasProgress();
    window.requestAnimationFrame(() => {
      const selected = mobileSolveNewPuzzleOptions?.querySelector('input[name="mobileSolveNewPuzzleDifficulty"]:checked');
      selected?.focus?.({ preventScroll: true });
    });
  } else {
    btnMobileSolveNewPuzzle?.focus?.({ preventScroll: true });
  }
  updateAppBackStatus();
}

function openMobileSolveNewPuzzlePanel() {
  if (!mobileSolveActive) return;
  if (mobileSolveMarksOpen) closeMobileSolveMarks();
  setMobileSolveDrawer(false);
  setMobileSolveNewPuzzlePanel(true);
}

async function generateMobileSolveNewPuzzle() {
  if (!engine || btnMobileSolveNewPuzzleGenerate?.disabled) return;
  const checked = mobileSolveNewPuzzleOptions?.querySelector('input[name="mobileSolveNewPuzzleDifficulty"]:checked');
  const difficulty = saveMobileNewPuzzleDifficulty(checked?.value ?? difficultySelect?.value ?? 0);
  if (mobileSolveCurrentPuzzleHasProgress() && !window.confirm(ui("mobileSolveNewPuzzleConfirm"))) return;

  btnMobileSolveNewPuzzleGenerate.disabled = true;
  setTextById("btnMobileSolveNewPuzzleGenerate", ui("mobileSolveNewPuzzleGenerating"));
  try {
    setStatus(uif("generatingPuzzle", { difficulty: selectedDifficultyLabel() }));
    await new Promise((resolve) => window.requestAnimationFrame(() => window.setTimeout(resolve, 0)));
    const result = generatePuzzleAtDifficulty(difficulty);
    if (!result?.ok) return;
    clearManualMarks();
    setMobileSolveNewPuzzlePanel(false);
    applyMobileSolvePreferences();
    updateMobileSolveInputState();
    syncMobileSolveStatus();
    scheduleMobileSolveLayout();
  } finally {
    btnMobileSolveNewPuzzleGenerate.disabled = false;
    setTextById("btnMobileSolveNewPuzzleGenerate", ui("mobileSolveNewPuzzleGenerate"));
  }
}

function setMobileSolveDrawer(open, options = {}) {
  const { preserveMarks = false } = options;
  if (!open && !preserveMarks && mobileSolveMarksOpen && mobileSolveMarksPlacement === "drawer") {
    mobileSolveMarksOpen = false;
    restoreMobileSolveManualMarks();
    updateMobileSolveMarksButton();
    syncMobileSolveStatus();
  }
  mobileSolveDrawerOpen = Boolean(open && mobileSolveActive);
  if (mobileSolveDrawer) {
    mobileSolveDrawer.hidden = !mobileSolveDrawerOpen;
    mobileSolveDrawer.classList.toggle("mobile-marks-view", mobileSolveDrawerOpen && mobileSolveMarksOpen && mobileSolveMarksPlacement === "drawer");
  }
  if (mobileSolveBackdrop) mobileSolveBackdrop.hidden = !mobileSolveDrawerOpen;
  btnMobileSolveMore?.setAttribute("aria-expanded", mobileSolveDrawerOpen ? "true" : "false");
  setTextById("mobileSolveDrawerTitle", ui("mobileSolveMoreTitle"));
  if (mobileSolveDrawerOpen) btnMobileSolveDrawerClose?.focus?.({ preventScroll: true });
  updateAppBackStatus();
}

function enterMobileSolveMode() {
  if (ocrCorrectionIsActive()) return false;
  if (!mobileSolveShell || !boardStage || !numpad) return false;
  if (mobileSolveActive) {
    scheduleMobileSolveLayout();
    requestMobileSolveWakeLock({ announceFailure: false }).catch(() => {});
    return true;
  }
  ensureMobileSolveHomeMarkers();
  mobileSolveScrollY = window.scrollY || 0;
  mobileSolveBoardHost?.appendChild(boardStage);
  mobileSolveNumpadHost?.appendChild(numpad);
  mobileSolveMarksOpen = false;
  mobileSolveMarksPlacement = "";
  if (mobileSolveMarksHost) mobileSolveMarksHost.hidden = true;
  if (mobileSolveMarksDrawerHost) mobileSolveMarksDrawerHost.hidden = true;
  mobileSolveActive = true;
  mobileSolveShell.hidden = false;
  document.body.classList.add("mobile-solve-mode");
  if (mobileSolveLang) mobileSolveLang.value = lang.value || "zh";
  updateMobileSolveLanguage();
  applyMobileSolvePreferences();
  setMobileSolveNewPuzzlePanel(false);
  setMobileSolveDrawer(false);
  scheduleMobileSolveLayout();
  window.setTimeout(scheduleMobileSolveLayout, 140);
  updateAppBackStatus();
  requestMobileSolveWakeLock({ announceFailure: true }).catch(() => {});
  return true;
}

async function exitMobileSolveMode(options = {}) {
  const { exitFullscreen = true } = options;
  if (!mobileSolveActive) return;
  if (mobileSolveMarksOpen) closeMobileSolveMarks({ closeDrawer: false });
  setMobileSolveNewPuzzlePanel(false);
  setMobileSolveDrawer(false, { preserveMarks: true });
  restoreMobileSolveElement(mobileSolveBoardHomeMarker, boardStage);
  restoreMobileSolveElement(mobileSolveNumpadHomeMarker, numpad);
  restoreMobileSolveManualMarks();
  clearMobileSolveDigitHighlights();
  mobileSolveActive = false;
  await releaseMobileSolveWakeLock();
  syncMobileSolveCompletedDigitButtons();
  mobileSolveShell.hidden = true;
  mobileSolveShell.style.removeProperty("left");
  mobileSolveShell.style.removeProperty("top");
  mobileSolveShell.style.removeProperty("width");
  mobileSolveShell.style.removeProperty("height");
  document.body.classList.remove("mobile-solve-mode");
  window.scrollTo({ top: mobileSolveScrollY, left: 0, behavior: "auto" });
  window.dispatchEvent(new Event("yzf-layout-modechange"));
  if (exitFullscreen && isFullscreen()) {
    try { await exitFullscreenSafe(); } catch { /* keep analysis mode usable */ }
  }
  updateAppBackStatus();
}

function clearMobileSolveSelection() {
  if (tlgSolverEditingActive()) return false;
  if (!engine || !currentSnapshot || selectedIndex < 0) {
    setStatus(ui("mobileSelectCellFirst"));
    return false;
  }
  if (isFixedCell(selectedIndex)) {
    setStatus(ui("fixedCell"));
    return false;
  }
  const cell = currentSnapshot.cells?.[selectedIndex];
  if (cell?.value > 0) {
    return refreshAfterEdit(engine.set_value_json(selectedIndex, 0));
  }
  if (inputMode === "candidate" && cell?.candidates?.includes(selectedDigit)) {
    return refreshAfterEdit(engine.toggle_candidate_json(selectedIndex, selectedDigit));
  }
  setStatus(ui("mobileNothingToClear"));
  return false;
}

function openPuzzleInputFromMobile() {
  exitMobileSolveMode({ exitFullscreen: false }).then(() => {
    activateTab("controls");
    const inputDetails = givens?.closest("details");
    if (inputDetails) inputDetails.open = true;
    window.requestAnimationFrame(() => {
      inputDetails?.scrollIntoView?.({ block: "start", behavior: "smooth" });
      givens?.focus?.({ preventScroll: true });
    });
  });
}

function installMobileSolveMode() {
  ensureMobileSolveHomeMarkers();
  updateDifficultyControlsLanguage();
  loadMobileSolvePreferences();
  loadMobileNewPuzzleDifficulty();
  syncMobileNewPuzzleDifficultyChoice();
  applyMobileSolvePreferences();
  const hintObserver = new MutationObserver(syncMobileSolveStatus);
  if (hintPanel) hintObserver.observe(hintPanel, { childList: true, subtree: true, characterData: true });

  btnMobileSolveMode?.addEventListener("click", enterMobileSolveMode);
  btnMobileSolveNewPuzzle?.addEventListener("click", openMobileSolveNewPuzzlePanel);
  btnMobileSolveFullscreen?.addEventListener("click", () => { setMobileSolveDrawer(false); toggleFullscreen(); });
  btnMobileSolveNewPuzzleClose?.addEventListener("click", () => setMobileSolveNewPuzzlePanel(false));
  btnMobileSolveNewPuzzleCancel?.addEventListener("click", () => setMobileSolveNewPuzzlePanel(false));
  btnMobileSolveNewPuzzleGenerate?.addEventListener("click", generateMobileSolveNewPuzzle);
  mobileSolveNewPuzzleBackdrop?.addEventListener("click", () => setMobileSolveNewPuzzlePanel(false));
  mobileSolveNewPuzzleOptions?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.name !== "mobileSolveNewPuzzleDifficulty") return;
    saveMobileNewPuzzleDifficulty(target.value);
  });
  difficultySelect?.addEventListener("change", () => {
    saveMobileNewPuzzleDifficulty(difficultySelect.value);
    syncMobileNewPuzzleDifficultyChoice(difficultySelect.value);
    updateDifficultySelectCompactWidth();
  });
  btnMobileSolveClear?.addEventListener("click", () => {
    setMobileSolveDrawer(false);
    clearMobileSolveSelection();
  });
  btnMobileSolveUndo?.addEventListener("click", () => btnUndo?.click());
  btnMobileSolveRedo?.addEventListener("click", () => btnRedo?.click());
  btnMobileSolveMarks?.addEventListener("click", toggleMobileSolveMarks);
  btnMobileSolveInputMode?.addEventListener("click", () => {
    inputMode = inputMode === "candidate" ? "value" : "candidate";
    updateInputControls();
  });
  btnMobileSolveMore?.addEventListener("click", () => {
    setMobileSolveDrawer(!mobileSolveDrawerOpen);
  });
  btnMobileSolveDrawerClose?.addEventListener("click", () => setMobileSolveDrawer(false));
  mobileSolveBackdrop?.addEventListener("click", () => setMobileSolveDrawer(false));
  btnMobileSolveHint?.addEventListener("click", () => { setMobileSolveDrawer(false); btnStep?.click(); });
  btnMobileSolveApply?.addEventListener("click", () => { setMobileSolveDrawer(false); btnApply?.click(); });
  btnMobileSolveAllSteps?.addEventListener("click", () => {
    setMobileSolveDrawer(false);
    exitMobileSolveMode({ exitFullscreen: false }).then(() => btnAllSteps?.click());
  });
  btnMobileSolveInput?.addEventListener("click", openPuzzleInputFromMobile);
  btnMobileSolveCandidates?.addEventListener("click", toggleMobileSolveCandidates);
  btnMobileSolveSameDigit?.addEventListener("click", toggleMobileSolveSameDigitHighlight);
  mobileSolveWakeLockToggle?.addEventListener("change", () => {
    setMobileSolveKeepScreenAwake(mobileSolveWakeLockToggle.checked).catch(() => {});
  });
  btnMobileSolveAnalysis?.addEventListener("click", () => exitMobileSolveMode());
  mobileSolveLang?.addEventListener("change", () => {
    lang.value = mobileSolveLang.value;
    lang.dispatchEvent(new Event("change", { bubbles: true }));
  });
  window.addEventListener("resize", scheduleMobileSolveLayout, { passive: true });
  window.addEventListener("orientationchange", scheduleMobileSolveLayout, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleMobileSolveLayout, { passive: true });
  window.visualViewport?.addEventListener("scroll", scheduleMobileSolveLayout, { passive: true });
  document.addEventListener("fullscreenchange", scheduleMobileSolveLayout);
  document.addEventListener("webkitfullscreenchange", scheduleMobileSolveLayout);
  document.addEventListener("keydown", (event) => {
    if (!mobileSolveActive || event.key !== "Escape") return;
    if (mobileSolveNewPuzzleOpen) {
      event.preventDefault();
      setMobileSolveNewPuzzlePanel(false);
    } else if (mobileSolveDrawerOpen) {
      event.preventDefault();
      setMobileSolveDrawer(false);
    }
  });
  updateMobileSolveLanguage();
}

function isFullscreen() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

async function enterFullscreen() {
  const target = document.documentElement;

  if (target.requestFullscreen) {
    await target.requestFullscreen();
    return true;
  }

  if (target.webkitRequestFullscreen) {
    target.webkitRequestFullscreen();
    return true;
  }

  return false;
}

async function exitFullscreenSafe() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return true;
  }

  if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
    return true;
  }

  return false;
}

function setActionButtonLabel(button, label, icon = null) {
  if (!button) return;
  button.title = label;
  button.setAttribute("aria-label", label);
  const labelNode = button.querySelector(".action-label");
  if (labelNode) {
    labelNode.textContent = label;
  } else {
    button.textContent = label;
  }
  if (icon !== null) {
    const iconNode = button.querySelector(".action-icon");
    if (iconNode) {
      iconNode.textContent = icon;
    }
  }
}

function updateFullscreenButton() {
  const label = isFullscreen() ? ui("exitFullscreen") : ui("fullscreen");
  if (btnFullscreen) setActionButtonLabel(btnFullscreen, label);
  if (btnMobileSolveFullscreen) setButtonText(btnMobileSolveFullscreen, label);
  if (ocrCorrectionIsActive()) renderOcrCorrection();
}

async function toggleFullscreen() {
  try {
    if (isFullscreen()) {
      await exitFullscreenSafe();
    } else {
      // OCR correction has priority over the automatic mobile solve layout.
      // In landscape fullscreen the comparison editor must remain visible.
      if (!ocrCorrectionIsActive() && !mobileSolveActive && isMobileSolveRecommendedViewport()) enterMobileSolveMode();
      const ok = await enterFullscreen();
      if (!ok) {
        setStatus(ui("unsupportedFullscreen"));
      }
    }
  } catch (error) {
    console.warn("Fullscreen failed:", error);
    setStatus(`${ui("fullscreenFailed")}: ${error?.message || error}`);
  }

  updateFullscreenButton();
  window.dispatchEvent(new Event("yzf-layout-modechange"));
}

btnFullscreen?.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", updateFullscreenButton);
document.addEventListener("webkitfullscreenchange", updateFullscreenButton);

function applyTechniquePreset(mode) {
  const state = (techniqueState.length ? techniqueState : loadTechniqueState());
  const implemented = (item) => item.implemented !== false;
  const orderOf = (kind) => REF_TECHNIQUE_BY_KIND.get(kind)?.order ?? 9999;
  const inRange = (kind, start, end) => {
    const order = orderOf(kind);
    return order >= orderOf(start) && order <= orderOf(end);
  };
  const highSpeedDisabled = (kind) => inRange(kind, "DeathBlossom", "ComplexSquirmbagFish") || kind === "Braid" || kind === "GBraid";
  const extremeDisabled = (kind) => (
    kind === "GSP" ||
    inRange(kind, "AlmostPair", "AvoidableRectangle") ||
    kind === "ERIPair" ||
    inRange(kind, "XYZRing", "WXYZWing") ||
    kind === "UniqueLoop" ||
    kind === "ExtendedRectangle" ||
    kind === "Fireworks" ||
    kind === "BrokenWing" ||
    inRange(kind, "ALSXZ", "AHSWWing") ||
    inRange(kind, "AHSChain", "CellRegionFC") ||
    kind === "Braid" ||
    kind === "GBraid"
  );
  const enabledFor = (item) => {
    if (!implemented(item)) return false;
    switch (mode) {
      case "allIn":
        return true;
      case "highSpeed":
        return !highSpeedDisabled(item.kind);
      case "extremeSpeed":
        return !extremeDisabled(item.kind);
      case "whipRating":
        return inRange(item.kind, "FullHouse", "NakedSingle") || item.kind === "Whip" || item.kind === "GWhip";
      case "braidRating":
        return inRange(item.kind, "FullHouse", "NakedSingle") || item.kind === "Braid" || item.kind === "GBraid";
      default:
        return Boolean(item.enabled);
    }
  };
  const next = state
    .map((item) => ({
      ...item,
      order: REF_TECHNIQUE_BY_KIND.get(item.kind)?.order ?? item.order,
      enabled: enabledFor(item),
      withAMSLS: item.kind === "ComplexAIC" ? false : item.withAMSLS,
      withJEPOM: item.kind === "JE" ? false : item.withJEPOM,
    }))
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  const nextWhipMemoryMode = mode === "whipRating" ? "large" : (whipMemoryMode === "large" ? "large" : "auto");
  applyTechniqueState(next, nextWhipMemoryMode);
  const labelKey = {
    allIn: "techPresetAll",
    highSpeed: "techPresetHighSpeed",
    extremeSpeed: "techPresetExtremeSpeed",
    whipRating: "techPresetWhipRating",
    braidRating: "techPresetBraidRating",
  }[mode];
  setStatus(uif("techniquePresetApplied", { preset: labelKey ? ui(labelKey) : mode }));
}


function installDynamicBoardSizing() {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const CELL_SIZE_QUANTUM = 3; // FB geometry: each real cell stays divisible by the 3x3 candidate grid.

  const getPx = (style, prop) => Number.parseFloat(style.getPropertyValue(prop)) || 0;

  const readBoardLineMetrics = (wrapStyle) => {
    const gridLine = Math.max(0.25, getPx(wrapStyle, '--yzf-grid-line-width') || 1);
    const factorRaw = Number.parseFloat(wrapStyle.getPropertyValue('--yzf-box-line-factor'));
    const boxFactor = Number.isFinite(factorRaw) && factorRaw > 0 ? factorRaw : 2;
    const boxLine = gridLine * boxFactor;
    return {
      gridLine,
      boxFactor,
      boxLine,
      totalLineWidth: 6 * gridLine + 4 * boxLine,
    };
  };

  const quantizeBoardGeometry = (rawSize, minSize, maxSize, lineMetrics) => {
    const { totalLineWidth } = lineMetrics;
    const toCellFloor = (boardSize) => Math.max(0, Math.floor((boardSize - totalLineWidth) / (9 * CELL_SIZE_QUANTUM)) * CELL_SIZE_QUANTUM);
    const toCellCeil = (boardSize) => Math.max(CELL_SIZE_QUANTUM, Math.ceil((boardSize - totalLineWidth) / (9 * CELL_SIZE_QUANTUM)) * CELL_SIZE_QUANTUM);
    const maxCell = Math.max(CELL_SIZE_QUANTUM, toCellFloor(maxSize));
    const minCell = Math.min(maxCell, toCellCeil(Math.min(minSize, maxSize)));
    const rawCell = toCellFloor(Math.max(0, rawSize));
    const cellSize = clamp(rawCell, minCell, maxCell);
    return {
      cellSize,
      boardSize: 9 * cellSize + totalLineWidth,
    };
  };

  const applyBoardGeometryVariables = (wrap, geometry, lineMetrics) => {
    const { cellSize, boardSize } = geometry;
    const { gridLine, boxFactor, boxLine } = lineMetrics;
    // The unified line layer is measured from the board's outer edge.
    // Outer frame padding therefore participates in the same offset model
    // as FB's offsetLine/ofst coordinates.
    const boxLinePos1 = boxLine + 3 * cellSize + 2 * gridLine;
    const boxLinePos2 = 2 * boxLine + 6 * cellSize + 4 * gridLine;
    const valueFontSize = Math.max(22, Math.min(72, Math.round(cellSize * 0.62)));
    const candidateFontSize = Math.max(8, Math.min(24, Math.round(cellSize * 0.22)));

    wrap.style.setProperty('--yzf-board-size', `${boardSize}px`);
    wrap.style.setProperty('--yzf-cell-size', `${cellSize}px`);
    wrap.style.setProperty('--yzf-grid-line-width', `${gridLine}px`);
    wrap.style.setProperty('--yzf-box-line-factor', String(boxFactor));
    wrap.style.setProperty('--yzf-box-line-width', `${boxLine}px`);
    wrap.style.setProperty('--yzf-box-line-pos-1', `${boxLinePos1}px`);
    wrap.style.setProperty('--yzf-box-line-pos-2', `${boxLinePos2}px`);
    wrap.style.setProperty('--yzf-value-font-size', `${valueFontSize}px`);
    wrap.style.setProperty('--yzf-candidate-font-size', `${candidateFontSize}px`);
    wrap.style.setProperty('--yzf-candidate-grid-padding', '0px');
  };

  const setDynamicBoardSize = () => {
    const wrap = document.querySelector('.board-wrap');
    const stage = document.getElementById('boardStage');
    const topbar = document.querySelector('.topbar');
    const hint = document.getElementById('hintPanel');
    if (!wrap || !stage) return;

    const visual = window.visualViewport;
    const viewportW = visual?.width || window.innerWidth || document.documentElement.clientWidth;
    const viewportH = visual?.height || window.innerHeight || document.documentElement.clientHeight;
    const wrapStyle = window.getComputedStyle(wrap);
    const lineMetrics = readBoardLineMetrics(wrapStyle);
    const wrapRect = wrap.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const paddingLeft = getPx(wrapStyle, 'padding-left');
    const paddingRight = getPx(wrapStyle, 'padding-right');
    const paddingTop = getPx(wrapStyle, 'padding-top');
    const paddingBottom = getPx(wrapStyle, 'padding-bottom');
    const paddingX = paddingLeft + paddingRight;
    const gap = getPx(wrapStyle, 'column-gap');
    const viewportGuard = 6;
    const wrapTopInViewport = Math.max(0, wrapRect.top || 0);
    const stageTopInViewport = Math.max(wrapTopInViewport + paddingTop, stageRect.top || 0);
    const landscapeBoardTop = wrapTopInViewport + paddingTop;
    const isCompactLandscape = window.matchMedia('(orientation: landscape) and (max-height: 640px)').matches;
    const isLandscapeGrid = window.matchMedia('(orientation: landscape) and (min-width: 700px)').matches || isCompactLandscape;

    let size;
    let maxByHeight;
    if (isLandscapeGrid) {
      const configuredRightMin = getPx(wrapStyle, '--yzf-right-panel-min');
      const rightMin = configuredRightMin || (isCompactLandscape ? 220 : 280);
      const availableW = Math.max(0, (wrapRect.width || viewportW) - paddingX - rightMin - gap);
      maxByHeight = Math.max(0, viewportH - landscapeBoardTop - paddingBottom - viewportGuard);
      size = Math.floor(Math.min(availableW, maxByHeight));
    } else {
      const topbarH = topbar ? topbar.getBoundingClientRect().height : 0;
      const hintStyle = hint ? window.getComputedStyle(hint) : null;
      const reservedHintH = hintStyle ? (Number.parseFloat(hintStyle.height) || 66) : 66;
      const availableW = Math.max(0, (wrapRect.width || viewportW) - paddingX);
      const boardTop = Math.max(stageTopInViewport, wrapTopInViewport + paddingTop + topbarH);
      maxByHeight = Math.max(0, viewportH - boardTop - reservedHintH - paddingBottom - viewportGuard);
      size = Math.floor(Math.min(availableW, maxByHeight > 260 ? maxByHeight : availableW));
    }

    const minSize = viewportW < 420 ? 216 : 270;
    let maxSize = Math.max(
      lineMetrics.totalLineWidth + 9 * CELL_SIZE_QUANTUM,
      Math.min(viewportW - 8, Math.max(lineMetrics.totalLineWidth + 9 * CELL_SIZE_QUANTUM, maxByHeight || viewportH - 8))
    );
    // A browser cannot reliably know a monitor's physical centimetres.
    // Use a configurable CSS-pixel cap for normal desktop landscape, while
    // keeping compact/mobile modes governed by their available viewport.
    if (isLandscapeGrid && !isCompactLandscape) {
      const configuredDesktopCap = getPx(wrapStyle, '--yzf-desktop-board-max') || 700;
      maxSize = Math.min(maxSize, configuredDesktopCap);
    }

    const geometry = quantizeBoardGeometry(size, minSize, maxSize, lineMetrics);
    const currentSize = Number.parseFloat(wrap.style.getPropertyValue('--yzf-board-size')) || 0;
    const currentCell = Number.parseFloat(wrap.style.getPropertyValue('--yzf-cell-size')) || 0;
    const currentBox = Number.parseFloat(wrap.style.getPropertyValue('--yzf-box-line-width')) || 0;
    if (currentSize && Math.abs(currentSize - geometry.boardSize) < 0.05
        && Math.abs(currentCell - geometry.cellSize) < 0.05
        && Math.abs(currentBox - lineMetrics.boxLine) < 0.05) return;
    applyBoardGeometryVariables(wrap, geometry, lineMetrics);
    window.dispatchEvent(new CustomEvent('yzf-board-geometry-applied', {
      detail: { ...geometry, ...lineMetrics },
    }));
  };

  let raf = 0;

  // V433: the Sudoku board owns an independent visual panel. Business/content updates
  // in the right panel must not resize it. Browser viewport changes are different: normal
  // window resizing and desktop page zoom both dispatch window.resize, so handle only that
  // external signal (debounced) and keep ResizeObserver/right-panel observers out of this path.
  let lastAppliedBoardSize = 0;
  const applyDynamicBoardSize = () => {
    const wrap = document.querySelector('.board-wrap');
    if (!wrap) return;
    setDynamicBoardSize();
    const next = Number.parseFloat(window.getComputedStyle(wrap).getPropertyValue('--yzf-board-size')) || 0;
    if (next && Math.abs(next - lastAppliedBoardSize) < 0.5) return;
    lastAppliedBoardSize = next;
  };

  const scheduleDynamicBoardSizeForLayoutMode = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(applyDynamicBoardSize);
  };

  let viewportResizeTimer = 0;
  const scheduleDynamicBoardSizeForViewport = () => {
    // Browser zoom can emit several resize events while the zoom level settles. Debouncing
    // prevents visible size stepping, while right-panel DOM/content changes never enter here.
    window.clearTimeout(viewportResizeTimer);
    viewportResizeTimer = window.setTimeout(scheduleDynamicBoardSizeForLayoutMode, 120);
  };

  window.addEventListener('resize', scheduleDynamicBoardSizeForViewport, { passive: true });
  window.addEventListener('orientationchange', scheduleDynamicBoardSizeForLayoutMode, { passive: true });
  document.addEventListener('fullscreenchange', scheduleDynamicBoardSizeForLayoutMode);
  document.addEventListener('webkitfullscreenchange', scheduleDynamicBoardSizeForLayoutMode);
  window.addEventListener('yzf-layout-modechange', scheduleDynamicBoardSizeForLayoutMode);
  window.addEventListener('yzf-board-geometrychange', scheduleDynamicBoardSizeForLayoutMode);
  document.addEventListener('DOMContentLoaded', scheduleDynamicBoardSizeForLayoutMode);
}

[
  [btnTechAllIn, "allIn"], [btnTechHighSpeed, "highSpeed"], [btnTechExtremeSpeed, "extremeSpeed"],
  [btnTechWhipRating, "whipRating"], [btnTechBraidRating, "braidRating"],
].forEach(([button, preset]) => button?.addEventListener("click", () => applyTechniquePreset(preset)));

lang.addEventListener("change", () => {
  applyStaticLanguage();
  if (tlgSolverState.lastStatusResponse) {
    const formattedStatus = formatTlgResponseStatus(tlgSolverState.lastStatusResponse);
    tlgSolverState.lastMessage = formattedStatus.text;
    tlgSolverState.lastTone = formattedStatus.tone;
    updateTlgSolverUi();
  }
  relocalizeIfExactText(hintPanel, "waitingWasm");
  relocalizeIfExactText(hintPanel, "initialHint");
  if (lastSolveData) {
    tree.replaceChildren(renderSolveTreeView(lastSolveData));
  }
  if (lastAllStepsData && allStepsTree) {
    refreshAllStepsFilterOptions(lastAllStepsData);
    allStepsTree.replaceChildren(renderAllStepsTreeView(lastAllStepsData));
  }
  renderTechniques();
  if (currentSnapshot) {
    renderBoardSnapshot(currentSnapshot, currentHint);
  } else {
    renderBoard(currentHint);
  }
  scheduleAppSessionSave();
});

btnClearSavedSession?.addEventListener("click", clearSavedAppSession);

window.addEventListener("beforeunload", flushAppSessionSave);
window.addEventListener("pagehide", flushAppSessionSave);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    flushAppSessionSave();
    updateMobileSolveWakeLockUi();
  } else if (mobileSolveActive && mobileSolveKeepScreenAwake) {
    requestMobileSolveWakeLock({ announceFailure: false }).catch(() => {});
  }
});

installDynamicBoardSizing();
installMobileSolveMode();
installAppStatusControls();
installAppBackNavigation();
applyStaticLanguage();
installPwaSupport();

init().catch((err) => {
  console.error(err);
  const message = `${ui("wasmLoadFailed")}: ${err}`;
  setStatus(message);
  debugLog(message);
});
