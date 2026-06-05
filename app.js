import createModule from "./sudoku_wasm.js?v=20260528-v223-blossom-checkwk-short-loop";

const APP_VERSION = "20260602-v424_board_size_hard_lock";

const COACH_BASE32_CHARS = "0123456789abcdefghijklmnopqrstuv";
const COACH_BASE32_REVERSE = new Map([...COACH_BASE32_CHARS].map((ch, index) => [ch, index]));

const out = document.getElementById("out");
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
const yzfBranchControls = document.getElementById("yzfBranchControls");
const yzfBranchSelect = document.getElementById("yzfBranchSelect");
const manualAdvancedTypSelect = document.getElementById("manualAdvancedTypSelect");
const manualAdvancedInputFormatSelect = document.getElementById("manualAdvancedInputFormatSelect");
const manualAllowGrouped = document.getElementById("manualAllowGrouped");
const manualAllowGroupedLabel = document.getElementById("manualAllowGroupedLabel");
const manualDebugMode = document.getElementById("manualDebugMode");
const manualReturnDebugJson = document.getElementById("manualReturnDebugJson");
const manualIncludeOverlayData = document.getElementById("manualIncludeOverlayData");
const manualIncludeRawGraphStats = document.getElementById("manualIncludeRawGraphStats");
const btnManualAdvancedRun = document.getElementById("btnManualAdvancedRun");
const btnManualAdvancedClear = document.getElementById("btnManualAdvancedClear");
const manualAdvancedStatus = document.getElementById("manualAdvancedStatus");
const manualAdvancedJson = document.getElementById("manualAdvancedJson");
const manualAdvancedSmokeOutput = document.getElementById("manualAdvancedSmokeOutput");
const btnGenerate = document.getElementById("btnGenerate");
const btnGenerateTraining = document.getElementById("btnGenerateTraining");
const btnBatchGenerate = document.getElementById("btnBatchGenerate");
const btnBatchStop = document.getElementById("btnBatchStop");
const btnLoad = document.getElementById("btnLoad");
const btnImageOcrPick = document.getElementById("btnImageOcrPick");
const btnImageOcrCamera = document.getElementById("btnImageOcrCamera");
const btnImageOcrClipboard = document.getElementById("btnImageOcrClipboard");
const btnClearSavedSession = document.getElementById("btnClearSavedSession");
const imageOcrInput = document.getElementById("imageOcrInput");
const imageOcrCameraInput = document.getElementById("imageOcrCameraInput");

let localSudokuOcrModulePromise = null;
let ortScriptPromise = null;
let lastOcrDraftCoachJson = null;
const APP_SESSION_STORAGE_KEY = "yzf_sudoku_session_v1";
let appSessionSaveTimer = 0;
let appSessionRestoring = false;


function loadScriptOnce(src) {
  const existing = document.querySelector(`script[data-yzf-src="${src}"]`);
  if (existing) {
    if (existing.dataset.loaded === "1") return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error(`脚本加载失败：${src}`)), { once: true });
    });
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
    script.addEventListener("error", () => reject(new Error(`脚本加载失败：${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

async function loadLocalSudokuOcrModule() {
  if (!localSudokuOcrModulePromise) {
    localSudokuOcrModulePromise = (async () => {
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
        if (!ortScriptPromise) ortScriptPromise = loadScriptOnce("./ocr/ort/ort.min.js?v=20260603-v419-ocr-given-user");
        await ortScriptPromise;
      }
      return import("./ocr/local-sudoku-ocr.js?v=20260603-v419-ocr-given-user");
    })();
  }
  return localSudokuOcrModulePromise;
}

async function localSudokuOcrAttributionSafe() {
  try {
    const mod = await loadLocalSudokuOcrModule();
    return typeof mod.localSudokuOcrAttribution === "function" ? mod.localSudokuOcrAttribution() : null;
  } catch (_) {
    return null;
  }
}
const btnExportPuzzle = document.getElementById("btnExportPuzzle");
const btnRate = document.getElementById("btnRate");
const btnCandidates = document.getElementById("btnCandidates");
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
const manualMarkCleanEasy = document.getElementById("manualMarkCleanEasy");
const manualMarkClear = document.getElementById("manualMarkClear");
const manualMarkUndoLine = document.getElementById("manualMarkUndoLine");
const manualMarkCancelChain = document.getElementById("manualMarkCancelChain");
const manualMarkFinishBlock = document.getElementById("manualMarkFinishBlock");
const manualMarkUndoBlock = document.getElementById("manualMarkUndoBlock");
const manualMarkStatus = document.getElementById("manualMarkStatus");
const difficultySelect = document.getElementById("difficultySelect");
const batchCount = document.getElementById("batchCount");
const batchFilename = document.getElementById("batchFilename");
const batchStatus = document.getElementById("batchStatus");
const trainingTechniqueSelect = document.getElementById("trainingTechniqueSelect");
const techniqueList = document.getElementById("techniqueList");
const btnTechAllIn = document.getElementById("btnTechAllIn");
const btnTechHighSpeed = document.getElementById("btnTechHighSpeed");
const btnTechExtremeSpeed = document.getElementById("btnTechExtremeSpeed");
const btnTechWhipRating = document.getElementById("btnTechWhipRating");
const btnTechBraidRating = document.getElementById("btnTechBraidRating");
const tabButtons = [...document.querySelectorAll(".tab-button")];
const tabPanels = [...document.querySelectorAll("[data-tab-panel]")];
const btnFullscreen = document.getElementById("btnFullscreen");

let engine = null;
let solverWorker = null;
let solverTaskSeq = 0;
const solverWorkerRequests = new Map();
let solverBusyTask = "";
let lastSolveData = null;
let lastAllStepsData = null;
let allStepsFilterState = { query: "", technique: "", sortMode: "default", replaceableOnly: false };
let branchUndoData = null;
let originalBoard = "";
let currentHint = null;
let currentStepExplainContext = null;
let currentSnapshot = null;
let currentManualAdvancedInputString = "";
let currentManualAdvancedInputFormat = "unknown";
let currentManualAdvancedUsesCandidates = false;
let currentManualAdvancedInputBoardKey = "";
let previewSnapshotActive = false;
let currentPreviewRecord = null;
let selectedIndex = -1;
let selectedDigit = 1;
let inputMode = "value";
let techniqueState = [];
let whipMemoryMode = "auto";
let batchAbortRequested = false;
let yzfDebugSampleData = null;
let yzfDebugControlsInitialized = false;
let yzfSelectedBranchMode = "all";

const APP_URL_PARAMS = new URLSearchParams(window.location.search);
const APP_DEBUG_MODE = (
  APP_URL_PARAMS.get("dev") === "1" ||
  APP_URL_PARAMS.get("debug") === "1" ||
  APP_URL_PARAMS.get("manualAdvancedSmoke") === "1" ||
  APP_URL_PARAMS.get("manualAdvancedBrowserE2E") === "1" ||
  APP_URL_PARAMS.get("defaultYzfSmoke") === "1"
);

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
  ["BivalueOddagon", "Bivalue Oddagon", "Oddagon", 3, 190],
  ["WXYZWing", "WXYZ-Wing", "Wings", 3, 200],
  ["UniqueRectangle", "UR", "Uniqueness", 3, 150],
  ["UniqueLoop", "UL", "Uniqueness", 3, 200],
  ["ExtendedRectangle", "Extended Rectangle", "Uniqueness", 3, 200],
  ["FinnedXWing", "Finned X-Wing", "Fish", 3, 140],
  ["FinnedSwordfish", "Finned SwordFish", "Fish", 3, 220],
  ["FinnedJellyfish", "Finned JellyFish", "Fish", 3, 250],
  ["SueDeCoq", "Sue de Coq", "ALS", 3, 250],
  ["Fireworks", "Fireworks", "Single Digit", 3, 250],
  ["BrokenWing", "Broken Wing", "Wings", 3, 250],
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
  ["BlossomLoop", "Blossom Loop", "ALS", 5, 400],
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
  ["TripletOddagon", "Triplet Oddagon", "Oddagon", 4, 500],
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


const uiText = {
  zh: {
    boardHeading: "盘面",
    brandSubtitle: "移动优先逻辑训练器",
    manualLink: "使用手册",
    techniqueHelp: "技巧说明",
    initialHint: "等待加载题面。",
    branch: "分支",
    controls: "操作",
    techniques: "技巧",
    path: "解题路径",
    allSteps: "可选步骤",
    generate: "生成",
    generateTraining: "训练生成",
    load: "加载",
    undo: "撤销",
    redo: "重做",
    step: "提示一步",
    solve: "自动解题",
    apply: "应用提示",
    stepExplain: "解释",
    stepExplainTitle: "动态教程：为什么这一步成立",
    stepExplainUnavailable: "当前没有可解释的步骤。",
    close: "关闭",
    fullscreen: "全屏",
    exitFullscreen: "退出全屏",
    difficulty: "难度",
    training: "训练",
    batchGenerate: "批量出题",
    count: "数量",
    filename: "文件名",
    startBatch: "开始出题",
    stop: "停止",
    batchStatusIdle: "按当前难度批量生成，写入磁盘文件。",
    moreInput: "更多：题面输入与导出评分",
    exportPuzzle: "导出题串",
    clearSavedSession: "清除本地保存",
    sessionRestored: "已恢复上次关闭时的盘面和技巧配置。",
    sessionRestoreFailed: "恢复上次现场失败：{message}",
    sessionCleared: "已清除本地保存的盘面和技巧配置。",
    ratePuzzle: "评分当前题目",
    allStepsFilterPlaceholder: "过滤：技巧、删数或描述",
    allTechniques: "全部技巧",
    defaultSort: "默认排序",
    conclusionSort: "出数/删数优先",
    replaceable: "可替换",
    clear: "清除",
    noAllSteps: "暂无可选步骤。",
    manualAdvancedTitle: "高级技巧",
    runManualAdvanced: "运行高级技巧",
    clearManualAdvanced: "清除高级技巧",
    manualAdvancedNote: "不影响默认提示一步。",
    overlayLegend: "图例",
    onNode: "ON node：绿色小点",
    offNode: "OFF node：橙色小点",
    groupedSector: "GroupedSector：组合候选区域",
    strongEdge: "Strong edge：实线",
    weakEdge: "Weak edge：虚线",
    groupEdge: "组合边：紫色",
    afAux: "AF 辅助：cover row 水平，cover column 垂直",
    debugCandidate: "Debug candidate：红叉，仅调试",
    overlayDebugOnly: "仅调试，不作为正式删数",
    chooseDigit: "选择数字",
    candidateMode: "候选",
    valueMode: "出数",
    inputModeTitle: "切换出数/候选模式。先按数字，再点格子切换。",
    currentInput: "当前",
    techniquePresetApplied: "已应用技巧预设",
    wasmLoadFailed: "wasm 加载失败",
    unsupportedFullscreen: "当前浏览器不支持网页全屏，请尝试添加到主屏幕/PWA，或使用安卓 Chrome 测试。",
    fullscreenFailed: "全屏失败",
    optionsUpdated: "技巧配置已更新。",
    operationFailed: "操作失败。",
    fixedCell: "题目固定数不可修改。",
    fixedCandidate: "题目固定数不可修改候选。",
    solvedCandidate: "已出数格不可修改候选。",
    importClipboardRetry: "输入区内容不是合法题串，已从剪贴板读取并尝试加载。",
    loadFailedPrefix: "加载失败：",
    importUnknownFormat: "未识别的题面格式",
    importedPuzzle: "已导入：{format}{candidates}。",
    importedWithCandidates: "，含候选数",
    ocrDraftCandidateChanged: "已修改 OCR 候选草稿。请直接在盘面上继续校正；需要保存/分享时使用现有导出功能。",
    ocrGivenInsufficient: "提示数不足，未进行唯一解校验。",
    ocrGivenNotUnique: "黑色提示数组成的题串未通过唯一解校验。",
    ocrGivenCheckFailed: "黑色提示数唯一解校验失败。",
    ocrDoneLog: "本地图片识别完成。{attribution}",
    ocrDoneLogNoAttribution: "本地图片识别完成。",
    ocrGivenUniquePassed: "黑色提示数已通过唯一解校验。",
    ocrGivenUniqueFailed: "黑色提示数暂未通过唯一解校验：{warning}。",
    ocrManualCorrection: "请手动校正",
    ocrImportedDraft: "已直接导入盘面草稿；请在盘面上校正。",
    ocrDoneStatus: "本地图片识别完成：{clue} 个提示数，{userDigits} 个出数，{cand} 个候选格。{uniqueText} {draftText}",
    ocrNoImageSelected: "未选择图片",
    ocrInvalidImageFile: "请选择 PNG/JPG/WebP 等图片文件。",
    ocrRecognizingLocal: "正在本地识别图片……首次加载模型可能稍慢。不会上传图片，也不会访问 sudoku-ocr.com。",
    ocrNoCoachJson: "OCR 未返回 Coach JSON",
    ocrFailed: "本地图片识别失败：{message}",
    ocrAttribution: "数独图片识别使用 Alex Kubiesa / Sudoku OCR 训练的本地模型；未使用在线 fallback。",
    ocrPickImage: "选择图片识别",
    ocrCameraImage: "拍照识别",
    ocrClipboardImage: "从剪贴板识别",
    ocrClipboardUnsupported: "当前浏览器不支持按钮读取剪贴板图片。桌面端可复制截图后按 Ctrl+V；手机端请用“选择图片识别”或“拍照识别”。",
    ocrReadingClipboard: "正在读取剪贴板图片……",
    ocrClipboardNoImage: "剪贴板中没有图片。请先截图/复制图片，或使用“选择图片识别”“拍照识别”。",
    ocrClipboardReadFailed: "读取剪贴板图片失败：{message}。桌面端也可以直接按 Ctrl+V 粘贴截图。",
    clipboardReadUnsupported: "当前浏览器不支持读取剪贴板",
    clipboardEmpty: "剪贴板为空",
    inputEmptyClipboardLoaded: "输入区为空，已从剪贴板读取并尝试加载。",
    inputEmptyClipboardFailed: "输入区为空，且无法读取剪贴板：{error}",
    workerTaskFailed: "后台任务失败",
    solveBusy: "自动解题中...",
    findAllBusy: "搜索中...",
    wasmLoaded: "wasm 已加载。",
    exportCopied: "题串已导出并复制到剪贴板。",
    exportToInput: "题串已导出到输入框。",
    rateNoPuzzle: "评分失败：当前没有有效题串。",
    rateFailedSimple: "评分失败。",
    rateInputSuffix: "。输入格式：{format}{mode}",
    rateUseCandidateState: "，使用候选状态，SKFR=rateSukaku",
    rateUsePuzzle: "，SKFR=ratePuzzle",
    applyPreviewNoAfter: "应用预览步骤失败：无法由 before+step 生成 after。",
    applyPreviewImportFailed: "应用预览步骤失败：{error}",
    importFailedGeneric: "无法导入",
    appliedPreviewStep: "已应用当前预览步骤。",
    appliedHint: "已应用当前提示。",
    allStepsCannotSerialize: "所有步骤搜索失败：当前盘面无法序列化为候选盘状态。",
    allStepsFailed: "所有步骤搜索失败：{error}",
    allStepsSourceStep: "，来源步骤 #{step}",
    elapsedMs: "，用时 {elapsed} ms",
    allStepsFound: "当前盘面共找到 {count} 个可用步骤{source}{time}。",
    unknownError: "未知错误",
    undoDone: "已撤销一步。",
    undoNone: "没有可撤销的步骤。",
    redoDone: "已重做一步。",
    redoNone: "没有可重做的步骤。",
    allStepsFilterShowing: "显示 {shown} / {total}",
    allStepsFilterKeyword: "关键词：{query}",
    allStepsFilterTechnique: "技巧：{technique}",
    allStepsFilterConclusionSort: "排序：出数/删数优先",
    allStepsFilterReplaceableOnly: "仅可替换",
    listSeparator: "；",
    solvePathCannotSerialize: "自动解题失败：当前盘面无法序列化为候选盘状态。",
    solveCompleted: "自动解题完成：status={status}，步骤 {steps}，用时 {elapsed} ms。",
    solvePathRenderFailed: "解题路径渲染失败：{error}",
    solveFailed: "自动解题失败：{error}",
    generatingPuzzle: "正在生成题目：{difficulty}...",
    generateFailed: "{difficulty} 生成失败{last}。",
    lastRating: "，最后评分 {rating}",
    generatedPuzzle: "已生成 {difficulty}：{clues} 个已知数，{rating}。",
    noTrainingTechnique: "未指定技巧",
    difficultyTitle: "生成题目时使用参考项目的 ER 难度分档",
    trainingTitle: "生成解题路径中包含指定技巧的题目",
    unrated: "未评分",
    ratingFailed: "评分未通过：{rating}",
    seconds: "{seconds} 秒",
    stoppingBatch: "正在停止批量出题...",
    batchTrainingStart: "批量训练题库开始：目标 {target} 题，技巧 {technique}，难度 {difficulty}。",
    batchStart: "批量出题开始：目标 {target} 题，难度 {difficulty}。",
    batchStoppingPrefix: "正在停止，",
    batchLastPuzzle: "，上一题 {attempts}",
    batchTrainingProgress: "{prefix}批量训练题库中：{generated}/{target}，批次 {attempts}，失败 {failed} 次{last}，已用时 {elapsed}。",
    batchProgress: "{prefix}批量出题中：{generated}/{target}，批次 {attempts}，失败 {failed} 次{last}，已用时 {elapsed}。",
    batchLatest: "{status} 最新 {rating}。",
    batchSearchAttempts: "搜索 {attempts} 次",
    batchGenerateAttempts: "生成 {attempts} 次",
    batchWrittenDirect: "已写入磁盘文件",
    batchDownloadReady: "已生成下载文件",
    batchTrainingDone: "{mode}：{filename}，训练技巧 {technique}，成功 {generated}/{target}，批次 {attempts}，总用时 {elapsed}。",
    batchDone: "{mode}：{filename}，成功 {generated}/{target}，尝试 {attempts} 次，总用时 {elapsed}。",
    batchCancelled: "批量出题已取消。",
    batchFailed: "批量出题失败：{error}",
    batchInvalidStep: "批量出题发现技巧错误，已停止：{detail}",
    invalidStep: "步骤无效",
    trainingNeedTechnique: "请先在“训练”下拉框选择一个技巧。",
    trainingSearching: "正在搜索包含 {technique} 的训练题，已用时 {elapsed}...",
    trainingInvalidSyncFailed: "训练生成发现技巧错误，但失败谜题同步到主引擎失败。",
    trainingInvalidFound: "训练生成中发现技巧错误{detail}{step}",
    trainingStepTextPrefix: "；{step}",
    trainingFailed: "训练题生成失败：{error}{last}。",
    trainingSyncFailed: "训练题已生成，但主引擎同步失败。",
    trainingGenerated: "已生成 {technique} 训练题：尝试 {attempts} 次，{rating}。",
    exportUnavailable: "当前盘面无法导出：没有有效 81 位题面或候选盘状态。",
    whipMemoryLabel: "Whip/gWhip 搜索内存模式：",
    whipMemoryAuto: "自动（普通求解关闭，Whip 评分开启）",
    whipMemoryNormal: "普通（速度优先）",
    whipMemoryLarge: "大内存（覆盖率优先）",
    whipMemoryTitle: "影响 Whip/gWhip 队列上限：普通 Whip 19000、gWhip 50000；大内存 99000。",
    techniqueHeader: "技巧",
    scoreHeader: "评分",
    difficultyLevel: "难度 {level}",
    manualMarksTitle: "手工标记",
    manualMarkModeLabel: "模式",
    manualMarkLineLabel: "链线",
    manualMarkColorLabel: "颜色",
    markAddColor: "添加自定义色",
    markCustomColorTitle: "选择自定义标记颜色",
    markColorAdded: "已添加自定义颜色。",
    markColorSelected: "已选择颜色 {id}。",
    markModeOff: "关闭标记",
    markCellColor: "整格上色",
    markCandidateColor: "候选上色",
    markCircle: "候选画圈",
    markPreElim: "预备删数",
    markElim: "正式删数",
    markChain: "手动画链",
    markBlock: "区块标记",
    markPrimary: "添加",
    markSecondary: "清除",
    markStrong: "强链（实线）",
    markWeak: "弱链（虚线）",
    markConstructionStrong: "构造强链",
    markConstructionWeak: "构造弱链",
    markApplyElims: "应用全部删数",
    markCleanEasy: "清除简单步骤",
    markCleanedEasy: "已清除 {count} 个简单步骤。",
    markAppliedElimsWithClean: "已应用 {count} 个手工删数，并清除 {easy} 个简单步骤。",
    markScreenshotCopied: "已复制截图到剪贴板。",
    markScreenshotDownloaded: "浏览器不支持直接复制图片，已下载截图。",
    markScreenshotFailed: "截图失败：{error}",
    markNoElimsButCleaned: "没有手工删数，已清除 {easy} 个简单步骤。",
    markEasyCleanStopped: "简单步骤清除已停止：{reason}",
    markClearAll: "清空标记",
    markUndoLine: "撤销线",
    markCancelChain: "取消起点",
    markFinishBlock: "完成区块",
    markUndoBlock: "撤销区块",
    markOffStatus: "关闭标记。",
    markCellSelected: "已选 {cell}，请点数字选择候选。",
    markAdded: "已标记 {target}。",
    markRemoved: "已清除 {target} 的标记。",
    markChainStart: "链起点：{target}。请选择终点。",
    markChainAdded: "已添加链线：{from} -> {to}。",
    markBlockAdded: "已加入区块：{target}。",
    markBlockRemoved: "已移除区块标记：{target}。",
    markBlockFinished: "已完成区块标记。",
    markBlockUndone: "已撤销上一个区块标记。",
    markNoBlock: "没有可完成或撤销的区块。",
    markChainCancelled: "已取消链起点。",
    markLineUndone: "已撤销上一条链线。",
    markAllCleared: "已清空手工标记。",
    markAppliedElims: "已应用 {count} 个手工删数。",
    markNoElims: "没有可应用的手工删数。",
    markModeHint: "手机端：点格子后用数字键盘选候选；PC 可直接点候选。",
    workerUnsupported: "当前浏览器不支持后台 Worker",
    trainingWorkerFailed: "训练题生成失败",
    trainingWorkerRuntimeFailed: "训练题 Worker 运行失败",
  },
  en: {
    boardHeading: "Board",
    brandSubtitle: "Mobile-first logic trainer",
    manualLink: "Manual",
    techniqueHelp: "Techniques",
    initialHint: "Waiting for puzzle to load.",
    branch: "Branch",
    controls: "Controls",
    techniques: "Techniques",
    path: "Solution Path",
    allSteps: "Available Steps",
    generate: "Generate",
    generateTraining: "Training puzzle",
    load: "Load",
    undo: "Undo",
    redo: "Redo",
    step: "Hint step",
    solve: "Solve",
    apply: "Apply hint",
    stepExplain: "Explain",
    stepExplainTitle: "Dynamic tutorial: why this step works",
    stepExplainUnavailable: "No explainable step is selected.",
    close: "Close",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    difficulty: "Difficulty",
    training: "Training",
    batchGenerate: "Batch generation",
    count: "Count",
    filename: "Filename",
    startBatch: "Start",
    stop: "Stop",
    batchStatusIdle: "Generate a batch at the current difficulty and write it to a disk file.",
    moreInput: "More: puzzle input, export, and rating",
    exportPuzzle: "Export puzzle",
    ratePuzzle: "Rate puzzle",
    allStepsFilterPlaceholder: "Filter: technique / action / description",
    allTechniques: "All techniques",
    defaultSort: "Default order",
    conclusionSort: "Placements/eliminations first",
    replaceable: "Replaceable",
    clear: "Clear",
    noAllSteps: "No available steps yet.",
    manualAdvancedTitle: "Manual Advanced",
    runManualAdvanced: "Run Manual Advanced",
    clearManualAdvanced: "Clear Manual Advanced",
    manualAdvancedNote: "not from default solver",
    overlayLegend: "Overlay legend",
    onNode: "ON node: green dot",
    offNode: "OFF node: orange dot",
    groupedSector: "GroupedSector: grouped candidate area",
    strongEdge: "Strong edge: solid line",
    weakEdge: "Weak edge: dashed line",
    groupEdge: "Group edge: purple",
    afAux: "AF auxiliary: cover row horizontal; cover column vertical",
    debugCandidate: "Debug candidate: red cross, debug only",
    overlayDebugOnly: "Debug only; not a formal elimination",
    chooseDigit: "Choose digit",
    candidateMode: "Candidates",
    valueMode: "Values",
    inputModeTitle: "Toggle value/candidate mode. Choose a digit first, then tap a cell.",
    currentInput: "Current",
    techniquePresetApplied: "Applied technique preset",
    wasmLoadFailed: "wasm load failed",
    unsupportedFullscreen: "This browser does not support page fullscreen. Try adding it to the home screen/PWA, or use Chrome on Android.",
    fullscreenFailed: "Fullscreen failed",
    optionsUpdated: "Technique settings updated.",
    operationFailed: "Operation failed.",
    fixedCell: "Givens cannot be edited.",
    fixedCandidate: "Candidates on givens cannot be edited.",
    solvedCandidate: "Candidates on solved cells cannot be edited.",
    importClipboardRetry: "The input is not a valid puzzle string; read from the clipboard and tried loading it.",
    loadFailedPrefix: "Load failed: ",
    importUnknownFormat: "Unrecognized puzzle format",
    importedPuzzle: "Imported: {format}{candidates}.",
    importedWithCandidates: ", with candidates",
    ocrDraftCandidateChanged: "OCR candidate draft updated. Continue correcting directly on the board; use the existing export function when you need to save/share.",
    ocrGivenInsufficient: "Not enough givens; uniqueness was not checked.",
    ocrGivenNotUnique: "The puzzle formed by black givens did not pass the uniqueness check.",
    ocrGivenCheckFailed: "Black-given uniqueness check failed.",
    ocrDoneLog: "Local image recognition completed. {attribution}",
    ocrDoneLogNoAttribution: "Local image recognition completed.",
    ocrGivenUniquePassed: "Black givens passed the uniqueness check.",
    ocrGivenUniqueFailed: "Black givens did not pass the uniqueness check: {warning}.",
    ocrManualCorrection: "please correct manually",
    ocrImportedDraft: "Imported directly as an editable board draft; please correct it on the board.",
    ocrDoneStatus: "Local image recognition completed: {clue} givens, {userDigits} solved digits, {cand} candidate cells. {uniqueText} {draftText}",
    ocrNoImageSelected: "No image selected",
    ocrInvalidImageFile: "Please choose a PNG/JPG/WebP image file.",
    ocrRecognizingLocal: "Recognizing the image locally... First model load may be slow. No image is uploaded and sudoku-ocr.com is not used.",
    ocrNoCoachJson: "OCR did not return Coach JSON",
    ocrFailed: "Local image recognition failed: {message}",
    ocrAttribution: "Sudoku image recognition uses a local model trained by Alex Kubiesa / Sudoku OCR; no online fallback is used.",
    ocrPickImage: "Recognize image",
    ocrCameraImage: "Take photo",
    ocrClipboardImage: "Recognize clipboard",
    ocrClipboardUnsupported: "This browser does not support reading clipboard images from a button. On desktop, copy a screenshot and press Ctrl+V; on mobile, use Recognize image or Take photo.",
    ocrReadingClipboard: "Reading clipboard image...",
    ocrClipboardNoImage: "No image found in the clipboard. Copy a screenshot first, or use Recognize image / Take photo.",
    ocrClipboardReadFailed: "Failed to read clipboard image: {message}. On desktop, you can also press Ctrl+V after copying a screenshot.",
    clipboardReadUnsupported: "This browser does not support reading text from the clipboard",
    clipboardEmpty: "Clipboard is empty",
    inputEmptyClipboardLoaded: "Input was empty; read from the clipboard and tried loading it.",
    inputEmptyClipboardFailed: "Input was empty and clipboard read failed: {error}",
    workerTaskFailed: "Background task failed",
    solveBusy: "Solving...",
    findAllBusy: "Searching...",
    wasmLoaded: "wasm loaded.",
    exportCopied: "Puzzle string exported and copied to the clipboard.",
    exportToInput: "Puzzle string exported to the input box.",
    rateNoPuzzle: "Rating failed: no valid puzzle string is available.",
    rateFailedSimple: "Rating failed.",
    rateInputSuffix: ". Input format: {format}{mode}",
    rateUseCandidateState: ", using candidate state, SKFR=rateSukaku",
    rateUsePuzzle: ", SKFR=ratePuzzle",
    applyPreviewNoAfter: "Failed to apply preview step: cannot produce after from before+step.",
    applyPreviewImportFailed: "Failed to apply preview step: {error}",
    importFailedGeneric: "cannot import",
    appliedPreviewStep: "Applied the current preview step.",
    appliedHint: "Applied the current hint.",
    allStepsCannotSerialize: "All-steps search failed: the current board cannot be serialized with candidate state.",
    allStepsFailed: "All-steps search failed: {error}",
    allStepsSourceStep: ", source step #{step}",
    elapsedMs: ", elapsed {elapsed} ms",
    allStepsFound: "Found {count} available steps for the current board{source}{time}.",
    unknownError: "unknown error",
    undoDone: "Undid one step.",
    undoNone: "No step to undo.",
    redoDone: "Redid one step.",
    redoNone: "No step to redo.",
    allStepsFilterShowing: "Showing {shown} / {total}",
    allStepsFilterKeyword: "Keyword: {query}",
    allStepsFilterTechnique: "Technique: {technique}",
    allStepsFilterConclusionSort: "Sort: placements/eliminations first",
    allStepsFilterReplaceableOnly: "Replaceable only",
    listSeparator: "; ",
    solvePathCannotSerialize: "Auto solve failed: the current board cannot be serialized with candidate state.",
    solveCompleted: "Auto solve completed: status={status}, steps {steps}, elapsed {elapsed} ms.",
    solvePathRenderFailed: "Failed to render solve path: {error}",
    solveFailed: "Auto solve failed: {error}",
    generatingPuzzle: "Generating puzzle: {difficulty}...",
    generateFailed: "{difficulty} generation failed{last}.",
    lastRating: ", last rating {rating}",
    generatedPuzzle: "Generated {difficulty}: {clues} givens, {rating}.",
    noTrainingTechnique: "No specific technique",
    difficultyTitle: "Use the reference ER difficulty bands when generating puzzles",
    trainingTitle: "Generate a puzzle whose solve path contains the selected technique",
    unrated: "Unrated",
    ratingFailed: "Rating failed: {rating}",
    seconds: "{seconds}s",
    stoppingBatch: "Stopping batch generation...",
    batchTrainingStart: "Training batch started: target {target}, technique {technique}, difficulty {difficulty}.",
    batchStart: "Batch generation started: target {target}, difficulty {difficulty}.",
    batchStoppingPrefix: "Stopping, ",
    batchLastPuzzle: ", previous puzzle {attempts}",
    batchTrainingProgress: "{prefix}Training batch: {generated}/{target}, batches {attempts}, failures {failed}{last}, elapsed {elapsed}.",
    batchProgress: "{prefix}Batch generation: {generated}/{target}, attempts {attempts}, failures {failed}{last}, elapsed {elapsed}.",
    batchLatest: "{status} Latest {rating}.",
    batchSearchAttempts: "searched {attempts} times",
    batchGenerateAttempts: "generated {attempts} times",
    batchWrittenDirect: "Written to disk file",
    batchDownloadReady: "Download file generated",
    batchTrainingDone: "{mode}: {filename}, technique {technique}, success {generated}/{target}, batches {attempts}, total time {elapsed}.",
    batchDone: "{mode}: {filename}, success {generated}/{target}, attempts {attempts}, total time {elapsed}.",
    batchCancelled: "Batch generation cancelled.",
    batchFailed: "Batch generation failed: {error}",
    batchInvalidStep: "Batch stopped on an invalid step: {detail}",
    invalidStep: "Invalid step",
    trainingNeedTechnique: "Choose a technique in the Training dropdown first.",
    trainingSearching: "Searching for a training puzzle containing {technique}; elapsed {elapsed}...",
    trainingInvalidSyncFailed: "Training generation found an invalid technique, but syncing the failed puzzle to the main engine failed.",
    trainingInvalidFound: "Training generation found an invalid technique{detail}{step}",
    trainingStepTextPrefix: "; {step}",
    trainingFailed: "Training puzzle generation failed: {error}{last}.",
    trainingSyncFailed: "Training puzzle was generated, but syncing it to the main engine failed.",
    trainingGenerated: "Generated {technique} training puzzle: {attempts} attempts, {rating}.",
    exportUnavailable: "Cannot export the current board: no valid 81-char puzzle or candidate state.",
    whipMemoryLabel: "Whip/gWhip search memory mode:",
    whipMemoryAuto: "Auto (off for normal solving, on for Whip rating)",
    whipMemoryNormal: "Normal (speed first)",
    whipMemoryLarge: "Large memory (coverage first)",
    whipMemoryTitle: "Controls Whip/gWhip queue limits: normal Whip 19000, gWhip 50000; large memory 99000.",
    techniqueHeader: "Technique",
    scoreHeader: "Score",
    difficultyLevel: "Difficulty {level}",
    manualMarksTitle: "Manual Marks",
    manualMarkModeLabel: "Mode",
    manualMarkLineLabel: "Line",
    manualMarkColorLabel: "Color",
    markAddColor: "Add custom color",
    markCustomColorTitle: "Choose custom mark color",
    markColorAdded: "Added custom color.",
    markColorSelected: "Selected color {id}.",
    markModeOff: "Marks off",
    markCellColor: "Color cells",
    markCandidateColor: "Color candidates",
    markCircle: "Circle candidates",
    markPreElim: "Pre-eliminations",
    markElim: "Eliminations",
    markChain: "Draw chain",
    markBlock: "Block mark",
    markPrimary: "Add / left click",
    markSecondary: "Erase / right click",
    markStrong: "Strong / solid",
    markWeak: "Weak / dashed",
    markConstructionStrong: "Construction strong",
    markConstructionWeak: "Construction weak",
    markApplyElims: "Apply all eliminations",
    markCleanEasy: "With cleaning easy steps",
    markCleanedEasy: "Cleaned {count} easy steps.",
    markAppliedElimsWithClean: "Applied {count} manual eliminations and cleaned {easy} easy steps.",
    markScreenshotCopied: "Screenshot copied to clipboard.",
    markScreenshotDownloaded: "This browser cannot copy images directly; screenshot downloaded instead.",
    markScreenshotFailed: "Screenshot failed: {error}",
    markNoElimsButCleaned: "No manual eliminations; cleaned {easy} easy steps.",
    markEasyCleanStopped: "Easy-step cleaning stopped: {reason}",
    markClearAll: "Clear marks",
    markUndoLine: "Undo line",
    markCancelChain: "Cancel start",
    markFinishBlock: "Finish block",
    markUndoBlock: "Undo block",
    markOffStatus: "Marks are off.",
    markCellSelected: "Selected {cell}; choose a digit on the keypad.",
    markAdded: "Marked {target}.",
    markRemoved: "Cleared marks on {target}.",
    markChainStart: "Chain start: {target}. Choose the endpoint.",
    markChainAdded: "Added chain line: {from} -> {to}.",
    markBlockAdded: "Added to block: {target}.",
    markBlockRemoved: "Removed block mark on {target}.",
    markBlockFinished: "Finished block mark.",
    markBlockUndone: "Undid the last block mark.",
    markNoBlock: "No block mark to finish or undo.",
    markChainCancelled: "Cancelled chain start.",
    markLineUndone: "Undid the last chain line.",
    markAllCleared: "Cleared all manual marks.",
    markAppliedElims: "Applied {count} manual eliminations.",
    markNoElims: "No manual eliminations to apply.",
    markModeHint: "Touch: tap a cell, then choose a digit on the keypad. PC can click candidates directly.",
    workerUnsupported: "This browser does not support background Workers",
    trainingWorkerFailed: "Training puzzle generation failed",
    trainingWorkerRuntimeFailed: "Training worker failed",
  },
};

function ui(key) {
  return uiText[lang.value]?.[key] ?? uiText.zh[key] ?? key;
}

function uif(key, values = {}) {
  return ui(key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
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
  } catch (_) {}
}

function saveManualCustomColors() {
  try {
    const custom = MANUAL_MARK_COLORS.filter((color) => color.custom).map((color) => ({ bg: color.bg, text: color.text }));
    localStorage.setItem(MANUAL_MARK_CUSTOM_COLORS_KEY, JSON.stringify(custom));
  } catch (_) {}
}

loadManualCustomColors();
const manualMarks = {
  cellColors: new Map(),
  candidateColors: new Map(),
  circles: new Map(),
  preEliminations: new Set(),
  eliminations: new Set(),
  chains: [],
  blocks: [],
};
let manualBlockDraft = null;
let manualMarkButton = "primary";
let manualMarkColorId = "4";
let manualChainStart = null;

function manualMarkModeValue() {
  return manualMarkMode?.value || "off";
}

function manualMarksActive() {
  return manualMarkModeValue() !== "off";
}

function manualMarkNeedsDigit(mode = manualMarkModeValue()) {
  return ["candidateColor", "circle", "preElim", "elim", "chain", "block"].includes(mode);
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
    manualMarksPanel.open = active;
  }
  manualMarkPrimary?.classList.toggle("active", manualMarkButton === "primary");
  manualMarkSecondary?.classList.toggle("active", manualMarkButton === "secondary");
  manualMarkSwatches?.querySelectorAll(".manual-mark-swatch").forEach((button) => {
    button.classList.toggle("active", String(button.dataset.colorId) === String(manualMarkColorId));
  });
  if (manualMarkLineType) manualMarkLineType.disabled = mode !== "chain";
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
  const cellColor = manualMarks.cellColors.get(cellIndex);
  if (cellColor) {
    const color = manualMarkColorById(cellColor.colorId) || currentManualMarkColor();
    cellNode.classList.add("manual-cell-color");
    cellNode.style.setProperty("--manual-cell-bg", color.bg);
  }
  const candidates = cellNode.querySelectorAll(".candidate[data-digit]");
  candidates.forEach((candidate) => {
    const digit = Number(candidate.dataset.digit || 0);
    if (!digit || !candidate.textContent.trim()) return;
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
}

function manualMarkDirectCandidateClickAllowed(candidate, event) {
  const pointerType = candidate?.dataset?.manualPointerType || event?.pointerType || "";
  if (pointerType && pointerType !== "mouse") return false;
  if (window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches) return true;
  return pointerType === "mouse";
}

function attachManualMarkCandidateHandlers(cellNode, cellIndex) {
  cellNode.querySelectorAll(".candidate[data-digit]").forEach((candidate) => {
    candidate.addEventListener("pointerdown", (event) => {
      candidate.dataset.manualPointerType = event.pointerType || "";
    }, { passive: true });
    candidate.addEventListener("click", (event) => {
      if (!manualMarksActive()) return;
      const digit = Number(candidate.dataset.digit || 0);
      if (!digit || !candidate.textContent.trim()) return;
      if (!manualMarkDirectCandidateClickAllowed(candidate, event)) {
        // Touch/pen flow: do not consume the candidate tap. Let the parent cell
        // become selected, then the large numpad chooses the target digit.
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      selectedIndex = cellIndex;
      applyManualMarkTarget(cellIndex, digit, "primary");
    });
    candidate.addEventListener("contextmenu", (event) => {
      if (!manualMarksActive()) return;
      const digit = Number(candidate.dataset.digit || 0);
      if (!digit || !candidate.textContent.trim()) return;
      // Only desktop/fine-pointer right click maps to the secondary action.
      // Touch devices use the explicit Add/Erase button instead.
      if (!manualMarkDirectCandidateClickAllowed(candidate, event)) return;
      event.preventDefault();
      event.stopPropagation();
      selectedIndex = cellIndex;
      applyManualMarkTarget(cellIndex, digit, "secondary");
    });
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
  const cellIndex = Number(cell);
  const digitIndex = Number(digit) - 1;
  const col = cellIndex % 9;
  const row = Math.floor(cellIndex / 9);
  return {
    x: col * 100 + (digitIndex % 3) * (100 / 3) + (100 / 6),
    y: row * 100 + Math.floor(digitIndex / 3) * (100 / 3) + (100 / 6),
  };
}

function manualMarkLineTypeForButton(button = "primary") {
  const selected = manualMarkLineType?.value || "strong";
  if (button !== "secondary") return selected;
  if (selected === "constructionStrong" || selected === "constructionWeak") return "constructionWeak";
  return "weak";
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
  const type = String(edge?.type || "strong");
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

  if (manualChainStart) {
    addManualChainEndpointClass(manualChainStart.cell, manualChainStart.digit, "manual-chain-start");
    addManualChainEndpointClass(manualChainStart.cell, manualChainStart.digit, "manual-chain-pending");
  }

  for (const edge of manualMarks.chains || []) {
    if (!edge?.from || !edge?.to) continue;
    addManualChainEndpointClass(Number(edge.from.cell), Number(edge.from.digit), "manual-chain-start");
    const targetClass = manualChainStrength(edge) === "strong" ? "manual-chain-on" : "manual-chain-off";
    addManualChainEndpointClass(Number(edge.to.cell), Number(edge.to.digit), targetClass);
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

function renderManualMarkOverlay() {
  clearManualMarkOverlay();
  const hasBlocks = manualMarks.blocks.length > 0 || (manualBlockDraft?.nodes?.length > 0);
  if (!boardStage || (manualMarks.chains.length === 0 && !hasBlocks)) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "manualMarkOverlay";
  svg.classList.add("manual-mark-overlay");
  svg.setAttribute("viewBox", "0 0 900 900");
  svg.setAttribute("aria-hidden", "true");

  createOverlayMarkerDefs(svg);
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

function renderManualMarks() {
  clearManualChainEndpointHighlights();
  if (currentSnapshot) {
    board?.querySelectorAll(".sudoku-cell[data-cell-index]").forEach((cellNode) => {
      applyManualMarksToCellElement(cellNode, Number(cellNode.dataset.cellIndex || -1));
    });
    applyManualChainEndpointHighlights();
  }
  renderManualMarkOverlay();
}

function clearManualMarks() {
  manualMarks.cellColors.clear();
  manualMarks.candidateColors.clear();
  manualMarks.circles.clear();
  manualMarks.preEliminations.clear();
  manualMarks.eliminations.clear();
  manualMarks.chains.length = 0;
  manualMarks.blocks.length = 0;
  manualBlockDraft = null;
  manualChainStart = null;
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
    else if (mode === "chain") {
      manualMarks.chains = manualMarks.chains.filter((edge) => !(
        (edge.from.cell === cell && edge.from.digit === digit) ||
        (edge.to.cell === cell && edge.to.digit === digit)
      ));
      if (manualChainStart?.cell === cell && manualChainStart?.digit === digit) manualChainStart = null;
    } else if (mode === "block") {
      removeManualBlockTarget(cell, digit);
    }
  }
}

function applyManualMarkTarget(cell, digit = 0, forcedButton = null) {
  const mode = manualMarkModeValue();
  const button = forcedButton || manualMarkButton;
  if (mode === "off") return false;
  const color = currentManualMarkColor();
  const cellIndex = Number(cell);
  const digitValue = Number(digit || 0);
  if (manualMarkNeedsDigit(mode) && (!digitValue || !boardCandidateExists(cellIndex, digitValue))) {
    selectedIndex = cellIndex;
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(uif("markCellSelected", { cell: manualMarkCellText(cellIndex) }));
    return true;
  }

  if (button === "secondary" && mode !== "chain") {
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
  } else if (mode === "chain") {
    const endpoint = { cell: cellIndex, digit: digitValue };
    if (!manualChainStart) {
      manualChainStart = endpoint;
      renderBoardSnapshot(currentSnapshot, currentHint);
      setManualMarkStatus(uif("markChainStart", { target: manualMarkTargetText(cellIndex, digitValue) }));
      return true;
    }
    if (manualChainStart.cell !== endpoint.cell || manualChainStart.digit !== endpoint.digit) {
      manualMarks.chains.push({
        from: { ...manualChainStart },
        to: { ...endpoint },
        type: manualMarkLineTypeForButton(button),
      });
    }
    const fromText = manualMarkTargetText(manualChainStart.cell, manualChainStart.digit);
    const toText = manualMarkTargetText(endpoint.cell, endpoint.digit);
    manualChainStart = null;
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(uif("markChainAdded", { from: fromText, to: toText }));
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


function appendManualMarkStatus(extra) {
  if (!manualMarkStatus || !extra) return;
  const prefix = manualMarkStatus.textContent ? `${manualMarkStatus.textContent} ` : "";
  manualMarkStatus.textContent = `${prefix}${extra}`;
}


function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas-blob"));
    }, "image/png");
  });
}

function drawCanvasLine(ctx, x1, y1, x2, y2, color, width = 2, dashed = false, arrow = false) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (dashed) ctx.setLineDash([width * 3, width * 2.2]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  if (arrow) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = Math.max(7, width * 3.8);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 7), y2 - size * Math.sin(angle - Math.PI / 7));
    ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 7), y2 - size * Math.sin(angle + Math.PI / 7));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCanvasRoundedRect(ctx, x, y, w, h, radius) {
  const r = Math.max(0, Math.min(radius, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function canvasManualCandidateRect(cell, digit, boardSize) {
  const cellSize = boardSize / 9;
  const candSize = cellSize / 3;
  const row = Math.floor(Number(cell) / 9);
  const col = Number(cell) % 9;
  const d = Number(digit) - 1;
  return {
    x: col * cellSize + (d % 3) * candSize,
    y: row * cellSize + Math.floor(d / 3) * candSize,
    w: candSize,
    h: candSize,
    cx: col * cellSize + (d % 3) * candSize + candSize / 2,
    cy: row * cellSize + Math.floor(d / 3) * candSize + candSize / 2,
  };
}

function canvasShortenedLine(start, end, offset = 0) {
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

function canvasManualBlockPoints(block, boardSize) {
  const points = [];
  const seen = new Set();
  for (const node of block?.nodes || []) {
    const cell = Number(node.cell);
    const digit = Number(node.digit);
    if (!boardCandidateExists(cell, digit)) continue;
    const key = manualMarkKey(cell, digit);
    if (seen.has(key)) continue;
    seen.add(key);
    const r = canvasManualCandidateRect(cell, digit, boardSize);
    points.push({ x: r.cx, y: r.cy, cell, digit });
  }
  return points;
}

function canvasConvexHull(points) {
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

function canvasExpandedPolygon(points, padding) {
  if (!points.length) return [];
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  return points.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / len) * padding, y: p.y + (dy / len) * padding };
  });
}

function drawManualBlocksOnCanvas(ctx, boardSize) {
  const blocks = [...(manualMarks.blocks || [])];
  if (manualBlockDraft?.nodes?.length) blocks.push({ ...manualBlockDraft, draft: true });
  for (const block of blocks) {
    const points = canvasManualBlockPoints(block, boardSize);
    if (!points.length) continue;
    const color = manualBlockColor(block).bg || "#f97316";
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = block.draft ? 0.62 : 0.82;
    ctx.lineWidth = Math.max(2, boardSize / 320);
    ctx.setLineDash(block.draft ? [Math.max(5, boardSize / 120), Math.max(4, boardSize / 160)] : []);
    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, boardSize / 50, 0, Math.PI * 2);
      ctx.stroke();
    } else if (points.length === 2) {
      const line = canvasShortenedLine(points[0], points[1], 0);
      ctx.lineWidth = Math.max(10, boardSize / 38);
      ctx.globalAlpha = block.draft ? 0.18 : 0.24;
      drawCanvasLine(ctx, line.x1, line.y1, line.x2, line.y2, color, ctx.lineWidth, !!block.draft, false);
    } else {
      const poly = canvasExpandedPolygon(canvasConvexHull(points), boardSize / 50);
      if (poly.length >= 3) {
        ctx.beginPath();
        poly.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.closePath();
        ctx.globalAlpha = block.draft ? 0.10 : 0.14;
        ctx.fill();
        ctx.globalAlpha = block.draft ? 0.62 : 0.82;
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function drawManualChainsOnCanvas(ctx, boardSize) {
  for (const edge of manualMarks.chains || []) {
    if (!edge?.from || !edge?.to) continue;
    if (!boardCandidateExists(edge.from.cell, edge.from.digit) || !boardCandidateExists(edge.to.cell, edge.to.digit)) continue;
    const a = canvasManualCandidateRect(edge.from.cell, edge.from.digit, boardSize);
    const b = canvasManualCandidateRect(edge.to.cell, edge.to.digit, boardSize);
    const type = String(edge.type || "strong");
    const construction = type === "constructionStrong" || type === "constructionWeak";
    const weak = type === "weak" || type === "constructionWeak";
    const color = construction ? "#f97316" : "#dc2626";
    const width = Math.max(2.2, boardSize / 230);
    const line = canvasShortenedLine({ x: a.cx, y: a.cy }, { x: b.cx, y: b.cy }, boardSize / 70);
    drawCanvasLine(ctx, line.x1, line.y1, line.x2, line.y2, color, width, weak, true);
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.4, boardSize / 420);
    for (const p of [{ x: a.cx, y: a.cy }, { x: b.cx, y: b.cy }]) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(3.4, boardSize / 115), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawManualCross(ctx, cx, cy, size, pre, elim) {
  if (!pre && !elim) return;
  const drawSlash = (angle, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = Math.max(3, size * 0.18);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(size / 2, 0);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, size * 0.11);
    ctx.beginPath();
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(size / 2, 0);
    ctx.stroke();
    ctx.restore();
  };
  if (pre && elim) {
    drawSlash(Math.PI / 4, "#0f7a3b");
    drawSlash(-Math.PI / 4, "#b42318");
  } else if (pre) {
    drawSlash(Math.PI / 4, "#0f7a3b");
    drawSlash(-Math.PI / 4, "#0f7a3b");
  } else {
    drawSlash(Math.PI / 4, "#b42318");
    drawSlash(-Math.PI / 4, "#b42318");
  }
}

async function captureBoardStagePngBlob() {
  if (!boardStage || !currentSnapshot) throw new Error("board-stage");
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const rect = boardStage.getBoundingClientRect();
  const boardSize = Math.max(1, Math.ceil(Math.min(rect.width || 0, rect.height || 0) || board.clientWidth || 720));
  const scale = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(boardSize * scale);
  canvas.height = Math.round(boardSize * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas-context");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, boardSize, boardSize);

  const cellSize = boardSize / 9;
  const candSize = cellSize / 3;
  const cells = currentSnapshot.cells || [];
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let index = 0; index < 81; index += 1) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const x = col * cellSize;
    const y = row * cellSize;
    const cell = cells[index] || { value: 0, candidates: [] };
    const cellColor = manualMarks.cellColors.get(index);
    ctx.fillStyle = cellColor ? (manualMarkColorById(cellColor.colorId)?.bg || "#fff8a6") : "#ffffff";
    ctx.globalAlpha = cellColor ? 0.46 : 1;
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.globalAlpha = 1;

    if (cell.value > 0) {
      ctx.font = `600 ${Math.max(20, cellSize * 0.62)}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = isGiven(index, cell.value) ? "#0f172a" : "#1d4ed8";
      ctx.fillText(String(cell.value), x + cellSize / 2, y + cellSize / 2 + cellSize * 0.015);
      continue;
    }

    const candidates = Array.isArray(cell.candidates) ? cell.candidates : [];
    ctx.font = `800 ${Math.max(8, candSize * 0.52)}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    for (const digit of candidates) {
      const d = Number(digit);
      if (!d) continue;
      const r = canvasManualCandidateRect(index, d, boardSize);
      const key = manualMarkKey(index, d);
      const candidateColor = manualMarks.candidateColors.get(key);
      const circle = manualMarks.circles.get(key);
      const blockColorId = manualBlockCandidateColorId(index, d);
      const pre = manualMarks.preEliminations.has(key);
      const elim = manualMarks.eliminations.has(key);
      const isPending = manualChainStart?.cell === index && manualChainStart?.digit === d;
      const isChainStart = (manualMarks.chains || []).some((edge) => edge?.from?.cell === index && edge?.from?.digit === d);
      const isChainOn = (manualMarks.chains || []).some((edge) => manualChainStrength(edge) === "strong" && edge?.to?.cell === index && edge?.to?.digit === d);
      const isChainOff = (manualMarks.chains || []).some((edge) => manualChainStrength(edge) === "weak" && edge?.to?.cell === index && edge?.to?.digit === d);

      if (candidateColor) {
        const color = manualMarkColorById(candidateColor.colorId) || currentManualMarkColor();
        ctx.save();
        ctx.fillStyle = color.bg;
        ctx.globalAlpha = 0.72;
        drawCanvasRoundedRect(ctx, r.x + candSize * 0.08, r.y + candSize * 0.08, candSize * 0.84, candSize * 0.84, candSize * 0.42);
        ctx.fill();
        ctx.restore();
      }
      if (isPending || isChainStart || isChainOn || isChainOff) {
        const bg = isPending || isChainStart ? "#ffd64a" : (isChainOn ? "#30d45f" : "#7fc7ff");
        ctx.save();
        ctx.fillStyle = bg;
        ctx.globalAlpha = 0.86;
        ctx.beginPath();
        ctx.arc(r.cx, r.cy, candSize * (isPending ? 0.58 : 0.48), 0, Math.PI * 2);
        ctx.fill();
        if (isPending) {
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = Math.max(1.4, boardSize / 420);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (circle) {
        const color = manualMarkColorById(circle.colorId) || currentManualMarkColor();
        ctx.save();
        ctx.strokeStyle = color.bg;
        ctx.lineWidth = Math.max(1.2, boardSize / 460);
        ctx.beginPath();
        ctx.arc(r.cx, r.cy, candSize * 0.46, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      if (blockColorId) {
        const color = manualMarkColorById(blockColorId) || currentManualMarkColor();
        ctx.save();
        ctx.strokeStyle = color.bg;
        ctx.lineWidth = Math.max(1, boardSize / 520);
        ctx.setLineDash([Math.max(2, boardSize / 280), Math.max(2, boardSize / 320)]);
        ctx.beginPath();
        ctx.arc(r.cx, r.cy, candSize * 0.43, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = candidateColor ? (manualMarkColorById(candidateColor.colorId)?.text || "#111827") : "#64748b";
      if (pre || elim) ctx.fillStyle = "#7a0012";
      ctx.fillText(String(d), r.cx, r.cy + candSize * 0.02);
      drawManualCross(ctx, r.cx, r.cy, candSize * 0.92, pre, elim);
    }
  }

  drawManualBlocksOnCanvas(ctx, boardSize);
  drawManualChainsOnCanvas(ctx, boardSize);

  ctx.save();
  for (let i = 0; i <= 9; i += 1) {
    ctx.beginPath();
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = (i % 3 === 0) ? Math.max(2, boardSize / 320) : Math.max(1, boardSize / 700);
    const p = i * cellSize;
    ctx.moveTo(p, 0);
    ctx.lineTo(p, boardSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(boardSize, p);
    ctx.stroke();
  }
  ctx.restore();

  return await canvasToPngBlob(canvas);
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

async function copyManualBoardScreenshotAfterApply() {
  try {
    const blob = await captureBoardStagePngBlob();
    const filename = `yzf-sudoku-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
    if (window.isSecureContext && navigator.clipboard?.write && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      appendManualMarkStatus(ui("markScreenshotCopied"));
      return true;
    }
    downloadBlob(blob, filename);
    appendManualMarkStatus(ui("markScreenshotDownloaded"));
    return true;
  } catch (error) {
    appendManualMarkStatus(uif("markScreenshotFailed", { error: error?.message || String(error) }));
    return false;
  }
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

  const shouldCaptureScreenshot = applied > 0 || cleaned > 0;
  if (applied > 0 && cleaned > 0) {
    setManualMarkStatus(uif("markAppliedElimsWithClean", { count: applied, easy: cleaned }));
  } else if (applied > 0) {
    setManualMarkStatus(uif("markAppliedElims", { count: applied }));
  } else if (cleaned > 0) {
    setManualMarkStatus(uif("markNoElimsButCleaned", { easy: cleaned }));
  } else {
    setManualMarkStatus(ui("markNoElims"));
  }
  if (shouldCaptureScreenshot) {
    await copyManualBoardScreenshotAfterApply();
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
    updateManualMarkControls();
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(manualMarksActive() ? ui("markModeHint") : ui("markOffStatus"));
  });
  manualMarkLineType?.addEventListener("change", updateManualMarkControls);
  manualMarkPrimary?.addEventListener("click", () => {
    manualMarkButton = "primary";
    updateManualMarkControls();
  });
  manualMarkSecondary?.addEventListener("click", () => {
    manualMarkButton = "secondary";
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
  manualMarkClear?.addEventListener("click", clearManualMarks);
  manualMarkUndoLine?.addEventListener("click", () => {
    manualMarks.chains.pop();
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(ui("markLineUndone"));
  });
  manualMarkCancelChain?.addEventListener("click", () => {
    manualChainStart = null;
    renderBoardSnapshot(currentSnapshot, currentHint);
    setManualMarkStatus(ui("markChainCancelled"));
  });
  manualMarkFinishBlock?.addEventListener("click", finishManualBlockDraft);
  manualMarkUndoBlock?.addEventListener("click", undoManualBlock);
  board?.addEventListener("contextmenu", (event) => {
    if (manualMarksActive()) event.preventDefault();
  });
  window.addEventListener("resize", () => {
    if (manualMarks.chains.length > 0) window.requestAnimationFrame(renderManualMarkOverlay);
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

function setInputLabelByControl(controlId, value) {
  const control = document.getElementById(controlId);
  const label = control?.closest("label");
  const span = label?.querySelector("span");
  if (span) span.textContent = value;
}

function applyStaticLanguage() {
  document.documentElement.lang = lang.value === "en" ? "en" : "zh-CN";
  const linkLangSuffix = `?lang=${encodeURIComponent(lang.value || "zh")}`;
  const manualLinkEl = document.getElementById("manualLink");
  if (manualLinkEl) manualLinkEl.href = `./user_manual.html${linkLangSuffix}`;
  const techniquesLinkEl = document.getElementById("techniquesLink");
  if (techniquesLinkEl) techniquesLinkEl.href = `./techniques.html${linkLangSuffix}`;
  setTextById("brandSubtitle", ui("brandSubtitle"));
  setTextById("manualLink", ui("manualLink"));
  setTextById("techniquesLink", ui("techniqueHelp"));
  setTextById("boardHeading", ui("boardHeading"));
  if (hintPanel && hintPanel.textContent === (lang.value === "en" ? uiText.zh.initialHint : uiText.en.initialHint)) {
    hintPanel.textContent = ui("initialHint");
  }
  if (hintPanel && !currentHint && !currentSnapshot && !lastSolveData) {
    hintPanel.textContent = ui("initialHint");
  }
  setTextById("yzfBranchLabelText", ui("branch"));
  setButtonText(btnGenerate, ui("generate"));
  setButtonText(btnGenerateTraining, ui("generateTraining"));
  setButtonText(btnLoad, ui("load"));
  setButtonText(btnUndo, ui("undo"));
  setButtonText(btnRedo, ui("redo"));
  setButtonText(btnStep, ui("step"));
  setButtonText(btnAllSteps, ui("allSteps"));
  setButtonText(btnSolve, ui("solve"));
  setButtonText(btnApply, ui("apply"));
  setButtonText(btnStepExplain, ui("stepExplain"));
  setTextById("stepExplainDialogTitle", ui("stepExplainTitle"));
  setTextById("stepExplainDialogClose", ui("close"));
  updateStepExplainButtonState();
  updateFullscreenButton();
  setTextById("tabBtnControls", ui("controls"));
  setTextById("tabBtnTechniques", ui("techniques"));
  setTextById("tabBtnPath", ui("path"));
  setTextById("tabBtnAllSteps", ui("allSteps"));
  setTextById("manualAdvancedTitle", ui("manualAdvancedTitle"));
  setTextById("btnManualAdvancedRun", ui("runManualAdvanced"));
  setTextById("btnManualAdvancedClear", ui("clearManualAdvanced"));
  const manualNote = document.querySelector(".manual-advanced-note");
  if (manualNote) manualNote.textContent = ui("manualAdvancedNote");
  setInputLabelByControl("difficultySelect", ui("difficulty"));
  setInputLabelByControl("trainingTechniqueSelect", ui("training"));
  if (difficultySelect) difficultySelect.title = ui("difficultyTitle");
  if (trainingTechniqueSelect) trainingTechniqueSelect.title = ui("trainingTitle");
  const batchSummary = document.querySelector(".input-panel.batch-panel summary") || [...document.querySelectorAll(".input-panel summary")].find((el) => /批量|Batch/i.test(el.textContent));
  if (batchSummary) batchSummary.textContent = ui("batchGenerate");
  setInputLabelByControl("batchCount", ui("count"));
  setInputLabelByControl("batchFilename", ui("filename"));
  setTextById("btnBatchGenerate", ui("startBatch"));
  setTextById("btnBatchStop", ui("stop"));
  if (batchStatus && (batchStatus.textContent === uiText.zh.batchStatusIdle || batchStatus.textContent === uiText.en.batchStatusIdle)) {
    batchStatus.textContent = ui("batchStatusIdle");
  }
  const moreSummary = [...document.querySelectorAll(".input-panel summary")].find((el) => /更多|More/i.test(el.textContent));
  if (moreSummary) moreSummary.textContent = ui("moreInput");
  setTextById("btnExportPuzzle", ui("exportPuzzle"));
  setTextById("btnClearSavedSession", ui("clearSavedSession"));
  setTextById("btnRate", ui("ratePuzzle"));
  setTextById("btnImageOcrPickText", ui("ocrPickImage"));
  setTextById("btnImageOcrCameraText", ui("ocrCameraImage"));
  setTextById("btnImageOcrClipboard", ui("ocrClipboardImage"));
  if (allStepsFilterText) {
    allStepsFilterText.placeholder = ui("allStepsFilterPlaceholder");
    allStepsFilterText.setAttribute("aria-label", ui("allStepsFilterPlaceholder"));
  }
  if (allStepsFilterTechnique?.options?.[0]) allStepsFilterTechnique.options[0].textContent = ui("allTechniques");
  if (allStepsSortMode?.options?.[0]) allStepsSortMode.options[0].textContent = ui("defaultSort");
  if (allStepsSortMode?.options?.[1]) allStepsSortMode.options[1].textContent = ui("conclusionSort");
  const replaceableLabel = allStepsFilterReplaceable?.closest("label");
  if (replaceableLabel) {
    const input = allStepsFilterReplaceable;
    replaceableLabel.replaceChildren(input, document.createTextNode(` ${ui("replaceable")}`));
  }
  setTextById("allStepsFilterClear", ui("clear"));
  if (allStepsFilterStatus && (allStepsFilterStatus.textContent === uiText.zh.noAllSteps || allStepsFilterStatus.textContent === uiText.en.noAllSteps)) {
    allStepsFilterStatus.textContent = ui("noAllSteps");
  }
  setTextById("yzfOverlayModeNote", ui("overlayDebugOnly"));
  const legendSummary = document.querySelector(".yzf-debug-legend summary");
  if (legendSummary) legendSummary.textContent = ui("overlayLegend");
  const legendItems = [...document.querySelectorAll(".yzf-debug-legend .yzf-legend-item span:last-child")];
  ["onNode", "offNode", "groupedSector", "strongEdge", "weakEdge", "groupEdge", "afAux", "debugCandidate"].forEach((key, idx) => {
    if (legendItems[idx]) legendItems[idx].textContent = ui(key);
  });

  setTextById("manualMarksTitle", ui("manualMarksTitle"));
  setTextById("manualMarkModeLabel", ui("manualMarkModeLabel"));
  setTextById("manualMarkLineLabel", ui("manualMarkLineLabel"));
  setTextById("manualMarkColorLabel", ui("manualMarkColorLabel"));
  setTextById("manualMarkAddColorText", ui("markAddColor"));
  if (manualMarkCustomColor) manualMarkCustomColor.title = ui("markCustomColorTitle");
  if (manualMarkMode) {
    const modeLabels = {
      off: "markModeOff",
      cellColor: "markCellColor",
      candidateColor: "markCandidateColor",
      circle: "markCircle",
      preElim: "markPreElim",
      elim: "markElim",
      chain: "markChain",
      block: "markBlock",
    };
    [...manualMarkMode.options].forEach((option) => {
      const key = modeLabels[option.value];
      if (key) option.textContent = ui(key);
    });
  }
  if (manualMarkLineType) {
    const lineLabels = {
      strong: "markStrong",
      weak: "markWeak",
      constructionStrong: "markConstructionStrong",
      constructionWeak: "markConstructionWeak",
    };
    [...manualMarkLineType.options].forEach((option) => {
      const key = lineLabels[option.value];
      if (key) option.textContent = ui(key);
    });
  }
  setTextById("manualMarkPrimary", ui("markPrimary"));
  setTextById("manualMarkSecondary", ui("markSecondary"));
  setTextById("manualMarkApplyElims", ui("markApplyElims"));
  setTextById("manualMarkCleanEasyLabel", ui("markCleanEasy"));
  setTextById("manualMarkClear", ui("markClearAll"));
  setTextById("manualMarkUndoLine", ui("markUndoLine"));
  setTextById("manualMarkCancelChain", ui("markCancelChain"));
  setTextById("manualMarkFinishBlock", ui("markFinishBlock"));
  setTextById("manualMarkUndoBlock", ui("markUndoBlock"));
  if (manualMarkStatus && (manualMarkStatus.textContent === uiText.zh.markOffStatus || manualMarkStatus.textContent === uiText.en.markOffStatus || manualMarkStatus.textContent === "关闭标记。")) {
    manualMarkStatus.textContent = manualMarksActive() ? ui("markModeHint") : ui("markOffStatus");
  }
  buildManualMarkSwatches();
  updateManualMarkControls();
  renderTrainingTechniqueOptionsOnly();
  updateInputControls();
}

function text(key) {
  return i18n[lang.value][key];
}

function techniqueName(step) {
  return i18n[lang.value].technique[step.kind] || step.title || step.kind;
}

function stepDisplayName(step) {
  const base = techniqueName(step);
  const rank = Number(step?.rank || 0);
  if (rank > 0 && /^(Whip|GWhip|Braid|GBraid)$/i.test(String(step?.kind || "")) && !/\[\d+\]/.test(base)) {
    return `${base}[${rank}]`;
  }
  return base;
}

function categoryName(category) {
  return i18n[lang.value].category?.[category] || category || "Other";
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

function log(text) {
  out.classList.remove("hidden");
  out.textContent = text;
}

function setStatus(message) {
  hintPanel.textContent = message;
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
  return difficultySelect.options[difficultySelect.selectedIndex]?.textContent || "Random";
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


function isOcrDraftSnapshot(snapshot = currentSnapshot) {
  return Boolean(snapshot?.ocrDraft || snapshot?.source === "local-image-ocr-draft");
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

function candidatesFromMask(mask) {
  const result = [];
  for (let digit = 1; digit <= 9; digit += 1) {
    if ((mask & (1 << digit)) !== 0) result.push(digit);
  }
  return result;
}

function snapshotToCoachJson(snapshot = currentSnapshot, options = {}) {
  const boardText = snapshotBoardString(snapshot);
  if (boardText.length !== 81 || !Array.isArray(snapshot?.cells)) return null;
  const editableDraft = options.editableDraft ?? isOcrDraftSnapshot(snapshot);
  const givenSource = editableDraft
    ? normalizeCoachDigitString(snapshot?.ocrGivenDigits || snapshot?.givens || "")
    : snapshotGivensString(snapshot);
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

function makeOcrDraftSnapshot(coachJson, summary = {}) {
  const givenDigits = normalizeCoachDigitString(coachJson?.givenDigits || "");
  const userDigits = normalizeCoachDigitString(coachJson?.userDigits || "");
  const candidateMasks = parseCoachCandidateMasks(coachJson?.userCellCandidates || "");
  const boardChars = [];
  const cells = [];
  for (let index = 0; index < 81; index += 1) {
    const givenCh = givenDigits[index] || ".";
    const userCh = userDigits[index] || ".";
    const isGiven = givenCh >= "1" && givenCh <= "9";
    const valueCh = isGiven ? givenCh : userCh;
    const value = valueCh >= "1" && valueCh <= "9" ? Number(valueCh) : 0;
    boardChars.push(value > 0 ? String(value) : ".");
    cells.push({
      index,
      row: Math.floor(index / 9),
      col: index % 9,
      value,
      given: isGiven,
      count: value > 0 ? 0 : candidatesFromMask(candidateMasks[index]).length,
      candidates: value > 0 ? [] : candidatesFromMask(candidateMasks[index]),
    });
  }
  return {
    board: boardChars.join(""),
    givens: givenDigits,
    ocrGivenDigits: givenDigits,
    cells,
    version: 0,
    revision: 0,
    stateHash: "",
    ocrDraft: true,
    source: "local-image-ocr-draft",
    ocrSummary: {
      clueCount: Number(summary?.clueCount || [...givenDigits].filter((ch) => ch >= "1" && ch <= "9").length),
      userDigitCount: Number(summary?.userDigitCount || [...userDigits].filter((ch) => ch >= "1" && ch <= "9").length),
      candidateCells: Number(summary?.candidateCells || candidateMasks.filter((mask) => mask !== 0).length),
      givensUnique: summary?.givensUnique === true,
      givensUniqueWarning: summary?.givensUniqueWarning || "",
    },
  };
}

function updateOcrDraftInputFromSnapshot(snapshot = currentSnapshot) {
  if (!isOcrDraftSnapshot(snapshot)) return;
  // OCR 的 Coach JSON 是内部中间格式，不再写入用户可见的题串输入框。
  // 用户校正都在盘面上完成；需要导出时继续使用现有“导出题串”。
  lastOcrDraftCoachJson = snapshotToCoachJson(snapshot, { editableDraft: true });
}

function toggleOcrDraftValue(index, digit) {
  const snapshot = cloneSnapshot(currentSnapshot);
  if (!snapshot) return false;
  snapshot.ocrDraft = true;
  snapshot.source = "local-image-ocr-draft";
  const boardChars = [...snapshotBoardString(snapshot)];
  const cell = snapshot.cells[index];
  if (!cell) return false;
  const currentValue = Number(cell.value || 0);
  const nextValue = currentValue === digit ? 0 : digit;
  boardChars[index] = nextValue > 0 ? String(nextValue) : ".";
  cell.value = nextValue;
  cell.given = Boolean(cell.given && nextValue > 0);
  if (snapshot.ocrGivenDigits) {
    const givenChars = [...normalizeCoachDigitString(snapshot.ocrGivenDigits)];
    givenChars[index] = cell.given && nextValue > 0 ? String(nextValue) : ".";
    snapshot.ocrGivenDigits = givenChars.join("");
    snapshot.givens = snapshot.ocrGivenDigits;
  }
  cell.candidates = [];
  if (nextValue > 0) {
    const removedMask = 1 << nextValue;
    for (const peer of peerIndexes(index)) {
      const peerCell = snapshot.cells[peer];
      if (!peerCell || peerCell.value > 0) continue;
      peerCell.candidates = (peerCell.candidates || []).filter((candidate) => (removedMask & (1 << candidate)) === 0);
    }
  }
  snapshot.board = boardChars.join("");
  normalizeSnapshotCells(snapshot);
  currentSnapshot = snapshot;
  updateOcrDraftInputFromSnapshot(snapshot);
  renderBoardSnapshot(snapshot, null);
  updateInputControls();
  setStatus(ui("ocrDraftCandidateChanged"));
  scheduleAppSessionSave();
  return true;
}

function toggleOcrDraftCandidate(index, digit) {
  const snapshot = cloneSnapshot(currentSnapshot);
  if (!snapshot) return false;
  snapshot.ocrDraft = true;
  snapshot.source = "local-image-ocr-draft";
  const cell = snapshot.cells[index];
  if (!cell || cell.value > 0) return false;
  const set = new Set(cell.candidates || []);
  if (set.has(digit)) set.delete(digit);
  else set.add(digit);
  cell.candidates = [...set].filter((value) => value >= 1 && value <= 9).sort((a, b) => a - b);
  cell.count = cell.candidates.length;
  normalizeSnapshotCells(snapshot);
  currentSnapshot = snapshot;
  updateOcrDraftInputFromSnapshot(snapshot);
  renderBoardSnapshot(snapshot, null);
  updateInputControls();
  setStatus(ui("ocrDraftCandidateChanged"));
  scheduleAppSessionSave();
  return true;
}

function evaluateOcrGivenDigitsUniqueness(givenDigits) {
  const text = normalizeCoachDigitString(givenDigits || "");
  const clueCount = [...text].filter((ch) => ch >= "1" && ch <= "9").length;
  if (!engine || clueCount === 0) {
    return { unique: false, warning: ui("ocrGivenInsufficient") };
  }
  try {
    const result = parseJson(engine.import_puzzle_json(text));
    if (result?.ok) {
      return { unique: true, warning: "" };
    }
    return { unique: false, warning: result?.error || ui("ocrGivenNotUnique") };
  } catch (error) {
    return { unique: false, warning: error?.message || ui("ocrGivenCheckFailed") };
  }
}

async function importPuzzleFromOcrResult(coachJson, summary = {}) {
  const givenCheck = evaluateOcrGivenDigitsUniqueness(coachJson?.givenDigits || "");
  const snapshot = makeOcrDraftSnapshot(coachJson, {
    ...summary,
    givensUnique: givenCheck.unique,
    givensUniqueWarning: givenCheck.warning,
  });
  currentSnapshot = snapshot;
  originalBoard = snapshot.givens;
  currentHint = null;
  lastSolveData = null;
  lastAllStepsData = null;
  previewSnapshotActive = false;
  currentPreviewRecord = null;
  selectedIndex = -1;
  tree.replaceChildren();
  allStepsTree?.replaceChildren();
  updateOcrDraftInputFromSnapshot(snapshot);
  renderBoardSnapshot(snapshot, null);
  updateInputControls();
  const clue = Number(snapshot.ocrSummary?.clueCount || 0);
  const userDigits = Number(snapshot.ocrSummary?.userDigitCount || 0);
  const cand = Number(snapshot.ocrSummary?.candidateCells || 0);
  const result = {
    ok: true,
    draft: true,
    format: "coach-json-ocr-draft",
    source: "local-image-ocr",
    state: snapshot,
    clueCount: clue,
    userDigitCount: userDigits,
    candidateCells: cand,
    givensUnique: snapshot.ocrSummary?.givensUnique === true,
    warning: snapshot.ocrSummary?.givensUniqueWarning || "",
  };
  const attribution = await localSudokuOcrAttributionSafe();
  if (attribution) {
    log(uif("ocrDoneLog", { attribution }));
  } else {
    log(ui("ocrDoneLogNoAttribution"));
  }
  const uniqueText = snapshot.ocrSummary?.givensUnique
    ? ui("ocrGivenUniquePassed")
    : uif("ocrGivenUniqueFailed", { warning: snapshot.ocrSummary?.givensUniqueWarning || ui("ocrManualCorrection") });
  setStatus(uif("ocrDoneStatus", { clue, userDigits, cand, uniqueText, draftText: ui("ocrImportedDraft") }));
  return result;
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

function currentSessionLibraryString() {
  if (!engine || appSessionRestoring || previewSnapshotActive) return "";
  return exportedPuzzleString();
}

function currentSessionTechniqueConfig() {
  if (!engine) return null;
  try {
    return getTechniqueConfigPayload(techniqueState.length ? techniqueState : loadTechniqueState());
  } catch (_) {
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
  if (appSessionRestoring) return;
  try {
    const payload = buildAppSessionPayload();
    if (!payload) return;
    localStorage.setItem(APP_SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to save YZF session", error);
  }
}

function scheduleAppSessionSave() {
  if (appSessionRestoring) return;
  if (appSessionSaveTimer) window.clearTimeout(appSessionSaveTimer);
  appSessionSaveTimer = window.setTimeout(() => {
    appSessionSaveTimer = 0;
    saveAppSessionNow();
  }, 350);
}

async function restoreAppSession() {
  if (!engine) return false;
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
    if (payload.libraryString) {
      givens.value = payload.libraryString;
      const restored = await importPuzzleFromCurrentInput({ clipboardFallback: false, sessionRestore: true });
      if (!restored?.ok) {
        throw new Error(restored?.error || ui("importUnknownFormat"));
      }
    }
    renderTechniques();
    setStatus(ui("sessionRestored"));
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(uif("sessionRestoreFailed", { message }));
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

function inferManualAdvancedStoredFormat(result, sourceText = "") {
  if (result?.hasCandidates || result?.format === "library" || result?.format === "coach") {
    return "library";
  }
  const trimmed = String(sourceText || "").trim();
  if (/^[0-9.]{81}$/.test(trimmed)) {
    return "puzzle81";
  }
  if (trimmed.includes(":")) {
    return "library";
  }
  return "unknown";
}

function setManualAdvancedInputState(text, format = "unknown", usesCandidates = false) {
  currentManualAdvancedInputString = typeof text === "string" ? text.trim() : "";
  currentManualAdvancedInputFormat = format || "unknown";
  currentManualAdvancedUsesCandidates = !!usesCandidates;
  currentManualAdvancedInputBoardKey = "";
  if (manualAdvancedInputFormatSelect) {
    if (currentManualAdvancedInputFormat === "library" || currentManualAdvancedInputFormat === "snapshotCandidates") {
      manualAdvancedInputFormatSelect.value = "library";
    } else if (currentManualAdvancedInputFormat === "puzzle81") {
      manualAdvancedInputFormatSelect.value = "auto";
    }
  }
}

function getSnapshotManualAdvancedBoardKey(snapshot = currentSnapshot) {
  const boardText = snapshotBoardString(snapshot);
  if (boardText.length !== 81) return "";
  const snapshotLibrary = snapshotToLibraryString(snapshot)?.trim() || "";
  if (snapshotLibrary.includes(":")) {
    return `library:${snapshotLibrary}`;
  }
  return `puzzle81:${boardText}`;
}

function setManualAdvancedInputStateWithBoardKey(text, format = "unknown", usesCandidates = false, boardKey = "") {
  setManualAdvancedInputState(text, format, usesCandidates);
  currentManualAdvancedInputBoardKey = boardKey || "";
}

function syncManualAdvancedInputStateFromSnapshot(snapshot = currentSnapshot) {
  const liveSnapshot = snapshot || getCurrentSnapshot();
  const boardText = snapshotBoardString(liveSnapshot);
  if (boardText.length !== 81) {
    setManualAdvancedInputStateWithBoardKey("", "unknown", false, "");
    return false;
  }
  const snapshotLibrary = snapshotToLibraryString(liveSnapshot)?.trim() || "";
  const boardChanged = !snapshotMatchesOriginal(liveSnapshot) || previewSnapshotActive;
  if (snapshotLibrary.includes(":") && (boardChanged || currentManualAdvancedUsesCandidates || currentManualAdvancedInputFormat === "library" || currentManualAdvancedInputFormat === "snapshotCandidates")) {
    setManualAdvancedInputStateWithBoardKey(
      snapshotLibrary,
      "snapshotCandidates",
      true,
      `library:${snapshotLibrary}`
    );
    return true;
  }
  setManualAdvancedInputStateWithBoardKey(boardText, "puzzle81", false, `puzzle81:${boardText}`);
  return true;
}

function getManualAdvancedInputPreview(text) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (!value) return "-";
  return value.length > 48 ? `${value.slice(0, 48)}...` : value;
}

function getCurrentManualAdvancedInputInfo() {
  const liveSnapshot = currentSnapshot || getCurrentSnapshot();
  const liveBoardKey = getSnapshotManualAdvancedBoardKey(liveSnapshot);
  const storedIsCurrent = !!currentManualAdvancedInputBoardKey && currentManualAdvancedInputBoardKey === liveBoardKey;
  if (currentManualAdvancedInputString && currentManualAdvancedInputFormat === "library" && currentManualAdvancedUsesCandidates) {
    if (!storedIsCurrent) {
      currentManualAdvancedInputString = "";
      currentManualAdvancedInputFormat = "unknown";
      currentManualAdvancedUsesCandidates = false;
      currentManualAdvancedInputBoardKey = "";
    } else {
      return {
        ok: true,
        input: currentManualAdvancedInputString,
        inputFormat: "library",
        inputSource: "importedLibrary",
        inputPreview: getManualAdvancedInputPreview(currentManualAdvancedInputString),
        usesCandidates: true,
      };
    }
  }
  if (liveSnapshot) {
    const boardText = snapshotBoardString(liveSnapshot);
    if (boardText.length === 81) {
      const snapshotLibrary = snapshotToLibraryString(liveSnapshot)?.trim() || "";
      const exportedAsLibrary = typeof snapshotLibrary === "string" && snapshotLibrary.includes(":");
      if (exportedAsLibrary && (currentManualAdvancedUsesCandidates || currentManualAdvancedInputFormat === "library" || currentManualAdvancedInputFormat === "snapshotCandidates" || !snapshotMatchesOriginal(liveSnapshot) || previewSnapshotActive)) {
        return {
          ok: true,
          input: snapshotLibrary,
          inputFormat: currentManualAdvancedInputFormat === "library" && storedIsCurrent ? "library" : "snapshotCandidates",
          inputSource: currentManualAdvancedInputFormat === "library" && storedIsCurrent ? "importedLibrary" : "currentSnapshotLibrary",
          inputPreview: getManualAdvancedInputPreview(snapshotLibrary),
          usesCandidates: true,
        };
      }
      if (snapshotMatchesOriginal(liveSnapshot) && !previewSnapshotActive) {
        return {
          ok: true,
          input: boardText,
          inputFormat: "puzzle81",
          inputSource: "currentBoardPuzzle81",
          inputPreview: getManualAdvancedInputPreview(boardText),
          usesCandidates: false,
        };
      }
      if (exportedAsLibrary) {
        return {
          ok: true,
          input: snapshotLibrary,
          inputFormat: "snapshotCandidates",
          inputSource: "currentSnapshotLibrary",
          inputPreview: getManualAdvancedInputPreview(snapshotLibrary),
          usesCandidates: true,
        };
      }
      return {
        ok: true,
        input: boardText,
        inputFormat: "puzzle81",
        inputSource: "currentBoardPuzzle81",
        inputPreview: getManualAdvancedInputPreview(boardText),
        usesCandidates: false,
      };
    }
  }
  if (currentManualAdvancedInputString && currentManualAdvancedInputFormat === "puzzle81" && /^[0-9.]{81}$/.test(currentManualAdvancedInputString)) {
    return {
      ok: true,
      input: currentManualAdvancedInputString,
      inputFormat: currentManualAdvancedInputFormat,
      inputSource: "storedImportedInput",
      inputPreview: getManualAdvancedInputPreview(currentManualAdvancedInputString),
      usesCandidates: currentManualAdvancedUsesCandidates,
    };
  }
  const rawPuzzle = String(givens.value || "").trim();
  if (/^[0-9.]{81}$/.test(rawPuzzle)) {
    return {
      ok: true,
      input: rawPuzzle,
      inputFormat: "puzzle81",
      inputSource: "currentBoardPuzzle81",
      inputPreview: getManualAdvancedInputPreview(rawPuzzle),
      usesCandidates: false,
    };
  }
  return { ok: false, error: "当前盘面无法导出为手动高级技巧输入。" };
}

function syncEngineToCurrentSnapshot() {
  if (!engine || !currentSnapshot || (snapshotMatchesOriginal() && !previewSnapshotActive)) {
    return true;
  }
  const text = snapshotToLibraryString();
  const result = parseJson(engine.import_puzzle_json(text));
  if (!result?.ok) {
    setStatus(`当前盘面状态同步失败：${result?.error || "无法导入"}`);
    return false;
  }
  givens.value = text;
  originalBoard = result.state?.givens || result.givens || result.puzzle || snapshotGivensString();
  currentSnapshot = result.state || currentSnapshot;
  previewSnapshotActive = false;
  currentPreviewRecord = null;
  syncManualAdvancedInputStateFromSnapshot(currentSnapshot);
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
      throw new Error(`Coach 编码包含非法字符：${ch}`);
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
  throw new Error("当前环境不支持 Coach 题串解压");
}

async function preprocessImportText(text) {
  const raw = (text || "").trim();
  if (!raw.startsWith("SCv7_32_")) {
    return raw;
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

function boxPositionIndex(box, position) {
  const boxBaseRow = Math.floor((box - 1) / 3) * 3;
  const boxBaseCol = ((box - 1) % 3) * 3;
  const offset = position - 1;
  return cellIndex(boxBaseRow + Math.floor(offset / 3), boxBaseCol + (offset % 3));
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

function setOptionalTextBlock(element, value) {
  if (!element) return;
  const visible = Boolean(value);
  element.textContent = value || "";
  element.classList.toggle("hidden", !visible);
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

  const normalizedCells = [...new Set(alsCells)].filter(Number.isInteger).sort((a, b) => a - b);
  const normalizedDigits = [...digits].filter((digit) => digit >= 1 && digit <= 9).sort((a, b) => a - b);

  return {
    key: makeAlsMetaKey(normalizedCells, normalizedDigits, fallbackKey),
    fallbackKey,
    cells: normalizedCells,
    digits: normalizedDigits,
    houseKeys: alsHouseKeysForCells(normalizedCells),
  };
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

  const alsCells = parseSudokuCellsDisplay(match[4]);
  const normalizedCells = [...new Set(alsCells)].filter(Number.isInteger).sort((a, b) => a - b);
  const normalizedDigits = [...digits].filter((digit) => digit >= 1 && digit <= 9).sort((a, b) => a - b);
  if (normalizedCells.length === 0 || normalizedDigits.length === 0) return null;

  const fallbackKey = match[4] || label;
  return {
    key: makeAlsMetaKey(normalizedCells, normalizedDigits, fallbackKey),
    fallbackKey,
    cells: normalizedCells,
    digits: normalizedDigits,
    houseKeys: alsHouseKeysForCells(normalizedCells),
  };
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
  const rolePart = parts.find((part) => String(part || "").startsWith("role="));
  return {
    strength: strengthRaw === "weak" ? "weak" : "strong",
    reason: reasonRaw || "unknown",
    transition: transitionRaw || "",
    alsLabel: alsLabelPart ? alsLabelPart.slice("alsLabel=".length) : "",
    afLabel: afLabelPart ? afLabelPart.slice("afLabel=".length) : "",
    urLabel: urLabelPart ? urLabelPart.slice("urLabel=".length) : "",
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
    rank: Number.isInteger(sampleJson.rank) ? sampleJson.rank : 0,
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

function getCellRectLogical(cell) {
  const row = Math.floor(cell / 9);
  const col = cell % 9;
  return {
    cell,
    row,
    col,
    x: col * 100,
    y: row * 100,
    width: 100,
    height: 100,
    cx: col * 100 + 50,
    cy: row * 100 + 50,
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
  const innerInset = 3;
  const innerSize = 100 - innerInset * 2;
  return {
    x: rect.x + innerInset + candidateCol * (innerSize / 3) + (innerSize / 6),
    y: rect.y + innerInset + candidateRow * (innerSize / 3) + (innerSize / 6),
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
  return 100 / 3;
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
  const forceUsesBackendCandidateColors = forceRender && usesBackendCandidateColors;
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

function renderOverlayBanner(layer) {
  // Keep the debug-only notice in the side control panel/status area
  // so the SVG overlay does not cover cells or candidate digits.
}

function clearRenderedChainOverlay() {
  clearBoardChainHighlights();
  yzfUnderlay?.replaceChildren();
  yzfOverlay?.replaceChildren();
  yzfBranchControls?.classList.add("hidden");
}

function renderChainOverlay(sampleJson) {
  if (!yzfOverlay || !yzfUnderlay) return;
  yzfUnderlay.replaceChildren();
  yzfOverlay.replaceChildren();
  const overlaySample = normalizeYzfOverlaySample(sampleJson);
  yzfDebugSampleData = overlaySample;
  updateYzfBranchControls(overlaySample);
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
  hintPanel.textContent = overlaySample.isManualPromotedStepResult
    ? "YZF typ=4 promoted manual StepResult sample loaded. not from default solver"
    : "YZF typ=4 debug sample loaded.";
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
    hintPanel.textContent = "YZF typ=4 debug overlay cleared.";
  });

  yzfDebugControlsInitialized = true;
}

yzfBranchSelect?.addEventListener("change", () => {
  yzfSelectedBranchMode = yzfBranchSelect.value || "all";
  if (yzfDebugSampleData) {
    renderChainOverlay(yzfDebugSampleData);
  }
});

if (APP_DEBUG_MODE) {
  window.initYzfTyp4DebugOverlayControls = initYzfTyp4DebugOverlayControls;
  window.loadYzfTyp4DebugSample = loadYzfTyp4DebugSample;
  window.clearYzfTyp4Overlay = clearChainOverlay;
  window.renderYzfTyp4Overlay = renderYzfTyp4Overlay;
}


function updateManualAdvancedTypUi() {
  const typ = Number(manualAdvancedTypSelect?.value || 0);
  const legacyAllowLabel = manualAllowGroupedLabel || manualAllowGrouped?.closest?.("label") || null;
  const hideLegacyAllow = typ === 4;

  // typ=4 外部 allow 守门已经撤掉。这里用 hidden + class + inline style 三重处理，
  // 避免旧 index.html 没有 label id、或旧 CSS 缓存时仍露出 legacy checkbox。
  if (legacyAllowLabel) {
    legacyAllowLabel.classList.toggle("hidden", hideLegacyAllow);
    legacyAllowLabel.hidden = hideLegacyAllow;
    legacyAllowLabel.style.display = hideLegacyAllow ? "none" : "";
    legacyAllowLabel.title = hideLegacyAllow
      ? "typ=4 外部 allowPromotedGroupedAic 守门已撤，此旧开关不再控制 Grouped AIC 是否运行。"
      : "兼容旧 manual advanced 请求字段；typ=4 已不再依赖它。";
  }
  if (manualAllowGrouped) {
    manualAllowGrouped.disabled = hideLegacyAllow;
    if (hideLegacyAllow) manualAllowGrouped.checked = false;
  }

  const note = document.querySelector(".manual-advanced-note");
  if (note) {
    if (typ === 4) {
      note.textContent = "typ=4 Grouped AIC：外部 allow 守门已撤；能否正式出 StepResult 由内部 DCL/CNL/validator 决定。";
    } else if (typ === 5) {
      note.textContent = "typ=5 ALS graph/debug：当前只建图与统计，formal search 默认关闭。";
    } else if (typ === 6) {
      note.textContent = "typ=6 Complex AIC：FW/Fire、AF 与 UR Guardian 强边已接入；UR Guardian 链可在 FindAll 中通过 strong:urguardian / {UR:ab r..c..} 标识确认。";
    } else {
      note.textContent = ui("manualAdvancedNote");
    }
  }
}

function manualAdvancedStat(statsMap, key, fallback = "-") {
  const value = statsMap?.[key];
  return value == null || value === "" ? fallback : value;
}

function getManualAdvancedTyp4AuditLines(response, statsMap) {
  const typ = Number(response?.typ || 0);
  if (typ !== 4 && String(statsMap?.typ || "") !== "4") return [];
  if (manualAdvancedStat(statsMap, "typ4FinalAuditV1") !== "true") {
    return ["typ4 audit: unavailable"];
  }

  return [
    "typ4 final audit:",
    `  externalGuardRemoved=${manualAdvancedStat(statsMap, "typ4ExternalGuardRemoved")}`,
    `  endpoint=${manualAdvancedStat(statsMap, "typ4AuditEndpointRelation")} / ${manualAdvancedStat(statsMap, "typ4AuditEndpointInference")}`,
    `  conclusion=${manualAdvancedStat(statsMap, "typ4AuditConclusionKind")}; ready=${manualAdvancedStat(statsMap, "typ4AuditConclusionReady")}; valid=${manualAdvancedStat(statsMap, "typ4AuditValidConclusionFound")}`,
    `  nodes=${manualAdvancedStat(statsMap, "typ4AuditStartNodeKind")} -> ${manualAdvancedStat(statsMap, "typ4AuditEndNodeKind")}; sectors=${manualAdvancedStat(statsMap, "typ4AuditStartSectorCount")}/${manualAdvancedStat(statsMap, "typ4AuditEndSectorCount")}; overlap=${manualAdvancedStat(statsMap, "typ4AuditEndpointSectorsOverlap")}`,
    `  grouped=${manualAdvancedStat(statsMap, "typ4AuditGroupedEndpointAnalysis")}; mixedOrGroupedDebugOnly=${manualAdvancedStat(statsMap, "typ4MixedGroupedStillDebugOnly")}`,
    `  pathOk=${manualAdvancedStat(statsMap, "typ4AuditPathValidationPassed")}; endpointSectorOk=${manualAdvancedStat(statsMap, "typ4AuditEndpointSectorValidationPassed")}; selectedRank=${manualAdvancedStat(statsMap, "typ4AuditSelectedPathRank")}`,
    `  candidates raw/unique/final=${manualAdvancedStat(statsMap, "typ4AuditRawCandidateCount")}/${manualAdvancedStat(statsMap, "typ4AuditUniqueCandidateCount")}/${manualAdvancedStat(statsMap, "typ4AuditCandidateCount")}`,
    `  grouped raw/unique=${manualAdvancedStat(statsMap, "typ4AuditRawGroupedCandidateCount")}/${manualAdvancedStat(statsMap, "typ4AuditUniqueGroupedCandidateCount")}`,
    `  rejects endpoint=${manualAdvancedStat(statsMap, "typ4AuditRejectedInEndpointSector")}; missing=${manualAdvancedStat(statsMap, "typ4AuditRejectedCandidateMissing")}; start=${manualAdvancedStat(statsMap, "typ4AuditRejectedNotSeeingStart")}; end=${manualAdvancedStat(statsMap, "typ4AuditRejectedNotSeeingEnd")}; inPath=${manualAdvancedStat(statsMap, "typ4AuditRejectedInPath")}`,
    `  reasons path=${manualAdvancedStat(statsMap, "typ4AuditPathRejectReason")}; endpointSector=${manualAdvancedStat(statsMap, "typ4AuditEndpointSectorRejectReason")}; unsupported=${manualAdvancedStat(statsMap, "typ4AuditUnsupportedReason")}; selected=${manualAdvancedStat(statsMap, "typ4AuditSelectedPathReason")}`,
  ];
}

function buildManualAdvancedRequest() {
  return {
    techniqueFamily: "YZFChaining",
    typ: Number(manualAdvancedTypSelect?.value || 0),
    inputFormat: String(manualAdvancedInputFormatSelect?.value || "auto"),
    debugMode: !!manualDebugMode?.checked,
    allowPromotedGroupedAic: !!manualAllowGrouped?.checked,
    returnStepResult: true,
    returnDebugJson: !!manualReturnDebugJson?.checked,
    includeOverlayData: !!manualIncludeOverlayData?.checked,
    includeRawGraphStats: !!manualIncludeRawGraphStats?.checked,
  };
}

function getCurrentPuzzleStringForManualAdvanced() {
  const inputInfo = getCurrentManualAdvancedInputInfo();
  if (!inputInfo.ok) {
    return inputInfo;
  }
  return {
    ok: true,
    puzzle: inputInfo.input,
    inputFormat: inputInfo.inputFormat,
    inputSource: inputInfo.inputSource || "unknown",
    inputLength: inputInfo.input.length,
    inputPreview: inputInfo.inputPreview,
    usesCandidates: !!inputInfo.usesCandidates,
  };
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
function hasRenderableOverlayPath(overlaySample) {
  if (overlaySample?.path?.nodes?.length > 0 && overlaySample?.path?.edges?.length > 0) {
    return true;
  }
  return Array.isArray(overlaySample?.branches) && overlaySample.branches.some((branch) => (
    branch?.path?.nodes?.length > 0 && branch?.path?.edges?.length > 0
  ));
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
  return /\bForce Chain\b/i.test(String(overlaySample?.title || ""));
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

function updateYzfBranchControls(overlaySample) {
  const branches = Array.isArray(overlaySample?.branches) ? overlaySample.branches : [];
  if (!yzfBranchControls || !yzfBranchSelect) return;
  if (branches.length <= 1) {
    yzfBranchControls.classList.add("hidden");
    yzfBranchSelect.replaceChildren();
    const option = document.createElement("option");
    option.value = "all";
    option.textContent = "all branches";
    yzfBranchSelect.appendChild(option);
    yzfSelectedBranchMode = "all";
    return;
  }
  let previous = yzfSelectedBranchMode || yzfBranchSelect.value || "all";
  if (isBraidRenderOverlay(overlaySample)) {
    // Match the FB drawing model: Braid/g-Braid normally shows all chains at
    // once (blue support branches first, red FB branch 0/main chain last).
    // The dropdown still allows inspecting FB branch 0 alone, but the frontend
    // must not silently hide the blue support branches by default.
    previous = "all";
  }
  yzfBranchSelect.replaceChildren();
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = `all branches (${branches.length})`;
  yzfBranchSelect.appendChild(allOption);
  branches.forEach((branch, index) => {
    const option = document.createElement("option");
    option.value = String(index + 1);
    option.textContent = branch?.label || `branch ${index + 1}`;
    yzfBranchSelect.appendChild(option);
  });
  const valid = previous === "all" || (Number(previous) >= 1 && Number(previous) <= branches.length);
  yzfSelectedBranchMode = valid ? previous : "all";
  yzfBranchSelect.value = yzfSelectedBranchMode;
  yzfBranchControls.classList.remove("hidden");
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
    rank: Number.isInteger(stepResult?.rank) ? stepResult.rank : 0,
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

function compressGroupedSectorText(cells) {
  const validCells = Array.isArray(cells) ? cells.filter(Number.isInteger) : [];
  if (!validCells.length) return "";
  const groups = new Map();
  for (const cell of validCells) {
    const row = Math.floor(cell / 9) + 1;
    const col = (cell % 9) + 1;
    if (!groups.has(row)) groups.set(row, []);
    groups.get(row).push(col);
  }
  const parts = [];
  for (const [row, cols] of groups.entries()) {
    const sortedCols = [...cols].sort((a, b) => a - b).join("");
    parts.push(`r${row}c${sortedCols}`);
  }
  return parts.join("/");
}

function compactAlsLabel(label) {
  const text = String(label || "").trim();
  if (!text) return "ALS";
  return text
    .replace(/\s*\[[^\]]+\]\s*/g, " ")
    .replace(/\s+(?:OFF|ON)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatManualChainNodeCompact(node) {
  if (node?.nodeKind === "AlsCandidateSector" || node?.kind === "AlsCandidateSector") {
    return compactAlsLabel(node?.label);
  }
  if (node?.nodeKind === "GroupedSector" || node?.kind === "GroupedSector") {
    const digit = Number(node?.digitDisplay || node?.digit || 0);
    const cells = Array.isArray(node?.sectorCells) ? node.sectorCells : [];
    const cellText = compressGroupedSectorText(cells);
    return digit >= 1 && digit <= 9 ? `${digit}${cellText}` : (node?.label || "group");
  }
  const cell = Number.isInteger(node?.cell) ? node.cell : null;
  const digit = Number(node?.digitDisplay || 0);
  if (cell == null || digit < 1 || digit > 9) {
    return compactAlsLabel(node?.label || "node");
  }
  return `${digit}r${Math.floor(cell / 9) + 1}c${(cell % 9) + 1}`;
}

function formatManualChainNodeDetailed(node) {
  if (node?.nodeKind === "GroupedSector" || node?.kind === "GroupedSector") {
    const digit = Number(node?.digitDisplay || node?.digit || 0);
    const cells = Array.isArray(node?.sectorCells) ? node.sectorCells : [];
    const cellText = compressGroupedSectorText(cells);
    return digit >= 1 && digit <= 9 ? `${cellText}#${digit}` : (node?.label || "group");
  }
  const cell = Number.isInteger(node?.cell) ? node.cell : null;
  const digit = Number(node?.digitDisplay || 0);
  if (cell == null || digit < 1 || digit > 9) {
    return node?.label || "node";
  }
  return `r${Math.floor(cell / 9) + 1}c${(cell % 9) + 1}#${digit}`;
}

function formatManualElimination(candidate) {
  if (!candidate || !Number.isInteger(candidate.cell) || !Number.isInteger(candidate.digitDisplay)) {
    return candidate?.label || "elimination";
  }
  return `r${Math.floor(candidate.cell / 9) + 1}c${(candidate.cell % 9) + 1}<>${candidate.digitDisplay}`;
}

function formatManualPlacement(action) {
  if (!action || !Number.isInteger(action.index) || !Number.isInteger(action.value)) {
    return action?.label || "placement";
  }
  return `r${Math.floor(action.index / 9) + 1}c${(action.index % 9) + 1}=${action.value}`;
}

function extractManualChainModel(source) {
  if (!source || typeof source !== "object") {
    return { nodes: [], edges: [], eliminations: [], placements: [] };
  }

  if (Array.isArray(source.nodes) && Array.isArray(source.edges)) {
    const nodes = normalizeStepResultPathNodes(source.nodes);
    const edges = normalizeStepResultPathEdges(source.edges, nodes);
    applyTransitionStatesToPathNodes(nodes, edges);

    const eliminations = Array.isArray(source.eliminations) ? source.eliminations.flatMap((candidate) => {
      const digits = Array.isArray(candidate.candidates)
        ? candidate.candidates.map(Number).filter((digit) => digit >= 1 && digit <= 9)
        : [];
      return digits.map((digit) => ({
        cell: candidate.index,
        digitDisplay: digit,
        row: candidate.row,
        col: candidate.col,
      }));
    }) : [];

    const placements = Array.isArray(source.placements)
      ? source.placements.map((action) => ({
        index: action.index,
        value: action.value,
        row: action.row,
        col: action.col,
      }))
      : (Array.isArray(source.actions)
        ? source.actions
          .filter((action) => action.type === "place")
          .map((action) => ({
            index: action.index,
            value: action.value,
            row: action.row,
            col: action.col,
          }))
        : []);

    return { nodes, edges, eliminations, placements };
  }

  if (source.path && Array.isArray(source.path.nodes) && Array.isArray(source.path.edges)) {
    const nodes = source.path.nodes.map((node, pathIndex) => {
      const cell = Number.isInteger(node.cell) ? node.cell : null;
      const nodeKind = node.nodeKind || node.kind || "SingleCandidate";
      return {
        nodeId: Number.isInteger(node.nodeId) ? node.nodeId : pathIndex,
        originalNodeId: Number.isInteger(node.originalNodeId) ? node.originalNodeId : (Number.isInteger(node.nodeId) ? node.nodeId : pathIndex),
        pathIndex: Number.isInteger(node.pathIndex) ? node.pathIndex : pathIndex,
        label: node.label || "",
        digitDisplay: Number(node.digitDisplay || node.digit || 0),
        state: node.state || extractStateFromLabel(node.label),
        cell,
        kind: nodeKind,
        nodeKind,
        sectorCells: normalizeSectorCells(node.sectorCells, cell),
      };
    });

    const edges = source.path.edges.map((edge, index) => {
      const parsed = edge.strength
        ? {
          strength: edge.strength === "weak" ? "weak" : "strong",
          reason: edge.reason || "unknown",
          transition: edge.transition || "",
        }
        : parseYzfEdgeType(edge.type);

      return {
        edgeId: Number.isInteger(edge.edgeId) ? edge.edgeId : index,
        fromNodeId: Number.isInteger(edge.fromNodeId) ? edge.fromNodeId : index,
        toNodeId: Number.isInteger(edge.toNodeId) ? edge.toNodeId : index + 1,
        fromPathIndex: Number.isInteger(edge.fromPathIndex) ? edge.fromPathIndex : index,
        toPathIndex: Number.isInteger(edge.toPathIndex) ? edge.toPathIndex : index + 1,
        originalFromNodeId: edge.originalFromNodeId ?? edge.from,
        originalToNodeId: edge.originalToNodeId ?? edge.to,
        strength: parsed.strength,
        reason: parsed.reason,
        transition: parsed.transition,
        rawType: edge.rawType || edge.type || "",
        role: edge.role || parsed.role || "",
        alsLabel: parsed.alsLabel || edge.alsLabel || "",
        afLabel: parsed.afLabel || edge.afLabel || "",
        urLabel: parsed.urLabel || edge.urLabel || "",
      };
    });

    applyTransitionStatesToPathNodes(nodes, edges);

    const eliminations = Array.isArray(source.debugCandidates)
      ? source.debugCandidates.map((candidate) => ({
        cell: candidate.cell,
        digitDisplay: Number(candidate.digitDisplay || 0),
        row: candidate.row,
        col: candidate.col,
      }))
      : (Array.isArray(source.candidateMarks)
        ? source.candidateMarks.map((candidate) => ({
          cell: candidate.cell,
          digitDisplay: Number(candidate.digitDisplay || 0),
          row: candidate.row,
          col: candidate.col,
        }))
        : []);

    return { nodes, edges, eliminations, placements: [] };
  }

  return { nodes: [], edges: [], eliminations: [], placements: [] };
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

function isGenericAicConclusionDescription(text) {
  return /^Strong endpoint inference on /i.test(String(text || "").trim());
}

function isForceChainStepResult(stepResult) {
  const title = String(stepResult?.title || "").trim();
  return /\bForce Chain\b/i.test(title);
}

function isBraidStepResult(stepResult) {
  const kind = String(stepResult?.kind || "");
  const title = String(stepResult?.title || "");
  const chainType = String(stepResult?.chainType || "");
  return /^(Braid|GBraid)$/i.test(kind) || /\bg-?Braid\b/i.test(title) || /\bg-?Braid\b/i.test(chainType);
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

function fireworkSectorText(cells) {
  return (Array.isArray(cells) ? cells : [])
    .filter(Number.isInteger)
    .sort((a, b) => a - b)
    .map((cell) => `r${Math.floor(cell / 9) + 1}c${(cell % 9) + 1}`)
    .join(",");
}

function nodeTouchesReasonEdge(node, edges = [], reason = "") {
  const nodeId = Number(node?.nodeId);
  const normalizedReason = String(reason || "").toLowerCase();
  if (!Number.isInteger(nodeId) || !normalizedReason) return false;
  return edges.some((edge) => String(edge?.reason || "").toLowerCase() === normalizedReason &&
    (edge.fromNodeId === nodeId || edge.toNodeId === nodeId));
}

function nodeTouchesFireEdge(node, edges = []) {
  return nodeTouchesReasonEdge(node, edges, "fire");
}

function edgeForNodeByReason(node, edges = [], reason = "") {
  const nodeId = Number(node?.nodeId);
  const normalizedReason = String(reason || "").toLowerCase();
  if (!Number.isInteger(nodeId) || !normalizedReason) return null;
  return (edges || []).find((edge) => String(edge?.reason || "").toLowerCase() === normalizedReason &&
    (edge.fromNodeId === nodeId || edge.toNodeId === nodeId)) || null;
}

function formatAfNodeFromEdgeLabel(node, edges = []) {
  const edge = edgeForNodeByReason(node, edges, "af");
  const label = String(edge?.afLabel || "").trim();
  if (label) return label;
  const digit = Number(node?.digitDisplay || node?.digit || 0);
  const cells = Array.isArray(node?.sectorCells) ? node.sectorCells : [];
  const cellText = compressGroupedSectorText(cells);
  return digit >= 1 && digit <= 9 && cellText ? `${digit}${cellText}{AF}` : "";
}

function formatUrGuardianNodeWithEdges(node, edges = []) {
  const edge = edgeForNodeByReason(node, edges, "urguardian");
  if (!edge) return "";
  const digit = Number(node?.digitDisplay || node?.digit || 0);
  const cells = Array.isArray(node?.sectorCells) ? node.sectorCells : [];
  const cellText = compressGroupedSectorText(cells);
  const urSuffix = edge.urLabel ? `{UR:${edge.urLabel}}` : "{UR}";
  return digit >= 1 && digit <= 9 && cellText ? `${digit}${cellText}${urSuffix}` : "";
}

function formatManualChainNodeCompactWithEdges(node, edges = []) {
  const nodeKind = node?.nodeKind || node?.kind || "";
  const afText = formatAfNodeFromEdgeLabel(node, edges);
  if (afText) return afText;
  const urText = formatUrGuardianNodeWithEdges(node, edges);
  if (urText) return urText;
  if (nodeKind === "GroupedSector" && nodeTouchesFireEdge(node, edges)) {
    const digit = Number(node?.digitDisplay || node?.digit || 0);
    const cellText = fireworkSectorText(node?.sectorCells);
    if (digit >= 1 && digit <= 9 && cellText) {
      return `${digit}${cellText}{FW}`;
    }
  }
  return formatManualChainNodeCompact(node);
}

function formatManualChainNodeDetailedWithEdge(node, edge, edges = []) {
  const nodeKind = node?.nodeKind || node?.kind || "";
  const edgeReason = String(edge?.reason || "").toLowerCase();
  if (edgeReason === "af") {
    const afText = formatAfNodeFromEdgeLabel(node, [edge]);
    if (afText) return afText;
  }
  if (edgeReason === "urguardian") {
    const urText = formatUrGuardianNodeWithEdges(node, [edge]);
    if (urText) return urText;
  }
  if (nodeKind === "GroupedSector" &&
      edgeReason === "fire" &&
      nodeTouchesFireEdge(node, edges)) {
    const digit = Number(node?.digitDisplay || node?.digit || 0);
    const cellText = fireworkSectorText(node?.sectorCells);
    if (digit >= 1 && digit <= 9 && cellText) {
      return `${cellText}#${digit}{FW}`;
    }
  }
  return formatManualChainNodeDetailed(node);
}

function chainStepTitleLine(step) {
  const title = String(step?.title || techniqueName(step) || "").trim();
  const chainType = String(step?.chainType || "").trim();
  if (title && chainType && title !== chainType) {
    return `${title} [${chainType}]`;
  }
  return title || chainType || "Chain";
}

function buildManualAdvancedChainTexts(stepResult) {
  const rawDescriptionChainText = extractStepDescriptionChainText(stepResult);
  const descriptionChainText = isGenericAicConclusionDescription(rawDescriptionChainText) ? "" : rawDescriptionChainText;
  const { nodes, edges, eliminations, placements } = extractManualChainModel(stepResult);

  const backendOwnedBraid = isBraidStepResult(stepResult);
  const fallbackNodeList = backendOwnedBraid ? [] : nodes.map((node) => formatManualChainNodeDetailed(node));
  const fallbackEdgeList = backendOwnedBraid ? [] : edges.map((edge) => `${edge.fromNodeId} -> ${edge.toNodeId}, ${edge.strength}:${edge.reason}:${edge.transition || "-"}`);
  const conclusionText = placements.length
    ? `place ${placements.map((action) => formatManualPlacement(action)).join(", ")}`
    : (eliminations.length
      ? `delete ${eliminations.map((candidate) => formatManualElimination(candidate)).join(", ")}`
      : "delete -");

  const forceBranchDetails = forceChainDescriptionDetails(stepResult);
  if (descriptionChainText && forceBranchDetails.length > 1) {
    return {
      ok: true,
      chainText: descriptionChainText,
      detailedLines: forceBranchDetails,
      conclusionText,
      fallbackNodeList,
      fallbackEdgeList,
    };
  }

  if (!nodes.length || !edges.length) {
    return {
      ok: false,
      chainText: "",
      detailedLines: [],
      conclusionText,
      fallbackNodeList,
      fallbackEdgeList,
    };
  }

  const nodeById = new Map(nodes.map((node) => [node.nodeId, node]));
  let directed = buildDirectedChainOrder(nodes, edges);
  if (!directed.ok) {
    directed = buildUndirectedChainOrder(nodes, edges);
  }
  if (!directed.ok) {
    directed = buildCycleChainOrder(nodes, edges);
  }
  if (!directed.ok) {
    return {
      ok: false,
      chainText: "",
      detailedLines: [],
      conclusionText,
      fallbackNodeList,
      fallbackEdgeList,
    };
  }
  const orderedNodes = directed.orderedNodeIds.map((nodeId) => nodeById.get(nodeId)).filter(Boolean);
  const orderedEdges = directed.orderedEdges;
  const isCycle = directed.isCycle === true;

  if (!orderedNodes.length || !orderedEdges.length) {
    return {
      ok: false,
      chainText: "",
      detailedLines: [],
      conclusionText,
      fallbackNodeList,
      fallbackEdgeList,
    };
  }

  let chainText = formatManualChainNodeCompactWithEdges(orderedNodes[0], orderedEdges);
  for (let index = 0; index < orderedEdges.length; index += 1) {
    const edge = orderedEdges[index];
    const nextNode = isCycle && index === orderedEdges.length - 1
      ? orderedNodes[0]
      : orderedNodes[index + 1];
    if (!nextNode) {
      return {
        ok: false,
        chainText: "",
        detailedLines: [],
        conclusionText,
        fallbackNodeList,
        fallbackEdgeList,
      };
    }
    chainText += edge.strength === "strong" ? " = " : " - ";
    chainText += formatManualChainNodeCompactWithEdges(nextNode, orderedEdges);
  }
  if (placements.length) {
    chainText += ` => ${placements.map((action) => formatManualPlacement(action)).join(", ")}`;
  } else if (eliminations.length) {
    chainText += ` => ${eliminations.map((candidate) => formatManualElimination(candidate)).join(", ")}`;
  }

  const detailedLines = [];
  for (let index = 0; index < orderedEdges.length; index += 1) {
    const edge = orderedEdges[index];
    const nextNode = isCycle && index === orderedEdges.length - 1
      ? orderedNodes[0]
      : orderedNodes[index + 1];
    if (!orderedNodes[index] || !nextNode) continue;
    const alsDetail = edge.alsLabel ? ` ${edge.alsLabel}` : "";
    const afDetail = edge.afLabel ? ` ${edge.afLabel}` : "";
    const urDetail = edge.urLabel ? ` ${edge.urLabel}` : "";
    detailedLines.push(
      `${formatManualChainNodeDetailedWithEdge(orderedNodes[index], edge, orderedEdges)} --${edge.strength} ${edge.reason}${alsDetail}${afDetail}${urDetail}-- ${formatManualChainNodeDetailedWithEdge(nextNode, edge, orderedEdges)}`
    );
  }

  return {
    ok: true,
    // Braid/g-Braid graph ownership is backend-only. Do not let the frontend
    // replace the structured node/edge chain with description text; otherwise a
    // broken StepResult can still look partially drawn and hide backend bugs.
    chainText: backendOwnedBraid ? chainText : (descriptionChainText || chainText),
    detailedLines,
    conclusionText,
    fallbackNodeList,
    fallbackEdgeList,
  };
}

function clearManualAdvancedResult(message = "") {
  clearChainOverlay();
  setStatusElementState(manualAdvancedStatus, "");
  setOptionalTextBlock(manualAdvancedJson, "");
  if (message) {
    setStatusElementState(manualAdvancedStatus, message, "info");
  }
}

function parseManualAdvancedStats(statsText) {
  const values = {};
  if (typeof statsText !== "string" || !statsText) {
    return values;
  }
  for (const part of statsText.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    values[part.slice(0, index)] = part.slice(index + 1);
  }
  return values;
}

function getManualAdvancedStatValue(statsMap, debugStats, key, fallback = "-") {
  if (statsMap && statsMap[key] != null && statsMap[key] !== "") {
    return statsMap[key];
  }
  if (debugStats && debugStats[key] != null && debugStats[key] !== "") {
    return debugStats[key];
  }
  return fallback;
}

function hasManualAdvancedWarning(response, name) {
  return Array.isArray(response?.warnings) && response.warnings.includes(name);
}

function isManualAdvancedSummaryOnlyDebugResponse(response, request, statsMap = {}) {
  if (response?.stepResult) return false;
  const debugJson = response?.debugJson;
  if (!debugJson || typeof debugJson !== "object") return false;

  const typ = Number(response?.typ || request?.typ || 0);
  const pathNodes = Array.isArray(debugJson?.path?.nodes) ? debugJson.path.nodes : null;
  const pathEdges = Array.isArray(debugJson?.path?.edges) ? debugJson.path.edges : null;
  const emptyPath = !!pathNodes && !!pathEdges && pathNodes.length === 0 && pathEdges.length === 0;

  // typ=5 ALS graph/debug 目前是 graph-stats 阶段，不跑 formal search，不提供可画链路。
  // 后端会通过 overlay_data_summary_only / typ5_als_graph_debug_only_search_gate 明确表达这一点。
  // 前端必须把它当作 summary-only，而不是 overlay normalization failure。
  if (hasManualAdvancedWarning(response, "overlay_data_summary_only")) return true;
  if (hasManualAdvancedWarning(response, "debug_json_is_summary_only")) return true;
  if (debugJson.unsupportedReason === "typ5_als_graph_debug_only_search_gate") return true;
  if (typ === 5 && emptyPath) return true;

  // 其它 NoResult / GuardRejected 的空 debug path 也不要当成错误 overlay。
  return emptyPath && (response?.status === "NoResult" || response?.status === "GuardRejected" || response?.status === "Unsupported");
}

function buildManualAdvancedSummaryOnlyPreview({
  response,
  request,
  puzzleInfo,
  statsMap,
  summary,
  rawResponseText,
  inputFormatRequested,
  inputFormatResolved,
  inputLength,
  usedCandidateState,
  parserName,
  parseWarning,
  inputPreview,
  inputSource,
}) {
  const debugStats = response?.debugJson?.stats || {};
  const warnings = Array.isArray(response?.warnings) ? response.warnings : [];
  const graphKeys = [
    "graphNodeCount",
    "graphStrongEdgeCount",
    "graphWeakEdgeCount",
    "visitedStates",
    "pathLength",
  ];
  const buildKeys = [
    "buildSessionEnsureCalls",
    "buildSessionBuiltStages",
    "buildSessionReusedStages",
    "buildSessionTotalMicros",
    "baseNodeDelta",
    "xStrongEdgeDelta",
    "xWeakEdgeDelta",
    "xyStrongEdgeDelta",
    "xyWeakEdgeDelta",
    "groupNodeDelta",
    "groupStrongEdgeDelta",
    "groupWeakEdgeDelta",
    "fireNodeDelta",
    "fireStrongEdgeDelta",
    "fireWeakEdgeDelta",
    "afNodeDelta",
    "afStrongEdgeDelta",
    "afWeakEdgeDelta",
    "urGuardianNodeDelta",
    "urGuardianStrongEdgeDelta",
    "urGuardianWeakEdgeDelta",
  ];
  const alsKeys = [
    "alsBuiltCount",
    "alsBuildMicros",
    "alsNodeDelta",
    "alsStrongEdgeDelta",
    "alsWeakEdgeDelta",
    "fireEnsureCalls",
    "fireBuiltCount",
    "fireReusedCount",
    "fireBuildMicros",
    "fireNodeDelta",
    "fireStrongEdgeDelta",
    "fireWeakEdgeDelta",
    "afEnsureCalls",
    "afBuiltCount",
    "afReusedCount",
    "afBuildMicros",
    "afNodeDelta",
    "afStrongEdgeDelta",
    "afWeakEdgeDelta",
    "urGuardianEnsureCalls",
    "urGuardianBuiltCount",
    "urGuardianReusedCount",
    "urGuardianBuildMicros",
    "urGuardianNodeDelta",
    "urGuardianStrongEdgeDelta",
    "urGuardianWeakEdgeDelta",
    "alsMetaCount",
    "alsStrongEdges",
    "alsWeakEdges",
    "alsDuplicateStrongRejected",
    "alsDuplicateWeakRejected",
    "alsDuplicateSkipped",
    "alsRowColumnBoxSkipped",
    "alsSectorNodesCreated",
    "alsSectorNodesReused",
    "sameCandHouseWeakClosureV23",
    "sameCandHouseWeakRegistered",
    "sameCandHouseWeakProbes",
    "sameCandHouseWeakAccepted",
    "sameCandHouseWeakDuplicate",
    "sameCandHouseWeakSkippedOverlap",
    "sameCandHouseWeakSingleAccepted",
    "sameCandHouseWeakGroupAccepted",
    "sameCandHouseWeakAlsAccepted",
    "alsBuildBreakdownEnabled",
    "alsFreeCellCollectMicros",
    "alsComboEnumMicros",
    "alsComboValidateMicros",
    "alsMetaStoreMicros",
    "alsNodeBuildMicros",
    "alsStrongEdgeBuildMicros",
    "alsWeakSingleBuildMicros",
    "alsWeakPairBuildMicros",
    "alsVisibilityCheckMicros",
    "alsSortUniqueMicros",
    "alsFreeCellTotalCount",
    "alsComboVisited",
    "alsComboAccepted",
    "alsHouseScanned",
    "alsHouseWithFreeCells",
    "alsComboRejectedInvalidCell",
    "alsComboRejectedNotAls",
    "alsComboRejectedLockedSet",
    "alsComboRejectedAllBivalue",
    "alsComboRejectedRowColumnBox",
    "alsComboRejectedDuplicate",
    "alsItemLimitHit",
    "alsDigitNodeLimitHit",
    "alsStrongEdgeProbes",
    "alsStrongEdgeAccepted",
    "alsWeakSingleProbes",
    "alsWeakSingleAccepted",
    "alsWeakSingleCandidatePairs",
    "alsWeakSinglePreFilterRejected",
    "alsWeakSingleVisibilityChecked",
    "alsWeakSingleVisibilitySkipped",
    "alsWeakSingleCacheBuilds",
    "alsWeakSingleCacheBuildMicros",
    "alsWeakSinglePreFilterMicros",
    "alsWeakPairProbes",
    "alsWeakPairAccepted",
    "alsWeakPairCandidatePairs",
    "alsWeakPairPreFilterRejected",
    "alsWeakPairFastHouseAccepted",
    "alsWeakPairCommonPeerAccepted",
    "alsWeakPairVisibilityChecked",
    "alsWeakPairVisibilitySkipped",
    "alsWeakPairPreFilterMicros",
    "alsComboEarlyPruneCandidateMask",
    "alsComboEarlyPruneBranches",
    "alsComboCompleteAfterPrune",
    "alsComboEarlyPruneMicros",
    "typ5FormalDryRunEnabled",
    "typ5FormalDryRunPathFound",
    "typ5FormalDryRunDcl1Found",
    "typ5FormalDryRunDcl2Found",
    "typ5FormalDryRunQueryShortRejected",
    "typ5FormalDryRunKind",
    "typ5FormalDryRunExit",
    "typ5FormalDryRunVisitedStates",
    "typ5FormalDryRunDcl1VisitedStates",
    "typ5FormalDryRunDcl2VisitedStates",
    "typ5FormalDryRunTotalVisitedStates",
    "typ5FormalDryRunSelectedVisitedStates",
    "typ5FormalDryRunDcl1MaxDepthReached",
    "typ5FormalDryRunDcl2MaxDepthReached",
    "typ5FormalDryRunSelectedWithinVisitedLimit",
    "typ5FormalDryRunMaxDepthReached",
    "typ5FormalDryRunMaxDepthLimit",
    "typ5FormalDryRunMaxVisitedLimit",
    "typ5FormalDryRunPathLength",
    "typ5FormalDryRunPathNodes",
    "typ5FormalDryRunStartNodeId",
    "typ5FormalDryRunEndNodeId",
    "typ5FormalDryRunStartState",
    "typ5FormalDryRunEndState",
    "typ5FormalDryRunPathDirectionNormalized",
    "typ5FormalDryRunEndpointAuditV19",
    "typ5FormalDryRunDcl1SecondExitFound",
    "typ5FormalDryRunDcl1SecondExitCover",
    "typ5FormalDryRunPreferredDcl1SecondExit",
    "typ5FormalDryRunDcl1SecondExitStartNodeId",
    "typ5FormalDryRunDcl1SecondExitEndNodeId",
    "typ5FormalDryRunDcl1SecondExitStartSectorCount",
    "typ5FormalDryRunDcl1SecondExitEndSectorCount",
    "typ5FormalDryRunProspectiveEliminationCount",
    "typ5FormalDryRunProspectiveEliminationCell",
    "typ5FormalDryRunProspectiveEliminationDigit",
    "typ5FormalDryRunProspectivePlacementCount",
    "typ5FormalDryRunProspectivePlacementCell",
    "typ5FormalDryRunProspectivePlacementDigit",
    "typ5FormalDryRunV20",
    "typ5FormalDryRunV21",
    "typ5FormalDryRunV22",
    "typ5UnifiedDclRunnerV22",
    "typ5SameCandHouseWeakClosureV23",
    "typ5DefaultSolvePathV26",
    "typ5AlsCompactChainTextV26",
    "typ5FrontendSummaryCleanupV26",
    "typ5FrontendDuplicateTitleFixV27",
    "typ5AlsSummaryTextV27",
    "typ5AlsLargeAlsEnumeratorV21",
    "typ5AlsMaxSizeLimitV21",
    "typ5FormalDryRunSingleNodes",
    "typ5FormalDryRunGroupedNodes",
    "typ5FormalDryRunAlsNodes",
    "typ5FormalDryRunStrongEdges",
    "typ5FormalDryRunWeakEdges",
    "typ5FormalDryRunRowEdges",
    "typ5FormalDryRunColumnEdges",
    "typ5FormalDryRunBoxEdges",
    "typ5FormalDryRunCellEdges",
    "typ5FormalDryRunGroupEdges",
    "typ5FormalDryRunAlsEdges",
    "typ5FormalDryRunOtherEdges",
  ];
  const gateKeys = [
    "typ5AlsGraphStage0",
    "typ5SearchGateV1",
    "typ5AlsGraphStatsV1",
    "typ5AlsBuildBreakdownV14",
    "typ5AlsWeakPairPrefilterV15",
    "typ5AlsComboEarlyPruneV16",
    "typ5AlsWeakSingleCacheV17",
    "typ5FormalDryRunV18",
    "typ5FormalDryRunV19",
    "typ5FormalDryRunV20",
    "typ5FormalDryRunV21",
    "typ5FormalDryRunV22",
    "typ5UnifiedDclRunnerV22",
    "typ5SameCandHouseWeakClosureV23",
    "typ5DefaultSolvePathV26",
    "typ5AlsCompactChainTextV26",
    "typ5FrontendSummaryCleanupV26",
    "typ5FrontendDuplicateTitleFixV27",
    "typ5AlsSummaryTextV27",
    "typ5AlsLargeAlsEnumeratorV21",
    "typ5FormalSearchAllowed",
    "typ5FullBfsEnabled",
    "typ5FormalStepEnabled",
    "typ5DynamicRank0ProviderEnabled",
  ];

  const statLines = (keys) => keys
    .map((key) => `${key}=${getManualAdvancedStatValue(statsMap, debugStats, key)}`)
    .filter((line) => !line.endsWith("=-"));

  return [
    "typ5 ALS debug summary-only / no formal StepResult",
    "overlay skipped: 当前响应没有正式 StepResult；status=Ok 且 stepResultPresent=true 时会走正式结果渲染路径",
    "",
    `status=${response?.status || "-"}`,
    `techniqueFamily=${response?.techniqueFamily || request?.techniqueFamily || "YZFChaining"}`,
    `typ=${Number(response?.typ || request?.typ || 0)}`,
    `debugJsonPresent=${response?.debugJson != null}`,
    `debugUnsupportedReason=${response?.debugJson?.unsupportedReason || "-"}`,
    warnings.length ? `warnings=${warnings.join(",")}` : "warnings=-",
    "",
    "input:",
    `inputSource=${inputSource}`,
    `inputFormatRequested=${inputFormatRequested}`,
    `inputFormatResolved=${inputFormatResolved}`,
    `inputLength=${inputLength}`,
    `usedCandidateState=${usedCandidateState}`,
    `parserName=${parserName}`,
    parseWarning && parseWarning !== "-" ? `parseWarning=${parseWarning}` : "parseWarning=-",
    `inputPreview=${inputPreview}`,
    "",
    "graph/search stats:",
    ...statLines(graphKeys),
    "",
    "build stats:",
    ...statLines(buildKeys),
    "",
    "ALS stats:",
    ...statLines(alsKeys),
    "",
    "typ5 gates:",
    ...statLines(gateKeys),
    "",
    "summary:",
    summary,
    "",
    "raw response JSON:",
    rawResponseText || JSON.stringify(response, null, 2),
  ].join("\n");
}


function renderManualAdvancedResponse(response, puzzleInfo, request, rawResponseText = "") {
  const warnings = Array.isArray(response?.warnings) ? response.warnings : [];
  const stepResult = response?.stepResult || null;
  const status = response?.status || "InvalidResponse";
  const title = stepResult?.title || "";
  const chainType = stepResult?.chainType || "";
  const eliminationsCount = Array.isArray(stepResult?.eliminations) ? stepResult.eliminations.length : 0;
  const nodesCount = Array.isArray(stepResult?.nodes) ? stepResult.nodes.length : 0;
  const edgesCount = Array.isArray(stepResult?.edges) ? stepResult.edges.length : 0;
  const debugJsonPresent = response?.debugJson != null;
  const statsText = typeof response?.stats === "string" ? response.stats : "";
  const statsMap = parseManualAdvancedStats(statsText);
  const unsupportedReason = response?.unsupportedReason || "";
  const guardRejectReason = response?.guardRejectReason || "";
  const typ = Number(response?.typ || request?.typ || 0);
  const inputFormatResolved = response?.inputFormatResolved || statsMap.inputFormatResolved || request?.inputFormat || "auto";
  const inputFormatRequested = response?.inputFormatRequested || statsMap.inputFormatRequested || request?.inputFormat || "auto";
  const inputLength = Number(response?.inputLength || statsMap.inputLength || puzzleInfo?.inputLength || 0);
  const usedCandidateState = String(response?.usedCandidateState ?? statsMap.usedCandidateState ?? puzzleInfo?.usesCandidates ?? false) === "true";
  const parserName = response?.parserName || statsMap.parserName || "-";
  const parseWarning = response?.parseWarning || statsMap.parseWarning || "";
  const inputPreview = puzzleInfo?.inputPreview || getManualAdvancedInputPreview(puzzleInfo?.puzzle || "");
  const inputSource = puzzleInfo?.inputSource || "unknown";
  const graphNodeCount = statsMap.graphNodeCount || "unavailable";
  const graphStrongEdgeCount = statsMap.graphStrongEdgeCount || "unavailable";
  const graphWeakEdgeCount = statsMap.graphWeakEdgeCount || "unavailable";
  const visitedStates = statsMap.visitedStates || "unavailable";
  const pathLength = statsMap.pathLength || "unavailable";
  const debugOverlaySource = (!stepResult && response?.debugJson && typeof response.debugJson === "object")
    ? response.debugJson
    : null;
  const chainTexts = stepResult
    ? buildManualAdvancedChainTexts(stepResult)
    : (debugOverlaySource ? buildManualAdvancedChainTexts(debugOverlaySource) : null);

  const typ4AuditLines = getManualAdvancedTyp4AuditLines(response, statsMap);

  const summary = [
    `status=${status}`,
    `techniqueFamily=${response?.techniqueFamily || request?.techniqueFamily || "YZFChaining"}`,
    `typ=${typ}`,
    `inputSource=${inputSource}`,
    `inputFormat=${inputFormatRequested}`,
    `resolved=${inputFormatResolved}`,
    `inputLength=${inputLength}`,
    `usesCandidates=${usedCandidateState}`,
    `inputPreview=${inputPreview}`,
    title ? `title=${title}` : "",
    chainType ? `chainType=${chainType}` : "",
    stepResult ? `eliminations=${eliminationsCount}; nodes=${nodesCount}; edges=${edgesCount}` : "",
    parserName && parserName !== "-" ? `parser=${parserName}` : "",
    parseWarning && parseWarning !== "-" ? `parseWarning=${parseWarning}` : "",
    unsupportedReason ? `unsupportedReason=${unsupportedReason}` : "",
    guardRejectReason ? `guardRejectReason=${guardRejectReason}` : "",
    `debugJsonPresent=${debugJsonPresent}`,
    warnings.length ? `warnings=${warnings.join(",")}` : "warnings=-",
    stepResult ? lang.value === "en" ? "Manual advanced result; also available in default solving when enabled" : "高级技巧结果；启用后也可由默认求解使用" : "",
    status === "NoResult" ? `graphNodeCount=${graphNodeCount}; graphStrongEdgeCount=${graphStrongEdgeCount}; graphWeakEdgeCount=${graphWeakEdgeCount}; visitedStates=${visitedStates}; pathLength=${pathLength}` : "",
  ].filter(Boolean).join(" | ");

  setOptionalTextBlock(manualAdvancedJson, JSON.stringify({
    inputSource,
    inputPreview,
    inputLength,
    usesCandidates: puzzleInfo?.usesCandidates ?? false,
    requestJson: request,
    rawResponseJson: response,
    status,
    techniqueFamily: response?.techniqueFamily || request?.techniqueFamily || "YZFChaining",
    typ,
    title,
    chainType,
    rank: stepResult?.rank ?? null,
    inputFormatRequested,
    inputFormatResolved,
    usedCandidateState,
    parserName,
    parseWarning,
    graphNodeCount,
    graphStrongEdgeCount,
    graphWeakEdgeCount,
    visitedStates,
    pathLength,
    chainText: chainTexts?.chainText || "",
    detailedChainText: chainTexts?.detailedLines || [],
    conclusionText: chainTexts?.conclusionText || "",
    fallbackNodeList: chainTexts?.fallbackNodeList || [],
    fallbackEdgeList: chainTexts?.fallbackEdgeList || [],
    eliminationsCount,
    nodesCount,
    edgesCount,
    unsupportedReason,
    guardRejectReason,
    stats: statsText,
    warnings,
    debugJsonPresent,
    rawResponseText,
    typ4Audit: typ4AuditLines,
    manualAdvanced: true,
    notFromDefaultSolver: true,
  }, null, 2));

  console.debug("Manual Advanced request/response", {
    actualInputLength: inputLength,
    actualInputPreview: inputPreview,
    inputSource,
    requestTyp: typ,
    requestInputFormat: request?.inputFormat || "auto",
    responseStatus: status,
    responseTitle: title,
    responseChainType: chainType,
    responseEliminationsCount: eliminationsCount,
    responseNodesCount: nodesCount,
    responseEdgesCount: edgesCount,
    responseInputFormatResolved: inputFormatResolved,
    responseUsedCandidateState: usedCandidateState,
  });

  if (!stepResult && debugOverlaySource && isManualAdvancedSummaryOnlyDebugResponse(response, request, statsMap)) {
    clearChainOverlay();
    setYzfOverlayModeNote("summary-only / 仅显示图统计，不画链路");
  setStatusElementState(yzfOverlayStatus,
      `typ=${typ}; status=${status}; summary-only debugJson; overlay skipped; graph=${graphNodeCount}/${graphStrongEdgeCount}/${graphWeakEdgeCount}; visitedStates=${visitedStates}; pathLength=${pathLength}`,
      "debug");
    setOptionalTextBlock(manualAdvancedJson, buildManualAdvancedSummaryOnlyPreview({
      response,
      request,
      puzzleInfo,
      statsMap,
      summary,
      rawResponseText,
      inputFormatRequested,
      inputFormatResolved,
      inputLength,
      usedCandidateState,
      parserName,
      parseWarning,
      inputPreview,
      inputSource,
    }));
    const warnAboutInput = inputFormatResolved !== "library" || !usedCandidateState;
    const suffix = warnAboutInput ? " | 当前没有使用 Library 候选状态，链类技巧测试可能不真实" : "";
    setStatusElementState(manualAdvancedStatus, `${summary} | summary-only debugJson，已跳过 overlay${suffix}`, warnAboutInput ? "warn" : "info");
    return;
  }

  if (!stepResult && !debugOverlaySource) {
    clearChainOverlay();
    setYzfOverlayModeNote(ui("overlayDebugOnly"));
    const warnAboutInput = inputFormatResolved !== "library" || !usedCandidateState;
    const suffix = warnAboutInput ? " | 当前没有使用 Library 候选状态，链类技巧测试可能不真实" : "";
    setStatusElementState(manualAdvancedStatus, summary + (status === "NoResult" ? " | NoResult" : "") + suffix, status === "GuardRejected" ? "warn" : (status === "Unsupported" || status === "InvalidRequest" || status === "InternalError" ? "error" : (warnAboutInput ? "warn" : "info")));
    return;
  }

  const overlaySample = stepResult
    ? normalizeManualAdvancedStepResult(stepResult, puzzleInfo?.puzzle || "", response)
    : normalizeYzfOverlaySample(debugOverlaySource);
  if (!hasRenderableOverlayPath(overlaySample)) {
    clearChainOverlay();
    const isDebugOnlyNoPath = !stepResult && debugOverlaySource;
    setYzfOverlayModeNote(isDebugOnlyNoPath ? (lang.value === "en" ? "Debug only; no renderable chain path" : "仅调试：无可画链路") : (lang.value === "en" ? "Manual advanced result; overlay unavailable" : "高级技巧结果：无法显示链路"));
    setStatusElementState(yzfOverlayStatus,
      isDebugOnlyNoPath
        ? `typ=${typ}; status=${status}; debugJson present but no renderable path; overlay skipped`
        : `title=${title || ""}; chainType=${chainType || ""}; stepResult present but no renderable path`,
      isDebugOnlyNoPath ? "debug" : "error");
    setStatusElementState(manualAdvancedStatus, `${summary} | ${stepResult ? "stepResult present but no renderable overlay path" : "debugJson has no renderable overlay path，已跳过 overlay"}`, stepResult ? "error" : "info");
    setOptionalTextBlock(manualAdvancedJson, [
      `title=${title || debugOverlaySource?.technique || "-"}`,
      `chainType=${chainType || debugOverlaySource?.chainType || "-"}`,
      `difficulty=${stepResult?.difficulty ?? debugOverlaySource?.difficulty ?? "-"}`,
      `nodes=${nodesCount || overlaySample?.path?.nodes?.length || 0}`,
      `edges=${edgesCount || overlaySample?.path?.edges?.length || 0}`,
      `eliminations=${eliminationsCount || overlaySample?.candidateMarks?.length || 0}`,
      stepResult ? (stepResult.description || title || "-") : "overlay skipped: debugJson has no renderable path",
      "",
      `conclusion: ${chainTexts?.conclusionText || actionText(stepResult) || "-"}`,
      ...(typ4AuditLines.length ? ["", ...typ4AuditLines] : []),
      "",
      "raw response JSON:",
      rawResponseText || JSON.stringify(response, null, 2),
    ].join("\n"));
    return;
  }
  renderChainOverlay(overlaySample);
  setYzfOverlayModeNote(stepResult ? (lang.value === "en" ? "Manual advanced result; also available in default solving when enabled" : "高级技巧结果；启用后也可由默认求解使用") : ui("overlayDebugOnly"));
  const warnAboutInput = inputFormatResolved !== "library" || !usedCandidateState;
  const resultLines = [
    `title=${title || "-"}`,
    `chainType=${chainType || "-"}`,
    `difficulty=${stepResult?.difficulty ?? debugOverlaySource?.difficulty ?? "-"}`,
    `nodes=${nodesCount || overlaySample?.path?.nodes?.length || 0}`,
    `edges=${edgesCount || overlaySample?.path?.edges?.length || 0}`,
    `eliminations=${eliminationsCount || overlaySample?.candidateMarks?.length || 0}`,
    "",
    "backend description:",
    stepResult?.description || title || "-",
    "",
    `conclusion: ${chainTexts?.conclusionText || actionText(stepResult) || "-"}`,
  ];
  if (typ4AuditLines.length) {
    resultLines.push("", ...typ4AuditLines);
  }
  resultLines.push(
    "",
    `inputSource=${inputSource}`,
    `inputFormatRequested=${inputFormatRequested}`,
    `inputFormatResolved=${inputFormatResolved}`,
    `inputLength=${inputLength}`,
    `usedCandidateState=${usedCandidateState}`,
    `parserName=${parserName}`,
    `inputPreview=${inputPreview}`,
    "",
    "requestJson:",
    JSON.stringify(request, null, 2),
    "",
    "raw response JSON:",
    rawResponseText || JSON.stringify(response, null, 2),
  );
  setOptionalTextBlock(manualAdvancedJson, resultLines.join("\n"));
  setStatusElementState(manualAdvancedStatus, summary + (warnAboutInput ? " | 当前没有使用 Library 候选状态，链类技巧测试可能不真实" : ""), warnAboutInput ? "warn" : "ok");
}

async function runManualAdvancedTechnique() {
  if (!engine || typeof engine.manual_advanced_step_json !== "function") {
    setStatusElementState(manualAdvancedStatus, "manual_advanced_step_json is not available", "error");
    return null;
  }
  const puzzleInfo = getCurrentPuzzleStringForManualAdvanced();
  if (!puzzleInfo.ok) {
    clearManualAdvancedResult(puzzleInfo.error);
    setStatusElementState(manualAdvancedStatus, puzzleInfo.error, "error");
    return null;
  }
  const request = buildManualAdvancedRequest();
  try {
    const raw = engine.manual_advanced_step_json(puzzleInfo.puzzle, JSON.stringify(request));
    const response = parseJson(raw);
    if (!response) {
      clearManualAdvancedResult("manual advanced 返回了不可解析 JSON");
      setStatusElementState(manualAdvancedStatus, "manual advanced 返回了不可解析 JSON", "error");
      return null;
    }
    renderManualAdvancedResponse(response, puzzleInfo, request, raw);
    return response;
  } catch (error) {
    console.error(error);
    clearManualAdvancedResult("manual advanced 调用失败");
    setStatusElementState(manualAdvancedStatus, `manual advanced 调用失败: ${error?.message || error}`, "error");
    return null;
  }
}

function clearManualAdvancedUiOnly() {
  clearManualAdvancedResult();
  setOptionalTextBlock(manualAdvancedSmokeOutput, "");
  setYzfOverlayModeNote(ui("overlayDebugOnly"));
}

function initManualAdvancedControls() {
  if (!btnManualAdvancedRun || !btnManualAdvancedClear) return;
  manualAdvancedTypSelect?.addEventListener("change", updateManualAdvancedTypUi);
  updateManualAdvancedTypUi();
  btnManualAdvancedRun.addEventListener("click", async () => {
    await runManualAdvancedTechnique();
  });
  btnManualAdvancedClear.addEventListener("click", () => {
    clearManualAdvancedUiOnly();
  });
}

async function runManualAdvancedBrowserSmoke() {
  const cases = [
    { name: "typ1", typ: "1", allow: false },
    { name: "typ2", typ: "2", allow: false },
    { name: "typ3", typ: "3", allow: false },
    { name: "typ4_allow_false", typ: "4", allow: false },
    { name: "typ4_allow_true", typ: "4", allow: true },
  ];
  const lines = [];
  for (const item of cases) {
    if (manualAdvancedTypSelect) manualAdvancedTypSelect.value = item.typ;
    if (manualAllowGrouped) manualAllowGrouped.checked = item.allow;
    if (manualReturnDebugJson) manualReturnDebugJson.checked = true;
    const response = await runManualAdvancedTechnique();
    const status = response?.status || "null";
    const title = response?.stepResult?.title || "";
    const chainType = response?.stepResult?.chainType || "";
    const guard = response?.guardRejectReason || "";
    lines.push(`${item.name}: status=${status}; title=${title}; chainType=${chainType}; guard=${guard}`);
  }
  const next = parseJson(engine.next_step_json());
  lines.push(`defaultNextStep: kind=${next?.kind || ""}; title=${next?.title || ""}`);
  setOptionalTextBlock(manualAdvancedSmokeOutput, lines.join("\n"));
}

async function runManualAdvancedBrowserE2E(params = new URLSearchParams(window.location.search)) {
  const importText = params.get("manualAdvancedImport") || "";
  const typ = params.get("manualAdvancedTyp") || "1";
  const inputFormat = params.get("manualAdvancedInputFormat") || "auto";
  const allow = params.get("manualAdvancedAllowGrouped") === "1";
  const debugMode = params.get("manualAdvancedDebugMode") === "1";
  const includeOverlay = params.get("manualAdvancedIncludeOverlayData") === "1";
  const includeRawGraphStats = params.get("manualAdvancedIncludeRawGraphStats") === "1";
  const returnDebugJson = params.get("manualAdvancedReturnDebugJson") !== "0";
  if (!importText) {
    setOptionalTextBlock(manualAdvancedSmokeOutput, "manualAdvancedBrowserE2E missing manualAdvancedImport");
    return null;
  }
  givens.value = importText;
  const importResult = await importPuzzleFromCurrentInput();
  if (!importResult?.ok) {
    setOptionalTextBlock(manualAdvancedSmokeOutput, `manualAdvancedBrowserE2E import failed: ${importResult?.error || "unknown"}`);
    return null;
  }
  if (manualAdvancedTypSelect) manualAdvancedTypSelect.value = typ;
  if (manualAdvancedInputFormatSelect) manualAdvancedInputFormatSelect.value = inputFormat;
  if (manualAllowGrouped) manualAllowGrouped.checked = allow;
  if (manualDebugMode) manualDebugMode.checked = debugMode;
  if (manualIncludeOverlayData) manualIncludeOverlayData.checked = includeOverlay;
  if (manualIncludeRawGraphStats) manualIncludeRawGraphStats.checked = includeRawGraphStats;
  if (manualReturnDebugJson) manualReturnDebugJson.checked = returnDebugJson;
  const inputInfo = getCurrentPuzzleStringForManualAdvanced();
  const response = await runManualAdvancedTechnique();
  const next = parseJson(engine.next_step_json());
  const lines = [
    `browserImportOk=${importResult?.ok ? 1 : 0}`,
    `inputSource=${inputInfo?.inputSource || ""}`,
    `inputFormat=${inputInfo?.inputFormat || ""}`,
    `inputLength=${inputInfo?.inputLength || 0}`,
    `inputPreview=${inputInfo?.inputPreview || ""}`,
    `usesCandidates=${inputInfo?.usesCandidates ? "true" : "false"}`,
    `responseStatus=${response?.status || ""}`,
    `responseTitle=${response?.stepResult?.title || ""}`,
    `responseChainType=${response?.stepResult?.chainType || ""}`,
    `responseEliminations=${Array.isArray(response?.stepResult?.eliminations) ? response.stepResult.eliminations.length : 0}`,
    `responseNodes=${Array.isArray(response?.stepResult?.nodes) ? response.stepResult.nodes.length : 0}`,
    `responseEdges=${Array.isArray(response?.stepResult?.edges) ? response.stepResult.edges.length : 0}`,
    `responseInputFormatResolved=${response?.inputFormatResolved || ""}`,
    `responseUsedCandidateState=${response?.usedCandidateState === true ? "true" : "false"}`,
    `nextStepTitle=${next?.title || ""}`,
  ];
  setOptionalTextBlock(manualAdvancedSmokeOutput, lines.join("\n"));
  return { importResult, inputInfo, response };
}

function candidatesJsonHasDigit(candidatesJson, index, digit) {
  const cells = candidatesJson?.cells || [];
  const cell = cells.find((item) => Number(item?.index) === Number(index));
  return Array.isArray(cell?.candidates) && cell.candidates.includes(digit);
}

async function runDefaultYzfBrowserE2E(params = new URLSearchParams(window.location.search)) {
  const importText = params.get("defaultYzfImport") || "";
  if (!importText) {
    setOptionalTextBlock(manualAdvancedSmokeOutput, "defaultYzfBrowserE2E missing defaultYzfImport");
    return null;
  }
  givens.value = importText;
  const importResult = await importPuzzleFromCurrentInput();
  if (!importResult?.ok) {
    setOptionalTextBlock(manualAdvancedSmokeOutput, `defaultYzfBrowserE2E import failed: ${importResult?.error || "unknown"}`);
    return null;
  }
  const inputInfo = getCurrentManualAdvancedInputInfo();
  const nextText = engine.next_step_json();
  currentHint = parseJson(nextText);
  renderBoard(currentHint);
  const beforeApplyCandidates = parseJson(engine.get_candidates_json());
  const applyText = engine.apply_hint_json();
  const applyResult = parseJson(applyText);
  const afterApplyCandidates = parseJson(engine.get_candidates_json());
  const postApplyInputInfo = getCurrentManualAdvancedInputInfo();
  const lines = [
    `browserImportOk=${importResult?.ok ? 1 : 0}`,
    `inputSource=${inputInfo?.inputSource || ""}`,
    `inputFormat=${inputInfo?.inputFormat || ""}`,
    `inputLength=${inputInfo?.inputLength || 0}`,
    `inputPreview=${inputInfo?.inputPreview || ""}`,
    `usesCandidates=${inputInfo?.usesCandidates ? "true" : "false"}`,
    `nextStepKind=${currentHint?.kind || ""}`,
    `nextStepTitle=${currentHint?.title || ""}`,
    `nextStepChainType=${currentHint?.chainType || ""}`,
    `nextStepEliminations=${Array.isArray(currentHint?.eliminations) ? currentHint.eliminations.length : 0}`,
    `nextStepNodes=${Array.isArray(currentHint?.nodes) ? currentHint.nodes.length : 0}`,
    `nextStepEdges=${Array.isArray(currentHint?.edges) ? currentHint.edges.length : 0}`,
    `inputFormatResolved=${currentHint?.inputFormatResolved || ""}`,
    `usedCandidateState=${currentHint?.usedCandidateState === true ? "true" : "false"}`,
    `hintPanel=${(hintPanel?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 240)}`,
    `beforeApplyHasR9C8Digit3=${candidatesJsonHasDigit(beforeApplyCandidates, 79, 3) ? "true" : "false"}`,
    `applyOk=${applyResult?.ok ? 1 : 0}`,
    `afterApplyHasR9C8Digit3=${candidatesJsonHasDigit(afterApplyCandidates, 79, 3) ? "true" : "false"}`,
    `postApplyInputSource=${postApplyInputInfo?.inputSource || ""}`,
    `postApplyUsesCandidates=${postApplyInputInfo?.usesCandidates ? "true" : "false"}`,
  ];
  setOptionalTextBlock(manualAdvancedSmokeOutput, lines.join("\n"));
  return { importResult, inputInfo, currentHint, applyResult };
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

function formatHintDesc(step) {
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

  if (lang.value === "zh") {
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
  const key = stepExplainKindKey(step);
  if (/fullhouse|hiddensingle|nakedsingle|single/.test(key)) return "single";
  if (/locked|pointing|claiming|intersection/.test(key)) return "locked";
  if (/naked.*(pair|triple|quad|subset)|hidden.*(pair|triple|quad|subset)|subset/.test(key)) return "subset";
  if (/skyscraper|2-string|two string|twostringkite|turbot/.test(key)) return "turbot";
  if (/fish|x-wing|xwing|swordfish|jellyfish|finned|sashimi|kraken|empty rectangle|eri/.test(key)) return "fish";
  if (/unique|ur|bug|avoidable|deadly|rectangle/.test(key)) return "unique";
  if (/als|ahs|almost locked|almost hidden/.test(key)) return "als";
  if (/wing|w-wing|xy-wing|xyz-wing|m-wing|s-wing|l-wing/.test(key)) return "wing";
  if (/whip|gwhip|braid|gbraid|forcing|chain|aic|nice loop|loop|ring|color/.test(key) || (Array.isArray(step.nodes) && step.nodes.length > 0)) return "chain";
  if (/rank|msls|multi-fish|multifish|base cover|cover set/.test(key) || Number(step.rank || 0) > 0) return "rank";
  if (/exocet|fireworks|jexocet|junior exocet/.test(key)) return "exocet";
  if (/oddagon|tridagon/.test(key)) return "oddagon";
  return "generic";
}

function stepExplainBuildLines(step = {}, snapshot = null) {
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
  const rank = Number(step.rank || 0);

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
    const isSky = /skyscraper/i.test(stepExplainKindKey(step));
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
  } else if (type === "fish") {
    lines.push(zh ? `本步把候选 ${cand || "鱼数字"} 的若干 base 区域与 cover 区域配对。` : `This step pairs base sets and cover sets for candidate ${cand || "the fish digit"}.`);
    lines.push(zh ? `base 中所有鱼数字都被 cover 覆盖，cover 里不属于 base 的同数字候选可删：${conclusion}。` : `All fish candidates in the bases are covered by the covers; same-digit candidates in the covers but outside the bases can be removed: ${conclusion}.`);
    proof = zh ? "数学逻辑：每个 base 区域都必须放入一个鱼数字；如果这些可能落点全部落在同数量的 cover 区域中，那么这些 cover 区域会被 base 的鱼数字占满。于是 cover 区域里额外的同数字候选不可能成立。带鳍鱼则用分支理解：鳍成立时直接限制删数；鳍不成立时退化为普通鱼，同样删数。" : "Logic: each base set must contain the fish digit once. If all possible positions in the bases are covered by the same number of cover sets, those covers are occupied by the base placements. Extra same-digit candidates in the covers cannot be true. For finned fish, either the fin is true and sees the deletion, or the fin is false and the pattern becomes a normal fish.";
    checks.push(zh ? "确认删数在 cover 区域内，但不在 base 与 cover 的交点结构中。" : "Verify the deletion is in a cover set but outside the base-cover intersections.");
  } else if (type === "unique") {
    lines.push(zh ? `本步使用唯一解前提，观察高亮的致命结构${cellsText ? `：${cellsText}` : ""}。` : `This step uses the uniqueness assumption and checks the highlighted deadly pattern${cellsText ? `: ${cellsText}` : ""}.`);
    lines.push(zh ? `若保留/放入被删候选，会形成两个数字可互换的第二解，因此结论 ${conclusion} 成立。` : `If the removed candidate were kept/placed, the pattern would allow two interchangeable solutions, so ${conclusion} follows.`);
    proof = zh ? "数学逻辑：标准数独题默认只有唯一解。UR、BUG、Avoidable Rectangle 等结构的危险点在于：某些格只剩同一组数字后，这些数字可以成对互换而不破坏行列宫约束，从而产生第二解。因此任何会把盘面推入该致命结构的候选都必须删除。" : "Logic: standard sudoku assumes a unique solution. UR, BUG, Avoidable Rectangle and related patterns identify a state where digits can be swapped without breaking row/column/box rules, creating a second solution. Any candidate that would force that deadly state must be false.";
    checks.push(zh ? "确认你接受唯一解前提；非唯一题不应使用这类技巧。" : "Confirm the puzzle is intended to have a unique solution; do not use uniqueness techniques on non-unique puzzles.");
  } else if (type === "als") {
    lines.push(zh ? `观察高亮的 ALS/AHS 结构${cellsText ? `：${cellsText}` : ""}。` : `Observe the highlighted ALS/AHS structures${cellsText ? `: ${cellsText}` : ""}.`);
    lines.push(zh ? `它们通过受限公共候选或强制候选互相约束，所以结论 ${conclusion} 可删/可出。` : `They constrain one another through restricted common candidates or forced candidates, so ${conclusion} follows.`);
    proof = zh ? "数学逻辑：ALS 是 N 个格含 N+1 个候选，少掉任意一个候选后就会变成锁定集。若两个 ALS 通过受限公共候选相连，该公共候选不能在两个 ALS 中同时失效；否则两边都会被迫成锁定集并造成容量冲突。能同时看到相关受限位置的外部候选因此不能成立。AHS 是对数字/位置关系的对偶表达。" : "Logic: an ALS has N cells and N+1 candidates; removing one candidate turns it into a locked set. When two ALSs share a restricted common candidate, that candidate cannot be absent from both ALSs, or both sides are forced into incompatible locked-set states. External candidates that see the restricted positions can therefore be removed. AHS is the dual view using digits/positions.";
    checks.push(zh ? "确认每个 ALS 在同一 house 内，且格数比候选数少 1。" : "Verify each ALS lies in one house and has one more candidate than cells.");
  } else if (type === "wing") {
    lines.push(zh ? `先找枢纽/翼格以及它们共享的候选关系。` : `First identify the pivot/wing cells and their shared candidates.`);
    lines.push(zh ? `不管枢纽取哪种可能，至少一个翼端会推出同一个限制，因此结论 ${conclusion} 成立。` : `Whichever pivot case is true, at least one wing enforces the same restriction, so ${conclusion} follows.`);
    proof = zh ? "数学逻辑：Wing 类技巧通常是一个小型二分证明。枢纽格的候选只有少数几种；逐一讨论后，每一种情况都会让某个翼端候选成立。若某个外部候选同时看见所有可能成立的翼端，它就不可能成立。" : "Logic: wing techniques are small case splits. The pivot has only a few possibilities; in every case, one of the wing candidates becomes true. Any external candidate that sees all possible true wing candidates cannot be true.";
    checks.push(zh ? "确认被删候选同时看见所有可能推出的翼端同数字候选。" : "Verify the removed candidate sees every possible same-digit wing endpoint.");
  } else if (type === "chain") {
    lines.push(zh ? `按链路顺序阅读节点${nodesText ? `：${nodesText}` : ""}。` : `Read the chain in node order${nodesText ? `: ${nodesText}` : ""}.`);
    lines.push(zh ? `强弱关系交替传递真假；端点、环或反证路径推出结论 ${conclusion}。` : `Truth alternates through strong and weak links; endpoints, loops, or contradiction paths imply ${conclusion}.`);
    proof = zh ? "数学逻辑：强关系表示两端至少一真，弱关系表示两端不能同真。沿链假设起点为真/假后，真假会被逐段强制传递。若两个端点共同看到某候选，则该候选为真会迫使两个端点都假而违反链的至少一真；若形成不连续环或矛盾路径，则某个候选会导致自身冲突、区域无候选或格子无候选，所以它可删。Whip/Braid 可理解为假设某候选成立后，经过一串强制选择必达矛盾。" : "Logic: a strong link means at least one end is true; a weak link means both ends cannot be true. Truth values propagate along the chain. If two endpoints see a candidate, making that candidate true would make both endpoints false, contradicting the chain's at-least-one-true result. In a discontinuous loop or contradiction path, an assumption forces a conflict or an empty cell/house, so the assumed candidate is false. Whip/Braid steps are contradiction proofs driven by forced choices.";
    checks.push(zh ? "确认线条方向只是阅读辅助；真正依据是强/弱关系和端点可见性。" : "Line direction is a reading aid; the proof rests on strong/weak links and endpoint visibility.");
  } else if (type === "rank") {
    lines.push(zh ? `本步把 base 集合、cover 集合和候选覆盖关系作为整体比较。` : `This step compares base sets, cover sets, and candidate coverage as one structure.`);
    lines.push(zh ? `当 cover 足以覆盖 base 的必要占位，多余交叠位置或 rank 约束位置可得出 ${conclusion}。` : `When the covers account for the required base placements, extra overlaps or rank-constrained positions imply ${conclusion}.`);
    proof = zh ? "数学逻辑：秩理论把“必须满足的约束”看成 base，把“可容纳这些满足项的位置”看成 cover。若 cover 数量与 base 数量相等，cover 会被必要项占满，额外候选不能成立；若存在 rank 差，则删数/出数来自覆盖冗余、交叠或 guardian 对所有可能性的限制。" : "Logic: rank logic treats required constraints as bases and the places that can satisfy them as covers. If the number of covers equals the number of bases, the covers are filled by the required placements and extra candidates are false. With nonzero rank, eliminations/placements come from cover redundancy, overlaps, or guardians restricting all possibilities.";
    checks.push(zh ? "优先核对 base/cover 数量、rank 标注和删数是否落在被覆盖的额外位置。" : "Check base/cover counts, rank, and whether deletions are covered extras.");
  } else if (type === "exocet") {
    lines.push(zh ? `观察 base cells、target cells、cross/guardian 区域的关系。` : `Observe the relation among base cells, target cells, cross cells, and guardians.`);
    lines.push(zh ? `base 的真值组合会强制 target/cross 的可选范围，因此结论 ${conclusion} 成立。` : `The base-value combination forces the target/cross possibilities, so ${conclusion} follows.`);
    proof = zh ? "数学逻辑：Exocet/Fireworks 类结构把一组 base 候选与目标格候选绑定。base 中最终选出的数字必须在目标区域得到一致落点；凡是无法与任何合法 base 组合兼容的候选，或会让所有 base 组合失败的候选，都可以删除。guardian 的作用是覆盖例外分支：每个例外若成立也会推出同一结论。" : "Logic: Exocet/Fireworks patterns bind base candidates to target candidates. The digits chosen in the base must have compatible placements in the targets/cross cells. Candidates incompatible with every legal base combination, or candidates that make all combinations fail, can be removed. Guardians cover exception branches that lead to the same conclusion.";
    checks.push(zh ? "核对 base 候选集合与 target 候选集合是否一致或受同一组数字约束。" : "Check that base and target candidates match or are constrained by the same digit set.");
  } else if (type === "oddagon") {
    lines.push(zh ? `观察奇环/奇数结构中的交替候选。` : `Observe the alternating candidates in the odd loop/pattern.`);
    lines.push(zh ? `若保留某候选，会迫使奇数长度结构无法二色一致，因此结论 ${conclusion} 成立。` : `Keeping the candidate would force an impossible two-coloring around an odd structure, so ${conclusion} follows.`);
    proof = zh ? "数学逻辑：Oddagon/Tridagon 利用奇数长度交替结构。若某组候选被迫沿结构两两交替，偶环可以一致闭合，奇环却会在回到起点时要求同一候选同时真/假或两个相同状态相邻，因此造成矛盾。触发该矛盾的候选必须删除。" : "Logic: Oddagon/Tridagon patterns use an odd alternating structure. Pairwise alternation can close on an even loop, but on an odd loop it returns to the start with inconsistent truth requirements. Any candidate that triggers that contradiction is false.";
    checks.push(zh ? "确认结构长度/分组确实形成奇数交替，而不是普通偶环。" : "Verify the structure is truly odd-alternating, not an ordinary even loop.");
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
  if (rank) meta.push(`rank ${rank}`);

  return { type, lines, proof, checks, meta };
}

function buildStepExplanationContent(step, snapshot = currentSnapshot) {
  const zh = lang.value === "zh";
  const data = stepExplainBuildLines(step, snapshot);
  const fragment = document.createDocumentFragment();

  const subtitle = document.createElement("div");
  subtitle.className = "step-explain-subtitle";
  subtitle.textContent = `${stepDisplayName(step)} · ${formatHintDesc(step)}`;
  fragment.appendChild(subtitle);

  const ol = document.createElement("ol");
  data.lines.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    ol.appendChild(li);
  });
  fragment.appendChild(ol);

  const proof = document.createElement("div");
  proof.className = "step-explain-proof";
  proof.textContent = data.proof;
  fragment.appendChild(proof);

  if (data.checks.length > 0) {
    const ul = document.createElement("ul");
    data.checks.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ul.appendChild(li);
    });
    fragment.appendChild(ul);
  }

  if (data.meta.length > 0) {
    const meta = document.createElement("div");
    meta.className = "step-explain-meta";
    data.meta.forEach((item) => {
      const span = document.createElement("span");
      span.className = "step-explain-pill";
      span.textContent = item;
      meta.appendChild(span);
    });
    fragment.appendChild(meta);
  }

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

function resetStepExplainDialogPosition() {
  if (!stepExplainDialog) return;
  stepExplainDialog.style.left = "50%";
  stepExplainDialog.style.top = "50%";
  stepExplainDialog.style.transform = "translate(-50%, -50%)";
}

function openStepExplanationDialog() {
  const ctx = currentStepExplainContext;
  if (!ctx?.step || !ctx.step.valid) {
    setStatus(ui("stepExplainUnavailable"));
    return;
  }
  if (!stepExplainDialog || !stepExplainDialogContent) return;
  setTextById("stepExplainDialogTitle", ui("stepExplainTitle"));
  setTextById("stepExplainDialogClose", ui("close"));
  stepExplainDialogContent.replaceChildren(buildStepExplanationContent(ctx.step, ctx.snapshot));
  stepExplainDialog.classList.remove("hidden");
  resetStepExplainDialogPosition();
  if (typeof stepExplainDialog.showModal === "function") {
    stepExplainDialog.showModal();
  }
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

function colorCandidateMapForCell(hint, index) {
  const result = new Map();
  for (const item of hint?.colorCands || []) {
    if (Number(item?.index) !== index) continue;
    const color = Number(item?.color || item?.colorIndex || 0);
    if (!Number.isInteger(color) || color < 1 || color > 14) continue;
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
  board.replaceChildren();

  if (!snapshot) {
    boardMeta.textContent = "";
    clearManualChainEndpointHighlights();
    clearManualMarkOverlay();
    hintPanel.textContent = lang.value === "en" ? "Waiting for wasm to load." : "等待 wasm 加载。";
    renderStepExplanation(null, null);
    return;
  }

  const placements = hintPlacementMap(hint);
  const eliminations = hintEliminationMap(hint);
  const isChainHint = stepResultHasRenderableChain(hint);
  const structure = hintStructureSet(hint);
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
    node.title = `r${Math.floor(index / 9) + 1}c${(index % 9) + 1}`;
    node.addEventListener("click", () => {
      selectedIndex = index;
      handleCellTap(index);
    });
    node.addEventListener("contextmenu", (event) => {
      if (!manualMarksActive()) return;
      event.preventDefault();
      selectedIndex = index;
      if (manualMarkModeValue() === "cellColor") {
        applyManualMarkTarget(index, 0, "secondary");
      } else {
        renderBoardSnapshot(currentSnapshot, currentHint);
        setManualMarkStatus(uif("markCellSelected", { cell: manualMarkCellText(index) }));
      }
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
        ? colorCandidateMapForCell(hint, index)
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
    hintPanel.textContent = formatHintDesc(hint);
    renderStepExplanation(hint, snapshot);
    if (isChainHint) {
      setYzfOverlayModeNote("default solver result");
      renderChainOverlay(normalizeDefaultSolverStepResult(hint, snapshot.board || "", hint));
    } else {
      setYzfOverlayModeNote("");
      clearRenderedChainOverlay();
    }
  } else {
    renderStepExplanation(null, snapshot);
    setYzfOverlayModeNote("");
    clearRenderedChainOverlay();
  }

  // Solver overlay rendering may touch candidate classes for chain hints.
  // Re-apply manual-chain endpoint classes last so the user's hand-drawn
  // start/end markers remain visible and are not masked by solver highlights.
  applyManualChainEndpointHighlights();
}

function clearStepViewState(options = {}) {
  const {
    resetSelectedIndex = false,
    clearSolveTree = true,
    clearAllStepsTree = true,
    hideOutput = true,
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
  if (hideOutput) {
    out.classList.add("hidden");
  }
}

function applySnapshotRefreshState(nextSnapshot = null) {
  currentSnapshot = nextSnapshot || getCurrentSnapshot();
  clearStepViewState();
  syncManualAdvancedInputStateFromSnapshot(currentSnapshot);
  renderBoardSnapshot(currentSnapshot, null);
  updateInputControls();
  scheduleAppSessionSave();
}

function resetBoardContextForSnapshot(nextSnapshot = null, options = {}) {
  currentSnapshot = nextSnapshot || getCurrentSnapshot();
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
  if (isOcrDraftSnapshot(currentSnapshot)) {
    toggleOcrDraftValue(index, selectedDigit);
    return;
  }
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
  if (isOcrDraftSnapshot(currentSnapshot)) {
    toggleOcrDraftCandidate(index, selectedDigit);
    return;
  }
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
    button.addEventListener("click", () => {
      selectedDigit = digit;
      if (manualMarksActive() && manualMarkNeedsDigit() && selectedIndex >= 0) {
        applyManualMarkTarget(selectedIndex, digit, manualMarkButton);
      }
      updateInputControls();
    });
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
}

function loadTechniqueState() {
  if (!engine) return [];
  const result = parseJson(engine.techniques_json());
  whipMemoryMode = normalizeWhipMemoryMode(result?.whipMemoryMode || whipMemoryMode);
  techniqueState = mergeReferenceTechniques(result?.techniques || []);
  return techniqueState;
}

function normalizeWhipMemoryMode(value) {
  return ["auto", "normal", "large"].includes(value) ? value : "auto";
}

function getTechniqueConfigPayload(state = techniqueState) {
  const payload = { whipMemoryMode: normalizeWhipMemoryMode(whipMemoryMode) };
  for (const item of (state || []).filter((tech) => tech.implemented !== false)) {
    payload[item.kind] = Boolean(item.enabled);
  }
  return payload;
}

function applyTechniqueState(nextState, nextWhipMemoryMode = whipMemoryMode) {
  if (!engine) return;
  whipMemoryMode = normalizeWhipMemoryMode(nextWhipMemoryMode);
  const payload = getTechniqueConfigPayload(nextState);
  const result = parseJson(engine.set_techniques_json(JSON.stringify(payload)));
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
  memorySelect.addEventListener("change", () => applyTechniqueState(state, memorySelect.value));
  memoryLabel.appendChild(memorySelect);
  memoryRow.appendChild(memoryLabel);
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
    syncManualAdvancedInputStateFromSnapshot(currentSnapshot);
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

function updateTrainingTechniqueSelectColor() {
  if (!trainingTechniqueSelect) return;
  trainingTechniqueSelect.style.backgroundColor = techniqueBackgroundColor(trainingTechniqueSelect.value);
}

function generateTrainingPuzzleInWorker(kind, difficulty, maxAttempts = 0, summary = false) {
  if (window.YZF_STANDALONE || !window.Worker) {
    if (!engine) {
      throw new Error(ui("wasmLoadFailed"));
    }
    const method = summary
      ? "generate_training_puzzle_summary_json"
      : "generate_training_puzzle_json";
    if (typeof engine[method] !== "function") {
      throw new Error(ui("trainingWorkerFailed"));
    }
    return Promise.resolve(engine[method](kind || "BruteForce", Number(difficulty || 0), Number(maxAttempts || 0)));
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
    worker.postMessage({ type: "generate", kind, difficulty, maxAttempts, summary });
  });
}

function startTrainingTimer(label) {
  const start = Date.now();
  setStatus(uif("trainingSearching", { technique: label, elapsed: uif("seconds", { seconds: 0 }) }));
  return window.setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    setStatus(uif("trainingSearching", { technique: label, elapsed: uif("seconds", { seconds: elapsed }) }));
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

function batchLine(result, index) {
  const rating = result.rating || {};
  return [
    index,
    result.technique || "",
    result.puzzle || "",
    result.solution || "",
    result.difficultyName || selectedDifficultyLabel(),
    result.attempts ?? "",
    result.clues ?? "",
    rating.er ?? "",
    rating.ep ?? "",
    rating.ed ?? "",
    rating.aig ?? "",
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
    Number(record?.sourceStepIndex || 0) > 0
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
  let hardestRank = 0;
  let hardestKind = "";
  let hardestTitle = "";
  for (const record of path || []) {
    const step = record?.step || record || {};
    const stepScore = scoreForStepRecord(record);
    const stepRank = Number(step?.rank || 0);
    score += stepScore;
    const kind = step?.kind || record?.kind || "";
    if (stepScore > hardestScore || (stepScore === hardestScore && stepRank > hardestRank)) {
      hardestScore = stepScore;
      hardestRank = stepRank;
      hardestKind = kind;
      hardestTitle = step?.title || stepDisplayName(step) || kind;
    }
  }
  return {
    type: "YZFRate",
    score,
    hardestScore,
    hardestRank,
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
  } catch (_error) {
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
  if (delta < 0) return `路径缩短 ${Math.abs(delta)} 步`;
  if (delta > 0) return `路径增加 ${delta} 步`;
  return "步数未变";
}

function branchScoreDeltaLabel(oldScore, newScore) {
  const delta = Number(newScore || 0) - Number(oldScore || 0);
  if (delta < 0) return `评分降低 ${Math.abs(delta)}`;
  if (delta > 0) return `评分提高 ${delta}`;
  return "评分未变";
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
  title.textContent = "分叉路径已应用";

  const detail = document.createElement("div");
  detail.className = "branch-panel-detail";
  const stepText = Number(summary.replacedStepIndex || 0) > 0 ? `第 ${summary.replacedStepIndex} 步` : "某一步";
  const oldSteps = Number(summary.oldSteps || 0);
  const newSteps = Number(summary.newSteps || 0);
  const oldScore = Number(summary.oldScore || 0);
  const newScore = Number(summary.newScore || 0);
  const candidateIndex = Number(summary.candidateIndex || 0);
  const hash = String(summary.beforeHash || "").slice(0, 16);
  const stepDelta = newSteps - oldSteps;
  const scoreDelta = newScore - oldScore;
  detail.textContent = `${stepText} ← 可选 #${candidateIndex || "?"}；步数 ${oldSteps}→${newSteps}（${signedDeltaText(stepDelta)}），评分 ${oldScore}→${newScore}（${signedDeltaText(scoreDelta)}），hash=${hash}`;

  const delta = document.createElement("div");
  delta.className = `branch-panel-delta ${branchDeltaTone(oldSteps, newSteps, oldScore, newScore)}`;
  delta.textContent = `${branchStepDeltaLabel(oldSteps, newSteps)}；${branchScoreDeltaLabel(oldScore, newScore)}`;

  const titleChange = document.createElement("div");
  titleChange.className = "branch-panel-change";
  const oldTitle = String(summary.oldTitle || "原步骤");
  const newTitle = String(summary.newTitle || "新步骤");
  if (oldTitle && newTitle && oldTitle !== newTitle) {
    titleChange.textContent = `技法变化：${oldTitle} → ${newTitle}`;
  } else {
    titleChange.textContent = `技法保持：${newTitle || oldTitle || "未命名步骤"}`;
  }

  const actions = document.createElement("div");
  actions.className = "branch-panel-actions";
  const undoButton = document.createElement("button");
  undoButton.type = "button";
  undoButton.className = "compact";
  undoButton.textContent = "撤销分叉";
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
    setStatus("没有可撤销的分叉路径。");
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
  setStatus("已撤销最近一次分叉，恢复原解题路径。");
}

function rebuildSolvePathWithCandidate(candidateRecord) {
  if (!engine) return;
  if (!isBranchableOptionalStep(candidateRecord)) {
    setStatus("当前可选步骤没有绑定到解题路径中的 before 盘面，不能替换路径。");
    return;
  }
  if (typeof engine.solve_path_for_import_json !== "function") {
    setStatus("当前 wasm 尚未包含 solve_path_for_import_json，请重新编译并刷新页面。");
    return;
  }

  const replaceIndex = findSolvePathReplacementIndex(candidateRecord);
  if (replaceIndex < 0) {
    setStatus("替换失败：自动解题路径中没有找到相同 beforeHash 的步骤。");
    return;
  }

  const originalRecord = lastSolveData?.path?.[replaceIndex] || null;
  if (originalRecord?.step && candidateRecord.step && isSameStepResult(originalRecord.step, candidateRecord.step)) {
    setStatus(`可选步骤与当前路径第 ${replaceIndex + 1} 步相同，未替换。`);
    return;
  }

  const replacementStep = candidateRecord.step;
  const beforeSnapshot = candidateRecord.before;
  const beforeHash = stepRecordBeforeHash(candidateRecord);
  const afterSnapshot = applyStepToSnapshot(beforeSnapshot, replacementStep);
  if (!afterSnapshot) {
    setStatus("替换失败：无法由 before + 可选步骤推出后续盘面。");
    return;
  }

  const afterLibrary = snapshotToLibraryString(afterSnapshot);
  if (!afterLibrary) {
    setStatus("替换失败：替换后的盘面无法序列化为候选盘状态。");
    return;
  }

  let tailData = null;
  try {
    tailData = parseJson(engine.solve_path_for_import_json(afterLibrary, 500));
  } catch (error) {
    console.error(error);
  }
  if (!tailData?.ok) {
    setStatus(`替换失败：后续路径重算失败：${tailData?.error || "未知错误"}`);
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
  setStatus(`已用可选步骤替换第 ${replaceIndex + 1} 步，并从此处重算后续路径。新路径 ${combinedPath.length} 步。`);
}

function installOptionalStepBranchHandlers(item, record) {
  if (!canReplaceOptionalStep(record)) return;
  const row = item.querySelector(":scope > .tree-row");
  if (!row) return;
  row.classList.add("branchable-step-row");
  row.title = "单击预览；右键或长按：替换路径并从此处重算";
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
  if (step.rank) {
    children.push(renderLeaf("rank", String(step.rank), "number"));
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

  const summaryText = isRankedChainSummaryStep(step) ? rankedChainSummaryText(step) : "";
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
  const hardest = rating?.hardestTitle || (rating?.hardestKind ? `${rating.hardestKind}${Number(rating.hardestRank || 0) > 0 ? `[${rating.hardestRank}]` : ""}` : "");
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
  const ref = referenceTechniqueForStep(step);
  if (ref) {
    return {
      key: ref.kind,
      label: techniqueName({ kind: ref.kind, title: ref.title }),
      order: ref.order ?? 9999,
    };
  }
  const label = allStepsTechniqueLabel(record) || String(step.chainType || step.kind || "Other");
  return { key: label, label, order: 9999 };
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
  const step = record?.step || record || {};
  const query = normalizedFilterText(allStepsFilterState.query);
  if (query) {
    const haystack = allStepsRecordSearchText(record);
    const tokens = query.split(/\s+/).filter(Boolean);
    if (!tokens.every((token) => haystack.includes(token))) return false;
  }
  if (allStepsFilterState.technique && allStepsTechniqueFilterInfo(record).key !== allStepsFilterState.technique) {
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
  const techniques = [...byKey.values()]
    .sort((a, b) => (a.order - b.order) || a.label.localeCompare(b.label))
    .map((info) => ({ value: info.key, label: info.label }));
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
  out.classList.add("hidden");
  out.textContent = "";
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
    window.runManualAdvancedTechnique = runManualAdvancedTechnique;
  }
  buildNumpad();
  loadTechniqueState();
  const restoredSession = await restoreAppSession();
  renderTechniques();
  activateTab("controls");
  log(ui("wasmLoaded"));
  if (!restoredSession) {
    renderBoard(null);
  }
  if (!APP_DEBUG_MODE) {
    document.querySelector(".yzf-debug-panel")?.classList.add("hidden");
    manualAdvancedSmokeOutput?.classList.add("hidden");
  }
  initYzfTyp4DebugOverlayControls();
  initManualAdvancedControls();
  initManualMarksControls();
  const params = APP_URL_PARAMS;
  if (params.get("manualAdvancedSmoke") === "1") {
    setTimeout(() => {
      runManualAdvancedBrowserSmoke().catch((error) => {
        console.error(error);
        setOptionalTextBlock(manualAdvancedSmokeOutput, `manualAdvancedSmoke failed: ${error?.message || error}`);
      });
    }, 300);
  }
  if (params.get("manualAdvancedBrowserE2E") === "1") {
    setTimeout(() => {
      runManualAdvancedBrowserE2E(params).catch((error) => {
        console.error(error);
        setOptionalTextBlock(manualAdvancedSmokeOutput, `manualAdvancedBrowserE2E failed: ${error?.message || error}`);
      });
    }, 500);
  }
  if (params.get("defaultYzfSmoke") === "1") {
    setTimeout(() => {
      runDefaultYzfBrowserE2E(params).catch((error) => {
        console.error(error);
        setOptionalTextBlock(manualAdvancedSmokeOutput, `defaultYzfBrowserE2E failed: ${error?.message || error}`);
      });
    }, 500);
  }
}

for (const button of tabButtons) {
  button.addEventListener("click", () => {
    activateTab(button.dataset.tab);
  });
}

trainingTechniqueSelect?.addEventListener("change", updateTrainingTechniqueSelectColor);

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

async function importPuzzleFromCurrentInput(options = {}) {
  if (!engine) return;
  const rawInput = (givens.value || "").trim();
  if (options.clipboardFallback && !options.clipboardAlreadyTried && !rawInput) {
    const clipboard = await readClipboardTextForLoad();
    if (clipboard.ok) {
      givens.value = clipboard.text;
      setStatus(ui("inputEmptyClipboardLoaded"));
      return importPuzzleFromCurrentInput({ ...options, clipboardAlreadyTried: true });
    }
    setStatus(uif("inputEmptyClipboardFailed", { error: clipboard.error }));
    log(ui("loadFailedPrefix") + uif("inputEmptyClipboardFailed", { error: clipboard.error }));
    return { ok: false, error: clipboard.error };
  }
  let importText = "";
  try {
    importText = await preprocessImportText(rawInput);
  } catch (error) {
    if (options.clipboardFallback && !options.clipboardAlreadyTried) {
      const clipboard = await readClipboardTextForLoad();
      if (clipboard.ok && clipboard.text !== rawInput) {
        givens.value = clipboard.text;
        setStatus(ui("importClipboardRetry"));
        return importPuzzleFromCurrentInput({ ...options, clipboardAlreadyTried: true });
      }
    }
    const message = error instanceof Error ? error.message : "Coach puzzle string decode failed";
    log(ui("loadFailedPrefix") + message);
    setStatus(ui("loadFailedPrefix") + message);
    return { ok: false, error: message };
  }
  const result = parseJson(engine.import_puzzle_json(importText));
  if (result?.ok) {
    originalBoard = result.state?.givens || result.givens || result.puzzle;
    givens.value = result.givens === result.puzzle && !result.hasCandidates ? result.puzzle : rawInput;
    resetBoardContextForSnapshot(result.state, { resetSelectedIndex: true });
    setManualAdvancedInputStateWithBoardKey(
      importText,
      inferManualAdvancedStoredFormat(result, importText),
      !!result.hasCandidates,
      getSnapshotManualAdvancedBoardKey(currentSnapshot),
    );
    log(JSON.stringify(result, null, 2));
    setStatus(uif("importedPuzzle", { format: result.format, candidates: result.hasCandidates ? ui("importedWithCandidates") : "" }));
    updateInputControls();
    scheduleAppSessionSave();
    return result;
  } else {
    clearStepViewState({ resetSelectedIndex: true });
    if (options.clipboardFallback && !options.clipboardAlreadyTried) {
      const clipboard = await readClipboardTextForLoad();
      if (clipboard.ok && clipboard.text !== rawInput) {
        givens.value = clipboard.text;
        setStatus(ui("importClipboardRetry"));
        return importPuzzleFromCurrentInput({ ...options, clipboardAlreadyTried: true });
      }
    }
    setManualAdvancedInputStateWithBoardKey("", "unknown", false, "");
    const error = result?.error || ui("importUnknownFormat");
    log(ui("loadFailedPrefix") + error);
    setStatus(ui("loadFailedPrefix") + error);
    return { ok: false, error };
  }
}


async function importCoachJsonFromLocalOcr(coachJson, summary = {}) {
  return importPuzzleFromOcrResult(coachJson, summary);
}

async function recognizeAndImportImageFile(file) {
  if (!file) return { ok: false, error: ui("ocrNoImageSelected") };
  if (!file.type?.startsWith?.("image/")) {
    const error = ui("ocrInvalidImageFile");
    setStatus(error);
    return { ok: false, error };
  }
  try {
    setStatus(ui("ocrRecognizingLocal"));
    const { recognizeSudokuImageToCoachJson } = await loadLocalSudokuOcrModule();
    const ocr = await recognizeSudokuImageToCoachJson(file);
    if (!ocr?.coachJson) throw new Error(ui("ocrNoCoachJson"));
    return await importCoachJsonFromLocalOcr(ocr.coachJson, ocr);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(uif("ocrFailed", { message }));
    log(uif("ocrFailed", { message }));
    return { ok: false, error: message };
  } finally {
    if (imageOcrInput) imageOcrInput.value = "";
    if (imageOcrCameraInput) imageOcrCameraInput.value = "";
  }
}

btnLoad.addEventListener("click", async () => {
  await importPuzzleFromCurrentInput({ clipboardFallback: true });
});


async function recognizeFirstClipboardImage() {
  if (!navigator.clipboard?.read) {
    const message = ui("ocrClipboardUnsupported");
    setStatus(message);
    log(message);
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
    log(uif("ocrClipboardReadFailed", { message }));
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
  const items = Array.from(event.clipboardData?.items || []);
  const imageItem = items.find((item) => item.type?.startsWith?.("image/"));
  if (!imageItem) return;
  const file = imageItem.getAsFile();
  if (!file) return;
  event.preventDefault();
  await recognizeAndImportImageFile(file);
});

btnGenerate.addEventListener("click", () => {
  if (!engine) return;
  const difficulty = Number(difficultySelect.value || 0);
  setStatus(uif("generatingPuzzle", { difficulty: selectedDifficultyLabel() }));
  const result = parseJson(engine.generate_puzzle_difficulty_json(difficulty, 0));
  if (!result?.ok) {
    const last = result?.lastRating ? uif("lastRating", { rating: formatRating(result.lastRating) }) : "";
    setStatus(uif("generateFailed", { difficulty: result?.difficultyName || selectedDifficultyLabel(), last }));
    return;
  }

  originalBoard = result.state?.givens || result.puzzle;
  givens.value = result.puzzle;
  resetBoardContextForSnapshot(result.state, { resetSelectedIndex: true });
  setManualAdvancedInputStateWithBoardKey(result.puzzle, "puzzle81", false, `puzzle81:${result.puzzle}`);
  setStatus(uif("generatedPuzzle", { difficulty: result.difficultyName, clues: result.clues, rating: formatRating(result.rating) }));
  updateInputControls();
});

btnBatchStop?.addEventListener("click", () => {
  batchAbortRequested = true;
  updateBatchStatus(ui("stoppingBatch"));
});

btnBatchGenerate?.addEventListener("click", async () => {
  if (!engine) return;
  const target = Math.max(1, Math.min(500, Number(batchCount?.value || 1)));
  const filename = sanitizeFilename(batchFilename?.value || "sudoku-batch.txt");
  const difficulty = Number(difficultySelect.value || 0);
  const trainingKind = trainingTechniqueSelect?.value || "";
  const trainingLabel = trainingTechniqueSelect?.selectedOptions?.[0]?.textContent || trainingKind;
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
    await writer.write("index\ttechnique\tpuzzle\tsolution\tdifficulty\ttrainingAttempts\tclues\tER\tEP\tED\tAIG\n");
    updateBatchStatus(trainingKind
      ? uif("batchTrainingStart", { target, technique: trainingLabel, difficulty: selectedDifficultyLabel() })
      : uif("batchStart", { target, difficulty: selectedDifficultyLabel() }));
    const batchProgressStatus = () => {
      const prefix = batchAbortRequested ? ui("batchStoppingPrefix") : "";
      const lastText = lastPuzzleAttempts ? uif("batchLastPuzzle", { attempts: lastPuzzleAttempts }) : "";
      const values = { prefix, generated, target, attempts, failed, last: lastText, elapsed: formatElapsedSeconds(startTime) };
      return trainingKind ? uif("batchTrainingProgress", values) : uif("batchProgress", values);
    };
    timer = window.setInterval(() => {
      updateBatchStatus(batchProgressStatus());
    }, 1000);
    await paintBeforeLongTask();

    while (generated < target && !batchAbortRequested) {
      attempts += 1;
      const resultText = trainingKind
        ? await generateTrainingPuzzleInWorker(trainingKind, difficulty, 0, true)
        : engine.generate_puzzle_difficulty_json(difficulty, 0);
      const result = parseJson(resultText);
      if (result?.ok) {
        if (!trainingKind) {
          const solve = parseJson(engine.solve_summary_json(500));
          if (solve?.status === "invalid_step") {
            result.solve = solve;
            await stopBatchOnInvalidStep(writer, result, trainingKind);
            await writer.close();
            return;
          }
        }
        generated += 1;
        await writer.write(batchLine(result, generated));
        lastPuzzleAttempts = trainingKind
          ? uif("batchSearchAttempts", { attempts: result.attempts ?? "?" })
          : uif("batchGenerateAttempts", { attempts: result.attempts ?? "?" });
        updateBatchStatus(uif("batchLatest", { status: batchProgressStatus(), rating: formatRating(result.rating) }));
      } else {
        if (result?.status === "invalid_step") {
          await stopBatchOnInvalidStep(writer, result, trainingKind);
          await writer.close();
          return;
        }
        failed += 1;
        updateBatchStatus(batchProgressStatus());
      }
      await paintBeforeLongTask();
    }

    await writer.close();
    const mode = writer.direct ? ui("batchWrittenDirect") : ui("batchDownloadReady");
    updateBatchStatus(trainingKind
      ? uif("batchTrainingDone", { mode, filename, technique: trainingLabel, generated, target, attempts, elapsed: formatElapsedSeconds(startTime) })
      : uif("batchDone", { mode, filename, generated, target, attempts, elapsed: formatElapsedSeconds(startTime) }));
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
  if (!kind) {
    setStatus(ui("trainingNeedTechnique"));
    return;
  }
  const label = trainingTechniqueSelect?.selectedOptions?.[0]?.textContent || kind;
  const timer = startTrainingTimer(label);
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
            log(JSON.stringify(result, null, 2));
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

        setManualAdvancedInputStateWithBoardKey(
          puzzle || snapshotBoardString(currentSnapshot),
          "puzzle81",
          false,
          `puzzle81:${puzzle || snapshotBoardString(currentSnapshot)}`
        );

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
        log(JSON.stringify(result, null, 2));
        return;
      }
      const last = result?.lastRating ? ui("lastRating").replace("{rating}", formatRating(result.lastRating)) : "";
      setStatus(uif("trainingFailed", { error: result?.error || label, last }));
      log(JSON.stringify(result, null, 2));
      return;
    }

    if (!engine.load(result.puzzle)) {
      setStatus(ui("trainingSyncFailed"));
      log(JSON.stringify(result, null, 2));
      return;
    }
    originalBoard = result.state?.givens || result.puzzle;
    givens.value = result.puzzle;
    currentHint = null;
    selectedIndex = -1;
    currentSnapshot = result.state || getCurrentSnapshot();
    setManualAdvancedInputStateWithBoardKey(result.puzzle, "puzzle81", false, `puzzle81:${result.puzzle}`);
    previewSnapshotActive = false;
    currentPreviewRecord = null;
    lastAllStepsData = null;
    allStepsTree?.replaceChildren();
    clearBranchState();
    renderBoardSnapshot(currentSnapshot, null);
    if (result.solve) {
      renderSolvePath(JSON.stringify(result.solve));
    } else {
      tree.replaceChildren();
      lastSolveData = null;
      clearBranchState();
    }
    out.classList.add("hidden");
    out.textContent = JSON.stringify(result, null, 2);
    setStatus(uif("trainingGenerated", { technique: label, attempts: result.attempts, rating: formatRating(result.rating) }));
    updateInputControls();
  } finally {
    window.clearInterval(timer);
    btnGenerateTraining.disabled = false;
  }
});

btnExportPuzzle?.addEventListener("click", async () => {
  const puzzle = exportedPuzzleString();
  if (!puzzle) {
    setStatus(ui("exportUnavailable"));
    log(JSON.stringify({
      ok: false,
      error: "exported_puzzle_unavailable",
    }, null, 2));
    return;
  }
  givens.value = puzzle;
  const copied = await copyText(puzzle);
  const isLibrary = puzzle.includes(":");
  log(JSON.stringify({
    ok: true,
    format: isLibrary ? "library" : "81-char puzzle",
    puzzle,
    givens: originalBoard,
    copied,
  }, null, 2));
  setStatus(copied ? ui("exportCopied") : ui("exportToInput"));
});

btnRate.addEventListener("click", () => {
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

  const resultText = typeof engine.rate_import_text_json === "function"
    ? engine.rate_import_text_json(input)
    : engine.rate_puzzle_json(normalizePuzzle(input));
  const result = parseJson(resultText);
  if (!result) {
    setStatus(ui("rateFailedSimple"));
    return;
  }

  const suffix = result.inputFormat
    ? uif("rateInputSuffix", { format: result.inputFormat, mode: result.usedCandidateState ? ui("rateUseCandidateState") : ui("rateUsePuzzle") })
    : "";
  setStatus(`${formatRating(result)}${suffix}`);
  log(JSON.stringify(result, null, 2));
});

if (btnCandidates) {
  btnCandidates.addEventListener("click", () => {
    if (!engine) return;
    renderBoard(currentHint);
    log(engine.get_candidates_json());
  });
}

btnStep.addEventListener("click", () => {
  if (!engine) return;
  const text = engine.next_step_json();
  currentHint = parseJson(text);
  renderBoard(currentHint);
  log(text);
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
    setManualAdvancedInputStateWithBoardKey(nextText, "snapshotCandidates", true, `library:${nextText}`);
    renderBoardSnapshot(currentSnapshot, null);
    log(JSON.stringify(result, null, 2));
    updateInputControls();
    setStatus(ui("appliedPreviewStep"));
    return;
  }
  currentHint = null;
  const text = engine.apply_hint_json();
  if (refreshAfterEdit(text)) {
    log(text);
    setStatus(ui("appliedHint"));
  } else {
    log(text);
  }
});


function installStepExplainDialogDrag() {
  if (!stepExplainDialog) return;
  const header = stepExplainDialog.querySelector(".step-explain-dialog-header");
  if (!header) return;
  let dragState = null;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  header.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target?.closest?.("button, a, input, select, textarea")) return;
    const rect = stepExplainDialog.getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
    stepExplainDialog.style.transform = "none";
    stepExplainDialog.style.left = `${rect.left}px`;
    stepExplainDialog.style.top = `${rect.top}px`;
    header.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  header.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const margin = 8;
    const maxLeft = Math.max(margin, window.innerWidth - dragState.width - margin);
    const maxTop = Math.max(margin, window.innerHeight - dragState.height - margin);
    const nextLeft = clamp(event.clientX - dragState.offsetX, margin, maxLeft);
    const nextTop = clamp(event.clientY - dragState.offsetY, margin, maxTop);
    stepExplainDialog.style.left = `${nextLeft}px`;
    stepExplainDialog.style.top = `${nextTop}px`;
  });

  const endDrag = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    header.releasePointerCapture?.(event.pointerId);
    dragState = null;
  };
  header.addEventListener("pointerup", endDrag);
  header.addEventListener("pointercancel", endDrag);
}

btnStepExplain?.addEventListener("click", openStepExplanationDialog);
stepExplainDialogClose?.addEventListener("click", closeStepExplanationDialog);
stepExplainDialog?.addEventListener("click", (event) => {
  if (event.target === stepExplainDialog) closeStepExplanationDialog();
});
stepExplainDialog?.addEventListener("close", () => {
  stepExplainDialog.classList.add("hidden");
});
installStepExplainDialogDrag();

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
    log(raw);
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
    log(uif("allStepsFailed", { error: err?.message || err }));
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

    log(raw);

    renderSolvePath(raw);
    const data = parseJson(raw);
    setStatus(uif("solveCompleted", { status: data?.status || "unknown", steps: data?.steps ?? "?", elapsed: elapsed.toFixed(1) }));
  } catch (err) {
    console.error(err);
    log(uif("solvePathRenderFailed", { error: err }));
    setStatus(uif("solveFailed", { error: err?.message || err }));
  } finally {
    setSolverBusy("solve", false);
  }
});
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
  if (!btnFullscreen) return;
  if (isFullscreen()) {
    setActionButtonLabel(btnFullscreen, ui("exitFullscreen"));
  } else {
    setActionButtonLabel(btnFullscreen, ui("fullscreen"));
  }
}

async function toggleFullscreen() {
  try {
    if (isFullscreen()) {
      await exitFullscreenSafe();
    } else {
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
    }))
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  const nextWhipMemoryMode = mode === "whipRating" ? "large" : (whipMemoryMode === "large" ? "large" : "auto");
  applyTechniqueState(next, nextWhipMemoryMode);
  const label = {
    allIn: "All In",
    highSpeed: "High Speed",
    extremeSpeed: "Extreme Speed",
    whipRating: "Whip Rating",
    braidRating: "Braid Rating",
  }[mode] || mode;
  setStatus(`${ui("techniquePresetApplied")}: ${label}.`);
}

btnTechAllIn?.addEventListener("click", () => applyTechniquePreset("allIn"));
btnTechHighSpeed?.addEventListener("click", () => applyTechniquePreset("highSpeed"));
btnTechExtremeSpeed?.addEventListener("click", () => applyTechniquePreset("extremeSpeed"));
btnTechWhipRating?.addEventListener("click", () => applyTechniquePreset("whipRating"));
btnTechBraidRating?.addEventListener("click", () => applyTechniquePreset("braidRating"));

lang.addEventListener("change", () => {
  applyStaticLanguage();
  if (lastSolveData) {
    tree.replaceChildren(renderSolveTreeView(lastSolveData));
  }
  if (lastAllStepsData && allStepsTree) {
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

window.addEventListener("beforeunload", () => {
  if (appSessionSaveTimer) {
    window.clearTimeout(appSessionSaveTimer);
    appSessionSaveTimer = 0;
  }
  saveAppSessionNow();
});

applyStaticLanguage();

init().catch((err) => {
  console.error(err);
  log(`${ui("wasmLoadFailed")}: ${err}`);
});
