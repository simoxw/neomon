import React from 'react'
import Arena from './Arena'
import { MoveButtons } from './MoveButtons.tsx'
import { ProgressBar } from '../Common/ProgressBar'

export const BattleScreen: React.FC = () => {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-6 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-4">
          <div className="w-48 bg-slate-900/80 p-2 rounded-lg border border-slate-700 shadow-xl">
             <div className="text-sm font-bold truncate">Neomon Avversario</div>
             <ProgressBar value={100} max={100} color="bg-red-500" label="PV" />
          </div>
          <div />
        </div>
        
        <Arena />

        <div className="flex justify-between items-center px-4">
          <div />
          <div className="w-48 bg-slate-900/80 p-2 rounded-lg border border-slate-700 shadow-xl self-end">
             <div className="text-sm font-bold truncate">Tuo Neomon</div>
             <ProgressBar value={80} max={100} color="bg-green-500" label="PV" />
             <div className="mt-2">
                <ProgressBar value={40} max={60} color="bg-blue-500" label="SPA" />
             </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <MoveButtons />
      </div>
    </div>
  )
}
