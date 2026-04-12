export type PrismType = 'base' | 'neon' | 'master';
/** Bonus cattura da stato (naming legacy italiano) */
export type CatchAilmentBonus = 'paralisi' | 'sonno' | null;

const prismMultipliers: Record<PrismType, number> = {
  base: 1,
  neon: 1.5,
  master: 255,
};

export const calculateCatchRate = (
  maxHp: number,
  currentHp: number,
  baseRate: number,
  prismType: PrismType,
  statusCondition: CatchAilmentBonus = null
): number => {
  const prism = prismMultipliers[prismType];
  const statusBonus = statusCondition === 'paralisi' || statusCondition === 'sonno' ? 1.5 : 1;
  const safeMax = Math.max(1, maxHp);
  const hpTerm = (safeMax * 3 - currentHp * 2) / (safeMax * 3);
  const raw = baseRate * prism * statusBonus * hpTerm;
  return Math.min(255, Math.max(1, Math.floor(raw)));
};

export const performCatchAttempt = (
  maxHp: number,
  currentHp: number,
  baseRate: number,
  prismType: PrismType,
  statusCondition: CatchAilmentBonus = null
): { success: boolean; shakes: number } => {
  if (prismType === 'master') return { success: true, shakes: 3 };

  const rate = calculateCatchRate(maxHp, currentHp, baseRate, prismType, statusCondition);
  const shakeCheck = 65536 / Math.pow(255 / rate, 0.1875);

  let shakes = 0;
  for (let i = 0; i < 3; i++) {
    if (Math.random() * 65536 >= shakeCheck) break;
    shakes++;
  }

  return { success: shakes === 3, shakes };
};
