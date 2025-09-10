import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { type CompanyCreateForm, companyCreateSchema } from '../data/schema'
import { companiesService } from '@/services/companies'

interface CompanyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  mode: 'create' | 'edit'
  initialData?: CompanyCreateForm
}

export function CompanyForm({ 
  open, 
  onOpenChange, 
  onSuccess, 
  mode, 
  initialData 
}: CompanyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<CompanyCreateForm>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      subdominio: initialData?.subdominio || '',
      is_trial: initialData?.is_trial || false,
    },
  })

  const onSubmit = async (data: CompanyCreateForm) => {
    try {
      setIsSubmitting(true)
      
      // Validar disponibilidad del subdominio
      const { available } = await companiesService.checkSubdomainAvailability(data.subdominio)
      if (!available && mode === 'create') {
        form.setError('subdominio', { 
          message: 'Este subdominio ya está en uso' 
        })
        return
      }

      if (mode === 'create') {
        await companiesService.createCompany(data)
        toast.success('Empresa creada exitosamente')
      } else {
        // TODO: Implementar actualización cuando tengamos el ID
        toast.success('Empresa actualizada exitosamente')
      }
      
      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error al guardar empresa:', error)
      toast.error('Error al guardar la empresa. Por favor intente nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para normalizar el subdominio
  const normalizeSubdomain = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-') // Reemplazar caracteres inválidos con guiones
      .replace(/--+/g, '-') // Reemplazar múltiples guiones consecutivos
      .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nueva Empresa' : 'Editar Empresa'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Crea una nueva empresa con su propio subdominio y base de datos.'
              : 'Modifica los datos de la empresa seleccionada.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Empresa</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Smart Orders" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    El nombre completo de la empresa.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subdominio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdominio</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="smart-orders" 
                      {...field}
                      onChange={(e) => {
                        const normalized = normalizeSubdomain(e.target.value)
                        field.onChange(normalized)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    La empresa será accesible en: <br />
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {field.value || '[subdominio]'}.{window.location.hostname}
                    </code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_trial"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Empresa de Prueba
                    </FormLabel>
                    <FormDescription>
                      Las empresas de prueba tienen funcionalidades limitadas y se identifican con un badge especial.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear Empresa' : 'Actualizar')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
