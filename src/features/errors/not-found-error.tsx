import { ErrorPage } from './error-page'

export function NotFoundError() {
  return (
    <ErrorPage
      code='404'
      title='No encontramos esta página'
      description='La dirección no existe o la página se movió. Revisa el enlace o vuelve al inicio.'
    />
  )
}
