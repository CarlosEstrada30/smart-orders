/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Usar globals para tener describe, it, expect disponibles sin import
    globals: true,
    // Usar jsdom para simular DOM del navegador
    environment: 'jsdom',
    // Archivo de setup que se ejecuta antes de cada test
    setupFiles: ['./src/test/setup.ts'],
    // Incluir archivos de test
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    // Excluir archivos que no son tests
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache',
      '**/build/**',
      '**/coverage/**'
    ],
    // Configuración de coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.{js,ts,jsx,tsx}'
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{js,ts,jsx,tsx}',
        'src/**/*.spec.{js,ts,jsx,tsx}',
        'src/**/__tests__/**',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/routeTree.gen.ts'
      ],
      // Umbrales de coverage
      thresholds: {
        global: {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50
        }
      }
    },
    // Configuración para watch mode
    watch: false,
    // Timeout para tests lentos
    testTimeout: 10000,
    // Pool de workers para paralelización
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    },
    // Configuración de reporters
    reporter: ['verbose'],
    // Logging
    logHeapUsage: true,
    // Configuración de mock
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
  resolve: {
    // Usar los mismos alias que vite.config.ts
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Variables de entorno para testing
  define: {
    'import.meta.vitest': undefined,
  }
})
