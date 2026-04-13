import Dexie, { type Table } from 'dexie';
import { NeoMon, InventoryItem, PlayerData, PlayerProgress, PlayerStats } from '../types';

export class NeoMonDB extends Dexie {
  player!: Table<PlayerData>;
  team!: Table<NeoMon>;
  box!: Table<NeoMon>;
  inventory!: Table<InventoryItem>;
  playerProgress!: Table<PlayerProgress>;
  playerStats!: Table<PlayerStats>;

  constructor() {
    super('NeoMonLinkDB');
    this.version(1).stores({
      player: '++id, name',
      team: '++id, name, level',
      box: '++id, name, level',
      inventory: 'itemId, quantity',
    });
    this.version(3)
      .stores({
        player: '++id, name',
        team: '++id, name, level',
        box: '++id, name, level',
        inventory: 'itemId, quantity',
        playerProgress: 'id',
        playerStats: 'id',
      })
      .upgrade(async () => {
        /* Migrazione: aggiunta tabelle progress e stats. */
      });
  }

  async exportSaveData(): Promise<string> {
    const data = {
      player: await this.player.toArray(),
      team: await this.team.toArray(),
      box: await this.box.toArray(),
      inventory: await this.inventory.toArray(),
      playerProgress: await this.playerProgress.toArray(),
      playerStats: await this.playerStats.toArray(),
      version: 3,
      exportedAt: Date.now()
    };
    return JSON.stringify(data);
  }

  async importSaveData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      if (!data.player || !data.team) throw new Error("Formato salvataggio non valido");

      await this.transaction('rw', [this.player, this.team, this.box, this.inventory, this.playerProgress, this.playerStats], async () => {
        await this.player.clear();
        await this.team.clear();
        await this.box.clear();
        await this.inventory.clear();
        await this.playerProgress.clear();
        await this.playerStats.clear();

        if (data.player && data.player.length) await this.player.bulkAdd(data.player);
        if (data.team && data.team.length) await this.team.bulkAdd(data.team);
        if (data.box && data.box.length) await this.box.bulkAdd(data.box);
        if (data.inventory && data.inventory.length) await this.inventory.bulkAdd(data.inventory);
        if (data.playerProgress && data.playerProgress.length) await this.playerProgress.bulkAdd(data.playerProgress);
        if (data.playerStats && data.playerStats.length) await this.playerStats.bulkAdd(data.playerStats);
      });
    } catch (err) {
      console.error("Errore durante l'importazione:", err);
      throw err;
    }
  }

  async resetAllData(): Promise<void> {
    await Promise.all([
      this.player.clear(),
      this.team.clear(),
      this.box.clear(),
      this.inventory.clear(),
      this.playerProgress.clear(),
      this.playerStats.clear()
    ]);
  }
}

export const db = new NeoMonDB();
