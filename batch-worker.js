/*
 * 维护说明（简体中文）
 * 职责：批处理 Worker。
 * 数据流：按队列处理大量题目，维护取消、进度和逐题结果协议。
 * 修改时注意：
 * - 本文件只应在明确理解数据流后修改；注释描述的是设计意图和维护约束。
 * - 重构时须保持既有求解结果、技巧优先级、前后端字段或测试基线不变。
 * - 主线程代码要避免长时间同步计算；耗时工作优先留在 Worker/WASM。
 * - 涉及移动端指针事件时同时检查鼠标、触摸、长按抑制和浏览器返回行为。
 */
import createModule from "./sudoku_wasm.js?v=wasm-c66616ba9de50fe0";

const APP_VERSION = "wasm-c66616ba9de50fe0";
let enginePromise = null;
let cancelRequested = false;

async function getEngine() {
  if (!enginePromise) {
    enginePromise = createModule({
      locateFile: (path) => path.endsWith(".wasm") ? `./${path}?v=${APP_VERSION}` : path,
    }).then((mod) => new mod.Engine());
  }
  return enginePromise;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function maybeSetTechniques(engine, techniqueConfig) {
  if (techniqueConfig && typeof engine.set_techniques_json === "function") {
    engine.set_techniques_json(JSON.stringify(techniqueConfig));
  }
}

function makeGeneratedItem(engine, config) {
  const trainingKind = config.trainingKind || "";
  const difficulty = Number(config.difficulty || 0);
  const textFilter = config.trainingTextFilter && typeof config.trainingTextFilter === "object"
    ? config.trainingTextFilter
    : { includeText: "", excludeText: "", caseSensitive: false, otp: false };
  const otp = Boolean(textFilter.otp || config.otp);
  const trainingMode = Boolean(trainingKind || otp);
  const resultText = trainingMode
    ? engine.generate_training_puzzle_summary_filtered_json(
        trainingKind,
        difficulty,
        Number(config.maxAttempts || 0),
        JSON.stringify(textFilter)
      )
    : engine.generate_puzzle_difficulty_json(difficulty, 0);
  const result = parseJson(resultText);
  if (!result?.ok) return { result, failed: true };

  if (!trainingMode) {
    const solve = parseJson(engine.solve_summary_json(500));
    result.solve = solve;
    if (solve?.status === "invalid_step") {
      return { result, invalid: true };
    }
  }
  return { result, failed: false };
}

function makeSolveItem(engine, input, config) {
  const imported = parseJson(engine.import_puzzle_json(String(input || "")));
  if (!imported?.ok) {
    return {
      ok: false,
      input,
      puzzle: String(input || "").slice(0, 120),
      error: imported?.error || "import failed",
      errorCode: imported?.errorCode || "IMPORT_FAILED",
    };
  }
  const solve = parseJson(engine.solve_summary_json(Number(config.maxSteps || 500)));
  return {
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
}

async function runTask(taskId, config) {
  cancelRequested = false;
  const engine = await getEngine();
  maybeSetTechniques(engine, config.techniqueConfig);

  let generated = 0;
  let attempts = 0;
  let failed = 0;
  const mode = config.mode === "solve" ? "solve" : "generate";
  const puzzles = Array.isArray(config.puzzles) ? config.puzzles : [];
  const target = mode === "solve" ? puzzles.length : Number(config.target || 0);
  const hasFiniteTarget = mode === "solve" || target > 0;
  const progress = () => self.postMessage({ type: "progress", taskId, generated, attempts, failed, target: hasFiniteTarget ? target : 0 });

  while (!cancelRequested && (!hasFiniteTarget || generated < target)) {
    attempts += 1;
    if (mode === "solve") {
      const result = makeSolveItem(engine, puzzles[generated], config);
      if (!result.ok) failed += 1;
      if (result.solve?.status === "invalid_step") {
        self.postMessage({ type: "invalid_step", taskId, result, generated, attempts, failed, target });
        return;
      }
      generated += 1;
      self.postMessage({ type: "item", taskId, result, generated, attempts, failed, target });
    } else {
      const item = makeGeneratedItem(engine, config);
      if (item.invalid) {
        self.postMessage({ type: "invalid_step", taskId, result: item.result, generated, attempts, failed, target });
        return;
      }
      if (item.result?.ok) {
        generated += 1;
        self.postMessage({ type: "item", taskId, result: item.result, generated, attempts, failed, target });
      } else {
        failed += 1;
        if (item.result?.status === "invalid_step") {
          self.postMessage({ type: "invalid_step", taskId, result: item.result, generated, attempts, failed, target });
          return;
        }
      }
    }

    if ((attempts & 15) === 0 || generated >= target) progress();
    // Yield rarely so the worker can receive cancel messages. The heavy loop
    // stays in the worker and never waits for requestAnimationFrame.
    if ((attempts & 31) === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  if (cancelRequested) {
    self.postMessage({ type: "cancelled", taskId, generated, attempts, failed, target });
  } else {
    self.postMessage({ type: "done", taskId, generated, attempts, failed, target });
  }
}

self.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type === "cancel") {
    cancelRequested = true;
    return;
  }
  if (message.type !== "start") return;
  runTask(message.taskId, message.config || {}).catch((error) => {
    self.postMessage({
      type: "error",
      taskId: message.taskId,
      error: error instanceof Error ? error.message : String(error),
      errorCode: error?.code || "WORKER_RUNTIME_FAILED",
    });
  });
});
