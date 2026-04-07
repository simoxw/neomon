import { ElementType, NeoMon, Move } from '../types';

/**
 * Neo-Mon Link: Damage Engine & Type Chart Logic
 * @version 0.1.1
 */

type EffectivenessMap = Partial<Record<ElementType, number>>;

/**
 * Matrice delle efficacie basata sulla tabella tecnica fornita.
 */
export const TYPE_CHART: Record<ElementType, EffectivenessMap> = {
  [ElementType.Incandescente]: { [ElementType.Bio]: 2, [ElementType.Criogenico]: 2, [ElementType.Meccanico]: 2, [ElementType.Idrico]: 0.5, [ElementType.Geologico]: 0.5, [ElementType.Incandescente]: 0.5 },
  [ElementType.Idrico]: { [ElementType.Incandescente]: 2, [ElementType.Geologico]: 2, [ElementType.Bio]: 0.5, [ElementType.Fulgido]: 0.5, [ElementType.Idrico]: 0.5 },
  [ElementType.Bio]: { [ElementType.Idrico]: 2, [ElementType.Geologico]: 2, [ElementType.Fulgido]: 2, [ElementType.Incandescente]: 0.5, [ElementType.Aereo]: 0.5, [ElementType.Meccanico]: 0.5, [ElementType.Bio]: 0.5 },
  [ElementType.Fulgido]: { [ElementType.Tetro]: 2, [ElementType.Idrico]: 2, [ElementType.Aereo]: 2, [ElementType.Bio]: 0.5, [ElementType.Etereo]: 0.5, [ElementType.Fulgido]: 0.5 },
  [ElementType.Tetro]: { [ElementType.Etereo]: 2, [ElementType.Fulgido]: 2, [ElementType.Cinetico]: 0.5, [ElementType.Meccanico]: 0.5, [ElementType.Tetro]: 0.5 },
  [ElementType.Meccanico]: { [ElementType.Etereo]: 2, [ElementType.Criogenico]: 2, [ElementType.Bio]: 2, [ElementType.Incandescente]: 0.5, [ElementType.Idrico]: 0.5, [ElementType.Meccanico]: 0.5 },
  [ElementType.Etereo]: { [ElementType.Cinetico]: 2, [ElementType.Tetro]: 2, [ElementType.Meccanico]: 0.5, [ElementType.Etereo]: 0.5 },
  [ElementType.Cinetico]: { [ElementType.Meccanico]: 2, [ElementType.Geologico]: 2, [ElementType.Criogenico]: 2, [ElementType.Etereo]: 0.5, [ElementType.Aereo]: 0.5, [ElementType.Tetro]: 0.5, [ElementType.Cinetico]: 0.5 },
  [ElementType.Geologico]: { [ElementType.Incandescente]: 2, [ElementType.Fulgido]: 2, [ElementType.Meccanico]: 2, [ElementType.Idrico]: 0.5, [ElementType.Bio]: 0.5, [ElementType.Aereo]: 0.5, [ElementType.Geologico]: 0.5 },
  [ElementType.Aereo]: { [ElementType.Bio]: 2, [ElementType.Cinetico]: 2, [ElementType.Meccanico]: 0.5, [ElementType.Fulgido]: 0.5, [ElementType.Geologico]: 0.5, [ElementType.Aereo]: 0.5 },
  [ElementType.Criogenico]: { [ElementType.Bio]: 2, [ElementType.Geologico]: 2, [ElementType.Aereo]: 2, [ElementType.Incandescente]: 0.5, [ElementType.Idrico]: 0.5, [ElementType.Meccanico]: 0.5, [ElementType.Criogenico]: 0.5 },
  [ElementType.Prismatico]: {}, // Neutro puro contro tutti
};

/**
 * Calcola il moltiplicatore di efficacia totale contro uno o più tipi del difensore.
 */
export const getEffectiveness = (attackType: ElementType, defenderTypes: ElementType[]): number => {
  return defenderTypes.reduce((total, defType) => {
    const multiplier = TYPE_CHART[attackType]?.[defType] ?? 1;
    return total * multiplier;
  }, 1);
};

/**
 * Calcola il danno finale inflitto basandosi sulla formula tecnica Neo-Mon standard.
 */
export const calculateDamage = (attacker: NeoMon, defender: NeoMon, move: Move): number => {
  // 1. Determina Atk e Def in base alla categoria della mossa
  const isPhysical = move.category === 'Physical';
  const atk = isPhysical ? attacker.baseStats.potenza : attacker.baseStats.sintonia;
  const def = isPhysical ? defender.baseStats.resistenza : defender.baseStats.spirito;

  // 2. Bonus STAB (Same Type Attack Bonus): x1.25
  const stab = attacker.types.includes(move.type) ? 1.25 : 1;

  // 3. Efficacia Elementale
  const effectiveness = getEffectiveness(move.type, defender.types);

  // 4. Variazione Casuale [0.85, 1.0]
  const randomFactor = Math.random() * (1 - 0.85) + 0.85;

  // 5. Applicazione Formula: Damage = ((((2 * Level / 5 + 2) * Power * (Atk / Def) / 50) + 2) * STAB * Effectiveness * Random)
  const baseDamage = (((2 * attacker.level / 5 + 2) * move.power * (atk / def) / 50) + 2);
  const finalDamage = baseDamage * stab * effectiveness * randomFactor;

  return Math.floor(finalDamage);
};

/**
 * Verifica se la creatura ha abbastanza stamina per eseguire l'azione specifica.
 */
export const checkStamina = (currentStamina: number, moveCost: number): boolean => {
  return currentStamina >= moveCost;
};
