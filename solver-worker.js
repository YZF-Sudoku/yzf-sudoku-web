import createModule from "./sudoku_wasm.js?v=20260528-v227-whip-perf-memory-mode";

const APP_VERSION = "20260528-v227-whip-perf-memory-mode";

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
  if (message.type !== "solve" && message.type !== "findall") return;

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
    } else {
      resultText = engine.all_steps_for_import_json(
        String(message.snapshotLibrary || ""),
        Number(message.sourceStepIndex || 0)
      );
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
      elapsedMs: performance.now() - startedAt,
    });
  }
});
