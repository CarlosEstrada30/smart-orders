import { ErrorPage } from './error-page'

export function UnauthorisedError() {
  return (
    <ErrorPage
      code='401'
      title='Tu sesión no es válida'
      description='Inicia sesión de nuevo para continuar.'
    />
  )
}
