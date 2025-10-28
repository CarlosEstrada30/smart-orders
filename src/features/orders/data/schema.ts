import { z } from 'zod'

// Esquemas basados en los tipos del servicio
export const orderItemSchema = z.object({
  id: z.number().optional(),
  product_id: z.number(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number().optional(),
  product_name: z.string().optional(),
  product_sku: z.string().optional(),
  product_description: z.string().optional(),
})

export const clientSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  nit: z.string().nullable(),
  address: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
})

export const routeSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
})

export const orderSchema = z.object({
  id: z.number().optional(),
  order_number: z.string().optional(),
  client_id: z.number(),
  route_id: z.number().nullable().optional(),
  status: z.enum(['pending', 'confirmed', 'in_progress', 'shipped', 'delivered', 'cancelled']),
  discount_amount: z.number().min(0).optional(),
  notes: z.string().optional(),
  total_amount: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  items: z.array(orderItemSchema),
  client: clientSchema.optional(),
  route: routeSchema.optional(),
})

export type Order = z.infer<typeof orderSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type Client = z.infer<typeof clientSchema>
export type Route = z.infer<typeof routeSchema>
export type OrderStatus = Order['status']

