import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/useStore';
import creaturesData from '../../data/creatures.json';
import { getCreatureSprite } from '../../utils/imageLoader';
import { 
  Dna, 
  ChevronLeft, 
  ShieldCheck, 
  ShieldAlert, 
  Target,
  HelpCircle,
  Lock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LinkDex: React.FC = () => {
  const { seenIds, team, box, setScreen } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const capturedIds = useMemo(() => {
    return Array.from(new Set([...team.map(m => m.id), ...box.map(m => m.id)]));
  }, [team, box]);

  const dexEntries = Array.from({ length: 20 }).map((_, i) => {
    const id = `n-${(i + 1).toString().padStart(3, '0')}`;
    const data = creaturesData.find(c => c.id === id);
    const isCaptured = capturedIds.includes(id);
    const isSeen = seenIds.includes(id) || isCaptured;

    return {
      id,
      name: isSeen ? (data?.name || "??") : id,
      isSeen,
      isCaptured,
      data
    };
  });

  const selectedMon = useMemo(() => {
    return dexEntries.find(e => e.id === selectedId);
  }, [selectedId, dexEntries]);

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col animate-in fade-in duration-500 overflow-hidden text-white">
      
      {/* Header */}
      <div className="p-6 pt-10 flex items-center justify-between border-b border-white/5 bg-gray-900/40 backdrop-blur-md">
         <button onClick={() => setScreen('hub')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-90 transition-all">
           <ChevronLeft className="w-6 h-6" />
         </button>
         <h1 className="text-2xl font-black italic uppercase tracking-tighter shadow-cyan-400/20">Neo-Link Dex</h1>
         <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase font-black text-white/30 tracking-widest leading-none mb-1">Neural Sync</span>
            <span className="text-sm font-black text-cyan-400 leading-none">{Math.round((capturedIds.length/20)*100)}%</span>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Entries Grid */}
        <div className="w-5/12 border-r border-white/5 overflow-y-auto scrollbar-hide p-3 grid grid-cols-2 gap-2 bg-black/40 content-start">
           {dexEntries.map((entry) => (
             <button
               key={entry.id}
               disabled={!entry.isSeen}
               onClick={() => setSelectedId(entry.id)}
               className={cn(
                 "aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center text-center relative overflow-hidden group p-2",
                 !entry.isSeen && "border-white/5 bg-transparent",
                 entry.isCaptured && "border-cyan-400/20 bg-cyan-900/10",
                 entry.isSeen && !entry.isCaptured && "border-white/10 bg-white/5",
                 selectedId === entry.id && "ring-2 ring-cyan-400"
               )}
             >
                {!entry.isSeen ? (
                  <HelpCircle className="w-8 h-8 text-white/5 opacity-40 animate-pulse" />
                ) : (
                  <>
                    <img 
                      src={getCreatureSprite(entry.id)} 
                      alt="" 
                      className={cn(
                        "w-full h-full object-contain mb-1 transition-all",
                        entry.isCaptured ? "drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "brightness-0 opacity-20"
                      )} 
                    />
                    <div className="absolute top-1 left-2 text-[6px] font-mono text-white/20">#{entry.id.split('-')[1]}</div>
                  </>
                )}
             </button>
           ))}
        </div>

        {/* Right: Detailed View */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-slate-950">
           {selectedMon && selectedMon.isSeen ? (
             <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
               
               {/* Large Sprite Interface */}
                <div className={cn(
                  "w-56 h-56 rounded-[2.5rem] flex items-center justify-center mb-8 relative bg-black/40 border border-white/5",
                  selectedMon.isCaptured && "shadow-[inset_0_0_50px_rgba(34,211,238,0.1)]"
                )}>
                   <motion.img 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      src={getCreatureSprite(selectedMon.id)} 
                      alt="" 
                      className={cn(
                        "w-44 h-44 object-contain transition-all duration-1000",
                        selectedMon.isCaptured ? "drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]" : "brightness-0 opacity-10"
                      )}
                   />
                </div>

               <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-1">{selectedMon.name}</h2>
               <div className="flex gap-2 mb-8">
                 {selectedMon.data?.types.map(t => (
                   <span key={t} className="text-[9px] px-3 py-1 rounded-lg bg-cyan-400 text-black font-black tracking-widest uppercase">{t}</span>
                 ))}
               </div>

               {selectedMon.isCaptured ? (
                 <div className="w-full space-y-8">
                    <div className="grid grid-cols-2 gap-3">
                       {Object.entries(selectedMon.data?.baseStats || {}).map(([stat, val]: any) => (
                         <div key={stat} className="bg-white/5 border border-white/10 p-4 rounded-3xl">
                            <div className="text-[9px] uppercase font-black text-white/20 tracking-widest mb-1 italic">{stat}</div>
                            <div className="text-xl font-black text-white italic">{val}</div>
                         </div>
                       ))}
                    </div>

                    <div className="p-6 bg-black/60 border border-white/10 rounded-[2rem] space-y-4 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-5"><Dna className="w-16 h-16" /></div>
                       <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-cyan-400 italic mb-4">Neural Analysis</h3>
                       
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-red-900/20 border border-red-500/40 flex items-center justify-center">
                             <ShieldAlert className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                             <div className="text-[8px] uppercase font-black text-white/30 tracking-widest">Protocol Vulnerability</div>
                             <div className="text-[11px] font-bold text-white uppercase italic">Anomalia Bio, Flusso Termico</div>
                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="w-full flex flex-col items-center gap-6 p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/2">
                    <Lock className="w-12 h-12 text-white/10" />
                    <div className="text-center">
                       <p className="text-[11px] font-mono text-white/30 uppercase tracking-[0.2em] italic mb-2">Sincronia Incompleta</p>
                       <p className="text-[9px] text-white/15 leading-relaxed tracking-widest uppercase">Cattura l'entità per sbloccare i parametri vitali e l'analisi biogenetica.</p>
                    </div>
                 </div>
               )}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-10">
                <Target className="w-20 h-20 mb-6" />
                <p className="text-[11px] font-mono uppercase tracking-[0.5em] italic leading-loose">Seleziona bersaglio nel Nexus</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default LinkDex;
