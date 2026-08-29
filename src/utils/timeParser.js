/**
 * Smart time parser for manual task input
 * Extracts task duration in minutes and cleans the title string.
 * Supports formats like:
 * - "45min", "45 mins", "45 minutes", "45m"
 * - "1.5 hr", "1.5 hours", "2hrs", "1h", "0.5 hour"
 * - "1h 30m", "1 hr 30 mins", "2 hours 15 minutes"
 * - "for 45 mins", "in 1.5 hr"
 */

export function parseTaskInput(text) {
  if (!text || typeof text !== 'string') {
    return { title: text || '', duration: 0, rawMatched: null };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { title: '', duration: 0, rawMatched: null };
  }

  // 1. Combination of hours and minutes: e.g. "1h 30m", "1 hr 30 mins", "2 hours 15 minutes", "for 1h 30m"
  const comboRegex = /\b(?:(for|in|about)\s+)?(\d+(?:\.\d+)?)\s*(?:hrs?|hours?|h)\s*(?:and\s+)?(\d+)\s*(?:mins?|minutes?|m)\b/i;
  let match = trimmed.match(comboRegex);

  if (match) {
    const hours = parseFloat(match[2]);
    const mins = parseInt(match[3], 10);
    const duration = Math.round(hours * 60 + mins);
    const cleanedTitle = cleanTitle(trimmed, match[0]);
    return {
      title: cleanedTitle || trimmed,
      duration,
      rawMatched: match[0],
    };
  }

  // 2. Hours only (including decimals): e.g. "1.5 hr", "2 hours", "1h", "for 2 hrs"
  const hoursRegex = /\b(?:(for|in|about)\s+)?(\d+(?:\.\d+)?)\s*(?:hrs?|hours?|h)\b/i;
  match = trimmed.match(hoursRegex);

  if (match) {
    const hours = parseFloat(match[2]);
    const duration = Math.round(hours * 60);
    const cleanedTitle = cleanTitle(trimmed, match[0]);
    return {
      title: cleanedTitle || trimmed,
      duration,
      rawMatched: match[0],
    };
  }

  // 3. Minutes only: e.g. "45min", "45 mins", "30 minutes", "15m", "for 30 mins"
  const minsRegex = /\b(?:(for|in|about)\s+)?(\d+)\s*(?:mins?|minutes?|m)\b/i;
  match = trimmed.match(minsRegex);

  if (match) {
    const mins = parseInt(match[2], 10);
    const cleanedTitle = cleanTitle(trimmed, match[0]);
    return {
      title: cleanedTitle || trimmed,
      duration: mins,
      rawMatched: match[0],
    };
  }

  return {
    title: trimmed,
    duration: 0,
    rawMatched: null,
  };
}

function cleanTitle(fullText, matchStr) {
  // Remove matched time string and clean up double spaces/trailing prepositions
  let result = fullText.replace(matchStr, ' ');
  // Clean up orphan prepositions if any left over
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

export function formatParsedDuration(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
