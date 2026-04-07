import React from 'react'
import { Hammer } from 'lucide-react'

export const Crafting: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center backdrop-blur-md">
      <Hammer className="mx-auto mb-4 h-12 w-12 text-orange-400 opacity-50" />
      <h2 className="mb-2 text-2xl font-bold">Laboratorio Crafting</h2>
      <p className="text-slate-400">Combina materiali per creare oggetti potenti.</p>
    </div>
  )
}
