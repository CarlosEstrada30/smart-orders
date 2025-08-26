import { z } from 'zod'

const routeStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type RouteStatus = z.infer<typeof routeStatusSchema>

const routeSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
})
export type Route = z.infer<typeof routeSchema>

export const routeListSchema = z.array(routeSchema)
