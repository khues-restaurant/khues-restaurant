# Khue's Restaurant – Copilot Instructions

## Architecture & Entry Points

- Next.js Pages Router with tRPC lives under `src/pages` and `src/server/api`; `_app.tsx` wraps everything in Clerk + `GeneralLayout`, while `/dashboard` renders outside the layout.
- The `~/` path alias (see tsconfig) resolves to `src/`; prefer it over relative paths.
- `api.withTRPC` in `_app.tsx` wires React Query to tRPC; client hooks are imported from `~/utils/api`.
- Route protection is handled by `src/proxy.ts`: `/profile` requires auth, `/dashboard` requires `privateMetadata.role === "admin"`.

## Data & State Flow

- Global cart/order state is managed via Zustand in `src/stores/MainStore.ts`; always mutate through the provided setters so toast/history hooks work.
- `GeneralLayout` runs `useInitLocalStorage`, `useInitializeStoreDBQueries`, `useKeepOrderDetailsValidated`, and viewport listeners—pages that bypass the layout must manually run whatever pieces they depend on.
- `useInitLocalStorage` loads carts from Clerk `user.currentOrder` or `localStorage`, then calls `api.validateOrder.validate` before letting the UI render. Any new persistence must keep the schema in `orderDetailsSchema` in sync.
- `storeDBQueries.getAll` aggregates menu data, customization choices, rewards, hours, and holidays for the store; reuse its shape when new state needs to be preloaded.

## Payments, Orders & Automation

- Checkout creates a Prisma `TransientOrder`; `src/pages/api/webhook.ts` (Stripe) reads it, validates metadata, then calls `createOrderInDb` to write the real `Order`, fire socket events, enqueue prints, adjust gift cards, and optionally email receipts.
- All currency fields are stored as integer cents (see comments in `prisma/schema.prisma`). Use `Decimal` math server-side to avoid floating errors.
- Socket.io notifications broadcast from both the webhook and admin tRPC mutations (`orderRouter.startOrder/completeOrder`) to keep kiosks and dashboards in sync.
- Scheduled work is implemented as API routes under `src/pages/api/crons` (e.g., resetting minimum pickup time, sending birthday rewards); follow that pattern for new cron jobs.

## AuthN/AuthZ Expectations

- Use `publicProcedure` for anonymous reads, `protectedProcedure` for end-user data, and `adminProcedure` (which rechecks Clerk private metadata) for dashboard mutations.
- `ctx.prisma` is injected by `createTRPCContext`; never instantiate Prisma clients inside routers.
- When exposing user data, double-check `ctx.auth.userId` matches any `input.userId` like `order.getUsersOrders` does.

## UI, Styling & Assets

- Styling relies on Tailwind with custom screens (`tailwind.config.ts`) that match `useMainStore`'s `viewportLabel`; when adding breakpoints update both.
- Components under `src/components/...` lean on shadcn primitives plus bespoke sections (cart, headers, layouts). Shared formatting lives in `src/utils` (date/price helpers, menu image paths).
- Email templates live in `emails/` and use `react-email`; run `npm run email` to preview.

## Developer Workflows

- Use npm scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run test` (Vitest with `vitest.setup.ts` forcing UTC + skipping env validation), `npm run db:push`, `npm run db:studio`, `npm run email`.
- Environment variables are schema-checked in `src/env.js`; add new secrets there and export through `runtimeEnv` so both server and client builds pass validation.
- For database changes prefer `prisma migrate dev`; seeding logic is in `prisma/seed.ts` and runs via the `prisma` config.

## Implementation Tips

- When touching order flows, audit both the client store (`useUpdateOrder`, hooks in `src/hooks`) and the webhook/server utilities to keep schemas aligned.
- Prefer extending existing routers (`src/server/api/routers/*`) over adding ad-hoc REST routes; new routers must be registered in `api/root.ts`.
- If you need to notify dashboards or kitchen screens, emit through Socket.io as shown in `createOrderInDb` or `orderRouter`.
- Reference `src/pages/api/webhook.ts` for handling raw `micro` buffers and Stripe signatures—Next.js body parsing must stay disabled for that route.
- React-email templates can import shared tokens from `emails/utils` for consistent styles and asset resolution (`emails/utils/dynamicAssetUrls.ts`).
