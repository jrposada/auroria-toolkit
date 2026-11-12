## Prerequisites

1. NodeJS 22 or later.

2. _Recommended_ NVM. Run `nvm use` in the repository root.

3. pnpm 10.

4. Docker. The backend's PostgreSQL runs in a container.

## Getting started

1. Clone repository through ssh `git@github.com:jrposada/auroria-toolkit.git`

2. Install dependencies `pnpm install && pnpm exec husky`

3. Look for `.example.env` files. Create a new `.env` file for each of them and fill all the data.

4. Run the apps in development mode

```
pnpm dev:backend
pnpm dev:web
```

`pnpm dev:backend` starts PostgreSQL in Docker on port 4200 (compose project `auroria-toolkit`), applies pending migrations, mirrors `packages/backend/src/data/seed/*.json` into the database and serves the API on port 4100. The seed files are the source of truth: the tables are rewritten to match them on every start.

After changing a table in `packages/backend/src/data/models/`, generate its migration and commit the new files in `packages/backend/drizzle/`:

```
pnpm --filter @jrposada/auroria-toolkit-backend db:generate
```

## Packages

| Package | Name | Purpose |
|---|---|---|
| `packages/shared` | `@jrposada/auroria-toolkit-shared` | Schemas, types and pure logic |
| `packages/shared-react` | `@jrposada/auroria-toolkit-shared-react` | React API hooks |
| `packages/backend` | `@jrposada/auroria-toolkit-backend` | API |
| `packages/app-web` | `@jrposada/auroria-toolkit-app-web` | Web app |

## Checks

```
pnpm lint                               # every package
pnpm --filter <package-name> lint       # one package: eslint, prettier, types
pnpm --filter <package-name> build
pnpm --filter <package-name> test
```

Tests run in Node; files named `*.dom.test.tsx` run in jsdom (`// @vitest-environment jsdom` on their first line).

The pre-commit hook checks the branch name and the Node and pnpm versions, then lints the staged files of each package.

## Contributing

1. Pull latest `main` branch.

   ```bash
   git checkout main
   git pull
   ```

2. Create branch name. Branch name must follow pattern `[feat|fix|chore]/<short-description>`. For example `feat/crafting-calculator` or `fix/talent-target`

3. Make your changes and publish branch. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

4. Open Pull Request against `main`. Make sure to include a short description of your changes. Make sure your PR title follow's pattern `[feat|fix|chore]: <short-description>`.

5. Wait for your changes to be approved.

See [CLAUDE.md](./CLAUDE.md) for the architecture guide.
