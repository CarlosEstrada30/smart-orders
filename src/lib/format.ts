const currencyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Monto en quetzales: Q1,234.50 */
export function formatCurrency(amount: number | string | null | undefined) {
  const value = typeof amount === 'string' ? Number(amount) : (amount ?? 0)
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}
