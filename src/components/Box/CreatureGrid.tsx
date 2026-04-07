import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/useStore';
import { ElementType, NeoMon } from '../../types';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Plus, RefreshCcw, Info, Activity, X, Package, Shield } from 'lucide-react';
import NeoMonDetailModal from '../Common/NeoMonDetailModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getCreatureSprite } from '../../utils/imageLoader';
import TeamManager from './TeamManager';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ITEMS_PER_PAGE = 20;

const CreatureGrid: React.FC = () => {
  const { box, team, addToTeam, swapPositions, replaceInTeam, boxTab, setBoxTab } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ElementType[]>([]);
  const [sortBy, setSortBy] = useState<'level' | 'id' | 'hp' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [isSwapping, setIsSwapping] = useState<string | null>(null);
  const [selectedMon, setSelectedMon] = useState<NeoMon | null>(null);
  const [showStats, setShowStats] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredBox = useMemo(() => {
    let result = box.filter((mon: NeoMon) => {
      const matchesName = mon.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedTypes.length === 0 || mon.types.some((t: ElementType) => selectedTypes.includes(t));
      return matchesName && matchesType;
    });

    result.sort((a: NeoMon, b: NeoMon) => {
      let valA: number | string;
      let valB: number | string;

      if (sortBy === 'date') {
        valA = a.caughtAt || 0;
        valB = b.caughtAt || 0;
      } else if (sortBy === 'level' || sortBy === 'id') {
        const key = sortBy as keyof NeoMon;
        valA = a[key] as string | number;
        valB = b[key] as string | number;
      } else {
        valA = a.baseStats.hp;
        valB = b.baseStats.hp;
      }
      
      const comparison = valA < valB ? -1 : (valA > valB ? 1 : 0);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [box, searchTerm, selectedTypes, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredBox.length / ITEMS_PER_PAGE);
  const currentPageItems = filteredBox.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const toggleType = (type: ElementType) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    setPage(0);
  };

  const handleCreatureClick = (mon: NeoMon) => {
    setSelectedMon(mon);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 pb-24 overflow-hidden relative">
      <div className="mb-6 flex flex-col gap-4">
        
        {/* Header con Switch Tab */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white text-glow-cyan">
              {boxTab === 'box' ? 'Neo-Link Box' : 'Active Squad'}
            </h2>
            <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase">
              {boxTab === 'box' ? `Archivio digitale: ${box.length} unità` : 'Sincronizzazione neurale attiva'}
            </span>
          </div>
          
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
             <button 
               onClick={() => setBoxTab('box')}
               className={cn(
                 "p-2.5 rounded-xl transition-all",
                 boxTab === 'box' ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "text-white/30 hover:text-white"
               )}
             >
               <Package className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setBoxTab('team')}
               className={cn(
                 "p-2.5 rounded-xl transition-all relative",
                 boxTab === 'team' ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "text-white/30 hover:text-white"
               )}
             >
               <Shield className="w-5 h-5" />
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 text-[6px] flex items-center justify-center font-black">
                 {team.length}
               </div>
             </button>
          </div>
        </div>

        {boxTab === 'box' && (
          <>
            {/* Filters & Search */}
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Cerca per nome..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white"
                />
              </div>
              
              <div className="flex gap-2">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="date">Sincronia</option>
                  <option value="level">Livello</option>
                  <option value="id">ID</option>
                  <option value="hp">HP</option>
                </select>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
                >
                  <ArrowUpDown className="w-5 h-5 text-white/50" />
                </button>
              </div>
            </div>

            {/* Types Chips */}
            <div className="flex gap-1 overflow-x-auto pb-2 pr-4 scrollbar-hide no-scrollbar mask-gradient-r animate-in fade-in duration-500">
              {Object.values(ElementType).map((type: ElementType) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap",
                    selectedTypes.includes(type) ? "bg-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "bg-white/5 text-white/40 hover:bg-white/10"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {boxTab === 'box' ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pr-2 animate-in fade-in duration-500">
            {currentPageItems.map((mon: NeoMon) => (
              <button
                key={mon.id}
                onClick={() => handleCreatureClick(mon)}
                className="aspect-square bg-gray-900/60 rounded-2xl border border-white/5 p-2 flex flex-col items-center justify-center gap-1 hover:border-cyan-400/50 hover:bg-cyan-900/10 active:scale-95 transition-all relative group"
              >
                <div className="w-full flex-1 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <img 
                      src={getCreatureSprite(mon.id)} 
                      alt={mon.name}
                      className="w-[80%] h-[80%] object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]" 
                    />
                </div>
                
                <div className="w-full flex justify-between items-center px-1">
                  <span className="text-[8px] font-mono text-white/40 truncate max-w-[70%] text-left">{mon.name}</span>
                  <span className="text-[10px] font-bold text-white/80 shrink-0">L.{mon.level}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-300 pb-20">
            <TeamManager />
          </div>
        )}
      </div>

      {/* Pagination (solo se tab box) */}
      {boxTab === 'box' && totalPages > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-[100] shadow-xl">
           <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 hover:bg-white/5 rounded-full disabled:opacity-20"><ChevronLeft className="w-5 h-5 text-cyan-400" /></button>
           <span className="text-xs font-mono font-bold text-white">Box {page + 1}/{totalPages}</span>
           <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="p-2 hover:bg-white/5 rounded-full disabled:opacity-20"><ChevronRight className="w-5 h-5 text-cyan-400" /></button>
        </div>
      )}

      {/* MODAL SCELTA AZIONE */}
      {selectedMon && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="mb-10 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                 <img src={getCreatureSprite(selectedMon.id)} alt="" className="w-24 h-24 object-contain animate-bounce-slow" />
              </div>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{selectedMon.name}</h3>
              <span className="text-cyan-400/60 font-mono text-[10px] uppercase tracking-widest leading-loose">Livello {selectedMon.level} • {selectedMon.types.join("/")}</span>
           </div>

           <div className="flex flex-col gap-3 w-full max-w-[280px]">
              <button 
                onClick={() => { setShowStats(selectedMon.id); setSelectedMon(null); }}
                className="flex items-center justify-center gap-3 w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all font-black uppercase text-xs tracking-widest"
              >
                <Info className="w-5 h-5 text-cyan-400" />
                Dettagli Neurali
              </button>
              
              <button 
                onClick={() => {
                   if (team.some(m => m.id === selectedMon.id)) {
                      setSelectedMon(null);
                      setBoxTab('team');
                   } else if (team.length < 4) {
                      addToTeam(selectedMon.id);
                      setSelectedMon(null);
                      setBoxTab('team');
                   } else {
                      setIsSwapping(selectedMon.id);
                      setSelectedMon(null);
                   }
                }}
                className="flex items-center justify-center gap-3 w-full py-5 bg-cyan-400 text-black rounded-2xl hover:bg-white transition-all font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.3)]"
              >
                {team.some(m => m.id === selectedMon.id) ? <Activity className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {team.some(m => m.id === selectedMon.id) ? 'Gestione attiva' : 'Sincronizza Squadra'}
              </button>

              <button 
                onClick={() => setSelectedMon(null)}
                className="mt-6 text-white/30 hover:text-white uppercase text-[10px] font-black tracking-[0.4em] flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Annulla
              </button>
           </div>
        </div>
      )}

      {/* STATS OVERLAY — usa componente condiviso */}
      {showStats && (() => {
        const mon = [...box, ...team].find(m => m.id === showStats);
        return mon ? <NeoMonDetailModal mon={mon} onClose={() => setShowStats(null)} /> : null;
      })()}

      {/* SWAP OVERLAY (Squadra piena) */}
      {isSwapping && (
        <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">Sostituzione Slot</h1>
          <p className="text-white/40 mb-12 text-center text-xs uppercase tracking-widest">Sincronia Massima: Seleziona chi scambiare.</p>
          
          <div className="flex flex-col gap-3 w-full max-w-[320px]">
            {team.map((tMon) => (
              <button
                key={tMon.id}
                onClick={() => { replaceInTeam(isSwapping, tMon.id); setIsSwapping(null); setBoxTab('team'); }}
                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-cyan-400 hover:bg-cyan-900/20 group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                     <img src={getCreatureSprite(tMon.id)} alt="" className="w-10 h-10 object-contain" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white uppercase">{tMon.name}</div>
                    <div className="text-[10px] text-white/30 font-mono italic">LV.{tMon.level}</div>
                  </div>
                </div>
                <RefreshCcw className="w-5 h-5 text-cyan-400/40 group-hover:rotate-180 transition-all duration-500" />
              </button>
            ))}
            <button onClick={() => setIsSwapping(null)} className="mt-8 text-white/30 hover:text-white uppercase text-[10px] font-black tracking-widest">Annulla Sincronia</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatureGrid;
