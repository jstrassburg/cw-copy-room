import { buildSemanticPlan, tokenizeMorse } from "./morse";

describe("Morse parsing", () => {
  it("uses character and word gaps", () => {
    const plan = buildSemanticPlan("ET E");
    const gaps = plan.filter((event) => event.kind === "gap");
    expect(gaps).toEqual([
      { kind: "gap", units: 3, gapType: "character" },
      { kind: "gap", units: 7, gapType: "word" },
    ]);
  });

  it("sends a prosign as one continuous character", () => {
    const plan = buildSemanticPlan("<SK>");
    expect(plan.filter((event) => event.kind === "tone")).toHaveLength(6);
    expect(plan.filter((event) => event.kind === "gap")).toEqual(
      Array(5).fill({ kind: "gap", units: 1, gapType: "intra" }),
    );
  });

  it("sends BK without a gap between B and K", () => {
    const plan = buildSemanticPlan("<BK>");
    expect(plan.filter((event) => event.kind === "tone")).toHaveLength(7);
    expect(plan.filter((event) => event.kind === "gap" && event.gapType !== "intra")).toEqual([]);
    expect(plan.filter((event) => event.kind === "gap")).toHaveLength(6);
  });

  it("supports the punctuation used in exchanges", () => {
    expect(() => tokenizeMorse("QTH? KD9DIH/QRP = 73")).not.toThrow();
  });

  it("reports unsupported characters", () => {
    expect(() => tokenizeMorse("HELLO!")).toThrow(/Unsupported CW character/);
  });
});
