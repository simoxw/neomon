import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Map, Users, Info, Compass } from 'lucide-react';
import { useStore } from '../../context/useStore';
import zonesData from '../../data/zones.json';
import type { ZoneData } from '../../types/world';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WorldMap: React.FC = () => {
  const { player, setScreen, setBattleContext, bumpBattleSession, setPendingTrainerZone } = useStore();
  const badges = player?.badges ?? [];
  const [detail, setDetail] = useState<ZoneData | null>(null);

  const zones = useMemo(() => {
    return (zonesData as ZoneData[]).map((z) => {
      const isUnlocked = z.unlocked || (z.requiredBadge && badges.includes(z.requiredBadge));
      return {
        ...z,
        unlocked: !!isUnlocked,
      };
    });
  }, [badges]);

  const startExplore = (z: ZoneData) => {
    setBattleContext({
      kind: 'zone',
      zoneId: z.id,
      encounterPool: z.encounterPool,
      encounterRates: z.encounterRates,
      minLevel: z.minLevel,
      maxLevel: z.maxLevel,
    });
    bumpBattleSession();
    setScreen('battle');
  };

  return (
    <div className="h-full w-full bg-slate-950 p-4 pb-24 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 pt-2">
        <Map className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Mappa Nexus</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {zones.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => z.unlocked && setDetail(z)}
            className={cn(
              'relative rounded-2xl border overflow-hidden text-left min-h-[140px] transition-transform',
              z.unlocked ? 'border-white/15 active:scale-[0.98]' : 'border-white/5 opacity-70'
            )}
          >
            <div className={cn('absolute inset-0', z.backgroundClass || 'bg-gradient-to-b from-slate-800 to-black')} />
            <div className="relative z-10 p-3 flex flex-col h-full">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Lv {z.minLevel}-{z.maxLevel}</div>
              <h2 className="text-sm font-black uppercase text-white leading-tight mb-2">{z.name}</h2>
              <div className="flex flex-wrap gap-1 mt-auto">
                {(z.encounterTypes as string[]).slice(0, 3).map((t) => (
                  <span key={t} className="text-[7px] px-1.5 py-0.5 rounded bg-black/40 text-white/80 font-bold">
                    {t}
                  </span>
                ))}
              </div>
              {!z.unlocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                  <Lock className="w-6 h-6 text-amber-400 mb-1" />
                  <span className="text-[8px] font-black uppercase text-amber-200/90 text-center px-2">
                    {z.requiredBadge ? `Richiede ${z.requiredBadge}` : 'Bloccata'}
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setScreen('hub')}
        className="mt-6 w-full py-3 rounded-xl border border-white/10 text-white/60 text-xs font-black uppercase"
      >
        Torna all&apos;Hub
      </button>

      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-[400] bg-slate-950/98 border-t border-cyan-500/30 rounded-t-3xl p-5 max-h-[75vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase text-white mb-1">{detail.name}</h3>
            <p className="text-xs text-white/50 mb-4">{detail.description}</p>

            <div className="flex flex-col gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  startExplore(detail);
                  setDetail(null);
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-black font-black uppercase text-xs"
              >
                <Compass className="w-4 h-4" /> Esplora (incontro)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingTrainerZone(detail.id);
                  setDetail(null);
                  setScreen('trainer');
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-900/50 border border-purple-500/40 text-purple-200 font-black uppercase text-xs"
              >
                <Users className="w-4 h-4" /> Allenatori
              </button>
              <div className="rounded-xl border border-white/10 p-3 flex gap-2 items-start">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-[10px] text-white/60 leading-relaxed">
                  Tipi: {(detail.encounterTypes as string[]).join(', ')}. Tassi incontro:{' '}
                  {detail.encounterPool.map((id, i) => `${id} ${((detail.encounterRates[i] ?? 0) * 100).toFixed(0)}%`).join(' · ')}
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setDetail(null)} className="w-full py-2 text-white/40 text-xs font-bold uppercase">
              Chiudi
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorldMap;
