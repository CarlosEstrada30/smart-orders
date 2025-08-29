import { createFileRoute } from '@tanstack/react-router'
import { InventoryDetailPage } from './inventory-detail-page'

export const Route = createFileRoute('/_authenticated/inventory-detail/$entryId')({
  component: InventoryDetailPage,
})