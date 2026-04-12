import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../context/useStore';
import trainersData from '../../data/trainers.json';
import type { TrainerData } from '../../types/world';
import { Swords, ArrowLeft } from 'lucide-react';

const TrainerBattle: React.FC = () => {
  const {
    pendingTrainerZone,
    defeatedTrainerIds,
    setBattleContext,
    bumpBattleSession,
    setScreen,
    setPendingTrainerZone,
  } = useStore();

  const zone = pendingTrainerZone || 'zone-01';
  const trainers = useMemo(
    () => (trainersData as TrainerData[]).filter((t) => t.zone === zone && !defeatedTrainerIds.includes(t.id)),
    [zone, defeatedTrainerIds]
  );

  const [selected, setSelected] = useState<TrainerData | null>(null);

  const startFight = () => {
    if (!selected) return;
    setBattleContext({ kind: 'trainer', trainerId: selected.id, monIndex: 0 });
    bumpBattleSession();
    setScreen('battle');
    setSelected(null);
    setPendingTrainerZone(null);
  };

  return (
    <div className="h-full w-full bg-slate-950 p-4 pb-24 overflow-y-auto">
      <button
        type="button"
        onClick={() => {
          setPendingTrainerZone(null);
          setScreen('worldmap');
        }}
        className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Mappa
      </button>

      <h1 className="text-xl font-black uppercase text-white mb-4">Allenatori zona</h1>

      {!selected ? (
        <div className="space-y-2">
          {trainers.length === 0 && <p className="text-white/40 text-sm">Nessuno sfidabile qui.</p>}
          {trainers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t)}
              className="w-full text-left p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-500/40"
            >
              <div className="font-black uppercase text-white">{t.name}</div>
              <div className="text-[10px] text-white/40 mt-1">{t.team.length} Neo-Mon</div>
            </button>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-3xl border border-purple-500/30 bg-black/60 p-6 backdrop-blur-xl"
          >
            <div className="h-24 rounded-2xl bg-gradient-to-br from-purple-900/50 to-slate-900 mb-4 flex items-center justify-center text-4xl">
              {selected.isBoss ? '👑' : '🎯'}
            </div>
            <p className="text-sm text-white/80 font-rajdhani italic mb-6">&ldquo;{selected.dialogue.intro}&rdquo;</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={startFight}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-black uppercase text-xs flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" /> Combatti
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-3 rounded-xl border border-white/20 text-white/60 text-xs font-bold uppercase"
              >
                Fuggi
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default TrainerBattle;
