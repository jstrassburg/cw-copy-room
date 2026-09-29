import type { PracticeMode } from "../model/content";

export interface SessionState {
  mode: PracticeMode;
  queue: string[];
  index: number;
  attempts: number;
  correct: number;
  missed: string[];
  isRetry: boolean;
}

export type SessionAction =
  | { type: "GRADE"; itemId: string; correct: boolean }
  | { type: "NEXT" }
  | { type: "RESET"; mode: PracticeMode; itemIds: string[] }
  | { type: "NEW_ROUND"; itemIds: string[] }
  | { type: "RETRY_MISSED" };

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createSession(mode: PracticeMode, itemIds: string[]): SessionState {
  return {
    mode,
    queue: shuffle(itemIds),
    index: 0,
    attempts: 0,
    correct: 0,
    missed: [],
    isRetry: false,
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "GRADE": {
      const missed = new Set(state.missed);
      if (action.correct && state.isRetry) missed.delete(action.itemId);
      if (!action.correct) missed.add(action.itemId);
      return {
        ...state,
        attempts: state.attempts + 1,
        correct: state.correct + (action.correct ? 1 : 0),
        missed: [...missed],
      };
    }
    case "NEXT":
      return { ...state, index: state.index + 1 };
    case "RESET":
      return createSession(action.mode, action.itemIds);
    case "NEW_ROUND":
      return {
        ...state,
        queue: shuffle(action.itemIds),
        index: 0,
        isRetry: false,
      };
    case "RETRY_MISSED":
      return {
        ...state,
        queue: shuffle(state.missed),
        index: 0,
        isRetry: true,
      };
    default:
      return state;
  }
}
