# Project Architecture Guide

## Tech Stack
- **Backend**: Node.js with TypeScript (Express)
- **Frontend**: React with TypeScript (Vite, TanStack Router, TanStack Query)
- **Database**: PostgreSQL with Drizzle ORM
- **Shared Code**: `packages/shared/` and `packages/shared-react/`
- **Tooling**: pnpm workspace, versions shared through `catalog:` in `pnpm-workspace.yaml`

## Code Organization

### API Public Types
- **Location**: `packages/shared/src/models/<model-name>/*.ts`
- **Tests**: Schema validations in `packages/shared/src/models/<model-name>/<model-name>.test.ts`
- **Pattern**: zod schemas and inferred types, one file per endpoint payload (e.g. `weapons-get.ts`)
- **Purpose**: Shared types between frontend and backend

### Shared Logic
- **Location**: `packages/shared/src/common/<topic>/*.ts`
- **Pattern**: Pure functions, no I/O, tested with vitest in `*.test.ts`

### Database Models
- **Location**: `packages/backend/src/data/models/<model-name>.ts`
- **Pattern**: Drizzle tables; migrations generated into `packages/backend/drizzle/`
- **IDs**: Stable slugs as text primary keys
- **Seed data**: `packages/backend/src/data/seed/*.json`, validated against the `shared` schemas

### API Endpoints
- **Location**: `packages/backend/src/api/routes/<model-name>/*.ts`
- **Convention**: RESTful API design
- **Pattern**: Each model has its own directory with route handlers; row to API type mapping in `packages/backend/src/api/mappers/`, queries in `packages/backend/src/services/`

### React API Hooks
- **Location**: `packages/shared-react/src/api/<model-name>/*.ts`
- **Pattern**: TanStack Query hooks for API interactions
- **Naming**: Use hooks prefix (e.g., `useGetWeapons`, `useGetClassById`)

### Web UI
- **Features**: `packages/app-web/src/features/<feature-name>/`
- **Routes**: `packages/app-web/src/routes/` (TanStack Router file routes)
- **Primitives**: `packages/app-web/src/ui/`
- **Strings**: i18next keys in `packages/shared/src/localization/en.json`
- **Design**: All UI work goes through the frontend-design skill

## Development Workflow

### Adding a New Feature
1. Define types in `packages/shared/src/models/<model-name>/`
2. Create DB model in `packages/backend/src/data/models/<model-name>.ts` and generate the migration
3. Implement API routes in `packages/backend/src/api/routes/<model-name>/*.ts`
4. Create React hooks in `packages/shared-react/src/api/<model-name>/*.ts`
5. Build the UI in `packages/app-web/src/features/<feature-name>/` and its route in `packages/app-web/src/routes/`
6. Add tests as needed

### Key Conventions
- Follow RESTful conventions for API endpoints
- Maintain type safety across frontend/backend boundary
- Keep shared types in `packages/shared/`
- Validate types with tests in `*.test.ts` files
- Take dependency versions from the catalog; ask before adding a dependency
- Run `pnpm --filter <package-name> lint` before committing
- Branch names match `^(feat|fix|chore)/.+$`; commits follow Conventional Commits
- No game icons or other XLGAMES assets in the repo
