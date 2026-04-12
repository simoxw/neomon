import React, { useState, useRef, useCallback } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Move } from '../../types';
import { isPhysicalCategory, isSpecialCategory, isStatusCategory } from '../../logic/moveEffectHelpers';
import MoveTooltip from './MoveTooltip';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TYPE_BORDER: Record<string, string> = {
  Bio: 'border-emerald-500',
  Incandescente: 'border-orange-500',
  Idrico: 'border-sky-500',
  Fulgido: 'border-yellow-400',
  Tetro: 'border-violet-500',
  Meccanico: 'border-slate-400',
  Etereo: 'border-fuchsia-500',
  Cinetico: 'border-rose-500',
  Geologico: 'border-amber-700',
  Aereo: 'border-sky-300',
  Criogenico: 'border-cyan-300',
  Prismatico: 'border-white',
};

const TYPE_BADGE: Record<string, string> = {
  Bio: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Incandescente: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  Idrico: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  Fulgido: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40',
  Tetro: 'bg-violet-500/20 text-violet-200 border-violet-500/40',
  Meccanico: 'bg-slate-500/20 text-slate-200 border-slate-500/40',
  Etereo: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/40',
  Cinetico: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
  Geologico: 'bg-amber-800/30 text-amber-200 border-amber-600/40',
  Aereo: 'bg-sky-400/20 text-sky-100 border-sky-300/40',
  Criogenico: 'bg-cyan-400/20 text-cyan-100 border-cyan-300/40',
  Prismatico: 'bg-white/10 text-white border-white/30',
};

export interface MoveSelectorProps {
  moves: Move[];
  currentSP: number;
  maxSP: number;
  onSelectMove: (move: Move) => void;
  disabled: boolean;
}

const MoveSelector: React.FC<MoveSelectorProps> = ({
  moves,
  currentSP,
  maxSP,
  onSelectMove,
  disabled,
}) => {
  const [tooltipMove, setTooltipMove] = useState<Move | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const catIcon = (m: Move) => {
    if (isStatusCategory(m.category) && (m.power ?? 0) === 0) return '🔮';
    if (isPhysicalCategory(m.category)) return '⚔️';
    if (isSpecialCategory(m.category)) return '✨';
    return '🔮';
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 min-h-[8.5rem]">
        {moves.slice(0, 4).map((move) => {
          const cant = currentSP < (move.staminaCost ?? 0);
          const border = TYPE_BORDER[move.type] || 'border-white/20';
          const badge = TYPE_BADGE[move.type] || 'bg-white/10 text-white border-white/20';
          return (
            <div key={move.id} className="relative">
              <button
                type="button"
                disabled={disabled || cant}
                onClick={() => !cant && onSelectMove(move)}
                onMouseEnter={() => setTooltipMove(move)}
                onMouseLeave={() => setTooltipMove(null)}
                onPointerDown={() => {
                  clearPress();
                  pressTimer.current = setTimeout(() => setTooltipMove(move), 500);
                }}
                onPointerUp={() => clearPress()}
                onPointerLeave={() => clearPress()}
                className={cn(
                  'relative w-full h-full min-h-[4rem] rounded-xl border-l-[3px] bg-black/50 backdrop-blur-sm pl-2 pr-2 py-2 text-left transition-all',
                  border,
                  cant ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:bg-white/10 active:scale-[0.98]'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 right-1 text-[6px] font-black uppercase px-1 py-0.5 rounded border',
                    badge
                  )}
                >
                  {move.type}
                </span>
                <div className="font-rajdhani text-sm font-semibold text-white leading-tight pr-10">{move.name}</div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/70 font-rajdhani">
                  <span>{catIcon(move)}</span>
                  <span className="font-orbitron tabular-nums">
                    {(move.power ?? 0) === 0 ? 'STATUS' : `PWR ${move.power}`}
                  </span>
                  <span className="text-emerald-300/90 font-orbitron tabular-nums">SP {move.staminaCost}</span>
                </div>
              </button>
              <MoveTooltip move={move} visible={tooltipMove?.id === move.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoveSelector;
