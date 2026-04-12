import type { ElementType } from '../types';

export interface ZoneData {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  backgroundClass?: string;
  accentColor?: string;
  encounterTypes: ElementType[] | string[];
  encounterPool: string[];
  encounterRates: number[];
  minLevel: number;
  maxLevel: number;
  trainers: string[];
  requiredBadge: string | null;
}

export interface TrainerTeamSlot {
  creatureId: string;
  level: number;
  moves: string[];
}

export interface TrainerData {
  id: string;
  name: string;
  zone: string;
  sprite?: string;
  isBoss?: boolean;
  dialogue: { intro: string; win: string; lose: string };
  team: TrainerTeamSlot[];
  reward: {
    coins: number;
    items?: { id: string; qty: number }[];
    badge?: string;
  };
  badge?: string | null;
  defeated?: boolean;
}

export type BattleContext =
  | { kind: 'hub'; mode?: 'combat' | 'capture' }
  | {
      kind: 'zone';
      mode?: 'combat' | 'capture';
      zoneId: string;
      encounterPool: string[];
      encounterRates: number[];
      minLevel: number;
      maxLevel: number;
    }
  | { kind: 'trainer'; mode?: 'combat' | 'capture'; trainerId: string; monIndex: number };
