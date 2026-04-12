import type { Move } from '../types';

export const DEFAULT_MOVE_ID = 'm-pri-01';

export function resolveMoveById(moveId: string | undefined, allMoves: Move[]): Move {
  const fromId = moveId ? allMoves.find((m) => m.id === moveId) : undefined;
  if (fromId) return fromId;
  const fallback = allMoves.find((m) => m.id === DEFAULT_MOVE_ID);
  return fallback ?? allMoves[0];
}
