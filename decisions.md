# Khue's Restaurant – Decisions & Architecture Digest

This document captures the current mental model for the project so future sessions can ramp back up quickly.

## Project Orientation

- **Stack**: Next.js (Pages Router) + tRPC (React Query client) + Prisma + Clerk auth + Tailwind + Zustand stores.
- **Aliases & Paths**: `~/` resolves to `src/`; prefer it over long relative paths to keep imports uniform.
- **App Shell**: `src/pages/_app.tsx` wraps every route with Clerk providers, `GeneralLayout`, and `api.withTRPC`. The `/dashboard` page purposely renders outside `GeneralLayout` and must bootstrap the hooks it still depends on.

## Routing & Entry Points

- **Pages Router**: All public routes live in `src/pages`. Convention: marketing/customer pages run through `GeneralLayout`, admin experiences (dashboard) are standalone.
- **Proxy Guard**: `src/proxy.ts` enforces auth. `/profile` requires a signed-in user; `/dashboard` additionally revalidates `privateMetadata.role === "admin"`. Update this proxy when adding sensitive routes.
- **API Routes**: tRPC routers live under `src/server/api/routers` (registered in `api/root.ts`). REST-like handlers live under `src/pages/api` for Stripe webhooks, cron jobs, etc.

## Client Data & State Flow

- **Global Store (`useMainStore`)**:
  - `orderDetails` mirrors `orderDetailsSchema` (datetime, items, tip, utensils, discount, optional reward, gift cards). `Item` entries carry DB IDs, mutation-ready customization maps, reward flags, and monotonic local `id`s for optimistic UI maps.
  - `prevOrderDetails` powers undo toasts; always snapshot before destructive edits so "undo" can revert.
  - Cart/UI flags (validation booleans, drawer state, viewport label, footer visibility, etc.) gate downstream hooks—only touch them via their setters or effects (toasts, sockets, watchers) will miss transitions.
- **Cart Persistence & Sync**:
  - `useUpdateOrder` is the single mutation surface. It merges duplicate items (same base item/customizations/reward flags) before committing, writes to the store, then either debounces a Clerk `user.currentOrder` update (signed-in) or writes to `localStorage` (guest). While `validatingCart` is true, payloads queue until the server pass finishes to avoid racing with corrections.
  - `useInitLocalStorage` loads the source of truth (Clerk user record if authenticated, otherwise `localStorage`), validates via `orderDetailsSchema`, then calls `api.validateOrder.validate`. It also respects the `khue's-resetOrderDetails` flag after success screens.
  - `useKeepOrderDetailsValidated` listens for window focus and re-runs `validateOrder` whenever the cart was previously confirmed. It toggles `setValidatingCart(true)` so `useUpdateOrder` pauses writes during the round-trip.
- **Initialization Hooks in `GeneralLayout`**:
  - `useInitializeStoreDBQueries` issues `storeDBQueries.getAll` so menus, customization metadata, rewards, hours, and holidays prefill the store.
  - `useViewportLabelResizeListener`, `useForceScrollToTopOnAsyncComponents`, and `useInitLocalStorage` run automatically for marketing pages; layouts that bypass `GeneralLayout` must manually invoke the pieces they depend on.
- **Manual Bootstrapping**: Routes that skip `GeneralLayout` must hydrate store slices (cart, menu data, viewport label) and run order validation themselves—otherwise sockets, modals, and checkout screens will read stale state.

## Cart & Order Validation Lifecycle

- **Client-Side Guardrails**:
  - `orderDetailsSchema` (shared Zod schema) guards both hydration and server mutations. Keep it updated with any persistence change (e.g., new reward payloads or gift-card metadata).
  - UI flows mutate state only via `useUpdateOrder`; never touch `localStorage` or Clerk records directly because the hook coalesces items, debounces writes, and cooperates with validation state.
- **`api.validateOrder.validate` (tRPC) Core Checks**:
  - **Timing**: Forces `datetimeToPickup` into the future, on an open day, outside holidays, inside business hours, >= min pickup time, and not within 30 minutes of closing. When a slot is oversubscribed (based on `numberOfOrdersAllowedPerPickupTimeSlot` + live counts) it hunts for the next viable slot; weekend specials survive only on Fri/Sat pickups.
  - **Gift Cards**: Filters submitted codes to cards that exist, aren’t replaced, and have positive `Decimal` balances; invalid entries are dropped.
  - **Items**: Validates availability, category flags (`orderableOnline`, `active`), price parity with the DB, quantity > 0, and removes anything 86’d. Customization IDs are re-queried: invalid choices fall back to the category’s default or first available option; failures remove the item. Reward flags enforce a single birthday reward per order, re-check eligibility via Clerk metadata, and disable rewards while `validatingAReorder` is true.
  - **Diffing**: Returns `changedOrderDetails` only when the sanitized payload differs, letting the client skip redundant store writes. `removedItemNames` powers user-facing toasts.
- **Validation Triggers**: Initial hydration (`useInitLocalStorage`), window focus (`useKeepOrderDetailsValidated`), explicit reorder workflows, and any backend recalculation funnel through the same router so kiosks, clients, and dashboards converge on one canonical cart.

## Server & tRPC Layer

- **Context**: `createTRPCContext` injects `ctx.prisma`, `ctx.auth`, and per-request metadata. Never instantiate Prisma manually inside routers.
- **Procedures**: Use `publicProcedure` for anonymous reads, `protectedProcedure` for authenticated user data, and `adminProcedure` for dashboard mutations (rechecks Clerk metadata server-side).
- **Data Safety**: When exposing user data, mirror patterns like `order.getUsersOrders` that enforce `ctx.auth.userId === input.userId`.

## Orders, Payments, and Automation

- **Checkout Flow**: Client serializes the validated cart into a Prisma `TransientOrder` (mirrors `orderDetailsSchema` + Stripe metadata) before redirecting to Stripe. The webhook (`src/pages/api/webhook.ts`) runs with body parsing disabled, verifies the signature against the raw `micro` buffer, reloads the transient record, re-validates totals/pickup slot/reward flags, and only then commits.
- **`createOrderInDb` Responsibilities**: Persist the real `Order`, emit Socket.io notifications (dashboards, kiosks, kitchen), queue print jobs, adjust gift-card balances, and optionally send receipts. Insert additional automation here so both webhook and admin flows stay in sync.
- **Currency Discipline**: All money fields are stored as integer cents; server code should use `Decimal` math to prevent floating point drift.
- **Socket Notifications**: Both webhook handlers and admin-only tRPC mutations (`orderRouter.startOrder` / `completeOrder`) broadcast updates so dashboards and kiosks stay synchronized.
- **Cron Jobs**: Scheduled automations live under `src/pages/api/crons` (e.g., reset pickup windows, send rewards). Follow this pattern for new scheduled tasks.

## AuthN/AuthZ Nuances

- Clerk manages sessions; private metadata drives role-based access.
- Route guards in `proxy.ts` pair with server-side `adminProcedure` checks for defense in depth.
- When persisting user context (cart hydration, stored orders), always confirm the authenticated `userId` matches the target record.

## UI, Styling & Assets

- **Tailwind**: Custom screens defined in `tailwind.config.ts` must stay in sync with the viewport labels in the main store.
- **Components**: Shared UI lives under `src/components`; shadcn primitives are wrapped for consistency. Complex sections (cart, headers, item customization) rely on helper utilities in `src/utils`.
- **Dynamic Head & SEO**: `DynamicHead` handles page-level metadata. Marketing assets and OG images live in `public/` organized by feature (logos, menu, media, etc.).
- **Unsupported Browsers**: `UnsupportedBrowserDetected` gates the experience for older clients.

## Emails & Assets

- React Email templates live in `/emails` and reuse shared tokens/utilities in `emails/utils`. Use `npm run email` to preview.
- Public email assets (logos, social icons) live under `public/emails` so they can be referenced by both the app and email templates.

## Environment & Configuration

- Environment variables are schema-checked in `src/env.js`. Any new secret must be added to the schema and exported through `runtimeEnv` so both client and server builds validate.
- Currency, reward, and schedule constants should flow through shared helpers (see `src/utils/priceHelpers` and `dateHelpers`).

## Developer Workflow

- **Scripts**: `npm run dev`, `build`, `lint`, `test` (Vitest; forced UTC, env validation skipped), `db:push`, `db:studio`, `email`.
- **Database**: Prefer `prisma migrate dev` when altering schema; seeds live in `prisma/seed.ts`.
- **Testing**: Vitest setup mocks env + timezone; add targeted tests around hooks/stores when making behavioral changes.
- **Gotchas**: Never enable Next.js body parsing on the Stripe webhook route; always reuse `storeDBQueries.getAll` result shape when adding preload data; keep `orderDetailsSchema` in sync with any persistence changes.
