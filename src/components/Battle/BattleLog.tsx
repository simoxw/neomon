import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BattleLogEntry, BattleLogKind } from '../../types/battleLog';

export type { BattleLogEntry, BattleLogKind } from '../../types/battleLog';

interface BattleLogProps {
  messages: BattleLogEntry[];
}

const KIND_CLASS: Record<BattleLogKind, string> = {
  damageIn: 'text-rose-400 font-bold',
  damageOut: 'text-emerald-400 font-bold',
  status: 'text-cyan-300 font-semibold',
  system: 'text-amber-300 font-black',
  neutral: 'text-white/90',
};

const BattleLog: React.FC<BattleLogProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const visible = messages.slice(-5);

  return (
    <div className="flex-1 flex flex-col bg-black/40 border-l border-white/10 overflow-hidden min-h-0">
      <div className="p-2 border-b border-white/5 bg-gray-800/40 text-[8px] font-black uppercase text-white/30 tracking-widest text-center shrink-0">
        Neural Feed Active
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 font-rajdhani text-[11px] leading-snug space-y-1.5 scrollbar-hide min-h-0 max-h-[5.5rem]"
      >
        <AnimatePresence initial={false}>
          {visible.map((entry, idx) => (
            <motion.div
              key={`${messages.length}-${idx}`}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <span className="text-cyan-400/80 shrink-0">▶</span>
              <span className={KIND_CLASS[entry.kind]}>{entry.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BattleLog;
