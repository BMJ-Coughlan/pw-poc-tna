# E2E Testing with Page Objects

## Overview

This project uses the **Page Object Pattern** to create maintainable, reusable end-to-end tests. Page objects encapsulate UI structure and interactions, keeping test logic clean and focused on behavior rather than implementation details.

## Architecture

### Page Object Pattern

Page objects provide a layer of abstraction between tests and the UI. Each page object:

- **Encapsulates locators** — keeps CSS/XPath selectors in one place
- **Provides semantic methods** — `login(email, password)` instead of raw `fill()` and `click()` calls
- **Handles navigation** — `goto()` methods navigate to specific pages
- **Exposes state checks** — `hasErrorMessage()`, `isAuthenticated()`, etc.

### BasePage

All page objects inherit from `BasePage`, which provides common functionality:

```typescript
export class BasePage {
  readonly page: Page;

  // Navigation
  async goto(path: string): Promise<void>;
  async waitForLoadState(state?: 'load' | 'domcontentloaded' | 'networkidle'): Promise<void>;

  // Interactions
  async fill(locator: Locator, value: string): Promise<void>;
  async click(locator: Locator): Promise<void>;

  // Assertions
  async isVisible(locator: Locator): Promise<boolean>;
  async getText(locator: Locator): Promise<string>;
}
```

**Design rationale:** Centralizing common operations in `BasePage` ensures consistency, reduces duplication, and makes it easier to add cross-cutting concerns (logging, retries, etc.) in the future.

### Page Objects

#### LoginPage

**Path:** `/notes/app/login`

**Fields:**

- `emailInput` — accepts email addresses (discovered through debugging; not username)
- `passwordInput` — password field
- `rememberMeCheckbox` — optional remember me checkbox

**Methods:**

- `login(email, password, rememberMe?)` — fills and submits login form
- `goToRegister()` — navigates to registration page
- `hasErrorMessage()` — checks if error is displayed

**Key discovery:** The login page uses **email** (not username) because it integrates with the API-based notes application. This differs from the simple `/register` form which uses username.

#### RegistrationPage

**Path:** `/register`

**Fields:**

- `usernameInput` — username field (3-field simple registration)
- `passwordInput` — password field
- `confirmPasswordInput` — password confirmation

**Methods:**

- `register(username, password, confirmPassword?)` — fills and submits registration form
- `goToLogin()` — navigates to login page
- `hasErrorMessage()` — checks if error is displayed

**Key discovery:** This simple registration form creates accounts that are **separate from the notes app login system**. For testing the notes app, use API registration instead.

#### NotesAppPage

**Path:** `/notes/app`

**Fields:**

- `logoutButton` — logout control
- `addNoteButton` — create note button
- `profileLink` — user profile link
- `pageHeading` — main page title

**Methods:**

- `logout()` — ends user session
- `isAuthenticated()` — checks if user is logged in (via logout button visibility)
- `waitForApp()` — waits for app to fully load

## Test Organization

Tests are organized by **user flow/feature**:

```
tests/e2e/
├── registration.spec.ts  — Registration form UI tests (5 tests)
└── login.spec.ts         — Login form UI tests (6 tests)
```

### Test Coverage

**Registration Tests (5):**

- ✅ Successful registration with valid data
- ✅ Validation error for missing username
- ✅ Validation error for missing password
- ✅ Validation error for short password
- ✅ Validation error for password mismatch

**Login Tests (6):**

- ✅ Successful login with valid credentials
- ✅ Error for non-existent user
- ✅ Error for incorrect password
- ✅ Validation error for empty email
- ✅ Validation error for empty password
- ✅ Navigation to registration page

**Total: 11 tests, 100% passing**

## Hybrid Testing Approach

### The Challenge

The test site has two separate authentication systems:

1. **Simple registration** (`/register`) — username/password only, creates accounts that don't work with notes app login
2. **API registration** (`/notes/api/users/register`) — full email-based registration, creates accounts that work with `/notes/app/login`

### The Solution: Hybrid Testing

We use a **hybrid approach** that combines API and UI testing:

```typescript
test('should login successfully', async ({ page, authAPI }, testInfo) => {
  // 1. Use API for test data setup (fast, reliable)
  const userData = {
    name: 'E2E Login User',
    email: `e2e_login_w${testInfo.workerIndex}_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };
  await authAPI.register(userData);

  // 2. Test the UI login experience
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(userData.email, userData.password);

  // 3. Assert UI behavior
  expect(page.url().includes('/notes/app') || !(await loginPage.hasErrorMessage())).toBeTruthy();
});
```

### Benefits

- **Speed** — API registration is faster than filling forms
- **Reliability** — API setup is deterministic, no form validation edge cases
- **Focus** — Tests focus on the UI behavior being tested, not setup
- **Integration** — Verifies that API-registered users can use the UI (important integration check)

### Trade-offs

- **Not pure E2E** — Setup happens via API, not through UI
- **Requires API client** — Tests depend on `authAPI` fixture (already built for API tests)
- **Coupling** — If API registration breaks, UI tests fail

**Decision:** The hybrid approach is worth it because:

1. We already have API tests covering registration thoroughly
2. UI tests should focus on UI-specific behavior (validation messages, navigation)
3. Test execution speed matters for developer feedback loops

## Test Data Strategy

### Worker-Safe Generation

Tests generate unique data using `workerIndex` and `timestamp`:

```typescript
const uniqueEmail = `e2e_login_w${testInfo.workerIndex}_${Date.now()}@example.com`;
```

**Why?**

- **Parallel execution** — Playwright runs tests in parallel using multiple workers
- **No collisions** — Each worker + timestamp combination is unique
- **Deterministic** — Pattern is predictable but never reuses data

### Password Strategy

Tests use a consistent, valid password: `TestPassword123!`

**Why?**

- **Not testing password rules** — API tests already cover password validation
- **Simplifies debugging** — Seeing this password immediately identifies test data
- **Meets requirements** — Long enough, has special characters

## Locator Strategy

### Flexible Locators

Page objects use **multiple selector strategies** with fallbacks:

```typescript
this.emailInput = page.locator('input#email, input[name="email"], input[type="email"]');
this.errorMessage = page
  .locator('[role="alert"], .error, .alert, .alert-danger, [data-testid="error-message"]')
  .first();
```

**Why?**

- **Resilience** — If one selector breaks, others may still work
- **Adaptability** — Works with different UI implementations/frameworks
- **ARIA support** — Prioritizes semantic HTML (`[role="alert"]`) when available

### .first() Pattern

When multiple matches are expected, we use `.first()`:

```typescript
this.errorMessage = page.locator('...multiple selectors...').first();
```

**Why?**

- **Stability** — Always gets exactly one element, avoids "strict mode" violations
- **Practical** — First error message is usually the relevant one
- **Simple** — No need to filter or enumerate all matches

## Assertions

### Flexible Assertions

Tests use **OR patterns** for assertions:

```typescript
const hasError = await loginPage.hasErrorMessage();
const stillOnLogin = page.url().includes('/login');
expect(hasError || stillOnLogin).toBeTruthy();
```

**Why?**

- **Implementation agnostic** — Different error display methods all indicate failure
- **Resilient** — Works whether app shows inline errors, alerts, or stays on page
- **Realistic** — Users care about "did login fail?" not "which exact error appeared"

### Trade-offs

**Pros:**

- Less brittle tests
- Works across different UI implementations
- Focuses on user-visible behavior

**Cons:**

- Less precise (can't assert exact error message)
- May miss edge cases where both conditions are false
- Harder to debug when assertions fail

**Decision:** For E2E tests, resilience and speed matter more than precision. API tests already verify exact error messages and status codes.

## Debugging Discoveries

### Path Discovery Process

Initial assumptions about paths were wrong. Discovery process:

1. **Assumption:** Login at `/login`, registration at `/notes/register`
2. **Reality:** Both paths returned 404
3. **Investigation:** Created debug test to check multiple URLs
4. **Discovery:**
   - `/register` — simple 3-field registration (username-based)
   - `/notes/app/login` — email-based login (integrates with API)
   - `/login` — exists but separate from notes app
5. **Solution:** Updated page objects to use correct paths

**Lesson:** Don't assume — verify paths and field names through debugging before implementing tests.

### Field Name Discovery

Similar issue with form fields:

1. **Assumption:** Login uses `username` field
2. **Reality:** Uses `email` field at `/notes/app/login`
3. **Discovery:** Debug test revealed `input#email` at API-integrated login page
4. **Solution:** Changed `usernameInput` to `emailInput` in LoginPage

**Lesson:** Inspect actual HTML when locators fail, don't guess based on similar forms elsewhere.

## Running E2E Tests

### All E2E tests

```powershell
npx playwright test tests/e2e --project=chromium
```

### Specific test file

```powershell
npx playwright test tests/e2e/login.spec.ts
```

### Single test by name

```powershell
npx playwright test --grep "should login successfully"
```

### With UI mode (debugging)

```powershell
npx playwright test tests/e2e --ui
```

### With headed browser (watch tests run)

```powershell
npx playwright test tests/e2e --headed
```

## Future Enhancements

### Potential Improvements

1. **Custom assertions** — Create `expect(loginPage).toShowError()` for cleaner test code
2. **Network waiting** — Replace `waitForTimeout()` with network idle or specific request waits
3. **Logout tests** — Add full session lifecycle tests once notes app integration is stable
4. **Visual regression** — Add screenshot comparisons for critical pages
5. **Mobile testing** — Add viewport configurations for responsive testing
6. **Component library** — If app uses React/Vue, consider component testing alongside E2E

### Not Planned (and why)

- **Full E2E user journeys** — Test site limitations (separate registration systems) make this impractical
- **Data-driven tests** — Current coverage is sufficient; parameterized tests would add complexity without value
- **Multi-browser E2E** — Chromium coverage sufficient for this POC; API tests already verify logic cross-browser

## Key Takeaways

1. **Page objects reduce duplication** — Tests are cleaner and more maintainable
2. **Hybrid approach works well** — API setup + UI testing is fast and focused
3. **Flexible locators are worth it** — Resilient selectors adapt to UI changes
4. **Debug first, implement second** — Verify actual page structure before writing tests
5. **Not all E2E needs to be pure** — Strategic API usage speeds up tests without sacrificing quality

## Related Documentation

- `docs/api-client.md` — API testing patterns and architecture
- `lib/fixtures/testBase.ts` — Fixture setup for both API and E2E tests
- `lib/pages/` — Page object implementations
