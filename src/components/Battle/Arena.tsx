import React, { useState, useEffect } from 'react';
import { useBattle } from '../../hooks/useBattle';
import { Zap, RefreshCw, Package, Users } from 'lucide-react';
import { useStore } from '../../context/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

import { getCreatureSprite } from '../../utils/imageLoader';
import CatchAnimation from './CatchAnimation';
import BattleLog from './BattleLog';
import { performCatchAttempt } from '../../logic/CatchSystem';
import itemsData from '../../data/items.json';
import { db } from '../../db';
import { ElementType } from '../../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TYPE_COLORS: Record<string, string> = {
  [ElementType.Bio]: 'rgba(34, 197, 94, 0.4)',
  [ElementType.Incandescente]: 'rgba(239, 68, 68, 0.4)',
  [ElementType.Idrico]: 'rgba(6, 182, 212, 0.4)',
  [ElementType.Fulgido]: 'rgba(234, 179, 8, 0.4)',
  [ElementType.Tetro]: 'rgba(129, 140, 248, 0.4)',
  [ElementType.Meccanico]: 'rgba(148, 163, 184, 0.4)',
  [ElementType.Etereo]: 'rgba(232, 121, 249, 0.4)',
  [ElementType.Cinetico]: 'rgba(244, 63, 94, 0.4)',
  [ElementType.Geologico]: 'rgba(120, 113, 108, 0.4)',
  [ElementType.Aereo]: 'rgba(186, 230, 253, 0.4)',
  [ElementType.Criogenico]: 'rgba(165, 243, 252, 0.4)',
  [ElementType.Prismatico]: 'rgba(255, 255, 255, 0.4)',
};

const StatBar = ({ value, max, color, label }: { value: number, max: number, color: string, label: string }) => {
  const [ghostWidth, setGhostWidth] = useState((value / max) * 100);
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  useEffect(() => {
    const timer = setTimeout(() => { setGhostWidth(percentage); }, 600);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-[8px] uppercase font-black tracking-[0.2em] text-white/40">
        <span>{label}</span>
        <span>{Math.ceil(value)} / {max}</span>
      </div>
      <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1px] relative">
        <motion.div animate={{ width: `${ghostWidth}%` }} transition={{ duration: 1 }} className="absolute inset-y-0 left-0 bg-white/20 rounded-full" />
        <motion.div animate={{ width: `${percentage}%` }} transition={{ duration: 0.3 }} className={cn("h-full rounded-full relative z-10", color)} />
      </div>
    </div>
  );
};

const Arena: React.FC = () => {
  const { setScreen, captureNeoMon } = useStore();
  const { playerMon, opponentMon, battleLog, isTurnInProgress, status, allMoves, handleAction } = useBattle("p-01", "o-01");
  const [showPrisms, setShowPrisms] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [inventoryPrisms, setInventoryPrisms] = useState<any[]>([]);
  const [catchAttempt, setCatchAttempt] = useState<{success: boolean, shakes: number} | null>(null);
  const { team } = useStore();

  useEffect(() => {
    const loadInventory = async () => {
       const inv = await db.inventory.toArray();
       const prisms = inv.map(i => {
           const data = itemsData.find(item => item.id === i.itemId);
           return data ? { ...data, quantity: i.quantity } : null;
       }).filter(i => i && i.type === 'Catch' && i.quantity > 0);
       setInventoryPrisms(prisms);
    };
    loadInventory();
  }, [showPrisms]);

  const handleCatch = (prism: any) => {
    setShowPrisms(false);
    const result = performCatchAttempt(opponentMon?.currentStats?.hp || 100, opponentMon?.currentHp || 0, prism.id === 'i-prism-03' ? 'master' : (prism.id === 'i-prism-02' ? 'neon' : 'base'));
    setCatchAttempt(result);
  };

  const onCatchAnimationComplete = async () => {
    if (catchAttempt?.success && opponentMon) {
      await captureNeoMon(opponentMon, inventoryPrisms.find(p => p.type === 'Catch')?.id || 'i-prism-01');
      setScreen('hub');
    }
    setCatchAttempt(null);
  };

  if (!playerMon || !opponentMon) {
    return <div className="h-full w-full flex items-center justify-center bg-slate-950"><RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" /></div>;
  }

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-emerald-800 via-emerald-950 to-slate-950 flex flex-col overflow-hidden select-none animate-in fade-in duration-700">
      
      {/* Background Accent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none">
         <Zap className="w-96 h-96 text-emerald-400" />
      </div>

      {/* HEADER AREA: Symmetrically mirrored (Opponent Stats on Left, Sprite on Right) */}
      <div className="pt-6 px-6 flex justify-between items-start relative z-20 h-40">
         
         {/* LEFT TOP: Flee + Backpack + Opponent Stats */}
         <div className="flex flex-col gap-4">
            <div className="flex gap-2">
               <button onClick={() => setScreen('hub')} className="px-5 py-2 bg-red-900/40 border border-red-500/40 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95">Fuga</button>
               <button onClick={() => setScreen('inventory')} className="px-5 py-2 bg-blue-900/40 border border-blue-500/40 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95">Zaino</button>
            </div>
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-40 p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 shadow-2xl">
               <div className="flex justify-between items-baseline mb-1">
                  <h2 className="text-[9px] font-black text-white uppercase italic tracking-tighter truncate">{opponentMon.name}</h2>
                  <span className="text-[7px] font-mono text-cyan-400 italic">L.{opponentMon.level}</span>
               </div>
               <div className="space-y-1">
                  <StatBar value={opponentMon.currentHp} max={opponentMon.currentStats?.hp || opponentMon.baseStats.hp} label="" color="bg-rose-500" />
                  <div className="h-0.5 w-full bg-black/40 rounded-full overflow-hidden">
                     <div className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" style={{ width: `${(opponentMon.currentStamina / (opponentMon.currentStats?.stamina || opponentMon.baseStats.stamina)) * 100}%` }} />
                  </div>
               </div>
            </motion.div>
         </div>

         {/* RIGHT TOP: Opponent Sprite (Grande come il Player) */}
         <div className="relative w-[45%] aspect-square">
            <motion.div className="absolute inset-0 rounded-full blur-3xl opacity-20 bg-emerald-400" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }} />
            <motion.img 
              src={getCreatureSprite(opponentMon.id)} 
              className="w-full h-full object-contain relative z-10"
              animate={{ scale: [1, 1.02, 1], y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
         </div>
      </div>

      {/* Battlefield Main View: Only Log here now */}
      <div className="flex-1 relative flex flex-col items-center justify-center">
        {/* Battle Log: Central Horizontal - Auto-scroll gestito internamente */}
        <div className="w-full px-6 h-28 relative z-[100] transform -translate-y-8 flex items-center justify-center">
           <div className="w-full max-w-[300px] h-full bg-black/85 backdrop-blur-3xl border border-white/10 flex flex-col overflow-hidden rounded-2xl shadow-2xl">
              <BattleLog messages={battleLog} />
           </div>
        </div>
      </div>

      {/* Control Panel Footer */}
      <div className="bg-slate-950/98 border-t border-white/10 flex flex-col backdrop-blur-3xl pb-10">
        
        {/* Footer Header: Sprite a Sinistra, Biometria a Destra - Alzato di 20px */}
        <div className="px-6 py-2 flex items-end justify-between bg-emerald-950/10 h-36 relative overflow-visible border-b border-white/5 transform translate-y-[-25px]">
           {/* Sprite Player (In basso a sinistra) */}
           <div className="w-[45%] aspect-square relative -mb-10 z-40 transform translate-y-[-15px] -ml-6">
              <motion.img 
                src={getCreatureSprite(playerMon.id)} 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
                animate={{ scale: [1, 1.04, 1], y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
           </div>

           {/* Biometry Player (In basso a destra) */}
           <div className="flex-1 flex flex-col gap-2 pl-4 pb-4 animate-in slide-in-from-right-6 transition-all duration-700 max-w-[50%]">
              <div className="flex justify-between items-baseline mb-1">
                 <span className="text-[13px] font-black uppercase text-white tracking-widest italic text-glow-white underline decoration-emerald-500/50">{playerMon.name}</span>
                 <span className="text-[8px] text-emerald-400 font-mono italic">LV.{playerMon.level}</span>
              </div>
              <StatBar value={playerMon.currentHp} max={playerMon.currentStats?.hp || playerMon.baseStats.hp} label="HP" color="bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
              <StatBar value={playerMon.currentStamina} max={playerMon.currentStats?.stamina || playerMon.baseStats.stamina} label="SP" color="bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
           </div>
        </div>

        {/* Action Grid: Layout Originale Ripristinato - Pulsanti più grandi (h-36) */}
        <div className="p-4 space-y-4 bg-black/40">
           {/* Mosse Griglia 2x2 */}
           <div className="grid grid-cols-2 gap-4 h-36">
              {playerMon.moves.slice(0, 4).map((mId) => {
                const moveData = allMoves.find(m => m.id === mId);
                if (!moveData) return null;
                return (
                  <button key={mId} disabled={isTurnInProgress || status !== 'fighting'} onClick={() => handleAction('move', mId)} className="bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-3 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30 group active:scale-95 shadow-lg">
                    <span className="text-[11px] font-black uppercase tracking-tighter group-active:scale-90">{moveData.name}</span>
                    <span className="text-[7px] uppercase font-mono tracking-widest opacity-40 italic mt-1 font-bold">COST: {moveData.staminaCost} SP</span>
                  </button>
                );
              })}
           </div>

           {/* Comandi Rapidi: Riga Orizzontale Dedicata */}
           <div className="flex gap-2 h-12">
              <button onClick={() => handleAction('rest')} disabled={isTurnInProgress || status !== 'fighting'} className="flex-1 bg-amber-900/20 border border-amber-500/40 text-amber-500 text-[11px] font-black uppercase rounded-xl hover:bg-amber-500 hover:text-black transition-all active:scale-95 shadow-md">Riposo</button>
              <button
                onClick={() => setShowSwitch(true)}
                disabled={isTurnInProgress || status !== 'fighting' || team.filter(m => m.id !== playerMon?.id).length === 0}
                className="flex-1 bg-purple-900/40 border border-purple-500/30 text-purple-400 text-[11px] font-black uppercase rounded-xl hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md disabled:opacity-30"
              >
                <Users className="w-3.5 h-3.5" /> Switch
              </button>
              <button onClick={() => setShowPrisms(true)} disabled={isTurnInProgress || status !== 'fighting'} className="flex-1 bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase rounded-xl hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center text-center active:scale-95 px-2 shadow-md">
                 Prisma
              </button>
           </div>
        </div>
      </div>

      {/* Modal Layers */}
      <AnimatePresence>
        {showPrisms && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[400] bg-black/95 backdrop-blur-xl flex flex-col justify-end">
             <div className="p-8 pb-32">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-3xl font-black italic uppercase text-white">Prisms</h3>
                   <button onClick={() => setShowPrisms(false)} className="text-xs font-black text-white/40 uppercase">Back</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                   {inventoryPrisms.map(p => (
                     <button key={p.id} onClick={() => handleCatch(p)} className="flex-shrink-0 w-40 aspect-square bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center group hover:border-cyan-400 snap-center transition-all">
                       <Package className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110" />
                       <div className="text-[11px] font-black uppercase text-white mb-1">{p.name}</div>
                       <div className="text-[9px] font-mono text-cyan-400/60 uppercase">D: {p.quantity}</div>
                     </button>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Switch Overlay */}
      <AnimatePresence>
        {showSwitch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[400] bg-black/95 backdrop-blur-xl flex flex-col justify-end">
            <div className="p-8 pb-32">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-3xl font-black italic uppercase text-white">Cambio</h3>
                  <p className="text-[9px] text-white/30 uppercase font-mono tracking-widest mt-0.5">Seleziona il sostituto — costerà il turno</p>
                </div>
                <button onClick={() => setShowSwitch(false)} className="text-xs font-black text-white/40 uppercase hover:text-white transition-colors">Annulla</button>
              </div>
              <div className="flex flex-col gap-3">
                {team
                  .filter(m => m.id !== playerMon?.id)
                  .map(m => {
                    const hp = m.currentStats?.hp || m.baseStats.hp;
                    const hpPercent = 100; // al massimo fuori campo
                    return (
                      <button
                        key={m.id}
                        onClick={() => { handleAction('switch', m.id); setShowSwitch(false); }}
                        className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-400 hover:bg-purple-900/20 transition-all active:scale-95 group"
                      >
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                          <img src={getCreatureSprite(m.id)} alt="" className="w-10 h-10 object-contain" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-black uppercase text-white tracking-tight">{m.name}</div>
                          <div className="text-[8px] font-mono text-white/30 uppercase">LV.{m.level} • {m.types.join('/')}</div>
                          <div className="mt-1.5 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${hpPercent}%` }} />
                          </div>
                        </div>
                        <Users className="w-4 h-4 text-purple-400/40 group-hover:text-purple-400 transition-colors shrink-0" />
                      </button>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {catchAttempt && <CatchAnimation attemptResult={catchAttempt} neoMonName={opponentMon.name} onComplete={onCatchAnimationComplete} />}
      
      {status !== 'fighting' && status !== 'idle' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-[500] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center text-white">
           <h1 className={cn("text-7xl font-black italic uppercase tracking-tighter mb-4", status === 'won' ? "text-emerald-400 text-glow-emerald" : "text-red-500")}>
             {status === 'won' ? 'Victory' : 'Defeat'}
           </h1>
           <button onClick={() => setScreen('hub')} className="px-16 py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-2xl">Return to Hub</button>
        </motion.div>
      )}
    </div>
  );
};

export default Arena;
