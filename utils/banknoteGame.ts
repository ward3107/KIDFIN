import { Banknote, SecurityFeature } from '../config/banknotes';

/** Step 1: build a deterministic-on-input list of figure-to-bill matching items. */
export interface MatchItem {
  readonly figure: string;
  readonly correctValue: Banknote['value'];
}

export function buildMatchItems(notes: readonly Banknote[]): MatchItem[] {
  return notes.map(n => ({ figure: n.figure, correctValue: n.value }));
}

/**
 * Step 2: score the kid's pairing attempt. The input is a Map<figure, chosen value>.
 * Returns count of correct pairings.
 */
export function scoreMatching(items: readonly MatchItem[], picks: ReadonlyMap<string, number>): {
  correct: number;
  total: number;
} {
  let correct = 0;
  for (const it of items) {
    if (picks.get(it.figure) === it.correctValue) correct++;
  }
  return { correct, total: items.length };
}

/**
 * Step 3: score the security-features quiz.
 */
export function scoreFeatureQuiz(
  features: readonly SecurityFeature[],
  answers: ReadonlyArray<number>
): { correct: number; total: number } {
  let correct = 0;
  const total = Math.min(features.length, answers.length);
  for (let i = 0; i < total; i++) {
    if (answers[i] === features[i].correctIndex) correct++;
  }
  return { correct, total: features.length };
}

/**
 * Total reward for the combined game.
 */
export function calcBanknoteReward(matchScore: { correct: number; total: number }, quizScore: { correct: number; total: number }): {
  coins: number;
  xp: number;
  knowledgePoints: number;
} {
  const totalCorrect = matchScore.correct + quizScore.correct;
  const totalPossible = matchScore.total + quizScore.total;
  const ratio = totalPossible === 0 ? 0 : totalCorrect / totalPossible;
  if (ratio === 1) return { coins: 70, xp: 25, knowledgePoints: 1 };
  if (ratio >= 0.75) return { coins: 45, xp: 15, knowledgePoints: 1 };
  if (ratio >= 0.5) return { coins: 25, xp: 10, knowledgePoints: 0 };
  return { coins: 10, xp: 5, knowledgePoints: 0 };
}
