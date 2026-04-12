import React, { useMemo, useState } from 'react';
import { Hammer } from 'lucide-react';
import { useStore } from '../../context/useStore';
import { db } from '../../db';
import recipesData from '../../data/recipes.json';
import itemsCatalog from '../../data/items.json';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Recipe = {
  id: string;
  name: string;
  description: string;
  result: { itemId: string; qty: number };
  ingredients: { itemId: string; qty: number }[];
  unlockLevel?: number;
};

export const Crafting: React.FC = () => {
  const { inventory, team, grantInventoryItem, setScreen, setToast } = useStore();
  const [craftingId, setCraftingId] = useState<string | null>(null);

  const playerLevel = useMemo(() => (team.length ? Math.max(...team.map((m) => m.level)) : 1), [team]);

  const qtyOf = (itemId: string) => inventory.find((i) => i.itemId === itemId)?.quantity ?? 0;

  const recipes = recipesData as Recipe[];

  const materialIds = useMemo(() => {
    const s = new Set<string>();
    for (const r of recipes) {
      for (const ing of r.ingredients) s.add(ing.itemId);
    }
    return [...s];
  }, [recipes]);

  const runCraft = async (r: Recipe) => {
    for (const ing of r.ingredients) {
      if (qtyOf(ing.itemId) < ing.qty) return;
    }
    setCraftingId(r.id);
    await new Promise((res) => setTimeout(res, 1500));
    for (const ing of r.ingredients) {
      const ex = await db.inventory.get(ing.itemId);
      if (ex) {
        const q = ex.quantity - ing.qty;
        if (q <= 0) await db.inventory.delete(ing.itemId);
        else await db.inventory.update(ing.itemId, { quantity: q });
      }
    }
    await useStore.getState().updateInventory();
    await grantInventoryItem(r.result.itemId, r.result.qty);
    setCraftingId(null);
    setToast(`Sintetizzato: ${r.name}`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="h-full w-full bg-slate-950 p-4 pb-24 overflow-y-auto">
      <button type="button" onClick={() => setScreen('hub')} className="text-white/40 text-xs font-bold uppercase mb-4">
        ← Hub
      </button>
      <div className="flex items-center gap-3 mb-6">
        <Hammer className="w-8 h-8 text-orange-400" />
        <div>
          <h1 className="text-2xl font-black uppercase text-white">Laboratorio</h1>
          <p className="text-[10px] text-white/40 font-mono">Lv linker (max squadra): {playerLevel}</p>
        </div>
      </div>

      <h2 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Ricette</h2>
      <div className="space-y-3 mb-10">
        {recipes.map((r) => {
          const locked = (r.unlockLevel ?? 1) > playerLevel;
          const ok = !locked && r.ingredients.every((ing) => qtyOf(ing.itemId) >= ing.qty);
          return (
            <div
              key={r.id}
              className={cn(
                'rounded-2xl border p-4',
                locked ? 'border-white/5 opacity-40' : 'border-white/10 bg-white/5'
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-black uppercase text-sm text-white">{r.name}</h3>
                  <p className="text-[10px] text-white/45 mt-1">{r.description}</p>
                </div>
                {locked && <span className="text-[9px] font-black text-rose-400">Lv.{r.unlockLevel}</span>}
              </div>
              <ul className="mt-3 space-y-1">
                {r.ingredients.map((ing) => {
                  const have = qtyOf(ing.itemId);
                  const miss = have < ing.qty;
                  const name = (itemsCatalog as { id: string; name: string }[]).find((i) => i.id === ing.itemId)?.name ?? ing.itemId;
                  return (
                    <li key={ing.itemId} className={cn('text-[10px] font-mono', miss ? 'text-rose-400' : 'text-emerald-400/90')}>
                      {name}: {have}/{ing.qty}
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                disabled={!ok || craftingId !== null}
                onClick={() => void runCraft(r)}
                className={cn(
                  'mt-3 w-full py-2 rounded-xl text-xs font-black uppercase',
                  ok ? 'bg-cyan-500 text-black' : 'bg-white/10 text-white/30'
                )}
              >
                {craftingId === r.id ? 'Sintesi…' : 'Sintetizza'}
              </button>
            </div>
          );
        })}
      </div>

      <h2 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Materiali</h2>
      <div className="flex flex-wrap gap-2">
        {materialIds.map((id) => {
          const name = (itemsCatalog as { id: string; name: string }[]).find((i) => i.id === id)?.name ?? id;
          return (
            <span key={id} className="text-[9px] px-2 py-1 rounded-lg bg-black/50 border border-white/10 text-white/70">
              {name} ×{qtyOf(id)}
            </span>
          );
        })}
      </div>
    </div>
  );
};
