/* YZF Sudoku full-offline service worker. The generated manifest makes each
   release atomic: a new worker is installable only after every runtime asset
   has been cached successfully. */
importScripts("./pwa-assets.js");

const manifest = self.YZF_PWA_ASSET_MANIFEST || { version: "missing", totalBytes: 0, assets: [] };
const CACHE_PREFIX = "yzf-sudoku-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}${manifest.version}`;
const INDEX_URL = "./index.html";

async function broadcast(message) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) client.postMessage(message);
}

async function cacheRelease() {
  const cache = await caches.open(CACHE_NAME);
  let done = 0;
  let loadedBytes = 0;
  await broadcast({
    type: "YZF_PWA_PROGRESS",
    phase: "start",
    version: manifest.version,
    done,
    count: manifest.assets.length,
    loadedBytes,
    totalBytes: manifest.totalBytes,
  });
  for (const asset of manifest.assets) {
    const request = new Request(asset.url, { cache: "reload", credentials: "same-origin" });
    const response = await fetch(request);
    if (!response.ok) throw new Error(`${asset.url}: HTTP ${response.status}`);
    await cache.put(asset.url, response);
    done += 1;
    loadedBytes += Number(asset.bytes || 0);
    await broadcast({
      type: "YZF_PWA_PROGRESS",
      phase: "asset",
      version: manifest.version,
      asset: asset.url,
      done,
      count: manifest.assets.length,
      loadedBytes,
      totalBytes: manifest.totalBytes,
    });
  }
}
async function releaseIsComplete() {
  const keys = await caches.keys();
  if (!keys.includes(CACHE_NAME)) return false;
  const cache = await caches.open(CACHE_NAME);
  const matches = await Promise.all(manifest.assets.map((asset) => cache.match(asset.url, { ignoreSearch: true })));
  return matches.every(Boolean);
}

async function postReleaseStatus(target) {
  const complete = await releaseIsComplete();
  target?.postMessage?.({
    type: complete ? "YZF_PWA_READY" : "YZF_PWA_MISSING",
    version: manifest.version,
    totalBytes: manifest.totalBytes,
    count: manifest.assets.length,
  });
}

async function repairRelease() {
  try {
    await cacheRelease();
    await broadcast({
      type: "YZF_PWA_READY",
      version: manifest.version,
      totalBytes: manifest.totalBytes,
      count: manifest.assets.length,
    });
  } catch (error) {
    await broadcast({
      type: "YZF_PWA_ERROR",
      version: manifest.version,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    try {
      await cacheRelease();
      const hasPrevious = Boolean(self.registration.active);
      await broadcast({
        type: hasPrevious ? "YZF_PWA_UPDATE_READY" : "YZF_PWA_READY",
        version: manifest.version,
        totalBytes: manifest.totalBytes,
        count: manifest.assets.length,
      });
    } catch (error) {
      await caches.delete(CACHE_NAME);
      await broadcast({
        type: "YZF_PWA_ERROR",
        version: manifest.version,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
    await broadcast({
      type: "YZF_PWA_READY",
      version: manifest.version,
      totalBytes: manifest.totalBytes,
      count: manifest.assets.length,
    });
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
  if (!pathWithinScope(url)) return;

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
    self.skipWaiting();
    return;
  }
  if (data.type === "YZF_PWA_GET_STATUS") {
    event.waitUntil(postReleaseStatus(event.source));
    return;
  }
  if (data.type === "YZF_PWA_REPAIR") {
    event.waitUntil(repairRelease());
  }
});
