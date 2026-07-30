/*
 * YZF Sudoku 前端 UI 基础层。
 *
 * 设计目标：
 * 1. 统一管理界面语义、响应式弹层、任务状态、工作现场、诊断信息和操作引导。
 * 2. 组件通过稳定的 DOM id 与 data-yzf-* 语义连接，不接触求解器和题目真相源。
 * 3. 新界面能力应作为正式产品结构维护，避免运行时扫描业务文案来决定功能行为。
 */

const PANEL_SELECTOR = [
  "dialog",
  "[role='dialog']",
  ".mobile-solve-drawer",
].join(",");

function normalizeLanguage(value) {
  return value === "en" ? "en" : "zh";
}

function readUiText(options, key) {
  const value = options?.getText?.(key);
  return value && value !== key ? String(value) : key;
}

const APPEARANCE_STORAGE_KEY = "yzf_ui_appearance_v1";
const APPEARANCE_VALUES = new Set(["system", "light", "dark", "contrast"]);

function normalizeAppearance(value) {
  return APPEARANCE_VALUES.has(String(value || "")) ? String(value) : "system";
}

function createAppearanceController() {
  const media = window.matchMedia?.("(prefers-color-scheme: dark)") || null;
  let appearance = normalizeAppearance(document.documentElement.dataset.yzfTheme);
  try { appearance = normalizeAppearance(localStorage.getItem(APPEARANCE_STORAGE_KEY) || appearance); } catch {}

  const resolved = () => appearance === "system" ? (media?.matches ? "dark" : "light") : appearance;
  function apply({ persist = false, announce = true } = {}) {
    const actual = resolved();
    document.documentElement.dataset.yzfTheme = appearance;
    document.documentElement.dataset.yzfResolvedTheme = actual;
    document.documentElement.style.colorScheme = actual === "dark" ? "dark" : "light";
    const themeColor = actual === "dark" ? "#0b1220" : actual === "contrast" ? "#ffffff" : "#eef2f7";
    const meta = document.getElementById("themeColorMeta") || document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", themeColor);
    if (persist) { try { localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance); } catch {} }
    if (announce) window.dispatchEvent(new CustomEvent("yzf-appearance-change", { detail: { appearance, resolved: actual } }));
  }
  function set(value) {
    const next = normalizeAppearance(value);
    if (next === appearance) { apply({ persist: true }); return appearance; }
    appearance = next;
    apply({ persist: true });
    return appearance;
  }
  const onMediaChange = () => { if (appearance === "system") apply(); };
  media?.addEventListener?.("change", onMediaChange);
  apply({ announce: false });
  return {
    get: () => appearance,
    getResolved: resolved,
    set,
    apply,
    destroy() { media?.removeEventListener?.("change", onMediaChange); },
  };
}

function isVisible(element) {
  if (!element || element.hidden) return false;
  if (element instanceof HTMLDialogElement) return element.open;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

function notifyUiLayerChange() {
  window.dispatchEvent(new CustomEvent("yzf-ui-layerchange"));
}

function elementsMatching(root, selector) {
  const items = root?.querySelectorAll ? Array.from(root.querySelectorAll(selector)) : [];
  if (root instanceof Element && root.matches(selector)) items.unshift(root);
  return items;
}


const TOGGLE_BUTTON_SELECTOR = [
  "button[aria-pressed]",
  ".numpad button",
  ".manual-mark-actions button",
  ".manual-mark-buttons button",
  ".manual-mark-color-row button",
  ".ocr-correction-mode button",
].join(",");

function buttonSemanticText(button) {
  return [
    button.id,
    button.name,
    button.getAttribute("aria-label"),
    button.title,
    button.textContent,
  ].filter(Boolean).join(" ").trim().toLowerCase();
}

function classifyButton(button) {
  const semantic = buttonSemanticText(button);
  const classes = button.classList;
  if (classes.contains("primary") || classes.contains("mobile-primary")) return "brand-primary";
  if (["btnSolve", "btnStep", "btnApply"].includes(button.id)) return "brand-secondary";
  if (classes.contains("tab-button") || ["btnUndo", "btnRedo"].includes(button.id)) return "neutral-tertiary";
  if (classes.contains("app-status-button") || classes.contains("app-status-back-control") || classes.contains("yzf-panel-close")) {
    return "icon-tertiary";
  }
  // 只把不可逆或批量清理动作标成警示色；“取消/返回”仍属于普通中性操作。
  if (/(delete|clear|remove|erase|清空|删除|移除|清除)/.test(semantic)) return "alert-secondary";
  return "neutral-secondary";
}

function syncButtonPressedState(button) {
  if (!(button instanceof HTMLButtonElement) || !button.matches(TOGGLE_BUTTON_SELECTOR)) return;
  if (button.getAttribute("role") === "tab") return;
  const classManaged = button.matches([
    ".numpad button",
    ".manual-mark-actions button",
    ".manual-mark-buttons button",
    ".manual-mark-color-row button",
    ".ocr-correction-mode button",
  ].join(","));
  const pressed = classManaged
    ? button.classList.contains("active")
    : button.getAttribute("aria-pressed") === "true";
  button.setAttribute("aria-pressed", pressed ? "true" : "false");
  button.dataset.yzfToggle = "1";
  button.dataset.yzfToggleSource = classManaged ? "class" : "aria";
}

function syncButtonPressedGroup(button) {
  if (!(button instanceof HTMLButtonElement)) return;
  const group = button.closest([
    ".numpad",
    ".manual-mark-actions",
    ".manual-mark-buttons",
    ".manual-mark-color-row",
    ".ocr-correction-mode",
    ".mobile-solve-drawer",
  ].join(","));
  if (!group) {
    syncButtonPressedState(button);
    return;
  }
  elementsMatching(group, TOGGLE_BUTTON_SELECTOR).forEach(syncButtonPressedState);
}

function decorateButtons(root = document, { force = false } = {}) {
  elementsMatching(root, "button").forEach((button) => {
    if (!force && button.dataset.yzfDecorated === "1") return;
    button.dataset.yzfDecorated = "1";
    button.dataset.yzfVariant = classifyButton(button);

    const classes = button.classList;
    let size = "m";
    if (classes.contains("compact") || classes.contains("app-status-button") || classes.contains("app-status-back-control") || classes.contains("yzf-panel-close")) size = "s";
    if (classes.contains("mobile-primary")) size = "l";
    button.dataset.yzfSize = size;

    const label = button.getAttribute("aria-label");
    if (label && !button.title && !String(button.textContent || "").trim()) button.title = label;
    syncButtonPressedState(button);
  });
}

function decorateSettingRows(root = document) {
  elementsMatching(root, "label").forEach((label) => {
    if (label.dataset.yzfSettingRow === "1") return;
    const control = label.querySelector(":scope > input, :scope > select, :scope > textarea, :scope input, :scope select");
    if (!control) return;
    const text = String(label.textContent || "").trim();
    if (!text || text.length > 160) return;
    label.dataset.yzfSettingRow = "1";
  });
}

function decorateControls(root = document) {
  elementsMatching(root, "input, select, textarea").forEach((control) => {
    const type = String(control.getAttribute("type") || "").toLowerCase();
    if (["hidden", "checkbox", "radio", "color", "range", "file"].includes(type)) return;
    control.dataset.yzfControl = "1";
  });
  elementsMatching(root, "[aria-live], .tlg-solver-status, .batch-status, .manual-mark-status").forEach((status) => {
    if (!status.getAttribute("role")) status.setAttribute("role", "status");
    if (!status.getAttribute("aria-live")) status.setAttribute("aria-live", "polite");
    status.dataset.yzfStatusRegion = "1";
  });
}

function decorateDisclosure(details) {
  if (!(details instanceof HTMLDetailsElement)) return;
  const summary = details.querySelector(":scope > summary");
  if (!summary) return;
  details.dataset.yzfDisclosure = "1";
  summary.setAttribute("aria-expanded", details.open ? "true" : "false");
  summary.dataset.yzfDisclosureSummary = "1";
}

function decorateDisclosures(root = document) {
  elementsMatching(root, "details").forEach(decorateDisclosure);
}

function decoratePanels(root = document) {
  elementsMatching(root, PANEL_SELECTOR).forEach((panel) => {
    if (panel.dataset.yzfPanel === "1") return;
    panel.dataset.yzfPanel = "1";
    if (panel.matches(".step-explain-dialog")) panel.dataset.yzfPanelPlacement = "context";
    else if (panel.matches(".mobile-solve-drawer")) panel.dataset.yzfPanelPlacement = "edge";
    else panel.dataset.yzfPanelPlacement = "responsive";
  });
}

function installDomDecorationObserver() {
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches("button")) decorateButtons(node.parentElement || document);
        else decorateButtons(node);
        decorateSettingRows(node);
        decorateControls(node);
        decorateDisclosures(node);
        decoratePanels(node);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const syncInteractiveState = (event) => {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    if (button) queueMicrotask(() => syncButtonPressedGroup(button));
  };
  const syncDisclosureState = (event) => decorateDisclosure(event.target);
  document.addEventListener("click", syncInteractiveState, true);
  document.addEventListener("change", syncInteractiveState, true);
  document.addEventListener("toggle", syncDisclosureState, true);

  return {
    disconnect() {
      observer.disconnect();
      document.removeEventListener("click", syncInteractiveState, true);
      document.removeEventListener("change", syncInteractiveState, true);
      document.removeEventListener("toggle", syncDisclosureState, true);
    },
  };
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const order = Math.min(units.length - 1, Math.floor(Math.log(value) / Math.log(1024)));
  const scaled = value / (1024 ** order);
  return `${scaled >= 100 || order === 0 ? scaled.toFixed(0) : scaled.toFixed(1)} ${units[order]}`;
}

function summarizeUiSemantics() {
  const variants = {};
  document.querySelectorAll("button[data-yzf-variant]").forEach((button) => {
    const key = button.dataset.yzfVariant || "unknown";
    variants[key] = (variants[key] || 0) + 1;
  });
  return {
    decoratedButtons: document.querySelectorAll("button[data-yzf-decorated='1']").length,
    variants,
    busyButtons: document.querySelectorAll("button[aria-busy='true']").length,
    pressedButtons: document.querySelectorAll("button[aria-pressed='true']").length,
    decoratedControls: document.querySelectorAll("[data-yzf-control='1']").length,
    invalidControls: document.querySelectorAll("[data-yzf-control='1'][aria-invalid='true']").length,
    disclosures: document.querySelectorAll("details[data-yzf-disclosure='1']").length,
    openDisclosures: document.querySelectorAll("details[data-yzf-disclosure='1'][open]").length,
    openDialogs: document.querySelectorAll("dialog[open]").length,
  };
}

async function defaultDiagnostics() {
  let storage = null;
  try {
    storage = await navigator.storage?.estimate?.();
  } catch {
    storage = null;
  }
  return {
    page: {
      url: window.location.href,
      language: document.documentElement.lang || "",
      displayMode: window.matchMedia?.("(display-mode: standalone)")?.matches ? "standalone" : "browser",
      appearance: document.documentElement.dataset.yzfTheme || "system",
      resolvedAppearance: document.documentElement.dataset.yzfResolvedTheme || "light",
      viewport: `${Math.round(window.innerWidth)}×${Math.round(window.innerHeight)}`,
      devicePixelRatio: window.devicePixelRatio || 1,
      online: navigator.onLine,
      secureContext: window.isSecureContext,
    },
    browser: {
      userAgent: navigator.userAgent,
      platform: navigator.userAgentData?.platform || navigator.platform || "",
      languages: Array.from(navigator.languages || []),
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemoryGB: navigator.deviceMemory || null,
    },
    capabilities: {
      serviceWorker: "serviceWorker" in navigator,
      worker: "Worker" in window,
      webAssembly: "WebAssembly" in window,
      clipboardRead: Boolean(navigator.clipboard?.read || navigator.clipboard?.readText),
      clipboardWrite: Boolean(navigator.clipboard?.write || navigator.clipboard?.writeText),
      fullscreen: Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled),
      wakeLock: Boolean(navigator.wakeLock),
    },
    ui: summarizeUiSemantics(),
    storage: storage ? {
      usage: formatBytes(storage.usage),
      quota: formatBytes(storage.quota),
      usageBytes: Number(storage.usage || 0),
      quotaBytes: Number(storage.quota || 0),
    } : null,
  };
}

function flattenDiagnostics(value, prefix = "") {
  const lines = [];
  if (value == null) return lines;
  if (Array.isArray(value)) {
    lines.push(`${prefix}: ${value.join(", ")}`);
    return lines;
  }
  if (typeof value !== "object") {
    lines.push(`${prefix}: ${String(value)}`);
    return lines;
  }
  for (const [key, item] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === "object" && !Array.isArray(item)) lines.push(...flattenDiagnostics(item, next));
    else lines.push(`${next}: ${Array.isArray(item) ? item.join(", ") : String(item ?? "")}`);
  }
  return lines;
}

function createDiagnosticsDialog(options = {}) {
  const { getDiagnostics, onCopied } = options;
  const dialog = document.createElement("dialog");
  dialog.id = "yzfDiagnosticsDialog";
  dialog.className = "yzf-diagnostics-dialog";
  dialog.dataset.yzfPanel = "1";
  dialog.dataset.yzfPanelPlacement = "responsive";
  dialog.innerHTML = `
    <section class="yzf-diagnostics-panel">
      <header class="yzf-panel-header">
        <div>
          <strong data-yzf-diagnostics-title></strong>
          <p data-yzf-diagnostics-intro></p>
        </div>
        <button type="button" class="yzf-panel-close" data-yzf-diagnostics-close aria-label="">×</button>
      </header>
      <div class="yzf-diagnostics-summary" data-yzf-diagnostics-summary aria-live="polite"></div>
      <pre class="yzf-diagnostics-output" data-yzf-diagnostics-output></pre>
      <footer class="yzf-panel-actions">
        <button type="button" data-yzf-diagnostics-refresh></button>
        <span class="yzf-panel-spacer"></span>
        <button type="button" data-yzf-diagnostics-copy class="primary"></button>
      </footer>
    </section>`;
  document.body.append(dialog);

  const title = dialog.querySelector("[data-yzf-diagnostics-title]");
  const intro = dialog.querySelector("[data-yzf-diagnostics-intro]");
  const output = dialog.querySelector("[data-yzf-diagnostics-output]");
  const summary = dialog.querySelector("[data-yzf-diagnostics-summary]");
  const close = dialog.querySelector("[data-yzf-diagnostics-close]");
  const refresh = dialog.querySelector("[data-yzf-diagnostics-refresh]");
  const copy = dialog.querySelector("[data-yzf-diagnostics-copy]");
  let currentText = "";

  const labels = () => ({
    title: readUiText(options, "diagnosticsTitle"),
    intro: readUiText(options, "diagnosticsIntro"),
    loading: readUiText(options, "diagnosticsLoading"),
    ready: readUiText(options, "diagnosticsReady"),
    refresh: readUiText(options, "diagnosticsRefresh"),
    copy: readUiText(options, "diagnosticsCopy"),
    copied: readUiText(options, "diagnosticsCopied"),
    copyFailed: readUiText(options, "diagnosticsCopyFailed"),
    close: readUiText(options, "close"),
  });

  async function refreshContent() {
    const text = labels();
    title.textContent = text.title;
    intro.textContent = text.intro;
    close.setAttribute("aria-label", text.close);
    refresh.textContent = text.refresh;
    copy.textContent = text.copy;
    summary.textContent = text.loading;
    output.textContent = "";
    const base = await defaultDiagnostics();
    const extra = await getDiagnostics?.();
    const diagnosticObject = {
      collectedAt: new Date().toISOString(),
      ...base,
      app: extra || {},
    };
    currentText = flattenDiagnostics(diagnosticObject).join("\n");
    output.textContent = currentText;
    summary.textContent = text.ready;
  }

  async function open() {
    await refreshContent();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    notifyUiLayerChange();
  }

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", notifyUiLayerChange);
  refresh.addEventListener("click", refreshContent);
  copy.addEventListener("click", async () => {
    const text = labels();
    try {
      await navigator.clipboard.writeText(currentText);
      summary.textContent = text.copied;
      onCopied?.(true);
    } catch {
      summary.textContent = text.copyFailed;
      output.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(output);
      selection?.removeAllRanges();
      selection?.addRange(range);
      onCopied?.(false);
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  return { dialog, open, refresh: refreshContent };
}


function createTaskCenter(options = {}) {
  const tasks = new Map();
  let sequence = 0;

  const dialog = document.createElement("dialog");
  dialog.id = "yzfTaskCenterDialog";
  dialog.className = "yzf-task-center-dialog";
  dialog.dataset.yzfPanel = "1";
  dialog.dataset.yzfPanelPlacement = "responsive";
  dialog.innerHTML = `
    <section class="yzf-task-center-panel">
      <header class="yzf-panel-header">
        <div>
          <strong data-yzf-task-title></strong>
          <p data-yzf-task-intro></p>
        </div>
        <button type="button" class="yzf-panel-close" data-yzf-task-close aria-label="">×</button>
      </header>
      <div class="yzf-task-list" data-yzf-task-list aria-live="polite"></div>
      <footer class="yzf-panel-actions">
        <span data-yzf-task-summary></span>
        <span class="yzf-panel-spacer"></span>
        <button type="button" data-yzf-task-clear></button>
      </footer>
    </section>`;
  document.body.append(dialog);

  const button = document.getElementById("btnTaskCenter");
  if (!button) throw new Error("Missing #btnTaskCenter");

  const title = dialog.querySelector("[data-yzf-task-title]");
  const intro = dialog.querySelector("[data-yzf-task-intro]");
  const close = dialog.querySelector("[data-yzf-task-close]");
  const list = dialog.querySelector("[data-yzf-task-list]");
  const summary = dialog.querySelector("[data-yzf-task-summary]");
  const clear = dialog.querySelector("[data-yzf-task-clear]");
  const badge = button.querySelector("[data-yzf-task-badge]");

  const labels = () => ({
    title: readUiText(options, "taskCenterTitle"),
    intro: readUiText(options, "taskCenterIntro"),
    empty: readUiText(options, "taskCenterEmpty"),
    clear: readUiText(options, "taskCenterClear"),
    close: readUiText(options, "close"),
    active: readUiText(options, "taskCenterActive"),
    recent: readUiText(options, "taskCenterRecent"),
    states: {
      queued: readUiText(options, "taskStateQueued"),
      running: readUiText(options, "taskStateRunning"),
      success: readUiText(options, "taskStateSuccess"),
      error: readUiText(options, "taskStateError"),
      cancelled: readUiText(options, "taskStateCancelled"),
      paused: readUiText(options, "taskStatePaused"),
      waiting: readUiText(options, "taskStateWaiting"),
    },
  });

  function stateTone(state) {
    if (state === "success") return "ok";
    if (state === "error") return "error";
    if (state === "cancelled" || state === "paused") return "warn";
    return "working";
  }

  function formatElapsed(task) {
    const startedAt = Number(task.startedAt || 0);
    if (!startedAt) return "";
    const end = task.finishedAt || Date.now();
    const seconds = Math.max(0, Math.floor((end - startedAt) / 1000));
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remain = seconds % 60;
    return `${minutes}m ${remain}s`;
  }

  function orderedTasks() {
    return [...tasks.values()].sort((a, b) => {
      const activeA = ["queued", "running", "waiting", "paused"].includes(a.state) ? 1 : 0;
      const activeB = ["queued", "running", "waiting", "paused"].includes(b.state) ? 1 : 0;
      if (activeA !== activeB) return activeB - activeA;
      return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
    });
  }

  function render() {
    const text = labels();
    title.textContent = text.title;
    intro.textContent = text.intro;
    close.setAttribute("aria-label", text.close);
    clear.textContent = text.clear;
    const items = orderedTasks();
    list.replaceChildren();
    if (!items.length) {
      list.append(createStateView({ kind: "empty", detail: text.empty, compact: true }));
    } else {
      for (const task of items) {
        const row = document.createElement("article");
        row.className = "yzf-task-row";
        row.dataset.state = task.state;
        row.dataset.tone = stateTone(task.state);
        const head = document.createElement("div");
        head.className = "yzf-task-row-head";
        const copy = document.createElement("div");
        copy.className = "yzf-task-copy";
        const name = document.createElement("strong");
        name.textContent = task.label || task.id;
        const detail = document.createElement("p");
        detail.textContent = task.detail || "";
        detail.hidden = !detail.textContent;
        copy.append(name, detail);
        const meta = document.createElement("div");
        meta.className = "yzf-task-meta";
        const state = document.createElement("span");
        state.className = "yzf-task-state";
        state.textContent = text.states[task.state] || task.state;
        const elapsed = document.createElement("span");
        elapsed.textContent = formatElapsed(task);
        elapsed.hidden = !elapsed.textContent;
        meta.append(state, elapsed);
        head.append(copy, meta);
        row.append(head);
        if (Number.isFinite(task.progress)) {
          const progress = document.createElement("progress");
          progress.max = 1;
          progress.value = Math.max(0, Math.min(1, Number(task.progress)));
          progress.setAttribute("aria-label", `${Math.round(progress.value * 100)}%`);
          row.append(progress);
        }
        list.append(row);
      }
    }
    const active = items.filter((task) => ["queued", "running", "waiting", "paused"].includes(task.state)).length;
    summary.textContent = (active ? text.active : text.recent).replace("{count}", String(active || items.length));
    badge.textContent = active ? String(active) : "";
    button.dataset.tone = active ? "working" : (items.some((task) => task.state === "error") ? "error" : "muted");
    button.dataset.state = active ? "active" : "idle";
    const label = active ? `${text.title} · ${text.active.replace("{count}", String(active))}` : text.title;
    button.title = label;
    button.setAttribute("aria-label", label);
  }

  function update(id, patch = {}) {
    const now = Date.now();
    const previous = tasks.get(id) || {
      id,
      order: ++sequence,
      startedAt: now,
      state: "running",
    };
    const next = {
      ...previous,
      ...patch,
      id,
      updatedAt: now,
    };
    if (["success", "error", "cancelled"].includes(next.state) && !next.finishedAt) next.finishedAt = now;
    if (["queued", "running", "waiting", "paused"].includes(next.state)) next.finishedAt = 0;
    tasks.set(id, next);
    while (tasks.size > 12) {
      const removable = orderedTasks().reverse().find((task) => !["queued", "running", "waiting", "paused"].includes(task.state));
      if (!removable) break;
      tasks.delete(removable.id);
    }
    render();
    return next;
  }

  function finish(id, patch = {}) {
    return update(id, { state: patch.state || "success", ...patch, finishedAt: Date.now() });
  }

  function remove(id) {
    tasks.delete(id);
    render();
  }

  function clearCompleted() {
    for (const [id, task] of tasks) {
      if (!["queued", "running", "waiting", "paused"].includes(task.state)) tasks.delete(id);
    }
    render();
  }

  function open() {
    render();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    notifyUiLayerChange();
  }

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", notifyUiLayerChange);
  clear.addEventListener("click", clearCompleted);
  button.addEventListener("click", open);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  render();

  const ticker = window.setInterval(() => {
    if (dialog.open && orderedTasks().some((task) => ["queued", "running", "waiting", "paused"].includes(task.state))) render();
  }, 1000);

  return {
    dialog,
    button,
    update,
    finish,
    remove,
    clearCompleted,
    snapshot: () => orderedTasks().map((task) => ({ ...task })),
    open,
    relocalize: render,
    destroy() {
      window.clearInterval(ticker);
      dialog.remove();
    },
  };
}


function formatWorkspaceTime(timestamp, language) {
  const value = Number(timestamp || 0);
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(normalizeLanguage(language) === "en" ? "en-US" : "zh-CN", {
      month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleString();
  }
}

function createStateView({ kind = "empty", title = "", detail = "", compact = false } = {}) {
  const state = document.createElement("div");
  state.className = `yzf-state-view${compact ? " compact" : ""}`;
  state.dataset.kind = kind;
  state.innerHTML = `
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <rect x="25" y="17" width="70" height="58" rx="9"></rect>
      <path d="M38 33h44M38 45h31M38 57h23"></path>
      <path class="yzf-state-view-symbol yzf-state-view-check" d="m78 58 7 7 13-16"></path>
      <path class="yzf-state-view-symbol yzf-state-view-error" d="M83 48v12M83 67h.01"></path>
      <circle class="yzf-state-view-symbol yzf-state-view-loading" cx="83" cy="58" r="12"></circle>
    </svg>
    <strong></strong>
    <p></p>`;
  state.querySelector("strong").textContent = title || detail;
  const paragraph = state.querySelector("p");
  paragraph.textContent = title ? detail : "";
  paragraph.hidden = !paragraph.textContent;
  return state;
}

function createPuzzlePreview(record) {
  const values = Array.isArray(record?.previewValues) ? record.previewValues : [];
  const givens = Array.isArray(record?.previewGivens) ? record.previewGivens : [];
  if (values.length !== 81) return null;
  const preview = document.createElement("div");
  preview.className = "yzf-puzzle-preview";
  preview.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 81; index += 1) {
    const cell = document.createElement("span");
    const value = Number(values[index] || 0);
    if (value >= 1 && value <= 9) {
      cell.textContent = String(value);
      cell.dataset.role = givens[index] ? "given" : "filled";
    } else {
      cell.dataset.role = "empty";
    }
    preview.append(cell);
  }
  return preview;
}

function createWorkspaceCenter(options = {}) {
  const button = document.getElementById("btnAppHubWorkspace");
  if (!button) return null;

  const dialog = document.createElement("dialog");
  dialog.id = "yzfWorkspaceDialog";
  dialog.className = "yzf-workspace-dialog";
  dialog.dataset.yzfPanel = "1";
  dialog.dataset.yzfPanelPlacement = "responsive";
  dialog.innerHTML = `
    <section class="yzf-workspace-panel">
      <header class="yzf-panel-header">
        <div><strong data-yzf-workspace-title></strong><p data-yzf-workspace-intro></p></div>
        <button type="button" class="yzf-panel-close" data-yzf-workspace-close aria-label="">×</button>
      </header>
      <div class="yzf-workspace-content" data-yzf-workspace-content aria-live="polite"></div>
      <footer class="yzf-panel-actions">
        <span data-yzf-workspace-summary></span>
        <span class="yzf-panel-spacer"></span>
        <button type="button" data-yzf-workspace-clear></button>
      </footer>
    </section>`;
  document.body.append(dialog);

  const title = dialog.querySelector("[data-yzf-workspace-title]");
  const intro = dialog.querySelector("[data-yzf-workspace-intro]");
  const close = dialog.querySelector("[data-yzf-workspace-close]");
  const content = dialog.querySelector("[data-yzf-workspace-content]");
  const summary = dialog.querySelector("[data-yzf-workspace-summary]");
  const clear = dialog.querySelector("[data-yzf-workspace-clear]");
  const badge = document.getElementById("appHubWorkspaceBadge");
  let latestSnapshot = null;

  const labels = () => ({
    title: readUiText(options, "workspaceTitle"),
    intro: readUiText(options, "workspaceIntro"),
    current: readUiText(options, "workspaceCurrent"),
    currentDetail: readUiText(options, "workspaceCurrentDetail"),
    resume: readUiText(options, "workspaceResume"),
    ocr: readUiText(options, "workspaceOcr"),
    ocrDetail: readUiText(options, "workspaceOcrDetail"),
    recent: readUiText(options, "workspaceRecent"),
    open: readUiText(options, "workspaceOpen"),
    remove: readUiText(options, "workspaceRemove"),
    clear: readUiText(options, "workspaceClear"),
    close: readUiText(options, "close"),
    empty: readUiText(options, "workspaceEmpty"),
    count: readUiText(options, "workspaceCount"),
    confirmClear: readUiText(options, "workspaceConfirmClear"),
    loading: readUiText(options, "workspaceLoading"),
    failed: readUiText(options, "workspaceFailed"),
    clues: readUiText(options, "workspaceClues"),
    filled: readUiText(options, "workspaceFilled"),
    candidates: readUiText(options, "workspaceCandidates"),
    marks: readUiText(options, "workspaceMarks"),
    guides: readUiText(options, "workspaceGuides"),
    replay: readUiText(options, "workspaceReplay"),
    guideIntro: readUiText(options, "workspaceGuideIntro"),
  });

  function card(titleText, detailText, timeText = "", leading = null) {
    const article = document.createElement("article");
    article.className = "yzf-workspace-card";
    if (leading) {
      article.classList.add("has-preview");
      article.append(leading);
    }
    const copy = document.createElement("div");
    copy.className = "yzf-workspace-card-copy";
    const heading = document.createElement("strong");
    heading.textContent = titleText;
    const detail = document.createElement("p");
    detail.textContent = detailText;
    copy.append(heading, detail);
    if (timeText) {
      const time = document.createElement("time");
      time.textContent = timeText;
      copy.append(time);
    }
    const actions = document.createElement("div");
    actions.className = "yzf-workspace-card-actions";
    article.append(copy, actions);
    return { article, actions };
  }

  async function runAction(action, id = "") {
    if (action === "guide") {
      dialog.close();
      await options.coachMarks?.showGuide?.(id, { force: true });
      return;
    }
    const handlers = {
      session: options.resumeSession,
      ocr: options.resumeOcrDraft,
      recent: () => options.openRecent?.(id),
      remove: () => options.removeRecent?.(id),
    };
    const handler = handlers[action];
    if (!handler) return;
    const succeeded = await handler();
    if (succeeded !== false && action !== "remove") dialog.close();
    await refresh();
  }

  async function refresh() {
    const text = labels();
    title.textContent = text.title;
    intro.textContent = text.intro;
    close.setAttribute("aria-label", text.close);
    clear.textContent = text.clear;
    button.title = text.title;
    button.setAttribute("aria-label", text.title);
    content.replaceChildren(createStateView({ kind: "loading", detail: text.loading, compact: true }));
    try {
      latestSnapshot = await options.getWorkspaceSnapshot?.() || {};
      content.replaceChildren();
      let recoverable = 0;
      if (latestSnapshot.session?.savedAt) {
        recoverable += 1;
        const item = card(text.current, text.currentDetail, formatWorkspaceTime(latestSnapshot.session.savedAt, options.getLanguage?.()));
        const action = document.createElement("button");
        action.type = "button";
        action.className = "primary";
        action.textContent = text.resume;
        action.addEventListener("click", () => void runAction("session"));
        item.actions.append(action);
        content.append(item.article);
      }
      if (latestSnapshot.ocrDraft?.savedAt) {
        recoverable += 1;
        const item = card(text.ocr, text.ocrDetail, formatWorkspaceTime(latestSnapshot.ocrDraft.savedAt, options.getLanguage?.()));
        const action = document.createElement("button");
        action.type = "button";
        action.className = "primary";
        action.textContent = text.resume;
        action.addEventListener("click", () => void runAction("ocr"));
        item.actions.append(action);
        content.append(item.article);
      }
      const section = document.createElement("section");
      section.className = "yzf-workspace-recent";
      const heading = document.createElement("h3");
      heading.textContent = text.recent;
      section.append(heading);
      const recent = Array.isArray(latestSnapshot.recent) ? latestSnapshot.recent : [];
      if (!recent.length) {
        section.append(createStateView({ kind: "empty", detail: text.empty, compact: true }));
      } else {
        recoverable += recent.length;
        for (const record of recent) {
          const details = [
            text.filled.replace("{filled}", String(record.filled || 0)),
            text.clues.replace("{clues}", String(record.clues || 0)),
          ];
          if (Number(record.candidateCells || 0) > 0) details.push(text.candidates.replace("{count}", String(record.candidateCells)));
          if (Number(record.manualMarkCount || 0) > 0) details.push(text.marks.replace("{count}", String(record.manualMarkCount)));
          const item = card(
            formatWorkspaceTime(record.savedAt, options.getLanguage?.()),
            details.join(" · "),
            "",
            createPuzzlePreview(record),
          );
          item.article.dataset.workspaceId = record.id;
          const open = document.createElement("button");
          open.type = "button";
          open.className = "primary";
          open.textContent = text.open;
          open.addEventListener("click", () => void runAction("recent", record.id));
          const remove = document.createElement("button");
          remove.type = "button";
          remove.textContent = text.remove;
          remove.addEventListener("click", () => void runAction("remove", record.id));
          item.actions.append(remove, open);
          section.append(item.article);
        }
      }
      content.append(section);
      const guides = options.coachMarks?.listGuides?.() || [];
      if (guides.length) {
        const guideSection = document.createElement("section");
        guideSection.className = "yzf-workspace-guides";
        const guideHeading = document.createElement("h3");
        guideHeading.textContent = text.guides;
        const guideIntro = document.createElement("p");
        guideIntro.textContent = text.guideIntro;
        guideSection.append(guideHeading, guideIntro);
        const en = normalizeLanguage(options.getLanguage?.()) === "en";
        for (const guide of guides) {
          const guideCard = card(
            en ? guide.labelEn : guide.labelZh,
            en ? guide.descriptionEn : guide.descriptionZh,
          );
          guideCard.article.classList.add("yzf-guide-card");
          const replay = document.createElement("button");
          replay.type = "button";
          replay.textContent = text.replay;
          replay.addEventListener("click", () => void runAction("guide", guide.key));
          guideCard.actions.append(replay);
          guideSection.append(guideCard.article);
        }
        content.append(guideSection);
      }
      summary.textContent = text.count.replace("{count}", String(recoverable));
      if (badge) badge.textContent = recoverable ? String(Math.min(99, recoverable)) : "";
      button.dataset.tone = recoverable ? "info" : "muted";
      clear.disabled = !recent.length;
    } catch (error) {
      content.replaceChildren(createStateView({ kind: "error", detail: text.failed }));
      summary.textContent = "";
      console.warn("Failed to render YZF workspace center", error);
    }
  }

  function open() {
    void refresh();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    notifyUiLayerChange();
  }

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", notifyUiLayerChange);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  clear.addEventListener("click", async () => {
    const text = labels();
    if (!window.confirm(text.confirmClear)) return;
    await options.clearRecent?.();
    await refresh();
  });
  /*
   * 自动保存会频繁发出现场变更事件。面板关闭时不读取 IndexedDB、不重建隐藏 DOM，
   * 等用户真正打开面板时再刷新；这样现场能力不会进入求解或连续落子热路径。
   */
  const handleWorkspaceChange = () => {
    if (dialog.open) void refresh();
  };
  window.addEventListener("yzf-workspacechange", handleWorkspaceChange);
  void refresh();

  return {
    dialog, button, open, refresh, relocalize: refresh,
    destroy() {
      window.removeEventListener("yzf-workspacechange", handleWorkspaceChange);
      dialog.remove();
    },
  };
}

function createCoachMarks(options = {}) {
  /*
   * 引导必须进入浏览器 Top Layer。
   *
   * 原实现使用普通 fixed div，即使 z-index 接近整数上限，也仍会被 showModal() 打开的
   * 原生 dialog 压住，导致说明卡和“下一步”无法点击。这里改用独立 modal dialog，
   * 并在引导层内部绘制目标高亮框；不再尝试把业务控件本身抬到遮罩上方。
   */
  const root = document.createElement("dialog");
  root.className = "yzf-coach-root";
  root.hidden = true;
  root.setAttribute("aria-labelledby", "yzfCoachTitle");
  const maskId = `yzfCoachMask-${Math.random().toString(36).slice(2)}`;
  root.innerHTML = `
    <svg class="yzf-coach-backdrop" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0">
          <rect class="yzf-coach-mask-base" x="0" y="0" fill="#fff"></rect>
          <g data-yzf-coach-holes></g>
        </mask>
      </defs>
      <rect class="yzf-coach-shade" x="0" y="0" mask="url(#${maskId})"></rect>
    </svg>
    <div class="yzf-coach-focus" aria-hidden="true" hidden></div>
    <section class="yzf-coach-card" role="document">
      <div class="yzf-coach-step" data-yzf-coach-step></div>
      <strong id="yzfCoachTitle" data-yzf-coach-title></strong>
      <p data-yzf-coach-body></p>
      <div class="yzf-coach-actions">
        <button type="button" data-yzf-coach-skip></button>
        <span class="yzf-panel-spacer"></span>
        <button type="button" class="primary" data-yzf-coach-next></button>
      </div>
    </section>`;
  document.body.append(root);
  const backdrop = root.querySelector(".yzf-coach-backdrop");
  const maskBase = root.querySelector(".yzf-coach-mask-base");
  const maskHoles = root.querySelector("[data-yzf-coach-holes]");
  const shade = root.querySelector(".yzf-coach-shade");
  const focus = root.querySelector(".yzf-coach-focus");
  const card = root.querySelector(".yzf-coach-card");
  const stepLabel = root.querySelector("[data-yzf-coach-step]");
  const title = root.querySelector("[data-yzf-coach-title]");
  const body = root.querySelector("[data-yzf-coach-body]");
  const skip = root.querySelector("[data-yzf-coach-skip]");
  const next = root.querySelector("[data-yzf-coach-next]");
  let activeKey = "";
  let steps = [];
  let index = 0;
  let target = null;
  let revealTargets = [];
  let positionFrame = 0;
  const registry = new Map();

  function labels() {
    return {
      skip: readUiText(options, "coachSkip"),
      next: readUiText(options, "coachNext"),
      done: readUiText(options, "coachDone"),
      step: readUiText(options, "coachStep"),
    };
  }

  function seenKey(key) { return `yzf_ui_coach_seen_${key}`; }
  function hasSeen(key) { try { return localStorage.getItem(seenKey(key)) === "1"; } catch { return false; } }
  function setSeen(key) { try { localStorage.setItem(seenKey(key), "1"); } catch {} }

  function clearTarget() {
    target?.classList.remove("yzf-coach-target");
    target = null;
    revealTargets = [];
    maskHoles.replaceChildren();
    focus.hidden = true;
    focus.classList.remove("is-interactive");
    focus.removeAttribute("role");
    focus.removeAttribute("tabindex");
    focus.removeAttribute("aria-label");
  }

  function hideRoot() {
    if (root.open && typeof root.close === "function") root.close();
    else root.removeAttribute("open");
    root.hidden = true;
  }

  function close(markSeen = true) {
    clearTarget();
    if (markSeen && activeKey) setSeen(activeKey);
    hideRoot();
    document.body.classList.remove("yzf-coach-open");
    activeKey = "";
    steps = [];
    index = 0;
    notifyUiLayerChange();
  }

  function resetCardPosition() {
    card.style.removeProperty("left");
    card.style.removeProperty("right");
    card.style.removeProperty("top");
    card.style.removeProperty("bottom");
    card.style.removeProperty("transform");
    card.removeAttribute("data-placement");
  }

  function updateGeometry() {
    positionFrame = 0;
    if (root.hidden || !root.open || !target || !isVisible(target)) return;
    const rect = target.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
    const padding = 7;
    const left = Math.max(4, rect.left - padding);
    const top = Math.max(4, rect.top - padding);
    const right = Math.min(viewportWidth - 4, rect.right + padding);
    const bottom = Math.min(viewportHeight - 4, rect.bottom + padding);

    backdrop.setAttribute("viewBox", `0 0 ${viewportWidth} ${viewportHeight}`);
    maskBase.setAttribute("width", String(viewportWidth));
    maskBase.setAttribute("height", String(viewportHeight));
    shade.setAttribute("width", String(viewportWidth));
    shade.setAttribute("height", String(viewportHeight));
    const item = steps[index] || {};
    const auxiliaryPadding = Number.isFinite(Number(item.revealPadding)) ? Number(item.revealPadding) : 5;
    const holeSpecs = [
      { element: target, padding },
      ...revealTargets.map((element) => ({ element, padding: auxiliaryPadding })),
    ];
    maskHoles.replaceChildren(...holeSpecs.flatMap(({ element, padding: holePadding }) => {
      if (!(element instanceof Element) || !isVisible(element)) return [];
      const holeRect = element.getBoundingClientRect();
      const holeLeft = Math.max(0, holeRect.left - holePadding);
      const holeTop = Math.max(0, holeRect.top - holePadding);
      const holeRight = Math.min(viewportWidth, holeRect.right + holePadding);
      const holeBottom = Math.min(viewportHeight, holeRect.bottom + holePadding);
      if (holeRight <= holeLeft || holeBottom <= holeTop) return [];
      const node = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      node.setAttribute("x", String(holeLeft));
      node.setAttribute("y", String(holeTop));
      node.setAttribute("width", String(holeRight - holeLeft));
      node.setAttribute("height", String(holeBottom - holeTop));
      node.setAttribute("rx", String(Math.max(4, Number(item.revealRadius) || 10)));
      node.setAttribute("ry", String(Math.max(4, Number(item.revealRadius) || 10)));
      node.setAttribute("fill", "#000");
      return [node];
    }));

    focus.hidden = false;
    focus.style.left = `${left}px`;
    focus.style.top = `${top}px`;
    focus.style.width = `${Math.max(0, right - left)}px`;
    focus.style.height = `${Math.max(0, bottom - top)}px`;

    resetCardPosition();
    const cardRect = card.getBoundingClientRect();
    const gap = 14;
    const edge = 12;
    const canBelow = viewportHeight - bottom >= cardRect.height + gap + edge;
    const canAbove = top >= cardRect.height + gap + edge;
    const canRight = viewportWidth - right >= cardRect.width + gap + edge;
    const canLeft = left >= cardRect.width + gap + edge;

    if (canBelow) {
      card.dataset.placement = "below";
      card.style.left = `${Math.max(edge, Math.min(viewportWidth - cardRect.width - edge, left))}px`;
      card.style.top = `${bottom + gap}px`;
      card.style.bottom = "auto";
      card.style.transform = "none";
    } else if (canAbove) {
      card.dataset.placement = "above";
      card.style.left = `${Math.max(edge, Math.min(viewportWidth - cardRect.width - edge, left))}px`;
      card.style.top = `${Math.max(edge, top - cardRect.height - gap)}px`;
      card.style.bottom = "auto";
      card.style.transform = "none";
    } else if (canRight) {
      card.dataset.placement = "right";
      card.style.left = `${right + gap}px`;
      card.style.top = `${Math.max(edge, Math.min(viewportHeight - cardRect.height - edge, top))}px`;
      card.style.bottom = "auto";
      card.style.transform = "none";
    } else if (canLeft) {
      card.dataset.placement = "left";
      card.style.left = `${Math.max(edge, left - cardRect.width - gap)}px`;
      card.style.top = `${Math.max(edge, Math.min(viewportHeight - cardRect.height - edge, top))}px`;
      card.style.bottom = "auto";
      card.style.transform = "none";
    }
  }

  function scheduleGeometry() {
    if (positionFrame || root.hidden) return;
    positionFrame = window.requestAnimationFrame(updateGeometry);
  }

  function openRoot() {
    root.hidden = false;
    try {
      if (typeof root.showModal === "function") root.showModal();
      else root.setAttribute("open", "");
    } catch {
      root.setAttribute("open", "");
    }
  }

  function render() {
    clearTarget();
    while (index < steps.length) {
      const candidate = document.querySelector(steps[index]?.target || "");
      if (candidate && isVisible(candidate)) {
        target = candidate;
        break;
      }
      index += 1;
    }
    if (!target || index >= steps.length) {
      close(true);
      return;
    }
    target.classList.add("yzf-coach-target");
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    const item = steps[index];
    const requestedRevealTargets = Array.isArray(item?.revealTargets)
      ? item.revealTargets
      : (item?.revealTargets ? [item.revealTargets] : []);
    revealTargets = requestedRevealTargets.flatMap((entry) => {
      if (entry instanceof Element) return [entry];
      if (typeof entry !== "string" || !entry.trim()) return [];
      try { return [...document.querySelectorAll(entry)].filter((element) => element !== target && isVisible(element)); }
      catch { return []; }
    });
    const en = normalizeLanguage(options.getLanguage?.()) === "en";
    const text = labels();
    const targetAction = item?.advanceOnTarget === true;
    focus.classList.toggle("is-interactive", targetAction);
    if (targetAction) {
      focus.setAttribute("role", "button");
      focus.setAttribute("tabindex", "0");
      focus.setAttribute("aria-label", en
        ? (item.targetActionLabelEn || item.titleEn || item.titleZh || text.next)
        : (item.targetActionLabelZh || item.titleZh || item.titleEn || text.next));
    }
    stepLabel.textContent = text.step.replace("{current}", String(index + 1)).replace("{total}", String(steps.length));
    title.textContent = en ? (item.titleEn || item.titleZh || "") : (item.titleZh || item.titleEn || "");
    body.textContent = en ? (item.bodyEn || item.bodyZh || "") : (item.bodyZh || item.bodyEn || "");
    skip.textContent = text.skip;
    const customNext = en ? (item.nextLabelEn || item.nextLabelZh) : (item.nextLabelZh || item.nextLabelEn);
    next.textContent = customNext || (index >= steps.length - 1 ? text.done : text.next);
    window.requestAnimationFrame(() => {
      scheduleGeometry();
      next.focus({ preventScroll: true });
    });
  }

  function register(key, requestedSteps = [], metadata = {}) {
    if (!key || !Array.isArray(requestedSteps) || !requestedSteps.length) return false;
    const previous = registry.get(key) || {};
    registry.set(key, {
      key,
      steps: requestedSteps.map((step) => ({ ...step })),
      labelZh: String(metadata.labelZh || previous.labelZh || key),
      labelEn: String(metadata.labelEn || previous.labelEn || metadata.labelZh || previous.labelZh || key),
      descriptionZh: String(metadata.descriptionZh || previous.descriptionZh || ""),
      descriptionEn: String(metadata.descriptionEn || previous.descriptionEn || metadata.descriptionZh || previous.descriptionZh || ""),
      prepare: typeof metadata.prepare === "function" ? metadata.prepare : (previous.prepare || null),
    });
    return true;
  }

  function openSteps(key, requestedSteps = []) {
    if (!Array.isArray(requestedSteps) || !requestedSteps.length) return false;
    if (root.open || !root.hidden) return false;
    activeKey = key || "";
    steps = requestedSteps;
    index = 0;
    openRoot();
    document.body.classList.add("yzf-coach-open");
    render();
    notifyUiLayerChange();
    return true;
  }

  function show(key, requestedSteps = [], options = {}) {
    if (!key || !Array.isArray(requestedSteps) || !requestedSteps.length) return false;
    register(key, requestedSteps, options);
    if (!options.force && hasSeen(key)) return false;
    return openSteps(key, requestedSteps);
  }

  function showTransient(requestedSteps = []) {
    return openSteps("", requestedSteps);
  }

  async function showGuide(key, options = {}) {
    const guide = registry.get(String(key || ""));
    if (!guide) return false;
    if (guide.prepare) {
      const prepared = await guide.prepare();
      if (prepared === false) return false;
    }
    await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
    return show(guide.key, guide.steps, { ...guide, ...options, force: options.force !== false });
  }

  function listGuides() {
    return [...registry.values()].map((guide) => ({
      key: guide.key,
      labelZh: guide.labelZh,
      labelEn: guide.labelEn,
      descriptionZh: guide.descriptionZh,
      descriptionEn: guide.descriptionEn,
      seen: hasSeen(guide.key),
    }));
  }

  function advance() {
    if (index >= steps.length - 1) close(true);
    else { index += 1; render(); }
  }

  function activateHighlightedTarget() {
    const item = steps[index];
    if (!item?.advanceOnTarget || !target) return false;
    /*
     * modal dialog 会阻断对底层业务控件的直接命中，因此由高亮框代理一次真实 click。
     * 业务控件原有的事件委托仍照常执行；完成后再推进引导，不复制 OCR/TLG 等业务逻辑。
     */
    if (!(target instanceof HTMLElement) || target.matches(":disabled")) return false;
    try {
      const activated = typeof item.onActivate === "function"
        ? item.onActivate(target)
        : (target.click(), true);
      if (activated === false) return false;
    } catch (error) {
      console.warn("Failed to activate highlighted guide target", error);
      return false;
    }
    window.requestAnimationFrame(() => {
      if (root.open && !root.hidden && steps[index] === item) advance();
    });
    return true;
  }

  skip.addEventListener("click", () => close(true));
  next.addEventListener("click", () => {
    const item = steps[index];
    if (typeof item?.onNext === "function") {
      try {
        if (item.onNext(target) === false) return;
      } catch (error) {
        console.warn("Failed to run guide primary action", error);
        return;
      }
    }
    advance();
  });
  focus.addEventListener("click", (event) => {
    if (!activateHighlightedTarget()) return;
    event.preventDefault();
    event.stopPropagation();
  });
  focus.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (!activateHighlightedTarget()) return;
    event.preventDefault();
    event.stopPropagation();
  });
  backdrop.addEventListener("click", () => close(true));
  root.addEventListener("cancel", (event) => {
    event.preventDefault();
    close(true);
  });
  window.addEventListener("resize", scheduleGeometry, { passive: true });
  window.addEventListener("scroll", scheduleGeometry, { passive: true, capture: true });

  return {
    root, register, show, showTransient, showGuide, listGuides, close, get open() { return root.open && !root.hidden; },
    reset(key) { try { localStorage.removeItem(seenKey(key)); } catch {} },
    resetAll() {
      for (const key of registry.keys()) {
        try { localStorage.removeItem(seenKey(key)); } catch {}
      }
    },
    destroy() {
      close(false);
      window.removeEventListener("resize", scheduleGeometry);
      window.removeEventListener("scroll", scheduleGeometry, true);
      root.remove();
    },
  };
}

function createAppHub(options = {}, dependencies = {}) {
  const dialog = document.getElementById("appHubDialog");
  const button = document.getElementById("btnAppHub");
  if (!(dialog instanceof HTMLDialogElement) || !button) return null;

  const close = document.getElementById("btnAppHubClose");
  const languageButtons = [...dialog.querySelectorAll("[data-language]")];
  const appearanceButtons = [...dialog.querySelectorAll("[data-appearance]")];

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function relocalize() {
    const language = normalizeLanguage(options.getLanguage?.());
    const read = (key) => readUiText(options, key);
    const text = {
      button: read("appHubButton"),
      title: read("appHubTitle"),
      intro: read("appHubIntro"),
      continueTitle: read("appHubContinueTitle"),
      workspace: read("appHubWorkspace"),
      workspaceDesc: read("appHubWorkspaceDesc"),
      tasks: read("appHubTasks"),
      tasksDesc: read("appHubTasksDesc"),
      learn: read("appHubLearnTitle"),
      manual: read("appHubManual"),
      manualDesc: read("appHubManualDesc"),
      techniques: read("appHubTechniques"),
      techniquesDesc: read("appHubTechniquesDesc"),
      overview: read("appHubOverview"),
      overviewDesc: read("appHubOverviewDesc"),
      support: read("appHubSupportTitle"),
      diagnostics: read("appHubDiagnostics"),
      diagnosticsDesc: read("appHubDiagnosticsDesc"),
      language: read("appHubLanguage"),
      languageDesc: read("appHubLanguageDesc"),
      appearance: read("appHubAppearance"),
      appearanceDesc: read("appHubAppearanceDesc"),
      appearanceSystem: read("appearanceSystem"),
      appearanceLight: read("appearanceLight"),
      appearanceDark: read("appearanceDark"),
      appearanceContrast: read("appearanceContrast"),
      close: read("close"),
    };
    setText("appHubTitle", text.title);
    setText("appHubIntro", text.intro);
    setText("appHubContinueTitle", text.continueTitle);
    setText("appHubWorkspaceTitle", text.workspace);
    setText("appHubWorkspaceDesc", text.workspaceDesc);
    setText("appHubTasksTitle", text.tasks);
    setText("appHubTasksDesc", text.tasksDesc);
    setText("appHubLearnTitle", text.learn);
    const manual = document.querySelector("#manualLink strong");
    if (manual) manual.textContent = text.manual;
    setText("appHubManualDesc", text.manualDesc);
    const techniques = document.querySelector("#techniquesLink strong");
    if (techniques) techniques.textContent = text.techniques;
    setText("appHubTechniquesDesc", text.techniquesDesc);
    setText("appHubOverviewTitle", text.overview);
    setText("appHubOverviewDesc", text.overviewDesc);
    setText("appHubSupportTitle", text.support);
    setText("appHubDiagnosticsTitle", text.diagnostics);
    setText("appHubDiagnosticsDesc", text.diagnosticsDesc);
    setText("appHubLanguageTitle", text.language);
    setText("appHubLanguageDesc", text.languageDesc);
    setText("appHubAppearanceTitle", text.appearance);
    setText("appHubAppearanceDesc", text.appearanceDesc);
    setText("btnAppHubThemeSystem", text.appearanceSystem);
    setText("btnAppHubThemeLight", text.appearanceLight);
    setText("btnAppHubThemeDark", text.appearanceDark);
    setText("btnAppHubThemeContrast", text.appearanceContrast);
    const actionLabel = button.querySelector(".action-label");
    if (actionLabel) actionLabel.textContent = text.button;
    button.title = text.button;
    button.setAttribute("aria-label", text.button);
    close?.setAttribute("aria-label", text.close);
    for (const languageButton of languageButtons) {
      languageButton.setAttribute("aria-pressed", languageButton.dataset.language === language ? "true" : "false");
    }
    const appearance = dependencies.appearance?.get?.() || "system";
    for (const appearanceButton of appearanceButtons) {
      appearanceButton.setAttribute("aria-pressed", appearanceButton.dataset.appearance === appearance ? "true" : "false");
    }
  }

  function open() {
    relocalize();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    notifyUiLayerChange();
  }

  function closeAnd(action) {
    dialog.close();
    window.requestAnimationFrame(action);
  }

  button.addEventListener("click", open);
  close?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", notifyUiLayerChange);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  document.getElementById("btnAppHubWorkspace")?.addEventListener("click", () => closeAnd(() => dependencies.workspace?.open?.()));
  document.getElementById("btnAppHubTasks")?.addEventListener("click", () => closeAnd(() => dependencies.tasks?.open?.()));
  document.getElementById("btnAppHubDiagnostics")?.addEventListener("click", () => closeAnd(() => dependencies.diagnostics?.open?.()));
  document.getElementById("btnAppHubOverviewGuide")?.addEventListener("click", () => closeAnd(() => dependencies.coachMarks?.showGuide?.("app-overview-v1", { force: true })));
  for (const languageButton of languageButtons) {
    languageButton.addEventListener("click", () => {
      options.setLanguage?.(languageButton.dataset.language);
      relocalize();
    });
  }
  for (const appearanceButton of appearanceButtons) {
    appearanceButton.addEventListener("click", () => {
      dependencies.appearance?.set?.(appearanceButton.dataset.appearance);
      relocalize();
    });
  }
  relocalize();
  return { dialog, button, open, relocalize };
}

function focusLaunchTarget(action, getText) {
  const inputPanel = document.getElementById("puzzleInputPanel") || document.querySelector("details.input-panel");
  const map = {
    ocr: {
      panel: inputPanel,
      target: document.getElementById("btnImageOcrPick"),
      message: getText?.("pwaLaunchOcr") || "pwaLaunchOcr",
    },
    training: {
      panel: null,
      target: document.getElementById("btnGenerateTraining"),
      message: getText?.("pwaLaunchTraining") || "pwaLaunchTraining",
    },
    resume: {
      panel: null,
      target: document.getElementById("boardStage"),
      message: getText?.("pwaLaunchResume") || "pwaLaunchResume",
    },
  };
  const item = map[action];
  if (!item?.target) return null;
  if (item.panel instanceof HTMLDetailsElement) item.panel.open = true;
  item.target.scrollIntoView({ block: "center", behavior: "smooth" });
  if (item.target instanceof HTMLElement && !item.target.matches("label")) {
    try { item.target.focus({ preventScroll: true }); } catch {}
  }
  return item.message;
}

export function applyPwaLaunchAction({ getText, announce } = {}) {
  const params = new URLSearchParams(window.location.search);
  const action = String(params.get("action") || "").toLowerCase();
  if (!action) return false;
  const message = focusLaunchTarget(action, getText);
  if (!message) return false;
  announce?.(message);
  params.delete("action");
  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", next);
  return true;
}

export function installUiFoundation(options = {}) {
  const appearance = createAppearanceController();
  decorateButtons();
  decorateSettingRows();
  decorateControls();
  decorateDisclosures();
  decoratePanels();
  const observer = installDomDecorationObserver();
  const diagnostics = createDiagnosticsDialog(options);
  const tasks = createTaskCenter(options);
  const coachMarks = createCoachMarks(options);
  for (const guide of Array.isArray(options.guides) ? options.guides : []) {
    coachMarks.register(guide?.key, guide?.steps, guide || {});
  }
  const workspace = createWorkspaceCenter({ ...options, coachMarks });
  const appHub = createAppHub(options, { diagnostics, tasks, workspace, coachMarks, appearance });

  function relocalize() {
    tasks.relocalize();
    workspace?.relocalize();
    appHub?.relocalize();
    decorateButtons(document, { force: true });
    if (diagnostics.dialog.open) diagnostics.refresh();
  }

  return {
    diagnostics,
    tasks,
    workspace,
    coachMarks,
    appHub,
    appearance,
    relocalize,
    destroy() {
      observer.disconnect();
      diagnostics.dialog.remove();
      tasks.destroy();
      workspace?.destroy();
      coachMarks.destroy();
      appearance.destroy();
    },
  };
}
