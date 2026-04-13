import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const LOADING_MESSAGES = [ 
  "Sincronizzazione neurale in corso...", 
  "Handshake con il Nexus Protocol v2.3...", 
  "Scansione interferenze digitali...", 
  "Calibrazione frequenze Bio-Link...", 
  "Decrittazione segnali entità...", 
  "Aggiornamento Neo-Dex locale...", 
  "Verifica integrità Link-Chain...", 
  "Inizializzazione motore di combattimento...", 
  "Download mappe cognitive Nexus...", 
  "Bypass firewall di sicurezza Distretto 7...", 
  "Rilevazione tracce energetiche anomale...", 
  "Protocollo Ghost attivato...", 
]; 

const LoadingScreen: React.FC = () => {
  const message = useMemo(() => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)], []);

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Light radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />
      
      <div className="relative flex flex-col items-center gap-12">
        {/* Neon Spinner */}
        <div className="relative w-24 h-24">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full border-2 border-white/5 border-t-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border border-white/5 border-b-purple-500 opacity-50"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col items-center gap-2">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 italic text-center max-w-[280px] leading-loose"
          >
            {message}
          </motion.p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div 
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1 h-1 bg-cyan-400 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-10 left-10 w-4 h-4 border-t-2 border-l-2 border-white/10" />
      <div className="absolute top-10 right-10 w-4 h-4 border-t-2 border-r-2 border-white/10" />
      <div className="absolute bottom-10 left-10 w-4 h-4 border-b-2 border-l-2 border-white/10" />
      <div className="absolute bottom-10 right-10 w-4 h-4 border-b-2 border-r-2 border-white/10" />
    </div>
  );
};

export default LoadingScreen;
