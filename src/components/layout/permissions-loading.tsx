import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Componente de loading que se muestra mientras cargan los permisos del usuario
 */
export function PermissionsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <h2 className="text-lg font-semibold">Cargando permisos...</h2>
          <p className="text-muted-foreground text-sm">
            Configurando tu experiencia personalizada
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Componente de loading más compacto para usar dentro de layouts
 */
export function PermissionsLoadingCompact() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Cargando permisos</p>
          <p className="text-xs text-muted-foreground">Un momento por favor...</p>
        </div>
      </div>
    </div>
  )
}

