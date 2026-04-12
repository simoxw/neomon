import type { NeoMon } from '../types';

/** Stato HP/SP per ogni slot squadra (ordine = ordine Hub / team[]) */
export interface PartySlot {
  speciesId: string;
  currentHp: number;
  currentStamina: number;
}

export function getMaxHp(mon: NeoMon): number {
  return mon.currentStats?.hp ?? mon.baseStats.hp;
}

export function getMaxStamina(mon: NeoMon): number {
  return mon.currentStats?.stamina ?? mon.baseStats.stamina;
}

export function initPartySlotsFromTeam(team: NeoMon[]): PartySlot[] {
  return team.map((m) => {
    const maxHp = getMaxHp(m);
    const maxSt = getMaxStamina(m);
    const ext = m as NeoMon & { currentHp?: number; currentStamina?: number };
    return {
      speciesId: m.id,
      currentHp: ext.currentHp != null ? Math.min(Math.max(0, ext.currentHp), maxHp) : maxHp,
      currentStamina: ext.currentStamina != null ? Math.min(Math.max(0, ext.currentStamina), maxSt) : maxSt,
    };
  });
}

/** Primo indice con HP > 0, altrimenti null (tutti KO) */
export function findFirstAliveSlotIndex(party: PartySlot[]): number | null {
  const i = party.findIndex((s) => s.currentHp > 0);
  return i === -1 ? null : i;
}

/** Aggiorna lo slot attivo dai valori di battaglia */
export function writeSlotFromBattle(party: PartySlot[], slotIndex: number, hp: number, stamina: number): void {
  const s = party[slotIndex];
  if (!s) return;
  s.currentHp = Math.max(0, hp);
  s.currentStamina = Math.max(0, stamina);
}
