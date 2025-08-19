import { createFileRoute } from '@tanstack/react-router'
import { ProductsPage } from './products-page'

export const Route = createFileRoute('/_authenticated/products')({
  component: ProductsPage,
}) 