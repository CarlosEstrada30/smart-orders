import { createFileRoute } from '@tanstack/react-router'
import { NewClientPage } from './new-client-page'

export const Route = createFileRoute('/_authenticated/new-client')({
  component: NewClientPage,
}) 