import { createFileRoute } from '@tanstack/react-router'
import { EditClientPage } from './edit-client-page'

export const Route = createFileRoute('/_authenticated/clients/edit-client/$clientId')({
  component: EditClientPage,
}) 