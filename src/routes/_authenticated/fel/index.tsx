/**
 * FEL Dashboard Page
 */

import { createFileRoute } from '@tanstack/react-router'
import { FELDashboard } from '@/features/fel'

export const Route = createFileRoute('/_authenticated/fel/')({
  component: FELDashboard
})

