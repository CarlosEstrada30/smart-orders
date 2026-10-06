import { BrandMark } from '@/assets/brand-mark'

/**
 * Componente de loading más compacto para usar dentro de layouts
 */
export function PermissionsLoadingCompact() {
  return (
    <div className='bg-background flex min-h-svh items-center justify-center p-8'>
      <div
        role='status'
        className='flex flex-col items-center gap-3 text-center'
      >
        <BrandMark className='text-primary size-10 animate-pulse' />
        <p className='text-muted-foreground text-sm'>
          Preparando tu espacio de trabajo…
        </p>
      </div>
    </div>
  )
}
