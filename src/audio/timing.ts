import type { SemanticEvent } from "./morse";

export interface TimingSettings {
  characterWpm: number;
  effectiveWpm: number;
}

export interface TimedEvent {
  kind: "tone" | "gap";
  duration: number;
}

export interface MorseTiming {
  characterUnit: number;
  spacingUnit: number;
}

export function getMorseTiming({ characterWpm, effectiveWpm }: TimingSettings): MorseTiming {
  if (characterWpm <= 0 || effectiveWpm <= 0) throw new Error("WPM must be positive");
  if (effectiveWpm > characterWpm) {
    throw new Error("Effective speed cannot exceed character speed");
  }

  const characterUnit = 1.2 / characterWpm;
  const spacingUnit =
    effectiveWpm === characterWpm
      ? characterUnit
      : (60 / effectiveWpm - 31 * characterUnit) / 19;

  return { characterUnit, spacingUnit };
}

export function applyTiming(
  events: SemanticEvent[],
  settings: TimingSettings,
): TimedEvent[] {
  const { characterUnit, spacingUnit } = getMorseTiming(settings);

  return events.map((event) => ({
    kind: event.kind,
    duration:
      event.kind === "tone" || event.gapType === "intra"
        ? event.units * characterUnit
        : event.units * spacingUnit,
  }));
}

export function totalDuration(events: TimedEvent[]): number {
  return events.reduce((sum, event) => sum + event.duration, 0);
}
