import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, Settings, CheckCircle } from 'lucide-react';
import { db } from '../../db';
import { Button } from '../Common/Button';

const SettingsMenu: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const data = await db.exportSaveData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neomon_save_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setStatus("Salvataggio Esportato!");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await db.importSaveData(event.target?.result as string);
        setStatus("Dati Importati con Successo!");
        setTimeout(() => window.location.reload(), 1500); 
      } catch (err) {
        setStatus("Errore: File non valido");
        setTimeout(() => setStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (confirm("⚠️ SEI SICURO? Tutti i Neo-Mon e i progressi verranno cancellati permanentemente.")) {
      localStorage.removeItem('neomon-storage');
      await db.resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="p-6 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.15)] max-w-md mx-auto text-white">
      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
        <Settings className="text-cyan-400" size={28} />
        <h2 className="text-2xl font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          Terminal Console
        </h2>
      </div>

      <div className="space-y-6">
        <section>
          <p className="text-xs text-cyan-400/60 uppercase tracking-widest mb-3 font-semibold">Data Management</p>
          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400 transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              onClick={handleExport}
            >
              <Download size={18} /> Esporta Salvataggio
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 border-fuchsia-500/50 hover:bg-fuchsia-500/10 text-fuchsia-400 transition-all hover:shadow-[0_0_10px_rgba(217,70,239,0.3)]"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} /> Importa Archivio
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              className="hidden" 
              accept=".json"
            />
          </div>
        </section>

        <section className="pt-6 border-t border-white/5">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-500/10 transition-colors"
            onClick={handleReset}
          >
            <Trash2 size={18} /> Reset Totale Sistema
          </Button>
        </section>

        {status && (
          <div className="mt-4 flex items-center gap-2 justify-center py-2 px-4 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/40 animate-pulse">
            <CheckCircle size={14} />
            <span className="text-sm font-medium italic">{status}</span>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 text-[10px] text-center text-white/30 tracking-widest uppercase">
        Neo-Mon Link v0.1.5 | Dexie Persistence Layer
      </div>
    </div>
  );
};

export default SettingsMenu;
