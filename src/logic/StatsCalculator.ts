import { NeoMon, Stats } from '../types';

/**
 * Funzione calculateStat: Calcola il valore attuale di una statistica basandosi sulla formula RPG standard.
 * Formula: Stat = Math.floor(((baseStat * 2 + potential) * level) / 100) + 5
 */
export const calculateStat = (baseStat: number, level: number, potential: number): number => {
  return Math.floor(((baseStat * 2 + potential) * level) / 100) + 5;
};

/**
 * Funzione calculateHP: Formula specifica per i punti vita.
 * Formula: Stat = Math.floor(((baseStat * 2 + potential) * level) / 100) + level + 10
 */
export const calculateHP = (baseStat: number, level: number, potential: number): number => {
  return Math.floor(((baseStat * 2 + potential) * level) / 100) + level + 10;
};

/**
 * Funzione recalculateAllStats: Aggiorna l'intero set di statistiche di un Neo-Mon in base al livelo e potenziale attuale.
 */
export const recalculateAllStats = (mon: NeoMon): NeoMon => {
  const { baseStats, level, potential } = mon;
  
  const newStats: Stats = {
    hp: calculateHP(baseStats.hp, level, potential),
    stamina: calculateStat(baseStats.stamina, level, potential),
    potenza: calculateStat(baseStats.potenza, level, potential),
    resistenza: calculateStat(baseStats.resistenza, level, potential),
    sintonia: calculateStat(baseStats.sintonia, level, potential),
    spirito: calculateStat(baseStats.spirito, level, potential),
    flusso: calculateStat(baseStats.flusso, level, potential),
  };

  // Restituiamo il Neo-Mon con le statistiche aggiornate
  // Nota: Manteniamo le baseStats originali nel JSON e aggiorniamo solo i valori correnti
  return {
    ...mon,
    currentStats: newStats // Assicuriamoci che l'interfaccia NeoMon rifletta queste stat correnti
  };
};
