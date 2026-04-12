import { NeoMon, CreatureSpecies, SpeciesEvolutionTarget } from '../types';
import creaturesData from '../data/creatures.json';

function resolveSpeciesRow(monId: string): CreatureSpecies | undefined {
  return (creaturesData as CreatureSpecies[]).find((c) => c.id === monId);
}

function resolveEvolutionTarget(row: CreatureSpecies): { creatureId: string; level: number } | null {
  const ev = row.evolvesTo as SpeciesEvolutionTarget | undefined;
  if (ev == null) return null;
  if (typeof ev === 'string') {
    const lvl = row.evolutionLevel != null ? row.evolutionLevel : 999;
    return { creatureId: ev, level: lvl };
  }
  return { creatureId: ev.creatureId, level: ev.level };
}

export function speciesNextFormId(row: CreatureSpecies): string | null {
  const t = resolveEvolutionTarget(row);
  return t?.creatureId ?? null;
}

/**
 * Controlla se l'istanza ha raggiunto il livello per evolvere nella forma successiva (PROMPT 16).
 */
export function checkEvolution(mon: NeoMon): { shouldEvolve: boolean; evolvesTo: string | null } {
  const row = resolveSpeciesRow(mon.id);
  if (!row) return { shouldEvolve: false, evolvesTo: null };
  const tgt = resolveEvolutionTarget(row);
  if (!tgt) return { shouldEvolve: false, evolvesTo: null };
  if (mon.level < tgt.level) return { shouldEvolve: false, evolvesTo: null };
  return { shouldEvolve: true, evolvesTo: tgt.creatureId };
}

export class EvolutionSystem {
  static checkEvolution(mon: NeoMon): { shouldEvolve: boolean; evolvesTo: string | null } {
    return checkEvolution(mon);
  }

  static checkEvolutionLegacy(mon: NeoMon): boolean {
    return checkEvolution(mon).shouldEvolve;
  }

  static evolve(mon: NeoMon): NeoMon | null {
    const { shouldEvolve, evolvesTo } = checkEvolution(mon);
    if (!shouldEvolve || !evolvesTo) return null;

    const nextForm = (creaturesData as CreatureSpecies[]).find((c) => c.id === evolvesTo);
    if (!nextForm) return null;

    return {
      ...mon,
      id: nextForm.id,
      name: nextForm.name,
      types: nextForm.types,
      baseStats: nextForm.baseStats,
      evolutionLevel: nextForm.evolutionLevel ?? undefined,
      evolvesTo: typeof nextForm.evolvesTo === 'string' ? nextForm.evolvesTo : nextForm.evolvesTo ?? undefined,
      canEvolve: false,
    };
  }

  static learnMoves(mon: NeoMon): string[] {
    const creatureInfo = resolveSpeciesRow(mon.id);
    if (!creatureInfo?.moves_learned) return mon.moves;

    const newMoves = [...mon.moves];
    const learnable = creatureInfo.moves_learned.filter((ml) => ml.level <= mon.level);

    learnable.forEach((ml) => {
      if (!newMoves.includes(ml.moveId) && newMoves.length < 4) {
        newMoves.push(ml.moveId);
      }
    });

    return newMoves;
  }
}
