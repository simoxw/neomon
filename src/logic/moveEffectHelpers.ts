import type { Move, MoveEffect, MoveCategory } from '../types';

export function getStructuredMoveEffect(move: Move): MoveEffect | undefined {
  const e = move.effect;
  if (e && typeof e === 'object' && 'type' in (e as object)) return e as MoveEffect;
  return undefined;
}

export function isPhysicalCategory(cat: MoveCategory | undefined): boolean {
  if (!cat) return true;
  if (cat === 'Physical') return true;
  return String(cat).toLowerCase() === 'physical';
}

export function isSpecialCategory(cat: MoveCategory | undefined): boolean {
  if (!cat) return false;
  const c = String(cat).toLowerCase();
  return c === 'special' || cat === 'Sintonia';
}

export function isStatusCategory(cat: MoveCategory | undefined): boolean {
  if (!cat) return false;
  return String(cat).toLowerCase() === 'status' || cat === 'Status';
}

export function getMoveAccuracy(move: Move): number {
  if (typeof move.accuracy === 'number') return move.accuracy;
  return 100;
}
