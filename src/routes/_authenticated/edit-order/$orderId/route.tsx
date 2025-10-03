import { createFileRoute } from '@tanstack/react-router'
import { EditOrderPage } from './edit-order-page'

export const Route = createFileRoute('/_authenticated/edit-order/$orderId')({
  component: EditOrderPage,
})

