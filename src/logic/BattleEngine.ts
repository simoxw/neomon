import { NeoMon, Move, MoveEffect, StatusCondition } from '../types';
import { calculateDamage, getEffectiveness, calculateFlatNeutralDamage, checkCriticalHit } from './DamageCalc.ts';
import { getMaxStamina } from './battleParty';
import { restAction, passiveRecovery, canUseMove, BASE_RECOVERY } from './StaminaManager.ts';
import { resolveMoveById } from './moveLookup';
import { getStructuredMoveEffect, getMoveAccuracy } from './moveEffectHelpers';
import { applyStatStageDelta, createDefaultStatStages, getStageMultiplier } from './statStages';

export type BattleActionType = 'move' | 'rest' | 'switch';

export interface BattleAction {
  type: BattleActionType;
  moveId?: string;
  move?: Move;
}

export type FloatEvent = { side: 'player' | 'enemy'; amount: number; variant: 'damage' | 'heal' | 'status' };

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
  floatEvents?: FloatEvent[];
}

export interface FullTurnResult {
  first: TurnExecutionResult;
  second: TurnExecutionResult;
  isBattleOver: boolean;
  winner?: 'player' | 'ai';
  endOfTurnMessages?: string[];
  endOfTurnFloats?: FloatEvent[];
}

function resetStatStages(mon: any) {
  mon.statStages = createDefaultStatStages();
  mon.status = null;
  mon.sleepTurnsRemaining = 0;
}

function maxHp(mon: any): number {
  return mon.currentStats?.hp ?? mon.baseStats.hp;
}

function maxStamina(mon: any): number {
  return getMaxStamina(mon as NeoMon);
}

function rollAccuracy(move: Move, eff?: MoveEffect): boolean {
  if (eff?.bypassAccuracy) return true;
  const acc = getMoveAccuracy(move);
  return Math.random() * 100 < acc;
}

function statusApplyLabel(s: StatusCondition): string {
  switch (s) {
    case 'burn':
      return 'bruciato';
    case 'freeze':
      return 'congelato';
    case 'paralysis':
      return 'paralizzato';
    case 'poison':
      return 'avvelenato';
    case 'sleep':
      return 'addormentato';
    case 'confuse':
      return 'confuso';
    default:
      return 'afflitto';
  }
}

function canApplyStatus(target: any, incoming: StatusCondition): boolean {
  if (target.status && target.status === incoming) return false;
  if (incoming === 'poison' && target.status === 'burn') return false;
  if (incoming === 'burn' && target.status === 'poison') return false;
  return target.status == null || target.status === null;
}

function applyPrimaryStatus(target: any, incoming: StatusCondition, attackerName: string): string | null {
  if (!incoming || !canApplyStatus(target, incoming)) return null;
  target.status = incoming;
  if (incoming === 'sleep') {
    target.sleepTurnsRemaining = 1 + Math.floor(Math.random() * 3);
  }
  return `[${incoming}] ${target.name} è stato ${statusApplyLabel(incoming)}!`;
}

function checkPreMove(attacker: any, move: Move): { skip: boolean; confuseSelf?: boolean; message: string } {
  const st = attacker.status as StatusCondition;
  if (st === 'sleep' && (attacker.sleepTurnsRemaining ?? 0) > 0) {
    return { skip: true, message: `${attacker.name} sta dormendo...` };
  }
  if (st === 'freeze') {
    if (Math.random() < 0.3) {
      attacker.status = null;
      return { skip: false, message: `${attacker.name} si è scongelato!` };
    }
    return { skip: true, message: `${attacker.name} è congelato solido!` };
  }
  if (st === 'paralysis' && Math.random() < 0.25) {
    return { skip: true, message: `${attacker.name} è paralizzato e non riesce a muoversi!` };
  }
  if (st === 'confuse' && Math.random() < 0.33) {
    return { skip: false, confuseSelf: true, message: `${attacker.name} è confuso! Si colpisce da solo!` };
  }
  return { skip: false, message: '' };
}

export class BattleEngine {
  static effectiveSpeed(mon: any): number {
    const flux = mon.currentStats?.flusso ?? mon.baseStats?.flusso ?? 0;
    const iv = typeof mon.potential === 'number' ? mon.potential : 0;
    const stage = mon.statStages?.speed ?? 0;
    let spd = (flux + iv * 2) * getStageMultiplier(stage);
    if (mon.status === 'paralysis') spd *= 0.5;
    return spd;
  }

  private static enrichAction(action: BattleAction, allMoves: Move[]): BattleAction {
    if (action.type !== 'move') return action;
    const id = action.moveId ?? action.move?.id;
    const move = resolveMoveById(id, allMoves);
    return { ...action, moveId: move.id, move };
  }

  static applyEndOfTurnEffects(mon: any): { messages: string[]; floatEvents: FloatEvent[] } {
    const messages: string[] = [];
    const floatEvents: FloatEvent[] = [];
    const hpMax = maxHp(mon);
    const st = mon.status as StatusCondition;

    if (st === 'burn' || st === 'poison') {
      const dmg = Math.max(1, Math.floor(hpMax / 8));
      mon.currentHp = Math.max(0, mon.currentHp - dmg);
      messages.push(st === 'burn' ? `${mon.name} soffre per la scottatura!` : `${mon.name} subisce il veleno!`);
      const fs: 'player' | 'enemy' = mon.__side === 'player' ? 'player' : 'enemy';
      floatEvents.push({ side: fs, amount: dmg, variant: 'damage' });
    }

    if (st === 'sleep' && (mon.sleepTurnsRemaining ?? 0) > 0) {
      mon.sleepTurnsRemaining = (mon.sleepTurnsRemaining ?? 1) - 1;
      if (mon.sleepTurnsRemaining <= 0) {
        mon.status = null;
        messages.push(`${mon.name} si è svegliato!`);
      }
    }

    if (st === 'freeze' && Math.random() < 0.3) {
      mon.status = null;
      messages.push(`${mon.name} si è scongelato!`);
    }

    return { messages, floatEvents };
  }

  static getBestMoveAI(attacker: any, defender: any, allMoves: Move[]): BattleAction {
    const attackerMoves = (attacker.moves as string[]) || [];
    const availableMoves = allMoves.filter((m) => attackerMoves.includes(m.id) && (m.staminaCost ?? 0) <= (attacker.currentStamina ?? 0));
    if (availableMoves.length === 0) return { type: 'rest' };

    const currentStam = attacker.currentStamina ?? maxStamina(attacker);
    const maxStam = maxStamina(attacker);
    const staminaRatio = maxStam > 0 ? currentStam / maxStam : 1;
    const hpRatio = maxHp(attacker) > 0 ? attacker.currentHp / maxHp(attacker) : 1;
    const defStatus = defender.status as StatusCondition;

    const statusMoves = availableMoves.filter((m) => {
      const e = getStructuredMoveEffect(m);
      return e?.type === 'status' && (m.power ?? 0) === 0 && (e.statusCondition === 'sleep' || e.statusCondition === 'paralysis');
    });

    if (hpRatio > 0.7 && defStatus == null && statusMoves.length && Math.random() < 0.4) {
      const pick = statusMoves[Math.floor(Math.random() * statusMoves.length)];
      return { type: 'move', moveId: pick.id, move: pick };
    }

    if (defStatus === 'paralysis' || defStatus === 'sleep') {
      const damaging = availableMoves.filter((m) => (m.power ?? 0) > 0);
      const best = damaging.sort((a, b) => (b.power ?? 0) - (a.power ?? 0))[0];
      if (best) return { type: 'move', moveId: best.id, move: best };
    }

    if (hpRatio < 0.3) {
      if (Math.random() < 0.85) {
        const damaging = availableMoves.filter((m) => (m.power ?? 0) > 0);
        const best = damaging.sort((a, b) => (b.power ?? 0) - (a.power ?? 0))[0];
        if (best) return { type: 'move', moveId: best.id, move: best };
      } else if (staminaRatio < 0.3) {
        return { type: 'rest' };
      }
    }

    const hist: string[] = defender.statBoostHistory || [];
    if (hist.length >= 2 && hist[hist.length - 1] === 'attack' && hist[hist.length - 2] === 'attack') {
      const counter = availableMoves.find((m) => {
        const e = getStructuredMoveEffect(m);
        return e?.statChanges && (e.statChanges.attack ?? 0) < 0;
      });
      if (counter) return { type: 'move', moveId: counter.id, move: counter };
    }

    let bestMove: Move | null = null;
    let bestScore = -1e9;
    for (const move of availableMoves) {
      if ((move.power ?? 0) <= 0) continue;
      const eff = getEffectiveness(move.type, defender.types);
      const dmg = this.calculateEstimatedDamage(attacker, defender, move);
      const score = dmg * eff;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    if (bestMove) return { type: 'move', moveId: bestMove.id, move: bestMove };

    const anyDam = availableMoves.filter((m) => (m.power ?? 0) > 0);
    if (anyDam.length) {
      const pick = anyDam[Math.floor(Math.random() * anyDam.length)];
      return { type: 'move', moveId: pick.id, move: pick };
    }

    if (staminaRatio < 0.2 && Math.random() < 0.8) return { type: 'rest' };
    return { type: 'rest' };
  }

  private static calculateEstimatedDamage(attacker: NeoMon, defender: NeoMon, move: Move): number {
    return calculateDamage(attacker, defender, move);
  }

  static executeTurn(playerMon: any, aiMon: any, playerAction: BattleAction, aiAction: BattleAction, allMoves: Move[]): FullTurnResult {
    playerAction = this.enrichAction(playerAction, allMoves);
    aiAction = this.enrichAction(aiAction, allMoves);

    playerMon.__side = 'player';
    aiMon.__side = 'enemy';

    if (playerMon.currentHp === undefined) playerMon.currentHp = maxHp(playerMon);
    if (playerMon.currentStamina === undefined) playerMon.currentStamina = maxStamina(playerMon);
    if (aiMon.currentHp === undefined) aiMon.currentHp = maxHp(aiMon);
    if (aiMon.currentStamina === undefined) aiMon.currentStamina = maxStamina(aiMon);

    let firstActor: 'player' | 'ai';
    let secondActor: 'player' | 'ai';

    const pPri = playerAction.type === 'rest' || playerAction.type === 'switch' ? 2 : 1;
    const aiPri = aiAction.type === 'rest' || aiAction.type === 'switch' ? 2 : 1;
    const pMovePri = getStructuredMoveEffect(playerAction.move || ({} as Move))?.priority ?? 0;
    const aiMovePri = getStructuredMoveEffect(aiAction.move || ({} as Move))?.priority ?? 0;

    if (pPri > aiPri) {
      firstActor = 'player';
      secondActor = 'ai';
    } else if (aiPri > pPri) {
      firstActor = 'ai';
      secondActor = 'player';
    } else if (pMovePri !== aiMovePri) {
      if (pMovePri > aiMovePri) {
        firstActor = 'player';
        secondActor = 'ai';
      } else {
        firstActor = 'ai';
        secondActor = 'player';
      }
    } else if (this.effectiveSpeed(playerMon) >= this.effectiveSpeed(aiMon)) {
      firstActor = 'player';
      secondActor = 'ai';
    } else {
      firstActor = 'ai';
      secondActor = 'player';
    }

    const actors = {
      player: { mon: playerMon, action: playerAction, id: 'player' },
      ai: { mon: aiMon, action: aiAction, id: 'ai' },
    };

    const targetOfFirst = firstActor === 'player' ? aiMon : playerMon;
    const firstResult = this.resolveAction(actors[firstActor].mon, targetOfFirst, actors[firstActor].action, firstActor);
    targetOfFirst.currentHp -= firstResult.damage;
    actors[firstActor].mon.currentStamina = Math.min(
      maxStamina(actors[firstActor].mon),
      actors[firstActor].mon.currentStamina - firstResult.consumedStamina + firstResult.recoveredStamina
    );
    if (firstResult.damage > 0 && targetOfFirst.currentHp <= 0) resetStatStages(targetOfFirst);

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
        message: `${actors[secondActor].mon.name} è esausto e non può agire!`,
      };
    } else {
      secondResult = this.resolveAction(actors[secondActor].mon, targetOfSecond, actors[secondActor].action, secondActor);
      targetOfSecond.currentHp -= secondResult.damage;
      actors[secondActor].mon.currentStamina = Math.min(
        maxStamina(actors[secondActor].mon),
        actors[secondActor].mon.currentStamina - secondResult.consumedStamina + secondResult.recoveredStamina
      );
      if (secondResult.damage > 0 && targetOfSecond.currentHp <= 0) resetStatStages(targetOfSecond);
    }

    const endMsgs: string[] = [];
    const endFloats: FloatEvent[] = [];
    for (const mon of [playerMon, aiMon]) {
      const r = this.applyEndOfTurnEffects(mon);
      endMsgs.push(...r.messages);
      endFloats.push(...r.floatEvents);
    }

    const isBattleOver = playerMon.currentHp <= 0 || aiMon.currentHp <= 0;
    const winner = playerMon.currentHp <= 0 ? 'ai' : aiMon.currentHp <= 0 ? 'player' : undefined;

    if (isBattleOver) {
      resetStatStages(playerMon);
      resetStatStages(aiMon);
    }

    return {
      first: firstResult,
      second: secondResult,
      isBattleOver,
      winner,
      endOfTurnMessages: endMsgs,
      endOfTurnFloats: endFloats,
    };
  }

  private static resolveAction(attacker: any, defender: any, action: BattleAction, actorId: string): TurnExecutionResult {
    let damage = 0;
    let consumed = 0;
    let recovered = 0;
    let isStaminaFailure = false;
    let effectiveness = 1;
    let message = '';
    const floatEvents: FloatEvent[] = [];

    const side: 'player' | 'enemy' = actorId === 'player' ? 'enemy' : 'player';

    if (action.type === 'rest') {
      const currentStamina = attacker.currentStamina;
      const maxSt = maxStamina(attacker);
      const newStamina = restAction(currentStamina, maxSt);
      recovered = newStamina - currentStamina;
      message = `${attacker.name} si riposa e recupera energia!`;
      return {
        playerId: actorId,
        action,
        damage: 0,
        consumedStamina: 0,
        recoveredStamina: recovered,
        isStaminaFailure: false,
        isKO: false,
        effectiveness: 1,
        message,
        floatEvents,
      };
    }

    if (action.type === 'switch') {
      message = `${attacker.name} entra in campo!`;
      return {
        playerId: actorId,
        action,
        damage: 0,
        consumedStamina: 0,
        recoveredStamina: 0,
        isStaminaFailure: false,
        isKO: false,
        effectiveness: 1,
        message,
        floatEvents,
      };
    }

    if (action.type === 'move' && action.move) {
      const move = action.move;
      const eff = getStructuredMoveEffect(move);
      const pre = checkPreMove(attacker, move);
      if (pre.message && (pre.skip || pre.confuseSelf)) message = pre.message;

      if (pre.skip) {
        return {
          playerId: actorId,
          action,
          damage: 0,
          consumedStamina: 0,
          recoveredStamina: 0,
          isStaminaFailure: false,
          isKO: false,
          effectiveness: 1,
          message: pre.message,
          floatEvents,
        };
      }

      const currentStamina = attacker.currentStamina;
      const cost = move.staminaCost;
      const staminaCheck = canUseMove(currentStamina, cost);

      if (!staminaCheck.ok) {
        isStaminaFailure = true;
        const maxSt = maxStamina(attacker);
        const newStamina = passiveRecovery(currentStamina, maxSt);
        recovered = newStamina - currentStamina;
        message = `${attacker.name} non può agire: ${staminaCheck.message}`;
        return {
          playerId: actorId,
          action,
          damage: 0,
          consumedStamina: 0,
          recoveredStamina: recovered,
          isStaminaFailure: true,
          isKO: false,
          effectiveness: 1,
          message,
          floatEvents,
        };
      }

      consumed = cost;

      if (pre.confuseSelf) {
        const sdmg = calculateFlatNeutralDamage(attacker, attacker, 40);
        attacker.currentHp = Math.max(0, attacker.currentHp - sdmg);
        floatEvents.push({ side: actorId as 'player' | 'enemy', amount: sdmg, variant: 'damage' });
        return {
          playerId: actorId,
          action,
          damage: 0,
          consumedStamina: consumed,
          recoveredStamina: 0,
          isStaminaFailure: false,
          isKO: false,
          effectiveness: 1,
          message: pre.message,
          floatEvents,
        };
      }

      if (!rollAccuracy(move, eff)) {
        message = `${attacker.name} usa ${move.name}, ma fallisce!`;
        return {
          playerId: actorId,
          action,
          damage: 0,
          consumedStamina: consumed,
          recoveredStamina: 0,
          isStaminaFailure: false,
          isKO: false,
          effectiveness: 1,
          message,
          floatEvents,
        };
      }

      if (eff?.selfStatusCondition && canApplyStatus(attacker, eff.selfStatusCondition)) {
        const msg = applyPrimaryStatus(attacker, eff.selfStatusCondition, attacker.name);
        if (msg) floatEvents.push({ side: actorId as 'player' | 'enemy', amount: 0, variant: 'status' });
      }

      if ((move.power ?? 0) > 0) {
        damage = calculateDamage(attacker, defender, move);
        const isCritical = checkCriticalHit(attacker, move);
        if (isCritical) {
          damage = Math.floor(damage * 1.5);
        }
        effectiveness = getEffectiveness(move.type, defender.types);
        let effMsg = '';
        if (effectiveness > 1) effMsg = ' È superefficace!';
        if (effectiveness < 1 && effectiveness > 0) effMsg = ' Non è molto efficace...';
        if (effectiveness === 0) effMsg = ' Non ha effetto...';
        const critMsg = isCritical ? ' 💥 Colpo Critico!' : '';
        message = `${attacker.name} usa ${move.name}!${effMsg}${critMsg}`;
        floatEvents.push({ side, amount: damage, variant: 'damage' });

        if (eff?.drainPercent && damage > 0) {
          const heal = Math.floor((damage * eff.drainPercent) / 100);
          attacker.currentHp = Math.min(maxHp(attacker), attacker.currentHp + heal);
          floatEvents.push({ side: actorId as 'player' | 'enemy', amount: heal, variant: 'heal' });
        }
        if (eff?.recoilPercent && damage > 0) {
          const rc = Math.max(1, Math.floor((damage * eff.recoilPercent) / 100));
          attacker.currentHp = Math.max(0, attacker.currentHp - rc);
          floatEvents.push({ side: actorId as 'player' | 'enemy', amount: rc, variant: 'damage' });
        }

        if (eff?.type === 'damage_status' && eff.statusChance != null && eff.statusCondition) {
          if (Math.random() * 100 < eff.statusChance) {
            const stMsg = applyPrimaryStatus(defender, eff.statusCondition, attacker.name);
            if (stMsg) {
              message += ' ' + stMsg;
              floatEvents.push({ side, amount: 0, variant: 'status' });
            }
          }
        }
      } else {
        message = `${attacker.name} usa ${move.name}!`;
      }

      if (eff?.type === 'stat_change') {
        if (eff.statChanges) {
          defender.statStages = applyStatStageDelta(defender.statStages || createDefaultStatStages(), eff.statChanges);
        }
        if (eff.selfStatChanges) {
          attacker.statStages = applyStatStageDelta(attacker.statStages || createDefaultStatStages(), eff.selfStatChanges);
          if (actorId === 'player') {
            attacker.statBoostHistory = attacker.statBoostHistory || [];
            if ((eff.selfStatChanges.attack ?? 0) > 0) attacker.statBoostHistory.push('attack');
            if (attacker.statBoostHistory.length > 6) attacker.statBoostHistory.shift();
          }
        }
      }

      if (eff?.type === 'status' && eff.statusCondition && (move.power ?? 0) === 0) {
        const stMsg = applyPrimaryStatus(defender, eff.statusCondition, attacker.name);
        if (stMsg) {
          message += ' ' + stMsg;
          floatEvents.push({ side, amount: 0, variant: 'status' });
        }
      }

      // Sottrai 1 PP dalla mossa usata
      if (!attacker.movePPs) attacker.movePPs = (attacker.moves || []).map(() => 15);
      const moveIdx = attacker.moves?.indexOf(move.id) ?? -1;
      if (moveIdx >= 0 && attacker.movePPs[moveIdx] !== undefined) {
        attacker.movePPs[moveIdx] = Math.max(0, attacker.movePPs[moveIdx] - 1);
        if (attacker.movePPs[moveIdx] === 0) {
          message += ` [PP esausti per ${move.name}]`;
        }
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
      message,
      floatEvents,
    };
  }
}
