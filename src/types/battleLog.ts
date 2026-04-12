export type BattleLogKind = 'damageOut' | 'damageIn' | 'status' | 'system' | 'neutral';

export interface BattleLogEntry {
  text: string;
  kind: BattleLogKind;
}
