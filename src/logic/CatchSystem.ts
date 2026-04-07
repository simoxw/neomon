export type PrismType = 'base' | 'neon' | 'master';
export type StatusCondition = 'paralisi' | 'sonno' | null;

/**
 * Calcola la probabilità di successo della sincronizzazione (cattura).
 * Formula ispirata ai classici RPG di mostri, ottimizzata per il Nexus.
 */
export const calculateCatchChance = (
  maxHp: number,
  currentHp: number,
  prismType: PrismType,
  statusCondition: StatusCondition = null
): number => {
  // Moltiplicatori Prismi
  const prismMultipliers: Record<PrismType, number> = {
    base: 1,
    neon: 1.5,
    master: 255 // Cattura garantita
  };

  // Bonus Stato
  const statusBonus = (statusCondition === 'paralisi' || statusCondition === 'sonno') ? 1.5 : 1;

  // Formula Core: Chance = ((3 * maxHp - 2 * currentHp) * prismMultiplier * statusBonus) / (3 * maxHp)
  // Nota: Moltiplichiamo per 255 per standardizzare il valore (0-255)
  const baseChance = ((3 * maxHp - 2 * currentHp) * prismMultipliers[prismType] * statusBonus) / (3 * maxHp);
  
  return Math.min(Math.max(baseChance, 0), 255);
};

/**
 * Esegue il tentativo di cattura e calcola il numero di scosse (shake).
 * Utile per l'animazione di suspense.
 */
export const performCatchAttempt = (
  maxHp: number,
  currentHp: number,
  prismType: PrismType,
  statusCondition: StatusCondition = null
): { success: boolean; shakes: number } => {
  // Il Prisma Master non fallisce mai
  if (prismType === 'master') return { success: true, shakes: 3 };

  const catchValue = calculateCatchChance(maxHp, currentHp, prismType, statusCondition);
  
  // Per ogni scossa (max 3), il sistema verifica se il Prisma tiene.
  // Se tutti i controlli passano, la cattura è riuscita.
  let shakes = 0;
  for (let i = 0; i < 3; i++) {
    // Generiamo un seed casuale per ogni scossa
    const roll = Math.random() * 255;
    if (roll < catchValue) {
      shakes++;
    } else {
      break;
    }
  }

  return {
    success: shakes === 3,
    shakes
  };
};
