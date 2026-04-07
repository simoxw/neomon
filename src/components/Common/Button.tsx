import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'rose' | 'cyan' | 'fuchsia';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-slate-800 hover:bg-slate-700 text-white",
      outline: "border border-white/20 bg-transparent hover:bg-white/5 text-white",
      ghost: "bg-transparent hover:bg-white/5 text-white hover:text-white",
      rose: "bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20",
      cyan: "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20",
      fuchsia: "bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/20",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 active:scale-[0.98]",
          variants[variant as keyof typeof variants],
          className
        )}
        {...props}
      />
    )
  }
)
