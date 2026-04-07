import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleLogProps {
  messages: string[];
}

const BattleLog: React.FC<BattleLogProps> = ({ messages }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentMessageIndex < messages.length) {
      typeMessage(messages[currentMessageIndex]);
    }
  }, [messages, currentMessageIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedText]);

  const typeMessage = async (text: string) => {
    setIsTyping(true);
    let current = "";
    for (let i = 0; i <= text.length; i++) {
      current = text.slice(0, i);
      setDisplayedText(current);
      await new Promise(r => setTimeout(r, 30)); // Velocità digitazione
    }
    setIsTyping(false);
    
    // Pausa prima del prossimo messaggio se ce ne sono altri
    if (currentMessageIndex < messages.length - 1) {
      await new Promise(r => setTimeout(r, 800));
      setCurrentMessageIndex(prev => prev + 1);
    }
  };

  const getMessageStyle = (text: string) => {
    if (text.includes("Efficace") || text.includes("Critico")) return "text-green-400 text-glow-green font-black";
    if (text.includes("Non molto efficace") || text.includes("Resistito")) return "text-red-800 font-bold";
    if (text.includes("KO") || text.includes("Sconfitto")) return "text-red-500 font-black italic underline";
    return "text-white/90";
  };

  return (
    <div className="flex-1 flex flex-col bg-black/40 border-l border-white/10 overflow-hidden">
      <div className="p-2 border-b border-white/5 bg-gray-800/40 text-[8px] font-black uppercase text-white/30 tracking-widest text-center">
        Neural Feed Active
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-3 scrollbar-hide"
      >
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-3 ${idx < currentMessageIndex ? 'opacity-40 grayscale-[0.5]' : ''}`}
            >
              <span className="text-cyan-400 shrink-0 mt-1">▶</span>
              <span className={getMessageStyle(msg)}>
                {idx === currentMessageIndex ? displayedText : msg}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isTyping && (
        <div className="px-4 py-1 text-[8px] text-cyan-400 font-black uppercase tracking-[0.3em] animate-pulse">
          Linker Processing...
        </div>
      )}
    </div>
  );
};

export default BattleLog;
