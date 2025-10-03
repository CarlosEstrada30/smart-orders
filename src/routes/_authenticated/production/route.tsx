import { createFileRoute } from '@tanstack/react-router'
import { ProductionPage } from './index'

export const Route = createFileRoute('/_authenticated/production')({
  component: ProductionPage,
})


