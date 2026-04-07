import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../context/useStore';
import { getCreatureSprite } from '../../utils/imageLoader';
import { Sparkles, Zap } from 'lucide-react';

const EvolutionScene: React.FC = () => {
  const { evolvingMonId, team, box, setScreen, evolveNeoMon } = useStore();
  const [phase, setPhase] = useState<'start' | 'glow' | 'shatter' | 'reveal'>('start');
  
  const mon = [...team, ...box].find(m => m.id === evolvingMonId);
  
  useEffect(() => {
    if (!mon) {
      setScreen('hub');
      return;
    }

    // Sequenza temporale dell'evoluzione
    const timer1 = setTimeout(() => setPhase('glow'), 1000);
    const timer2 = setTimeout(() => setPhase('shatter'), 3000);
    const timer3 = setTimeout(() => {
      evolveNeoMon(mon.id);
      setPhase('reveal');
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [mon, evolveNeoMon, setScreen]);

  if (!mon) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              y: [null, -100],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{ 
              duration: 2 + Math.random() * 2, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase !== 'reveal' ? (
          <motion.div 
            key="pre-evolution"
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: phase === 'glow' ? [1, 1.1, 1] : 1,
              opacity: 1,
              filter: phase === 'glow' ? 'brightness(3)' : 'brightness(1)'
            }}
            exit={{ scale: 2, opacity: 0, filter: 'brightness(10)' }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src={getCreatureSprite(mon.id)} 
              alt={mon.name} 
              className="w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            />
            
            {phase === 'glow' && (
              <motion.div 
                className="absolute inset-0 bg-white rounded-full blur-3xl opacity-50"
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="post-evolution"
            className="flex flex-col items-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <div className="relative mb-8">
               <motion.div 
                 className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full"
                 animate={{ scale: [1, 1.5, 1] }}
                 transition={{ duration: 3, repeat: Infinity }}
               />
               <img 
                 src={getCreatureSprite(mon.id)} // Qui l'ID è già aggiornato da evolveNeoMon
                 alt="Evolved" 
                 className="w-72 h-72 object-contain relative z-10 drop-shadow-[0_0_50px_rgba(34,211,238,0.6)]"
               />
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
               <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                 Sincronizzazione Completa!
               </h2>
               <p className="text-cyan-400 font-mono text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                 <Sparkles className="w-4 h-4" /> Si è evoluto in {mon.name}! <Sparkles className="w-4 h-4" />
               </p>
               
               <button 
                 onClick={() => setScreen('hub')}
                 className="mt-12 px-10 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
               >
                 Ritorna all'Hub
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shatter Effect Particles */}
      {phase === 'shatter' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white"
              initial={{ x: 0, y: 0 }}
              animate={{ 
                x: (Math.random() - 0.5) * 800, 
                y: (Math.random() - 0.5) * 800,
                opacity: 0,
                rotate: Math.random() * 360
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          ))}
          <motion.div 
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}
    </div>
  );
};

export default EvolutionScene;
