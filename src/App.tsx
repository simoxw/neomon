import React, { useEffect } from 'react';
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

const App: React.FC = () => {
  const currentScreen = useStore(s => s.currentScreen);
  const loadData = useStore(s => s.loadData);
  const evolutionQueue = useStore(s => s.evolutionQueue);
  const lastBattleSummary = useStore(s => s.lastBattleSummary);
  const toastMessage = useStore(s => s.toastMessage);
  const addPlaytime = useStore(s => s.addPlaytime);
  const inventoryOverlayOpen = useStore(s => s.inventoryOverlayOpen);
  const isLoading = useStore(s => s.isLoading);

  useEffect(() => {
    const load = async () => {
      try {
        console.log('[App] Starting loadData...');
        await loadData();
        console.log('[App] loadData completed!');
      } catch (error) {
        console.error('[App] loadData error:', error);
      }
    };
    load();
  }, [loadData]);

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
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-24 h-24 relative mb-8">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          <div className="absolute inset-4 border-4 border-fuchsia-500/20 rounded-full" />
          <div className="absolute inset-4 border-4 border-fuchsia-400 border-b-transparent rounded-full animate-spin-slow shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black italic uppercase tracking-[0.3em] text-cyan-400 animate-pulse">
            Neural Link
          </h2>
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.5em] animate-pulse delay-700">
            Initializing Dexie Protocol...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="h-[100dvh] w-screen bg-slate-950 font-sans text-[min(3.5vw,16px)] selection:bg-cyan-500/30 overflow-hidden flex flex-col text-white select-none touch-none"
    >
      {showEvolutionModal && <EvolutionModal />}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2500] px-4 py-2 rounded-xl bg-cyan-600 text-black text-xs font-black uppercase shadow-lg">
          {toastMessage}
        </div>
      )}

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
