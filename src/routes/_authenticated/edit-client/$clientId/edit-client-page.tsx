import { useState, useEffect } from 'react'
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
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

interface Client {
  id: number
  name: string
  email: string
  phone: string
  address: string
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export function EditClientPage() {
  const { clientId } = useParams({ from: '/_authenticated/edit-client/$clientId' })
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos del cliente
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`http://localhost:8000/api/v1/clients/${clientId}`)
        
        if (!response.ok) {
          throw new Error(`Error al obtener cliente: ${response.status}`)
        }
        
        const data = await response.json()
        setClient(data)
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast.error('Error al cargar el cliente')
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [clientId])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setError('Todos los campos son obligatorios')
      return
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`http://localhost:8000/api/v1/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Error al actualizar cliente: ${response.status}`)
      }

      // Cliente actualizado exitosamente
      toast.success('Cliente actualizado exitosamente')
      navigate({ to: '/clients' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al actualizar el cliente')
      toast.error('Error al actualizar el cliente')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Main>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/clients">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
                <p className="text-muted-foreground">
                  Modifica los datos del cliente
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cargando cliente...</CardTitle>
              <CardDescription>
                Obteniendo datos del cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Cargando...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    )
  }

  if (error || !client) {
    return (
      <Main>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/clients">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
                <p className="text-muted-foreground">
                  Modifica los datos del cliente
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Error al cargar cliente</CardTitle>
              <CardDescription>
                No se pudo obtener la información del cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Link to="/clients">
                    <Button>
                      Volver a Clientes
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    )
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
              <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
              <p className="text-muted-foreground">
                Modifica los datos del cliente: {client.name}
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
                Modifica los datos del cliente
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+34 123 456 789"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Textarea
                    id="address"
                    placeholder="Dirección completa del cliente"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    required
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
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Main>
  )
} 