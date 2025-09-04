import * as React from 'react'
import { ChevronsUpDown, Plus, Building2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

type TeamSwitcherProps = {
  teams: {
    name: string
    logo: React.ElementType | string
    plan: string
  }[]
  isLoading?: boolean
}

export function TeamSwitcher({ teams, isLoading = false }: TeamSwitcherProps) {
  const { isMobile } = useSidebar()
  
  // Usar directamente teams[0] en lugar de estado interno para mejor reactivity
  const activeTeam = teams[0]

  // Show loading skeleton if loading or no teams
  if (isLoading || !activeTeam) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden'>
                {typeof activeTeam.logo === 'string' ? (
                  activeTeam.logo === 'Building2' ? (
                    <Building2 className='size-4' />
                  ) : (
                    <>
                      <img 
                        src={activeTeam.logo} 
                        alt={`${activeTeam.name} logo`}
                        className='size-full object-cover'
                        onError={(e) => {
                          // Fallback to Building2 icon if image fails to load
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      {/* Fallback icon hidden by default, shown if image fails */}
                      <Building2 className='size-4 hidden' />
                    </>
                  )
                ) : (
                  <activeTeam.logo className='size-4' />
                )}
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activeTeam.name}
                </span>
                <span className='truncate text-xs'>{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border overflow-hidden'>
                  {typeof team.logo === 'string' ? (
                    team.logo === 'Building2' ? (
                      <Building2 className='size-4 shrink-0' />
                    ) : (
                      <img 
                        src={team.logo} 
                        alt={`${team.name} logo`}
                        className='size-full object-cover'
                      />
                    )
                  ) : (
                    <team.logo className='size-4 shrink-0' />
                  )}
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className='gap-2 p-2'>
              <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                <Plus className='size-4' />
              </div>
              <div className='text-muted-foreground font-medium'>Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
