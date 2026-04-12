import type { Stats } from '../types';

export interface BattleSummaryPayload {
  foeName: string;
  xpGained: number;
  coinsGained: number;
  itemDrop?: { itemId: string; name: string } | null;
  levelUp?: { monName: string; fromLv: number; toLv: number; statGain?: Partial<Stats> } | null;
  trainerDialogueWin?: string | null;
  trainerCoins?: number;
  trainerBadge?: string | null;
  showExploreAgain: boolean;
  returnScreen: 'hub' | 'worldmap';
}
