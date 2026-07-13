import createModule from "./sudoku_wasm.js?v=wasm-47dda30ae97cac69";

const APP_VERSION = "wasm-47dda30ae97cac69";
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
