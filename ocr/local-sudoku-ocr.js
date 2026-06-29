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
const OCR_RESOURCE_VERSION = "20260629-pages-resume-v6";
const OCR_ASSET_DB_NAME = "yzf-sudoku-ocr-assets-v2";
const OCR_ASSET_DB_VERSION = 1;
const OCR_ASSET_CHUNK_SIZE = 512 * 1024;
const OCR_ASSET_EVENT = "yzf-ocr-resource-progress";

function versionedAssetUrl(name, base) {
  const url = new URL(name, base);
  url.searchParams.set("v", OCR_RESOURCE_VERSION);
  return url.href;
}

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
let ortRuntimeWasmUrl = null;
let ortRuntimeWasmBinary = null;
let ortRuntimeLoadMode = "unconfigured";
let ocrAssetDbPromise = null;
const ocrAssetLoadPromises = new Map();
const ocrAssetDiagnostics = new Map();

function requireOrt() {
  const ort = globalThis.ort;
  if (!ort) {
    throw new Error("ONNX Runtime Web is not loaded: missing web-app/ocr/ort/ort.min.js");
  }
  return ort;
}

function shouldUsePersistentAssetCache() {
  const forced = globalThis.YZF_OCR_RESUMABLE_MODE;
  if (forced === "on" || forced === true) return true;
  if (forced === "off" || forced === false) return false;
  const mobileHint = globalThis.navigator?.userAgentData?.mobile;
  if (mobileHint === true) return true;
  const ua = String(globalThis.navigator?.userAgent || "");
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

function emitOcrAssetProgress(detail) {
  const normalized = {
    phase: detail.phase || "downloading",
    asset: detail.asset || "asset",
    loaded: Number(detail.loaded || 0),
    total: Number(detail.total || 0),
    attempt: Number(detail.attempt || 0),
    chunkIndex: Number(detail.chunkIndex ?? -1),
    chunkCount: Number(detail.chunkCount || 0),
    resumable: Boolean(detail.resumable),
    fromCache: Boolean(detail.fromCache),
    message: String(detail.message || ""),
  };
  if (normalized.total > 0) {
    normalized.percent = Math.max(0, Math.min(100, Math.round(normalized.loaded * 100 / normalized.total)));
  } else {
    normalized.percent = 0;
  }
  try {
    globalThis.dispatchEvent(new CustomEvent(OCR_ASSET_EVENT, { detail: normalized }));
  } catch (_) {}
}

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

function idbTransactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
  });
}

function openOcrAssetDb() {
  if (!globalThis.indexedDB) return Promise.resolve(null);
  if (ocrAssetDbPromise) return ocrAssetDbPromise;

  const openPromise = new Promise((resolve) => {
    let request;
    try {
      request = indexedDB.open(OCR_ASSET_DB_NAME, OCR_ASSET_DB_VERSION);
    } catch (_) {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
      if (!db.objectStoreNames.contains("chunks")) db.createObjectStore("chunks", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });

  ocrAssetDbPromise = openPromise;
  return openPromise;
}

function assetCacheKey(asset, url) {
  return `${OCR_RESOURCE_VERSION}|${asset}|${url}`;
}

async function readAssetMeta(db, key) {
  if (!db) return null;
  const tx = db.transaction("meta", "readonly");
  return idbRequest(tx.objectStore("meta").get(key));
}

async function writeAssetMeta(db, meta) {
  if (!db) return;
  const tx = db.transaction("meta", "readwrite");
  tx.objectStore("meta").put(meta);
  await idbTransactionDone(tx);
}

async function readAssetChunk(db, key, index) {
  if (!db) return null;
  const tx = db.transaction("chunks", "readonly");
  const record = await idbRequest(tx.objectStore("chunks").get(`${key}:${index}`));
  if (!record?.bytes) return null;
  return record.bytes instanceof Uint8Array ? record.bytes : new Uint8Array(record.bytes);
}

async function writeAssetChunk(db, key, index, bytes) {
  if (!db) return;
  const stable = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
    ? bytes.buffer
    : bytes.slice().buffer;
  const tx = db.transaction("chunks", "readwrite");
  tx.objectStore("chunks").put({ key: `${key}:${index}`, assetKey: key, index, bytes: stable });
  await idbTransactionDone(tx);
}

async function deleteAssetCache(db, key, chunkCount = 0) {
  if (!db) return;
  const tx = db.transaction(["meta", "chunks"], "readwrite");
  tx.objectStore("meta").delete(key);
  const chunks = tx.objectStore("chunks");
  for (let index = 0; index < chunkCount; ++index) chunks.delete(`${key}:${index}`);
  await idbTransactionDone(tx);
}

function retryDelaysMs() {
  const custom = globalThis.YZF_OCR_RETRY_DELAYS_MS;
  if (Array.isArray(custom) && custom.length) return custom.map((value) => Math.max(0, Number(value) || 0));
  return [0, 1200, 3500];
}

function sleep(ms) {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

async function fetchWithRetries(url, init, label, progressBase = {}) {
  const delays = retryDelaysMs();
  let lastError = null;
  for (let attempt = 0; attempt < delays.length; ++attempt) {
    await sleep(delays[attempt]);
    try {
      const response = await fetch(url, init);
      if (response.ok || response.status === 206) return response;
      lastError = new Error(`${label} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    if (attempt + 1 < delays.length) {
      emitOcrAssetProgress({
        ...progressBase,
        phase: "retry",
        attempt: attempt + 2,
        message: lastError?.message || String(lastError),
      });
    }
  }
  throw new Error(`${label} failed: ${lastError?.message || lastError || "network error"} (${url})`);
}

function parseContentRange(header) {
  const match = /^bytes\s+(\d+)-(\d+)\/(\d+|\*)$/i.exec(String(header || "").trim());
  if (!match || match[3] === "*") return null;
  return { start: Number(match[1]), end: Number(match[2]), total: Number(match[3]) };
}

function validateGenericBinary(bytes, url) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 16) {
    throw new Error(`OCR resource is empty or truncated (${url})`);
  }
  return bytes;
}

function validateWasmBinary(bytes, url) {
  validateGenericBinary(bytes, url);
  if (bytes[0] !== 0x00 || bytes[1] !== 0x61 || bytes[2] !== 0x73 || bytes[3] !== 0x6d) {
    throw new Error(`ONNX Runtime Web wasm has an invalid file header (${url})`);
  }
  return bytes;
}

async function assembleCachedAsset(db, meta, asset, url, validate) {
  const chunkCount = Number(meta.chunkCount || Math.ceil(meta.total / meta.chunkSize));
  const chunks = new Array(chunkCount);
  let loaded = 0;
  for (let index = 0; index < chunkCount; ++index) {
    const bytes = await readAssetChunk(db, meta.key, index);
    const expected = Math.min(meta.chunkSize, meta.total - index * meta.chunkSize);
    if (!bytes || bytes.byteLength !== expected) return null;
    chunks[index] = bytes;
    loaded += bytes.byteLength;
    emitOcrAssetProgress({ phase: "cache", asset, loaded, total: meta.total, fromCache: true, resumable: meta.resumable });
  }
  emitOcrAssetProgress({ phase: "assembling", asset, loaded, total: meta.total, fromCache: true, resumable: meta.resumable });
  const combined = new Uint8Array(meta.total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  validate(combined, url);
  emitOcrAssetProgress({ phase: "ready", asset, loaded: meta.total, total: meta.total, fromCache: true, resumable: meta.resumable });
  return combined;
}

async function saveCompleteAsset(db, key, asset, url, bytes, resumable, validate) {
  validate(bytes, url);
  if (!db) return bytes;
  const old = await readAssetMeta(db, key);
  if (old) await deleteAssetCache(db, key, Number(old.chunkCount || 0));
  await writeAssetChunk(db, key, 0, bytes);
  const meta = {
    key,
    asset,
    url,
    version: OCR_RESOURCE_VERSION,
    total: bytes.byteLength,
    chunkSize: bytes.byteLength,
    chunkCount: 1,
    resumable: Boolean(resumable),
    complete: true,
    updatedAt: Date.now(),
  };
  await writeAssetMeta(db, meta);
  try { globalThis.navigator?.storage?.persist?.(); } catch (_) {}
  emitOcrAssetProgress({ phase: "ready", asset, loaded: bytes.byteLength, total: bytes.byteLength, resumable, fromCache: false });
  return bytes;
}

async function downloadAssetResumable(url, asset, validate = validateGenericBinary) {
  const key = assetCacheKey(asset, url);
  const db = await openOcrAssetDb();
  let meta = await readAssetMeta(db, key);

  if (meta?.complete) {
    const cached = await assembleCachedAsset(db, meta, asset, url, validate);
    if (cached) {
      ocrAssetDiagnostics.set(asset, { mode: "indexeddb-cache", total: cached.byteLength, resumable: meta.resumable });
      return cached;
    }
    await deleteAssetCache(db, key, Number(meta.chunkCount || 0));
    meta = null;
  }

  let total = Number(meta?.total || 0);
  let chunkSize = Number(meta?.chunkSize || OCR_ASSET_CHUNK_SIZE);
  let rangeSupported = Boolean(meta && meta.complete === false && meta.resumable && total > 0);

  if (!rangeSupported) {
    emitOcrAssetProgress({ phase: "probing", asset, loaded: 0, total: 0 });
    const probe = await fetchWithRetries(
      url,
      { headers: { Range: "bytes=0-0" }, cache: "no-store", credentials: "same-origin" },
      `${asset} range probe`,
      { asset },
    );

    if (probe.status === 206) {
      const range = parseContentRange(probe.headers.get("Content-Range"));
      const probeBytes = new Uint8Array(await probe.arrayBuffer());
      if (!range || range.start !== 0 || probeBytes.byteLength !== 1 || !Number.isFinite(range.total) || range.total < 16) {
        throw new Error(`${asset} returned an invalid Range response (${url})`);
      }
      total = range.total;
      chunkSize = OCR_ASSET_CHUNK_SIZE;
      rangeSupported = true;
      meta = {
        key,
        asset,
        url,
        version: OCR_RESOURCE_VERSION,
        total,
        chunkSize,
        chunkCount: Math.ceil(total / chunkSize),
        resumable: true,
        complete: false,
        updatedAt: Date.now(),
      };
      await writeAssetMeta(db, meta);
    } else if (probe.status === 200) {
      const bytes = new Uint8Array(await probe.arrayBuffer());
      ocrAssetDiagnostics.set(asset, { mode: "full-download-no-range", total: bytes.byteLength, resumable: false });
      return saveCompleteAsset(db, key, asset, url, bytes, false, validate);
    } else {
      throw new Error(`${asset} range probe returned HTTP ${probe.status} (${url})`);
    }
  }

  const chunkCount = Math.ceil(total / chunkSize);
  if (!meta || meta.total !== total || meta.chunkSize !== chunkSize || meta.chunkCount !== chunkCount) {
    if (meta) await deleteAssetCache(db, key, Number(meta.chunkCount || 0));
    meta = {
      key,
      asset,
      url,
      version: OCR_RESOURCE_VERSION,
      total,
      chunkSize,
      chunkCount,
      resumable: true,
      complete: false,
      updatedAt: Date.now(),
    };
    await writeAssetMeta(db, meta);
  }

  let loaded = 0;
  const present = new Array(chunkCount).fill(false);
  const memoryChunks = db ? null : new Array(chunkCount);
  for (let index = 0; index < chunkCount; ++index) {
    const expected = Math.min(chunkSize, total - index * chunkSize);
    const cached = await readAssetChunk(db, key, index);
    if (cached?.byteLength === expected) {
      present[index] = true;
      loaded += expected;
    }
  }
  if (loaded > 0) {
    emitOcrAssetProgress({ phase: "resume", asset, loaded, total, chunkCount, resumable: true, fromCache: true });
  }

  for (let index = 0; index < chunkCount; ++index) {
    if (present[index]) continue;
    const start = index * chunkSize;
    const end = Math.min(total - 1, start + chunkSize - 1);
    const response = await fetchWithRetries(
      url,
      {
        headers: { Range: `bytes=${start}-${end}` },
        cache: "no-store",
        credentials: "same-origin",
      },
      `${asset} chunk ${index + 1}/${chunkCount}`,
      { asset, loaded, total, chunkIndex: index, chunkCount, resumable: true },
    );

    if (response.status === 200) {
      const full = new Uint8Array(await response.arrayBuffer());
      if (full.byteLength !== total) {
        throw new Error(`${asset} server stopped honoring Range requests and returned ${full.byteLength}/${total} bytes (${url})`);
      }
      ocrAssetDiagnostics.set(asset, { mode: "full-download-range-fallback", total, resumable: false });
      return saveCompleteAsset(db, key, asset, url, full, false, validate);
    }

    if (response.status !== 206) {
      throw new Error(`${asset} chunk ${index + 1}/${chunkCount} returned HTTP ${response.status} (${url})`);
    }
    const range = parseContentRange(response.headers.get("Content-Range"));
    const bytes = new Uint8Array(await response.arrayBuffer());
    const expected = end - start + 1;
    if (!range || range.start !== start || range.end !== end || range.total !== total || bytes.byteLength !== expected) {
      throw new Error(`${asset} chunk ${index + 1}/${chunkCount} is incomplete (${bytes.byteLength}/${expected} bytes; ${url})`);
    }
    if (db) await writeAssetChunk(db, key, index, bytes);
    else memoryChunks[index] = bytes;
    loaded += bytes.byteLength;
    emitOcrAssetProgress({
      phase: "downloading",
      asset,
      loaded,
      total,
      chunkIndex: index,
      chunkCount,
      resumable: true,
      fromCache: false,
    });
  }

  if (!db) {
    const combined = new Uint8Array(total);
    let offset = 0;
    for (let index = 0; index < chunkCount; ++index) {
      const chunk = memoryChunks[index];
      if (!chunk) throw new Error(`${asset} in-memory chunk ${index + 1}/${chunkCount} is missing (${url})`);
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    validate(combined, url);
    emitOcrAssetProgress({ phase: "ready", asset, loaded: total, total, resumable: true, fromCache: false });
    ocrAssetDiagnostics.set(asset, { mode: "range-memory", total, resumable: true });
    return combined;
  }

  meta.complete = true;
  meta.updatedAt = Date.now();
  await writeAssetMeta(db, meta);
  const combined = await assembleCachedAsset(db, meta, asset, url, validate);
  if (!combined) throw new Error(`${asset} cache assembly failed after download (${url})`);
  ocrAssetDiagnostics.set(asset, { mode: "range-indexeddb", total, resumable: true });
  try { globalThis.navigator?.storage?.persist?.(); } catch (_) {}
  return combined;
}

async function loadPersistentAsset(url, asset, validate = validateGenericBinary) {
  const key = assetCacheKey(asset, url);
  if (ocrAssetLoadPromises.has(key)) return ocrAssetLoadPromises.get(key);
  const promise = downloadAssetResumable(url, asset, validate);
  ocrAssetLoadPromises.set(key, promise);
  try {
    return await promise;
  } catch (error) {
    if (ocrAssetLoadPromises.get(key) === promise) ocrAssetLoadPromises.delete(key);
    throw error;
  }
}

async function fetchRuntimeModuleText(mjsUrl) {
  const response = await fetchWithRetries(
    mjsUrl,
    { cache: "force-cache", credentials: "same-origin" },
    "ONNX Runtime Web module",
    { asset: "module" },
  );
  return response.text();
}

async function configureOrtRuntime(ort) {
  if (!ort.env?.wasm) return;
  if (ortRuntimeConfigPromise) return ortRuntimeConfigPromise;

  const configPromise = (async () => {
    let moduleSource = getStandaloneAssetText("ort-wasm-simd-threaded.mjs");
    let wasmUrl;
    let wasmBinary = null;

    if (moduleSource != null) {
      if (!ortRuntimeModuleUrl) {
        ortRuntimeModuleUrl = URL.createObjectURL(new Blob([moduleSource], { type: "text/javascript" }));
      }
      const embeddedWasm = getStandaloneAssetBytes("ort-wasm-simd-threaded.wasm");
      if (!embeddedWasm) throw new Error("Standalone OCR is missing ort-wasm-simd-threaded.wasm");
      wasmBinary = validateWasmBinary(embeddedWasm, "embedded:ort-wasm-simd-threaded.wasm");
      ortRuntimeWasmBinary = wasmBinary;
      if (!standaloneWasmBlobUrl) {
        standaloneWasmBlobUrl = URL.createObjectURL(new Blob([wasmBinary], { type: "application/wasm" }));
      }
      wasmUrl = standaloneWasmBlobUrl;
      ortRuntimeLoadMode = "standalone-binary";
    } else {
      const mjsUrl = versionedAssetUrl("ort-wasm-simd-threaded.mjs", DEFAULT_ORT_BASE);
      wasmUrl = versionedAssetUrl("ort-wasm-simd-threaded.wasm", DEFAULT_ORT_BASE);
      if (!ortRuntimeModuleUrl) {
        moduleSource = await fetchRuntimeModuleText(mjsUrl);
        ortRuntimeModuleUrl = URL.createObjectURL(new Blob([moduleSource], { type: "text/javascript" }));
      }
      if (shouldUsePersistentAssetCache()) {
        wasmBinary = await loadPersistentAsset(wasmUrl, "wasm", validateWasmBinary);
        ortRuntimeWasmBinary = wasmBinary;
        ortRuntimeLoadMode = "resumable-binary";
      } else {
        ortRuntimeLoadMode = "desktop-url";
      }
    }

    ortRuntimeWasmUrl = wasmUrl;
    ort.env.wasm.wasmPaths = { mjs: ortRuntimeModuleUrl, wasm: wasmUrl };
    if (wasmBinary) ort.env.wasm.wasmBinary = wasmBinary;
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
  })();

  ortRuntimeConfigPromise = configPromise;
  try {
    return await configPromise;
  } catch (error) {
    if (ortRuntimeConfigPromise === configPromise) ortRuntimeConfigPromise = null;
    throw error;
  }
}

async function createSession(modelUrl, embeddedName = "") {
  const ort = requireOrt();
  await configureOrtRuntime(ort);
  const embeddedModel = embeddedName ? getStandaloneAssetBytes(embeddedName) : null;
  let source = embeddedModel || modelUrl;
  if (!embeddedModel && shouldUsePersistentAssetCache()) {
    const asset = embeddedName === LOCALIZER_MODEL ? "localizer" : embeddedName === CLASSIFIER_MODEL ? "classifier" : embeddedName || "model";
    source = await loadPersistentAsset(modelUrl, asset, validateGenericBinary);
  }
  try {
    return await ort.InferenceSession.create(source, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
  } catch (error) {
    const label = source instanceof Uint8Array ? `${embeddedName || "model"} binary` : modelUrl;
    const wasmLabel = ortRuntimeWasmUrl || "unresolved";
    throw new Error(`OCR session initialization failed: ${error?.message || error} (model=${label}; wasm=${wasmLabel})`);
  }
}

async function getLocalizerSession() {
  if (!localizerSessionPromise) {
    const modelUrl = versionedAssetUrl(LOCALIZER_MODEL, DEFAULT_MODEL_BASE);
    const sessionPromise = createSession(modelUrl, LOCALIZER_MODEL);
    localizerSessionPromise = sessionPromise;
    sessionPromise.catch(() => {
      if (localizerSessionPromise === sessionPromise) localizerSessionPromise = null;
    });
  }
  return localizerSessionPromise;
}

async function getClassifierSession() {
  if (!classifierSessionPromise) {
    const modelUrl = versionedAssetUrl(CLASSIFIER_MODEL, DEFAULT_MODEL_BASE);
    const sessionPromise = createSession(modelUrl, CLASSIFIER_MODEL);
    classifierSessionPromise = sessionPromise;
    sessionPromise.catch(() => {
      if (classifierSessionPromise === sessionPromise) classifierSessionPromise = null;
    });
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
  const cellX1 = Math.round(col * cellSize);
  const cellY1 = Math.round(row * cellSize);
  const cellX2 = Math.min(BOARD_SIZE, Math.round(cellX1 + cellSize));
  const cellY2 = Math.min(BOARD_SIZE, Math.round(cellY1 + cellSize));

  // Role detection only needs the large digit. Keep the outer cell rim out of
  // the sample so black/blue grid lines cannot influence the color decision.
  const margin = Math.max(5, Math.round(cellSize * 0.11));
  const x1 = Math.min(cellX2, cellX1 + margin);
  const y1 = Math.min(cellY2, cellY1 + margin);
  const x2 = Math.max(x1, cellX2 - margin);
  const y2 = Math.max(y1, cellY2 - margin);

  const grayValues = [];
  for (let y = y1; y < y2; ++y) {
    for (let x = x1; x < x2; ++x) {
      grayValues.push(Math.round(warpedGray[y * BOARD_SIZE + x] * 255));
    }
  }
  let threshold = otsuThreshold(grayValues);
  if (!Number.isFinite(threshold)) threshold = 60;

  let fgPx = 0;
  let bluePx = 0;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let blueExcessSum = 0;
  for (let y = y1; y < y2; ++y) {
    for (let x = x1; x < x2; ++x) {
      const gi = y * BOARD_SIZE + x;
      const grayByte = Math.round(warpedGray[gi] * 255);
      if (grayByte >= threshold) continue;

      const pi = gi * 4;
      const r = warpedRgba[pi];
      const g = warpedRgba[pi + 1];
      const b = warpedRgba[pi + 2];
      rSum += r;
      gSum += g;
      bSum += b;
      fgPx += 1;

      // A black digit may become dark gray after JPEG compression, scaling,
      // anti-aliasing or perspective correction. Therefore brightness is not
      // evidence of a solved digit. Only a clear blue hue is accepted as such.
      const blueOverRed = b - r;
      const blueOverGreen = b - g;
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      if (blueOverRed >= 24 && blueOverGreen >= 12 && chroma >= 28) {
        bluePx += 1;
        blueExcessSum += Math.min(255, blueOverRed + blueOverGreen);
      }
    }
  }

  // Candidate/empty cells are separated by the classifier before this helper
  // is used. With no foreground evidence, retain the safe default: a clue.
  if (fgPx === 0) {
    return {
      isBlack: true,
      isBlue: false,
      foregroundPixels: 0,
      bluePixels: 0,
      blueRatio: 0,
      threshold,
    };
  }

  const rAvg = rSum / fgPx;
  const gAvg = gSum / fgPx;
  const bAvg = bSum / fgPx;
  const grayAvg = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
  const colorNeutral = Math.max(rAvg, gAvg, bAvg) - Math.min(rAvg, gAvg, bAvg) < 30;
  const blueRatio = bluePx / fgPx;
  const meanBlueEvidence = bluePx ? blueExcessSum / bluePx : 0;

  // Require both enough supporting pixels and a meaningful share of the digit.
  // This resists isolated JPEG color noise while preserving genuinely blue text.
  const minimumBluePixels = Math.max(10, Math.ceil(fgPx * 0.08));
  const isBlue = bluePx >= minimumBluePixels
    && blueRatio >= 0.08
    && meanBlueEvidence >= 55;

  return {
    isBlack: !isBlue,
    isBlue,
    foregroundPixels: fgPx,
    bluePixels: bluePx,
    blueRatio,
    meanBlueEvidence,
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

function buildOcrPreview(warpedRgba) {
  const warpedCanvas = rgbaToCanvas(warpedRgba, BOARD_SIZE, BOARD_SIZE);
  return {
    warpedDataUrl: canvasToPreviewDataUrl(warpedCanvas, 720),
  };
}


export function resetLocalSudokuOcrRuntime() {
  localizerSessionPromise = null;
  classifierSessionPromise = null;
  ortRuntimeConfigPromise = null;
  ortRuntimeWasmBinary = null;
  ortRuntimeLoadMode = "unconfigured";
  ocrAssetLoadPromises.clear();
  try {
    if (globalThis.ort?.env?.wasm) globalThis.ort.env.wasm.wasmBinary = undefined;
  } catch (_) {}
  if (ortRuntimeModuleUrl?.startsWith?.("blob:")) {
    try { URL.revokeObjectURL(ortRuntimeModuleUrl); } catch (_) {}
  }
  ortRuntimeModuleUrl = null;
  ortRuntimeWasmUrl = null;
  if (standaloneWasmBlobUrl?.startsWith?.("blob:")) {
    try { URL.revokeObjectURL(standaloneWasmBlobUrl); } catch (_) {}
  }
  standaloneWasmBlobUrl = null;
}

export function localSudokuOcrRuntimeDiagnostics() {
  return {
    resourceVersion: OCR_RESOURCE_VERSION,
    loadMode: ortRuntimeLoadMode,
    wasmUrl: ortRuntimeWasmUrl,
    wasmBinaryBytes: ortRuntimeWasmBinary?.byteLength || 0,
    resumableAssetsEnabled: shouldUsePersistentAssetCache(),
    assetDiagnostics: Object.fromEntries(ocrAssetDiagnostics),
    numThreads: globalThis.ort?.env?.wasm?.numThreads ?? null,
    proxy: globalThis.ort?.env?.wasm?.proxy ?? null,
  };
}

export async function clearLocalSudokuOcrAssetCache() {
  ocrAssetLoadPromises.clear();
  ocrAssetDiagnostics.clear();
  const db = await openOcrAssetDb();
  if (db) {
    try { db.close(); } catch (_) {}
  }
  ocrAssetDbPromise = null;
  await new Promise((resolve) => {
    if (!globalThis.indexedDB) { resolve(); return; }
    const request = indexedDB.deleteDatabase(OCR_ASSET_DB_NAME);
    request.onsuccess = request.onerror = request.onblocked = () => resolve();
  });
}

export async function localSudokuOcrRuntimeSelfTest(options = {}) {
  const localizer = await getLocalizerSession();
  const includeClassifier = options.includeClassifier !== false;
  const classifier = includeClassifier ? await getClassifierSession() : null;
  let localizerOutputLength = 0;
  let classifierOutputLength = 0;

  if (options.runInference === true) {
    const ort = requireOrt();
    const localizerInput = localizer.inputNames?.[0] || "input";
    const localizerResult = await localizer.run({
      [localizerInput]: new ort.Tensor(
        "float32",
        new Float32Array(LOCALIZER_SIZE * LOCALIZER_SIZE),
        [1, 1, LOCALIZER_SIZE, LOCALIZER_SIZE],
      ),
    });
    const localizerOutput = localizer.outputNames?.[0]
      ? localizerResult[localizer.outputNames[0]]
      : Object.values(localizerResult)[0];
    localizerOutputLength = Number(localizerOutput?.data?.length || 0);

    if (classifier) {
      const classifierInput = classifier.inputNames?.[0] || "input";
      const classifierResult = await classifier.run({
        [classifierInput]: new ort.Tensor(
          "float32",
          new Float32Array(BOARD_SIZE * BOARD_SIZE),
          [1, 1, BOARD_SIZE, BOARD_SIZE],
        ),
      });
      const classifierOutput = classifier.outputNames?.[0]
        ? classifierResult[classifier.outputNames[0]]
        : Object.values(classifierResult)[0];
      classifierOutputLength = Number(classifierOutput?.data?.length || 0);
    }
  }

  return {
    ok: true,
    ...localSudokuOcrRuntimeDiagnostics(),
    localizerInputs: Array.from(localizer.inputNames || []),
    localizerOutputs: Array.from(localizer.outputNames || []),
    classifierInputs: Array.from(classifier?.inputNames || []),
    classifierOutputs: Array.from(classifier?.outputNames || []),
    localizerOutputLength,
    classifierOutputLength,
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
  const preview = options.includePreview === false ? null : buildOcrPreview(warpedRgba);
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
