import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/useStore';
import itemsData from '../../data/items.json';
import { Package, Heart, Zap, Boxes, ChevronRight, Sword } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TabType = 'cure' | 'catture' | 'utili';

const Inventory: React.FC = () => {
  const {
    setScreen,
    inventoryReturnTarget,
    returnToBattleFromInventory,
    requestBattleConsumable,
  } = useStore();
  const invRows = useStore((s) => s.inventory);
  const [activeTab, setActiveTab] = useState<TabType>('cure');

  type Enriched = (typeof itemsData)[number] & { quantity: number };

  const inventory = useMemo((): Enriched[] => {
    return invRows
      .map((dbItem) => {
        const staticData = itemsData.find((s) => s.id === dbItem.itemId);
        return staticData ? ({ ...staticData, quantity: dbItem.quantity } as Enriched) : null;
      })
      .filter((x): x is Enriched => x != null);
  }, [invRows]);

  const filteredItems = inventory.filter((item) => {
    if (activeTab === 'cure') return item.type === 'curative';
    if (activeTab === 'catture') return item.type === 'Catch';
    if (activeTab === 'utili') return item.type === 'evolutive';
    return false;
  });

  const useItemInBattle = (itemId: string) => {
    if (inventoryReturnTarget !== 'battle') return;
    requestBattleConsumable(itemId);
    // Attendiamo il prossimo ciclo di rendering prima di tornare indietro
    // altrimenti i due state updates potrebbero cancellarsi a vicenda
    setTimeout(() => {
      returnToBattleFromInventory();
    }, 0);
  };

  const tabs = [
    { id: 'cure', label: 'Cure', icon: Heart, color: 'text-red-400' },
    { id: 'catture', label: 'Catture', icon: Zap, color: 'text-cyan-400' },
    { id: 'utili', label: 'Utili', icon: Boxes, color: 'text-purple-400' },
  ];

  return (
    <div className="relative flex flex-col h-full bg-slate-950 p-6 pb-24 overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        {inventoryReturnTarget === 'battle' && (
          <button
            type="button"
            onClick={() => returnToBattleFromInventory()}
            className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-colors"
          >
            <Sword className="w-4 h-4" />
            Indietro alla lotta
          </button>
        )}
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white text-glow-amber">Zaino</h2>
        <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.3em] mt-1">Gestione Risorse Neurali</p>
        {inventoryReturnTarget === 'battle' && (
          <p className="text-[10px] text-cyan-400/90 font-mono mt-2 uppercase tracking-widest">
            Tocca una cura per usarla sul Neo-Mon in campo (poi il nemico può reagire).
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-black/40 p-1.5 rounded-[2rem] border border-white/5 shadow-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest',
                isActive ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? tab.color : 'text-white/20')} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-5 hover:border-white/20 transition-all group active:scale-95"
            >
              <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center relative shadow-inner">
                <Package className="w-8 h-8 text-white/20 group-hover:text-cyan-400 transition-colors" />
                <div className="absolute -top-2 -right-2 bg-amber-400 text-black font-black text-[10px] px-2 py-1 rounded-lg shadow-lg">
                  ×{item.quantity}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-white font-black uppercase text-sm mb-1 tracking-tight">{item.name}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed max-w-[180px]">{item.description}</p>
              </div>

              {inventoryReturnTarget === 'battle' && item.type === 'curative' && item.quantity > 0 ? (
                <button
                  type="button"
                  onClick={() => useItemInBattle(item.id)}
                  className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600/80 border border-emerald-400/50 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 active:scale-95"
                >
                  Usa
                </button>
              ) : (
                <button type="button" className="p-2 text-white/10 hover:text-cyan-400 transition-colors shrink-0" aria-hidden>
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4 mt-20">
            <Package className="w-20 h-20" />
            <span className="font-black uppercase tracking-[0.5em] text-xs">Settore Vuoto</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-white/20">
        <span>Sincronia Inventario: 100%</span>
        <span className="uppercase tracking-widest">Capacità: Illimitata</span>
      </div>

      {inventoryReturnTarget === 'battle' && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => returnToBattleFromInventory()}
            className="pointer-events-auto flex w-full max-w-md items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/95 px-5 py-4 text-sm font-black uppercase tracking-widest text-emerald-200 shadow-2xl shadow-emerald-950/50 backdrop-blur-md transition-colors hover:bg-emerald-600 hover:text-white"
          >
            <Sword className="h-5 w-5 shrink-0" />
            Indietro alla lotta
          </button>
        </div>
      )}
    </div>
  );
};

export default Inventory;
