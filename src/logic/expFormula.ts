import type { NeoMon } from '../types';
import creaturesData from '../data/creatures.json';

/**
 * EXP necessaria per passare dal livello L al L+1 (curva tipo Pokémon: L³).
 */
export function expRequiredForLevel(level: number): number {
  return Math.max(1, Math.pow(level, 3));
}

/**
 * Resa EXP base dalla specie: specie più difficili da catturare → più EXP (stima).
 * Allineata a un range tipo yield 36–90.
 */
export function defeatedPokemonBaseYield(speciesId: string): number {
  const row = (creaturesData as { id: string; catchRate?: number }[]).find((c) => c.id === speciesId);
  const cr = typeof row?.catchRate === 'number' ? row.catchRate : 120;
  return Math.max(36, Math.min(90, Math.round(160 - cr * 0.45)));
}

/**
 * EXP ottenuta sconfiggendo un nemico (formula semplificata stile Gen III+:
 * (baseYield * Lv nemico) / 7, partecipante unico).
 */
export function experienceForDefeating(defeatedLevel: number, baseYield: number): number {
  const L = Math.max(1, defeatedLevel);
  const b = Math.max(1, baseYield);
  return Math.max(1, Math.floor((b * L) / 7));
}

export function expGainFromBattle(opponent: Pick<NeoMon, 'id' | 'level'>): number {
  const yieldBase = defeatedPokemonBaseYield(opponent.id);
  return experienceForDefeating(opponent.level, yieldBase);
}
