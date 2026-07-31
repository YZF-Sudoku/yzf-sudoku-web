/*
 * 维护说明（简体中文）
 * 职责：评分 Worker。
 * 数据流：隔离耗时评分任务并转发进度、结果和错误。
 * 修改时注意：
 * - 本文件只应在明确理解数据流后修改；注释描述的是设计意图和维护约束。
 * - 重构时须保持既有求解结果、技巧优先级、前后端字段或测试基线不变。
 * - 主线程代码要避免长时间同步计算；耗时工作优先留在 Worker/WASM。
 * - 涉及移动端指针事件时同时检查鼠标、触摸、长按抑制和浏览器返回行为。
 */
import createModule from "./sudoku_wasm.js?v=wasm-344e4443cbd019d1";

const APP_VERSION = "wasm-344e4443cbd019d1";
let enginePromise = null;

async function getEngine() {
  if (!enginePromise) {
    enginePromise = createModule({
      locateFile: (path) => path.endsWith(".wasm") ? `./${path}?v=${APP_VERSION}` : path,
    }).then((mod) => new mod.Engine());
  }
  return enginePromise;
}

self.addEventListener("message", async (event) => {
  const message = event.data || {};
  if (message.type !== "rate") return;

  const startedAt = performance.now();
  try {
    const engine = await getEngine();
    self.postMessage({ type: "started", requestId: message.requestId });
    const input = String(message.input || "");
    const fallbackPuzzle = String(message.fallbackPuzzle || "");
    const resultText = typeof engine.rate_import_text_json === "function"
      ? engine.rate_import_text_json(input)
      : engine.rate_puzzle_json(fallbackPuzzle);
    self.postMessage({
      type: "result",
      requestId: message.requestId,
      resultText,
      elapsedMs: performance.now() - startedAt,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      requestId: message.requestId,
      error: error instanceof Error ? error.message : String(error),
      errorCode: error?.code || "WORKER_RUNTIME_FAILED",
      elapsedMs: performance.now() - startedAt,
    });
  }
});
