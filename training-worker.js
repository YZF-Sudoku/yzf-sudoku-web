/*
 * 维护说明（简体中文）
 * 职责：训练生成 Worker。
 * 数据流：后台生成符合技巧过滤条件的训练题与步骤。
 * 修改时注意：
 * - 本文件只应在明确理解数据流后修改；注释描述的是设计意图和维护约束。
 * - 重构时须保持既有求解结果、技巧优先级、前后端字段或测试基线不变。
 * - 主线程代码要避免长时间同步计算；耗时工作优先留在 Worker/WASM。
 * - 涉及移动端指针事件时同时检查鼠标、触摸、长按抑制和浏览器返回行为。
 */
import createModule from "./sudoku_wasm.js?v=wasm-00cc10fa7274d5df";

const APP_VERSION = "wasm-00cc10fa7274d5df";

let enginePromise = null;

async function getEngine() {
  if (!enginePromise) {
    enginePromise = createModule({
      locateFile: (path) => path.endsWith(".wasm") ? `./${path}?v=${APP_VERSION}` : path,
    }).then((mod) => new mod.Engine());
  }
  return enginePromise;
}

function applyTechniqueConfig(engine, config) {
  if (!config || typeof engine.set_techniques_json !== "function") return;
  engine.set_techniques_json(JSON.stringify(config));
}

self.addEventListener("message", async (event) => {
  const message = event.data || {};
  if (message.type !== "generate") {
    return;
  }

  try {
    const engine = await getEngine();
    applyTechniqueConfig(engine, message.techniqueConfig);
    const textFilter = message.textFilter && typeof message.textFilter === "object"
      ? message.textFilter
      : { includeText: "", excludeText: "", caseSensitive: false, findAll: true, otp: false };
    const filteredMethod = message.summary
      ? "generate_training_puzzle_summary_filtered_json"
      : "generate_training_puzzle_filtered_json";
    const legacyMethod = message.summary
      ? "generate_training_puzzle_summary_json"
      : "generate_training_puzzle_json";
    const filterActive = Boolean(String(textFilter.includeText || "").trim() || String(textFilter.excludeText || "").trim());
    const otp = Boolean(textFilter.otp);
    const requestKind = otp ? String(message.kind || "") : String(message.kind || "BruteForce");
    let resultText = "";
    if (typeof engine[filteredMethod] === "function") {
      resultText = engine[filteredMethod](
        requestKind,
        Number(message.difficulty || 0),
        Number(message.maxAttempts || 0),
        JSON.stringify(textFilter)
      );
    } else if (!otp && !filterActive && typeof engine[legacyMethod] === "function") {
      resultText = engine[legacyMethod](
        requestKind,
        Number(message.difficulty || 0),
        Number(message.maxAttempts || 0)
      );
    } else {
      throw new Error(otp
        ? "OTP training generation is unavailable in this WASM build"
        : "Training text filtering is unavailable in this WASM build");
    }
    self.postMessage({ type: "result", resultText });
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : String(error),
      errorCode: error?.code || "WORKER_RUNTIME_FAILED",
    });
  }
});
