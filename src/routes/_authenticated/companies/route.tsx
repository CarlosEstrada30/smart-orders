import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { hasSubdomain } from '@/utils/subdomain'

const companiesSearchSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
  limit: z.coerce.number().min(1).max(100).catch(20),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

export const Route = createFileRoute('/_authenticated/companies')({
  validateSearch: companiesSearchSchema,
  beforeLoad: ({ context }) => {
    // Verificar que no estemos en un subdominio
    if (hasSubdomain()) {
      throw new Error('El módulo de empresas solo está disponible en el dominio principal')
    }

    // Verificar permisos de superusuario
    // TODO: Implementar verificación de permisos cuando esté disponible el context
    // if (!context.permissions?.is_superuser) {
    //   throw new Error('Acceso denegado. Se requieren permisos de superusuario')
    // }
  },
})