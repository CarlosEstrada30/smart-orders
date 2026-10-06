# SmartOrders — Frontend

Aplicación web de SmartOrders: pedidos, clientes, rutas, productos, inventario, pagos y facturación FEL para distribuidoras en Guatemala.

## Stack
React 19, TypeScript, Vite, TanStack Router, React Query, Zustand, Shadcn UI y TailwindCSS v4.

## Desarrollo
```bash
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8000/api/v1
pnpm install
pnpm dev               # http://localhost:5173
```

| Comando | Uso |
|---|---|
| `pnpm build` | Build de producción en `dist/` |
| `pnpm build:check` | Verificación de tipos + build |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (una corrida) |
| `pnpm knip` | Exports y archivos sin usar |

## Estructura
- `src/routes/` — rutas basadas en archivos (TanStack Router)
- `src/features/` — módulos por dominio (pedidos, inventario, FEL…)
- `src/components/` — componentes compartidos; `ui/` son los de Shadcn
- `src/services/` — clientes de la API
- `src/styles/theme.css` — tokens de diseño (colores, radios, fuentes)

## Despliegue
Netlify (`netlify.toml`) o Render (`render.yaml`).
