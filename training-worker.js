import createModule from "./sudoku_wasm.js?v=wasm-9babdba8bdca334e";

const APP_VERSION = "wasm-9babdba8bdca334e";

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
  if (message.type !== "generate") {
    return;
  }

  try {
    const engine = await getEngine();
    const method = message.summary
      ? "generate_training_puzzle_summary_json"
      : "generate_training_puzzle_json";
    const resultText = engine[method](
      message.kind || "BruteForce",
      Number(message.difficulty || 0),
      Number(message.maxAttempts || 0)
    );
    self.postMessage({ type: "result", resultText });
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
