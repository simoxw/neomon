import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Zap, X, Check } from 'lucide-react';

interface CatchAnimationProps {
  attemptResult: { success: boolean; shakes: number };
  onComplete: () => void;
  neoMonName: string;
}

const CatchAnimation: React.FC<CatchAnimationProps> = ({ attemptResult, onComplete, neoMonName }) => {
  const [phase, setPhase] = useState<'toss' | 'shakes' | 'result'>('toss');
  const [shakeIndex, setShakeIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setPhase('toss');
    setShakeIndex(0);
    let cancelled = false;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      await sleep(1000);
      if (cancelled) return;
      setPhase('shakes');
      for (let i = 0; i < attemptResult.shakes; i++) {
        setShakeIndex(i + 1);
        await sleep(600);
        if (cancelled) return;
      }
      await sleep(200);
      if (cancelled) return;
      setPhase('result');
      await sleep(attemptResult.success ? 1800 : 1200);
      if (cancelled) return;
      onCompleteRef.current();
    })();

    return () => {
      cancelled = true;
    };
  }, [attemptResult.shakes, attemptResult.success]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {(phase === 'toss' || phase === 'shakes') && (
          <motion.div
            key="ball"
            initial={{ y: 500, scale: 0.5, opacity: 0 }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
              x: phase === 'shakes' && shakeIndex > 0 ? [0, -10, 10, -10, 10, 0] : 0,
            }}
            transition={{
              y: { duration: 0.8, ease: 'easeOut' },
              x: { repeat: shakeIndex > 0 ? 1 : 0, duration: 0.35 },
            }}
            className="relative"
          >
            <div className="relative">
              <Hexagon className="w-24 h-24 text-cyan-400 fill-cyan-400/20 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Zap className="w-8 h-8 text-cyan-100 opacity-50" />
              </motion.div>
            </div>

            {phase === 'toss' && (
              <motion.div
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 0, opacity: 1 }}
                className="absolute inset-x-0 -top-20 flex justify-center"
              >
                <div className="w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'result' && attemptResult.success && (
          <motion.div
            key="ok"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-green-500 rounded-full blur-3xl"
              />
              <div className="bg-green-500 p-8 rounded-full shadow-[0_0_50px_rgba(34,197,94,0.6)] border-4 border-white/20">
                <Check className="w-16 h-16 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">Sincronia Completa!</h2>
              <p className="text-green-400 font-mono text-sm tracking-widest mt-2">{neoMonName.toUpperCase()} AGGIUNTO AL BOX</p>
            </div>
          </motion.div>
        )}

        {phase === 'result' && !attemptResult.success && (
          <motion.div
            key="fail"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ x: [-5, 5, -5, 5, 0], scale: [1, 1.1, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-red-500 p-8 rounded-full shadow-[0_0_50px_rgba(239,68,68,0.6)] border-4 border-white/20"
            >
              <X className="w-16 h-16 text-white" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">Sincronia Fallita</h2>
              <p className="text-red-400 font-mono text-sm tracking-widest mt-2">LINK INTERROTTO</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CatchAnimation;
