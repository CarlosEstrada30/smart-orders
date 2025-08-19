import { createFileRoute } from '@tanstack/react-router'
import { UsersPage } from './users-page'

export const Route = createFileRoute('/_authenticated/users')({
  component: UsersPage,
}) 