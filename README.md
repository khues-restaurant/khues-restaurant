# Khue's Restaurant

Static Next.js website for Khue's restaurant.

## Development

- `npm run dev` starts the local development server.
- `npm run lint` runs ESLint.
- `npx tsc --noEmit` runs the TypeScript check.
- `npm run build` creates the production build.
- `npm run start` serves the production build.

## Content

- Main pages live in `src/pages`.
- Shared layout and navigation live in `src/components`.
- Menu content is maintained in `src/data/menu.ts`.

## Integrations

- Reservations and gift card purchases are handled by external provider links.
- This repository does not include on-site authentication, ordering, or database-backed features.
