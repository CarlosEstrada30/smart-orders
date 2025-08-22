import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailPage } from './order-detail-page'

export const Route = createFileRoute('/_authenticated/order-detail/$orderId')({
  component: OrderDetailPage,
}) 