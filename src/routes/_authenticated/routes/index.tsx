import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Routes } from '@/features/routes'

const routesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
      ])
    )
    .optional()
    .catch([]),
  // Per-column text filter (example for name)
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/routes/')({
  validateSearch: routesSearchSchema,
  component: Routes,
})
