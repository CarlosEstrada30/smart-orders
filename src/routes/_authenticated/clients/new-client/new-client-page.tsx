import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { apiClient } from '@/services/api/client'

interface NewClientData {
  name: string
  email: string
  phone: string
  nit: string
  address: string
}

export function NewClientPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<NewClientData>({
    name: '',
    email: '',
    phone: '',
    nit: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof NewClientData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    // Validación de email (solo si se proporciona)
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Por favor ingresa un email válido')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await apiClient.post('/clients', formData)

      // Cliente creado exitosamente
      toast.success('Cliente creado exitosamente')
      navigate({ to: '/clients' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al crear el cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/clients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
              <p className="text-muted-foreground">
                Agrega un nuevo cliente a la base de datos
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
              <CardDescription>
                Completa los datos del nuevo cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nombre completo del cliente"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+50223456789"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nit">NIT</Label>
                  <Input
                    id="nit"
                    type="text"
                    placeholder="123456789-0"
                    value={formData.nit}
                    onChange={(e) => handleInputChange('nit', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Textarea
                    id="address"
                    placeholder="Dirección completa del cliente"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensaje de Error */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4">
            <Link to="/clients">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Main>
  )
} 