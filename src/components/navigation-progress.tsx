import { useEffect, useRef } from 'react'
import { useRouterState } from '@tanstack/react-router'
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar'
import { useDOMCleanup } from '@/hooks/use-dom-cleanup'

export function NavigationProgress() {
  const ref = useRef<LoadingBarRef>(null)
  const state = useRouterState()
  const { addCleanup } = useDOMCleanup()

  useEffect(() => {
    if (state.status === 'pending') {
      ref.current?.continuousStart()
    } else {
      ref.current?.complete()
    }
  }, [state.status])

  // Add cleanup for the loading bar
  useEffect(() => {
    addCleanup(() => {
      try {
        ref.current?.complete()
      } catch (error) {
        console.warn('NavigationProgress cleanup failed:', error)
      }
    })
  }, [addCleanup])

  return (
    <LoadingBar
      color='var(--muted-foreground)'
      ref={ref}
      shadow={true}
      height={2}
    />
  )
}
