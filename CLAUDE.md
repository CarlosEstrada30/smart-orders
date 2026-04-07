# SmartOrders Frontend

React 19 SPA — Vite, TanStack Router, Zustand, React Query, Shadcn UI, TailwindCSS v4.

## Stack
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| TypeScript | ~5.9 | Type safety |
| Vite | 7 | Build tool (SWC compiler) |
| TanStack Router | v1 | File-based routing, type-safe |
| TanStack Query | v5 | Server state (React Query) |
| Zustand | v5 | Global client state |
| Shadcn UI + Radix | latest | Component primitives |
| TailwindCSS | v4 | Styling (CSS-first, no config file) |
| react-hook-form | latest | Forms |
| zod | v4 | Schema validation |
| @tanstack/react-table | v8 | Data tables |
| Vitest + Testing Library | latest | Tests |
| Sonner | latest | Toast notifications |
| Lucide React | latest | Icons |

## Absolute Rules
- `src/routeTree.gen.ts` is **AUTO-GENERATED** — never edit it manually.
- Always use the `@` alias (`= src/`). No relative `../../` imports across features.
- TailwindCSS v4: no `tailwind.config.js`. Theme goes in CSS `@theme {}`.
- Never modify generated Shadcn UI files in `src/components/ui/`. Add wrappers.
- Use `cn()` from `@/lib/utils` for conditional className merging.

## Source Layout
```
src/
├── assets/          # Static assets (images, fonts)
├── components/
│   ├── ui/          # Shadcn UI components (generated — do not modify directly)
│   └── layout/      # App shell: AuthenticatedLayout, AppSidebar, Header
├── config/
│   ├── environment.ts   # All VITE_* env vars → use ENV.* (never import.meta.env directly)
│   └── api-config.ts    # API_ENDPOINTS map
├── context/         # React context providers
├── features/        # Feature-sliced modules (see below)
├── hooks/           # Shared hooks (use-permissions, use-token-expiration, etc.)
├── lib/             # utils.ts (cn()), cookies.ts
├── routes/
│   ├── __root.tsx               # Root route + QueryClient provider
│   ├── (auth)/                  # Auth pages (sign-in, sign-up, etc.)
│   └── _authenticated/
│       ├── route.tsx            # Auth guard via beforeLoad
│       └── {page}/index.tsx     # One file per protected page
├── routeTree.gen.ts # AUTO-GENERATED — do not edit
├── services/
│   ├── api/
│   │   ├── client.ts   # Singleton ApiClient
│   │   └── config.ts   # Re-exports (legacy compat)
│   └── {resource}/     # Per-resource service modules
├── stores/
│   └── auth-store.ts   # useAuthStore — token, user, permissions, companySettings
├── styles/          # Global CSS (TailwindCSS v4 @import, @theme)
├── test/            # Vitest setup
└── utils/           # Pure utility functions
```

## Feature Structure (feature-folder pattern)
```
src/features/{feature}/
├── components/      # Components used only within this feature
├── data/
│   └── schema.ts    # Zod schemas + inferred TypeScript types
└── index.tsx        # Page component (default export) + barrel re-exports
```

## Routing Rules
- Protected pages live at `src/routes/_authenticated/{page}/index.tsx`.
- Auth guard in `src/routes/_authenticated/route.tsx` via `beforeLoad` — redirects to `/sign-in` if no token.
- The Vite TanStack Router plugin auto-updates `routeTree.gen.ts` on every save.
- Files matching `.*(-page|.page|.component).tsx?$` in the routes dir are NOT turned into routes.

## State Management
| Concern | Tool |
|---------|------|
| Server data (API) | React Query — `useQuery`, `useMutation` |
| Auth / permissions | Zustand `useAuthStore` |
| Component-local | `useState` / `useReducer` |

**Never** put server data into Zustand.

## Authentication Flow
1. `POST /api/v1/auth/login` → JWT
2. JWT stored in cookie `smart_orders_auth_token` and Zustand `auth.accessToken`
3. `ApiClient.getHeaders()` reads token from Zustand for every request
4. Auth guard checks token in `beforeLoad`, redirects if expired
5. `useTokenExpiration` hook runs globally in `AuthenticatedLayout`

## API Client Usage
```typescript
import { apiClient } from '@/services/api/client'

// Direct (for new resource services):
const data = await apiClient.get<MyType>('/my-resource/', queryParams)
const result = await apiClient.post<MyType>('/my-resource/', body)

// Via resource service (preferred):
import { ordersService } from '@/services/orders'
const { data } = useQuery({
  queryKey: ['orders', params],
  queryFn: () => ordersService.getOrders(params),
})
```

## Form Pattern
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({ name: z.string().min(1, 'Requerido') })
type FormValues = z.infer<typeof schema>

const form = useForm<FormValues>({ resolver: zodResolver(schema) })
```
Wrap fields with Shadcn `<Form>`, `<FormField>`, `<FormItem>`, `<FormControl>`, `<FormMessage>`.

## Permissions
```typescript
import { useOrderPermissions } from '@/hooks/use-permissions'
const { canCreate, canView, canEdit } = useOrderPermissions()
{canCreate && <Button>Nueva Orden</Button>}
```

## Data Table
Reference: `src/features/orders/components/orders-table.tsx`
- Column definitions: `ColumnDef<T>[]` in a separate `-columns.tsx` file
- Toolbar with search, faceted filters, column visibility
- Pagination state managed by TanStack Table

## Development Commands
```bash
pnpm dev          # Dev server → http://localhost:5173
pnpm build        # Production build → dist/
pnpm lint         # ESLint
pnpm test         # Vitest single run
pnpm test:watch   # Watch mode
pnpm knip         # Detect unused exports
```

## Key Files
- [src/config/environment.ts](src/config/environment.ts) — env vars
- [src/config/api-config.ts](src/config/api-config.ts) — API endpoints map
- [src/services/api/client.ts](src/services/api/client.ts) — HTTP client
- [src/stores/auth-store.ts](src/stores/auth-store.ts) — auth global state
- [src/routes/_authenticated/route.tsx](src/routes/_authenticated/route.tsx) — auth guard
- [src/components/layout/authenticated-layout.tsx](src/components/layout/authenticated-layout.tsx) — app shell
