import { ErrorPage } from './error-page'

export function MaintenanceError() {
  return (
    <ErrorPage
      code='503'
      title='SmartOrders está en mantenimiento'
      description='El servicio vuelve en unos minutos. Tus datos no se ven afectados.'
      showActions={false}
    />
  )
}
