import React from 'react';
import { useStore } from '../../context/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Dna, 
  ChevronRight, 
  Wallet, 
  Package, 
  Compass, 
  Zap, 
  ScrollText,
  Shield,
  Terminal,
  X,
  Map,
  Hammer,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import missionsData from '../../data/missions.json';
import { getCreatureSprite } from '../../utils/imageLoader';
import NeoMonDetailModal from '../Common/NeoMonDetailModal';
import type { NeoMon } from '../../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TerminalIcon = ({ icon: Icon, label, color, onClick, badge }: { icon: any, label: string, color: string, onClick?: () => void, badge?: number }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 group p-4 transition-all hover:scale-105 active:scale-95 relative"
  >
    {badge && badge > 0 && (
      <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black animate-bounce z-20 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
        {badge}
      </div>
    )}
    <div className={cn(
      "w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all bg-black/40",
      color,
      "shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_currentColor] group-hover:bg-white/5"
    )}>
      <Icon className="w-8 h-8" />
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
      {label}
    </span>
  </button>
);

const MainHub: React.FC = () => {
  const { player, team, box, setScreen, setBoxTab, updateCoins, grantExperience, healTeam, setBattleContext, bumpBattleSession } = useStore();
  const [showMissions, setShowMissions] = React.useState(false);
  const [showCodes, setShowCodes] = React.useState(false);
  const [inputCode, setInputCode] = React.useState('');
  const [missions, setMissions] = React.useState(missionsData);
  const [detailMon, setDetailMon] = React.useState<NeoMon | null>(null);

  const redeemMission = (id: string, reward: number) => {
    updateCoins(reward);
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === '1111') {
      if (team[0]) await grantExperience(team[0].id, 1000);
    } else if (inputCode === '2222') {
      updateCoins(9999);
    } else if (inputCode === '3333') {
      await healTeam();
    }
    setInputCode('');
    setShowCodes(false);
  };

  const pendingMissions = missions.filter(m => !m.completed).length;

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 pb-24 overflow-y-auto scrollbar-hide select-none transition-all duration-700 animate-in fade-in relative">
      
      {/* HUB HEADER: Solo visibile qui */}
      <div className="flex items-center justify-between mb-8 pt-4 animate-in slide-in-from-top-4 duration-500">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
               <span className="font-black italic uppercase tracking-[0.2em] text-[10px] text-white">{player?.name || "LINKER"}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 self-start shadow-inner">
               <span className="text-amber-400 font-black text-xs">{useStore.getState().coins.toLocaleString()}</span>
               <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
            </div>
         </div>

         <button 
           onClick={() => setShowCodes(true)}
           className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/20 hover:text-cyan-400 hover:border-cyan-400/40 shadow-xl transition-all active:scale-95 group"
         >
            <Terminal className="w-5 h-5 group-hover:rotate-12 transition-transform" />
         </button>
      </div>

      {/* Battle & Catch Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => {
            setBattleContext({ kind: 'hub' });
            bumpBattleSession();
            setScreen('battle');
          }}
          className={cn(
            "relative h-32 rounded-3xl overflow-hidden group shadow-2xl",
            "border-2 border-red-500/30 hover:border-red-500 transition-all duration-500 active:scale-95"
          )}
        >
           <div className="absolute inset-0 bg-gradient-to-br from-red-900/60 via-red-950/40 to-transparent z-10" />
           <div className="relative z-20 h-full flex flex-col justify-center items-center p-4">
              <Zap className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Lotte</h2>
              <span className="text-[8px] uppercase font-bold text-red-400/60 tracking-widest mt-1">Combat Link</span>
           </div>
        </button>

        <button 
          onClick={() => {
            setBattleContext({ kind: 'hub' });
            bumpBattleSession();
            setScreen('battle');
          }}
          className={cn(
            "relative h-32 rounded-3xl overflow-hidden group shadow-2xl",
            "border-2 border-cyan-400/30 hover:border-cyan-400 transition-all duration-500 active:scale-95"
          )}
        >
           <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 via-cyan-950/40 to-transparent z-10" />
           <div className="relative z-20 h-full flex flex-col justify-center items-center p-4">
              <Compass className="w-8 h-8 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Cattura</h2>
              <span className="text-[8px] uppercase font-bold text-cyan-400/60 tracking-widest mt-1">Freq. Scan</span>
           </div>
        </button>
      </div>

   {/* Active Squad Preview */}
      <div className="mb-10 animate-in slide-in-from-left-4 duration-700 delay-100">
         <div className="flex justify-between items-baseline mb-4 px-2 border-b border-white/5 pb-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Active Squad</h3>
            <button onClick={() => { setBoxTab('team'); setScreen('box'); }} className="text-[10px] uppercase font-black text-cyan-400/60 hover:text-cyan-400 flex items-center gap-1 transition-colors">
               Manage <ChevronRight className="w-3 h-3" />
            </button>
         </div>

         {/* NOTIFICA EVOLUZIONE */}
         {team.some(m => m.canEvolve) && (
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="mb-6 p-4 bg-cyan-400 text-black rounded-3xl flex items-center justify-between shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse"
            >
               <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 fill-black" />
                  <span className="font-black uppercase text-[10px] tracking-tighter">Sincronia Evolutiva Rilevata!</span>
               </div>
               <button 
                  onClick={() => {
                     const monId = team.find(m => m.canEvolve)?.id;
                     if (monId) {
                        useStore.setState({ evolvingMonId: monId });
                        setScreen('evolution');
                     }
                  }}
                  className="px-4 py-2 bg-black text-white text-[8px] font-black rounded-xl uppercase tracking-widest hover:scale-105 transition-all"
               >
                  Evolvi Ora
               </button>
            </motion.div>
         )}

         <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => {
              const mon = team[i];
              const stats = mon?.currentStats || mon?.baseStats;
              const hpMax = stats?.hp || 1;
              const spMax = stats?.stamina || 1;
              const hpCur = (mon as NeoMon & { currentHp?: number })?.currentHp ?? hpMax;
              const spCur = (mon as NeoMon & { currentStamina?: number })?.currentStamina ?? spMax;
              const primaryType = mon?.types?.[0] || 'Bio';
              const ring =
                primaryType === 'Bio'
                  ? 'border-emerald-500/40'
                  : primaryType === 'Incandescente'
                    ? 'border-orange-500/40'
                    : primaryType === 'Idrico'
                      ? 'border-sky-500/40'
                      : 'border-cyan-500/30';
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!mon}
                  onClick={() => {
                    if (mon) setDetailMon(mon);
                    else {
                      setBoxTab('team');
                      setScreen('box');
                    }
                  }}
                  className={cn(
                    'aspect-square rounded-[1.25rem] border flex flex-col items-stretch justify-between relative group overflow-hidden transition-all shadow-lg backdrop-blur-md',
                    mon
                      ? cn('bg-black/60 hover:border-cyan-400/50 active:scale-95 shadow-inner', ring)
                      : 'border-dashed border-white/5 bg-transparent opacity-40 items-center justify-center'
                  )}
                >
                  {mon ? (
                    <>
                      <div className="absolute top-1 right-1 text-[7px] font-orbitron font-black text-cyan-300/90 bg-black/50 px-1 rounded">
                        {mon.level}
                      </div>
                      <div className="absolute top-1 left-1 text-[6px] font-black uppercase px-1 rounded bg-black/50 text-white/50">
                        {primaryType.slice(0, 3)}
                      </div>
                      <div className="flex flex-col items-center pt-5 px-1 flex-1 min-h-0">
                        <img
                          src={getCreatureSprite(mon.id)}
                          alt={mon.name}
                          className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]"
                        />
                        <span className="mt-1 text-[8px] font-black uppercase tracking-tight text-white/90 truncate w-full text-center font-rajdhani">
                          {mon.name}
                        </span>
                      </div>
                      <div className="px-1.5 pb-1.5 space-y-0.5">
                        <div className="h-1 w-full bg-black/70 rounded-full overflow-hidden border border-white/5">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-300',
                              hpCur / hpMax < 0.25 ? 'bg-rose-500' : hpCur / hpMax < 0.5 ? 'bg-yellow-400' : 'bg-cyan-400'
                            )}
                            style={{ width: `${Math.min(100, (hpCur / hpMax) * 100)}%` }}
                          />
                        </div>
                        <div className="h-1 w-full bg-black/70 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                            style={{ width: `${Math.min(100, (spCur / spMax) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-white/10 border-dashed" />
                  )}
                </button>
              );
            })}
         </div>
      </div>

      {/* Terminal Grid */}
      <div className="grid grid-cols-2 gap-4">
         <TerminalIcon icon={ShoppingBag} label="Shop" color="border-cyan-400/40 text-cyan-400" onClick={() => setScreen('shop')} />
         <TerminalIcon icon={Shield} label="Squadra" color="border-purple-500/40 text-purple-500" onClick={() => { setBoxTab('team'); setScreen('box'); }} />
         <TerminalIcon icon={Dna} label="Link-Dex" color="border-pink-500/40 text-pink-500" onClick={() => setScreen('linkdex')} />
         <TerminalIcon icon={ScrollText} label="Quests" color="border-amber-400/40 text-amber-400" badge={pendingMissions} onClick={() => setShowMissions(true)} />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <TerminalIcon icon={Map} label="Mappa" color="border-emerald-500/40 text-emerald-400" onClick={() => setScreen('worldmap')} />
        <TerminalIcon icon={Hammer} label="Craft" color="border-orange-500/40 text-orange-400" onClick={() => setScreen('crafting')} />
      </div>

      {/* Debug Codes Drawer */}
      <AnimatePresence>
        {showCodes && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            className="fixed inset-x-0 bottom-0 z-[600] bg-black/95 backdrop-blur-2xl border-t-2 border-red-500/50 p-8 pb-32"
          >
             <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter text-red-500">Terminal Code</h3>
                   <span className="text-[10px] font-mono text-red-500/40 uppercase tracking-widest italic leading-none">Security Bypass Required</span>
                </div>
                <button onClick={() => setShowCodes(false)} className="p-2 text-red-500/20 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
             </div>
             
             <form onSubmit={handleCodeSubmit} className="space-y-6">
                <input 
                  autoFocus
                  type="text" 
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Enter Access Key..."
                  className="w-full bg-red-900/10 border-b-2 border-red-500/40 py-4 font-mono text-3xl text-red-500 text-center focus:outline-none focus:border-red-500 transition-all placeholder:text-red-900/40"
                />
                <button 
                  type="submit"
                  className="w-full py-5 bg-red-500 text-black font-black uppercase text-xs tracking-[0.5em] rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Confirm Decryption
                </button>
             </form>

             <div className="mt-8 grid grid-cols-1 gap-2 opacity-20 text-[8px] font-mono uppercase text-red-500">
                <p>1111: NEURAL EXP BOOST (+1000)</p>
                <p>2222: DATABASE OVERFLOW (+9999 CREDITS)</p>
                <p>3333: REPAIR CORE PROTOCOL (HEAL ALL)</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missions Overlay (Già presente, mantenuto) */}
      <AnimatePresence>
        {showMissions && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-3xl p-6 overflow-y-auto"
          >
             <div className="flex justify-between items-center mb-10 pt-10 px-4">
                <h2 className="text-4xl font-black italic uppercase italic tracking-tighter text-white">Quests</h2>
                <button onClick={() => setShowMissions(false)} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"><X className="w-6 h-6" /></button>
             </div>
             <div className="space-y-4 px-4 pb-20">
                {missions.map((mission) => (
                  <div key={mission.id} className={cn("p-6 rounded-[2rem] border transition-all duration-300", mission.completed ? "border-green-500/10 bg-green-500/1 opacity-30" : "border-white/10 bg-white/5 shadow-2xl")}>
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black uppercase tracking-widest text-white italic">{mission.title}</h4>
                        <div className="flex items-center gap-1 text-amber-400 font-black text-xs">+{mission.rewardCoins} <Zap className="w-3 h-3 fill-amber-400" /></div>
                     </div>
                     <p className="text-[11px] text-white/40 mb-6 leading-relaxed uppercase tracking-tighter">{mission.description}</p>
                     {!mission.completed && (
                       <button onClick={() => redeemMission(mission.id, mission.rewardCoins)} className="w-full py-4 bg-cyan-400 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]">Claim Rewards</button>
                     )}
                  </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {detailMon && <NeoMonDetailModal mon={detailMon} onClose={() => setDetailMon(null)} />}
    </div>
  );
};

export default MainHub;
