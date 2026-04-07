import React, { useState } from 'react';
import { useStore } from '../../context/useStore';
import { Trash2, ChevronUp, ChevronDown, X, Activity, MoreVertical } from 'lucide-react';
import { NeoMon } from '../../types';
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
  const { removeFromTeam, swapPositions, team } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showStats, setShowStats] = useState(false);

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
        onClick={() => setShowMenu(true)}
        className={cn(
          "relative w-full p-5 rounded-[2rem] border-l-[8px] transition-all duration-300 group cursor-pointer active:scale-[0.98]",
          "bg-slate-900/60 backdrop-blur-xl border border-white/5",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(34,211,238,0.15)] hover:border-white/10",
          mon.types[0] === 'Bio' ? "border-l-green-500" : 
          mon.types[0] === 'Incandescente' ? "border-l-orange-500" :
          mon.types[0] === 'Idrico' ? "border-l-blue-500" :
          "border-l-cyan-400"
        )}
      >
        <div className="flex items-center gap-5">
          {/* Avatar Area */}
          <div className="relative w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-cyan-400/50 transition-colors">
             <img 
               src={getCreatureSprite(mon.id)} 
               alt={mon.name}
               className="w-[85%] h-[85%] object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:scale-110 transition-transform duration-500" 
             />
             <div className="absolute -bottom-2 -right-2 bg-slate-950 text-[9px] px-2 py-1 rounded-lg border border-white/10 font-mono text-cyan-400 font-bold shadow-xl">
               #{mon.id.split('-').pop()}
             </div>
          </div>

          <div className="flex-1">
             <div className="flex justify-between items-start mb-1">
               <div className="flex flex-col">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none mb-1">{mon.name}</h3>
                  <div className="flex gap-1">
                    {mon.types.map((t: string) => (
                      <span key={t} className="text-[7px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase font-black text-white/40 tracking-widest">
                        {t}
                      </span>
                    ))}
                  </div>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-cyan-400 text-glow-cyan font-mono">L.{mon.level}</span>
                  <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest mt-1">Status Active</span>
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
                   <span className="text-[7px] font-black text-rose-500 uppercase w-6">HP</span>
                   <div className="h-1 flex-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: '100%' }} />
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[7px] font-black text-cyan-400 uppercase w-6">SP</span>
                   <div className="h-1 flex-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: '100%' }} />
                   </div>
                </div>
             </div>
          </div>

          <div className="p-2 text-white/20 group-hover:text-white transition-colors">
             <MoreVertical className="w-5 h-5" />
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
  const { team } = useStore();

  return (
    <div className="h-full w-full p-6 pb-32 overflow-y-auto scrollbar-hide">
      <div className="mb-8 animate-in slide-in-from-left-10 duration-700">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white text-glow-cyan">Active Squad</h2>
        <div className="flex items-center gap-2 mt-2">
           <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
           <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.3em]">Protocollo Sincronia Attivo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {team.map((mon, index) => (
          <TeamCard key={mon.id} mon={mon} index={index} total={team.length} />
        ))}
        {team.length === 0 && (
          <div className="p-16 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-white/10 gap-6 bg-white/2">
            <Activity className="w-16 h-16 opacity-10 animate-pulse" />
            <div className="text-center">
               <span className="block font-black uppercase tracking-[0.3em] text-[11px] opacity-40 mb-1">Squadra Vuota</span>
               <span className="text-[8px] uppercase tracking-[0.2em] opacity-30">Seleziona unità dal Box per iniziare</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManager;
