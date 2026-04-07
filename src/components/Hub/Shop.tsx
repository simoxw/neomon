import React, { useState } from 'react';
import { useStore } from '../../context/useStore';
import itemsData from '../../data/items.json';
import { 
  ShoppingBag, 
  Wallet, 
  ChevronLeft, 
  Zap, 
  Heart, 
  Package, 
  Sparkles, 
  ArrowLeft 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ShopItem = ({ item, onBuy, canAfford }: { item: any, onBuy: () => void, canAfford: boolean }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'prism': return <Package className="w-6 h-6 text-purple-400" />;
      case 'curative': return item.target === 'hp' ? <Heart className="w-6 h-6 text-red-500" /> : <Zap className="w-6 h-6 text-yellow-500" />;
      case 'evolutive': return <Sparkles className="w-6 h-6 text-cyan-400" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-3xl border transition-all duration-300 flex flex-col",
      "bg-white/5 border-white/10 hover:border-cyan-400/40 hover:bg-white/10",
      !canAfford && "opacity-50"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
           {getIcon()}
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-amber-400/10 rounded-full border border-amber-400/20">
           <span className="text-[10px] font-black text-amber-400">{item.price}</span>
           <Wallet className="w-3 h-3 text-amber-400" />
        </div>
      </div>
      
      <div className="flex-1">
         <h3 className="text-sm font-black uppercase text-white tracking-widest mb-1 italic">{item.name}</h3>
         <p className="text-[10px] text-white/30 leading-snug line-clamp-2">{item.description}</p>
      </div>

      <button 
        disabled={!canAfford}
        onClick={onBuy}
        className={cn(
          "mt-4 w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
          canAfford 
            ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)] active:scale-95" 
            : "bg-white/5 text-white/20 cursor-not-allowed"
        )}
      >
        Acquista
      </button>
    </div>
  );
};

const Shop: React.FC = () => {
  const { coins, buyItem, setScreen } = useStore();
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const handleBuy = async (item: any) => {
    if (coins >= item.price) {
       await buyItem(item.id, item.price);
       setPurchaseMsg(`Hai acquistato ${item.name}!`);
       setTimeout(() => setPurchaseMsg(null), 2000);
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col animate-in fade-in duration-500 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 pt-10 flex items-center justify-between border-b border-white/5 bg-gray-900/40 backdrop-blur-md">
         <button 
           onClick={() => setScreen('hub')}
           className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-90 transition-all"
         >
           <ChevronLeft className="w-6 h-6 text-white" />
         </button>
         <h1 className="text-2xl font-black italic uppercase italic tracking-tighter text-white">Prism Shop</h1>
         <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Coins Banner */}
      <div className="px-6 py-4 flex justify-center sticky top-0 z-20">
         <div className="bg-black/60 border border-amber-400/20 px-8 py-3 rounded-full flex items-center gap-3 backdrop-blur-xl shadow-2xl">
            <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">Saldo Nexus:</span>
            <span className="text-xl font-black text-amber-400">{coins.toLocaleString()}</span>
            <Wallet className="w-5 h-5 text-amber-400" />
         </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide py-4">
         <div className="grid grid-cols-2 gap-4">
            {itemsData.map(item => (
              <ShopItem 
                key={item.id} 
                item={item} 
                onBuy={() => handleBuy(item)} 
                canAfford={coins >= item.price} 
              />
            ))}
         </div>
      </div>

      {/* Feedback Toast */}
      {purchaseMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 bg-cyan-400 text-black font-black uppercase text-xs rounded-full shadow-2xl animate-in slide-in-from-bottom-10">
           {purchaseMsg}
        </div>
      )}
    </div>
  );
};

export default Shop;
