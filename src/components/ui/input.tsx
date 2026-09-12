import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '../../lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-11 w-full rounded-xl border border-red-200 bg-white px-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-red-300',
      className,
    )}
    {...props}
  />
))

Input.displayName = 'Input'
