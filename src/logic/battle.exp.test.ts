import { describe, it, expect } from 'vitest';
import {
  expRequiredForLevel,
  defeatedPokemonBaseYield,
  experienceForDefeating,
  expGainFromBattle,
} from './expFormula';
import { calculateStat, calculateHP, recalculateAllStats } from './StatsCalculator';
import type { NeoMon } from '../types';
import { ElementType } from '../types';

describe('EXP (stile Pokémon)', () => {
  it('expRequiredForLevel usa curva L³', () => {
    expect(expRequiredForLevel(5)).toBe(125);
    expect(expRequiredForLevel(1)).toBe(1);
    expect(expRequiredForLevel(10)).toBe(1000);
  });

  it('experienceForDefeating cresce con livello e yield', () => {
    const a = experienceForDefeating(5, 55);
    const b = experienceForDefeating(8, 55);
    expect(b).toBeGreaterThan(a);
    expect(a).toBeGreaterThanOrEqual(1);
  });

  it('expGainFromBattle per Floris n-001', () => {
    const g = expGainFromBattle({ id: 'n-001', level: 5 });
    expect(g).toBeGreaterThanOrEqual(1);
    expect(g).toBeLessThan(500);
  });

  it('defeatedPokemonBaseYield è nel range atteso', () => {
    const y = defeatedPokemonBaseYield('n-001');
    expect(y).toBeGreaterThanOrEqual(36);
    expect(y).toBeLessThanOrEqual(90);
  });
});

describe('Statistiche dopo level-up (IV + livello)', () => {
  it('recalculateAllStats aumenta HP con il livello', () => {
    const base: NeoMon = {
      id: 'n-001',
      name: 'Test',
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
      potential: 25,
      development: { hp: 0, potenza: 0, resistenza: 0, sintonia: 0, spirito: 0, flusso: 0 },
      level: 5,
      exp: 0,
      moves: ['m-bio-01'],
      friendship: 50,
    };
    const at10 = recalculateAllStats({ ...base, level: 10 });
    const at5 = recalculateAllStats({ ...base, level: 5 });
    expect((at10.currentStats?.hp ?? 0) >= (at5.currentStats?.hp ?? 0)).toBe(true);
  });

  it('calculateStat risponde a IV e livello', () => {
    const low = calculateStat(50, 20, 0);
    const high = calculateStat(50, 20, 31);
    expect(high).toBeGreaterThanOrEqual(low);
    expect(calculateHP(55, 5, 25)).toBeGreaterThan(0);
  });

  it('recalculateAllStats: stamina massima del pool energia è sempre 100', () => {
    const base: NeoMon = {
      id: 'n-001',
      name: 'Test',
      types: [ElementType.Bio],
      baseStats: {
        hp: 55,
        stamina: 30,
        potenza: 45,
        resistenza: 50,
        sintonia: 60,
        spirito: 55,
        flusso: 45,
      },
      potential: 25,
      development: { hp: 0, potenza: 0, resistenza: 0, sintonia: 0, spirito: 0, flusso: 0 },
      level: 5,
      exp: 0,
      moves: ['m-bio-01'],
      friendship: 50,
    };
    const r = recalculateAllStats(base);
    expect(r.currentStats?.stamina).toBe(100);
  });
});
