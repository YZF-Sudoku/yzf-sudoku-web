/*
 * Copyright (c) 2019-2026 YZF Sudoku and its developers. All rights reserved.
 * Contact: 63160007@qq.com. Full notice: COPYRIGHT.md.
 * Campaign progress and active-session persistence. Kept separate from the normal
 * board workspace so course progression never mutates ordinary puzzle history.
 */
export const CAMPAIGN_PROGRESS_STORAGE_KEY = "yzf_campaign_progress_v1";
export const CAMPAIGN_SESSION_STORAGE_KEY = "yzf_campaign_session_v1";
export const CAMPAIGN_PROGRESS_VERSION = 1;
export const CAMPAIGN_MASTERY_STREAK_REQUIRED = 2;

function emptyProgress(chapters) {
  const first = chapters?.[0]?.id || null;
  return {
    version: CAMPAIGN_PROGRESS_VERSION,
    unlockedChapterIds: first ? [first] : [],
    chapters: {},
    updatedAt: Date.now(),
  };
}

function normalizeProgress(raw, chapters) {
  const base = emptyProgress(chapters);
  if (!raw || Number(raw.version) !== CAMPAIGN_PROGRESS_VERSION) return base;
  const known = new Set((chapters || []).map((chapter) => chapter.id));
  const unlocked = Array.isArray(raw.unlockedChapterIds)
    ? raw.unlockedChapterIds.filter((id) => known.has(id))
    : [];
  if (chapters?.[0]?.id && !unlocked.includes(chapters[0].id)) unlocked.unshift(chapters[0].id);

  // Optional Labs may be added after a user already passed their prerequisite Boss.
  // Reconstruct those unlocks from persisted Boss completion so upgrades never require
  // replaying an old Boss just to expose newly added optional course content.
  const rawChaptersForUnlock = raw.chapters && typeof raw.chapters === "object" ? raw.chapters : {};
  for (const chapter of chapters || []) {
    if (!chapter?.optional || !chapter.unlockAfterBoss) continue;
    if (rawChaptersForUnlock?.[chapter.unlockAfterBoss]?.bossCompleted && !unlocked.includes(chapter.id)) unlocked.push(chapter.id);
  }

  // Reconcile persisted lesson completion against the *current* course definition.
  // This keeps completed item ids across content expansion, but prevents an old
  // 1/1 lesson from remaining completed after the lesson grows to 5 required practices.
  const rawChapters = raw.chapters && typeof raw.chapters === "object" ? raw.chapters : {};
  const reconciledChapters = {};
  for (const chapter of chapters || []) {
    const rawChapter = rawChapters[chapter.id] && typeof rawChapters[chapter.id] === "object" ? rawChapters[chapter.id] : {};
    const rawLessons = rawChapter.lessons && typeof rawChapter.lessons === "object" ? rawChapter.lessons : {};
    const lessons = {};
    for (const lesson of chapter.lessons || []) {
      const rawLesson = rawLessons[lesson.id] && typeof rawLessons[lesson.id] === "object" ? rawLessons[lesson.id] : {};
      const knownItemIds = new Set((lesson.items || []).map((entry) => entry.id));
      const completedItems = Array.from(new Set(Array.isArray(rawLesson.completedItems) ? rawLesson.completedItems.filter((id) => knownItemIds.has(id)) : []));
      const required = lesson.requiredItems || [];
      const completed = required.length > 0 && required.every((id) => completedItems.includes(id));
      const persistedMastered = new Set(Array.isArray(rawLesson.masteredItems) ? rawLesson.masteredItems.filter((id) => knownItemIds.has(id)) : []);
      const rawResults = rawLesson.itemResults && typeof rawLesson.itemResults === "object" ? rawLesson.itemResults : {};
      const itemResults = {};
      const masteredItems = [];
      for (const itemId of knownItemIds) {
        const result = rawResults[itemId];
        if (!result || typeof result !== "object") continue;
        // Backward compatibility: learning-r1 treated one no-hint success as
        // permanent mastery. Preserve existing mastered rows on upgrade by
        // seeding the new streak threshold, then let later hinted attempts reset it.
        const legacyMastered = persistedMastered.has(itemId);
        const noHintStreak = Number.isFinite(Number(result.noHintStreak))
          ? Math.max(0, Number(result.noHintStreak))
          : (legacyMastered ? CAMPAIGN_MASTERY_STREAK_REQUIRED : 0);
        const mastered = noHintStreak >= CAMPAIGN_MASTERY_STREAK_REQUIRED;
        itemResults[itemId] = { ...result, noHintStreak, ...(mastered ? {} : { masteredAt: null }) };
        if (mastered) masteredItems.push(itemId);
      }
      lessons[lesson.id] = {
        ...rawLesson,
        completedItems,
        masteredItems,
        itemResults,
        completed,
        completedAt: completed ? (rawLesson.completedAt || Date.now()) : null,
      };
    }
    reconciledChapters[chapter.id] = { ...rawChapter, lessons };
  }
  return {
    version: CAMPAIGN_PROGRESS_VERSION,
    unlockedChapterIds: unlocked,
    chapters: reconciledChapters,
    updatedAt: Number(raw.updatedAt || Date.now()),
  };
}

export function loadCampaignProgress(chapters) {
  try {
    const raw = JSON.parse(localStorage.getItem(CAMPAIGN_PROGRESS_STORAGE_KEY) || "null");
    return normalizeProgress(raw, chapters);
  } catch {
    return emptyProgress(chapters);
  }
}

export function saveCampaignProgress(progress) {
  const next = { ...progress, version: CAMPAIGN_PROGRESS_VERSION, updatedAt: Date.now() };
  localStorage.setItem(CAMPAIGN_PROGRESS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function isCampaignChapterUnlocked(progress, chapterId) {
  return Boolean(progress?.unlockedChapterIds?.includes(chapterId));
}

export function campaignLessonProgress(progress, chapterId, lessonId) {
  return progress?.chapters?.[chapterId]?.lessons?.[lessonId] || { completed: false, completedItems: [] };
}

export function isCampaignLessonCompleted(progress, chapterId, lessonId) {
  return Boolean(campaignLessonProgress(progress, chapterId, lessonId).completed);
}

export function markCampaignItemCompleted(progress, chapter, lesson, itemId, options = {}) {
  const chapterState = progress.chapters?.[chapter.id] || {};
  const lessons = { ...(chapterState.lessons || {}) };
  const lessonState = lessons[lesson.id] || { completed: false, completedItems: [], masteredItems: [], itemResults: {} };
  const now = Date.now();
  const completedItems = Array.from(new Set([...(lessonState.completedItems || []), itemId]));
  const itemResults = { ...(lessonState.itemResults || {}) };
  const previousResult = itemResults[itemId] || {};
  const priorStreak = Math.max(0, Number(previousResult.noHintStreak || 0));
  const noHintStreak = options.noHint ? priorStreak + 1 : 0;
  const mastered = noHintStreak >= CAMPAIGN_MASTERY_STREAK_REQUIRED;
  const masteredSet = new Set(lessonState.masteredItems || []);
  if (mastered) masteredSet.add(itemId);
  else masteredSet.delete(itemId);
  const masteredItems = [...masteredSet];
  itemResults[itemId] = {
    ...previousResult,
    completedAt: previousResult.completedAt || now,
    lastSolvedAt: now,
    lastAttemptUsedHint: !options.noHint,
    hintCountLastAttempt: Number(options.hintCount || 0),
    maxHintLevelLastAttempt: Number(options.maxHintLevel || 0),
    noHintStreak,
    masteredAt: mastered ? (previousResult.masteredAt || now) : null,
  };
  const required = lesson.requiredItems || [];
  const completed = required.every((requiredId) => completedItems.includes(requiredId));
  lessons[lesson.id] = {
    ...lessonState,
    completedItems,
    masteredItems,
    itemResults,
    completed,
    completedAt: completed ? (lessonState.completedAt || now) : (lessonState.completedAt || null),
  };
  return saveCampaignProgress({
    ...progress,
    chapters: { ...progress.chapters, [chapter.id]: { ...chapterState, lessons } },
  });
}

export function markCampaignBossCompleted(progress, chapter, options = {}) {
  const chapterState = progress.chapters?.[chapter.id] || {};
  const unlockedChapterIds = Array.from(new Set([
    ...(progress.unlockedChapterIds || []),
    chapter.id,
    ...(chapter.boss?.unlocks ? [chapter.boss.unlocks] : []),
    ...(Array.isArray(chapter.boss?.bonusUnlocks) ? chapter.boss.bonusUnlocks : []),
  ]));
  return saveCampaignProgress({
    ...progress,
    unlockedChapterIds,
    chapters: {
      ...progress.chapters,
      [chapter.id]: {
        ...chapterState,
        bossCompleted: true,
        bossCompletedAt: chapterState.bossCompletedAt || Date.now(),
        bossMastered: Boolean(chapterState.bossMastered || options.noHint),
        bossLastAttemptUsedHint: !options.noHint,
        bossHintCountLastAttempt: Number(options.hintCount || 0),
        bossMaxHintLevelLastAttempt: Number(options.maxHintLevel || 0),
      },
    },
  });
}


export function campaignLessonMastery(progress, chapterId, lessonId, requiredItems = []) {
  const lesson = campaignLessonProgress(progress, chapterId, lessonId);
  const mastered = new Set(lesson.masteredItems || []);
  const required = Array.isArray(requiredItems) ? requiredItems : [];
  return {
    mastered: required.filter((id) => mastered.has(id)).length,
    total: required.length,
  };
}

export function campaignReviewQueue(progress, chapters, options = {}) {
  const now = Number(options.now || Date.now());
  const staleMs = Number(options.staleMs || 14 * 24 * 60 * 60 * 1000);
  const rows = [];
  for (const chapter of chapters || []) {
    for (const lesson of chapter.lessons || []) {
      const state = campaignLessonProgress(progress, chapter.id, lesson.id);
      const completed = new Set(state.completedItems || []);
      const mastered = new Set(state.masteredItems || []);
      const results = state.itemResults || {};
      for (const item of lesson.items || []) {
        if (item.type !== "practice" || !completed.has(item.id)) continue;
        const result = results[item.id] || {};
        const masteredAt = Number(result.masteredAt || 0);
        let reason = "";
        if (!mastered.has(item.id)) reason = result.lastAttemptUsedHint ? "hint" : "not-mastered";
        else if (masteredAt > 0 && now - masteredAt >= staleMs) reason = "stale";
        if (!reason) continue;
        rows.push({ chapterId: chapter.id, lessonId: lesson.id, itemId: item.id, reason, lastSolvedAt: Number(result.lastSolvedAt || 0) });
      }
    }
  }
  rows.sort((a, b) => (a.reason === "hint" ? -1 : 0) - (b.reason === "hint" ? -1 : 0) || a.lastSolvedAt - b.lastSolvedAt);
  return rows;
}

export function isCampaignBossCompleted(progress, chapterId) {
  return Boolean(progress?.chapters?.[chapterId]?.bossCompleted);
}

export function saveCampaignSession(session) {
  if (!session) {
    localStorage.removeItem(CAMPAIGN_SESSION_STORAGE_KEY);
    return null;
  }
  const next = { ...session, version: 1, updatedAt: Date.now() };
  localStorage.setItem(CAMPAIGN_SESSION_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function loadCampaignSession() {
  try {
    const raw = JSON.parse(localStorage.getItem(CAMPAIGN_SESSION_STORAGE_KEY) || "null");
    return raw?.version === 1 ? raw : null;
  } catch {
    return null;
  }
}

export function clearCampaignSession() {
  localStorage.removeItem(CAMPAIGN_SESSION_STORAGE_KEY);
}
