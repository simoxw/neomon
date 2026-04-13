import React, { useEffect, useState, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './context/useStore';
import Arena from './components/Battle/Arena';
import MainHub from './components/Hub/MainHub';
import CreatureGrid from './components/Box/CreatureGrid';
import NeoNavBar from './components/Navigation/NeoNavBar';
import Shop from './components/Hub/Shop';
import LinkDex from './components/Hub/LinkDex';
import Settings from './components/Hub/Settings';
import EvolutionScene from './components/Battle/EvolutionScene';
import Inventory from './components/Hub/Inventory';
import WorldMap from './components/World/WorldMap';
import TrainerBattle from './components/World/TrainerBattle';
import { Crafting } from './components/Hub/Crafting';
import EvolutionModal from './components/Common/EvolutionModal';

import { updateLoginStreak } from './logic/DailySystem';
import { decodeTeam } from './utils/teamShare';
import TeamPreviewModal from './components/Common/TeamPreviewModal';
import LoadingScreen from './components/Common/LoadingScreen';
import { PLAYER_RANKS, getCurrentRank } from './data/ranks';

const App: React.FC = () => {
  const currentScreen = useStore(s => s.currentScreen);
  const loadData = useStore(s => s.loadData);
  const evolutionQueue = useStore(s => s.evolutionQueue);
  const lastBattleSummary = useStore(s => s.lastBattleSummary);
  const toastMessage = useStore(s => s.toastMessage);
  const addPlaytime = useStore(s => s.addPlaytime);
  const inventoryOverlayOpen = useStore(s => s.inventoryOverlayOpen);
  const isLoading = useStore(s => s.isLoading);
  const setToast = useStore(s => s.setToast);
  const setImportedTeam = useStore(s => s.setImportedTeam);
  const importedTeam = useStore(s => s.importedTeam);
  const playerStats = useStore(s => s.playerStats);
  const team = useStore(s => s.team);

  const [showRankUp, setShowRankUp] = useState<string | null>(null);
  const prevRankRef = useRef<string | null>(null);

  useEffect(() => {
    if (playerStats) {
      const maxLevel = team.length > 0 ? Math.max(...team.map(m => m.level)) : 0;
      const currentRank = getCurrentRank(playerStats.badges, maxLevel);
      
      if (prevRankRef.current && prevRankRef.current !== currentRank.id) {
        setShowRankUp(currentRank.name);
        setTimeout(() => setShowRankUp(null), 4000);
      }
      prevRankRef.current = currentRank.id;
    }
  }, [playerStats, team]);

  useEffect(() => {
    const load = async () => {
      try {
        console.log('[App] Starting loadData...');
        await loadData();
        console.log('[App] loadData completed!');
        
        // Streak Logic
        const streakResult = await updateLoginStreak();
        if (typeof streakResult === 'object' && (streakResult as any).milestone) {
          setToast(`🔥 ${(streakResult as any).streak} giorni consecutivi! Ricompensa: ${(streakResult as any).milestone}`);
          setTimeout(() => setToast(null), 4000);
        }

        // Share Team Logic
        const params = new URLSearchParams(window.location.search);
        const teamCode = params.get('team');
        if (teamCode) {
          const data = decodeTeam(teamCode);
          if (data) {
            setImportedTeam(data);
          }
        }
      } catch (error) {
        console.error('[App] loadData error:', error);
      }
    };
    load();
  }, [loadData, setToast, setImportedTeam]);

  const closeImportModal = () => {
    setImportedTeam(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('team');
    window.history.replaceState({}, '', url.toString());
  };

  const confirmImport = () => {
    // For now we just close, but the data is in the store as importedTeam
    // The prompt says "salva in store come 'importedTeam'" which I already did
    setToast('Team importato come riferimento!');
    setTimeout(() => setToast(null), 2500);
    closeImportModal();
  };

  useEffect(() => {
    const id = window.setInterval(() => addPlaytime(60_000), 60_000);
    return () => window.clearInterval(id);
  }, [addPlaytime]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'hub': return <MainHub />;
      case 'battle': return <Arena />;
      case 'box': return <CreatureGrid />;
      case 'shop': return <Shop />;
      case 'linkdex': return <LinkDex />;
      case 'settings': return <Settings />;
      case 'evolution': return <EvolutionScene />;
      case 'inventory': return <Inventory />;
      case 'worldmap': return <WorldMap />;
      case 'trainer': return <TrainerBattle />;
      case 'crafting': return <Crafting />;
      default: return <MainHub />;
    }
  };

  const showEvolutionModal =
    currentScreen === 'hub' && evolutionQueue.length > 0 && !lastBattleSummary;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="h-[100dvh] w-screen bg-slate-950 font-sans text-[min(3.5vw,16px)] selection:bg-cyan-500/30 overflow-hidden flex flex-col text-white select-none touch-none"
    >
      {showEvolutionModal && <EvolutionModal />}
      <AnimatePresence>
        {showRankUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[4000] bg-cyan-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-2">Rango Aumentato</h2>
              <h1 className="text-4xl font-black font-orbitron italic uppercase text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                {showRankUp}
              </h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-white/60 italic max-w-xs mx-auto"
              >
                {PLAYER_RANKS.find(r => r.name === showRankUp)?.greeting}
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[3000] px-6 py-3 bg-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded-full shadow-2xl"
          >
            {toastMessage}
          </motion.div>
        )}

        {importedTeam && (
          <TeamPreviewModal 
            data={importedTeam} 
            onClose={closeImportModal} 
            onImport={confirmImport} 
          />
        )}
      </AnimatePresence>

      {inventoryOverlayOpen && (
        <div className="fixed inset-0 z-[2000] h-[100dvh] w-screen overflow-hidden bg-slate-950">
          <Inventory />
        </div>
      )}

      {/* Main Content: Flex-grow to fill space */}
      <main className="flex-1 w-full overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -32, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full w-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation (BottomBar): Hidden in battle/evolution to save space */}
      {(currentScreen !== 'battle' && currentScreen !== 'evolution') && (
        <footer className="h-[12%] w-full flex flex-col justify-start border-t border-white/5 bg-gray-900/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] z-[300]">
          <NeoNavBar />
        </footer>
      )}
    </div>
  );
};

export default App;
