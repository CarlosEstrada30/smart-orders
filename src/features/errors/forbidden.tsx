import { ErrorPage } from './error-page'

export function ForbiddenError() {
  return (
    <ErrorPage
      code='403'
      title='No tienes acceso a esta sección'
      description='Tu rol no incluye este permiso. Si lo necesitas, pídeselo al administrador de tu empresa.'
    />
  )
}
