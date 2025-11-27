# API Client Architecture

Disciplined API testing with Playwright: contract validation via Zod, typed clients, and helpers that keep tests small and readable.

## Structure & Rationale

- `lib/apis/baseApi.ts` — Wraps `APIRequestContext`; normalizes envelopes; optional Zod validation. Keeps cross‑cutting behavior out of resource clients.
- `lib/apis/usersApi.ts` — Focused resource client (register/login/profile/logout). Thin by design.
- `lib/schemas/` — Zod schemas for request/response validation
- `lib/fixtures/testBase.ts` — Fixtures inject ready‑to‑use clients. Tests don’t construct clients inline.
- `lib/helpers/testDataBuilders.ts` — Factory methods for test data (`UserBuilder.valid()`)
- `lib/helpers/apiAssertions.ts` — Reusable assertion helpers for API errors
- `tests/api/` — API tests organized by resource

## Test Helpers

**Data Builders:**

```ts
const user = UserBuilder.valid();
const invalidUser = UserBuilder.withInvalid('email');
```

**Assertion Helpers:**

```ts
try {
  await authAPI.login(email, 'wrong');
} catch (error) {
  expectApiError(error, 401);
}
```

Helpers reduce boilerplate while keeping intent explicit.

Design choice: Zod at the boundary gives fast feedback on contract drift without writing verbose assertions in every test.

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

## API Contract

Base path: `/notes/api`

**Envelope:**

```json
{
  "data": {
    /* payload */
  },
  "status": 200
}
```

**Key endpoints:**

- `POST /notes/api/users/register` — `{ name, email, password }`
- `POST /notes/api/users/login` — `{ email, password }` → `{ token }` (prefers `data.token`, falls back to top‑level `token`)

Notes:

- Non‑2xx responses throw `ApiError(status, body)` to keep error handling consistent.
- Tests use fixtures to avoid ad‑hoc client construction and wiring.

### Notes on side effects

- The POC interacts with a live SUT and may create real users; use test-specific accounts and clean up where appropriate.
