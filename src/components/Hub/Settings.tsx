import React, { useState } from 'react';
import { useStore } from '../../context/useStore';
import { db } from '../../db';
import { 
  Download, 
  Upload, 
  Trash2, 
  ChevronLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  ShieldAlert,
  Volume2,
  VolumeX 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Settings: React.FC = () => {
  const { setScreen, loadData, volume, volMuted, setVolume, toggleMute } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const exportData = async () => {
    const data = {
      player: await db.player.toArray(),
      team: await db.team.toArray(),
      box: await db.box.toArray(),
      inventory: await db.inventory.toArray(),
      timestamp: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeoMon_Save_Data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setShowSuccess("Esportazione completata!");
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.player || !json.team || !json.box) throw new Error("Format Corrotto");

        await db.transaction('rw', db.player, db.team, db.box, db.inventory, async () => {
          await db.player.clear();
          await db.team.clear();
          await db.box.clear();
          await db.inventory.clear();

          await db.player.bulkAdd(json.player);
          await db.team.bulkAdd(json.team);
          await db.box.bulkAdd(json.box);
          if (json.inventory) await db.inventory.bulkAdd(json.inventory);
        });

        await loadData();
        setShowSuccess("Importazione completata con successo!");
        setTimeout(() => setShowSuccess(null), 3000);
      } catch (err) {
        alert("Errore durante l'importazione: file non valido.");
      }
    };
    reader.readAsText(file);
  };

  const resetAllData = async () => {
    await db.delete();
    window.location.reload();
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col animate-in fade-in duration-500 overflow-hidden text-white">
      
      {/* Header */}
      <div className="p-6 pt-10 flex items-center justify-between border-b border-white/5 bg-gray-900/40 backdrop-blur-md">
         <button onClick={() => setScreen('hub')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-90 transition-all">
           <ChevronLeft className="w-6 h-6" />
         </button>
         <h1 className="text-2xl font-black italic uppercase tracking-tighter">Nexus Console</h1>
         <div className="w-10 h-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-12 pb-24 scrollbar-hide">
         
         {/* Audio Section */}
         <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-white/30 italic px-2">Neural Audio Signal</h3>
            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-inner",
                       volMuted ? "bg-red-500/10 border-red-500/30" : "bg-cyan-400/10 border-cyan-400/30"
                     )}>
                        {volMuted ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6 text-cyan-400" />}
                     </div>
                     <div>
                        <div className="font-black uppercase tracking-widest text-sm mb-1 italic">Master Control</div>
                        <div className="text-[10px] text-white/20 uppercase tracking-tighter">Audio Feedback Layer</div>
                     </div>
                  </div>
                  <button 
                    onClick={toggleMute}
                    className={cn(
                      "px-6 py-2 rounded-xl font-black uppercase text-[10px] transition-all tracking-widest",
                      volMuted ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "bg-white/10 text-white shadow-inner"
                    )}
                  >
                    {volMuted ? 'Muted' : 'Live'}
                  </button>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase tracking-[0.3em]">
                     <span>Volume Gain</span>
                     <span className="text-cyan-400">{Math.round((volume || 0) * 100)}%</span>
                  </div>
                  <div className="relative flex items-center">
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-black rounded-full appearance-none accent-cyan-400 cursor-pointer shadow-inner"
                    />
                  </div>
               </div>
            </div>
         </div>

         {/* Save Section */}
         <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-white/30 italic px-2">Data Sync & Backup</h3>
            <div className="grid grid-cols-1 gap-3">
               <button 
                 onClick={exportData}
                 className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 transition-all text-left group"
               >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 group-hover:scale-110 transition-all">
                    <Download className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-black uppercase tracking-widest text-sm mb-1 italic">Backup Esporta JSON</div>
                    <div className="text-[10px] text-white/30 truncate max-w-[200px]">Archivia il tuo DNA digitale.</div>
                  </div>
               </button>

               <label className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-all">
                    <Upload className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-black uppercase tracking-widest text-sm mb-1 italic">Ripristina Importa JSON</div>
                    <div className="text-[10px] text-white/30 truncate max-w-[200px]">Iniezione sequenza dati esterna.</div>
                  </div>
                  <input type="file" className="hidden" accept=".json" onChange={importData} />
               </label>
            </div>
         </div>

         {/* Advanced Tech */}
         <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-white/30 italic px-2">Advanced Protocol</h3>
            <div className="p-8 rounded-[2.5rem] bg-red-950/10 border border-red-500/10 flex flex-col items-center text-center">
               <ShieldAlert className="w-14 h-14 text-red-500/10 mb-6" />
               <h4 className="font-black text-red-500/60 uppercase text-xs mb-3 tracking-[0.3em]">Protocollo Reset Totale</h4>
               <p className="text-[10px] text-white/20 mb-8 max-w-[220px] leading-relaxed uppercase">Cancellazione irreversibile di tutti i dati dal Linker locale. Procedere con cautela.</p>
               
               <button 
                 onClick={() => setShowResetConfirm(true)}
                 className="px-10 py-3 rounded-2xl border border-red-500/40 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
               >
                 Inizia Reset Secco
               </button>
            </div>
         </div>

         {/* Version Info */}
         <div className="flex flex-col items-center gap-3 opacity-10 pt-12">
            <div className="text-[9px] font-mono tracking-[0.6em] uppercase">Neo-Link v1.1.0 RC</div>
            <div className="text-[8px] font-mono italic">Neural-Layer Sync Active</div>
         </div>
      </div>

      {/* Overlays (Success & Reset Confirmation) */}
      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[500] px-10 py-4 bg-green-500 text-black font-black uppercase text-[10px] tracking-widest rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-12">
           <CheckCircle2 className="w-5 h-5 shadow-inner" />
           {showSuccess}
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="w-full max-w-sm p-12 rounded-[3.5rem] border border-red-500/20 bg-red-950/30 flex flex-col items-center text-center shadow-[0_0_60px_rgba(239,68,68,0.15)]">
              <AlertTriangle className="w-20 h-20 text-red-500 mb-8 animate-pulse shadow-red-500" />
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-6">Reset Secco?</h2>
              <p className="text-xs text-white/30 mb-12 italic uppercase tracking-tight leading-relaxed">Tutti i tuoi Neo-Mon e progressi neurali verranno polverizzati nel vuoto cibernetico di sistema.</p>
              
              <div className="flex flex-col w-full gap-4">
                 <button 
                   onClick={resetAllData}
                   className="w-full py-5 bg-red-500 text-white font-black uppercase text-xs tracking-[0.4em] rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
                 >
                   Conferma Wipe
                 </button>
                 <button 
                   onClick={() => setShowResetConfirm(false)}
                   className="w-full py-5 text-white/30 font-black uppercase text-[10px] tracking-[0.3em] rounded-3xl hover:bg-white/5 active:scale-95 transition-all"
                 >
                   Abortire
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
