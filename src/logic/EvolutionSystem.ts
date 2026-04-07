import { NeoMon, Move } from '../types';
import creaturesData from '../data/creatures.json';

/**
 * Neo-Mon Evolution & Growth System
 * @version 1.0.0
 */

export class EvolutionSystem {
  /**
   * Controlla se un Neo-Mon ha raggiunto il livello richiesto per l'evoluzione.
   */
  static checkEvolution(mon: NeoMon): boolean {
    return mon.evolutionLevel !== null && mon.level >= (mon.evolutionLevel || 999);
  }

  /**
   * Evolve un Neo-Mon nella sua forma successiva.
   * Mantiene: ID, Potenziale, Sviluppo, Amicizia, EXP.
   * Aggiorna: Nome, Tipi, Evoluzione Successiva, Statistiche Base.
   */
  static evolve(mon: NeoMon): NeoMon | null {
    if (!this.checkEvolution(mon) || !mon.evolvesTo) return null;

    const allCreatures: any[] = creaturesData;
    const nextForm = allCreatures.find(c => c.id === mon.evolvesTo);
    
    if (!nextForm) return null;

    return {
      ...mon,
      name: nextForm.name,
      types: nextForm.types,
      baseStats: nextForm.baseStats,
      evolutionLevel: nextForm.evolutionLevel,
      evolvesTo: nextForm.evolvesTo,
      // Mantiene ID e progressi
    };
  }

  /**
   * Controlla se il Neo-Mon impara nuove mosse a un determinato livello.
   * Solitamente multipli di 10 (10, 20, 30, 40).
   */
  static learnMoves(mon: NeoMon): string[] {
    const allCreatures: any[] = creaturesData;
    const creatureInfo = allCreatures.find(c => c.id === mon.id);
    
    if (!creatureInfo || !creatureInfo.moves_learned) return mon.moves;

    const newMoves = [...mon.moves];
    const learnable = creatureInfo.moves_learned.filter((ml: any) => ml.level <= mon.level);

    learnable.forEach((ml: any) => {
      if (!newMoves.includes(ml.moveId)) {
        // Se ha meno di 4 mosse, aggiungi direttamente, altrimenti logica di swap? 
        // Per ora aggiungiamo se c'è spazio o ritorna la lista disponibile.
        if (newMoves.length < 4) {
           newMoves.push(ml.moveId);
        }
      }
    });

    return newMoves;
  }
}
