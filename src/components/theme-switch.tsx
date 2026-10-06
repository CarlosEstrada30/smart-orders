import { Check, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { palettes } from '@/config/palettes'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const MODES = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
] as const

/** Muestra de una paleta: el color del sidebar con un punto del acento */
export function PaletteSwatch({
  sidebar,
  accent,
  className,
}: {
  sidebar: string
  accent: string
  className?: string
}) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'relative inline-flex size-5 shrink-0 items-center justify-center rounded-full ring-1 ring-black/10 dark:ring-white/15',
        className
      )}
      style={{ backgroundColor: sidebar }}
    >
      <span
        className='size-2 rounded-full'
        style={{ backgroundColor: accent }}
      />
    </span>
  )
}

export function ThemeSwitch() {
  const { theme, setTheme, palette, setPalette } = useTheme()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <Sun className='size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
          <Moon className='absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
          <span className='sr-only'>Apariencia</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel className='text-muted-foreground text-xs font-normal'>
          Modo
        </DropdownMenuLabel>
        {MODES.map((mode) => (
          <DropdownMenuItem key={mode.value} onClick={() => setTheme(mode.value)}>
            {mode.label}
            <Check
              size={14}
              className={cn('ms-auto', theme !== mode.value && 'hidden')}
            />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className='text-muted-foreground text-xs font-normal'>
          Color
        </DropdownMenuLabel>
        {palettes.map((p) => (
          <DropdownMenuItem
            key={p.value}
            onClick={() => setPalette(p.value)}
            className='gap-2.5'
          >
            <PaletteSwatch sidebar={p.sidebar.light} accent={p.accent} />
            {p.label}
            <Check
              size={14}
              className={cn('ms-auto', palette !== p.value && 'hidden')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
