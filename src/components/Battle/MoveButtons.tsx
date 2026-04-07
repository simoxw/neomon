import React from 'react'
import { Button } from '../Common/Button'

export const MoveButtons: React.FC = () => {
  const moves = ['Attacco Base', 'Sfuriata', 'Rigenera', 'Difesa']
  
  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 border-t border-slate-700">
      {moves.map((move) => (
        <Button 
          key={move} 
          className="h-16 text-lg font-bold bg-slate-800 border-2 border-slate-700 hover:border-slate-500 active:scale-95 transition-transform"
        >
          {move}
        </Button>
      ))}
    </div>
  )
}
