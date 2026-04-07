import { NeoMon } from '../types';
import creaturesData from '../data/creatures.json';
import { recalculateAllStats } from './StatsCalculator';

/**
 * Genera un Neo-Mon selvatico con statistiche casuali basate sul potenziale.
 */
export const generateWildMon = (creatureId: string, level: number): NeoMon => {
  const baseData = (creaturesData as any[]).find(c => c.id === creatureId);
  if (!baseData) throw new Error(`Creatura ${creatureId} non trovata nel database.`);

  // Genera un Potential casuale (0-31)
  const potential = Math.floor(Math.random() * 32);

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
      flusso: 0
    },
    // Le mosse vengono prese dal database base per ora
    moves: baseData.moves || []
  };

  // Calcola le statistiche attuali basate sul livello e potenziale generato
  return recalculateAllStats(wildMon);
};
