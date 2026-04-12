import { describe, it, expect } from 'vitest';
import type { NeoMon } from '../types';
import { ElementType } from '../types';
import { recalculateAllStats } from './StatsCalculator';
import { getMaxStamina } from './battleParty';
import { restAction, REST_RECOVERY_PERCENT } from './StaminaManager';
import movesData from '../data/moves.json';
import type { Move } from '../types';
import { BattleEngine } from './BattleEngine';

const allMoves: Move[] = (movesData as unknown as Move[][]).flat();

function baseMon(overrides: Partial<NeoMon> & Pick<NeoMon, 'id'>): NeoMon {
  const { id, ...rest } = overrides;
  return {
    id,
    name: 'T',
    types: [ElementType.Bio],
    baseStats: {
      hp: 55,
      stamina: 100,
      potenza: 45,
      resistenza: 50,
      sintonia: 60,
      spirito: 55,
      flusso: 45,
    },
    potential: 20,
    development: { hp: 0, potenza: 0, resistenza: 0, sintonia: 0, spirito: 0, flusso: 0 },
    level: 5,
    exp: 0,
    moves: ['m-pri-01'],
    friendship: 50,
    caughtAt: 0,
    ...rest,
  };
}

describe('Stamina massima 100 e riposo (design)', () => {
  it('recalculateAllStats imposta currentStats.stamina a 100', () => {
    const m = recalculateAllStats(baseMon({ id: 'x-1' }));
    expect(m.currentStats?.stamina).toBe(100);
  });

  it('getMaxStamina legge da currentStats (100) non dal template baseStats se presente', () => {
    const m = recalculateAllStats(baseMon({ id: 'x-2' }));
    expect(getMaxStamina(m)).toBe(100);
  });

  it('restAction non supera mai il massimo passato (es. 100)', () => {
    const max = 100;
    expect(restAction(100, max)).toBe(100);
    expect(restAction(99, max)).toBe(100);
    const half = max * REST_RECOVERY_PERCENT;
    expect(restAction(0, max)).toBe(half);
    expect(restAction(80, max)).toBe(100);
  });
});

describe('BattleEngine: riposo rispetta getMaxStamina', () => {
  it('dopo Riposo la stamina del giocatore non supera 100', () => {
    const raw = recalculateAllStats(baseMon({ id: 'x-3' }));
    const playerMon: NeoMon & { currentHp: number; currentStamina: number } = {
      ...raw,
      currentHp: raw.currentStats!.hp,
      currentStamina: 10,
      moves: ['m-pri-01'],
    };
    const aiMon: NeoMon & { currentHp: number; currentStamina: number } = {
      ...recalculateAllStats(baseMon({ id: 'x-4' })),
      currentHp: 100,
      currentStamina: 100,
      moves: ['m-pri-01'],
    };

    const playerAction = { type: 'rest' as const };
    const aiAction = { type: 'rest' as const };

    BattleEngine.executeTurn(playerMon as any, aiMon as any, playerAction, aiAction, allMoves);

    expect(playerMon.currentStamina).toBeLessThanOrEqual(100);
    expect(playerMon.currentStamina).toBeGreaterThanOrEqual(10);
  });
});
