import { type SVGProps } from 'react'

/** Marca de SmartOrders: una ruta en S con parada de salida y de entrega */
export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.25}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <path d='M17 6.5H9.5a3.25 3.25 0 0 0 0 6.5h5a3.25 3.25 0 0 1 0 6.5H7' />
      <circle cx='19' cy='6.5' r='2' fill='currentColor' stroke='none' />
      <circle cx='5' cy='19.5' r='2' fill='currentColor' stroke='none' />
    </svg>
  )
}
