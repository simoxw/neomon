import type { ZoneData } from '../types/world';

export function pickCreatureIdFromPool(pool: string[], rates: number[]): string {
  if (!pool.length) return 'n-001';
  const w = rates.length ? rates : pool.map(() => 1 / pool.length);
  const sum = w.reduce((a, b) => a + b, 0) || 1;
  let r = Math.random() * sum;
  for (let i = 0; i < pool.length; i++) {
    r -= w[i] ?? 0;
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function randomLevelInZone(zone: Pick<ZoneData, 'minLevel' | 'maxLevel'>): number {
  const a = Math.min(zone.minLevel, zone.maxLevel);
  const b = Math.max(zone.minLevel, zone.maxLevel);
  return a + Math.floor(Math.random() * (b - a + 1));
}
