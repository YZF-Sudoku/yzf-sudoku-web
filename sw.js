/* YZF Sudoku resumable incremental-offline service worker.

   Update model:
   - unchanged assets are copied from the active release cache after digest
     verification instead of being fetched again;
   - completed assets in a failed staging release are retained and reused on
     the next retry;
   - large binary assets are downloaded in 1 MiB HTTP Range chunks when the
     host supports byte ranges, so an interrupted download resumes from the
     first missing chunk;
   - the new release remains atomic: it activates only after every manifest
     asset has been verified and cached.
*/
importScripts("./pwa-assets.js");

// One-release repair marker. This release auto-activates only after every asset
// in its regenerated manifest has been downloaded and SHA-256 verified.
const FORCE_ACTIVATE_RELEASE = "e0f2bb1a95d80ae1e0ef";

const manifest = self.YZF_PWA_ASSET_MANIFEST || { version: "missing", totalBytes: 0, assets: [] };

function manifestValidationError(value) {
  if (!value || typeof value !== "object") return "manifest object is missing";
  if (!/^[a-f0-9]{20}$/i.test(String(value.version || ""))) return "manifest version is invalid";
  if (!Array.isArray(value.assets) || value.assets.length === 0) return "manifest contains no assets";
  const seen = new Set();
  let total = 0;
  for (const asset of value.assets) {
    if (!asset || typeof asset !== "object") return "manifest contains an invalid asset record";
    const url = String(asset.url || "");
    const bytes = Number(asset.bytes);
    const sha256 = String(asset.sha256 || "").toLowerCase();
    if (!url.startsWith("./") || url.includes("..")) return `invalid asset URL: ${url || "(empty)"}`;
    if (seen.has(url)) return `duplicate asset URL: ${url}`;
    if (!Number.isSafeInteger(bytes) || bytes < 0) return `invalid asset size: ${url}`;
    if (!/^[a-f0-9]{64}$/.test(sha256)) return `invalid SHA-256: ${url}`;
    seen.add(url);
    total += bytes;
  }
  if (total !== Number(value.totalBytes || 0)) return "manifest totalBytes does not match the asset sum";
  if (!seen.has("./index.html")) return "manifest does not contain index.html";
  return "";
}

const MANIFEST_ERROR = manifestValidationError(manifest);
const CACHE_PREFIX = "yzf-sudoku-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}${manifest.version}`;
const INDEX_URL = "./index.html";
const META_SCHEMA = 2;
const CHUNK_SIZE = 1024 * 1024;
const CHUNK_THRESHOLD = 1536 * 1024;
const MAX_FETCH_ATTEMPTS = 3;
const INTERNAL_ROOT = new URL("./__yzf_pwa_internal__/", self.registration.scope).href;
const META_URL = `${INTERNAL_ROOT}release-meta.json`;
let releaseTask = null;
let activationRequesterClientId = "";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assetIdentity(asset) {
  return `${Number(asset.bytes || 0)}:${String(asset.sha256 || "").toLowerCase()}`;
}

function cleanAssetUrl(asset) {
  return new URL(asset.url, self.registration.scope).href;
}

function networkAssetUrl(asset) {
  const url = new URL(asset.url, self.registration.scope);
  url.searchParams.set("__yzf_release", manifest.version);
  return url.href;
}

function chunkUrl(asset, index) {
  return `${INTERNAL_ROOT}chunks/${encodeURIComponent(String(asset.sha256 || "missing"))}/${index}`;
}

function contentTypeForAsset(asset) {
  const pathname = new URL(asset.url, self.registration.scope).pathname.toLowerCase();
  if (pathname.endsWith(".wasm")) return "application/wasm";
  if (pathname.endsWith(".ort")) return "application/octet-stream";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".mjs") || pathname.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (pathname.endsWith(".html")) return "text/html; charset=utf-8";
  if (pathname.endsWith(".json") || pathname.endsWith(".webmanifest")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}

function canChunkAsset(asset) {
  if (Number(asset.bytes || 0) < CHUNK_THRESHOLD) return false;
  return /\.(?:wasm|ort)$/i.test(new URL(asset.url, self.registration.scope).pathname);
}

function emptyMeta() {
  return {
    schema: META_SCHEMA,
    version: manifest.version,
    completed: {},
    stats: {
      networkBytes: 0,
      reusedBytes: 0,
      resumedBytes: 0,
      totalBytes: Number(manifest.totalBytes || 0),
      updatedAt: 0,
    },
  };
}

async function loadMeta(cache) {
  try {
    const response = await cache.match(META_URL);
    if (!response) return emptyMeta();
    const parsed = await response.json();
    if (!parsed || parsed.schema !== META_SCHEMA || parsed.version !== manifest.version || typeof parsed.completed !== "object") {
      return emptyMeta();
    }
    return {
      ...emptyMeta(),
      ...parsed,
      completed: { ...(parsed.completed || {}) },
      stats: { ...emptyMeta().stats, ...(parsed.stats || {}) },
    };
  } catch {
    return emptyMeta();
  }
}

async function saveMeta(cache, meta) {
  meta.schema = META_SCHEMA;
  meta.version = manifest.version;
  meta.stats = { ...emptyMeta().stats, ...(meta.stats || {}), updatedAt: Date.now() };
  const response = new Response(JSON.stringify(meta), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
  await cache.put(META_URL, response);
}

async function broadcast(message) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) client.postMessage(message);
}

function activationMessage(type, details = {}) {
  return { type, version: manifest.version, ...details };
}

async function reportActivation(event, type, details = {}) {
  const message = activationMessage(type, details);
  try { event?.ports?.[0]?.postMessage(message); } catch {}
  try { event?.source?.postMessage?.(message); } catch {}
  await broadcast(message);
  return message;
}

async function ensureReleaseCompleteForActivation(event) {
  if (await releaseIsComplete()) return { repaired: false, stats: null };
  await reportActivation(event, "YZF_PWA_ACTIVATION_REPAIRING", {
    message: "The staged release is incomplete; repairing missing offline resources before activation",
  });
  const stats = await cacheRelease();
  if (!(await releaseIsComplete())) {
    throw new Error("offline release is still incomplete after repair");
  }
  return { repaired: true, stats };
}

async function rememberActivationRequester(event) {
  activationRequesterClientId = String(event?.source?.id || activationRequesterClientId || "");
  if (!activationRequesterClientId) return;
  const cache = await caches.open(CACHE_NAME);
  const meta = await loadMeta(cache);
  meta.activationRequesterClientId = activationRequesterClientId;
  await saveMeta(cache, meta);
}

async function reportActivationFailure(event, error) {
  const details = {
    asset: error?.asset || "",
    message: error instanceof Error ? error.message : String(error),
    ...(error?.progress || {}),
  };
  await reportActivation(event, "YZF_PWA_ACTIVATION_ERROR", details);
  // V7/V8 pages do not know ACTIVATION_ERROR yet. Keep the legacy error
  // message so an already-open old page turns red/yellow instead of silently
  // timing out back to a purple cloud.
  await broadcast({ type: "YZF_PWA_ERROR", version: manifest.version, ...details });
}

async function reloadActivationRequester(meta) {
  const clientId = String(activationRequesterClientId || meta?.activationRequesterClientId || "");
  if (!clientId) return false;
  try {
    const client = await self.clients.get(clientId);
    if (!client || typeof client.navigate !== "function") return false;
    // Do not await navigate from inside the activate event: Chromium may wait
    // for activation to finish before committing that navigation, creating a
    // circular wait. Starting it fire-and-forget lets activation settle first.
    client.navigate(client.url).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

async function sha256Hex(buffer) {
  const digest = await self.crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function verifyBuffer(buffer, asset) {
  if (buffer.byteLength !== Number(asset.bytes || 0)) return false;
  const expected = String(asset.sha256 || "").toLowerCase();
  if (!expected) return true;
  const actual = await sha256Hex(buffer);
  return actual === expected || actual.startsWith(expected);
}

async function verifyResponse(response, asset) {
  if (!response) return false;
  try {
    return await verifyBuffer(await response.clone().arrayBuffer(), asset);
  } catch {
    return false;
  }
}

async function retry(operation, label, attempts = MAX_FETCH_ATTEMPTS) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(350 * (2 ** (attempt - 1)));
    }
  }
  throw new Error(`${label}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

async function sourceReleaseCaches() {
  const names = (await caches.keys()).filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME);
  const sources = [];
  for (const name of names) {
    const cache = await caches.open(name);
    let meta = null;
    try {
      const response = await cache.match(META_URL);
      meta = response ? await response.json() : null;
    } catch {
      meta = null;
    }
    sources.push({ name, cache, meta });
  }
  return sources;
}

async function responseMatchesKnownMeta(cache, meta, asset) {
  const response = await cache.match(cleanAssetUrl(asset), { ignoreSearch: true });
  if (!response) return null;
  if (meta?.completed?.[asset.url] === assetIdentity(asset)) return response;
  if (await verifyResponse(response, asset)) return response;
  return null;
}

async function copyReusableAsset(asset, targetCache, targetMeta, sources) {
  const staged = await responseMatchesKnownMeta(targetCache, targetMeta, asset);
  if (staged) {
    targetMeta.completed[asset.url] = assetIdentity(asset);
    return { source: "staging", response: staged };
  }
  for (const source of sources) {
    const response = await responseMatchesKnownMeta(source.cache, source.meta, asset);
    if (!response) continue;
    await targetCache.put(cleanAssetUrl(asset), response.clone());
    targetMeta.completed[asset.url] = assetIdentity(asset);
    return { source: "previous", response };
  }
  return null;
}

async function fetchWholeAsset(asset) {
  return retry(async () => {
    const response = await fetch(new Request(networkAssetUrl(asset), {
      cache: "no-store",
      credentials: "same-origin",
    }));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!(await verifyResponse(response, asset))) throw new Error("size or SHA-256 verification failed");
    return response;
  }, asset.url);
}

function parseContentRange(value) {
  const match = /^bytes\s+(\d+)-(\d+)\/(\d+)$/i.exec(String(value || "").trim());
  if (!match) return null;
  return { start: Number(match[1]), end: Number(match[2]), total: Number(match[3]) };
}

async function validatedCachedChunk(cache, asset, index, expectedBytes) {
  const response = await cache.match(chunkUrl(asset, index));
  if (!response) return null;
  try {
    const buffer = await response.arrayBuffer();
    return buffer.byteLength === expectedBytes ? buffer : null;
  } catch {
    return null;
  }
}

async function fetchRangeChunk(asset, index, start, end) {
  return retry(async () => {
    const response = await fetch(new Request(networkAssetUrl(asset), {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Range: `bytes=${start}-${end}` },
    }));
    const buffer = await response.clone().arrayBuffer();
    if (response.status === 200) {
      if (index !== 0 || buffer.byteLength !== Number(asset.bytes || 0)) {
        throw new Error("host ignored Range request with an unexpected body size");
      }
      return { mode: "whole", response, buffer };
    }
    if (response.status !== 206) throw new Error(`HTTP ${response.status}`);
    const range = parseContentRange(response.headers.get("content-range"));
    if (!range || range.start !== start || range.end !== end || range.total !== Number(asset.bytes || 0)) {
      throw new Error("invalid Content-Range response");
    }
    if (buffer.byteLength !== end - start + 1) throw new Error("range body length mismatch");
    return { mode: "chunk", buffer };
  }, `${asset.url} bytes ${start}-${end}`);
}

async function deleteAssetChunks(cache, asset) {
  const count = Math.ceil(Number(asset.bytes || 0) / CHUNK_SIZE);
  await Promise.all(Array.from({ length: count }, (_, index) => cache.delete(chunkUrl(asset, index))));
}

async function downloadChunkedAsset(asset, cache, onProgress) {
  const total = Number(asset.bytes || 0);
  const count = Math.ceil(total / CHUNK_SIZE);
  const chunks = new Array(count);
  for (let index = 0; index < count; index += 1) {
    const start = index * CHUNK_SIZE;
    const end = Math.min(total - 1, start + CHUNK_SIZE - 1);
    const expectedBytes = end - start + 1;
    const cached = await validatedCachedChunk(cache, asset, index, expectedBytes);
    if (cached) {
      chunks[index] = cached;
      await onProgress({ bytes: expectedBytes, source: "chunk-resume", index, count });
      continue;
    }
    const fetched = await fetchRangeChunk(asset, index, start, end);
    if (fetched.mode === "whole") {
      if (!(await verifyBuffer(fetched.buffer, asset))) throw new Error(`${asset.url}: size or SHA-256 verification failed`);
      await onProgress({ bytes: total, source: "network-whole", index: count - 1, count });
      await deleteAssetChunks(cache, asset);
      return fetched.response;
    }
    chunks[index] = fetched.buffer;
    await cache.put(chunkUrl(asset, index), new Response(fetched.buffer, {
      headers: {
        "content-type": "application/octet-stream",
        "cache-control": "no-store",
        "x-yzf-chunk-index": String(index),
      },
    }));
    await onProgress({ bytes: expectedBytes, source: "network-chunk", index, count });
  }

  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  if (!(await verifyBuffer(combined.buffer, asset))) {
    await deleteAssetChunks(cache, asset);
    throw new Error(`${asset.url}: assembled SHA-256 verification failed; cached chunks were discarded`);
  }
  return new Response(combined, {
    status: 200,
    headers: {
      "content-type": contentTypeForAsset(asset),
      "cache-control": "no-cache",
      "x-yzf-resumable": "1",
      "content-length": String(total),
    },
  });
}

async function ensureAsset(asset, cache, meta, sources, progress) {
  const reusable = await copyReusableAsset(asset, cache, meta, sources);
  if (reusable) return { source: reusable.source };

  let currentAssetBytes = 0;
  const reportPartial = async ({ bytes, source, index, count }) => {
    currentAssetBytes += Number(bytes || 0);
    if (source === "chunk-resume") progress.resumedBytes += Number(bytes || 0);
    else progress.networkBytes += Number(bytes || 0);
    await broadcast({
      type: "YZF_PWA_PROGRESS",
      phase: source,
      version: manifest.version,
      asset: asset.url,
      assetPart: index + 1,
      assetPartCount: count,
      done: progress.done,
      count: manifest.assets.length,
      loadedBytes: progress.resolvedBytes + currentAssetBytes,
      totalBytes: manifest.totalBytes,
      networkBytes: progress.networkBytes,
      reusedBytes: progress.reusedBytes,
      resumedBytes: progress.resumedBytes,
    });
  };

  let response;
  if (canChunkAsset(asset)) {
    try {
      response = await downloadChunkedAsset(asset, cache, reportPartial);
    } catch (error) {
      // Some static hosts do not support Range correctly. Whole-file fallback
      // preserves compatibility while already completed chunks remain cached
      // for a future host/configuration that does support ranges.
      response = await fetchWholeAsset(asset);
      progress.networkBytes += Number(asset.bytes || 0);
    }
  } else {
    response = await fetchWholeAsset(asset);
    progress.networkBytes += Number(asset.bytes || 0);
  }
  await cache.put(cleanAssetUrl(asset), response.clone());
  meta.completed[asset.url] = assetIdentity(asset);
  await deleteAssetChunks(cache, asset);
  return { source: "network" };
}

async function cacheReleaseInternal() {
  if (MANIFEST_ERROR) throw new Error(`offline manifest validation failed: ${MANIFEST_ERROR}`);
  const cache = await caches.open(CACHE_NAME);
  const meta = await loadMeta(cache);
  const sources = await sourceReleaseCaches();
  const progress = {
    done: 0,
    resolvedBytes: 0,
    networkBytes: 0,
    reusedBytes: 0,
    resumedBytes: 0,
  };
  await broadcast({
    type: "YZF_PWA_PROGRESS",
    phase: "start",
    version: manifest.version,
    done: 0,
    count: manifest.assets.length,
    loadedBytes: 0,
    totalBytes: manifest.totalBytes,
    networkBytes: 0,
    reusedBytes: 0,
    resumedBytes: 0,
  });

  for (const asset of manifest.assets) {
    try {
      const result = await ensureAsset(asset, cache, meta, sources, progress);
      progress.done += 1;
      progress.resolvedBytes += Number(asset.bytes || 0);
      if (result.source === "previous") progress.reusedBytes += Number(asset.bytes || 0);
      if (result.source === "staging") progress.resumedBytes += Number(asset.bytes || 0);
      meta.stats = {
        networkBytes: progress.networkBytes,
        reusedBytes: progress.reusedBytes,
        resumedBytes: progress.resumedBytes,
        totalBytes: Number(manifest.totalBytes || 0),
        updatedAt: Date.now(),
      };
      await saveMeta(cache, meta);
      await broadcast({
        type: "YZF_PWA_PROGRESS",
        phase: result.source,
        version: manifest.version,
        asset: asset.url,
        done: progress.done,
        count: manifest.assets.length,
        loadedBytes: progress.resolvedBytes,
        totalBytes: manifest.totalBytes,
        networkBytes: progress.networkBytes,
        reusedBytes: progress.reusedBytes,
        resumedBytes: progress.resumedBytes,
      });
    } catch (error) {
      await saveMeta(cache, meta).catch(() => {});
      const failure = new Error(`${asset.url}: ${error instanceof Error ? error.message : String(error)}`);
      failure.asset = asset.url;
      failure.progress = { ...progress };
      throw failure;
    }
  }
  meta.stats = {
    networkBytes: progress.networkBytes,
    reusedBytes: progress.reusedBytes,
    resumedBytes: progress.resumedBytes,
    totalBytes: Number(manifest.totalBytes || 0),
    updatedAt: Date.now(),
  };
  await saveMeta(cache, meta);
  return progress;
}

async function cacheRelease() {
  if (!releaseTask) releaseTask = cacheReleaseInternal().finally(() => { releaseTask = null; });
  return releaseTask;
}

async function releaseIsComplete() {
  const keys = await caches.keys();
  if (!keys.includes(CACHE_NAME)) return false;
  const cache = await caches.open(CACHE_NAME);
  const meta = await loadMeta(cache);
  for (const asset of manifest.assets) {
    if (meta.completed[asset.url] !== assetIdentity(asset)) return false;
    if (!(await cache.match(cleanAssetUrl(asset), { ignoreSearch: true }))) return false;
  }
  return true;
}

async function postReleaseStatus(target) {
  const complete = await releaseIsComplete();
  const cache = await caches.open(CACHE_NAME);
  const meta = await loadMeta(cache);
  target?.postMessage?.({
    type: complete ? "YZF_PWA_READY" : "YZF_PWA_MISSING",
    version: manifest.version,
    totalBytes: manifest.totalBytes,
    count: manifest.assets.length,
    ...meta.stats,
  });
}

async function repairRelease() {
  try {
    const stats = await cacheRelease();
    await broadcast({
      type: "YZF_PWA_READY",
      version: manifest.version,
      totalBytes: manifest.totalBytes,
      count: manifest.assets.length,
      ...stats,
    });
  } catch (error) {
    await broadcast({
      type: "YZF_PWA_ERROR",
      version: manifest.version,
      asset: error?.asset || "",
      message: error instanceof Error ? error.message : String(error),
      ...(error?.progress || {}),
    });
    throw error;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    try {
      const stats = await cacheRelease();
      if (manifest.version === FORCE_ACTIVATE_RELEASE) await self.skipWaiting();
      await broadcast({
        // Installation has finished downloading and verification, but the
        // browser has not necessarily promoted this worker to registration.waiting
        // yet. The page must wait for that authoritative state before showing
        // the purple update-ready cloud.
        type: "YZF_PWA_STAGED",
        version: manifest.version,
        totalBytes: manifest.totalBytes,
        count: manifest.assets.length,
        ...stats,
      });
    } catch (error) {
      // Do not delete CACHE_NAME here. Verified assets and completed chunks are
      // the persistent checkpoint used by the next update/repair attempt.
      await broadcast({
        type: "YZF_PWA_ERROR",
        version: manifest.version,
        asset: error?.asset || "",
        message: error instanceof Error ? error.message : String(error),
        ...(error?.progress || {}),
      });
      throw error;
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try {
      if (!(await releaseIsComplete())) {
        await broadcast(activationMessage("YZF_PWA_ACTIVATION_REPAIRING", {
          message: "Offline resources changed during activation; repairing before taking control",
        }));
        await cacheRelease();
      }
      if (!(await releaseIsComplete())) throw new Error("cannot activate an incomplete offline release after repair");
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
      const cache = await caches.open(CACHE_NAME);
      const meta = await loadMeta(cache);
      await broadcast({
        type: "YZF_PWA_READY",
        version: manifest.version,
        totalBytes: manifest.totalBytes,
        count: manifest.assets.length,
        ...meta.stats,
      });
      // Some Android Chromium/WebView builds delay or omit controllerchange on
      // the page that requested activation. Navigate that exact client after
      // claim as a compatibility fallback; newer pages also observe statechange
      // and READY, so this is idempotent.
      await reloadActivationRequester(meta);
    } catch (error) {
      await reportActivationFailure(null, error);
      throw error;
    }
  })());
});

function pathWithinScope(url) {
  const scope = new URL(self.registration.scope);
  return url.origin === scope.origin && url.pathname.startsWith(scope.pathname);
}

function isAppShellNavigation(url) {
  const scope = new URL(self.registration.scope);
  const scopePath = scope.pathname.endsWith("/") ? scope.pathname : `${scope.pathname}/`;
  return url.pathname === scope.pathname || url.pathname === scopePath || url.pathname === `${scopePath}index.html`;
}

async function cachedResponse(request, { ignoreSearch = true } = {}) {
  const cache = await caches.open(CACHE_NAME);
  return cache.match(request, { ignoreSearch });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!pathWithinScope(url) || url.href.startsWith(INTERNAL_ROOT)) return;

  // Local source-tree development must honor F12 hard reloads. The previous
  // cache-first path ignored query cache keys and could keep an old app/Worker/
  // WASM trio alive even after files on disk had been replaced. Hosted/PWA
  // releases retain the existing atomic cache-first behavior.
  const localDevelopment = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  const versionedRuntimeAsset = url.searchParams.has("v") && /\.(?:js|mjs|wasm)$/i.test(url.pathname);
  const forceNetwork = localDevelopment &&
    (request.cache === "reload" || request.cache === "no-cache" || versionedRuntimeAsset);
  if (forceNetwork) {
    event.respondWith((async () => {
      try {
        return await fetch(new Request(request, { cache: "no-store" }));
      } catch {
        const fallback = await cachedResponse(request);
        if (fallback) return fallback;
        throw new Error("local runtime asset is unavailable from both network and cache");
      }
    })());
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      if (isAppShellNavigation(url)) {
        const shell = await cachedResponse(INDEX_URL);
        if (shell) return shell;
      }
      const exact = await cachedResponse(request);
      if (exact) return exact;
      try {
        return await fetch(request);
      } catch {
        const shell = await cachedResponse(INDEX_URL);
        if (shell) return shell;
        throw new Error("YZF Sudoku is not available offline yet");
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await cachedResponse(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && url.origin === self.location.origin) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  })());
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "YZF_PWA_SKIP_WAITING") {
    event.waitUntil((async () => {
      await rememberActivationRequester(event);
      await reportActivation(event, "YZF_PWA_ACTIVATION_ACCEPTED");
      // V7/V8 pages start a fixed 15-second timeout as soon as the purple cloud
      // is clicked. Keep that legacy page alive while a missing large asset is
      // repaired, otherwise it can turn purple again even though repair is
      // still progressing.
      const heartbeat = setInterval(() => {
        broadcast({
          type: "YZF_PWA_ACTIVATING",
          version: manifest.version,
          repairing: true,
        }).catch(() => {});
      }, 7000);
      try {
        const repair = await ensureReleaseCompleteForActivation(event);
        clearInterval(heartbeat);
        await reportActivation(event, "YZF_PWA_ACTIVATING", {
          repaired: repair.repaired,
          ...(repair.stats || {}),
        });
        await self.skipWaiting();
      } catch (error) {
        clearInterval(heartbeat);
        await reportActivationFailure(event, error);
      }
    })());
    return;
  }
  if (data.type === "YZF_PWA_GET_STATUS") {
    event.waitUntil(postReleaseStatus(event.source));
    return;
  }
  if (data.type === "YZF_PWA_REPAIR") event.waitUntil(repairRelease());
});
