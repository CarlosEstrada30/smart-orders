import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { BrandMark } from '@/assets/brand-mark'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

type TeamSwitcherProps = {
  teams: {
    name: string
    logo: React.ElementType | string
    plan: string
  }[]
  isLoading?: boolean
}

/** Bloque de marca del sidebar: logo de la empresa (o la marca) y su nombre */
export function TeamSwitcher({ teams, isLoading = false }: TeamSwitcherProps) {
  const activeTeam = teams[0]
  const [logoFailed, setLogoFailed] = React.useState(false)
  const logoUrl =
    typeof activeTeam?.logo === 'string' && activeTeam.logo !== 'Building2'
      ? activeTeam.logo
      : null

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <Skeleton className='bg-sidebar-accent size-8 rounded-lg' />
            <div className='grid flex-1 gap-1'>
              <Skeleton className='bg-sidebar-accent h-4 w-24' />
              <Skeleton className='bg-sidebar-accent h-3 w-16' />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' asChild className='hover:bg-transparent'>
          <Link to='/'>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg'>
              {logoUrl && !logoFailed ? (
                <img
                  src={logoUrl}
                  alt=''
                  className='bg-card size-full object-contain'
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <BrandMark className='size-5' />
              )}
            </div>
            <div className='grid flex-1 text-start leading-tight'>
              <span className='truncate text-sm font-semibold'>
                {activeTeam?.name ?? 'SmartOrders'}
              </span>
              <span className='text-sidebar-foreground/70 truncate text-xs'>
                SmartOrders
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
