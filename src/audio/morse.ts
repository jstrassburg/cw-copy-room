export const MORSE_PATTERNS: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  "?": "..--..",
  "/": "-..-.",
  ".": ".-.-.-",
  ",": "--..--",
  "=": "-...-",
};

export const PROSIGN_PATTERNS: Record<string, string> = {
  AR: ".-.-.",
  BK: "-...-.-",
  BT: "-...-",
  KN: "-.--.",
  SK: "...-.-",
};

export type GapType = "intra" | "character" | "word";

export type SemanticEvent =
  | { kind: "tone"; units: number }
  | { kind: "gap"; units: number; gapType: GapType };

interface MorseToken {
  value: string;
  pattern: string;
  wordBreakBefore: boolean;
}

export function tokenizeMorse(text: string): MorseToken[] {
  const source = text.toUpperCase();
  const tokens: MorseToken[] = [];
  let index = 0;
  let sawWhitespace = false;

  while (index < source.length) {
    const character = source[index];
    if (/\s/.test(character)) {
      sawWhitespace = true;
      index += 1;
      continue;
    }

    if (character === "<") {
      const closeIndex = source.indexOf(">", index + 1);
      if (closeIndex === -1) throw new Error(`Unclosed prosign at position ${index}`);
      const value = source.slice(index + 1, closeIndex);
      const pattern = PROSIGN_PATTERNS[value];
      if (!pattern) throw new Error(`Unsupported prosign <${value}>`);
      tokens.push({ value: `<${value}>`, pattern, wordBreakBefore: sawWhitespace });
      sawWhitespace = false;
      index = closeIndex + 1;
      continue;
    }

    const pattern = MORSE_PATTERNS[character];
    if (!pattern) throw new Error(`Unsupported CW character "${character}" at position ${index}`);
    tokens.push({ value: character, pattern, wordBreakBefore: sawWhitespace });
    sawWhitespace = false;
    index += 1;
  }

  return tokens;
}

export function buildSemanticPlan(text: string, explicitPattern?: string): SemanticEvent[] {
  const tokens = explicitPattern
    ? [{ value: text, pattern: explicitPattern, wordBreakBefore: false }]
    : tokenizeMorse(text);
  const events: SemanticEvent[] = [];

  tokens.forEach((token, tokenIndex) => {
    if (tokenIndex > 0) {
      events.push({
        kind: "gap",
        units: token.wordBreakBefore ? 7 : 3,
        gapType: token.wordBreakBefore ? "word" : "character",
      });
    }

    [...token.pattern].forEach((element, elementIndex) => {
      events.push({ kind: "tone", units: element === "." ? 1 : 3 });
      if (elementIndex < token.pattern.length - 1) {
        events.push({ kind: "gap", units: 1, gapType: "intra" });
      }
    });
  });

  return events;
}
