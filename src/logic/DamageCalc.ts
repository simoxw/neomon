import { ElementType, NeoMon, Move } from '../types';
import { getStageMultiplier } from './statStages';
import { isPhysicalCategory, isSpecialCategory } from './moveEffectHelpers';

type EffectivenessMap = Partial<Record<ElementType, number>>;

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
  [ElementType.Prismatico]: {},
};

export const getEffectiveness = (attackType: ElementType, defenderTypes: ElementType[]): number => {
  return defenderTypes.reduce((total, defType) => {
    const multiplier = TYPE_CHART[attackType]?.[defType] ?? 1;
    return total * multiplier;
  }, 1);
};

export const calculateDamage = (attacker: NeoMon, defender: NeoMon, move: Move): number => {
  if (!move.power || move.power <= 0) return 0;

  const physical = isPhysicalCategory(move.category);
  let atk = physical
    ? attacker.baseStats.potenza * getStageMultiplier(attacker.statStages?.attack ?? 0)
    : attacker.baseStats.sintonia * getStageMultiplier(attacker.statStages?.specialAtk ?? 0);
  if (attacker.status === 'burn' && physical) atk *= 0.75;
  const def = physical
    ? defender.baseStats.resistenza * getStageMultiplier(defender.statStages?.defense ?? 0)
    : defender.baseStats.spirito * getStageMultiplier(defender.statStages?.specialDef ?? 0);

  const stab = attacker.types.includes(move.type) ? 1.25 : 1;
  const effectiveness = getEffectiveness(move.type, defender.types);
  const randomFactor = Math.random() * (1 - 0.85) + 0.85;
  const baseDamage = (((2 * attacker.level) / 5 + 2) * move.power * (atk / Math.max(1, def)) / 50) + 2;
  return Math.floor(baseDamage * stab * effectiveness * randomFactor);
};

export const calculateFlatNeutralDamage = (attacker: NeoMon, defender: NeoMon, power: number): number => {
  const atk = attacker.baseStats.potenza * getStageMultiplier(attacker.statStages?.attack ?? 0);
  const def = defender.baseStats.resistenza * getStageMultiplier(defender.statStages?.defense ?? 0);
  const baseDamage = (((2 * attacker.level) / 5 + 2) * power * (atk / Math.max(1, def)) / 50) + 2;
  return Math.max(1, Math.floor(baseDamage * (0.85 + Math.random() * 0.15)));
};

export const checkStamina = (currentStamina: number, moveCost: number): boolean => {
  return currentStamina >= moveCost;
};
