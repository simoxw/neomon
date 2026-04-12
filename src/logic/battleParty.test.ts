import { describe, it, expect } from 'vitest';
import type { NeoMon } from '../types';
import { ElementType } from '../types';
import {
  initPartySlotsFromTeam,
  findFirstAliveSlotIndex,
  writeSlotFromBattle,
  getMaxHp,
  getMaxStamina,
} from './battleParty';
import { recalculateAllStats } from './StatsCalculator';

function mockMon(overrides: Partial<NeoMon> & { id: string }): NeoMon {
  const { id, ...rest } = overrides;
  const base: NeoMon = {
    id,
    name: 'Test',
    types: [ElementType.Bio],
    baseStats: { hp: 40, stamina: 30, potenza: 10, resistenza: 10, sintonia: 10, spirito: 10, flusso: 10 },
    potential: 20,
    development: { hp: 0, potenza: 0, resistenza: 0, sintonia: 0, spirito: 0, flusso: 0 },
    level: 5,
    exp: 0,
    moves: ['m-pri-01'],
    friendship: 50,
    caughtAt: 0,
    ...rest,
  };
  return base;
}

describe('battleParty', () => {
  it('initPartySlotsFromTeam usa HP/SP massimi se non persistiti', () => {
    const a = mockMon({ id: 'mon-a', currentStats: { hp: 50, stamina: 35, potenza: 12, resistenza: 12, sintonia: 10, spirito: 10, flusso: 10 } });
    const b = mockMon({ id: 'mon-b' });
    const slots = initPartySlotsFromTeam([a, b]);
    expect(slots).toHaveLength(2);
    expect(slots[0].currentHp).toBe(50);
    expect(slots[0].currentStamina).toBe(35);
    expect(slots[1].currentHp).toBe(getMaxHp(b));
    expect(slots[1].currentStamina).toBe(getMaxStamina(b));
  });

  it('initPartySlotsFromTeam rispetta currentHp/currentStamina persistiti', () => {
    const a = mockMon({
      id: 'mon-a',
      currentStats: { hp: 50, stamina: 35, potenza: 12, resistenza: 12, sintonia: 10, spirito: 10, flusso: 10 },
    });
    const ext = { ...a, currentHp: 12, currentStamina: 10 } as NeoMon & { currentHp: number; currentStamina: number };
    const slots = initPartySlotsFromTeam([ext]);
    expect(slots[0].currentHp).toBe(12);
    expect(slots[0].currentStamina).toBe(10);
  });

  it('findFirstAliveSlotIndex trova il primo slot con HP > 0', () => {
    const team = [mockMon({ id: 'a' }), mockMon({ id: 'b' }), mockMon({ id: 'c' })];
    const slots = initPartySlotsFromTeam(team);
    slots[0].currentHp = 0;
    expect(findFirstAliveSlotIndex(slots)).toBe(1);
    slots[1].currentHp = 0;
    expect(findFirstAliveSlotIndex(slots)).toBe(2);
    slots[2].currentHp = 0;
    expect(findFirstAliveSlotIndex(slots)).toBeNull();
  });

  it('getMaxStamina dopo recalculateAllStats è 100 (pool fisso)', () => {
    const m = recalculateAllStats(mockMon({ id: 'st-1' }));
    expect(getMaxStamina(m)).toBe(100);
  });

  it('writeSlotFromBattle aggiorna HP e stamina', () => {
    const team = [mockMon({ id: 'a' }), mockMon({ id: 'b' })];
    const slots = initPartySlotsFromTeam(team);
    writeSlotFromBattle(slots, 0, 5, 8);
    expect(slots[0].currentHp).toBe(5);
    expect(slots[0].currentStamina).toBe(8);
    writeSlotFromBattle(slots, 0, -3, 999);
    expect(slots[0].currentHp).toBe(0);
    expect(slots[0].currentStamina).toBe(999);
  });
});
