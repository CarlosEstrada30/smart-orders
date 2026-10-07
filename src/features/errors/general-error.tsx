import { ErrorPage } from './error-page'

type GeneralErrorProps = {
  minimal?: boolean
  className?: string
}

export function GeneralError({
  minimal = false,
  className,
}: GeneralErrorProps) {
  return (
    <ErrorPage
      code='500'
      title='Algo falló al cargar esta página'
      description='Intenta de nuevo en unos momentos. Si el problema sigue, avisa al administrador.'
      minimal={minimal}
      className={className}
    />
  )
}
