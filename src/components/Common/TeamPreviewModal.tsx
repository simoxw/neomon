import React from 'react';
import { X, Import, Info, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamShareData } from '../../utils/teamShare';
import { getCreatureSprite } from '../../utils/imageLoader';
import creaturesData from '../../data/creatures.json';
import { LINK_QUALITIES } from '../../data/linkQualities';

interface Props {
  data: TeamShareData;
  onClose: () => void;
  onImport: () => void;
}

const TeamPreviewModal: React.FC<Props> = ({ data, onClose, onImport }) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-cyan-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Team Ricevuto</h3>
              <p className="text-[10px] text-white/40 font-medium">Versione Protocollo v{data.v}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/30" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {data.t.map((entry, i) => {
            const species = (creaturesData as any[]).find(c => c.id === entry.id);
            const quality = LINK_QUALITIES.find(q => q.id === entry.lq);
            return (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-cyan-500/30 transition-all">
                <div className="w-16 h-16 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 relative shrink-0">
                  <img src={getCreatureSprite(entry.id)} alt="" className="w-12 h-12 object-contain drop-shadow-lg" />
                  <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-black text-[8px] font-black px-1.5 rounded-full border-2 border-slate-900">
                    L.{entry.lv}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white uppercase truncate">{entry.nn || species?.name || 'Sconosciuto'}</h4>
                  {entry.nn && (
                    <p className="text-[8px] text-white/40 uppercase font-bold italic tracking-tighter">Specie: {species?.name}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="text-[8px] font-orbitron text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">
                      {quality?.name || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-black/40 border-t border-white/5 flex gap-3">
          <button 
            onClick={onImport}
            className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95"
          >
            <Import className="w-4 h-4" /> Importa come Riferimento
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
          >
            Chiudi
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamPreviewModal;
