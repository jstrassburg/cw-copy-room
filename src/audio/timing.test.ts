import { applyTiming, getMorseTiming, totalDuration } from "./timing";
import { buildSemanticPlan } from "./morse";

describe("Morse timing", () => {
  it("uses standard spacing when speeds match", () => {
    const timing = getMorseTiming({ characterWpm: 18, effectiveWpm: 18 });
    expect(timing.characterUnit).toBeCloseTo(1.2 / 18, 8);
    expect(timing.spacingUnit).toBeCloseTo(timing.characterUnit, 8);
  });

  it("calculates the approved 18/12 Farnsworth defaults", () => {
    const timing = getMorseTiming({ characterWpm: 18, effectiveWpm: 12 });
    expect(timing.characterUnit * 1000).toBeCloseTo(66.6667, 3);
    expect(timing.spacingUnit * 3 * 1000).toBeCloseTo(463.1579, 3);
    expect(timing.spacingUnit * 7 * 1000).toBeCloseTo(1080.7018, 3);
  });

  it("makes PARIS plus its word gap match the effective speed", () => {
    const plan = buildSemanticPlan("PARIS ");
    // The parser omits a trailing gap, so append the standard seven-unit word gap.
    plan.push({ kind: "gap", units: 7, gapType: "word" });
    const duration = totalDuration(
      applyTiming(plan, { characterWpm: 18, effectiveWpm: 12 }),
    );
    expect(duration).toBeCloseTo(5, 8);
  });

  it("rejects an effective speed above character speed", () => {
    expect(() => getMorseTiming({ characterWpm: 12, effectiveWpm: 18 })).toThrow();
  });
});
