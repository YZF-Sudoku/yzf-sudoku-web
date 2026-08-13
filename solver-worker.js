/*
 * 维护说明（简体中文）
 * 职责：求解 Worker。
 * 数据流：在后台加载 WASM 并执行一步/完整求解，避免阻塞主线程。
 * 修改时注意：
 * - 本文件只应在明确理解数据流后修改；注释描述的是设计意图和维护约束。
 * - 重构时须保持既有求解结果、技巧优先级、前后端字段或测试基线不变。
 * - 主线程代码要避免长时间同步计算；耗时工作优先留在 Worker/WASM。
 * - 涉及移动端指针事件时同时检查鼠标、触摸、长按抑制和浏览器返回行为。
 */
import createModule from "./sudoku_wasm.js?v=wasm-2f07dc043db4ba87";

const APP_VERSION = "wasm-2f07dc043db4ba87";

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
  if (message.type !== "solve" && message.type !== "findall" && message.type !== "tlg") return;

  const startedAt = performance.now();
  try {
    const engine = await getEngine();
    applyTechniqueConfig(engine, message.techniqueConfig);

    let resultText = "";
    if (message.type === "solve") {
      resultText = engine.solve_path_for_import_json(
        String(message.snapshotLibrary || ""),
        Number(message.maxSteps || 500)
      );
    } else if (message.type === "findall") {
      resultText = engine.all_steps_for_import_json(
        String(message.snapshotLibrary || ""),
        Number(message.sourceStepIndex || 0)
      );
    } else {
      if (typeof engine.tlgSolverFindEliminationsV440 !== "function") {
        const unavailable = new Error("TLG solver entry point is not available in this WASM build.");
        unavailable.code = "TLG_ENTRY_UNAVAILABLE";
        throw unavailable;
      }
      resultText = engine.tlgSolverFindEliminationsV440(String(message.requestJson || ""));
    }

    self.postMessage({
      type: "result",
      task: message.type,
      requestId: message.requestId,
      resultText,
      elapsedMs: performance.now() - startedAt,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      task: message.type,
      requestId: message.requestId,
      error: error instanceof Error ? error.message : String(error),
      errorCode: error?.code || "WORKER_RUNTIME_FAILED",
      elapsedMs: performance.now() - startedAt,
    });
  }
});
