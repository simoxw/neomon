import creatures from '../data/creatures.json';
import { db } from '../db';
import type { NeoMon } from '../types';

function simpleHash(str: string): number { 
  return str.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0); 
} 

export function getDailyChallenge() { 
  const seed = new Date().toDateString(); 
  const hash = simpleHash(seed); 
  const creature = (creatures as any[])[hash % creatures.length]; 
  const level = 12 + (hash % 18); // lv 12-30 
  return { 
    date: seed, 
    creatureId: creature.id, 
    creatureName: creature.name, 
    level, 
    reward: { neoCredits: 250 + level * 10, nexusFragments: 1 } 
  }; 
} 

export function getCreatureOfDay(): string { 
  const hash = simpleHash(new Date().toDateString() + 'cotd'); 
  return (creatures as any[])[hash % creatures.length].id; 
} 

export async function updateLoginStreak() { 
  const record = await db.playerProgress.get('main') 
    ?? { id: 'main', lastLoginDate: '', streak: 0, dailyChallengeDate: '', dailyChallengeCompleted: false }; 
  const today = new Date().toDateString(); 
  const yesterday = new Date(Date.now() - 86400000).toDateString(); 
  
  if (record.lastLoginDate === today) return record.streak; // già aggiornato 
  const newStreak = record.lastLoginDate === yesterday ? record.streak + 1 : 1; 
  
  const updated = { ...record, lastLoginDate: today, streak: newStreak };
  await db.playerProgress.put(updated); 
  
  // Milestone Rewards
  const milestones: Record<number, { reward: string, action: () => Promise<string> }> = {
    3: { 
      reward: "+3 Prisma Base", 
      action: async () => {
        const existing = await db.inventory.get('i-prism-01');
        if (existing) await db.inventory.update('i-prism-01', { quantity: existing.quantity + 3 });
        else await db.inventory.add({ itemId: 'i-prism-01', quantity: 3 });
        return "Ricevuti 3 Prismi Base!";
      }
    },
    7: { 
      reward: "+1 ◆ + 100 ◈", 
      action: async () => {
        const existing = await db.inventory.get('i-prism-02'); // Assuming Nexus Fragment or similar is i-prism-02
        if (existing) await db.inventory.update('i-prism-02', { quantity: existing.quantity + 1 });
        else await db.inventory.add({ itemId: 'i-prism-02', quantity: 1 });
        // updateCoins logic would be needed here but it's in the store. 
        // We'll handle coin rewards via store after login if possible, or just direct DB for now.
        const p = (await db.player.toArray())[0];
        if (p) await db.player.update(p.id, { coins: p.coins + 100 });
        return "Ricevuti 1 Frammento Nexus e 100 Crediti!";
      }
    },
    14: { 
      reward: "+2 ◆", 
      action: async () => {
        const existing = await db.inventory.get('i-prism-02');
        if (existing) await db.inventory.update('i-prism-02', { quantity: existing.quantity + 2 });
        else await db.inventory.add({ itemId: 'i-prism-02', quantity: 2 });
        return "Ricevuti 2 Frammenti Nexus!";
      }
    },
    30: { 
      reward: "Prisma Master", 
      action: async () => {
        const existing = await db.inventory.get('i-prism-03');
        if (existing) await db.inventory.update('i-prism-03', { quantity: existing.quantity + 1 });
        else await db.inventory.add({ itemId: 'i-prism-03', quantity: 1 });
        return "Ricevuto un Prisma Master!";
      }
    }
  };

  if (milestones[newStreak]) {
    const msg = await milestones[newStreak].action();
    return { streak: newStreak, milestone: milestones[newStreak].reward, message: msg };
  }

  return { streak: newStreak }; 
} 
