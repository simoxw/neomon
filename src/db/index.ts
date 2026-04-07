import Dexie, { type Table } from 'dexie';
import { NeoMon, InventoryItem, PlayerData } from '../types';

export class NeoMonDB extends Dexie {
  player!: Table<PlayerData>;
  team!: Table<NeoMon>;
  box!: Table<NeoMon>;
  inventory!: Table<InventoryItem>;

  constructor() {
    super('NeoMonLinkDB');
    this.version(1).stores({
      player: '++id, name',
      team: '++id, name, level',
      box: '++id, name, level',
      inventory: 'itemId, quantity'
    });
  }

  async exportSaveData(): Promise<string> {
    const data = {
      player: await this.player.toArray(),
      team: await this.team.toArray(),
      box: await this.box.toArray(),
      inventory: await this.inventory.toArray(),
      version: 1,
      exportedAt: Date.now()
    };
    return JSON.stringify(data);
  }

  async importSaveData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      if (!data.player || !data.team) throw new Error("Formato salvataggio non valido");

      await this.transaction('rw', [this.player, this.team, this.box, this.inventory], async () => {
        await this.player.clear();
        await this.team.clear();
        await this.box.clear();
        await this.inventory.clear();

        if (data.player && data.player.length) await this.player.bulkAdd(data.player);
        if (data.team && data.team.length) await this.team.bulkAdd(data.team);
        if (data.box && data.box.length) await this.box.bulkAdd(data.box);
        if (data.inventory && data.inventory.length) await this.inventory.bulkAdd(data.inventory);
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
      this.inventory.clear()
    ]);
  }
}

export const db = new NeoMonDB();
