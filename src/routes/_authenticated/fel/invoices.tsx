/**
 * FEL Invoices List Page
 */

import { createFileRoute } from '@tanstack/react-router'
import { FELInvoicesList } from '@/features/fel/invoices-list'

export const Route = createFileRoute('/_authenticated/fel/invoices')({
  component: FELInvoicesList
})

