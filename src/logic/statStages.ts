import type { StatStages } from '../types';

export function getStageMultiplier(stage: number): number {
  const s = Math.max(-6, Math.min(6, stage));
  if (s >= 0) return (2 + s) / 2;
  return 2 / (2 - s);
}

export function createDefaultStatStages(): StatStages {
  return {
    attack: 0,
    defense: 0,
    speed: 0,
    specialAtk: 0,
    specialDef: 0,
  };
}

export function applyStatStageDelta(stages: StatStages, delta: Partial<StatStages>): StatStages {
  const clamp = (n: number) => Math.max(-6, Math.min(6, n));
  return {
    attack: clamp(stages.attack + (delta.attack ?? 0)),
    defense: clamp(stages.defense + (delta.defense ?? 0)),
    speed: clamp(stages.speed + (delta.speed ?? 0)),
    specialAtk: clamp(stages.specialAtk + (delta.specialAtk ?? 0)),
    specialDef: clamp(stages.specialDef + (delta.specialDef ?? 0)),
  };
}
