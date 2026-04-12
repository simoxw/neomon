import type { NeoMon, StatusCondition } from '../types';
import { createDefaultStatStages } from './statStages';
import creaturesData from '../data/creatures.json';

export function normalizeNeoMon(mon: NeoMon): NeoMon {
  const species = (creaturesData as { id: string; learnPool?: string[] }[]).find((c) => c.id === mon.id);
  const pool =
    mon.learnPool?.length ? [...mon.learnPool] : species?.learnPool?.length ? [...species.learnPool] : [...(mon.moves || [])];
  return {
    ...mon,
    status: mon.status ?? null,
    statStages: mon.statStages ?? createDefaultStatStages(),
    learnPool: pool,
  };
}

export function ensureBattleFields(mon: NeoMon & Record<string, unknown>): NeoMon & Record<string, unknown> {
  mon.status = (mon.status as StatusCondition) ?? null;
  mon.statStages = mon.statStages ?? createDefaultStatStages();
  mon.sleepTurnsRemaining = mon.sleepTurnsRemaining ?? 0;
  mon.statBoostHistory = (mon.statBoostHistory as string[]) ?? [];
  return mon;
}
