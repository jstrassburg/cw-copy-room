import charactersData from "../data/characters.json";
import exchangesData from "../data/exchanges.json";
import termsData from "../data/terms.json";

export type PracticeMode = "characters" | "terms" | "exchanges";

export interface CharacterContent {
  id: string;
  display: string;
  pattern: string;
  kind: "letter" | "digit" | "punctuation" | "prosign";
  meaning?: string;
  acceptedAnswers: string[];
}

export interface TermContent {
  id: string;
  display: string;
  cw: string;
  category: string[];
  meaning: string;
  acceptedAnswers: string[];
}

export interface ExchangeTransmission {
  id: string;
  cw: string;
  translation: string;
}

export interface ExchangeScenario {
  id: string;
  title: string;
  tags: string[];
  transmissions: ExchangeTransmission[];
}

export interface PracticeItem {
  id: string;
  mode: PracticeMode;
  display: string;
  cw: string;
  acceptedAnswers: string[];
  meaning?: string;
  pattern?: string;
  category?: string;
  scenarioTitle?: string;
  scenarioPosition?: number;
  scenarioLength?: number;
}

export const characters = charactersData as CharacterContent[];
export const terms = termsData as TermContent[];
export const exchangeScenarios = exchangesData as ExchangeScenario[];

export const characterItems: PracticeItem[] = characters.map((item) => ({
  id: item.id,
  mode: "characters",
  display: item.display,
  cw: item.display,
  pattern: item.pattern,
  acceptedAnswers: item.acceptedAnswers,
  meaning: item.meaning,
  category: item.kind,
}));

export const termItems: PracticeItem[] = terms.map((item) => ({
  id: item.id,
  mode: "terms",
  display: item.display,
  cw: item.cw,
  acceptedAnswers: item.acceptedAnswers,
  meaning: item.meaning,
  category: item.category.join(" · "),
}));

export const exchangeItems: PracticeItem[] = exchangeScenarios.flatMap((scenario) =>
  scenario.transmissions.map((item, index) => ({
    id: item.id,
    mode: "exchanges" as const,
    display: item.cw,
    cw: item.cw,
    acceptedAnswers: [],
    meaning: item.translation,
    category: scenario.tags.join(" · "),
    scenarioTitle: scenario.title,
    scenarioPosition: index + 1,
    scenarioLength: scenario.transmissions.length,
  })),
);

export const itemsByMode: Record<PracticeMode, PracticeItem[]> = {
  characters: characterItems,
  terms: termItems,
  exchanges: exchangeItems,
};

export function validateContent(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const item of [...characterItems, ...termItems, ...exchangeItems]) {
    if (ids.has(item.id)) errors.push(`Duplicate content id: ${item.id}`);
    ids.add(item.id);
    if (!item.cw.trim()) errors.push(`${item.id}: CW text is empty`);
    if (item.mode !== "exchanges" && item.acceptedAnswers.length === 0) {
      errors.push(`${item.id}: no accepted answer`);
    }
  }

  return errors;
}
