/**
 * LocalStorage persistence helpers for Brick app
 */

const BRICKS_KEY = 'brick_tasks';
const HISTORY_KEY = 'brick_history';

export function loadBricks() {
  try {
    const data = localStorage.getItem(BRICKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveBricks(bricks) {
  localStorage.setItem(BRICKS_KEY, JSON.stringify(bricks));
}

export function loadHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // Filter out duplicates (same brick ID and completedAt timestamp within 2s)
    const unique = [];
    for (const item of parsed) {
      const isDup = unique.some(
        (u) =>
          u.id === item.id &&
          Math.abs((u.completedAt || 0) - (item.completedAt || 0)) < 2000
      );
      if (!isDup) {
        unique.push(item);
      }
    }
    return unique;
  } catch {
    return [];
  }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
