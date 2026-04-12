import { describe, it, expect } from 'vitest';
import { computeCurativeHeal } from './battleItems';

describe('battleItems.computeCurativeHeal (oggetti in lotta)', () => {
  it('target hp: non supera il massimo HP', () => {
    const r = computeCurativeHeal('hp', 50, 10, 100, 40, 100);
    expect(r.nextHp).toBe(60);
    expect(r.nextSt).toBe(40);
  });

  it('target hp: con guarigione oltre il cap resta al max', () => {
    const r = computeCurativeHeal('hp', 50, 90, 100, 20, 100);
    expect(r.nextHp).toBe(100);
  });

  it('target stamina: incrementa SP senza superare il massimo', () => {
    const r = computeCurativeHeal('stamina', 30, 80, 100, 50, 100);
    expect(r.nextHp).toBe(80);
    expect(r.nextSt).toBe(80);
  });

  it('target stamina: al cap resta al max', () => {
    const r = computeCurativeHeal('stamina', 30, 50, 100, 95, 100);
    expect(r.nextSt).toBe(100);
  });

  it('target both / kit (value >= 999): ripristino completo', () => {
    const r = computeCurativeHeal('both', 999, 1, 100, 1, 100);
    expect(r.nextHp).toBe(100);
    expect(r.nextSt).toBe(100);
  });

  it('HP e SP non vanno sotto zero per input negativi (curHp basso)', () => {
    const r = computeCurativeHeal('hp', 5, 0, 100, 0, 100);
    expect(r.nextHp).toBe(5);
  });
});
