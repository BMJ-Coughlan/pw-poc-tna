# Playwright POC — Test Automation Portfolio

Purpose

- This repository demonstrates disciplined test automation using Playwright: API testing, contract validation with Zod, end-to-end UI testing, and hybrid flows where the API prepares test state and API responses inform UI assertions.

Quick start

- Install dependencies:

```powershell
npm install
```

- Type-check the code:

```powershell
npm run typecheck
```

- Lint the code:

```powershell
npm run lint
```

- Run the Playwright smoke tests (Chromium):

```powershell
npx playwright test tests/api --project=chromium
```

Design details

- See `docs/api-client.md` for the API client architecture, schemata, examples and rationale.

Code quality

- **ESLint with TypeScript:** The project uses ESLint 9 with the flat config format (`eslint.config.mjs`) to enforce TypeScript best practices and code standards.
- **Prettier:** Automatic code formatting on save (via VS Code settings) and on commit ensures consistent style across the codebase.
- **Pre-commit hooks:** I configured `husky` and `lint-staged` to automatically run Prettier and ESLint on staged files before each commit. This ensures code quality and formatting checks happen before code enters the repository.
- **Decision rationale:** Pre-commit linting and formatting catches issues early (before CI or review), reduces noise in PRs, and demonstrates discipline in maintaining code quality standards across a growing codebase.

Notes

- Tests use Playwright's `APIRequestContext` (no separate HTTP client required).
- `BaseApi` unwraps common response envelopes and supports per-call Zod validation.
- Prefer using resource clients (for example, `UsersApi`) from fixtures rather than calling raw HTTP in tests.

## Planned demonstrations (TODO)

These are small, portfolio-friendly demos intended to showcase patterns and capabilities.

Each demo is intentionally focused so reviewers can quickly understand the pattern and the test intent.

Progress — completed so far

- [x] API client scaffolding: `lib/apis/baseApi.ts` and `lib/apis/usersApi.ts` (typed helpers, envelope handling).
- [x] Zod schemata: `lib/data/schemata/authSchemas.ts` for auth requests/responses.
- [x] Playwright fixtures: `lib/fixtures/testBase.ts` provides `UsersApi` and `authenticatedPage` fixtures.
- [x] TypeScript support and `tsconfig.json` plus `npm run typecheck` script.
- [x] Minimal smoke test: `tests/api/auth.spec.ts` (register/login + UI navigation) — passing locally.
- [x] Documentation: `docs/api-client.md` and an updated `README.md` overview.
- [x] Code quality tooling: ESLint with TypeScript support, husky pre-commit hooks, and lint-staged for automated linting.

Remaining demos (small, focused tasks)

- [ ] Page Object Pattern — add a `pages/` folder and a `NotesPage` class; create a UI test that uses it.
- [ ] `notesApi.ts` client — implement a `NotesApi` resource client and add API tests.
- [ ] Contract-unit tests — mock `APIRequestContext` and add unit tests for `BaseApi` and `UsersApi` that validate Zod schemata.
- [ ] Hybrid test example — seed data with `NotesApi`, then run a UI flow that asserts UI behavior based on API response properties.
- [ ] CI workflow — add a GitHub Actions workflow to run `npm ci`, `npm run typecheck`, and `npx playwright test` on push.
- [ ] Multi-browser smoke — add an example that runs smoke tests across Chromium, Firefox, and WebKit.
- [ ] Documentation polish — expand `docs/` with short pages for Page Objects, Fixtures, and Contract Testing examples.
