import React from 'react'
import { Terminal } from 'lucide-react'

export const MissionTerminal: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center backdrop-blur-md">
      <Terminal className="mx-auto mb-4 h-12 w-12 text-green-400 opacity-50" />
      <h2 className="mb-2 text-2xl font-bold">Terminale Missioni</h2>
      <p className="text-slate-400">Accetta nuove sfide per guadagnare crediti.</p>
    </div>
  )
}
