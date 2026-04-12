import { describe, it, expect } from 'vitest';
import { performCatchAttempt, calculateCatchRate } from './CatchSystem';

describe('Cattura (CatchSystem)', () => {
  it('calculateCatchRate è tra 0 e 255', () => {
    const r = calculateCatchRate(100, 50, 120, 'base', null);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(255);
  });

  it('HP basso aumenta la probabilità rispetto a HP alto', () => {
    const full = calculateCatchRate(100, 100, 120, 'base', null);
    const low = calculateCatchRate(100, 10, 120, 'base', null);
    expect(low).toBeGreaterThanOrEqual(full);
  });

  it('performCatchAttempt: forma risultato valida', () => {
    const r = performCatchAttempt(80, 40, 120, 'base');
    expect(typeof r.success).toBe('boolean');
    expect(r.shakes).toBeGreaterThanOrEqual(0);
    expect(r.shakes).toBeLessThanOrEqual(3);
  });

  it('Prisma master: cattura garantita', () => {
    const r = performCatchAttempt(200, 200, 1, 'master');
    expect(r.success).toBe(true);
    expect(r.shakes).toBe(3);
  });
});
