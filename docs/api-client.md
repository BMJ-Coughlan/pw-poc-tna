# API Client Architecture (Playwright Proof-of-Concept)

I designed this project as a lightweight proof-of-concept to demonstrate disciplined API client design for Playwright-based contract, API, E2E, and hybrid tests. The goal is to show clear structure, strong typing, and patterns that I can explain in a portfolio.

## Goals

- Maintain a strong separation of concerns: a small `BaseApi` handles request/response plumbing and per-resource clients contain domain logic.
- Validate contracts using Zod schemas for request and response shapes.
- Integrate natively with Playwright via `APIRequestContext` for live HTTP calls inside tests.
- Make components testable: keep classes small so they can be unit-tested with a mocked `APIRequestContext`.

## Layout

- `lib/apis/` — API clients organized by resource (`baseApi.ts`, `usersApi.ts`, etc.)
  - `baseApi.ts` wraps Playwright `APIRequestContext` and provides `get/post/patch/delete` helpers, envelope unwrapping, error handling, and optional Zod validation.
  - `usersApi.ts` — Resource client for Users (register, login, profile, logout).

- `lib/schemas/` — Centralized Zod schemas for request/response validation (`authSchemas.ts`, etc.)

- `lib/fixtures/` — Playwright fixtures that instantiate API clients and provide test utilities (`testBase.ts`)

- `lib/helpers/` — Test utilities to reduce duplication and improve test clarity
  - `testDataBuilders.ts` — Factory methods for generating test data (e.g., `UserBuilder.valid()`)
  - `apiAssertions.ts` — Reusable assertion helpers for common API error validation patterns

- `lib/pages/` — Page Object Models for UI testing (future)

- `tests/api/` — API and contract tests organized by resource (e.g., `register.spec.ts`, `login.spec.ts`)

- `tests/e2e/` — End-to-end UI tests (future)

## Patterns and Rationale

- Centralize cross-cutting behavior in `BaseApi` so resource clients remain focused and expressive.
- Use Zod for both outgoing request validation (to catch test-side bugs) and incoming response validation (to detect contract drift).
- Keep resource clients single-purpose — map each client to a REST resource (Users, Notes, etc.).
- Use fixtures to provide ready-to-use instances for tests instead of constructing clients inside tests.
- **Test helpers for maintainability** — Extract common test patterns (data builders, assertions) to reduce duplication while keeping test intent clear. This demonstrates understanding of when to abstract vs when to keep explicit.

### Test Data Builders

Test data builders encapsulate common patterns for creating test data, reducing noise and making tests more maintainable:

```ts
// Before: Manual test data with timestamp boilerplate
const user = {
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
};

// After: Clear intent, consistent generation
const user = UserBuilder.valid();
const invalidUser = UserBuilder.withInvalid('email');
```

**Benefits:**

- Changes to test data shape happen in one place
- Self-documenting code (`withInvalid('email')` is clearer than `{ email: 'not-an-email' }`)
- Reduces test file length by ~40% while improving clarity

### Assertion Helpers

Common assertion patterns are extracted to helpers, reducing try/catch boilerplate:

```ts
// Before: Repetitive error validation
try {
  await authAPI.login(email, 'wrong');
  throw new Error('Expected to fail');
} catch (error) {
  expect(error).toBeInstanceOf(ApiError);
  const apiError = error as ApiError;
  expect(apiError.status).toBe(401);
  expect(apiError.body).toBeDefined();
}

// After: Clear and concise
try {
  await authAPI.login(email, 'wrong');
  throw new Error('Expected to fail');
} catch (error) {
  expectApiError(error, 401);
}
```

**Design principle:** Helpers remove noise, not signal. Test-specific logic remains in the test file to keep tests readable without jumping to helper definitions.

## Examples

Register and login using test helpers:

```ts
// Generate unique test user
const user = UserBuilder.valid({ password: 'securePassword123' });
await authAPI.register(user);

// Login with generated credentials
const token = await authAPI.login(user.email, user.password);
expect(token).toBeTruthy();
```

Test validation errors with builders:

```ts
// Test invalid email format
const invalidUser = UserBuilder.withInvalid('email');
await expectToThrow(() => authAPI.register(invalidUser));
```

Validate error responses:

```ts
try {
  await authAPI.login(user.email, 'wrongPassword');
  throw new Error('Expected login to fail');
} catch (error) {
  const apiError = expectApiError(error, 401);
  expectErrorMessage(apiError);
}
```

## Extending

- Add new resource clients following the `UsersApi` pattern
- Create corresponding test data builders in `lib/helpers/testDataBuilders.ts`
- Add unit tests for `BaseApi` and resource clients using a mocked `APIRequestContext`
- Organize tests by resource (e.g., `notes.spec.ts`) with both happy and sad paths in the same file

## Portfolio Value

This layout demonstrates:

- Dependency injection (passing request context or base client into resource clients)
- Contract-first testing (Zod schemas validate contracts at runtime)
- Playwright-native API usage (no separate HTTP library required)
- **Test maintainability** — balancing DRY principles with test clarity through targeted abstractions
- **Professional judgment** — knowing when to abstract (data generation, common assertions) vs. when to keep explicit (test-specific logic)

## API Contract

This section documents the concrete API shapes that this proof-of-concept expects and validates at runtime using Zod.

- **Base path used by the clients:** `/notes/api`
- **Envelope shape:** many endpoints return an envelope such as:

```json
{
  "data": {
    /* resource payload */
  },
  "status": 200,
  "message": "OK"
}
```

- `BaseApi` prefers the `data` property when unwrapping responses; schemas often use `.catchall()` to tolerate additional envelope metadata.
- **Error semantics:** non-2xx responses cause `ApiError` to be thrown with `status` and the parsed `body`.

### Key endpoints (POC)

- `POST /notes/api/users/register`
  - Request: `{ name, email, password }`
  - Example response (envelope):

```json
{
  "data": {
    "id": "123",
    "name": "Test User",
    "email": "test@example.com"
  },
  "status": 201
}
```

- `POST /notes/api/users/login`
  - Request: `{ email, password }`
  - Example responses supported by the client:

```json
// nested token
{ "data": { "token": "..." } }

// or top-level token
{ "token": "..." }
```

Clients and tests should prefer extracting `data?.token` and fall back to `token` for compatibility.

### Usage snippet

```ts
// In a fixture or test
await authAPI.register({ name, email, password });
const token = await authAPI.login(email, password);
// Inject token into browser cookie for authenticated UI interactions
```

### Notes on side effects

- The POC interacts with a live SUT and may create real users; use test-specific accounts and clean up where appropriate.
