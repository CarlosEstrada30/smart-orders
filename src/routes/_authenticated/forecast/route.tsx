import { createFileRoute } from '@tanstack/react-router'
import { ForecastPage } from '@/features/forecast'

export const Route = createFileRoute('/_authenticated/forecast')({
  component: ForecastPage,
})
