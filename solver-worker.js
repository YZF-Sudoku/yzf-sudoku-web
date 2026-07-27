import createModule from "./sudoku_wasm.js?v=wasm-1a4ff45222ba599b";

const APP_VERSION = "wasm-1a4ff45222ba599b";

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
