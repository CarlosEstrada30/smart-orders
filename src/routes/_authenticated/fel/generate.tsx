/**
 * FEL Invoice Generator Route
 * Página para generar facturas/comprobantes desde órdenes entregadas
 */

import { createFileRoute } from '@tanstack/react-router'
import { FELInvoiceGenerator } from '@/features/fel/invoice-generator'

export const Route = createFileRoute('/_authenticated/fel/generate')({
  component: FELInvoiceGeneratorPage,
})

function FELInvoiceGeneratorPage() {
  return <FELInvoiceGenerator />
}