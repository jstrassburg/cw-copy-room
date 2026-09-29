import { buildSemanticPlan } from "../audio/morse";
import { itemsByMode, validateContent } from "./content";

describe("practice content", () => {
  it("has valid, unique content records", () => {
    expect(validateContent()).toEqual([]);
  });

  it("can synthesize every practice item", () => {
    for (const items of Object.values(itemsByMode)) {
      for (const item of items) {
        expect(() => buildSemanticPlan(item.cw, item.pattern), item.id).not.toThrow();
      }
    }
  });

  it("includes all three useful practice pools", () => {
    expect(itemsByMode.characters.length).toBeGreaterThanOrEqual(40);
    expect(itemsByMode.terms.length).toBeGreaterThanOrEqual(60);
    expect(itemsByMode.exchanges.length).toBeGreaterThanOrEqual(35);
  });

  it("marks every multi-letter prosign for continuous sending", () => {
    const prosigns = itemsByMode.terms.filter((item) => item.category === "prosign");
    for (const item of prosigns) {
      if (item.display.replace(/[<>]/g, "").length > 1) {
        expect(item.cw, item.id).toMatch(/^<[^>]+>$/);
      }
    }
    for (const item of itemsByMode.exchanges) {
      expect(item.cw, item.id).not.toMatch(/(?:^|\s)BK(?:\s|$)/);
    }
  });
});
