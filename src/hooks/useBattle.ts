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
import {
  type PartySlot,
  initPartySlotsFromTeam,
  findFirstAliveSlotIndex,
  writeSlotFromBattle,
  getMaxHp,
  getMaxStamina,
} from '../logic/battleParty';
import { pickCreatureIdFromPool, randomLevelInZone } from '../logic/worldEncounters';
import trainersData from '../data/trainers.json';
import itemsCatalog from '../data/items.json';
import type { TrainerData } from '../types/world';
import type { BattleSummaryPayload } from '../types/battleSummary';
import { computeCurativeHeal, type CurativeTarget } from '../logic/battleItems';

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

function buildPlayerEntity(raw: NeoMon, slot: PartySlot): BattleEntity {
  const mon = ensureBattleFields(withMoves(raw) as NeoMon & Record<string, unknown>) as NeoMon;
  const maxHp = getMaxHp(mon);
  const maxSt = getMaxStamina(mon);
  
  // Inizializza movePPs se non presenti (default 15 PP per mossa)
  const movePPs = raw.movePPs?.length === mon.moves.length
    ? [...(raw.movePPs ?? [])]
    : (mon.moves ?? [...DEFAULT_MOVE_IDS]).map(() => 15);
  
  return {
    ...(mon as BattleEntity),
    currentStats: mon.currentStats ?? mon.baseStats,
    moves: mon.moves ?? [...DEFAULT_MOVE_IDS],
    movePPs,
    currentHp: Math.min(Math.max(0, slot.currentHp), maxHp),
    currentStamina: Math.min(Math.max(0, slot.currentStamina), maxSt),
  };
}

function mergeBattleIntoNeoMon(raw: NeoMon, ent: BattleEntity): NeoMon {
  return {
    ...raw,
    currentHp: ent.currentHp,
    currentStamina: ent.currentStamina,
    status: ent.status ?? null,
    statStages: ent.statStages ?? createDefaultStatStages(),
    sleepTurnsRemaining: ent.sleepTurnsRemaining ?? 0,
    statBoostHistory: ((ent as BattleEntity & { statBoostHistory?: string[] }).statBoostHistory ?? []) as string[],
  } as NeoMon;
}

export type DamageFloat = FloatEvent & { id: string };

function buildTrainerOpponent(trainer: TrainerData, monIndex: number, allMoves: Move[]): BattleEntity {
  const slot = trainer.team[monIndex];
  if (!slot) throw new Error('Trainer team slot missing');
  const gen = generateWildMonWithMoves(slot.creatureId, slot.level, slot.moves);
  const opp = ensureBattleFields(gen as any) as NeoMon;
  
  // Inizializza movePPs (default 15 PP per mossa)
  const movePPs = (opp.moves ?? [...DEFAULT_MOVE_IDS]).map(() => 15);
  
  return {
    ...(opp as BattleEntity),
    moves: opp.moves ?? [...DEFAULT_MOVE_IDS],
    movePPs,
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
  const battleConsumableRequest = useStore((s) => s.battleConsumableRequest);

  const [playerMon, setPlayerMon] = useState<BattleEntity | null>(null);
  const [opponentMon, setOpponentMon] = useState<BattleEntity | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [isTurnInProgress, setIsTurnInProgress] = useState(false);
  const [status, setStatus] = useState<'idle' | 'fighting' | 'won' | 'lost' | 'escaped'>('idle');
  const [allMoves, setAllMoves] = useState<Move[]>([]);
  const [damageFloats, setDamageFloats] = useState<DamageFloat[]>([]);
  const [partySlots, setPartySlots] = useState<PartySlot[]>([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const partySlotsRef = useRef<PartySlot[]>([]);
  const activeSlotRef = useRef(0);
  const playerMonRef = useRef<BattleEntity | null>(null);
  const opponentMonRef = useRef<BattleEntity | null>(null);
  playerMonRef.current = playerMon;
  opponentMonRef.current = opponentMon;

  const syncPartySlotsRef = useCallback((next: PartySlot[]) => {
    partySlotsRef.current = next;
    setPartySlots(next);
  }, []);

  const setActiveSlot = useCallback((i: number) => {
    activeSlotRef.current = i;
    setActiveSlotIndex(i);
  }, []);

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
      syncPartySlotsRef([]);
      setActiveSlot(0);

      try {
        const flattenedMoves: Move[] = (movesData as unknown as Move[][]).flat();
        if (isCancelled) return;
        setAllMoves(flattenedMoves);

        const team = useStore.getState().team;
        if (isCancelled) return;

        if (team.length === 0) {
          setBattleLog([{ text: '⚠ Nessun Neo-Mon in squadra!', kind: 'system' }]);
          setStatus('lost');
          return;
        }

        const slots = initPartySlotsFromTeam(team);
        const firstIdx = findFirstAliveSlotIndex(slots);
        if (firstIdx === null) {
          setBattleLog([{ text: '⚠ Tutta la squadra è esausta!', kind: 'system' }]);
          setStatus('lost');
          return;
        }

        const raw = team[firstIdx];
        if (!raw) {
          setBattleLog([{ text: '⚠ Errore: impossibile caricare il Neo-Mon.', kind: 'system' }]);
          setStatus('lost');
          return;
        }

        if (isCancelled) return;

        syncPartySlotsRef(slots.map((s) => ({ ...s })));
        setActiveSlot(firstIdx);

        setPlayerMon(buildPlayerEntity(raw, slots[firstIdx]));

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
          generatedOpponent = generateWildMon(randomId, raw.level);
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
  }, [battleSessionKey, syncPartySlotsRef, setActiveSlot]);

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

  /** Persiste il KO nello slot, manda il prossimo vivo se c'è; ritorna false se la lotta è persa. */
  const sendNextMonIfAnyAfterFaint = useCallback(
    async (faintedSlotIndex: number, faintedClone: BattleEntity): Promise<boolean> => {
      const team = useStore.getState().team;
      const rawFainted = team[faintedSlotIndex];
      if (rawFainted) {
        await persistNeoMon(
          mergeBattleIntoNeoMon(rawFainted, { ...faintedClone, currentHp: 0, currentStamina: faintedClone.currentStamina })
        );
      }

      const afterFaint = partySlotsRef.current.map((s) => ({ ...s }));
      writeSlotFromBattle(afterFaint, faintedSlotIndex, 0, faintedClone.currentStamina);
      syncPartySlotsRef(afterFaint);

      const nextIdx = findFirstAliveSlotIndex(partySlotsRef.current);
      if (nextIdx === null) {
        setStatus('lost');
        addLog('Tutta la squadra è stata sconfitta!', 'damageIn');
        const ctx = useStore.getState().battleContext;
        if (ctx?.kind === 'trainer') {
          const tr = (trainersData as TrainerData[]).find((t) => t.id === ctx.trainerId);
          if (tr) addLog(tr.dialogue.lose, 'neutral');
        }
        return false;
      }

      const rawNext = team[nextIdx];
      if (!rawNext) {
        setStatus('lost');
        return false;
      }

      setActiveSlot(nextIdx);
      const slotNext = partySlotsRef.current[nextIdx];
      const ent = buildPlayerEntity(rawNext, slotNext);
      setPlayerMon(ent);
      setStatus('fighting');
      addLog(`Vai! ${ent.name}!`, 'system');
      await persistNeoMon(mergeBattleIntoNeoMon(rawNext, ent));
      return true;
    },
    [addLog, persistNeoMon, syncPartySlotsRef, setActiveSlot]
  );

  const processTurnResults = useCallback(
    async (result: FullTurnResult, pClone: BattleEntity, oClone: BattleEntity): Promise<boolean> => {
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

      const act = activeSlotRef.current;
      const synced = partySlotsRef.current.map((s) => ({ ...s }));
      writeSlotFromBattle(synced, act, pClone.currentHp, pClone.currentStamina);
      syncPartySlotsRef(synced);

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
          return true;
        }

        if (pClone.currentHp <= 0) {
          await sendNextMonIfAnyAfterFaint(act, pClone);
          return false;
        }

        setStatus('lost');
        addLog('Sei stato sconfitto... I tuoi Neo-Mon hanno bisogno di riposo.', 'damageIn');
        const ctx = useStore.getState().battleContext;
        if (ctx?.kind === 'trainer') {
          const tr = (trainersData as TrainerData[]).find((t) => t.id === ctx.trainerId);
          if (tr) addLog(tr.dialogue.lose, 'neutral');
        }
        return false;
      }

      return true;
    },
    [addLog, handleTrainerMultiWin, handleWildOrZoneVictory, pushFloats, syncPartySlotsRef, sendNextMonIfAnyAfterFaint]
  );

  const handleAction = useCallback(
    async (actionType: 'move' | 'rest' | 'switch', moveId?: string) => {
      if (!playerMon || !opponentMon || isTurnInProgress || status !== 'fighting') return;

      if (actionType === 'switch' && moveId) {
        setIsTurnInProgress(true);
        const team = useStore.getState().team;
        const newIdx = team.findIndex((m) => m.id === moveId);
        const oldIdx = activeSlotRef.current;
        if (newIdx === -1 || newIdx === oldIdx) {
          setIsTurnInProgress(false);
          return;
        }
        // Ensure partySlots is in sync before reading incoming slot
        const currentSlots = partySlotsRef.current.length === team.length 
          ? partySlotsRef.current 
          : initPartySlotsFromTeam(team);
        const slotIncoming = currentSlots[newIdx];
        if (!slotIncoming || slotIncoming.currentHp <= 0) {
          addLog('Questo Neo-Mon non può entrare in campo!', 'system');
          setIsTurnInProgress(false);
          return;
        }

        const newMonRaw = team[newIdx];
        const outgoing = playerMon;
        const outgoingRaw = team[oldIdx];

        if (newMonRaw && outgoing) {
          const synced = partySlotsRef.current.map((s) => ({ ...s }));
          writeSlotFromBattle(synced, oldIdx, outgoing.currentHp, outgoing.currentStamina);
          syncPartySlotsRef(synced);
          if (outgoingRaw) {
            await persistNeoMon(mergeBattleIntoNeoMon(outgoingRaw, outgoing));
          }

          const newMon = ensureBattleFields(withMoves(newMonRaw) as NeoMon & Record<string, unknown>) as NeoMon;
          let currentHp = slotIncoming.currentHp;
          let currentStamina = slotIncoming.currentStamina;
          addLog(`Vai ${newMon.name}! Cambiato in campo!`, 'system');
          const slotSlice: PartySlot = {
            speciesId: newMonRaw.id,
            currentHp,
            currentStamina,
          };
          const entPreview = buildPlayerEntity(newMonRaw, slotSlice);
          const aiAction = BattleEngine.getBestMoveAI(opponentMon, entPreview, allMoves);
          const oClone = JSON.parse(JSON.stringify(opponentMon)) as BattleEntity;
          oClone.currentHp = opponentMon.currentHp;
          oClone.currentStamina = opponentMon.currentStamina;
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (aiAction.type !== 'rest' && aiAction.move) {
            addLog(`${opponentMon.name} usa ${aiAction.move.name}!`, 'damageIn');
            const move = resolveMoveById(aiAction.moveId!, allMoves);
            const pIncoming = buildPlayerEntity(newMonRaw, { ...slotSlice, currentHp, currentStamina });
            const dmg = Math.max(1, Math.floor(calculateDamage(oClone, pIncoming, move)));
            pushFloats([{ side: 'player', amount: dmg, variant: 'damage' }]);
            currentHp = Math.max(0, currentHp - dmg);
            const nextOppStam = Math.max(0, opponentMon.currentStamina - move.staminaCost);
            setOpponentMon((prev) => (prev ? { ...prev, currentStamina: nextOppStam } : null));
          }

          const afterSwitch = partySlotsRef.current.map((s) => ({ ...s }));
          writeSlotFromBattle(afterSwitch, newIdx, currentHp, currentStamina);
          syncPartySlotsRef(afterSwitch);

          const switched = buildPlayerEntity(newMonRaw, {
            speciesId: newMonRaw.id,
            currentHp,
            currentStamina,
          });

          if (currentHp <= 0) {
            await sendNextMonIfAnyAfterFaint(newIdx, switched);
          } else {
            setActiveSlot(newIdx);
            setPlayerMon(switched);
            await persistNeoMon(mergeBattleIntoNeoMon(newMonRaw, switched));
          }
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

      const shouldPersistEnd = await processTurnResults(turnResult, pClone, oClone);

      const won = turnResult.isBattleOver && turnResult.winner === 'player';
      const trainerCtx = useStore.getState().battleContext?.kind === 'trainer';
      if (!shouldPersistEnd) {
        setIsTurnInProgress(false);
        return;
      }

      const refMon = playerMonRef.current;
      if (!refMon) {
        setIsTurnInProgress(false);
        return;
      }

      if (won && trainerCtx) {
        const liveFromStore = useStore.getState().team.find((m) => m.id === refMon.id) ?? refMon;
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

      const liveFromStore = won ? useStore.getState().team.find((m) => m.id === refMon.id) : undefined;
      const baseMon = liveFromStore ?? refMon;

      const pFinal = {
        ...baseMon,
        currentHp: pClone.currentHp,
        currentStamina: pClone.currentStamina,
        currentStats: baseMon.currentStats ?? baseMon.baseStats,
        status: pClone.status ?? null,
        statStages: pClone.statStages ?? createDefaultStatStages(),
        sleepTurnsRemaining: pClone.sleepTurnsRemaining ?? 0,
        // Ripristina PP a 15 dopo la battaglia vinta
        movePPs: (baseMon.moves ?? []).map(() => 15),
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
    [
      playerMon,
      opponentMon,
      isTurnInProgress,
      status,
      allMoves,
      persistNeoMon,
      processTurnResults,
      addLog,
      pushFloats,
      syncPartySlotsRef,
      setActiveSlot,
      sendNextMonIfAnyAfterFaint,
    ]
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

  const processBattleItem = useCallback(
    async (itemId: string) => {
      const item = (itemsCatalog as { id: string; type: string; name: string; target?: string; value?: number }[]).find(
        (i) => i.id === itemId
      );
      if (!item || item.type !== 'curative') {
        addLog('Oggetto non utilizzabile in lotta.', 'system');
        return;
      }
      const ok = await useStore.getState().consumeInventoryItem(itemId, 1);
      if (!ok) {
        addLog('Quantità insufficiente!', 'system');
        return;
      }
      const p = playerMonRef.current;
      const o = opponentMonRef.current;
      if (!p || !o) return;

      const target = (item.target as CurativeTarget) || 'hp';
      const value = item.value ?? 0;
      const maxHp = getMaxHp(p);
      const maxSt = getMaxStamina(p);
      const { nextHp, nextSt } = computeCurativeHeal(target, value, p.currentHp, maxHp, p.currentStamina, maxSt);

      const healed: BattleEntity = { ...p, currentHp: nextHp, currentStamina: nextSt };
      setPlayerMon(healed);
      playerMonRef.current = healed;

      const act = activeSlotRef.current;
      const synced = partySlotsRef.current.map((s) => ({ ...s }));
      writeSlotFromBattle(synced, act, nextHp, nextSt);
      syncPartySlotsRef(synced);

      const raw = useStore.getState().team[act];
      if (raw) await persistNeoMon(mergeBattleIntoNeoMon(raw, healed));

      addLog(`Hai usato ${item.name}!`, 'system');

      const aiAction = BattleEngine.getBestMoveAI(o, healed, allMoves);
      if (aiAction.type === 'rest' || !aiAction.moveId) {
        addLog(`${o.name} attende...`, 'neutral');
        return;
      }
      const move = resolveMoveById(aiAction.moveId, allMoves);
      const oClone = JSON.parse(JSON.stringify(o)) as BattleEntity;
      const pClone = JSON.parse(JSON.stringify(healed)) as BattleEntity;
      oClone.currentHp = o.currentHp;
      oClone.currentStamina = o.currentStamina;
      pClone.currentHp = healed.currentHp;
      pClone.currentStamina = healed.currentStamina;

      const dmg = Math.max(1, Math.floor(calculateDamage(oClone, pClone, move)));
      addLog(`${o.name} reagisce con ${move.name}!`, 'damageIn');
      pushFloats([{ side: 'player', amount: dmg, variant: 'damage' }]);
      const hpAfter = Math.max(0, healed.currentHp - dmg);
      const nextOppStam = Math.max(0, o.currentStamina - move.staminaCost);
      setPlayerMon((prev) => (prev ? { ...prev, currentHp: hpAfter } : null));
      playerMonRef.current = playerMonRef.current ? { ...playerMonRef.current, currentHp: hpAfter } : null;
      setOpponentMon((prev) => (prev ? { ...prev, currentStamina: nextOppStam } : null));

      const synced2 = partySlotsRef.current.map((s) => ({ ...s }));
      writeSlotFromBattle(synced2, act, hpAfter, healed.currentStamina);
      syncPartySlotsRef(synced2);

      const afterHit: BattleEntity = { ...healed, currentHp: hpAfter };
      const rawPersist = useStore.getState().team[act];
      if (hpAfter <= 0) {
        addLog('Il tuo Neo-Mon non regge più...', 'damageIn');
        await sendNextMonIfAnyAfterFaint(act, afterHit);
      } else if (rawPersist) {
        await persistNeoMon(mergeBattleIntoNeoMon(rawPersist, afterHit));
      }
    },
    [addLog, allMoves, persistNeoMon, pushFloats, sendNextMonIfAnyAfterFaint, syncPartySlotsRef]
  );

  useEffect(() => {
    if (!battleConsumableRequest) return;
    const { itemId } = battleConsumableRequest;
    useStore.getState().clearBattleConsumableRequest();
    if (!playerMonRef.current || !opponentMonRef.current) return;
    setIsTurnInProgress(true);
    void processBattleItem(itemId).finally(() => setIsTurnInProgress(false));
  }, [battleConsumableRequest, processBattleItem]);

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

    const act = activeSlotRef.current;
    const synced = partySlotsRef.current.map((s) => ({ ...s }));
    writeSlotFromBattle(synced, act, nextHp, p.currentStamina);
    syncPartySlotsRef(synced);

    const faintedShape: BattleEntity = { ...p, currentHp: nextHp, currentStamina: p.currentStamina };

    if (nextHp <= 0) {
      addLog('Il tuo Neo-Mon non regge più...', 'damageIn');
      await sendNextMonIfAnyAfterFaint(act, faintedShape);
    } else {
      const raw = useStore.getState().team.find((m) => m.id === p.id);
      if (raw) await persistNeoMon(mergeBattleIntoNeoMon(raw, faintedShape));
    }
  }, [allMoves, status, addLog, pushFloats, sendNextMonIfAnyAfterFaint, syncPartySlotsRef]);

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
    partySlots,
    activeSlotIndex,
  };
};
