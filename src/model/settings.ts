export interface AppSettings {
  characterWpm: number;
  effectiveWpm: number;
  frequency: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  characterWpm: 18,
  effectiveWpm: 12,
  frequency: 700,
};

export const SETTINGS_KEY = "cw-recognition.settings.v1";

function inRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function validateSettings(value: unknown): AppSettings {
  if (!value || typeof value !== "object") return DEFAULT_SETTINGS;
  const candidate = value as Partial<AppSettings>;
  if (
    !inRange(candidate.characterWpm, 5, 40) ||
    !inRange(candidate.effectiveWpm, 5, candidate.characterWpm) ||
    !inRange(candidate.frequency, 300, 1000)
  ) {
    return DEFAULT_SETTINGS;
  }
  return {
    characterWpm: Math.round(candidate.characterWpm),
    effectiveWpm: Math.round(candidate.effectiveWpm),
    frequency: Math.round(candidate.frequency / 10) * 10,
  };
}

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? validateSettings(JSON.parse(stored)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Settings remain usable in memory when storage is unavailable.
  }
}

export function normalizeAnswer(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

export function isAcceptedAnswer(value: string, acceptedAnswers: string[]): boolean {
  const normalized = normalizeAnswer(value).replace(/^<|>$/g, "");
  return acceptedAnswers.some(
    (answer) => normalizeAnswer(answer).replace(/^<|>$/g, "") === normalized,
  );
}
