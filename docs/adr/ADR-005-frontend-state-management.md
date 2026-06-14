# ADR-005: Frontend State Management — TanStack Query + Zustand

**Status:** Accepted  
**Date:** 2026-06-14  
**Deciders:** Project author

---

## Context

The InboxGuard React frontend has two distinct categories of state:

**Server state** — data that lives on the backend and must be fetched, cached, and
kept in sync:

- Sender rules list (fetched on mount, updated after CRUD operations)
- Cleanup run history (fetched on mount, polled during an active run)
- Current run status (polled until COMPLETED or FAILED)

**Client state** — UI-only state that does not need to survive a page refresh:

- Dry-run vs. live mode toggle
- Modal open/closed state
- Sidebar collapsed state

### Alternatives considered

| Option                              | Summary                                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Redux Toolkit (RTK) + RTK Query** | Centralized store, time-travel debugging, very explicit. Standard for large apps.                                          |
| **TanStack Query + Zustand**        | TanStack for server state, Zustand for client state. Composable, low boilerplate.                                          |
| **React Context + useState**        | Zero dependencies. Fine for tiny apps; cache/refetch logic becomes manual work.                                            |
| **SWR + Zustand**                   | SWR is a simpler alternative to TanStack Query. Less feature-rich (no mutation helpers, less flexible cache invalidation). |

---

## Decision

**Use TanStack Query v5 for server state and Zustand v4 for client state.**

This split-concern approach has become the de facto modern React recommendation in
2025–2026. It avoids the primary failure modes of both extremes:

- Unlike Redux, it does not require manually writing loading/error/data states for
  every API call.
- Unlike React Context alone, it provides transparent caching, background refetch,
  and cache invalidation without custom implementation.

### TanStack Query — server state

All API calls go through custom hooks wrapping `useQuery` and `useMutation`:

```
frontend/src/api/
├── senderRules.ts   # useGetSenderRules(), useCreateSenderRule(), useDeleteSenderRule()
├── cleanupRuns.ts   # useTriggerCleanup(), useGetRunHistory(), useGetRunStatus()
└── client.ts        # Axios instance with base URL from VITE_API_URL env var
```

Key configuration:

- `staleTime: 30_000` on sender rules (low churn data; no need to refetch on every
  focus event)
- `refetchInterval: 2000` on active run status query (polls until run reaches
  terminal state, then invalidates `cleanupRuns` cache)
- `onSuccess` / `onSettled` callbacks on mutations call `queryClient.invalidateQueries`
  to keep the list views fresh after edits

### Zustand — client state

A single small store handles UI toggles:

```typescript
// src/store/uiStore.ts
interface UIStore {
  runMode: "DRY_RUN" | "LIVE";
  setRunMode: (mode: "DRY_RUN" | "LIVE") => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}
```

This is intentionally minimal. Any state that belongs to a single component stays
in `useState` — Zustand is not a dumping ground for all component state.

### Why not Redux Toolkit?

Redux Toolkit is the right choice for large apps with complex interdependent state,
time-travel debugging requirements, or teams needing strict unidirectional data flow
discipline. For InboxGuard (a single-user admin tool with a handful of API endpoints),
RTK's boilerplate (slices, reducers, actions, selectors) is disproportionate to the
problem. A senior reviewer will recognize that choosing the appropriate tool for the
scope is itself a demonstration of judgment.

### Why not React Context?

Context re-renders all consumers when any value changes. For server state that is
updated frequently (active run polling), this creates unnecessary re-renders across
the component tree. TanStack Query's per-query subscription model is more precise.

### TypeScript integration

- All API response shapes are typed via interfaces in `src/types/api.ts`
- TanStack Query's generic parameters (`useQuery<SenderRule[]>`) propagate types
  through to component props without casting
- Zustand store interface is declared explicitly — no `any`

---

## Consequences

**Positive:**

- Loading, error, and cached-data states are handled by TanStack Query automatically;
  components consume clean `{ data, isLoading, error }` destructuring.
- Background refetch keeps the run history table current without manual polling logic
  in components.
- Zustand's hook API (`useUIStore(state => state.runMode)`) selects only the slice of
  state a component needs, avoiding unnecessary re-renders.
- Low dependency footprint: two small libraries with no peer dependency conflicts.

**Negative:**

- Two state management tools to understand vs. one. Mitigated by clear separation:
  "if it comes from the server, use TanStack; if it's UI-only, use Zustand."
- No Redux DevTools time-travel. For this app's complexity, browser React DevTools
  and TanStack Query Devtools (enabled in development) are sufficient.

---

## Performance & Operational Impact

- **Bundle size:** TanStack Query v5: ~13 KB gzipped. Zustand v4: ~1 KB gzipped.
  Combined impact on initial load is negligible.
- **Re-render efficiency:** TanStack Query's component-level subscriptions and
  Zustand's selector-based subscriptions both minimize re-renders to components that
  actually consume changed state.
- **Polling overhead:** The active run status query polls at 2-second intervals only
  while a run is in progress (controlled by `enabled: !!activeRunId`). The query is
  disabled when no run is active, producing zero network requests at idle.
- **Cache TTL:** Sender rules cached for 30 seconds by default. An explicit
  `invalidateQueries` after mutations ensures the list is always fresh after user
  actions, without unnecessary refetches on window focus events.
