import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NeoMon, PlayerData, InventoryItem, CreatureSpecies } from '../types';
import { db } from '../db';
import { recalculateAllStats } from '../logic/StatsCalculator';
import creaturesData from '../data/creatures.json';
import { normalizeNeoMon } from '../logic/normalizeCreature';
import { EvolutionSystem } from '../logic/EvolutionSystem';
import type { BattleContext } from '../types/world';
import type { BattleSummaryPayload } from '../types/battleSummary';
import missionsData from '../data/missions.json';
import { getMaxHp, getMaxStamina } from '../logic/battleParty';

/**
 * Neo-Mon Link Central Store
 * Gestione Stato Globale, Persistenza e Sincronizzazione Database
 */

interface NeoState {
  player: PlayerData | null;
  team: NeoMon[];
  box: NeoMon[];
  inventory: InventoryItem[];
  seenIds: string[];
  coins: number;
  selectedBoxIndex: number;
  currentScreen:
    | 'hub'
    | 'battle'
    | 'box'
    | 'settings'
    | 'shop'
    | 'linkdex'
    | 'evolution'
    | 'inventory'
    | 'worldmap'
    | 'trainer'
    | 'crafting';
  /** Se l'inventario è stato aperto dall'Arena, il pulsante Indietro torna alla lotta */
  inventoryReturnTarget: 'battle' | null;
  /** Inventario come overlay: non cambia `currentScreen`, così la battaglia non si smonta */
  inventoryOverlayOpen: boolean;
  boxTab: 'box' | 'team';
  evolvingMonId: string | null;
  volMuted: boolean;
  volume: number;

  battleContext: BattleContext | null;
  battleSessionKey: number;
  pendingTrainerId: string | null;
  pendingTrainerZone: string | null;
  defeatedTrainerIds: string[];
  evolutionQueue: { monId: string; evolvesToId: string }[];
  lastBattleSummary: BattleSummaryPayload | null;
  missionProgress: Record<string, { completed?: boolean; count?: number }>;
  totalBattles: number;
  totalBattlesWon: number;
  totalCaptures: number;
  playtimeMs: number;
  toastMessage: string | null;
  /** Richiesta uso oggetto da Zaino in lotta (processata da useBattle) */
  battleConsumableRequest: { itemId: string } | null;
  isLoading: boolean;

  // Actions
  loadData: () => Promise<void>;
  enterInventory: (opts?: { fromBattle?: boolean }) => void;
  returnToBattleFromInventory: () => void;
  requestBattleConsumable: (itemId: string) => void;
  clearBattleConsumableRequest: () => void;
  /** Consuma una quantità dall’inventario IndexedDB e aggiorna lo store */
  consumeInventoryItem: (itemId: string, qty?: number) => Promise<boolean>;
  toggleMute: () => void;
  setVolume: (val: number) => void;
  setScreen: (screen: NeoState['currentScreen']) => void;
  setBoxTab: (tab: 'box' | 'team') => void;
  updateCoins: (amount: number) => void;
  updateInventory: () => Promise<void>;
  buyItem: (itemId: string, price: number) => Promise<void>;
  markAsSeen: (monId: string) => void;
  
  // Team & Box Management
  addToTeam: (monId: string) => void;
  removeFromTeam: (monId: string) => void;
  replaceInTeam: (boxMonId: string, teamMonId: string) => Promise<void>;
  captureNeoMon: (wildMon: NeoMon, prismId: string) => Promise<void>;
  swapPositions: (id1: string, id2: string) => Promise<void>;
  grantExperience: (monId: string, amount: number) => Promise<void>;
  evolveNeoMon: (monId: string) => Promise<void>;
  healTeam: () => Promise<void>;
  persistNeoMon: (mon: NeoMon) => Promise<void>;
  installNeuralMove: (
    monId: string,
    newMoveId: string,
    slotIndex: number
  ) => Promise<{ ok: boolean; message?: string }>;

  setBattleContext: (ctx: BattleContext | null) => void;
  bumpBattleSession: () => void;
  setPendingTrainerId: (id: string | null) => void;
  setPendingTrainerZone: (zoneId: string | null) => void;
  markTrainerDefeated: (trainerId: string) => Promise<void>;
  addBadge: (badgeId: string) => Promise<void>;
  dequeueEvolution: () => void;
  setLastBattleSummary: (s: BattleSummaryPayload | null) => void;
  recordBattleWin: (opts: { foeTypes: string[]; zoneId?: string }) => void;
  recordCapture: (types: string[]) => void;
  addPlaytime: (ms: number) => void;
  setToast: (msg: string | null) => void;
  grantInventoryItem: (itemId: string, qty: number) => Promise<void>;
}

export const useStore = create<NeoState>()(
  persist(
    (set, get) => ({
      player: null,
      team: [],
      box: [],
      inventory: [],
      seenIds: [],
      coins: 500,
      selectedBoxIndex: 0,
      currentScreen: 'hub',
      inventoryReturnTarget: null,
      inventoryOverlayOpen: false,
      boxTab: 'box',
      evolvingMonId: null,
      volMuted: false,
      volume: 0.5,

      battleContext: null,
      battleSessionKey: 0,
      pendingTrainerId: null,
      pendingTrainerZone: null,
      defeatedTrainerIds: [],
      evolutionQueue: [],
      lastBattleSummary: null,
      missionProgress: {},
      totalBattles: 0,
      totalBattlesWon: 0,
      totalCaptures: 0,
      playtimeMs: 0,
      toastMessage: null,
      battleConsumableRequest: null,
      isLoading: true,

      setBattleContext: (ctx) => set({ battleContext: ctx }),
      bumpBattleSession: () => set((s) => ({ battleSessionKey: s.battleSessionKey + 1 })),
      setPendingTrainerId: (id) => set({ pendingTrainerId: id }),
      setPendingTrainerZone: (zoneId) => set({ pendingTrainerZone: zoneId }),

      setLastBattleSummary: (s) => set({ lastBattleSummary: s }),
      dequeueEvolution: () =>
        set((s) => ({
          evolutionQueue: s.evolutionQueue.slice(1),
        })),
      setToast: (msg) => set({ toastMessage: msg }),

      addPlaytime: (ms) => {
        const next = (get().playtimeMs || 0) + ms;
        set({ playtimeMs: next });
        const p = get().player;
        if (p)
          void db.player.update(p.id, { playtimeMs: next } as Partial<PlayerData>);
      },

      grantInventoryItem: async (itemId, qty) => {
        const existing = await db.inventory.get(itemId);
        if (existing) {
          await db.inventory.update(itemId, { quantity: existing.quantity + qty });
        } else {
          await db.inventory.add({ itemId, quantity: qty });
        }
        await get().updateInventory();
      },

      markTrainerDefeated: async (trainerId) => {
        const ids = new Set([...get().defeatedTrainerIds, trainerId]);
        const arr = [...ids];
        set({ defeatedTrainerIds: arr });
        const p = get().player;
        if (p) await db.player.update(p.id, { defeatedTrainerIds: arr } as Partial<PlayerData>);
      },

      addBadge: async (badgeId) => {
        const p = get().player;
        if (!p) return;
        const badges = p.badges.includes(badgeId) ? p.badges : [...p.badges, badgeId];
        await db.player.update(p.id, { badges });
        set({ player: { ...p, badges } });
      },

      recordBattleWin: ({ foeTypes, zoneId: _zoneId }) => {
        const tb = get().totalBattles + 1;
        const tw = get().totalBattlesWon + 1;
        set({ totalBattles: tb, totalBattlesWon: tw });
        const p = get().player;
        if (p) void db.player.update(p.id, { totalBattles: tb, totalBattlesWon: tw } as Partial<PlayerData>);

        const mp = { ...get().missionProgress };
        const bump = (key: string) => {
          const cur = mp[key]?.count ?? 0;
          mp[key] = { ...mp[key], count: cur + 1 };
        };
        bump('battles_won');
        if (foeTypes.some((t) => t === 'Idrico')) bump('defeated_water');

        const missions = missionsData as {
          id: string;
          requirement: string;
          rewardCoins: number;
          title: string;
        }[];
        let newToast: string | null = null;
        for (const m of missions) {
          if (mp[m.id]?.completed) continue;
          let done = false;
          if (m.requirement === 'battles_won >= 1' && (mp['battles_won']?.count ?? 0) >= 1) done = true;
          if (m.requirement === 'defeated_water >= 5' && (mp['defeated_water']?.count ?? 0) >= 5) done = true;
          if (done) {
            mp[m.id] = { ...mp[m.id], completed: true };
            get().updateCoins(m.rewardCoins);
            newToast = `Missione completata: ${m.title} (+${m.rewardCoins} ◈)`;
          }
        }
        set({ missionProgress: mp });
        if (newToast) {
          set({ toastMessage: newToast });
          setTimeout(() => get().setToast(null), 3200);
        }
      },

      recordCapture: (types) => {
        const tc = get().totalCaptures + 1;
        set({ totalCaptures: tc });
        const p = get().player;
        if (p) void db.player.update(p.id, { totalCaptures: tc } as Partial<PlayerData>);
        const mp = { ...get().missionProgress };
        const bio = types.some((t) => t === 'Bio');
        if (bio) {
          const k = 'captured_bio';
          const c = (mp[k]?.count ?? 0) + 1;
          mp[k] = { ...mp[k], count: c };
        }

        const missions = missionsData as { id: string; requirement: string; rewardCoins: number; title: string }[];
        let toast: string | null = null;
        for (const m of missions) {
          if (mp[m.id]?.completed) continue;
          if (m.requirement === 'captured_bio >= 3' && (mp['captured_bio']?.count ?? 0) >= 3) {
            mp[m.id] = { ...mp[m.id], completed: true };
            get().updateCoins(m.rewardCoins);
            toast = `Missione completata: ${m.title} (+${m.rewardCoins} ◈)`;
          }
        }
        if (toast) {
          set({ missionProgress: mp, toastMessage: toast });
          setTimeout(() => get().setToast(null), 3200);
        } else {
          set({ missionProgress: mp });
        }
      },

      enterInventory: (opts) => {
        if (opts?.fromBattle) {
          set({ inventoryReturnTarget: 'battle', inventoryOverlayOpen: true });
        } else {
          set({ inventoryReturnTarget: null, inventoryOverlayOpen: false, currentScreen: 'inventory' });
        }
      },

      returnToBattleFromInventory: () => {
        set({ inventoryReturnTarget: null, inventoryOverlayOpen: false });
      },

      requestBattleConsumable: (itemId) => set({ battleConsumableRequest: { itemId } }),
      clearBattleConsumableRequest: () => set({ battleConsumableRequest: null }),

      consumeInventoryItem: async (itemId, qty = 1) => {
        const row = await db.inventory.get(itemId);
        if (!row || row.quantity < qty) return false;
        await db.transaction('rw', db.inventory, async () => {
          const r = await db.inventory.get(itemId);
          if (!r || r.quantity < qty) return;
          if (r.quantity <= qty) await db.inventory.delete(itemId);
          else await db.inventory.update(itemId, { quantity: r.quantity - qty });
        });
        await get().updateInventory();
        return true;
      },

      loadData: async () => {
        console.log('[Store] loadData starting...');
        
        try {
          let team = (await db.team.toArray()).map((m: any) => recalculateAllStats(normalizeNeoMon(m as NeoMon)));
          let box = (await db.box.toArray()).map((m: any) => recalculateAllStats(normalizeNeoMon(m as NeoMon)));
          let inventory = await db.inventory.toArray();
          let player = (await db.player.toArray())[0];
          
          console.log('[Store] loadData completed. team:', team.length, 'box:', box.length, 'player:', !!player);
          
          // Se il database è vuoto, inizializziamo con dati starter
          if (team.length === 0 && box.length === 0 && !player) {
            console.log("[Store] Inizializzazione primo salvataggio...");
          
          // Crea Player
          player = { 
            id: 1, 
            name: 'NEO-LINKER', 
            coins: 500,
            badges: [],
            unlockedNodes: [],
            lastSave: Date.now(),
            defeatedTrainerIds: [],
            totalBattles: 0,
            totalBattlesWon: 0,
            totalCaptures: 0,
            playtimeMs: 0,
          };
          await db.player.add(player);
          
          // Crea Starter Neo-Mon (Floris n-001)
          const starterData = creaturesData[0] as CreatureSpecies;
          const starterMoves =
            starterData.moves?.length > 0
              ? [...starterData.moves]
              : [starterData.moves_learned?.[0]?.moveId || 'm-pri-01'];
          const learnPool = starterData.learnPool;
          const starterPool = learnPool && learnPool.length > 0 ? [...learnPool] : [...starterMoves];
          let starter: NeoMon = normalizeNeoMon({
            ...starterData,
            uniqueId: `starter-${Date.now()}`,
            level: 5,
            exp: 0,
            potential: 25,
            moves: starterMoves,
            learnPool: starterPool,
            development: { hp: 0, potenza: 0, resistenza: 0, sintonia: 0, spirito: 0, flusso: 0 },
            friendship: 50,
            caughtAt: Date.now(),
          } as NeoMon & { uniqueId?: string });
          starter = recalculateAllStats(starter);
          starter = {
            ...starter,
            currentHp: getMaxHp(starter),
            currentStamina: getMaxStamina(starter),
          } as NeoMon;

          await db.team.add(starter as unknown as NeoMon);
          team = [starter];
          
          // Crea item iniziali (3 Prismi Base)
          const initialItems = [
            { itemId: 'i-prism-01', quantity: 3 }
          ];
          await db.inventory.bulkAdd(initialItems);
          inventory = initialItems;
        }

        set({
          team,
          box,
          inventory,
          player,
          coins: player?.coins || 500,
          seenIds: Array.from(new Set([...team.map((m: NeoMon) => m.id), ...box.map((m: NeoMon) => m.id)])),
          defeatedTrainerIds: player?.defeatedTrainerIds ?? [],
          totalBattles: player?.totalBattles ?? 0,
          totalBattlesWon: player?.totalBattlesWon ?? 0,
          totalCaptures: player?.totalCaptures ?? 0,
          playtimeMs: player?.playtimeMs ?? 0,
          isLoading: false,
        });
        } catch (error) {
          console.error('[Store] loadData error:', error);
          // Fallback: imposta stato minimalista per permettere al gioco di continuare
          set({
            team: [],
            box: [],
            inventory: [],
            player: { 
              id: 1, 
              name: 'NEO-LINKER', 
              coins: 500,
              badges: [],
              unlockedNodes: [],
              lastSave: Date.now(),
              defeatedTrainerIds: [],
              totalBattles: 0,
              totalBattlesWon: 0,
              totalCaptures: 0,
              playtimeMs: 0,
            },
            seenIds: [],
            defeatedTrainerIds: [],
            totalBattles: 0,
            totalBattlesWon: 0,
            totalCaptures: 0,
            playtimeMs: 0,
            isLoading: false,
          });
        }
      },

      persistNeoMon: async (mon) => {
        const { team, box } = get();
        const normalized = normalizeNeoMon(mon);
        if (team.some((m) => m.id === mon.id)) {
          await db.team.put(normalized);
          set({ team: team.map((m) => (m.id === mon.id ? normalized : m)) });
        } else if (box.some((m) => m.id === mon.id)) {
          await db.box.put(normalized);
          set({ box: box.map((m) => (m.id === mon.id ? normalized : m)) });
        }
      },

      installNeuralMove: async (monId, newMoveId, slotIndex) => {
        if (get().coins < 50) return { ok: false, message: 'Crediti insufficienti' };
        const { team, box } = get();
        const mon = [...team, ...box].find((m) => m.id === monId);
        if (!mon) return { ok: false, message: 'Neo-Mon non trovato' };
        const moves = [...(mon.moves || [])];
        if (slotIndex < 0 || slotIndex > 3 || moves.length < 4) return { ok: false, message: 'Slot non valido' };
        moves[slotIndex] = newMoveId;
        const updated = normalizeNeoMon({ ...mon, moves });
        get().updateCoins(-50);
        await get().persistNeoMon(updated);
        return { ok: true };
      },

      toggleMute: () => set((state) => ({ volMuted: !state.volMuted })),
      setVolume: (val) => set({ volume: val }),

      setScreen: (screen) => set({ currentScreen: screen }),
      setBoxTab: (tab) => set({ boxTab: tab }),

      updateCoins: (amount) => {
        const newCoins = (get().coins || 0) + amount;
        set({ coins: newCoins });
        if (get().player) {
          db.player.update(get().player!.id, { coins: newCoins });
        }
      },

      updateInventory: async () => {
        const inventory = await db.inventory.toArray();
        set({ inventory });
      },

      buyItem: async (itemId, price) => {
        if (get().coins < price) return;
        get().updateCoins(-price);
        const existing = await db.inventory.get(itemId);
        if (existing) {
          await db.inventory.update(itemId, { quantity: existing.quantity + 1 });
        } else {
          await db.inventory.add({ itemId, quantity: 1 });
        }
        await get().updateInventory();
      },

      markAsSeen: (monId) => {
        if (!get().seenIds.includes(monId)) {
          set({ seenIds: [...get().seenIds, monId] });
        }
      },

      addToTeam: async (monId) => {
        const { team, box } = get();
        if (team.length >= 4) return;
        const mon = box.find(m => m.id === monId);
        if (mon) {
          await db.transaction('rw', db.team, db.box, async () => {
            await db.box.delete(monId);
            await db.team.add(mon);
          });
          set({
            team: [...team, mon],
            box: box.filter(m => m.id !== monId)
          });
        }
      },

      removeFromTeam: async (monId) => {
        const { team, box } = get();
        if (team.length <= 1) return;
        const mon = team.find(m => m.id === monId);
        if (mon) {
          await db.transaction('rw', db.team, db.box, async () => {
            await db.team.delete(monId);
            await db.box.add(mon);
          });
          set({
            team: team.filter(m => m.id !== monId),
            box: [...box, mon]
          });
        }
      },

      replaceInTeam: async (boxMonId, teamMonId) => {
        const { team, box } = get();
        const boxMon = box.find(m => m.id === boxMonId);
        const teamMon = team.find(m => m.id === teamMonId);
        
        if (boxMon && teamMon) {
          await db.transaction('rw', db.team, db.box, async () => {
             // Sincronizzazione database: rimuovi dalla squadra e aggiungi al box quello rimosso
             await db.team.delete(teamMonId);
             await db.box.add(teamMon);
             
             // Rimuovi dal box e aggiungi alla squadra quello nuovo
             await db.box.delete(boxMonId);
             await db.team.add(boxMon);
          });

          set({
            team: team.map(m => m.id === teamMonId ? boxMon : m),
            box: [...box.filter(m => m.id !== boxMonId), teamMon]
          });
        }
      },

      captureNeoMon: async (wildMon, prismId) => {
        const { box, seenIds } = get();
        let capturedMon = normalizeNeoMon({ ...wildMon, caughtAt: Date.now() } as NeoMon);
        capturedMon = recalculateAllStats(capturedMon);
        capturedMon = {
          ...capturedMon,
          currentHp: getMaxHp(capturedMon),
          currentStamina: getMaxStamina(capturedMon),
        } as NeoMon;
        const nextSeen = seenIds.includes(wildMon.id) ? seenIds : [...seenIds, wildMon.id];

        await db.transaction('rw', db.box, db.inventory, async () => {
          const existing = await db.inventory.get(prismId);
          if (existing && existing.quantity > 0) {
            if (existing.quantity === 1) await db.inventory.delete(prismId);
            else await db.inventory.update(prismId, { quantity: existing.quantity - 1 });
          }
          await db.box.add(capturedMon);
        });

        set({
          box: [...box, capturedMon],
          seenIds: nextSeen,
        });
        get().recordCapture(capturedMon.types.map(String));
        await get().updateInventory();
      },

      swapPositions: async (id1, id2) => {
        const { team } = get();
        const tCopy = [...team];
        const i1 = tCopy.findIndex(m => m.id === id1);
        const i2 = tCopy.findIndex(m => m.id === id2);
        
        if (i1 !== -1 && i2 !== -1) {
          // Swap fisico nell'array
          [tCopy[i1], tCopy[i2]] = [tCopy[i2], tCopy[i1]];
          
          // Sincronizzazione atomica database
          await db.transaction('rw', db.team, async () => {
            await db.team.clear();
            await db.team.bulkAdd(tCopy);
          });
          
          set({ team: tCopy });
        }
      },

      grantExperience: async (monId, amount) => {
        const { team, box } = get();
        let mon = [...team, ...box].find(m => m.id === monId);
        if (!mon) return;

        let newExp = mon.exp + amount;
        let newLevel = mon.level;
        let leveledUp = false;

        while (newExp >= Math.pow(newLevel, 3)) {
          newExp -= Math.pow(newLevel, 3);
          newLevel++;
          leveledUp = true;
        }

        let updatedMon = { ...mon, exp: newExp, level: newLevel };
        
        if (leveledUp) {
          updatedMon = recalculateAllStats(updatedMon);
        }

        const evo = EvolutionSystem.checkEvolution(updatedMon);
        updatedMon = { ...updatedMon, canEvolve: evo.shouldEvolve };
        if (evo.shouldEvolve && evo.evolvesTo) {
          set({
            evolutionQueue: [...get().evolutionQueue, { monId: updatedMon.id, evolvesToId: evo.evolvesTo }],
          });
        }

        const isInTeam = team.some((m) => m.id === monId);
        const targetTable = isInTeam ? db.team : db.box;
        const existing = await targetTable.get(monId);
        const merged = { ...(existing ?? mon), ...updatedMon } as NeoMon;
        await targetTable.put(merged);

        if (isInTeam) set({ team: team.map((m) => (m.id === monId ? merged : m)) });
        else set({ box: box.map((m) => (m.id === monId ? merged : m)) });
      },

      evolveNeoMon: async (monId) => {
        const { team, box } = get();
        const mon = [...team, ...box].find(m => m.id === monId);
        if (!mon || !mon.canEvolve) return;

        const staticData = (creaturesData as CreatureSpecies[]).find((d) => d.id === mon.id);
        if (!staticData) return;
        const nextId =
          typeof staticData.evolvesTo === 'string'
            ? staticData.evolvesTo
            : staticData.evolvesTo && typeof staticData.evolvesTo === 'object'
              ? staticData.evolvesTo.creatureId
              : null;
        const nextStageData = (creaturesData as CreatureSpecies[]).find((d) => d.id === nextId);
        
        if (!nextStageData) return;

        const evolvedMon: NeoMon = {
          ...mon,
          id: nextStageData.id,
          name: nextStageData.name,
          types: nextStageData.types,
          baseStats: nextStageData.baseStats,
          canEvolve: false
        };

        const finalMon = recalculateAllStats(evolvedMon);
        const isInTeam = team.some(m => m.id === monId);
        const targetTable = isInTeam ? db.team : db.box;
        
        await targetTable.delete(monId);
        await targetTable.add(finalMon);

        if (isInTeam) set({ team: team.map(m => m.id === monId ? finalMon : m) });
        else set({ box: box.map(m => m.id === monId ? finalMon : m) });
        
        get().markAsSeen(finalMon.id);
      },

      healTeam: async () => {
        const { team } = get();
        
        const healedTeam = team.map(mon => {
          const maxStats = mon.currentStats || mon.baseStats;
          return {
            ...mon,
            currentStats: {
              ...maxStats,
              hp: maxStats.hp,
              stamina: maxStats.stamina,
            }
          };
        });

        await db.transaction('rw', db.team, async () => {
          for (const mon of healedTeam) {
            await db.team.put(mon);
          }
        });

        set({ team: healedTeam });
      },
    }),
    {
      name: 'neomon-storage',
      partialize: (state) => ({ 
        coins: state.coins, 
        seenIds: state.seenIds,
        currentScreen: state.currentScreen,
        volume: state.volume,
        volMuted: state.volMuted
      }),
    }
  )
);
