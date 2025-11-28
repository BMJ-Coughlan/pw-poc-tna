# Playwright POC — Test Automation Portfolio

[![Playwright Tests](https://github.com/BMJ-Coughlan/pw-poc-tna/actions/workflows/playwright-tests.yml/badge.svg?branch=develop)](https://github.com/BMJ-Coughlan/pw-poc-tna/actions/workflows/playwright-tests.yml)

## Purpose

I built this project to demonstrate disciplined test automation using Playwright: API testing, contract validation with Zod, end-to-end UI testing, and hybrid flows where the API prepares test state and API responses inform UI assertions.

## Environment Configuration

The project uses a `.env` file for test configuration (included in version control for portfolio transparency).

Key variables: `BASE_URL`, `COOKIE_DOMAIN`, and test credentials (`E2E_TEST_PASSWORD`, `API_TEST_PASSWORD`, etc.).

## Quick Start

Install dependencies:

```powershell
npm install
```

```powershell
npm test                  # Run all tests
npm run test:api          # API tests only
npm run test:e2e          # E2E tests only
npm run test:visual       # Visual tests (quarantined)

npm run test:ui           # Interactive UI mode
npm run test:headed       # Watch tests run
npm run report            # View HTML report

npm run typecheck         # TypeScript check
npm run lint              # ESLint
```

## Architecture

- **API Testing:** `docs/api-client.md` — API client with Zod schemas and fixtures
- **E2E Testing:** `docs/e2e-testing.md` — Page objects and hybrid API+UI approach
- **Visual Regression:** `docs/visual-regression.md` — Quarantined due to third-party ads on practice site

## Code Quality

- ESLint 9 with TypeScript (flat config)
- Prettier formatting on save and commit
- Husky + lint-staged pre-commit hooks

## Key Patterns

- **API Testing:** See `docs/api-client.md` for the API client architecture, schemas, examples, and rationale.
- **E2E Testing:** See `docs/e2e-testing.md` for page object patterns, hybrid testing approach, and key discoveries.
- **Accessibility Testing:** `docs/accessibility-testing.md` — WCAG 2.1 AA compliance with axe-core (quarantined: practice site has contrast violations)
- **Visual Regression:** `docs/visual-regression.md` — Screenshot comparison testing (quarantined: third-party ads cause instability)
- **CI/CD:** See `.github/workflows/README.md` for workflow configuration. Two pipelines: fast feedback on PRs (smoke tests), comprehensive nightly runs (full suite minus quarantined tests).
- **Page Object Pattern** for UI tests
- **API fixtures** via Playwright's `APIRequestContext`
- **Zod schema validation** for API responses
- **Hybrid testing:** API setup + UI validation
- **Test data builders** and assertion helpers

## What's Implemented

- API tests with Zod validation (register, login)
- E2E authentication flows with Page Objects
- CI/CD pipeline (GitHub Actions, cross-browser, GitHub Checks integration)
- Visual regression tests (quarantined due to ads)
- Code quality tooling (ESLint, Prettier, husky)
