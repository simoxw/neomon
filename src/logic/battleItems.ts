/**
 * Effetti oggetti curativi in battaglia (logica pura, testabile senza React).
 */

export type CurativeTarget = 'hp' | 'stamina' | 'both';

export function computeCurativeHeal(
  target: CurativeTarget,
  value: number,
  curHp: number,
  maxHp: number,
  curSt: number,
  maxSt: number
): { nextHp: number; nextSt: number } {
  if (target === 'both' || value >= 999) {
    return { nextHp: maxHp, nextSt: maxSt };
  }
  if (target === 'hp') {
    return { nextHp: Math.min(maxHp, Math.max(0, curHp + value)), nextSt: curSt };
  }
  if (target === 'stamina') {
    return { nextHp: curHp, nextSt: Math.min(maxSt, Math.max(0, curSt + value)) };
  }
  return { nextHp: curHp, nextSt: curSt };
}
