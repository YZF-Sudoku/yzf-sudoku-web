/**
 * Dedicated Truth/Link diagram renderer for TLG editing mode.
 *
 * The normal Sudoku candidate grid and the ordinary chain overlay remain owned
 * by app.js. This module only becomes active while TLG editing is enabled. It
 * owns three things as one coherent unit:
 *   1. the skewed nine-point candidate layout;
 *   2. the immutable render model derived from TLG state;
 *   3. the layered SVG geometry for constraints and candidate badges.
 */

// TLG preserves the familiar 3×3 pencilmark semantics while assigning every
// digit a unique x track and y track. The tracks are evenly spaced across the
// cell, but grouped in the standard reading zones:
//   x, left to right: 1 4 7 | 2 5 8 | 3 6 9
//   y, top to bottom: 3 2 1 | 6 5 4 | 9 8 7
// Therefore 3 remains at the upper-right and 7 remains at the lower-left.
const CANDIDATE_TRACK_MIN = 16;
const CANDIDATE_TRACK_MAX = 84;
const CANDIDATE_TRACK_STEP = (CANDIDATE_TRACK_MAX - CANDIDATE_TRACK_MIN) / 8;
const CANDIDATE_X_ORDER = Object.freeze([1, 4, 7, 2, 5, 8, 3, 6, 9]);
const CANDIDATE_Y_ORDER = Object.freeze([3, 2, 1, 6, 5, 4, 9, 8, 7]);

function candidateTrackRanks(order) {
  return Object.freeze(Object.fromEntries(order.map((digit, rank) => [digit, rank])));
}

const CANDIDATE_X_RANK = candidateTrackRanks(CANDIDATE_X_ORDER);
const CANDIDATE_Y_RANK = candidateTrackRanks(CANDIDATE_Y_ORDER);
const CANDIDATE_LAYOUT = Object.freeze(Object.fromEntries(
  Array.from({ length: 9 }, (_, index) => {
    const digit = index + 1;
    return [digit, Object.freeze({
      x: CANDIDATE_TRACK_MIN + CANDIDATE_X_RANK[digit] * CANDIDATE_TRACK_STEP,
      y: CANDIDATE_TRACK_MIN + CANDIDATE_Y_RANK[digit] * CANDIDATE_TRACK_STEP,
    })];
  }),
));

const CSS_COLORS = Object.freeze({
  candidate: "--tlg-candidate-color",
  candidateStroke: "--tlg-candidate-stroke",
  elimination: "--tlg-elimination-color",
  eliminationStroke: "--tlg-elimination-stroke",
  n: "--tlg-cell-color",
  r: "--tlg-row-color",
  c: "--tlg-column-color",
  b: "--tlg-box-color",
});

const FALLBACK_COLORS = Object.freeze({
  candidate: "#4b88e8",
  candidateStroke: "#244f87",
  elimination: "#df3b31",
  eliminationStroke: "#8f211c",
  n: "#78aef2",
  r: "#a84bd4",
  c: "#3f9364",
  b: "#b97845",
  v: "#111111",
});

const CORNER_TAG_COLORS = Object.freeze({
  aur0: "#ea580c",
  aur1: "#2563eb",
  daur0: "#0891b2",
  gur0: "#7c2d12",
});

function svgElement(tagName, attributes = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
  return node;
}

function endpointTokens(value) {
  const endpoints = [];
  const pattern = /([1-9])r([1-9])c([1-9])/gi;
  let match;
  while ((match = pattern.exec(String(value || ""))) !== null) {
    endpoints.push({ digit: Number(match[1]), row: Number(match[2]), column: Number(match[3]) });
  }
  return endpoints;
}

function safeId(value) {
  return String(value || "constraint").replace(/[^a-z0-9_-]+/gi, "-");
}

function freezeModel(model) {
  for (const [key, candidate] of model.candidates) {
    model.candidates.set(key, Object.freeze({
      ...candidate,
      roles: Object.freeze([...candidate.roles]),
      constraintTypes: Object.freeze([...candidate.constraintTypes]),
      accents: Object.freeze([...candidate.accents]),
      cornerTags: Object.freeze(candidate.cornerTags.map((tag) => Object.freeze({ ...tag }))),
    }));
  }
  model.constraints.forEach(Object.freeze);
  Object.freeze(model.constraints);
  return Object.freeze(model);
}

export function createTlgDiagramRenderer({
  boardStage,
  board,
  overlay,
  underlay,
  getCandidateCenter,
  getCellRectLogical,
  candidateKey,
  boxIndex,
  canonicalDescriptor,
  normalizeResponseCandidate,
}) {
  if (!boardStage || !board || !overlay) throw new Error("TLG diagram renderer requires board DOM nodes");
  if (typeof getCandidateCenter !== "function" || typeof getCellRectLogical !== "function") {
    throw new Error("TLG diagram renderer requires board geometry callbacks");
  }

  let active = false;
  let model = null;
  let renderFrame = 0;

  function cssColor(name) {
    const variable = CSS_COLORS[name] || name;
    const value = window.getComputedStyle(boardStage).getPropertyValue(variable).trim();
    return value || FALLBACK_COLORS[name] || "#78aef2";
  }

  function applyCandidateLayoutStyle(candidate, digit) {
    const point = CANDIDATE_LAYOUT[Number(digit)];
    if (!candidate || !point) return;
    candidate.style.setProperty("--tlg-candidate-x", `${point.x}%`);
    candidate.style.setProperty("--tlg-candidate-y", `${point.y}%`);
  }

  function clearOverlay() {
    window.cancelAnimationFrame(renderFrame);
    renderFrame = 0;
    underlay?.replaceChildren();
    overlay.replaceChildren();
  }

  function candidateKeysForDescriptor(snapshot, rawValue, canonical) {
    const members = [];
    const pushIfActive = (cell, digit) => {
      if (!Number.isInteger(cell) || cell < 0 || cell >= 81) return;
      if (!Number.isInteger(digit) || digit < 1 || digit > 9) return;
      const candidates = snapshot?.cells?.[cell]?.candidates || [];
      if (candidates.includes(digit)) members.push(candidateKey(cell, digit));
    };

    const match = /^([1-9])([rcnb])([1-9])$/i.exec(String(canonical || ""));
    if (match) {
      const first = Number(match[1]);
      const type = match[2].toLowerCase();
      const house = Number(match[3]);
      if (type === "n") {
        const cell = (first - 1) * 9 + (house - 1);
        for (const digit of snapshot?.cells?.[cell]?.candidates || []) pushIfActive(cell, Number(digit));
        return { type, digit: 0, house, cell, members: [...new Set(members)] };
      }
      const digit = first;
      for (let cell = 0; cell < 81; cell += 1) {
        const row = Math.floor(cell / 9) + 1;
        const column = (cell % 9) + 1;
        const box = boxIndex(cell);
        if ((type === "r" && row === house) || (type === "c" && column === house) || (type === "b" && box === house)) {
          pushIfActive(cell, digit);
        }
      }
      return { type, digit, house, cell: -1, members: [...new Set(members)] };
    }

    const raw = String(rawValue || "");
    const type = /^row-/i.test(raw)
      ? "r"
      : (/^column-/i.test(raw) ? "c" : (/^box-/i.test(raw) ? "b" : (/^cell-/i.test(raw) ? "n" : "")));
    const endpoints = endpointTokens(raw);
    endpoints.forEach((point) => pushIfActive((point.row - 1) * 9 + point.column - 1, point.digit));
    return {
      type,
      digit: endpoints.length ? endpoints[0].digit : 0,
      house: 0,
      cell: endpoints.length ? (endpoints[0].row - 1) * 9 + endpoints[0].column - 1 : -1,
      members: [...new Set(members)],
    };
  }

  function buildModel(snapshot, state) {
    const next = { candidates: new Map(), constraints: [] };
    const seenConstraints = new Set();
    const ensureCandidate = (key) => {
      if (!next.candidates.has(key)) {
        const [cellText, digitText] = String(key).split(":");
        next.candidates.set(key, {
          key,
          cell: Number(cellText),
          digit: Number(digitText),
          roles: new Set(),
          constraintTypes: new Set(),
          accents: new Set(),
          cornerTags: [],
        });
      }
      return next.candidates.get(key);
    };

    const addConstraint = (rawValue, role) => {
      const canonical = canonicalDescriptor(rawValue);
      const parsed = candidateKeysForDescriptor(snapshot, rawValue, canonical);
      if (!parsed.type || !parsed.members.length) return;
      const identity = `${role}:${canonical || String(rawValue || "").toLowerCase()}`;
      if (seenConstraints.has(identity)) return;
      seenConstraints.add(identity);
      const constraint = {
        key: identity,
        role,
        raw: String(rawValue || ""),
        canonical,
        type: parsed.type,
        digit: parsed.digit,
        house: parsed.house,
        cell: parsed.cell,
        members: Object.freeze([...parsed.members]),
      };
      next.constraints.push(constraint);
      for (const key of parsed.members) {
        const candidate = ensureCandidate(key);
        candidate.roles.add(role);
        candidate.constraintTypes.add(parsed.type);
      }
    };

    (state.truths || []).forEach((value) => addConstraint(value, "truth"));
    (state.links || []).forEach((value) => addConstraint(value, "link"));

    const virtualMembers = [...new Set([...(state.virtualCandidates || [])])].filter((key) => {
      const [cellText, digitText] = String(key).split(":");
      const cell = Number(cellText);
      const digit = Number(digitText);
      return snapshot?.cells?.[cell]?.candidates?.includes(digit);
    });
    if (virtualMembers.length > 1) {
      next.constraints.push({
        key: "virtual-set:0",
        role: "truth",
        raw: "virtual-set",
        canonical: "virtual-set",
        type: "v",
        digit: 0,
        house: 0,
        cell: -1,
        members: Object.freeze(virtualMembers),
      });
      for (const key of virtualMembers) {
        const candidate = ensureCandidate(key);
        candidate.roles.add("structure");
        candidate.constraintTypes.add("v");
      }
    } else if (virtualMembers.length === 1) {
      ensureCandidate(virtualMembers[0]).roles.add("structure");
    }

    const addCornerTagGroups = (groups, tagType, fallbackColorList) => {
      const normalizedGroups = Array.isArray(groups) ? groups : [groups];
      normalizedGroups.forEach((values, groupIndex) => {
        const members = [...new Set([...(values || [])])].filter((key) => {
          const [cellText, digitText] = String(key).split(":");
          const cell = Number(cellText);
          const digit = Number(digitText);
          return snapshot?.cells?.[cell]?.candidates?.includes(digit);
        });
        if (!members.length) return;
        const groupKey = `${tagType}${groupIndex}`;
        const color = CORNER_TAG_COLORS[groupKey] || fallbackColorList[groupIndex % fallbackColorList.length];
        for (const key of members) {
          const candidate = ensureCandidate(key);
          candidate.roles.add("structure");
          candidate.cornerTags.push({ type: tagType, groupIndex, color });
        }
      });
    };

    addCornerTagGroups(state.aurGroups || [], "aur", ["#ea580c", "#2563eb", "#f59e0b", "#0ea5e9"]);
    addCornerTagGroups(state.dynamicAurCandidates ? [state.dynamicAurCandidates] : [], "daur", ["#0891b2", "#06b6d4", "#8b5cf6"]);
    addCornerTagGroups(state.genericAurCandidates ? [state.genericAurCandidates] : [], "gur", ["#7c2d12", "#92400e", "#a16207"]);

    const endpoint = state.selectedEndpoint;
    if (endpoint && snapshot?.cells?.[endpoint.cellIndex]?.candidates?.includes(endpoint.digit)) {
      const candidate = ensureCandidate(candidateKey(endpoint.cellIndex, endpoint.digit));
      candidate.roles.add("structure");
      candidate.accents.add("endpoint");
    }

    const addSelectedCandidates = (values) => {
      for (const rawKey of values || []) {
        const key = String(rawKey);
        const [cellText, digitText] = key.split(":");
        const cell = Number(cellText);
        const digit = Number(digitText);
        if (!snapshot?.cells?.[cell]?.candidates?.includes(digit)) continue;
        const candidate = ensureCandidate(key);
        candidate.roles.add("structure");
        candidate.accents.add("selected");
      }
    };
    addSelectedCandidates(state.selectedCandidates);

    for (const item of state.eliminations || []) {
      const normalized = normalizeResponseCandidate(item);
      if (!normalized) continue;
      ensureCandidate(candidateKey(normalized.cell, normalized.digit)).roles.add("elimination");
    }
    for (const item of state.assignments || []) {
      const normalized = normalizeResponseCandidate(item);
      if (!normalized) continue;
      ensureCandidate(candidateKey(normalized.cell, normalized.digit)).roles.add("assignment");
    }
    return freezeModel(next);
  }

  function prepare({ enabled, snapshot, state }) {
    const wasActive = active;
    active = !!enabled;
    boardStage.classList.toggle("tlg-diagram-layout", active);
    board.classList.toggle("tlg-diagram-layout", active);
    model = active && snapshot ? buildModel(snapshot, state) : null;
    if ((wasActive && !active) || (active && !model)) clearOverlay();
    return model;
  }

  function candidateMetrics(candidate) {
    const measured = getCandidateCenter(candidate.cell, candidate.digit);
    const cellRect = getCellRectLogical(candidate.cell);
    const size = Math.max(16, Math.min(23, cellRect.width * 0.22));
    const radius = size / 2;
    const inset = radius + Math.max(1.3, cellRect.width * 0.015);
    const x = Math.min(cellRect.x + cellRect.width - inset, Math.max(cellRect.x + inset, measured.x));
    const y = Math.min(cellRect.y + cellRect.height - inset, Math.max(cellRect.y + inset, measured.y));
    return { x, y, size, radius, left: x - radius, top: y - radius };
  }

  function appendOrthogonalPathParts(parts, point, hubX, hubY, selector = 0) {
    if (Math.abs(point.x - hubX) < 0.1 && Math.abs(point.y - hubY) < 0.1) return;
    if (Math.abs(point.x - hubX) < 0.1 || Math.abs(point.y - hubY) < 0.1) {
      parts.push(`M ${point.x} ${point.y} L ${hubX} ${hubY}`);
      return;
    }
    if ((selector % 2) === 0) parts.push(`M ${point.x} ${point.y} H ${hubX} V ${hubY}`);
    else parts.push(`M ${point.x} ${point.y} V ${hubY} H ${hubX}`);
  }

  function constraintPath(constraint, metricsByKey) {
    const points = constraint.members.map((key) => metricsByKey.get(key)).filter(Boolean);
    if (!points.length) return "";
    if (constraint.type === "r") {
      const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
      const min = Math.min(...points.map((point) => point.x));
      const max = Math.max(...points.map((point) => point.x));
      const pad = points[0].radius * 0.45;
      return `M ${min - pad} ${y} H ${max + pad}`;
    }
    if (constraint.type === "c") {
      const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
      const min = Math.min(...points.map((point) => point.y));
      const max = Math.max(...points.map((point) => point.y));
      const pad = points[0].radius * 0.45;
      return `M ${x} ${min - pad} V ${max + pad}`;
    }
    if (constraint.type === "b" || constraint.type === "v") {
      if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
      const xs = points.map((point) => point.x).sort((a, b) => a - b);
      const ys = points.map((point) => point.y).sort((a, b) => a - b);
      const hubX = xs[Math.floor(xs.length / 2)];
      const hubY = ys[Math.floor(ys.length / 2)];
      const parts = [];
      points.forEach((point, index) => appendOrthogonalPathParts(parts, point, hubX, hubY, constraint.digit + index));
      return parts.join(" ");
    }
    return "";
  }

  function appendHollowPath(layer, defs, pathD, color, type, key, serial) {
    const maskId = `tlg-mask-${serial}-${safeId(key)}`;
    const outerWidth = type === "b" ? 9 : 7;
    const innerWidth = type === "b" ? 4.2 : 3.2;
    const mask = svgElement("mask", { id: maskId, x: 0, y: 0, width: 900, height: 900, maskUnits: "userSpaceOnUse" });
    mask.append(
      svgElement("rect", { x: 0, y: 0, width: 900, height: 900, fill: "black" }),
      svgElement("path", {
        d: pathD, fill: "none", stroke: "white", "stroke-width": outerWidth,
        "stroke-linecap": "round", "stroke-linejoin": "round",
      }),
      svgElement("path", {
        d: pathD, fill: "none", stroke: "black", "stroke-width": innerWidth,
        "stroke-linecap": "round", "stroke-linejoin": "round",
      }),
    );
    defs.appendChild(mask);
    layer.appendChild(svgElement("path", {
      class: "tlg-diagram-constraint tlg-diagram-link",
      d: pathD, fill: "none", stroke: color, "stroke-width": outerWidth,
      "stroke-linecap": "round", "stroke-linejoin": "round",
      mask: `url(#${maskId})`, opacity: 0.92,
      "data-tlg-role": "link", "data-tlg-type": type, "data-tlg-key": key,
    }));
  }

  function appendCellRegion(layer, constraint, metricsByKey, color) {
    const points = constraint.members.map((key) => metricsByKey.get(key)).filter(Boolean);
    if (!points.length) return;
    const pad = Math.max(4, points[0].size * 0.16);
    const left = Math.min(...points.map((point) => point.left)) - pad;
    const top = Math.min(...points.map((point) => point.top)) - pad;
    const right = Math.max(...points.map((point) => point.left + point.size)) + pad;
    const bottom = Math.max(...points.map((point) => point.top + point.size)) + pad;
    const attributes = {
      class: `tlg-diagram-constraint tlg-diagram-${constraint.role}`,
      x: left, y: top, width: right - left, height: bottom - top,
      rx: 7, ry: 7,
      "data-tlg-role": constraint.role,
      "data-tlg-type": "n",
      "data-tlg-key": constraint.key,
    };
    if (constraint.role === "truth") {
      Object.assign(attributes, { fill: color, "fill-opacity": 0.42, stroke: color, "stroke-width": 1.4, "stroke-opacity": 0.72 });
    } else {
      Object.assign(attributes, { fill: "none", stroke: color, "stroke-width": 3, "stroke-opacity": 0.92 });
    }
    layer.appendChild(svgElement("rect", attributes));
  }

  function accentStyle(accent) {
    if (accent === "selected") return { color: "#dc2626", width: 2.6, dash: "" };
    if (accent === "endpoint") return { color: "#0ea5e9", width: 2.6, dash: "" };
    return null;
  }

  function appendCornerTags(group, candidate, metrics) {
    if (!candidate.cornerTags.length) return;
    const tagSize = Math.max(4.8, metrics.size * 0.26);
    const gap = Math.max(1.1, metrics.size * 0.05);
    candidate.cornerTags.forEach((tag, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = metrics.left + metrics.size - tagSize - 1.2 - column * (tagSize + gap);
      const y = metrics.top + 1.2 + row * (tagSize + gap);
      group.appendChild(svgElement("rect", {
        x, y, width: tagSize, height: tagSize,
        rx: Math.max(1.4, tagSize * 0.22), ry: Math.max(1.4, tagSize * 0.22),
        fill: tag.color, stroke: "#ffffff", "stroke-width": 0.9, opacity: 0.98,
        "data-tlg-tag": `${tag.type}${tag.groupIndex}`,
      }));
    });
  }

  function appendCandidateBadge(layer, candidate, metrics) {
    const isElimination = candidate.roles.includes("elimination");
    const group = svgElement("g", {
      class: `tlg-diagram-candidate${isElimination ? " elimination" : " structure"}`,
      "data-tlg-candidate": candidate.key,
    });
    group.appendChild(svgElement("rect", {
      x: metrics.left, y: metrics.top, width: metrics.size, height: metrics.size,
      rx: Math.max(3, metrics.size * 0.18), ry: Math.max(3, metrics.size * 0.18),
      fill: cssColor(isElimination ? "elimination" : "candidate"),
      stroke: cssColor(isElimination ? "eliminationStroke" : "candidateStroke"),
      "stroke-width": 1.7,
    }));

    let accentIndex = 0;
    for (const accent of candidate.accents) {
      const style = accentStyle(accent);
      if (!style) continue;
      const offset = 2.6 + accentIndex * 2.8;
      const attributes = {
        x: metrics.left - offset, y: metrics.top - offset,
        width: metrics.size + offset * 2, height: metrics.size + offset * 2,
        rx: Math.max(4, metrics.size * 0.2 + offset), ry: Math.max(4, metrics.size * 0.2 + offset),
        fill: "none", stroke: style.color, "stroke-width": style.width,
      };
      if (style.dash) attributes["stroke-dasharray"] = style.dash;
      group.appendChild(svgElement("rect", attributes));
      accentIndex += 1;
    }

    const label = svgElement("text", {
      x: metrics.x, y: metrics.y + metrics.size * 0.03,
      fill: "#ffffff", "font-family": "Tahoma, Arial, sans-serif",
      "font-size": metrics.size * 0.64, "font-weight": 800,
      "text-anchor": "middle", "dominant-baseline": "middle",
    });
    label.textContent = String(candidate.digit);
    group.appendChild(label);
    appendCornerTags(group, candidate, metrics);
    layer.appendChild(group);
  }

  function render() {
    if (!active || !model) return;
    underlay?.replaceChildren();
    overlay.replaceChildren();

    const defs = svgElement("defs");
    const houseTruthLayer = svgElement("g", { class: "tlg-diagram-house-truth-layer" });
    const houseLinkLayer = svgElement("g", { class: "tlg-diagram-house-link-layer" });
    const cellTruthLayer = svgElement("g", { class: "tlg-diagram-cell-truth-layer" });
    const cellLinkLayer = svgElement("g", { class: "tlg-diagram-cell-link-layer" });
    const virtualTruthLayer = svgElement("g", { class: "tlg-diagram-virtual-truth-layer" });
    const candidateLayer = svgElement("g", { class: "tlg-diagram-candidate-layer" });
    const metricsByKey = new Map();
    for (const candidate of model.candidates.values()) metricsByKey.set(candidate.key, candidateMetrics(candidate));

    const ordered = [...model.constraints].sort((a, b) => {
      const typeOrder = { v: 0, b: 1, r: 2, c: 3, n: 4 };
      return (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9);
    });
    let serial = 0;
    for (const constraint of ordered) {
      const color = constraint.type === "v" ? FALLBACK_COLORS.v : cssColor(constraint.type);
      if (constraint.type === "n") {
        appendCellRegion(constraint.role === "truth" ? cellTruthLayer : cellLinkLayer, constraint, metricsByKey, color);
        continue;
      }
      const pathD = constraintPath(constraint, metricsByKey);
      if (!pathD) continue;
      if (constraint.type === "v") {
        virtualTruthLayer.appendChild(svgElement("path", {
          class: "tlg-diagram-constraint tlg-diagram-virtual",
          d: pathD, fill: "none", stroke: color,
          "stroke-width": 5.4, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.95,
          "data-tlg-role": "virtual", "data-tlg-type": "v", "data-tlg-key": constraint.key,
        }));
        continue;
      }
      const layer = constraint.role === "truth" ? houseTruthLayer : houseLinkLayer;
      if (constraint.role === "truth") {
        layer.appendChild(svgElement("path", {
          class: "tlg-diagram-constraint tlg-diagram-truth",
          d: pathD, fill: "none", stroke: color,
          "stroke-width": constraint.type === "b" ? 7.2 : 5.6,
          "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.78,
          "data-tlg-role": "truth", "data-tlg-type": constraint.type, "data-tlg-key": constraint.key,
        }));
      } else {
        appendHollowPath(layer, defs, pathD, color, constraint.type, constraint.key, serial);
      }
      serial += 1;
    }

    for (const candidate of [...model.candidates.values()].sort((a, b) => a.cell - b.cell || a.digit - b.digit)) {
      appendCandidateBadge(candidateLayer, candidate, metricsByKey.get(candidate.key));
    }
    overlay.append(defs, houseTruthLayer, houseLinkLayer, cellTruthLayer, cellLinkLayer, virtualTruthLayer, candidateLayer);
  }

  function scheduleRender() {
    if (!active) return;
    window.cancelAnimationFrame(renderFrame);
    renderFrame = window.requestAnimationFrame(render);
  }

  function isCandidateCovered(key) {
    return !!model?.candidates?.has(key);
  }

  function inspect() {
    return { active, candidates: model?.candidates?.size || 0, constraints: model?.constraints?.length || 0 };
  }

  window.addEventListener("resize", scheduleRender, { passive: true });
  window.addEventListener("orientationchange", scheduleRender, { passive: true });
  window.addEventListener("yzf-board-geometry-applied", scheduleRender);
  document.addEventListener("fullscreenchange", scheduleRender);
  document.addEventListener("webkitfullscreenchange", scheduleRender);

  return Object.freeze({
    applyCandidateLayoutStyle,
    prepare,
    render,
    scheduleRender,
    clearOverlay,
    isCandidateCovered,
    inspect,
  });
}
