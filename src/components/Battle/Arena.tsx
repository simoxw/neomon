import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useBattle, type DamageFloat } from '../../hooks/useBattle';
import { Zap, RefreshCw, Package, Users, LogOut } from 'lucide-react';
import { useStore } from '../../context/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

import { getCreatureSprite } from '../../utils/imageLoader';
import CatchAnimation from './CatchAnimation';
import BattleLog from './BattleLog';
import DamageNumber from './DamageNumber';
import { performCatchAttempt } from '../../logic/CatchSystem';
import { getMaxHp, getMaxStamina } from '../../logic/battleParty';
import itemsData from '../../data/items.json';
import creaturesData from '../../data/creatures.json';
import { db } from '../../db';
import { ElementType, StatusCondition, StatStages } from '../../types';
import type { CreatureSpecies } from '../../types';
import MoveSelector from './MoveSelector';
import BattleSummary from './BattleSummary';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TYPE_COLORS: Record<string, string> = {
  [ElementType.Bio]: 'rgba(34, 197, 94, 0.4)',
  [ElementType.Incandescente]: 'rgba(239, 68, 68, 0.4)',
  [ElementType.Idrico]: 'rgba(6, 182, 212, 0.4)',
  [ElementType.Fulgido]: 'rgba(234, 179, 8, 0.4)',
  [ElementType.Tetro]: 'rgba(129, 140, 248, 0.4)',
  [ElementType.Meccanico]: 'rgba(148, 163, 184, 0.4)',
  [ElementType.Etereo]: 'rgba(232, 121, 249, 0.4)',
  [ElementType.Cinetico]: 'rgba(244, 63, 94, 0.4)',
  [ElementType.Geologico]: 'rgba(120, 113, 108, 0.4)',
  [ElementType.Aereo]: 'rgba(186, 230, 253, 0.4)',
  [ElementType.Criogenico]: 'rgba(165, 243, 252, 0.4)',
  [ElementType.Prismatico]: 'rgba(255, 255, 255, 0.4)',
};

const TYPE_GLOW: Record<string, string> = {
  [ElementType.Bio]: 'rgba(34, 197, 94, 0.85)',
  [ElementType.Incandescente]: 'rgba(239, 68, 68, 0.85)',
  [ElementType.Idrico]: 'rgba(6, 182, 212, 0.85)',
  [ElementType.Fulgido]: 'rgba(234, 179, 8, 0.85)',
  [ElementType.Tetro]: 'rgba(129, 140, 248, 0.85)',
  [ElementType.Meccanico]: 'rgba(148, 163, 184, 0.85)',
  [ElementType.Etereo]: 'rgba(232, 121, 249, 0.85)',
  [ElementType.Cinetico]: 'rgba(244, 63, 94, 0.85)',
  [ElementType.Geologico]: 'rgba(180, 160, 140, 0.85)',
  [ElementType.Aereo]: 'rgba(186, 230, 253, 0.85)',
  [ElementType.Criogenico]: 'rgba(165, 243, 252, 0.85)',
  [ElementType.Prismatico]: 'rgba(255, 255, 255, 0.75)',
};

const STATUS_COLORS: Record<Exclude<StatusCondition, null>, string> = {
  burn: 'bg-orange-500',
  freeze: 'bg-cyan-300',
  paralysis: 'bg-yellow-400',
  poison: 'bg-purple-500',
  sleep: 'bg-indigo-400',
  confuse: 'bg-pink-400',
};

const STATUS_LABELS: Record<Exclude<StatusCondition, null>, string> = {
  burn: '🔥 BRN',
  freeze: '❄️ FRZ',
  paralysis: '⚡ PAR',
  poison: '☠️ PSN',
  sleep: '💤 SLP',
  confuse: '🌀 CNF',
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  [ElementType.Bio]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  [ElementType.Incandescente]: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  [ElementType.Idrico]: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  [ElementType.Fulgido]: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40',
  [ElementType.Tetro]: 'bg-violet-500/20 text-violet-200 border-violet-500/40',
  [ElementType.Meccanico]: 'bg-slate-500/20 text-slate-200 border-slate-500/40',
  [ElementType.Etereo]: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/40',
  [ElementType.Cinetico]: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
  [ElementType.Geologico]: 'bg-amber-800/30 text-amber-200 border-amber-600/40',
  [ElementType.Aereo]: 'bg-sky-400/20 text-sky-100 border-sky-300/40',
  [ElementType.Criogenico]: 'bg-cyan-400/20 text-cyan-100 border-cyan-300/40',
  [ElementType.Prismatico]: 'bg-white/10 text-white border-white/30',
};

function TypeBadge({ type }: { type: ElementType | string }) {
  const colorClass = TYPE_BADGE_COLORS[type] || 'bg-white/10 text-white border-white/30';
  return (
    <span className={cn('text-[7px] px-1.5 py-0.5 rounded border font-black uppercase tracking-tighter', colorClass)}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status?: StatusCondition | null }) {
  if (!status) return null;
  return (
    <span className={cn('text-[9px] px-1.5 py-0.5 rounded text-black font-black', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function StageStrip({ stages }: { stages?: StatStages }) {
  if (!stages) return null;
  const pairs: [keyof StatStages, string][] = [
    ['attack', 'ATK'],
    ['defense', 'DEF'],
    ['specialAtk', 'SATK'],
    ['specialDef', 'SDEF'],
    ['speed', 'SPD'],
  ];
  const active = pairs
    .filter(([k]) => (stages[k] ?? 0) !== 0)
    .slice(0, 3)
    .map(([k, lab]) => {
      const v = stages[k] ?? 0;
      const up = v > 0;
      return (
        <span key={lab} className={cn('text-[8px] font-orbitron font-bold', up ? 'text-emerald-400' : 'text-rose-400')}>
          {up ? '⬆' : '⬇'}
          {lab}
          {Math.abs(v)}
        </span>
      );
    });
  if (!active.length) return null;
  return <div className="flex flex-wrap gap-1 mt-0.5">{active}</div>;
}

const StatBar = ({
  value,
  max,
  label,
  variant,
}: {
  value: number;
  max: number;
  label: string;
  variant: 'hp' | 'sp';
}) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  let barClass = variant === 'sp' ? 'bg-yellow-400' : 'bg-emerald-500';
  if (variant === 'hp') {
    if (percentage < 25) barClass = 'bg-rose-500 animate-hp-pulse';
    else if (percentage < 50) barClass = 'bg-yellow-400';
    else barClass = 'bg-emerald-500';
  }

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-[8px] uppercase font-black tracking-[0.2em] text-white/40 font-rajdhani">
        <span>{label}</span>
        <span className="font-orbitron tabular-nums">
          {Math.ceil(value)} / {max}
        </span>
      </div>
      <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1px] relative">
        <motion.div
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn('h-full rounded-full relative z-10', barClass)}
        />
      </div>
    </div>
  );
};

const Arena: React.FC = () => {
  const {
    setScreen,
    captureNeoMon,
    enterInventory,
    battleContext,
    lastBattleSummary,
    setLastBattleSummary,
    setBattleContext,
  } = useStore();
  const isTrainerBattle = battleContext?.kind === 'trainer';
  const isCombatMode = battleContext?.mode === 'combat';
  const canCatch = !isTrainerBattle && !isCombatMode;
  const {
    playerMon,
    opponentMon,
    battleLog,
    isTurnInProgress,
    status,
    allMoves,
    handleAction,
    handleSelectMove,
    handleFlee,
    afterCatchFailure,
    damageFloats,
    activeMoves,
    partySlots,
    activeSlotIndex,
  } = useBattle('p-01', 'o-01');
  const [showPrisms, setShowPrisms] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [inventoryPrisms, setInventoryPrisms] = useState<any[]>([]);
  const [catchAttempt, setCatchAttempt] = useState<{ success: boolean; shakes: number } | null>(null);
  const [floatingDamage, setFloatingDamage] = useState<Array<{ id: string; value: number; type: 'damage' | 'heal' | 'status'; position: { x: number; y: number } }>>([]);
  const { team } = useStore();
  const catchMetaRef = useRef<{ result: { success: boolean; shakes: number }; prismId: string } | null>(null);
  const wildMonRef = useRef(opponentMon);
  const playerSpriteRef = useRef<HTMLDivElement | null>(null);
  const enemySpriteRef = useRef<HTMLDivElement | null>(null);
  wildMonRef.current = opponentMon;

  const speciesCatchRate = useMemo(() => {
    if (!opponentMon) return 120;
    const row = (creaturesData as CreatureSpecies[]).find((c) => c.id === opponentMon.id);
    return typeof row?.catchRate === 'number' ? row.catchRate : 120;
  }, [opponentMon]);

  const enemyGlow = opponentMon?.types?.[0] ? TYPE_GLOW[opponentMon.types[0]] || 'rgba(34,211,238,0.7)' : 'rgba(34,211,238,0.7)';

  const getHPColor = (current: number, max: number): string => {
    const pct = current / max;
    if (pct > 0.5) return '#22d3ee';   // cyan-400
    if (pct > 0.25) return '#facc15';  // yellow-400
    return '#f43f5e';                  // rose-500
  };

  const addFloatingDamage = (value: number, type: 'damage' | 'heal' | 'status', side: 'player' | 'enemy') => {
    const sprite = side === 'player' ? playerSpriteRef.current : enemySpriteRef.current;
    if (!sprite) return;
    const rect = sprite.getBoundingClientRect();
    const id = `${Date.now()}_${Math.random()}`;
    const newDamage = {
      id,
      value,
      type,
      position: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    };
    setFloatingDamage(prev => [...prev, newDamage]);
    setTimeout(() => {
      setFloatingDamage(prev => prev.filter(d => d.id !== id));
    }, 900);
  };

  const triggerSpriteHit = (side: 'player' | 'enemy') => {
    const sprite = side === 'player' ? playerSpriteRef.current : enemySpriteRef.current;
    if (!sprite) return;
    sprite.style.animation = 'sprite-hit 0.2s ease-in-out';
    setTimeout(() => {
      sprite.style.animation = '';
    }, 200);
  };


  useEffect(() => {
    // Trigger sprite hit when damage is taken
    if (damageFloats.length > 0) {
      damageFloats.forEach((f: DamageFloat) => {
        if (f.side === 'enemy') {
          triggerSpriteHit('enemy');
        } else if (f.side === 'player') {
          triggerSpriteHit('player');
        }
      });
    }
  }, [damageFloats, opponentMon, playerMon]);

  useEffect(() => {
    const loadInventory = async () => {
      const inv = await db.inventory.toArray();
      const prisms = inv.map(i => {
        const data = itemsData.find(item => item.id === i.itemId);
        return data ? { ...data, quantity: i.quantity } : null;
      }).filter(i => i && i.type === 'Catch' && i.quantity > 0);
      setInventoryPrisms(prisms);
    };
    loadInventory();
  }, [showPrisms]);

  const handleCatch = (prism: any) => {
    setShowPrisms(false);
    const maxHp = opponentMon?.currentStats?.hp || opponentMon?.baseStats.hp || 100;
    const curHp = opponentMon?.currentHp ?? maxHp;
    const prismType = prism.id === 'i-prism-03' ? 'master' : prism.id === 'i-prism-02' ? 'neon' : 'base';
    const result = performCatchAttempt(maxHp, curHp, speciesCatchRate, prismType);
    catchMetaRef.current = { result, prismId: prism.id || 'i-prism-01' };
    setCatchAttempt(result);
  };

  const onCatchAnimationComplete = async () => {
    const meta = catchMetaRef.current;
    const attempt = meta?.result;
    const wild = wildMonRef.current;
    if (attempt?.success && wild) {
      await captureNeoMon(wild, meta!.prismId);
      setScreen('hub');
    } else if (attempt && !attempt.success) {
      await afterCatchFailure();
    }
    catchMetaRef.current = null;
    setCatchAttempt(null);
  };

  if (!playerMon || !opponentMon) {
    return <div className="h-full w-full flex items-center justify-center bg-slate-950"><RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" /></div>;
  }

  return (
    <motion.div 
      className="relative h-full w-full bg-gradient-to-b from-emerald-800 via-emerald-950 to-slate-950 flex flex-col overflow-hidden select-none animate-in fade-in duration-700"
    >

      {/* Background Accent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none">
        <Zap className="w-96 h-96 text-emerald-400" />
      </div>

      {/* HEADER AREA: Symmetrically mirrored (Opponent Stats on Left, Sprite on Right) */}
      <div className="pt-6 px-6 flex justify-between items-start relative z-20 h-40">

        {/* LEFT TOP: Flee + Backpack + Opponent Stats */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {canCatch && (
              <button
                type="button"
                onClick={() => handleFlee()}
                disabled={isTurnInProgress || status !== 'fighting'}
                className="px-4 py-2 bg-rose-950/60 border border-rose-500/40 rounded-full text-rose-200 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white flex items-center gap-1 disabled:opacity-40"
              >
                <LogOut className="w-3 h-3" /> Fuga
              </button>
            )}
            <button
              type="button"
              onClick={() => enterInventory({ fromBattle: true })}
              className="px-5 py-2 bg-blue-900/40 border border-blue-500/40 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95"
            >
              Zaino
            </button>
          </div>
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-40 p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="flex justify-between items-baseline mb-1 gap-1">
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="text-[9px] font-black text-white uppercase italic tracking-tighter truncate">{opponentMon.name}</h2>
                <div className="flex gap-1">
                  {opponentMon.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>
              </div>
              <span className="text-[7px] font-mono text-cyan-400 italic shrink-0">L.{opponentMon.level}</span>
            </div>
            <StatusBadge status={opponentMon.status ?? null} />
            <StageStrip stages={opponentMon.statStages} />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[6px] font-black text-emerald-400 w-4">HP</span>
                <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/5">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(opponentMon.currentHp / Math.max(1, getMaxHp(opponentMon))) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              {/* SP BAR */}
              <div className="flex items-center gap-2">
                <span className="text-[6px] font-black text-yellow-400 w-4">SP</span>
                <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-400"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(opponentMon.currentStamina / Math.max(1, getMaxStamina(opponentMon))) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT TOP: Opponent Sprite (Grande come il Player) */}
        <div className="relative w-[45%] aspect-square">
          <AnimatePresence>
            {damageFloats
              .filter((f: DamageFloat) => f.side === 'enemy' && f.amount > 0)
              .map((f: DamageFloat) => (
                <motion.span
                  key={f.id}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -40 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 top-1/4 z-30 font-orbitron font-black text-lg pointer-events-none',
                    f.variant === 'heal' ? 'text-emerald-300' : f.variant === 'status' ? 'text-yellow-300' : 'text-rose-400'
                  )}
                >
                  {f.variant === 'damage' ? `-${f.amount}` : f.variant === 'heal' ? `+${f.amount}` : '!'}
                </motion.span>
              ))}
          </AnimatePresence>
          <motion.div className="absolute inset-0 rounded-full blur-3xl opacity-20 bg-emerald-400" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }} />
          <div ref={enemySpriteRef} className="w-full h-full">
            <motion.img
              src={getCreatureSprite(opponentMon.id)}
              alt=""
              className="w-full h-full object-contain relative z-10"
              style={{ filter: `drop-shadow(0 0 20px ${enemyGlow})` }}
              animate={{ scale: [1, 1.02, 1], y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
        </div>
      </div>

      {/* Battlefield Main View: Only Log here now */}
      <div className="flex-1 relative flex flex-col items-center justify-center">
        {/* Battle Log: Central Horizontal - Auto-scroll gestito internamente */}
        <div className="w-full px-6 h-28 relative z-[100] transform -translate-y-8 flex items-center justify-center">
          <div className="w-full max-w-[300px] h-full bg-black/85 backdrop-blur-3xl border border-white/10 flex flex-col overflow-hidden rounded-2xl shadow-2xl">
            <BattleLog messages={battleLog} />
          </div>
        </div>
      </div>

      {/* Control Panel Footer */}
      <div className="bg-slate-950/98 border-t border-white/10 flex flex-col backdrop-blur-3xl pb-10">

        {/* Footer Header: Sprite a Sinistra, Biometria a Destra - Alzato di 20px */}
        <div className="px-6 py-2 flex items-end justify-between bg-emerald-950/10 h-36 relative overflow-visible border-b border-white/5 transform translate-y-[-25px]">
          {/* Sprite Player (In basso a sinistra) */}
          <div className="w-[45%] aspect-square relative -mb-10 z-40 transform translate-y-[-15px] -ml-6">
            <AnimatePresence>
              {damageFloats
                .filter((f: DamageFloat) => f.side === 'player' && (f.amount > 0 || f.variant === 'status'))
                .map((f: DamageFloat) => (
                  <motion.span
                    key={f.id}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -40 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn(
                      'absolute left-1/2 -translate-x-1/2 top-1/4 z-30 font-orbitron font-black text-lg pointer-events-none',
                      f.variant === 'heal' ? 'text-emerald-300' : f.variant === 'status' ? 'text-yellow-300' : 'text-rose-400'
                    )}
                  >
                    {f.variant === 'damage' ? `-${f.amount}` : f.variant === 'heal' ? `+${f.amount}` : '!'}
                  </motion.span>
                ))}
            </AnimatePresence>
            <div ref={playerSpriteRef} className="w-full h-full">
              <motion.img
                src={getCreatureSprite(playerMon.id)}
                alt=""
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] buddy-bounce"
              />
            </div>
          </div>

          {/* Biometry Player (In basso a destra) */}
          <div className="flex-1 flex flex-col gap-2 pl-4 pb-4 animate-in slide-in-from-right-6 transition-all duration-700 max-w-[50%]">
            <div className="flex justify-between items-baseline mb-1 gap-1">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[13px] font-black uppercase text-white tracking-widest italic text-glow-white underline decoration-emerald-500/50 truncate">
                  {playerMon.name}
                </span>
                <div className="flex gap-1">
                  {playerMon.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>
              </div>
              <span className="text-[8px] text-emerald-400 font-mono italic shrink-0">LV.{playerMon.level}</span>
            </div>
            <StatusBadge status={playerMon.status ?? null} />
            <StageStrip stages={playerMon.statStages} />
            {/* HP BAR PLAYER */}
            <div className="flex flex-col gap-1 w-full max-w-[140px]">
              <div className="flex items-center gap-2">
                <span className="text-[6px] font-black text-emerald-400 w-4 italic">HP</span>
                <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/5">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(playerMon.currentHp / (playerMon.currentStats?.hp ?? playerMon.baseStats.hp)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              {/* SP BAR PLAYER */}
              <div className="flex items-center gap-2">
                <span className="text-[6px] font-black text-yellow-400 w-4 italic">SP</span>
                <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(playerMon.currentStamina / (playerMon.currentStats?.stamina ?? playerMon.baseStats.stamina)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3 bg-black/40">
          <MoveSelector
            moves={activeMoves}
            currentSP={playerMon.currentStamina}
            maxSP={getMaxStamina(playerMon)}
            onSelectMove={handleSelectMove}
            disabled={isTurnInProgress || status !== 'fighting'}
          />
          <div className="flex gap-2 h-11">
            <button
              type="button"
              onClick={() => handleAction('rest')}
              disabled={isTurnInProgress || status !== 'fighting'}
              className="flex-1 bg-amber-900/30 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase rounded-xl hover:bg-amber-500 hover:text-black transition-all active:scale-95 shadow-md disabled:opacity-40"
            >
              Riposo
            </button>
            <button
              type="button"
              onClick={() => setShowSwitch(true)}
              disabled={
                isTurnInProgress ||
                status !== 'fighting' ||
                !team.some((_, i) => i !== activeSlotIndex && (partySlots[i]?.currentHp ?? 0) > 0)
              }
              className="flex-1 bg-purple-900/40 border border-purple-500/30 text-purple-400 text-[11px] font-black uppercase rounded-xl hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md disabled:opacity-30"
            >
              <Users className="w-3.5 h-3.5" /> Switch
            </button>
            {canCatch && (
              <button
                type="button"
                onClick={() => setShowPrisms(true)}
                disabled={isTurnInProgress || status !== 'fighting'}
                className="flex-1 bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase rounded-xl hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center text-center active:scale-95 px-2 shadow-md"
              >
                Prisma
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Layers */}
      <AnimatePresence>
        {showPrisms && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[400] bg-black/95 backdrop-blur-xl flex flex-col justify-end">
            <div className="p-8 pb-32">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black italic uppercase text-white">Prisma</h3>
                <button type="button" onClick={() => setShowPrisms(false)} className="text-xs font-black text-white/40 uppercase">
                  Back
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {inventoryPrisms.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleCatch(p)}
                    className="flex-shrink-0 w-40 aspect-square bg-black/60 backdrop-blur-md border border-cyan-500/20 rounded-3xl p-6 flex flex-col items-center justify-center group hover:border-cyan-400 snap-center transition-all"
                  >
                    <Package className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110" />
                    <div className="text-[11px] font-black uppercase text-white mb-1 text-center">{p.name}</div>
                    <div className="text-[9px] font-orbitron text-cyan-400/80 uppercase">×{p.quantity}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Switch Overlay */}
      <AnimatePresence>
        {showSwitch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[400] bg-black/95 backdrop-blur-xl flex flex-col justify-end">
            <div className="p-8 pb-32">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-3xl font-black italic uppercase text-white">Cambio</h3>
                  <p className="text-[9px] text-white/30 uppercase font-mono tracking-widest mt-0.5">Seleziona il sostituto — costerà il turno</p>
                  {import.meta.env.DEV && (
                    <p className="text-[7px] text-cyan-400 mt-2">
                      Team order: {team.map((m, i) => `${i}:${m.name}`).join(' | ')} | Current: {activeSlotIndex}
                    </p>
                  )}
                </div>
                <button onClick={() => setShowSwitch(false)} className="text-xs font-black text-white/40 uppercase hover:text-white transition-colors">Annulla</button>
              </div>
              <div className="flex flex-col gap-3">
                {team
                  .map((m, idx) => ({ m, idx }))
                  .filter(({ m, idx }) => m.id !== playerMon?.id && idx !== activeSlotIndex && (partySlots[idx]?.currentHp ?? 0) > 0)
                  .map(({ m, idx }) => {
                    const hpMax = m.currentStats?.hp || m.baseStats.hp;
                    const hpCur = partySlots[idx]?.currentHp ?? hpMax;
                    const hpPercent = Math.min(100, Math.max(0, (hpCur / Math.max(1, hpMax)) * 100));
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { handleAction('switch', m.id); setShowSwitch(false); }}
                        className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-400 hover:bg-purple-900/20 transition-all active:scale-95 group"
                      >
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                          <img src={getCreatureSprite(m.id)} alt="" className="w-10 h-10 object-contain" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-black uppercase text-white tracking-tight">{m.name}</div>
                          <div className="text-[8px] font-mono text-white/30 uppercase">LV.{m.level} • {m.types.join('/')}</div>
                          <div className="mt-1.5 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${hpPercent}%` }} />
                          </div>
                        </div>
                        <Users className="w-4 h-4 text-purple-400/40 group-hover:text-purple-400 transition-colors shrink-0" />
                      </button>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {catchAttempt && <CatchAnimation attemptResult={catchAttempt} neoMonName={opponentMon.name} onComplete={onCatchAnimationComplete} />}

      {status === 'escaped' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-[500] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center text-white"
        >
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-amber-300">Fuga riuscita</h1>
          <p className="text-white/50 text-sm mb-8 font-rajdhani">Sei tornato al sicuro.</p>
          <button
            type="button"
            onClick={() => {
              setBattleContext(null);
              setScreen(battleContext?.kind === 'zone' || battleContext?.kind === 'trainer' ? 'worldmap' : 'hub');
            }}
            className="px-12 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-2xl"
          >
            {battleContext?.kind === 'zone' || battleContext?.kind === 'trainer' ? 'Torna alla mappa' : "Torna all'Hub"}
          </button>
        </motion.div>
      )}

      {status === 'lost' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-[500] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center text-white"
        >
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2 text-rose-500">Squadra KO</h1>
          <p className="text-white/50 text-sm mb-8 font-rajdhani max-w-xs">Il tuo Neo-Mon non può più combattere.</p>
          <button
            type="button"
            onClick={() => {
              setBattleContext(null);
              setScreen(isTrainerBattle || battleContext?.kind === 'zone' ? 'worldmap' : 'hub');
            }}
            className="px-12 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-2xl"
          >
            {isTrainerBattle || battleContext?.kind === 'zone' ? 'Mappa' : "Torna all'Hub"}
          </button>
        </motion.div>
      )}

      {status === 'won' && lastBattleSummary && (
        <BattleSummary
          summary={lastBattleSummary}
          onContinue={() => {
            setLastBattleSummary(null);
            const dest = lastBattleSummary.returnScreen;
            setBattleContext(null);
            setScreen(dest);
          }}
          onExploreAgain={
            lastBattleSummary.showExploreAgain
              ? () => {
                  setLastBattleSummary(null);
                  setBattleContext(null);
                  setScreen('worldmap');
                }
              : undefined
          }
        />
      )}

      {/* Floating Damage Numbers */}
      <AnimatePresence>
        {floatingDamage.map(dmg => (
          <DamageNumber key={dmg.id} {...dmg} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default Arena;
