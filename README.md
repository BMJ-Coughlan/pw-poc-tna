# Playwright POC — Test Automation Portfolio

## Purpose

I built this project to demonstrate disciplined test automation using Playwright: API testing, contract validation with Zod, end-to-end UI testing, and hybrid flows where the API prepares test state and API responses inform UI assertions.

## Quick Start

Install dependencies:

```powershell
npm install
```

**Common Commands:**

```powershell
# Type-check the code
npm run typecheck

# Lint the code
npm run lint

# Run all tests
npm test

# Run API tests only
npm run test:api

# Run E2E tests only
npm run test:e2e

# Run tests in all browsers (Chromium, Firefox, WebKit)
npm run test:all-browsers

# Run tests in specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Debugging modes
npm run test:headed   # Watch tests run in browser
npm run test:ui       # Interactive UI mode
npm run test:debug    # Step through with debugger

# View test report
npm run report
```

## Design Details

- **API Testing:** See `docs/api-client.md` for the API client architecture, schemas, examples, and rationale.
- **E2E Testing:** See `docs/e2e-testing.md` for page object patterns, hybrid testing approach, and key discoveries.

## Code Quality

- **ESLint with TypeScript:** I configured ESLint 9 with the flat config format (`eslint.config.mjs`) to enforce TypeScript best practices and code standards.
- **Prettier:** Automatic code formatting on save (via VS Code settings) and on commit ensures consistent style across the codebase.
- **Pre-commit hooks:** I set up `husky` and `lint-staged` to automatically run Prettier and ESLint on staged files before each commit, ensuring code quality checks happen before code enters the repository.
- **Rationale:** Pre-commit linting and formatting catches issues early (before CI or review), reduces noise in PRs, and demonstrates discipline in maintaining code quality standards.

## Notes

- Tests use Playwright's `APIRequestContext` (no separate HTTP client required).
- `BaseApi` unwraps common response envelopes and supports per-call Zod validation.
- Resource clients like `UsersApi` are accessed via fixtures rather than raw HTTP calls in tests.
- Test helpers reduce duplication: `UserBuilder` for test data generation, assertion helpers for common error validation patterns.
- E2E tests use the Page Object Pattern to encapsulate UI structure and interactions.
- Hybrid testing approach: API registration for setup, UI testing for behavior validation.

## Progress

**Completed:**

- [x] API client scaffolding: `lib/apis/baseApi.ts` and `lib/apis/usersApi.ts` (typed helpers, envelope handling).
- [x] Zod schemas: `lib/schemas/authSchemas.ts` for auth requests/responses.
- [x] Playwright fixtures: `lib/fixtures/testBase.ts` provides `UsersApi` and `authenticatedPage` fixtures.
- [x] TypeScript support and `tsconfig.json` plus `npm run typecheck` script.
- [x] API tests organized by resource: `tests/api/register.spec.ts`, `tests/api/login.spec.ts` (16 tests covering happy + sad paths).
- [x] Test helpers: `lib/helpers/testDataBuilders.ts` and `lib/helpers/apiAssertions.ts` for maintainable, DRY tests.
- [x] Documentation: `docs/api-client.md` and an updated `README.md` overview.
- [x] Code quality tooling: ESLint with TypeScript support, husky pre-commit hooks, and lint-staged for automated linting.
- [x] Page Object Pattern: `lib/pages/` with `BasePage`, `LoginPage`, `RegistrationPage`, and `NotesAppPage`.
- [x] E2E authentication tests: 14 tests covering registration, login, and navigation flows (100% passing).
- [x] Hybrid testing approach: API setup combined with UI testing for speed and focus.
- [x] E2E documentation: `docs/e2e-testing.md` with patterns, design decisions, and debugging discoveries.

**Planned next:**

- [ ] `notesApi.ts` client — implement a `NotesApi` resource client and add API tests.
- [ ] Notes CRUD E2E tests — add E2E tests for creating, reading, updating, and deleting notes.
- [ ] Contract-unit tests — mock `APIRequestContext` and add unit tests for `BaseApi` and `UsersApi` that validate Zod schemata.
- [ ] CI workflow — add a GitHub Actions workflow to run `npm ci`, `npm run typecheck`, and `npx playwright test` on push.
- [ ] Multi-browser smoke — add an example that runs smoke tests across Chromium, Firefox, and WebKit.
- [ ] Documentation polish — expand `docs/` with examples for Fixtures and Contract Testing patterns.
