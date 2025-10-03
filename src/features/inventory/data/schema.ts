import { z } from 'zod'

// Esquemas basados en los tipos del servicio de inventario
export const entryTypeSchema = z.enum(['production', 'return', 'adjustment', 'initial'])
export const entryStatusSchema = z.enum(['draft', 'pending', 'approved', 'completed', 'cancelled'])

export const inventoryEntryItemSchema = z.object({
  id: z.number().optional(),
  entry_id: z.number().optional(),
  product_id: z.number(),
  quantity: z.number().positive(),
  unit_cost: z.number().min(0).optional(),
  batch_number: z.string().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  total_cost: z.number().optional(),
  product_name: z.string().nullable().optional(),
  product_sku: z.string().nullable().optional(),
  product_description: z.string().nullable().optional(),
})

export const inventoryEntrySchema = z.object({
  id: z.number().optional(),
  entry_number: z.string().optional(),
  entry_type: entryTypeSchema,
  status: entryStatusSchema.optional(),
  user_id: z.number().optional(),
  supplier_info: z.string().nullable().optional(),
  expected_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  reference_document: z.string().nullable().optional(),
  total_cost: z.number().optional(),
  entry_date: z.string().optional(),
  completed_date: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().nullable().optional(),
  items: z.array(inventoryEntryItemSchema),
  user_name: z.string().nullable().optional(),
})

export const inventoryEntryListSchema = z.object({
  id: z.number(),
  entry_number: z.string(),
  entry_type: entryTypeSchema,
  status: entryStatusSchema,
  total_cost: z.number(),
  entry_date: z.string(),
  completed_date: z.string().nullable().optional(),
  user_name: z.string().nullable().optional(),
  items_count: z.number(),
  supplier_info: z.string().nullable().optional(),
})

export const stockAdjustmentSchema = z.object({
  product_id: z.number(),
  quantity: z.number(),
  reason: z.string().min(1),
  notes: z.string().nullable().optional(),
})

export const inventoryEntrySummarySchema = z.object({
  total_entries: z.number(),
  total_cost: z.number(),
  entries_by_type: z.record(z.number()),
  entries_by_status: z.record(z.number()),
  pending_entries: z.number(),
  completed_today: z.number(),
})

export type InventoryEntry = z.infer<typeof inventoryEntrySchema>
export type InventoryEntryItem = z.infer<typeof inventoryEntryItemSchema>
export type InventoryEntryList = z.infer<typeof inventoryEntryListSchema>
export type StockAdjustment = z.infer<typeof stockAdjustmentSchema>
export type InventoryEntrySummary = z.infer<typeof inventoryEntrySummarySchema>
export type EntryType = z.infer<typeof entryTypeSchema>
export type EntryStatus = z.infer<typeof entryStatusSchema>

