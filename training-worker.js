import createModule from "./sudoku_wasm.js?v=wasm-c66616ba9de50fe0";

const APP_VERSION = "wasm-c66616ba9de50fe0";

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
    const textFilter = message.textFilter && typeof message.textFilter === "object"
      ? message.textFilter
      : { includeText: "", excludeText: "", caseSensitive: false, otp: false };
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
