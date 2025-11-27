# API Client Architecture

This project demonstrates disciplined API testing with Playwright: contract validation using Zod, typed API clients, and test helpers that reduce duplication.

## Structure

- `lib/apis/baseApi.ts` — Wraps Playwright `APIRequestContext` with helpers for get/post/patch/delete, envelope unwrapping, and Zod validation
- `lib/apis/usersApi.ts` — Resource client for Users (register, login, profile, logout)
- `lib/schemas/` — Zod schemas for request/response validation
- `lib/fixtures/testBase.ts` — Playwright fixtures that provide API clients
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

Helpers reduce test file length by ~40% while keeping tests readable.

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
- `POST /notes/api/users/login` — `{ email, password }` → `{ token }`

### Notes on side effects

- The POC interacts with a live SUT and may create real users; use test-specific accounts and clean up where appropriate.
