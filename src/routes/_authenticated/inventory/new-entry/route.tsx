import { createFileRoute } from '@tanstack/react-router'
import { NewInventoryEntryPage } from '@/features/inventory/new-entry'

export const Route = createFileRoute('/_authenticated/inventory/new-entry')({
  component: NewInventoryEntryPage,
})