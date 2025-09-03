import { z } from 'zod'

// Usando active boolean en lugar de status string
export type CompanyStatus = 'active' | 'inactive'

const companySchema = z.object({
  id: z.string(),
  nombre: z.string(),
  subdominio: z.string(),
  token: z.string(),
  schema_name: z.string(),
  created_at: z.string(),
  // Nuevos campos del backend
  active: z.boolean(),
  is_trial: z.boolean(),
  // Campos calculados para UI
  status: z.string().optional(), // calculado a partir de active
  url: z.string().optional(), // URL completa construida
})

export type Company = z.infer<typeof companySchema>

export const companyListSchema = z.array(companySchema)

// Schema para formularios
export const companyCreateSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no debe exceder 100 caracteres'),
  subdominio: z.string()
    .min(3, 'El subdominio debe tener al menos 3 caracteres')
    .max(50, 'El subdominio no debe exceder 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El subdominio solo puede contener letras minúsculas, números y guiones')
    .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'El subdominio no puede empezar o terminar con guión'),
  is_trial: z.boolean().optional().default(false)
})

export type CompanyCreateForm = z.infer<typeof companyCreateSchema>

export const companyUpdateSchema = companyCreateSchema.partial()
export type CompanyUpdateForm = z.infer<typeof companyUpdateSchema>
