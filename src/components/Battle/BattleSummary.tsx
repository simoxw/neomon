import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { BattleSummaryPayload } from '../../types/battleSummary';

interface Props {
  summary: BattleSummaryPayload;
  onContinue: () => void;
  onExploreAgain?: () => void;
}

const BattleSummary: React.FC<Props> = ({ summary, onContinue, onExploreAgain }) => {
  const [xpShow, setXpShow] = useState(0);
  const [coinShow, setCoinShow] = useState(0);

  useEffect(() => {
    const t0 = requestAnimationFrame(() => {
      setXpShow(summary.xpGained);
      setCoinShow(summary.coinsGained);
    });
    return () => cancelAnimationFrame(t0);
  }, [summary.xpGained, summary.coinsGained]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 z-[520] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center text-white"
    >
      <h2 className="text-3xl font-black italic uppercase tracking-tighter text-emerald-400 mb-1">Vittoria</h2>
      <p className="text-white/50 text-xs font-mono uppercase tracking-widest mb-6">vs {summary.foeName}</p>

      <div className="w-full max-w-xs space-y-4 mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">EXP</div>
          <div className="text-3xl font-orbitron font-black text-white tabular-nums">+{xpShow}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Monete</div>
          <div className="text-3xl font-orbitron font-black text-amber-200 tabular-nums">+{coinShow}</div>
        </div>
        {summary.itemDrop && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-sm font-bold text-emerald-200">
            Drop: {summary.itemDrop.name}
          </div>
        )}
        {summary.levelUp && (
          <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-3 text-sm font-black text-cyan-200">
            {summary.levelUp.monName} — Lv.{summary.levelUp.fromLv} → Lv.{summary.levelUp.toLv}
          </div>
        )}
        {summary.trainerDialogueWin && (
          <p className="text-sm text-white/70 font-rajdhani italic leading-relaxed">&ldquo;{summary.trainerDialogueWin}&rdquo;</p>
        )}
        {summary.trainerBadge && (
          <div className="rounded-xl bg-fuchsia-600/20 border border-fuchsia-400/50 py-2 text-xs font-black uppercase text-fuchsia-200">
            Badge ottenuto: {summary.trainerBadge}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button
          type="button"
          onClick={() => onContinue()}
          className="w-full py-3 rounded-xl bg-white text-black font-black uppercase text-xs tracking-widest"
        >
          Continua
        </button>
        {summary.showExploreAgain && onExploreAgain && (
          <button
            type="button"
            onClick={() => onExploreAgain()}
            className="w-full py-3 rounded-xl border border-cyan-500/40 text-cyan-300 font-black uppercase text-xs"
          >
            Esplora ancora
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default BattleSummary;
