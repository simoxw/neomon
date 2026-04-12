import React from 'react';
import { Move } from '../../types';
import { Sword, Zap, Target, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getMoveAccuracy } from '../../logic/moveEffectHelpers';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MoveTooltipProps {
  move: Move;
  visible: boolean;
  isFixed?: boolean;
}

const MoveTooltip: React.FC<MoveTooltipProps> = ({ move, visible, isFixed }) => {
  if (!visible) return null;

  const isPhysical = move.category === 'Physical' || String(move.category).toLowerCase() === 'physical';
  const desc =
    move.description ||
    (typeof move.effect === 'string' && move.effect ? move.effect : null) ||
    (typeof move.effect === 'object' && move.effect && 'description' in move.effect
      ? String((move.effect as { description?: string }).description || '')
      : null);
  const acc = getMoveAccuracy(move);

  return (
    <div
      className={cn(
        'w-64 p-3 rounded-lg border-2 z-50',
        isFixed ? 'relative' : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-4',
        'bg-gray-900/90 backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95',
        isPhysical
          ? 'border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)] shadow-pink-500/20'
          : 'border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] shadow-cyan-400/20'
      )}
    >
      <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
        <h3 className={cn('font-bold text-lg', isPhysical ? 'text-pink-400' : 'text-cyan-400')}>{move.name}</h3>
        <span className="text-xs font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-white/70">{move.type}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Sword className="w-4 h-4 text-pink-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-white/40">Danno</span>
            <span className="text-sm font-bold">{(move.power ?? 0) === 0 ? '—' : move.power}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-white/40">Stamina</span>
            <span className="text-sm font-bold">{move.staminaCost}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-white/40">Prec.</span>
            <span className="text-sm font-bold">{acc}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-white/40">Tipo</span>
            <span className="text-sm font-bold">{move.category}</span>
          </div>
        </div>
      </div>

      {move.learnLevel != null && (
        <div className="text-[10px] font-mono text-cyan-400/80 mb-2">Livello apprendimento: {move.learnLevel}</div>
      )}

      {desc ? (
        <div className="text-xs text-white/70 italic bg-black/30 p-2 rounded border border-white/5">{desc}</div>
      ) : null}

      {!isFixed && (
        <div
          className={cn(
            'absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent',
            isPhysical ? 'border-t-pink-500/50' : 'border-t-cyan-400/50'
          )}
        />
      )}
    </div>
  );
};

export default MoveTooltip;
