import React from 'react';
import { Home, Users, Package, Settings, Sword, Briefcase } from 'lucide-react';
import { useStore } from '../../context/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NeoNavBar: React.FC = () => {
  const { currentScreen, setScreen, enterInventory } = useStore();

  const navItems = [
    { id: 'hub', label: 'Hub', icon: Home, color: 'text-cyan-400' },
    { id: 'inventory', label: 'Zaino', icon: Briefcase, color: 'text-amber-400' },
    { id: 'box', label: 'LinkBox', icon: Package, color: 'text-purple-400' },
    { id: 'settings', label: 'Nexus', icon: Settings, color: 'text-gray-400' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-[200] pb-safe">
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'inventory') enterInventory({ fromBattle: false });
              else setScreen(item.id as any);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative px-4 py-2 rounded-xl group",
              isActive ? "scale-110" : "opacity-40 hover:opacity-80"
            )}
          >
            {/* Active Glow */}
            {isActive && (
              <div className={cn(
                "absolute -top-1 w-8 h-1 rounded-full animate-pulse",
                item.color.replace('text-', 'bg-')
              )} />
            )}

            <Icon className={cn(
               "w-6 h-6 transition-colors",
               isActive ? item.color : "text-white"
            )} />
            
            <span className={cn(
              "text-[10px] font-black uppercase tracking-tighter",
              isActive ? "text-white font-black" : "text-white/40"
            )}>
              {item.label}
            </span>

            {/* Hover Circle */}
            <div className={cn(
              "absolute inset-0 rounded-xl bg-white/5 scale-0 group-hover:scale-100 transition-transform -z-10"
            )} />
          </button>
        );
      })}
    </nav>
  );
};

export default NeoNavBar;
