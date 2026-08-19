/**
 * Tabla curada de monedas soportadas por SmartOrders.
 * Debe mantenerse en sincronía con el set de monedas del backend
 * (modelo/schema Settings, campo currency_code) para que símbolos y
 * locales coincidan entre frontend y backend.
 */

export type CurrencyCode =
  | 'GTQ'
  | 'USD'
  | 'MXN'
  | 'HNL'
  | 'CRC'
  | 'COP'
  | 'NIO'
  | 'PAB'
  | 'PEN'

export interface CurrencyInfo {
  symbol: string
  name: string
  locale: string
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  GTQ: { symbol: 'Q', name: 'Quetzal guatemalteco', locale: 'es-GT' },
  USD: { symbol: '$', name: 'Dólar estadounidense', locale: 'en-US' },
  MXN: { symbol: '$', name: 'Peso mexicano', locale: 'es-MX' },
  HNL: { symbol: 'L', name: 'Lempira hondureño', locale: 'es-HN' },
  CRC: { symbol: '₡', name: 'Colón costarricense', locale: 'es-CR' },
  COP: { symbol: '$', name: 'Peso colombiano', locale: 'es-CO' },
  NIO: { symbol: 'C$', name: 'Córdoba nicaragüense', locale: 'es-NI' },
  PAB: { symbol: 'B/.', name: 'Balboa panameño', locale: 'es-PA' },
  PEN: { symbol: 'S/', name: 'Sol peruano', locale: 'es-PE' },
}

export const DEFAULT_CURRENCY_CODE: CurrencyCode = 'GTQ'

/**
 * Opciones listas para poblar un <Select>.
 * Label con formato: "Q — Quetzal guatemalteco (GTQ)"
 */
export const CURRENCY_OPTIONS: { value: CurrencyCode; label: string }[] = (
  Object.keys(CURRENCIES) as CurrencyCode[]
).map((code) => ({
  value: code,
  label: `${CURRENCIES[code].symbol} — ${CURRENCIES[code].name} (${code})`,
}))

export function isCurrencyCode(value?: string | null): value is CurrencyCode {
  return !!value && value in CURRENCIES
}
