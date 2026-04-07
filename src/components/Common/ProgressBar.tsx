import React from 'react'

export const ProgressBar: React.FC<{ value: number; max: number; label?: string; color?: string }> = ({
  value,
  max,
  label,
  color = 'bg-green-500'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="w-full space-y-1">
      {label && <div className="flex justify-between text-xs font-medium uppercase text-slate-400"><span>{label}</span> <span>{value}/{max}</span></div>}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
