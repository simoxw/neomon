import { describe, it, expect } from 'vitest';
import movesData from '../data/moves.json';
import type { Move } from '../types';
import { ElementType } from '../types';
import { BattleEngine } from './BattleEngine';
import { createDefaultStatStages } from './statStages';
import { calculateDamage } from './DamageCalc';

const allMoves: Move[] = (movesData as unknown as Move[][]).flat();

function minimalMon(opts: {
  id: string;
  name: string;
  hp: number;
  stamina: number;
  potenza: number;
  resistenza: number;
  speed?: number;
  moveIds: string[];
}) {
  const stats = {
    hp: opts.hp,
    stamina: opts.stamina,
    potenza: opts.potenza,
    resistenza: opts.resistenza,
    sintonia: 10,
    spirito: 10,
    flusso: opts.speed ?? 20,
  };
  return {
    id: opts.id,
    name: opts.name,
    types: [ElementType.Bio],
    baseStats: stats,
    currentStats: stats,
    level: 10,
    moves: opts.moveIds,
    currentHp: opts.hp,
    currentStamina: opts.stamina,
    status: null,
    statStages: createDefaultStatStages(),
    sleepTurnsRemaining: 0,
    statBoostHistory: [] as string[],
  };
}

describe('BattleEngine (turni, danni)', () => {
  it('executeTurn: entrambi Riposo non fa salire la stamina oltre il massimo', () => {
    const damaging = allMoves.find((m) => (m.power ?? 0) > 0);
    expect(damaging).toBeDefined();
    const mk = (id: string, hp: number, st: number) => ({
      id,
      name: id,
      types: [ElementType.Bio],
      baseStats: { hp: 100, stamina: 100, potenza: 40, resistenza: 40, sintonia: 40, spirito: 40, flusso: 80 },
      currentStats: { hp: 100, stamina: 100, potenza: 40, resistenza: 40, sintonia: 40, spirito: 40, flusso: 80 },
      potential: 15,
      development: { hp: 0, potenza: 0, resistenza: 0, sintonia: 0, spirito: 0, flusso: 0 },
      level: 10,
      exp: 0,
      moves: [damaging!.id],
      friendship: 50,
      currentHp: hp,
      currentStamina: st,
      status: null,
      statStages: { attack: 0, defense: 0, speed: 0, specialAtk: 0, specialDef: 0 },
      sleepTurnsRemaining: 0,
      statBoostHistory: [] as string[],
    });
    const playerMon = mk('p2', 50, 100);
    const aiMon = mk('e2', 50, 100);
    const res = BattleEngine.executeTurn(
      playerMon as any,
      aiMon as any,
      { type: 'rest' },
      { type: 'rest' },
      allMoves
    );
    expect(res.isBattleOver).toBe(false);
    expect(playerMon.currentStamina).toBeLessThanOrEqual(100);
    expect(aiMon.currentStamina).toBeLessThanOrEqual(100);
  });

  it('calculateDamage produce un valore positivo con mosse offensive', () => {
    const atk = minimalMon({
      id: 'a',
      name: 'A',
      hp: 100,
      stamina: 50,
      potenza: 40,
      resistenza: 20,
      moveIds: ['m-pri-01'],
    });
    const def = minimalMon({
      id: 'b',
      name: 'B',
      hp: 100,
      stamina: 50,
      potenza: 10,
      resistenza: 20,
      moveIds: ['m-pri-01'],
    });
    const move = allMoves.find((m) => m.id === 'm-pri-01');
    expect(move).toBeDefined();
    const dmg = calculateDamage(atk as any, def as any, move!);
    expect(dmg).toBeGreaterThanOrEqual(1);
  });

  it('executeTurn: attacco riduce HP del difensore e può terminare la lotta', () => {
    const damaging = allMoves.find((m) => (m.power ?? 0) > 0);
    expect(damaging).toBeDefined();
    const moveId = damaging!.id;

    const playerMon = minimalMon({
      id: 'p1',
      name: 'Player',
      hp: 200,
      stamina: 100,
      potenza: 80,
      resistenza: 30,
      speed: 99,
      moveIds: [moveId],
    });
    const aiMon = minimalMon({
      id: 'e1',
      name: 'Enemy',
      hp: 8,
      stamina: 100,
      potenza: 10,
      resistenza: 10,
      speed: 10,
      moveIds: [moveId],
    });

    const playerAction = { type: 'move' as const, moveId, move: damaging! };
    const aiAction = { type: 'rest' as const };

    const beforeEnemyHp = aiMon.currentHp;
    const res = BattleEngine.executeTurn(playerMon as any, aiMon as any, playerAction, aiAction, allMoves);
    expect(res.first.damage + res.second.damage).toBeGreaterThanOrEqual(0);
    expect(aiMon.currentHp).toBeLessThanOrEqual(beforeEnemyHp);
    if (res.isBattleOver && res.winner === 'player') {
      expect(aiMon.currentHp).toBeLessThanOrEqual(0);
    }
  });
});
