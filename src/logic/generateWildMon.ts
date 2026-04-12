import { NeoMon } from '../types';
import creaturesData from '../data/creatures.json';
import { recalculateAllStats } from './StatsCalculator';
import { createDefaultStatStages } from './statStages';
import { normalizeNeoMon } from './normalizeCreature';

/**
 * Genera un Neo-Mon selvatico con statistiche casuali basate sul potenziale.
 */
export const generateWildMon = (creatureId: string, level: number): NeoMon => {
  const baseData = (creaturesData as any[]).find(c => c.id === creatureId);
  if (!baseData) throw new Error(`Creatura ${creatureId} non trovata nel database.`);

  // Genera un Potential casuale (0-31)
  const potential = Math.floor(Math.random() * 32);

  const learnPool =
    Array.isArray(baseData.learnPool) && baseData.learnPool.length > 0
      ? [...baseData.learnPool]
      : Array.isArray(baseData.moves)
        ? [...baseData.moves]
        : ['m-pri-01'];

  const wildMon: NeoMon = {
    ...baseData,
    level,
    exp: 0,
    potential,
    development: {
      hp: 0,
      potenza: 0,
      resistenza: 0,
      sintonia: 0,
      spirito: 0,
      flusso: 0,
    },
    moves: Array.isArray(baseData.moves) && baseData.moves.length > 0 ? [...baseData.moves] : ['m-pri-01'],
    learnPool,
    catchRate: typeof baseData.catchRate === 'number' ? baseData.catchRate : 120,
    status: null,
    statStages: createDefaultStatStages(),
  };

  return normalizeNeoMon(recalculateAllStats(wildMon));
};

/** Selvatico o slot allenatore con mosse fisse */
export const generateWildMonWithMoves = (creatureId: string, level: number, moveIds?: string[]): NeoMon => {
  const base = generateWildMon(creatureId, level);
  if (moveIds?.length) {
    return normalizeNeoMon(recalculateAllStats({ ...base, moves: moveIds.slice(0, 4) }));
  }
  return base;
};
