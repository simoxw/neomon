import { NeoMon, Move } from '../types';
import { calculateDamage, getEffectiveness, TYPE_CHART } from './DamageCalc.ts';
import { consumeStamina, restAction, passiveRecovery, canPerformMove, BASE_RECOVERY } from './StaminaManager.ts';

/**
 * Senior Game Engine Developer - Neo-Mon Battle Engine
 * @version 1.0.0
 */

export type BattleActionType = 'move' | 'rest' | 'switch';

export interface BattleAction {
  type: BattleActionType;
  moveId?: string;
  move?: Move; // Opzionale, caricato dal motore se moveId è fornito
}

export interface TurnExecutionResult {
  playerId: string;
  action: BattleAction;
  damage: number;
  consumedStamina: number;
  recoveredStamina: number;
  isStaminaFailure: boolean;
  isKO: boolean;
  effectiveness: number;
  message: string;
}

export interface FullTurnResult {
  first: TurnExecutionResult;
  second: TurnExecutionResult;
  isBattleOver: boolean;
  winner?: 'player' | 'ai';
}

export class BattleEngine {
  /**
   * Calcola la mossa migliore per l'IA basandosi sul danno potenziale e la tabella dei tipi.
   */
  static getBestMoveAI(attacker: any, defender: any, allMoves: Move[]): BattleAction {
    // 1. Recupera le mosse dell'attaccante
    const attackerMoves = (attacker.moves as string[]) || [];
    const availableMoves = allMoves.filter(m => attackerMoves.includes(m.id));

    // 2. Controllo Stamina Critica (< 20%)
    const currentStam = attacker.currentStamina ?? attacker.baseStats.stamina;
    const maxStam = attacker.baseStats.stamina;
    const staminaPercent = maxStam > 0 ? (currentStam / maxStam) : 1; 

    // 3. Analisi Probabilistica Riposo
    if (staminaPercent < 0.2) {
      if (Math.random() < 0.8) {
        return { type: 'rest' };
      }
    }

    // 4. Calcola il punteggio per ogni mossa
    let bestMove: Move | null = null;
    let maxDamage = -1;

    for (const move of availableMoves) {
      // Calcolo danno stimato (senza RNG per decisione deterministica dell'IA)
      const dmg = this.calculateEstimatedDamage(attacker, defender, move);

      if (dmg > maxDamage) {
        maxDamage = dmg;
        bestMove = move;
      }
    }

    if (bestMove) {
      return { type: 'move', moveId: bestMove.id, move: bestMove };
    }

    return { type: 'rest' };
  }

  private static calculateEstimatedDamage(attacker: NeoMon, defender: NeoMon, move: Move): number {
    const isPhysical = move.category === 'Physical';
    const atk = isPhysical ? attacker.baseStats.potenza : attacker.baseStats.sintonia;
    const def = isPhysical ? defender.baseStats.resistenza : defender.baseStats.spirito;
    const stab = attacker.types.includes(move.type) ? 1.25 : 1;
    const effectiveness = getEffectiveness(move.type, defender.types);
    
    const baseDamage = (((2 * attacker.level / 5 + 2) * move.power * (atk / def) / 50) + 2);
    return baseDamage * stab * effectiveness; 
  }

  /**
   * Esegue un turno completo confrontando l'azione del giocatore e dell'IA.
   */
  static executeTurn(
    playerMon: any,
    aiMon: any,
    playerAction: BattleAction,
    aiAction: BattleAction
  ): FullTurnResult {
    // Inizializza HP/Stamina se non presenti
    if (playerMon.currentHp === undefined) playerMon.currentHp = playerMon.baseStats.hp;
    if (playerMon.currentStamina === undefined) playerMon.currentStamina = playerMon.baseStats.stamina;
    if (aiMon.currentHp === undefined) aiMon.currentHp = aiMon.baseStats.hp;
    if (aiMon.currentStamina === undefined) aiMon.currentStamina = aiMon.baseStats.stamina;

    let firstActor: 'player' | 'ai';
    let secondActor: 'player' | 'ai';

    const pPriority = playerAction.type === 'rest' || playerAction.type === 'switch' ? 2 : 1;
    const aiPriority = aiAction.type === 'rest' || aiAction.type === 'switch' ? 2 : 1;

    if (pPriority > aiPriority) {
      firstActor = 'player';
      secondActor = 'ai';
    } else if (aiPriority > pPriority) {
      firstActor = 'ai';
      secondActor = 'player';
    } else {
      if (playerMon.baseStats.flusso >= aiMon.baseStats.flusso) {
        firstActor = 'player';
        secondActor = 'ai';
      } else {
        firstActor = 'ai';
        secondActor = 'player';
      }
    }

    const actors = {
      player: { mon: playerMon, action: playerAction, id: 'player' },
      ai: { mon: aiMon, action: aiAction, id: 'ai' }
    };

    // Primo Attore
    const targetOfFirst = firstActor === 'player' ? aiMon : playerMon;
    const firstResult = this.resolveAction(actors[firstActor].mon, targetOfFirst, actors[firstActor].action, firstActor);
    
    // Applica effetti del primo sul target
    targetOfFirst.currentHp -= firstResult.damage;
    actors[firstActor].mon.currentStamina = Math.min(actors[firstActor].mon.baseStats.stamina, 
        actors[firstActor].mon.currentStamina - firstResult.consumedStamina + firstResult.recoveredStamina);

    // Secondo Attore (se non KO)
    let secondResult: TurnExecutionResult;
    const targetOfSecond = secondActor === 'player' ? aiMon : playerMon;
    
    if (actors[secondActor].mon.currentHp <= 0) {
      secondResult = {
        playerId: secondActor,
        action: actors[secondActor].action,
        damage: 0,
        consumedStamina: 0,
        recoveredStamina: 0,
        isStaminaFailure: false,
        isKO: true,
        effectiveness: 1,
        message: `${actors[secondActor].mon.name} è esausto e non può agire!`
      };
    } else {
      secondResult = this.resolveAction(actors[secondActor].mon, targetOfSecond, actors[secondActor].action, secondActor);
      targetOfSecond.currentHp -= secondResult.damage;
      actors[secondActor].mon.currentStamina = Math.min(actors[secondActor].mon.baseStats.stamina, 
          actors[secondActor].mon.currentStamina - secondResult.consumedStamina + secondResult.recoveredStamina);
    }

    const isBattleOver = playerMon.currentHp <= 0 || aiMon.currentHp <= 0;
    const winner = playerMon.currentHp <= 0 ? 'ai' : (aiMon.currentHp <= 0 ? 'player' : undefined);

    return {
      first: firstResult,
      second: secondResult,
      isBattleOver,
      winner
    };
  }

  private static resolveAction(
    attacker: any,
    defender: any,
    action: BattleAction,
    actorId: string
  ): TurnExecutionResult {
    let damage = 0;
    let consumed = 0;
    let recovered = 0;
    let isStaminaFailure = false;
    let effectiveness = 1;
    let message = "";

    if (action.type === 'rest') {
      const currentStamina = attacker.currentStamina;
      const maxStamina = attacker.baseStats.stamina;

      const newStamina = restAction(currentStamina, maxStamina);
      recovered = newStamina - currentStamina;
      message = `${attacker.name} si riposa e recupera energia!`;
      
      return {
        playerId: actorId, action, damage: 0, consumedStamina: 0, recoveredStamina: recovered,
        isStaminaFailure: false, isKO: false, effectiveness: 1, message
      };
    }

    if (action.type === 'switch') {
      message = `${attacker.name} entra in campo!`;
      return {
        playerId: actorId, action, damage: 0, consumedStamina: 0, recoveredStamina: 0,
        isStaminaFailure: false, isKO: false, effectiveness: 1, message
      };
    }

    if (action.type === 'move' && action.move) {
      const currentStamina = attacker.currentStamina;
      const cost = action.move.staminaCost;

      if (canPerformMove(currentStamina, cost)) {
        damage = calculateDamage(attacker, defender, action.move);
        consumed = cost;
        effectiveness = getEffectiveness(action.move.type, defender.types);
        
        let effMsg = "";
        if (effectiveness > 1) effMsg = " È superefficace!";
        if (effectiveness < 1 && effectiveness > 0) effMsg = " Non è molto efficace...";
        if (effectiveness === 0) effMsg = " Non ha effetto...";

        message = `${attacker.name} usa ${action.move.name}!${effMsg}`;
      } else {
        isStaminaFailure = true;
        const maxStamina = attacker.baseStats.stamina;
        const newStamina = passiveRecovery(currentStamina, maxStamina);
        recovered = newStamina - currentStamina;
        message = `${attacker.name} è troppo stanco per usare ${action.move.name}! Recupera un po' di stamina (BASE RECOVERY).`;
      }
    }


    return {
      playerId: actorId,
      action,
      damage,
      consumedStamina: consumed,
      recoveredStamina: recovered,
      isStaminaFailure,
      isKO: false,
      effectiveness,
      message
    };
  }
}
