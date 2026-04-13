import React from 'react';
import { motion } from 'framer-motion';

interface DamageNumberProps {
  value: number;
  type: 'damage' | 'heal' | 'status';
  position: { x: number; y: number };
  id: string;
  isCrit?: boolean;
  isStab?: boolean;
  effectiveness?: number;
}

const DamageNumber: React.FC<DamageNumberProps> = ({ value, type, position, id, isCrit, isStab, effectiveness }) => {
  const getSize = () => {
    if (isCrit) return 'text-4xl';
    if (value < 50) return 'text-sm';
    if (value < 100) return 'text-lg';
    if (value < 150) return 'text-2xl';
    return 'text-3xl';
  };

  const getDisplay = () => {
    if (type === 'heal') return `+${value}`;
    if (type === 'status') return '!';
    if (effectiveness === 0) return 'IMMUNE';
    return `-${value}`;
  };

  const getColor = () => {
    if (type === 'heal') return 'text-emerald-300';
    if (type === 'status') return 'text-yellow-300';
    
    if (effectiveness === 0) return 'text-gray-600';
    if (isCrit) return 'text-rose-300';
    if (isStab) return 'text-yellow-300';
    if (effectiveness && effectiveness > 1) return 'text-orange-400';
    if (effectiveness && effectiveness < 1) return 'text-gray-400';
    
    return 'text-rose-400';
  };

  const getGlow = () => {
    if (type === 'heal') return 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]';
    if (type === 'status') return 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
    if (isCrit) return 'drop-shadow-[0_0_12px_rgba(255,150,150,0.9)]';
    return 'drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]';
  };

  const getLabel = () => {
    if (type !== 'damage' || effectiveness === 0) return null;
    if (isCrit) return '💥 CRITICO!';
    if (isStab) return '[LINK BOOST]';
    if (effectiveness && effectiveness > 1) return 'EFFICACE!';
    if (effectiveness && effectiveness < 1) return 'Resistito...';
    return null;
  };

  return (
    <motion.div
      key={id}
      initial={{ y: 0, opacity: 1, scale: 0.8 }}
      animate={{ y: -60, opacity: 0, scale: 1.2 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="fixed pointer-events-none flex flex-col items-center"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {getLabel() && (
        <span className="text-[10px] font-black uppercase tracking-tighter text-white bg-black/40 px-1 rounded mb-1">
          {getLabel()}
        </span>
      )}
      <span className={`${getSize()} ${getColor()} ${getGlow()} font-orbitron font-black`}>
        {getDisplay()}
      </span>
    </motion.div>
  );
};

export default DamageNumber;
