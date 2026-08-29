/**
 * AI Task Breakdown Service
 *
 * Parses a task description and breaks it down into subtasks.
 * Uses a smart parser that detects duration hints and generates
 * reasonable breakdowns locally (no API key needed).
 *
 * To connect to Gemini API, set VITE_GEMINI_API_KEY in .env
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Local smart parser for task breakdown
 */
function localBreakdown(prompt) {
  // Extract total duration from prompt  e.g. "in 90 minutes", "60 min", "2 hours"
  let totalMinutes = 60; // default
  const durationMatch = prompt.match(
    /(?:in\s+)?(\d+)\s*(minutes?|mins?|hours?|hrs?|h|m)/i
  );
  if (durationMatch) {
    const val = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      totalMinutes = val * 60;
    } else {
      totalMinutes = val;
    }
  }

  // Extract the main topic by removing duration text
  let topic = prompt
    .replace(/(?:in\s+)?\d+\s*(minutes?|mins?|hours?|hrs?|h|m)/gi, '')
    .replace(/[:\-–—]/g, ' ')
    .trim();

  // Generate subtasks based on duration
  const templates = [
    { prefix: 'Warm-up', suffix: 'overview & key concepts', pct: 0.12 },
    { prefix: 'Deep dive', suffix: 'core material', pct: 0.30 },
    { prefix: 'Practice', suffix: 'hands-on exercises', pct: 0.25 },
    { prefix: 'Review', suffix: 'key takeaways', pct: 0.18 },
    { prefix: 'Wrap-up', suffix: 'notes & next steps', pct: 0.15 },
  ];

  // For short tasks (< 20 min), fewer subtasks
  let selectedTemplates = templates;
  if (totalMinutes < 20) {
    selectedTemplates = templates.slice(0, 3);
  } else if (totalMinutes < 40) {
    selectedTemplates = templates.slice(0, 4);
  }

  // Normalize percentages
  const totalPct = selectedTemplates.reduce((s, t) => s + t.pct, 0);
  const tasks = selectedTemplates.map((t) => {
    const duration = Math.max(1, Math.round((t.pct / totalPct) * totalMinutes));
    return {
      title: `${t.prefix}: ${topic} — ${t.suffix}`,
      duration,
    };
  });

  // Adjust to match total
  const currentTotal = tasks.reduce((s, t) => s + t.duration, 0);
  const diff = totalMinutes - currentTotal;
  if (diff !== 0) {
    // Add/subtract from the largest task
    const largest = tasks.reduce((a, b) => (a.duration > b.duration ? a : b));
    largest.duration = Math.max(1, largest.duration + diff);
  }

  return tasks;
}

/**
 * AI-powered breakdown using Gemini API
 */
async function geminiBreakdown(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a task breakdown expert. Given a task description, break it down into smaller subtasks with estimated durations in minutes.

Task: "${prompt}"

Return ONLY a valid JSON array of objects with "title" (string) and "duration" (number in minutes) fields. 
Keep durations realistic and make sure they add up to the total time mentioned.
If no total time is mentioned, estimate a reasonable total (30-90 minutes).
Return 3-7 subtasks maximum.

Example response:
[{"title": "Review prerequisites", "duration": 10}, {"title": "Read core concepts", "duration": 25}]`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    const tasks = JSON.parse(jsonMatch[0]);
    return tasks.map((t) => ({
      title: t.title,
      duration: Math.max(1, Math.round(t.duration)),
    }));
  }

  throw new Error('Could not parse AI response');
}

/**
 * Main breakdown function: uses Gemini if API key available, otherwise local parser
 */
export async function breakdownTask(prompt) {
  // Simulate a tiny delay for UX even with local parser
  await new Promise((r) => setTimeout(r, 800));

  if (GEMINI_API_KEY) {
    try {
      return await geminiBreakdown(prompt);
    } catch (err) {
      console.warn('Gemini API failed, falling back to local:', err);
      return localBreakdown(prompt);
    }
  }

  return localBreakdown(prompt);
}
