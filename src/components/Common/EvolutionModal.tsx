import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../context/useStore';
import creaturesData from '../../data/creatures.json';
import type { CreatureSpecies } from '../../types';
import { getCreatureSprite } from '../../utils/imageLoader';

const EvolutionModal: React.FC = () => {
  const { evolutionQueue, evolveNeoMon, dequeueEvolution } = useStore();
  const head = evolutionQueue[0];
  const [phase, setPhase] = useState(0);

  const fromRow = head ? (creaturesData as CreatureSpecies[]).find((c) => c.id === head.monId) : undefined;
  const toRow = head ? (creaturesData as CreatureSpecies[]).find((c) => c.id === head.evolvesToId) : undefined;

  useEffect(() => {
    if (!head) return;
    setPhase(0);
    const a = setTimeout(() => setPhase(1), 1500);
    const b = setTimeout(() => setPhase(2), 3000);
    const c = setTimeout(() => setPhase(3), 4500);
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        const ctx = new Ctx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 440;
        g.gain.value = 0.05;
        o.start();
        setTimeout(() => o.stop(), 120);
      }
    } catch {
      /* ignore */
    }
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(c);
    };
  }, [head]);

  if (!head || !fromRow || !toRow) return null;

  const onContinue = async () => {
    await evolveNeoMon(head.monId);
    dequeueEvolution();
    setPhase(0);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black">
      <AnimatePresence mode="wait">
        {phase < 3 && (
          <motion.div
            key="burst"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0.4 }}
            className="absolute inset-0 bg-white"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center px-6">
        <motion.img
          key={phase < 2 ? 'from' : 'to'}
          src={getCreatureSprite(phase < 2 ? fromRow.id : toRow.id)}
          alt=""
          className="w-40 h-40 object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]"
          animate={{
            scale: phase === 0 ? [1, 1.25, 1.15] : 1,
            filter: phase >= 3 ? 'grayscale(0)' : phase >= 2 ? 'grayscale(1)' : 'brightness(1.4)',
          }}
          transition={{ duration: 1.2 }}
        />

        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center font-orbitron text-cyan-300 font-black text-lg text-glow-cyan"
          >
            {fromRow.name} si è evoluto in {toRow.name}!
          </motion.div>
        )}

        {phase >= 3 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            type="button"
            onClick={() => void onContinue()}
            className="mt-8 px-10 py-3 rounded-xl bg-white text-black font-black uppercase text-xs tracking-widest"
          >
            Continua
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default EvolutionModal;
