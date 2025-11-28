# E2E Testing with Page Objects

We use the **Page Object Pattern** for maintainable E2E tests. Page objects encapsulate UI structure and interactions so tests stay focused on behavior. Centralizing locators and semantics reduces churn.

SME notes (why this approach):

- Keep page objects thin; business logic belongs in tests, not pages.
- Hybrid API+UI keeps flows fast and deterministic; pure UI setup is fragile and slow.
- Prefer resilient, semantic selectors; avoid brittle CSS chains.
- Keep tests short; push exhaustive edge cases to API/contract tests.

## Page Objects

**BasePage** provides common functionality:

- Navigation (`goto()`, `waitForLoadState()`)
- Interactions (`fill()`, `click()`)
- Assertions (`isVisible()`, `getText()`)

**LoginPage** (`/notes/app/login`):

- Uses `email` (not username) for API-based login
- Methods: `login(email, password)`, `goToRegister()`, `hasErrorMessage()`

**RegistrationPage** (`/register`):

- Simple 3-field form (username/password/confirm)
- Creates accounts separate from notes app
- Methods: `register(username, password, confirm)`, `hasErrorMessage()`

**NotesAppPage** (`/notes/app`):

- Methods: `logout()`, `isAuthenticated()`, `waitForApp()`

## Coverage

11 tests — registration (5) and login (6): success + validation/error cases. Enough to demonstrate discipline without trying to be exhaustive.

## Hybrid Testing

The practice site has two separate auth systems:

1. Simple registration (`/register`) — username-based, doesn't work with notes app
2. API registration — email-based, works with `/notes/app/login`

We use **hybrid testing**: API for setup, UI for validation.

```typescript
test('login', async ({ page, authAPI }, testInfo) => {
  // API setup (fast)
  const userData = { name, email, password };
  await authAPI.register(userData);

  // Test UI
  const loginPage = new LoginPage(page);
  await loginPage.login(userData.email, userData.password);

  // Assert
  expect(page.url().includes('/notes/app')).toBeTruthy();
});
```

Benefits: fast, deterministic setup; UI asserts stay focused. Trade‑off: not pure E2E — acceptable given API coverage and portfolio goals.

## Test Data

Tests generate unique data using `workerIndex` and `timestamp` for parallel execution:

```typescript
const email = `e2e_w${testInfo.workerIndex}_${Date.now()}@example.com`;
```

Passwords come from `.env` (`E2E_TEST_PASSWORD`, `E2E_WRONG_PASSWORD`).

**Helpers** (`lib/helpers/e2eHelpers.ts`):

- `generateUniqueEmail(prefix, testInfo)`
- `generateUniqueUsername(testInfo)`
- `waitForAuthResponse(page)` — 1s wait
- `expectValidationFailure(page, pageObject, url)`

Helpers reduced test files by ~30%.

## Environment Config

Tests use `.env` for configuration:

```dotenv
BASE_URL=https://practice.expandtesting.com
E2E_TEST_PASSWORD=TestPassword123!
```

## Locators

Page objects use **flexible selectors** with fallbacks:

```typescript
this.emailInput = page.locator('input#email, input[name="email"], input[type="email"]');
this.errorMessage = page.locator('[role="alert"], .error, .alert').first();
```

Resilient selectors reduce flake from minor UI changes. Prefer semantic/ARIA attributes when available.

## Notes

- Paths matter: `/login` vs `/notes/app/login` are distinct systems.
- Field names matter: login uses `email`, not `username`.
- Assertions should be resilient: `hasError || stillOnPage` beats exact error text.
- Hybrid approach keeps E2E fast and focused.
- Keep tests small; rely on API tests for contract precision.
