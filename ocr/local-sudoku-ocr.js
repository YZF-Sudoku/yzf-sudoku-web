// Local Sudoku image OCR for YZF_Sudoku.
// Runs completely in the browser with ONNX Runtime Web; no sudoku-ocr.com fallback.
// Recognition model attribution: Alex Kubiesa / Sudoku OCR model family.

const DEFAULT_MODEL_BASE = new URL("./models/", import.meta.url).href;
const DEFAULT_ORT_BASE = new URL("./ort/", import.meta.url).href;
const LOCALIZER_MODEL = "puzzle_localizer.ort";
const CLASSIFIER_MODEL = "puzzle_classifier.ort";
const BOARD_SIZE = 576;
const LOCALIZER_SIZE = 256;
const CELL_SIZE = BOARD_SIZE / 9;

function standaloneAssets() {
  return globalThis.YZF_OCR_STANDALONE_ASSETS || null;
}

function decodeBase64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  const chunkSize = 0x8000;
  for (let offset = 0; offset < binary.length; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, binary.length);
    for (let i = offset; i < end; ++i) bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getStandaloneAssetBytes(name) {
  const assets = standaloneAssets();
  if (!assets || !assets[name]) return null;
  return decodeBase64ToUint8Array(assets[name]);
}

function getStandaloneAssetText(name) {
  const bytes = getStandaloneAssetBytes(name);
  if (!bytes) return null;
  return new TextDecoder().decode(bytes);
}

let standaloneWasmBlobUrl = null;

let localizerSessionPromise = null;
let classifierSessionPromise = null;
let ortRuntimeConfigPromise = null;
let ortRuntimeModuleUrl = null;

function requireOrt() {
  const ort = globalThis.ort;
  if (!ort) {
    throw new Error("ONNX Runtime Web is not loaded: missing web-app/ocr/ort/ort.min.js");
  }
  return ort;
}

async function configureOrtRuntime(ort) {
  if (!ort.env?.wasm) return;
  if (ortRuntimeConfigPromise) return ortRuntimeConfigPromise;
  ortRuntimeConfigPromise = (async () => {
    // Force the smallest plain WASM runtime. No JSEP, no asyncify, no worker/proxy.
    // In standalone file:// mode, the .mjs and .wasm are loaded from embedded base64
    // assets and exposed through Blob URLs, so no local HTTP server is needed.
    let moduleSource = getStandaloneAssetText("ort-wasm-simd-threaded.mjs");
    let wasmUrl = null;

    if (moduleSource != null) {
      if (!ortRuntimeModuleUrl) {
        ortRuntimeModuleUrl = URL.createObjectURL(new Blob([moduleSource], { type: "text/javascript" }));
      }
      if (!standaloneWasmBlobUrl) {
        const wasmBytes = getStandaloneAssetBytes("ort-wasm-simd-threaded.wasm");
        if (!wasmBytes) throw new Error("Standalone OCR is missing ort-wasm-simd-threaded.wasm");
        standaloneWasmBlobUrl = URL.createObjectURL(new Blob([wasmBytes], { type: "application/wasm" }));
      }
      wasmUrl = standaloneWasmBlobUrl;
    } else {
      const mjsUrl = new URL("ort-wasm-simd-threaded.mjs", DEFAULT_ORT_BASE).href;
      wasmUrl = new URL("ort-wasm-simd-threaded.wasm", DEFAULT_ORT_BASE).href;
      if (!ortRuntimeModuleUrl) {
        const response = await fetch(mjsUrl, { cache: "force-cache" });
        if (!response.ok) {
          throw new Error(`ONNX Runtime Web module load failed：${response.status} ${mjsUrl}`);
        }
        moduleSource = await response.text();
        ortRuntimeModuleUrl = URL.createObjectURL(new Blob([moduleSource], { type: "text/javascript" }));
      }
    }

    ort.env.wasm.wasmPaths = {
      mjs: ortRuntimeModuleUrl,
      wasm: wasmUrl,
    };
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
  })();
  return ortRuntimeConfigPromise;
}
async function createSession(modelUrl, embeddedName = "") {
  const ort = requireOrt();
  await configureOrtRuntime(ort);
  const embeddedModel = embeddedName ? getStandaloneAssetBytes(embeddedName) : null;
  return ort.InferenceSession.create(embeddedModel || modelUrl, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
}

async function getLocalizerSession() {
  if (!localizerSessionPromise) {
    localizerSessionPromise = createSession(DEFAULT_MODEL_BASE + LOCALIZER_MODEL, LOCALIZER_MODEL);
  }
  return localizerSessionPromise;
}

async function getClassifierSession() {
  if (!classifierSessionPromise) {
    classifierSessionPromise = createSession(DEFAULT_MODEL_BASE + CLASSIFIER_MODEL, CLASSIFIER_MODEL);
  }
  return classifierSessionPromise;
}

function canvasFromBitmap(bitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  return canvas;
}

async function loadImageCanvas(fileOrBlob) {
  if (!(fileOrBlob instanceof Blob)) {
    throw new Error("Please choose an image file or paste an image.");
  }
  const bitmap = await createImageBitmap(fileOrBlob);
  return canvasFromBitmap(bitmap);
}

function grayscaleFromCanvas(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const src = image.data;
  const rgba = new Uint8ClampedArray(src);
  const gray = new Float32Array(canvas.width * canvas.height);
  for (let i = 0, p = 0; i < gray.length; ++i, p += 4) {
    gray[i] = (0.299 * src[p] + 0.587 * src[p + 1] + 0.114 * src[p + 2]) / 255;
  }
  return { gray, rgba, width: canvas.width, height: canvas.height };
}

function resizeGray(src, sw, sh, dw, dh) {
  const out = new Float32Array(dw * dh);
  const scaleX = sw / dw;
  const scaleY = sh / dh;
  for (let y = 0; y < dh; ++y) {
    const sy = Math.min(sh - 1, (y + 0.5) * scaleY - 0.5);
    const y0 = Math.max(0, Math.floor(sy));
    const y1 = Math.min(sh - 1, y0 + 1);
    const fy = sy - y0;
    for (let x = 0; x < dw; ++x) {
      const sx = Math.min(sw - 1, (x + 0.5) * scaleX - 0.5);
      const x0 = Math.max(0, Math.floor(sx));
      const x1 = Math.min(sw - 1, x0 + 1);
      const fx = sx - x0;
      const a = src[y0 * sw + x0];
      const b = src[y0 * sw + x1];
      const c = src[y1 * sw + x0];
      const d = src[y1 * sw + x1];
      out[y * dw + x] = a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
    }
  }
  return out;
}

function solveLinearSystem(A, b) {
  const n = b.length;
  const M = A.map((row, i) => row.concat([b[i]]));
  for (let col = 0; col < n; ++col) {
    let pivot = col;
    let best = Math.abs(M[col][col]);
    for (let r = col + 1; r < n; ++r) {
      const v = Math.abs(M[r][col]);
      if (v > best) { best = v; pivot = r; }
    }
    if (best < 1e-12) throw new Error("Failed to solve the board perspective transform");
    if (pivot !== col) [M[col], M[pivot]] = [M[pivot], M[col]];
    const div = M[col][col];
    for (let c = col; c <= n; ++c) M[col][c] /= div;
    for (let r = 0; r < n; ++r) {
      if (r === col) continue;
      const factor = M[r][col];
      if (!factor) continue;
      for (let c = col; c <= n; ++c) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row) => row[n]);
}

function homographyFromPairs(src, dst) {
  const A = [];
  const b = [];
  for (let i = 0; i < 4; ++i) {
    const x = src[i][0], y = src[i][1];
    const u = dst[i][0], v = dst[i][1];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  const h = solveLinearSystem(A, b);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function applyHomography(H, x, y) {
  const den = H[6] * x + H[7] * y + H[8];
  return [(H[0] * x + H[1] * y + H[2]) / den, (H[3] * x + H[4] * y + H[5]) / den];
}

function sampleBilinear(src, w, h, x, y) {
  if (x < 0 || y < 0 || x > w - 1 || y > h - 1) return 1;
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
  const fx = x - x0, fy = y - y0;
  const a = src[y0 * w + x0];
  const b = src[y0 * w + x1];
  const c = src[y1 * w + x0];
  const d = src[y1 * w + x1];
  return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
}

function warpGrayByCorners(gray, width, height, corners, size = BOARD_SIZE) {
  // Match the reference/Coach model pipeline: localizer emits normalized
  // corners in TL, BL, BR, TR order, and the board is sampled by linearly
  // interpolating the left/right edges into a 576×576 square.  This is not
  // a generic cell-by-cell crop; the classifier expects the whole warped
  // board as [1,1,576,576].
  const [topLeft, bottomLeft, bottomRight, topRight] = corners;
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; ++y) {
    const t = size <= 1 ? 0 : y / (size - 1);
    const leftX = topLeft[0] + (bottomLeft[0] - topLeft[0]) * t;
    const leftY = topLeft[1] + (bottomLeft[1] - topLeft[1]) * t;
    const rightX = topRight[0] + (bottomRight[0] - topRight[0]) * t;
    const rightY = topRight[1] + (bottomRight[1] - topRight[1]) * t;
    for (let x = 0; x < size; ++x) {
      const u = size <= 1 ? 0 : x / (size - 1);
      const sx = leftX + (rightX - leftX) * u;
      const sy = leftY + (rightY - leftY) * u;
      out[y * size + x] = sampleBilinear(gray, width, height, sx, sy);
    }
  }
  return out;
}

function sampleBilinearRgba(src, w, h, x, y) {
  if (x < 0 || y < 0 || x > w - 1 || y > h - 1) return [255, 255, 255, 255];
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
  const fx = x - x0, fy = y - y0;
  const out = [0, 0, 0, 255];
  for (let ch = 0; ch < 4; ++ch) {
    const a = src[(y0 * w + x0) * 4 + ch];
    const b = src[(y0 * w + x1) * 4 + ch];
    const c = src[(y1 * w + x0) * 4 + ch];
    const d = src[(y1 * w + x1) * 4 + ch];
    out[ch] = Math.max(0, Math.min(255, Math.round(a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy)));
  }
  return out;
}

function warpRgbaByCorners(rgba, width, height, corners, size = BOARD_SIZE) {
  const [topLeft, bottomLeft, bottomRight, topRight] = corners;
  const out = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; ++y) {
    const t = size <= 1 ? 0 : y / (size - 1);
    const leftX = topLeft[0] + (bottomLeft[0] - topLeft[0]) * t;
    const leftY = topLeft[1] + (bottomLeft[1] - topLeft[1]) * t;
    const rightX = topRight[0] + (bottomRight[0] - topRight[0]) * t;
    const rightY = topRight[1] + (bottomRight[1] - topRight[1]) * t;
    for (let x = 0; x < size; ++x) {
      const u = size <= 1 ? 0 : x / (size - 1);
      const sx = leftX + (rightX - leftX) * u;
      const sy = leftY + (rightY - leftY) * u;
      const px = sampleBilinearRgba(rgba, width, height, sx, sy);
      const idx = (y * size + x) * 4;
      out[idx] = px[0];
      out[idx + 1] = px[1];
      out[idx + 2] = px[2];
      out[idx + 3] = px[3];
    }
  }
  return out;
}

async function locateBoard(gray, width, height) {
  const ort = requireOrt();
  const session = await getLocalizerSession();
  const resized = resizeGray(gray, width, height, LOCALIZER_SIZE, LOCALIZER_SIZE);
  const inputName = session.inputNames?.[0] || "input";
  const outputName = session.outputNames?.[0];
  const feeds = { [inputName]: new ort.Tensor("float32", resized, [1, 1, LOCALIZER_SIZE, LOCALIZER_SIZE]) };
  const outputs = await session.run(feeds);
  const tensor = outputName ? outputs[outputName] : Object.values(outputs)[0];
  const v = Array.from(tensor.data || tensor);
  if (v.length < 8) throw new Error("Unexpected localizer output format");

  // Model used by Sudoku Coach/Sudoku OCR family emits normalized
  // points in TL, BL, BR, TR order. Keep that exact order because the
  // warp step below mirrors the reference/Coach pipeline.
  const raw = [
    [v[0] * width, v[1] * height],
    [v[2] * width, v[3] * height],
    [v[4] * width, v[5] * height],
    [v[6] * width, v[7] * height],
  ];
  const valid = raw.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (!valid) throw new Error("The localizer could not locate the Sudoku board");
  return raw;
}

function otsuThreshold(values) {
  const hist = new Uint32Array(256);
  for (const v of values) hist[Math.max(0, Math.min(255, v | 0))] += 1;
  const total = values.length;
  if (!total) return 60;
  let sum = 0;
  for (let i = 0; i < 256; ++i) sum += i * hist[i];
  let sumB = 0;
  let wB = 0;
  let bestVariance = -1;
  let threshold = 60;
  for (let t = 0; t < 256; ++t) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);
    if (variance > bestVariance) {
      bestVariance = variance;
      threshold = t;
    }
  }
  return threshold;
}

async function classifyBoard(warpedGray) {
  const ort = requireOrt();
  const session = await getClassifierSession();
  const inputName = session.inputNames?.[0] || "input";
  const outputName = session.outputNames?.[0];
  const feeds = { [inputName]: new ort.Tensor("float32", warpedGray, [1, 1, BOARD_SIZE, BOARD_SIZE]) };
  const outputs = await session.run(feeds);
  const tensor = outputName ? outputs[outputName] : Object.values(outputs)[0];
  return Array.from(tensor.data);
}

function getModelOutput(outputs, digit, cellIndex) {
  return outputs[digit * 81 + cellIndex];
}

function isBlackDigitCellReferenceStyle(warpedRgba, warpedGray, cellIndex) {
  const row = Math.floor(cellIndex / 9);
  const col = cellIndex % 9;
  const cellSize = CELL_SIZE; // 64 for 576×576.
  const x1 = Math.round(col * cellSize);
  const y1 = Math.round(row * cellSize);
  const x2 = Math.min(BOARD_SIZE, Math.round(x1 + cellSize));
  const y2 = Math.min(BOARD_SIZE, Math.round(y1 + cellSize));

  const grayValues = [];
  for (let y = y1; y < y2; ++y) {
    for (let x = x1; x < x2; ++x) {
      grayValues.push(Math.round(warpedGray[y * BOARD_SIZE + x] * 255));
    }
  }
  let threshold = otsuThreshold(grayValues);
  if (!Number.isFinite(threshold)) threshold = 60;

  let fgPx = 0;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  for (let y = y1; y < y2; ++y) {
    for (let x = x1; x < x2; ++x) {
      const gi = y * BOARD_SIZE + x;
      const grayByte = Math.round(warpedGray[gi] * 255);
      // Match the reference DLL: foreground is darker than the Otsu threshold.
      if (grayByte < threshold) {
        const pi = gi * 4;
        rSum += warpedRgba[pi];
        gSum += warpedRgba[pi + 1];
        bSum += warpedRgba[pi + 2];
        fgPx += 1;
      }
    }
  }

  // The reference returns true for empty cells. Candidate cells are decided by
  // modelOutputs[pp] < 0 before this value is used, so this is only relevant
  // for the color split of cells that the model marks as large digits.
  if (fgPx === 0) {
    return { isBlack: true, foregroundPixels: 0, threshold };
  }

  const rAvg = rSum / fgPx;
  const gAvg = gSum / fgPx;
  const bAvg = bSum / fgPx;
  const grayAvg = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
  const colorNeutral = Math.abs(rAvg - gAvg) < 30 && Math.abs(gAvg - bAvg) < 30;
  return {
    isBlack: grayAvg < 70 && colorNeutral,
    foregroundPixels: fgPx,
    threshold,
    rAvg,
    gAvg,
    bAvg,
    grayAvg,
    colorNeutral,
  };
}

function decodeCellsFromReferenceModelOutputs(modelOutputs, warpedRgba, warpedGray) {
  if (!modelOutputs || modelOutputs.length < 810) {
    throw new Error(`Unexpected classifier output format: expected 810 floats, got ${modelOutputs?.length || 0}`);
  }

  const cells = [];
  let noCandidateCells = 0;

  for (let pp = 0; pp < 81; ++pp) {
    // Direct port of the FB post-processing logic:
    //   If modelOutputs(pp) < 0 Then candidate cell
    //   Else large digit; value is max channel among digits 1..9.
    if (modelOutputs[pp] < 0) {
      let candidateMask = 0;
      for (let vCand = 1; vCand <= 9; ++vCand) {
        if (getModelOutput(modelOutputs, vCand, pp) > 0) {
          candidateMask |= (1 << vCand);
        }
      }
      if (candidateMask === 0) noCandidateCells += 1;
      cells.push({
        value: ".",
        isGiven: false,
        candidateMask,
        rawEmptyScore: modelOutputs[pp],
        source: "model-candidates",
      });
    } else {
      let vClue = 1;
      let bestScore = getModelOutput(modelOutputs, 1, pp);
      for (let vCand = 2; vCand <= 9; ++vCand) {
        const score = getModelOutput(modelOutputs, vCand, pp);
        if (score > bestScore) {
          bestScore = score;
          vClue = vCand;
        }
      }
      const color = isBlackDigitCellReferenceStyle(warpedRgba, warpedGray, pp);
      cells.push({
        value: String(vClue),
        isGiven: Boolean(color.isBlack),
        candidateMask: 0,
        rawEmptyScore: modelOutputs[pp],
        confidence: bestScore,
        color,
        source: "model-large-digit",
      });
    }
  }

  return { cells, noCandidateCells };
}

function buildCoachJson(cells) {
  let givenDigits = "";
  let userDigits = "";
  const masks = [];
  for (const cell of cells) {
    const hasDigit = /^[1-9]$/.test(cell.value);
    if (hasDigit && cell.isGiven) {
      givenDigits += cell.value;
      userDigits += ".";
      masks.push("0");
    } else if (hasDigit) {
      givenDigits += ".";
      userDigits += cell.value;
      masks.push("0");
    } else {
      givenDigits += ".";
      userDigits += ".";
      masks.push(String(cell.candidateMask || 0));
    }
  }
  return {
    givenDigits,
    userDigits,
    userCellCandidates: masks.join("-"),
  };
}

function rgbaToCanvas(rgba, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const image = new ImageData(new Uint8ClampedArray(rgba), width, height);
  ctx.putImageData(image, 0, 0);
  return canvas;
}

function canvasToPreviewDataUrl(canvas, maxSide = 720) {
  if (!canvas) return "";
  const width = Number(canvas.width || 0);
  const height = Number(canvas.height || 0);
  if (!width || !height) return "";
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(width * scale));
  out.height = Math.max(1, Math.round(height * scale));
  const ctx = out.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(canvas, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}

function buildOcrPreview(canvas, warpedRgba) {
  const warpedCanvas = rgbaToCanvas(warpedRgba, BOARD_SIZE, BOARD_SIZE);
  return {
    originalDataUrl: canvasToPreviewDataUrl(canvas, 720),
    warpedDataUrl: canvasToPreviewDataUrl(warpedCanvas, 720),
  };
}

export async function recognizeSudokuImageToCoachJson(fileOrBlob, options = {}) {
  const canvas = await loadImageCanvas(fileOrBlob);
  const source = grayscaleFromCanvas(canvas);
  const corners = await locateBoard(source.gray, source.width, source.height);
  const warpedGray = warpGrayByCorners(source.gray, source.width, source.height, corners, BOARD_SIZE);
  const warpedRgba = warpRgbaByCorners(source.rgba, source.width, source.height, corners, BOARD_SIZE);
  const modelOutputs = await classifyBoard(warpedGray);
  const { cells, noCandidateCells } = decodeCellsFromReferenceModelOutputs(modelOutputs, warpedRgba, warpedGray);
  const coachJson = buildCoachJson(cells);
  const clueCount = [...coachJson.givenDigits].filter((ch) => ch >= "1" && ch <= "9").length;
  const userDigitCount = [...coachJson.userDigits].filter((ch) => ch >= "1" && ch <= "9").length;
  const candidateCells = cells.filter((cell) => cell.candidateMask).length;
  const preview = options.includePreview === false ? null : buildOcrPreview(canvas, warpedRgba);
  return {
    ok: true,
    format: "coach-json",
    coachJson,
    cells,
    corners,
    clueCount,
    userDigitCount,
    candidateCells,
    noCandidateCells,
    preview,
  };
}

export function localSudokuOcrAttribution() {
  return "Sudoku image recognition uses a local model trained by Alex Kubiesa / Sudoku OCR; no online fallback is used.";
}
