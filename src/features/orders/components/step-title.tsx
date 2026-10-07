import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type StepTitleProps = {
  step: number
  done?: boolean
  optional?: boolean
  children: React.ReactNode
}

/** Título numerado para los pasos del formulario de pedido */
export function StepTitle({ step, done, optional, children }: StepTitleProps) {
  return (
    <div className='flex items-center gap-2.5'>
      <span
        aria-hidden='true'
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
          done
            ? 'bg-primary text-primary-foreground'
            : 'border-primary/40 text-primary border'
        )}
      >
        {done ? <Check className='size-3.5' /> : step}
      </span>
      <h2 className='font-display text-lg leading-none font-semibold'>
        {children}
      </h2>
      {optional && (
        <span className='text-muted-foreground text-sm'>(opcional)</span>
      )}
    </div>
  )
}
