/**
 * Paletas de color que cada usuario puede elegir (se guardan en su navegador).
 * Los tokens viven en src/styles/theme.css bajo [data-palette='…'];
 * aquí solo están el nombre y los colores para las muestras y el theme-color.
 */
export const palettes = [
  {
    value: 'jade',
    label: 'Jade',
    sidebar: { light: '#0B4A3F', dark: '#0A2A24' },
    accent: '#E3B23C',
  },
  {
    value: 'anil',
    label: 'Añil',
    sidebar: { light: '#1E2A5A', dark: '#12193A' },
    accent: '#E3B23C',
  },
  {
    value: 'cacao',
    label: 'Cacao',
    sidebar: { light: '#3B2418', dark: '#24170F' },
    accent: '#6FAF5B',
  },
  {
    value: 'volcan',
    label: 'Volcán',
    sidebar: { light: '#23262B', dark: '#101113' },
    accent: '#E5674B',
  },
] as const

export type Palette = (typeof palettes)[number]['value']

export const DEFAULT_PALETTE: Palette = 'jade'
export const PALETTE_COOKIE_NAME = 'so-palette'

export const isPalette = (value: unknown): value is Palette =>
  palettes.some((p) => p.value === value)
