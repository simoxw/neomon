import React, { useMemo, useState } from 'react';
import { X, Zap, Activity, Shield, Brain } from 'lucide-react';
import { NeoMon, Move, Stats } from '../../types';
import { getCreatureSprite } from '../../utils/imageLoader';
import allMovesData from '../../data/moves.json';
import { useStore } from '../../context/useStore';
import { isPhysicalCategory, isSpecialCategory, isStatusCategory } from '../../logic/moveEffectHelpers';
import { motion, AnimatePresence } from 'framer-motion';

const allMoves = (allMovesData as unknown as any[]).flat() as Move[];

const TYPE_COLORS: Record<string, string> = {
  Bio: 'text-green-400 border-green-400/30 bg-green-400/10',
  Incandescente: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  Idrico: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  Fulgido: 'text-yellow-300 border-yellow-300/30 bg-yellow-300/10',
  Tetro: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  Meccanico: 'text-slate-400 border-slate-400/30 bg-slate-400/10',
  Etereo: 'text-pink-400 border-pink-400/30 bg-pink-400/10',
  Cinetico: 'text-red-400 border-red-400/30 bg-red-400/10',
  Geologico: 'text-amber-600 border-amber-600/30 bg-amber-600/10',
  Aereo: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
  Criogenico: 'text-cyan-300 border-cyan-300/30 bg-cyan-300/10',
  Prismatico: 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/10',
};

const STAT_CONFIG = [
  { key: 'hp', label: 'HP', color: 'from-emerald-600 to-emerald-400', max: 300 },
  { key: 'potenza', label: 'Potenza', color: 'from-orange-600 to-orange-400', max: 200 },
  { key: 'resistenza', label: 'Resistenza', color: 'from-blue-600 to-blue-400', max: 200 },
  { key: 'sintonia', label: 'Sintonia', color: 'from-emerald-600 to-emerald-400', max: 200 },
  { key: 'spirito', label: 'Spirito', color: 'from-purple-600 to-purple-400', max: 200 },
  { key: 'flusso', label: 'Flusso', color: 'from-yellow-600 to-yellow-400', max: 200 },
  { key: 'stamina', label: 'Stamina', color: 'from-yellow-600 to-yellow-400', max: 200 },
] as const;

type TabId = 'stats' | 'moves' | 'uplink';

interface Props {
  mon: NeoMon;
  onClose: () => void;
}

const catIcon = (m: Move) => {
  if (isStatusCategory(m.category) && (m.power ?? 0) === 0) return '🔮';
  if (isPhysicalCategory(m.category)) return '⚔️';
  if (isSpecialCategory(m.category)) return '✨';
  return '🔮';
};

const NeoMonDetailModal: React.FC<Props> = ({ mon: monProp, onClose }) => {
  const team = useStore((s) => s.team);
  const box = useStore((s) => s.box);
  const mon = useMemo(
    () => team.find((m) => m.id === monProp.id) ?? box.find((m) => m.id === monProp.id) ?? monProp,
    [team, box, monProp]
  );
  const { coins, installNeuralMove } = useStore();
  const [tab, setTab] = useState<TabId>('stats');
  const [toast, setToast] = useState<string | null>(null);
  const [pendingInstall, setPendingInstall] = useState<Move | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const stats = mon.currentStats || mon.baseStats;
  const expNeeded = Math.pow(mon.level, 3);
  const expPercent = Math.min(100, (mon.exp / expNeeded) * 100);
  const totalDev = Object.values(mon.development).reduce((a, b) => a + b, 0);

  const learnPool = mon.learnPool || [];
  const uplinkRows = useMemo(() => {
    const active = new Set(mon.moves || []);
    return learnPool
      .filter((id) => !active.has(id))
      .map((id) => allMoves.find((m) => m.id === id))
      .filter((m): m is Move => !!m);
  }, [learnPool, mon.moves]);

  const beginInstall = (m: Move) => {
    if (coins < 50) {
      setToast('Crediti insufficienti');
      setTimeout(() => setToast(null), 2500);
      return;
    }
    setPendingInstall(m);
    setOverlayOpen(true);
  };

  const confirmSlot = async (slot: number) => {
    if (!pendingInstall) return;
    const moveId = pendingInstall.id;
    const moveName = pendingInstall.name;
    const res = await installNeuralMove(mon.id, moveId, slot);
    setOverlayOpen(false);
    setPendingInstall(null);
    if (res.ok) {
      setToast(`⚡ ${moveName} installata!`);
    } else {
      setToast(res.message || 'Operazione fallita');
    }
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm flex flex-col h-[92vh]">
        <div className="flex items-center gap-4 mb-3 pb-3 border-b border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <img
              src={getCreatureSprite(mon.id)}
              alt={mon.name}
              className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">{mon.name}</h4>
            <div className="flex gap-1 mt-1 flex-wrap">
              {mon.types.map((t) => (
                <span
                  key={t}
                  className={`text-[8px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest ${
                    TYPE_COLORS[t] ?? 'text-white/40 border-white/10 bg-white/5'
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex gap-3 mt-1 text-[9px] font-mono text-white/40 uppercase">
              <span className="text-cyan-400 font-black">LV.{mon.level}</span>
              <span>IV {mon.potential}/31</span>
              <span>◈ {coins}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2.5 bg-white/5 rounded-full hover:bg-white/15 transition-colors shrink-0">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <div className="flex gap-1 mb-3 shrink-0">
          {(
            [
              ['stats', 'Stats', Activity],
              ['moves', 'Moveset', Zap],
              ['uplink', 'Neural Uplink', Brain],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${
                tab === id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-black/30 border-white/10 text-white/40'
              }`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-5 pr-1">
          {tab === 'stats' && (
            <>
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
                <div className="flex justify-between text-[9px] font-mono uppercase text-white/40 mb-2">
                  <span>Sync Progress</span>
                  <span className="text-cyan-400">
                    {mon.exp} / {expNeeded} XP
                  </span>
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000"
                    style={{ width: `${expPercent}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                <h5 className="text-[9px] uppercase font-black tracking-[0.4em] text-cyan-400 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Parametri Biometrici
                </h5>
                {STAT_CONFIG.map(({ key, label, color, max }) => {
                  const val = stats[key as keyof Stats] ?? 0;
                  const devVal =
                    key === 'stamina' ? 0 : mon.development[key as keyof NeoMon['development']] ?? 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-white/70 w-20">{label}</span>
                          <span className="text-[8px] font-mono text-cyan-400/60">IV {mon.potential}</span>
                          {devVal > 0 && (
                            <span className="text-[8px] font-mono text-purple-400/60">EV +{devVal}</span>
                          )}
                        </div>
                        <span className="text-xs font-black text-white font-orbitron tabular-nums">{val}</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000`}
                          style={{ width: `${Math.min(100, (val / max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalDev > 0 && (
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
                  <h5 className="text-[9px] uppercase font-black tracking-[0.4em] text-purple-400 flex items-center gap-2 mb-3">
                    <Shield className="w-3 h-3" /> Development (EV)
                  </h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {Object.entries(mon.development).map(
                      ([k, v]) =>
                        v > 0 && (
                          <div key={k} className="flex justify-between text-[8px] font-mono border-b border-white/5 pb-1">
                            <span className="text-white/40 uppercase">{k}</span>
                            <span className="text-purple-400">+{v}</span>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'moves' && (
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
              <h5 className="text-[9px] uppercase font-black tracking-[0.4em] text-cyan-400 flex items-center gap-2 mb-3">
                <Zap className="w-3 h-3 fill-cyan-400" /> Neural Moveset
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {mon.moves.map((mId) => {
                  const mData = allMoves.find((m) => m.id === mId);
                  const typeColor = mData ? (TYPE_COLORS[mData.type] ?? 'text-white/40 border-white/10 bg-white/5') : '';
                  return (
                    <div
                      key={mId}
                      className="flex justify-between items-center p-3 bg-black/30 border border-white/5 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black uppercase text-white tracking-tight leading-none mb-1">
                          {mData?.name ?? mId}
                        </div>
                        <div className="flex items-center gap-2">
                          {mData && (
                            <span className={`text-[7px] px-1.5 py-0.5 rounded border font-black uppercase ${typeColor}`}>
                              {mData.type}
                            </span>
                          )}
                          <span className="text-[7px] uppercase font-mono text-white/30">{mData?.category ?? '—'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="text-[10px] font-black text-white font-orbitron tabular-nums">
                          {mData?.power ? `PWR ${mData.power}` : '—'}
                        </div>
                        <div className="text-[8px] text-cyan-400 font-mono">{mData?.staminaCost ?? 0} SP</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'uplink' && (
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
              <h5 className="text-[10px] uppercase font-black tracking-tight text-cyan-400 mb-1 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Neural Uplink — Tecniche Disponibili
              </h5>
              <p className="text-[8px] text-white/30 mb-3 font-rajdhani">Installazione: 50 ◈ · sostituisce una delle 4 tecniche attive</p>
              <div className="space-y-2">
                {uplinkRows.length === 0 && (
                  <p className="text-[9px] text-white/30 text-center py-6">Nessuna tecnica aggiuntiva nel pool.</p>
                )}
                {uplinkRows.map((mv) => {
                  const ll = mv.learnLevel ?? 1;
                  const ok = mon.level >= ll;
                  return (
                    <div
                      key={mv.id}
                      className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border text-[10px] ${
                        ok ? 'border-cyan-500/30 bg-cyan-950/20' : 'border-white/5 bg-black/20 opacity-60'
                      }`}
                    >
                      <span className={`px-1.5 py-0.5 rounded border font-black uppercase text-[7px] ${TYPE_COLORS[mv.type]}`}>
                        {mv.type}
                      </span>
                      <span className="font-black text-white flex-1 min-w-[40%]">{mv.name}</span>
                      <span className="text-white/40">
                        {catIcon(mv)} PWR {(mv.power ?? 0) === 0 ? '—' : mv.power} · SP {mv.staminaCost}
                      </span>
                      <span className="text-[8px] font-mono text-white/40">Lv.{ll}</span>
                      {ok ? (
                        <button
                          type="button"
                          onClick={() => beginInstall(mv)}
                          className="ml-auto px-2 py-1 rounded-lg bg-cyan-500 text-black font-black text-[8px] uppercase"
                        >
                          Installa [50 ◈]
                        </button>
                      ) : (
                        <span className="ml-auto text-[8px] text-white/30">Lv.{ll} richiesto</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 active:scale-95 transition-all"
        >
          Chiudi
        </button>
      </div>

      <AnimatePresence>
        {overlayOpen && pendingInstall && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-[1300] bg-black/95 border-t border-cyan-500/30 p-6 pb-10 rounded-t-3xl"
          >
            <p className="text-sm font-black text-white mb-2">Sostituisci quale tecnica?</p>
            <p className="text-[10px] text-white/40 mb-4">{pendingInstall.name}</p>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((slot) => {
                const mid = mon.moves[slot];
                const md = allMoves.find((m) => m.id === mid);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => confirmSlot(slot)}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 text-left hover:border-cyan-400"
                  >
                    <div className="text-[8px] text-white/30 uppercase">Slot {slot + 1}</div>
                    <div className="text-[11px] font-black text-white truncate">{md?.name || mid}</div>
                  </button>
                );
              })}
            </div>
            <button type="button" className="mt-4 w-full py-2 text-[10px] text-white/40 uppercase" onClick={() => setOverlayOpen(false)}>
              Annulla
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1400] px-4 py-2 rounded-xl bg-cyan-600 text-black text-xs font-black shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default NeoMonDetailModal;
