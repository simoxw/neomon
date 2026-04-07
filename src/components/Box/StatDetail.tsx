import React from 'react'
import { ProgressBar } from '../Common/ProgressBar'

export const StatDetail: React.FC<{ creature: any }> = ({ creature }) => {
  if (!creature) return <div className="p-8 text-center text-slate-500">Seleziona un Neomon</div>

  return (
    <div className="p-6 bg-slate-900 h-full border-l border-slate-700">
      <div className="text-center mb-6">
         <div className="w-32 h-32 mx-auto bg-slate-800 rounded-2xl mb-4 border border-slate-700 bg-gradient-to-tr from-slate-800 to-indigo-900/30" />
         <h2 className="text-2xl font-black italic uppercase tracking-tighter">Flame Drake</h2>
         <span className="px-2 py-0.5 bg-red-950 text-red-400 text-[10px] font-bold rounded uppercase">Fuoco / Drago</span>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <ProgressBar value={75} max={100} label="Attacco" color="bg-orange-500" />
          <ProgressBar value={40} max={100} label="Difesa" color="bg-blue-400" />
          <ProgressBar value={90} max={100} label="Velocità" color="bg-yellow-400" />
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Abilità Speciale</h3>
          <p className="text-sm bg-slate-800/80 p-2 rounded italic text-slate-300">
            "Fiammata Eterna: Aumenta il danno di tipo Fuoco del 10% ogni turno."
          </p>
        </div>
      </div>
    </div>
  )
}
