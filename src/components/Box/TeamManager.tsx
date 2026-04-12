import React, { useState } from 'react';
import { useStore } from '../../context/useStore';
import { Trash2, ChevronUp, ChevronDown, X, Activity, MoreVertical } from 'lucide-react';
import { NeoMon } from '../../types';
import itemsData from '../../data/items.json';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getCreatureSprite } from '../../utils/imageLoader';
import NeoMonDetailModal from '../Common/NeoMonDetailModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const StatRow = ({ label, value, color, iv }: { label: string; value: number; color: string; iv?: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-baseline mb-1">
       <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{label}</span>
       <div className="flex gap-2 items-baseline">
          {iv !== undefined && <span className="text-[8px] font-mono text-cyan-400 opacity-60">IV {iv}</span>}
          <span className="text-sm font-black text-white">{value}</span>
       </div>
    </div>
    <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/5">
       <div 
          className={cn("h-full rounded-full transition-all duration-1000", color)} 
          style={{ width: `${Math.min(100, (value / 255) * 100)}%` }} 
       />
    </div>
  </div>
);

const TeamCard = ({ mon, index, total }: { mon: NeoMon; index: number; total: number }) => {
  const { removeFromTeam, swapPositions, team, pendingItemToUse, applyItemToNeoMon, setPendingItemToUse } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleClick = () => {
    if (pendingItemToUse) {
      applyItemToNeoMon(pendingItemToUse, mon.id).then((success) => {
        if (success) {
          setPendingItemToUse(null);
        }
      });
    } else {
      setShowMenu(true);
    }
  };

  const moveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const prevMon = team[index - 1];
    if (prevMon) swapPositions(mon.id, prevMon.id);
  };

  const moveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === total - 1) return;
    const nextMon = team[index + 1];
    if (nextMon) swapPositions(mon.id, nextMon.id);
  };

  return (
    <div className="relative">
      <div 
        onClick={handleClick}
        className={cn(
          "relative w-full px-4 py-5 rounded-[2rem] border-l-[8px] transition-all duration-300 group cursor-pointer active:scale-[0.98]",
          "bg-slate-900/60 backdrop-blur-xl border border-white/5",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(34,211,238,0.15)] hover:border-white/10",
          pendingItemToUse ? "ring-2 ring-cyan-400 ring-offset-4 ring-offset-slate-950 scale-[1.02]" : "",
          mon.types[0] === 'Bio' ? "border-l-green-500" : 
          mon.types[0] === 'Incandescente' ? "border-l-orange-500" :
          mon.types[0] === 'Idrico' ? "border-l-blue-500" :
          "border-l-cyan-400"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Avatar Area */}
          <div className="relative w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-cyan-400/50 transition-colors">
             <img 
               src={getCreatureSprite(mon.id)} 
               alt={mon.name}
               className="w-[85%] h-[85%] object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:scale-110 transition-transform duration-500" 
             />
             <div className="absolute -bottom-2 -right-2 bg-slate-950 text-[9px] px-2 py-1 rounded-lg border border-white/10 font-mono text-cyan-400 font-bold shadow-xl">
               #{mon.id.split('-').pop()}
             </div>
          </div>

          <div className="flex-1 min-w-0">
             <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none whitespace-nowrap">{mon.name}</h3>
                   <div className="p-1 text-white/20 group-hover:text-white transition-colors shrink-0 -mt-1 -mr-1">
                      <MoreVertical className="w-4 h-4" />
                   </div>
                </div>
                
                <div className="flex items-center justify-between">
                   <div className="flex gap-1">
                     {mon.types.map((t: string) => (
                       <span key={t} className="text-[7px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase font-black text-white/40 tracking-widest">
                         {t}
                       </span>
                     ))}
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-cyan-400 text-glow-cyan font-mono leading-none">L.{mon.level}</span>
                   </div>
                </div>
             </div>
             
             {/* EXPERIENCE BAR */}
             <div className="mt-4 mb-2 space-y-1">
                <div className="flex justify-between items-center text-[7px] uppercase font-black text-white/30 tracking-widest italic">
                   <span>Sync Progress</span>
                   <span>{mon.exp} / {Math.pow(mon.level, 3)}XP</span>
                </div>
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/5">
                   <div 
                      className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (mon.exp / Math.pow(mon.level, 3)) * 100)}%` }} 
                   />
                </div>
             </div>

             {/* STATS BARS QUICKET */}
             <div className="grid grid-cols-1 gap-2 mt-4">
                <div className="flex items-center gap-3">
                   <span className="text-[7px] font-black text-emerald-500 uppercase w-6">HP</span>
                   <div className="h-1 flex-1 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((mon.currentHp ?? (mon.currentStats?.hp ?? mon.baseStats.hp)) / (mon.currentStats?.hp ?? mon.baseStats.hp)) * 100)}%` }} 
                      />
                   </div>
                   <span className="text-[8px] font-mono text-white/40 w-12 text-right">
                     {Math.floor(mon.currentHp ?? (mon.currentStats?.hp ?? mon.baseStats.hp))}/{mon.currentStats?.hp ?? mon.baseStats.hp}
                   </span>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[7px] font-black text-yellow-400 uppercase w-6">SP</span>
                   <div className="h-1 flex-1 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((mon.currentStamina ?? (mon.currentStats?.stamina ?? mon.baseStats.stamina)) / (mon.currentStats?.stamina ?? mon.baseStats.stamina)) * 100)}%` }} 
                      />
                   </div>
                   <span className="text-[8px] font-mono text-white/40 w-12 text-right">
                     {Math.floor(mon.currentStamina ?? (mon.currentStats?.stamina ?? mon.baseStats.stamina))}/{mon.currentStats?.stamina ?? mon.baseStats.stamina}
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* STATS OVERLAY — componente condiviso */}
      {showStats && <NeoMonDetailModal mon={mon} onClose={() => setShowStats(false)} />}


      {/* MODAL MENU CENTRALE */}
      {showMenu && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-400">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
           
           <div className="relative w-full max-w-[320px] bg-slate-900 border-2 border-cyan-400/30 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(34,211,238,0.25)] animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-10 text-center">
                 <div className="w-full">
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">{mon.name}</h4>
                    <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400/60">Tactical Control Hub</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <button 
                   onClick={() => { setShowStats(true); setShowMenu(false); }}
                   className="w-full flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[11px]"
                 >
                   <Activity className="w-6 h-6 text-cyan-400" />
                   Deep Scan Report
                 </button>

                 <button 
                   onClick={() => { removeFromTeam(mon.id); setShowMenu(false); }}
                   className="w-full flex items-center gap-4 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 hover:bg-red-500/40 transition-all font-black uppercase tracking-widest text-[11px]"
                 >
                   <Trash2 className="w-6 h-6" />
                   Sposta nel Box
                 </button>
                 
                 <div className="pt-6 border-t border-white/5 mt-6">
                    <span className="block text-center text-[9px] uppercase font-black tracking-[0.4em] text-white/20 mb-5">Neural Position</span>
                    <div className="flex justify-between items-center gap-4 bg-black/60 p-2 rounded-[2rem] border border-white/5">
                       <button onClick={(e) => moveUp(e)} disabled={index === 0} className="flex-1 py-5 flex justify-center bg-cyan-400/5 hover:bg-cyan-400/20 rounded-2xl disabled:opacity-0 transition-all active:scale-95">
                          <ChevronUp className="w-8 h-8 text-cyan-400" />
                       </button>
                       <button onClick={(e) => moveDown(e)} disabled={index === total - 1} className="flex-1 py-5 flex justify-center bg-cyan-400/5 hover:bg-cyan-400/20 rounded-2xl disabled:opacity-0 transition-all active:scale-95">
                          <ChevronDown className="w-8 h-8 text-cyan-400" />
                       </button>
                    </div>
                 </div>

                 <button onClick={() => setShowMenu(false)} className="w-full py-4 text-[9px] font-mono text-white/20 uppercase tracking-widest mt-4">Close Menu</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TeamManager: React.FC = () => {
  const { team, pendingItemToUse, setPendingItemToUse } = useStore();
  const pendingItem = itemsData.find(i => i.id === pendingItemToUse);

  return (
    <div className="h-full w-full px-2 py-6 pb-32 overflow-y-auto scrollbar-hide">
      {pendingItemToUse && (
        <div className="mb-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
               <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Uso Oggetto</p>
              <p className="text-sm font-black text-white uppercase italic">{pendingItem?.name || 'Oggetto Sconosciuto'}</p>
            </div>
          </div>
          <button 
            onClick={() => setPendingItemToUse(null)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors"
          >
            Annulla
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {team.map((mon, index) => (
          <TeamCard key={mon.id} mon={mon} index={index} total={team.length} />
        ))}
      </div>
    </div>
  );
};

export default TeamManager;
