import React from 'react'

export const Filters: React.FC = () => {
  return (
    <div className="flex gap-2 p-4 bg-slate-900 border-b border-slate-700">
      <select className="bg-slate-800 text-sm px-2 py-1 rounded border border-slate-600">
        <option>Tutti i Tipi</option>
        <option>Fuoco</option>
        <option>Acqua</option>
        <option>Elettro</option>
      </select>
      <input 
        placeholder="Cerca Neomon..." 
        className="flex-1 bg-slate-800 text-sm px-3 py-1 rounded border border-slate-600"
      />
    </div>
  )
}
