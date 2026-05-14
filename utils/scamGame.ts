import { ScamScenario } from '../config/scamScenarios';

/**
 * Score the player against a list of scenarios.
 *
 * Returns the count of correct answers and a 0-3 medal tier:
 *   - bronze: ≥50% correct
 *   - silver: ≥75% correct
 *   - gold:   100% correct
 *   - none:   below 50%
 */

export type Medal = 'none' | 'bronze' | 'silver' | 'gold';

export interface ScamGameResult {
  readonly total: number;
  readonly correct: number;
  readonly accuracy: number;
  readonly medal: Medal;
}

export function scoreGame(scenarios: readonly ScamScenario[], answers: ReadonlyArray<boolean>): ScamGameResult {
  const total = Math.min(scenarios.length, answers.length);
  let correct = 0;
  for (let i = 0; i < total; i++) {
    if (answers[i] === scenarios[i].isFake) correct++;
  }
  const accuracy = total === 0 ? 0 : correct / total;
  let medal: Medal = 'none';
  if (accuracy === 1) medal = 'gold';
  else if (accuracy >= 0.75) medal = 'silver';
  else if (accuracy >= 0.5) medal = 'bronze';
  return { total, correct, accuracy, medal };
}

/** Reward formula for a finished mini-game run. */
export function calcReward(result: ScamGameResult): { coins: number; xp: number; knowledgePoints: number } {
  const base = { coins: 10, xp: 5, knowledgePoints: 0 };
  switch (result.medal) {
    case 'gold':   return { coins: 80, xp: 30, knowledgePoints: 1 };
    case 'silver': return { coins: 50, xp: 20, knowledgePoints: 1 };
    case 'bronze': return { coins: 25, xp: 10, knowledgePoints: 0 };
    default:       return base;
  }
}
