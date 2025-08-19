import { createFileRoute } from '@tanstack/react-router'
import { NewOrderPage } from './new-order-page'

export const Route = createFileRoute('/_authenticated/new-order')({
  component: NewOrderPage,
}) 