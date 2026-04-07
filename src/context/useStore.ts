import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NeoMon, PlayerData, InventoryItem } from '../types';
import { db } from '../db';
import { recalculateAllStats } from '../logic/StatsCalculator';
import creaturesData from '../data/creatures.json';

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
  currentScreen: 'hub' | 'battle' | 'box' | 'settings' | 'shop' | 'linkdex' | 'evolution' | 'inventory';
  boxTab: 'box' | 'team';
  evolvingMonId: string | null;
  volMuted: boolean;
  volume: number;
  
  // Actions
  loadData: () => Promise<void>;
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
      boxTab: 'box',
      evolvingMonId: null,
      volMuted: false,
      volume: 0.5,

      loadData: async () => {
        const team = await db.team.toArray();
        const box = await db.box.toArray();
        const inventory = await db.inventory.toArray();
        const player = (await db.player.toArray())[0];
        
        if (team.length > 0 || box.length > 0 || player || inventory.length > 0) {
          set({ 
            team, 
            box, 
            inventory,
            player, 
            coins: player?.coins || 500,
            seenIds: Array.from(new Set([...team.map(m => m.id), ...box.map(m => m.id)])) 
          });
        }
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
        const existing = await db.inventory.get(prismId);
        if (existing && existing.quantity > 0) {
          if (existing.quantity === 1) await db.inventory.delete(prismId);
          else await db.inventory.update(prismId, { quantity: existing.quantity - 1 });
        }
        
        const capturedMon = { ...wildMon, caughtAt: Date.now() };
        await db.box.add(capturedMon);
        set({
          box: [...box, capturedMon],
          seenIds: seenIds.includes(wildMon.id) ? seenIds : [...seenIds, wildMon.id]
        });
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
          const staticData = (creaturesData as any[]).find(d => d.id === mon?.id);
          if (staticData && staticData.evolutionLevel && newLevel >= staticData.evolutionLevel) {
            updatedMon.canEvolve = true;
          }
        }

        const isInTeam = team.some(m => m.id === monId);
        const targetTable = isInTeam ? db.team : db.box;
        await targetTable.update(monId, { 
          exp: updatedMon.exp, 
          level: updatedMon.level, 
          currentStats: updatedMon.currentStats,
          canEvolve: updatedMon.canEvolve 
        });

        if (isInTeam) set({ team: team.map(m => m.id === monId ? updatedMon : m) });
        else set({ box: box.map(m => m.id === monId ? updatedMon : m) });
      },

      evolveNeoMon: async (monId) => {
        const { team, box } = get();
        const mon = [...team, ...box].find(m => m.id === monId);
        if (!mon || !mon.canEvolve) return;

        const staticData = (creaturesData as any[]).find(d => d.id === mon.id);
        const nextStageData = (creaturesData as any[]).find(d => d.id === staticData.evolvesTo);
        
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

        // Persisti le cure nel DB per ogni membro
        await db.transaction('rw', db.team, async () => {
          for (const mon of healedTeam) {
            await db.team.update(mon.id, { currentStats: mon.currentStats });
          }
        });

        // Aggiorna lo stato immediatamente senza reload
        set({ team: healedTeam });
      }
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
