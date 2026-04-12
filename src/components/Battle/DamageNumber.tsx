import React from 'react';
import { motion } from 'framer-motion';

interface DamageNumberProps {
  value: number;
  type: 'damage' | 'heal' | 'status';
  position: { x: number; y: number };
  id: string;
}

const DamageNumber: React.FC<DamageNumberProps> = ({ value, type, position, id }) => {
  const getSize = () => {
    if (value < 50) return 'text-sm';
    if (value < 100) return 'text-lg';
    if (value < 150) return 'text-2xl';
    return 'text-3xl';
  };

  const getDisplay = () => {
    if (type === 'damage') return `-${value}`;
    if (type === 'heal') return `+${value}`;
    return '!';
  };

  const getGlow = () => {
    if (type === 'damage') return 'drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]';
    if (type === 'heal') return 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]';
    return 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
  };

  return (
    <motion.span
      key={id}
      initial={{ y: 0, opacity: 1, scale: 0.8 }}
      animate={{ y: -50, opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className={`damage-number type-${type} ${getSize()} ${getGlow()} fixed pointer-events-none font-orbitron font-bold`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {getDisplay()}
    </motion.span>
  );
};

export default DamageNumber;
