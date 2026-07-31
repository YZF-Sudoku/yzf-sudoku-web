import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(here, "../app.js");
const source = fs.readFileSync(appPath, "utf8");

function requireContract(condition, message) {
  if (!condition) {
    console.error(`test-batch-invalid-status: ${message}`);
    process.exit(1);
  }
}

const invalidBranch = source.indexOf('if (final?.status === "invalid_step")');
const cancelledBranch = source.indexOf('else if (final?.status === "cancelled" || batchAbortRequested)', invalidBranch);
const solveDoneBranch = source.indexOf('else if (mode === "solve")', invalidBranch);
requireContract(invalidBranch >= 0, "missing explicit invalid_step terminal branch");
requireContract(cancelledBranch > invalidBranch, "invalid_step must be handled before cancelled/done branches");
requireContract(solveDoneBranch > invalidBranch, "invalid_step must be handled before solve/generate completion text");

requireContract(
  source.includes('invalidStepTerminalStatus = await stopBatchOnInvalidStep(writer, result, trainingKind);'),
  "invalid-step handler must preserve the exact terminal status text"
);
requireContract(
  source.includes('if (!invalidStepTerminalStatus) updateBatchStatus(batchProgressStatus());'),
  "progress timer must not overwrite an invalid-step terminal status"
);
requireContract(
  source.includes('window.clearInterval(timer);\n          timer = null;\n        }\n        invalidStepTerminalStatus'),
  "invalid-step handler must stop the progress timer before asynchronous output"
);

const awaitedFallbackHandlers = source.match(/await handlers\.onInvalidStep\?\.\(result\);/g) || [];
requireContract(
  awaitedFallbackHandlers.length === 3,
  `main-thread fallback must await all 3 invalid-step handlers, found ${awaitedFallbackHandlers.length}`
);
requireContract(
  source.includes('return terminalStatus;'),
  "stopBatchOnInvalidStep must return the rendered terminal message"
);

console.log("test-batch-invalid-status: ok");
