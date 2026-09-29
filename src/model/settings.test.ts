import { isAcceptedAnswer, normalizeAnswer, validateSettings } from "./settings";

describe("settings and answers", () => {
  it("normalizes case and whitespace", () => {
    expect(normalizeAnswer("  qth  ")).toBe("QTH");
  });

  it("accepts friendly prosign notation", () => {
    expect(isAcceptedAnswer("kn", ["<KN>"])).toBe(true);
    expect(isAcceptedAnswer("<KN>", ["KN"])).toBe(true);
  });

  it("rejects an effective speed above character speed", () => {
    expect(validateSettings({ characterWpm: 12, effectiveWpm: 18, frequency: 700 })).toEqual({
      characterWpm: 18,
      effectiveWpm: 12,
      frequency: 700,
    });
  });
});
