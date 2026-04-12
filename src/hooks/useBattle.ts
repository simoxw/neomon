import { useState, useEffect, useCallback, useRef } from 'react';
import { NeoMon, Move } from '../types';
import {
  BattleEngine,
  BattleAction,
  FullTurnResult,
  TurnExecutionResult,
  FloatEvent,
} from '../logic/BattleEngine';
import movesData from '../data/moves.json';
import { db } from '../db';
import { useStore } from '../context/useStore';
import { expGainFromBattle } from '../logic/expFormula';
import { calculateRewards, rollMaterialDropFromTypes } from '../logic/battleRewards';
import creaturesData from '../data/creatures.json';
import { generateWildMon, generateWildMonWithMoves } from '../logic/generateWildMon';
import { resolveMoveById } from '../logic/moveLookup';
import { calculateDamage } from '../logic/DamageCalc';
import type { BattleLogEntry, BattleLogKind } from '../types/battleLog';
import { ensureBattleFields } from '../logic/normalizeCreature';
import { createDefaultStatStages } from '../logic/statStages';
import { pickCreatureIdFromPool, randomLevelInZone } from '../logic/worldEncounters';
import trainersData from '../data/trainers.json';
import itemsCatalog from '../data/items.json';
import type { TrainerData } from '../types/world';
import type { BattleSummaryPayload } from '../types/battleSummary';

const DEFAULT_MOVE_IDS = ['m-pri-01'] as const;

interface BattleEntity extends NeoMon {
  currentHp: number;
  currentStamina: number;
}

function withMoves(mon: NeoMon): NeoMon {
  const m = mon.moves;
  if (Array.isArray(m) && m.length > 0) return mon;
  return { ...mon, moves: [...DEFAULT_MOVE_IDS] };
}

function mergeBattleFromClone<T extends BattleEntity | null>(prev: T, clone: BattleEntity | null): T {
  if (!prev || !clone) return prev;
  return {
    ...prev,
    currentHp: clone.currentHp,
    currentStamina: clone.currentStamina,
    status: clone.status ?? null,
    statStages: clone.statStages ?? createDefaultStatStages(),
    sleepTurnsRemaining: clone.sleepTurnsRemaining ?? 0,
    statBoostHistory: (clone as any).statBoostHistory ?? [],
  } as T;
}

export type DamageFloat = FloatEvent & { id: string };

function buildTrainerOpponent(trainer: TrainerData, monIndex: number, allMoves: Move[]): BattleEntity {
  const slot = trainer.team[monIndex];
  if (!slot) throw new Error('Trainer team slot missing');
  const gen = generateWildMonWithMoves(slot.creatureId, slot.level, slot.moves);
  const opp = ensureBattleFields(gen as any) as NeoMon;
  return {
    ...(opp as BattleEntity),
    moves: opp.moves ?? [...DEFAULT_MOVE_IDS],
    currentHp: opp.currentStats!.hp,
    currentStamina: opp.currentStats!.stamina,
  };
}

export const useBattle = (_playerId: string, _opponentId: string) => {
  const battleSessionKey = useStore((s) => s.battleSessionKey);
  const {
    grantExperience,
    updateCoins,
    persistNeoMon,
    setLastBattleSummary,
    recordBattleWin,
    markTrainerDefeated,
    addBadge,
    grantInventoryItem,
  } = useStore();

  const [playerMon, setPlayerMon] = useState<BattleEntity | null>(null);
  const [opponentMon, setOpponentMon] = useState<BattleEntity | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [isTurnInProgress, setIsTurnInProgress] = useState(false);
  const [status, setStatus] = useState<'idle' | 'fighting' | 'won' | 'lost' | 'escaped'>('idle');
  const [allMoves, setAllMoves] = useState<Move[]>([]);
  const [damageFloats, setDamageFloats] = useState<DamageFloat[]>([]);
  const playerMonRef = useRef<BattleEntity | null>(null);
  const opponentMonRef = useRef<BattleEntity | null>(null);
  playerMonRef.current = playerMon;
  opponentMonRef.current = opponentMon;

  const pushFloats = useCallback((events: FloatEvent[] | undefined) => {
    if (!events?.length) return;
    const stamp = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const next: DamageFloat[] = events.map((e, i) => ({ ...e, id: `${stamp}_${i}` }));
    setDamageFloats((prev) => [...prev, ...next]);
    setTimeout(() => {
      setDamageFloats((prev) => prev.filter((x) => !next.some((n) => n.id === x.id)));
    }, 1100);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const initBattle = async () => {
      setStatus('idle');
      setIsTurnInProgress(false);
      setBattleLog([]);
      setDamageFloats([]);
      setPlayerMon(null);
      setOpponentMon(null);

      try {
        const flattenedMoves: Move[] = (movesData as unknown as Move[][]).flat();
        if (isCancelled) return;
        setAllMoves(flattenedMoves);

        const team = await db.team.toArray();
        if (isCancelled) return;

        if (team.length === 0) {
          setBattleLog([{ text: '⚠ Nessun Neo-Mon in squadra!', kind: 'system' }]);
          setStatus('lost');
          return;
        }

        const raw = team[0];
        if (!raw) {
          setBattleLog([{ text: '⚠ Errore: impossibile caricare il Neo-Mon.', kind: 'system' }]);
          setStatus('lost');
          return;
        }

        const pMon = ensureBattleFields(withMoves(raw) as any) as NeoMon;
        const stats = pMon.currentStats || pMon.baseStats;
        if (isCancelled) return;

        setPlayerMon({
          ...(pMon as BattleEntity),
          moves: pMon.moves ?? [...DEFAULT_MOVE_IDS],
          currentHp: stats.hp,
          currentStamina: stats.stamina,
        });

        const ctx = useStore.getState().battleContext;
        let generatedOpponent: NeoMon;

        if (ctx?.kind === 'trainer') {
          const trainer = (trainersData as TrainerData[]).find((t) => t.id === ctx.trainerId);
          if (!trainer || !trainer.team[ctx.monIndex]) {
            setBattleLog([{ text: '⚠ Allenatore non valido.', kind: 'system' }]);
            setStatus('lost');
            return;
          }
          const slot = trainer.team[ctx.monIndex];
          generatedOpponent = generateWildMonWithMoves(slot.creatureId, slot.level, slot.moves);
        } else if (ctx?.kind === 'zone') {
          const cid = pickCreatureIdFromPool(ctx.encounterPool, ctx.encounterRates);
          const lv = randomLevelInZone({ minLevel: ctx.minLevel, maxLevel: ctx.maxLevel });
          generatedOpponent = generateWildMon(cid, lv);
        } else {
          const availableCreatureIds = (creaturesData as { id: string }[])
            .map((c) => c.id)
            .filter((id) => {
              const num = parseInt(id.split('-')[1], 10);
              return num <= 26;
            });
          const randomId = availableCreatureIds[Math.floor(Math.random() * availableCreatureIds.length)];
          generatedOpponent = generateWildMon(randomId, pMon.level);
        }

        if (isCancelled) return;

        const opp = ensureBattleFields(generatedOpponent as any) as NeoMon;
        setOpponentMon({
          ...(opp as BattleEntity),
          moves: opp.moves ?? [...DEFAULT_MOVE_IDS],
          currentHp: opp.currentStats!.hp,
          currentStamina: opp.currentStats!.stamina,
        });

        setStatus('fighting');
        const wildLabel =
          ctx?.kind === 'trainer'
            ? `${(trainersData as TrainerData[]).find((t) => t.id === ctx.trainerId)?.name ?? 'Allenatore'}`
            : 'selvatico';
        setBattleLog([
          {
            text:
              ctx?.kind === 'trainer'
                ? `Sfida! ${wildLabel} invia ${generatedOpponent.name}!`
                : `Inizia la battaglia contro ${generatedOpponent.name} ${ctx?.kind === 'zone' ? 'nel distretto' : 'selvatico'}!`,
            kind: 'neutral',
          },
        ]);
      } catch (err) {
        console.error('Errore inizializzazione battaglia:', err);
        if (!isCancelled) {
          setBattleLog([{ text: '⚠ Errore durante il caricamento della battaglia.', kind: 'system' }]);
          setStatus('lost');
        }
      }
    };

    void initBattle();

    return () => {
      isCancelled = true;
    };
  }, [battleSessionKey]);

  const addLog = useCallback((msg: string, kind: BattleLogKind = 'neutral') => {
    setBattleLog((prev) => [...prev.slice(-4), { text: msg, kind }]);
  }, []);

  const logKindForResult = (res: TurnExecutionResult): BattleLogKind => {
    if (res.action.type === 'rest') return 'status';
    if (res.isStaminaFailure) return 'status';
    if (res.damage > 0 && res.playerId === 'player') return 'damageOut';
    if (res.damage > 0 && res.playerId === 'ai') return 'damageIn';
    return 'neutral';
  };

  const openSummary = useCallback(
    (payload: BattleSummaryPayload) => {
      setLastBattleSummary(payload);
      setStatus('won');
    },
    [setLastBattleSummary]
  );

  const handleWildOrZoneVictory = useCallback(
    async (oClone: BattleEntity, expFallback: number) => {
      const ref = playerMonRef.current;
      if (!ref) return;
      const ctx = useStore.getState().battleContext;
      const isTrainer = ctx?.kind === 'trainer';
      const matDrop = rollMaterialDropFromTypes(oClone.types.map(String));
      const rewards = calculateRewards({
        enemy: oClone,
        isTrainer,
        dropItem: matDrop,
      });
      const xp = isTrainer ? expFallback : Math.max(rewards.xpGained, expGainFromBattle({ id: oClone.id, level: oClone.level }));
      const coins = rewards.coinsGained;

      setStatus('idle');
      if (import.meta.env.DEV) {
        console.debug('[Battle] victory rewards', { xp, coins, itemDrop: rewards.itemDrop });
      }
      updateCoins(coins);
      await grantExperience(ref.id, xp);
      if (rewards.itemDrop) await grantInventoryItem(rewards.itemDrop, 1);

      recordBattleWin({ foeTypes: oClone.types.map(String), zoneId: ctx?.kind === 'zone' ? ctx.zoneId : undefined });

      const live = useStore.getState().team.find((m) => m.id === ref.id);
      const levelUp =
        live && live.level > ref.level
          ? { monName: live.name, fromLv: ref.level, toLv: live.level }
          : null;

      const dropMeta = rewards.itemDrop
        ? {
            itemId: rewards.itemDrop,
            name: (itemsCatalog as { id: string; name: string }[]).find((i) => i.id === rewards.itemDrop)?.name ?? rewards.itemDrop,
          }
        : null;

      openSummary({
        foeName: oClone.name,
        xpGained: xp,
        coinsGained: coins,
        itemDrop: dropMeta,
        levelUp,
        showExploreAgain: ctx?.kind === 'zone',
        returnScreen: ctx?.kind === 'zone' || ctx?.kind === 'trainer' ? 'worldmap' : 'hub',
      });
    },
    [grantExperience, updateCoins, grantInventoryItem, recordBattleWin, openSummary]
  );

  const handleTrainerMultiWin = useCallback(
    async (trainer: TrainerData, oClone: BattleEntity, expAmt: number) => {
      const ref = playerMonRef.current;
      if (!ref) return;
      const ctx = useStore.getState().battleContext;
      if (ctx?.kind !== 'trainer') return;
      const next = ctx.monIndex + 1;
      await grantExperience(ref.id, expAmt);
      if (next < trainer.team.length) {
        useStore.getState().setBattleContext({ kind: 'trainer', trainerId: trainer.id, monIndex: next });
        try {
          const nextEnt = buildTrainerOpponent(trainer, next, allMoves);
          setOpponentMon(nextEnt);
          addLog(`${trainer.name} manda in campo ${nextEnt.name}!`, 'system');
          setStatus('fighting');
        } catch (e) {
          console.error(e);
        }
        return;
      }

      updateCoins(trainer.reward.coins);
      if (trainer.reward.items) {
        for (const it of trainer.reward.items) {
          await grantInventoryItem(it.id, it.qty);
        }
      }
      if (trainer.reward.badge) await addBadge(trainer.reward.badge);
      await markTrainerDefeated(trainer.id);
      recordBattleWin({ foeTypes: oClone.types.map(String) });

      openSummary({
        foeName: trainer.name,
        xpGained: expAmt,
        coinsGained: trainer.reward.coins,
        itemDrop: null,
        levelUp: null,
        trainerDialogueWin: trainer.dialogue.win,
        trainerCoins: trainer.reward.coins,
        trainerBadge: trainer.reward.badge ?? null,
        showExploreAgain: false,
        returnScreen: 'worldmap',
      });
    },
    [
      allMoves,
      addBadge,
      addLog,
      grantExperience,
      grantInventoryItem,
      markTrainerDefeated,
      openSummary,
      recordBattleWin,
      updateCoins,
    ]
  );

  const processTurnResults = useCallback(
    async (result: FullTurnResult, pClone: BattleEntity, oClone: BattleEntity) => {
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      const executeAndLog = async (res: TurnExecutionResult) => {
        addLog(res.message, logKindForResult(res));
        pushFloats(res.floatEvents);

        if (res.playerId === 'player') {
          setPlayerMon((prev) =>
            prev
              ? {
                  ...prev,
                  currentStamina: Math.max(0, prev.currentStamina - res.consumedStamina + res.recoveredStamina),
                }
              : null
          );
          setOpponentMon((prev) =>
            prev
              ? {
                  ...prev,
                  currentHp: Math.max(0, prev.currentHp - res.damage),
                }
              : null
          );
        } else {
          setOpponentMon((prev) =>
            prev
              ? {
                  ...prev,
                  currentStamina: Math.max(0, prev.currentStamina - res.consumedStamina + res.recoveredStamina),
                }
              : null
          );
          setPlayerMon((prev) =>
            prev
              ? {
                  ...prev,
                  currentHp: Math.max(0, prev.currentHp - res.damage),
                }
              : null
          );
        }

        await sleep(1000);
      };

      await executeAndLog(result.first);

      if (
        !result.isBattleOver ||
        (result.winner === 'player' && result.first.playerId === 'ai') ||
        (result.winner === 'ai' && result.first.playerId === 'player')
      ) {
        if (!result.second.isKO) {
          await executeAndLog(result.second);
        }
      }

      pushFloats(result.endOfTurnFloats);
      for (const m of result.endOfTurnMessages || []) addLog(m, 'status');

      setPlayerMon((prev) => mergeBattleFromClone(prev, pClone));
      setOpponentMon((prev) => mergeBattleFromClone(prev, oClone));

      if (result.isBattleOver) {
        if (result.winner === 'player') {
          const ctx = useStore.getState().battleContext;
          const expGained = expGainFromBattle({ id: oClone.id, level: oClone.level });
          addLog(`Vittoria! +${expGained} EXP (sync calcolo).`, 'system');
          if (import.meta.env.DEV) {
            console.debug('[Battle] victory', { expGained, foeId: oClone.id, foeLevel: oClone.level, ctx });
          }

          if (ctx?.kind === 'trainer') {
            const trainer = (trainersData as TrainerData[]).find((t) => t.id === ctx.trainerId);
            if (trainer) {
              await handleTrainerMultiWin(trainer, oClone, expGained);
            }
          } else {
            await handleWildOrZoneVictory(oClone, expGained);
          }
        } else {
          setStatus('lost');
          addLog('Sei stato sconfitto... I tuoi Neo-Mon hanno bisogno di riposo.', 'damageIn');
          const ctx = useStore.getState().battleContext;
          if (ctx?.kind === 'trainer') {
            const tr = (trainersData as TrainerData[]).find((t) => t.id === ctx.trainerId);
            if (tr) addLog(tr.dialogue.lose, 'neutral');
          }
        }
      }
    },
    [addLog, handleTrainerMultiWin, handleWildOrZoneVictory, pushFloats]
  );

  const handleAction = useCallback(
    async (actionType: 'move' | 'rest' | 'switch', moveId?: string) => {
      if (!playerMon || !opponentMon || isTurnInProgress || status !== 'fighting') return;

      if (actionType === 'switch' && moveId) {
        setIsTurnInProgress(true);
        const team = await db.team.toArray();
        const newMonRaw = team.find((m) => m.id === moveId);
        if (newMonRaw) {
          const newMon = ensureBattleFields(withMoves(newMonRaw) as any) as NeoMon;
          const st = newMon.currentStats || newMon.baseStats;
          let currentHp = st.hp;
          const currentStamina = st.stamina;
          addLog(`Vai ${newMon.name}! Cambiato in campo!`, 'system');
          const aiAction = BattleEngine.getBestMoveAI(
            opponentMon,
            { ...newMon, currentHp, currentStamina } as BattleEntity,
            allMoves
          );
          const oClone = JSON.parse(JSON.stringify(opponentMon));
          oClone.currentHp = opponentMon.currentHp;
          oClone.currentStamina = opponentMon.currentStamina;
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (aiAction.move) {
            addLog(`${opponentMon.name} usa ${aiAction.move.name}!`, 'damageIn');
            const dmg = Math.max(1, Math.floor((oClone.currentStats?.potenza || oClone.baseStats.potenza) * 0.5));
            currentHp = Math.max(0, currentHp - dmg);
          }
          const switched: BattleEntity = {
            ...(newMon as BattleEntity),
            moves: newMon.moves ?? [...DEFAULT_MOVE_IDS],
            currentHp,
            currentStamina,
          };
          setPlayerMon(switched);
          await persistNeoMon({ ...switched, currentStats: switched.currentStats || switched.baseStats });
        }
        setIsTurnInProgress(false);
        return;
      }

      setIsTurnInProgress(true);

      const playerAction: BattleAction = {
        type: actionType,
        moveId,
        move: moveId ? allMoves.find((m) => m.id === moveId) : undefined,
      };

      const aiAction = BattleEngine.getBestMoveAI(opponentMon, playerMon, allMoves);

      const pClone = JSON.parse(JSON.stringify(playerMon)) as BattleEntity;
      const oClone = JSON.parse(JSON.stringify(opponentMon)) as BattleEntity;

      pClone.currentStamina = playerMon.currentStamina;
      pClone.currentHp = playerMon.currentHp;
      oClone.currentStamina = opponentMon.currentStamina;
      oClone.currentHp = opponentMon.currentHp;

      const turnResult = BattleEngine.executeTurn(pClone, oClone, playerAction, aiAction, allMoves);

      await processTurnResults(turnResult, pClone, oClone);

      const won = turnResult.isBattleOver && turnResult.winner === 'player';
      const trainerCtx = useStore.getState().battleContext?.kind === 'trainer';
      if (won && trainerCtx) {
        const liveFromStore = useStore.getState().team.find((m) => m.id === playerMon.id) ?? playerMon;
        const pFinal = {
          ...liveFromStore,
          currentHp: pClone.currentHp,
          currentStamina: pClone.currentStamina,
          currentStats: liveFromStore.currentStats ?? liveFromStore.baseStats,
          status: pClone.status ?? null,
          statStages: pClone.statStages ?? createDefaultStatStages(),
          sleepTurnsRemaining: pClone.sleepTurnsRemaining ?? 0,
        } as NeoMon;
        await persistNeoMon(pFinal);
        setIsTurnInProgress(false);
        return;
      }

      const liveFromStore = won ? useStore.getState().team.find((m) => m.id === playerMon.id) : undefined;
      const baseMon = liveFromStore ?? playerMon;

      const pFinal = {
        ...baseMon,
        currentHp: pClone.currentHp,
        currentStamina: pClone.currentStamina,
        currentStats: baseMon.currentStats ?? baseMon.baseStats,
        status: pClone.status ?? null,
        statStages: pClone.statStages ?? createDefaultStatStages(),
        sleepTurnsRemaining: pClone.sleepTurnsRemaining ?? 0,
      } as NeoMon;

      if (import.meta.env.DEV) {
        console.debug('[Battle] persistNeoMon', {
          won,
          exp: pFinal.exp,
          level: pFinal.level,
          hp: pClone.currentHp,
        });
      }

      await persistNeoMon(pFinal);

      setIsTurnInProgress(false);
    },
    [playerMon, opponentMon, isTurnInProgress, status, allMoves, persistNeoMon, processTurnResults, addLog]
  );

  const handleSelectMove = useCallback(
    (move: Move) => {
      void handleAction('move', move.id);
    },
    [handleAction]
  );

  const handleFlee = useCallback(() => {
    if (!playerMon || !opponentMon || isTurnInProgress || status !== 'fighting') return;
    const ctx = useStore.getState().battleContext;
    if (ctx?.kind === 'trainer') {
      addLog('Non puoi fuggire da una sfida ufficiale!', 'system');
      return;
    }
    const pSp = BattleEngine.effectiveSpeed(playerMon);
    const eSp = BattleEngine.effectiveSpeed(opponentMon);
    const rollCap = Math.min(192, Math.floor((pSp / Math.max(1, eSp)) * 128));
    if (Math.random() * 256 < rollCap) {
      addLog('Sei riuscito a fuggire dalla battaglia!', 'system');
      setStatus('escaped');
    } else {
      addLog('Non sei riuscito a fuggire!', 'system');
    }
  }, [playerMon, opponentMon, isTurnInProgress, status, addLog]);

  const afterCatchFailure = useCallback(async () => {
    const p = playerMonRef.current;
    const o = opponentMonRef.current;
    if (!p || !o || status !== 'fighting') return;

    const aiAction = BattleEngine.getBestMoveAI(o, p, allMoves);
    if (aiAction.type === 'rest' || !aiAction.moveId) {
      addLog(`${o.name} osserva il Prisma cadere...`, 'neutral');
      return;
    }
    const move = resolveMoveById(aiAction.moveId, allMoves);
    const oClone = JSON.parse(JSON.stringify(o)) as BattleEntity;
    const pClone = JSON.parse(JSON.stringify(p)) as BattleEntity;
    oClone.currentHp = o.currentHp;
    oClone.currentStamina = o.currentStamina;
    pClone.currentHp = p.currentHp;
    pClone.currentStamina = p.currentStamina;

    const dmg = Math.max(1, Math.floor(calculateDamage(oClone, pClone, move)));
    addLog(`${o.name} contrattacca con ${move.name}!`, 'damageIn');
    pushFloats([{ side: 'player', amount: dmg, variant: 'damage' }]);
    const nextHp = Math.max(0, p.currentHp - dmg);
    const nextEnemyStam = Math.max(0, o.currentStamina - move.staminaCost);
    setPlayerMon((prev) => (prev ? { ...prev, currentHp: nextHp } : null));
    setOpponentMon((prev) => (prev ? { ...prev, currentStamina: nextEnemyStam } : null));

    if (nextHp <= 0) {
      setStatus('lost');
      addLog('Il tuo Neo-Mon non regge più...', 'damageIn');
    }
    const merged = { ...p, currentHp: nextHp, currentStats: p.currentStats || p.baseStats };
    await persistNeoMon(merged);
  }, [allMoves, status, addLog, persistNeoMon, pushFloats]);

  const activeMoves = (playerMon?.moves ?? [])
    .slice(0, 4)
    .map((id) => allMoves.find((m) => m.id === id))
    .filter((m): m is Move => !!m);

  return {
    playerMon,
    opponentMon,
    battleLog,
    isTurnInProgress,
    status,
    allMoves,
    handleAction,
    handleSelectMove,
    handleFlee,
    afterCatchFailure,
    damageFloats,
    activeMoves,
  };
};
