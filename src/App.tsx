import React, { useEffect } from 'react';
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

const App: React.FC = () => {
  const { currentScreen, player, coins, loadData } = useStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      default: return <MainHub />;
    }
  };

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="h-[100dvh] w-screen bg-slate-950 font-sans text-[min(3.5vw,16px)] selection:bg-cyan-500/30 overflow-hidden flex flex-col text-white select-none touch-none"
    >
      
      {/* Main Content: Flex-grow to fill space */}
      <main className="flex-1 w-full overflow-hidden relative z-10">
        <div key={currentScreen} className="h-full w-full">
           {renderScreen()}
        </div>
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
