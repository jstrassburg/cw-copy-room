import { createSession, sessionReducer } from "./sessionReducer";

describe("session reducer", () => {
  it("tracks attempts and unique missed items", () => {
    let state = createSession("terms", ["cq", "qth"]);
    state = sessionReducer(state, { type: "GRADE", itemId: "cq", correct: false });
    state = sessionReducer(state, { type: "GRADE", itemId: "cq", correct: false });
    expect(state.attempts).toBe(2);
    expect(state.correct).toBe(0);
    expect(state.missed).toEqual(["cq"]);
  });

  it("clears an item after a correct retry without erasing history", () => {
    let state = createSession("terms", ["cq"]);
    state = sessionReducer(state, { type: "GRADE", itemId: "cq", correct: false });
    state = sessionReducer(state, { type: "RETRY_MISSED" });
    state = sessionReducer(state, { type: "GRADE", itemId: "cq", correct: true });
    expect(state.missed).toEqual([]);
    expect(state.attempts).toBe(2);
    expect(state.correct).toBe(1);
  });

  it("resets all learning state for a new mode", () => {
    const attempted = sessionReducer(createSession("characters", ["a"]), {
      type: "GRADE",
      itemId: "a",
      correct: false,
    });
    const reset = sessionReducer(attempted, {
      type: "RESET",
      mode: "exchanges",
      itemIds: ["exchange-1"],
    });
    expect(reset).toMatchObject({ mode: "exchanges", attempts: 0, correct: 0, missed: [] });
  });
});
