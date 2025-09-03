import { useCompaniesPermissions } from '@/hooks/use-companies-permissions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Building, Shield } from 'lucide-react'

interface CompaniesPermissionGuardProps {
  children: React.ReactNode
  showAlert?: boolean
}

export function CompaniesPermissionGuard({ 
  children, 
  showAlert = true 
}: CompaniesPermissionGuardProps) {
  const { 
    canAccessCompanies, 
    denialReasons,
    isMainDomain,
    isSuperuser 
  } = useCompaniesPermissions()

  if (canAccessCompanies) {
    return <>{children}</>
  }

  if (!showAlert) {
    return null
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Acceso Restringido</AlertTitle>
        <AlertDescription>
          No tienes permisos para acceder al módulo de gestión de empresas.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Alert variant={isMainDomain ? "default" : "destructive"}>
          <Building className="h-4 w-4" />
          <AlertTitle>Dominio Principal</AlertTitle>
          <AlertDescription>
            {isMainDomain 
              ? "✓ Estás en el dominio principal" 
              : "✗ Debes acceder desde el dominio principal (sin subdominio)"
            }
          </AlertDescription>
        </Alert>

        <Alert variant={isSuperuser ? "default" : "destructive"}>
          <Shield className="h-4 w-4" />
          <AlertTitle>Permisos de Superusuario</AlertTitle>
          <AlertDescription>
            {isSuperuser 
              ? "✓ Tienes permisos de superusuario" 
              : "✗ Se requieren permisos de superusuario (rol Admin)"
            }
          </AlertDescription>
        </Alert>
      </div>

      <Alert>
        <AlertDescription>
          El módulo de gestión de empresas permite crear, editar y eliminar empresas 
          en el sistema multitenant. Solo está disponible para superusuarios desde 
          el dominio principal.
        </AlertDescription>
      </Alert>
    </div>
  )
}
