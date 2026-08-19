/**
 * Utilidad central de formato de moneda.
 * Toda la app debe formatear montos a través de estas funciones en vez de
 * hardcodear "Q", "GTQ" o "es-GT" — la moneda es configurable por tenant.
 */

import { CURRENCIES, DEFAULT_CURRENCY_CODE, isCurrencyCode } from '@/lib/currencies'

/**
 * Resuelve el locale de Intl a usar para un código de moneda dado.
 * Si el código no está definido o no está en la tabla curada, cae a GTQ/es-GT.
 */
export function resolveLocale(currencyCode?: string | null): string {
  if (isCurrencyCode(currencyCode)) {
    return CURRENCIES[currencyCode].locale
  }
  return CURRENCIES[DEFAULT_CURRENCY_CODE].locale
}

/**
 * Resuelve el código de moneda efectivo (con fallback a GTQ).
 */
function resolveCurrencyCode(currencyCode?: string | null): string {
  return isCurrencyCode(currencyCode) ? currencyCode : DEFAULT_CURRENCY_CODE
}

/**
 * Formatea un monto numérico como moneda usando Intl.NumberFormat,
 * resolviendo el locale correcto a partir del código de moneda del tenant.
 * Si currencyCode es undefined o no está en la tabla, usa GTQ/es-GT.
 */
export function formatCurrency(amount: number, currencyCode?: string | null): string {
  const code = resolveCurrencyCode(currencyCode)
  const locale = resolveLocale(code)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
  }).format(amount)
}
