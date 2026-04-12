import type { NeoMon } from '../types';

export type EnemyRarity = 'common' | 'rare';

export interface BattleRewardCalcInput {
  enemy: Pick<NeoMon, 'level' | 'id' | 'types'>;
  isTrainer: boolean;
  rarity?: EnemyRarity;
  /** itemId se il nemico ha un drop dedicato (estensione futura) */
  dropItem?: string | null;
}

export interface CalculatedBattleRewards {
  xpGained: number;
  coinsGained: number;
  itemDrop: string | null;
}

/**
 * Ricompense post-battaglia (PROMPT 18) — XP/monete scalate; drop materiali.
 */
export function calculateRewards(input: BattleRewardCalcInput): CalculatedBattleRewards {
  const { enemy, isTrainer, rarity = 'common', dropItem } = input;
  const L = Math.max(1, enemy.level);

  const baseXP = L * 50;
  const trainerBonus = isTrainer ? 1.5 : 1;
  const xpGained = Math.max(1, Math.floor(baseXP * trainerBonus));

  const baseCoins = L * 10 + Math.floor(Math.random() * 20);
  const coinsGained = Math.max(1, Math.floor(baseCoins * (isTrainer ? 2 : 1)));

  const dropChance = rarity === 'rare' ? 0.1 : 0.2;
  const itemDrop = dropItem && Math.random() < dropChance ? dropItem : null;

  return { xpGained, coinsGained, itemDrop };
}

/** Drop casuali da tipi nemico (materiali crafting) */
export function rollMaterialDropFromTypes(types: string[]): string | null {
  const t = types.map((x) => String(x));
  const roll = Math.random();
  if (t.some((x) => x === 'Fulgido' || x === 'Meccanico')) {
    if (roll < 0.2) return 'i-mat-neon';
  }
  if (t.some((x) => x === 'Bio')) {
    if (roll < 0.2) return 'i-mat-pollen';
  }
  if (t.some((x) => x === 'Etereo' || x === 'Prismatico')) {
    if (roll < 0.1) return 'i-mat-ether';
  }
  return null;
}
