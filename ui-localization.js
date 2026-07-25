const normalizeLanguage = (language) => String(language || "zh").toLowerCase().startsWith("en") ? "en" : "zh";

const ERROR_MESSAGES = {
  zh: {
    INDEX_OR_VALUE_OUT_OF_RANGE: "单元格位置或数字超出有效范围。",
    VALUE_CONFLICT: "该数字与所在行、列或宫中的已有数字冲突。",
    INDEX_OR_DIGIT_OUT_OF_RANGE: "单元格位置或候选数超出有效范围。",
    FILLED_CELL_CANDIDATE_EDIT: "已填入数字的单元格不能编辑候选数。",
    CANDIDATE_CONFLICT: "该候选数不符合所在行、列或宫的约束。",
    PUZZLE_NO_SOLUTION: "该题无解，请检查输入内容。",
    PUZZLE_MULTIPLE_SOLUTIONS: "该题存在多个解。",
    PUZZLE_MUST_HAVE_81_CELLS: "题面必须包含 81 个单元格。",
    EMPTY_INPUT: "输入内容为空。",
    UNRECOGNIZED_PUZZLE_FORMAT: "无法识别题面格式。",
    PARSED_PUZZLE_VALIDATION_FAILED: "题面解析完成，但有效性校验未通过。",
    EMPTY_PENCILMARK_CELL: "候选数格式中存在空白单元格。",
    CANDIDATE_CELL_WITHOUT_DIGITS: "候选数单元格中没有有效数字。",
    INVALID_SUKAKU_ORIGINAL_CANDIDATES: "Sukaku Library 中的原始 729 位候选数无效。",
    INVALID_SUKAKU_CURRENT_BOARD: "Sukaku Library 中的当前盘面无效。",
    SUKAKU_VALUE_ABSENT_FROM_ORIGINAL: "Sukaku Library 中的已填数字不在该格的原始候选数中。",
    COACH_MISSING_GIVENS: "Sudoku Coach JSON 缺少 81 位 givenDigits。",
    COACH_INVALID_USER_CANDIDATES: "Sudoku Coach JSON 中的 userCellCandidates 格式无效。",
    COACH_NON_NUMERIC_USER_CANDIDATES: "Sudoku Coach JSON 中的 userCellCandidates 含有非数字内容。",
    COACH_COMPRESSED_UNSUPPORTED: "暂不支持 Sudoku Coach 压缩格式。",
    GENERATE_FAILED: "题目生成失败，请重试。",
    GENERATED_SKFR_VALIDATION_FAILED: "题目已生成，但未通过 SKFR 评分校验。",
    GENERATE_DIFFICULTY_FAILED: "未能在所选难度范围内生成题目，请重试或调整难度。",
    BUILTIN_BANK_UNAVAILABLE: "内置超难题库不可用。",
    BUILTIN_PUZZLE_DECODE_FAILED: "内置超难题解码失败。",
    BUILTIN_SKFR_VALIDATION_FAILED: "内置超难题未通过 SKFR 评分校验。",
    BUILTIN_UNIQUE_LOAD_FAILED: "内置超难题未通过唯一解载入校验。",
    UNKNOWN_TECHNIQUE_KIND: "无法识别指定的解题技巧。",
    TRAINING_INVALID_STEP: "训练生成发现无效解题步骤，已停止。",
    TRAINING_GENERATE_FAILED: "未能生成包含指定技巧的题目。",
    STEP_ELIMINATES_SOLUTION: "该步骤会删去正确答案候选，已停止执行。",
    STEP_PLACES_WRONG_DIGIT: "该步骤将填入错误数字，已停止执行。",
    STEP_HAS_NO_EFFECT: "该步骤没有产生有效的出数或删数。",
    RATE_SUKAKU_FAILED: "Sukaku 评分失败。",
    RATE_PUZZLE_FAILED: "标准数独评分失败。",
    IMPORT_FAILED: "题面导入失败。",
    WORKER_UNSUPPORTED: "当前浏览器不支持后台任务。",
    WORKER_RUNTIME_FAILED: "后台任务运行失败。",
    TLG_ENTRY_UNAVAILABLE: "当前 WASM 构建未包含 TLG Solver 接口。",
    OCR_BUNDLE_INCOMPLETE: "独立版 OCR 资源不完整：本地 OCR 模块未正确嵌入。",
    MANUAL_ADVANCED_UNAVAILABLE: "当前 WASM 构建未包含高级技巧接口。",
    SCRIPT_LOAD_FAILED: "脚本加载失败。",
    BOARD_STAGE_UNAVAILABLE: "无法获取盘面区域，截图未生成。",
    CANVAS_BLOB_FAILED: "无法生成截图文件。",
    SCREENSHOT_IMAGE_LOAD_FAILED: "无法载入盘面截图图像。",
    CANVAS_CONTEXT_UNAVAILABLE: "浏览器无法创建截图画布。",
    SCREENSHOT_CACHE_FAILED: "截图缓存生成失败。",
    COACH_DECODE_FAILED: "Sudoku Coach 题串解码失败。",
    UNKNOWN_BACKEND_ERROR: "操作失败（后端诊断码：{diagnostic}）。",
  },
  en: {
    INDEX_OR_VALUE_OUT_OF_RANGE: "The cell index or value is out of range.",
    VALUE_CONFLICT: "The digit conflicts with an existing digit in the same row, column, or box.",
    INDEX_OR_DIGIT_OUT_OF_RANGE: "The cell index or candidate digit is out of range.",
    FILLED_CELL_CANDIDATE_EDIT: "Candidates cannot be edited in a filled cell.",
    CANDIDATE_CONFLICT: "The candidate violates a row, column, or box constraint.",
    PUZZLE_NO_SOLUTION: "The puzzle has no solution. Please check the input.",
    PUZZLE_MULTIPLE_SOLUTIONS: "The puzzle has multiple solutions.",
    PUZZLE_MUST_HAVE_81_CELLS: "The puzzle must contain 81 cells.",
    EMPTY_INPUT: "The input is empty.",
    UNRECOGNIZED_PUZZLE_FORMAT: "The puzzle format is not recognized.",
    PARSED_PUZZLE_VALIDATION_FAILED: "The puzzle was parsed, but validation failed.",
    EMPTY_PENCILMARK_CELL: "The pencilmark input contains an empty cell.",
    CANDIDATE_CELL_WITHOUT_DIGITS: "A candidate cell contains no valid digits.",
    INVALID_SUKAKU_ORIGINAL_CANDIDATES: "The original 729-candidate state in the Sukaku Library record is invalid.",
    INVALID_SUKAKU_CURRENT_BOARD: "The current board in the Sukaku Library record is invalid.",
    SUKAKU_VALUE_ABSENT_FROM_ORIGINAL: "A placed digit in the Sukaku Library record is absent from that cell's original candidates.",
    COACH_MISSING_GIVENS: "The Sudoku Coach JSON is missing an 81-character givenDigits field.",
    COACH_INVALID_USER_CANDIDATES: "The userCellCandidates field in the Sudoku Coach JSON is invalid.",
    COACH_NON_NUMERIC_USER_CANDIDATES: "The userCellCandidates field in the Sudoku Coach JSON contains non-numeric data.",
    COACH_COMPRESSED_UNSUPPORTED: "Compressed Sudoku Coach format is not supported yet.",
    GENERATE_FAILED: "Puzzle generation failed. Please try again.",
    GENERATED_SKFR_VALIDATION_FAILED: "The puzzle was generated but failed SKFR rating validation.",
    GENERATE_DIFFICULTY_FAILED: "No puzzle could be generated in the selected difficulty band. Try again or choose another difficulty.",
    BUILTIN_BANK_UNAVAILABLE: "The built-in super-hard puzzle bank is unavailable.",
    BUILTIN_PUZZLE_DECODE_FAILED: "A built-in super-hard puzzle could not be decoded.",
    BUILTIN_SKFR_VALIDATION_FAILED: "A built-in super-hard puzzle failed SKFR rating validation.",
    BUILTIN_UNIQUE_LOAD_FAILED: "A built-in super-hard puzzle failed unique-solution loading validation.",
    UNKNOWN_TECHNIQUE_KIND: "The requested solving technique is not recognized.",
    TRAINING_INVALID_STEP: "Training generation found an invalid solving step and stopped.",
    TRAINING_GENERATE_FAILED: "A puzzle containing the requested technique could not be generated.",
    STEP_ELIMINATES_SOLUTION: "The step would eliminate the solution candidate, so execution was stopped.",
    STEP_PLACES_WRONG_DIGIT: "The step would place an incorrect digit, so execution was stopped.",
    STEP_HAS_NO_EFFECT: "The step has no effective placement or elimination.",
    RATE_SUKAKU_FAILED: "Sukaku rating failed.",
    RATE_PUZZLE_FAILED: "Standard Sudoku rating failed.",
    IMPORT_FAILED: "Puzzle import failed.",
    WORKER_UNSUPPORTED: "Background workers are not supported by this browser.",
    WORKER_RUNTIME_FAILED: "The background task failed.",
    TLG_ENTRY_UNAVAILABLE: "This WASM build does not include the TLG Solver entry point.",
    OCR_BUNDLE_INCOMPLETE: "The standalone OCR bundle is incomplete: the local OCR module was not embedded.",
    MANUAL_ADVANCED_UNAVAILABLE: "This WASM build does not include the advanced-technique entry point.",
    SCRIPT_LOAD_FAILED: "The script could not be loaded.",
    BOARD_STAGE_UNAVAILABLE: "The board area is unavailable, so the screenshot could not be created.",
    CANVAS_BLOB_FAILED: "The screenshot image file could not be created.",
    SCREENSHOT_IMAGE_LOAD_FAILED: "The board screenshot image could not be loaded.",
    CANVAS_CONTEXT_UNAVAILABLE: "The browser could not create a screenshot canvas.",
    SCREENSHOT_CACHE_FAILED: "The screenshot cache could not be created.",
    COACH_DECODE_FAILED: "The Sudoku Coach string could not be decoded.",
    UNKNOWN_BACKEND_ERROR: "The operation failed (backend diagnostic: {diagnostic}).",
  },
};


const CONTEXT_ERROR_MESSAGES = {
  zh: {
    VALUE_CONFLICT: "{cell} 不能填入 {digit}：该数字与所在行、列或宫中的已有数字冲突。",
    FILLED_CELL_CANDIDATE_EDIT: "{cell} 已填入数字，不能编辑候选数。",
    CANDIDATE_CONFLICT: "{cell} 不能添加候选数 {digit}：它与所在行、列或宫的约束冲突。",
  },
  en: {
    VALUE_CONFLICT: "Cannot place {digit} in {cell}: it conflicts with an existing digit in the same row, column, or box.",
    FILLED_CELL_CANDIDATE_EDIT: "Candidates cannot be edited in {cell} because the cell is already filled.",
    CANDIDATE_CONFLICT: "Candidate {digit} cannot be added to {cell}: it violates a row, column, or box constraint.",
  },
};

const EXACT_ERROR_CODES = new Map([
  ["index or value out of range", "INDEX_OR_VALUE_OUT_OF_RANGE"],
  ["value conflicts with row, column, or box", "VALUE_CONFLICT"],
  ["index or digit out of range", "INDEX_OR_DIGIT_OUT_OF_RANGE"],
  ["cannot edit candidates in a filled cell", "FILLED_CELL_CANDIDATE_EDIT"],
  ["candidate conflicts with row, column, or box", "CANDIDATE_CONFLICT"],
  ["puzzle has no solution", "PUZZLE_NO_SOLUTION"],
  ["puzzle has multiple solutions", "PUZZLE_MULTIPLE_SOLUTIONS"],
  ["puzzle must contain 81 cells", "PUZZLE_MUST_HAVE_81_CELLS"],
  ["empty input", "EMPTY_INPUT"],
  ["unrecognized puzzle format", "UNRECOGNIZED_PUZZLE_FORMAT"],
  ["parsed puzzle failed validation", "PARSED_PUZZLE_VALIDATION_FAILED"],
  ["empty candidate cell in pencilmark input", "EMPTY_PENCILMARK_CELL"],
  ["candidate cell without digits", "CANDIDATE_CELL_WITHOUT_DIGITS"],
  ["invalid original 729 candidates in Sukaku library", "INVALID_SUKAKU_ORIGINAL_CANDIDATES"],
  ["invalid current board in Sukaku library", "INVALID_SUKAKU_CURRENT_BOARD"],
  ["Sukaku library value is absent from original candidates", "SUKAKU_VALUE_ABSENT_FROM_ORIGINAL"],
  ["coach json missing 81-char givenDigits", "COACH_MISSING_GIVENS"],
  ["coach json has invalid userCellCandidates", "COACH_INVALID_USER_CANDIDATES"],
  ["coach json has non-numeric userCellCandidates", "COACH_NON_NUMERIC_USER_CANDIDATES"],
  ["Sudoku Coach compressed format is not supported yet", "COACH_COMPRESSED_UNSUPPORTED"],
  ["failed to generate puzzle", "GENERATE_FAILED"],
  ["generated puzzle failed SKFR rating validation", "GENERATED_SKFR_VALIDATION_FAILED"],
  ["failed to generate puzzle in selected difficulty band", "GENERATE_DIFFICULTY_FAILED"],
  ["builtin superhard puzzle failed SKFR rating validation", "BUILTIN_SKFR_VALIDATION_FAILED"],
  ["builtin superhard puzzle failed unique load validation", "BUILTIN_UNIQUE_LOAD_FAILED"],
  ["unknown technique kind", "UNKNOWN_TECHNIQUE_KIND"],
  ["training generation found an invalid solving step", "TRAINING_INVALID_STEP"],
  ["failed to generate a puzzle containing requested technique", "TRAINING_GENERATE_FAILED"],
  ["step would eliminate the solution candidate", "STEP_ELIMINATES_SOLUTION"],
  ["step would place a digit different from the solution", "STEP_PLACES_WRONG_DIGIT"],
  ["step has no effective placement or elimination", "STEP_HAS_NO_EFFECT"],
  ["rateSukaku failed", "RATE_SUKAKU_FAILED"],
  ["ratePuzzle failed", "RATE_PUZZLE_FAILED"],
  ["import failed", "IMPORT_FAILED"],
  ["TLG solver entry point is not available in this WASM build.", "TLG_ENTRY_UNAVAILABLE"],
  ["Standalone OCR bundle incomplete: local OCR module was not inlined", "OCR_BUNDLE_INCOMPLETE"],
  ["manual_advanced_step_json is not available", "MANUAL_ADVANCED_UNAVAILABLE"],
  ["board-stage", "BOARD_STAGE_UNAVAILABLE"],
  ["canvas-blob", "CANVAS_BLOB_FAILED"],
  ["dom-screenshot-image", "SCREENSHOT_IMAGE_LOAD_FAILED"],
  ["canvas-context", "CANVAS_CONTEXT_UNAVAILABLE"],
  ["dom-screenshot-cache", "SCREENSHOT_CACHE_FAILED"],
  ["Coach puzzle string decode failed", "COACH_DECODE_FAILED"],
]);

const PREFIX_ERROR_CODES = [
  [/^builtin superhard bank unavailable(?::\s*(.*))?$/i, "BUILTIN_BANK_UNAVAILABLE"],
  [/^failed to decode builtin superhard puzzle(?::\s*(.*))?$/i, "BUILTIN_PUZZLE_DECODE_FAILED"],
];

const TLG_EXACT_ZH = new Map(Object.entries({
  "descriptor endpoints must contain exactly two valid NRC candidates": "描述符端点必须恰好包含两个有效的 NRC 候选。",
  "endpoint pair does not identify exactly one ordinary TLG descriptor": "这对端点无法唯一确定一个普通 TLG 描述符。",
  "invalid cell truth": "单元格 Truth 无效。",
  "unsupported TLG action": "不支持该 TLG 操作。",
  "descriptor 0x144 is reserved for synthetic all-domain source": "描述符 0x144 保留给合成的全域来源，不能用于普通描述符。",
  "descriptor 0x144 requires non-empty allDomainCandidates": "描述符 0x144 需要非空的 allDomainCandidates。",
  "catalog must not register reserved descriptor 0x144": "描述符目录不能登记保留的 0x144 描述符。",
  "minDepthProblem rowDescriptorMap size does not match row count": "minDepthProblem 的 rowDescriptorMap 大小与行数不一致。",
  "minDepthProblem rowIsExtraSide size does not match row count": "minDepthProblem 的 rowIsExtraSide 大小与行数不一致。",
  "initialCandidates was supplied but contained no valid candidates": "已提供 initialCandidates，但其中没有有效候选数。",
  "activeCandidates was supplied but contained no valid candidates": "已提供 activeCandidates，但其中没有有效候选数。",
  "auto-link search requires at least one truth descriptor": "自动 Link 搜索至少需要一个 Truth 描述符。",
  "report-link closure requires at least one truth descriptor": "Report-Link 闭包至少需要一个 Truth 描述符。",
  "truth descriptor union is empty": "Truth 描述符的候选并集为空。",
  "truth/link geometry requires at least one truth and one link descriptor": "Truth/Link 几何校验至少需要一个 Truth 描述符和一个 Link 描述符。",
  "no report-link descriptor is contained in truth+elimination support": "Truth 与删数支撑的并集中不含可报告的 Link 描述符。",
  "auto-link search hit maxSearchNodes": "自动 Link 搜索已达到最大搜索节点数。",
  "minRankExcess must be <= maxRankExcess": "minRankExcess 不能大于 maxRankExcess。",
  "minLinkMultiplicityForIntersectionElimination must be >= 1": "minLinkMultiplicityForIntersectionElimination 必须至少为 1。",
  "minLinkMultiplicityForConclusion must be >= 1": "minLinkMultiplicityForConclusion 必须至少为 1。",
  "set-theory permutation evaluation requires at least one truth descriptor": "集合论排列校验至少需要一个 Truth 描述符。",
  "maxPermutations must be > 0": "maxPermutations 必须大于 0。",
  "set-theory permutation evaluation hit maxPermutations": "集合论排列校验已达到 maxPermutations 上限。",
  "no permutation satisfies all truths under the given links": "在给定 Links 下，没有任何排列能够满足全部 Truths。",
  "active candidate is outside the 1..9 Sudoku domain": "活动候选数超出数独的 1～9 范围。",
  "manual TLG validation requires a nonempty active-candidate universe": "手工 TLG 校验需要一个非空的活动候选全集。",
  "active candidates were normalized by dropping invalid entries and duplicates": "活动候选已规范化：无效项和重复项已移除。",
  "TLG manual validation supports at most two AUR records": "手工 TLG 校验最多支持两条 AUR 记录。",
  "TLG GUR supports at most eight independent groups": "TLG GUR 最多支持八个相互独立的分组。",
  "at most two Virtual Sets are supported": "最多支持两组 Virtual Set。",
  "Virtual Set cardinality must be in 1..4": "Virtual Set 的基数必须为 1～4。",
  "Virtual Set member is outside the 1..9 Sudoku domain": "Virtual Set 成员超出数独的 1～9 范围。",
  "active Virtual Set requires at least one member": "启用 Virtual Set 时至少需要一个成员。",
  "Virtual Set cardinality exceeds its distinct member count": "Virtual Set 的基数不能超过其不同成员的数量。",
  "cannot build projection context from an invalid normalized plan": "规范化方案无效，无法建立投影上下文。",
  "normalized plan has no active candidates": "规范化方案中没有活动候选数。",
  "normalized plan contains an invalid active candidate": "规范化方案中包含无效的活动候选数。",
  "normalized Virtual Set cardinality is inconsistent with its members": "规范化后的 Virtual Set 基数与成员数量不一致。",
  "synthetic Virtual Set descriptor collides with an ordinary descriptor": "合成的 Virtual Set 描述符与普通描述符冲突。",
  "synthetic Virtual Set descriptor collides with another descriptor": "合成的 Virtual Set 描述符与另一描述符冲突。",
  "normalized standard AUR constraint is malformed": "规范化后的标准 AUR 约束格式错误。",
  "normalized six-cell DUR constraint is malformed": "规范化后的六格 DUR 约束格式错误。",
  "normalized rotating AUR constraint is malformed": "规范化后的旋转 AUR 约束格式错误。",
  "normalized generic GUR constraint is malformed": "规范化后的通用 GUR 约束格式错误。",
  "normalized generalized AUR constraint is malformed": "规范化后的广义 AUR 约束格式错误。",
  "cannot enumerate an invalid projection context": "投影上下文无效，无法进行枚举。",
  "projection budgets must be greater than zero": "投影预算必须大于 0。",
  "projection enumeration requires at least one truth or an active Virtual Set": "投影枚举至少需要一个 Truth，或一个已启用的 Virtual Set。",
  "cannot materialize an invalid projection context": "投影上下文无效，无法生成结论。",
  "cannot materialize a structure with no projection solutions": "投影无解，无法生成结论。",
  "structure audit reprojection budget exceeded": "结构审计已超出重新投影预算。",
  "native structure mutation reprojection budget exceeded": "原生结构变换已超出重新投影预算。",
  "native structure mutation baseline projection failed": "原生结构变换的基准投影失败。",
  "structure audit maxReprojections must be greater than zero": "结构审计的 maxReprojections 必须大于 0。",
  "duplicate input truths were stably removed": "重复的输入 Truths 已按稳定顺序移除。",
  "duplicate input links were stably removed": "重复的输入 Links 已按稳定顺序移除。",
  "no expected rank/delete cases loaded": "未载入预期的秩/删数测试用例。",
  "no available native fixture keys supplied": "未提供可用的原生测试夹具键。",
  "assembled request rejected before pipeline": "组装后的请求在进入处理管线前被拒绝。",
  "pipeline threw and was converted to invalid request": "处理管线发生异常，已转为无效请求。",
}));

const TLG_PATTERNS_ZH = [
  [/^unsupported TLG action:\s*(.+)$/i, (_, action) => `不支持的 TLG 操作：${action}。`],
  [/^Virtual Set\s+#?(\d+)\s*:\s*(.*)$/i, (_, index, rest) => `Virtual Set ${index}：${translateTlgTail(rest)}`],
  [/^normalized Virtual Set\s+(\d+)\s+(.*)$/i, (_, index, rest) => `规范化后的 Virtual Set ${index}：${translateTlgTail(rest)}`],
  [/^(AUR|GUR|DUR)\s*#?(\d+)?\s*(.*)$/i, (_, family, index, rest) => `${family.toUpperCase()}${index ? ` #${index}` : ""}：${translateTlgTail(rest)}`],
  [/^(.+?) is not active:\s*(.+)$/i, (_, subject, item) => `${translateTlgSubject(subject)}未处于活动状态：${item}`],
  [/^(.+?) is outside the 1\.\.9 Sudoku domain$/i, (_, subject) => `${translateTlgSubject(subject)}超出数独的 1～9 范围。`],
  [/^duplicate descriptor\s+(.+)$/i, (_, item) => `描述符重复：${item}`],
  [/^missing descriptorMasks entry for (base|cover) descriptor\s+(.+)$/i, (_, kind, item) => `缺少${kind === "base" ? "基础" : "覆盖"}描述符 ${item} 的 descriptorMasks 条目。`],
  [/^line\s+(\d+)\s*:\s*bad record number$/i, (_, line) => `第 ${line} 行的记录编号无效。`],
  [/^line\s+(\d+)\s*:\s*text before first # header$/i, (_, line) => `第 ${line} 行在首个 # 标题之前出现了正文。`],
  [/^missing actual case for key:\s*(.+)$/i, (_, key) => `缺少键为 ${key} 的实际测试用例。`],
  [/^duplicate actual key:\s*(.+)$/i, (_, key) => `实际测试键重复：${key}`],
];

function translateTlgSubject(value) {
  const source = String(value || "").trim();
  const map = {
    "Corner": "角候选",
    "Virtual Set member": "Virtual Set 成员",
    "active candidate": "活动候选数",
    "candidate": "候选数",
  };
  return map[source] || `${source} `;
}

function translateTlgTail(value) {
  let source = String(value || "").trim();
  if (!source) return "记录无效。";
  const replacements = [
    [/^duplicates another AUR\/GUR record$/i, "与另一条 AUR/GUR 记录重复。"],
    [/^duplicates another AUR record$/i, "与另一条 AUR 记录重复。"],
    [/^duplicate fixed AUR form was ignored$/i, "重复的固定 AUR 形态已忽略。"],
    [/^duplicate six-cell DUR swap form was ignored$/i, "重复的六格 DUR 交换形态已忽略。"],
    [/^cardinality must be in 1\.\.4$/i, "基数必须为 1～4。"],
    [/^member is outside the 1\.\.9 Sudoku domain$/i, "成员超出数独的 1～9 范围。"],
    [/^active set requires at least one member$/i, "启用该组时至少需要一个成员。"],
    [/^cardinality exceeds its distinct member count$/i, "基数不能超过该组不同成员的数量。"],
    [/^member is not active:\s*(.+)$/i, "成员未处于活动状态：$1"],
    [/^cardinality is inconsistent with its members$/i, "基数与成员数量不一致。"],
    [/^Corner is not active:\s*(.+)$/i, "角候选未处于活动状态：$1"],
    [/^Corner is outside the 1\.\.9 Sudoku domain$/i, "角候选超出数独的 1～9 范围。"],
  ];
  for (const [pattern, output] of replacements) {
    if (pattern.test(source)) return source.replace(pattern, output);
  }
  return "记录未通过校验。";
}

function stableDiagnosticCode(text) {
  const source = String(text || "unknown");
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `E${(hash >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
}

function formatTemplate(template, values = {}) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

function inferErrorCode(message) {
  const source = String(message || "").trim();
  if (!source) return "";
  if (EXACT_ERROR_CODES.has(source)) return EXACT_ERROR_CODES.get(source);
  for (const [pattern, code] of PREFIX_ERROR_CODES) {
    if (pattern.test(source)) return code;
  }
  return "";
}

export function localizeBackendMessage(value, language = "zh", options = {}) {
  const locale = normalizeLanguage(language);
  const object = value && typeof value === "object" ? value : null;
  const raw = String(
    object?.error ?? object?.message ?? object?.detail ?? (typeof value === "string" ? value : "")
  ).trim();
  const explicitCode = String(object?.errorCode ?? object?.code ?? options.errorCode ?? "").trim();
  const inferredCode = inferErrorCode(raw);
  const code = ERROR_MESSAGES[locale]?.[explicitCode] ? explicitCode : (inferredCode || explicitCode);
  const params = object?.errorParams ?? object?.params ?? options.params ?? {};
  const contextTemplate = CONTEXT_ERROR_MESSAGES[locale]?.[code];
  if (contextTemplate && params?.cell && (code === "FILLED_CELL_CANDIDATE_EDIT" || params?.digit)) {
    return formatTemplate(contextTemplate, params);
  }
  const template = ERROR_MESSAGES[locale]?.[code];
  if (template) return formatTemplate(template, params);
  if (locale === "en" && raw) return raw;
  if (!raw && options.fallback) return String(options.fallback);
  const diagnostic = code || stableDiagnosticCode(raw || "unknown");
  return formatTemplate(ERROR_MESSAGES[locale].UNKNOWN_BACKEND_ERROR, { diagnostic });
}

export function localizeTlgMessage(value, language = "zh") {
  const locale = normalizeLanguage(language);
  const source = String(value || "").trim();
  if (!source) return "";
  if (locale === "en") return source;
  if (TLG_EXACT_ZH.has(source)) return TLG_EXACT_ZH.get(source);
  for (const [pattern, formatter] of TLG_PATTERNS_ZH) {
    const match = source.match(pattern);
    if (match) return formatter(...match);
  }
  const general = inferErrorCode(source);
  if (general) return localizeBackendMessage({ errorCode: general, error: source }, locale);
  return `TLG 校验未通过（诊断码：${stableDiagnosticCode(source)}）。`;
}

const STATUS_LABELS = {
  zh: {
    solved: "已解出",
    stalled: "无可用逻辑步骤",
    max_steps: "已达到最大步骤数",
    invalid_step: "无效步骤",
    done: "已完成",
    cancelled: "已停止",
    error: "失败",
    computed: "计算完成",
    unknown: "状态未知",
    NoResult: "没有结果",
    GuardRejected: "门控校验未通过",
    Unsupported: "暂不支持",
    InvalidRequest: "请求无效",
    InternalError: "内部错误",
    Ok: "成功",
  },
  en: {
    solved: "Solved",
    stalled: "No logical step available",
    max_steps: "Maximum step count reached",
    invalid_step: "Invalid step",
    done: "Completed",
    cancelled: "Stopped",
    error: "Failed",
    computed: "Computed",
    unknown: "Unknown status",
    NoResult: "No result",
    GuardRejected: "Guard rejected",
    Unsupported: "Unsupported",
    InvalidRequest: "Invalid request",
    InternalError: "Internal error",
    Ok: "OK",
  },
};

export function localizeStatus(value, language = "zh") {
  const locale = normalizeLanguage(language);
  const key = String(value ?? "unknown");
  return STATUS_LABELS[locale]?.[key] ?? (locale === "en" ? key : STATUS_LABELS.zh.unknown);
}

const DIFFICULTIES = {
  0: { zh: "随机", en: "Random", range: "ER 0–12.0" },
  1: { zh: "入门", en: "Easy", range: "ER 0–1.5" },
  2: { zh: "初级", en: "Medium", range: "ER 1.5–2.8" },
  3: { zh: "进阶", en: "Hard", range: "ER 2.8–6.0" },
  4: { zh: "棘手", en: "Unfair", range: "ER 6.0–8.0" },
  5: { zh: "极限", en: "Extreme", range: "ER 8.0–9.3" },
  6: { zh: "骨灰", en: "Insane", range: "ER 9.3–12.0" },
};

const DIFFICULTY_LEVELS = Object.freeze(Object.keys(DIFFICULTIES).map(Number));

const DIFFICULTY_NAME_TO_LEVEL = new Map([
  ["random", 0], ["easy", 1], ["medium", 2], ["hard", 3], ["unfair", 4], ["extreme", 5], ["insane", 6],
  ["随机", 0], ["入门", 1], ["初级", 2], ["进阶", 3], ["棘手", 4], ["极限", 5], ["骨灰", 6],
  // Compatibility with the older mobile-only labels that once lived in index.html.
  ["简单", 1], ["中等", 2], ["困难", 3], ["不公平", 4], ["极难", 5], ["疯狂", 6],
]);

function normalizeDifficultyLevel(value) {
  const raw = String(value ?? "").trim();
  const numeric = raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : NaN;
  const level = Number.isInteger(numeric) ? numeric : DIFFICULTY_NAME_TO_LEVEL.get(raw.toLowerCase());
  return Object.prototype.hasOwnProperty.call(DIFFICULTIES, level) ? level : 0;
}

export function difficultyLevels() {
  return [...DIFFICULTY_LEVELS];
}

export function difficultyDescriptor(value, language = "zh") {
  const locale = normalizeLanguage(language);
  const level = normalizeDifficultyLevel(value);
  const item = DIFFICULTIES[level];
  return {
    level,
    name: item[locale],
    range: item.range,
    label: `${item[locale]} (${item.range})`,
  };
}

export function localizeDifficulty(value, language = "zh", options = {}) {
  const item = difficultyDescriptor(value, language);
  return options.withRange ? item.label : item.name;
}

const APP_STATUS_LABELS = {
  zh: {
    pwa: {
      unsupported: "当前浏览器不支持 PWA 离线安装。",
      initializing: "正在初始化离线功能…",
      downloading: "正在增量准备离线资源 {loaded}/{total} MB（下载 {network} MB，复用 {reused} MB，续传 {resumed} MB；{done}/{count}）",
      ready: "离线资源已准备完成。",
      installed: "已在应用模式运行，离线资源已准备完成。",
      installable: "离线资源已准备完成；点击可安装应用。",
      offlineReady: "当前处于离线状态，可完整使用。",
      offlinePartial: "当前处于离线状态，但离线资源尚未准备完整。",
      error: "离线资源准备失败：{message}。联网点击云朵可从已完成位置继续。",
      updateError: "新版本离线资源准备中断：{message}。当前版本仍可用；联网点击云朵继续。",
      updateReady: "新版本已准备完成；点击图标立即更新。",
      updateRepairing: "正在补齐新版本离线资源并继续激活：{loaded}/{total} MB（下载 {network} MB，复用 {reused} MB，续传 {resumed} MB；{done}/{count}）",
      updating: "正在切换到新版本…",
      checking: "正在检查离线资源和新版本…",
      incomplete: "离线资源不完整；联网点击图标继续准备，已完成资源不会重复下载。",
    },
    save: {
      saved: "当前进度已保存。",
      dirty: "当前进度有尚未保存的更改。",
      saving: "正在保存当前进度…",
      error: "当前进度保存失败：{message}",
    },
    back: {
      closeDialog: "返回键将关闭当前弹窗。",
      closeNewPuzzle: "返回键将关闭新题面板。",
      closeDrawer: "返回键将关闭更多功能面板。",
      closeMarks: "返回键将退出手工标记面板。",
      exitSolve: "返回键将退出做题模式。",
      leaveApp: "当前位于根界面；返回键将离开应用。",
    },
    transient: {
      idle: "状态通知",
      shared: "已打开系统分享面板。",
      copied: "分享链接已复制到剪贴板。",
      shareCancelled: "已取消分享。",
      shareFailed: "分享失败：{message}",
      restored: "已恢复上次做题进度。",
      updateComplete: "新版本已加载完成。",
      installAccepted: "应用安装请求已提交。",
      installDismissed: "已取消安装。",
      wakeLockActive: "屏幕常亮已启用；离开做题模式后会自动释放。",
      wakeLockDisabled: "屏幕常亮已关闭。",
      wakeLockUnsupported: "当前浏览器或运行环境不支持屏幕常亮。",
      wakeLockReleased: "屏幕常亮已被系统释放；可关闭后重新开启以重试。",
      wakeLockFailed: "无法保持屏幕常亮：{message}",
    },
  },
  en: {
    pwa: {
      unsupported: "PWA offline installation is unavailable in this browser.",
      initializing: "Initializing offline support…",
      downloading: "Preparing offline resources incrementally: {loaded}/{total} MB (downloaded {network} MB, reused {reused} MB, resumed {resumed} MB; {done}/{count})",
      ready: "Offline resources are ready.",
      installed: "Running as an installed app; offline resources are ready.",
      installable: "Offline resources are ready; tap to install the app.",
      offlineReady: "You are offline and all features remain available.",
      offlinePartial: "You are offline, but offline resources are not complete yet.",
      error: "Offline resource setup failed: {message}. Tap the cloud online to continue from the saved checkpoint.",
      updateError: "Preparing the new offline release was interrupted: {message}. The current release remains usable; tap the cloud online to continue.",
      updateReady: "A new version is ready; tap the icon to update.",
      updateRepairing: "Repairing the staged offline release before activation: {loaded}/{total} MB (downloaded {network} MB, reused {reused} MB, resumed {resumed} MB; {done}/{count})",
      updating: "Switching to the new version…",
      checking: "Checking offline resources and updates…",
      incomplete: "Offline resources are incomplete; tap online to continue. Completed assets are not downloaded again.",
    },
    save: {
      saved: "Current progress is saved.",
      dirty: "Current progress has unsaved changes.",
      saving: "Saving current progress…",
      error: "Saving current progress failed: {message}",
    },
    back: {
      closeDialog: "Back will close the current dialog.",
      closeNewPuzzle: "Back will close the New Puzzle panel.",
      closeDrawer: "Back will close the More Tools drawer.",
      closeMarks: "Back will leave the Manual Marks panel.",
      exitSolve: "Back will exit Solve Mode.",
      leaveApp: "You are at the root screen; Back will leave the app.",
    },
    transient: {
      idle: "Status notification",
      shared: "The system share sheet is open.",
      copied: "The share link was copied to the clipboard.",
      shareCancelled: "Sharing was cancelled.",
      shareFailed: "Sharing failed: {message}",
      restored: "The previous solving session was restored.",
      updateComplete: "The new version has loaded.",
      installAccepted: "The app installation request was submitted.",
      installDismissed: "Installation was cancelled.",
      wakeLockActive: "Screen Wake Lock is active and will be released when Solve Mode closes.",
      wakeLockDisabled: "Screen Wake Lock is off.",
      wakeLockUnsupported: "Screen Wake Lock is unavailable in this browser or runtime.",
      wakeLockReleased: "Screen Wake Lock was released by the system; toggle it off and on to retry.",
      wakeLockFailed: "Keeping the screen awake failed: {message}",
    },
  },
};

function formatAppStatusText(template, values = {}) {
  return String(template || "").replace(/\{([A-Za-z0-9_]+)\}/g, (_match, key) => String(values[key] ?? ""));
}

export function appStatusDescriptor(kind, state, language = "zh", values = {}) {
  const locale = normalizeLanguage(language);
  const group = APP_STATUS_LABELS[locale]?.[kind] || APP_STATUS_LABELS.zh[kind] || {};
  const fallback = APP_STATUS_LABELS.en?.[kind]?.[state] || `${kind}:${state}`;
  const label = formatAppStatusText(group[state] || fallback, values);
  const tones = {
    pwa: {
      unsupported: "muted", initializing: "working", downloading: "working", checking: "working",
      ready: "ok", installed: "ok", installable: "ok", offlineReady: "warn",
      offlinePartial: "error", incomplete: "warn", error: "error", updateError: "warn", updateReady: "update", updateRepairing: "working", updating: "working",
    },
    save: { saved: "ok", dirty: "warn", saving: "working", error: "error" },
    back: { closeDialog: "info", closeNewPuzzle: "info", closeDrawer: "info", closeMarks: "info", exitSolve: "info", leaveApp: "muted" },
    transient: {
      idle: "muted", shared: "info", copied: "ok", shareCancelled: "muted", shareFailed: "error",
      restored: "ok", updateComplete: "update", installAccepted: "ok", installDismissed: "muted",
      wakeLockActive: "ok", wakeLockDisabled: "muted", wakeLockUnsupported: "warn", wakeLockReleased: "warn", wakeLockFailed: "error",
    },
  };
  return { kind, state, label, tone: tones[kind]?.[state] || "info" };
}

const FORMAT_LABELS = {
  zh: {
    puzzle81: "81 位题面",
    "81-char puzzle": "81 位题面",
    "embedded puzzle": "嵌入式 81 位题面",
    "tab-separated cells": "制表符分隔的 81 格格式",
    "ascii grid": "文本盘面格式",
    "space-separated pencilmarks": "空格分隔的候选数格式",
    sukaku729: "729 位候选数格式",
    "729 pencilmarks": "729 位候选数格式",
    "sukaku-library": "Sukaku Library 格式",
    library: "Sudoku Library 格式",
    "coach-json": "Sudoku Coach JSON 格式",
    "coach-json-ocr-draft": "OCR 校正草稿格式",
    coach: "Sudoku Coach 格式",
    snapshotCandidates: "当前候选盘状态",
    pencilmarks: "候选数格式",
    original: "原始题串",
    known: "已知数字串",
    candidates: "候选数字串",
    sukaku: "Sukaku 字串",
    auto: "自动识别",
    unrecognized: "无法识别的格式",
    invalid: "无效格式",
  },
  en: {
    puzzle81: "81-character puzzle",
    "81-char puzzle": "81-character puzzle",
    "embedded puzzle": "embedded 81-character puzzle",
    "tab-separated cells": "tab-separated 81-cell format",
    "ascii grid": "text-grid format",
    "space-separated pencilmarks": "space-separated pencilmark format",
    sukaku729: "729-character candidate format",
    "729 pencilmarks": "729-character candidate format",
    "sukaku-library": "Sukaku Library format",
    library: "Sudoku Library format",
    "coach-json": "Sudoku Coach JSON format",
    "coach-json-ocr-draft": "OCR correction draft format",
    coach: "Sudoku Coach format",
    snapshotCandidates: "current candidate state",
    pencilmarks: "pencilmark format",
    original: "original puzzle string",
    known: "known-digit string",
    candidates: "candidate-digit string",
    sukaku: "Sukaku string",
    auto: "automatic detection",
    unrecognized: "unrecognized format",
    invalid: "invalid format",
  },
};

export function localizeInputFormat(value, language = "zh") {
  const locale = normalizeLanguage(language);
  const key = String(value || "").trim();
  return FORMAT_LABELS[locale]?.[key] ?? (locale === "en" ? key || "unknown format" : "未知格式");
}

const ACTION_LABELS = {
  zh: { eliminate: "删除", place: "填入", action: "操作" },
  en: { eliminate: "eliminate", place: "place", action: "action" },
};

export function localizeAction(value, language = "zh") {
  const locale = normalizeLanguage(language);
  const key = String(value || "action").trim().toLowerCase();
  return ACTION_LABELS[locale]?.[key] ?? ACTION_LABELS[locale].action;
}

export function localizeWorkerError(message, language = "zh", fallbackCode = "WORKER_RUNTIME_FAILED") {
  return localizeBackendMessage(message, language, { errorCode: inferErrorCode(message) || fallbackCode });
}

export function backendDiagnosticCode(value) {
  const raw = typeof value === "string" ? value : value?.error || value?.message || "";
  return String(value?.errorCode || value?.code || inferErrorCode(raw) || stableDiagnosticCode(raw));
}
