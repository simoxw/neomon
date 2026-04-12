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
  User,
  Settings,
  Trophy,
  Activity,
  Award,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import missionsData from '../../data/missions.json';
import creaturesData from '../../data/creatures.json';
import itemsCatalog from '../../data/items.json';
import { getCreatureSprite } from '../../utils/imageLoader';
import NeoMonDetailModal from '../Common/NeoMonDetailModal';
import type { NeoMon } from '../../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ProfileModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { player, coins, totalBattles, totalBattlesWon, totalCaptures, team, box } = useStore();
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [newName, setNewName] = React.useState(player?.name || '');

  if (!isOpen) return null;

  const handleSaveName = async () => {
    if (!newName.trim() || !player) return;
    const { db } = await import('../../db');
    await db.player.update(player.id, { name: newName });
    useStore.setState({ player: { ...player, name: newName } });
    setIsEditingName(false);
  };

  const winRate = totalBattles > 0 ? Math.round((totalBattlesWon / totalBattles) * 100) : 0;
  const totalMons = team.length + box.length;
  const playerLevel = Math.floor(Math.sqrt((totalBattlesWon * 10 + totalCaptures * 20) / 100)) + 1;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex flex-col p-6 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-10 pt-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/5 border-b-2 border-cyan-400 text-xl font-black text-white focus:outline-none w-32 px-1"
                  />
                  <button onClick={handleSaveName} className="p-1 text-emerald-400 hover:scale-110 transition-transform">✓</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">{player?.name || 'Linker'}</h2>
                  <button onClick={() => setIsEditingName(true)} className="p-1 text-white/20 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-widest">Neural Link Rank: {playerLevel}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2 text-white/40">
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Battaglie</span>
          </div>
          <div className="text-2xl font-black text-white italic">{totalBattlesWon} <span className="text-xs text-white/20">Vinte</span></div>
          <div className="text-[10px] font-mono text-cyan-400/60 mt-1">Win Rate: {winRate}%</div>
        </div>
        <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2 text-white/40">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Catture</span>
          </div>
          <div className="text-2xl font-black text-white italic">{totalCaptures}</div>
          <div className="text-[10px] font-mono text-cyan-400/60 mt-1">Totali: {totalMons}</div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 px-2">Badge Conseguiti</h3>
        <div className="grid grid-cols-4 gap-4">
          {['badge-01', 'badge-02', 'badge-03', 'badge-04'].map((bId) => {
            const hasBadge = player?.badges?.includes(bId);
            return (
              <div key={bId} className={cn(
                "aspect-square rounded-2xl border flex items-center justify-center transition-all duration-500",
                hasBadge ? "bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "bg-black/40 border-white/5 grayscale opacity-20"
              )}>
                <Award className={cn("w-8 h-8", hasBadge ? "text-cyan-400" : "text-white/20")} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-6 rounded-[2.5rem] bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-widest text-white">Crediti Totali</span>
          </div>
          <span className="text-2xl font-black text-amber-400 tabular-nums">{coins.toLocaleString()}</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400" style={{ width: `${(playerLevel % 1) * 100}%` }} />
        </div>
        <div className="mt-2 text-[8px] font-mono text-white/20 text-center uppercase tracking-widest">Next Rank Progress</div>
      </div>
    </motion.div>
  );
};

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
  const player = useStore(s => s.player);
  const team = useStore(s => s.team);
  const box = useStore(s => s.box);
  const coins = useStore(s => s.coins);
  const setScreen = useStore(s => s.setScreen);
  const setBoxTab = useStore(s => s.setBoxTab);
  const updateCoins = useStore(s => s.updateCoins);
  const grantExperience = useStore(s => s.grantExperience);
  const healTeam = useStore(s => s.healTeam);
  const setBattleContext = useStore(s => s.setBattleContext);
  const bumpBattleSession = useStore(s => s.bumpBattleSession);
  const missionProgress = useStore(s => s.missionProgress);
  const [showMissions, setShowMissions] = React.useState(false);
  const [showCodes, setShowCodes] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [inputCode, setInputCode] = React.useState('');
  const [detailMon, setDetailMon] = React.useState<NeoMon | null>(null);

  const redeemMission = async (id: string, reward: number) => {
    const { updateCoins, missionProgress } = useStore.getState();
    const mp = { ...missionProgress };
    if (mp[id]?.completed) return;
    
    mp[id] = { ...mp[id], completed: true };
    updateCoins(reward);
    useStore.setState({ missionProgress: mp });
    
    const p = useStore.getState().player;
    if (p) {
      const { db } = await import('../../db');
      await db.player.update(p.id, { missionProgress: mp });
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === '1111') {
      if (team[0]) await grantExperience(team[0].id, 1000);
    } else if (inputCode === '2222') {
      updateCoins(9999);
    } else if (inputCode === '3333') {
      await healTeam();
    } else if (inputCode === '4444') {
      // Sblocca tutto il Link-Dex
      const allIds = (creaturesData as { id: string }[]).map(c => c.id);
      useStore.setState({ seenIds: allIds });
    } else if (inputCode === '5555') {
      // Pacchetto Risorse Starter
      const { grantInventoryItem } = useStore.getState();
      await grantInventoryItem('i-prism-01', 3);
      await grantInventoryItem('i-prism-02', 3);
      await grantInventoryItem('i-prism-03', 1);
    } else if (inputCode === '9999') {
      // Livello 100 istantaneo
      if (team[0]) {
        const currentLevel = team[0].level;
        const targetLevel = 100;
        if (currentLevel < targetLevel) {
          // Calcoliamo l'exp necessaria approssimativa (Livello^3)
          const needed = Math.pow(targetLevel, 3);
          await grantExperience(team[0].id, needed);
        }
      }
    }
    setInputCode('');
    setShowCodes(false);
  };

  const pendingMissions = (missionsData as any[]).filter(m => !missionProgress[m.id]?.completed).length;

  return (
    <div className="flex flex-col h-full bg-slate-950 px-3 py-6 pb-24 overflow-y-auto scrollbar-hide select-none transition-all duration-700 animate-in fade-in relative">
      
      {/* HUB HEADER */}
      <div className="flex items-center justify-between mb-8 pt-4 animate-in slide-in-from-top-4 duration-500">
         <button 
           onClick={() => setShowProfile(true)}
           className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-2xl transition-all group active:scale-95"
         >
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30 group-hover:border-cyan-400">
               <User className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex flex-col items-start">
               <div className="flex items-center gap-2">
                  <span className="font-black italic uppercase tracking-tighter text-xs text-white">{player?.name || "LINKER"}</span>
                  <div className="flex items-center gap-1 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20">
                     <span className="text-amber-400 font-black text-[9px]">{coins.toLocaleString()}</span>
                     <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.6)]" />
                  </div>
               </div>
               <span className="text-[7px] font-mono text-cyan-400/60 uppercase tracking-widest leading-none">Visualizza Profilo</span>
            </div>
         </button>

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
            setBattleContext({ kind: 'hub', mode: 'combat' });
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
            setBattleContext({ kind: 'hub', mode: 'capture' });
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
                              'h-full rounded-full transition-all duration-300 bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(100, (hpCur / hpMax) * 100)}%` }}
                          />
                        </div>
                        <div className="h-1 w-full bg-black/70 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full bg-yellow-400 transition-all duration-300"
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
      <div className="grid grid-cols-3 gap-2">
         <TerminalIcon icon={ShoppingBag} label="Shop" color="border-cyan-400/40 text-cyan-400" onClick={() => setScreen('shop')} />
         <TerminalIcon icon={Shield} label="Squadra" color="border-purple-500/40 text-purple-500" onClick={() => { setBoxTab('team'); setScreen('box'); }} />
         <TerminalIcon icon={Dna} label="Link-Dex" color="border-pink-500/40 text-pink-500" onClick={() => setScreen('linkdex')} />
         <TerminalIcon icon={ScrollText} label="Quests" color="border-amber-400/40 text-amber-400" badge={pendingMissions} onClick={() => setShowMissions(true)} />
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

             <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2 opacity-20 text-[8px] font-mono uppercase text-red-500">
                <p>1111: NEURAL EXP BOOST (+1000)</p>
                <p>2222: DATABASE OVERFLOW (+9999 CREDITS)</p>
                <p>3333: REPAIR CORE PROTOCOL (HEAL ALL)</p>
                <p>4444: LINK-DEX FULL SYNC (ALL ENTRIES)</p>
                <p>5555: STARTER RESOURCE PACK (PRISMS)</p>
                <p>9999: OVERCLOCK LEVEL (LV. 100)</p>
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
                {(missionsData as any[]).map((mission) => {
                  const isCompleted = missionProgress[mission.id]?.completed;
                  return (
                    <div key={mission.id} className={cn("p-6 rounded-[2rem] border transition-all duration-300", isCompleted ? "border-green-500/10 bg-green-500/1 opacity-30" : "border-white/10 bg-white/5 shadow-2xl")}>
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black uppercase tracking-widest text-white italic">{mission.title}</h4>
                          <div className="flex items-center gap-1 text-amber-400 font-black text-xs">+{mission.rewardCoins} <Zap className="w-3 h-3 fill-amber-400" /></div>
                       </div>
                       <p className="text-[11px] text-white/40 mb-6 leading-relaxed uppercase tracking-tighter">{mission.description}</p>
                       {!isCompleted && (
                         <button onClick={() => redeemMission(mission.id, mission.rewardCoins)} className="w-full py-4 bg-cyan-400 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]">Claim Rewards</button>
                       )}
                    </div>
                  );
                })}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {detailMon && <NeoMonDetailModal mon={detailMon} onClose={() => setDetailMon(null)} />}
      
      <AnimatePresence>
        {showProfile && <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default MainHub;
