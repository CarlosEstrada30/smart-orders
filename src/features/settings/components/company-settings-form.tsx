import React, { useState, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { Building2, Upload, X, Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SettingsService } from '@/services'
import type { CompanySettings, SettingsFormData } from '@/services'
import { useAuthStore } from '@/stores/auth-store'

const formSchema = z.object({
  company_name: z.string().min(1, 'El nombre de la empresa es requerido'),
  business_name: z.string().min(1, 'La razón social es requerida'),
  nit: z.string().min(1, 'El NIT es requerido'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  logo: z.instanceof(File).optional(),
})

type FormData = z.infer<typeof formSchema>

export function CompanySettingsForm() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { setCompanySettings } = useAuthStore(state => state.auth)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: '',
      business_name: '',
      nit: '',
      address: '',
      phone: '',
      email: '',
      website: '',
    },
  })

  const { data: settings, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: SettingsService.getCompanySettings,
  })

  // Handle data loading
  React.useEffect(() => {
    if (settings) {
      form.reset({
        company_name: settings.company_name,
        business_name: settings.business_name,
        nit: settings.nit,
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        website: settings.website || '',
      })
      // Set logo preview if exists
      if (settings.logo_url) {
        setLogoPreview(settings.logo_url)
      }
    }
  }, [settings, form])

  const saveSettingsMutation = useMutation({
    mutationFn: (data: SettingsFormData) => SettingsService.saveCompanySettings(data),
    onSuccess: (data) => {
      toast.success('Configuración guardada exitosamente')
      
      // Actualizar el store inmediatamente para reflejar cambios en el sidebar
      setCompanySettings(data)
      
      // Invalidar cache para asegurar consistencia
      queryClient.invalidateQueries({ queryKey: ['company-settings'] })
    },
    onError: (error: any) => {
      console.error('Error saving settings:', error)
      
      let errorMessage = 'Error al guardar la configuración'
      
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    },
  })

  const handleFileSelect = useCallback((file: File) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo debe ser menor a 5MB')
        return
      }

      form.setValue('logo', file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [form])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const removeLogo = useCallback(() => {
    form.setValue('logo', undefined)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [form])

  const onSubmit = (data: FormData) => {
    const formData: SettingsFormData = {
      ...data,
      // Clean up empty strings
      address: data.address || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      website: data.website || undefined,
    }

    saveSettingsMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Información de la Empresa
        </CardTitle>
        <CardDescription>
          Configura los datos principales de tu empresa que aparecerán en facturas y documentos oficiales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload Section */}
            <div className="space-y-4">
              <FormLabel>Logo de la Empresa</FormLabel>
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={logoPreview || ''} alt="Logo de la empresa" />
                  <AvatarFallback>
                    <Building2 className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra una imagen aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WebP hasta 5MB
                    </p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  {logoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeLogo}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remover Logo
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mi Empresa S.A." {...field} />
                    </FormControl>
                    <FormDescription>
                      Nombre comercial de la empresa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mi Empresa, Sociedad Anónima" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nombre legal registrado de la empresa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIT *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 123456789-0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número de Identificación Tributaria
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: 1ra Avenida 10-20, Zona 1, Ciudad de Guatemala"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Dirección física de la empresa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: +502 2345-6789" {...field} />
                      </FormControl>
                      <FormDescription>
                        Número de teléfono principal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: contacto@miempresa.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Correo electrónico de contacto
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio Web</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: https://www.miempresa.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL del sitio web de la empresa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={saveSettingsMutation.isPending}
                className="min-w-[140px]"
              >
                {saveSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
